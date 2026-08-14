/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Last Updated: 2026-07-29 - Complete MVP Implementation
 * Cache Buster: v1.0.1
 */

import { BUILD_VERSION } from './BUILD_INFO';
import React, { useState } from 'react';

// Ensure build info is included in bundle
console.log('Build version:', BUILD_VERSION);
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PantallaDashboard } from './components/PantallaDashboard';
import { PantallaObrasFunnel } from './components/PantallaObrasFunnel';
import { PantallaFichaRelacional } from './components/PantallaFichaRelacional';
import { PantallaCartaOferta } from './components/PantallaCartaOferta';
import { PantallaAdmin } from './components/PantallaAdmin';
import { PantallaEquipos } from './components/PantallaEquipos';
import { PantallaConfiguracion } from './components/PantallaConfiguracion';
import { ModalObra } from './components/ModalObra';
import { ModalActividad } from './components/ModalActividad';
import { ModalCliente } from './components/ModalCliente';

import {
  Obra,
  Cliente,
  CartaOferta,
  Region,
  EquipmentType,
  FunnelStage,
  Equipo
} from './types';
import { logCambioEstado, logCambioUsuarioAsignado, logActividadCompletada, logEquipoAgregado, logEquipoRemovido } from './utils/sistemLog';
import {
  INITIAL_OBRAS,
  INITIAL_CLIENTES,
  INITIAL_CARTAS_OFERTA,
  MONTHLY_SALES_DATA,
  INITIAL_EQUIPOS
} from './data/mockData';
import { tieneAlertaTemporal } from './utils/semaforo';

const distributeValue = (total: number) => {
  const baseAmount = Math.floor(total / 12);
  const remainder = total % 12;
  const newMeses = Array(12).fill(baseAmount);
  for (let i = 0; i < remainder; i++) {
    newMeses[i] += 1;
  }
  return newMeses;
};

const generateMonthlyDataFromBudget = (budgetConfigs: any[], selectedYear: number) => {
  const currentMonth = new Date().getMonth();
  const currentYearValue = new Date().getFullYear();
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Get budget for selected year
  const budgetConfig = budgetConfigs.find(b => b.año === selectedYear);

  if (!budgetConfig) {
    // Default budget if year not found
    const defaultMonto = 8500000;
    const defaultUnidades = 80;
    return Array.from({ length: 12 }, (_, i) => ({
      mes: meses[i] + (i === currentMonth && selectedYear === currentYearValue ? ' (YTD)' : i > currentMonth && selectedYear === currentYearValue ? ' (Proy)' : ''),
      ventasRealesUSD: 0,
      ventasAcumuladasUSD: 0,
      planAcumuladoUSD: Math.round((defaultMonto / 12) * (i + 1)),
      equiposVendidos: 0,
      equiposPlan: Math.round((defaultUnidades / 12) * (i + 1))
    }));
  }

  const mesesUSD = budgetConfig.mesesUSD || Array(12).fill(budgetConfig.montoAnualUSD / 12);
  const unidadesMeses = budgetConfig.unidadesMeses || Array(12).fill(budgetConfig.unidadesAnual / 12);

  const monthlyData = [];
  let planAcumulado = 0;
  let equiposPlanAcumulados = 0;

  for (let i = 0; i < 12; i++) {
    const mesNombre = meses[i];
    let label = mesNombre;

    if (selectedYear === currentYearValue) {
      if (i === currentMonth) {
        label = `${mesNombre} (YTD)`;
      } else if (i > currentMonth) {
        label = `${mesNombre} (Proy)`;
      }
    }

    planAcumulado += mesesUSD[i] || 0;
    equiposPlanAcumulados += Math.round(unidadesMeses[i] || 0);

    monthlyData.push({
      mes: label,
      ventasRealesUSD: 0,
      ventasAcumuladasUSD: 0,
      planAcumuladoUSD: planAcumulado,
      equiposVendidos: 0,
      equiposPlan: equiposPlanAcumulados
    });
  }

  return monthlyData;
};

