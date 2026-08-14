import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Config Check:');
console.log('URL exists:', !!supabaseUrl);
console.log('KEY exists:', !!supabaseAnonKey);
console.log('URL value:', supabaseUrl);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);
  throw new Error('Missing Supabase environment variables');
}

console.log('✅ Supabase client initialized successfully');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
