/**
 * Generación del PDF de la propuesta técnico-económica.
 *
 * Replica el formato de los documentos Word originales: membrete con logo,
 * encabezado "Obra: ...", pie institucional y numeración propia por documento
 * ("1 / 5"), tal como en el PDF de referencia.
 */

import { jsPDF } from 'jspdf';
import { Obra, Cliente, Equipo, PropuestaTecnicoEconomica } from '../types';
import {
  DATOS_EMPRESA,
  CARTA_PRESENTACION_DEFAULT,
  TEXTOS_ESPECIFICACIONES_DEFAULT,
  VARIANTES_SALA_MAQUINAS,
  TEXTO_PAGO_IMPORTADO_ALTERNATIVAS,
  TEXTO_PAGO_DESPACHO,
  TEXTO_IMPORTACION_CLIENTE
} from './propuestaTemplates';
import {
  agruparEquipos,
  describirSuministro,
  etiquetaRangoCompleto,
  formatearNumero,
  numeroEnPalabras,
  velocidadMetrosPorMinuto
} from './propuestaEquipos';

const MARGEN_X = 25;
const MARGEN_TOP = 38;
const MARGEN_BOTTOM = 32;
const ANCHO_PAGINA = 210;
const ALTO_PAGINA = 297;
const ANCHO_UTIL = ANCHO_PAGINA - MARGEN_X * 2;

const ROJO_FUJITEC: [number, number, number] = [200, 16, 46];
const GRIS_TEXTO: [number, number, number] = [45, 52, 54];
const GRIS_SUAVE: [number, number, number] = [120, 130, 135];

/** Marca dónde arranca cada documento, para numerar "1 / N" por separado. */
interface BloqueDocumento {
  primeraPagina: number;
  ultimaPagina: number;
}

class ConstructorPdf {
  doc: jsPDF;
  y: number;
  logo: string | null;
  tituloObra: string;
  bloques: BloqueDocumento[] = [];
  bloqueActual: BloqueDocumento | null = null;

  constructor(tituloObra: string, logo: string | null) {
    this.doc = new jsPDF({ unit: 'mm', format: 'a4' });
    this.y = MARGEN_TOP;
    this.logo = logo;
    this.tituloObra = tituloObra;
  }

  /** Inicia un documento nuevo: página nueva y numeración desde 1. */
  iniciarDocumento() {
    if (this.bloqueActual) {
      this.bloqueActual.ultimaPagina = this.doc.getNumberOfPages();
      this.bloques.push(this.bloqueActual);
      this.doc.addPage();
    }
    this.bloqueActual = {
      primeraPagina: this.doc.getNumberOfPages(),
      ultimaPagina: this.doc.getNumberOfPages()
    };
    this.y = MARGEN_TOP;
  }

  cerrarDocumento() {
    if (this.bloqueActual) {
      this.bloqueActual.ultimaPagina = this.doc.getNumberOfPages();
      this.bloques.push(this.bloqueActual);
      this.bloqueActual = null;
    }
  }

  /** Salta de página si no entra `alto` mm en lo que queda. */
  asegurarEspacio(alto: number) {
    if (this.y + alto > ALTO_PAGINA - MARGEN_BOTTOM) {
      this.doc.addPage();
      this.y = MARGEN_TOP;
    }
  }

