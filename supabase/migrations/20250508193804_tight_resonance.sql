/*
  # Add NF-e key fields to garantias table

  1. Changes
    - Add fields for NF-e access keys
    - Maintain existing fields and data
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE garantias
ADD COLUMN IF NOT EXISTS nf_compra_chave text,
ADD COLUMN IF NOT EXISTS nf_remessa_chave text,
ADD COLUMN IF NOT EXISTS nf_devolucao_chave text;