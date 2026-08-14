import { supabase } from '../utils/supabaseClient';
import { Actividad } from '../types/supabase';

export const actividadesService = {
  async getActividades() {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Actividad[];
  },

  async getActividadById(id: string) {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Actividad;
  },

  async getActividadesByObra(obraId: string) {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('obra_id', obraId)
      .is('deleted_at', null)
      .order('fecha_vencimiento', { ascending: true });

    if (error) throw error;
    return data as Actividad[];
  },

  async getActividadesByEstado(estado: 'pendiente' | 'en_proceso' | 'completada') {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .eq('estado', estado)
      .is('deleted_at', null)
      .order('fecha_vencimiento', { ascending: true });

    if (error) throw error;
    return data as Actividad[];
  },

  async createActividad(actividad: Omit<Actividad, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('actividades')
      .insert([actividad])
      .select()
      .single();

    if (error) throw error;
    return data as Actividad;
  },

  async updateActividad(id: string, updates: Partial<Actividad>) {
    const { data, error } = await supabase
      .from('actividades')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Actividad;
  },

  async softDeleteActividad(id: string) {
    return this.updateActividad(id, { deleted_at: new Date().toISOString() });
  }
};
