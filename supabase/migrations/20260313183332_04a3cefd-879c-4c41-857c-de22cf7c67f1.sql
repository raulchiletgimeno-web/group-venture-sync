
CREATE TABLE public.trip_last_seen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (trip_id, user_id)
);

ALTER TABLE public.trip_last_seen ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own last_seen" ON public.trip_last_seen
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own last_seen" ON public.trip_last_seen
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own last_seen" ON public.trip_last_seen
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_unseen_counts(p_user_id uuid)
RETURNS TABLE(trip_id uuid, unseen_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH user_trips AS (
    SELECT tm.trip_id
    FROM trip_members tm
    JOIN trips t ON t.id = tm.trip_id
    WHERE tm.user_id = p_user_id
      AND tm.status = 'approved'
  ),
  last_seen AS (
    SELECT ls.trip_id, ls.last_seen_at
    FROM trip_last_seen ls
    WHERE ls.user_id = p_user_id
  ),
  counts AS (
    SELECT ut.trip_id,
      (
        (SELECT count(*) FROM trip_messages m WHERE m.trip_id = ut.trip_id AND m.user_id != p_user_id AND m.created_at > COALESCE((SELECT ls.last_seen_at FROM last_seen ls WHERE ls.trip_id = ut.trip_id), '1970-01-01'::timestamptz)) +
        (SELECT count(*) FROM trip_photos p WHERE p.trip_id = ut.trip_id AND p.user_id != p_user_id AND p.created_at > COALESCE((SELECT ls.last_seen_at FROM last_seen ls WHERE ls.trip_id = ut.trip_id), '1970-01-01'::timestamptz)) +
        (SELECT count(*) FROM trip_expenses e WHERE e.trip_id = ut.trip_id AND e.paid_by != p_user_id AND e.created_at > COALESCE((SELECT ls.last_seen_at FROM last_seen ls WHERE ls.trip_id = ut.trip_id), '1970-01-01'::timestamptz)) +
        (SELECT count(*) FROM trip_accommodation a WHERE a.trip_id = ut.trip_id AND a.created_at > COALESCE((SELECT ls.last_seen_at FROM last_seen ls WHERE ls.trip_id = ut.trip_id), '1970-01-01'::timestamptz)) +
        (SELECT count(*) FROM trip_transport tr WHERE tr.trip_id = ut.trip_id AND tr.created_at > COALESCE((SELECT ls.last_seen_at FROM last_seen ls WHERE ls.trip_id = ut.trip_id), '1970-01-01'::timestamptz)) +
        (SELECT count(*) FROM trip_schedule s WHERE s.trip_id = ut.trip_id AND s.created_at > COALESCE((SELECT ls.last_seen_at FROM last_seen ls WHERE ls.trip_id = ut.trip_id), '1970-01-01'::timestamptz))
      ) AS unseen_count
    FROM user_trips ut
  )
  SELECT c.trip_id, c.unseen_count
  FROM counts c
  WHERE c.unseen_count > 0;
$$;
