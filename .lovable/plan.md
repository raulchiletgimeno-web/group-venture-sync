

## Mejorar variedad y tono de los recordatorios automáticos de deuda

Solo se modifica `supabase/functions/check-trip-debts/index.ts`. Ningún otro archivo se toca.

---

### Sobre el email

No hay dominio de email configurado en el proyecto. Los recordatorios por email no se pueden enviar hasta que configures un dominio. Por ahora, se mejoran los mensajes del chat. Cuando quieras activar los emails, será el primer paso.

---

### Cambios concretos

**1. Ampliar la colección de mensajes del chat de 4 a 12+**

Todos los mensajes seguirán este patrón:
- Nombran al deudor, al acreedor y el importe
- Tono cercano, gracioso, entre amigos, nunca agresivo
- Recuerdan que debe pagar (Bizum, transferencia, etc.)
- Recuerdan que luego debe entrar en **Gastos** y ajustarlo para dejar de recibir avisos

**2. Ejemplos de mensajes nuevos para el chat:**

1. "🤖 Venga, {deudor}, a ver si le pagas esos {importe} € a {acreedor} y así mañana no tengo que volver a mandarte otro mensajito. Hazlo por Bizum, transferencia o invítale una cerveza, pero luego entra en Gastos y ajústalo para que deje de salir como pendiente. 😄"

2. "💸 {deudor}, que me han dicho que todavía le debes {importe} € a {acreedor}. No pasa nada, estas cosas se olvidan… pero yo no las olvido 😏. Págale como prefieras y luego entra en Gastos para ajustarlo. ¡Así dejo de darte la tabarra!"

3. "🫣 Oye {deudor}, soy YORMIT y vengo en son de paz. Quedan {importe} € pendientes con {acreedor}. Un Bizum rápido, una transferencia o un café y estáis en paz. Eso sí, luego entra en Gastos y ajústalo, que si no yo sigo contando. 📊"

4. "☕ {deudor}, te lo digo con cariño: {importe} € con {acreedor} siguen ahí. Págale cuando puedas y luego pásate por Gastos para ajustarlo. Así me ahorro el mensajito de mañana y tú te ahorras leerme. Win-win. 😉"

5. "🔔 ¡Buenos días, {deudor}! Soy tu recordatorio favorito. Todavía quedan {importe} € pendientes con {acreedor}. Hazle un Bizum, una transferencia o lo que os mole, y luego entra en Gastos para dejarlo ajustado. ¡Prometido que dejo de escribirte! 🤞"

6. "🎯 {deudor}, mira, no quiero ser pesado, pero es mi trabajo: {importe} € con {acreedor}. Págale como más os convenga y después entra en Gastos y ajústalo. Cuando lo hagas, me callo. Palabra de bot. 🤖"

7. "😅 {deudor}, que {acreedor} no te lo va a decir porque es muy majo/a, pero le debes {importe} €. Un Bizum, una transferencia, un sobre con billetes… lo que sea. Y luego entra en Gastos y ajústalo para que yo pueda descansar. 💤"

8. "🚀 {deudor}, recordatorio exprés: {importe} € → {acreedor}. Bizum, transferencia o paloma mensajera con monedas. Tú decides. Pero luego entra en Gastos y ajústalo, que si no mañana vuelvo. Y vuelvo. 😄"

9. "🎵 {deudor}, ♫ tienes {importe} euritos pendientes con {acreedor} ♫. No es broma, pero lo digo cantando para que suene mejor. Págale y entra en Gastos para ajustarlo. ¡Así la música para! 🎶"

10. "🧮 {deudor}, las matemáticas no mienten: {importe} € con {acreedor}. Hazle un Bizum o lo que queráis y luego entra en Gastos para ajustarlo. Cuando lo hagas, este bot se va de vacaciones. 🏖️"

11. "💛 {deudor}, te escribo con todo el cariño del mundo: {importe} € con {acreedor} siguen pendientes. Págale cuando puedas y luego entra en Gastos para dejarlo todo cuadrado. ¡Que luego las cuentas claras conservan las amistades! 🤝"

12. "🤖 Soy YORMIT y no tengo sentimientos, pero si los tuviera me daría penita seguir recordándote esto, {deudor}. {importe} € con {acreedor}. Págale, entra en Gastos, ajústalo y seré libre. ¡Hazlo por mí! 🥹"

**3. La lógica de rotación no cambia** — `pickRandom` selecciona uno al azar de la colección ampliada.

---

### Qué NO cambia
- Lógica de detección de viaje finalizado
- Cálculo de deudas
- Frecuencia de recordatorios (cada 24h)
- Parada automática cuando no hay deuda
- Tabla `debt_reminders`
- Ningún otro archivo de la app

---

### Ficheros modificados

| Fichero | Cambio |
|---|---|
| `supabase/functions/check-trip-debts/index.ts` | Reemplazar los 4 mensajes actuales por 12+ mensajes nuevos con el tono y contenido solicitado |

