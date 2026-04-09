

## Recordatorios automáticos de deudas pendientes al finalizar un viaje

### Resumen

Cuando un viaje termine (según su `end_date`), YORMIT comprobará automáticamente si existen saldos pendientes entre los miembros. Si los hay, enviará recordatorios simpáticos al deudor por **email** y como **mensaje automático en el chat del viaje**, repitiendo cada 24 horas hasta que la deuda quede saldada.

---

### Requisito previo: configurar un dominio de email

Actualmente el proyecto no tiene configurado un dominio de envío de emails. Para poder enviar los recordatorios por email, primero necesitamos configurar uno. Esto se hace desde el panel de Lovable Cloud y requiere que tengas un dominio propio (por ejemplo, `yormit.app`). Se te pedirá añadir unos registros DNS en tu proveedor de dominio.

**Si prefieres empezar solo con los recordatorios en el chat (sin email)**, puedo implementar esa parte primero y añadir el email cuando tengas el dominio configurado.

---

### Arquitectura técnica

#### 1. Edge Function: `check-trip-debts` (nueva)
- Se ejecutará periódicamente vía **pg_cron** (cada hora).
- Consulta todos los viajes cuyo `end_date` ya haya pasado (>=24h).
- Para cada viaje con deudas pendientes, calcula los saldos usando la misma lógica de simplificación de deudas que ya existe en `Expenses.tsx`.
- Comprueba si ya se envió un recordatorio en las últimas 24h (usando una nueva tabla de tracking).
- Si no se ha enviado: inserta un mensaje automático en `trip_messages` y envía email al deudor.

#### 2. Nueva tabla: `debt_reminders`
- Registra cada recordatorio enviado para controlar la frecuencia.
- Columnas: `id`, `trip_id`, `debtor_id`, `creditor_id`, `amount`, `sent_at`, `channel` (email/chat).
- Permite saber cuándo se envió el último recordatorio y evitar duplicados.

#### 3. Mensajes automáticos en el chat
- Se insertan como `trip_messages` con `user_id` del sistema (o del deudor, marcado con un campo especial) y `type = 'text'`.
- Se usa un usuario virtual "YORMIT Bot" o bien se insertan con un `user_id` especial para que el chat los muestre de forma diferenciada.

#### 4. Emails al deudor
- Se envían mediante la infraestructura de emails de Lovable (requiere dominio configurado).
- Template React Email con tono simpático y branding de YORMIT.

#### 5. Parada automática
- Cada vez que el cron ejecuta, recalcula las deudas. Si el saldo del deudor es 0 (o < 0.01€), no se envía recordatorio.

---

### Calendario de recordatorios

| Tiempo desde fin del viaje | Acción |
|---|---|
| +24h | Primer recordatorio |
| +48h | Segundo recordatorio |
| +72h, +96h... | Cada 24h hasta que se salde |

---

### Propuesta de textos simpáticos

**Asuntos de email (rotación aleatoria):**
1. "¡Ey! Tienes una cuentita pendiente del viaje 😄"
2. "Tu cartera te está buscando... 💸"
3. "Un pequeño empujoncito amistoso 🤗"
4. "¡No te olvides de saldar cuentas del viaje! ✨"
5. "YORMIT te recuerda con cariño... 💛"

**Cuerpo del email:**
> ¡Hola {nombre}! 👋
>
> Esperamos que hayas disfrutado mucho del viaje **{título del viaje}**. 
>
> Solo queríamos recordarte con todo el cariño del mundo que todavía tienes una cuentita pendiente:
>
> **Debes {importe} € a {nombre del acreedor}** 💰
>
> ¡No pasa nada! Estas cosas se olvidan. Pero seguro que {nombre del acreedor} te lo agradecerá un montón 😊
>
> Un abrazo del equipo de YORMIT ✨

**Mensajes del chat (rotación aleatoria):**
1. "🤖 ¡Psst! {deudor}, recuerda que todavía debes {importe} € a {acreedor}. ¡Seguro que se te había pasado! 😄"
2. "💸 ¡Ey {deudor}! Tu cuenta con {acreedor} sigue pendiente: {importe} €. ¡Un Bizum y listo! 🚀"
3. "🫣 {deudor}, una cosita... quedan {importe} € por ajustar con {acreedor}. ¡Nada que un cafecito no arregle! ☕"
4. "🔔 Recordatorio amistoso: {deudor} → {acreedor}: {importe} €. ¡Que no se te escape! 😉"

---

### Ficheros que se crean/modifican

| Fichero | Acción |
|---|---|
| `supabase/functions/check-trip-debts/index.ts` | **Nuevo** — Edge Function con la lógica del cron |
| Migración SQL | **Nueva** — tabla `debt_reminders` + cron job |
| `supabase/functions/_shared/transactional-email-templates/debt-reminder.tsx` | **Nuevo** — template de email (si se configura dominio) |
| `supabase/functions/_shared/transactional-email-templates/registry.ts` | **Modificado** — registrar el nuevo template |
| `supabase/config.toml` | **Modificado** — añadir config de la nueva función |

**No se toca ningún otro fichero de la app.**

---

### Siguiente paso

Antes de implementar, necesito saber cómo quieres proceder con el email:

El primer paso es **configurar tu dominio de envío de email** desde Lovable Cloud. Sin él, puedo implementar solo los recordatorios en el chat. ¿Quieres configurar el dominio ahora, o prefieres que implemente primero solo la parte del chat?

