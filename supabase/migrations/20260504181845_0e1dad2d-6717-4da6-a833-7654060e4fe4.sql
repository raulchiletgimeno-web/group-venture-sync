CREATE OR REPLACE FUNCTION public.prevent_duplicate_debt_payment()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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

DROP TRIGGER IF EXISTS debt_payments_prevent_duplicate ON public.debt_payments;

CREATE TRIGGER debt_payments_prevent_duplicate
BEFORE INSERT ON public.debt_payments
FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_debt_payment();