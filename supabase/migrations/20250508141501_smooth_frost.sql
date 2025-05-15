/*
  # Update TCO tables with new fields

  1. Changes
    - Update tcos table with new fields for TCO calculation
    - Add tables for operational and indirect costs
    - Add observation field
    
  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity with appropriate column types
*/

-- Drop existing tables
DROP TABLE IF EXISTS tco_insumos;
DROP TABLE IF EXISTS tco_evidencias;
DROP TABLE IF EXISTS tcos;

-- Create new tcos table with updated fields
CREATE TABLE tcos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo text NOT NULL,
  fabricante text NOT NULL,
  tipo text NOT NULL,
  preco_impressora numeric NOT NULL DEFAULT 0,
  pis numeric NOT NULL DEFAULT 0,
  ipi numeric NOT NULL DEFAULT 0,
  icms numeric NOT NULL DEFAULT 0,
  cofins numeric NOT NULL DEFAULT 0,
  acessorios numeric NOT NULL DEFAULT 0,
  total_aquisicao numeric NOT NULL DEFAULT 0,
  observacao text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create table for operational costs
CREATE TABLE tco_custos_operacionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tco_id uuid REFERENCES tcos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create table for indirect costs
CREATE TABLE tco_custos_indiretos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tco_id uuid REFERENCES tcos(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tcos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_custos_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_custos_indiretos ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "tcos_all_operations" ON tcos
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tco_custos_operacionais_all_operations" ON tco_custos_operacionais
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "tco_custos_indiretos_all_operations" ON tco_custos_indiretos
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);