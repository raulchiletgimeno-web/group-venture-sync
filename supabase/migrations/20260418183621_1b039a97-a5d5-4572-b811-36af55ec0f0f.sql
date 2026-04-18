ALTER TABLE public.trip_messages
ADD COLUMN reply_to_id uuid NULL REFERENCES public.trip_messages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trip_messages_reply_to_id ON public.trip_messages(reply_to_id);