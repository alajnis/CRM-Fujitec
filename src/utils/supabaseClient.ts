import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Proyecto contra el que corre la app. El SQL de `scripts/` tiene que
 * ejecutarse en este mismo proyecto: correrlo en otro no da error, pero los
 * cambios nunca llegan a la app.
 */
const PROYECTO_ESPERADO = 'ubbojwlsfiutsarwvsyd';

const proyectoActual = supabaseUrl?.match(/https:\/\/([^.]+)\./)?.[1];

console.log('🔍 Supabase Config Check:');
console.log('URL exists:', !!supabaseUrl);
console.log('KEY exists:', !!supabaseAnonKey);
console.log('URL value:', supabaseUrl);
console.log('📋 Proyecto:', proyectoActual, '— el SQL de scripts/ va acá');

if (proyectoActual && proyectoActual !== PROYECTO_ESPERADO) {
  console.warn(
    `⚠️ La app apunta a "${proyectoActual}" pero se esperaba "${PROYECTO_ESPERADO}". ` +
    'Revisá VITE_SUPABASE_URL antes de correr cualquier script SQL.'
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Supabase client initialized successfully');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
