-- ============================================================================
-- FIX CONSTRAINTS — Ejecutar en el SQL Editor de Supabase
--
-- Afloja los NOT NULL que bloquean los inserts de la aplicación.
--
-- Cada ALTER va en su propio DO block: si uno falla, no arrastra a los demás
-- (que es lo que pasaba antes, donde un UPDATE con error revertía el ALTER
-- que se había hecho unas líneas más arriba en la misma transacción).
-- ============================================================================

SET search_path TO public;

-- ----------------------------------------------------------------------------
-- 1. EQUIPOS — obra_id: un equipo puede existir sin obra asignada
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.equipos ALTER COLUMN obra_id DROP NOT NULL;
  RAISE NOTICE '✅ equipos.obra_id ahora acepta NULL';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️  equipos.obra_id: %', SQLERRM;
END $$;

-- tipo_equipo_id es un FK heredado que la app no usa
DO $$
BEGIN
  ALTER TABLE public.equipos ALTER COLUMN tipo_equipo_id DROP NOT NULL;
  RAISE NOTICE '✅ equipos.tipo_equipo_id ahora acepta NULL';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ℹ️  equipos.tipo_equipo_id: %', SQLERRM;
END $$;

-- Estos tienen default en la app pero pueden venir vacíos
DO $$
BEGIN
  ALTER TABLE public.equipos ALTER COLUMN estado DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.equipos ALTER COLUMN estado_instalacion DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 2. OBRAS — estado/etapa_actual los maneja la app; created_by puede no estar
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.obras ALTER COLUMN estado DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.obras ALTER COLUMN created_by DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 3. ACTIVIDADES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.actividades ALTER COLUMN usuario_asignado DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.actividades ALTER COLUMN usuario_creador DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 4. CLIENTES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER TABLE public.clientes ALTER COLUMN created_by DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.clientes ALTER COLUMN tipo DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.clientes ALTER COLUMN estado DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 5. VERIFICACIÓN
--    Todas las columnas listadas deberían decir YES en nullable.
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
--    Lo que aparezca acá hay que mandarlo siempre desde la app.
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
