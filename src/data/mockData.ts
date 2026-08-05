import { Cliente, Obra, MonthlySalesData, CartaOferta, Equipo } from '../types';

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: 'cli-1',
    razonSocial: 'Grupo Chateau S.A.',
    contactoPrincipal: 'Arq. Roberto M. D’Amico',
    cargo: 'Director de Obras & Infraestructura',
    email: 'rdamico@chateaugroup.com',
    telefono: '+54 11 4801-9900',
    direccion: 'Av. Libertador 4400, CABA',
    region: 'Uruguay',
    cuitRut: '2100492810019'
  },
  {
    id: 'cli-2',
    razonSocial: 'Alvear Hotels & Residences',
    contactoPrincipal: 'Ing. Carlos Sutton',
    cargo: 'Gerente General de Desarrollo',
    email: 'csutton@alvear.com.ar',
    telefono: '+54 11 4808-2100',
    direccion: 'Av. Alvear 1891, CABA',
    region: 'Argentina',
    cuitRut: '30-50284910-4'
  },
  {
    id: 'cli-3',
    razonSocial: 'Argencons S.A. (Quartier)',
    contactoPrincipal: 'Arq. Eduardo Camps',
    cargo: 'Director de Arquitectura Comercial',
    email: 'ecamps@argencons.com',
    telefono: '+54 11 4310-8800',
    direccion: 'Av. Leandro N. Alem 855, CABA',
    region: 'Argentina',
    cuitRut: '30-61849201-9'
  },
  {
    id: 'cli-4',
    razonSocial: 'TGLT Real Estate Uruguay',
    contactoPrincipal: 'Ing. Alejandro Beltrán',
    cargo: 'Jefe de Licitaciones e Suministros',
    email: 'abeltran@tglt.com.uy',
    telefono: '+598 2628-4000',
    direccion: 'Rambla Armenia 3800, Montevideo',
    region: 'Uruguay',
    cuitRut: '214981020011'
  },
  {
    id: 'cli-5',
    razonSocial: 'Madero Harbour Desarrollo S.A.',
    contactoPrincipal: 'Lic. Alejandro Ginevra',
    cargo: 'Presidente / CEO',
    email: 'aginevra@maderoharbour.com',
    telefono: '+54 11 5353-0000',
    direccion: 'Julieta Lanteri 555, Puerto Madero',
    region: 'Argentina',
    cuitRut: '30-71029384-2'
  },
  {
    id: 'cli-6',
    razonSocial: 'Consultatio Real Estate',
    contactoPrincipal: 'Arq. Gonzalo Costas',
    cargo: 'Gerente de Proyectos Corporativos',
    email: 'gcostas@consultatio.com.ar',
    telefono: '+54 11 4318-0000',
    direccion: 'Catalinas Norte, CABA',
    region: 'Argentina',
    cuitRut: '30-58920192-3'
  },
  {
    id: 'cli-7',
    razonSocial: 'Kimex Desarrollos Uruguay',
    contactoPrincipal: 'Ing. Marcelo Varela',
    cargo: 'Director Técnico WTC',
    email: 'mvarela@wtc.com.uy',
    telefono: '+598 2623-1122',
    direccion: 'Dr. Luis Bonavita 1294, Montevideo',
    region: 'Uruguay',
    cuitRut: '218892010014'
  }
];

