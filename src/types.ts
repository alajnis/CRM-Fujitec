export type Region = 'Todas' | 'Argentina' | 'Uruguay';

export type EquipmentMainType =
  | 'Ascensor'
  | 'Escalera'
  | 'Rampa';

export type EquipmentType =
  | 'Todos'
  | 'Ascensor'
  | 'Escalera'
  | 'Rampa';

export type AscensorUso =
  | 'Pasajeros'
  | 'Montacargas'
  | 'Alta Velocidad';

export type FunnelStage =
  | 'Solicitud'
  | 'En estudio de proyecto'
  | 'Estimado'
  | 'Cotización'
  | 'Contratadas'
  | 'Finalizadas'
  | 'Rechazadas';

export interface HardwareSpecs {
  velocidadMS: number; // m/s
  paradas: number;
  tipoSalaMaquinas: 'Con Sala de Máquinas' | 'Sin Sala de Máquinas (MRL)';
  capacidadKg: number;
  modelo: string; // Ej: Fujitec ZEXIA, VIRIDIS, REXIA, ELIGHT
}

export interface ClienteContact {
  id: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
}

export interface Cliente {
  id: string;
  razonSocial: string;
  contactoPrincipal: string;
  cargo: string;
  email: string;
  telefono: string;
  direccion: string;
  region: 'Argentina' | 'Uruguay';
  cuitRut: string;
  contactos?: ClienteContact[];
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface Actividad {
  id: string;
  descripcion: string;
  fecha: string; // YYYY-MM-DD
  autor: string;
}

export interface ObraEquipment {
  id: string;
  tipo: EquipmentType;
  cantidad: number;
  especificaciones: string;
}

export interface Obra {
  id: string;
  codigo: string; // Ej: A-4631
  nombre: string; // Ej: CHATEAU PDE T3
  region: 'Argentina' | 'Uruguay';
  clienteId: string;
  montoUSD: number;
  estado: FunnelStage;
  fechaIngreso: string; // YYYY-MM-DD
  fechaUltimaActualizacion: string; // YYYY-MM-DD
  observaciones: string;
  usuarioAsignado?: string; // ID del usuario responsable
  hardwareSpecs?: HardwareSpecs;
  rentabilidadEstimada?: number; // % de rentabilidad
  equipoIds?: string[]; // IDs de equipos asociados
  actividades?: Actividad[];
  actividadesPorEtapa?: ActividadPorEtapa[];
  equipments?: ObraEquipment[];
  etapaLogs?: EtapaLog[];
  historialLog?: LogEntry[]; // Registro completo de auditoría
  notas?: Nota[];
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface CartaOferta {
  id: string;
  obraId: string;
  propuestaEconomicaUSD: number;
  validezDias: number;
  plazoEntregaSemanas: number;
  garantiaAnos: number; // Predeterminado 3 años
  terminosPago: string;
  notasTecnicas: string;
  resumenEjecutivoIA?: string;
  fechaGeneracion: string;
  generadaPor: string;
}

export interface MonthlySalesData {
  mes: string;
  ventasRealesUSD: number;
  ventasAcumuladasUSD: number;
  planAcumuladoUSD: number;
  equiposVendidos: number;
  equiposPlan: number;
}

export interface KpiSummary {
  cumplimientoPorcentaje: number;
  volumenAcumuladoEquipos: number;
  volumenPlanEquipos: number;
  montoTotalCotizadoUSD: number;
  montoPlanAnualUSD: number;
}

export type UserRole = 'superusuario' | 'usuario';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  passwordHash?: string; // No enviar en frontend
}

export interface EtapaLog {
  id: string;
  etapa: FunnelStage;
  fechaCambio: string; // YYYY-MM-DD HH:mm:ss
  usuarioId: string;
  accion: 'cambio_etapa' | 'nota_agregada' | 'edicion_obra';
}

export interface Equipo {
  id: string;
  codigoUnico: string;
  nombre: string;
  modelo: string;
  tipo: EquipmentMainType;
  tipoSalaMaquinas?: 'Con Sala de Máquinas' | 'Sin Sala de Máquinas (MRL)';
  velocidadMS: number;
  capacidadKg: number;
  paradas: number;

