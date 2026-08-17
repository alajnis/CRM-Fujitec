export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'vendedor' | 'vendor' | 'supervisor' | 'cliente';
  status: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  tipo: string;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  created_by?: string;
  deleted_at?: string;
}

export interface Obra {
  id: string;
  nombre: string;
  cliente_id: string;
  descripcion?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  estado: string;
  presupuesto?: number;
  presupuesto_aprobado?: number;
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  fecha_fin_real?: string;
  etapa_actual: 'prospeccion' | 'evaluacion' | 'propuesta' | 'negociacion' | 'orden' | 'ejecucion' | 'cierre';
  notas?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  deleted_at?: string;
  historial_log?: any; // JSONB: Array of audit log entries
}

export interface TipoEquipo {
  id: string;
  nombre: string;
  descripcion?: string;
  created_at: string;
}

export interface Equipo {
  id: string;
  obra_id: string;
  tipo_equipo_id: string;
  tipo: 'Ascensor' | 'Escalera' | 'Rampa';
  modelo?: string;
  serial?: string;
  velocidad?: string;
  capacidad?: string;
  puertas?: number;
  energia?: string;
  especificaciones?: string;
  estado: string;
  estado_instalacion: string;
  fecha_instalacion_prevista?: string;
  fecha_instalacion_real?: string;
  notas?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  deleted_at?: string;
}

export interface Actividad {
  id: string;
  obra_id: string;
  tipo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_proceso' | 'completada';
  fecha_creacion: string;
  fecha_vencimiento?: string;
  fecha_completacion?: string;
  usuario_asignado?: string;
  usuario_creador?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface StageLog {
  id: string;
  obra_id: string;
  etapa_anterior?: string;
  etapa_nueva: string;
  fecha_cambio: string;
  usuario_id?: string;
  motivo?: string;
  created_at: string;
}

export interface AnnualPlan {
  id: string;
  usuario_id: string;
  ano: number;
  mes: number;
  objetivo_ventas?: number;
  objetivo_obras?: number;
  objetivo_equipos?: number;
  real_ventas?: number;
  real_obras?: number;
  real_equipos?: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface Nota {
  id: string;
  obra_id?: string;
  usuario_id?: string;
  contenido: string;
  tipo: string;
  es_publica: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}
