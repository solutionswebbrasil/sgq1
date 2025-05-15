-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_garantias_por_mes();
DROP FUNCTION IF EXISTS public.get_garantias_por_fornecedor();
DROP FUNCTION IF EXISTS public.get_garantias_por_status();

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
  quantidade bigint,
  valor_total numeric
) 
LANGUAGE SQL
AS $$
  SELECT 
    COALESCE(g.fornecedor, 'Não especificado') as fornecedor,
    COUNT(g.id) as quantidade,
    COALESCE(SUM(g.valor_total), 0) as valor_total
  FROM garantias g
  GROUP BY g.fornecedor
  ORDER BY COUNT(g.id) DESC;
$$;

-- Create function for garantias por status
CREATE OR REPLACE FUNCTION public.get_garantias_por_status()
RETURNS TABLE (
  status text,
  quantidade bigint,
  valor_total numeric
) 
LANGUAGE SQL
AS $$
  SELECT 
    g.status::text,
    COUNT(g.id) as quantidade,
    COALESCE(SUM(g.valor_total), 0) as valor_total
  FROM garantias g
  GROUP BY g.status
  ORDER BY COUNT(g.id) DESC;
$$;