export const INITIAL_OBRAS: Obra[] = [
  {
    id: 'obr-1',
    codigo: 'A-4631',
    nombre: 'CHATEAU PDE TOWER 3',
    region: 'Uruguay',
    clienteId: 'cli-1',
    montoUSD: 850000,
    tipoEquipo: 'Ascensor de Pasajeros',
    cantidadEquipos: 6,
    estado: 'En Negociación',
    fechaIngreso: '2026-03-15',
    fechaUltimaActualizacion: '2026-07-26',
    observaciones: 'Reunión presencial en Punta del Este. Cliente solicitó bonificación en plazo de garantía.',
    responsable: 'Lic. Martín Gómez (AR/UY)',
    hardwareSpecs: {
      velocidadMS: 2.5,
      paradas: 28,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 1000,
      modelo: 'Fujitec ZEXIA MRL'
    },
    etapaLogs: [
      {
        id: 'log-1',
        etapa: 'Cotización',
        fechaCambio: '2026-03-15',
        usuarioId: 'usr-superadmin',
        accion: 'cambio_etapa'
      },
      {
        id: 'log-2',
        etapa: 'Presentada',
        fechaCambio: '2026-04-10',
        usuarioId: 'usr-vendedor',
        accion: 'cambio_etapa'
      },
      {
        id: 'log-3',
        etapa: 'En Negociación',
        fechaCambio: '2026-06-05',
        usuarioId: 'usr-superadmin',
        accion: 'cambio_etapa'
      }
    ]
  },
  {
    id: 'obr-2',
    codigo: 'A-4812',
    nombre: 'TORRE ALVEAR LUXURY RESIDENCES',
    region: 'Argentina',
    clienteId: 'cli-2',
    montoUSD: 1420000,
    tipoEquipo: 'Alta Velocidad',
    cantidadEquipos: 8,
    estado: 'Presentada',
    fechaIngreso: '2026-04-10',
    fechaUltimaActualizacion: '2026-07-20', // 8 días atrás -> ALERTA TEMPORAL >7d!
    observaciones: 'Carta Oferta enviada. Pendiente dictamen del comité técnico de Alvear.',
    responsable: 'Ing. Esteban Rossi',
    hardwareSpecs: {
      velocidadMS: 4.0,
      paradas: 54,
      tipoSalaMaquinas: 'Con Sala de Máquinas',
      capacidadKg: 1600,
      modelo: 'Fujitec High Speed Ultra'
    }
  },
  {
    id: 'obr-3',
    codigo: 'A-4920',
    nombre: 'DISTRITO QUARTIER PUERTO RETIRO',
    region: 'Argentina',
    clienteId: 'cli-3',
    montoUSD: 1150000,
    tipoEquipo: 'Ascensor de Pasajeros',
    cantidadEquipos: 12,
    estado: 'Adjudicada',
    fechaIngreso: '2026-01-20',
    fechaUltimaActualizacion: '2026-07-15',
    observaciones: 'Contrato firmado. Anticipo del 30% cobrado. Iniciada fabricación en planta Fujitec.',
    responsable: 'Lic. Martín Gómez (AR/UY)',
    hardwareSpecs: {
      velocidadMS: 1.75,
      paradas: 16,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 800,
      modelo: 'Fujitec VIRIDIS Green'
    }
  },
  {
    id: 'obr-4',
    codigo: 'U-1044',
    nombre: 'FORUM PUERTO DEL BUCEO',
    region: 'Uruguay',
    clienteId: 'cli-4',
    montoUSD: 490000,
    tipoEquipo: 'Ascensor de Pasajeros',
    cantidadEquipos: 4,
    estado: 'Cotización',
    fechaIngreso: '2026-07-02',
    fechaUltimaActualizacion: '2026-07-14', // 14 días atrás -> ALERTA TEMPORAL >7d!
    observaciones: 'En etapa de cálculo de tráfico y layout de hueco con equipo de ingeniería Fujitec.',
    responsable: 'Ing. Valeria Silva (UY)',
    hardwareSpecs: {
      velocidadMS: 2.0,
      paradas: 12,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 1000,
      modelo: 'Fujitec REXIA MRL'
    }
  },
  {
    id: 'obr-5',
    codigo: 'A-5011',
    nombre: 'MADERO HARBOUR TORRE T2',
    region: 'Argentina',
    clienteId: 'cli-5',
    montoUSD: 980000,
    tipoEquipo: 'Alta Velocidad',
    cantidadEquipos: 6,
    estado: 'En Negociación',
    fechaIngreso: '2026-05-18',
    fechaUltimaActualizacion: '2026-07-16', // 12 días atrás -> ALERTA TEMPORAL >7d!
    observaciones: 'Revisión técnica de pasadizos. Requiere ajustar velocidad a 3.0 m/s.',
    responsable: 'Ing. Esteban Rossi',
    hardwareSpecs: {
      velocidadMS: 3.0,
      paradas: 38,
      tipoSalaMaquinas: 'Con Sala de Máquinas',
      capacidadKg: 1250,
      modelo: 'Fujitec High Speed Custom'
    }
  },
  {
    id: 'obr-6',
    codigo: 'A-5102',
    nombre: 'NORDELTA CENTRO LOGÍSTICO & PLAZA',
    region: 'Argentina',
    clienteId: 'cli-6',
    montoUSD: 320000,
    tipoEquipo: 'Ascensor de Carga / Montacargas',
    cantidadEquipos: 4,
    estado: 'Perdida',
    fechaIngreso: '2026-02-10',
    fechaUltimaActualizacion: '2026-06-01',
    observaciones: 'Perdida por precio frente a competidor local. Mantener contacto para mantenimiento futuro.',
    responsable: 'Arq. Lucía Fernández',
    hardwareSpecs: {
      velocidadMS: 0.75,
      paradas: 5,
      tipoSalaMaquinas: 'Con Sala de Máquinas',
      capacidadKg: 3000,
      modelo: 'Fujitec Heavy Duty Freight'
    }
  },
  {
    id: 'obr-7',
    codigo: 'U-1120',
    nombre: 'WORLD TRADE CENTER MONTEVIDEO T5',
    region: 'Uruguay',
    clienteId: 'cli-7',
    montoUSD: 620000,
    tipoEquipo: 'Alta Velocidad',
    cantidadEquipos: 5,
    estado: 'Presentada',
    fechaIngreso: '2026-06-11',
    fechaUltimaActualizacion: '2026-07-27', // 1 día atrás
    observaciones: 'Presentación formal de oferta comercial en Montevideo. Excelente recepción.',
    responsable: 'Ing. Valeria Silva (UY)',
    hardwareSpecs: {
      velocidadMS: 2.5,
      paradas: 22,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 1000,
      modelo: 'Fujitec ZEXIA Premium'
    }
  },
  {
    id: 'obr-8',
    codigo: 'A-5205',
    nombre: 'CORDOBA BUSINESS CENTER T1',
    region: 'Argentina',
    clienteId: 'cli-3',
    montoUSD: 750000,
    tipoEquipo: 'Ascensor de Pasajeros',
    cantidadEquipos: 6,
    estado: 'Adjudicada',
    fechaIngreso: '2026-03-01',
    fechaUltimaActualizacion: '2026-07-05',
    observaciones: 'Adjudicada exitosamente. Orden de compra recibida.',
    responsable: 'Lic. Martín Gómez (AR/UY)',
    hardwareSpecs: {
      velocidadMS: 2.0,
      paradas: 20,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 1000,
      modelo: 'Fujitec ZEXIA'
    }
  }
];

