-- Add historial_log column to obras table for audit trail persistence
-- This enables the CRM to store complete activity logs including user notes

-- Step 1: Add the historial_log as JSONB (best for JSON in PostgreSQL)
ALTER TABLE obras
ADD COLUMN IF NOT EXISTS historial_log JSONB;

-- Step 2: Create GIN index for efficient JSON queries
-- (GIN index only works with JSONB, not TEXT)
CREATE INDEX IF NOT EXISTS idx_obras_historial_log ON obras USING GIN (historial_log);

-- Step 3: Verify the column was added successfully
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'obras'
AND column_name = 'historial_log';

-- If the query above returns one row with:
--   column_name: historial_log
--   data_type: jsonb
--   is_nullable: YES
-- Then the migration was successful!

-- Note: If you get an error about GIN index on TEXT, the column type
-- might be TEXT instead of JSONB. The code will still work, but without
-- the performance benefit of the GIN index.
