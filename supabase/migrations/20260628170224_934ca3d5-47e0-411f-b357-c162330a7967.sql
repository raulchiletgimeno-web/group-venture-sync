CREATE POLICY "Creator can view own trip"
ON public.trips
FOR SELECT
TO authenticated
USING (auth.uid() = created_by);