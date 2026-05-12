## Reenvío extraordinario del email previo al viaje — "Rioja Bike Race"

Operación puntual. **No modifica código de la app, ni la regla fija (2 días antes a las 10:00 Madrid, una vez por usuario y viaje).**

### Contexto
- Trip ID: `3b5e645d-3144-4206-9503-1f5c3c0b3862` (start_date 2026-05-14).
- La función `check-trip-pre-departure` ya soporta `force_trip_id` para ignorar el chequeo de hora/fecha — exactamente el mecanismo previsto para catch-up manual.
- Bloqueos a salvar para que el reenvío llegue de verdad:
  1. La tabla `trip_pre_departure_reminders` ya tiene registros para los miembros (filtro `recipients` los excluiría).
  2. `send-transactional-email` deduplica por `idempotencyKey`, y la función usa una clave fija `pre-departure-${tripId}-${userId}` que ya se consumió en el envío anterior.

### Pasos (solo datos / invocación, **sin tocar código**)

1. **Borrar los recordatorios previos solo de este viaje** para que la función vuelva a considerar a los miembros como pendientes:
   ```sql
   DELETE FROM trip_pre_departure_reminders
   WHERE trip_id = '3b5e645d-3144-4206-9503-1f5c3c0b3862';
   ```
   (Migración acotada al trip — no afecta a otros viajes ni a la regla futura.)

2. **Liberar la idempotencia previa** del send para este trip, para que `send-transactional-email` no descarte los reenvíos como duplicados:
   ```sql
   DELETE FROM email_send_log
   WHERE idempotency_key LIKE 'pre-departure-3b5e645d-3144-4206-9503-1f5c3c0b3862-%';
   ```
   (Si la tabla/columna real difiere, lo ajusto tras inspeccionarla; es la usada por `send-transactional-email`.)

3. **Invocar manualmente** la edge function con `force_trip_id`:
   ```
   POST /functions/v1/check-trip-pre-departure
   { "force_trip_id": "3b5e645d-3144-4206-9503-1f5c3c0b3862" }
   ```
   Esto reenvía a todos los miembros aprobados con email, recalculando el bloque del tiempo. Tras el envío, la función vuelve a registrar los recordatorios → futuros runs automáticos no reenvían.

### Lo que NO se toca
- Ningún archivo del repo (ni edge functions, ni plantillas, ni frontend).
- Cron `check-trip-pre-departure-hourly` → sigue en `0 8,9 * * *`.
- Lógica estricta: `start_date = targetDate` + `madridHour === 10` + UNIQUE constraint.
- Otros viajes, otros emails, RLS, diseño, navegación.

### Validación tras la ejecución
- Respuesta JSON de la función con `processed > 0` y detalle por destinatario.
- `weather: 'included'` por destinatario si la previsión está disponible.
- Confirmación de que la regla automática queda intacta.
