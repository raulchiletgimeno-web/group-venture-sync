

## Plan: Reemplazar botón "Descubre más" por miniatura de vídeo con icono play

### Cambio en `src/pages/Landing.tsx`

Reemplazar el `<Button>` de "Descubre más" (líneas 81-87) por un elemento clickable que muestre el primer frame del vídeo con un icono de play superpuesto:

- Usar un `<div>` clickable con `cursor-pointer` que contenga:
  - Un `<video>` sin controles, sin autoplay, con `preload="metadata"` y el src del vídeo + `#t=0.5` para capturar un frame como thumbnail
  - Un overlay semitransparente oscuro con el icono `Play` de lucide-react centrado encima
- Al hacer clic, se abre el mismo modal de vídeo que ya existe (`setShowVideo(true)`)
- Estilo: bordes redondeados, sombra, tamaño ~200x120px aprox, integrado en el hero junto al botón "Comenzar ahora"

