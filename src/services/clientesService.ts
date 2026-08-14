import { supabase } from '../utils/supabaseClient';
import { Cliente } from '../types/supabase';

export const clientesService = {
  async getClientes() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .is('deleted_at', null)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Error in getClientes:', error);
      throw error;
    }
    return (data || []) as Cliente[];
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
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
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
