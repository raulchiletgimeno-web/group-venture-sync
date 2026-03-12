

## Plan: Configurar icono PWA de YORMIT

### Archivos de icono
Copiar la imagen subida a `public/` como los iconos PWA y favicon:
- `public/pwa-icon-192.png` (reemplazar existente)
- `public/pwa-icon-512.png` (reemplazar existente)
- `public/favicon.png` (nuevo, reemplazar el .ico)
- `public/apple-touch-icon.png` (nuevo, para iOS)

Todas serán copias de la misma imagen subida (los navegadores las redimensionan correctamente).

### Archivo: `index.html`
- Añadir `<link rel="icon" href="/favicon.png" type="image/png">` 
- Añadir `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`
- Eliminar referencia al antiguo `favicon.ico`

### Archivo: `vite.config.ts`
El manifest PWA ya está configurado correctamente con los nombres y rutas de iconos. Solo añadir una entrada adicional para el icono maskable 512x512 separado (con `purpose: "maskable"`) y dejar el otro con `purpose: "any"`.

### Resultado
Al borrar el acceso directo y volver a añadir la webapp, aparecerá el nuevo icono con la maleta sobre fondo azul degradado.

