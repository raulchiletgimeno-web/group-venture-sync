
-- Create trip messages table
CREATE TABLE public.trip_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'audio', 'image')),
  file_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Members can view messages" ON public.trip_messages
  FOR SELECT USING (is_trip_member(trip_id));

CREATE POLICY "Members can send messages" ON public.trip_messages
  FOR INSERT WITH CHECK (is_trip_member(trip_id) AND auth.uid() = user_id);

CREATE POLICY "Author can delete own messages" ON public.trip_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;
