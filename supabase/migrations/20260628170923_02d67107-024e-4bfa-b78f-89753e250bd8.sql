REVOKE INSERT, UPDATE, DELETE ON public.trip_pre_departure_reminders FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.trip_pre_departure_reminders FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.trip_post_departure_reminders FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, SELECT ON public.trip_post_departure_reminders FROM anon;