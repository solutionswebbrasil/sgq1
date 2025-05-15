/*
  # Fix RLS Policies for ITs Table

  1. Changes
     - Drop existing `its_insert` policy and create a new one
     - Ensures authenticated users can insert into the 'its' table correctly
     - Keeps the created_by field properly set to the current user's ID

  2. Security
     - Maintains RLS security while fixing permission issues
     - Ensures only authenticated users can insert records
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS its_insert ON its;

-- Create new insert policy with explicit user ID assignment
CREATE POLICY its_insert ON its
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Ensure the auth.uid() gets stored in created_by
CREATE OR REPLACE FUNCTION set_created_by() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_by = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_its_created_by') THEN
        CREATE TRIGGER set_its_created_by
        BEFORE INSERT ON its
        FOR EACH ROW
        EXECUTE FUNCTION set_created_by();
    END IF;
END
$$;