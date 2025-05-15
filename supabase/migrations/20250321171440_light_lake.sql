/*
  # Fix RLS Policies for Unidades Table

  1. Changes
    - Drop existing policies for unidades table
    - Create new policy that allows all operations
    
  2. Security
    - Enable RLS on unidades table
    - Add single policy for all operations
    - Allow all operations without restrictions
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "unidades_read" ON unidades;
DROP POLICY IF EXISTS "unidades_insert" ON unidades;
DROP POLICY IF EXISTS "unidades_update" ON unidades;
DROP POLICY IF EXISTS "unidades_delete" ON unidades;

-- Enable RLS
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;

-- Create new policy that allows all operations
CREATE POLICY "unidades_all_operations" ON unidades
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);