/*
  # Add RLS Policies for Toners Table

  1. Changes
    - Enable RLS on toners table
    - Add policies for all operations (SELECT, INSERT, UPDATE, DELETE)
    - Allow all authenticated users to perform operations
    
  2. Security
    - Enable RLS on toners table
    - Add single policy for all operations
    - Allow all operations without restrictions
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "toners_all_operations" ON toners;

-- Enable RLS
ALTER TABLE toners ENABLE ROW LEVEL SECURITY;

-- Create new policy that allows all operations
CREATE POLICY "toners_all_operations" ON toners
  FOR ALL
  USING (true)
  WITH CHECK (true);