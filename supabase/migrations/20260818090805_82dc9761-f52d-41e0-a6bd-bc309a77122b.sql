DROP POLICY IF EXISTS "station_photos_no_public_read" ON storage.objects;
CREATE POLICY "station_photos_no_public_read"
ON storage.objects
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (bucket_id <> 'station-photos');

DROP POLICY IF EXISTS "station_photos_no_public_insert" ON storage.objects;
CREATE POLICY "station_photos_no_public_insert"
ON storage.objects
AS RESTRICTIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id <> 'station-photos');

DROP POLICY IF EXISTS "station_photos_no_public_update" ON storage.objects;
CREATE POLICY "station_photos_no_public_update"
ON storage.objects
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (bucket_id <> 'station-photos')
WITH CHECK (bucket_id <> 'station-photos');

DROP POLICY IF EXISTS "station_photos_no_public_delete" ON storage.objects;
CREATE POLICY "station_photos_no_public_delete"
ON storage.objects
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (bucket_id <> 'station-photos');