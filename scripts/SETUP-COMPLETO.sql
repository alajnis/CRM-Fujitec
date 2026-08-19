-- ============================================================================
-- SETUP COMPLETO — Fujitec CRM
--
--  ⚠️  ANTES DE EJECUTAR, VERIFICÁ EL PROYECTO
--
--  Este script debe correr en el proyecto:
--      ubbojwlsfiutsarwvsyd
--      https://ubbojwlsfiutsarwvsyd.supabase.co
--
--  La query del PASO 0 lo confirma. Si no coincide, cambiá de proyecto en el
--  selector de arriba a la izquierda del dashboard antes de seguir.
--
--  Reemplaza a todos los scripts anteriores. Es idempotente: se puede correr
--  más de una vez sin romper nada.
-- ============================================================================


-- ============================================================================
-- PASO 0 — VERIFICAR EL PROYECTO  (ejecutar solo esta query primero)
-- ============================================================================
-- El resultado tiene que decir '✅ PROYECTO CORRECTO'.
-- Si dice '❌', estás en el proyecto equivocado: NO sigas.

SELECT
  current_setting('request.jwt.claim.iss', true) AS emisor_jwt,
  CASE
    WHEN current_database() IS NOT NULL THEN
      'Verificá manualmente: la URL del navegador debe contener ubbojwlsfiutsarwvsyd'
  END AS instruccion;

-- Confirmación por datos: este proyecto tiene ~24 obras, ~17 clientes y ~26 equipos.
-- Si los números son muy distintos (o dan error), estás en otro proyecto.
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
-- PASO 1 — TABLA USERS (login)
-- ============================================================================
-- Es la tabla propia de la app. No confundir con auth.users, la tabla interna
-- de Supabase Auth: la app no usa Supabase Auth, valida contra esta.

CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  full_name  VARCHAR(255) NOT NULL,
  -- VARCHAR y no enum: agregar un rol nuevo no debería requerir una migración
  role       VARCHAR(50)  NOT NULL DEFAULT 'vendedor',
  status     VARCHAR(20)  NOT NULL DEFAULT 'active',
  phone      VARCHAR(50),
  password   VARCHAR(255) NOT NULL DEFAULT 'fujitec2026',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Por si la tabla ya existía sin alguna columna
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password   VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone      VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status     VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));

INSERT INTO public.users (email, full_name, role, status, password)
VALUES
  ('superadmin@fujitec.com', 'Admin Fujitec',    'admin',    'active', 'admin123'),
  ('vendedor@fujitec.com',   'Vendedor Fujitec', 'vendedor', 'active', 'vendedor123')
ON CONFLICT (email) DO UPDATE
  SET password  = EXCLUDED.password,
      role      = EXCLUDED.role,
      status    = 'active',
      full_name = EXCLUDED.full_name;


-- ============================================================================
-- PASO 2 — COLUMNAS QUE FALTAN
-- ============================================================================

-- Clientes: contactos secundarios y CUIT/RUT no se guardaban porque las
-- columnas no existían.
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS contacto_principal VARCHAR(255);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cargo              VARCHAR(255);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS cuit_rut           VARCHAR(50);
ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS contactos          JSONB DEFAULT '[]'::jsonb;

-- Obras: código secuencial, log de auditoría y responsable comercial.
-- `usuario_asignado` es distinto de `created_by`: quién gestiona la obra hoy,
-- no quién la cargó. Es lo que filtra la pantalla "Mis obras asignadas".
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS codigo           VARCHAR(20);
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS historial_log    JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.obras ADD COLUMN IF NOT EXISTS usuario_asignado UUID;


-- ============================================================================
-- PASO 3 — AFLOJAR LOS NOT NULL QUE BLOQUEAN LOS INSERTS
-- ============================================================================
-- Sin esto no se puede crear un equipo sin obra, ni una obra sin responsable.
-- La app tiene un mecanismo que rellena estas columnas igual, pero conviene
-- arreglarlo de raíz.

ALTER TABLE public.equipos ALTER COLUMN obra_id            DROP NOT NULL;
ALTER TABLE public.equipos ALTER COLUMN tipo_equipo_id     DROP NOT NULL;
ALTER TABLE public.equipos ALTER COLUMN estado             DROP NOT NULL;
ALTER TABLE public.equipos ALTER COLUMN estado_instalacion DROP NOT NULL;

ALTER TABLE public.obras ALTER COLUMN estado     DROP NOT NULL;
ALTER TABLE public.obras ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.actividades ALTER COLUMN usuario_asignado DROP NOT NULL;
ALTER TABLE public.actividades ALTER COLUMN usuario_creador  DROP NOT NULL;

ALTER TABLE public.clientes ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.clientes ALTER COLUMN tipo       DROP NOT NULL;
ALTER TABLE public.clientes ALTER COLUMN estado     DROP NOT NULL;


