import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';

interface AuthContextType {
  usuarioActual: Usuario | null;
  usuarios: Usuario[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperuser: () => boolean;
  crearUsuario: (usuario: Omit<Usuario, 'id'>) => Usuario;
  actualizarUsuario: (id: string, usuario: Partial<Usuario>) => boolean;
  activarDesactivarUsuario: (id: string, activo: boolean) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USUARIOS_INICIALES: Usuario[] = [
  {
    id: 'user-1',
    email: 'superadmin@fujitec.com',
    nombre: 'Admin Fujitec',
    rol: 'superusuario',
    activo: true
  },
  {
    id: 'user-2',
    email: 'vendedor@fujitec.com',
    nombre: 'Vendedor Fujitec',
    rol: 'usuario',
    activo: true
  }
];

const CREDENCIALES_DEMO = {
  'superadmin@fujitec.com': 'admin123',
  'vendedor@fujitec.com': 'vendedor123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIALES);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      try {
        setUsuarioActual(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error('Error restaurando usuario:', e);
      }
    }

    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
      try {
        setUsuarios(JSON.parse(usuariosGuardados));
      } catch (e) {
        console.error('Error restaurando usuarios:', e);
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const credencial = CREDENCIALES_DEMO[email as keyof typeof CREDENCIALES_DEMO];
    if (!credencial || credencial !== password) {
      return false;
    }

    const usuario = USUARIOS_INICIALES.find(u => u.email === email);
    if (!usuario) {
      return false;
    }

    setUsuarioActual(usuario);
    localStorage.setItem('usuarioActual', JSON.stringify(usuario));
    return true;
  };

  const logout = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuarioActual');
  };

  const isSuperuser = (): boolean => {
    return usuarioActual?.rol === 'superusuario' || false;
  };

  const crearUsuario = (usuario: Omit<Usuario, 'id'>): Usuario => {
    const nuevoUsuario: Usuario = {
      ...usuario,
      id: `user-${Date.now()}`
    };
    const usuariosActualizados = [...usuarios, nuevoUsuario];
    setUsuarios(usuariosActualizados);
    localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
    return nuevoUsuario;
  };

  const actualizarUsuario = (id: string, datosActualizados: Partial<Usuario>): boolean => {
    const usuariosActualizados = usuarios.map(u =>
      u.id === id ? { ...u, ...datosActualizados } : u
    );
    setUsuarios(usuariosActualizados);
    localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
    return true;
  };

  const activarDesactivarUsuario = (id: string, activo: boolean): boolean => {
    return actualizarUsuario(id, { activo });
  };

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
