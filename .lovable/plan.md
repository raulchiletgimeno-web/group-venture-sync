## Diagnóstico (ya realizado, solo lectura)

He consultado `email_send_log` y `suppressed_emails` para `raul@chiletychilet.com`:

**Email del reenvío extraordinario "Rioja Bike Race"**
- `message_id`: `6e60a2c9-28df-4d6c-81dd-c97a19b62164`
- `template_name`: `trip-pre-departure`
- 17:44:57 UTC → `pending` (encolado correctamente)
- 17:44:59 UTC → `sent` (entregado al proveedor sin error)
- `error_message`: vacío
- No está en `suppressed_emails`
- Histórico: el mismo destinatario ha recibido sin problema otros emails recientes (`payment-notification`, `trip-post-departure`, e incluso un `trip-pre-departure` previo el 2026-05-11), todos con estado `sent`.

**Conclusión técnica:** desde la app y el dispatcher todo se ejecutó correctamente. El correo salió, no rebotó, no fue rechazado, no está suprimido y no hay error registrado. La no recepción es ya externa al sistema (filtro spam/promociones del buzón, regla del cliente de correo, o entrega diferida del proveedor sin notificación de bounce).

## Acción propuesta (puntual, aislada)

Ejecutar **un único reenvío manual** invocando directamente `send-transactional-email` solo para `raul@chiletychilet.com`, con una `idempotencyKey` nueva para forzar un envío fresco. Sin tocar:

- el cron
- la edge function `check-trip-pre-departure`
- la lógica de la regla fija (2 días antes, 10:00 Madrid)
- la tabla `trip_pre_departure_reminders`
- ningún otro destinatario
- ningún archivo de la app

### Detalle técnico

Una llamada HTTP a la edge `send-transactional-email` con:
```json
{
  "templateName": "trip-pre-departure",
  "recipientEmail": "raul@chiletychilet.com",
  "idempotencyKey": "manual-resend-rioja-raul-<timestamp>",
  "templateData": {
    "userName": "<nombre real>",
    "tripName": "Rioja Bike Race",
    "destination": "<destino real>",
    "startDate": "14 may 2026",
    "endDate": "<fin real>",
    "forecast": <forecast recalculado on-the-fly>
  }
}
```

Datos `templateData` extraídos del registro real del viaje y del perfil del destinatario (sin modificar nada). El forecast se obtendrá vía Open-Meteo igual que hace la función automática.

### Validación posterior

Tras el envío:
1. Confirmar nuevo `message_id` con `status=sent` en `email_send_log`.
2. Pedir a Raúl que revise **spam / promociones / "otros"** del buzón, ya que el sistema confirma envío correcto en los dos intentos previos.
3. Reportar resultado y confirmar que ningún otro archivo o flujo ha sido modificado.
