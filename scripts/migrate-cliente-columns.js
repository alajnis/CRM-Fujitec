import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubbojwlsfiutsarwvsyd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYm9qd2xzZml1dHNhcnd2c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTk3MzQsImV4cCI6MjEwMjI3NTczNH0.sSBlypkUHD8EYnApqHnRHguPTJRMTkV8taHhTpI9ibE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addClienteColumns() {
  try {
    console.log('🔧 Adding contacto_principal and cargo columns to clientes table...');

    const sql = `
      ALTER TABLE clientes
      ADD COLUMN IF NOT EXISTS contacto_principal VARCHAR(255),
      ADD COLUMN IF NOT EXISTS cargo VARCHAR(255);
    `;

    const { error } = await supabase.rpc('execute_sql', { query: sql });

    if (error) {
      console.error('❌ Error executing SQL:', error);
    } else {
      console.log('✅ Columns added successfully!');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

addClienteColumns();
