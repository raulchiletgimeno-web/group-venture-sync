

## Plan

### Cambios en `src/pages/Landing.tsx`

1. **Miniatura más grande y más a la derecha**: Cambiar el contenedor de `w-56 h-32 ml-4` a `w-64 h-36 ml-8`, y el icono Play de `w-14 h-14` a `w-16 h-16`.

2. **Cerrar modal al terminar el vídeo**: Añadir un handler `onEnded` al `<video>` del modal que cierre el diálogo (`setShowVideo(false)`) y pause el vídeo.

