## Objetivo
Añadir la posibilidad de adjuntar **un archivo `.gpx`** a cada actividad del itinerario, sin tocar nada más de la app.

## 1. Base de datos (migración)
Añadir dos columnas a `public.trip_schedule`:
- `gpx_path text` — ruta en Storage
- `gpx_name text` — nombre original del archivo

No se crea tabla nueva ni se cambian policies existentes de `trip_schedule` (los miembros aprobados ya pueden leerla; solo el creador puede escribir — perfecto para este caso).

## 2. Almacenamiento
Reutilizar el bucket privado existente `trip-photos` (mismo patrón que tickets).
- Ruta: `{tripId}/activity-gpx/{scheduleId}.gpx`
- Acceso mediante `getSignedUrl` (helper ya existente). La policy de `storage.objects` que exige ser miembro del viaje ya cubre este prefijo (misma carpeta `{tripId}/...`).

## 3. UI — formulario de actividad (`src/pages/trips/Schedule.tsx`)
Solo para el creador (que ya es quien puede crear/editar actividades):
- Añadir en el diálogo de crear/editar un bloque **"Track GPX"** con:
  - Botón "Adjuntar archivo GPX" (`accept=".gpx,application/gpx+xml"`)
  - Si ya hay uno: mostrar el nombre y botón para reemplazarlo o eliminarlo
- Flujo al guardar: si hay archivo nuevo → subir a Storage → guardar `gpx_path` + `gpx_name` en el `INSERT`/`UPDATE` de la actividad. Si se marcó eliminar → `remove` del Storage + set a null.

## 4. Visualización dentro de la actividad
En la tarjeta de actividad (día detalle), junto a los iconos de web/tickets/mapa, añadir un botón "Abrir GPX" (icono `Route` o `Map`) visible **para cualquier miembro** si `gpx_path` existe.
- Al pulsarlo: firmar URL y abrir en nueva pestaña (`window.open`). El navegador móvil ofrece las opciones nativas (descargar/compartir/abrir con app de mapas).
- Tooltip con el nombre del archivo.

## 5. i18n
Añadir claves a `src/i18n/translations.ts` en los 5 idiomas: `gpxAttach`, `gpxReplace`, `gpxRemove`, `gpxOpen`, `gpxAttached`.

## 6. Seguridad
- Bucket privado (ya).
- RLS de `storage.objects` restringe lectura a miembros del viaje (ya).
- RLS de `trip_schedule` restringe lectura a miembros y escritura al creador (ya).
- Solo se usan URLs firmadas temporales.

## Alcance — lo que NO se toca
Ni chat, ni fotos, ni gastos, ni tickets, ni transporte, ni alojamiento, ni auth, ni edge functions, ni emails, ni cualquier otra vista. Solo el archivo `Schedule.tsx`, `translations.ts` y una migración pequeña.

## Detalles técnicos
- Migración: `ALTER TABLE public.trip_schedule ADD COLUMN gpx_path text, ADD COLUMN gpx_name text;` (sin cambios de policies/GRANTs).
- Tipos Supabase se regeneran tras la migración.
- Sin límite explícito de tamaño (bucket ya limitado por Supabase). Validación cliente: extensión `.gpx`.
