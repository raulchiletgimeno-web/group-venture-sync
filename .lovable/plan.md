

## Swipe entre fotos en vista ampliada

### Resumen

Reemplazar el visor fullscreen estático actual por uno con soporte de swipe táctil, permitiendo navegar entre todas las fotos sin cerrar la vista ampliada.

### Enfoque

Usar detección de gestos táctiles nativa (touchstart/touchmove/touchend) directamente en el componente, sin librerías externas. El estado `viewingPhoto` pasa de guardar `{url, userName}` a guardar el **índice** de la foto actual en el array `photos`.

### Cambios en `src/pages/trips/Photos.tsx`

1. **Estado**: Cambiar `viewingPhoto` de `{url, userName} | null` a `number | null` (índice en el array `photos`)

2. **Grid**: Al hacer click en una foto, guardar su índice en vez del objeto

3. **Visor fullscreen**:
   - Añadir refs para tracking táctil (`touchStartX`, `touchEndX`)
   - En `onTouchStart`: guardar posición X inicial
   - En `onTouchMove`: guardar posición X actual
   - En `onTouchEnd`: calcular delta; si > 50px → foto anterior; si < -50px → foto siguiente
   - Mostrar la foto correspondiente a `photos[viewingPhoto]`
   - Añadir flechas semitransparentes (ChevronLeft/ChevronRight) para navegación no táctil
   - Indicador de posición (ej: "3 / 12") debajo del nombre

4. **Animación**: Transición CSS suave al cambiar de foto (`transition-opacity` o `transition-transform`)

### Fichero afectado

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Photos.tsx` | Swipe táctil + navegación por índice en visor fullscreen |

No se toca ningún otro fichero ni funcionalidad.

