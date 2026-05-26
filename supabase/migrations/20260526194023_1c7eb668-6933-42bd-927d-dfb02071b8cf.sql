CREATE OR REPLACE FUNCTION public.get_unseen_counts(p_user_id uuid)
 RETURNS TABLE(trip_id uuid, unseen_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  WITH me AS (SELECT auth.uid() AS uid),
  user_trips AS (
    SELECT tm.trip_id
    FROM trip_members tm
    JOIN trips t ON t.id = tm.trip_id, me
    WHERE tm.user_id = me.uid
      AND tm.status = 'approved'
  ),
  section_counts AS (
    SELECT ut.trip_id,
      (SELECT count(*) FROM trip_messages m, me WHERE m.trip_id = ut.trip_id AND m.user_id != me.uid AND m.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = me.uid AND ls.section = 'chat'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_photos p, me WHERE p.trip_id = ut.trip_id AND p.user_id != me.uid AND p.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = me.uid AND ls.section = 'photos'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_expenses e, me WHERE e.trip_id = ut.trip_id AND e.paid_by != me.uid AND e.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = me.uid AND ls.section = 'expenses'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_accommodation a, me WHERE a.trip_id = ut.trip_id AND a.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = me.uid AND ls.section = 'accommodation'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_transport tr, me WHERE tr.trip_id = ut.trip_id AND tr.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = me.uid AND ls.section = 'transport'), '1970-01-01'::timestamptz)) +
      (SELECT count(*) FROM trip_schedule s, me WHERE s.trip_id = ut.trip_id AND s.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = ut.trip_id AND ls.user_id = me.uid AND ls.section = 'schedule'), '1970-01-01'::timestamptz))
      AS unseen_count
    FROM user_trips ut
  )
  SELECT sc.trip_id, sc.unseen_count
  FROM section_counts sc
  WHERE sc.unseen_count > 0;
$function$;

CREATE OR REPLACE FUNCTION public.get_unseen_section_counts(p_user_id uuid, p_trip_id uuid)
 RETURNS TABLE(section text, unseen_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 'chat'::text AS section, count(*) AS unseen_count
  FROM trip_messages m
  WHERE m.trip_id = p_trip_id AND m.user_id != auth.uid()
    AND m.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = auth.uid() AND ls.section = 'chat'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'photos'::text, count(*)
  FROM trip_photos p
  WHERE p.trip_id = p_trip_id AND p.user_id != auth.uid()
    AND p.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = auth.uid() AND ls.section = 'photos'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'expenses'::text, count(*)
  FROM trip_expenses e
  WHERE e.trip_id = p_trip_id AND e.paid_by != auth.uid()
    AND e.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = auth.uid() AND ls.section = 'expenses'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'accommodation'::text, count(*)
  FROM trip_accommodation a
  WHERE a.trip_id = p_trip_id
    AND a.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = auth.uid() AND ls.section = 'accommodation'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'transport'::text, count(*)
  FROM trip_transport tr
  WHERE tr.trip_id = p_trip_id
    AND tr.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = auth.uid() AND ls.section = 'transport'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'schedule'::text, count(*)
  FROM trip_schedule s
  WHERE s.trip_id = p_trip_id
    AND s.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = auth.uid() AND ls.section = 'schedule'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0;
$function$;