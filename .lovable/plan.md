

## Funcionalidad de camara en la seccion de Fotos

Se implementara un boton de camara en la seccion de Fotos que permita a los usuarios tomar fotos directamente desde su telefono y guardarlas en el viaje.

### Lo que se hara

1. **Crear un bucket de almacenamiento** en la base de datos para guardar las fotos de los viajes (`trip-photos`), con politicas de seguridad para que solo los miembros del viaje puedan ver las fotos y cualquier miembro pueda subir.

2. **Crear una tabla `trip_photos`** para registrar las fotos subidas (referencia al archivo, quien la subio, fecha, trip_id). Con RLS para que los miembros puedan ver y subir, y solo el autor o creador pueda eliminar.

3. **Implementar la interfaz en `Photos.tsx`**:
   - Un boton con icono de camara en la cabecera que al pulsarlo abre la camara del telefono usando un `<input type="file" accept="image/*" capture="environment">` (esto activa directamente la camara en moviles).
   - Al tomar la foto, se sube automaticamente al almacenamiento y se registra en la tabla.
   - Se muestra una galeria con las fotos del viaje en formato cuadricula.
   - Todos los miembros pueden ver y subir fotos.

### Detalle tecnico

**Migracion SQL:**
- Crear bucket `trip-photos` (publico para lectura).
- Crear tabla `trip_photos` con columnas: `id`, `trip_id`, `user_id`, `file_path`, `created_at`.
- RLS: miembros pueden SELECT e INSERT; autor de la foto o creador del viaje pueden DELETE.
- Politicas de storage: miembros del viaje pueden subir archivos; lectura publica.

**Archivo `src/pages/trips/Photos.tsx`:**
- Anadir un `<input type="file" accept="image/*" capture="environment">` oculto, activado por un boton con icono de camara.
- Al capturar una foto, subirla a storage en la ruta `{trip_id}/{uuid}.jpg`.
- Insertar registro en `trip_photos`.
- Consultar y mostrar todas las fotos del viaje en una cuadricula responsive.
- Mostrar estado vacio cuando no hay fotos.
- Indicador de carga mientras se sube la foto.

