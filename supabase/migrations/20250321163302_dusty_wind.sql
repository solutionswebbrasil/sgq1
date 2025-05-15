/*
  # Fix toners table RLS policies

  1. Changes
    - Drop all existing policies for toners table
    - Create new simplified policy for all operations
    
  2. Security
    - Enable RLS on toners table
    - Add single policy for all operations
    - Allow all authenticated users to perform operations
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON toners;
DROP POLICY IF EXISTS "toners_select" ON toners;
DROP POLICY IF EXISTS "toners_insert" ON toners;
DROP POLICY IF EXISTS "toners_update" ON toners;
DROP POLICY IF EXISTS "toners_delete" ON toners;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON toners;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON toners;
DROP POLICY IF EXISTS "toners_all_operations" ON toners;

-- Create new simplified policy
CREATE POLICY "toners_all_operations" ON toners
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);