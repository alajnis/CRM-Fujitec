import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { logout, usuarioActual, isSuperuser } = useAuth();
  const allMenuItems = [
    {
      id: 'dashboard',
      label: '1. Dashboard Gerencial',
      sublabel: 'Panel de Control Anual & KPIs',
      icon: LayoutDashboard,
      requiereAdmin: false
    },
    {
      id: 'obras',
      label: '2. Funnel Obras',
      sublabel: 'Embudo de Ventas & Kanban',
      icon: Building2,
      requiereAdmin: false
    },
    {
      id: 'ficha',
      label: '3. Clientes',
      sublabel: 'Gestión de Clientes & Contactos',
      icon: Users,
      requiereAdmin: false
    },
    {
      id: 'equipos',
      label: '4. Equipos Fujitec',
      sublabel: 'Gestión de Catálogo de Equipos',
      icon: Cpu,
      requiereAdmin: false
    },
    {
      id: 'oferta',
      label: '5. Propuesta técnico-económica',
      sublabel: 'Motor Documental Formal',
      icon: FileCheck,
      requiereAdmin: false
    }
  ];

  const menuItems = allMenuItems.filter(item => !item.requiereAdmin || isSuperuser());

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
            {/* Fujitec Logo - Only show when not collapsed */}
            {!collapsed && (
              <img
                src="/assets/fujitec-logo.png"
                alt="Fujitec Logo"
                className="w-16 h-16 shrink-0 shadow-lg rounded-lg"
              />
            )}
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
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left rounded-lg transition-all duration-200 flex items-center gap-2.5 p-2.5 relative group ${
                  isActive
                    ? 'bg-white/20 text-white font-bold backdrop-blur-md border border-white/25 shadow-md'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
                id={`nav-item-${item.id}`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-white/80'}`}
                />
                {!collapsed && (
                  <div className="flex flex-col truncate min-w-0">
                    <span className="text-xs font-bold tracking-wide leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-white/60 font-normal truncate">
                      {item.sublabel}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2">
        {/* User Info */}
        {usuarioActual && (
          <div className="px-4 py-2 border-b border-white/10 text-[10px]">
            <p className="text-white/70 font-semibold">{usuarioActual.nombre}</p>
            <p className="text-white/50 text-[9px]">{usuarioActual.rol === 'superusuario' ? 'Superusuario' : 'Usuario'}</p>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="mx-4 w-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-[11px] font-bold"
          title="Cerrar sesión"
        >
          <LogOut size={14} />
          {!collapsed && 'Salir'}
        </button>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 text-xs text-white/60 flex items-center justify-between">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="font-bold text-white/90">CRM Fujitec</span>
              <span className="text-[10px] text-white/50">
                Powered by{' '}
                <a
                  href="https://impruvia.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white underline transition-colors"
                >
                  Impruvia
                </a>
              </span>
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
