

## Plan: Video de fondo en el Hero de la Landing

### Resumen
Reemplazar la imagen de fondo del hero (`hero-travel.jpg`) por un video en bucle de temática de viajes (~10s), manteniendo la misma capa oscura superpuesta y todo el contenido actual.

### Cambios

**1. Obtener un video de fondo**
- Usar un video libre de derechos de temática viajes (aviones, maletas, paisajes). Se puede descargar uno de Pexels/Pixabay y añadirlo a `public/videos/hero-background.mp4`, o usar una URL externa de un CDN gratuito para evitar aumentar el tamaño del proyecto.

**2. Modificar `src/pages/Landing.tsx`**
- En la sección Hero, reemplazar el `<img src={heroImage}>` por un `<video>` con atributos: `autoPlay`, `muted`, `loop`, `playsInline`, `preload="auto"`.
- Mantener el overlay `bg-black/60` encima del video.
- Eliminar el import de `heroImage` si ya no se usa en ningún sitio.
- Clases del video: `w-full h-full object-cover absolute inset-0` para cubrir todo el fondo igual que la imagen actual.

### Nota
Necesitaré confirmar la fuente del video: ¿tienes un video propio que quieras usar, o prefieres que use uno libre de derechos de internet?

