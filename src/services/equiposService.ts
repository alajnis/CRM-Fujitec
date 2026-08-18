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

    if (!error) return data as Equipo;

    // Si la base todavía exige obra_id (NOT NULL sin aflojar), reintentamos
    // colgando el equipo de una obra placeholder para no perder la carga.
    // Lo correcto es correr scripts/04-fix-constraints.sql; esto es la red.
    const esObraIdRequerida =
      error.code === '23502' && String(error.message).includes('obra_id');

    if (esObraIdRequerida && !(equipo as any).obra_id) {
      const obraPlaceholder = await this.obtenerObraPlaceholder();
      if (obraPlaceholder) {
        console.warn(
          '⚠️ equipos.obra_id sigue en NOT NULL: el equipo se asocia a la obra placeholder. ' +
          'Corré scripts/04-fix-constraints.sql para permitir equipos sin obra.'
        );
        const reintento = await supabase
          .from('equipos')
          .insert([{ ...equipo, obra_id: obraPlaceholder }])
          .select()
          .single();

        if (!reintento.error) return reintento.data as Equipo;
      }
    }

    throw error;
  },

  /**
   * Obra técnica que sirve de contenedor para equipos sin obra real, usada
   * sólo mientras equipos.obra_id siga siendo NOT NULL en la base.
   */
  async obtenerObraPlaceholder(): Promise<string | null> {
    const { data } = await supabase
      .from('obras')
      .select('id')
      .eq('nombre', '__SIN_OBRA__')
      .limit(1);

    if (data && data.length > 0) return data[0].id;

    const { data: creada, error } = await supabase
      .from('obras')
      .insert([{
        id: crypto.randomUUID(),
        nombre: '__SIN_OBRA__',
        descripcion: 'Contenedor interno para equipos sin obra asignada',
        etapa_actual: 'prospeccion',
        estado: 'activa',
        deleted_at: new Date().toISOString() // nace borrada: no aparece en el funnel
      }])
      .select('id')
      .single();

    if (error) {
      console.error('No se pudo crear la obra placeholder:', error);
      return null;
    }
    return creada.id;
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
