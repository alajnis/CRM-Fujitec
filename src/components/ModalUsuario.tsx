import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Usuario } from '../types';

interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  usuario?: Usuario | null;
  onSaveUsuario: (usuario: Omit<Usuario, 'id'> | Usuario) => void;
}

export const ModalUsuario: React.FC<ModalUsuarioProps> = ({
  isOpen,
  onClose,
  usuario,
  onSaveUsuario
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: 'usuario' as 'usuario' | 'superusuario',
    activo: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        rol: 'usuario',
        activo: true
      });
    }
    setErrors({});
  }, [usuario, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const usuarioParaGuardar = usuario
      ? { ...usuario, ...formData }
      : formData;

    onSaveUsuario(usuarioParaGuardar);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#2D3436]">
              {usuario ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-xs text-[#636E72] mt-1">
              {usuario ? 'Actualiza los datos del usuario' : 'Ingresa los datos del nuevo usuario'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4 mb-6">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-2">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (errors.nombre) setErrors({ ...errors, nombre: '' });
              }}
              className={`w-full px-4 py-2.5 rounded-xl border font-medium text-sm focus:outline-none transition-colors ${
                errors.nombre
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-[#E0E0E0] bg-[#F1F3F5] focus:border-[#C8102E]'
              }`}
              placeholder="Ej: Juan Pérez"
            />
            {errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`w-full px-4 py-2.5 rounded-xl border font-medium text-sm focus:outline-none transition-colors ${
                errors.email
                  ? 'border-red-500 bg-red-50 focus:border-red-600'
                  : 'border-[#E0E0E0] bg-[#F1F3F5] focus:border-[#C8102E]'
              }`}
              placeholder="Ej: juan@fujitec.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-2">Rol</label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'usuario' | 'superusuario' })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E0E0E0] bg-[#F1F3F5] font-medium text-sm focus:outline-none focus:border-[#C8102E]"
            >
              <option value="usuario">Comercial</option>
              <option value="superusuario">Superadmin</option>
            </select>
            <p className="text-xs text-[#636E72] mt-1.5">
              {formData.rol === 'superusuario'
                ? 'Acceso a configuración, eliminación de entidades y gestión de usuarios'
                : 'Acceso a todas las funciones operativas excepto configuración y eliminación'}
            </p>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3 p-4 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0]">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="activo" className="text-xs font-bold text-[#2D3436] cursor-pointer flex-1">
              {formData.activo ? '✓ Usuario activo' : '✗ Usuario desactivado'}
            </label>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
            <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-bold mb-1">Notas importantes:</p>
              <ul className="space-y-1">
                <li>• Los usuarios desactivados no pueden iniciar sesión</li>
                <li>• El historial del usuario se conserva siempre</li>
                <li>• Solo Superadmin puede crear/editar usuarios</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-md hover:bg-[#A60D26] transition-all text-sm"
            style={{ backgroundColor: '#C8102E' }}
          >
            <Save size={16} />
            {usuario ? 'Guardar Cambios' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};
