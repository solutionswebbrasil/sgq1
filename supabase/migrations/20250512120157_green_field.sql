/*
  # Add valor_total field to garantias table

  1. Changes
    - Add valor_total column to garantias table
    - Update existing functions to include valor_total in calculations
*/

ALTER TABLE garantias
ADD COLUMN IF NOT EXISTS valor_total numeric DEFAULT 0;