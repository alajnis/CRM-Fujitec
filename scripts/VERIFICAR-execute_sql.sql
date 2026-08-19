-- ============================================================================
-- VERIFICAR Y ELIMINAR execute_sql — Ejecutar en el SQL Editor de Supabase
--
-- scripts/migrate-cliente-columns.js llama a supabase.rpc('execute_sql', { query })
-- con la anon key, que ya es pública (queda en el bundle del frontend). Si esa
-- función existe en la base y acepta cualquier texto SQL, es SQL arbitrario
-- ejecutable por cualquiera que abra la consola del navegador en la app —
-- sin necesidad de login, sin pasar por ninguna tabla ni por RLS.
--
-- Este script primero la busca; si existe, la elimina.
-- ============================================================================

-- PASO 1 — ¿Existe la función y quién puede ejecutarla?
SELECT
  p.proname            AS funcion,
  n.nspname            AS schema,
  pg_get_function_identity_arguments(p.oid) AS argumentos,
  p.prosecdef          AS es_security_definer,
  pg_get_userbyid(p.proowner) AS dueño,
  has_function_privilege('anon',        p.oid, 'EXECUTE') AS anon_puede_ejecutar,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_puede_ejecutar
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'execute_sql';

-- Si la query anterior no devuelve filas: la función no existe, no hay riesgo,
-- no hace falta hacer nada más. El script viejo simplemente fallaba al correr.

-- PASO 2 — Si apareció una fila con anon_puede_ejecutar = true, ejecutar esto:
-- (comentado a propósito: revisá el PASO 1 antes de descomentar y correr)

-- DROP FUNCTION IF EXISTS public.execute_sql(text);
-- DROP FUNCTION IF EXISTS public.execute_sql(query text);
-- -- Si el PASO 1 mostró otra firma de argumentos, ajustá el DROP a esa firma exacta.

-- PASO 3 — Verificación: esta query debe devolver 0 filas después del DROP
SELECT p.proname
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'execute_sql';
