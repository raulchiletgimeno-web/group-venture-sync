-- 1) Email queue helpers: service_role only
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb)               FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb)   FROM PUBLIC, anon, authenticated;

-- 2) Trigger function: not callable via API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated, service_role;

-- 3) Membership/unseen helpers: authenticated + service_role only
REVOKE EXECUTE ON FUNCTION public.is_trip_member(uuid)                  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_trip_creator(uuid)                 FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_unseen_counts(uuid)               FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_unseen_section_counts(uuid, uuid) FROM PUBLIC, anon;