## Objetivo

Corregir el flujo de apertura del GPX ya adjunto a una actividad, específicamente en iPhone (Safari y PWA), sin cambiar creación/edición, almacenamiento, bucket, policies, ni ninguna otra sección de YORMIT.

## Causa del bloqueo actual

En `src/pages/trips/Schedule.tsx` (línea 326-333) el botón GPX hace `getSignedUrl(...)` y luego `window.open(url, '_blank')`. En iOS:
- el `await` rompe la "user activation" antes del `window.open`, por lo que Safari bloquea la pestaña o abre una vacía;
- aunque abra, Safari no descarga `.gpx` a Archivos de forma fiable — muestra XML plano o queda colgado;
- en la PWA instalada, `window.open` con URL cross-origin firmada se comporta peor todavía.

## Archivos a modificar

Únicamente dos, sin cambios de backend ni de policies:

1. `src/pages/trips/Schedule.tsx` — sustituir el `onClick` del botón `Route` por la apertura de un nuevo diálogo de acciones (pasando `gpx_path` y `gpx_name`).
2. `src/i18n/translations.ts` — añadir 6 claves nuevas para el diálogo y los mensajes de error/instrucciones (ES/EN/FR/PT/IT/ZH/DE).

Y un archivo nuevo:

3. `src/components/GpxShareDialog.tsx` — componente autocontenido con la lógica de share/descarga.

No se toca: `signedUrl.ts`, storage, bucket, RLS, ActivityTicketManager, chat, fotos, gastos, alojamiento, transporte, emails, notificaciones.

## Comportamiento del nuevo diálogo

Al pulsar el icono `Route` se abre un `Dialog` con el nombre del archivo y dos acciones:

- **Abrir con otra aplicación** (principal)
- **Guardar archivo GPX** (secundaria)

Debajo, una nota discreta con la instrucción para iOS ("Pulsa Compartir y selecciona Guardar en Archivos o una app compatible") solo si detectamos iOS.

### Preparación del archivo (una sola vez por apertura del diálogo)

Al abrir el diálogo se precarga el `File` para preservar la activación de usuario en el clic posterior:

1. `getSignedUrl(gpx_path)` (mismo helper actual, TTL corto ya existente).
2. `fetch(url)` → si `!ok`, mostrar "No se ha podido preparar el archivo GPX".
3. `await res.blob()` → `new File([blob], gpx_name || 'track.gpx', { type: 'application/gpx+xml' })`.
4. Guardar `file` y `objectUrl = URL.createObjectURL(blob)` en estado. Revocar `objectUrl` al cerrar el diálogo.

Mientras se prepara, los botones están deshabilitados con spinner. Así, cuando el usuario pulse, el handler es síncrono respecto a la user activation.

### Acción "Abrir con otra aplicación"

```
if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
  try { await navigator.share({ files: [file], title: file.name }); return; }
  catch (e) { /* AbortError => silencio; otro => cae al fallback */ }
}
// Fallback: intentar descarga (ver siguiente sección).
```

El `await navigator.share(...)` se llama directamente dentro del onClick, sin `await` previo, porque el `file` ya está preparado.

### Acción "Guardar archivo GPX" (fallback también)

Descarga vía Object URL sin depender de la URL firmada:

```
const a = document.createElement('a');
a.href = objectUrl;
a.download = file.name.endsWith('.gpx') ? file.name : `${file.name}.gpx`;
a.rel = 'noopener';
document.body.appendChild(a);
a.click();
a.remove();
```

En iOS Safari, si tras el clic detectamos que probablemente no ha descargado (iOS + no-standalone-PWA), mostramos un aviso persistente en el propio diálogo:

> "Pulsa Compartir y selecciona 'Guardar en Archivos' o una aplicación compatible."

No se muestra nunca un falso "archivo descargado".

### Detección iOS

```
const ua = navigator.userAgent;
const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
```

Se usa solo para mostrar la nota informativa y para preferir Web Share sobre descarga cuando ambos existan.

## Seguridad y privacidad

- Se sigue usando `getSignedUrl` sobre el bucket privado; no se cambia TTL, ni policies, ni se hace público nada.
- La URL firmada no se loguea; solo `console.warn` con mensajes genéricos ("gpx share failed", "gpx fetch failed"), sin URL ni tokens.
- El `Blob`/`File` vive solo en memoria del cliente autorizado; el `objectUrl` se revoca al cerrar el diálogo.

## Manejo de errores (toasts / textos en diálogo)

Nuevas claves i18n:

- `gpxOpenOrShare` — "Abrir o compartir GPX"
- `gpxOpenWithApp` — "Abrir con otra aplicación"
- `gpxSaveFile` — "Guardar archivo GPX"
- `gpxPrepareError` — "No se ha podido preparar el archivo GPX"
- `gpxShareUnsupported` — "Este dispositivo no permite compartir el archivo directamente"
- `gpxIosHint` — "Pulsa Compartir y selecciona 'Guardar en Archivos' o una aplicación compatible"

No se exponen mensajes técnicos de Supabase/JS.

## Android

Android mantiene exactamente el flujo, pero con mejor UX:
- Chrome Android soporta `navigator.canShare({ files })` → se abre el selector nativo con Wikiloc, Drive, Gmail, etc.
- Si no lo soporta (WebView antiguo), el fallback de descarga vía Object URL funciona igual que hoy.
- No se modifica ninguna preferencia de app predeterminada (imposible desde web, tal y como pide el usuario).

## Validación

Casos a comprobar tras el cambio:

1. iPhone Safari: abrir actividad con GPX → icono → diálogo → "Abrir con otra aplicación" abre la hoja nativa → "Guardar en Archivos" conserva `nombre.gpx`.
2. iPhone PWA instalada: mismo flujo, sin pestaña vacía ni descarga colgada.
3. Android Chrome: hoja nativa con apps compatibles; fallback descarga si procede.
4. Seguridad: usuario no miembro sigue sin poder resolver `getSignedUrl` (RLS del bucket intacta).
5. La URL firmada no aparece en logs.

## Fuera de alcance (confirmado)

Sin cambios en: creación/edición de actividades, subida y borrado del GPX, `trip_schedule`, bucket `trip-photos`, policies, chat, fotos, gastos, alojamiento, transporte, emails, notificaciones, ni ninguna otra pantalla.
