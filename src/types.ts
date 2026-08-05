export type Region = 'Todas' | 'Argentina' | 'Uruguay';

export type EquipmentType = 
  | 'Todos'
  | 'Ascensor de Pasajeros'
  | 'Ascensor de Carga / Montacargas'
  | 'Alta Velocidad'
  | 'Escalera Mecánica / Rampa';

export type FunnelStage =
  | 'Cotización'
  | 'Presentada'
  | 'En Negociación'
  | 'Adjudicada'
  | 'Perdida';

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
  tipoEquipo: EquipmentType;
  cantidadEquipos: number;
  estado: FunnelStage;
  fechaIngreso: string; // YYYY-MM-DD
  fechaUltimaActualizacion: string; // YYYY-MM-DD
  observaciones: string;
  responsable: string;
  hardwareSpecs: HardwareSpecs;
  rentabilidadEstimada?: number; // % de rentabilidad
  actividades?: Actividad[];
  equipments?: ObraEquipment[];
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
  velocidadMS: number;
  paradas: number;
  tipoSalaMaquinas: 'Con Sala de Máquinas' | 'Sin Sala de Máquinas (MRL)';
  capacidadKg: number;
  modelo: string;
  tipo: EquipmentType;
}

export interface PlanAnual {
  id: string;
  año: number;
  montoUSDPlan: number;
  equiposPlan: number;
}

export interface ConfiguracionApp {
  proximoCodigoObra: string; // Ej: A-5100
  planAnualActual: number;
}
