

## Bloque de reseñas en la landing pública

### Ubicación
Nueva sección entre **"How it works"** (acaba en línea 302) y **"Benefits"** (empieza en línea 304). Es el punto natural tras explicar cómo funciona y antes de listar beneficios — refuerza confianza justo donde el usuario empieza a evaluar.

### Diseño
- **Formato**: rejilla limpia (3 columnas en escritorio, 2 en tablet, 1 en móvil con scroll natural)
- **Fondo**: blanco / `bg-background` para contrastar con el `bg-muted/30` de la sección siguiente
- **Cada card**:
  - 5 estrellas amarillas (`text-yellow-400`, `fill-yellow-400`, tamaño `h-4 w-4`, gap pequeño) — elegantes, no exageradas
  - Frase entre comillas tipográficas “ ” en `text-base`/`text-lg`, peso medio, color `text-foreground`
  - Nombre del autor debajo, en `text-sm font-semibold text-muted-foreground` con un pequeño separador visual (línea fina o punto)
  - Card con `bg-card`, `border-border/50`, `shadow-card`, `rounded-2xl`, padding generoso, hover sutil con `shadow-card-hover`
- **Header de sección**: título `t.landingTestimonialsTitle` ("Lo que dicen nuestros usuarios") y subtítulo opcional, mismo estilo que el resto de secciones para integración perfecta

### Contenido (6 reseñas)
Texto fijo (nombres reales no se traducen). Las 5 frases en español + 1 en inglés tal cual las has dado. Render directo desde un array local en `Landing.tsx` — no requiere base de datos.

### Responsive
- **Escritorio (≥1024px)**: rejilla 3×2
- **Tablet (≥640px)**: rejilla 2×3
- **Móvil**: 1 columna apilada con espaciado cómodo

### Traducciones
Solo 2 claves nuevas en `src/i18n/translations.ts` para el título y subtítulo de la sección (7 idiomas):
- `landingTestimonialsTitle`
- `landingTestimonialsSubtitle`

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/Landing.tsx` | Insertar nueva `<section>` de testimonios entre "How it works" y "Benefits" |
| `src/i18n/translations.ts` | Añadir 2 claves de copy de la sección en los 7 idiomas |

No se toca el hero, ni los CTAs, ni ninguna otra sección, ni ningún otro fichero de la app.

