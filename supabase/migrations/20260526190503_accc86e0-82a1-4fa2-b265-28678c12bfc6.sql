UPDATE storage.buckets SET public = false WHERE id = 'trip-photos';

DROP POLICY IF EXISTS "Public can view trip photos" ON storage.objects;

CREATE POLICY "Trip members can view trip photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'trip-photos'
  AND public.is_trip_member( (storage.foldername(name))[1]::uuid )
);