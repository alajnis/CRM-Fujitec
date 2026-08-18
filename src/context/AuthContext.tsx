import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';
import { usersService } from '../services/usersService';
import type { User as SupabaseUser } from '../types/supabase';

interface AuthContextType {
  usuarioActual: Usuario | null;
  usuarios: Usuario[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperuser: () => boolean;
  crearUsuario: (usuario: Omit<Usuario, 'id'>) => Promise<Usuario>;
  actualizarUsuario: (id: string, usuario: Partial<Usuario>) => Promise<boolean>;
  activarDesactivarUsuario: (id: string, activo: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mapeo entre el rol de la app y el rol que guarda Supabase
const rolAppToSupabase = (rol: string) => (rol === 'superusuario' ? 'admin' : 'vendedor');
const rolSupabaseToApp = (role: string) => (role === 'admin' ? 'superusuario' : 'usuario');

const toAppUsuario = (u: SupabaseUser): Usuario => ({
  id: u.id,
  email: u.email,
  nombre: u.full_name,
  rol: rolSupabaseToApp(u.role) as Usuario['rol'],
  activo: u.status === 'active',
  password: u.password || ''
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  const cargarUsuarios = async () => {
    try {
      const data = await usersService.getUsers();
      setUsuarios(data.map(toAppUsuario));
    } catch (e) {
      console.error('Error cargando usuarios desde Supabase:', e);
    }
  };

  useEffect(() => {
    // Restaurar sesión previa
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      try {
        setUsuarioActual(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error('Error restaurando usuario:', e);
      }
    }
    cargarUsuarios();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const user = await usersService.getUserByEmail(email);
      if (!user || user.password !== password || user.status !== 'active') {
        return false;
      }

      const usuario = toAppUsuario(user);
      setUsuarioActual(usuario);
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
      return true;
    } catch (e) {
      console.error('Error en login:', e);
      return false;
    }
  };

  const logout = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuarioActual');
  };

  const isSuperuser = (): boolean => usuarioActual?.rol === 'superusuario' || false;

  const crearUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<Usuario> => {
    const nuevoId = crypto.randomUUID();
    const creado = await usersService.createUser({
      id: nuevoId,
      email: usuario.email,
      full_name: usuario.nombre,
      role: rolAppToSupabase(usuario.rol) as SupabaseUser['role'],
      status: usuario.activo ? 'active' : 'inactive',
      password: usuario.password || 'fujitec2026'
    } as any);

    const nuevoUsuario = toAppUsuario(creado);
    setUsuarios((prev) => [...prev, nuevoUsuario]);
    return nuevoUsuario;
  };

  const actualizarUsuario = async (id: string, datos: Partial<Usuario>): Promise<boolean> => {
    try {
      const updates: Partial<SupabaseUser> = {};
      if (datos.email !== undefined) updates.email = datos.email;
      if (datos.nombre !== undefined) updates.full_name = datos.nombre;
      if (datos.rol !== undefined) updates.role = rolAppToSupabase(datos.rol) as SupabaseUser['role'];
      if (datos.activo !== undefined) updates.status = datos.activo ? 'active' : 'inactive';
      if (datos.password !== undefined) updates.password = datos.password;

      await usersService.updateUser(id, updates);
      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...datos } : u)));

      // Si el usuario editado es el logueado, refrescar la sesión
      if (usuarioActual?.id === id) {
        const actualizado = { ...usuarioActual, ...datos };
        setUsuarioActual(actualizado);
        localStorage.setItem('usuarioActual', JSON.stringify(actualizado));
      }
      return true;
    } catch (e) {
      console.error('Error actualizando usuario:', e);
      return false;
    }
  };

  const activarDesactivarUsuario = async (id: string, activo: boolean): Promise<boolean> =>
    actualizarUsuario(id, { activo });

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        usuarios,
        login,
        logout,
        isAuthenticated: usuarioActual !== null,
        isSuperuser,
        crearUsuario,
        actualizarUsuario,
        activarDesactivarUsuario
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
