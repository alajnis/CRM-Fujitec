-- Add contacto_principal and cargo columns to clientes table
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS contacto_principal VARCHAR(255),
ADD COLUMN IF NOT EXISTS cargo VARCHAR(255);

-- Verify columns were added
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'clientes'
AND column_name IN ('contacto_principal', 'cargo');
