/*
  # Update itens_auditoria table schema

  1. Changes
    - Add conformidade field to store conformity type
    - Add porcentagem field to store percentage value
    - Update existing fields
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop old columns
ALTER TABLE itens_auditoria 
DROP COLUMN IF EXISTS conforme;

-- Add new columns
ALTER TABLE itens_auditoria 
ADD COLUMN conformidade text NOT NULL DEFAULT 'conforme',
ADD COLUMN porcentagem numeric;