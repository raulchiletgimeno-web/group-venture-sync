

## Adjuntar documento de reserva en alojamientos

### Resumen
Permitir al creador del viaje adjuntar un documento de reserva (PDF o imagen) a cada alojamiento. Los miembros podran ver el documento pero no editarlo ni eliminarlo.

### Enfoque
La funcionalidad es mas simple que la de billetes de transporte (que son nominales por miembro). Aqui es un unico documento por alojamiento, similar a un "recibo". Se usara una columna `booking_file_path` directamente en la tabla `trip_accommodation`, sin necesidad de crear una tabla nueva.

### Pasos

**1. Migracion de base de datos**
- Agregar columna `booking_file_path` (text, nullable) a la tabla `trip_accommodation`.
- No se necesitan nuevas tablas ni politicas RLS adicionales, ya que las politicas existentes cubren que solo el creador puede insertar/actualizar/eliminar alojamientos, y los miembros pueden ver.

**2. Traducciones**
- Agregar claves para los 5 idiomas:
  - `uploadBookingDoc`: "Subir reserva" / "Upload booking" / ...
  - `bookingDocUploaded`: "Documento de reserva subido" / ...
  - `bookingDocDeleted`: "Documento de reserva eliminado" / ...
  - `viewBookingDoc`: "Ver reserva" / ...
  - `bookingDocument`: "Documento de reserva" / ...

**3. Modificar Accommodation.tsx**
- Importar iconos `Upload`, `Eye`, `FileText`.
- Para cada tarjeta de alojamiento:
  - **Creador**: Mostrar boton para subir documento (si no existe) o botones para ver/eliminar (si existe). La subida usa el bucket `trip-photos` con ruta `{tripId}/accommodation/{accommodationId}.{ext}`.
  - **Miembro**: Mostrar boton para ver el documento (si existe). Sin opciones de editar/eliminar.
- Agregar un Dialog para previsualizar el documento (imagen o PDF en iframe), reutilizando el patron del TicketManager.
- Funciones: `handleFileUpload` (sube archivo y actualiza `booking_file_path`), `handleDeleteFile` (elimina archivo de storage y pone `booking_file_path` a null), `openDocView` (obtiene URL publica y abre dialog).

### Detalles tecnicos

```text
trip_accommodation
+---------------------+
| ... columnas existentes ...
| booking_file_path   | text, nullable, nuevo
+---------------------+
```

- Ruta de almacenamiento: `{tripId}/accommodation/{accommodationId}.{extension}`
- Bucket: `trip-photos` (existente, publico)
- RLS: Las politicas existentes ya protegen correctamente (creator = CRUD, member = SELECT)
- El `booking_file_path` se actualiza via UPDATE en `trip_accommodation`, cubierto por la politica "Creator can update accommodation"

