/*
  # Fix movimentacao_tipo enum type

  1. Changes
    - Drop and recreate movimentacao_tipo enum with correct values
    - Update movimentacoes table to use new enum type
*/

-- Drop the existing enum and create it again with the correct values
DROP TYPE IF EXISTS movimentacao_tipo CASCADE;

CREATE TYPE movimentacao_tipo AS ENUM (
  'De Estoque para Quarentena',
  'De Quarentena para Área Técnica Print', 
  'De Quarentena para Área Técnica Mobile',
  'De Embalagem para Logística'
);

-- Create the movimentacoes table with the new enum type
CREATE TABLE IF NOT EXISTS movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_serie text NOT NULL,
  tipo movimentacao_tipo NOT NULL,
  numero_movimentacao text,
  numero_os text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "movimentacoes_all_operations" ON movimentacoes
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);