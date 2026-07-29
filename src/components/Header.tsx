import React from 'react';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Globe, 
  Filter, 
  CheckCircle2, 
  DollarSign, 
  Bell,
  Building
} from 'lucide-react';
import { Region, EquipmentType } from '../types';

interface HeaderProps {
  activeTab: string;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  selectedEquipmentType: EquipmentType;
  setSelectedEquipmentType: (type: EquipmentType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewObraModal: () => void;
  onOpenAiAssistant: () => void;
  alertaCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  selectedRegion,
  setSelectedRegion,
  selectedEquipmentType,
  setSelectedEquipmentType,
  searchQuery,
  setSearchQuery,
  onOpenNewObraModal,
  onOpenAiAssistant,
  alertaCount
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Gerencial Comercial',
          subtitle: 'Año Fiscal • Consolidado Central USD'
        };
      case 'obras':
        return {
          title: 'Obras y Embudo Comercial (Funnel)',
          subtitle: 'Seguimiento operativo ágil de obras presentadas, cotizadas y adjudicadas'
        };
      case 'ficha':
        return {
          title: 'Ficha Relacional de Clientes & Hardware',
          subtitle: 'Base unificada de clientes y especificaciones técnicas de elevadores y montacargas'
        };
      case 'oferta':
        return {
          title: 'Motor Documental de Carta Oferta',
          subtitle: 'Generador automático de propuestas comerciales con formato e identidad corporativa Fujitec'
        };
      default:
        return {
          title: 'CRM Fujitec MVP',
          subtitle: 'Gestión Comercial de Obras Nuevas'
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  const equipmentTypes: EquipmentType[] = [
    'Todos',
    'Ascensor de Pasajeros',
    'Ascensor de Carga / Montacargas',
    'Alta Velocidad',
    'Escalera Mecánica / Rampa'
  ];

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-[#E0E0E0] px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-[#2D3436] tracking-tight">
            {title}
          </h1>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#F1F3F5] text-[#636E72] border border-[#E0E0E0]">
            USD Base
          </span>
        </div>
        <p className="text-sm text-[#636E72] font-medium mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Global Filters & Action Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Global Filter: Region */}
        <div className="flex items-center bg-white/90 rounded-xl p-1 border border-[#E0E0E0] shadow-2xs text-xs">
          <span className="text-[#636E72] font-bold px-2 flex items-center gap-1">
            <Globe size={13} /> Región:
          </span>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as Region)}
            className="bg-[#F8F9FA] text-[#2D3436] font-bold py-1.5 px-3 rounded-lg border border-[#E0E0E0] focus:outline-none cursor-pointer"
            id="select-global-region"
          >
            <option value="Todas">Todas (AR + UY)</option>
            <option value="Argentina">🇦🇷 Argentina</option>
            <option value="Uruguay">🇺🇾 Uruguay</option>
          </select>
        </div>

        {/* Global Filter: Equipment Type */}
        <div className="flex items-center bg-white/90 rounded-xl p-1 border border-[#E0E0E0] shadow-2xs text-xs">
          <span className="text-[#636E72] font-bold px-2 flex items-center gap-1">
            <Filter size={13} /> Equipo:
          </span>
          <select
            value={selectedEquipmentType}
            onChange={(e) => setSelectedEquipmentType(e.target.value as EquipmentType)}
            className="bg-[#F8F9FA] text-[#2D3436] font-bold py-1.5 px-3 rounded-lg border border-[#E0E0E0] focus:outline-none cursor-pointer max-w-[180px] truncate"
            id="select-global-equipment"
          >
            {equipmentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Global Quick Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B2BEC3]" />
          <input
            type="text"
            placeholder="Buscar código, obra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3.5 py-2 bg-white/90 border border-[#E0E0E0] text-[#2D3436] placeholder:text-[#B2BEC3] text-xs font-medium rounded-xl focus:outline-none focus:border-[#C8102E] w-48 transition-all focus:w-64 shadow-2xs"
            id="input-global-search"
          />
        </div>

        {/* Alert Indicator Badge if stagnant projects exist */}
        {alertaCount > 0 && (
          <div 
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-all shadow-2xs"
            title={`${alertaCount} obra(s) con más de 7 días sin actualización`}
            id="badge-temporal-alert-header"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>{alertaCount} Alerta{alertaCount > 1 ? 's' : ''} &gt;7d</span>
          </div>
        )}

        {/* Wing Red Action Button: Nueva Obra */}
        <button
          onClick={onOpenNewObraModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:bg-[#A60D26] active:scale-95"
          style={{ backgroundColor: '#C8102E' }}
          id="btn-nueva-obra-header"
        >
          <Plus size={16} />
          <span>+ Nueva Obra</span>
        </button>
      </div>
    </header>
  );
};
