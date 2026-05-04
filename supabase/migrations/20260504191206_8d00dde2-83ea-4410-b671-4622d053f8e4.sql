-- Permitir el tipo 'poll' en mensajes
ALTER TABLE public.trip_messages
  DROP CONSTRAINT IF EXISTS trip_messages_type_check;
ALTER TABLE public.trip_messages
  ADD CONSTRAINT trip_messages_type_check
  CHECK (type = ANY (ARRAY['text','audio','image','location','poll']));

-- Tabla de encuestas
CREATE TABLE public.trip_polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL UNIQUE REFERENCES public.trip_messages(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL,
  created_by uuid NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view polls" ON public.trip_polls
  FOR SELECT TO authenticated USING (is_trip_member(trip_id));
CREATE POLICY "Members create polls" ON public.trip_polls
  FOR INSERT TO authenticated WITH CHECK (is_trip_member(trip_id) AND created_by = auth.uid());
CREATE POLICY "Author deletes polls" ON public.trip_polls
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE INDEX idx_trip_polls_message_id ON public.trip_polls(message_id);
CREATE INDEX idx_trip_polls_trip_id ON public.trip_polls(trip_id);

-- Tabla de votos
CREATE TABLE public.trip_poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.trip_polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  option_id text NOT NULL,
  voted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);
ALTER TABLE public.trip_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view votes" ON public.trip_poll_votes
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.trip_polls p WHERE p.id = poll_id AND is_trip_member(p.trip_id))
  );
CREATE POLICY "Members vote" ON public.trip_poll_votes
  FOR INSERT TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.trip_polls p WHERE p.id = poll_id AND is_trip_member(p.trip_id))
  );
CREATE POLICY "Members change own vote" ON public.trip_poll_votes
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members remove own vote" ON public.trip_poll_votes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX idx_trip_poll_votes_poll_id ON public.trip_poll_votes(poll_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_poll_votes;