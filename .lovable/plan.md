

## Ajuste de fotos en orientación horizontal

### Problema

1. **Grid de miniaturas** (línea 119): usa `grid-cols-2 sm:grid-cols-3` con `aspect-square`. En horizontal solo muestra 2-3 columnas cuadradas, desaprovechando el espacio.
2. **Visor fullscreen** (línea 150-155): usa `max-h-[85vh]` que funciona bien, pero no aprovecha al máximo el ancho en landscape.

### Cambios (solo `src/pages/trips/Photos.tsx`)

#### 1. Grid responsive para landscape

Cambiar la clase del grid para detectar orientación horizontal y mostrar más columnas:

```
grid grid-cols-2 sm:grid-cols-3 landscape:grid-cols-4 gap-3
```

Esto añade 4 columnas cuando el móvil está en horizontal, aprovechando el ancho extra.

#### 2. Miniaturas con aspect-ratio adaptativo

Cambiar `aspect-square` a una clase que se adapte en landscape:

```
aspect-square landscape:aspect-video
```

En horizontal, las miniaturas pasan a formato 16:9 (más natural para pantallas anchas). En vertical se mantienen cuadradas.

#### 3. Visor fullscreen mejorado en landscape

Ajustar la imagen del visor para aprovechar mejor el espacio horizontal:

```
max-w-full max-h-[85vh] landscape:max-h-[90vh] landscape:max-w-[95vw] object-contain rounded-lg
```

Y ocultar el nombre del usuario debajo de la foto en landscape para dar más espacio vertical:

```
<p className="text-white/70 text-sm mt-3 landscape:mt-1 landscape:text-xs">
```

### Fichero afectado

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Photos.tsx` | Clases CSS responsive para landscape en grid, miniaturas y visor |

No se toca ningún otro fichero ni funcionalidad de la app. Solo se añaden clases Tailwind con el modificador `landscape:` que ya viene incluido en Tailwind CSS v3.

