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
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PantallaDashboard } from './components/PantallaDashboard';
import { PantallaObrasFunnel } from './components/PantallaObrasFunnel';
import { PantallaFichaRelacional } from './components/PantallaFichaRelacional';
import { PantallaCartaOferta } from './components/PantallaCartaOferta';
import { PantallaAdmin } from './components/PantallaAdmin';
import { PantallaEquipos } from './components/PantallaEquipos';
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
import {
  INITIAL_OBRAS,
  INITIAL_CLIENTES,
  INITIAL_CARTAS_OFERTA,
  MONTHLY_SALES_DATA,
  INITIAL_EQUIPOS
} from './data/mockData';
import { tieneAlertaTemporal } from './utils/semaforo';

const getMonthlyDataWithCurrentMonth = (baseData: typeof MONTHLY_SALES_DATA) => {
  const currentMonth = new Date().getMonth();
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return baseData.map((data, index) => {
    const mesNombre = meses[index];
    let label = mesNombre;

    if (index === currentMonth) {
      label = `${mesNombre} (YTD)`;
    } else if (index > currentMonth) {
      label = `${mesNombre} (Proy)`;
    }

    return {
      ...data,
      mes: label
    };
  });
};

function AppContent() {
  const { usuarioActual } = useAuth();

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
      mesesUSD: Array(12).fill(708333),
      unidadesAnual: 80,
      unidadesMeses: Array(12).fill(7),
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

  // Count total obras requiring temporal alert (> 7 days without update)
  const alertaCount = obras.filter((o) => tieneAlertaTemporal(o)).length;

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
        if (obraAnterior) {
          const existingLogs = obraAnterior.etapaLogs || [];

          if (obraAnterior.estado !== savedObra.estado && usuarioActual) {
            const hoyISO = new Date().toISOString().split('T')[0];
            const nuevoLog = {
              id: `log-${Date.now()}`,
              etapa: savedObra.estado,
              fechaCambio: hoyISO,
              usuarioId: usuarioActual.id,
              accion: 'cambio_etapa' as const
            };
            obraFinal = {
              ...savedObra,
              etapaLogs: [...existingLogs, nuevoLog]
            };
          } else {
            obraFinal = {
              ...savedObra,
              etapaLogs: existingLogs
            };
          }
        }
        return prev.map((o) => (o.id === savedObra.id ? obraFinal : o));
      } else {
        return [obraFinal, ...prev];
      }
    });
  };

  const handleUpdateObraState = (obraId: string, nuevoEstado: FunnelStage) => {
    const hoyISO = new Date().toISOString().split('T')[0];
    setObras((prev) =>
      prev.map((o: Obra) => {
        if (o.id === obraId && usuarioActual) {
          const nuevoLog = {
            id: `log-${Date.now()}`,
            etapa: nuevoEstado,
            fechaCambio: hoyISO,
            usuarioId: usuarioActual.id,
            accion: 'cambio_etapa' as const
          };
          return {
            ...o,
            estado: nuevoEstado,
            fechaUltimaActualizacion: hoyISO,
            etapaLogs: [...(o.etapaLogs || []), nuevoLog]
          };
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
    // Also update Obra stage to 'Presentada' if it was in 'Cotización'
    const obraTarget = obras.find((o) => o.id === nuevaCarta.obraId);
    if (obraTarget && obraTarget.estado === 'Cotización') {
      handleUpdateObraState(obraTarget.id, 'Presentada');
    }
  };

  const handleNavigateToObra = (obraId: string) => {
    const target = obras.find((o) => o.id === obraId);
    if (target) {
      setSearchQuery(target.codigo);
    }
    setActiveTab('obras');
  };

  const handleAddActividad = (obraId: string, descripcion: string) => {
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
          const newLog = usuarioActual ? {
            id: `log-${Date.now()}`,
            etapa: o.estado,
            fechaCambio: hoy,
            usuarioId: usuarioActual.id,
            accion: 'nota_agregada' as const
          } : null;
          return {
            ...o,
            actividades: [newActividad, ...(o.actividades || [])],
            etapaLogs: newLog ? [...(o.etapaLogs || []), newLog] : o.etapaLogs
          };
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
    <div className="flex h-screen bg-[#F1F3F5] font-sans text-[#2D3436] overflow-hidden">
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
          />
        </div>

        {/* Dynamic Screen Content */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <PantallaDashboard
              obras={obras}
              monthlyData={getMonthlyDataWithCurrentMonth(MONTHLY_SALES_DATA)}
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
              onSaveEquipo={handleSaveEquipo}
              onDeleteEquipo={handleDeleteEquipo}
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
        editingObra={editingObra}
        proximoCodigoObra={proximoCodigoObra}
        onUpdateProximoCodigo={setProximoCodigoObra}
        onOpenViewActividades={(obra) => {
          setSelectedObraForActividad(obra);
          setIsModalActividadOpen(true);
        }}
      />

      {/* Actividad Modal */}
      {selectedObraForActividad && (
        <ModalActividad
          isOpen={isModalActividadOpen}
          onClose={() => setIsModalActividadOpen(false)}
          obra={selectedObraForActividad}
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
      <AppWithAuth />
    </AuthProvider>
  );
}
