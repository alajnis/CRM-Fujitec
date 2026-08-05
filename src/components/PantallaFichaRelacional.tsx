import React, { useState } from 'react';
import {
  Users,
  Cpu,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileSpreadsheet,
  Check,
  ChevronRight,
  Gauge,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { Cliente, Obra, HardwareSpecs, Region } from '../types';
import { formatUSD } from '../utils/semaforo';

interface PantallaFichaRelacionalProps {
  clientes: Cliente[];
  obras: Obra[];
  selectedRegion: Region;
  searchQuery?: string;
  onSelectObraForOffer: (obra: Obra) => void;
  onSaveCliente: (cliente: Cliente) => void;
  onOpenEditClienteContacts?: (cliente: Cliente) => void;
  onOpenViewActividades?: (obra: Obra) => void;
}

export const PantallaFichaRelacional: React.FC<PantallaFichaRelacionalProps> = ({
  clientes,
  obras,
  selectedRegion,
  searchQuery: globalSearchQuery = '',
  onSelectObraForOffer,
  onSaveCliente,
  onOpenEditClienteContacts,
  onOpenViewActividades
}) => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'hardware'>('clientes');
  const [selectedClienteId, setSelectedClienteId] = useState<string>(clientes[0]?.id || '');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');
  const searchQuery = globalSearchQuery || localSearchQuery;

  // Modal State for New Client
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
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

  const filteredObras = obras.filter((o) => {
    const matchRegion = selectedRegion === 'Todas' || o.region === selectedRegion;
    const q = searchQuery.toLowerCase();
    const matchQ = !q ||
      o.codigo.toLowerCase().includes(q) ||
      o.nombre.toLowerCase().includes(q) ||
      o.hardwareSpecs.modelo.toLowerCase().includes(q) ||
      o.responsable.toLowerCase().includes(q);
    return matchRegion && matchQ;
  });

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
      {/* Top Tab Switcher: Bloque Clientes vs Bloque Equipos (Ficha Hardware) */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-[#F1F3F5] p-1.5 rounded-xl border border-[#E0E0E0]">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'clientes'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
            id="btn-tab-clientes"
          >
            <Users size={16} className={activeTab === 'clientes' ? 'text-[#C8102E]' : ''} />
            <span>Bloque Clientes (Directorio)</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hardware'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
            id="btn-tab-hardware"
          >
            <Cpu size={16} className={activeTab === 'hardware' ? 'text-[#C8102E]' : ''} />
            <span>Bloque Equipos (Ficha de Hardware)</span>
          </button>
        </div>

        {activeTab === 'clientes' && (
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
      {activeTab === 'clientes' && (
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
                  <div className="flex items-center gap-2 self-start sm:self-auto">
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
                      {activeClienteObras.map((obra) => (
                        <div key={obra.id} className="p-4 rounded-xl border border-[#E0E0E0] bg-white hover:bg-[#F1F3F5]/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-[#C8102E] text-xs">{obra.codigo}</span>
                              <span className="font-extrabold text-[#2D3436] text-sm">{obra.nombre}</span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F1F3F5] text-[#2D3436] border border-[#E0E0E0]">
                                {obra.estado}
                              </span>
                            </div>
                            <div className="text-xs text-[#636E72] font-medium">
                              Equipos: {obra.cantidadEquipos}x {obra.hardwareSpecs.modelo} ({obra.hardwareSpecs.velocidadMS} m/s, {obra.hardwareSpecs.paradas} paradas, {obra.hardwareSpecs.capacidadKg} kg)
                            </div>
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
                      ))}
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

      {/* BLOQUE 2: FICHA DE HARDWARE (ESPECIFICACIONES TÉCNICAS DE EQUIPOS) */}
      {activeTab === 'hardware' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm space-y-2">
            <h3 className="text-base font-extrabold text-[#2D3436] flex items-center gap-2">
              <Cpu size={18} style={{ color: '#C8102E' }} />
              Especificaciones Técnicas Críticas de Hardware (Modelos Fujitec)
            </h3>
            <p className="text-xs text-[#636E72] font-medium">
              Configuraciones estándar de ascensores y montacargas asignadas a las obras en cartera
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredObras.map((obra) => {
              const spec = obra.hardwareSpecs;
              return (
                <div key={obra.id} className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-[#E0E0E0] shadow-xs space-y-4 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3">
                    <div>
                      <span className="font-mono font-black text-xs text-[#C8102E]">{obra.codigo}</span>
                      <h4 className="font-extrabold text-[#2D3436] text-sm">{obra.nombre}</h4>
                    </div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#F1F3F5] text-[#2D3436] border border-[#E0E0E0]">
                      {obra.cantidadEquipos} Unidades
                    </span>
                  </div>

                  {/* Hardware Spec Badges Grid */}
                  <div className="space-y-2.5">
                    <div className="text-xs font-black text-[#2D3436] bg-red-50 p-2.5 rounded-xl border border-red-200">
                      Modelo: {spec.modelo}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 bg-[#F1F3F5]/80 rounded-xl border border-[#E0E0E0] space-y-0.5">
                        <span className="text-[10px] text-[#B2BEC3] font-black uppercase flex items-center gap-1">
                          <Gauge size={12} /> Velocidad
                        </span>
                        <p className="font-extrabold text-[#2D3436]">{spec.velocidadMS} m/s</p>
                      </div>

                      <div className="p-3 bg-[#F1F3F5]/80 rounded-xl border border-[#E0E0E0] space-y-0.5">
                        <span className="text-[10px] text-[#B2BEC3] font-black uppercase flex items-center gap-1">
                          <Layers size={12} /> Paradas
                        </span>
                        <p className="font-extrabold text-[#2D3436]">{spec.paradas} paradas</p>
                      </div>

                      <div className="p-3 bg-[#F1F3F5]/80 rounded-xl border border-[#E0E0E0] space-y-0.5">
                        <span className="text-[10px] text-[#B2BEC3] font-black uppercase flex items-center gap-1">
                          <Zap size={12} /> Máquinas
                        </span>
                        <p className="font-extrabold text-[#2D3436] truncate">{spec.tipoSalaMaquinas}</p>
                      </div>

                      <div className="p-3 bg-[#F1F3F5]/80 rounded-xl border border-[#E0E0E0] space-y-0.5">
                        <span className="text-[10px] text-[#B2BEC3] font-black uppercase flex items-center gap-1">
                          <ShieldCheck size={12} /> Capacidad
                        </span>
                        <p className="font-extrabold text-[#2D3436]">{spec.capacidadKg} kg</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#F1F3F5] pt-3 flex items-center justify-between text-xs">
                    <span className="text-[#636E72] font-medium">Estado: <strong className="text-[#2D3436]">{obra.estado}</strong></span>
                    <button
                      onClick={() => onSelectObraForOffer(obra)}
                      className="font-bold text-[#C8102E] hover:underline flex items-center gap-0.5"
                      id={`btn-espec-oferta-${obra.id}`}
                    >
                      Generar Carta <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
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
                  <label className="block font-bold text-[#2D3436] mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={newClienteForm.email}
                    onChange={(e) => setNewClienteForm({...newClienteForm, email: e.target.value})}
                    className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D3436] mb-1">Teléfono</label>
                  <input
                    type="text"
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
    </div>
  );
};
