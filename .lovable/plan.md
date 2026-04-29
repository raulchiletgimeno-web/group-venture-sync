
## Diagnóstico — qué ha fallado

El viaje **"Fin de semana en Madrid"** (start_date `2026-04-30`) tiene **10 miembros aprobados** con email válido, pero **nunca entró** en la lógica de envío. No hay ninguna fila en `trip_pre_departure_reminders` para este viaje.

**Causa raíz: ventana de 48h demasiado estrecha y mal alineada.**

En `supabase/functions/check-trip-pre-departure/index.ts`:

1. **Query SQL inicial**: filtra `start_date BETWEEN now+36h AND now+60h`. Como `start_date` es sólo fecha (sin hora), el viaje sólo "cae" dentro del rango durante unas horas concretas del día anterior (~D-2). Si el cron de esa hora concreta tiene cualquier hipo (deploy, rate-limit, error transitorio), el viaje desaparece para siempre.
2. **Filtro adicional en código**: `tripStart = new Date(start_date + 'T00:00:00Z')` y exige `36 <= hoursAway <= 60`. Asume que el viaje empieza a las 00:00 UTC, lo cual reduce aún más la ventana real. Hoy mismo (29-abr 08:49 UTC), para el viaje del 30-abr `hoursAway = 15.18h` → fuera de rango, ya no se envía nunca aunque el cron se ejecute.
3. **Sin "catch-up"**: una vez que `hoursAway < 36`, el viaje no se reintenta, aunque no exista fila en `trip_pre_departure_reminders`.

El cron (`check-trip-pre-departure-hourly`, cada hora) está **activo** y dispara correctamente. La función pre-renderiza vía `send-transactional-email` (que sí funciona — vemos envíos correctos para otros templates). El problema es **puramente de selección de viajes**.

---

## Acciones (en este orden, sólo tocando `check-trip-pre-departure`)

### 1. Envío inmediato manual a "Fin de semana en Madrid"

Invocar `check-trip-pre-departure` con un parámetro nuevo `force_trip_id` (o equivalente) que:
- Salte los filtros de ventana 36–60h.
- Procese el viaje indicado y envíe a todos los miembros aprobados que aún no estén en `trip_pre_departure_reminders`.
- Registre cada envío en esa tabla para evitar duplicados.

Resultado esperado: 10 emails enviados (uno por miembro aprobado), con previsión meteorológica para Madrid 30-abr → 03-may.

### 2. Corregir la lógica para futuros viajes

Reescribir la selección dentro de `check-trip-pre-departure/index.ts`:

- **Ampliar ventana**: seleccionar todos los viajes con `start_date` entre `today` y `today + 3 días`.
- **Eliminar el filtro estrecho `36 <= hoursAway <= 60`**. En su lugar, aplicar la regla de negocio:
  - "Enviar cuando falten ≤ 60h y ≥ 0h para el inicio del viaje" (D-2 hasta el propio día de salida).
- **Idempotencia robusta**: la tabla `trip_pre_departure_reminders` con UNIQUE `(trip_id, user_id)` ya garantiza un único email por usuario/viaje. Esto convierte la ventana en un "catch-up": si un cron falla, el siguiente lo recupera mientras el viaje siga en el rango.
- Mantener todo lo demás igual (template, weather fetch, registro en `email_send_log`).

### 3. Verificación

- Consultar `trip_pre_departure_reminders` y `email_send_log` para confirmar 10 envíos a "Fin de semana en Madrid".
- Confirmar que el cron horario sigue activo (no se toca su configuración).

---

## Detalles técnicos

**Archivo único modificado**: `supabase/functions/check-trip-pre-departure/index.ts`

Cambios concretos:
- Aceptar body opcional `{ force_trip_id?: string }`. Si viene, saltar filtros de ventana para ese trip.
- Sustituir la query por `start_date >= today AND start_date <= today + 3 days`.
- Reemplazar el filtro `if (hoursAway < 36 || hoursAway > 60) continue` por `if (hoursAway < 0 || hoursAway > 60) continue` (sólo en modo automático; en modo `force_trip_id` no se aplica).
- Mantener la inserción en `trip_pre_departure_reminders` como mecanismo anti-duplicado (UNIQUE constraint protege contra cualquier carrera).
- Después de editar: `deploy_edge_functions(["check-trip-pre-departure"])` y luego `curl_edge_functions` con `force_trip_id = 09b47dd6-4700-4a72-846e-743752b2181b` para enviar ya.

**No se toca**:
- El template `trip-pre-departure.tsx`.
- `send-transactional-email`.
- El cron job (sigue cada hora).
- Ninguna otra parte de la app.

---

## Validación final

Tras ejecutar, confirmaré:
1. Causa exacta del fallo (ventana mal calculada / filtro demasiado estrecho).
2. Cambios aplicados (un único archivo de edge function).
3. Confirmación de envío inmediato a los 10 miembros aprobados de "Fin de semana en Madrid".
4. Conteo real desde `email_send_log` y `trip_pre_departure_reminders`.
5. La automatización futura queda en modo "catch-up" robusto (ventana 0–60h, idempotente).
6. No se ha tocado ninguna otra parte de la app.
