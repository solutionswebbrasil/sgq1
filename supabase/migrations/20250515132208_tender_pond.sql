/*
  # Fix RLS policies for ITs table
  
  1. Changes
    - Drop existing policies
    - Add new policies with correct auth.uid() usage
    - Set permissions for read, insert, update, and delete operations
    
  2. Security
    - Allow all authenticated users to read and insert
    - Allow only the creator to update their own records
    - Allow only admin users to delete records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "its_read" ON its;
DROP POLICY IF EXISTS "its_insert" ON its;
DROP POLICY IF EXISTS "its_update" ON its;
DROP POLICY IF EXISTS "its_delete" ON its;

-- Enable RLS
ALTER TABLE its ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "its_read"
ON its FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "its_insert"
ON its FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "its_update"
ON its FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "its_delete"
ON its FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  AND r.name = 'admin'
));