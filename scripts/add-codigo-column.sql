-- Add codigo column to obras table to store the work order code
-- This prevents regenerating random codes on every load

ALTER TABLE obras
ADD COLUMN IF NOT EXISTS codigo VARCHAR(10);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'obras'
AND column_name = 'codigo';
