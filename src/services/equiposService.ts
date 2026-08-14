import { supabase } from '../utils/supabaseClient';
import { Equipo } from '../types/supabase';

export const equiposService = {
  async getEquipos() {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getEquipos:', error);
      throw error;
    }
    // Filter out deleted records in memory
    const filtered = (data || []).filter(e => !e.deleted_at);
    return filtered as Equipo[];
  },

  async getEquipoById(id: string) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Equipo;
  },

  async getEquiposByObra(obraId: string) {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Equipo[];
  },

  async getEquiposByTipo(tipo: 'Ascensor' | 'Escalera' | 'Rampa') {
    const { data, error } = await supabase
      .from('equipos')
      .select('*')
      .eq('tipo', tipo)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Equipo[];
  },

  async createEquipo(equipo: Omit<Equipo, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipos')
      .insert([equipo])
      .select()
      .single();

    if (error) throw error;
    return data as Equipo;
  },

  async updateEquipo(id: string, updates: Partial<Equipo>) {
    const { data, error } = await supabase
      .from('equipos')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Equipo;
  },

  async softDeleteEquipo(id: string) {
    return this.updateEquipo(id, { deleted_at: new Date().toISOString() });
  }
};
