import { supabase } from '../utils/supabaseClient';
import { PropuestaTecnicoEconomica, PropuestaVersion } from '../types';

const TABLE_NAME = 'propuestas';
const BUCKET_NAME = 'propuestas';
const BUCKET_ANEXOS = 'propuestas-anexos';
const LOCAL_KEY = 'propuestas-tecnico-economicas';

/** Nombres con los que se suben los anexos institucionales al bucket. */
export const ARCHIVOS_ANEXOS = {
  caracteristicasGenerales: 'caracteristicas-generales.pdf',
  ayudaGremioConSala: 'ayuda-gremio-con-sala.pdf',
  ayudaGremioSinSala: 'ayuda-gremio-sin-sala.pdf'
} as const;

/**
 * Espejo local de las propuestas. Mantiene la funcionalidad utilizable si la
 * tabla `propuestas` todavía no fue creada en Supabase.
 */
const leerLocal = (): Record<string, PropuestaTecnicoEconomica> => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
};

const guardarLocal = (propuesta: PropuestaTecnicoEconomica) => {
  try {
    const todas = leerLocal();
    todas[propuesta.obraId] = propuesta;
    localStorage.setItem(LOCAL_KEY, JSON.stringify(todas));
  } catch (error) {
    console.error('No se pudo guardar la propuesta localmente:', error);
  }
};

const aSupabase = (propuesta: PropuestaTecnicoEconomica) => ({
  id: propuesta.id,
  obra_id: propuesta.obraId,
  destinatario: propuesta.destinatario,
  precios: propuesta.precios,
  clausulas: propuesta.clausulas,
  carta_presentacion: propuesta.cartaPresentacion,
  textos_especificaciones: propuesta.textosEspecificaciones,
  opciones_tecnicas: propuesta.opcionesTecnicas,
  equipo_ids_incluidos: propuesta.equipoIdsIncluidos,
  versiones: propuesta.versiones,
  ultima_version: propuesta.ultimaVersion,
  fecha_creacion: propuesta.fechaCreacion,
  fecha_actualizacion: propuesta.fechaActualizacion
});

const desdeSupabase = (fila: any): PropuestaTecnicoEconomica => ({
  id: fila.id,
  obraId: fila.obra_id,
  destinatario: fila.destinatario,
  precios: fila.precios,
  clausulas: fila.clausulas,
  cartaPresentacion: fila.carta_presentacion,
  textosEspecificaciones: fila.textos_especificaciones,
  opcionesTecnicas: fila.opciones_tecnicas,
  equipoIdsIncluidos: fila.equipo_ids_incluidos || [],
  versiones: fila.versiones || [],
  ultimaVersion: fila.ultima_version || 0,
  fechaCreacion: fila.fecha_creacion,
  fechaActualizacion: fila.fecha_actualizacion
});

export const propuestasService = {
  /** Propuesta de una obra, o null si todavía no se creó. */
  async getPropuestaPorObra(obraId: string): Promise<PropuestaTecnicoEconomica | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('obra_id', obraId)
        .maybeSingle();

      if (error) throw error;
      if (data) return desdeSupabase(data);
    } catch (error) {
      console.warn('Propuesta no disponible en Supabase, se usa copia local:', error);
    }

    return leerLocal()[obraId] || null;
  },

  async guardarPropuesta(propuesta: PropuestaTecnicoEconomica): Promise<PropuestaTecnicoEconomica> {
    const actualizada: PropuestaTecnicoEconomica = {
      ...propuesta,
      fechaActualizacion: new Date().toISOString()
    };

    guardarLocal(actualizada);

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(aSupabase(actualizada), { onConflict: 'obra_id' });
      if (error) throw error;
    } catch (error) {
      console.warn('No se pudo sincronizar la propuesta con Supabase:', error);
    }

    return actualizada;
  },

  /**
   * Archiva el PDF emitido. La trazabilidad de versiones depende de esto:
   * permite recuperar exactamente lo que se envió aunque los datos cambien.
   */
  async subirPdfVersion(
    obraId: string,
    version: number,
    nombreArchivo: string,
    blob: Blob
  ): Promise<string | null> {
    const ruta = `${obraId}/V${version}-${nombreArchivo}`;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(ruta, blob, { contentType: 'application/pdf', upsert: true });

      if (error) throw error;
      return ruta;
    } catch (error) {
      console.warn('No se pudo archivar el PDF de la versión:', error);
      return null;
    }
  },

  /** URL temporal para re-descargar una versión archivada. */
  async getUrlVersion(storagePath: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, 3600);

      if (error) throw error;
      return data?.signedUrl || null;
    } catch (error) {
      console.warn('No se pudo obtener el enlace de la versión:', error);
      return null;
    }
  },

  async registrarVersion(
    propuesta: PropuestaTecnicoEconomica,
    version: PropuestaVersion
  ): Promise<PropuestaTecnicoEconomica> {
    return this.guardarPropuesta({
      ...propuesta,
      versiones: [...propuesta.versiones, version],
      ultimaVersion: version.version
    });
  },

  /** Descarga un anexo institucional del bucket, o null si no está cargado. */
  async descargarAnexo(nombreArchivo: string): Promise<ArrayBuffer | null> {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_ANEXOS).download(nombreArchivo);
      if (error) throw error;
      return data ? await data.arrayBuffer() : null;
    } catch {
      // Sin anexo cargado el documento se emite igual, solo sin esa sección.
      return null;
    }
  },

  /** Qué anexos están disponibles, para mostrarlo en la pantalla. */
  async listarAnexosDisponibles(): Promise<Set<string>> {
    try {
      const { data, error } = await supabase.storage.from(BUCKET_ANEXOS).list();
      if (error) throw error;
      return new Set((data || []).map((archivo) => archivo.name));
    } catch {
      return new Set();
    }
  },

  async subirAnexo(nombreArchivo: string, archivo: File): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_ANEXOS)
        .upload(nombreArchivo, archivo, { contentType: 'application/pdf', upsert: true });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('No se pudo subir el anexo:', error);
      return false;
    }
  }
};
