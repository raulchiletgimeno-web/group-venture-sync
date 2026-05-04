ALTER TABLE public.trip_messages
  DROP CONSTRAINT IF EXISTS trip_messages_type_check;

ALTER TABLE public.trip_messages
  ADD CONSTRAINT trip_messages_type_check
  CHECK (type = ANY (ARRAY['text'::text, 'audio'::text, 'image'::text, 'location'::text]));