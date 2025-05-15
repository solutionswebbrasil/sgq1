/*
  # Add new fields to garantias table

  1. Changes
    - Add fornecedor field for supplier name
    - Add quantidade field for item quantity
    - Add observacao_defeito field for defect description
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with appropriate column types
*/

ALTER TABLE garantias
ADD COLUMN IF NOT EXISTS fornecedor text,
ADD COLUMN IF NOT EXISTS quantidade integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS observacao_defeito text;