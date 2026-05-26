
CREATE TABLE public.internal_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('critical','warning','info')),
  source text NOT NULL,
  event_key text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  impact text,
  recommended_action text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurrences integer NOT NULL DEFAULT 1,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  resolved_at timestamptz,
  resolution_notes text,
  notified_immediately_at timestamptz,
  included_in_digest_at timestamptz
);

GRANT ALL ON public.internal_alerts TO service_role;

ALTER TABLE public.internal_alerts ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated → blocked by default. Only service_role (bypasses RLS) accesses.

CREATE INDEX idx_internal_alerts_event_key ON public.internal_alerts(event_key);
CREATE INDEX idx_internal_alerts_status ON public.internal_alerts(status);
CREATE INDEX idx_internal_alerts_severity ON public.internal_alerts(severity);
CREATE INDEX idx_internal_alerts_created_at ON public.internal_alerts(created_at DESC);

CREATE OR REPLACE FUNCTION public.mark_alert_resolved(p_alert_id uuid, p_notes text DEFAULT NULL)
RETURNS public.internal_alerts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.internal_alerts;
BEGIN
  UPDATE public.internal_alerts
  SET status = 'resolved',
      resolved_at = now(),
      resolution_notes = p_notes,
      updated_at = now()
  WHERE id = p_alert_id AND status = 'open'
  RETURNING * INTO rec;
  RETURN rec;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_alert_resolved(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_alert_resolved(uuid, text) TO service_role;
