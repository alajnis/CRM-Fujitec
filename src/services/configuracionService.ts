import { supabase } from '../utils/supabaseClient';
import { ConfiguracionDiasEtapa } from '../types';

const TABLE_NAME = 'configuracion_dias_etapa';

export const configuracionService = {
  async getDiasConfig(): Promise<ConfiguracionDiasEtapa[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('etapa', { ascending: true });

      if (error) {
        console.error('Error fetching dias config:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getDiasConfig:', err);
      return [];
    }
  },

  async saveDiasConfig(config: ConfiguracionDiasEtapa[]): Promise<boolean> {
    try {
      // Delete existing records
      await supabase.from(TABLE_NAME).delete().neq('etapa', '');

      // Insert new records
      const { error } = await supabase
        .from(TABLE_NAME)
        .insert(config);

      if (error) {
        console.error('Error saving dias config:', error);
        return false;
      }

      console.log('✅ Dias configuration saved to Supabase');
      return true;
    } catch (err) {
      console.error('Error in saveDiasConfig:', err);
      return false;
    }
  }
};
