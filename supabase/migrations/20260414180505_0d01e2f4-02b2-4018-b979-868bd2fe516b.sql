-- Tighten INSERT policy: only the debtor (from_user) can register a payment
DROP POLICY IF EXISTS "Members can insert payments" ON public.debt_payments;
CREATE POLICY "Only debtor can insert payments"
ON public.debt_payments
FOR INSERT
TO authenticated
WITH CHECK (is_trip_member(trip_id) AND from_user = auth.uid());