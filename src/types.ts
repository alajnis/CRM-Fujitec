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
  /**
   * Contraseña de acceso. El admin la define al crear el usuario y puede
   * verla/cambiarla desde Configuración → Usuarios.
   */
  password?: string;
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

// ============================================================================
// PROPUESTA TÉCNICO-ECONÓMICA
// El documento final es el ensamblado de 5 partes (ver docs de referencia):
//   1. Carta de presentación   2. Oferta económica   3. Especificaciones
//   4. Características generales (anexo PDF)   5. Ayuda de gremio (anexo PDF)
// ============================================================================

/** Destinatario de la propuesta. Se precarga del cliente de la obra. */
export interface PropuestaDestinatario {
  empresa: string;
  direccion: string;
  localidad: string;
  atencionA: string; // "Arq. Julián Torresetti"
  referencia: string; // "Oferta COSTA VIA T2 (A-4550)"
  numeroFA: string; // "FA 24-0018"
  fecha: string; // YYYY-MM-DD
}

/** Desglose económico. Los montos se cargan a mano (el de la obra es referencia). */
export interface PropuestaPrecios {
  parteImportadaUSD: number;
  gastosDespachoUSD: number;
  instalacionNacionalARS: number;
  /** Mantenimiento mensual sin IVA, por equipo. */
  mantenimientoMensual: { equipoId: string; valorUnitarioARS: number }[];
  /** Base de ajuste UOM declarada en el documento. */
  baseAjusteUOM: string; // "1 de febrero de 2025"
  importacionACargoDelCliente: boolean;
}

/**
 * Textos y cláusulas. Cada campo puede venir de la plantilla global
 * (Configuración) o estar sobrescrito puntualmente en esta propuesta.
 */
export interface PropuestaClausulas {
  garantiaAnos: number;
  validezDias: number;
  plazoEntrega: string;
  /** Procedencia declarada de los equipos: "China", "Corea/China", etc. */
  origenEquipos: string;
  /** Cierre de la carta, antes de la firma. */
  saludoFinal: string;
  tareasIncluidas: string[];
  tareasNoIncluidas: string[];
  formaPagoImportado: string[];
  formaPagoNacional: string[];
  notasPrecio: string[];
  /** Campos que el usuario editó a mano en esta propuesta (no heredan de la plantilla). */
  camposSobrescritos: string[];
}

/** Párrafos de la carta de presentación institucional (documento 3). */
export interface PropuestaCartaPresentacion {
  parrafos: string[];
  hitos: string[];
  cierre: string[];
}

/**
 * Párrafos técnicos de las especificaciones (documento 5). Son texto estándar
 * de Fujitec, pero editables: en el Word el usuario podía ajustarlos.
 * Las claves espejan las secciones numeradas del documento.
 */
export interface PropuestaTextosEspecificaciones {
  motores: string;
  plataforma: string;
  bastidor: string;
  piso: string;
  jambaFrente: string;
  zocalos: string;
  umbral: string;
  ventilacion: string;
  pasamanos: string;
  reguladorVelocidad: string;
  freno: string;
  sensorPeso: string;
  amortiguador: string;
  finCarrera: string;
  dispositivoEmergencia: string;
  cerraduras: string;
  luzEmergencia: string;
  paracaidas: string;
  puertasSeguridad: string;
  guias: string;
  alimentacion: string;
  maniobra: string;
  umbrales: string;
  tableroCabina: string[];
  textoElvic: string;
}

/**
 * Opciones de las plantillas que hoy se resuelven borrando a mano las
 * variantes alternativas del Word (cielorraso, contrapeso, marcos, etc.).
 */
export interface PropuestaOpcionesTecnicas {
  cielorraso: string;
  senalPasillo: string;
  marcos: string;
  contrapeso: string;
  puertasPasillo: string;
  revestimientoCabina: string;
  incluyeElvic: boolean;
}

/** Una versión ya emitida. El PDF queda archivado para trazabilidad. */
export interface PropuestaVersion {
  version: number; // 1, 2, 3...
  fechaGeneracion: string; // YYYY-MM-DD HH:mm:ss
  generadaPor: string;
  nombreArchivo: string; // "COSTA VIA T2 (A-4550) V3.pdf"
  storagePath?: string; // ruta en Supabase Storage
  /** Snapshot de los datos usados, para poder auditar qué se envió. */
  snapshot?: Record<string, any>;
}

export interface PropuestaTecnicoEconomica {
  id: string;
  obraId: string;
  destinatario: PropuestaDestinatario;
  precios: PropuestaPrecios;
  clausulas: PropuestaClausulas;
  cartaPresentacion: PropuestaCartaPresentacion;
  textosEspecificaciones: PropuestaTextosEspecificaciones;
  opcionesTecnicas: PropuestaOpcionesTecnicas;
  /** Equipos incluidos. Si está vacío, se toman todos los de la obra. */
  equipoIdsIncluidos: string[];
  versiones: PropuestaVersion[];
  ultimaVersion: number;
  fechaCreacion: string;
  fechaActualizacion: string;
}

/**
 * Grupo de equipos con especificaciones idénticas. El documento los presenta
 * agrupados ("# 1~2 ASCENSORES 800 KG") y desdobla los campos que difieren.
 */
export interface GrupoEquipos {
  etiqueta: string; // "# 1~2" | "# 3"
  equipos: Equipo[];
}
