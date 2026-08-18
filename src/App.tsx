/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Last Updated: 2026-07-29 - Complete MVP Implementation
 * Cache Buster: v1.0.1
 */

import { BUILD_VERSION } from './BUILD_INFO';
import React, { useState, useEffect } from 'react';

// Get current time in GMT-3 (Buenos Aires)
const getCurrentTimeGMT3 = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires'
  });
  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  const second = parts.find(p => p.type === 'second')?.value;
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// Ensure build info is included in bundle
console.log('Build version:', BUILD_VERSION);
import { AuthProvider, useAuth } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';
import { LoginScreen } from './components/LoginScreen';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PantallaDashboard } from './components/PantallaDashboard';
import { PantallaMisObras } from './components/PantallaMisObras';
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
import { useSupabaseData } from './hooks/useSupabaseData';
import { supabaseAdapter } from './adapters/supabaseAdapter';
import { obrasService, clientesService, equiposService, actividadesService } from './services';
import { configuracionService } from './services/configuracionService';
import { seedActividades, seedActividadesParaObra } from './utils/seedActividades';

const distributeValue = (total: number) => {
  const baseAmount = Math.floor(total / 12);
  const remainder = total % 12;
  const newMeses = Array(12).fill(baseAmount);
  for (let i = 0; i < remainder; i++) {
    newMeses[i] += 1;
  }
  return newMeses;
};

const generateMonthlyDataFromBudget = (budgetConfigs: any[], selectedYear: number, obras: Obra[] = []) => {
  const currentMonth = new Date().getMonth();
  const currentYearValue = new Date().getFullYear();
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Calculate real sales by month from contratadas obras
  const ventasPorMes = Array(12).fill(0);
  const equiposPorMes = Array(12).fill(0);

  obras
    .filter(o => o.estado === 'Contratadas')
    .forEach(obra => {
      const [year, month] = obra.fechaIngreso.split('-').map(Number);
      if (year === selectedYear && month >= 1 && month <= 12) {
        ventasPorMes[month - 1] += obra.montoUSD || 0;
        equiposPorMes[month - 1] += 1;
      }
    });

  // Get budget for selected year
  const budgetConfig = budgetConfigs.find(b => b.año === selectedYear);

  if (!budgetConfig) {
    // Default budget if year not found
    const defaultMonto = 8500000;
    const defaultUnidades = 80;
    let ventasAcumuladas = 0;
    let equiposAcumulados = 0;
    return Array.from({ length: 12 }, (_, i) => {
      ventasAcumuladas += ventasPorMes[i];
      equiposAcumulados += equiposPorMes[i];
      return {
        mes: meses[i] + (i === currentMonth && selectedYear === currentYearValue ? ' (YTD)' : i > currentMonth && selectedYear === currentYearValue ? ' (Proy)' : ''),
        ventasRealesUSD: ventasPorMes[i],
        ventasAcumuladasUSD: ventasAcumuladas,
        planAcumuladoUSD: Math.round((defaultMonto / 12) * (i + 1)),
        equiposVendidos: equiposAcumulados,
        equiposPlan: Math.round((defaultUnidades / 12) * (i + 1))
      };
    });
  }

  const mesesUSD = budgetConfig.mesesUSD || Array(12).fill(budgetConfig.montoAnualUSD / 12);
  const unidadesMeses = budgetConfig.unidadesMeses || Array(12).fill(budgetConfig.unidadesAnual / 12);

  const monthlyData = [];
  let planAcumulado = 0;
  let equiposPlanAcumulados = 0;
  let ventasAcumuladas = 0;
  let equiposAcumulados = 0;

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
    ventasAcumuladas += ventasPorMes[i];
    equiposAcumulados += equiposPorMes[i];

    monthlyData.push({
      mes: label,
      ventasRealesUSD: ventasPorMes[i],
      ventasAcumuladasUSD: ventasAcumuladas,
      planAcumuladoUSD: planAcumulado,
      equiposVendidos: equiposAcumulados,
      equiposPlan: equiposPlanAcumulados
    });
  }

  return monthlyData;
};

