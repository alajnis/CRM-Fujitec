import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ubbojwlsfiutsarwvsyd.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViYm9qd2xzZml1dHNhcnd2c3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2OTk3MzQsImV4cCI6MjEwMjI3NTczNH0.sSBlypkUHD8EYnApqHnRHguPTJRMTkV8taHhTpI9ibE';

const supabase = createClient(supabaseUrl, supabaseKey);

const actividadTextos = {
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

const mapEtapaToSupabaseEtapa = (etapa) => {
  const mapping = {
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

async function seedActividades() {
  try {
    console.log('🌱 Starting activities seed...');

    // Delete existing activities if --clean flag is passed
    if (process.argv.includes('--clean')) {
      console.log('🗑️ Cleaning existing activities...');
      const { error: deleteError } = await supabase
        .from('actividades')
        .delete()
        .is('deleted_at', null);

      if (deleteError) {
        console.error('⚠️ Error deleting existing activities:', deleteError);
      } else {
        console.log('✅ Cleaned existing activities');
      }
    }

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

    const stages = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas', 'Finalizadas', 'Rechazadas'];
    let totalInserted = 0;

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

      const activitiesToInsert = [];

      for (const stage of stages) {
        const textos = actividadTextos[stage];
        const supabaseEtapa = mapEtapaToSupabaseEtapa(stage);

        for (const texto of textos) {
          activitiesToInsert.push({
            id: randomUUID(),
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
        const count = insertedData?.length || activitiesToInsert.length;
        console.log(`✅ Inserted ${count} activities for obra ${obra.id}`);
        totalInserted += count;
      }
    }

    console.log(`✨ Activities seed completed! Total inserted: ${totalInserted}`);
  } catch (err) {
    console.error('❌ Error seeding activities:', err);
    process.exit(1);
  }
}

seedActividades();
