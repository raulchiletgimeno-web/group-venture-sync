

## Arreglar el error al crear viajes

### El problema

La tabla `trips` tiene una politica de seguridad (RLS) para INSERT que dice: "el usuario autenticado puede crear viajes si `created_by` coincide con su ID". Sin embargo, la politica esta asignada al rol `public` en lugar de `authenticated`, lo que puede causar que no se aplique correctamente cuando un usuario esta logueado.

### La solucion

Recrear la politica de INSERT en la tabla `trips` asignandola explicitamente al rol `authenticated`:

1. Eliminar la politica actual: `DROP POLICY "Authenticated users can create trips" ON trips`
2. Crear la nueva politica con el rol correcto:
   ```
   CREATE POLICY "Authenticated users can create trips"
   ON trips FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = created_by)
   ```

Tambien hay que revisar la politica de INSERT en `trip_members`, ya que despues de crear el viaje, el codigo intenta agregar al creador como miembro. Esa politica usa `is_trip_creator(trip_id)`, pero como el miembro aun no existe (se esta insertando por primera vez), esa funcion devuelve `false`. La condicion alternativa `user_id = auth.uid()` deberia funcionar, pero tambien esta asignada al rol `public`. Se recreara con rol `authenticated`.

### Cambios

**Migracion SQL:**
- Recrear politica INSERT en `trips` con rol `authenticated`
- Recrear politica INSERT en `trip_members` con rol `authenticated`

No se requieren cambios en el codigo de la aplicacion.
