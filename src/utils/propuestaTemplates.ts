/**
 * Textos base de la propuesta técnico-económica.
 *
 * Transcritos de los documentos Word de referencia (carpeta "Doc propuestas
 * tecnicas"). Son los valores por defecto: Configuración puede sobrescribirlos
 * globalmente y cada propuesta puede sobrescribirlos puntualmente.
 */

import { PropuestaClausulas, PropuestaOpcionesTecnicas } from '../types';

export const DATOS_EMPRESA = {
  razonSocial: 'FUJITEC ARGENTINA S.A.',
  direccion: 'Av. Belgrano 884, Buenos Aires',
  telefono: '3984-0300',
  email: 'ventas@fujitec.com.ar',
  web: 'www.fujitec.com.ar'
};

/** Carta de presentación institucional (documento 1). */
export const CARTA_PRESENTACION_PARRAFOS = [
  'Fujitec Argentina, subsidiaria de Fujitec Japón, desarrolla sus actividades desde el 17 de mayo de 1978, habiendo instalado sus equipos en los más importantes edificios tanto de viviendas como, oficinas y hoteles, asegurando el cumplimiento de los requisitos acordados con el cliente y los máximos requerimientos de seguridad y eficiencia.',
  'Algunas de esas instalaciones fueron realizadas en edificios de viviendas tales como Torre El Faro o Le Parc, en la Fundación Universidad Belgrano, con cabinas dobles para 72 personas, y en edificios de oficinas como en la Torre Repsol YPF (con ascensores de 300 metros por minuto) o Centro Empresarial Libertador, entre otros.',
  'Nuestra garantía está representada por Fujitec Japón, empresa que cuenta con más de 100 organizaciones operativas a través del mundo, desde 1948, y que posee el certificado de calidad de normas ISO 9001, siendo la primera empresa de ascensores de Japón que posee tal garantía de calidad y siendo algunas de sus realizaciones mas destacadas:'
];

export const CARTA_PRESENTACION_HITOS = [
  '1er empresa en proveer equipos con el sistema "Variable Voltaje Variable Frecuencia (VVVF)", el cual otorga un significativo ahorro de energía.',
  '1er empresa en el mundo en utilizar Inteligencia Artificial para el control de maniobra de sus equipos',
  '1er empresa en utilizar equipos de corriente alterna sin engranaje.'
];

export const CARTA_PRESENTACION_CIERRE = [
  'Fujitec Argentina S.A. dirige sus esfuerzos en lograr la máxima satisfacción al cliente alcanzando las metas más exigentes del mercado estableciendo la gestión de la calidad como un compromiso de la alta Dirección, la línea gerencial, la supervisión de los montajes y todo su personal, en concordancia con su Política de la Calidad, inscripta en el marco de la certificación ISO 9001:2008 obtenida a partir de mayo de 2007.',
  'Por intermedio de la presente quedamos atentos a su requerimiento a fin de asesorar y participar en los proyectos que vuestra organización está desarrollando. A tales efectos, ponemos a vuestra disposición nuestro departamento comercial.',
  'Sin otro particular, y reiterándonos a vuestra total disposición, hacemos propicia la oportunidad para saludar a Uds. muy atentamente.'
];

