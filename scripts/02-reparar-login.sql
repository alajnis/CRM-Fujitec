-- ============================================================================
-- REPARAR LOGIN — Ejecutar en el SQL Editor de Supabase
--
-- Deja los dos usuarios base en condiciones de iniciar sesión, sin asumir qué
-- valores acepta la columna `role` (si es un enum o tiene un CHECK, reutiliza
-- un rol que ya exista en la tabla en vez de inventar uno).
-- ============================================================================

SET search_path TO public;

-- 1) Limpiar duplicados por email (dejando la fila más antigua de cada uno)
DELETE FROM public.users a
 USING public.users b
 WHERE lower(a.email) = lower(b.email)
   AND a.ctid > b.ctid;

-- 2) Asegurar la columna password
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 3) Crear/actualizar los usuarios base
DO $$
DECLARE
  rol_admin    text;
  rol_vendedor text;
BEGIN
  -- Reutilizar roles que ya existan en la tabla; si no hay ninguno, probar
  -- los nombres esperados. Esto evita romper contra un enum o un CHECK.
  SELECT role INTO rol_admin
    FROM public.users
   WHERE role IN ('admin', 'superusuario', 'superadmin')
   LIMIT 1;

  SELECT role INTO rol_vendedor
    FROM public.users
   WHERE role IN ('vendedor', 'vendor', 'usuario', 'comercial')
   LIMIT 1;

  rol_admin    := COALESCE(rol_admin,    'admin');
  rol_vendedor := COALESCE(rol_vendedor, 'vendedor');

  RAISE NOTICE 'Usando roles: admin=%, vendedor=%', rol_admin, rol_vendedor;

  -- Admin
  UPDATE public.users
     SET password  = 'admin123',
         status    = 'active',
         full_name = COALESCE(NULLIF(full_name, ''), 'Admin Fujitec')
   WHERE lower(email) = 'superadmin@fujitec.com';

  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, full_name, role, status, password)
    VALUES (gen_random_uuid(), 'superadmin@fujitec.com', 'Admin Fujitec', rol_admin, 'active', 'admin123');
  END IF;

  -- Vendedor
  UPDATE public.users
     SET password  = 'vendedor123',
         status    = 'active',
         full_name = COALESCE(NULLIF(full_name, ''), 'Vendedor Fujitec')
   WHERE lower(email) = 'vendedor@fujitec.com';

  IF NOT FOUND THEN
    INSERT INTO public.users (id, email, full_name, role, status, password)
    VALUES (gen_random_uuid(), 'vendedor@fujitec.com', 'Vendedor Fujitec', rol_vendedor, 'active', 'vendedor123');
  END IF;
END $$;

-- 4) Password por defecto para cualquier otro usuario sin contraseña
UPDATE public.users SET password = 'fujitec2026' WHERE password IS NULL OR password = '';

-- 5) RLS: la anon key tiene que poder leer users para que el login funcione
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "acceso_total_users" ON public.users;
CREATE POLICY "acceso_total_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 6) VERIFICACIÓN — las dos filas deben aparecer con status 'active'
--    y la contraseña visible.
SELECT email, full_name, role, status, password
  FROM public.users
 ORDER BY email;
