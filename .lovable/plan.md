## Diagnóstico — por qué el email se envió el día 11

El cron `check-trip-pre-departure-hourly` se ejecuta **cada hora en punto** (`0 * * * *`) y la edge function aceptaba cualquier viaje cuyo inicio estuviera entre **+60h y −24h** desde "ahora":

```ts
if (hoursAway < -24 || hoursAway > 60) continue
```

Además, el filtro SQL selecciona viajes con `start_date` entre hoy y hoy+3 días. Resultado: para un viaje que empieza el día 14 a las 00:00 UTC, el envío se dispara **60h antes** = día 11 a las 12:00 UTC. Eso es lo que ocurrió con "Rioja Bike Race".

La regla actual es una "ventana de catch-up" flexible, exactamente lo que no quieres.

## Regla nueva (fija e inamovible)

> El email previo se envía **exactamente 2 días naturales antes** del `start_date` del viaje, **a las 10:00 hora de Madrid (Europe/Madrid)**, una sola vez por usuario y por viaje.

Ejemplo: viaje el 14 → email el 12 a las 10:00 Madrid.

## Cambios (solo en el envío del email previo)

### 1. `supabase/functions/check-trip-pre-departure/index.ts`

Sustituir la ventana flexible por una comprobación estricta:

- Calcular `nowMadrid` usando `Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', ... })`.
- Calcular `targetDate = nowMadrid + 2 días` (formato `YYYY-MM-DD`).
- Filtro SQL: `start_date = targetDate` (igualdad exacta, ya no rango).
- Comprobación de hora: si `nowMadrid.hour !== 10`, salir sin hacer nada (salvo que venga `force_trip_id`).
- Eliminar el bloque `hoursAway < -24 || hoursAway > 60`.
- Mantener `force_trip_id` para catch-up manual (bypass de fecha y hora).
- Mantener la unique constraint en `trip_pre_departure_reminders` como salvaguarda anti-duplicados.

### 2. Cron `check-trip-pre-departure-hourly`

Pasar de `0 * * * *` (cada hora) a `0 8,9 * * *` (08:00 y 09:00 UTC), igual que ya hace `check-trip-post-departure`. Esto cubre las 10:00 de Madrid tanto en horario de verano (CEST = UTC+2 → 08:00 UTC) como de invierno (CET = UTC+1 → 09:00 UTC). La edge function decide cuál de las dos ejecuciones es la válida comprobando `nowMadrid.hour === 10`.

Renombrar a `check-trip-pre-departure-daily-10` por coherencia.

## Lo que NO se toca

- Plantilla del email (`trip-pre-departure.tsx`)
- Bloque de tiempo / geocoding (ya corregido)
- Frontend, otras edge functions, otros emails, RLS, base de datos
- Diseño y navegación

## Validación tras desplegar

1. Comprobar que el cron queda en `0 8,9 * * *`.
2. Para "Rioja Bike Race" (inicio día 14): ya tiene `trip_pre_departure_reminders` registrados → no se reenviará (la unique constraint lo bloquea). Confirmar consultando la tabla.
3. Para futuros viajes: el envío se producirá únicamente el día (start_date − 2) a las 10:00 Madrid.
