import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileSpreadsheet,
  Check,
  ChevronRight,
  ChevronDown,
  UserPlus,
  MessageSquare,
  Trash2,
  X
} from 'lucide-react';
import { Cliente, Obra, Equipo, Region } from '../types';
import { formatUSD } from '../utils/semaforo';
import { contarEquiposPorTipo, obtenerObraDeEquipo } from '../utils/equipoUtils';
import { SoftDeleteConfirm } from './SoftDeleteConfirm';
import { ModalAsignarObrasACliente } from './ModalAsignarObrasACliente';
import { useAuth } from '../context/AuthContext';

interface PantallaFichaRelacionalProps {
  clientes: Cliente[];
  obras: Obra[];
  equipos?: Equipo[];
  selectedRegion: Region;
  searchQuery?: string;
  onSelectObraForOffer: (obra: Obra) => void;
  onSaveCliente: (cliente: Cliente) => void;
  onOpenEditClienteContacts?: (cliente: Cliente) => void;
  onOpenEditCliente?: (cliente: Cliente) => void;
  onOpenViewActividades?: (obra: Obra) => void;
  onUpdateObraEquipos?: (obraId: string, equipoIds: string[]) => void;
}

export const PantallaFichaRelacional: React.FC<PantallaFichaRelacionalProps> = ({
  clientes,
  obras,
  equipos = [],
  selectedRegion,
  searchQuery: globalSearchQuery = '',
  onSelectObraForOffer,
  onSaveCliente,
  onOpenEditClienteContacts,
  onOpenEditCliente,
  onOpenViewActividades,
  onUpdateObraEquipos
}) => {
  const { isSuperuser } = useAuth();

  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || '');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const searchQuery = globalSearchQuery || localSearchQuery;

  // Modal State for New Client
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);

  // Soft delete state
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Modal para asignar obras
  const [isAsignarObrasModalOpen, setIsAsignarObrasModalOpen] = useState(false);

  // Acordeón de equipos por obra (relacional Cliente → Obra → Equipos)
  const [expandedObraId, setExpandedObraId] = useState<string | null>(null);
  const [equipoSearchQuery, setEquipoSearchQuery] = useState('');

  const tipoIcono: Record<string, string> = {
    'Ascensor': '🛗',
    'Escalera': '🪜',
    'Rampa': '♿'
  };

  const toggleExpandObra = (obraId: string) => {
    setExpandedObraId(prev => (prev === obraId ? null : obraId));
    setEquipoSearchQuery('');
  };

  const handleAddEquipoAObra = (obra: Obra, equipoId: string) => {
    if (!onUpdateObraEquipos) return;
    const actuales = obra.equipoIds || [];
    if (actuales.includes(equipoId)) return;

    const equipo = equipos.find(e => e.id === equipoId);
    const obraActual = obtenerObraDeEquipo(equipoId, obras, obra.id);
    if (obraActual && equipo) {
      const confirmado = window.confirm(
        `Este equipo ya está asignado a ${obraActual.codigo} - ${obraActual.nombre}.\n\nUn equipo solo puede estar en una obra a la vez. ¿Confirmás moverlo a esta obra?`
      );
      if (!confirmado) return;
      onUpdateObraEquipos(obraActual.id, (obraActual.equipoIds || []).filter(id => id !== equipoId));
    }
    onUpdateObraEquipos(obra.id, [...actuales, equipoId]);
    setEquipoSearchQuery('');
  };

  const handleRemoveEquipoDeObra = (obra: Obra, equipoId: string) => {
    if (!onUpdateObraEquipos) return;
    onUpdateObraEquipos(obra.id, (obra.equipoIds || []).filter(id => id !== equipoId));
  };

  const [newClienteForm, setNewClienteForm] = useState<Partial<Cliente>>({
    razonSocial: '',
    contactoPrincipal: '',
    cargo: 'Gerente de Obras',
    email: '',
    telefono: '',
    direccion: '',
    region: 'Argentina',
    cuitRut: ''
  });

  // Filter clients
  const filteredClientes = clientes.filter((c) => {
    const matchRegion = selectedRegion === 'Todas' || c.region === selectedRegion;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || 
      c.razonSocial.toLowerCase().includes(q) || 
      c.contactoPrincipal.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    return matchRegion && matchQ;
  });

  const activeCliente = clientes.find((c) => c.id === selectedClienteId) || clientes[0];
  const activeClienteObras = activeCliente ? obras.filter((o) => o.clienteId === activeCliente.id) : [];

  const isValidEmail = (email: string): boolean => {
    if (!email || email.trim() === '') return false;
    if (email.includes('@empresa.com') || email.includes('ejemplo') || email.includes('test@')) return false;
    return email.includes('@');
  };

  const isValidPhone = (telefono: string): boolean => {
    if (!telefono || telefono.trim() === '') return false;
    if (telefono.includes('0000') || telefono.includes('1111') || telefono.includes('ejemplo')) return false;
    return telefono.trim().length >= 8;
  };

  const hasValidContact = (email: string, telefono: string): boolean => {
    return isValidEmail(email) || isValidPhone(telefono);
  };

  const handleCreateCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClienteForm.razonSocial || !newClienteForm.contactoPrincipal) return;
    if (!hasValidContact(newClienteForm.email || '', newClienteForm.telefono || '')) return;

    const clienteCreado: Cliente = {
      id: `cli-${Date.now()}`,
      razonSocial: newClienteForm.razonSocial || '',
      contactoPrincipal: newClienteForm.contactoPrincipal || '',
      cargo: newClienteForm.cargo || 'Director de Proyecto',
      email: newClienteForm.email || '',
      telefono: newClienteForm.telefono || '',
      direccion: newClienteForm.direccion || 'Buenos Aires',
      region: (newClienteForm.region as 'Argentina' | 'Uruguay') || 'Argentina',
      cuitRut: newClienteForm.cuitRut || ''
    };

    onSaveCliente(clienteCreado);
    setSelectedClienteId(clienteCreado.id);
    setIsNewClientModalOpen(false);
    setNewClienteForm({
      razonSocial: '',
      contactoPrincipal: '',
      cargo: 'Gerente de Obras',
      email: '',
      telefono: '',
      direccion: '',
      region: 'Argentina',
      cuitRut: ''
    });
  };

  return (
    <div className="p-8 space-y-8 bg-[#F1F3F5] min-h-screen">
      {/* Header: Directorio de Clientes */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 px-4 py-2">
          <Users size={16} className="text-[#C8102E]" />
          <span className="text-xs font-bold text-[#2D3436]">Directorio de Clientes</span>
        </div>

        {true && (
          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition-all hover:brightness-110"
            style={{ backgroundColor: '#C8102E' }}
            id="btn-nuevo-cliente"
          >
            <Plus size={16} />
            <span>+ Nuevo Cliente</span>
          </button>
        )}
      </div>

      {/* BLOQUE 1: FICHA CLIENTES RELACIONAL */}
      {true && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Client List Selector */}
          <div className="md:col-span-4 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0] shadow-sm p-5 space-y-4">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B2BEC3]" />
              <input
                type="text"
                placeholder="Filtrar por razón social, contacto..."
                value={searchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#E0E0E0] text-xs rounded-xl focus:outline-none font-medium shadow-2xs"
                id="input-filter-clientes"
              />
            </div>

            <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredClientes.map((cli) => {
                const isSelected = cli.id === selectedClienteId;
                const cliObras = obras.filter((o) => o.clienteId === cli.id);

                return (
                  <div
                    key={cli.id}
                    onClick={() => setSelectedClienteId(cli.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/90 border-red-300 ring-2 ring-red-200/50 shadow-2xs'
                        : 'bg-white border-[#E0E0E0] hover:bg-[#F1F3F5]/80'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-[#2D3436]">{cli.razonSocial}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F3F5] border border-[#E0E0E0] text-[#2D3436]">
                        {cli.region === 'Argentina' ? 'AR' : 'UY'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#636E72] font-semibold mt-1">
                      {cli.contactoPrincipal}
                    </p>
                    <div className="text-[10px] text-[#B2BEC3] mt-2 flex justify-between border-t border-[#F1F3F5] pt-1.5 font-medium">
                      <span>{cli.cuitRut}</span>
                      <span className="font-extrabold text-[#2D3436]">{cliObras.length} Obra(s)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Relational Customer & Linked Projects Card */}
          <div className="md:col-span-8 space-y-6">
            {activeCliente ? (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0] shadow-sm p-6 space-y-6">
                {/* Header Profile */}
                <div className="border-b border-[#F1F3F5] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-[#C8102E] uppercase tracking-wider">
                      Ficha Corporativa de Cliente
                    </span>
                    <h2 className="text-2xl font-black text-[#2D3436] tracking-tight mt-1">
                      {activeCliente.razonSocial}
                    </h2>
                    <p className="text-xs text-[#636E72] font-medium mt-0.5">
                      CUIT/RUT: {activeCliente.cuitRut} | Región: {activeCliente.region}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      onClick={() => setIsAsignarObrasModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs transition-all hover:bg-[#A60D26] flex items-center gap-1.5"
                      style={{ backgroundColor: '#C8102E' }}
                      id="btn-asignar-obras"
                    >
                      <Plus size={14} />
                      Asignar Obras
                    </button>
                    {onOpenEditCliente && (
                      <button
                        onClick={() => onOpenEditCliente(activeCliente)}
                        className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs transition-all hover:bg-[#A60D26] flex items-center gap-1.5"
                        style={{ backgroundColor: '#C8102E' }}
                        id="btn-editar-cliente"
                      >
                        ✏️ Editar Cliente
                      </button>
                    )}
                    {onOpenEditClienteContacts && (
                      <button
                        onClick={() => onOpenEditClienteContacts(activeCliente)}
                        className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs transition-all hover:bg-[#A60D26] flex items-center gap-1.5"
                        style={{ backgroundColor: '#C8102E' }}
                        id="btn-editar-contactos"
                      >
                        <UserPlus size={14} />
                        Editar Contactos
                      </button>
                    )}
                    {isSuperuser() && (
                      <button
                        onClick={() => {
                          setClienteToDelete(activeCliente);
                          setIsDeleteConfirmOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
                        id="btn-eliminar-cliente"
                      >
                        <Trash2 size={14} />
                        Eliminar Cliente
                      </button>
                    )}
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#2D3436] text-white shadow-2xs">
                      {activeClienteObras.length} Obras Asignadas
                    </span>
                  </div>
                </div>

                {/* Key Customer Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/90 rounded-xl border border-[#E0E0E0] space-y-1 shadow-2xs">
                    <span className="text-[11px] font-extrabold uppercase text-[#B2BEC3]">Contacto Principal</span>
                    <p className="text-sm font-extrabold text-[#2D3436]">{activeCliente.contactoPrincipal}</p>
                    <p className="text-xs text-[#636E72] font-medium">{activeCliente.cargo}</p>
                  </div>

                  <div className="p-4 bg-white/90 rounded-xl border border-[#E0E0E0] space-y-1 shadow-2xs">
                    <span className="text-[11px] font-extrabold uppercase text-[#B2BEC3]">Canales Directos</span>
                    <div className="flex items-center gap-1.5 text-xs text-[#2D3436] font-semibold">
                      <Mail size={14} className="text-[#B2BEC3]" />
                      <a href={`mailto:${activeCliente.email}`} className="hover:underline text-[#C8102E]">{activeCliente.email}</a>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#2D3436] font-semibold">
                      <Phone size={14} className="text-[#B2BEC3]" />
                      <span>{activeCliente.telefono}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/90 rounded-xl border border-[#E0E0E0] space-y-1 sm:col-span-2 shadow-2xs">
                    <span className="text-[11px] font-extrabold uppercase text-[#B2BEC3]">Dirección Sede / Obras</span>
                    <div className="flex items-center gap-1.5 text-xs text-[#2D3436] font-bold">
                      <MapPin size={14} className="text-[#B2BEC3]" />
                      <span>{activeCliente.direccion}</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Contacts Section */}
                {activeCliente.contactos && activeCliente.contactos.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-[#F1F3F5]">
                    <h3 className="text-sm font-extrabold text-[#2D3436] flex items-center gap-2">
                      <Users size={16} className="text-[#C8102E]" />
                      Contactos Secundarios
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeCliente.contactos.map((contacto, idx) => (
                        <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-2 shadow-2xs">
                          <div>
                            <p className="text-xs font-bold text-blue-900 uppercase tracking-wide">Contacto {idx + 2}</p>
                            <p className="text-sm font-extrabold text-[#2D3436]">{contacto.nombre}</p>
                            <p className="text-xs text-[#636E72] font-medium">{contacto.cargo}</p>
                          </div>
                          <div className="space-y-1 text-xs text-[#2D3436]">
                            {contacto.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail size={12} className="text-blue-600" />
                                <a href={`mailto:${contacto.email}`} className="hover:underline text-[#C8102E]">{contacto.email}</a>
                              </div>
                            )}
                            {contacto.telefono && (
                              <div className="flex items-center gap-1.5">
                                <Phone size={12} className="text-blue-600" />
                                <span>{contacto.telefono}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Obras Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-extrabold text-[#2D3436] flex items-center justify-between border-b border-[#F1F3F5] pb-2">
                    <span>Obras Relacionadas con este Cliente</span>
                    <span className="text-xs text-[#636E72] font-semibold">
                      Monto Total: {formatUSD(activeClienteObras.reduce((s, o) => s + o.montoUSD, 0))}
                    </span>
                  </h3>

                  {activeClienteObras.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#B2BEC3] italic bg-white/50 rounded-xl border border-[#E0E0E0]">
                      No hay obras registradas para este cliente aún.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeClienteObras.map((obra) => {
                        const equipoIdsObra = obra.equipoIds || [];
                        const counts = contarEquiposPorTipo(obra, equipos);
                        const totalEquipos = counts.ascensores + counts.escaleras + counts.rampas;
                        const isExpanded = expandedObraId === obra.id;
                        const equiposDisponibles = equipos.filter((eq) =>
                          !equipoIdsObra.includes(eq.id) &&
                          !eq.isDeleted &&
                          (eq.nombre.toLowerCase().includes(equipoSearchQuery.toLowerCase()) ||
                            eq.modelo.toLowerCase().includes(equipoSearchQuery.toLowerCase()) ||
                            eq.codigoUnico.toLowerCase().includes(equipoSearchQuery.toLowerCase()))
                        );

                        return (
                          <div key={obra.id} className="rounded-xl border border-[#E0E0E0] bg-white shadow-2xs overflow-hidden">
                            <div className="p-4 hover:bg-[#F1F3F5]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-black text-[#C8102E] text-xs">{obra.codigo}</span>
                                  <span className="font-extrabold text-[#2D3436] text-sm">{obra.nombre}</span>
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F3F5] text-[#2D3436] border border-[#E0E0E0]">
                                    {obra.estado}
                                  </span>
                                </div>
                                {/* Equipment summary + expand toggle */}
                                <button
                                  onClick={() => toggleExpandObra(obra.id)}
                                  className="flex items-center gap-2 text-xs font-semibold text-[#636E72] hover:text-[#C8102E] transition-colors"
                                  id={`btn-toggle-equipos-${obra.id}`}
                                >
                                  {totalEquipos === 0 ? (
                                    <span className="italic text-[#B2BEC3]">Sin equipos asignados</span>
                                  ) : (
                                    <span className="flex items-center gap-2">
                                      {counts.ascensores > 0 && <span>🛗 {counts.ascensores}</span>}
                                      {counts.escaleras > 0 && <span>🪜 {counts.escaleras}</span>}
                                      {counts.rampas > 0 && <span>♿ {counts.rampas}</span>}
                                    </span>
                                  )}
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  <span>{isExpanded ? 'Ocultar equipos' : 'Ver / gestionar equipos'}</span>
                                </button>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap justify-end">
                                <span className="font-black text-[#2D3436] text-sm whitespace-nowrap">
                                  {formatUSD(obra.montoUSD)}
                                </span>
                                {onOpenViewActividades && (
                                  <button
                                    onClick={() => onOpenViewActividades(obra)}
                                    className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs transition-all hover:bg-blue-600 flex items-center gap-1.5"
                                    style={{ backgroundColor: '#2D3436' }}
                                    id={`btn-ver-actividades-${obra.id}`}
                                    title="Ver notas y actividades"
                                  >
                                    <MessageSquare size={14} />
                                    Notas
                                  </button>
                                )}
                                <button
                                  onClick={() => onSelectObraForOffer(obra)}
                                  className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs shadow-2xs flex items-center gap-1 transition-all hover:bg-[#A60D26]"
                                  style={{ backgroundColor: '#C8102E' }}
                                  id={`btn-generar-oferta-relacional-${obra.id}`}
                                >
                                  <span>Oferta</span>
                                  <ChevronRight size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Expanded: Equipos de la obra */}
                            {isExpanded && (
                              <div className="border-t border-[#F1F3F5] bg-[#F8F9FA] p-4 space-y-3">
                                {equipoIdsObra.length === 0 ? (
                                  <p className="text-[11px] text-[#B2BEC3] italic">Todavía no hay equipos vinculados a esta obra.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {equipoIdsObra.map((equipoId) => {
                                      const eq = equipos.find((e) => e.id === equipoId);
                                      if (!eq) return null;
                                      return (
                                        <div key={equipoId} className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-[#E0E0E0]">
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-base shrink-0">{tipoIcono[eq.tipo] || '⚙️'}</span>
                                            <div className="min-w-0">
                                              <p className="font-bold text-[#2D3436] text-xs truncate">{eq.nombre}</p>
                                              <p className="text-[10px] text-[#636E72] truncate">{eq.codigoUnico} · {eq.modelo}</p>
                                            </div>
                                          </div>
                                          {onUpdateObraEquipos && (
                                            <button
                                              onClick={() => handleRemoveEquipoDeObra(obra, equipoId)}
                                              className="p-1.5 text-[#636E72] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                              title="Quitar equipo de la obra"
                                            >
                                              <X size={14} />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {onUpdateObraEquipos && (
                                  <div className="pt-2 border-t border-[#E0E0E0] space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Buscar equipo por nombre, modelo o código..."
                                      value={equipoSearchQuery}
                                      onChange={(e) => setEquipoSearchQuery(e.target.value)}
                                      className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-medium text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
                                    />
                                    {equipoSearchQuery && (
                                      <div className="max-h-40 overflow-y-auto space-y-1">
                                        {equiposDisponibles.length === 0 ? (
                                          <p className="text-[11px] text-[#B2BEC3] italic p-1">Sin resultados</p>
                                        ) : (
                                          equiposDisponibles.slice(0, 8).map((eq) => {
                                            const obraDeEquipo = obtenerObraDeEquipo(eq.id, obras, obra.id);
                                            return (
                                            <button
                                              key={eq.id}
                                              onClick={() => handleAddEquipoAObra(obra, eq.id)}
                                              className="w-full flex items-center justify-between gap-2 p-2 bg-white hover:bg-blue-50 rounded-lg border border-[#E0E0E0] transition-colors text-left"
                                            >
                                              <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-base shrink-0">{tipoIcono[eq.tipo] || '⚙️'}</span>
                                                <div className="min-w-0">
                                                  <p className="font-bold text-[#2D3436] text-xs truncate">{eq.nombre}</p>
                                                  <p className="text-[10px] text-[#636E72] truncate">
                                                    {eq.codigoUnico} · {eq.modelo}
                                                    {obraDeEquipo && (
                                                      <span className="ml-1.5 text-amber-700 font-bold">⚠️ En {obraDeEquipo.codigo}</span>
                                                    )}
                                                  </p>
                                                </div>
                                              </div>
                                              <span className="text-[10px] font-bold text-[#C8102E] shrink-0">
                                                {obraDeEquipo ? 'Mover acá' : '+ Agregar'}
                                              </span>
                                            </button>
                                            );
                                          })
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-[#B2BEC3] bg-white/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0]">
                Seleccione un cliente para ver sus datos relacionales
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW CLIENT MODAL */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 bg-[#2D3436]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E0E0E0] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3">
              <h3 className="text-lg font-extrabold text-[#2D3436]">Registrar Nuevo Cliente Corporativo</h3>
              <button 
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-[#B2BEC3] hover:text-[#2D3436] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCliente} className="space-y-3.5 text-xs">
              {!hasValidContact(newClienteForm.email || '', newClienteForm.telefono || '') && (newClienteForm.email !== '' || newClienteForm.telefono !== '') && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                  <span>⚠️ Ingresa un Email o Teléfono válido</span>
                </div>
              )}
              <div>
                <label className="block font-bold text-[#2D3436] mb-1">Razón Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Constructora San Martín S.A."
                  value={newClienteForm.razonSocial}
                  onChange={(e) => setNewClienteForm({...newClienteForm, razonSocial: e.target.value})}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                  id="input-new-cli-razon"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">Contacto Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Arq. Marcelo Costa"
                    value={newClienteForm.contactoPrincipal}
                    onChange={(e) => setNewClienteForm({...newClienteForm, contactoPrincipal: e.target.value})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                    id="input-new-cli-contacto"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Director de Compras"
                    value={newClienteForm.cargo}
                    onChange={(e) => setNewClienteForm({...newClienteForm, cargo: e.target.value})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@empresa.com"
                    value={newClienteForm.email}
                    onChange={(e) => setNewClienteForm({...newClienteForm, email: e.target.value})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">Teléfono *</label>
                  <input
                    type="text"
                    required
                    placeholder="+54 11 4000-0000"
                    value={newClienteForm.telefono}
                    onChange={(e) => setNewClienteForm({...newClienteForm, telefono: e.target.value})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">Región</label>
                  <select
                    value={newClienteForm.region}
                    onChange={(e) => setNewClienteForm({...newClienteForm, region: e.target.value as any})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-bold text-[#2D3436]"
                  >
                    <option value="Argentina">Argentina</option>
                    <option value="Uruguay">Uruguay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">CUIT / RUT</label>
                  <input
                    type="text"
                    placeholder="30-70000000-1"
                    value={newClienteForm.cuitRut}
                    onChange={(e) => setNewClienteForm({...newClienteForm, cuitRut: e.target.value})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D3436] mb-1">Dirección Corporativa</label>
                <input
                  type="text"
                  placeholder="Av. Corrientes 1200, CABA"
                  value={newClienteForm.direccion}
                  onChange={(e) => setNewClienteForm({...newClienteForm, direccion: e.target.value})}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F1F3F5]">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F1F3F5] font-bold text-[#2D3436] hover:bg-[#E0E0E0] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newClienteForm.razonSocial || !newClienteForm.contactoPrincipal || !hasValidContact(newClienteForm.email || '', newClienteForm.telefono || '')}
                  className="px-4 py-2 rounded-xl font-bold text-white shadow-xs hover:bg-[#A60D26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#C8102E' }}
                  id="btn-save-new-cliente"
                >
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Asignar Obras */}
      {activeCliente && (
        <ModalAsignarObrasACliente
          isOpen={isAsignarObrasModalOpen}
          onClose={() => setIsAsignarObrasModalOpen(false)}
          cliente={activeCliente}
          obras={obras}
          clientes={clientes}
          onAsignarObras={(clienteId, obraIds) => {
            obraIds.forEach(obraId => {
              const obra = obras.find(o => o.id === obraId);
              if (obra) {
                onSaveCliente({...obra, clienteId} as any);
              }
            });
            setIsAsignarObrasModalOpen(false);
          }}
        />
      )}

      {/* Soft Delete Confirmation Modal */}
      <SoftDeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setClienteToDelete(null);
          setIsDeleteConfirmOpen(false);
        }}
        onConfirm={() => {
          if (clienteToDelete) {
            console.log('Soft delete cliente:', clienteToDelete.id);
          }
          setClienteToDelete(null);
          setIsDeleteConfirmOpen(false);
        }}
        entityType="cliente"
        entityName={clienteToDelete?.razonSocial || ''}
      />
    </div>
  );
};