function AppContent() {
  const { usuarioActual, usuarios: usuariosAuth } = useAuth();
  const getNombreUsuario = (usuarioId?: string): string =>
    usuariosAuth.find((u) => u.id === usuarioId)?.nombre || 'Sin asignar';

  // Load data from Supabase
  const { obras: obrasFromSupabase, clientes: clientesFromSupabase, equipos: equiposFromSupabase, isLoading } = useSupabaseData();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Global Filter States
  const [selectedRegion, setSelectedRegion] = useState<Region>('Todas');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<EquipmentType>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showOnlyAlerts, setShowOnlyAlerts] = useState<boolean>(false);

  // App Data Collections - Use Supabase data if loaded, otherwise use mock data
  const [obras, setObras] = useState<Obra[]>(INITIAL_OBRAS);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [cartasOferta, setCartasOferta] = useState<CartaOferta[]>(INITIAL_CARTAS_OFERTA);
  const [equipos, setEquipos] = useState<Equipo[]>(INITIAL_EQUIPOS);

  // Load dias configuration from localStorage
  const [diasConfig, setDiasConfig] = useState<any[]>(() => {
    const saved = localStorage.getItem('diasConfig');
    return saved ? JSON.parse(saved) : [];
  });

  // Seed activities on first load
  useEffect(() => {
    const seeded = sessionStorage.getItem('actividades_seeded');
    if (!seeded) {
      seedActividades().then(() => {
        sessionStorage.setItem('actividades_seeded', 'true');
      });
    }
  }, []);

  // Update state when Supabase data is loaded.
  // Importante: NO se reasigna usuarioAsignado acá. Antes se pisaba con el
  // usuario logueado, lo que hacía que todos vieran todas las obras en
  // "Mis obras asignadas". El responsable vive en la obra, no en la sesión.
  useEffect(() => {
    if (!isLoading && obrasFromSupabase.length > 0) {
      setObras(obrasFromSupabase);
      setClientes(clientesFromSupabase);
      setEquipos(equiposFromSupabase);
    }
  }, [obrasFromSupabase, clientesFromSupabase, equiposFromSupabase, isLoading]);
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
    // An obra is "existing" only when its id is a real Supabase UUID. New obras
    // arrive with a placeholder id like `obr-1699...`, which must not be sent to
    // updateObra (that silently matches zero rows and the obra is lost on reload).
    const esExistente = !!savedObra.id && supabaseAdapter.isValidUUID(savedObra.id);

    if (esExistente) {
      const supabaseData = supabaseAdapter.toSupabaseObra(savedObra);
      obrasService.updateObra(savedObra.id, supabaseData as any)
        .catch(err => console.error('Error updating obra:', err));
    } else {
      // Assign a real UUID up-front so activities can reference the obra
      const nuevoId = crypto.randomUUID();
      savedObra = { ...savedObra, id: nuevoId };
      const supabaseData = { ...supabaseAdapter.toSupabaseObra(savedObra), id: nuevoId };

      obrasService.createObra(supabaseData as any)
        .then(() => seedActividadesParaObra(nuevoId))
        .then((actividadesCreadas) => {
          // Reflect the seeded activities locally so the checkboxes show up
          // without waiting for a reload.
          const actividadesApp = actividadesCreadas.map((a: any) =>
            supabaseAdapter.toAppActividadPorEtapa(a)
          );
          setObras((prev) =>
            prev.map((o) => (o.id === nuevoId ? { ...o, actividadesPorEtapa: actividadesApp } : o))
          );
        })
        .catch(err => console.error('Error creating obra:', err));
    }

    // Update local state
    setObras((prev) => {
      const exists = prev.some((o) => o.id === savedObra.id);
      let obraFinal = savedObra;

      if (exists) {
        const obraAnterior = prev.find((o) => o.id === savedObra.id);
        if (obraAnterior && usuarioActual) {
          if (obraAnterior.estado !== savedObra.estado) {
            obraFinal = logCambioEstado(obraFinal, obraAnterior.estado, savedObra.estado, usuarioActual.nombre, 'dropdown');
          }
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
          const updatedObra = {
            ...obraLogged,
            estado: nuevoEstado,
            fechaUltimaActualizacion: new Date().toISOString().split('T')[0]
          };

          // Save to Supabase asynchronously
          const supabaseData = supabaseAdapter.toSupabaseObra(updatedObra);
          obrasService.updateObra(obraId, supabaseData as any)
            .catch(err => console.error('Error updating obra state in Supabase:', err));

          return updatedObra;
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
    // Generate proper UUID if not exists
    const clienteWithId = newCliente.id && newCliente.id.length > 20
      ? newCliente
      : { ...newCliente, id: crypto.randomUUID() };

    // Save to Supabase
    const supabaseData = supabaseAdapter.toSupabaseCliente(clienteWithId);
    console.log('💾 Saving cliente to Supabase with ID:', clienteWithId.id);

    // Check if cliente already exists in state (update) or is new (create)
    const existsInState = clientes.some((c) => c.id === clienteWithId.id);

    if (existsInState) {
      // Update existing
      console.log('📝 Updating existing cliente...');
      clientesService.updateCliente(clienteWithId.id, supabaseData as any)
        .then(() => console.log('✅ Cliente updated in Supabase'))
        .catch(err => {
          console.error('❌ Error updating cliente in Supabase:', err);
          console.error('Details:', err.message);
        });
    } else {
      // Create new - add ID to the data
      console.log('✨ Creating new cliente...');
      const supabaseDataWithId = { ...supabaseData, id: clienteWithId.id };
      clientesService.createCliente(supabaseDataWithId as any)
        .then((result) => {
          console.log('✅ Cliente created in Supabase with ID:', result.id);
        })
        .catch(err => {
          console.error('❌ Error creating cliente in Supabase:', err);
          console.error('Details:', err.message);
        });
    }

    setClientes((prev) => {
      const exists = prev.some((c) => c.id === clienteWithId.id);
      if (exists) {
        return prev.map((c) => (c.id === clienteWithId.id ? clienteWithId : c));
      }
      return [clienteWithId, ...prev];
    });
  };

  const handleDeleteCliente = (clienteId: string) => {
    clientesService.softDeleteCliente(clienteId)
      .catch(err => console.error('Error deleting cliente in Supabase:', err));

    setClientes((prev) => prev.filter((c) => c.id !== clienteId));
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

  const handleAddActividadPorEtapa = (obraId: string, descripcion: string, etapa: FunnelStage) => {
    setObras((prev) => {
      const updated = prev.map((o) => {
        if (o.id === obraId) {
          const newActividadId = crypto.randomUUID();
          const newActividad = {
            id: newActividadId,
            etapa,
            descripcion,
            completada: false
          };

          // Save to Supabase asynchronously
          const supabaseData = supabaseAdapter.toSupabaseActividad(newActividad, obraId);
          actividadesService.createActividad(supabaseData as any)
            .catch(err => console.error('Error creating actividad in Supabase:', err));

          return {
            ...o,
            actividadesPorEtapa: [newActividad, ...(o.actividadesPorEtapa || [])]
          };
        }
        return o;
      });
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

          const updatedObra = {
            ...obraLogged,
            actividadesPorEtapa: (obraLogged.actividadesPorEtapa || []).map((a) =>
              a.id === actividadId
                ? {
                    ...a,
                    completada,
                    fechaCompletada: completada ? getCurrentTimeGMT3() : undefined,
                    completadaPor: completada ? usuarioActual.nombre : undefined
                  }
                : a
            ),
            fechaUltimaActualizacion: completada ? new Date().toISOString().split('T')[0] : o.fechaUltimaActualizacion
          };

          // Save actividad to Supabase asynchronously
          const actividadActualizada = updatedObra.actividadesPorEtapa?.find((a) => a.id === actividadId);
          if (actividadActualizada) {
            const supabaseData = supabaseAdapter.toSupabaseActividad(actividadActualizada, obraId);
            actividadesService.updateActividad(actividadId, supabaseData as any)
              .catch(err => console.error('Error updating actividad in Supabase:', err));
          }

          // Save obra (with updated historialLog from logActividadCompletada) to Supabase
          const supabaseObraData = supabaseAdapter.toSupabaseObra(updatedObra);
          obrasService.updateObra(obraId, supabaseObraData as any)
            .catch(err => console.error('Error updating obra historialLog in Supabase:', err));

          // Update editingObra if it's open so modal sees the new historialLog
          if (editingObra && editingObra.id === obraId) {
            setEditingObra(updatedObra);
          }

          return updatedObra;
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
          if (eq) {
            obraLogged = logEquipoAgregado(obraLogged, eq.nombre, eq.id, usuarioActual.nombre);
            // Save equipo to Supabase with obra_id
            const supabaseEquipoData = supabaseAdapter.toSupabaseEquipo(eq, obraId);
            equiposService.updateEquipo(id, supabaseEquipoData as any)
              .catch(err => console.error('Error assigning equipo to obra in Supabase:', err));
          }
        });
        quitados.forEach((id) => {
          const eq = equipos.find((e) => e.id === id);
          if (eq) {
            obraLogged = logEquipoRemovido(obraLogged, eq.nombre, eq.id, usuarioActual.nombre);
            // Remove equipo from obra in Supabase
            const supabaseEquipoData = supabaseAdapter.toSupabaseEquipo(eq, '');
            equiposService.updateEquipo(id, supabaseEquipoData as any)
              .catch(err => console.error('Error removing equipo from obra in Supabase:', err));
          }
        });

        // Also update the obra's log in Supabase
        const supabaseData = supabaseAdapter.toSupabaseObra(obraLogged);
        obrasService.updateObra(obraId, supabaseData as any)
          .catch(err => console.error('Error updating obra in Supabase:', err));

        return obraLogged;
      })
    );
  };

  const handleEditClienteContacts = (cliente: Cliente) => {
    setSelectedClienteForEdit(cliente);
    setIsModalClienteOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
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

  const getDiasMaximosForEtapa = (etapa: string): number => {
    const found = diasConfig.find((d: any) => d.etapa === etapa);
    return found?.diasMaximosSinAccion || 7; // Default to 7 if not configured
  };

  const handleSaveDiasConfig = async (config: any) => {
    // Save dias configuration to localStorage
    localStorage.setItem('diasConfig', JSON.stringify(config));
    setDiasConfig(config); // Update state immediately
    console.log('✅ Dias configuration saved');
    setIsConfiguracionOpen(false);
  };

  const handleSaveEquipo = (equipo: Equipo) => {
    // Find the obra this equipment belongs to
    const obraAsociada = obras.find(o => o.equipoIds?.includes(equipo.id));
    const obraId = obraAsociada?.id || '';

    // Igual que en obras: sólo es "existente" si el id ya es un UUID de Supabase.
    // Un equipo nuevo trae un id local y debe crearse, no actualizarse.
    const esExistente = !!equipo.id && supabaseAdapter.isValidUUID(equipo.id);
    let equipoFinal = equipo;

    if (esExistente) {
      const supabaseData = supabaseAdapter.toSupabaseEquipo(equipo, obraId);
      equiposService.updateEquipo(equipo.id, supabaseData as any)
        .catch(err => console.error('Error updating equipo in Supabase:', err));
    } else {
      const nuevoId = crypto.randomUUID();
      equipoFinal = { ...equipo, id: nuevoId };
      const supabaseData = { ...supabaseAdapter.toSupabaseEquipo(equipoFinal, obraId), id: nuevoId };
      equiposService.createEquipo(supabaseData as any)
        .catch(err => console.error('Error creating equipo in Supabase:', err));
    }

    setEquipos((prev) => {
      const exists = prev.some((e) => e.id === equipoFinal.id);
      if (exists) {
        return prev.map((e) => (e.id === equipoFinal.id ? equipoFinal : e));
      } else {
        return [...prev, equipoFinal];
      }
    });
  };

  const handleDeleteEquipo = (equipoId: string) => {
    // Soft delete to Supabase
    equiposService.softDeleteEquipo(equipoId)
      .catch(err => console.error('Error deleting equipo in Supabase:', err));

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
              monthlyData={generateMonthlyDataFromBudget(budgetConfigs, selectedYear, obras)}
              selectedRegion={selectedRegion}
              selectedEquipmentType={selectedEquipmentType}
              searchQuery={searchQuery}
              onNavigateToObra={handleNavigateToObra}
              onNavigateToFunnel={() => setActiveTab('obras')}
              selectedYear={selectedYear}
              getDiasMaximosForEtapa={getDiasMaximosForEtapa}
              onOpenViewActividades={(obra) => {
                setSelectedObraForActividad(obra);
                setIsModalActividadOpen(true);
              }}
            />
          )}

          {activeTab === 'mis-obras' && (
            <PantallaMisObras
              obras={obras}
              onNavigateToObra={handleNavigateToObra}
              getDiasMaximosForEtapa={getDiasMaximosForEtapa}
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
              onDeleteCliente={handleDeleteCliente}
              onSaveObra={handleSaveObra}
              onOpenEditCliente={handleEditCliente}
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
            // Save to Supabase
            const supabaseData = supabaseAdapter.toSupabaseCliente(updatedCliente);
            clientesService.updateCliente(updatedCliente.id, supabaseData as any)
              .catch(err => console.error('Error updating cliente in Supabase:', err));

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
