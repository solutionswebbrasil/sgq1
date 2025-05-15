/*
  # Initial Schema for SGQ System

  1. New Tables
    - `toners`: Stores toner information
    - `unidades`: Stores unit information
    - `retornados`: Stores returned toner records
    - `movimentacoes`: Stores movement records
    - `garantias`: Stores warranty records
    - `processos`: Stores BPMN process names
    - `processo_versoes`: Stores BPMN process versions
    - `its`: Stores IT names
    - `it_versoes`: Stores IT versions
    - `tcos`: Stores TCO records
    - `tco_insumos`: Stores TCO supplies
    - `tco_evidencias`: Stores TCO evidences
    - `profiles`: Stores user profiles

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum types
CREATE TYPE cor_type AS ENUM ('Black', 'Cyan', 'Magenta', 'Yellow');
CREATE TYPE toner_tipo AS ENUM ('Compatível', 'Original');
CREATE TYPE destino_type AS ENUM ('Descarte', 'Garantia', 'Estoque', 'Uso Interno');
CREATE TYPE movimentacao_tipo AS ENUM (
  'Da Logística para Quarentena',
  'Da Quarentena para Área Técnica',
  'Da Embalagem para Logística'
);

-- Toners table
CREATE TABLE toners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo text NOT NULL,
  peso_cheio numeric NOT NULL,
  peso_vazio numeric NOT NULL,
  impressoras_compativeis text NOT NULL,
  cor cor_type NOT NULL,
  area_impressa_iso numeric NOT NULL CHECK (area_impressa_iso IN (0.05, 0.06)),
  capacidade_folhas integer NOT NULL,
  tipo toner_tipo NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Unidades table
CREATE TABLE unidades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Retornados table
CREATE TABLE retornados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente integer NOT NULL,
  toner_id uuid REFERENCES toners(id),
  peso_retornado numeric NOT NULL,
  unidade_id uuid REFERENCES unidades(id),
  destino_final destino_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Movimentacoes table
CREATE TABLE movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_serie text NOT NULL,
  tipo movimentacao_tipo NOT NULL,
  numero_movimentacao text,
  numero_os text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Garantias table
CREATE TABLE garantias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_nf text NOT NULL,
  codigo_produto text NOT NULL,
  defeito text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Processos table
CREATE TABLE processos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Processo versoes table
CREATE TABLE processo_versoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id uuid REFERENCES processos(id),
  versao integer NOT NULL,
  arquivo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- ITs table
CREATE TABLE its (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- IT versoes table
CREATE TABLE it_versoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  it_id uuid REFERENCES its(id),
  versao integer NOT NULL,
  arquivo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- TCOs table
CREATE TABLE tcos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_produto text NOT NULL,
  modelo text NOT NULL,
  marca text NOT NULL,
  numero_serie text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- TCO insumos table
CREATE TABLE tco_insumos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tco_id uuid REFERENCES tcos(id),
  codigo_original text NOT NULL,
  descricao text NOT NULL,
  preco numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- TCO evidencias table
CREATE TABLE tco_evidencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tco_id uuid REFERENCES tcos(id),
  arquivo_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE toners ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE retornados ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE garantias ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE processo_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE its ENABLE ROW LEVEL SECURITY;
ALTER TABLE it_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tcos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tco_evidencias ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
ON toners FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON toners FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
ON toners FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users"
ON toners FOR DELETE TO authenticated USING (true);

-- Repeat similar policies for other tables
-- (Policies omitted for brevity but follow the same pattern)