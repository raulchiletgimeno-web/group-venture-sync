CREATE OR REPLACE FUNCTION public.ensure_expense_has_splits_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.trip_expense_splits WHERE expense_id = NEW.id) THEN
    RAISE EXCEPTION 'expense_requires_at_least_one_member' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trip_expenses_require_split ON public.trip_expenses;
CREATE CONSTRAINT TRIGGER trip_expenses_require_split
AFTER INSERT ON public.trip_expenses
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION public.ensure_expense_has_splits_after_insert();

CREATE OR REPLACE FUNCTION public.save_trip_expense(
  p_trip_id uuid,
  p_title text,
  p_amount numeric,
  p_paid_by uuid,
  p_member_ids uuid[],
  p_expense_id uuid DEFAULT NULL,
  p_receipt_path text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_member_ids IS NULL OR array_length(p_member_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'expense_requires_at_least_one_member' USING ERRCODE = '23514';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount' USING ERRCODE = '22023';
  END IF;

  IF p_expense_id IS NULL THEN
    INSERT INTO public.trip_expenses (trip_id, title, amount, paid_by, receipt_path)
    VALUES (p_trip_id, p_title, p_amount, p_paid_by, p_receipt_path)
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.trip_expenses
       SET title = p_title,
           amount = p_amount,
           paid_by = p_paid_by,
           receipt_path = COALESCE(p_receipt_path, receipt_path)
     WHERE id = p_expense_id
    RETURNING id INTO v_id;

    IF v_id IS NULL THEN
      RAISE EXCEPTION 'expense_not_found_or_not_allowed' USING ERRCODE = '42501';
    END IF;
  END IF;

  INSERT INTO public.trip_expense_splits (expense_id, user_id)
  SELECT v_id, u
  FROM unnest(p_member_ids) AS u
  ON CONFLICT (expense_id, user_id) DO NOTHING;

  DELETE FROM public.trip_expense_splits
   WHERE expense_id = v_id
     AND NOT (user_id = ANY (p_member_ids));

  IF NOT EXISTS (SELECT 1 FROM public.trip_expense_splits WHERE expense_id = v_id) THEN
    RAISE EXCEPTION 'expense_requires_at_least_one_member' USING ERRCODE = '23514';
  END IF;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.save_trip_expense(uuid, text, numeric, uuid, uuid[], uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_trip_expense(uuid, text, numeric, uuid, uuid[], uuid, text) TO authenticated;