  // Ascensor specific
  ascensorNumero?: string;
  pasadizoNumero?: string;
  codigoFabricacion?: string;
  uso?: AscensorUso;
  alturaTotal?: number;
  recorrido?: number;
  zonaExpress?: string;
  anchoPasadizo?: number;
  profundidadPasadizo?: number;
  anchoCabina?: number;
  profundidadCabina?: number;
  altoCabina?: number;
  cantidadEquipos?: number;
  designacionPisos?: string;
  origenEquipo?: string;
  capacidadPersonas?: number;
  dobleAcceso?: boolean;
  accesosFrente?: number;
  accesosContrafrente?: number;
  grupo?: string;
  control?: string;
  maniobra?: string;
  tipoApertura?: string;
  doorOP?: number;
  doorH?: number;
  operadorPuerta?: string;
  guiasCoche?: string;
  guiasContrapeso?: string;
  roping?: string;
  contrapeso?: string;
  desmontaje?: boolean;
  vigasSeparacion?: boolean;
  revestimientos?: boolean;
  angulosEntrada?: boolean;
  operacionContraIncendio?: boolean;
  obraCivil?: boolean;
  vonic?: boolean;
  wtb?: boolean;
  marmoleria?: boolean;
  bgmSpeaker?: boolean;
  elvic?: boolean;
  marcosConDintel?: boolean;
  marcoCubreMochetas?: boolean;
  anchoDintel?: number;
  anchoMochetas?: number;

  // Escalera/Rampa specific
  designacionPasadizo?: string;
  rise?: number;
  escalonesPlanso?: number;
  cantidadTramos?: number;
  destino?: string;
  inclinacion?: number;
  ancho?: number;
  disposicionEquipos?: string;
  pisoIngreso?: string;
  pisoSalida?: string;
  balustrada?: string;
  recepcionProvisoria?: string;
  fechaRDP?: string;
  recepcionDefinitiva?: string;
  fechaRD?: string;
  eskalonerosA?: boolean;
  portico?: boolean;
  ahorroEnergia?: boolean;
  ganchosEnLosa?: boolean;
  detallesRevestimientos?: string;

  // Observaciones generales
  observaciones?: string;

  // Auditing
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface PlanAnual {
  id: string;
  año: number;
  montoUSDPlan: number;
  equiposPlan: number;
}

export interface Nota {
  id: string;
  obraId: string;
  contenido: string;
  autor: string;
  fecha: string; // YYYY-MM-DD HH:mm:ss
  reseteaDias: boolean;
}

export interface ConfiguracionDiasEtapa {
  etapa: FunnelStage;
  diasMaximosSinAccion: number;
}

export interface ConfiguracionApp {
  proximoCodigoObra: string; // Ej: A-5100
  planAnualActual: number;
  diasPorEtapa?: ConfiguracionDiasEtapa[];
}

export interface ActividadPorEtapa {
  id: string;
  etapa: FunnelStage;
  descripcion: string;
  completada: boolean;
  fechaCompletada?: string; // YYYY-MM-DD HH:mm:ss
  completadaPor?: string; // usuario que marcó como completada
}

export interface LogEntry {
  id: string;
  fecha: string; // YYYY-MM-DD HH:mm:ss
  usuario: string; // nombre del usuario
  tipo: 'cambio_etapa' | 'nota_agregada' | 'actividad_completada' | 'actividad_desmarcada' | 'cliente_reasignado' | 'usuario_asignado' | 'equipo_agregado' | 'equipo_removido' | 'edicion_obra' | 'eliminacion_logica' | 'restauracion';
  descripcion: string; // texto legible
  estadoAnterior?: string; // valor anterior cuando aplique
  estadoNuevo?: string; // valor nuevo cuando aplique
  detalles?: Record<string, any>; // información adicional
}
