import React, { useState } from 'react';
import { X, Plus, MessageSquare, RotateCw } from 'lucide-react';
import { Nota, Obra } from '../types';
import { formatDateES } from '../utils/semaforo';

interface ModalNotasProps {
  isOpen: boolean;
  onClose: () => void;
  obra: Obra;
  onAddNota: (obraId: string, contenido: string, reseteaDias: boolean) => void;
}

export const ModalNotas: React.FC<ModalNotasProps> = ({
  isOpen,
  onClose,
  obra,
  onAddNota
}) => {
  const [contenido, setContenido] = useState('');
  const [reseteaDias, setReseteaDias] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    onAddNota(obra.id, contenido.trim(), reseteaDias);
    setContenido('');
    setReseteaDias(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-[#C8102E]" />
            <div>
              <h2 className="text-xl font-bold text-[#2D3436]">Notas de Obra</h2>
              <p className="text-xs text-[#B2BEC3] mt-0.5">{obra.codigo} - {obra.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nota Textarea */}
          <div>
            <label className="block font-bold text-sm text-[#2D3436] mb-2">
              Nueva Nota
            </label>
            <textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              rows={4}
              className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-[#C8102E]/10"
            />
          </div>

          {/* Reset Switch */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={reseteaDias}
                onChange={(e) => setReseteaDias(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <div>
                <span className="font-bold text-sm text-[#2D3436]">
                  Esta nota reinicia los días sin acción
                </span>
                <p className="text-xs text-[#636E72] mt-1">
                  {reseteaDias
                    ? '✓ Esta nota reiniciará el contador de 7 días'
                    : 'Si activas esta opción, se reiniciará el contador de días sin acción'}
                </p>
              </div>
            </label>
            {reseteaDias && (
              <RotateCw size={16} className="text-blue-600 mt-1 shrink-0" />
            )}
          </div>

          {/* Existing Notes */}
          {obra.notas && obra.notas.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#F1F3F5]">
              <h3 className="font-bold text-sm text-[#2D3436]">Historial de Notas</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {obra.notas.map((nota) => (
                  <div key={nota.id} className="p-3 bg-[#F1F3F5] rounded-lg border border-[#E0E0E0] space-y-1">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-[#2D3436]">{nota.autor}</p>
                      <span className="text-[10px] text-[#B2BEC3]">{formatDateES(nota.fecha)}</span>
                    </div>
                    <p className="text-xs text-[#636E72]">{nota.contenido}</p>
                    {nota.reseteaDias && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2">
                        <RotateCw size={12} />
                        Contador reiniciado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#F1F3F5] mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
          >
            Cerrar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!contenido.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-md hover:bg-[#A60D26] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#C8102E' }}
          >
            <Plus size={16} />
            Guardar Nota
          </button>
        </div>
      </div>
    </div>
  );
};
