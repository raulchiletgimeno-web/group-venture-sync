
REVOKE SELECT ON public.profiles FROM authenticated, anon;
GRANT SELECT (id, name, avatar_url, language, created_at) ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO service_role;

REVOKE EXECUTE ON FUNCTION public.mark_alert_resolved(uuid, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM public, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.mark_alert_resolved(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
