-- ============================================================================
-- CREAR TABLA USERS — Ejecutar en el SQL Editor de Supabase
--
-- La tabla `users` de la aplicación no existía (por eso fallaba el login).
-- OJO: no confundir con `auth.users`, que es la tabla interna de Supabase Auth
-- y vive en otro schema. Esta es la tabla propia de la app, en `public`.
-- ============================================================================

SET search_path TO public;

-- ----------------------------------------------------------------------------
-- 1. Crear la tabla
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      VARCHAR(255) NOT NULL UNIQUE,
  full_name  VARCHAR(255) NOT NULL,
  -- Texto libre y no un enum, para que agregar un rol nuevo no requiera migrar
  role       VARCHAR(50)  NOT NULL DEFAULT 'vendedor',
  status     VARCHAR(20)  NOT NULL DEFAULT 'active',
  phone      VARCHAR(50),
  password   VARCHAR(255) NOT NULL DEFAULT 'fujitec2026',
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Si la tabla ya existía sin alguna de estas columnas, agregarlas
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password   VARCHAR(255);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone      VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status     VARCHAR(20) DEFAULT 'active';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON public.users (lower(email));

-- ----------------------------------------------------------------------------
-- 2. Usuarios base
-- ----------------------------------------------------------------------------
INSERT INTO public.users (email, full_name, role, status, password)
VALUES
  ('superadmin@fujitec.com', 'Admin Fujitec',    'admin',    'active', 'admin123'),
  ('vendedor@fujitec.com',   'Vendedor Fujitec', 'vendedor', 'active', 'vendedor123')
ON CONFLICT (email) DO UPDATE
  SET password  = EXCLUDED.password,
      role      = EXCLUDED.role,
      status    = 'active',
      full_name = EXCLUDED.full_name;

-- ----------------------------------------------------------------------------
-- 3. RLS — la anon key tiene que poder leer y escribir esta tabla
-- ----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "acceso_total_users" ON public.users;
CREATE POLICY "acceso_total_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. VERIFICACIÓN — deben aparecer las dos filas
-- ----------------------------------------------------------------------------
SELECT email, full_name, role, status, password
  FROM public.users
 ORDER BY email;
