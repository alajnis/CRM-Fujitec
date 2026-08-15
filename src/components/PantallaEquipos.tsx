import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Cpu, Search, Filter, Link2, Download } from 'lucide-react';
import { Equipo, Obra, Cliente } from '../types';
import { exportEquiposToExcel } from '../utils/excelExport';
import { ModalEquipo } from './ModalEquipo';
import { ModalAsignarEquipoAObra } from './ModalAsignarEquipoAObra';
import { SoftDeleteConfirm } from './SoftDeleteConfirm';
import { useAuth } from '../context/AuthContext';
import { obtenerObraDeEquipo } from '../utils/equipoUtils';

interface PantallaEquiposProps {
  equipos: Equipo[];
  obras?: Obra[];
  clientes?: Cliente[];
  onSaveEquipo: (equipo: Equipo) => void;
  onDeleteEquipo: (equipoId: string) => void;
  onUpdateObraEquipos?: (obraId: string, equipoIds: string[]) => void;
}

const FilterRange: React.FC<{
  label: string;
  min: number;
  max: number;
  setMin: (v: number) => void;
  setMax: (v: number) => void;
}> = ({ label, min, max, setMin, setMax }) => (
  <div>
    <label className="block text-xs font-bold text-[#636E72] mb-2">{label}</label>
    <div className="flex gap-2">
      <input
        type="number"
        min="0"
        value={min}
        onChange={(e) => setMin(Number(e.target.value))}
        placeholder="Min"
        className="w-full p-2 bg-[#F1F3F5] border border-[#E0E0E0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#C8102E]"
      />
      <input
        type="number"
        min="0"
        value={max}
        onChange={(e) => setMax(Number(e.target.value))}
        placeholder="Max"
        className="w-full p-2 bg-[#F1F3F5] border border-[#E0E0E0] rounded-lg text-xs font-medium focus:outline-none focus:border-[#C8102E]"
      />
    </div>
  </div>
);

