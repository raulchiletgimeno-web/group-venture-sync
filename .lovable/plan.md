

## Plan: Video modal al pinchar "Descubre más"

### Cambios

1. **Copiar el vídeo** al proyecto en `public/videos/Video_Publicidad_Yormit.mp4` (carpeta public porque es un asset estático grande, no conviene bundlearlo con Vite).

2. **Modificar `src/pages/Landing.tsx`**:
   - Añadir estado `showVideo` (boolean) con `useState`.
   - Cambiar el `onClick` del botón "Descubre más" para abrir el modal (`setShowVideo(true)`).
   - Añadir un **Dialog** (de Radix/shadcn) que contenga un `<video>` con controles, autoplay y el src apuntando a `/videos/Video_Publicidad_Yormit.mp4`.
   - El modal se cierra al hacer clic fuera o en la X, y pausa el vídeo al cerrarse.

### Resultado
Al pinchar "Descubre más", se abre un popup centrado con el vídeo reproduciéndose automáticamente, sin salir de la landing.

