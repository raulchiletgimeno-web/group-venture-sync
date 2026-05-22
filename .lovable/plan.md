## Diagnóstico real, usuario por usuario

Viaje "Rioja Bike Race" (fin 17 may). El cron post-viaje se ejecutó correctamente el **18 may a las 10:00 Madrid (08:00 UTC)** y procesó a los 4 usuarios aprobados. La tabla `trip_post_departure_reminders` tiene marca de envío para los 4, y `email_send_log` confirma:

| Usuario | Email | Estado real en el sistema |
|---|---|---|
| Raúl Chilet | raul@chiletychilet.com | `pending` → **`sent`** (08:00:11 UTC) |
| Ana Sedó | anasedo74@gmail.com | `pending` → **`sent`** (08:00:11 UTC) |
| Rocío Gómez | rgomezlppez@hotmail.com | `pending` → **`sent`** (08:00:15 UTC) |
| Jabel Balseiro | jabelbalseiro@gmail.com | **`suppressed`** — no se envió |

Sin errores, sin bounces, sin rechazos del proveedor.

### Por qué Jabel no lo recibió
Jabel está en la tabla `suppressed_emails` desde el **16 abril 2026** con motivo `unsubscribe`. Él mismo se dio de baja en un envío anterior. El sistema, **correctamente y por ley (RGPD / CAN-SPAM)**, bloquea todos los emails transaccionales a esa dirección. Esto es comportamiento intencionado y no debe saltarse.

### Por qué Ana y Rocío dicen no haberlo recibido
Para ambas el email salió sin error (`sent`, sin bounce, sin complaint). Es el mismo patrón ya visto con Raúl y Ana en otros envíos: filtro de Gmail (Promociones/Spam) o de Hotmail. No es un fallo del sistema.

### Por qué Raúl sí lo vio
Probablemente porque ya había interactuado antes con emails de YORMIT y su buzón los entrega a Principal. Los demás no, aunque sí los recibieron a nivel proveedor.

## ¿Hay fallo estructural en la lógica?

**No.** Repasado el flujo:
- `check-trip-post-departure` se disparó a las 10:00 Madrid del día siguiente a `end_date`.
- Seleccionó los 4 miembros `approved`.
- Excluyó solo a los ya registrados en `trip_post_departure_reminders` (ninguno en este caso).
- Encoló 4 envíos con idempotencia `post-departure-{tripId}-{userId}`.
- El dispatcher procesó los 4: 3 enviados, 1 suprimido por unsubscribe previo.

La regla "1 vez por usuario y viaje, día siguiente a las 10:00 Madrid" funciona correctamente. **No hay nada que tocar en cron, función ni tabla de control.**

## Acción puntual propuesta (aislada)

Reenviar manualmente a las **2 únicas usuarias que realmente faltan por recibirlo en su bandeja**, con `idempotencyKey` nuevo para forzar un envío fresco fuera de la regla de duplicados:

1. **Ana Sedó** — `anasedo74@gmail.com`
2. **Rocío Gómez** — `rgomezlppez@hotmail.com`

Llamada directa a `send-transactional-email` con `templateName: trip-post-departure`, reutilizando su token de feedback existente (o generando uno si no hay) para que el botón "Valorar" funcione correctamente.

### Lo que NO se hará
- **No** se reenviará a Raúl (ya lo recibió).
- **No** se reenviará a Jabel: está unsubscribed, saltarse la supresión sería ilegal y dañaría la reputación del dominio. Si Jabel quiere volver a recibir comunicaciones, debe pedirlo y se elimina su entrada de `suppressed_emails` manualmente — esto se puede hablar aparte, pero no debe hacerse por iniciativa nuestra.
- **No** se tocará ninguna otra parte de la app, ni cron, ni función, ni diseño, ni templates, ni otros emails.

## Validación posterior
1. Confirmar dos nuevos `message_id` con estado `sent` en `email_send_log`.
2. Pedir a Ana y Rocío que revisen Spam / Promociones / Otros.
3. Reportar resultado exacto con los 4 estados finales.

## Sobre próximos viajes
La lógica ya está bien blindada. La única variable externa es el filtro del buzón del destinatario, que no podemos controlar desde el código. Si quieres maximizar entregabilidad en Principal, lo que ayuda de verdad es:
- mantener el remitente y dominio (`notify.yormit.com`) consistentes (ya lo está),
- evitar palabras tipo "gratis/oferta/descuento" en asunto (ya evitado),
- y que los propios usuarios marquen un email previo de YORMIT como "No es spam" una vez (acción del usuario, no del sistema).

No propongo cambios estructurales porque no hay fallo estructural que corregir.
