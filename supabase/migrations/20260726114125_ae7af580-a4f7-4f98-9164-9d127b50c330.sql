
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS settlement_released_at timestamptz;

CREATE OR REPLACE FUNCTION public.release_trip_settlement(p_trip_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_released timestamptz;
BEGIN
  IF NOT public.is_trip_creator(p_trip_id) THEN
    RAISE EXCEPTION 'not_authorized' USING ERRCODE = '42501';
  END IF;

  UPDATE public.trips
     SET settlement_released_at = COALESCE(settlement_released_at, now())
   WHERE id = p_trip_id
  RETURNING settlement_released_at INTO v_released;

  RETURN v_released;
END;
$$;

REVOKE ALL ON FUNCTION public.release_trip_settlement(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_trip_settlement(uuid) TO authenticated;

DROP POLICY IF EXISTS "Only debtor can insert payments" ON public.debt_payments;
CREATE POLICY "Only debtor can insert payments after release"
ON public.debt_payments
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_trip_member(trip_id)
  AND from_user = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.trips t
    WHERE t.id = trip_id
      AND t.settlement_released_at IS NOT NULL
  )
);
