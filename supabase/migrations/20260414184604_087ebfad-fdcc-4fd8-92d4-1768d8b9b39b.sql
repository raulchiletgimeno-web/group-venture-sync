CREATE POLICY "Only debtor can update payments"
ON public.debt_payments
FOR UPDATE
TO authenticated
USING (from_user = auth.uid())
WITH CHECK (from_user = auth.uid());