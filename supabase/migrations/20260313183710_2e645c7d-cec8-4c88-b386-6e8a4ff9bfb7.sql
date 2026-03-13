-- Add section column to trip_last_seen
ALTER TABLE public.trip_last_seen ADD COLUMN section text NOT NULL DEFAULT 'dashboard';

-- Drop old unique constraint
ALTER TABLE public.trip_last_seen DROP CONSTRAINT IF EXISTS trip_last_seen_trip_id_user_id_key;

-- Add new unique constraint
ALTER TABLE public.trip_last_seen ADD CONSTRAINT trip_last_seen_trip_id_user_id_section_key UNIQUE (trip_id, user_id, section);

-- Rewrite get_unseen_counts to be per-section
CREATE OR REPLACE FUNCTION public.get_unseen_counts(p_user_id uuid)
 RETURNS TABLE(trip_id uuid, unseen_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH user_trips AS (
    SELECT tm.trip_id
    FROM trip_members tm
    JOIN trips t ON t.id = tm.trip_id
    WHERE tm.user_id = p_user_id
      AND tm.status = 'approved'
  ),
  section_counts AS (
    SELECT ut.trip_id,
      (SELECT count(*) FROM trip_messages m WHERE m.trip_id = ut.trip_id AND m.user_id != p_user_id AND m.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = p_user_id AND ls.section = 'chat'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_photos p WHERE p.trip_id = ut.trip_id AND p.user_id != p_user_id AND p.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = p_user_id AND ls.section = 'photos'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_expenses e WHERE e.trip_id = ut.trip_id AND e.paid_by != p_user_id AND e.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = p_user_id AND ls.section = 'expenses'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_accommodation a WHERE a.trip_id = ut.trip_id AND a.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = p_user_id AND ls.section = 'accommodation'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_transport tr WHERE tr.trip_id = ut.trip_id AND tr.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = p_user_id AND ls.section = 'transport'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_schedule s WHERE s.trip_id = ut.trip_id AND s.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = p_user_id AND ls.section = 'schedule'), '1970-01-01'::timestamptz))
      AS unseen_count
    FROM user_trips ut
  )
  SELECT sc.trip_id, sc.unseen_count
  FROM section_counts sc
  WHERE sc.unseen_count > 0;
$function$;