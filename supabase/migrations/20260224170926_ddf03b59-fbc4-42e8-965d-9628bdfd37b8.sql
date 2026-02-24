
-- Enable realtime for trip_members so pending users get notified
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_members;

-- Allow trip members to view profiles of other members in their trips
CREATE POLICY "Trip members can view co-member profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_members tm1
    JOIN public.trip_members tm2 ON tm1.trip_id = tm2.trip_id
    WHERE tm1.user_id = auth.uid()
    AND tm2.user_id = profiles.id
  )
);
