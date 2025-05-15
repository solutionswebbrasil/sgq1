/*
  # Fix RLS Policies for Retornados Table

  1. Changes
    - Drop existing policies for retornados table
    - Create new policy that allows all operations
    
  2. Security
    - Enable RLS on retornados table
    - Add single policy for all operations
    - Allow all operations without restrictions
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "retornados_read" ON retornados;
DROP POLICY IF EXISTS "retornados_insert" ON retornados;
DROP POLICY IF EXISTS "retornados_update" ON retornados;
DROP POLICY IF EXISTS "retornados_delete" ON retornados;

-- Enable RLS
ALTER TABLE retornados ENABLE ROW LEVEL SECURITY;

-- Create new policy that allows all operations
CREATE POLICY "retornados_all_operations" ON retornados
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);