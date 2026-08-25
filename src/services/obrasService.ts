import { supabase } from '../utils/supabaseClient';
import { Obra, Cliente, Equipo } from '../types/supabase';
import { completarCamposHeredados } from '../utils/camposHeredados';

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

      // Load notas for each obra
      console.log('📝 Loading notas for', filtered.length, 'obras...');
      const obrasWithNotas = await Promise.all(
        filtered.map(async (obra: any) => {
          try {
            const { data: notasData, error: notasError } = await supabase
              .from('notas')
              .select('*')
              .eq('obra_id', obra.id)
              .order('fecha', { ascending: false });

            if (notasError) {
              console.warn(`⚠️ Error loading notas for obra ${obra.codigo}:`, notasError);
              return { ...obra, notas: [] };
            }

            if (notasData && notasData.length > 0) {
              console.log(`✅ Obra ${obra.codigo} has ${notasData.length} nota(s)`);
            }

            return {
              ...obra,
              notas: notasData || []
            };
          } catch (err) {
            console.warn(`⚠️ Exception loading notas for obra ${obra.codigo}:`, err);
            return { ...obra, notas: [] };
          }
        })
      );

      console.log('📋 Total obras with notas:', obrasWithNotas.filter(o => o.notas && o.notas.length > 0).length);
      return obrasWithNotas as Obra[];
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
    const payload: any = { ...obra };
    // Completa las columnas NOT NULL heredadas que la app no envía
    await completarCamposHeredados('obras', payload);

    const { data, error } = await supabase
      .from('obras')
      .insert([payload])
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
