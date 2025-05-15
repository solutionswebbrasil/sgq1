/*
  # Fix RLS policy for ITs table

  1. Changes
    - Drop the existing INSERT policy for `its` table
    - Create a new INSERT policy that properly allows authenticated users to insert records
    - This addresses the 401 error when users try to create new IT records
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "its_insert" ON public.its;

-- Create a new policy that explicitly allows authenticated users to insert rows
CREATE POLICY "its_insert" 
ON public.its
FOR INSERT 
TO authenticated
WITH CHECK (true);