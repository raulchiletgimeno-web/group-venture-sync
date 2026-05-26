## Problema

La policy **"Anyone authenticated can find trip by invite code"** sobre `public.trips` tiene `USING (true)` para `SELECT` con rol `authenticated`. Esto hace que **cualquier usuario logueado pueda leer TODOS los viajes** (título, destino, fechas, invite_code, creator) aunque no sea miembro. Existe para permitir que la pantalla "Unirme a un viaje" busque el `trip_id` a partir del código de invitación antes de ser miembro — pero está implementada como acceso total, no como lookup por código exacto.

## Solución (mínima y quirúrgica)

Reemplazar el acceso amplio por una función `SECURITY DEFINER` que solo devuelva el `id` de un viaje a partir del código exacto. Es la única vía que un no-miembro necesita.

### 1. Migración SQL

```sql
-- Eliminar la policy insegura
DROP POLICY IF EXISTS "Anyone authenticated can find trip by invite code" ON public.trips;

-- Función segura: lookup por código exacto, solo devuelve id
CREATE OR REPLACE FUNCTION public.find_trip_id_by_invite_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.trips
  WHERE invite_code = upper(trim(_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_trip_id_by_invite_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_trip_id_by_invite_code(text) TO authenticated;
```

Quedan vigentes (sin tocar):
- `Members can view trips` → `is_trip_member(id)` ← única vía de lectura completa.
- `Authenticated users can create trips`, `Members can update trips`, `Only creator can delete trips`.
- `service_role` mantiene acceso pleno como siempre.

### 2. Cambios de código (solo 2 archivos, solo la llamada de búsqueda)

- `src/components/JoinTripDialog.tsx` (línea 30-34): sustituir el `select("id").eq("invite_code", …)` por `supabase.rpc("find_trip_id_by_invite_code", { _code: code })`.
- `src/pages/JoinTrip.tsx` (línea 20): mismo cambio.

Resto del archivo (alta como `trip_member` pending, navegación, toasts, notificación al creador) **no se toca**.

`CreateTripDialog` (insert con `invite_code`) y `TripDashboard` (lectura del trip ya como miembro) **no requieren cambios** — ya pasan por la policy `Members can view trips`.

## Validación

Tras aplicar:

1. Como usuario A no miembro: `select * from trips` → 0 filas (solo verá los suyos).
2. Como usuario A no miembro: `rpc('find_trip_id_by_invite_code', {_code:'CODIGO-VALIDO'})` → devuelve uuid (permite unirse).
3. Como usuario A no miembro: `rpc('find_trip_id_by_invite_code', {_code:'INEXISTENTE'})` → NULL.
4. Como miembro aprobado: ve su viaje normalmente en Dashboard y TripDashboard.
5. Flujo de "Unirme a viaje" sigue funcionando idéntico para el usuario final.

## Lo que NO se toca

Diseño, navegación, emails, chat, fotos, gastos, transport, accommodation, schedule, auth, otras tablas, otras policies, edge functions, i18n. Solo: 1 policy borrada, 1 función creada, 2 líneas de cliente cambiadas.

## Nota sobre los otros findings

El escaneo lista más incidencias (realtime, bucket público de fotos, email en profiles, etc.). **No se abordan en este plan** porque pediste cerrar solo el acceso a viajes. Las dejo identificadas para iteraciones futuras si quieres.