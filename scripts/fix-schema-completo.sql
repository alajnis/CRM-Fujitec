-- ============================================================================
-- MIGRACIÓN COMPLETA — Correcciones de esquema Fujitec CRM
-- Ejecutar TODO este script en el SQL Editor de Supabase.
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLIENTES: columnas que la app usa pero no existían en la tabla
--    (por eso los contactos secundarios y el CUIT/RUT no se guardaban)
-- ----------------------------------------------------------------------------
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto_principal VARCHAR(255);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cargo              VARCHAR(255);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cuit_rut           VARCHAR(50);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contactos          JSONB DEFAULT '[]'::jsonb;

-- ----------------------------------------------------------------------------
-- 2. OBRAS: columnas de código y log de auditoría
-- ----------------------------------------------------------------------------
ALTER TABLE obras ADD COLUMN IF NOT EXISTS codigo        VARCHAR(20);
ALTER TABLE obras ADD COLUMN IF NOT EXISTS historial_log JSONB DEFAULT '[]'::jsonb;

-- ----------------------------------------------------------------------------
-- 3. EQUIPOS: obra_id debe aceptar NULL (equipo sin obra asignada)
--    Antes se enviaba '' y Postgres rechazaba el insert con 22P02.
-- ----------------------------------------------------------------------------
ALTER TABLE equipos ALTER COLUMN obra_id DROP NOT NULL;

-- Normalizar cualquier string vacío que haya quedado de intentos previos
UPDATE equipos SET obra_id = NULL WHERE obra_id::text = '';

-- ----------------------------------------------------------------------------
-- 4. USUARIOS: password gestionada por el admin
--    (requisito: el admin crea y puede ver/cambiar la contraseña)
-- ----------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Password inicial para usuarios que ya existen y no tienen una
UPDATE users SET password = 'fujitec2026' WHERE password IS NULL;

-- Usuarios base del sistema (mismas credenciales que la demo anterior).
-- ON CONFLICT: si el email ya existe, sólo actualiza la contraseña y el rol.
INSERT INTO users (id, email, full_name, role, status, password)
VALUES
  (gen_random_uuid(), 'superadmin@fujitec.com', 'Admin Fujitec',    'admin',    'active', 'admin123'),
  (gen_random_uuid(), 'vendedor@fujitec.com',   'Vendedor Fujitec', 'vendedor', 'active', 'vendedor123')
ON CONFLICT (email) DO UPDATE
  SET password = EXCLUDED.password,
      role     = EXCLUDED.role,
      status   = 'active';

-- ----------------------------------------------------------------------------
-- 5. RLS — habilitar operaciones desde el cliente (anon key)
--    Sin estas policies los INSERT/UPDATE/DELETE fallan silenciosamente.
-- ----------------------------------------------------------------------------
ALTER TABLE clientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras       ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE users       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "acceso_total_clientes"    ON clientes;
DROP POLICY IF EXISTS "acceso_total_obras"       ON obras;
DROP POLICY IF EXISTS "acceso_total_equipos"     ON equipos;
DROP POLICY IF EXISTS "acceso_total_actividades" ON actividades;
DROP POLICY IF EXISTS "acceso_total_users"       ON users;

CREATE POLICY "acceso_total_clientes"    ON clientes    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_obras"       ON obras       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_equipos"     ON equipos     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_actividades" ON actividades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "acceso_total_users"       ON users       FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 6. ÍNDICES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_equipos_obra_id     ON equipos(obra_id);
CREATE INDEX IF NOT EXISTS idx_actividades_obra_id ON actividades(obra_id);
CREATE INDEX IF NOT EXISTS idx_obras_cliente_id    ON obras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_obras_created_by    ON obras(created_by);

-- ----------------------------------------------------------------------------
-- 7. VERIFICACIÓN — revisá que estas queries devuelvan las columnas nuevas
-- ----------------------------------------------------------------------------
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clientes' ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'equipos' AND column_name = 'obra_id';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password';
