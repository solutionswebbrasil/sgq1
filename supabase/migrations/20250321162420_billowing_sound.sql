/*
  # Add price and weight fields to toners table

  1. Changes
    - Add new columns to toners table:
      - preco: Numeric field for toner price
      - preco_folha: Numeric field for price per page
      - gramatura: Numeric field for toner weight
*/

ALTER TABLE toners 
ADD COLUMN IF NOT EXISTS preco numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS preco_folha numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS gramatura numeric NOT NULL DEFAULT 0;