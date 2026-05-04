## Objetivo

Limpiar la barra inferior del Chat sustituyendo los iconos sueltos de cámara y galería por un único icono de adjuntar (`+`) con menú desplegable que incluya **Hacer una foto**, **Elegir de galería** y **Enviar mi ubicación actual**. El micrófono se mantiene visible y separado, fuera del menú. Nada más de la app cambia.

## Estado actual (`src/pages/trips/Chat.tsx`, líneas 439–475)

Hoy la barra muestra: `[Camera] [ImageIcon] [Input] [Send | Mic]`. Tres iconos compiten por espacio antes del campo de texto.

## Cambios

### 1. Barra de entrada (solo zona inferior del chat)

Reemplazar los dos botones `Camera` + `ImageIcon` por **un único botón** con icono `Plus` (lucide), envuelto en un `Popover` (ya disponible en `src/components/ui/popover.tsx`, encaja con la estética actual mejor que `DropdownMenu` para móvil porque permite items grandes y táctiles).

Layout final:
```
[ + ] [ Input .................. ] [ Send | Mic ]
```

El Popover abre hacia arriba (`side="top"`, `align="start"`) y muestra una tarjeta limpia con tres filas, cada una con icono + label:

- `Camera` → "Hacer una foto" → dispara `fileInputRef` (input con `capture="environment"`).
- `ImageIcon` → "Elegir de galería" → dispara `galleryInputRef`.
- `MapPin` → "Enviar mi ubicación actual" → llama a `sendLocation()`.

Cada item: botón ancho completo, icono en círculo `bg-primary/10 text-primary`, texto `text-sm font-medium`, separación `gap-3`, padding `p-3`, hover `bg-muted`. El popover cierra al elegir cualquier opción.

El micrófono (`Mic`) y el botón `Send` permanecen exactamente como están (lado derecho, condicionados por `text.trim() || imageFile`). No se mueven al popover.

Los dos `<input type="file">` ocultos y `handleImageSelect` se mantienen sin cambios — se siguen usando, solo cambia quién dispara el click.

### 2. Envío de ubicación

Nuevo handler `sendLocation()` en el componente:

```ts
const sendLocation = async () => {
  if (!user || !tripId || sending) return;
  if (!navigator.geolocation) {
    toast({ title: t.locationUnavailable, variant: "destructive" });
    return;
  }
  setSending(true);
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const { latitude, longitude } = coords;
      const content = JSON.stringify({ lat: latitude, lng: longitude });
      const { error } = await supabase.from("trip_messages").insert({
        trip_id: tripId, user_id: user.id, type: "location",
        content, reply_to_id: replyTo?.id ?? null,
      });
      if (error) toast({ title: t.errorSending, variant: "destructive" });
      else notifyTripEvent(tripId, "chat", user.id);
      setReplyTo(null); setSending(false);
    },
    () => {
      toast({ title: t.locationDenied, variant: "destructive" });
      setSending(false);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
};
```

Se reutiliza el campo `content` (TEXT) para guardar `{lat,lng}` como JSON. La columna `type` es `text` libre en la BD, así que no hace falta migración.

Actualizar el tipo TS de `Message`:
```ts
type: "text" | "audio" | "image" | "location";
```

### 3. Visualización del mensaje de ubicación

En el bloque que renderiza tipos de mensaje (línea 372–378), añadir un caso para `location` que muestre una tarjeta limpia y premium dentro de la burbuja existente (misma `bg-white rounded-2xl`, sin romper estilo):

```tsx
{msg.type === "location" && msg.content && (() => {
  const { lat, lng } = JSON.parse(msg.content);
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  return (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
       className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20 max-w-[260px]">
      <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
        <MapPin className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{t.sharedLocation}</p>
        <p className="text-xs text-muted-foreground truncate">{t.openInMaps}</p>
      </div>
    </a>
  );
})()}
```

Para el snippet en respuestas citadas, añadir en `messageSnippet`:
```ts
if (msg.type === "location") return t.locationMsg; // "📍 Ubicación"
```

### 4. Traducciones (`src/i18n/translations.ts`)

Añadir 6 claves en cada uno de los 7 idiomas (es, en, fr, pt, it, zh, de), junto a `imageMsg` / `audioMsg` y `writeMessage`:

- `attach` — "Adjuntar" / "Attach" / …
- `takePhoto` — "Hacer una foto" / "Take a photo" / …
- `chooseFromGallery` — "Elegir de galería" / "Choose from gallery" / …
- `sendCurrentLocation` — "Enviar mi ubicación actual" / "Send my current location" / …
- `sharedLocation` — "Ubicación compartida" / "Shared location" / …
- `openInMaps` — "Abrir en Google Maps" / "Open in Google Maps" / …
- `locationMsg` — "📍 Ubicación" / "📍 Location" / …
- `locationUnavailable` — "Geolocalización no disponible" / …
- `locationDenied` — "Permiso de ubicación denegado" / …

### 5. Importes en `Chat.tsx`

Añadir `Plus`, `MapPin` a la lista de iconos de `lucide-react` y `Popover, PopoverTrigger, PopoverContent` desde `@/components/ui/popover`.

## Lo que NO se toca

- Lógica de mensajes texto/audio/imagen, swipe-to-reply, eliminado, scroll, realtime, notificaciones, RLS, uploads, miembros, `notifyTripEvent`.
- Ningún otro fichero del proyecto fuera de `src/pages/trips/Chat.tsx` y `src/i18n/translations.ts`.
- No se crean migraciones (la columna `type` es `text` libre y `content` ya admite el JSON).
- No se cambian permisos de la app: el navegador pedirá permiso de geolocalización al usuario solo cuando pulse "Enviar mi ubicación actual".

## Validación tras implementar

1. Botón `+` abre popover con tres opciones; micrófono sigue visible al lado del input.
2. "Hacer una foto" abre cámara; "Elegir de galería" abre selector; ambos siguen el flujo de preview + envío existente.
3. "Enviar mi ubicación actual" pide permiso, envía mensaje tipo `location`, aparece como tarjeta con `MapPin` enlazando a Google Maps.
4. Responder/citar un mensaje de ubicación muestra "📍 Ubicación" como snippet.
5. Mic, Send, swipe, replies, audio, imágenes y texto siguen funcionando idénticos.
