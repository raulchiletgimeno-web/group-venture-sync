## Objetivo

Mejorar solo cómo se visualiza el mensaje de **ubicación compartida** dentro del chat para que quede claro quién la ha enviado y se sienta más natural y premium. Sin tocar nada más de la app.

## Cambios

### 1. `src/pages/trips/Chat.tsx` (líneas 409–432)

Reescribir el bloque de render del mensaje `type === "location"` para que la tarjeta dentro de la burbuja muestre:

- Una **frase clara y humana** en la parte superior: *"Raúl ha compartido su ubicación actual"* (con el nombre real del autor obtenido vía `getMemberName(msg.user_id)`, que ya respeta el formato YORMIT "Nombre + 2 letras").
- El **bloque visual de mapa** con icono `MapPin` en círculo teal y un CTA claro **"Ver en el mapa"** en lugar del genérico "Abrir en Google Maps".
- Toda la tarjeta sigue siendo un enlace clickable que abre `https://www.google.com/maps?q=lat,lng` en una pestaña nueva.

Estructura propuesta dentro de la burbuja existente (sin cambiar la burbuja ni el header de autor que ya existe):

```tsx
{msg.type === "location" && msg.content && (() => {
  try {
    const { lat, lng } = JSON.parse(msg.content);
    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const authorName = isOwn ? t.you : getMemberName(msg.user_id);
    return (
      <div className="space-y-2">
        <p className="text-[15px] text-foreground/80 leading-snug">
          <span className="font-semibold text-foreground">{authorName}</span>{" "}
          {t.sharedCurrentLocationBy}
        </p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20"
        >
          <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t.sharedLocation}</p>
            <p className="text-xs text-primary font-medium">{t.viewOnMap} →</p>
          </div>
        </a>
      </div>
    );
  } catch {
    return null;
  }
})()}
```

Nota sobre la frase: como la cabecera de la burbuja ya muestra el nombre del autor (líneas 399–401), la frase dentro de la tarjeta refuerza el contexto en lenguaje natural ("ha compartido su ubicación actual") sin sentirse redundante: el header es el remitente del mensaje, la frase es el verbo de la acción que da sentido a la tarjeta.

### 2. `src/i18n/translations.ts`

Reemplazar el uso textual y añadir dos claves nuevas en los 7 idiomas (es, en, fr, pt, it, zh, de), justo después de `sharedLocation`:

- `sharedCurrentLocationBy` — la frase **sin** el nombre (el nombre se renderiza en `<span>` aparte para poder destacarlo en negrita):
  - es: "ha compartido su ubicación actual"
  - en: "shared their current location"
  - fr: "a partagé sa position actuelle"
  - pt: "partilhou a sua localização atual"
  - it: "ha condiviso la sua posizione attuale"
  - zh: "分享了当前位置"
  - de: "hat den aktuellen Standort geteilt"
- `viewOnMap` — CTA dentro de la tarjeta:
  - es: "Ver en el mapa"
  - en: "View on map"
  - fr: "Voir sur la carte"
  - pt: "Ver no mapa"
  - it: "Vedi sulla mappa"
  - zh: "在地图上查看"
  - de: "Auf Karte ansehen"

`sharedLocation` y `openInMaps` se mantienen (la primera se sigue usando como subtítulo de la tarjeta; la segunda queda intacta por si se usa en otros sitios). `locationMsg` ("📍 Ubicación") sigue como snippet en respuestas citadas.

## Lo que NO se toca

- Lógica de envío de ubicación (`sendLocation`), permisos, geolocalización, JSON guardado en `content`.
- Header del autor en la burbuja, swipe-to-reply, replies, eliminado, audio, imagen, texto, scroll, realtime, notificaciones.
- Barra inferior, popover de adjuntar, micrófono, send.
- Cualquier otro fichero del proyecto.

## Validación tras implementar

1. Enviar ubicación → en el chat aparece la burbuja con: cabecera "Tú/Nombre", frase "**Nombre** ha compartido su ubicación actual", y debajo la tarjeta MapPin + "Ubicación compartida" + "Ver en el mapa →".
2. Pulsar la tarjeta abre Google Maps en pestaña nueva.
3. El destinatario ve "**Raúl Ga.** ha compartido su ubicación actual" (formato display name de YORMIT respetado).
4. Cambio de idioma actualiza la frase y el CTA correctamente en los 7 idiomas.
5. Resto del chat (texto, audio, imagen, replies, swipe, scroll) sin cambios.
