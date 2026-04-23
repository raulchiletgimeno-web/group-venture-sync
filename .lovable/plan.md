

## Corrección: la pantalla de resultados de "Sitios útiles" se cierra sola

### Qué estaba pasando
El salto a la pantalla anterior **no es un cambio de ruta ni un bug en `UsefulPlacesCategory`**. Es una **recarga completa de la página** disparada por el Service Worker (PWA) en producción. Como el componente guarda la elección (`source`, `center`, `places`) en estado local de React, la recarga lo reinicia y el usuario aparece otra vez en el selector "Cerca de mi ubicación / Cerca del alojamiento".

Causa concreta, en `src/main.tsx` (solo en producción, p. ej. yormit.com):

1. Línea 29-31: cada **60 segundos** se llama a `registration.update()` para comprobar si hay un Service Worker nuevo.
2. `public/custom-sw.js` usa `self.skipWaiting()` + `clientsClaim()` → el SW nuevo se activa de inmediato.
3. Líneas 38-43 de `main.tsx`: al detectar `controllerchange`, se ejecuta `window.location.reload()` → recarga forzada → el usuario ve el selector de nuevo.

Esto explica perfectamente que "a los pocos segundos" la pantalla se reinicie sin que nadie pulse atrás. Pasa en cualquier sección que mantenga estado local (no solo Sitios útiles), pero aquí se nota más porque la elección de origen vive solo en memoria.

### Corrección (mínima, quirúrgica)

Un único archivo: **`src/main.tsx`**.

Cambios:

1. **Quitar la recarga forzada al activarse un SW nuevo** (líneas 38-43). El SW nuevo se cargará de forma natural en la próxima navegación o cuando el usuario abra/cierre la app, sin interrumpir lo que está haciendo.
2. **Espaciar mucho la comprobación de actualizaciones**: cambiar el intervalo de `60 * 1000` (1 min) a `30 * 60 * 1000` (30 min). Sigue habiendo refresco automático del SW pero sin saturar y sin acoplarse al uso activo.

Resultado: la pantalla de resultados se mantiene estable. La PWA sigue actualizándose, solo que sin recargar la pestaña activa del usuario.

### Lo que NO se toca
- Cero cambios en `UsefulPlacesCategory.tsx`, `UsefulPlaces.tsx`, `usefulPlaces.ts`, `TripLayout`, navegación, traducciones, diseño, BD, RLS, edge functions, otras secciones.
- Cero cambios en `custom-sw.js` (sigue gestionando push y notificaciones igual).
- El registro del Service Worker se mantiene; solo cambia la frecuencia de comprobación y se elimina el `reload()` automático.

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/main.tsx` | Quitar bloque `controllerchange → reload`. Subir intervalo de `update()` de 60 s a 30 min. |

### Validación posterior
1. Abrir Sitios útiles → Cafés y bares → Cerca de mi ubicación → esperar 1-2 minutos viendo los resultados → confirmar que la pantalla NO vuelve sola al selector.
2. Repetir con "Cerca del alojamiento" en el viaje "Fin de semana en Madrid".
3. Confirmar que push notifications, instalación PWA y resto de la app siguen funcionando exactamente igual.

