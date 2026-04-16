

## Corrección: recordatorios de deuda ignoran pagos registrados

### Causa raíz

La función `check-trip-debts` calcula las deudas usando solo `trip_expenses` + `trip_expense_splits`, pero **nunca consulta la tabla `debt_payments`**. La página de Gastos sí resta los pagos del balance, pero la edge function no — por eso sigue enviando recordatorios para deudas que ya han sido saldadas.

### Cambio

**Fichero**: `supabase/functions/check-trip-debts/index.ts`

1. Tras obtener los gastos y splits, **consultar `debt_payments`** del viaje
2. En `calculateDebts`, recibir los pagos como parámetro adicional y restarlos de los balances antes de simplificar las deudas (exactamente como hace el cliente en `Expenses.tsx`)
3. Así, si los pagos compensan la deuda, `calculateDebts` devuelve un array vacío y no se envía nada

Lógica concreta:
- Fetch: `SELECT from_user, to_user, amount FROM debt_payments WHERE trip_id = ?`
- En el balance: `from_user` suma (pagó su deuda) y `to_user` resta (recibió el pago)
- El resto de la función no cambia

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| `supabase/functions/check-trip-debts/index.ts` | Añadir query de `debt_payments` y restarlos del cálculo de balances |

No se toca ningún otro fichero, pantalla ni funcionalidad. Solo se despliega la edge function corregida.

