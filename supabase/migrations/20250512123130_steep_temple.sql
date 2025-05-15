/*
  # Fix garantias functions

  1. Changes
    - Create or replace function get_garantias_por_mes to properly handle column references
    - Create or replace function get_garantias_por_fornecedor to properly handle column references

  2. Details
    - Explicitly specify table names for all column references
    - Format date to month/year for better grouping
    - Add proper aggregation functions
*/

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_garantias_por_mes();
DROP FUNCTION IF EXISTS public.get_garantias_por_fornecedor();

-- Create function for garantias por mes
CREATE OR REPLACE FUNCTION public.get_garantias_por_mes()
RETURNS TABLE (
  mes text,
  quantidade bigint,
  valor_total numeric
) 
LANGUAGE SQL
AS $$
  SELECT 
    TO_CHAR(g.data_solicitacao, 'MM/YYYY') as mes,
    COUNT(g.id) as quantidade,
    COALESCE(SUM(g.valor_total), 0) as valor_total
  FROM garantias g
  WHERE g.data_solicitacao IS NOT NULL
  GROUP BY TO_CHAR(g.data_solicitacao, 'MM/YYYY')
  ORDER BY MIN(g.data_solicitacao);
$$;

-- Create function for garantias por fornecedor
CREATE OR REPLACE FUNCTION public.get_garantias_por_fornecedor()
RETURNS TABLE (
  fornecedor text,
  quantidade bigint
) 
LANGUAGE SQL
AS $$
  SELECT 
    COALESCE(g.fornecedor, 'Não especificado') as fornecedor,
    COUNT(g.id) as quantidade
  FROM garantias g
  GROUP BY g.fornecedor
  ORDER BY COUNT(g.id) DESC;
$$;