
DROP POLICY IF EXISTS "Members can insert expenses" ON public.trip_expenses;
CREATE POLICY "Members can insert expenses" ON public.trip_expenses
FOR INSERT TO authenticated
WITH CHECK (is_trip_member(trip_id) AND paid_by = auth.uid());

REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, authenticated, PUBLIC;
