/**
 * Agrupación de equipos y validación de datos para la propuesta técnica.
 *
 * El documento presenta los equipos agrupados por especificaciones idénticas
 * ("# 1~2 ASCENSORES 800 KG") y desdobla los campos que difieren entre grupos.
 */

import { Equipo, GrupoEquipos } from '../types';

/** Campos que definen si dos equipos comparten grupo en el documento. */
const CAMPOS_AGRUPACION: (keyof Equipo)[] = [
  'velocidadMS',
  'capacidadKg',
  'capacidadPersonas',
  'paradas',
  'tipoSalaMaquinas',
  'anchoCabina',
  'profundidadCabina',
  'altoCabina',
  'doorOP',
  'doorH',
  'tipoApertura'
];

/** Campos sin los cuales el documento sale incompleto. */
export const CAMPOS_REQUERIDOS_ASCENSOR: { campo: keyof Equipo; etiqueta: string }[] = [
  { campo: 'velocidadMS', etiqueta: 'Velocidad' },
  { campo: 'capacidadKg', etiqueta: 'Capacidad (kg)' },
  { campo: 'capacidadPersonas', etiqueta: 'Capacidad (personas)' },
  { campo: 'paradas', etiqueta: 'Número de paradas' },
  { campo: 'recorrido', etiqueta: 'Recorrido' },
  { campo: 'anchoPasadizo', etiqueta: 'Ancho de pasadizo' },
  { campo: 'profundidadPasadizo', etiqueta: 'Profundidad de pasadizo' },
  { campo: 'anchoCabina', etiqueta: 'Ancho de cabina' },
  { campo: 'profundidadCabina', etiqueta: 'Profundidad de cabina' },
  { campo: 'altoCabina', etiqueta: 'Alto de cabina' },
  { campo: 'tipoSalaMaquinas', etiqueta: 'Tipo de sala de máquinas' },
  { campo: 'doorOP', etiqueta: 'Paso libre de puerta (ancho)' },
  { campo: 'doorH', etiqueta: 'Altura de puerta' },
  { campo: 'designacionPisos', etiqueta: 'Designación de pisos' }
];

