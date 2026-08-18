-- ============================================================================
-- CHECK USERS — Ejecutar y pegar el resultado
-- ============================================================================

-- 1) ¿Qué usuarios hay y con qué datos?
SELECT id, email, full_name, role, status, password
  FROM public.users
 ORDER BY email;

-- 2) ¿Qué valores acepta la columna role? (si es un enum o tiene un CHECK,
--    insertar 'vendedor' pudo haber fallado en silencio)
SELECT
  con.conname  AS constraint_name,
  pg_get_constraintdef(con.oid) AS definicion
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'users';

-- 3) Tipo real de la columna role
SELECT column_name, data_type, udt_name, is_nullable
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'users'
 ORDER BY ordinal_position;
