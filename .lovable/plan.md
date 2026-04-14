

## Añadir edición de pagos en el historial

### Resumen

Permitir que el usuario que realizó el pago (deudor / `from_user`) pueda editar el método de pago y el importe desde el historial de pagos. Se añade un botón de edición junto al de "Ver detalle" y un dialog de edición con los campos editables.

### Cambios

#### 1. Migración SQL — Permitir UPDATE en `debt_payments`

Crear política RLS para UPDATE que solo permita al deudor editar sus propios pagos:

```sql
CREATE POLICY "Only debtor can update payments"
ON public.debt_payments
FOR UPDATE
TO authenticated
USING (from_user = auth.uid())
WITH CHECK (from_user = auth.uid());
```

#### 2. `src/pages/trips/Expenses.tsx`

- Añadir estado para el dialog de edición (`editPayment`, `editMethod`, `editAmount`, `submittingEdit`)
- Añadir función `handleUpdatePayment` que hace `supabase.from("debt_payments").update(...)` con el nuevo método y/o importe
- En el historial de pagos, junto al botón `Eye` (ver detalle), añadir un botón `Pencil` (editar) **solo si** `p.from_user === user?.id`
- Dialog de edición con:
  - RadioGroup para método de pago (Bizum, Transferencia, Efectivo, Otro)
  - Input numérico para el importe
  - Botón "Guardar" y "Cancelar"

#### 3. `src/i18n/translations.ts`

Nuevas claves en 7 idiomas: `editPayment`, `savePayment`, `editPaymentAmount`

| Idioma | `editPayment` | `savePayment` |
|--------|--------------|---------------|
| es | Editar pago | Guardar |
| en | Edit payment | Save |
| fr | Modifier paiement | Enregistrer |
| pt | Editar pagamento | Guardar |
| it | Modifica pagamento | Salva |
| zh | 编辑付款 | 保存 |
| de | Zahlung bearbeiten | Speichern |

### Ficheros afectados

| Fichero | Cambio |
|---------|--------|
| Migración SQL | Política UPDATE para `debt_payments` (solo `from_user`) |
| `src/pages/trips/Expenses.tsx` | Estado de edición, dialog, botón Pencil en historial |
| `src/i18n/translations.ts` | 2-3 claves nuevas en 7 idiomas |

No se toca ninguna otra parte de la app.

