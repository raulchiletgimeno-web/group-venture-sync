
## Editar y Eliminar Viaje (solo creador)

### Resumen
Agregar la posibilidad de que el creador del viaje pueda editar los datos (titulo, destino, fechas) y eliminar el viaje completo, directamente desde el dashboard del viaje.

### Cambios

**1. Traducciones (`src/i18n/translations.ts`)**
- Agregar claves: `editTrip`, `deleteTrip`, `deleteTripConfirm`, `deleteTripDesc`, `tripUpdated`, `tripDeleted`, `cancel`, `save` (si no existen ya) en los 5 idiomas.

**2. Dashboard del viaje (`src/pages/TripDashboard.tsx`)**
- Agregar un estado `editing` (boolean) para alternar entre modo lectura y modo edicion.
- Cuando `isCreator` es true, mostrar un boton de editar (icono lapiz) junto a la tarjeta del viaje que active el modo edicion.
- En modo edicion:
  - El titulo se convierte en un input de texto editable.
  - El destino se convierte en un input de texto editable.
  - Las fechas de inicio y fin se convierten en inputs tipo `date`.
  - Mostrar botones "Guardar" y "Cancelar".
- Al guardar, hacer un `UPDATE` a la tabla `trips` con los nuevos valores y actualizar el estado local.
- Agregar un boton "Eliminar viaje" (rojo, con icono Trash) visible solo para el creador.
- Al pulsar eliminar, mostrar un AlertDialog de confirmacion. Si confirma, ejecutar `DELETE` en la tabla `trips` y redirigir a `/`.

### Detalles tecnicos

- La politica RLS `Members can update trips` ya permite a miembros hacer UPDATE (verificar que el creador, siendo miembro aprobado, puede actualizar).
- La politica RLS `Only creator can delete trips` ya permite solo al creador hacer DELETE.
- No se necesitan migraciones de base de datos, las politicas existentes cubren ambas operaciones.
- Se usara `useNavigate` para redirigir tras eliminar.
- Se usara el componente `AlertDialog` existente para la confirmacion de eliminacion.
- Se usara el componente `Input` existente para los campos editables.
- Toast de confirmacion tras guardar o eliminar.
