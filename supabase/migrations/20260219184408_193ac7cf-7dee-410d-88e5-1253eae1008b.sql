
-- Table for expenses
CREATE TABLE public.trip_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  paid_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for expense splits (who shares the expense)
CREATE TABLE public.trip_expense_splits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID NOT NULL REFERENCES public.trip_expenses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  UNIQUE(expense_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expense_splits ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_expenses
CREATE POLICY "Members can view expenses" ON public.trip_expenses
  FOR SELECT USING (is_trip_member(trip_id));

CREATE POLICY "Members can insert expenses" ON public.trip_expenses
  FOR INSERT WITH CHECK (is_trip_member(trip_id));

CREATE POLICY "Creator or payer can update expenses" ON public.trip_expenses
  FOR UPDATE USING (is_trip_creator(trip_id) OR paid_by = auth.uid());

CREATE POLICY "Creator or payer can delete expenses" ON public.trip_expenses
  FOR DELETE USING (is_trip_creator(trip_id) OR paid_by = auth.uid());

-- RLS policies for trip_expense_splits (access via parent expense's trip)
CREATE POLICY "Members can view splits" ON public.trip_expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trip_expenses e
      WHERE e.id = expense_id AND is_trip_member(e.trip_id)
    )
  );

CREATE POLICY "Members can insert splits" ON public.trip_expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trip_expenses e
      WHERE e.id = expense_id AND is_trip_member(e.trip_id)
    )
  );

CREATE POLICY "Members can delete splits" ON public.trip_expense_splits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.trip_expenses e
      WHERE e.id = expense_id AND (is_trip_creator(e.trip_id) OR e.paid_by = auth.uid())
    )
  );
