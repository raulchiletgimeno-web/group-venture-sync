
CREATE OR REPLACE FUNCTION public.get_unseen_section_counts(p_user_id uuid, p_trip_id uuid)
 RETURNS TABLE(section text, unseen_count bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 'chat'::text AS section,
    count(*) AS unseen_count
  FROM trip_messages m
  WHERE m.trip_id = p_trip_id AND m.user_id != p_user_id
    AND m.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = p_user_id AND ls.section = 'chat'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'photos'::text, count(*)
  FROM trip_photos p
  WHERE p.trip_id = p_trip_id AND p.user_id != p_user_id
    AND p.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = p_user_id AND ls.section = 'photos'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'expenses'::text, count(*)
  FROM trip_expenses e
  WHERE e.trip_id = p_trip_id AND e.paid_by != p_user_id
    AND e.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = p_user_id AND ls.section = 'expenses'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'accommodation'::text, count(*)
  FROM trip_accommodation a
  WHERE a.trip_id = p_trip_id
    AND a.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = p_user_id AND ls.section = 'accommodation'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'transport'::text, count(*)
  FROM trip_transport tr
  WHERE tr.trip_id = p_trip_id
    AND tr.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = p_user_id AND ls.section = 'transport'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0

  UNION ALL

  SELECT 'schedule'::text, count(*)
  FROM trip_schedule s
  WHERE s.trip_id = p_trip_id
    AND s.created_at > COALESCE((SELECT ls.last_seen_at FROM trip_last_seen ls WHERE ls.trip_id = p_trip_id AND ls.user_id = p_user_id AND ls.section = 'schedule'), '1970-01-01'::timestamptz)
  HAVING count(*) > 0;
$function$;
