## Alcance
Ampliación mínima del sistema Finalizar viaje. Solo se toca:
- Una migración aditiva (endurecer policies de `trip_expenses` + nuevo RPC `reopen_trip_settlement`).
- `src/pages/trips/Expenses.tsx` (gating de acciones + botón/diálogo de reapertura + diálogo "Viaje cerrado").
- `src/i18n/translations.ts` (nuevas claves × 7 idiomas).

Nada más se modifica. Fórmulas de balances/deudas, reembolsos, historial, emails, chat y demás secciones quedan intactas.

## Backend — una sola migración

Policies actuales de `trip_expenses`:
- INSERT `Members can insert expenses` — `with_check: is_trip_member(trip_id) AND paid_by = auth.uid()`
- UPDATE `Creator or payer can update expenses` — `using: is_trip_creator(trip_id) OR paid_by = auth.uid()`
- DELETE `Creator or payer can delete expenses` — misma expresión
- SELECT sin cambios.

Se reemplazan las tres policies de escritura añadiendo `AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.settlement_released_at IS NULL)`. Las condiciones existentes se conservan íntegras — solo se AÑADE la comprobación de viaje abierto. SELECT no se toca.

Nuevo RPC:
```sql
create or replace function public.reopen_trip_settlement(p_trip_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_trip_creator(p_trip_id) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  update public.trips set settlement_released_at = null where id = p_trip_id;
end;
$$;

revoke all on function public.reopen_trip_settlement(uuid) from public, anon;
grant execute on function public.reopen_trip_settlement(uuid) to authenticated;
```

No toca `trip_expenses`, `trip_expense_splits`, `debt_payments` ni ninguna otra tabla. Idempotente. Los pagos existentes se conservan y siguen contabilizando saldos.

## Frontend — solo `src/pages/trips/Expenses.tsx`

Deriva `const isLocked = settlementReleasedAt !== null;`.

1. **Botón "Añadir gasto"**: permanece visible. `openCreate` comprueba `isLocked`; si está cerrado, no abre el `Dialog` de creación y en su lugar abre un `AlertDialog` "Viaje cerrado" (ver abajo).
2. **Editar/eliminar gasto**: los handlers actuales (`handleEdit`, `handleDelete`) comprueban `isLocked` y muestran el mismo `AlertDialog` "Viaje cerrado" sin ejecutar la acción. No se cambia ninguna lógica de cálculo ni de UI de la lista.
3. **AlertDialog "Viaje cerrado"** (shadcn ya usado): título `t.tripClosedTitle`, cuerpo `t.tripClosedBody`, botón único `t.understood`.
4. **Bloque "Quién debe a quién"** (viaje ya liberado): debajo de la lista de deudas, si `isCreator`, botón secundario `Volver a abrir viaje` con icono `Unlock`. Al pulsar abre `AlertDialog` con título `t.reopenTripConfirmTitle`, cuerpo `t.reopenTripConfirmBody`, acciones Cancelar / Volver a abrir viaje. Confirmar → `supabase.rpc('reopen_trip_settlement', { p_trip_id: tripId })` → refresca `settlementReleasedAt` → la UI vuelve al estado bloqueado sin recargar.
5. Miembros normales no ven el botón (mismo `isCreator` que ya se usa para Finalizar viaje).

No se cambian: cálculo de saldos, `debts`, totales, `payments`, reembolsos, historial, formulario, dialogs existentes ni el flujo actual de Finalizar viaje.

## i18n — 4 claves nuevas × 7 idiomas
`tripClosedTitle`, `tripClosedBody`, `understood`, `reopenTrip`, `reopenTripConfirmTitle`, `reopenTripConfirmBody`. (Reusar `cancel` existente.)

## Ciclo abrir → cerrar → reabrir → cerrar
- Como `reopen_trip_settlement` solo setea `settlement_released_at = NULL` y `release_trip_settlement` es idempotente (`COALESCE(settlement_released_at, now())`), el ciclo puede repetirse N veces.
- Pagos ya registrados persisten (no se borran ni se reenvían emails/mensajes — nada los toca).
- Al segundo cierre, `debts` se recalcula en cliente a partir de `expenses + splits + payments` como ya hace hoy, descontando pagos previos automáticamente.

## Validación
1. Miembro normal, viaje cerrado (locked): "Añadir gasto" abre modal Viaje cerrado; editar/eliminar igual; no ve deudas ni botón reabrir.
2. Creador, viaje cerrado: mismo bloqueo de gastos; ve Finalizar viaje.
3. Creador finaliza: aparecen deudas + botón "Volver a abrir viaje". Intento manual `insert`/`update`/`delete` en `trip_expenses` vía API → error RLS.
4. Creador reabre: deudas ocultas, pagos deshabilitados, gastos editables de nuevo, pagos históricos conservados y visibles como reembolsos.
5. Segundo Finalizar: deudas recalculadas restando pagos previos, sin duplicados ni reenvío de nada.

## Archivos tocados
- Migración SQL (3 policies replace + 1 RPC).
- `src/pages/trips/Expenses.tsx`.
- `src/i18n/translations.ts`.
