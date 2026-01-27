/*
  # Create project-downloads storage bucket

  1. New Storage Bucket
    - `project-downloads` bucket for storing downloadable project archives
  
  2. Security
    - Public bucket for read access
    - Admin-only write access (authenticated users can upload)
*/

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-downloads',
  'project-downloads',
  true,
  10485760,
  ARRAY['application/zip', 'application/gzip', 'application/x-gzip', 'application/x-tar', 'application/x-compressed-tar']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public can read project downloads'
  ) THEN
    CREATE POLICY "Public can read project downloads"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'project-downloads');
  END IF;
END $$;

-- Allow authenticated users to upload/update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload project downloads'
  ) THEN
    CREATE POLICY "Authenticated users can upload project downloads"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'project-downloads');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can update project downloads'
  ) THEN
    CREATE POLICY "Authenticated users can update project downloads"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'project-downloads')
      WITH CHECK (bucket_id = 'project-downloads');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can delete project downloads'
  ) THEN
    CREATE POLICY "Authenticated users can delete project downloads"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'project-downloads');
  END IF;
END $$;
