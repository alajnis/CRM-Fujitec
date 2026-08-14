import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Obra, Cliente } from '../types';
import { formatUSD } from '../utils/semaforo';

interface ModalAsignarObrasAClienteProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  obras: Obra[];
  clientes: Cliente[];
  onAsignarObras: (clienteId: string, obraIds: string[]) => void;
}

export const ModalAsignarObrasACliente: React.FC<ModalAsignarObrasAClienteProps> = ({
  isOpen,
  onClose,
  cliente,
  obras,
  clientes,
  onAsignarObras
}) => {
  const [selectedObraIds, setSelectedObraIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filtrar obras disponibles (excluye las que ya pertenecen a este cliente)
  const obrasDisponibles = obras.filter(o =>
    !selectedObraIds.includes(o.id) &&
    o.clienteId !== cliente.id &&
    (o.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.codigo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getNombreClienteActual = (obra: Obra): string | null => {
    if (!obra.clienteId || obra.clienteId === cliente.id) return null;
    return clientes.find(c => c.id === obra.clienteId)?.razonSocial || obra.clienteId;
  };

  const obrasConConflicto = selectedObraIds
    .map(id => obras.find(o => o.id === id))
    .filter((o): o is Obra => !!o && !!getNombreClienteActual(o));

  const toggleObraSelection = (obraId: string) => {
    setSelectedObraIds(prev =>
      prev.includes(obraId) ? prev.filter(id => id !== obraId) : [...prev, obraId]
    );
  };

  const handleAsignar = () => {
    if (selectedObraIds.length === 0) {
      alert('Selecciona al menos una obra');
      return;
    }
    if (obrasConConflicto.length > 0) {
      const nombres = obrasConConflicto.map(o => `${o.codigo} (actualmente en ${getNombreClienteActual(o)})`).join('\n');
      const confirmado = window.confirm(
        `Las siguientes obras ya tienen cliente asignado y serán reasignadas a ${cliente.razonSocial}:\n\n${nombres}\n\n¿Confirmás la reasignación?`
      );
      if (!confirmado) return;
    }
    onAsignarObras(cliente.id, selectedObraIds);
    setSelectedObraIds([]);
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full my-8 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-[#F1F3F5]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2D3436]">
                Asignar Obras a Cliente
              </h3>
              <p className="text-xs text-[#B2BEC3] font-semibold mt-1">
                {cliente.razonSocial}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-2">Buscar Obra</label>
            <input
              type="text"
              placeholder="Nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C8102E]"
            />
          </div>

          {/* Selected works count */}
          {selectedObraIds.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs font-bold text-emerald-900">
                ✓ {selectedObraIds.length} obra(s) seleccionada(s)
              </p>
            </div>
          )}

          {/* Warning: reassignment conflicts */}
          {obrasConConflicto.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 space-y-1">
              <p className="text-xs font-bold text-amber-900">
                ⚠️ {obrasConConflicto.length} de las obras seleccionadas ya tienen cliente asignado
              </p>
              <p className="text-[11px] text-amber-800">
                Al confirmar, se reasignarán de su cliente actual a {cliente.razonSocial}.
              </p>
            </div>
          )}

          {/* Available obras list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {obrasDisponibles.length === 0 ? (
              <p className="text-xs text-[#B2BEC3] italic text-center py-8">
                {searchQuery
                  ? 'No se encontraron obras con ese criterio'
                  : 'No hay obras disponibles'}
              </p>
            ) : (
              obrasDisponibles.map((obra) => {
                const clienteActual = getNombreClienteActual(obra);
                return (
                  <label
                    key={obra.id}
                    className="flex items-start gap-3 p-3 bg-[#F1F3F5] rounded-lg cursor-pointer hover:bg-[#E0E0E0] transition-colors border border-[#E0E0E0]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedObraIds.includes(obra.id)}
                      onChange={() => toggleObraSelection(obra.id)}
                      className="w-4 h-4 rounded mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#C8102E] text-xs">
                          {obra.codigo}
                        </span>
                        <span className="font-bold text-[#2D3436] text-xs">
                          {obra.nombre}
                        </span>
                        {clienteActual ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            ⚠️ Ya asignada a: {clienteActual}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Sin cliente
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#636E72] mt-1">
                        {obra.estado} • {formatUSD(obra.montoUSD)}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-[#F1F3F5] bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F3F5] hover:bg-[#E0E0E0] text-[#2D3436] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignar}
            disabled={selectedObraIds.length === 0}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#C8102E] hover:bg-[#A60D26] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            Asignar ({selectedObraIds.length})
          </button>
        </div>
      </div>
    </div>
  );
};
