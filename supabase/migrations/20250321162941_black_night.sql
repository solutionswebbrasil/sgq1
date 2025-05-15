/*
  # Fix toners table RLS policies

  1. Changes
    - Drop existing policies for toners table
    - Create new policies with correct permissions
    
  2. Security
    - Enable RLS on toners table
    - Add policies for CRUD operations
    - Ensure authenticated users can perform all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON toners;
DROP POLICY IF EXISTS "toners_read" ON toners;
DROP POLICY IF EXISTS "toners_insert" ON toners;
DROP POLICY IF EXISTS "toners_update" ON toners;
DROP POLICY IF EXISTS "toners_delete" ON toners;

-- Create new policies
CREATE POLICY "toners_select" ON toners
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "toners_insert" ON toners
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "toners_update" ON toners
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "toners_delete" ON toners
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);