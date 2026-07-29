/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Last Updated: 2026-07-29 - Complete MVP Implementation
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PantallaDashboard } from './components/PantallaDashboard';
import { PantallaObrasFunnel } from './components/PantallaObrasFunnel';
import { PantallaFichaRelacional } from './components/PantallaFichaRelacional';
import { PantallaCartaOferta } from './components/PantallaCartaOferta';
import { PantallaAdmin } from './components/PantallaAdmin';
import { ModalObra } from './components/ModalObra';
import { ModalActividad } from './components/ModalActividad';
import { ModalCliente } from './components/ModalCliente';

import { 
  Obra, 
  Cliente, 
  CartaOferta, 
  Region, 
  EquipmentType, 
  FunnelStage 
} from './types';
import { 
  INITIAL_OBRAS, 
  INITIAL_CLIENTES, 
  INITIAL_CARTAS_OFERTA, 
  MONTHLY_SALES_DATA 
} from './data/mockData';
import { tieneAlertaTemporal } from './utils/semaforo';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Global Filter States
  const [selectedRegion, setSelectedRegion] = useState<Region>('Todas');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // App Data Collections
  const [obras, setObras] = useState<Obra[]>(INITIAL_OBRAS);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [cartasOferta, setCartasOferta] = useState<CartaOferta[]>(INITIAL_CARTAS_OFERTA);

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
      if (exists) {
        return prev.map((o) => (o.id === savedObra.id ? savedObra : o));
      } else {
        return [savedObra, ...prev];
      }
    });
  };

  const handleUpdateObraState = (obraId: string, nuevoEstado: FunnelStage) => {
    const hoyISO = new Date().toISOString().split('T')[0];
    setObras((prev) =>
      prev.map((o) =>
        o.id === obraId
          ? { ...o, estado: nuevoEstado, fechaUltimaActualizacion: hoyISO }
          : o
      )
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
            autor: 'Usuario'
          };
          return {
            ...o,
            actividades: [newActividad, ...(o.actividades || [])]
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

  return (
    <div className="flex h-screen bg-[#F1F3F5] font-sans text-[#2D3436] overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="print:hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
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
          />
        </div>

        {/* Dynamic Screen Content */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <PantallaDashboard
              obras={obras}
              monthlyData={MONTHLY_SALES_DATA}
              selectedRegion={selectedRegion}
              selectedEquipmentType={selectedEquipmentType}
              onNavigateToObra={handleNavigateToObra}
              onNavigateToFunnel={() => setActiveTab('obras')}
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
            />
          )}

          {activeTab === 'ficha' && (
            <PantallaFichaRelacional
              clientes={clientes}
              obras={obras}
              selectedRegion={selectedRegion}
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
              onSaveCartaOferta={handleSaveCartaOferta}
            />
          )}

          {activeTab === 'admin' && (
            <PantallaAdmin
              onSaveBudgetConfig={() => {}}
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
        editingObra={editingObra}
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
