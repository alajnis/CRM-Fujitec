/**
 * Canal único para los errores de persistencia.
 *
 * Antes cada `.catch()` hacía sólo `console.error`, así que un guardado que
 * fallaba se veía exactamente igual que uno exitoso: la UI mostraba el cambio
 * (estado local ya actualizado) y el error quedaba enterrado en la consola.
 * Ahora todo fallo de escritura se emite acá y la app lo muestra en pantalla.
 */

export interface ErrorGuardado {
  entidad: string;
  operacion: 'crear' | 'actualizar' | 'eliminar';
  mensaje: string;
  detalle?: string;
}

type Listener = (error: ErrorGuardado) => void;

const listeners = new Set<Listener>();

export const onErrorGuardado = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Traduce el error de Supabase a algo accionable para el usuario. */
const explicar = (err: any): string => {
  const code = err?.code;
  const message: string = err?.message || 'Error desconocido';

  if (code === '23502') {
    const col = message.match(/column "([^"]+)"/)?.[1];
    return `Falta un dato obligatorio${col ? ` (${col})` : ''} en la base de datos.`;
  }
  if (code === '23503') return 'El registro referencia algo que no existe (clave foránea).';
  if (code === '23505') return 'Ya existe un registro con ese valor único.';
  if (code === '22P02') return 'Un identificador tiene formato inválido.';
  if (code === '42501') return 'Sin permisos para escribir (revisar las policies de RLS).';
  if (code === 'PGRST204' || code === '42703') {
    const col = message.match(/'([^']+)' column/)?.[1];
    return `La columna${col ? ` "${col}"` : ''} no existe en la tabla.`;
  }
  return message;
};

export const reportarErrorGuardado = (
  entidad: string,
  operacion: ErrorGuardado['operacion'],
  err: any
) => {
  const error: ErrorGuardado = {
    entidad,
    operacion,
    mensaje: explicar(err),
    detalle: err?.details || err?.hint || undefined
  };

  console.error(`❌ Error al ${operacion} ${entidad}:`, err);
  listeners.forEach((l) => l(error));
};

/**
 * Envuelve una promesa de guardado para que sus errores lleguen a la UI.
 * Uso: `conReporte('equipo', 'crear', equiposService.createEquipo(data))`
 */
export const conReporte = <T,>(
  entidad: string,
  operacion: ErrorGuardado['operacion'],
  promesa: Promise<T>
): Promise<T | undefined> =>
  promesa.catch((err) => {
    reportarErrorGuardado(entidad, operacion, err);
    return undefined;
  });
