
-- Create storage bucket for trip photos
INSERT INTO storage.buckets (id, name, public) VALUES ('trip-photos', 'trip-photos', true);

-- Storage policies: public read
CREATE POLICY "Public can view trip photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'trip-photos');

-- Storage policies: trip members can upload
CREATE POLICY "Trip members can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'trip-photos'
  AND auth.role() = 'authenticated'
  AND public.is_trip_member((storage.foldername(name))[1]::uuid)
);

-- Storage policies: author or trip creator can delete
CREATE POLICY "Author or creator can delete photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'trip-photos'
  AND auth.role() = 'authenticated'
  AND (
    auth.uid()::text = (storage.foldername(name))[2]
    OR public.is_trip_creator((storage.foldername(name))[1]::uuid)
  )
);

-- Create trip_photos table
CREATE TABLE public.trip_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_photos ENABLE ROW LEVEL SECURITY;

-- Members can view photos
CREATE POLICY "Members can view trip photos"
ON public.trip_photos FOR SELECT
USING (public.is_trip_member(trip_id));

-- Members can insert photos
CREATE POLICY "Members can insert trip photos"
ON public.trip_photos FOR INSERT
WITH CHECK (public.is_trip_member(trip_id) AND auth.uid() = user_id);

-- Author or creator can delete photos
CREATE POLICY "Author or creator can delete trip photos"
ON public.trip_photos FOR DELETE
USING (auth.uid() = user_id OR public.is_trip_creator(trip_id));
