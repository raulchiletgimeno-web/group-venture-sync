-- Restrict email column visibility on profiles to service_role only.
-- The existing RLS policies remain unchanged; we use column-level GRANTs so
-- PostgREST refuses any client SELECT that includes the email column.
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, name, avatar_url, language, created_at) ON public.profiles TO authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
-- service_role keeps full access (GRANT ALL previously granted)