
-- Make notes bucket private and restrict SELECT to authenticated users
UPDATE storage.buckets SET public = false WHERE id = 'notes';

DROP POLICY IF EXISTS "Notes bucket public read" ON storage.objects;

CREATE POLICY "Authenticated read notes"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'notes');
