/*
  # Update ITs table with departamento field

  1. Changes
    - Add 'departamento' column to 'its' table to store department information
    - Make it nullable to maintain compatibility with existing data
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE its
ADD COLUMN IF NOT EXISTS departamento text;