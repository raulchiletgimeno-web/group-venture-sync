# Fechas al crear viaje: cambiar el selector nativo por un calendario propio

## Qué se ha comprobado
- He reproducido el formulario en emulación móvil (390px tipo iPhone y 412px tipo Android) con Chromium y sesión real: los campos se ven bien, nada los tapa, no están deshabilitados y las fechas se mantienen (`2026-11-10` / `2026-11-12`). **En Chromium el fallo no se reproduce.**
- Por tanto, el fallo depende del **selector de fecha nativo del sistema** (rueda/popup de iOS Safari/PWA y de algunos Android/WebView de Play Store), que la emulación no puede abrir. Ese selector nativo se muestra dentro de una ventana emergente que bloquea los toques fuera de ella; es un conflicto conocido en móviles reales: el selector se abre pero la fecha no llega al formulario, o no se abre.
- La corrección anterior solo cambió tamaño y validación; seguía usando el selector nativo, por eso no resolvió nada.

## Cambio (solo `src/components/CreateTripDialog.tsx`)
- Sustituir únicamente los dos campos "Inicio" y "Fin" por un botón con el mismo aspecto que los demás campos que abre el calendario de la app (componentes Calendar + Popover ya instalados; sin dependencias nuevas). Así no depende del selector del sistema y se comporta igual en iPhone, PWA, Android y Play Store.
- El calendario lleva `pointer-events-auto` para que funcione dentro de la ventana Crear viaje.
- La fecha se guarda como texto `yyyy-MM-dd` (sin conversión de zona horaria), igual que ahora.
- En "Fin" se desactivan los días anteriores al inicio (se permite el mismo día). Si cambias el inicio a un día posterior al fin, el fin se ajusta. Se mantiene el aviso traducido al guardar y se añade el aviso si falta alguna fecha (se reutilizan textos existentes).
- Fechas mostradas en el idioma del usuario.
- El resto del formulario, el diseño y la lógica de guardado no cambian.

## Validación real (Playwright, 390px y 412px, sesión real)
1. Abrir Crear viaje, elegir inicio y fin pulsando en el calendario, comprobar que se ven y el valor real.
2. Viaje de un solo día. 3. Varios días. 4. Cambiar inicio después del fin.
5/6. Ambos anchos de móvil.
7. Crear un viaje real, comprobar en la base de datos que tiene las fechas correctas y borrarlo después (solo ese viaje de prueba).

Limitación: no puedo probar en un iPhone o Android físicos; el nuevo calendario no usa el selector del sistema, que es el origen del problema.
