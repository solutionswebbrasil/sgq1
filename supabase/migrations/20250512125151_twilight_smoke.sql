/*
  # Add valor_total field to garantias table

  1. Changes
    - Add valor_total column to garantias table
    - Set default value to 0
    - Make it NOT NULL to ensure data integrity
*/

ALTER TABLE garantias
ALTER COLUMN valor_total SET NOT NULL,
ALTER COLUMN valor_total SET DEFAULT 0;