export const MONTHLY_SALES_DATA: MonthlySalesData[] = [
  { mes: 'Ene', ventasRealesUSD: 1150000, ventasAcumuladasUSD: 1150000, planAcumuladoUSD: 700000, equiposVendidos: 12, equiposPlan: 8 },
  { mes: 'Feb', ventasRealesUSD: 0, ventasAcumuladasUSD: 1150000, planAcumuladoUSD: 1400000, equiposVendidos: 12, equiposPlan: 15 },
  { mes: 'Mar', ventasRealesUSD: 750000, ventasAcumuladasUSD: 1900000, planAcumuladoUSD: 2100000, equiposVendidos: 18, equiposPlan: 22 },
  { mes: 'Abr', ventasRealesUSD: 0, ventasAcumuladasUSD: 1900000, planAcumuladoUSD: 2800000, equiposVendidos: 18, equiposPlan: 28 },
  { mes: 'May', ventasRealesUSD: 850000, ventasAcumuladasUSD: 2750000, planAcumuladoUSD: 3500000, equiposVendidos: 24, equiposPlan: 35 },
  { mes: 'Jun', ventasRealesUSD: 620000, ventasAcumuladasUSD: 3370000, planAcumuladoUSD: 4200000, equiposVendidos: 29, equiposPlan: 42 },
  { mes: 'Jul (YTD)', ventasRealesUSD: 980000, ventasAcumuladasUSD: 4350000, planAcumuladoUSD: 4900000, equiposVendidos: 35, equiposPlan: 48 },
  { mes: 'Ago (Proy)', ventasRealesUSD: 0, ventasAcumuladasUSD: 4350000, planAcumuladoUSD: 5600000, equiposVendidos: 35, equiposPlan: 55 },
  { mes: 'Sep (Proy)', ventasRealesUSD: 0, ventasAcumuladasUSD: 4350000, planAcumuladoUSD: 6300000, equiposVendidos: 35, equiposPlan: 62 },
  { mes: 'Oct (Proy)', ventasRealesUSD: 0, ventasAcumuladasUSD: 4350000, planAcumuladoUSD: 7000000, equiposVendidos: 35, equiposPlan: 68 },
  { mes: 'Nov (Proy)', ventasRealesUSD: 0, ventasAcumuladasUSD: 4350000, planAcumuladoUSD: 7700000, equiposVendidos: 35, equiposPlan: 74 },
  { mes: 'Dic (Proy)', ventasRealesUSD: 0, ventasAcumuladasUSD: 4350000, planAcumuladoUSD: 8500000, equiposVendidos: 35, equiposPlan: 80 }
];

