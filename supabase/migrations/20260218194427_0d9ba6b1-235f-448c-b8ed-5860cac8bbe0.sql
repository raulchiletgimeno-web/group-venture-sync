
-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIPS TABLE
-- ============================================
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'finished')),
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIP_MEMBERS TABLE
-- ============================================
CREATE TABLE public.trip_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- ============================================
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_trip_creator(p_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
      AND role = 'creator'
  )
$$;

-- ============================================
-- RLS POLICIES FOR TRIPS
-- ============================================
CREATE POLICY "Members can view trips"
  ON public.trips FOR SELECT
  USING (public.is_trip_member(id));

CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Members can update trips"
  ON public.trips FOR UPDATE
  USING (public.is_trip_member(id));

CREATE POLICY "Only creator can delete trips"
  ON public.trips FOR DELETE
  USING (public.is_trip_creator(id));

-- ============================================
-- RLS POLICIES FOR TRIP_MEMBERS
-- ============================================
CREATE POLICY "Members can view trip members"
  ON public.trip_members FOR SELECT
  USING (public.is_trip_member(trip_id));

CREATE POLICY "Creator or self can insert members"
  ON public.trip_members FOR INSERT
  WITH CHECK (public.is_trip_creator(trip_id) OR user_id = auth.uid());

CREATE POLICY "Only creator can remove members"
  ON public.trip_members FOR DELETE
  USING (public.is_trip_creator(trip_id));
