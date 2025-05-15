/*
  # Add storage policies for garantias bucket

  1. Changes
    - Create garantias storage bucket if it doesn't exist
    - Enable RLS on storage.objects table
    - Add policies for file operations if they don't exist
    
  2. Security
    - Allow authenticated users to upload files to garantias bucket
    - Allow authenticated users to download files from garantias bucket
    - Allow users to update and delete their own files
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('garantias', 'garantias', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow authenticated users to upload files'
  ) THEN
    CREATE POLICY "Allow authenticated users to upload files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'garantias');
  END IF;
END $$;

-- Policy to allow authenticated users to download files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow authenticated users to download files'
  ) THEN
    CREATE POLICY "Allow authenticated users to download files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'garantias');
  END IF;
END $$;

-- Policy to allow authenticated users to update their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow authenticated users to update their own files'
  ) THEN
    CREATE POLICY "Allow authenticated users to update their own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'garantias' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'garantias' AND owner = auth.uid());
  END IF;
END $$;

-- Policy to allow authenticated users to delete their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Allow authenticated users to delete their own files'
  ) THEN
    CREATE POLICY "Allow authenticated users to delete their own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'garantias' AND owner = auth.uid());
  END IF;
END $$;