export const INITIAL_CARTAS_OFERTA: CartaOferta[] = [
  {
    id: 'oferta-1',
    obraId: 'obr-1',
    propuestaEconomicaUSD: 850000,
    validezDias: 30,
    plazoEntregaSemanas: 24,
    garantiaAnos: 3,
    terminosPago: '30% Anticipo con Orden de Compra, 50% Embarque de Equipos, 20% Recepción Definitiva y Puesta en Marcha.',
    notasTecnicas: 'Incluye sistema de maniobra regenerativa Fujitec Eco-Drive, variador de frecuencia VVVF de alta precisión y cabinas con acabado en acero inoxidable cepillado con monitores LCD táctiles.',
    resumenEjecutivoIA: 'Propuesta comercial para 6 ascensores Fujitec ZEXIA MRL de 2.5 m/s para la Torre Chateau PDE T3. Tecnología japonesa de máxima eficiencia energética y cumplimiento normativo en Uruguay.',
    fechaGeneracion: '2026-07-26',
    generadaPor: 'Lic. Martín Gómez'
  }
];

export const INITIAL_EQUIPOS: Equipo[] = [
  {
    id: 'eqp-1',
    codigoUnico: 'FJT-ZEXIA-MRL-2.5',
    nombre: 'Fujitec ZEXIA MRL 2.5m/s',
    tipo: 'Ascensor de Pasajeros',
    velocidadMS: 2.5,
    paradas: 20,
    tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
    capacidadKg: 1000,
    modelo: 'Fujitec ZEXIA MRL'
  },
  {
    id: 'eqp-2',
    codigoUnico: 'FJT-VIRIDIS-1.6',
    nombre: 'Fujitec VIRIDIS 1.6m/s',
    tipo: 'Ascensor de Pasajeros',
    velocidadMS: 1.6,
    paradas: 15,
    tipoSalaMaquinas: 'Con Sala de Máquinas',
    capacidadKg: 1000,
    modelo: 'Fujitec VIRIDIS'
  },
  {
    id: 'eqp-3',
    codigoUnico: 'FJT-REXIA-2.0-CARGA',
    nombre: 'Fujitec REXIA 2.0m/s Carga',
    tipo: 'Ascensor de Carga / Montacargas',
    velocidadMS: 2.0,
    paradas: 10,
    tipoSalaMaquinas: 'Con Sala de Máquinas',
    capacidadKg: 2500,
    modelo: 'Fujitec REXIA'
  },
  {
    id: 'eqp-4',
    codigoUnico: 'FJT-ELIGHT-3.0',
    nombre: 'Fujitec ELIGHT 3.0m/s Alta Velocidad',
    tipo: 'Alta Velocidad',
    velocidadMS: 3.0,
    paradas: 30,
    tipoSalaMaquinas: 'Con Sala de Máquinas',
    capacidadKg: 1000,
    modelo: 'Fujitec ELIGHT'
  },
  {
    id: 'eqp-5',
    codigoUnico: 'FJT-ESCALERA-1.0',
    nombre: 'Escalera Mecánica Fujitec',
    tipo: 'Escalera Mecánica / Rampa',
    velocidadMS: 0.5,
    paradas: 1,
    tipoSalaMaquinas: 'Con Sala de Máquinas',
    capacidadKg: 1500,
    modelo: 'Fujitec Escalera Mecánica'
  }
];
