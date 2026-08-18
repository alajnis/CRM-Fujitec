-- ============================================================================
-- ¿DÓNDE ESTÁN LAS TABLAS? — Ejecutar y pegar el resultado completo
--
-- La app lee y escribe datos correctamente (23 obras, 17 clientes, 26 equipos),
-- así que las tablas existen. Pero los ALTER contra `public.<tabla>` fallan con
-- 42P01, lo que significa que NO están en el schema `public`.
--
-- Estas queries dicen exactamente dónde están y con qué nombre.
-- ============================================================================

-- 1) TODAS las tablas de la base, con su schema.
--    Acá tienen que aparecer obras, clientes, equipos, actividades y users.
SELECT
  schemaname AS schema,
  tablename  AS tabla,
  tableowner AS dueño
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schemaname, tablename;

-- 2) Vistas (si la app estuviera leyendo de vistas y no de tablas)
SELECT
  schemaname AS schema,
  viewname   AS vista
FROM pg_views
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, viewname;

-- 3) Qué schema está viendo esta sesión y con qué usuario
SELECT
  current_database() AS base,
  current_schema()   AS schema_actual,
  current_user       AS usuario,
  version()          AS version_postgres;

SHOW search_path;

-- 4) Todos los schemas existentes
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT LIKE 'pg_%'
  AND schema_name <> 'information_schema'
ORDER BY schema_name;

-- 5) Búsqueda directa: ¿existe algo llamado "equipos" en cualquier schema?
SELECT
  n.nspname AS schema,
  c.relname AS nombre,
  CASE c.relkind
    WHEN 'r' THEN 'tabla'
    WHEN 'v' THEN 'vista'
    WHEN 'm' THEN 'vista materializada'
    WHEN 'f' THEN 'tabla foránea'
    WHEN 'p' THEN 'tabla particionada'
    ELSE c.relkind::text
  END AS tipo
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('equipos','obras','clientes','actividades','users')
ORDER BY n.nspname, c.relname;
