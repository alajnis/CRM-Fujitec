-- ============================================================================
-- MIGRACIÓN COMPLETA — Correcciones de esquema Fujitec CRM
-- Ejecutar TODO este script en el SQL Editor de Supabase.
-- Es idempotente: se puede correr más de una vez sin romper nada.
--
-- Cada bloque verifica que la tabla exista antes de tocarla, así que si alguna
-- todavía no está creada el script sigue de largo en vez de abortar.
-- ============================================================================

-- Asegurar que la sesión vea el schema donde viven las tablas de la app
SET search_path TO public;

DO $$
DECLARE
  faltantes text;
BEGIN
  SELECT string_agg(t, ', ')
    INTO faltantes
    FROM unnest(ARRAY['clientes','obras','equipos','actividades','users']) AS t
   WHERE to_regclass('public.' || t) IS NULL;

  IF faltantes IS NOT NULL THEN
    RAISE NOTICE '⚠️  Tablas no encontradas en public: %', faltantes;
    RAISE NOTICE '    Los bloques que las usan se van a saltear.';
    RAISE NOTICE '    Corré scripts/00-diagnostico.sql para ver en qué schema están.';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 1. CLIENTES: columnas que la app usa pero no existían en la tabla
--    (por eso los contactos secundarios y el CUIT/RUT no se guardaban)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.clientes') IS NOT NULL THEN
    ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS contacto_principal VARCHAR(255);
    ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cargo              VARCHAR(255);
    ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cuit_rut           VARCHAR(50);
    ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS contactos          JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ clientes: columnas agregadas';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. OBRAS: columnas de código y log de auditoría
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.obras') IS NOT NULL THEN
    ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS codigo        VARCHAR(20);
    ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS historial_log JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ obras: columnas agregadas';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. EQUIPOS: obra_id debe aceptar NULL (equipo sin obra asignada)
--    Antes se enviaba '' y Postgres rechazaba el insert con 22P02.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.equipos') IS NOT NULL THEN
    -- DROP NOT NULL falla si la columna ya es nullable, por eso el guard
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name   = 'equipos'
         AND column_name  = 'obra_id'
         AND is_nullable  = 'NO'
    ) THEN
      ALTER TABLE public.equipos ALTER COLUMN obra_id DROP NOT NULL;
      RAISE NOTICE '✅ equipos.obra_id: ahora acepta NULL';
    END IF;

    -- Normalizar cualquier string vacío que haya quedado de intentos previos
    UPDATE public.equipos SET obra_id = NULL WHERE obra_id::text = '';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. USUARIOS
--    La creación de public.users y sus usuarios base vive en
--    03-crear-tabla-users.sql, que hay que correr ANTES que este script.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.users') IS NULL THEN
    RAISE NOTICE '⚠️  public.users no existe — corré 03-crear-tabla-users.sql primero.';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. RLS — habilitar operaciones desde el cliente (anon key)
--    Sin estas policies los INSERT/UPDATE/DELETE fallan silenciosamente.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['clientes','obras','equipos','actividades','users'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'acceso_total_' || t, t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL USING (true) WITH CHECK (true)',
        'acceso_total_' || t, t
      );
      RAISE NOTICE '✅ RLS configurado en %', t;
    END IF;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 6. ÍNDICES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.equipos') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_equipos_obra_id ON public.equipos(obra_id);
  END IF;
  IF to_regclass('public.actividades') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_actividades_obra_id ON public.actividades(obra_id);
  END IF;
  IF to_regclass('public.obras') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_obras_cliente_id ON public.obras(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_obras_created_by ON public.obras(created_by);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. VERIFICACIÓN — estas columnas tienen que aparecer
-- ----------------------------------------------------------------------------
SELECT 'clientes' AS tabla, column_name, data_type
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'clientes'
   AND column_name IN ('contactos', 'cuit_rut', 'contacto_principal', 'cargo')

UNION ALL
SELECT 'obras', column_name, data_type
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'obras'
   AND column_name IN ('codigo', 'historial_log')

UNION ALL
SELECT 'equipos (obra_id debe ser YES en nullable)', column_name, is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'equipos'
   AND column_name = 'obra_id'

UNION ALL
SELECT 'users', column_name, data_type
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'users'
   AND column_name = 'password'

ORDER BY tabla, column_name;
