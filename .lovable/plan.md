## Diagnóstico (solo lectura, ya realizado)

Consulta a `email_send_log` y `suppressed_emails` para `anasedo74@gmail.com`:

**Email "Rioja Bike Race" — reenvío extraordinario de hoy**
- `message_id`: `1c4020ac-4eca-41fc-946d-4f3b3e47f3c9`
- `template_name`: `trip-pre-departure`
- 2026-05-12 17:44:54 UTC → `pending` (encolado correctamente)
- 2026-05-12 17:44:58 UTC → `sent` (entregado al proveedor sin error)
- `error_message`: vacío
- No está en `suppressed_emails`
- Histórico reciente sano: el mismo destinatario ha recibido sin problema otros emails en los últimos días (`debt-reminder` el 5/6/7/8/9 mayo, `trip-post-departure`, `payment-notification`, e incluso un `trip-pre-departure` previo el 11 mayo), todos con estado `sent`.

**Conclusión técnica:** desde la app y el dispatcher todo se ejecutó correctamente. El correo salió, no rebotó, no fue rechazado, no está suprimido y no hay error registrado. La no recepción es externa al sistema (filtro spam/promociones del buzón de Gmail, regla del cliente, o entrega diferida del proveedor sin notificación de bounce). Es exactamente el mismo patrón que con `raul@chiletychilet.com`.

A los otros 3 destinatarios (`raul@`, `jabelbalseiro@`, `rgomezlppez@`) el envío también figura como `sent` sin error — no es un problema específico de Ana en la cola ni en la lógica.

## Acción propuesta (puntual, aislada)

Ejecutar **un único reenvío manual** invocando directamente `send-transactional-email` solo para `anasedo74@gmail.com`, con una `idempotencyKey` nueva para forzar un envío fresco.

Sin tocar:
- el cron
- la edge function `check-trip-pre-departure`
- la lógica de la regla fija (2 días antes, 10:00 Madrid)
- la tabla `trip_pre_departure_reminders`
- ningún otro destinatario
- ningún archivo de la app

### Detalle técnico

Una llamada HTTP a `send-transactional-email` con:
```json
{
  "templateName": "trip-pre-departure",
  "recipientEmail": "anasedo74@gmail.com",
  "idempotencyKey": "manual-resend-rioja-ana-<timestamp>",
  "templateData": {
    "userName": "Ana Se.",
    "tripName": "Rioja Bike Race",
    "destination": "Logroño",
    "startDate": "14 may 2026",
    "endDate": "<fin real>",
    "forecast": <forecast Open-Meteo on-the-fly>
  }
}
```

Datos extraídos del registro real del viaje y del perfil (sin modificar nada).

### Validación posterior

1. Confirmar nuevo `message_id` con `status=sent` en `email_send_log`.
2. Pedir a Ana que revise **spam / promociones / "otros"** del buzón de Gmail.
3. Reportar resultado y confirmar que ningún otro archivo o flujo ha sido modificado.