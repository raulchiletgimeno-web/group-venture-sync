DROP POLICY IF EXISTS "Anyone authenticated can find trip by invite code" ON public.trips;

CREATE OR REPLACE FUNCTION public.find_trip_id_by_invite_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.trips
  WHERE invite_code = upper(trim(_code))
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.find_trip_id_by_invite_code(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.find_trip_id_by_invite_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.find_trip_id_by_invite_code(text) TO authenticated;