

## Plan: Generar sitemap.xml y robots.txt para yormit.com

### Páginas públicas identificadas
- `/` — Landing page (indexable)

### Páginas a excluir (privadas o no indexables)
- `/auth`, `/reset-password` — login/registro
- `/dashboard` — área privada
- `/join/:inviteCode` — invitaciones privadas
- `/trip/*` — todas las subrutas de viaje

### Cambios

**1. Crear `public/sitemap.xml`**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yormit.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**2. Actualizar `public/robots.txt`**
- Permitir rastreo de `/`
- Bloquear rutas privadas: `/dashboard`, `/trip/`, `/join/`, `/auth`, `/reset-password`
- Incluir referencia al sitemap en `https://yormit.com/sitemap.xml`

```
User-agent: *
Allow: /

Disallow: /auth
Disallow: /reset-password
Disallow: /dashboard
Disallow: /trip/
Disallow: /join/

Sitemap: https://yormit.com/sitemap.xml
```

Ambos archivos se sirven automáticamente desde la carpeta `public/` de Vite. Solo hay que republicar el proyecto para que estén accesibles.

