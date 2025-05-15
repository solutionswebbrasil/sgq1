/*
  # Update IT Management Tables

  1. Changes
    - Add visualizacoes column to it_versoes table
    - Update RLS policies for its and it_versoes tables
    
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add special policies for admin users
*/

-- Add visualizacoes column to it_versoes if it doesn't exist
ALTER TABLE it_versoes 
ADD COLUMN IF NOT EXISTS visualizacoes jsonb DEFAULT '[]';

-- Drop existing policies
DROP POLICY IF EXISTS "its_read" ON its;
DROP POLICY IF EXISTS "its_insert" ON its;
DROP POLICY IF EXISTS "its_delete" ON its;
DROP POLICY IF EXISTS "it_versoes_read" ON it_versoes;
DROP POLICY IF EXISTS "it_versoes_insert" ON it_versoes;
DROP POLICY IF EXISTS "it_versoes_delete" ON it_versoes;

-- Create new policies
CREATE POLICY "its_read" ON its
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "its_insert" ON its
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "its_delete" ON its
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));

CREATE POLICY "it_versoes_read" ON it_versoes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "it_versoes_insert" ON it_versoes
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "it_versoes_delete" ON it_versoes
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  ));