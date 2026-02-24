
-- Add status column to trip_members
ALTER TABLE public.trip_members 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved'));

-- Mark ALL existing members as approved
UPDATE public.trip_members SET status = 'approved';

-- Add UPDATE policy for creator to approve/reject members
CREATE POLICY "Creator can update members"
ON public.trip_members
FOR UPDATE
USING (is_trip_creator(trip_id))
WITH CHECK (is_trip_creator(trip_id));

-- Update is_trip_member function to only consider approved members
CREATE OR REPLACE FUNCTION public.is_trip_member(p_trip_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.trip_members
    WHERE trip_id = p_trip_id
      AND user_id = auth.uid()
      AND status = 'approved'
  )
$$;

-- Allow pending members to view their own membership (to check status)
-- We need a separate SELECT policy for pending users to see their own row
CREATE POLICY "Users can view own pending membership"
ON public.trip_members
FOR SELECT
USING (user_id = auth.uid());
