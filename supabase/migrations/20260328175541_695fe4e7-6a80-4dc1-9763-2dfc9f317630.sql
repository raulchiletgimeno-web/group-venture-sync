DROP POLICY "Author or creator can delete trip photos" ON public.trip_photos;

CREATE POLICY "Only author can delete own photos"
ON public.trip_photos
FOR DELETE
TO public
USING (auth.uid() = user_id);