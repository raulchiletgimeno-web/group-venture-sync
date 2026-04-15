

## Optimizacion del apartado de Fotos

### Problemas identificados

1. **Sin compresion de imagen**: Las fotos de movil (3-10MB) se suben tal cual, causando lentitud y timeouts
2. **Nombres de usuario lentos**: Se cargan los miembros en un `useEffect` separado con 2 queries secuenciales; si llegan despues de las fotos, se muestra "Usuario" temporalmente
3. **Sin feedback visual durante la subida**: Solo un spinner generico en los botones, sin indicacion de progreso
4. **Gestion de errores basica**: Un toast generico sin reintentos

### Cambios (solo en `src/pages/trips/Photos.tsx`)

**1. Compresion de imagen client-side antes de subir**
- Crear funcion `compressImage(file, maxWidth=1920, quality=0.8)` usando Canvas API
- Redimensiona imagenes grandes a max 1920px de ancho manteniendo ratio
- Comprime a JPEG 80% calidad
- Reduce fotos tipicas de 5-8MB a ~200-500KB
- Solo aplica a imagenes, no a videos

**2. Precarga de miembros con `useQuery` en paralelo**
- Reemplazar el `useEffect` manual por un `useQuery` con la misma queryKey
- Los miembros se cachean y estan disponibles instantaneamente en re-renders
- Elimina el estado `members` manual y la carga secuencial

**3. Barra de progreso visual durante subida**
- Anadir estado `uploadProgress` con mensaje ("Optimizando...", "Subiendo...")
- Mostrar un banner sutil encima de la galeria mientras se sube
- Feedback claro de cada fase del proceso

**4. Mejor gestion de errores**
- Mostrar mensajes mas descriptivos segun el tipo de error (tamano, red, timeout)
- Anadir timeout de seguridad para evitar que se quede bloqueado

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `src/pages/trips/Photos.tsx` | Compresion, useQuery para miembros, feedback de subida, mejor error handling |

No se toca ningun otro fichero, pantalla ni funcionalidad. El visor fullscreen, swipe, videos y eliminacion quedan intactos.

