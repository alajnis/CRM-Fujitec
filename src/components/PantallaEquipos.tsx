import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Cpu, Search, Filter } from 'lucide-react';
import { Equipo } from '../types';
import { ModalEquipo } from './ModalEquipo';

interface PantallaEquiposProps {
  equipos: Equipo[];
  onSaveEquipo: (equipo: Equipo) => void;
  onDeleteEquipo: (equipoId: string) => void;
}

export const PantallaEquipos: React.FC<PantallaEquiposProps> = ({
  equipos,
  onSaveEquipo,
  onDeleteEquipo
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todos');

  const tiposEquipo = ['Todos', 'Ascensor de Pasajeros', 'Ascensor de Carga / Montacargas', 'Alta Velocidad', 'Escalera Mecánica / Rampa'];

  const filteredEquipos = equipos.filter((eq) => {
    const matchTipo = selectedTipo === 'Todos' || eq.tipo === selectedTipo;
    const matchSearch = !searchQuery ||
      eq.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.codigoUnico.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTipo && matchSearch;
  });

  const handleNewEquipo = () => {
    setEditingEquipo(null);
    setIsModalOpen(true);
  };

  const handleEditEquipo = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    setIsModalOpen(true);
  };

  const handleDeleteEquipo = (equipoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
      onDeleteEquipo(equipoId);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-[#F1F3F5] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu size={32} className="text-[#C8102E]" />
          <div>
            <h1 className="text-3xl font-black text-[#2D3436]">Gestión de Equipos Fujitec</h1>
            <p className="text-sm text-[#636E72] font-medium mt-0.5">Crear, modificar y eliminar equipos del catálogo</p>
          </div>
        </div>
        <button
          onClick={handleNewEquipo}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-extrabold text-sm transition-all hover:bg-[#A60D26] active:scale-95"
          style={{ backgroundColor: '#C8102E' }}
        >
          <Plus size={18} />
          Nuevo Equipo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#636E72] mb-2">Buscar Equipo</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B2BEC3]" />
              <input
                type="text"
                placeholder="Nombre, modelo o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          {/* Filter by type */}
          <div className="sm:w-64">
            <label className="block text-xs font-bold text-[#636E72] mb-2 flex items-center gap-1">
              <Filter size={14} />
              Filtrar por Tipo
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-bold text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
            >
              {tiposEquipo.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-[#636E72]">
          Mostrando <span className="font-bold text-[#C8102E]">{filteredEquipos.length}</span> de <span className="font-bold">{equipos.length}</span> equipos
        </div>
      </div>

      {/* Equipment List */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md overflow-hidden">
        {filteredEquipos.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <Cpu size={48} className="text-[#B2BEC3] mx-auto" />
            <p className="text-lg font-bold text-[#2D3436]">No hay equipos disponibles</p>
            <p className="text-sm text-[#636E72]">
              {searchQuery || selectedTipo !== 'Todos'
                ? 'No coinciden con los filtros aplicados'
                : 'Comienza creando el primer equipo'}
            </p>
            {!searchQuery && selectedTipo === 'Todos' && (
              <button
                onClick={handleNewEquipo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold text-sm transition-all hover:bg-[#A60D26]"
                style={{ backgroundColor: '#C8102E' }}
              >
                <Plus size={16} />
                Crear Equipo
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F1F3F5] border-b border-[#E0E0E0]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Modelo</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Specs</th>
                  <th className="px-6 py-4 text-center text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {filteredEquipos.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-[#F1F3F5] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#C8102E]">{equipo.codigoUnico}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#2D3436]">{equipo.nombre}</td>
                    <td className="px-6 py-4 text-sm text-[#636E72]">{equipo.modelo}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {equipo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#636E72] space-y-1">
                      <div>Vel: <span className="font-bold">{equipo.velocidadMS}</span> m/s</div>
                      <div>Cap: <span className="font-bold">{equipo.capacidadKg}</span> kg</div>
                      <div>Paradas: <span className="font-bold">{equipo.paradas}</span></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditEquipo(equipo)}
                          className="p-2 text-[#636E72] hover:text-[#C8102E] hover:bg-[#F1F3F5] rounded-lg transition-all"
                          title="Editar equipo"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipo(equipo.id)}
                          className="p-2 text-[#636E72] hover:text-red-600 hover:bg-[#F1F3F5] rounded-lg transition-all"
                          title="Eliminar equipo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalEquipo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        equipo={editingEquipo}
        onSaveEquipo={(eq) => {
          onSaveEquipo(eq);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};
