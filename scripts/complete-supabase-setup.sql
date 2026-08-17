-- Complete Supabase Setup for Fujitec CRM
-- Run ALL of these queries in Supabase SQL Editor

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO OBRAS TABLE
-- ============================================================================

-- Add codigo column (for work order codes like A-5300)
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS codigo VARCHAR(10);

-- Add historial_log column (for audit trail)
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS historial_log JSONB;

-- ============================================================================
-- 2. ADD MISSING COLUMNS TO EQUIPOS TABLE
-- ============================================================================

-- Check if equipos table needs any fixes
-- (The table should have obra_id as UUID, not VARCHAR)

-- ============================================================================
-- 3. VERIFY COLUMN TYPES ARE CORRECT
-- ============================================================================

-- Run these to verify all columns are correct:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'obras'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'equipos'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'actividades'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE (OPTIONAL)
-- ============================================================================

-- Index for historial_log queries
CREATE INDEX IF NOT EXISTS idx_obras_historial_log ON obras USING GIN (historial_log);

-- Index for obra_id lookups in equipos
CREATE INDEX IF NOT EXISTS idx_equipos_obra_id ON equipos(obra_id);

-- Index for obra_id lookups in actividades
CREATE INDEX IF NOT EXISTS idx_actividades_obra_id ON actividades(obra_id);

-- ============================================================================
-- AFTER RUNNING THIS SCRIPT:
-- ============================================================================
-- 1. Reload the app (Ctrl+F5)
-- 2. Try saving/updating an obra
-- 3. Check that no 400 errors appear
-- 4. Test: toggle activity checkbox, change estado, etc.
