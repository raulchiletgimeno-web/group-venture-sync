

## Plan: Optimización de carga del vídeo de fondo del hero

### Problema actual

El vídeo `hero-background.mp4` usa `preload="auto"`, lo que fuerza la descarga completa antes de mostrar nada. No hay poster, no hay diferenciación móvil/escritorio, y no hay transición suave.

### Cambios

#### 1. Imagen poster de alta calidad

- Extraer un frame representativo del vídeo y guardarlo como `public/videos/hero-poster.webp` (formato WebP, ~50-80KB)
- Añadir atributo `poster` al elemento `<video>` para que se muestre inmediatamente
- Añadir también una imagen de fallback como `background-image` en el contenedor por si el poster tarda

#### 2. Estrategia de carga del vídeo

- Cambiar `preload="auto"` a `preload="none"` 
- Cargar el vídeo programáticamente con JavaScript: después de que el componente monte, asignar `src` y llamar a `play()` con un pequeño delay
- Esto desbloquea el render inicial del hero (texto, CTAs) que es lo prioritario

#### 3. Transición suave poster → vídeo

- El vídeo empieza con `opacity-0` y transiciona a `opacity-100` cuando dispara el evento `onCanPlay` o `onPlaying`
- Resultado: el usuario ve la imagen poster estática de inmediato, y el vídeo aparece con un fade elegante

#### 4. Estrategia móvil

- Usar el hook `useIsMobile()` existente
- En móvil: **no cargar el vídeo en absoluto**. Mostrar solo la imagen poster WebP de alta calidad como fondo fijo
- Esto mejora drásticamente el rendimiento en móvil sin sacrificar la estética (una imagen premium bien elegida se ve igual de bien en pantalla pequeña)
- En escritorio: cargar el vídeo con la estrategia lazy descrita arriba

#### 5. Crear el poster

- Usaré la imagen existente `src/assets/hero-travel.jpg` como base para el poster, o crearé un placeholder de alta calidad
- Lo convertiré/optimizaré para web

### Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/pages/Landing.tsx` | Lógica de carga lazy del vídeo, poster, diferenciación móvil/escritorio, transición fade |
| `public/videos/hero-poster.webp` | Nueva imagen poster (se usará `hero-travel.jpg` existente renombrada/optimizada) |

### Resultado esperado

- **Móvil**: imagen premium visible en <200ms, sin descarga de vídeo
- **Escritorio**: imagen poster visible inmediatamente, vídeo aparece con fade suave en 1-3s según conexión
- **Sin bloqueo**: el texto del hero y los CTAs se renderizan antes que el vídeo
- **Visual premium mantenido**: transición elegante, sin parpadeos ni vacío

