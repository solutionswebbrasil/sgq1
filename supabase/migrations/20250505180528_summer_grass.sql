/*
  # Add tipo column to movimentacoes table

  1. Changes
    - Add 'tipo' column to 'movimentacoes' table using movimentacao_tipo enum type
    - Make the column NOT NULL to ensure data integrity
  
  2. Notes
    - Using movimentacao_tipo enum type to ensure only valid movement types are stored
    - Existing enum type already contains all required movement types:
      - De Estoque para Quarentena
      - De Quarentena para Área Técnica Print
      - De Quarentena para Área Técnica Mobile
      - De Embalagem para Logística
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentacoes' 
    AND column_name = 'tipo'
  ) THEN
    ALTER TABLE movimentacoes 
    ADD COLUMN tipo movimentacao_tipo NOT NULL;
  END IF;
END $$;