## Diagnóstico

El error `new row violates row-level security policy for table trips` no se debe a la policy de INSERT (que es correcta: `WITH CHECK (auth.uid() = created_by)`), sino a la policy de **SELECT** sobre `trips`.

### Causa raíz

`CreateTripDialog.tsx` ejecuta:

```ts
supabase.from("trips").insert({...}).select().single()
```

El `.select()` añade `Prefer: return=representation` y PostgREST devuelve la fila insertada aplicando la policy de **SELECT**. La policy actual es:

```
SELECT  USING is_trip_member(id)
```

En el momento del INSERT, el usuario **todavía no es miembro** (la fila en `trip_members` se crea justo después). Por tanto la fila recién creada no pasa el USING de SELECT y PostgREST devuelve exactamente el mismo mensaje confuso: `new row violates row-level security policy for table trips`.

Esto explica por qué falla en todos los dispositivos: es estructural, no depende del cliente.

### Comprobaciones realizadas
- Policy INSERT correcta y segura: `auth.uid() = created_by`.
- Columna `created_by` NOT NULL, frontend la envía con `user.id`.
- GRANTs sobre `public.trips` correctos para `authenticated`.
- No hay triggers en `trips` que rompan el flujo.
- La policy INSERT de `trip_members` ya permite al propio usuario auto-añadirse (`user_id = auth.uid()`), por lo que el segundo paso del flujo seguirá funcionando.

## Solución (mínima, segura, sin tocar nada más)

Añadir una segunda policy de SELECT en `trips` que permita al creador ver su propio viaje. No se modifica ni se relaja ninguna otra policy.

### Migración

```sql
CREATE POLICY "Creator can view own trip"
ON public.trips
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);
```

Con esto:
- El creador ve su viaje recién insertado → `.select().single()` devuelve la fila → no más error de RLS al crear.
- El resto de miembros lo siguen viendo vía `is_trip_member(id)` (policy existente sin cambios).
- Ningún usuario puede ver viajes ajenos: solo se amplía visibilidad al propio creador.
- La policy de INSERT sigue siendo `auth.uid() = created_by` (no se abre `WITH CHECK (true)` ni nada similar).

### Validación post-migración

1. Verificar que la nueva policy existe sobre `trips` (cmd=SELECT, roles=authenticated).
2. Confirmar que el flujo de `CreateTripDialog` deja de devolver el error de RLS.
3. Confirmar que un usuario autenticado solo puede crear viajes con `created_by = auth.uid()` (intento con otro uuid debe seguir fallando).
4. Confirmar que ningún archivo de frontend, edge function, otra tabla u otra policy ha sido modificado.

## Alcance

- **Cambia:** una sola migración SQL que añade una policy SELECT en `trips`.
- **No cambia:** UI, componentes, edge functions, otras tablas, otras policies, triggers, secrets, ni el sistema de alertas internas.
