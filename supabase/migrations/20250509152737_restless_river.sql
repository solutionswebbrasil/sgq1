/*
  # Create Audit System Tables

  1. New Tables
    - `formularios_auditoria`: Stores audit form templates
    - `subtitulos_auditoria`: Stores subtitles for audit forms
    - `itens_auditoria`: Stores audit items
    - `locais_auditoria`: Stores audit locations
    - `registros_auditoria`: Stores audit records
    - `respostas_auditoria`: Stores audit responses
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create formularios_auditoria table
CREATE TABLE formularios_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- Create subtitulos_auditoria table
CREATE TABLE subtitulos_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id uuid REFERENCES formularios_auditoria(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  ordem integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create itens_auditoria table
CREATE TABLE itens_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subtitulo_id uuid REFERENCES subtitulos_auditoria(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  ordem integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create locais_auditoria table
CREATE TABLE locais_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id uuid REFERENCES formularios_auditoria(id) ON DELETE CASCADE,
  nome text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create registros_auditoria table
CREATE TABLE registros_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formulario_id uuid REFERENCES formularios_auditoria(id),
  data_hora timestamptz DEFAULT now(),
  responsavel text NOT NULL,
  local text NOT NULL,
  link_evidencias text,
  sugestao_melhorias text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Create respostas_auditoria table
CREATE TABLE respostas_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid REFERENCES registros_auditoria(id) ON DELETE CASCADE,
  item_id uuid REFERENCES itens_auditoria(id),
  conforme boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE formularios_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtitulos_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE respostas_auditoria ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "formularios_auditoria_all" ON formularios_auditoria FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "subtitulos_auditoria_all" ON subtitulos_auditoria FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "itens_auditoria_all" ON itens_auditoria FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "locais_auditoria_all" ON locais_auditoria FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "registros_auditoria_all" ON registros_auditoria FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "respostas_auditoria_all" ON respostas_auditoria FOR ALL TO public USING (true) WITH CHECK (true);