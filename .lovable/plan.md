## Goal

Make it impossible to save an expense (create or edit) in the Expenses section that is not assigned to at least one user in "Compartido entre". Nothing else in the app changes.

## Where the problem is

File: `src/pages/trips/Expenses.tsx`, function `handleSubmit` (line 234).

Today, line 236 silently returns when `selectedMembers.length === 0`:

```ts
if (!tripId || !paidBy || selectedMembers.length === 0) return;
```

→ Pressing "Guardar" with everyone unchecked does nothing visible: the modal stays open and the user gets no feedback. There is also no DB-level guard, so a future bug or another client could still insert an orphan expense.

## Fix — Frontend (clear, immediate, premium)

In `src/pages/trips/Expenses.tsx`:

1. Split the silent guard. Keep `!tripId || !paidBy` as a silent return, but handle empty splits explicitly with a clear error:
   ```ts
   if (selectedMembers.length === 0) {
     toast({
       title: t.error,
       description: t.expenseNeedsAtLeastOneMember,
       variant: "destructive",
     });
     return;
   }
   ```
2. Add inline visual feedback in the "Compartido entre" section of the form (around line 570–583):
   - Track a small local state `splitsError` (boolean), set to `true` when the user tries to submit with zero selected, cleared as soon as they tick at least one member.
   - When `splitsError` is true, render a subtle destructive helper text directly under the checkbox list using the same `t.expenseNeedsAtLeastOneMember` copy, and add a `border-destructive` ring around the list container so the user instantly sees where the problem is.
   - Reset `splitsError` whenever the dialog opens/closes or `selectedMembers` becomes non-empty.
3. Add the new translation key `expenseNeedsAtLeastOneMember` to `src/i18n/translations.ts` for all existing languages (es, en, fr, pt, it, zh, de — same set already used by `invalidAmount` / `sharedAmong`). Suggested copy:
   - es: "Debes asignar este gasto al menos a una persona."
   - en: "You must assign this expense to at least one person."
   - fr: "Vous devez attribuer cette dépense à au moins une personne."
   - pt: "Tens de atribuir esta despesa a pelo menos uma pessoa."
   - it: "Devi assegnare questa spesa ad almeno una persona."
   - zh: "请至少为该费用分配一位成员。"
   - de: "Du musst diese Ausgabe mindestens einer Person zuweisen."

No other UI, layout, copy, or component is touched.

## Fix — Backend (true safety net)

Add a DB trigger so an expense without splits cannot survive a transaction, no matter which client inserts it. Migration:

```sql
-- Reject any expense that has zero splits one second after creation.
-- We use a deferred/immediate check via AFTER INSERT on trip_expenses
-- combined with a safety check on splits deletion.
CREATE OR REPLACE FUNCTION public.ensure_expense_has_splits()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- After deleting splits (e.g. during edit), require that at least one
  -- split remains for the affected expense_id.
  IF (TG_OP = 'DELETE') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.trip_expense_splits
      WHERE expense_id = OLD.expense_id
    ) THEN
      -- Allow deletion only if the parent expense is also being removed
      IF EXISTS (SELECT 1 FROM public.trip_expenses WHERE id = OLD.expense_id) THEN
        RAISE EXCEPTION 'expense_requires_at_least_one_member'
          USING ERRCODE = '23514';
      END IF;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER trip_expense_splits_require_one
AFTER DELETE ON public.trip_expense_splits
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION public.ensure_expense_has_splits();
```

Notes:
- The trigger fires only on `DELETE` of splits and is `DEFERRABLE INITIALLY DEFERRED`, so the edit flow (which deletes all splits then re-inserts the new ones in the same transaction) stays valid as long as at least one new split is inserted before commit.
- Creation flow is already protected by the frontend; if a client ever tried to insert an expense with zero splits and committed, the regular delete-then-insert pattern is unaffected. This trigger specifically blocks the "edit and uncheck everyone" race at the DB level.
- In the frontend, if `error.code === '23514'` or message contains `expense_requires_at_least_one_member`, surface the same `t.expenseNeedsAtLeastOneMember` toast instead of a raw DB message.

## Files touched

- `src/pages/trips/Expenses.tsx` — only `handleSubmit`, the "Compartido entre" block, and a small `splitsError` state.
- `src/i18n/translations.ts` — add one new key in all 7 existing languages.
- New SQL migration adding the trigger above.

Nothing else in the app is modified. No design changes elsewhere, no other components, no other flows.

## Validation after implementation

1. Create expense, uncheck everyone, press "Guardar" → modal stays open, destructive toast appears with the new copy, the checkbox list shows a red ring + helper text. No row inserted in `trip_expenses` or `trip_expense_splits`.
2. Tick at least one member → red ring/helper disappears, "Guardar" works normally.
3. Edit existing expense, uncheck everyone, press "Guardar" → same blocked behavior; original splits remain intact in DB (transaction rolls back thanks to the deferred trigger).
4. Edit expense, swap selection to a different single member → saves correctly.
5. All other expense flows (create with members, delete expense, payments, balances) are unchanged.
