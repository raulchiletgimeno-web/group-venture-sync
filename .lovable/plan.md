

## Gestión de deudas pagadas en el apartado de Gastos

### Resumen

Crear una tabla `debt_payments` para registrar pagos de deudas, añadir un botón "Marcar como pagado" en cada línea de "Quién debe a quién", un modal de confirmación con selector de método de pago, y una sección de historial de pagos. Los saldos se recalcularán restando los pagos registrados.

### Cambios en base de datos

**Nueva tabla `debt_payments`:**
```sql
CREATE TABLE public.debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL,
  from_user uuid NOT NULL,
  to_user uuid NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'bizum',
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Miembros del viaje pueden ver los pagos
CREATE POLICY "Members can view payments"
  ON public.debt_payments FOR SELECT TO authenticated
  USING (is_trip_member(trip_id));

-- Miembros del viaje pueden registrar pagos
CREATE POLICY "Members can insert payments"
  ON public.debt_payments FOR INSERT TO authenticated
  WITH CHECK (is_trip_member(trip_id) AND (from_user = auth.uid() OR to_user = auth.uid()));

-- Solo el creador del pago puede eliminarlo
CREATE POLICY "Payment creator can delete"
  ON public.debt_payments FOR DELETE TO authenticated
  USING (from_user = auth.uid() OR to_user = auth.uid());
```

### Cambios en `Expenses.tsx`

1. **Fetch `debt_payments`** al cargar el componente (junto con expenses y members)

2. **Recálculo de saldos**: Después de calcular balances por gastos, restar los `debt_payments` del viaje:
   - `from_user` gana balance (ya pagó su deuda) → +amount
   - `to_user` pierde balance (ya cobró) → -amount
   - Los `debts` simplificados se recalculan con los saldos ajustados

3. **Botón "Marcar como pagado"** en cada línea de "Quién debe a quién":
   - Icono de check/círculo al final de cada fila
   - Solo visible para el deudor (`from`) o el acreedor (`to`)

4. **Modal de confirmación**:
   - Muestra: "{deudor} → {acreedor}: {importe} €"
   - Selector de método de pago: Bizum, Transferencia, Efectivo, Otro
   - Botón "Confirmar pago"

5. **Historial de pagos**: Nueva sección debajo de "Quién debe a quién" que muestra los pagos realizados con:
   - Quién pagó a quién
   - Importe
   - Método de pago
   - Fecha

### Traducciones (7 idiomas)

Nuevas claves: `markAsPaid`, `confirmPayment`, `paymentMethod`, `bizum`, `transfer`, `cash`, `other`, `paymentHistory`, `paymentRegistered`, `paidOn`, `noPayments`

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| Migración SQL | Nueva tabla `debt_payments` con RLS |
| `src/pages/trips/Expenses.tsx` | Fetch payments, recálculo saldos, botón marcar pagado, modal, historial |
| `src/i18n/translations.ts` | ~11 claves nuevas en 7 idiomas |

No se toca ninguna otra parte de la app.

