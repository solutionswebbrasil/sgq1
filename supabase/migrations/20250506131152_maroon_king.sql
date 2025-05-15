/*
  # Create storage bucket for garantias

  1. New Storage Bucket
    - Creates a 'garantias' bucket for storing warranty-related files
    - Sets up public access policies for authenticated users
  
  2. Security
    - Enable policies for authenticated users to:
      - Upload files
      - Download files
      - Update files
      - Delete files
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('garantias', 'garantias', false);

-- Policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'garantias');

-- Policy to allow authenticated users to download files
CREATE POLICY "Allow authenticated users to download files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'garantias');

-- Policy to allow authenticated users to update their own files
CREATE POLICY "Allow authenticated users to update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'garantias' AND auth.uid() = owner);

-- Policy to allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'garantias' AND auth.uid() = owner);