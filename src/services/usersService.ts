import { supabase } from '../utils/supabaseClient';
import { User } from '../types/supabase';

export const usersService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as User[];
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as User;
  },

  /**
   * Busca un usuario por email. Devuelve null si no existe en vez de tirar:
   * `.single()` falla tanto con 0 filas como con más de 1 (email duplicado),
   * y en el login necesitamos distinguir "no está" de "error de conexión".
   * El email se compara sin distinguir mayúsculas ni espacios al borde.
   */
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email.trim());

    if (error) {
      console.error('❌ Error consultando users por email:', error);
      throw error;
    }

    if (!data || data.length === 0) return null;
    return data[0] as User;
  },

  async getUsersByRole(role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as User[];
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  async deactivateUser(id: string) {
    return this.updateUser(id, { status: 'inactive' });
  }
};
