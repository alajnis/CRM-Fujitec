import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: '1. Dashboard Gerencial',
      sublabel: 'Panel de Control Anual & KPIs',
      icon: LayoutDashboard
    },
    {
      id: 'obras',
      label: '2. Obras y Embudo (Funnel)',
      sublabel: 'Lista Tradicional & Kanban',
      icon: Building2
    },
    {
      id: 'ficha',
      label: '3. Ficha Relacional',
      sublabel: 'Clientes & Hardware Elevadores',
      icon: Users
    },
    {
      id: 'oferta',
      label: '4. Carta Oferta',
      sublabel: 'Motor Documental Formal',
      icon: FileCheck
    },
    {
      id: 'admin',
      label: '5. Configuración',
      sublabel: 'Variables de Presupuesto & CRM',
      icon: Settings
    }
  ];

  return (
    <aside 
      className={`bg-[#C8102E] text-white flex flex-col justify-between transition-all duration-300 z-30 select-none shadow-xl ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Fujitec White Emblem Logo */}
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center font-black text-[#C8102E] text-4xl shrink-0 shadow-lg">
              F
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-white tracking-tight text-lg leading-tight uppercase">
                  Fujitec CRM
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-white/70 uppercase">
                  Argentina / Uruguay
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            id="btn-toggle-sidebar"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>


        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left rounded-xl transition-all duration-200 flex items-center gap-3.5 p-3.5 relative group ${
                  isActive
                    ? 'bg-white/20 text-white font-bold backdrop-blur-md border border-white/25 shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
                id={`nav-item-${item.id}`}
              >
                <Icon 
                  size={20} 
                  className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-white/80'}`}
                />
                {!collapsed && (
                  <div className="flex flex-col truncate">
                    <span className="text-sm font-bold tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-white/60 font-normal truncate">
                      {item.sublabel}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="font-bold text-white/90">CRM Fujitec</span>
              <span className="text-[10px] text-white/50">Impruvia v1.0 • USD</span>
            </div>
          ) : (
            <div className="w-full text-center text-[10px] font-bold text-white/60">
              FJT
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
