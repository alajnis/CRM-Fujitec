import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ActividadPorEtapa } from '../types';

interface ModalAdvertenciaProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actividadesIncompletas: ActividadPorEtapa[];
  etapaActual: string;
}

export const ModalAdvertencia: React.FC<ModalAdvertenciaProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actividadesIncompletas,
  etapaActual
}) => {
  if (!isOpen) return null;

  const total = actividadesIncompletas.length;
  const completadas = actividadesIncompletas.filter(a => a.completada).length;
  const incompletas = total - completadas;

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-amber-300 shadow-2xl max-w-md w-full p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-full">
            <AlertTriangle size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#2D3436]">Actividades Incompletas</h3>
            <p className="text-xs text-[#636E72] font-medium mt-0.5">
              Hay tareas sin completar en {etapaActual}
            </p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
          <div className="text-sm font-bold text-[#2D3436] mb-2">Resumen:</div>
          <div className="space-y-1 text-sm text-[#636E72] font-medium">
            <div>✓ Completadas: <span className="font-black text-green-600">{completadas}</span></div>
            <div>✗ Incompletas: <span className="font-black text-red-600">{incompletas}</span></div>
            <div className="border-t border-amber-200 pt-2 mt-2 font-bold text-[#2D3436]">
              Total: {total}
            </div>
          </div>
        </div>

        <div className="bg-[#F1F3F5] rounded-2xl p-4 border border-[#E0E0E0]">
          <p className="text-xs text-[#636E72] font-medium">
            Puedes cambiar de etapa aunque haya actividades sin completar. El cambio <span className="font-bold">no borrará</span> el historial de actividades.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-[#F1F3F5]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 rounded-lg font-extrabold text-white shadow-md hover:bg-[#A60D26] transition-all text-sm"
            style={{ backgroundColor: '#C8102E' }}
          >
            Cambiar de Etapa
          </button>
        </div>
      </div>
    </div>
  );
};