/** Número de orden del equipo dentro de la obra (el "#1", "#2" del documento). */
const numeroDeEquipo = (equipo: Equipo, indice: number): number => {
  const parsed = parseInt(String(equipo.ascensorNumero ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : indice + 1;
};

/** Firma de agrupación: equipos con la misma firma van juntos en el documento. */
const firmaEquipo = (equipo: Equipo): string =>
  CAMPOS_AGRUPACION.map((campo) => `${String(campo)}=${equipo[campo] ?? ''}`).join('|');

/**
 * Comprime números consecutivos al formato del documento:
 * [1,2,3] -> "1~3" ; [1,3] -> "1, 3" ; [1,2,4,5] -> "1~2, 4~5"
 */
const comprimirRangos = (numeros: number[]): string => {
  const ordenados = [...numeros].sort((a, b) => a - b);
  const tramos: string[] = [];
  let inicio = ordenados[0];
  let previo = ordenados[0];

  for (let i = 1; i <= ordenados.length; i++) {
    const actual = ordenados[i];
    if (actual !== previo + 1) {
      tramos.push(inicio === previo ? `${inicio}` : `${inicio}~${previo}`);
      inicio = actual;
    }
    previo = actual;
  }

  return tramos.join(', ');
};

/**
 * Agrupa los equipos por especificaciones idénticas, respetando el orden de
 * numeración del documento.
 */
export const agruparEquipos = (equipos: Equipo[]): GrupoEquipos[] => {
  if (equipos.length === 0) return [];

  const conNumero = equipos.map((equipo, indice) => ({
    equipo,
    numero: numeroDeEquipo(equipo, indice)
  }));
  conNumero.sort((a, b) => a.numero - b.numero);

  const porFirma = new Map<string, { numeros: number[]; equipos: Equipo[] }>();
  for (const { equipo, numero } of conNumero) {
    const firma = firmaEquipo(equipo);
    const grupo = porFirma.get(firma);
    if (grupo) {
      grupo.numeros.push(numero);
      grupo.equipos.push(equipo);
    } else {
      porFirma.set(firma, { numeros: [numero], equipos: [equipo] });
    }
  }

  return [...porFirma.values()]
    .sort((a, b) => Math.min(...a.numeros) - Math.min(...b.numeros))
    .map(({ numeros, equipos: equiposGrupo }) => ({
      etiqueta: `# ${comprimirRangos(numeros)}`,
      equipos: equiposGrupo
    }));
};

/** Etiqueta con el rango completo de equipos: "# 1~3". */
export const etiquetaRangoCompleto = (equipos: Equipo[]): string => {
  if (equipos.length === 0) return '';
  const numeros = equipos.map((equipo, indice) => numeroDeEquipo(equipo, indice));
  return `# ${comprimirRangos(numeros)}`;
};

export interface CampoFaltante {
  equipoId: string;
  equipoNombre: string;
  campo: string;
  etiqueta: string;
}

/** Campos vacíos que hay que completar antes de emitir el documento. */
export const detectarCamposFaltantes = (equipos: Equipo[]): CampoFaltante[] => {
  const faltantes: CampoFaltante[] = [];

  for (const equipo of equipos) {
    if (equipo.tipo !== 'Ascensor') continue;

    for (const { campo, etiqueta } of CAMPOS_REQUERIDOS_ASCENSOR) {
      const valor = equipo[campo];
      const vacio = valor === undefined || valor === null || valor === '' || valor === 0;
      if (vacio) {
        faltantes.push({
          equipoId: equipo.id,
          equipoNombre: equipo.nombre || equipo.codigoUnico,
          campo: String(campo),
          etiqueta
        });
      }
    }
  }

  return faltantes;
};

/** Velocidad en m/min, que es la unidad del documento (el CRM la guarda en m/s). */
export const velocidadMetrosPorMinuto = (equipo: Equipo): number =>
  Math.round((equipo.velocidadMS || 0) * 60);

/** Formato de miles del documento: 1350 -> "1.350" */
export const formatearNumero = (valor: number | undefined): string => {
  if (valor === undefined || valor === null) return '____';
  return valor.toLocaleString('es-AR');
};

/**
 * Descripción del suministro para la portada de especificaciones.
 * Ej: "# 1~2 ASCENSORES DE TRACCIÓN 120 M/MIN – 800 KG – 28/28"
 */
export const describirSuministro = (grupo: GrupoEquipos): string => {
  const equipo = grupo.equipos[0];
  const plural = grupo.equipos.length > 1;
  const velocidad = velocidadMetrosPorMinuto(equipo);
  const paradas = equipo.paradas ?? 0;

  return [
    grupo.etiqueta,
    plural ? 'ASCENSORES DE TRACCIÓN' : 'ASCENSOR DE TRACCIÓN',
    `${velocidad} M/MIN`,
    '–',
    `${formatearNumero(equipo.capacidadKg)} KG`,
    '–',
    `${paradas}/${paradas}`
  ].join(' ');
};

/** Número escrito en palabras, como aparece en el documento ("veintiocho (28)"). */
const UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés',
  'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho',
  'veintinueve', 'treinta'
];

const DECENAS: Record<number, string> = {
  30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta',
  70: 'setenta', 80: 'ochenta', 90: 'noventa'
};

export const numeroEnPalabras = (numero: number): string => {
  if (numero <= 30) return UNIDADES[numero] ?? String(numero);
  if (numero < 100) {
    const decena = Math.floor(numero / 10) * 10;
    const unidad = numero % 10;
    return unidad === 0 ? DECENAS[decena] : `${DECENAS[decena]} y ${UNIDADES[unidad]}`;
  }
  return String(numero);
};
