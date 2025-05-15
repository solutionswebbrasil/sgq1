/*
  # Fix RLS Policies for ITs Table

  1. Changes
    - Drop existing policies for the its table
    - Create new policies that correctly allow CRUD operations
    
  2. Security
    - Enable RLS on the its table
    - Add separate policies for SELECT, INSERT, UPDATE, and DELETE
    - Allow all authenticated users to read ITs
    - Allow all authenticated users to insert new ITs
    - Allow users to update only their own ITs
    - Allow only admin users to delete ITs
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
USING (uid() = created_by);

CREATE POLICY "its_delete"
ON its FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = uid()
  AND r.name = 'admin'
));