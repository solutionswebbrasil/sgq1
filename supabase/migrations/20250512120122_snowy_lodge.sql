-- Function to get retornados data by month
CREATE OR REPLACE FUNCTION get_retornados_por_mes()
RETURNS TABLE (
  mes text,
  quantidade bigint,
  valor_recuperado numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(r.created_at, 'YYYY-MM') as mes,
    COUNT(*) as quantidade,
    COALESCE(SUM(CASE 
      WHEN r.destino_final = 'Estoque' 
      THEN t.preco_folha * 10000 
      ELSE 0 
    END), 0) as valor_recuperado
  FROM retornados r
  LEFT JOIN toners t ON r.toner_id = t.id
  GROUP BY to_char(r.created_at, 'YYYY-MM')
  ORDER BY mes;
END;
$$ LANGUAGE plpgsql;

-- Function to get retornados data by destino
CREATE OR REPLACE FUNCTION get_retornados_por_destino()
RETURNS TABLE (
  destino text,
  quantidade bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.destino_final::text,
    COUNT(*) as quantidade
  FROM retornados r
  GROUP BY r.destino_final;
END;
$$ LANGUAGE plpgsql;

-- Function to get garantias data by month
CREATE OR REPLACE FUNCTION get_garantias_por_mes()
RETURNS TABLE (
  mes text,
  quantidade bigint,
  valor_total numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_char(created_at, 'YYYY-MM') as mes,
    COUNT(*) as quantidade,
    COALESCE(SUM(CASE 
      WHEN status = 'Concluída' 
      THEN quantidade * 100 -- Example calculation, adjust as needed
      ELSE 0 
    END), 0) as valor_total
  FROM garantias
  GROUP BY to_char(created_at, 'YYYY-MM')
  ORDER BY mes;
END;
$$ LANGUAGE plpgsql;

-- Function to get garantias data by fornecedor
CREATE OR REPLACE FUNCTION get_garantias_por_fornecedor()
RETURNS TABLE (
  fornecedor text,
  quantidade bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(g.fornecedor, 'Não especificado') as fornecedor,
    COUNT(*) as quantidade
  FROM garantias g
  GROUP BY g.fornecedor;
END;
$$ LANGUAGE plpgsql;