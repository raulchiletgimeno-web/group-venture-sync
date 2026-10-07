# Fechas al crear viaje

## Diagnóstico (revisado en código)
`CreateTripDialog.tsx` usa campos de fecha nativos (`type="date"`) en dos columnas, sin `min`, sin validación inicio/fin y sin estilos para Safari/iOS.
Causas probables:
1. **iPhone/Safari/PWA**: el campo de fecha nativo vacío no respeta ancho/alto en columnas estrechas; puede verse colapsado o desbordado, y es difícil de pulsar o parece que no guarda la fecha.
2. **No hay control del rango**: se puede elegir un fin anterior al inicio sin aviso; al guardar puede fallar sin un mensaje claro.
3. No hay `min`/`max` ni valores por defecto que bloqueen fechas válidas (confirmado), y no hay conversión de zona horaria (se envía `YYYY-MM-DD` tal cual).

## Cambios (solo `src/components/CreateTripDialog.tsx`)
- Campos de fecha: `min-w-0 w-full block appearance-none min-h-10 text-left` para que se vean y se puedan pulsar bien en iOS/Android.
- Fin: `min={startDate}` para que no se pueda elegir una fecha anterior al inicio (se permite el mismo día).
- Si el usuario cambia el inicio a una fecha posterior al fin ya elegido, el fin se ajusta al inicio.
- En el envío: si fin < inicio, mostrar el aviso "La fecha de fin no puede ser anterior a la de inicio" y no guardar.
- Nuevo texto traducido en `translations.ts` (7 idiomas), solo esa clave.

## Validación
Playwright con viewport móvil (Android/iPhone): un día, varios días, hoy→mañana, fecha futura, fin anterior (aviso), y creación real del viaje con sesión; después se borra el viaje de prueba.

No se toca nada más: RLS, lógica de viajes, invitaciones ni otras secciones.