/** Cláusulas por defecto de la oferta económica (documento 2). */
export const CLAUSULAS_DEFAULT: PropuestaClausulas = {
  garantiaAnos: 1,
  validezDias: 30,
  origenEquipos: 'China',
  plazoEntrega:
    'Los equipos serán entregados de acuerdo al cronograma adjunto, a partir de la firma del contrato, pago de anticipo, y aprobación de los planos respectivos. (Ver cronograma adjunto).',
  saludoFinal:
    'Sin otro particular, y quedando a vuestra total disposición para responder cualquier duda, hacemos propicia la oportunidad para saludar a usted muy atentamente.',

  notasPrecio: [
    'Para vuestra información señalamos que se encuentran incluidos los derechos de importación de los ascensores, actualmente del 12,6 % sobre el valor CIF.',
    'Cualquier modificación en dichas tasas y/o alícuotas, o la creación de nuevos gravámenes que se pusiera en vigor con posterioridad a la presente afectará los gastos de despacho y/o el valor de equipos importados CIF en correspondencia.',
    'El valor indicativo de los gastos de despacho, derechos de importación y transporte es en puerto de Buenos Aires e incluye gastos de importación y nacionalización considerando 15 días en depósito fiscal y transporte a obra (derechos, tasas, honorarios de despachante, y transporte a obra).',
    'Todos los valores ofertados están en relación al cronograma de trabajos presentado; cualquier cambio en los plazos de obra indicados en el mismo modificará los valores ofertados.'
  ],

  tareasIncluidas: [
    'Fujitec Argentina S.A. supervisa los procesos de Montaje, Ajuste y Service únicamente con personal propio, el cual ha sido capacitado con los más altos estándares de calidad, ofreciendo una óptima instalación y posterior mantenimiento de los equipos.',
    'Provisión y colocación de grampas metálicas para la fijación de guías.',
    'Provisión y colocación de vigas metálicas para el apoyo de máquinas.',
    'Traslados de materiales a obra.',
    'Colocación y aplomado de entradas (sólo excluye el amurado).',
    'Gestión de habilitación de los equipos, no así el pago de los aranceles municipales.',
    'Los trabajos fueron cotizados en horarios y días laborales, no se incluyen trabajos nocturnos de ser necesarios ni en días no laborables.',
    'Servicio de Seguridad e Higiene laboral cotizado con una visita semanal en horario diurno de un Técnico Prevencionista según lo exigido legalmente para este tipo de obras.',
    'Se encuentra bonificado el servicio de mantenimiento en días y horarios hábiles, sin materiales por doce meses desde la recepción provisoria de cada equipo.',
    'Provisión e instalación de malla divisoria en bajo recorridos según normativa vigente.',
    'Provisión e instalación de ángulos de entrada para la fijación de marcos, botoneras e indicadores para todos los ascensores.',
    'Provisión e instalación de iluminación en zonas de trabajo (sobre cabina, bajo cabina y sobre recorrido) de todos los pasadizos.'
  ],

  tareasNoIncluidas: [
    'Ayuda de gremio ni la obra civil requerida para permitir la instalación de los equipos (ver documento de ayuda de gremio);',
    'Apuntalamiento para el ingreso de los equipos en caso de ser necesarios;',
    'Deposito intermedio de los equipos, se deberán trasladar a obra cuando arriben al puerto de Bs. As. En caso de que la obra no se encuentre en condiciones de recibir los equipos se deberá cotizar el depósito alternativo para la guarda de los equipos;',
    'No se incluye tasas y derechos de instalación de los equipos, los mismos deberán ser abonados por el cliente contra presentación de la respectiva factura.',
    'Limpieza de los equipos luego de la firma del acta de recepción provisoria.',
    'Piso y espejos provisto por terceros.',
    'Las muestras de los materiales y componentes a utilizar solicitadas en el pliego.'
  ],

  formaPagoImportado: [
    '80% al embarque de los equipos.',
    '20% a la llegada del buque al puerto de Buenos Aires.'
  ],

  formaPagoNacional: [
    'Anticipo 10% a la firma de contrato.',
    '20% a la llegada del equipo a la obra.',
    '20% al izaje de la máquina del equipo.',
    '20% al montaje de las guías del equipo.',
    '20% al montaje de la cabina del equipo.',
    '10% a la recepción provisoria del equipo.'
  ],

  camposSobrescritos: []
};

export const TEXTO_PAGO_IMPORTADO_ALTERNATIVAS = [
  'Alternativa A: Los montos expresados en moneda dólar estadounidense, podrán ser abonados por transferencia bancaria en dólares estadounidenses.',
  'Alternativa B: Mediante pesos argentinos aplicando para la conversión el valor del billete dólar estadounidense vendedor publicado por el Banco de la Nación Argentina al cierre de cambio del efectivo giro de las divisas al exterior.'
];

export const TEXTO_PAGO_DESPACHO =
  'Deberá ser abonados 100 % quince días antes de la llegada del buque a puerto de Buenos Aires. Los montos expresados en moneda dólar estadounidense, podrán ser abonados en pesos, aplicando para la conversión el valor del billete dólar estadounidense vendedor publicado por el Banco de la Nación Argentina al momento del efectivo pago a aduana.';

