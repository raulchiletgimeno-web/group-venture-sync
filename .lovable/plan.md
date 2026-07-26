## Alcance
Solo la pestaña **Saldos** de Gastos + una migración aditiva + un RPC seguro. Nada más se toca.

## Estado de finalización

Se añade un campo **nuevo y aditivo** a `trips`:

- `settlement_released_at timestamptz NULL`

No se reutiliza `trips.status` porque en YORMIT ese status se recalcula en cliente a partir de fechas (Dashboard, TripDashboard, TripCard) y cambiar su significado rompería la lógica de "upcoming/active/finished". El nuevo campo es independiente y no afecta a ninguna otra sección.

Viajes existentes: quedan con `NULL` = no liquidados. Sus gastos, splits, pagos y reembolsos históricos **no se tocan**. Los pagos ya registrados (p.ej. Tracks Monte Perdido) siguen siendo visibles como reembolsos en Gastos exactamente igual que ahora — la restricción de INSERT solo afecta a pagos nuevos.

## Identificación del creador/admin

Se reutiliza la función existente `public.is_trip_creator(p_trip_id uuid)` (ya cubre `creator` y `co-creator` según memoria de roles). Sin nuevo sistema.

## Backend (una sola migración)

1. `ALTER TABLE public.trips ADD COLUMN settlement_released_at timestamptz;`
2. RPC `public.release_trip_settlement(p_trip_id uuid)`:
   - `SECURITY DEFINER`, `search_path=public`.
   - Verifica `is_trip_creator(p_trip_id)`; si no, `RAISE EXCEPTION`.
   - Si `settlement_released_at IS NULL`, lo setea a `now()`. Si ya estaba, no-op (idempotente).
   - `GRANT EXECUTE` solo a `authenticated`.
3. Endurecer RLS en `debt_payments`:
   - Reemplazar policy `INSERT "Only debtor can insert payments"` por:
     ```
     with_check: is_trip_member(trip_id)
                 AND from_user = auth.uid()
                 AND EXISTS (SELECT 1 FROM public.trips t
                             WHERE t.id = trip_id
                               AND t.settlement_released_at IS NOT NULL)
     ```
   - SELECT/UPDATE/DELETE existentes se mantienen intactos para no romper el historial.

Esto garantiza que aunque un usuario manipule el frontend o llame a la API directamente, no puede insertar en `debt_payments` mientras el viaje no esté liberado.

## Frontend — solo `src/pages/trips/Expenses.tsx`

En la pestaña **Saldos**:

- Se mantiene sin cambios todo lo de arriba: "Mi gasto", "Total gastado", tarjetas de saldos positivos/negativos por integrante.
- Sección "Quién debe a quién":
  - Encabezado **siempre visible**.
  - Si `trip.settlement_released_at === null`:
    - Ocultar deudas, importes, botones de pago y el historial de pagos que se muestra debajo.
    - Mostrar un bloque premium (misma tipografía/tarjeta/espaciados del resto) con icono `Lock` y texto i18n: *"La liquidación estará disponible cuando el organizador finalice el viaje."*
    - Si el usuario es creador/co-creator (`useTripRole().isCreator`): botón **Finalizar viaje** dentro del bloque.
    - Al pulsar → `AlertDialog` de shadcn ya usado en el proyecto con:
      - Título: *"¿Finalizar el viaje y mostrar la liquidación definitiva?"*
      - Descripción: *"A partir de este momento, todos los miembros podrán ver quién debe a quién y registrar sus pagos."*
      - Acciones: **Cancelar** / **Finalizar viaje**.
    - Confirmar → `supabase.rpc('release_trip_settlement', { p_trip_id })` → refresca trip → la UI cambia sin recarga.
  - Si `settlement_released_at !== null`: comportamiento actual sin cambio alguno (lista de deudas, botón "Registrar pago", historial, reembolsos, prevención de duplicados, etc.).
- Fetch del trip: añadir `settlement_released_at` al `select` ya existente que carga metadatos del viaje en Expenses; realtime opcional no necesario (se actualiza tras el RPC).

Reembolsos en pestaña **Gastos**: sin cambios — siguen mostrando pagos históricos existentes.

## i18n

Nuevas claves en los 7 idiomas ya soportados (`translations.ts`):
- `settlementLockedTitle` — "La liquidación estará disponible cuando el organizador finalice el viaje."
- `finishTrip` — "Finalizar viaje"
- `finishTripConfirmTitle` — "¿Finalizar el viaje y mostrar la liquidación definitiva?"
- `finishTripConfirmBody` — "A partir de este momento, todos los miembros podrán ver quién debe a quién y registrar sus pagos."
- `cancel` — reusar si existe.

## Gastos posteriores al cierre

Fuera de alcance por petición explícita. No se bloquea crear/editar gastos tras liberar la liquidación. Nota: los saldos y la lista "quién debe a quién" ya se recalculan en cliente en tiempo real a partir de `expenses + splits + payments`, así que añadir un gasto tras el cierre simplemente ajustará las cifras mostradas — no rompe nada, pero puede reabrir deudas ya pagadas. Si quieres endurecerlo, se hace en un cambio posterior.

## Archivos tocados

- `src/pages/trips/Expenses.tsx` — solo pestaña Saldos.
- `src/i18n/translations.ts` — 4 claves nuevas × 7 idiomas.
- Migración SQL (columna + RPC + policy INSERT de `debt_payments`).

## Validación

1. Miembro normal, viaje abierto: ve saldos, no ve deudas ni botón finalizar; intento manual de `insert` en `debt_payments` → error RLS.
2. Creador, viaje abierto: ve saldos, ve botón **Finalizar viaje**, confirma → aparecen deudas y botones de pago.
3. Tras finalizar: pagos, historial, reembolsos en Gastos, prevención de duplicados y persistencia entre recargas/dispositivos siguen exactamente como hoy.
4. Viaje "Tracks Monte Perdido" y demás históricos: los pagos ya existentes siguen visibles; para registrar pagos nuevos hay que pulsar Finalizar viaje una vez.
