
-- ============================================
-- TRIP TRANSPORT
-- ============================================
CREATE TABLE public.trip_transport (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'flight',
  departure_location TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  departure_datetime TIMESTAMPTZ NOT NULL,
  arrival_datetime TIMESTAMPTZ,
  booking_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_transport ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view transport"
  ON public.trip_transport FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id));

CREATE POLICY "Creator can insert transport"
  ON public.trip_transport FOR INSERT TO authenticated
  WITH CHECK (public.is_trip_creator(trip_id));

CREATE POLICY "Creator can update transport"
  ON public.trip_transport FOR UPDATE TO authenticated
  USING (public.is_trip_creator(trip_id));

CREATE POLICY "Creator can delete transport"
  ON public.trip_transport FOR DELETE TO authenticated
  USING (public.is_trip_creator(trip_id));

-- ============================================
-- TRIP ACCOMMODATION
-- ============================================
CREATE TABLE public.trip_accommodation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  booking_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_accommodation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view accommodation"
  ON public.trip_accommodation FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id));

CREATE POLICY "Creator can insert accommodation"
  ON public.trip_accommodation FOR INSERT TO authenticated
  WITH CHECK (public.is_trip_creator(trip_id));

CREATE POLICY "Creator can update accommodation"
  ON public.trip_accommodation FOR UPDATE TO authenticated
  USING (public.is_trip_creator(trip_id));

CREATE POLICY "Creator can delete accommodation"
  ON public.trip_accommodation FOR DELETE TO authenticated
  USING (public.is_trip_creator(trip_id));

-- ============================================
-- TRIP SCHEDULE
-- ============================================
CREATE TABLE public.trip_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view schedule"
  ON public.trip_schedule FOR SELECT TO authenticated
  USING (public.is_trip_member(trip_id));

CREATE POLICY "Creator can insert schedule"
  ON public.trip_schedule FOR INSERT TO authenticated
  WITH CHECK (public.is_trip_creator(trip_id));

CREATE POLICY "Creator can update schedule"
  ON public.trip_schedule FOR UPDATE TO authenticated
  USING (public.is_trip_creator(trip_id));

CREATE POLICY "Creator can delete schedule"
  ON public.trip_schedule FOR DELETE TO authenticated
  USING (public.is_trip_creator(trip_id));
