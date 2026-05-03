
-- Tabla anti-duplicados para emails post-viaje
CREATE TABLE public.trip_post_departure_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trip_post_departure_reminders_unique UNIQUE (trip_id, user_id)
);

ALTER TABLE public.trip_post_departure_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view post-departure reminders"
  ON public.trip_post_departure_reminders
  FOR SELECT
  TO authenticated
  USING (is_trip_member(trip_id));

-- Tokens de un solo uso para el formulario de feedback
CREATE TABLE public.trip_feedback_tokens (
  token TEXT NOT NULL PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT trip_feedback_tokens_trip_user_unique UNIQUE (trip_id, user_id)
);

ALTER TABLE public.trip_feedback_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages feedback tokens"
  ON public.trip_feedback_tokens
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Tabla de feedback recogido
CREATE TABLE public.trip_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  sections_used JSONB,
  most_useful_section TEXT,
  section_to_improve TEXT,
  missing_feature TEXT,
  what_to_change TEXT,
  would_use_again TEXT,
  free_comment TEXT,
  profile_first_name TEXT,
  profile_last_name TEXT,
  profile_age INTEGER,
  profile_residence TEXT,
  profile_travels_with TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages feedback"
  ON public.trip_feedback
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Validación de rating mediante trigger (no CHECK, para mantener consistencia con guidelines)
CREATE OR REPLACE FUNCTION public.validate_trip_feedback_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  IF NEW.profile_age IS NOT NULL AND (NEW.profile_age < 0 OR NEW.profile_age > 130) THEN
    RAISE EXCEPTION 'profile_age out of range';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_trip_feedback_rating
BEFORE INSERT OR UPDATE ON public.trip_feedback
FOR EACH ROW EXECUTE FUNCTION public.validate_trip_feedback_rating();
