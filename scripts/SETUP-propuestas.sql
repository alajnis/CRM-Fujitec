-- ============================================================================
-- SETUP PROPUESTAS TÉCNICO-ECONÓMICAS — Fujitec CRM
--
--  ⚠️  Ejecutar en el proyecto:  ubbojwlsfiutsarwvsyd
--      https://ubbojwlsfiutsarwvsyd.supabase.co
--
--  Crea lo que necesita la pantalla "Propuesta técnico-económica":
--      1. Tabla public.propuestas   — una propuesta por obra
--      2. Bucket de Storage         — archivo de cada versión emitida (PDF)
--      3. Bucket de anexos          — documentos institucionales fijos
--
--  Es idempotente: se puede correr más de una vez sin romper nada.
--
--  Mientras esto no se ejecute, la pantalla igual funciona guardando en el
--  navegador (localStorage), pero sin historial compartido entre usuarios ni
--  archivo recuperable de las versiones emitidas.
-- ============================================================================


-- ============================================================================
-- PASO 0 — VERIFICAR EL PROYECTO  (ejecutar solo esta query primero)
-- ============================================================================
-- Tiene que decir '✅ PROYECTO CORRECTO'. Si dice '❌', NO sigas.

SELECT
  (SELECT count(*) FROM public.obras)    AS obras,
  (SELECT count(*) FROM public.clientes) AS clientes,
  (SELECT count(*) FROM public.equipos)  AS equipos,
  CASE
    WHEN (SELECT count(*) FROM public.obras) BETWEEN 15 AND 40
     AND (SELECT count(*) FROM public.equipos) BETWEEN 15 AND 40
    THEN '✅ PROYECTO CORRECTO — seguí con el PASO 1'
    ELSE '❌ REVISÁ: los números no coinciden con el proyecto esperado'
  END AS veredicto;


-- ============================================================================
-- PASO 1 — TABLA PROPUESTAS
-- ============================================================================
-- Una propuesta por obra. Los bloques del documento se guardan como JSONB
-- porque su forma la define la app y cambia junto con las plantillas; usar
-- columnas sueltas obligaría a una migración por cada cláusula nueva.

CREATE TABLE IF NOT EXISTS public.propuestas (
  id                   TEXT PRIMARY KEY,
  obra_id              UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,

  destinatario         JSONB NOT NULL DEFAULT '{}'::jsonb,
  precios              JSONB NOT NULL DEFAULT '{}'::jsonb,
  clausulas            JSONB NOT NULL DEFAULT '{}'::jsonb,
  opciones_tecnicas    JSONB NOT NULL DEFAULT '{}'::jsonb,
  equipo_ids_incluidos JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Historial de versiones emitidas: [{version, fechaGeneracion, generadaPor,
  -- nombreArchivo, storagePath}]. Cada descarga agrega una entrada.
  versiones            JSONB NOT NULL DEFAULT '[]'::jsonb,
  ultima_version       INTEGER NOT NULL DEFAULT 0,

  fecha_creacion       TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_actualizacion  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);

-- La app hace upsert por obra_id, así que necesita esta restricción.
-- (Se agrega aparte para que el script sea idempotente.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'propuestas_obra_id_key'
      AND conrelid = 'public.propuestas'::regclass
  ) THEN
    ALTER TABLE public.propuestas ADD CONSTRAINT propuestas_obra_id_key UNIQUE (obra_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_propuestas_obra_id ON public.propuestas(obra_id);


-- ============================================================================
-- PASO 2 — RLS
-- ============================================================================
-- Mismo criterio que el resto de las tablas de la app: acceso total, porque
-- la app no usa Supabase Auth y valida los permisos contra su propia tabla
-- public.users.

ALTER TABLE public.propuestas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acceso_total_propuestas" ON public.propuestas;
CREATE POLICY "acceso_total_propuestas" ON public.propuestas
  FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- PASO 3 — BUCKETS DE STORAGE
-- ============================================================================
--   propuestas         → PDF de cada versión emitida (privado)
--   propuestas-anexos  → documentos institucionales fijos (privado)
--
-- Privados: son documentos comerciales con precios. La app los sirve mediante
-- URLs firmadas de duración limitada, no por link público.

INSERT INTO storage.buckets (id, name, public)
VALUES ('propuestas', 'propuestas', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('propuestas-anexos', 'propuestas-anexos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "acceso_total_propuestas_storage" ON storage.objects;
CREATE POLICY "acceso_total_propuestas_storage" ON storage.objects
  FOR ALL USING (bucket_id = 'propuestas') WITH CHECK (bucket_id = 'propuestas');

DROP POLICY IF EXISTS "acceso_total_anexos_storage" ON storage.objects;
CREATE POLICY "acceso_total_anexos_storage" ON storage.objects
  FOR ALL USING (bucket_id = 'propuestas-anexos') WITH CHECK (bucket_id = 'propuestas-anexos');


-- ============================================================================
-- PASO 4 — VERIFICACIÓN
-- ============================================================================
-- Las tres filas tienen que decir '✅'.

SELECT
  'Tabla propuestas' AS elemento,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'propuestas'
  ) THEN '✅ creada' ELSE '❌ falta' END AS estado

UNION ALL SELECT
  'Bucket propuestas',
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'propuestas')
       THEN '✅ creado' ELSE '❌ falta' END

UNION ALL SELECT
  'Bucket propuestas-anexos',
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'propuestas-anexos')
       THEN '✅ creado' ELSE '❌ falta' END;


-- ============================================================================
-- PASO 5 — SUBIR LOS ANEXOS INSTITUCIONALES  (manual, desde el dashboard)
-- ============================================================================
-- Storage → propuestas-anexos → Upload file, con EXACTAMENTE estos nombres:
--
--     caracteristicas-generales.pdf     (Características generales, 11 págs)
--     ayuda-gremio-con-sala.pdf         (Ayuda de gremio CON sala de máquinas)
--     ayuda-gremio-sin-sala.pdf         (Ayuda de gremio SIN sala / MRL)
--
-- La app elige entre las dos versiones de ayuda de gremio según el tipo de
-- sala de máquinas de los equipos de la obra.
--
-- Los .doc originales hay que exportarlos a PDF desde Word primero
-- ("Guardar como" → PDF), para conservar imágenes y diagramas.
