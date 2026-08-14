import React from 'react';
import {
  Search,
  Settings,
  CheckCircle2,
  Bell,
  Plus,
  Moon,
  Sun
} from 'lucide-react';
import { Region, EquipmentType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

interface HeaderProps {
  activeTab: string;
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  selectedEquipmentType: EquipmentType;
  setSelectedEquipmentType: (type: EquipmentType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewObraModal: () => void;
  alertaCount: number;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onClickAlertaBadge?: () => void;
  onOpenConfig?: () => void;
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
  alertaCount,
  selectedYear,
  setSelectedYear,
  onClickAlertaBadge,
  onOpenConfig
}) => {
  const { isSuperuser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Gerencial Comercial',
          subtitle: 'Año Fiscal • Consolidado Central USD'
        };
      case 'obras':
        return {
          title: 'Funnel Obras',
          subtitle: 'Embudo de Ventas • Seguimiento de Proyectos'
        };
      case 'ficha':
        return {
          title: 'Clientes',
          subtitle: 'Gestión de Clientes y Contactos'
        };
      case 'equipos':
        return {
          title: 'Equipos Fujitec',
          subtitle: 'Catálogo de Equipos y Especificaciones Técnicas'
        };
      case 'oferta':
        return {
          title: 'Propuesta técnico-económica',
          subtitle: 'Generador automático de propuestas comerciales'
        };
      case 'admin':
        return {
          title: 'Configuración',
          subtitle: 'Administración del Sistema'
        };
      default:
        return {
          title: 'CRM Fujitec MVP',
          subtitle: 'Gestión Comercial de Obras Nuevas'
        };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-[#E0E0E0] px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
      {/* Title & Subtitle */}
      <div className="flex-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-[#2D3436] tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-sm text-[#636E72] font-medium mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* Controls: Year, Alerts, Search, Settings */}
      <div className="flex flex-wrap items-center gap-3 justify-end">
        {/* Crear Obra Button - Funnel Obras */}
        {activeTab === 'obras' && (
          <button
            onClick={onOpenNewObraModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A60D26] text-white font-bold text-sm transition-all shadow-md"
            title="Crear nueva obra comercial"
            id="btn-header-crear-obra"
          >
            <Plus size={16} />
            <span>Crear Obra</span>
          </button>
        )}

        {/* Year Selector */}
        <div className="flex items-center bg-white/90 rounded-xl p-1 border border-[#E0E0E0] shadow-2xs text-xs">
          <span className="text-[#636E72] font-bold px-2 flex items-center gap-1">
            📅 Año:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-[#F8F9FA] text-[#2D3436] font-bold py-1.5 px-3 rounded-lg border border-[#E0E0E0] focus:outline-none cursor-pointer"
            id="select-global-year"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>

        {/* Alert Filter Badge */}
        <button
          onClick={onClickAlertaBadge}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-all shadow-2xs"
          title={`${alertaCount} obra(s) con alerta`}
          id="badge-obras-con-alerta"
        >
          <Bell size={14} />
          <span>Obras con alerta</span>
        </button>

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

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-lg text-[#636E72] hover:text-[#C8102E] hover:bg-[#F1F3F5] transition-all dark:text-[#B2BEC3] dark:hover:text-[#FFD700] dark:hover:bg-[#3D4449]"
          title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          id="btn-header-dark-mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings Wheel (Superadmin only) */}
        {isSuperuser() && (
          <button
            onClick={onOpenConfig}
            className="p-2.5 rounded-lg text-[#636E72] hover:text-[#C8102E] hover:bg-[#F1F3F5] transition-all dark:text-[#B2BEC3] dark:hover:text-[#FFD700] dark:hover:bg-[#3D4449]"
            title="Configuración"
            id="btn-header-settings"
          >
            <Settings size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
