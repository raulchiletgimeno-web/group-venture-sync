

## Eliminar la burbuja "Edit with Lovable"

### Qué es esa burbuja
Es el **badge oficial de Lovable** que se inyecta automáticamente en los sitios publicados de proyectos creados con la plataforma. **No pertenece al código de YORMIT** — no está en ningún componente, ni en `index.html`, ni en estilos. Lovable la añade del lado del hosting al servir la versión publicada (`yormit.com`, `www.yormit.com` y `group-venture-sync.lovable.app`).

Por eso no se puede quitar editando archivos del proyecto: hay que desactivarla a nivel de configuración de publicación.

### Estado actual
- `hide_badge`: **false** → el badge está visible en producción.

### Cambio a realizar
Una sola acción de configuración (no toca ningún archivo del código):

- Llamar a `publish_settings--set_badge_visibility` con `hide_badge: true`.

Esto oculta el badge en todas las URLs publicadas (`yormit.com`, `www.yormit.com`, `group-venture-sync.lovable.app`) de forma permanente. El cambio es inmediato tras aplicarse y no requiere republicar.

### Requisito
Ocultar el badge requiere plan **Pro o superior** en Lovable. Si el workspace está en plan gratuito, la operación fallará y habrá que subir de plan antes. Si ya estás en Pro+, se aplicará sin problema.

### Lo que NO se toca
- Cero cambios en código (`src/`, `public/`, `index.html`, edge functions, BD).
- Cero cambios en diseño, "Sitios útiles", o cualquier otra sección.
- Cero cambios en el entorno de preview de Lovable (allí seguirás viendo el badge cuando edites, lo cual es normal y solo afecta a la vista de editor).

### Validación posterior
1. Confirmar que `get_badge_visibility` devuelve `hide_badge: true`.
2. Abrir `https://www.yormit.com` en una pestaña de incógnito y verificar que la burbuja negra ya no aparece.
3. Confirmar que ninguna otra parte de la app ha cambiado.