  texto(
    contenido: string,
    opciones: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; spacing?: number } = {}
  ) {
    const { size = 9.5, bold = false, color = GRIS_TEXTO, indent = 0, spacing = 1.6 } = opciones;
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal');
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);

    const ancho = ANCHO_UTIL - indent;
    const lineas = this.doc.splitTextToSize(contenido, ancho);
    const altoLinea = size * 0.45;

    for (const linea of lineas) {
      this.asegurarEspacio(altoLinea + 1);
      this.doc.text(linea, MARGEN_X + indent, this.y);
      this.y += altoLinea;
    }
    this.y += spacing;
  }

  /** Título de sección numerado, como "1.0.1 VELOCIDAD:" */
  seccion(numero: string, titulo: string) {
    this.asegurarEspacio(10);
    this.y += 1.5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(...GRIS_TEXTO);
    this.doc.text(`${numero} ${titulo.toUpperCase()}`, MARGEN_X, this.y);
    this.y += 5;
  }

  tituloBloque(titulo: string) {
    this.asegurarEspacio(14);
    this.y += 2;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(...ROJO_FUJITEC);
    this.doc.text(titulo.toUpperCase(), MARGEN_X, this.y);
    this.y += 7;
  }

  vinieta(contenido: string) {
    const size = 9.5;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(size);
    this.doc.setTextColor(...GRIS_TEXTO);

    const lineas = this.doc.splitTextToSize(contenido, ANCHO_UTIL - 6);
    const altoLinea = size * 0.45;

    lineas.forEach((linea: string, indice: number) => {
      this.asegurarEspacio(altoLinea + 1);
      if (indice === 0) this.doc.text('•', MARGEN_X, this.y);
      this.doc.text(linea, MARGEN_X + 6, this.y);
      this.y += altoLinea;
    });
    this.y += 1.4;
  }

  espacio(mm: number) {
    this.y += mm;
  }

  /**
   * Membrete, encabezado y pie en todas las páginas. Se corre al final, con
   * el total de páginas de cada documento ya conocido.
   */
  aplicarMembretes() {
    const total = this.doc.getNumberOfPages();

    for (let pagina = 1; pagina <= total; pagina++) {
      this.doc.setPage(pagina);

      if (this.logo) {
        try {
          // 2000x686 del logotipo original: se respeta el ratio 2.92 para
          // que no salga deformado.
          this.doc.addImage(this.logo, 'PNG', MARGEN_X, 12, 38, 13);
        } catch {
          // Si el logo no se pudo cargar, el documento sigue siendo válido.
        }
      }

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      this.doc.setTextColor(...GRIS_SUAVE);
      this.doc.text(`Obra: ${this.tituloObra}`, ANCHO_PAGINA - MARGEN_X, 17, { align: 'right' });

      this.doc.setDrawColor(225, 228, 230);
      this.doc.setLineWidth(0.3);
      this.doc.line(MARGEN_X, 27, ANCHO_PAGINA - MARGEN_X, 27);

      const bloque = this.bloques.find(
        (b) => pagina >= b.primeraPagina && pagina <= b.ultimaPagina
      );
      const numeroEnBloque = bloque ? pagina - bloque.primeraPagina + 1 : pagina;
      const totalBloque = bloque ? bloque.ultimaPagina - bloque.primeraPagina + 1 : total;

      const pieY = ALTO_PAGINA - 24;
      this.doc.setDrawColor(225, 228, 230);
      this.doc.line(MARGEN_X, pieY - 4, ANCHO_PAGINA - MARGEN_X, pieY - 4);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(...GRIS_TEXTO);
      this.doc.text(DATOS_EMPRESA.razonSocial, MARGEN_X, pieY);
      this.doc.text(
        `${numeroEnBloque} / ${totalBloque}`,
        ANCHO_PAGINA - MARGEN_X,
        pieY,
        { align: 'right' }
      );

      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(7);
      this.doc.setTextColor(...GRIS_SUAVE);
      this.doc.text(DATOS_EMPRESA.direccion, MARGEN_X, pieY + 3.6);
      this.doc.text(`Tel.: ${DATOS_EMPRESA.telefono}`, MARGEN_X, pieY + 7.2);
      this.doc.text(`E-mail: ${DATOS_EMPRESA.email}`, MARGEN_X, pieY + 10.8);
      this.doc.text(`Web: ${DATOS_EMPRESA.web}`, MARGEN_X, pieY + 14.4);
    }
  }
}

const formatearFechaLarga = (iso: string): string => {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const fecha = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(fecha.getTime())) return iso;
  return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
};

