# Auditoría de emails automáticos (pre-viaje y post-viaje)

## Resultado de la auditoría (datos reales verificados)

### 1. Email 48 h antes del viaje — PARCIAL (falla con grupos grandes)

- Función: `check-trip-pre-departure`. Cron activo `check-trip-pre-departure-hourly`, `0 8,9 * * *` UTC; la función solo actúa si en Madrid son las 10:00 → un envío al día, correcto en verano e invierno.
- Selección: `trips.start_date = hoy(Madrid) + 2 días`; miembros con `status = 'approved'`; dedupe por `trip_pre_departure_reminders` (una fila por viaje+usuario).
- Envíos reales confirmados en `email_send_log` (plantilla `trip-pre-departure`): 30 `sent`, 3 `suppressed`, 1 `dlq` (28-jun, motivo "Emails disabled for this project", incidencia ya superada).
- Fallo real detectado: viaje **Tracks Monte Perdido** (inicio 01-ago, 10 miembros aprobados, todos con email válido). El 30-jul a las 08:00 UTC solo se envió **1 de 10** (jul***, registrado a las 08:00:36). No hay ningún otro registro ni error para ese viaje.
  - Causa: la previsión meteorológica se pide **antes** de enviar y sin límite de tiempo (hasta 3 intentos de geocodificación + forecast). Ese día consumió ~36 s y la ejecución se cortó justo después del primer destinatario. En comparación, el mismo viaje sí recibió los 10 emails post-viaje (función sin meteorología) en 10 s, y los envíos previos con 2–4 destinatarios sí completaron.
- Casos que **no** son fallo: PORTIMAO (creado 23-jul, inicio 23-jul) y Pirineus 2026 (creado 23-jul, inicio 22-jul) se crearon después de su ventana X-2, por eso no tienen email previo. Los viajes anteriores a abril tampoco, porque la función no existía.

### 2. Email post-viaje de feedback — FUNCIONA

- Función: `check-trip-post-departure`. Cron activo `check-trip-post-departure-daily-10`, `0 8,9 * * *` UTC, con la misma comprobación de las 10:00 Madrid, y ventana `end_date = ayer o anteayer` (catch-up con dedupe).
- Token: uno por viaje+usuario en `trip_feedback_tokens`, reutilizado si ya existe; enlace `https://www.yormit.com/feedback?token=...`.
- Registros reales: 36 `sent`, 4 `suppressed` (bajas del servicio), 0 `dlq`. Último envío verificado: 10-ago 08:00 UTC. Monte Perdido: 10/10 el 07-ago.

### 3. `settlement_released_at` — CONFIRMADO: no interfiere

Ninguna de las dos funciones lee ni menciona `settlement_released_at`. Ese campo solo condiciona `check-trip-debts` (deudas, saldos y pagos).

### 4. Entrega real

`email_send_log` distingue `pending` (encolado) → `sent` (aceptado por el proveedor) → `suppressed` / `dlq`. El proveedor no devuelve todavía estado "entregado" por email, así que "sent" significa aceptado por el proveedor, no confirmado en bandeja. Los rebotes/bajas aparecen en `suppressed_emails`.

## Corrección propuesta (única, acotada)

Solo se toca `supabase/functions/check-trip-pre-departure/index.ts`:

1. Poner un límite de tiempo a la meteorología: `AbortSignal.timeout` por petición (~5 s) y un tope global (~12 s) para geocodificación + forecast. Si se agota, se envía el email sin el bloque de tiempo en lugar de arriesgar la ejecución completa.
2. Reordenar: obtener destinatarios y meteorología antes del bucle (ya es así), pero con el tope anterior, de modo que el envío a todos los destinatarios ocurra siempre dentro de la ventana segura de ejecución.
3. Registrar en consola los destinatarios pendientes al terminar, para que un fallo parcial quede visible.

No se cambia el horario, ni el contenido, ni el diseño, ni el criterio de selección, ni la deduplicación. Los usuarios ya registrados en `trip_pre_departure_reminders` nunca se reenvían, así que no hay riesgo de duplicados ni de reenvío masivo.

Nota: los 9 destinatarios de Monte Perdido que no recibieron el email previo pertenecen a un viaje ya finalizado; **no** se reenviará nada.

## Prueba de extremo a extremo con info@yormit.com

Durante la auditoría **no se ha enviado ningún email**. Para verificar sin afectar a usuarios reales, propongo (solo si lo apruebas):

1. Crear un viaje de prueba con un único miembro aprobado cuya cuenta sea `info@yormit.com`, con `start_date` = hoy + 2 días y `end_date` = ayer + ... (dos viajes de prueba: uno para cada flujo).
2. Invocar `check-trip-pre-departure` y `check-trip-post-departure` con `force_trip_id` de esos viajes de prueba: el envío queda limitado al viaje indicado, por lo que ningún usuario real recibe nada.
3. Comprobar en `email_send_log` el paso `pending → sent`, la llegada a la bandeja de `info@yormit.com`, el bloque de meteorología y checklist en el previo, y el enlace de feedback con token válido en el posterior.

## Detalle técnico

- Archivos a modificar: `supabase/functions/check-trip-pre-departure/index.ts` (y su despliegue).
- Sin migraciones de base de datos, sin cambios de cron, sin cambios en frontend.