export const PantallaEquipos: React.FC<PantallaEquiposProps> = ({
  equipos,
  obras = [],
  clientes = [],
  onSaveEquipo,
  onDeleteEquipo,
  onUpdateObraEquipos
}) => {
  const { isSuperuser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('Todos');
  const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [equipoParaAsignar, setEquipoParaAsignar] = useState<Equipo | null>(null);

  // Technical filters
  const [minVelocidad, setMinVelocidad] = useState(0);
  const [maxVelocidad, setMaxVelocidad] = useState(10);
  const [minCapacidad, setMinCapacidad] = useState(0);
  const [maxCapacidad, setMaxCapacidad] = useState(5000);
  const [selectedModelo, setSelectedModelo] = useState('');
  const [minParadas, setMinParadas] = useState(0);
  const [maxParadas, setMaxParadas] = useState(100);
  const [minAccesosFrente, setMinAccesosFrente] = useState(0);
  const [maxAccesosFrente, setMaxAccesosFrente] = useState(20);
  const [minAccesosContrafrente, setMinAccesosContrafrente] = useState(0);
  const [maxAccesosContrafrente, setMaxAccesosContrafrente] = useState(20);
  const [selectedUso, setSelectedUso] = useState('');
  const [minAnchoCabina, setMinAnchoCabina] = useState(0);
  const [maxAnchoCabina, setMaxAnchoCabina] = useState(300);
  const [minProfCabina, setMinProfCabina] = useState(0);
  const [maxProfCabina, setMaxProfCabina] = useState(300);
  const [minAltoCabina, setMinAltoCabina] = useState(0);
  const [maxAltoCabina, setMaxAltoCabina] = useState(300);
  const [minAnchoPasadizo, setMinAnchoPasadizo] = useState(0);
  const [maxAnchoPasadizo, setMaxAnchoPasadizo] = useState(300);
  const [minProfPasadizo, setMinProfPasadizo] = useState(0);
  const [maxProfPasadizo, setMaxProfPasadizo] = useState(300);
  const [minRise, setMinRise] = useState(0);
  const [maxRise, setMaxRise] = useState(30);
  const [minInclinacion, setMinInclinacion] = useState(0);
  const [maxInclinacion, setMaxInclinacion] = useState(90);
  const [minEscalones, setMinEscalones] = useState(0);
  const [maxEscalones, setMaxEscalones] = useState(100);
  const [showFilters, setShowFilters] = useState(false);

  const tiposEquipo = ['Todos', 'Ascensor', 'Escalera', 'Rampa'];
  const modelos = ['', ...new Set(equipos.map(eq => eq.modelo))];
  const usos = ['', 'Pasajeros', 'Montacargas', 'Alta Velocidad'];

  const filteredEquipos = equipos.filter((eq) => {
    const matchTipo = selectedTipo === 'Todos' || eq.tipo === selectedTipo;
    const matchSearch = !searchQuery ||
      eq.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.codigoUnico.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVelocidad = eq.velocidadMS >= minVelocidad && eq.velocidadMS <= maxVelocidad;
    const matchCapacidad = eq.capacidadKg >= minCapacidad && eq.capacidadKg <= maxCapacidad;
    const matchModelo = !selectedModelo || eq.modelo === selectedModelo;
    const matchParadas = (eq.paradas || 0) >= minParadas && (eq.paradas || 0) <= maxParadas;
    const matchAccesosFrente = (eq.accesosFrente || 0) >= minAccesosFrente && (eq.accesosFrente || 0) <= maxAccesosFrente;
    const matchAccesosContrafrente = (eq.accesosContrafrente || 0) >= minAccesosContrafrente && (eq.accesosContrafrente || 0) <= maxAccesosContrafrente;
    const matchUso = !selectedUso || eq.uso === selectedUso;
    const matchAnchoCabina = (eq.anchoCabina || 0) >= minAnchoCabina && (eq.anchoCabina || 0) <= maxAnchoCabina;
    const matchProfCabina = (eq.profundidadCabina || 0) >= minProfCabina && (eq.profundidadCabina || 0) <= maxProfCabina;
    const matchAltoCabina = (eq.altoCabina || 0) >= minAltoCabina && (eq.altoCabina || 0) <= maxAltoCabina;
    const matchAnchoPasadizo = (eq.anchoPasadizo || 0) >= minAnchoPasadizo && (eq.anchoPasadizo || 0) <= maxAnchoPasadizo;
    const matchProfPasadizo = (eq.profundidadPasadizo || 0) >= minProfPasadizo && (eq.profundidadPasadizo || 0) <= maxProfPasadizo;
    const matchRise = (eq.rise || 0) >= minRise && (eq.rise || 0) <= maxRise;
    const matchInclinacion = (eq.inclinacion || 0) >= minInclinacion && (eq.inclinacion || 0) <= maxInclinacion;
    const matchEscalones = (eq.escalonesPlanso || 0) >= minEscalones && (eq.escalonesPlanso || 0) <= maxEscalones;
    return matchTipo && matchSearch && matchVelocidad && matchCapacidad && matchModelo && matchParadas &&
      matchAccesosFrente && matchAccesosContrafrente && matchUso &&
      matchAnchoCabina && matchProfCabina && matchAltoCabina &&
      matchAnchoPasadizo && matchProfPasadizo &&
      matchRise && matchInclinacion && matchEscalones;
  });

  const handleNewEquipo = () => {
    setEditingEquipo(null);
    setIsModalOpen(true);
  };

  const handleEditEquipo = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    setIsModalOpen(true);
  };

  const handleDeleteEquipo = (equipo: Equipo) => {
    if (!isSuperuser()) {
      alert('Solo los Superadmin pueden eliminar equipos');
      return;
    }
    setEquipoToDelete(equipo);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (equipoToDelete) {
      onDeleteEquipo(equipoToDelete.id);
      setEquipoToDelete(null);
      setIsDeleteConfirmOpen(false);
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

          {/* Velocity Filter */}
          <div className="sm:w-48">
            <label className="block text-xs font-bold text-[#636E72] mb-2">Velocidad (m/s)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="10"
                value={minVelocidad}
                onChange={(e) => setMinVelocidad(Number(e.target.value))}
                placeholder="Min"
                className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8102E]"
              />
              <span className="text-[#636E72]">-</span>
              <input
                type="number"
                min="0"
                max="10"
                value={maxVelocidad}
                onChange={(e) => setMaxVelocidad(Number(e.target.value))}
                placeholder="Max"
                className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>

          {/* Capacity Filter */}
          <div className="sm:w-48">
            <label className="block text-xs font-bold text-[#636E72] mb-2">Capacidad (kg)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0"
                max="5000"
                value={minCapacidad}
                onChange={(e) => setMinCapacidad(Number(e.target.value))}
                placeholder="Min"
                className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8102E]"
              />
              <span className="text-[#636E72]">-</span>
              <input
                type="number"
                min="0"
                max="5000"
                value={maxCapacidad}
                onChange={(e) => setMaxCapacidad(Number(e.target.value))}
                placeholder="Max"
                className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#C8102E]"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="border-t border-[#E0E0E0] pt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-bold text-[#C8102E] hover:text-[#A60D26] transition-colors"
          >
            {showFilters ? '▼' : '▶'} Filtros Avanzados
          </button>

          {showFilters && (
            <div className="mt-4 space-y-5">
              {/* Generales */}
              <div>
                <p className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-wider mb-2">Generales</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#636E72] mb-2">Modelo</label>
                    <select
                      value={selectedModelo}
                      onChange={(e) => setSelectedModelo(e.target.value)}
                      className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C8102E]"
                    >
                      {modelos.map((modelo) => (
                        <option key={modelo} value={modelo}>{modelo || 'Todos'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#636E72] mb-2">Uso</label>
                    <select
                      value={selectedUso}
                      onChange={(e) => setSelectedUso(e.target.value)}
                      className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-xs font-medium focus:outline-none focus:border-[#C8102E]"
                    >
                      {usos.map((uso) => (
                        <option key={uso} value={uso}>{uso || 'Todos'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ascensor */}
              <div>
                <p className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-wider mb-2">Ascensores — Dimensiones y Accesos</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FilterRange label="Paradas" min={minParadas} max={maxParadas} setMin={setMinParadas} setMax={setMaxParadas} />
                  <FilterRange label="Accesos Frente" min={minAccesosFrente} max={maxAccesosFrente} setMin={setMinAccesosFrente} setMax={setMaxAccesosFrente} />
                  <FilterRange label="Accesos Contrafrente" min={minAccesosContrafrente} max={maxAccesosContrafrente} setMin={setMinAccesosContrafrente} setMax={setMaxAccesosContrafrente} />
                  <FilterRange label="Ancho Cabina (cm)" min={minAnchoCabina} max={maxAnchoCabina} setMin={setMinAnchoCabina} setMax={setMaxAnchoCabina} />
                  <FilterRange label="Prof. Cabina (cm)" min={minProfCabina} max={maxProfCabina} setMin={setMinProfCabina} setMax={setMaxProfCabina} />
                  <FilterRange label="Alto Cabina (cm)" min={minAltoCabina} max={maxAltoCabina} setMin={setMinAltoCabina} setMax={setMaxAltoCabina} />
                  <FilterRange label="Ancho Pasadizo (cm)" min={minAnchoPasadizo} max={maxAnchoPasadizo} setMin={setMinAnchoPasadizo} setMax={setMaxAnchoPasadizo} />
                  <FilterRange label="Prof. Pasadizo (cm)" min={minProfPasadizo} max={maxProfPasadizo} setMin={setMinProfPasadizo} setMax={setMaxProfPasadizo} />
                </div>
              </div>

              {/* Escalera/Rampa */}
              <div>
                <p className="text-[10px] font-black text-[#B2BEC3] uppercase tracking-wider mb-2">Escaleras / Rampas</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FilterRange label="Altura a Salvar (m)" min={minRise} max={maxRise} setMin={setMinRise} setMax={setMaxRise} />
                  <FilterRange label="Inclinación (°)" min={minInclinacion} max={maxInclinacion} setMin={setMinInclinacion} setMax={setMaxInclinacion} />
                  <FilterRange label="Escalones Planos" min={minEscalones} max={maxEscalones} setMin={setMinEscalones} setMax={setMaxEscalones} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-[#636E72] pt-4 border-t border-[#E0E0E0]">
          <div>
            Mostrando <span className="font-bold text-[#C8102E]">{filteredEquipos.length}</span> de <span className="font-bold">{equipos.length}</span> equipos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTipo('Todos');
                setMinVelocidad(0);
                setMaxVelocidad(10);
                setMinCapacidad(0);
                setMaxCapacidad(5000);
                setSelectedModelo('');
                setMinParadas(0);
                setMaxParadas(100);
                setMinAccesosFrente(0);
                setMaxAccesosFrente(20);
                setMinAccesosContrafrente(0);
                setMaxAccesosContrafrente(20);
                setSelectedUso('');
                setMinAnchoCabina(0);
                setMaxAnchoCabina(300);
                setMinProfCabina(0);
                setMaxProfCabina(300);
                setMinAltoCabina(0);
                setMaxAltoCabina(300);
                setMinAnchoPasadizo(0);
                setMaxAnchoPasadizo(300);
                setMinProfPasadizo(0);
                setMaxProfPasadizo(300);
                setMinRise(0);
                setMaxRise(30);
                setMinInclinacion(0);
                setMaxInclinacion(90);
                setMinEscalones(0);
                setMaxEscalones(100);
                setShowFilters(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all"
              title="Limpiar todos los filtros"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={() => exportEquiposToExcel(filteredEquipos, `Equipos_${new Date().toISOString().split('T')[0]}.xlsx`)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all"
              title="Descargar equipos en Excel"
            >
              <Download size={14} />
              Descargar Excel
            </button>
          </div>
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
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Obra Asignada</th>
                  <th className="px-6 py-4 text-center text-xs font-extrabold text-[#2D3436] uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {filteredEquipos.map((equipo) => {
                  const obraAsignada = obtenerObraDeEquipo(equipo.id, obras);
                  return (
                  <tr key={equipo.id} className="hover:bg-[#F1F3F5] transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-[#C8102E]">{equipo.codigoUnico}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#2D3436]">{equipo.nombre}</td>
                    <td className="px-6 py-4 text-sm text-[#636E72]">{equipo.modelo}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 whitespace-nowrap inline-block">
                        {equipo.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-[#636E72] space-y-0.5 min-w-[220px]">
                      {equipo.tipo === 'Ascensor' ? (
                        <>
                          <div>Vel: <span className="font-bold text-[#2D3436]">{equipo.velocidadMS}</span> m/s · Cap: <span className="font-bold text-[#2D3436]">{equipo.capacidadKg}</span> kg · Paradas: <span className="font-bold text-[#2D3436]">{equipo.paradas}</span></div>
                          {(equipo.anchoCabina || equipo.profundidadCabina || equipo.altoCabina) && (
                            <div>Cabina: <span className="font-bold text-[#2D3436]">{equipo.anchoCabina || '—'}×{equipo.profundidadCabina || '—'}×{equipo.altoCabina || '—'}</span> cm</div>
                          )}
                          {(equipo.accesosFrente || equipo.accesosContrafrente) && (
                            <div>Accesos: Frente <span className="font-bold text-[#2D3436]">{equipo.accesosFrente || 0}</span> · Contrafrente <span className="font-bold text-[#2D3436]">{equipo.accesosContrafrente || 0}</span></div>
                          )}
                          {equipo.uso && <div>Uso: <span className="font-bold text-[#2D3436]">{equipo.uso}</span></div>}
                        </>
                      ) : (
                        <>
                          {equipo.rise !== undefined && <div>Altura a salvar: <span className="font-bold text-[#2D3436]">{equipo.rise}</span> m</div>}
                          {equipo.inclinacion !== undefined && <div>Inclinación: <span className="font-bold text-[#2D3436]">{equipo.inclinacion}</span>°</div>}
                          {equipo.ancho !== undefined && <div>Ancho: <span className="font-bold text-[#2D3436]">{equipo.ancho}</span> cm</div>}
                          {equipo.escalonesPlanso !== undefined && <div>Escalones planos: <span className="font-bold text-[#2D3436]">{equipo.escalonesPlanso}</span></div>}
                          <div>Vel: <span className="font-bold text-[#2D3436]">{equipo.velocidadMS}</span> m/s</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {obraAsignada ? (
                        <div>
                          <div className="font-mono font-bold text-[#C8102E]">{obraAsignada.codigo}</div>
                          <div className="text-[#636E72] truncate max-w-[160px]">{obraAsignada.nombre}</div>
                        </div>
                      ) : (
                        <span className="italic text-[#B2BEC3]">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {onUpdateObraEquipos && (
                          <button
                            onClick={() => setEquipoParaAsignar(equipo)}
                            className="p-2 text-[#636E72] hover:text-blue-600 hover:bg-[#F1F3F5] rounded-lg transition-all"
                            title="Asignar a obra"
                          >
                            <Link2 size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditEquipo(equipo)}
                          className="p-2 text-[#636E72] hover:text-[#C8102E] hover:bg-[#F1F3F5] rounded-lg transition-all"
                          title="Editar equipo"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteEquipo(equipo)}
                          className="p-2 text-[#636E72] hover:text-red-600 hover:bg-[#F1F3F5] rounded-lg transition-all"
                          title="Eliminar equipo"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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

      {/* Modal Asignar a Obra */}
      {equipoParaAsignar && onUpdateObraEquipos && (
        <ModalAsignarEquipoAObra
          isOpen={!!equipoParaAsignar}
          onClose={() => setEquipoParaAsignar(null)}
          equipo={equipoParaAsignar}
          obras={obras}
          clientes={clientes}
          onUpdateObraEquipos={onUpdateObraEquipos}
        />
      )}

      {/* Soft Delete Confirmation Modal */}
      <SoftDeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setEquipoToDelete(null);
          setIsDeleteConfirmOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        entityType="equipo"
        entityName={equipoToDelete?.nombre || ''}
      />
    </div>
  );
};
