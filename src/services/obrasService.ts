import { supabase } from '../utils/supabaseClient';
import { Obra, Cliente, Equipo } from '../types/supabase';

export const obrasService = {
  async getObras() {
    try {
      console.log('🔄 Fetching obras from Supabase...');
      const { data, error, status } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Obras response status:', status);
      if (error) {
        console.error('❌ Error in getObras:', error);
        throw error;
      }
      // Filter out deleted records in memory
      const filtered = (data || []).filter(o => !o.deleted_at);
      console.log(`✅ getObras returned ${filtered.length} records (${data?.length} total before filtering)`);
      return filtered as Obra[];
    } catch (err) {
      console.error('❌ Exception in getObras:', err);
      throw err;
    }
  },

  async getObraById(id: string) {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Obra;
  },

  async getObrasByCliente(clienteId: string) {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .eq('cliente_id', clienteId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Obra[];
  },

  async getObrasByEstapa(etapa: string) {
    const { data, error } = await supabase
      .from('obras')
      .select('*')
      .eq('etapa_actual', etapa)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Obra[];
  },

  async createObra(obra: Omit<Obra, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('obras')
      .insert([obra])
      .select()
      .single();

    if (error) throw error;
    return data as Obra;
  },

  async updateObra(id: string, updates: Partial<Obra>) {
    const { data, error } = await supabase
      .from('obras')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Obra;
  },

  async softDeleteObra(id: string) {
    return this.updateObra(id, { deleted_at: new Date().toISOString() });
  },

  async getObraWithDetails(id: string) {
    const { data: obraData, error: obraError } = await supabase
      .from('obras')
      .select('*')
      .eq('id', id)
      .single();

    if (obraError) throw obraError;

    const { data: clienteData, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', obraData.cliente_id)
      .single();

    if (clienteError) throw clienteError;

    const { data: equiposData, error: equiposError } = await supabase
      .from('equipos')
      .select('*')
      .eq('obra_id', id)
      .is('deleted_at', null);

    if (equiposError) throw equiposError;

    const { data: actividadesData, error: actividadesError } = await supabase
      .from('actividades')
      .select('*')
      .eq('obra_id', id)
      .is('deleted_at', null);

    if (actividadesError) throw actividadesError;

    return {
      obra: obraData as Obra,
      cliente: clienteData as Cliente,
      equipos: equiposData as Equipo[],
      actividades: actividadesData
    };
  }
};
