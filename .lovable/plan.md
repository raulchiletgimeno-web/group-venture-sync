# Bloquear comunicaciones económicas hasta liberar la liquidación

## Qué envía hoy comunicaciones económicas

Revisado todo el backend (edge functions, cron jobs, triggers) y el frontend:

- **`check-trip-debts`** (cron `check-trip-debts-hourly`, cada hora): es el **único** disparador de comunicaciones económicas automáticas. Selecciona viajes con `end_date <= hoy-24h`, calcula deudas, **publica un mensaje automático en el chat**, inserta en `debt_reminders` y **envía el email `debt-reminder`** al deudor. No comprueba `settlement_released_at`.
- **`payment-notification`** (email al registrar un pago): solo puede dispararse tras registrar un pago, y los pagos ya están bloqueados por RLS mientras `settlement_released_at IS NULL`. No requiere cambios.
- **`check-trip-pre-departure`** y **`check-trip-post-departure`** (feedback/valoración): revisados; no contienen contenido de deudas, saldos, pagos ni liquidación. No se tocan.
- **`notify-trip`**, chat normal, actividades, alertas internas: no económicos. No se tocan.

Conclusión: la única lógica que depende de `end_date` para comunicaciones económicas es `check-trip-debts`.

## Cambio propuesto (único archivo)

`supabase/functions/check-trip-debts/index.ts`:

1. Cambiar la selección de viajes: en lugar de filtrar por `end_date <= hoy-24h`, filtrar por
   `settlement_released_at IS NOT NULL` **y** `settlement_released_at <= now() - 24h`.
   Se deja de leer `end_date` como condición de envío.
2. Añadir una comprobación de seguridad por viaje justo antes de generar mensajes/emails: si `settlement_released_at` es NULL, se salta el viaje.
3. Dedupe/anti-duplicados: se mantiene la comprobación actual de `debt_reminders` en las últimas 24h, y se añade que solo cuentan/se envían recordatorios con `sent_at >= settlement_released_at` (así, tras un reabrir + volver a cerrar, la liquidación recalculada puede notificar de nuevo sin repetir dentro de la misma liquidación).

No se cambia el contenido, el diseño ni los textos de los emails ni de los mensajes de chat. Solo su condición de ejecución.

## Comportamiento resultante

1. **Viaje terminado por fecha, no finalizado en Gastos** (`settlement_released_at IS NULL`): el cron no selecciona el viaje → ni email de deuda, ni mensaje de chat, ni fila en `debt_reminders`.
2. **Creador pulsa Finalizar viaje**: `settlement_released_at` pasa a tener valor; las deudas y los pagos se muestran/habilitan como ahora, y las comunicaciones económicas comienzan a partir de las 24h siguientes a la liberación.
3. **Viaje reabierto** (`settlement_released_at` vuelve a NULL): el viaje deja de ser seleccionado; no se envía nada nuevo, no se borra ni se duplica nada de lo ya enviado.
4. **Segundo cierre**: los saldos se recalculan con la lógica actual (gastos + pagos ya registrados) y el filtro por `sent_at >= settlement_released_at` evita duplicar dentro de la nueva liquidación.

## Fuera de alcance

No se tocan: cálculos de gastos/saldos/deudas/reembolsos, RLS y policies, sistema de abrir/cerrar viaje, UI de Gastos, chat, fotos, actividades, GPX, alojamiento, transporte, ni ningún email no económico.
