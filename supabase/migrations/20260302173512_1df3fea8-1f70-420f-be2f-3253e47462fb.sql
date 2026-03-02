
CREATE OR REPLACE FUNCTION public.is_trip_creator(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
      AND role IN ('creator', 'co-creator')
  )
$$;
