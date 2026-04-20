CREATE TABLE public.trip_pre_departure_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_trip_pre_departure_reminders_trip ON public.trip_pre_departure_reminders(trip_id);

ALTER TABLE public.trip_pre_departure_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view pre-departure reminders"
ON public.trip_pre_departure_reminders
FOR SELECT
TO authenticated
USING (public.is_trip_member(trip_id));