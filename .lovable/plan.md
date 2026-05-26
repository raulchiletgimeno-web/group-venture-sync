## Auditoría final — 5 warnings SECURITY DEFINER restantes

Revisión función por función. Las 5 son ejecutables por `authenticated`, todas con `SECURITY DEFINER`, `STABLE`, `search_path` fijo a `public`, y todas con scope interno a `auth.uid()` o a una sola fila por código.

---

### 1. `is_trip_member(p_trip_id uuid) → boolean`
- **Por qué authenticated:** la usan **todas las policies RLS** del proyecto (chat, fotos, gastos, transporte, alojamiento, schedule, tickets, etc.) vía `USING (is_trip_member(trip_id))`. PostgREST evalúa las policies en el rol del usuario — si `authenticated` no puede ejecutarla, **toda la app deja de leer datos**.
- **Riesgo de quitar el permiso:** ruptura total de lectura. Crítico.
- **Más restrictivo posible:** no. Solo devuelve `true/false` sobre `auth.uid()` (no acepta otro user_id). No filtra datos sensibles.
- **Veredicto:** **aceptable e intencional**. El warning es un falso positivo del linter.

---

### 2. `is_trip_creator(p_trip_id uuid) → boolean`
- **Por qué authenticated:** policies RLS de admin (borrar mensajes ajenos, gestionar tickets, alojamiento, transporte, schedule). También se usa en `Author or creator can delete photos` de storage.
- **Riesgo de quitar el permiso:** los admins no podrían operar.
- **Más restrictivo posible:** no. Internamente compara contra `auth.uid()`. Devuelve solo boolean.
- **Veredicto:** **aceptable e intencional**.

---

### 3. `get_unseen_counts(p_user_id uuid)`
- **Por qué authenticated:** la llama `src/hooks/use-unseen-counts.ts` desde el cliente para pintar los badges del Dashboard.
- **Riesgo real del parámetro `p_user_id`:** un usuario malicioso podría invocarla con el `user_id` de otro y obtener cuántos elementos sin ver tiene en cada viaje. **Esto es un leak menor pero real** (no contenido, solo conteos).
- **Más restrictivo posible:** sí — ignorar el parámetro y usar `auth.uid()` dentro de la función. Es un cambio de **una línea** y no rompe el cliente (el hook ya pasa el propio user.id).
- **Veredicto:** mejorable con cambio mínimo y seguro.

---

### 4. `get_unseen_section_counts(p_user_id uuid, p_trip_id uuid)`
- Mismo caso que la anterior. La llama `src/hooks/use-unseen-section-counts.ts`.
- **Riesgo:** un usuario podría pedir conteos por sección de otro user, siempre que adivine `trip_id`. Leak menor.
- **Más restrictivo:** sí — sustituir `p_user_id` por `auth.uid()` internamente. Compatible.
- **Veredicto:** mejorable con cambio mínimo y seguro.

---

### 5. `find_trip_id_by_invite_code(_code text) → uuid`
- **Por qué authenticated:** la usan `JoinTripDialog.tsx` y `JoinTrip.tsx` para resolver el `trip_id` desde el código de invitación sin exponer la tabla `trips`.
- **Riesgo real:** un atacante autenticado solo puede comprobar si un código existe (devuelve UUID o null). El código es secreto y el conocimiento del UUID no da acceso (RLS protege todo).
- **Más restrictivo posible:** marginal (añadir rate limiting fuera del scope). La función ya es mínima: una sola columna, una sola fila por código.
- **Veredicto:** **aceptable e intencional**. Necesario para el flujo de unión a viajes.

---

## Resumen y plan

| Función | Veredicto |
|---|---|
| `is_trip_member` | Aceptable, intencional |
| `is_trip_creator` | Aceptable, intencional |
| `get_unseen_counts` | **Endurecer (sustituir `p_user_id` por `auth.uid()`)** |
| `get_unseen_section_counts` | **Endurecer (idem)** |
| `find_trip_id_by_invite_code` | Aceptable, intencional |

### Cambio propuesto (única acción)

Migración SQL mínima que **reemplaza el cuerpo** de `get_unseen_counts` y `get_unseen_section_counts` para ignorar el parámetro `p_user_id` y usar `auth.uid()` internamente. Se mantiene la firma (`p_user_id uuid` o `p_user_id uuid, p_trip_id uuid`) para no romper la generación de tipos ni los hooks existentes — el parámetro simplemente se ignora.

```sql
CREATE OR REPLACE FUNCTION public.get_unseen_counts(p_user_id uuid)
RETURNS TABLE(trip_id uuid, unseen_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  WITH me AS (SELECT auth.uid() AS uid), ...
$$;

CREATE OR REPLACE FUNCTION public.get_unseen_section_counts(p_user_id uuid, p_trip_id uuid)
RETURNS TABLE(section text, unseen_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  -- reemplazar p_user_id por auth.uid() en todo el cuerpo
$$;
```

Cuerpo idéntico al actual salvo que cada `p_user_id` se sustituye por `auth.uid()`. Cero cambios en frontend, hooks, RLS, edge functions, tipos, ni en el resto de funciones.

### Actualización de security memory

Después de aplicar la migración, actualizo `security--update_memory` para documentar que los 3 warnings restantes (`is_trip_member`, `is_trip_creator`, `find_trip_id_by_invite_code`) son intencionales y no deben volver a flagearse.

### Validación tras aprobar

1. `supabase--linter` → confirmar que solo quedan 3 warnings de SECURITY DEFINER (los aceptables).
2. `supabase--read_query` sobre `pg_proc` para confirmar que las 2 nuevas versiones ya no dependen del parámetro.
3. Smoke-test mental de los hooks `use-unseen-counts` y `use-unseen-section-counts`: siguen funcionando porque internamente la función usará el usuario autenticado real (que es lo mismo que el hook ya pasa).

### Lo que NO se toca

Diseño, navegación, emails, chat, fotos, gastos, transporte, alojamiento, schedule, auth, i18n, RLS, edge functions, frontend, hooks. Solo el cuerpo SQL de 2 funciones.

¿Apruebas aplicar la migración de endurecimiento sobre `get_unseen_counts` y `get_unseen_section_counts`?
