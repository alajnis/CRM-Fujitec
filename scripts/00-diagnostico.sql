-- ============================================================================
-- DIAGNÓSTICO — Ejecutar ESTO PRIMERO y pegar el resultado
-- ============================================================================
-- El error "relation clientes does not exist" significa que las tablas no
-- están en el search_path de esta sesión, no que no existan (la app las lee
-- bien vía PostgREST). Esta query dice en qué schema viven realmente.

SELECT
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_name IN ('clientes', 'obras', 'equipos', 'actividades', 'users')
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- Si la query anterior no devuelve NADA, listá todo lo que haya:
SELECT
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;
