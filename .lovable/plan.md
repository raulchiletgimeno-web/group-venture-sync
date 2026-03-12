

## Plan: Reproducción instantánea del vídeo al hacer clic en "Ver cómo funciona"

### Cambio
Modificar el botón "Ver cómo funciona" del hero para que en lugar de hacer scroll a la sección de vídeo, abra directamente el modal de vídeo con reproducción instantánea (con audio).

### Archivo: `src/pages/Landing.tsx`

1. Cambiar el `onClick` del botón secundario (línea 126) de `scrollToVideo` a `() => setShowVideo(true)`
2. Añadir un `useEffect` que cuando `showVideo` cambie a `true`, haga `play()` en el `videoRef` para asegurar reproducción instantánea con audio
3. El vídeo ya tiene `autoPlay` en el modal, pero los navegadores pueden bloquearlo con audio. Se añadirá lógica para forzar el play programáticamente.

