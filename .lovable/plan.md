

## Mejora de recordatorios automáticos de deuda

### Estado actual

Los mensajes del chat ya estan implementados con 12 variaciones diferentes, todas con el tono que pides (simpático, cercano, divertido) y todas recuerdan pagar por Bizum/transferencia y entrar en Gastos para ajustarlo. La rotación aleatoria (`pickRandom`) ya funciona.

### Sobre el email

Tu proyecto tiene el dominio **www.yormit.com** configurado, pero todavía no tiene un dominio de email activo para enviar correos. Para poder enviar los recordatorios por email al deudor, primero hay que configurar el dominio de email.

### Lo que propongo

**1. Ampliar los mensajes del chat de 12 a 20**

Añadir 8 mensajes nuevos manteniendo el mismo tono. Ejemplos:

- "🐌 {deudor}, que voy lento pero seguro: {importe} € con {creditor}. Págale y entra en Gastos para ajustarlo. Si no, mañana me vuelves a ver por aquí. 🐢"
- "🎬 {deudor}, episodio 47 de 'Las deudas de {deudor}': {importe} € con {creditor}. Spoiler: el final feliz es un Bizum y un ajuste en Gastos. 🍿"
- "🌮 {deudor}, por {importe} € te invito a saldar tu deuda con {creditor}. Bueno, no te invito yo, pero hazlo tú. Bizum, transferencia, lo que sea. Y luego Gastos → ajustar. 🙏"
- "📱 {deudor}, notificación importante: {importe} € con {creditor}. No es spam, es YORMIT recordándote con amor. Págale y ajústalo en Gastos. ❤️"
- "🧳 {deudor}, el viaje terminó pero los {importe} € con {creditor} siguen de vacaciones en tu cuenta. Mándalos a la suya con un Bizum y ajústalo en Gastos. ✈️"
- "🎁 {deudor}, tengo un regalo para ti: dejar de escribirte. Solo tienes que pagar {importe} € a {creditor} y ajustarlo en Gastos. ¡Trato hecho! 🤝"
- "🦜 {deudor}, soy el loro de YORMIT: ¡{importe} euros! ¡{creditor}! ¡Bizum! ¡Gastos! ¡Ajustar! Ya, en serio, págale y entra en Gastos para dejarlo cuadrado. 😄"
- "⏰ {deudor}, tic tac: {importe} € con {creditor}. No es urgente, pero tampoco es opcional. Un Bizum rápido, luego Gastos y ajústalo. ¡Y a otra cosa, mariposa! 🦋"

**2. Evitar repetición consecutiva**

Añadir lógica para consultar el último mensaje enviado en `debt_reminders` y excluir esa variante, garantizando que dos mensajes seguidos nunca sean iguales.

**3. Configurar email (requiere tu acción)**

Para activar los recordatorios por email necesitamos configurar tu dominio de email. Esto es un paso previo obligatorio. Una vez hecho, crearé las plantillas de email con el mismo tono y variedad que los mensajes del chat.

---

### Ficheros modificados

| Fichero | Cambio |
|---|---|
| `supabase/functions/check-trip-debts/index.ts` | Añadir 8 mensajes nuevos (total 20) + lógica anti-repetición consecutiva |

No se toca ningún otro fichero.

---

### Siguiente paso para email

Para activar los recordatorios por email, el primer paso es configurar tu dominio de envío.

