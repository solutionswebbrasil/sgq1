/*
  # Update movimentacao_tipo enum values

  1. Changes
    - Drop and recreate movimentacao_tipo enum with new values
    - Update existing data to match new enum values
*/

-- First, create a new enum type with the updated values
CREATE TYPE movimentacao_tipo_new AS ENUM (
  'De Estoque para Quarentena',
  'De Quarentena para Área Técnica Print',
  'De Quarentena para Área Técnica Mobile',
  'De Embalagem para Logística'
);

-- Convert the column to use the new enum type
ALTER TABLE movimentacoes 
  ALTER COLUMN tipo TYPE movimentacao_tipo_new 
  USING tipo::text::movimentacao_tipo_new;

-- Drop the old enum type
DROP TYPE movimentacao_tipo;

-- Rename the new enum type to the original name
ALTER TYPE movimentacao_tipo_new RENAME TO movimentacao_tipo;