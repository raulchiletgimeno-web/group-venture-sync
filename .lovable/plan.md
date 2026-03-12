

## Plan: Arreglar promoción a co-creador y añadir confirmación

### Problemas detectados

1. **Sin diálogo de confirmación**: Al pulsar "Nombrar co-creador" se ejecuta directamente sin preguntar. El usuario quiere un AlertDialog de confirmación (igual que ya existe para "Eliminar miembro").
2. **Errores silenciados**: `handlePromote` y `handleDemote` no muestran error si la operación falla en la base de datos.
3. **Posible problema con DropdownMenu + Popover**: El click en el DropdownMenuItem cierra el dropdown y potencialmente el Popover, lo que puede interferir con la ejecución asíncrona.

### Cambios en `src/pages/TripDashboard.tsx`

1. **Añadir AlertDialog de confirmación** para promover y degradar co-creador, igual que ya se hace para eliminar miembro:
   - Envolver las opciones de promover/degradar en un `AlertDialog` con `AlertDialogTrigger` usando `onSelect={(e) => e.preventDefault()}` para evitar que el dropdown se cierre.
   - Mostrar un mensaje de confirmación tipo "¿Estás seguro de que quieres nombrar a este usuario como co-creador?"
   
2. **Añadir manejo de errores visible** en `handlePromote` y `handleDemote` — mostrar toast de error si falla.

3. **Añadir traducciones** necesarias para los nuevos textos de confirmación en todos los idiomas (es, en, fr, pt, it, zh, de):
   - `confirmMakeCoCreator` / `confirmMakeCoCreatorDesc`
   - `confirmRemoveCoCreator` / `confirmRemoveCoCreatorDesc`

### Cambios en `src/i18n/translations.ts`

- Añadir 4 nuevas claves de traducción en los 7 idiomas.

