import React, { useState } from 'react';
import { X, Calendar, User, MessageSquare } from 'lucide-react';
import { Obra, Actividad } from '../types';

interface ModalActividadProps {
  isOpen: boolean;
  onClose: () => void;
  obra: Obra;
  onAddActividad: (obraId: string, descripcion: string) => void;
}

export const ModalActividad: React.FC<ModalActividadProps> = ({
  isOpen,
  onClose,
  obra,
  onAddActividad
}) => {
  const [descripcion, setDescripcion] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) return;
    onAddActividad(obra.id, descripcion);
    setDescripcion('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E0E0E0] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#C8102E] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold">Registro de Actividad</h3>
            <p className="text-xs text-white/80 font-medium">{obra.codigo} - {obra.nombre}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form & List */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Notes list */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#2D3436] uppercase tracking-wider">Historial de Actividades (Cronológico)</h4>
            {!obra.actividades || obra.actividades.length === 0 ? (
              <p className="text-xs text-[#B2BEC3] italic">No hay notas registradas para esta obra.</p>
            ) : (
              <div className="space-y-2.5">
                {[...obra.actividades].reverse().map((act) => (
                  <div key={act.id} className="p-3 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0] text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-[#636E72] font-semibold">
                      <span className="flex items-center gap-1"><User size={12} /> {act.autor}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {act.fecha}</span>
                    </div>
                    <p className="text-[#2D3436] leading-relaxed whitespace-pre-wrap">{act.descripcion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Form */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-[#F1F3F5] pt-4">
            <div className="space-y-1.5">
              <label htmlFor="nueva-nota" className="text-xs font-bold text-[#636E72]">
                Nueva Nota de Seguimiento
              </label>
              <textarea
                id="nueva-nota"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Escribe los detalles de la reunión, llamada o avance comercial..."
                rows={3}
                className="w-full p-3 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-xs focus:outline-none focus:border-[#C8102E] text-[#2D3436] placeholder:text-[#B2BEC3] font-medium resize-none"
                required
              />
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F3F5] hover:bg-[#E0E0E0] text-[#2D3436] transition-colors"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors hover:bg-[#A60D26]"
                style={{ backgroundColor: '#C8102E' }}
              >
                Guardar Nota
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
