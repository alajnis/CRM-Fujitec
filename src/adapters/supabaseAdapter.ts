import { Obra, Cliente, Equipo, FunnelStage, ActividadPorEtapa } from '../types';
import type { Obra as SupabaseObra, Cliente as SupabaseCliente, Equipo as SupabaseEquipo } from '../types/supabase';

// Map Supabase etapa_actual to app FunnelStage
const mapEtapaToFunnelStage = (etapa: string | undefined): FunnelStage => {
  const mapping: Record<string, FunnelStage> = {
    'prospeccion': 'Solicitud',
    'evaluacion': 'En estudio de proyecto',
    'propuesta': 'Estimado',
    'negociacion': 'Cotización',
    'orden': 'Contratadas',
    'ejecucion': 'Contratadas',
    'cierre': 'Finalizadas'
  };
  return mapping[etapa || ''] || 'Solicitud';
};

const mapSupabaseEtapaToFunnelStage = (etapa: string | undefined): FunnelStage => {
  const mapping: Record<string, FunnelStage> = {
    'prospeccion': 'Solicitud',
    'evaluacion': 'En estudio de proyecto',
    'propuesta': 'Estimado',
    'negociacion': 'Cotización',
    'orden': 'Contratadas',
    'cierre': 'Finalizadas'
  };
  return mapping[etapa || ''] || 'Solicitud';
};

const mapFunnelStageToEtapa = (stage: FunnelStage): string => {
  const mapping: Record<FunnelStage, string> = {
    'Solicitud': 'prospeccion',
    'En estudio de proyecto': 'evaluacion',
    'Estimado': 'propuesta',
    'Cotización': 'negociacion',
    'Contratadas': 'orden',
    'Finalizadas': 'cierre',
    'Rechazadas': 'prospeccion'
  };
  return mapping[stage] || 'prospeccion';
};