const formatearUSD = (valor: number): string =>
  `USD ${valor.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatearARS = (valor: number): string =>
  `ARS ${valor.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/** Encabezado de destinatario, común a la carta y a la oferta económica. */
const escribirEncabezadoCarta = (pdf: ConstructorPdf, propuesta: PropuestaTecnicoEconomica) => {
  const { destinatario } = propuesta;

  pdf.texto(destinatario.numeroFA, { bold: true, size: 9.5, spacing: 4 });
  pdf.texto(`Buenos Aires, ${formatearFechaLarga(destinatario.fecha)}`, { spacing: 5 });

  pdf.texto('Señores:', { spacing: 1 });
  pdf.texto(destinatario.empresa, { bold: true, spacing: 1 });
  if (destinatario.direccion) pdf.texto(destinatario.direccion, { spacing: 1 });
  if (destinatario.localidad) pdf.texto(destinatario.localidad, { spacing: 1 });
  pdf.texto('PRESENTE', { spacing: 4 });

  if (destinatario.atencionA) pdf.texto(`At.: ${destinatario.atencionA}`, { spacing: 1.5 });
  pdf.texto(`Ref.: ${destinatario.referencia}`, { spacing: 5 });
};

/** Documento 1: carta de presentación institucional. */
const generarCartaPresentacion = (pdf: ConstructorPdf, propuesta: PropuestaTecnicoEconomica) => {
  pdf.iniciarDocumento();
  escribirEncabezadoCarta(pdf, propuesta);

  const carta = propuesta.cartaPresentacion || CARTA_PRESENTACION_DEFAULT;

  pdf.texto('De nuestra consideración:', { spacing: 4 });
  carta.parrafos.forEach((parrafo) => pdf.texto(parrafo, { spacing: 3 }));
  carta.hitos.forEach((hito) => pdf.vinieta(hito));
  pdf.espacio(2);
  carta.cierre.forEach((parrafo) => pdf.texto(parrafo, { spacing: 3 }));
};

/** Documento 2: oferta económica con precios y cláusulas. */
const generarOfertaEconomica = (
  pdf: ConstructorPdf,
  propuesta: PropuestaTecnicoEconomica,
  equipos: Equipo[]
) => {
  pdf.iniciarDocumento();
  escribirEncabezadoCarta(pdf, propuesta);

  const { precios, clausulas } = propuesta;
  const cantidad = equipos.length;
  const descripcionEquipos = `${numeroEnPalabras(cantidad)} (${cantidad}) ${
    cantidad === 1 ? 'Ascensor Electromecánico' : 'Ascensores Electromecánicos'
  } marca Fujitec (Origen ${clausulas.origenEquipos})`;

  pdf.texto('De nuestra mayor consideración:', { spacing: 3 });
  pdf.texto(
    `De acuerdo a lo solicitado en el pliego de referencia, tenemos el agrado de dirigirnos a usted a fin de hacerle llegar la oferta por la provisión e instalación de ${descripcionEquipos} para la obra de referencia, sujeto a los requisitos de vigencia y/u operatividad que se determinarán en el contrato a suscribir, entre ellos -pero no limitado a- que la instalación, mantenimiento y/o reparación de los Equipos sea efectuado por Fujitec Argentina S.A.`,
    { spacing: 4 }
  );

  pdf.seccion('1. -', 'Especificaciones técnicas resumidas');
  pdf.texto('Se adjuntan especificaciones técnicas.', { spacing: 3 });

  pdf.seccion('2. -', 'Garantía');
  pdf.texto(
    `Los equipos contarán con una garantía de ${numeroEnPalabras(clausulas.garantiaAnos)} (${clausulas.garantiaAnos}) año${clausulas.garantiaAnos > 1 ? 's' : ''} luego de la recepción provisoria de cada uno de ellos.`,
    { spacing: 3 }
  );

  pdf.seccion('3. -', 'Plazo de entrega');
  pdf.texto(clausulas.plazoEntrega, { spacing: 3 });

  pdf.seccion('4. -', 'Validez de la oferta');
  pdf.texto(
    `${numeroEnPalabras(clausulas.validezDias)} (${clausulas.validezDias}) días corridos a partir de la fecha del presente.`,
    { spacing: 3 }
  );

  pdf.seccion('5. -', 'Precio (No incluye el I.V.A)');
  const totalUSD = precios.parteImportadaUSD + precios.gastosDespachoUSD;
  pdf.texto(
    `La oferta por la provisión e instalación de ${descripcionEquipos} asciende a la suma de ${formatearUSD(totalUSD)} y ${formatearARS(precios.instalacionNacionalARS)} de acuerdo al siguiente detalle:`,
    { spacing: 3 }
  );

  pdf.texto('A) Equipos Importados:', { bold: true, spacing: 1.5 });
  pdf.texto(
    `Parte Importada: ${formatearUSD(precios.parteImportadaUSD)} CIF Puerto de Buenos Aires.`,
    { indent: 5, spacing: 3 }
  );

  pdf.texto('B) Gastos de Despacho, Nacionalización, Derechos y Transporte a Obra:', {
    bold: true,
    spacing: 1.5
  });
  pdf.texto(
    `Gastos de Despacho: ${formatearUSD(precios.gastosDespachoUSD)} CIF Puerto de Buenos Aires.`,
    { indent: 5, spacing: 3 }
  );

  pdf.texto('C) Instalación Nacional:', { bold: true, spacing: 1.5 });
  pdf.texto(
    `Parte Nacional Instalación: ${formatearARS(precios.instalacionNacionalARS)}.`,
    { indent: 5, spacing: 3 }
  );

  pdf.texto(
    'A los importes precedentemente indicados se le deberá adicionar el IVA correspondiente, el que se devengará al momento de facturación y según la alícuota vigente a dicho momento.',
    { spacing: 4 }
  );

  pdf.texto('NOTAS:', { bold: true, spacing: 2 });
  clausulas.notasPrecio.forEach((nota) => pdf.vinieta(nota));

  pdf.espacio(2);
  pdf.texto('Se encuentran incluidas en nuestra cotización las siguientes tareas complementarias:', {
    bold: true,
    spacing: 2
  });
  clausulas.tareasIncluidas.forEach((tarea) => pdf.vinieta(tarea));

  pdf.espacio(2);
  pdf.texto('No se encuentra incluida dentro de nuestra oferta:', { bold: true, spacing: 2 });
  clausulas.tareasNoIncluidas.forEach((tarea) => pdf.vinieta(tarea));

  pdf.seccion('6. -', 'Servicio de mantenimiento mensual');
  const totalMantenimiento = precios.mantenimientoMensual.reduce(
    (suma, item) => suma + (item.valorUnitarioARS || 0),
    0
  );

  if (totalMantenimiento > 0) {
    pdf.texto(
      'El mantenimiento mensual sin materiales en horario normal para los ascensores asciende a:',
      { spacing: 3 }
    );

    precios.mantenimientoMensual.forEach((item) => {
      const equipo = equipos.find((e) => e.id === item.equipoId);
      const nombre = equipo ? equipo.nombre || equipo.codigoUnico : 'Equipo';
      pdf.texto(`${nombre}: ${formatearARS(item.valorUnitarioARS)} (sin IVA)`, {
        indent: 5,
        spacing: 1.2
      });
    });

    pdf.espacio(1.5);
    pdf.texto(`Total mensual (sin IVA): ${formatearARS(totalMantenimiento)}`, {
      bold: true,
      indent: 5,
      spacing: 3
    });
  }

  pdf.texto(
    `Los valores detallados se abonarán en pesos argentinos ajustables por el salario de oficial múltiple del convenio colectivo de trabajo de la UOM (Unión Obrera Metalúrgica), teniendo en cuenta el 100% de la variación de la mano de obra (Base ${precios.baseAjusteUOM}).`,
    { spacing: 4 }
  );

  pdf.seccion('7. -', 'Forma de pago');
  pdf.texto('Equipo importado (en USD) (*)', { bold: true, spacing: 2 });
  TEXTO_PAGO_IMPORTADO_ALTERNATIVAS.forEach((alternativa) =>
    pdf.texto(alternativa, { indent: 5, spacing: 2 })
  );

  pdf.texto('La forma de pago podrá realizarse de acuerdo al siguiente detalle:', { spacing: 2 });
  clausulas.formaPagoImportado.forEach((item) => pdf.vinieta(item));

  pdf.espacio(1.5);
  pdf.texto(
    '(*) Las alternativas de pago mencionadas se encuentran sujetas a las posibilidades de pago al exterior de acuerdo a las regulaciones gubernamentales correspondientes y a la posibilidad de acceso de Fujitec Argentina a la moneda dólar estadounidense.',
    { size: 8.5, spacing: 4 }
  );

  if (precios.importacionACargoDelCliente) {
    pdf.texto('Importación a cargo del Cliente:', { bold: true, spacing: 2 });
    pdf.texto(TEXTO_IMPORTACION_CLIENTE, { spacing: 4 });
  } else {
    pdf.texto('Gastos de despacho (en USD):', { bold: true, spacing: 2 });
    pdf.texto(TEXTO_PAGO_DESPACHO, { spacing: 4 });
  }

  pdf.texto('Parte Nacional, materiales e instalación (en $A):', { bold: true, spacing: 2 });
  pdf.texto(
    `Se abonará en pesos ajustables por el salario de oficial múltiple del convenio colectivo de trabajo de la UOM (Unión Obrera Metalúrgica), teniendo en cuenta el 100% de la variación de la mano de obra (Base ${precios.baseAjusteUOM}); de acuerdo al siguiente detalle:`,
    { spacing: 2 }
  );
  clausulas.formaPagoNacional.forEach((item) => pdf.vinieta(item));

  pdf.espacio(3);
  pdf.texto(clausulas.saludoFinal, { spacing: 3 });
};

/** Valor de un campo por grupo; si difiere entre grupos, lo desdobla. */
const escribirCampoPorGrupo = (
  pdf: ConstructorPdf,
  grupos: { etiqueta: string; equipos: Equipo[] }[],
  obtenerValor: (equipo: Equipo) => string
) => {
  const valores = grupos.map((grupo) => obtenerValor(grupo.equipos[0]));
  const todosIguales = valores.every((valor) => valor === valores[0]);

  if (todosIguales) {
    pdf.texto(valores[0], { indent: 3 });
    return;
  }

  grupos.forEach((grupo, indice) => {
    pdf.texto(`${grupo.etiqueta}:`, { bold: true, indent: 3, spacing: 0.8 });
    pdf.texto(valores[indice], { indent: 7 });
  });
};

/** Documento 3: especificaciones técnicas de los ascensores. */
const generarEspecificaciones = (
  pdf: ConstructorPdf,
  propuesta: PropuestaTecnicoEconomica,
  obra: Obra,
  equipos: Equipo[]
) => {
  pdf.iniciarDocumento();

  const grupos = agruparEquipos(equipos);
  const primero = equipos[0];
  const rangoCompleto = etiquetaRangoCompleto(equipos);
  const opciones = propuesta.opcionesTecnicas;
  const textos = propuesta.textosEspecificaciones || TEXTOS_ESPECIFICACIONES_DEFAULT;

  const tipoSala = primero.tipoSalaMaquinas || 'Sin Sala de Máquinas (MRL)';
  const variante =
    VARIANTES_SALA_MAQUINAS[tipoSala as keyof typeof VARIANTES_SALA_MAQUINAS] ||
    VARIANTES_SALA_MAQUINAS['Sin Sala de Máquinas (MRL)'];

  pdf.texto(propuesta.destinatario.numeroFA, { bold: true, spacing: 4 });
  pdf.tituloBloque('Especificaciones técnicas');
  pdf.texto(`OBRA: ${obra.nombre} (${obra.codigo})`, { bold: true, spacing: 2 });

  pdf.texto('SUMINISTRO:', { bold: true, spacing: 1.5 });
  grupos.forEach((grupo) => pdf.texto(describirSuministro(grupo), { indent: 3, spacing: 1 }));
  pdf.espacio(3);

  pdf.tituloBloque(`1.0 Características de ascensores ${rangoCompleto}`);

  pdf.seccion('1.0.1', 'Velocidad:');
  escribirCampoPorGrupo(pdf, grupos, (e) => `${velocidadMetrosPorMinuto(e)} m/min.`);

  pdf.seccion('1.0.2', 'Bajo / sobre recorrido:');
  pdf.texto(
    `Bajo recorrido: ${formatearNumero(primero.alturaTotal)} mm (según proyecto)`,
    { indent: 3, spacing: 1 }
  );
  pdf.texto(`Sobre recorrido: ${formatearNumero(primero.alturaTotal)} mm (según proyecto)`, {
    indent: 3
  });

  pdf.seccion('1.0.3', 'Dimensiones de pasadizo necesario:');
  escribirCampoPorGrupo(
    pdf,
    grupos,
    (e) =>
      `${formatearNumero(e.anchoPasadizo)} mm. (ancho) x ${formatearNumero(e.profundidadPasadizo)} mm. (profundidad)`
  );

  pdf.seccion('1.0.4', 'Capacidad:');
  escribirCampoPorGrupo(
    pdf,
    grupos,
    (e) => `${formatearNumero(e.capacidadKg)} kg / ${e.capacidadPersonas ?? '__'} personas`
  );

  pdf.seccion('1.0.5', 'Número de paradas:');
  escribirCampoPorGrupo(pdf, grupos, (e) => {
    const paradas = e.paradas ?? 0;
    const designacion = e.designacionPisos ? ` (${e.designacionPisos})` : '';
    return `${numeroEnPalabras(paradas)} (${paradas}) paradas y entradas, en todos los casos al mismo lado del pasadizo.${designacion}`;
  });

  pdf.seccion('1.0.6', 'Recorrido');
  escribirCampoPorGrupo(pdf, grupos, (e) => `${formatearNumero(e.recorrido)} mm. aprox.`);

  pdf.seccion('1.0.7', 'Máquina de tracción:');
  pdf.texto(variante.maquinaTraccion, { indent: 3 });

  pdf.seccion('1.0.8', 'Alimentación:');
  pdf.texto(textos.alimentacion, { indent: 3 });

  pdf.seccion('1.0.9', 'Motores:');
  pdf.texto(textos.motores, { indent: 3 });

  pdf.seccion('1.0.10', 'Operación:');
  const maniobra = primero.maniobra || 'ascendente-descendente';
  const grupoControl = primero.grupo ? `, ${primero.grupo}` : '';
  pdf.texto(`Operación automática ${maniobra}${grupoControl}.`, { indent: 3 });

  pdf.tituloBloque('1.1 Cabina');

  pdf.seccion('1.1.1', 'Dimensiones interiores aproximadas');
  escribirCampoPorGrupo(
    pdf,
    grupos,
    (e) =>
      `${formatearNumero(e.anchoCabina)} mm. (ancho) x ${formatearNumero(e.profundidadCabina)} mm. (profundidad) x ${formatearNumero(e.altoCabina)} mm. a cielorraso.`
  );

  pdf.seccion('1.1.2', 'Plataforma:');
  pdf.texto(textos.plataforma, { indent: 3 });

  pdf.seccion('1.1.3', 'Bastidor:');
  pdf.texto(textos.bastidor, { indent: 3 });

  pdf.seccion('1.1.4', 'Piso:');
  pdf.texto(textos.piso, { indent: 3 });

  pdf.seccion('1.1.5', 'Techo:');
  pdf.texto(opciones.cielorraso, { indent: 3 });

  pdf.seccion('1.1.6', 'Puertas:');
  escribirCampoPorGrupo(pdf, grupos, (e) => {
    const apertura = e.tipoApertura || 'central';
    return `Puertas automáticas, de apertura ${apertura}, paso libre de ${formatearNumero(e.doorOP)} mm. (ancho) x ${formatearNumero(e.doorH)} mm. (altura), ejecutadas en acero inoxidable AISI 304.`;
  });

  pdf.seccion('1.1.7', 'Jamba y frente:');
  pdf.texto(textos.jambaFrente, { indent: 3 });

  pdf.seccion('1.1.8', 'Revestimiento:');
  pdf.texto(
    `Se realizarán con paneles de acero inoxidable AISI 304, ${opciones.revestimientoCabina}. Los mismos se calibran para asegurar su ensamble perfecto y su transporte se realiza en condiciones que garantizan la inalterabilidad de su terminación de fábrica.`,
    { indent: 3 }
  );

  pdf.seccion('1.1.9', 'Zócalos:');
  pdf.texto(textos.zocalos, { indent: 3 });

  pdf.seccion('1.1.10', 'Umbral:');
  pdf.texto(textos.umbral, { indent: 3 });

  pdf.seccion('1.1.11', 'Ventilación:');
  pdf.texto(textos.ventilacion, { indent: 3 });

  pdf.seccion('1.1.12', 'Pasamanos:');
  pdf.texto(textos.pasamanos, { indent: 3 });

  pdf.tituloBloque('1.2 Dispositivos de seguridad');
  const seguridad: [string, string, string][] = [
    ['1.2.1', 'Regulador de velocidad:', textos.reguladorVelocidad],
    ['1.2.2', 'Freno:', textos.freno],
    ['1.2.3', 'Sensor de peso:', textos.sensorPeso],
    ['1.2.4', 'Amortiguador:', textos.amortiguador],
    ['1.2.5', 'Interruptor de fin de carrera:', textos.finCarrera],
    ['1.2.6', 'Dispositivo de emergencia:', textos.dispositivoEmergencia],
    ['1.2.7', 'Cerraduras electromecánicas:', textos.cerraduras],
    ['1.2.8', 'Luz de emergencia:', textos.luzEmergencia],
    ['1.2.9', 'Paracaídas:', textos.paracaidas],
    ['1.2.10', 'Puertas:', textos.puertasSeguridad]
  ];
  seguridad.forEach(([numero, titulo, contenido]) => {
    pdf.seccion(numero, titulo);
    pdf.texto(contenido, { indent: 3 });
  });

  pdf.tituloBloque('1.3 Mando y señalización');
  pdf.seccion('1.3.1', 'Tablero de comando de cabina:');
  pdf.texto(
    'Se instalará una botonera con máscara de acero inoxidable AISI 304 pulido mate sujeta mediante tornillos. Las mismas contendrán:',
    { indent: 3, spacing: 1.5 }
  );
  textos.tableroCabina.forEach((item, indice) =>
    pdf.texto(`${indice + 1}) ${item}`, { indent: 7, spacing: 0.8 })
  );
  pdf.espacio(1);
  pdf.texto('Los botones serán tipo micro movimiento con registro de llamada.', { indent: 3 });

  pdf.seccion('1.3.2', 'Señal de pasillo:');
  pdf.texto(opciones.senalPasillo, { indent: 3 });

  pdf.tituloBloque('1.4 Maniobra');
  pdf.texto(textos.maniobra, { indent: 3, spacing: 1 });
  if (primero.control) pdf.texto(`Control ${primero.control}`, { indent: 3 });

  pdf.tituloBloque('1.5 Puertas de pasillos');
  pdf.texto('En todos los pisos', { indent: 3, spacing: 1.5 });
  escribirCampoPorGrupo(pdf, grupos, (e) => {
    const apertura = e.tipoApertura || 'central';
    return `Puertas automáticas, de apertura ${apertura}, paso libre de ${formatearNumero(e.doorOP)} mm. (ancho) x ${formatearNumero(e.doorH)} mm. (altura), ${opciones.puertasPasillo}`;
  });

  pdf.tituloBloque('1.6 Marcos');
  pdf.texto(opciones.marcos, { indent: 3 });

  pdf.tituloBloque('1.7 Umbrales');
  pdf.texto(textos.umbrales, { indent: 3 });

  pdf.tituloBloque('1.8 Contrapesos');
  pdf.texto(
    `Armados sobre un bastidor de acero con pasantes de seguridad. Su peso será igual al de la cabina más el 50% de la carga normal. ${opciones.contrapeso}.`,
    { indent: 3 }
  );

  pdf.tituloBloque('1.9 Guías');
  pdf.texto(textos.guias, { indent: 3 });

  if (opciones.incluyeElvic) {
    pdf.tituloBloque('1.10 Sistema de control y supervisión (ELVIC)');
    pdf.texto(textos.textoElvic, { indent: 3, spacing: 2 });
    pdf.texto(variante.cableadoElvic, { indent: 3 });
  }
};

/** Carga el logo como data URL para incrustarlo en el PDF. */
const cargarLogo = async (): Promise<string | null> => {
  try {
    // El logotipo institucional, no la mascota que usa el sidebar de la app.
    const respuesta = await fetch('/assets/fujitec-logotipo.png');
    if (!respuesta.ok) return null;
    const blob = await respuesta.blob();
    return await new Promise((resolve) => {
      const lector = new FileReader();
      lector.onloadend = () => resolve(lector.result as string);
      lector.onerror = () => resolve(null);
      lector.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export interface ResultadoPdf {
  blob: Blob;
  nombreArchivo: string;
}

/**
 * Encabezado "Obra:" de los anexos institucionales.
 *
 * En las plantillas Word ese renglón es un campo que se completaba a mano, y
 * al exportar a PDF quedó como "Obra: (A - )" — con el texto fijo presente
 * pero el nombre y el código vacíos. Se tapa el renglón entero y se reescribe
 * completo, que es más robusto que intentar insertar en los huecos.
 *
 * Medido sobre los PDF reales: x=78, y=743.9 en los anexos de ayuda de gremio
 * y y=737.5 en el de características generales, sobre páginas A4 de 842 pt.
 * Se usa la distancia al borde superior para no depender del alto de página.
 */
const ENCABEZADO_ANEXO = {
  x: 78,
  altoBanda: 14,
  /** Ancho generoso: el título de obra es más largo que el placeholder. */
  anchoTapa: 260,
  tamanoFuente: 9
};

/**
 * Distancia del renglón "Obra:" al borde superior, por anexo.
 *
 * No es la misma en todos: 104.5 pt en características generales y 98.2 pt en
 * los de ayuda de gremio. Usar un valor único dejaba el placeholder original
 * sin tapar en uno de los dos.
 */
const DISTANCIA_ENCABEZADO: Record<string, number> = {
  'caracteristicas-generales.pdf': 104.5,
  'ayuda-gremio-con-sala.pdf': 98.2,
  'ayuda-gremio-sin-sala.pdf': 98.2
};

/**
 * Número FA dentro de los anexos: aparece sólo en la primera página, debajo
 * del encabezado de obra, como "FA 21-0XXX" / "FA 23–0xxx" sin completar.
 * Es el mismo número de la carátula — hay uno por obra.
 *
 * Medido en los PDF reales: x=78, y≈718.3 (características) y y≈719.3
 * (gremios), sobre páginas A4 de 842 pt.
 */
const NUMERO_FA_ANEXO = {
  x: 78,
  /** Alto holgado: el placeholder viene resaltado en amarillo y hay que
   *  cubrirlo por completo, incluido el borde superior del resaltado. */
  altoBanda: 15,
  anchoTapa: 120,
  tamanoFuente: 9
};

/** Igual que el encabezado, la posición del FA difiere entre anexos. */
const DISTANCIA_FA: Record<string, number> = {
  'caracteristicas-generales.pdf': 123.7,
  'ayuda-gremio-con-sala.pdf': 122.7,
  'ayuda-gremio-sin-sala.pdf': 122.7
};

/**
 * Páginas de cada anexo que llevan encabezado "Obra:".
 *
 * No todas lo tienen: en los documentos de ayuda de gremio, sólo las primeras
 * seis páginas llevan membrete; el resto son planos y tablas a página completa.
 * Escribir ahí superpone el texto sobre el dibujo, así que se estampa
 * únicamente donde el anexo original ya tiene el renglón.
 *
 * Se declara por archivo en vez de detectarlo: los anexos son documentos fijos
 * y su texto viene con fuentes embebidas de Word cuya codificación no permite
 * buscar "Obra:" de forma confiable.
 */
const PAGINAS_CON_ENCABEZADO: Record<string, number | 'todas'> = {
  'caracteristicas-generales.pdf': 'todas',
  'ayuda-gremio-con-sala.pdf': 6,
  'ayuda-gremio-sin-sala.pdf': 6
};

/**
 * Quita los resaltados de color del cuerpo de un anexo.
 *
 * Las plantillas vienen con párrafos marcados en amarillo (y alguno en rojo):
 * son marcas de trabajo para el que arma la propuesta, no algo que deba llegar
 * al cliente. Se reemplaza el color de relleno por blanco en el content
 * stream, que deja el texto intacto y sólo despinta el fondo.
 *
 * Sólo toca `rg` (relleno) y no `RG` (trazo), para no alterar líneas ni bordes.
 */
const despintarResaltados = async (documento: any): Promise<void> => {
  const { PDFName, PDFRawStream, PDFArray, decodePDFRawStream } = await import('pdf-lib');

  // Amarillo y rojo puros, en las formas en que Word los escribe.
  const COLORES_RESALTADO = /(?<![\d.])(?:1|1\.0+)\s+(?:1|1\.0+)\s+(?:0|0\.0+)\s+rg|(?<![\d.])(?:1|1\.0+)\s+(?:0|0\.0+)\s+(?:0|0\.0+)\s+rg/g;

  const limpiarStream = (stream: any, contexto: any): void => {
    if (!(stream instanceof PDFRawStream)) return;

    let bytes: Uint8Array;
    try {
      bytes = decodePDFRawStream(stream).decode();
    } catch {
      return; // Stream con filtro que no sabemos decodificar: se deja igual.
    }

    // El stream es binario: se trabaja byte a byte y se reescribe con la
    // misma correspondencia 1 byte = 1 código. Decodificar a texto y volver a
    // codificar con TextEncoder rompería los acentos, porque TextEncoder
    // siempre emite UTF-8 y convertiría cada byte alto en dos.
    const contenido = Array.from(bytes, (b) => String.fromCharCode(b)).join('');

    COLORES_RESALTADO.lastIndex = 0;
    if (!COLORES_RESALTADO.test(contenido)) return;
    COLORES_RESALTADO.lastIndex = 0;

    const limpio = contenido.replace(COLORES_RESALTADO, '1 1 1 rg');

    const bytesLimpios = new Uint8Array(limpio.length);
    for (let i = 0; i < limpio.length; i++) {
      bytesLimpios[i] = limpio.charCodeAt(i) & 0xff;
    }

    // Se reescribe sin comprimir: el stream nuevo ya no coincide con el
    // Filter original, así que hay que quitarlo.
    stream.dict.delete(PDFName.of('Filter'));
    stream.dict.delete(PDFName.of('DecodeParms'));
    stream.contents = bytesLimpios;
    stream.dict.set(PDFName.of('Length'), contexto.obj(bytesLimpios.length));
  };

  for (const pagina of documento.getPages()) {
    const contexto = pagina.node.context;

    const contents = pagina.node.Contents();
    if (contents) {
      const streams =
        contents instanceof PDFArray
          ? contents.asArray().map((ref: any) => contexto.lookup(ref))
          : [contents];
      streams.forEach((stream: any) => limpiarStream(stream, contexto));
    }

    // En algunas páginas el resaltado no está en el stream de la página sino
    // dentro de un XObject de formulario, así que hay que entrar ahí también.
    const recursos = pagina.node.Resources();
    const xObjects = recursos?.lookup(PDFName.of('XObject'));
    if (!xObjects?.entries) continue;

    for (const [, referencia] of xObjects.entries()) {
      limpiarStream(contexto.lookup(referencia), contexto);
    }
  }
};

/**
 * Completa los campos que en las plantillas Word se llenaban a mano: el
 * encabezado "Obra:" y el número FA. Sólo escribe donde el anexo original
 * ya tiene esos renglones.
 */
const estamparObraEnAnexo = async (
  anexo: ArrayBuffer,
  tituloObra: string,
  nombreArchivoAnexo: string,
  numeroFA: string
): Promise<ArrayBuffer> => {
  try {
    const { PDFDocument, rgb } = await import('pdf-lib');
    const documento = await PDFDocument.load(anexo);

    // Se embebe una fuente propia en vez de usar StandardFonts: sobre estos
    // PDF exportados desde Word, las fuentes estándar no llegan a resolverse
    // al re-guardar y el texto termina no dibujándose.
    const fontkit = (await import('@pdf-lib/fontkit')).default;
    documento.registerFontkit(fontkit);

    const respuestaFuente = await fetch('/assets/fonts/roboto-400.woff');
    if (!respuestaFuente.ok) throw new Error('No se pudo cargar la fuente del estampado');
    const fuente = await documento.embedFont(await respuestaFuente.arrayBuffer(), {
      subset: true
    });

    // Las marcas de trabajo en amarillo del Word no deben llegar al cliente.
    await despintarResaltados(documento);

    const paginas = documento.getPages();
    const configurado = PAGINAS_CON_ENCABEZADO[nombreArchivoAnexo] ?? 'todas';
    const hasta = configurado === 'todas' ? paginas.length : configurado;
    const distanciaEncabezado = DISTANCIA_ENCABEZADO[nombreArchivoAnexo] ?? 98.2;

    paginas.slice(0, hasta).forEach((pagina) => {
      const { height } = pagina.getSize();
      const y = height - distanciaEncabezado;

      // Tapa el renglón viejo antes de reescribirlo.
      pagina.drawRectangle({
        x: ENCABEZADO_ANEXO.x - 3,
        y: y - 3,
        width: ENCABEZADO_ANEXO.anchoTapa,
        height: ENCABEZADO_ANEXO.altoBanda,
        color: rgb(1, 1, 1)
      });

      pagina.drawText(`Obra: ${tituloObra}`, {
        x: ENCABEZADO_ANEXO.x,
        y,
        size: ENCABEZADO_ANEXO.tamanoFuente,
        font: fuente,
        color: rgb(0.42, 0.46, 0.48)
      });
    });

    // El número FA figura sólo en la primera página de cada anexo.
    const [primeraPagina] = paginas;
    if (primeraPagina && numeroFA) {
      const { height } = primeraPagina.getSize();
      const yFA = height - (DISTANCIA_FA[nombreArchivoAnexo] ?? 122.7);

      primeraPagina.drawRectangle({
        x: NUMERO_FA_ANEXO.x - 3,
        y: yFA - 3,
        width: NUMERO_FA_ANEXO.anchoTapa,
        height: NUMERO_FA_ANEXO.altoBanda,
        color: rgb(1, 1, 1)
      });

      primeraPagina.drawText(numeroFA, {
        x: NUMERO_FA_ANEXO.x,
        y: yFA,
        size: NUMERO_FA_ANEXO.tamanoFuente,
        font: fuente,
        color: rgb(0.17, 0.2, 0.21)
      });
    }

    const bytes = await documento.save();
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength
    ) as ArrayBuffer;
  } catch (error) {
    // Si falla el estampado se usa el anexo original: es preferible que salga
    // con el placeholder a que no salga la sección.
    console.error('No se pudo completar el encabezado del anexo:', error);
    return anexo;
  }
};

/**
 * Genera el PDF completo. Orden del documento final:
 *   1. Características generales   (anexo institucional)
 *   2. Ayuda de gremio             (anexo institucional)
 *   3. Carta de presentación
 *   4. Oferta económica
 *   5. Especificaciones técnicas
 *
 * Los anexos van adelante y se adjuntan tal cual, conservando su maquetación
 * original con imágenes y diagramas.
 */
export const generarPropuestaPdf = async (
  propuesta: PropuestaTecnicoEconomica,
  obra: Obra,
  _cliente: Cliente | undefined,
  equipos: Equipo[],
  version: number,
  anexos: {
    caracteristicasGenerales?: ArrayBuffer;
    ayudaGremio?: ArrayBuffer;
    /** Nombre del archivo de gremio usado: define qué páginas llevan encabezado. */
    nombreAyudaGremio?: string;
  } = {}
): Promise<ResultadoPdf> => {
  const logo = await cargarLogo();
  const tituloObra = `${obra.nombre} (${obra.codigo})`;
  const pdf = new ConstructorPdf(tituloObra, logo);

  generarCartaPresentacion(pdf, propuesta);
  generarOfertaEconomica(pdf, propuesta, equipos);
  if (equipos.length > 0) {
    generarEspecificaciones(pdf, propuesta, obra, equipos);
  }

  pdf.cerrarDocumento();
  pdf.aplicarMembretes();

  const bytesGenerados = pdf.doc.output('arraybuffer') as ArrayBuffer;

  const anexosACombinar = [
    { bytes: anexos.caracteristicasGenerales, nombre: 'caracteristicas-generales.pdf' },
    { bytes: anexos.ayudaGremio, nombre: anexos.nombreAyudaGremio || 'ayuda-gremio-con-sala.pdf' }
  ].filter((anexo): anexo is { bytes: ArrayBuffer; nombre: string } => !!anexo.bytes);

  let bytesFinales = bytesGenerados;

  if (anexosACombinar.length > 0) {
    try {
      const { PDFDocument } = await import('pdf-lib');

      // Se arranca de un documento vacío y se van agregando en orden: así los
      // anexos quedan adelante sin depender de la numeración interna de jsPDF.
      const documentoFinal = await PDFDocument.create();

      for (const anexo of anexosACombinar) {
        // Los anexos traen el encabezado "Obra: XXXX (A-XXXX)" sin completar,
        // porque en el Word se llenaba a mano. Se completa acá.
        const anexoSellado = await estamparObraEnAnexo(
          anexo.bytes,
          tituloObra,
          anexo.nombre,
          propuesta.destinatario.numeroFA
        );
        const documentoAnexo = await PDFDocument.load(anexoSellado);
        const paginas = await documentoFinal.copyPages(
          documentoAnexo,
          documentoAnexo.getPageIndices()
        );
        paginas.forEach((pagina) => documentoFinal.addPage(pagina));
      }

      const documentoGenerado = await PDFDocument.load(bytesGenerados);
      const paginasGeneradas = await documentoFinal.copyPages(
        documentoGenerado,
        documentoGenerado.getPageIndices()
      );
      paginasGeneradas.forEach((pagina) => documentoFinal.addPage(pagina));

      const combinado = await documentoFinal.save();
      bytesFinales = combinado.buffer.slice(
        combinado.byteOffset,
        combinado.byteOffset + combinado.byteLength
      ) as ArrayBuffer;
    } catch (error) {
      // Si un anexo está dañado, se emite igual el documento principal.
      console.error('No se pudieron adjuntar los anexos:', error);
      bytesFinales = bytesGenerados;
    }
  }

  return {
    blob: new Blob([bytesFinales], { type: 'application/pdf' }),
    nombreArchivo: `${obra.nombre} (${obra.codigo}) V${version}.pdf`
  };
};
