import { supabase } from '../utils/supabaseClient';
import { Equipo } from '../types/supabase';
import { completarCamposHeredados } from '../utils/camposHeredados';

/** Obra técnica que agrupa los equipos del catálogo todavía sin obra real. */
const OBRA_CONTENEDORA = '__EQUIPOS_SIN_OBRA__';

/**
 * Marca en `notas` que el equipo no tiene obra real: su `obra_id` sólo existe
 * porque la columna es NOT NULL. La UI usa esto para no mostrarlo asignado.
 */
export const SIN_OBRA_TAG = '[[sin-obra]]';

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
   * Crea un equipo. La columna `equipos.obra_id` es NOT NULL, pero un equipo
   * del catálogo tiene que poder existir antes de asignarse a una obra, así
   * que en ese caso apunta a una obra contenedora y se marca con SIN_OBRA_TAG.
   * El adapter usa esa marca para no mostrarlo como asignado en ninguna vista.
   */
  async createEquipo(equipo: Omit<Equipo, 'id' | 'created_at' | 'updated_at'>) {
    const payload: any = { ...equipo };

    if (!payload.obra_id) {
      payload.obra_id = await this.obtenerObraContenedora();
      // Dejamos constancia de que ese obra_id es sólo relleno
      payload.notas = `${payload.notas || ''} ${SIN_OBRA_TAG}`.trim();
    }

    // La tabla tiene columnas NOT NULL que la app no maneja (heredadas de un
    // modelo anterior). En vez de irlas descubriendo de a una por error, se
    // completan copiando los valores de un equipo que ya exista.
    await completarCamposHeredados('equipos', payload);

    const { data, error } = await supabase
      .from('equipos')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Equipo;
  },

  /**
   * Id de la obra contenedora de equipos sin asignar.
   *
   * Primero busca la obra técnica; si no está, intenta crearla reutilizando el
   * cliente de una obra existente (obras.cliente_id también es NOT NULL). Si
   * tampoco puede crearla, cae a cualquier obra ya borrada, y como último
   * recurso a la más antigua: lo importante es tener un obra_id válido, porque
   * un equipo sin ancla directamente no se puede guardar.
   */
  _obraContenedoraId: null as string | null,

  async obtenerObraContenedora(): Promise<string | null> {
    if (this._obraContenedoraId) return this._obraContenedoraId;

    const { data: existente } = await supabase
      .from('obras')
      .select('id')
      .eq('nombre', OBRA_CONTENEDORA)
      .limit(1);

    if (existente && existente.length > 0) {
      this._obraContenedoraId = existente[0].id;
      return this._obraContenedoraId;
    }

    // Necesitamos un cliente_id válido: tomamos el de cualquier obra existente
    const { data: obraModelo } = await supabase
      .from('obras')
      .select('cliente_id')
      .not('cliente_id', 'is', null)
      .limit(1);

    const clienteId = obraModelo?.[0]?.cliente_id;

    if (clienteId) {
      const obraContenedora: any = {
        id: crypto.randomUUID(),
        nombre: OBRA_CONTENEDORA,
        cliente_id: clienteId,
        descripcion: 'Registro interno: agrupa los equipos que aún no tienen obra asignada.',
        etapa_actual: 'prospeccion',
        estado: 'activa',
        // Nace marcada como borrada para quedar fuera de toda vista de negocio
        deleted_at: new Date().toISOString()
      };
      await completarCamposHeredados('obras', obraContenedora);

      const { data: creada, error } = await supabase
        .from('obras')
        .insert([obraContenedora])
        .select('id')
        .single();

      if (!error && creada) {
        this._obraContenedoraId = creada.id;
        return this._obraContenedoraId;
      }
      console.warn('No se pudo crear la obra contenedora, se usa una existente:', error);
    }

    // Fallback: una obra ya borrada, o la más antigua que haya
    const { data: borrada } = await supabase
      .from('obras')
      .select('id')
      .not('deleted_at', 'is', null)
      .limit(1);

    if (borrada && borrada.length > 0) {
      this._obraContenedoraId = borrada[0].id;
      return this._obraContenedoraId;
    }

    const { data: cualquiera } = await supabase
      .from('obras')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);

    this._obraContenedoraId = cualquiera?.[0]?.id ?? null;
    return this._obraContenedoraId;
  },

  async updateEquipo(id: string, updates: Partial<Equipo>) {
    const payload: any = { ...updates, updated_at: new Date().toISOString() };

    if ('obra_id' in payload) {
      if (!payload.obra_id) {
        // Desasignar no puede dejar obra_id en null (la columna es NOT NULL):
        // el equipo vuelve al contenedor y queda marcado como sin obra.
        payload.obra_id = await this.obtenerObraContenedora();
        payload.notas = `${(payload.notas || '').replace(SIN_OBRA_TAG, '').trim()} ${SIN_OBRA_TAG}`.trim();
      } else {
        // Se asigna a una obra real: sacamos la marca
        payload.notas = (payload.notas || '').replace(SIN_OBRA_TAG, '').trim();
      }
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