export const TEXTO_IMPORTACION_CLIENTE =
  'Los gastos de despacho y nacionalización serán abonados por el cliente de acuerdo a la efectiva nacionalización de los equipos.';

/**
 * Variantes que en el Word están escritas en línea separadas por "/" y se
 * eligen borrando las que no aplican. Acá son desplegables.
 */
export const OPCIONES_TECNICAS = {
  cielorraso: [
    'Cielorraso de acero inoxidable AISI 304 con iluminación LED (Art. 4, Ley CABA 4458/12)',
    'Cielorraso de acero inoxidable AISI 304 y acrílico iluminado mediante spots.',
    'Cielorraso de acero pintado con pintura epoxi y acrílico iluminado mediante spots.'
  ],
  senalPasillo: [
    'Botonera con botones tipo micro movimiento con registro de llamada y display alfanumérico con flecha direccional incorporado a la botonera en todos los pisos.',
    'Botonera con botones tipo micro movimiento con registro de llamada y display alfanumérico con flecha direccional incorporado a la botonera en piso principal. En los pisos restantes botonera con botones tipo micro movimiento con registro de llamada y linterna direccionales.'
  ],
  marcos: [
    'Serán de tipo estándar ejecutados en acero inoxidable AISI 304, sin paño superior y sin cubre mochetas.',
    'Serán de tipo estándar ejecutados en acero pintado con pintura epoxi, sin paño superior y sin cubre mochetas. Marcos contra incendio E120.'
  ],
  contrapeso: [
    'Descarga del contrapeso a tierra firme',
    'Descarga del contrapeso en columna de hormigón a tierra firme (por otros)',
    'Con dispositivo de seguridad incluido'
  ],
  puertasPasillo: [
    'ejecutadas en acero inoxidable AISI 304.',
    'ejecutadas en acero pintado con pintura epoxi.',
    'ejecutadas en acero inoxidable AISI 304. Puertas contra incendio E120.'
  ],
  revestimientoCabina: [
    'preparada para recibir espejo de piso a techo provisto y colocado por terceros',
    'preparada para recibir espejo de medio cuerpo provisto y colocado por terceros'
  ]
};

export const OPCIONES_TECNICAS_DEFAULT: PropuestaOpcionesTecnicas = {
  cielorraso: OPCIONES_TECNICAS.cielorraso[0],
  senalPasillo: OPCIONES_TECNICAS.senalPasillo[0],
  marcos: OPCIONES_TECNICAS.marcos[0],
  contrapeso: OPCIONES_TECNICAS.contrapeso[0],
  puertasPasillo: OPCIONES_TECNICAS.puertasPasillo[0],
  revestimientoCabina: OPCIONES_TECNICAS.revestimientoCabina[0],
  incluyeElvic: false
};

