import { Obra } from '../types';

export interface SemaforoInfo {
  colorHex: string;
  estado: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  nivel: 'critico' | 'alerta' | 'objetivo';
}

/**
 * Paleta de Colores Condicionales (Semáforos Comerciales Fujitec)
 * < 60%: Crítico / Desvío Importante (#DC3545)
 * 60% - 94%: En Alerta / Seguimiento Activo (#FFC107)
 * >= 95%: Objetivo Alcanzado o Superado (#28A745)
 */
export function getSemaforoComercial(porcentaje: number): SemaforoInfo {
  if (porcentaje < 60) {
    return {
      colorHex: '#DC3545',
      estado: 'Crítico / Desvío Importante',
      badgeBg: 'bg-red-100 text-red-800 border-red-300',
      badgeText: 'Crítico (<60%)',
      borderColor: 'border-red-500',
      nivel: 'critico'
    };
  } else if (porcentaje < 95) {
    return {
      colorHex: '#FFC107',
      estado: 'En Alerta / Seguimiento Activo',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'En Alerta (60-94%)',
      borderColor: 'border-amber-400',
      nivel: 'alerta'
    };
  } else {
    return {
      colorHex: '#28A745',
      estado: 'Objetivo Alcanzado o Superado',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      badgeText: 'Objetivo Alcanzado (≥95%)',
      borderColor: 'border-emerald-500',
      nivel: 'objetivo'
    };
  }
}

/**
 * Calcula la cantidad de días transcurridos desde la última actualización
 */
export function getDiasSinActualizar(fechaISO: string): number {
  if (!fechaISO) return 0;
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Comprueba si una obra requiere alerta temporal por llevar más de N días sin acción
 * Considera: cambio de etapa, notas agregadas, o ediciones de obra
 */
export function tieneAlertaTemporal(obra: Obra, diasMaximos: number = 7): boolean {
  if (obra.estado === 'Finalizadas' || obra.estado === 'Rechazadas' || obra.estado === 'Contratadas') {
    return false; // Obras cerradas o ya contratadas no generan alerta
  }

  // Recolectar todas las fechas de acciones
  const fechas: string[] = [obra.fechaUltimaActualizacion];

  // Agregar fechas de etapaLogs
  if (obra.etapaLogs && obra.etapaLogs.length > 0) {
    const maxLogFecha = obra.etapaLogs
      .map((log) => log.fechaCambio)
      .sort()
      .reverse()[0];
    if (maxLogFecha) fechas.push(maxLogFecha);
  }

  // Agregar fechas de actividades
  if (obra.actividades && obra.actividades.length > 0) {
    const maxActividadFecha = obra.actividades
      .map((act) => act.fecha)
      .sort()
      .reverse()[0];
    if (maxActividadFecha) fechas.push(maxActividadFecha);
  }

  // Usar la fecha más reciente de todas las acciones
  const fechaMasReciente = fechas.filter(Boolean).sort().reverse()[0];
  const dias = getDiasSinActualizar(fechaMasReciente);
  return dias > diasMaximos;
}

/**
 * Formateador de moneda en USD
 */
export function formatUSD(monto: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(monto);
}

/**
 * Formateador de fecha corta en español
 */
export function formatDateES(fechaISO: string): string {
  if (!fechaISO) return '-';
  const parts = fechaISO.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return fechaISO;
}