-- ============================================================================
-- PASO 4 — RLS
-- ============================================================================
-- Sin estas policies los INSERT/UPDATE/DELETE de la app fallan.

ALTER TABLE public.clientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acceso_total_clientes"    ON public.clientes;
DROP POLICY IF EXISTS "acceso_total_obras"       ON public.obras;
DROP POLICY IF EXISTS "acceso_total_equipos"     ON public.equipos;
DROP POLICY IF EXISTS "acceso_total_actividades" ON public.actividades;
DROP POLICY IF EXISTS "acceso_total_users"       ON public.users;

CREATE POLICY "acceso_total_clientes"    ON public.clientes    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_obras"       ON public.obras       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_equipos"     ON public.equipos     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_actividades" ON public.actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_users"       ON public.users       FOR ALL USING (true) WITH CHECK (true);


-- ============================================================================
-- PASO 5 — REPARTIR LAS OBRAS ENTRE LOS USUARIOS ACTIVOS
-- ============================================================================
-- Distribuye en round-robin las obras que no tengan responsable, para que
-- "Mis obras asignadas" no quede vacía. Sólo toca las que están sin asignar:
-- correrlo de nuevo no reasigna lo que ya tiene dueño.

WITH usuarios_activos AS (
  SELECT id, row_number() OVER (ORDER BY email) - 1 AS pos,
         count(*) OVER () AS total
    FROM public.users
   WHERE status = 'active'
),
obras_sin_asignar AS (
  SELECT id, row_number() OVER (ORDER BY created_at) - 1 AS pos
    FROM public.obras
   WHERE deleted_at IS NULL
     AND usuario_asignado IS NULL
     AND nombre <> '__EQUIPOS_SIN_OBRA__'
)
UPDATE public.obras o
   SET usuario_asignado = u.id
  FROM obras_sin_asignar os
  JOIN usuarios_activos u
    ON u.pos = os.pos % u.total
 WHERE o.id = os.id;

-- Cuántas obras quedó con cada usuario
SELECT
  u.email,
  u.full_name,
  u.id AS id_usuario,
  count(o.id) AS obras_asignadas
FROM public.users u
LEFT JOIN public.obras o
       ON o.usuario_asignado = u.id
      AND o.deleted_at IS NULL
WHERE u.status = 'active'
GROUP BY u.email, u.full_name, u.id
ORDER BY u.email;

-- Obras cuyo responsable no corresponde a ningún usuario existente.
-- Si aparecen filas acá, esas obras no las va a ver nadie en "Mis obras".
SELECT
  o.codigo,
  o.nombre,
  o.usuario_asignado AS id_huerfano
FROM public.obras o
WHERE o.deleted_at IS NULL
  AND o.usuario_asignado IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = o.usuario_asignado);


-- ============================================================================
-- PASO 6 — ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_equipos_obra_id          ON public.equipos(obra_id);
CREATE INDEX IF NOT EXISTS idx_actividades_obra_id      ON public.actividades(obra_id);
CREATE INDEX IF NOT EXISTS idx_obras_cliente_id         ON public.obras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_obras_created_by         ON public.obras(created_by);
CREATE INDEX IF NOT EXISTS idx_obras_usuario_asignado   ON public.obras(usuario_asignado);


-- ============================================================================
-- PASO 7 — VERIFICACIÓN FINAL
-- ============================================================================
-- Las tres consultas tienen que dar OK.

-- 6a) Usuarios para el login
SELECT '6a. LOGIN' AS check, email, role, status, password
  FROM public.users
 ORDER BY email;

-- 6b) Columnas nuevas (deben aparecer las 6)
SELECT '6b. COLUMNAS' AS check, table_name, column_name
  FROM information_schema.columns
 WHERE table_schema = 'public'
   AND (
     (table_name = 'clientes' AND column_name IN ('contactos','cuit_rut','contacto_principal','cargo')) OR
     (table_name = 'obras'    AND column_name IN ('codigo','historial_log'))
   )
 ORDER BY table_name, column_name;

-- 6c) NOT NULL aflojados (todas las filas deben decir ✅)
SELECT
  '6c. CONSTRAINTS' AS check,
  table_name,
  column_name,
  CASE WHEN is_nullable = 'YES' THEN '✅' ELSE '❌ sigue NOT NULL' END AS estado
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    (table_name = 'equipos'     AND column_name IN ('obra_id','tipo_equipo_id','estado','estado_instalacion')) OR
    (table_name = 'obras'       AND column_name IN ('estado','created_by'))                                    OR
    (table_name = 'actividades' AND column_name IN ('usuario_asignado','usuario_creador'))                     OR
    (table_name = 'clientes'    AND column_name IN ('created_by','tipo','estado'))
  )
ORDER BY table_name, column_name;
