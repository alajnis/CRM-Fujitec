import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!login(email, password)) {
        setError('Email o contraseña inválidos');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C8102E] to-red-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Logo y Título */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#C8102E] rounded-lg flex items-center justify-center">
                <span className="font-black text-white text-3xl">F</span>
              </div>
            </div>
            <h1 className="text-2xl font-black text-[#2D3436] tracking-tight">
              Fujitec CRM
            </h1>
            <p className="text-xs font-semibold tracking-widest text-[#636E72] uppercase">
              Argentina / Uruguay
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                className="w-full p-3 border border-[#E0E0E0] rounded-xl text-[#2D3436] placeholder:text-[#B2BEC3] focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                id="input-login-email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D3436] mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-[#E0E0E0] rounded-xl text-[#2D3436] placeholder:text-[#B2BEC3] focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                id="input-login-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-white transition-all active:scale-95 disabled:opacity-70"
              style={{ backgroundColor: '#C8102E' }}
              id="btn-login-submit"
            >
              <LogIn size={16} />
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="bg-[#F1F3F5] rounded-lg p-4 space-y-2 text-xs">
            <p className="font-bold text-[#2D3436]">Credenciales de Demo:</p>
            <div className="space-y-1 text-[#636E72]">
              <p>
                <span className="font-semibold">Superusuario:</span> superadmin@fujitec.com / admin123
              </p>
              <p>
                <span className="font-semibold">Usuario:</span> vendedor@fujitec.com / vendedor123
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-[#B2BEC3] pt-4 border-t border-[#E0E0E0]">
            <p>Powered by <a href="https://impruvia.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#C8102E] hover:underline transition-colors">Impruvia</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};
