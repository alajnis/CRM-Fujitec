import { supabase } from './supabaseClient';
import { FunnelStage } from '../types';

const actividadTextos: Record<FunnelStage, string[]> = {
  'Solicitud': [
    'Recibir solicitud formal del cliente',
    'Registrar en sistema CRM',
    'Asignar responsable comercial',
    'Enviar confirmación de recepción',
    'Programar reunión inicial'
  ],
  'En estudio de proyecto': [
    'Recopilar datos técnicos del proyecto',
    'Análisis de especificaciones requeridas',
    'Coordinar con equipo técnico Fujitec',
    'Revisar planos y pasadizos',
    'Preparar estimado preliminar'
  ],
  'Estimado': [
    'Finalizar cálculos técnicos',
    'Preparar propuesta comercial',
    'Revisar términos y condiciones',
    'Obtener aprobación legal',
    'Enviar estimado al cliente'
  ],
  'Cotización': [
    'Presentar cotización formal',
    'Responder consultas técnicas',
    'Negociar términos comerciales',
    'Obtener aprobación presupuestaria',
    'Preparar contrato definitivo'
  ],
  'Contratadas': [
    'Ejecutar contrato y recibir firma',
    'Procesar anticipo/pago inicial',
    'Iniciar fabricación en planta',
    'Coordinar logística de transporte',
    'Preparar instalación y puesta en marcha'
  ],
  'Finalizadas': [
    'Completar instalación',
    'Realizar pruebas técnicas finales',
    'Capacitación a operarios del cliente',
    'Recepción definitiva',
    'Cerrar orden y documentación'
  ],
  'Rechazadas': [
    'Documentar razón del rechazo',
    'Analizar feedback del cliente',
    'Actualizar historial de relación',
    'Mantener contacto para futuras oportunidades'
  ]
};

const mapEtapaToSupabaseEtapa = (etapa: FunnelStage): string => {
  const mapping: Record<FunnelStage, string> = {
    'Solicitud': 'prospeccion',
    'En estudio de proyecto': 'evaluacion',
    'Estimado': 'propuesta',
    'Cotización': 'negociacion',
    'Contratadas': 'orden',
    'Finalizadas': 'cierre',
    'Rechazadas': 'prospeccion'
  };
  return mapping[etapa] || 'prospeccion';
};

/**
 * Crea el set completo de actividades por etapa para una obra recién creada.
 * Devuelve las actividades insertadas para que el caller pueda reflejarlas en
 * el estado local sin esperar a la próxima recarga.
 */
export const seedActividadesParaObra = async (obraId: string) => {
  const stages: FunnelStage[] = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas', 'Finalizadas', 'Rechazadas'];
  const activitiesToInsert: any[] = [];

  for (const stage of stages) {
    const supabaseEtapa = mapEtapaToSupabaseEtapa(stage);
    for (const texto of actividadTextos[stage]) {
      activitiesToInsert.push({
        id: crypto.randomUUID(),
        obra_id: obraId,
        descripcion: texto,
        estado: 'pendiente',
        tipo: supabaseEtapa,
        fecha_creacion: new Date().toISOString(),
        usuario_creador: null
      });
    }
  }

  const { data, error } = await supabase
    .from('actividades')
    .insert(activitiesToInsert)
    .select();

  if (error) {
    console.error(`❌ Error creating activities for obra ${obraId}:`, error);
    throw error;
  }

  return data || [];
};

export const seedActividades = async () => {
  try {
    console.log('🌱 Starting activities seed...');

    // Get all obras
    const { data: obras, error: obrasError } = await supabase
      .from('obras')
      .select('id, etapa_actual')
      .is('deleted_at', null);

    if (obrasError) {
      console.error('❌ Error fetching obras:', obrasError);
      throw obrasError;
    }
    if (!obras || obras.length === 0) {
      console.log('⚠️ No obras found');
      return;
    }

    console.log(`📋 Found ${obras.length} obras`);

    const stages: FunnelStage[] = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas', 'Finalizadas', 'Rechazadas'];

    // For each obra, create activities for all stages
    for (const obra of obras) {
      // Check if activities already exist for this obra
      const { data: existingActividades, error: checkError } = await supabase
        .from('actividades')
        .select('id')
        .eq('obra_id', obra.id)
        .is('deleted_at', null);

      if (checkError) {
        console.error(`⚠️ Error checking existing activities for obra ${obra.id}:`, checkError);
        continue;
      }

      if (existingActividades && existingActividades.length > 0) {
        console.log(`⏭️ Obra ${obra.id} already has ${existingActividades.length} activities, skipping...`);
        continue;
      }

      const activitiesToInsert: any[] = [];

      for (const stage of stages) {
        const textos = actividadTextos[stage];
        const supabaseEtapa = mapEtapaToSupabaseEtapa(stage);

        for (const texto of textos) {
          activitiesToInsert.push({
            id: crypto.randomUUID(),
            obra_id: obra.id,
            descripcion: texto,
            estado: 'pendiente',
            tipo: supabaseEtapa,
            fecha_creacion: new Date().toISOString(),
            usuario_creador: null
          });
        }
      }

      // Insert activities for this obra
      console.log(`📝 Inserting ${activitiesToInsert.length} activities for obra ${obra.id}...`);
      const { error: insertError, data: insertedData } = await supabase
        .from('actividades')
        .insert(activitiesToInsert)
        .select();

      if (insertError) {
        console.error(`❌ Error inserting activities for obra ${obra.id}:`, insertError);
      } else {
        console.log(`✅ Inserted ${insertedData?.length || activitiesToInsert.length} activities for obra ${obra.id}`);
      }
    }

    console.log('✨ Activities seed completed!');
  } catch (err) {
    console.error('❌ Error seeding activities:', err);
  }
};