/** Textos fijos de las especificaciones técnicas de ascensores (documento 3). */
export const ESPECIFICACIONES_TEXTOS = {
  motores:
    'Se suministrará para las maquinas un motor de imán permanente cuya tensión será variable y con un inversor de frecuencia también variable para mayor precisión en el control del motor. Se garantiza el perfecto control de la velocidad, ahorro en el consumo de energía y una reducción en la demanda de potencia. El ajuste de tensión y frecuencia a través del inversor aumentará la frecuencia para las velocidades más altas del motor mientras se reducirá para las velocidades más bajas. Esto implica que en todas las fases de la operación se entregará una frecuencia óptima. Por lo tanto, la tracción del motor trabajará continuamente con la más alta eficiencia y con un mínimo de perdida de energía.',
  plataforma:
    'Construida sobre un marco de perfiles de alta resistencia y cubierta de láminas del mismo metal. Estará montada sobre amortiguadores de caucho destinados a absorber vibraciones y asegurar una mejor aislación con el bastidor de la cabina.',
  bastidor: 'Será construido con perfiles de acero reforzado.',
  piso: 'Preparado para recibir granito, de aproximadamente 25mm. de espesor (provisto y colocado por terceros).',
  jambaFrente: 'De acero inoxidable AISI 304.',
  zocalos: 'Serán de acero inoxidable AISI 304.',
  umbral: 'Será de aluminio extruido duro.',
  ventilacion:
    'Un ventilador de aire silencioso, fabricado especialmente para su uso en ascensores asegura la adecuada ventilación de la cabina en las condiciones más exigentes.',
  pasamanos:
    'Será de acero inoxidable AISI 304 y se colocara en los paneles laterales y panel posterior de la cabina.',
  reguladorVelocidad:
    'De accionamiento progresivo, calibrado y ajustado. Equipado con un circuito interruptor sensible a excesos del 40% de la velocidad nominal.',
  freno:
    'De accionamiento directo sobre el eje de la máquina de motor. Se trata de un freno electromecánico con acoplamiento de seguridad que determina la unión solidaria del eje de motor, garantizando una reacción instantánea.',
  sensorPeso:
    'La cabina se encuentra equipada con un sistema sensor de peso que impide su desplazamiento en condiciones de sobrecarga.',
  amortiguador:
    'De acuerdo a las normas, será instalado un sistema amortiguador sobre la base firme del pasadizo.',
  finCarrera:
    'Las paradas inferior y superior estarán provistas de interruptores limitadores que aseguren la detención de la cabina en caso de que sobrepase la parada terminal.',
  dispositivoEmergencia:
    'Las maquinas estarán equipadas con una manija que acciona el freno y otra para girar el motor a fin de llevar la cabina manualmente al piso más próximo en caso de emergencia.',
  cerraduras:
    'Se instalarán cerraduras e interruptores de seguridad en todas las puertas de pasillos a fin de asegurar que la cabina no marche con alguna de las puertas abiertas.',
  luzEmergencia: 'Accionada automáticamente al cortarse el suministro de energía convencional.',
  paracaidas:
    'Fijado en el puente inferior del bastidor para detener la cabina en caso de ruptura de los cables de suspensión o de excederse la velocidad, desconectando la corriente del motor y aplicando el freno con anterioridad a la aplicación del paracaídas. Este se acciona por medio de un limitador de velocidad tipo centrifugo, localizado arriba del pasadizo.',
  puertasSeguridad: 'Se instalarán en las puertas de las cabinas una barrera de rayos infrarrojos multi haz.',
  guias:
    'Se suministrarán guías de perfil "T" las que son fabricadas especialmente para ascensores y su precisa calibración y empalme aseguran el desplazamiento suave y uniforme de la cabina y contrapeso.',
  alimentacion: '380 V. - 50 Hz',
  maniobra: 'Maniobra selectiva ascendente-descendente automática',
  umbrales: 'Serán de aluminio duro extruido.'
};

export const TABLERO_CABINA_ITEMS = [
  'Indicador digital de sentido de marcha y de posición',
  'Botón de apertura y cierre de las puertas',
  'Botones para el registro de llamadas.',
  'Botón de alarma',
  'Interruptor de la luz de la cabina',
  'Intercomunicador de manos libres',
  'Botón de servicio independiente',
  'Sintetizador de voz'
];

export const TEXTO_ELVIC =
  'Este sistema tiene como función, monitorear y controlar nuestros ascensores de manera remota. También tiene la opción de llevar un registro de fallas y funcionamiento de todos los equipos, todo esto mediante una aplicación amigable y de fácil manejo para el cliente.';

/**
 * Las dos únicas diferencias reales entre la plantilla MRL (sin sala) y la
 * MRX (con sala). El resto del documento es idéntico.
 */
export const VARIANTES_SALA_MAQUINAS = {
  'Sin Sala de Máquinas (MRL)': {
    maquinaTraccion: 'Sin sala de máquinas. Máquina ubicada en el sobre recorrido del pasadizo.',
    cableadoElvic:
      'Se encuentra incluido el cableado de tablero de comandos a panel de control y PC a excepción de canalizaciones para el cableado.'
  },
  'Con Sala de Máquinas': {
    maquinaTraccion:
      'Ubicada arriba del pasadizo. Superficie mínima por equipo 12 m2. Altura mínima de sala de máquinas 2.400 mm.',
    cableadoElvic:
      'Se encuentra incluido el cableado de sala de máquinas a panel de control y PC a excepción de canalizaciones para el cableado.'
  }
};
