import { supabase } from './supabaseClient';

/**
 * Relleno de columnas heredadas.
 *
 * Las tablas tienen columnas NOT NULL que la app no maneja (restos de un modelo
 * de datos anterior) y que no se pueden aflojar con un ALTER desde el SQL
 * Editor. Sin esto, cada insert falla con 23502 por una columna distinta y hay
 * que ir descubriéndolas de a una.
 *
 * La estrategia: leer un registro existente de la tabla y copiar de él las
 * columnas que la app no envía. Nunca se pisan los campos propios.
 */

const plantillas = new Map<string, Record<string, any>>();

/** Columnas que gestiona la app y que jamás deben copiarse de otra fila. */
const CAMPOS_PROPIOS: Record<string, string[]> = {
  obras: [
    'id', 'nombre', 'cliente_id', 'descripcion', 'provincia', 'presupuesto',
    'etapa_actual', 'estado', 'notas', 'codigo', 'historial_log', 'created_by',
    'created_at', 'updated_at', 'deleted_at'
  ],
  clientes: [
    'id', 'nombre', 'contacto_principal', 'cargo', 'email', 'telefono',
    'direccion', 'cuit_rut', 'contactos', 'ciudad', 'provincia', 'pais',
    'tipo', 'estado', 'created_by', 'fecha_creacion', 'fecha_actualizacion',
    'created_at', 'updated_at', 'deleted_at'
  ],
  actividades: [
    'id', 'obra_id', 'tipo', 'descripcion', 'estado', 'fecha_completacion',
    'fecha_creacion', 'fecha_vencimiento', 'usuario_asignado', 'usuario_creador',
    'created_at', 'updated_at', 'deleted_at'
  ],
  equipos: [
    'id', 'obra_id', 'tipo', 'modelo', 'serial', 'velocidad', 'capacidad',
    'puertas', 'notas', 'estado', 'estado_instalacion',
    'created_at', 'updated_at', 'deleted_at'
  ]
};

/**
 * Completa en `payload` las columnas heredadas de la tabla, tomando los valores
 * de un registro existente. Muta el objeto recibido.
 */
export const completarCamposHeredados = async (
  tabla: string,
  payload: Record<string, any>
): Promise<void> => {
  if (!plantillas.has(tabla)) {
    const { data } = await supabase.from(tabla).select('*').limit(1);
    plantillas.set(tabla, data?.[0] ?? {});
  }

  const plantilla = plantillas.get(tabla)!;
  const propios = CAMPOS_PROPIOS[tabla] ?? [];

  for (const [campo, valor] of Object.entries(plantilla)) {
    if (propios.includes(campo)) continue;
    if (valor === null || valor === undefined) continue;
    if (payload[campo] === null || payload[campo] === undefined) {
      payload[campo] = valor;
    }
  }
};
