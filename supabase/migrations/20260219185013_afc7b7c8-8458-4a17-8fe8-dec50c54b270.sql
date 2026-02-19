
-- Add receipt photo column to trip_expenses
ALTER TABLE public.trip_expenses ADD COLUMN receipt_path TEXT DEFAULT NULL;
