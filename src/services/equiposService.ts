import { supabase } from '../utils/supabaseClient';
import { Equipo } from '../types/supabase';

/** Obra técnica que agrupa los equipos del catálogo todavía sin obra real. */
const OBRA_CONTENEDORA = '__EQUIPOS_SIN_OBRA__';

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

  /**
   * Crea un equipo. Si viene sin obra, lo cuelga de una obra contenedora
   * interna: la columna `equipos.obra_id` es NOT NULL en la base y un equipo
   * del catálogo tiene que poder existir antes de asignarse a una obra.
   *
   * La obra contenedora nace con `deleted_at`, así que queda fuera del funnel,
   * de los listados y de los totales. Al asignar el equipo a una obra real,
   * `obra_id` se sobrescribe y el vínculo con el contenedor desaparece.
   */
  async createEquipo(equipo: Omit<Equipo, 'id' | 'created_at' | 'updated_at'>) {
    let payload: any = { ...equipo };

    if (!payload.obra_id) {
      payload.obra_id = await this.obtenerObraContenedora();
    }

    const { data, error } = await supabase
      .from('equipos')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Equipo;
  },

  /**
   * Id de la obra contenedora de equipos sin asignar, creándola si hace falta.
   * Se cachea en memoria porque se consulta en cada alta de equipo.
   */
  _obraContenedoraId: null as string | null,

  async obtenerObraContenedora(): Promise<string | null> {
    if (this._obraContenedoraId) return this._obraContenedoraId;

    const { data } = await supabase
      .from('obras')
      .select('id')
      .eq('nombre', OBRA_CONTENEDORA)
      .limit(1);

    if (data && data.length > 0) {
      this._obraContenedoraId = data[0].id;
      return this._obraContenedoraId;
    }

    const { data: creada, error } = await supabase
      .from('obras')
      .insert([{
        id: crypto.randomUUID(),
        nombre: OBRA_CONTENEDORA,
        descripcion: 'Registro interno: agrupa los equipos que aún no tienen obra asignada.',
        etapa_actual: 'prospeccion',
        estado: 'activa',
        // Nace marcada como borrada para quedar fuera de toda vista de negocio
        deleted_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (error) {
      console.error('No se pudo crear la obra contenedora de equipos:', error);
      return null;
    }

    this._obraContenedoraId = creada.id;
    return this._obraContenedoraId;
  },

  async updateEquipo(id: string, updates: Partial<Equipo>) {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };

    // Desasignar de una obra no puede dejar obra_id en null (la columna es
    // NOT NULL): el equipo vuelve a la obra contenedora del catálogo.
    if ('obra_id' in payload && !payload.obra_id) {
      payload.obra_id = await this.obtenerObraContenedora();
    }

    const { data, error } = await supabase
      .from('equipos')
      .update(payload)
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
