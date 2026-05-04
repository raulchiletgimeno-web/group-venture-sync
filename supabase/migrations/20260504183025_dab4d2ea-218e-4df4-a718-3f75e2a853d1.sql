CREATE OR REPLACE FUNCTION public.ensure_expense_has_splits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.trip_expense_splits
      WHERE expense_id = OLD.expense_id
    ) THEN
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

DROP TRIGGER IF EXISTS trip_expense_splits_require_one ON public.trip_expense_splits;

CREATE CONSTRAINT TRIGGER trip_expense_splits_require_one
AFTER DELETE ON public.trip_expense_splits
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION public.ensure_expense_has_splits();