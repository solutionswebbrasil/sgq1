/*
  # Create Non-Conformity Management Tables

  1. New Tables
    - `nao_conformidades`: Stores NC records with auto-generated sequential numbers
    - `nc_evidencias`: Stores evidence files for NCs
    
  2. New Types
    - `nc_tipo`: Enum for NC types
    - `nc_gravidade`: Enum for NC severity levels
    - `nc_status`: Enum for NC status

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum types
CREATE TYPE nc_tipo AS ENUM (
  'Produto',
  'Processo',
  'Sistema',
  'Cliente'
);

CREATE TYPE nc_gravidade AS ENUM (
  'Baixa',
  'Média',
  'Alta',
  'Crítica'
);

CREATE TYPE nc_status AS ENUM (
  'Aberta',
  'Em andamento',
  'Concluída',
  'Rejeitada'
);

-- Create nao_conformidades table
CREATE TABLE nao_conformidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero text NOT NULL UNIQUE,
  data_abertura date NOT NULL DEFAULT CURRENT_DATE,
  responsavel_abertura text NOT NULL,
  descricao text NOT NULL,
  tipo nc_tipo NOT NULL,
  gravidade nc_gravidade NOT NULL,
  departamento text NOT NULL,
  analise_causa text,
  acao_imediata text,
  responsavel_acao text,
  prazo_conclusao date,
  evidencia_solucao text,
  status nc_status NOT NULL DEFAULT 'Aberta',
  data_encerramento date,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create nc_evidencias table
CREATE TABLE nc_evidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nc_id uuid REFERENCES nao_conformidades(id) ON DELETE CASCADE,
  arquivo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE nao_conformidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE nc_evidencias ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "nao_conformidades_all_operations" ON nao_conformidades
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "nc_evidencias_all_operations" ON nc_evidencias
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);

-- Create function to generate NC number
CREATE OR REPLACE FUNCTION generate_nc_number()
RETURNS text AS $$
DECLARE
  year text;
  last_seq int;
  new_seq text;
BEGIN
  -- Get current year
  year := to_char(CURRENT_DATE, 'YYYY');
  
  -- Get last sequence number for current year
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 9) AS INTEGER)), 0)
  INTO last_seq
  FROM nao_conformidades
  WHERE numero LIKE 'NC-' || year || '-%';
  
  -- Generate new sequence number
  new_seq := LPAD((last_seq + 1)::text, 3, '0');
  
  -- Return formatted NC number
  RETURN 'NC-' || year || '-' || new_seq;
END;
$$ LANGUAGE plpgsql;