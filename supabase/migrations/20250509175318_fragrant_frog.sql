/*
  # Add observacao column to respostas_auditoria table

  1. Changes
    - Add 'observacao' column to 'respostas_auditoria' table
      - Type: text
      - Nullable: true (to maintain compatibility with existing records)
      - No default value

  2. Reason
    - Frontend needs to store observation text for audit responses
    - Column is referenced in the application but missing from schema
*/

ALTER TABLE respostas_auditoria 
ADD COLUMN IF NOT EXISTS observacao text;