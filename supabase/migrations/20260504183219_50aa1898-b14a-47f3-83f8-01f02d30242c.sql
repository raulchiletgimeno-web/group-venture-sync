-- Deduplicate any existing rows just in case
DELETE FROM public.trip_expense_splits a
USING public.trip_expense_splits b
WHERE a.ctid < b.ctid
  AND a.expense_id = b.expense_id
  AND a.user_id = b.user_id;

ALTER TABLE public.trip_expense_splits
  ADD CONSTRAINT trip_expense_splits_expense_user_unique
  UNIQUE (expense_id, user_id);