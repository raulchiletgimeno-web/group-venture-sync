

## Plan: Segundo creador del viaje

### Resumen
El creador original podra designar a cualquier miembro aprobado como "co-creador" (segundo creador) desde el popover de miembros. El co-creador tendra exactamente los mismos permisos que el creador original. Tambien se podra eliminar miembros del viaje desde ese mismo popover.

### Enfoque tecnico clave

La solucion mas elegante es modificar la funcion `is_trip_creator` en la base de datos para que reconozca tanto `role = 'creator'` como `role = 'co-creator'`. De esta forma, **todas las politicas RLS existentes** (transporte, alojamiento, actividades, tickets, etc.) funcionaran automaticamente sin necesidad de modificarlas una por una.

### Cambios necesarios

**1. Migracion de base de datos**

- Actualizar la funcion `is_trip_creator` para que tambien acepte `role = 'co-creator'`:
```sql
CREATE OR REPLACE FUNCTION public.is_trip_creator(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
      AND role IN ('creator', 'co-creator')
  )
$$;
```

- Agregar politica RLS para que el creador original pueda cambiar roles de miembros (ya existe la politica "Creator can update members").

**2. Hook `use-trip-role.ts`**

- Modificar para que `isCreator` sea `true` cuando el rol sea `'creator'` o `'co-creator'`.
- Agregar un nuevo valor `isOriginalCreator` (solo `true` para `role === 'creator'`) para controlar funciones exclusivas del creador original (como designar co-creadores).

**3. Dashboard - Popover de miembros (`TripDashboard.tsx`)**

- Para el creador original (`isOriginalCreator`), junto a cada miembro (excepto el mismo) mostrar un `DropdownMenu` con:
  - **Nombrar co-creador** / **Quitar co-creador** (toggle segun el rol actual del miembro)
  - **Eliminar del viaje** (elimina al miembro de `trip_members`)
- Los co-creadores veran un icono de lapiz similar al creador.
- Implementar funciones `handlePromote`, `handleDemote` y `handleRemoveMember`.

**4. Traducciones (`translations.ts`)**

Agregar claves nuevas en los 5 idiomas:
- `makeCoCreator`: "Nombrar co-creador" / "Make co-creator" / ...
- `removeCoCreator`: "Quitar co-creador" / "Remove co-creator" / ...
- `removeMember`: "Eliminar del viaje" / "Remove from trip" / ...
- `coCreatorAdded`: "Co-creador designado"
- `coCreatorRemoved`: "Co-creador eliminado"
- `memberRemoved`: "Miembro eliminado"
- `coCreator`: "Co-creador" (para etiqueta visual)

### Flujo de usuario

```text
Popover de miembros (vista del creador original):
+--------------------------------------+
| MIEMBROS                             |
| [AV] Juan Lopez    (lapiz)           |
| [AV] Maria Garcia  (lapiz) [...]     |  <-- menu con opciones
| [AV] Pedro Ruiz           [...]      |
+--------------------------------------+
        |  click en [...]
        v
+-------------------------+
| Nombrar co-creador      |
| Eliminar del viaje      |
+-------------------------+
```

### Archivos modificados

1. **Migracion SQL** - Actualizar funcion `is_trip_creator`
2. **`src/hooks/use-trip-role.ts`** - Devolver `isCreator` y `isOriginalCreator`
3. **`src/pages/TripDashboard.tsx`** - Dropdown en popover de miembros con acciones de gestion
4. **`src/i18n/translations.ts`** - Nuevas claves de traduccion
5. **`src/components/MemberApprovalManager.tsx`** - Usar `isOriginalCreator` si es necesario (el creador original es quien aprueba)

### Notas de seguridad

- Solo el creador original puede designar/quitar co-creadores (controlado en frontend con `isOriginalCreator` y en backend porque solo `role = 'creator'` puede hacer UPDATE en `trip_members` via la politica RLS existente).
- La funcion `is_trip_creator` con SECURITY DEFINER garantiza que las politicas RLS reconozcan ambos roles sin recursion.
- El creador original no puede eliminarse a si mismo ni quitarse su propio rol.

