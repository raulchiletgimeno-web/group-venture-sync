
-- Table for activity tickets/passes (group or personal)
CREATE TABLE public.trip_schedule_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.trip_schedule(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  file_path TEXT NOT NULL,
  ticket_type TEXT NOT NULL DEFAULT 'personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_schedule_tickets ENABLE ROW LEVEL SECURITY;

-- Creator can view all tickets
CREATE POLICY "Creator can view schedule tickets"
  ON public.trip_schedule_tickets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trip_schedule s WHERE s.id = trip_schedule_tickets.schedule_id AND is_trip_creator(s.trip_id)
  ));

-- Creator can insert tickets
CREATE POLICY "Creator can insert schedule tickets"
  ON public.trip_schedule_tickets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM trip_schedule s WHERE s.id = trip_schedule_tickets.schedule_id AND is_trip_creator(s.trip_id)
  ));

-- Creator can update tickets
CREATE POLICY "Creator can update schedule tickets"
  ON public.trip_schedule_tickets FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM trip_schedule s WHERE s.id = trip_schedule_tickets.schedule_id AND is_trip_creator(s.trip_id)
  ));

-- Creator can delete tickets
CREATE POLICY "Creator can delete schedule tickets"
  ON public.trip_schedule_tickets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM trip_schedule s WHERE s.id = trip_schedule_tickets.schedule_id AND is_trip_creator(s.trip_id)
  ));

-- Members can view group tickets
CREATE POLICY "Members can view group schedule tickets"
  ON public.trip_schedule_tickets FOR SELECT
  USING (
    ticket_type = 'group' AND EXISTS (
      SELECT 1 FROM trip_schedule s WHERE s.id = trip_schedule_tickets.schedule_id AND is_trip_member(s.trip_id)
    )
  );

-- Members can view own personal tickets
CREATE POLICY "Members can view own personal schedule tickets"
  ON public.trip_schedule_tickets FOR SELECT
  USING (
    ticket_type = 'personal' AND user_id = auth.uid() AND EXISTS (
      SELECT 1 FROM trip_schedule s WHERE s.id = trip_schedule_tickets.schedule_id AND is_trip_member(s.trip_id)
    )
  );
