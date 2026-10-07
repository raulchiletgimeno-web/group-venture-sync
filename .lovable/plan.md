# Unificar todos los selectores de fecha de YORMIT

## Inventario (búsqueda completa del código)

| Pantalla | Campo | Control actual |
|---|---|---|
| Crear viaje | Inicio / Fin | Calendario YORMIT (correcto, referencia) |
| Editar viaje (panel del viaje) | Inicio / Fin | Nativo `type="date"` |
| Alojamiento (añadir/editar) | Check-in / Check-out | Nativo `type="date"` |
| Transporte (añadir/editar) | Salida / Llegada | Nativo `type="datetime-local"` (fecha + hora) |
| Actividades (añadir/editar) | Fecha | Nativo `type="date"`; Hora `type="time"` |

El calendario mensual de Actividades es solo visualización y no se toca. Gastos no tiene fecha editable.

## Solución

1. Crear un componente común `YormitDatePicker` extrayendo el `DateField` que ya funciona en Crear viaje (mismo aspecto, idioma por usuario es/enGB/fr/pt/it/de/zhCN con fallback inglés, lunes-domingo, valor `YYYY-MM-DD` en hora local, `minDate` opcional).
2. Crear viaje pasa a usar el componente común (sin cambio visible).
3. Sustituir los nativos de fecha en Editar viaje, Alojamiento y Actividades.
4. Transporte: dividir cada `datetime-local` en `YormitDatePicker` + campo de hora, recomponiendo exactamente el mismo texto `YYYY-MM-DDTHH:mm` que se guarda hoy (respetando la regla UTC existente). La hora de Actividades/Transporte se mantiene como campo de hora estándar (solo fecha migra al calendario).
5. Reglas: fin >= inicio (viaje, mismo día permitido), check-out >= check-in, llegada >= salida (bloqueo con aviso traducido solo si no existía ya), mediante `minDate` y validación al guardar.

## No se toca
Base de datos, RLS, gastos, saldos, pagos, chat, fotos, sitios útiles, emails, notificaciones, diseño general.

## Validación
Playwright en anchos iPhone (390) y Android (412), español e inglés: crear/editar viaje, añadir/editar alojamiento, transporte y actividad; abrir calendario, elegir fecha, guardar, reabrir y comprobar persistencia. Datos de prueba en un viaje TEST que se borra al final. Informe con inventario, archivos modificados y resultado por prueba.

## Archivos previstos
- nuevo `src/components/YormitDatePicker.tsx`
- `src/components/CreateTripDialog.tsx`, `src/pages/TripDashboard.tsx`, `src/pages/trips/Accommodation.tsx`, `src/pages/trips/Transport.tsx`, `src/pages/trips/Schedule.tsx`
