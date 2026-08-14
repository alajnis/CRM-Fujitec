import { supabase } from './supabaseClient';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    // Test users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) throw usersError;
    console.log('✓ Users table accessible:', users?.length, 'records');

    // Test clientes
    const { data: clientes, error: clientesError } = await supabase
      .from('clientes')
      .select('*')
      .is('deleted_at', null)
      .limit(1);

    if (clientesError) throw clientesError;
    console.log('✓ Clientes table accessible:', clientes?.length, 'records');

    // Test obras
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('*')
      .is('deleted_at', null)
      .limit(1);

    if (obrasError) throw obrasError;
    console.log('✓ Obras table accessible:', obras?.length, 'records');

    // Test equipos
    const { data: equipos, error: equiposError } = await supabase
      .from('equipos')
      .select('*')
      .is('deleted_at', null)
      .limit(1);

    if (equiposError) throw equiposError;
    console.log('✓ Equipos table accessible:', equipos?.length, 'records');

    console.log('✓ Supabase connection successful!');
    return true;
  } catch (error) {
    console.error('✗ Supabase connection failed:', error);
    return false;
  }
}
