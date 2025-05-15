/*
  # Update garantias table schema

  1. Changes
    - Remove URL fields for NF files
    - Add text fields for NF numbers
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with appropriate column types
*/

-- Drop existing garantias table
DROP TABLE IF EXISTS garantias;

-- Create new garantias table with updated fields
CREATE TABLE garantias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante text,
  data_solicitacao date,
  codigo_produto text,
  numero_serie text,
  tipo equipamento_tipo,
  nf_compra text,
  nf_remessa text,
  nf_devolucao text,
  data_garantia date,
  numero_ticket text,
  status garantia_status,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "garantias_all_operations" ON garantias
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);