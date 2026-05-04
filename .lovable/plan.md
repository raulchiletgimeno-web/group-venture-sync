## Goal

Make it impossible to create two identical debt payments by double-clicking "Confirm payment" in the Expenses section. Nothing else in the app changes.

## Where the problem is

File: `src/pages/trips/Expenses.tsx`, function `handleConfirmPayment` (line ~376) and the confirm modal button (line ~659).

Today the flow does:
1. `setSubmittingPayment(true)`
2. Insert into `debt_payments`
3. Send notification email + post chat message (these can take 1–3s)
4. Only THEN `setPaymentOpen(false)`

The button is disabled during `submittingPayment`, but the modal stays open while the email + chat side-effects run, and there is no anti-duplicate guard at the DB level. If the user clicks once and the network is slow, they can perceive nothing is happening (and historically the disabled state didn't kick in fast enough on slow renders).

## Fix — Frontend (lock + close immediately)

In `src/pages/trips/Expenses.tsx`:

1. Add a `useRef` lock (`paymentSubmitLockRef`) so even fast double-clicks within the same render frame are rejected — `useState` updates are async and can't guard against this; a ref can.
2. At the very top of `handleConfirmPayment`:
   - If the ref is already `true` → return immediately.
   - Set ref `true` and `setSubmittingPayment(true)`.
3. Close the modal **immediately** after the `debt_payments` insert succeeds (not after email/chat). Email and chat stay as fire-and-forget.
4. Update the confirm button to:
   - Stay `disabled={submittingPayment}` (already there).
   - Show a spinner + `t.saving` ("Guardando...") label while submitting, replacing the static "Confirm payment" text.
5. Lock the dialog while submitting: pass an `onOpenChange` that ignores close requests (ESC / outside click) when `submittingPayment` is true, so the user can't reopen and re-trigger.
6. Release the ref in a `finally` block.

The same `useRef` pattern is also applied to `handleUpdatePayment` (edit payment modal) since it has the identical risk, but no other code is touched.

## Fix — Backend (true idempotency)

Add a partial unique index on `debt_payments` so the database itself rejects an identical payment created within a short window. Migration:

```sql
-- Reject an identical (trip, from, to, amount, method) payment
-- created within 60 seconds of another. This blocks accidental
-- double-submits without preventing legitimate repeat payments
-- made later (e.g. paying the same person again next week).
CREATE OR REPLACE FUNCTION public.prevent_duplicate_debt_payment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.debt_payments
    WHERE trip_id = NEW.trip_id
      AND from_user = NEW.from_user
      AND to_user = NEW.to_user
      AND amount = NEW.amount
      AND payment_method = NEW.payment_method
      AND created_at > now() - interval '60 seconds'
  ) THEN
    RAISE EXCEPTION 'duplicate_debt_payment'
      USING ERRCODE = '23505';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER debt_payments_prevent_duplicate
BEFORE INSERT ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_debt_payment();
```

In the frontend, if `error.code === '23505'` or message contains `duplicate_debt_payment`, treat it as success (the first click already saved): close modal silently and refresh — no error toast.

## Files touched

- `src/pages/trips/Expenses.tsx` — only `handleConfirmPayment`, the confirm Dialog/Button JSX, and `handleUpdatePayment` (same lock pattern).
- New SQL migration adding the trigger above.

Nothing else in the app is modified. No design changes, no other components, no other flows.

## Validation after implementation

1. Click "Confirm payment" twice rapidly → only one row in `debt_payments`, modal closes once.
2. Button shows spinner + "Guardando..." while in flight.
3. Modal cannot be closed by ESC / outside click while saving.
4. If a duplicate insert ever reaches the DB (race / two devices), the trigger blocks it and the UI swallows the error gracefully.
