-- ============================================================================
-- FIX CONSTRAINTS — Ejecutar en el SQL Editor de Supabase
--
-- Afloja los NOT NULL que bloquean los inserts de la aplicación.
--
-- Los ALTER van sueltos, no dentro de un DO block: así, si alguno falla, el
-- SQL Editor muestra el error concreto en vez de tragárselo. Cada uno es
-- inofensivo si la columna ya es nullable (Postgres no se queja).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EQUIPOS — un equipo puede existir sin obra asignada
-- ----------------------------------------------------------------------------
ALTER TABLE public.equipos ALTER COLUMN obra_id            DROP NOT NULL;
ALTER TABLE public.equipos ALTER COLUMN tipo_equipo_id     DROP NOT NULL;
ALTER TABLE public.equipos ALTER COLUMN estado             DROP NOT NULL;
ALTER TABLE public.equipos ALTER COLUMN estado_instalacion DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. OBRAS — el funnel usa etapa_actual; `estado` y created_by pueden faltar
-- ----------------------------------------------------------------------------
ALTER TABLE public.obras ALTER COLUMN estado     DROP NOT NULL;
ALTER TABLE public.obras ALTER COLUMN created_by DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. ACTIVIDADES
-- ----------------------------------------------------------------------------
ALTER TABLE public.actividades ALTER COLUMN usuario_asignado DROP NOT NULL;
ALTER TABLE public.actividades ALTER COLUMN usuario_creador  DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. CLIENTES
-- ----------------------------------------------------------------------------
ALTER TABLE public.clientes ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.clientes ALTER COLUMN tipo       DROP NOT NULL;
ALTER TABLE public.clientes ALTER COLUMN estado     DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 5. VERIFICACIÓN — todas las filas tienen que decir ✅
-- ----------------------------------------------------------------------------
SELECT
  table_name,
  column_name,
  is_nullable,
  CASE WHEN is_nullable = 'YES' THEN '✅' ELSE '❌ SIGUE EN NOT NULL' END AS ok
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'equipos'     AND column_name IN ('obra_id','tipo_equipo_id','estado','estado_instalacion')) OR
    (table_name = 'obras'       AND column_name IN ('estado','created_by'))                                    OR
    (table_name = 'actividades' AND column_name IN ('usuario_asignado','usuario_creador'))                     OR
    (table_name = 'clientes'    AND column_name IN ('created_by','tipo','estado'))
  )
ORDER BY table_name, column_name;

-- ----------------------------------------------------------------------------
-- 6. Columnas NOT NULL sin default que todavía puedan romper un insert.
--    Lo que aparezca acá la app tiene que mandarlo siempre.
-- ----------------------------------------------------------------------------
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('obras','clientes','equipos','actividades','users')
  AND is_nullable = 'NO'
  AND column_default IS NULL
ORDER BY table_name, column_name;