function AppContent() {
  const { usuarioActual, usuarios: usuariosAuth } = useAuth();
  const getNombreUsuario = (usuarioId?: string): string =>
    usuariosAuth.find((u) => u.id === usuarioId)?.nombre || 'Sin asignar';

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Global Filter States
  const [selectedRegion, setSelectedRegion] = useState<Region>('Todas');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showOnlyAlerts, setShowOnlyAlerts] = useState<boolean>(false);

  // App Data Collections
  const [obras, setObras] = useState<Obra[]>(INITIAL_OBRAS);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [cartasOferta, setCartasOferta] = useState<CartaOferta[]>(INITIAL_CARTAS_OFERTA);
  const [equipos, setEquipos] = useState<Equipo[]>(INITIAL_EQUIPOS);
  const [proximoCodigoObra, setProximoCodigoObra] = useState<string>('A-5300');
  const [budgetConfigs, setBudgetConfigs] = useState<any[]>([
    {
      año: new Date().getFullYear(),
      montoAnualUSD: 8500000,
      mesesUSD: distributeValue(8500000),
      unidadesAnual: 80,
      unidadesMeses: distributeValue(80),
      rentabilidadPorcentaje: 22
    }
  ]);

  // Modal & Slide-over Drawer States
  const [isModalObraOpen, setIsModalObraOpen] = useState<boolean>(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [selectedObraForOffer, setSelectedObraForOffer] = useState<Obra | undefined>(undefined);
  const [isModalActividadOpen, setIsModalActividadOpen] = useState<boolean>(false);
  const [selectedObraForActividad, setSelectedObraForActividad] = useState<Obra | null>(null);
  const [isModalClienteOpen, setIsModalClienteOpen] = useState<boolean>(false);
  const [selectedClienteForEdit, setSelectedClienteForEdit] = useState<Cliente | null>(null);
  const [isConfiguracionOpen, setIsConfiguracionOpen] = useState<boolean>(false);

  // Count total obras requiring temporal alert (> 7 days without update)
  const alertaCount = obras.filter((o) => tieneAlertaTemporal(o)).length;

  // Keep modal-displayed obras in sync with live `obras` state (avoids stale checkboxes/data
  // after toggling an activity or other in-place update while the modal is open)
  const editingObraLive = editingObra ? obras.find((o) => o.id === editingObra.id) || editingObra : null;
  const selectedObraForActividadLive = selectedObraForActividad
    ? obras.find((o) => o.id === selectedObraForActividad.id) || selectedObraForActividad
    : null;

  // Handlers
  const handleOpenNewObraModal = () => {
    setEditingObra(null);
    setIsModalObraOpen(true);
  };

  const handleEditObra = (obra: Obra) => {
    setEditingObra(obra);
    setIsModalObraOpen(true);
  };

  const handleSaveObra = (savedObra: Obra) => {
    setObras((prev) => {
      const exists = prev.some((o) => o.id === savedObra.id);
      let obraFinal = savedObra;

      if (exists) {
        const obraAnterior = prev.find((o) => o.id === savedObra.id);
        if (obraAnterior && usuarioActual) {
          // Log estado changes
          if (obraAnterior.estado !== savedObra.estado) {
            obraFinal = logCambioEstado(obraFinal, obraAnterior.estado, savedObra.estado, usuarioActual.nombre, 'dropdown');
          }
          // Log usuario assignment changes
          if (obraAnterior.usuarioAsignado !== savedObra.usuarioAsignado) {
            obraFinal = logCambioUsuarioAsignado(
              obraFinal,
              getNombreUsuario(obraAnterior.usuarioAsignado),
              getNombreUsuario(savedObra.usuarioAsignado),
              usuarioActual.nombre
            );
          }
        }
        return prev.map((o) => (o.id === savedObra.id ? obraFinal : o));
      } else {
        return [obraFinal, ...prev];
      }
    });
  };

  const handleUpdateObraState = (obraId: string, nuevoEstado: FunnelStage) => {
    setObras((prev) =>
      prev.map((o: Obra) => {
        if (o.id === obraId && usuarioActual && o.estado !== nuevoEstado) {
          let obraLogged = logCambioEstado(o, o.estado, nuevoEstado, usuarioActual.nombre, 'dropdown');
          obraLogged = {
            ...obraLogged,
            estado: nuevoEstado,
            fechaUltimaActualizacion: new Date().toISOString().split('T')[0]
          };
          return obraLogged;
        }
        return o;
      })
    );
  };

  const handleGenerarOferta = (obra: Obra) => {
    setSelectedObraForOffer(obra);
    setActiveTab('oferta');
  };

  const handleSaveCliente = (newCliente: Cliente) => {
    setClientes((prev) => [newCliente, ...prev]);
  };

  const handleSaveCartaOferta = (nuevaCarta: CartaOferta) => {
    setCartasOferta((prev) => [nuevaCarta, ...prev]);
  };

  const handleNavigateToObra = (obraId: string) => {
    const target = obras.find((o) => o.id === obraId);
    if (target) {
      setSearchQuery(target.codigo);
    }
    setActiveTab('obras');
  };

  const handleAddActividad = (obraId: string, descripcion: string, reseteaDias: boolean = false) => {
    setObras((prev) => {
      const updated = prev.map((o) => {
        if (o.id === obraId) {
          const hoy = new Date().toISOString().split('T')[0];
          const newActividad = {
            id: `act-${Date.now()}`,
            descripcion,
            fecha: hoy,
            autor: usuarioActual?.nombre || 'Usuario'
          };

          let updatedObra = {
            ...o,
            actividades: [newActividad, ...(o.actividades || [])]
          };

          // If reseteaDias is true, reset the action counter
          if (reseteaDias && usuarioActual) {
            updatedObra = {
              ...updatedObra,
              fechaUltimaActualizacion: hoy
            };
          }

          return updatedObra;
        }
        return o;
      });
      // Update selectedObraForActividad if it's the same obra
      if (selectedObraForActividad?.id === obraId) {
        const updatedObra = updated.find((o) => o.id === obraId);
        if (updatedObra) {
          setSelectedObraForActividad(updatedObra);
        }
      }
      return updated;
    });
  };

  const handleToggleActividad = (obraId: string, actividadId: string, completada: boolean) => {
    setObras((prev) =>
      prev.map((o) => {
        if (o.id === obraId && usuarioActual) {
          let obraLogged = o;
          const actividad = o.actividadesPorEtapa?.find((a) => a.id === actividadId);
          if (actividad) {
            obraLogged = logActividadCompletada(o, actividad.descripcion, o.estado, completada, usuarioActual.nombre);
          }

          return {
            ...obraLogged,
            actividadesPorEtapa: (obraLogged.actividadesPorEtapa || []).map((a) =>
              a.id === actividadId
                ? {
                    ...a,
                    completada,
                    fechaCompletada: completada ? new Date().toISOString().slice(0, 19).replace('T', ' ') : undefined,
                    completadaPor: completada ? usuarioActual.nombre : undefined
                  }
                : a
            ),
            fechaUltimaActualizacion: completada ? new Date().toISOString().split('T')[0] : o.fechaUltimaActualizacion
          };
        }
        return o;
      })
    );
  };

  // Agrega/quita equipos de una obra (usado desde la Ficha de Cliente y desde ModalObra)
  // con log de auditoría por cada alta/baja individual.
  const handleUpdateObraEquipos = (obraId: string, nuevosEquipoIds: string[]) => {
    setObras((prev) =>
      prev.map((o) => {
        if (o.id !== obraId || !usuarioActual) return o;
        const anteriores = o.equipoIds || [];
        const agregados = nuevosEquipoIds.filter((id) => !anteriores.includes(id));
        const quitados = anteriores.filter((id) => !nuevosEquipoIds.includes(id));

        let obraLogged: Obra = { ...o, equipoIds: nuevosEquipoIds };
        agregados.forEach((id) => {
          const eq = equipos.find((e) => e.id === id);
          if (eq) obraLogged = logEquipoAgregado(obraLogged, eq.nombre, eq.id, usuarioActual.nombre);
        });
        quitados.forEach((id) => {
          const eq = equipos.find((e) => e.id === id);
          if (eq) obraLogged = logEquipoRemovido(obraLogged, eq.nombre, eq.id, usuarioActual.nombre);
        });
        return obraLogged;
      })
    );
  };

  const handleEditClienteContacts = (cliente: Cliente) => {
    setSelectedClienteForEdit(cliente);
    setIsModalClienteOpen(true);
  };

  const handleSaveBudgetConfig = (config: any) => {
    setBudgetConfigs((prev) => {
      const exists = prev.some((c) => c.año === config.año);
      if (exists) {
        return prev.map((c) => (c.año === config.año ? config : c));
      } else {
        return [...prev, config];
      }
    });
  };

  const handleSaveDiasConfig = (config: any) => {
    // For now, just close the modal - in a real app, this would persist to backend
    setIsConfiguracionOpen(false);
  };

  const handleSaveEquipo = (equipo: Equipo) => {
    setEquipos((prev) => {
      const exists = prev.some((e) => e.id === equipo.id);
      if (exists) {
        return prev.map((e) => (e.id === equipo.id ? equipo : e));
      } else {
        return [...prev, equipo];
      }
    });
  };

  const handleDeleteEquipo = (equipoId: string) => {
    setEquipos((prev) => prev.filter((e) => e.id !== equipoId));
  };

  const handleClickAlertaBadge = () => {
    setShowOnlyAlerts(true);
    setActiveTab('obras');
  };

  return (
    <div className="flex h-screen bg-[#F1F3F5] dark:bg-[#1A1F22] font-sans text-[#2D3436] dark:text-[#F1F3F5] overflow-hidden transition-colors">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
        {/* Top Header Controls Bar */}
        <div className="print:hidden">
          <Header
            activeTab={activeTab}
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            selectedEquipmentType={selectedEquipmentType}
            setSelectedEquipmentType={setSelectedEquipmentType}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenNewObraModal={handleOpenNewObraModal}
            alertaCount={alertaCount}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onClickAlertaBadge={handleClickAlertaBadge}
            onOpenConfig={() => setIsConfiguracionOpen(true)}
          />
        </div>

        {/* Dynamic Screen Content */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <PantallaDashboard
              obras={obras}
              monthlyData={generateMonthlyDataFromBudget(budgetConfigs, selectedYear)}
              selectedRegion={selectedRegion}
              selectedEquipmentType={selectedEquipmentType}
              searchQuery={searchQuery}
              onNavigateToObra={handleNavigateToObra}
              onNavigateToFunnel={() => setActiveTab('obras')}
              selectedYear={selectedYear}
              onOpenViewActividades={(obra) => {
                setSelectedObraForActividad(obra);
                setIsModalActividadOpen(true);
              }}
            />
          )}

          {activeTab === 'obras' && (
            <PantallaObrasFunnel
              obras={obras}
              equipos={equipos}
              clientes={clientes}
              selectedRegion={selectedRegion}
              selectedEquipmentType={selectedEquipmentType}
              searchQuery={searchQuery}
              onEditObra={handleEditObra}
              onGenerarOferta={handleGenerarOferta}
              onUpdateObraState={handleUpdateObraState}
              onOpenNewObraModal={handleOpenNewObraModal}
              selectedYear={selectedYear}
              showOnlyAlerts={showOnlyAlerts}
              onCloseAlertFilter={() => setShowOnlyAlerts(false)}
              onOpenViewActividades={(obra) => {
                setSelectedObraForActividad(obra);
                setIsModalActividadOpen(true);
              }}
            />
          )}

          {activeTab === 'ficha' && (
            <PantallaFichaRelacional
              clientes={clientes}
              obras={obras}
              equipos={equipos}
              onUpdateObraEquipos={handleUpdateObraEquipos}
              selectedRegion={selectedRegion}
              searchQuery={searchQuery}
              onSelectObraForOffer={handleGenerarOferta}
              onSaveCliente={handleSaveCliente}
              onOpenEditClienteContacts={handleEditClienteContacts}
              onOpenViewActividades={(obra) => {
                setSelectedObraForActividad(obra);
                setIsModalActividadOpen(true);
              }}
            />
          )}

          {activeTab === 'oferta' && (
            <PantallaCartaOferta
              obras={obras}
              clientes={clientes}
              selectedObraInitial={selectedObraForOffer}
              searchQuery={searchQuery}
              onSaveCartaOferta={handleSaveCartaOferta}
            />
          )}

          {activeTab === 'equipos' && (
            <PantallaEquipos
              equipos={equipos}
              obras={obras}
              clientes={clientes}
              onSaveEquipo={handleSaveEquipo}
              onDeleteEquipo={handleDeleteEquipo}
              onUpdateObraEquipos={handleUpdateObraEquipos}
            />
          )}

          {activeTab === 'admin' && (
            <PantallaAdmin
              budgetConfigs={budgetConfigs}
              onSaveBudgetConfig={handleSaveBudgetConfig}
              equipos={equipos}
              onSaveEquipo={handleSaveEquipo}
              onDeleteEquipo={handleDeleteEquipo}
            />
          )}
        </main>
      </div>

      {/* Obra Creation & Editing Modal */}
      <ModalObra
        isOpen={isModalObraOpen}
        onClose={() => setIsModalObraOpen(false)}
        onSaveObra={handleSaveObra}
        clientes={clientes}
        equipos={equipos}
        obras={obras}
        editingObra={editingObraLive}
        proximoCodigoObra={proximoCodigoObra}
        onUpdateProximoCodigo={setProximoCodigoObra}
        onOpenViewActividades={(obra) => {
          setSelectedObraForActividad(obra);
          setIsModalActividadOpen(true);
        }}
        onToggleActividad={handleToggleActividad}
        onUpdateObraEquipos={handleUpdateObraEquipos}
      />

      {/* Actividad Modal */}
      {selectedObraForActividadLive && (
        <ModalActividad
          isOpen={isModalActividadOpen}
          onClose={() => setIsModalActividadOpen(false)}
          obra={selectedObraForActividadLive}
          onAddActividad={handleAddActividad}
        />
      )}

      {/* Cliente Modal */}
      {selectedClienteForEdit && (
        <ModalCliente
          isOpen={isModalClienteOpen}
          onClose={() => setIsModalClienteOpen(false)}
          cliente={selectedClienteForEdit}
          onSaveCliente={(updatedCliente) => {
            setClientes((prev) =>
              prev.map((c) => (c.id === updatedCliente.id ? updatedCliente : c))
            );
            setIsModalClienteOpen(false);
          }}
        />
      )}

      {/* Configuración Panel (Superadmin only) */}
      <PantallaConfiguracion
        isOpen={isConfiguracionOpen}
        onClose={() => setIsConfiguracionOpen(false)}
        onSaveDiasConfig={handleSaveDiasConfig}
        onSaveBudgetConfig={handleSaveBudgetConfig}
      />
    </div>
  );
}

function AppWithAuth() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <AppWithAuth />
      </DarkModeProvider>
    </AuthProvider>
  );
}
