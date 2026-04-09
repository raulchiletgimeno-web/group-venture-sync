
-- Enable extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create debt_reminders tracking table
CREATE TABLE public.debt_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  debtor_id uuid NOT NULL,
  creditor_id uuid NOT NULL,
  amount numeric NOT NULL,
  channel text NOT NULL DEFAULT 'chat',
  sent_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS (service role bypasses, no public policies needed)
ALTER TABLE public.debt_reminders ENABLE ROW LEVEL SECURITY;

-- Allow trip members to view reminders for their trips
CREATE POLICY "Members can view debt reminders"
ON public.debt_reminders
FOR SELECT
TO authenticated
USING (public.is_trip_member(trip_id));
