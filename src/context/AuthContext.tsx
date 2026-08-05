import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario } from '../types';

interface AuthContextType {
  usuarioActual: Usuario | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperuser: () => boolean;
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

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      try {
        setUsuarioActual(JSON.parse(usuarioGuardado));
      } catch (e) {
        console.error('Error restaurando usuario:', e);
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

  return (
    <AuthContext.Provider
      value={{
        usuarioActual,
        login,
        logout,
        isAuthenticated: usuarioActual !== null,
        isSuperuser
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
