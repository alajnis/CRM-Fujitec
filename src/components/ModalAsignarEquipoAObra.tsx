import React, { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { Obra, Equipo, Cliente } from '../types';
import { formatUSD } from '../utils/semaforo';
import { obtenerObraDeEquipo } from '../utils/equipoUtils';

interface ModalAsignarEquipoAObraProps {
  isOpen: boolean;
  onClose: () => void;
  equipo: Equipo;
  obras: Obra[];
  clientes: Cliente[];
  onUpdateObraEquipos: (obraId: string, equipoIds: string[]) => void;
}

export const ModalAsignarEquipoAObra: React.FC<ModalAsignarEquipoAObraProps> = ({
  isOpen,
  onClose,
  equipo,
  obras,
  clientes,
  onUpdateObraEquipos
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const obraActual = obtenerObraDeEquipo(equipo.id, obras);
  const obrasDisponibles = obras.filter(o =>
    !o.isDeleted &&
    o.id !== obraActual?.id &&
    (o.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.codigo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getNombreCliente = (clienteId: string): string =>
    clientes.find(c => c.id === clienteId)?.razonSocial || clienteId;

  const handleAsignar = (obra: Obra) => {
    if (obraActual) {
      const confirmado = window.confirm(
        `Este equipo ya está asignado a ${obraActual.codigo} - ${obraActual.nombre}.\n\nUn equipo solo puede estar en una obra a la vez. ¿Confirmás moverlo a ${obra.codigo} - ${obra.nombre}?`
      );
      if (!confirmado) return;
      onUpdateObraEquipos(obraActual.id, (obraActual.equipoIds || []).filter(id => id !== equipo.id));
    }
    onUpdateObraEquipos(obra.id, [...(obra.equipoIds || []), equipo.id]);
  };

  const handleQuitar = () => {
    if (!obraActual) return;
    onUpdateObraEquipos(obraActual.id, (obraActual.equipoIds || []).filter(id => id !== equipo.id));
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full my-8 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-[#F1F3F5]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2D3436]">Asignar Equipo a Obra</h3>
              <p className="text-xs text-[#B2BEC3] font-semibold mt-1">
                {equipo.nombre} · {equipo.codigoUnico} · {equipo.modelo}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current assignment (only one) */}
          <div>
            <label className="block text-xs font-extrabold text-[#2D3436] uppercase tracking-wide mb-2">
              Obra Actual
            </label>
            {!obraActual ? (
              <p className="text-xs text-[#B2BEC3] italic">Este equipo no está asignado a ninguna obra.</p>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#C8102E] text-xs">{obraActual.codigo}</span>
                    <span className="font-bold text-[#2D3436] text-xs truncate">{obraActual.nombre}</span>
                  </div>
                  <p className="text-[10px] text-[#636E72] mt-0.5">
                    {getNombreCliente(obraActual.clienteId)} · {obraActual.estado}
                  </p>
                </div>
                <button
                  onClick={handleQuitar}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-red-600 font-bold text-[10px] border border-red-200 transition-colors shrink-0"
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          {/* Search & (re)assign */}
          <div className="pt-3 border-t border-[#F1F3F5] space-y-2">
            <label className="block text-xs font-extrabold text-[#2D3436] uppercase tracking-wide">
              {obraActual ? 'Mover a Otra Obra' : 'Buscar Obra para Asignar'}
            </label>
            <input
              type="text"
              placeholder="Nombre o código de obra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-white border border-[#E0E0E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C8102E]"
            />
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {obrasDisponibles.length === 0 ? (
                <p className="text-xs text-[#B2BEC3] italic text-center py-6">
                  {searchQuery ? 'No se encontraron obras con ese criterio' : 'No hay más obras disponibles'}
                </p>
              ) : (
                obrasDisponibles.map((obra) => (
                  <button
                    key={obra.id}
                    onClick={() => handleAsignar(obra)}
                    className="w-full flex items-center justify-between gap-2 p-2.5 bg-[#F1F3F5] hover:bg-blue-50 rounded-lg border border-[#E0E0E0] transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#C8102E] text-xs">{obra.codigo}</span>
                        <span className="font-bold text-[#2D3436] text-xs truncate">{obra.nombre}</span>
                      </div>
                      <p className="text-[10px] text-[#636E72] mt-0.5">
                        {getNombreCliente(obra.clienteId)} · {obra.estado} · {formatUSD(obra.montoUSD)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#C8102E] shrink-0 flex items-center gap-1">
                      <Link2 size={12} /> {obraActual ? 'Mover acá' : 'Asignar'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-[#F1F3F5] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#C8102E] hover:bg-[#A60D26] transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
