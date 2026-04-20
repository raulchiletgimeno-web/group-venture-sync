

## Ajuste del bloque de reseñas en la landing

### Cambios a realizar (solo en `src/pages/Landing.tsx`)

**1. Subir el contenido del hero**
Reducir el padding vertical del hero (línea 171: `py-16 md:py-24 lg:py-32` → `py-10 md:py-14 lg:py-16`) y el margen de los CTAs (línea 185: `mt-16` → `mt-10`) para que las 3 primeras reseñas se vean completas en la primera vista, incluyendo el nombre del autor.

**2. Ampliar a 9 reseñas en 3 filas de 3**
Sustituir el array actual (6 reseñas) por uno de 9. Distribución en escritorio: rejilla `lg:grid-cols-3` con 3 filas naturales. Se elimina la lógica `i >= 3 ? "lg:hidden"` que ocultaba reseñas en desktop — ahora se ven todas al hacer scroll dentro del hero.

**3. Composición de las 9 reseñas (en este orden)**

| # | Autor | Idioma | Estrellas | Origen |
|---|-------|--------|-----------|--------|
| 1 | Juan Rodríguez | ES | 5 | Real |
| 2 | Vicente Fresneda | ES | 5 | Real |
| 3 | Javier Castelló | ES | 5 | Real |
| 4 | Javier Olmos | ES | 5 | Real |
| 5 | Primitivo Murcia | ES | 5 | Real |
| 6 | **José Peiró** | ES | **4,5** | Real |
| 7 | María López | ES | 5 | Añadida |
| 8 | Carlos Navarro | ES | 5 | Añadida |
| 9 | Emma Wilson | EN | 5 | Añadida |

Las frases reales se usan tal cual las has facilitado (con los matices abreviados solo donde superan ~140 caracteres para que la card respire). Las 3 añadidas usan exactamente las frases que has propuesto.

**Reseña 4,5 estrellas**: José Peiró — *"La app es muy intuitiva y cómoda para no tener caos en la organización del viaje."* (4 estrellas llenas + 1 media, ya soportado por el código actual con `StarHalf`).

**4. Responsive**
- **Móvil**: scroll horizontal con snap (igual que ahora) mostrando las 9 reseñas deslizables.
- **Tablet (sm)**: rejilla 2 columnas, scroll vertical natural.
- **Escritorio (lg)**: rejilla 3×3 visible al hacer scroll dentro del hero.

**5. Asegurar visibilidad del nombre**
Mantener `mt-3` entre quote y nombre, y comprobar que el `flex-1` del párrafo no empuja el nombre fuera del contenedor con padding `p-5`.

### Lo que NO se toca
- Hero copy, logo, CTAs, vídeo de fondo, vídeo modal.
- Secciones Problem, Features, How it works, Benefits, FAQ, footer.
- Ningún otro fichero del proyecto (ni traducciones, ni componentes, ni estilos globales).

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/Landing.tsx` | Reducir padding hero, reducir margen CTAs, sustituir array de 6 reseñas por 9, eliminar `lg:hidden` condicional |

Un único fichero modificado.

