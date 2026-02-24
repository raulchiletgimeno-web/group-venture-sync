
-- Table to store transport tickets per member
CREATE TABLE public.trip_transport_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transport_id UUID NOT NULL REFERENCES public.trip_transport(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(transport_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_transport_tickets ENABLE ROW LEVEL SECURITY;

-- Members can view their own tickets
CREATE POLICY "Members can view own tickets"
ON public.trip_transport_tickets
FOR SELECT
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.trip_transport tt
    WHERE tt.id = transport_id AND is_trip_member(tt.trip_id)
  )
);

-- Creator can view all tickets for their trips
CREATE POLICY "Creator can view all tickets"
ON public.trip_transport_tickets
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trip_transport tt
    WHERE tt.id = transport_id AND is_trip_creator(tt.trip_id)
  )
);

-- Creator can insert tickets
CREATE POLICY "Creator can insert tickets"
ON public.trip_transport_tickets
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.trip_transport tt
    WHERE tt.id = transport_id AND is_trip_creator(tt.trip_id)
  )
);

-- Creator can update tickets
CREATE POLICY "Creator can update tickets"
ON public.trip_transport_tickets
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.trip_transport tt
    WHERE tt.id = transport_id AND is_trip_creator(tt.trip_id)
  )
);

-- Creator can delete tickets
CREATE POLICY "Creator can delete tickets"
ON public.trip_transport_tickets
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.trip_transport tt
    WHERE tt.id = transport_id AND is_trip_creator(tt.trip_id)
  )
);
