
-- Replace INSERT/UPDATE/DELETE policies on trip_expenses to also require an open trip
DROP POLICY IF EXISTS "Members can insert expenses" ON public.trip_expenses;
CREATE POLICY "Members can insert expenses" ON public.trip_expenses
FOR INSERT TO authenticated
WITH CHECK (
  public.is_trip_member(trip_id)
  AND paid_by = auth.uid()
  AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.settlement_released_at IS NULL)
);

DROP POLICY IF EXISTS "Creator or payer can update expenses" ON public.trip_expenses;
CREATE POLICY "Creator or payer can update expenses" ON public.trip_expenses
FOR UPDATE TO authenticated
USING (
  (public.is_trip_creator(trip_id) OR paid_by = auth.uid())
  AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.settlement_released_at IS NULL)
)
WITH CHECK (
  (public.is_trip_creator(trip_id) OR paid_by = auth.uid())
  AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.settlement_released_at IS NULL)
);

DROP POLICY IF EXISTS "Creator or payer can delete expenses" ON public.trip_expenses;
CREATE POLICY "Creator or payer can delete expenses" ON public.trip_expenses
FOR DELETE TO authenticated
USING (
  (public.is_trip_creator(trip_id) OR paid_by = auth.uid())
  AND EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.settlement_released_at IS NULL)
);

-- RPC to reopen the trip settlement
CREATE OR REPLACE FUNCTION public.reopen_trip_settlement(p_trip_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_trip_creator(p_trip_id) THEN
    RAISE EXCEPTION 'not_authorized' USING ERRCODE = '42501';
  END IF;
  UPDATE public.trips SET settlement_released_at = NULL WHERE id = p_trip_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reopen_trip_settlement(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reopen_trip_settlement(uuid) TO authenticated;
