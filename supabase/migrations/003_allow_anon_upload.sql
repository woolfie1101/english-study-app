-- Allow anonymous upload for development (remove in production)
-- This allows uploads using the anon key

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update audio files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete audio files" ON storage.objects;

-- Allow anyone to upload (for development only)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'audio-files' );

-- Allow anyone to update (for development only)
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'audio-files' );

-- Allow anyone to delete (for development only)
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'audio-files' );
