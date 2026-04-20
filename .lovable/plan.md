

## Prueba controlada del email "48h antes del viaje"

### Datos confirmados
- **Viaje**: "Fin de semana en Madrid" (`09b47dd6-4700-4a72-846e-743752b2181b`) — destino Madrid, 30 abr → 3 may 2026.
- **Usuario**: Raul Chilet Gimeno (`8225afe6-a3f0-445a-bb83-929083fae6e4`) — email `raul@chiletychilet.com`.

### Cómo se lanza la prueba
Llamada directa al edge function `send-transactional-email` con el template `trip-pre-departure` (la misma vía que usa el sistema real, pero invocada manualmente solo para este destinatario).

**Parámetros del envío de prueba**:
- `templateName`: `trip-pre-departure`
- `recipientEmail`: `raul@chiletychilet.com`
- `idempotencyKey`: **`pre-departure-TEST-{timestamp}-09b47dd6...-8225afe6...`** ← clave distinta a la real (`pre-departure-{trip}-{user}`) para que no colisione con el envío automático futuro.
- `templateData`:
  - `userName`: "Raul"
  - `tripName`: "Fin de semana en Madrid"
  - `destination`: "Madrid"
  - `startDate`: "30 abr 2026"
  - `endDate`: "3 may 2026"
  - `forecast`: se intentará obtener en vivo desde Open-Meteo para Madrid (30 abr → 3 may). Si falla o las fechas están fuera del rango de 16 días del API, se enviará sin bloque del tiempo (igual que el sistema real).

### Garantías de aislamiento

| Riesgo | Mitigación |
|--------|------------|
| Que se envíe a otros usuarios | Llamada manual con un único `recipientEmail` |
| Que se "consuma" el envío real | **NO** se insertará nada en `trip_pre_departure_reminders` → cuando falten 48h reales, el cron seguirá detectando a Raúl como pendiente y le enviará el email definitivo |
| Que se altere el cron automático | El cron horario y la función `check-trip-pre-departure` quedan intactos |
| Que se duplique por idempotencia | `idempotencyKey` con prefijo `TEST-{timestamp}` distinto al real |
| Que se modifique el template o la lógica | Cero edición de archivos — solo invocación |

### Lo que NO se toca
- Cero ediciones de código (ni `Landing.tsx`, ni edge functions, ni templates, ni migraciones, ni cron).
- Cero inserts en la tabla de idempotencia.
- Cero cambios en `supabase/config.toml` o registry.

### Pasos de ejecución
1. Obtener pronóstico de Madrid via Open-Meteo (mismo flujo que el cron real) para el rango 30 abr → 3 may.
2. Invocar `send-transactional-email` con los parámetros descritos.
3. Verificar en `email_send_log` que el envío quedó como `pending` → `sent`.
4. Comprobar que la tabla `trip_pre_departure_reminders` **no** tiene fila para `(09b47dd6..., 8225afe6...)`.
5. Reportar: asunto generado (rotación aleatoria entre 4 variantes), si el bloque del tiempo se incluyó, y estado del envío.

### Tras la prueba
- El cron horario seguirá ejecutándose normalmente.
- Cuando el 28 abr 2026 (~48h antes del 30 abr) la función `check-trip-pre-departure` detecte el viaje en ventana, enviará el email definitivo a **todos los miembros aprobados (incluido Raúl)** porque no habrá registro previo en la tabla de idempotencia.

### Ficheros afectados
**Ninguno.** Es una invocación puntual de un edge function ya desplegado.

