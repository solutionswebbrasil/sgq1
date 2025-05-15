/*
  # Update RLS policies for toners table

  1. Changes
    - Drop existing policies
    - Create new simplified policy that allows all operations
    - Ensure public access for all operations
    
  2. Security
    - Enable RLS on toners table
    - Add single policy for all operations
    - Allow all users to perform all operations
*/

-- Drop any existing policies
DROP POLICY IF EXISTS "toners_all_operations" ON toners;

-- Enable RLS
ALTER TABLE toners ENABLE ROW LEVEL SECURITY;

-- Create new policy that allows all operations
CREATE POLICY "toners_all_operations" ON toners
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);