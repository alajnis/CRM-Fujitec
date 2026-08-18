import { supabase } from '../utils/supabaseClient';
import { Cliente } from '../types/supabase';
import { completarCamposHeredados } from '../utils/camposHeredados';

export const clientesService = {
  async getClientes() {
    try {
      console.log('🔄 Fetching clientes from Supabase...');

      // Try without the deleted_at filter first to debug
      const { data, error, status } = await supabase
        .from('clientes')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      console.log('Response status:', status);
      console.log('Response error:', error);
      console.log('Response data count:', data ? data.length : 0);

      if (error) {
        console.error('❌ Error in getClientes:', error);
        throw error;
      }

      // Filter out deleted records in memory
      const filtered = (data || []).filter(c => !c.deleted_at);
      console.log(`✅ getClientes returned ${filtered.length} records (${data?.length} total before filtering)`);
      return filtered as Cliente[];
    } catch (err) {
      console.error('❌ Exception in getClientes:', err);
      throw err;
    }
  },

  async getClienteById(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  async createCliente(cliente: Omit<Cliente, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>) {
    const payload: any = { ...cliente };
    // Completa las columnas NOT NULL heredadas que la app no envía
    await completarCamposHeredados('clientes', payload);

    const { data, error } = await supabase
      .from('clientes')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  async updateCliente(id: string, updates: Partial<Cliente>) {
    const { data, error } = await supabase
      .from('clientes')
      .update({ ...updates, fecha_actualizacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Cliente;
  },

  async softDeleteCliente(id: string) {
    return this.updateCliente(id, { deleted_at: new Date().toISOString() });
  }
};