export const supabaseAdapter = {
  // Convert Supabase Obra to App Obra
  toAppObra(supabaseObra: SupabaseObra, actividades: any[] = [], equipos: any[] = []): Obra {
    const actividadesDelObra = actividades
      .filter(a => a.obra_id === supabaseObra.id && !a.deleted_at)
      .map(a => this.toAppActividadPorEtapa(a));

    // Build equipoIds from equipos that have this obra_id
    const equipoIds = equipos
      .filter(e => e.obra_id === supabaseObra.id && !e.deleted_at)
      .map(e => e.id);

    // Get historialLog from JSONB column
    let historialLog = [];
    const logData = (supabaseObra as any).historial_log;
    if (logData) {
      try {
        // Handle both parsed objects and JSON strings
        if (typeof logData === 'string') {
          historialLog = JSON.parse(logData);
        } else if (Array.isArray(logData)) {
          historialLog = logData;
        }
      } catch (e) {
        console.error('Error parsing historial_log:', e);
        historialLog = [];
      }
    }

    return {
      id: supabaseObra.id,
      codigo: (supabaseObra as any).codigo || `A-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      nombre: supabaseObra.nombre,
      region: supabaseObra.provincia === 'Argentina' ? 'Argentina' : 'Uruguay',
      clienteId: supabaseObra.cliente_id,
      montoUSD: supabaseObra.presupuesto || 0,
      estado: mapEtapaToFunnelStage(supabaseObra.etapa_actual),
      fechaIngreso: supabaseObra.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      fechaUltimaActualizacion: supabaseObra.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      observaciones: supabaseObra.notas || '',
      usuarioAsignado: supabaseObra.created_by,
      equipoIds,
      actividades: [],
      actividadesPorEtapa: actividadesDelObra,
      historialLog
    };
  },

  // Convert App Obra to Supabase Obra
  toSupabaseObra(appObra: Obra) {
    const data: any = {
      nombre: appObra.nombre,
      cliente_id: appObra.clienteId,
      descripcion: appObra.observaciones,
      provincia: appObra.region,
      presupuesto: appObra.montoUSD,
      etapa_actual: mapFunnelStageToEtapa(appObra.estado),
      notas: appObra.observaciones
    };

    // Only include codigo if it exists
    if (appObra.codigo) {
      data.codigo = appObra.codigo;
    }

    // Only include created_by if it's a valid UUID (not mock user-N strings)
    if (appObra.usuarioAsignado && this.isValidUUID(appObra.usuarioAsignado)) {
      data.created_by = appObra.usuarioAsignado;
    }

    // Only include historial_log if it exists and has content
    console.log('📤 toSupabaseObra historialLog check - exists:', !!appObra.historialLog, 'isArray:', Array.isArray(appObra.historialLog), 'length:', appObra.historialLog?.length);
    if (appObra.historialLog && Array.isArray(appObra.historialLog) && appObra.historialLog.length > 0) {
      console.log('📤 Adding historial_log to data:', appObra.historialLog);
      data.historial_log = appObra.historialLog;
    }

    console.log('📤 toSupabaseObra final data:', data);
    return data;
  },

  // Helper: Check if string is valid UUID format
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Convert Supabase Cliente to App Cliente
  toAppCliente(supabaseCliente: SupabaseCliente): Cliente {
    return {
      id: supabaseCliente.id,
      razonSocial: supabaseCliente.nombre,
      contactoPrincipal: (supabaseCliente as any).contacto_principal || '',
      cargo: (supabaseCliente as any).cargo || '',
      email: supabaseCliente.email || '',
      telefono: supabaseCliente.telefono || '',
      direccion: supabaseCliente.direccion || '',
      region: supabaseCliente.provincia === 'Argentina' ? 'Argentina' : 'Uruguay',
      cuitRut: ''
    };
  },

  // Convert App Cliente to Supabase Cliente
  toSupabaseCliente(appCliente: Cliente) {
    return {
      nombre: appCliente.razonSocial,
      contacto_principal: appCliente.contactoPrincipal || '',
      cargo: appCliente.cargo || '',
      email: appCliente.email || '',
      telefono: appCliente.telefono || '',
      direccion: appCliente.direccion || '',
      ciudad: '',
      provincia: appCliente.region || 'Uruguay',
      pais: 'Argentina',
      tipo: 'empresa',
      estado: 'activo'
    };
  },

  // Convert Supabase Equipo to App Equipo
  toAppEquipo(supabaseEquipo: SupabaseEquipo): Equipo {
    const velocidadStr = supabaseEquipo.velocidad || '';
    const capacidadStr = supabaseEquipo.capacidad || '';

    // Parse velocidad: extract number from "1.75 m/s" format
    let velocidadMS = 0;
    if (velocidadStr && velocidadStr.trim()) {
      const parsed = parseFloat(velocidadStr.split(' ')[0]);
      velocidadMS = isNaN(parsed) ? 0 : parsed;
    }

    // Parse capacidad: extract number from "1000 kg" format
    let capacidadKg = 0;
    if (capacidadStr && capacidadStr.trim()) {
      const parsed = parseInt(capacidadStr.split(' ')[0], 10);
      capacidadKg = isNaN(parsed) ? 0 : parsed;
    }

    return {
      id: supabaseEquipo.id,
      codigoUnico: supabaseEquipo.serial || '',
      nombre: supabaseEquipo.modelo || 'Equipo',
      modelo: supabaseEquipo.modelo || '',
      tipo: supabaseEquipo.tipo as any,
      velocidadMS,
      capacidadKg,
      paradas: supabaseEquipo.puertas || 0,
      observaciones: supabaseEquipo.notas || '',
      isDeleted: !!supabaseEquipo.deleted_at
    };
  },

  // Convert App Equipo to Supabase Equipo
  toSupabaseEquipo(appEquipo: Equipo, obraId: string) {
    return {
      obra_id: obraId,
      tipo: appEquipo.tipo,
      modelo: appEquipo.modelo,
      serial: appEquipo.codigoUnico,
      velocidad: `${appEquipo.velocidadMS} m/s`,
      capacidad: `${appEquipo.capacidadKg} kg`,
      puertas: appEquipo.paradas,
      notas: appEquipo.observaciones
    };
  },

  // Convert Supabase Actividad to App ActividadPorEtapa
  toAppActividadPorEtapa(supabaseActividad: any): ActividadPorEtapa {
    // Etapa is stored in the 'tipo' field (e.g., 'prospeccion', 'evaluacion', etc.)
    const etapaDelTipo = supabaseActividad.tipo || supabaseActividad.etapa || 'prospeccion';
    return {
      id: supabaseActividad.id,
      etapa: mapSupabaseEtapaToFunnelStage(etapaDelTipo),
      descripcion: supabaseActividad.descripcion || '',
      completada: supabaseActividad.estado === 'completada',
      fechaCompletada: supabaseActividad.fecha_completacion,
      completadaPor: supabaseActividad.usuario_asignado
    };
  },

  // Convert App ActividadPorEtapa to Supabase Actividad
  toSupabaseActividad(appActividad: ActividadPorEtapa, obraId: string) {
    const data: any = {
      descripcion: appActividad.descripcion,
      estado: appActividad.completada ? 'completada' : 'pendiente',
      fecha_completacion: appActividad.completada ? appActividad.fechaCompletada : null,
      tipo: mapFunnelStageToEtapa(appActividad.etapa)
    };

    // Only include usuario_asignado if it's a valid UUID
    if (appActividad.completadaPor && this.isValidUUID(appActividad.completadaPor)) {
      data.usuario_asignado = appActividad.completadaPor;
    }

    console.log('📤 toSupabaseActividad final data:', data);
    return data;
  }
};
