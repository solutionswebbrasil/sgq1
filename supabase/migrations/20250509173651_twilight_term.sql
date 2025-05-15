/*
  # Update Audit Schema with New Fields

  1. Changes
    - Add new fields to formularios_auditoria table
    - Add new fields to itens_auditoria table
    - Update existing tables structure
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add new fields to itens_auditoria table
ALTER TABLE itens_auditoria 
ADD COLUMN IF NOT EXISTS conforme boolean,
ADD COLUMN IF NOT EXISTS observacao text;

-- Add new fields to formularios_auditoria table
ALTER TABLE formularios_auditoria 
ADD COLUMN IF NOT EXISTS auditor text,
ADD COLUMN IF NOT EXISTS data_auditoria date,
ADD COLUMN IF NOT EXISTS unidade_id uuid REFERENCES unidades(id),
ADD COLUMN IF NOT EXISTS link_evidencias text,
ADD COLUMN IF NOT EXISTS observacoes_gap text,
ADD COLUMN IF NOT EXISTS observacoes_melhorias text,
ADD COLUMN IF NOT EXISTS assinatura_responsavel text;