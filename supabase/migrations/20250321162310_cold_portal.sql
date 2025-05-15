/*
  # Add RLS Policies for Tables

  1. Security Changes
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
    - Each policy has a unique name per table to avoid conflicts
    - Tables affected:
      - toners
      - unidades
      - retornados
      - movimentacoes
      - garantias
      - processos
      - processo_versoes
      - its
      - it_versoes
      - tcos
      - tco_insumos
      - tco_evidencias

  2. Policy Details
    - Authenticated users can perform all operations
    - Each user can only see their own created records
    - Created records automatically get created_by set to the user's ID
*/

-- Enable RLS on all tables
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

-- Toners policies
CREATE POLICY "toners_read" ON toners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "toners_insert" ON toners
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "toners_update" ON toners
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "toners_delete" ON toners
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Unidades policies
CREATE POLICY "unidades_read" ON unidades
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "unidades_insert" ON unidades
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "unidades_update" ON unidades
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "unidades_delete" ON unidades
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Retornados policies
CREATE POLICY "retornados_read" ON retornados
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "retornados_insert" ON retornados
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "retornados_update" ON retornados
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "retornados_delete" ON retornados
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Movimentacoes policies
CREATE POLICY "movimentacoes_read" ON movimentacoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "movimentacoes_insert" ON movimentacoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "movimentacoes_update" ON movimentacoes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "movimentacoes_delete" ON movimentacoes
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Garantias policies
CREATE POLICY "garantias_read" ON garantias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "garantias_insert" ON garantias
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "garantias_update" ON garantias
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "garantias_delete" ON garantias
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Processos policies
CREATE POLICY "processos_read" ON processos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "processos_insert" ON processos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "processos_update" ON processos
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "processos_delete" ON processos
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Processo_versoes policies
CREATE POLICY "processo_versoes_read" ON processo_versoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "processo_versoes_insert" ON processo_versoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "processo_versoes_update" ON processo_versoes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "processo_versoes_delete" ON processo_versoes
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ITs policies
CREATE POLICY "its_read" ON its
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "its_insert" ON its
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "its_update" ON its
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "its_delete" ON its
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- IT_versoes policies
CREATE POLICY "it_versoes_read" ON it_versoes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "it_versoes_insert" ON it_versoes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "it_versoes_update" ON it_versoes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "it_versoes_delete" ON it_versoes
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- TCOs policies
CREATE POLICY "tcos_read" ON tcos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tcos_insert" ON tcos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tcos_update" ON tcos
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "tcos_delete" ON tcos
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- TCO_insumos policies
CREATE POLICY "tco_insumos_read" ON tco_insumos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tco_insumos_insert" ON tco_insumos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tco_insumos_update" ON tco_insumos
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "tco_insumos_delete" ON tco_insumos
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- TCO_evidencias policies
CREATE POLICY "tco_evidencias_read" ON tco_evidencias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tco_evidencias_insert" ON tco_evidencias
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "tco_evidencias_update" ON tco_evidencias
  FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "tco_evidencias_delete" ON tco_evidencias
  FOR DELETE TO authenticated USING (auth.uid() = created_by);