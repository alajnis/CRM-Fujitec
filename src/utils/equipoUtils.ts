import { Obra, Equipo, EquipmentMainType } from '../types';

export interface EquipmentCount {
  ascensores: number;
  escaleras: number;
  rampas: number;
  montacargas: number; // desglose de ascensores
}

export function contarEquiposPorTipo(obra: Obra, equipos: Equipo[]): EquipmentCount {
  const count: EquipmentCount = {
    ascensores: 0,
    escaleras: 0,
    rampas: 0,
    montacargas: 0
  };

  if (!obra.equipoIds || obra.equipoIds.length === 0) {
    return count;
  }

  obra.equipoIds.forEach(equipoId => {
    const equipo = equipos.find(e => e.id === equipoId);
    if (!equipo) return;

    if (equipo.tipo === 'Ascensor') {
      count.ascensores++;
      if (equipo.uso === 'Montacargas') {
        count.montacargas++;
      }
    } else if (equipo.tipo === 'Escalera') {
      count.escaleras++;
    } else if (equipo.tipo === 'Rampa') {
      count.rampas++;
    }
  });

  return count;
}

export function obtenerModeloPrincipal(obra: Obra, equipos: Equipo[]): string {
  if (!obra.equipoIds || obra.equipoIds.length === 0) {
    return 'N/A';
  }

  const primerEquipo = equipos.find(e => e.id === obra.equipoIds?.[0]);
  return primerEquipo?.modelo || 'N/A';
}

// Un equipo puede estar asignado a lo sumo a UNA obra a la vez.
// Devuelve la obra que lo tiene asignado actualmente (si existe), excluyendo
// opcionalmente una obra puntual (útil al editar esa misma obra).
export function obtenerObraDeEquipo(equipoId: string, obras: Obra[], excludeObraId?: string): Obra | undefined {
  return obras.find(o =>
    !o.isDeleted &&
    o.id !== excludeObraId &&
    (o.equipoIds || []).includes(equipoId)
  );
}
