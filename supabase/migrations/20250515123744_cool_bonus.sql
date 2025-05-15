/*
  # Update its Table Schema to Allow Special Characters in Title

  1. Changes
    - Ensure the 'nome' column in the 'its' table accepts special characters
    - No constraints will be added that would restrict characters like /, -, *, (), [], _
    - Update RLS policy to ensure authenticated users can insert records with special characters
    
  2. Security
    - Maintain existing RLS policies
*/

-- No need to alter the column type as TEXT already allows all characters
-- Just make sure the policy allows insertions

-- Ensure the policy for inserting data exists and works properly
DO $$
BEGIN
  -- Only recreate the policy if it doesn't exist or if we need to modify it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'its' 
    AND policyname = 'its_insert'
  ) THEN
    CREATE POLICY "its_insert" 
    ON public.its
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);
  END IF;
END $$;