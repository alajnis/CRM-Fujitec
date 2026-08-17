import { Obra, LogEntry, FunnelStage } from '../types';

// Get current time in GMT-3 (Buenos Aires)
const getCurrentTimeGMT3 = () => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const gmt3Time = new Date(utcTime - (3 * 60 * 60 * 1000));
  return gmt3Time.toISOString().slice(0, 19).replace('T', ' ');
};

export function agregarLogEntry(
  obra: Obra,
  entry: Omit<LogEntry, 'id' | 'fecha'>,
  reseteaDiasSinAccion: boolean = false
): Obra {
  const nuevoLog: LogEntry = {
    id: `log-${Date.now()}`,
    fecha: getCurrentTimeGMT3(),
    ...entry
  };

  return {
    ...obra,
    historialLog: [...(obra.historialLog || []), nuevoLog],
    fechaUltimaActualizacion: reseteaDiasSinAccion
      ? new Date().toISOString().split('T')[0]
      : obra.fechaUltimaActualizacion
  };
}

// Reinicia el contador de días sin acción: cambio de estadio, actividad marcada
// como completada, o nota con el switch "reinicia días" activado.
export function logCambioEstado(
  obra: Obra,
  estadoAnterior: FunnelStage,
  estadoNuevo: FunnelStage,
  usuarioNombre: string,
  metodoCambio: 'dropdown' | 'dragdrop' = 'dropdown'
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'cambio_etapa',
    usuario: usuarioNombre,
    descripcion: `Cambio de etapa (${metodoCambio}): ${estadoAnterior} → ${estadoNuevo}`,
    estadoAnterior,
    estadoNuevo,
    detalles: { metodo: metodoCambio }
  }, true);
}

// No reinicia el contador: la reasignación de cliente no es una acción comercial
// sobre la oportunidad en sí.
export function logReasignacionCliente(
  obra: Obra,
  clienteAnteriorId: string,
  clienteNuevoId: string,
  clienteAnteriorNombre: string,
  clienteNuevoNombre: string,
  usuarioNombre: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'cliente_reasignado',
    usuario: usuarioNombre,
    descripcion: `Cliente reasignado: ${clienteAnteriorNombre} → ${clienteNuevoNombre}`,
    estadoAnterior: clienteAnteriorId,
    estadoNuevo: clienteNuevoId,
    detalles: {
      clienteAnterior: { id: clienteAnteriorId, nombre: clienteAnteriorNombre },
      clienteNuevo: { id: clienteNuevoId, nombre: clienteNuevoNombre }
    }
  });
}

// No reinicia el contador: cambiar el responsable dentro del mismo estadio no es
// una acción comercial sobre la oportunidad en sí.
export function logCambioUsuarioAsignado(
  obra: Obra,
  usuarioAnterior: string | undefined,
  usuarioNuevo: string,
  usuarioActual: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'usuario_asignado',
    usuario: usuarioActual,
    descripcion: `Usuario asignado: ${usuarioAnterior || 'Sin asignar'} → ${usuarioNuevo}`,
    estadoAnterior: usuarioAnterior || 'Sin asignar',
    estadoNuevo: usuarioNuevo
  });
}

export function logActividadCompletada(
  obra: Obra,
  actividadDescripcion: string,
  etapa: FunnelStage,
  completada: boolean,
  usuarioNombre: string
): Obra {
  const accion = completada ? 'actividad_completada' : 'actividad_desmarcada';
  const descripcionTexto = completada
    ? `Actividad completada en ${etapa}: ${actividadDescripcion}`
    : `Actividad desmarcada en ${etapa}: ${actividadDescripcion}`;

  // Marcar como completada reinicia el contador; desmarcar no.
  return agregarLogEntry(obra, {
    tipo: accion,
    usuario: usuarioNombre,
    descripcion: descripcionTexto,
    estadoAnterior: completada ? 'No completada' : 'Completada',
    estadoNuevo: completada ? 'Completada' : 'No completada',
    detalles: { etapa, actividad: actividadDescripcion }
  }, completada);
}

export function logNota(
  obra: Obra,
  contenido: string,
  usuarioNombre: string,
  reseteaDias: boolean
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'nota_agregada',
    usuario: usuarioNombre,
    descripcion: `Nota agregada${reseteaDias ? ' (reinicia contador de días)' : ''}`,
    detalles: {
      contenido: contenido.substring(0, 100),
      reseteaDias
    }
  }, reseteaDias);
}

// No reinicia el contador: agregar/quitar equipos no es una acción comercial
// sobre el estado de la oportunidad en sí.
export function logEquipoAgregado(
  obra: Obra,
  equipoNombre: string,
  equipoId: string,
  usuarioNombre: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'equipo_agregado',
    usuario: usuarioNombre,
    descripcion: `Equipo agregado: ${equipoNombre}`,
    detalles: { equipoId, equipoNombre }
  });
}

export function logEquipoRemovido(
  obra: Obra,
  equipoNombre: string,
  equipoId: string,
  usuarioNombre: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'equipo_removido',
    usuario: usuarioNombre,
    descripcion: `Equipo removido: ${equipoNombre}`,
    detalles: { equipoId, equipoNombre }
  });
}

// No reinicia el contador: editar datos generales de la obra no es una acción
// comercial sobre el estado de la oportunidad en sí.
export function logEdicionObra(
  obra: Obra,
  camposModificados: string[],
  usuarioNombre: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'edicion_obra',
    usuario: usuarioNombre,
    descripcion: `Obra editada: ${camposModificados.join(', ')}`,
    detalles: { campos: camposModificados }
  });
}

export function logEliminacionLogica(
  obra: Obra,
  usuarioNombre: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'eliminacion_logica',
    usuario: usuarioNombre,
    descripcion: 'Obra eliminada lógicamente',
    estadoAnterior: 'Activa',
    estadoNuevo: 'Eliminada',
    detalles: { eliminadaEn: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  });
}

export function logRestauracion(
  obra: Obra,
  usuarioNombre: string
): Obra {
  return agregarLogEntry(obra, {
    tipo: 'restauracion',
    usuario: usuarioNombre,
    descripcion: 'Obra restaurada desde eliminación lógica',
    estadoAnterior: 'Eliminada',
    estadoNuevo: 'Activa',
    detalles: { restauradaEn: new Date().toISOString().slice(0, 19).replace('T', ' ') }
  });
}
