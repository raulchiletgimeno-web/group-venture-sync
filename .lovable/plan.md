

## Plan: Nuevo video de fondo + mejor legibilidad del texto

### Problema
El video actual es demasiado claro/colorido y las letras blancas del hero no se leen bien. El overlay `bg-black/30` es insuficiente.

### Cambios

**1. Reemplazar `public/videos/hero-background.mp4`**
- Buscar un video libre de derechos con 3 amigos paseando por un lugar emblemático (Coliseo, Torre Eiffel, etc.) — temática de amistad, felicidad, buen rollo.
- Idealmente con tonos medios-oscuros naturales (atardecer, sombras urbanas) que faciliten la lectura del texto blanco superpuesto.

**2. Ajustar overlay en `src/pages/Landing.tsx`**
- Subir el overlay de `bg-black/30` a `bg-black/40` para garantizar contraste suficiente con el texto blanco sin oscurecer demasiado el video.

**3. Añadir text-shadow al texto del hero** (en `src/index.css` o inline)
- Aplicar un `text-shadow` sutil al título y descripción del hero para que las letras se lean con claridad independientemente del fotograma del video:
  ```css
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  ```
- Esto se aplicará al logo YORMIT, al h1, y al párrafo descriptivo.

### Resultado
Video alegre de amigos en lugar emblemático + overlay equilibrado + sombra en texto = contenido perfectamente legible sobre un fondo bonito y vibrante.

