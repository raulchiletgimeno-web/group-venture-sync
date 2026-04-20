

## Recolocar reseñas en la primera vista de la landing

### Cambio principal
Las reseñas ya no estarán escondidas abajo. Pasarán a aparecer **dentro del hero**, justo debajo de los CTAs ("Empezar" / "Ver vídeo"), como una franja compacta y elegante visible en la primera impresión de la landing pública.

### Ubicación nueva
- **Dentro del bloque hero** (`<section>` con fondo de vídeo), debajo de los dos botones CTA (línea ~202).
- Se elimina por completo la sección de testimonios actual (líneas 304-339), que quedaba demasiado abajo entre "How it works" y "Benefits".

### Diseño nuevo (franja compacta premium)
Una **franja horizontal ligera** integrada sobre el fondo oscuro del hero:

- **Carrusel sutil en móvil** (`overflow-x-auto` con scroll-snap, sin flechas visibles) y **fila de 3 visibles en escritorio**.
- Cada mini-card:
  - Fondo `bg-white/10` con `backdrop-blur-md` y `border border-white/15` → se integra con el hero sin tapar el vídeo
  - `rounded-2xl`, padding moderado, ancho controlado (~280-320px)
  - **Estrellas amarillas elegantes**: `text-yellow-400 fill-yellow-400`, tamaño `h-3.5 w-3.5`, gap pequeño
  - **Una de las 6 reseñas mostrará 4,5 estrellas** (4 estrellas llenas + 1 media usando `<StarHalf />` de lucide-react, también amarilla) — esto comunica visualmente que son ratings reales 1-5
  - Frase corta entre comillas tipográficas, `text-sm` blanco con buena legibilidad
  - Nombre debajo en `text-xs` blanco con opacidad reducida

- **Margen superior generoso** (`mt-12`) para que respire respecto a los CTAs y no agobie el hero.
- **Sin título de sección** dentro del hero (lo haría pesado). La franja se entiende sola como prueba social.

### Reseña con 4,5 estrellas
La asignaré a **"Primitivo Murcia"** (`"Muy útil y cómoda para viajar."`) — es la frase más corta y queda natural mostrar una variación honesta. Las otras 5 mantienen 5 estrellas.

### Responsive
- **Móvil (<640px)**: scroll horizontal con snap, 1 card visible + peek de la siguiente para invitar a deslizar.
- **Tablet (≥640px)**: 2 cards visibles con scroll.
- **Escritorio (≥1024px)**: 3 cards en fila, sin scroll.

### Lo que NO se toca
- Hero, logo, headline, subtítulo, CTAs, vídeo de fondo, vídeo modal: intactos.
- Secciones Problem, Features, How it works, Benefits, FAQ, footer: intactas.
- Traducciones existentes (`landingTestimonialsTitle` / `landingTestimonialsSubtitle`) se quedan en `translations.ts` sin uso (no estorban) — no eliminamos para evitar tocar 7 idiomas innecesariamente.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/Landing.tsx` | Insertar franja de reseñas en hero (debajo CTAs) + eliminar sección testimonios actual + importar `StarHalf` |

Un solo fichero modificado. Cero impacto en el resto de la app.

