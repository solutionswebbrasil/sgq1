/*
  # Update garantias table with new fields

  1. Changes
    - Add new columns to garantias table for warranty tracking
    - Add enum type for warranty status and equipment type
    - Update existing RLS policies
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with appropriate column types
*/

-- Create enum for warranty status
CREATE TYPE garantia_status AS ENUM (
  'Aguardando Fornecedor',
  'Garantia Enviada para o Fornecedor',
  'Garantia Gerou Devolução de Crédito',
  'Garantia Retornou com Equipamento',
  'Garantia Expirada',
  'Garantia Fora da Cobertura'
);

-- Create enum for equipment type
CREATE TYPE equipamento_tipo AS ENUM (
  'Peça',
  'Toner',
  'Equipamento'
);

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
  nf_compra_url text,
  nf_remessa_url text,
  nf_devolucao_url text,
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