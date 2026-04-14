
CREATE TABLE public.debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  from_user uuid NOT NULL REFERENCES public.profiles(id),
  to_user uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric NOT NULL,
  payment_method text NOT NULL DEFAULT 'bizum',
  paid_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view payments"
  ON public.debt_payments FOR SELECT TO authenticated
  USING (is_trip_member(trip_id));

CREATE POLICY "Members can insert payments"
  ON public.debt_payments FOR INSERT TO authenticated
  WITH CHECK (is_trip_member(trip_id) AND (from_user = auth.uid() OR to_user = auth.uid()));

CREATE POLICY "Payment parties can delete"
  ON public.debt_payments FOR DELETE TO authenticated
  USING (from_user = auth.uid() OR to_user = auth.uid());
