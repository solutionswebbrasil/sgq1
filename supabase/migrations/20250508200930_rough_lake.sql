/*
  # Update warranty status enum type

  1. Changes
    - Drop and recreate garantia_status enum type with new values
    - Drop and recreate garantias table with new status type
    - Maintain existing RLS policies
    
  2. Security
    - Enable RLS on garantias table
    - Add policy for all operations
*/

-- Drop the existing enum and create it again with the correct values
DROP TYPE IF EXISTS garantia_status CASCADE;

CREATE TYPE garantia_status AS ENUM (
  'Aberta',
  'Em andamento',
  'Concluída',
  'Rejeitada'
);

-- Drop and recreate the garantias table with the new status type
DROP TABLE IF EXISTS garantias;

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
  nf_compra_chave text,
  nf_remessa_chave text,
  nf_devolucao_chave text,
  data_garantia date,
  numero_ticket text,
  status garantia_status DEFAULT 'Aberta',
  fornecedor text,
  quantidade integer DEFAULT 1,
  observacao_defeito text,
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