import { supabase } from '../lib/supabase';
import type { Nota } from '../types';

class NotasService {
  async getNotasByObraId(obraId: string): Promise<Nota[]> {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .eq('obraId', obraId)
        .order('fecha', { ascending: false });

      if (error) throw error;
      return (data || []) as Nota[];
    } catch (error) {
      console.error('Error fetching notas:', error);
      return [];
    }
  }

  async createNota(nota: Omit<Nota, 'id'>): Promise<Nota | null> {
    try {
      const { data, error } = await supabase
        .from('notas')
        .insert([nota])
        .select()
        .single();

      if (error) throw error;
      return data as Nota;
    } catch (error) {
      console.error('Error creating nota:', error);
      return null;
    }
  }

  async updateNota(id: string, updates: Partial<Nota>): Promise<Nota | null> {
    try {
      const { data, error } = await supabase
        .from('notas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Nota;
    } catch (error) {
      console.error('Error updating nota:', error);
      return null;
    }
  }

  async deleteNota(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting nota:', error);
      return false;
    }
  }
}

export const notasService = new NotasService();
