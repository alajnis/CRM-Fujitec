import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { History, Plus, RotateCw } from 'lucide-react';
import { Obra, Cliente, FunnelStage, Region, EquipmentType, HardwareSpecs, Equipo } from '../types';
import { useAuth } from '../context/AuthContext';
import { ComponenteActividades } from './ComponenteActividades';
import { Toast } from './Toast';

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

interface ModalObraProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObra: (obra: Obra) => void;
  clientes: Cliente[];
  equipos: Equipo[];
  obras?: Obra[];
  editingObra?: Obra | null;
  proximoCodigoObra: string;
  onUpdateProximoCodigo: (codigo: string) => void;
  onUpdateObraEquipos?: (obraId: string, equipoIds: string[]) => void;
}

export const ModalObra: React.FC<ModalObraProps> = ({
  isOpen,
  onClose,
  onSaveObra,
  clientes,
  equipos,
  obras = [],
  editingObra,
  proximoCodigoObra,
  onUpdateProximoCodigo,
  onUpdateObraEquipos
}) => {
  // Early return BEFORE any hooks - critical for hook ordering
  if (!isOpen) return null;

  const { usuarios, usuarioActual } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [equipoSearchQuery, setEquipoSearchQuery] = useState('');
  const [notaContenido, setNotaContenido] = useState('');
  const [notaReseteaDias, setNotaReseteaDias] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);
  const [confirmDialogState, setConfirmDialogState] = useState<{
    show: boolean;
    equipoId?: string;
    obraActual?: Obra;
  }>({ show: false });
  const [formObra, setFormObra] = useState<Partial<Obra>>({
    codigo: 'A-5300',
    nombre: '',
    region: 'Argentina',
    clienteId: clientes[0]?.id || '',
    montoUSD: 500000,
    tipoEquipo: 'Ascensor de Pasajeros',
    cantidadEquipos: 4,
    estado: 'Solicitud',
    usuarioAsignado: usuarioActual?.id,
    observaciones: '',
    hardwareSpecs: {
      velocidadMS: 1.75,
      paradas: 15,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 1000,
      modelo: 'Fujitec ZEXIA MRL'
    }
  });

  // Get equipoIds early (before useMemo) to avoid undefined in dependencies
  const equipoIdsActuales = editingObra?.equipoIds || [];

  // Compute equiposDisponibles early (before early return) to avoid hook order violations
  const equiposDisponibles = useMemo(() => {
    return equipos
      .filter((eq) =>
        !equipoIdsActuales.includes(eq.id) &&
        !eq.isDeleted &&
        (eq.nombre.toLowerCase().includes(equipoSearchQuery.toLowerCase()) ||
          eq.modelo.toLowerCase().includes(equipoSearchQuery.toLowerCase()) ||
          eq.codigoUnico.toLowerCase().includes(equipoSearchQuery.toLowerCase()))
      )
      .sort((a, b) => (a.codigoUnico || '').localeCompare(b.codigoUnico || ''));
  }, [equipos, equipoIdsActuales, equipoSearchQuery]);

  useEffect(() => {
    if (editingObra) {
      // Only reset if opening a NEW obra (different ID)
      const isNewObra = !formObra.id || formObra.id !== editingObra.id;

      if (isNewObra) {
        // First time opening this obra: copy everything from editingObra
        setFormObra({
          ...editingObra,
          usuarioAsignado: editingObra.usuarioAsignado || usuarioActual?.id
        });
      }
      // If same obra already open, don't reset formObra - preserve local changes
    } else {
      setFormObra({
        codigo: proximoCodigoObra,
        nombre: '',
        region: 'Argentina',
        clienteId: clientes[0]?.id || '',
        montoUSD: 650000,
        tipoEquipo: 'Ascensor de Pasajeros',
        cantidadEquipos: 4,
        estado: 'Solicitud',
        usuarioAsignado: usuarioActual?.id,
        observaciones: 'Nueva oportunidad comercial ingresada al CRM.',
        hardwareSpecs: {
          velocidadMS: 2.0,
          paradas: 20,
          tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
          capacidadKg: 1000,
          modelo: 'Fujitec ZEXIA'
        }
      });
    }
  }, [editingObra?.id, isOpen, proximoCodigoObra, usuarioActual]);

  // Handle activity toggle: update formObra immediately and autosave
  const handleToggleActividadLocal = (actividadId: string, completada: boolean) => {
    if (!editingObra || !usuarioActual) return;

    const actividad = editingObra.actividadesPorEtapa?.find((a: any) => a.id === actividadId);
    if (!actividad) return;

    // Create log entry
    const accion = completada ? 'actividad_completada' : 'actividad_desmarcada';
    const descripcionTexto = completada
      ? `Actividad completada en ${editingObra.estado}: ${actividad.descripcion}`
      : `Actividad desmarcada en ${editingObra.estado}: ${actividad.descripcion}`;

    const nuevoLogEntry = {
      id: `log-${Date.now()}`,
      fecha: getCurrentTimeGMT3(),
      tipo: accion,
      usuario: usuarioActual.nombre,
      descripcion: descripcionTexto,
      estadoAnterior: completada ? 'No completada' : 'Completada',
      estadoNuevo: completada ? 'Completada' : 'No completada',
      detalles: { etapa: editingObra.estado, actividad: actividad.descripcion }
    };

    // Update formObra with new activity state + log entry
    const updatedFormObra: any = {
      ...formObra,
      actividadesPorEtapa: (formObra.actividadesPorEtapa || []).map((a: any) =>
        a.id === actividadId
          ? {
              ...a,
              completada,
              fechaCompletada: completada ? getCurrentTimeGMT3() : undefined,
              completadaPor: completada ? usuarioActual.nombre : undefined
            }
          : a
      ),
      historialLog: [...(formObra.historialLog || []), nuevoLogEntry]
    };

    setFormObra(updatedFormObra);

    // Immediately save with the updated data (don't wait for state)
    setTimeout(() => {
      const obraToSave: Obra = {
        ...editingObra,
        ...updatedFormObra,
        fechaUltimaActualizacion: new Date().toISOString().split('T')[0]
      };
      onSaveObra(obraToSave);
    }, 0);
  };

  const generateNextCodigoObra = (currentCodigo: string): string => {
    const match = currentCodigo.match(/^([A-Z])-(\d+)$/);
    if (!match) return currentCodigo;

    const [, letra, numero] = match;
    const nextNumber = parseInt(numero, 10) + 1;
    return `${letra}-${nextNumber}`;
  };

  // Fast lookup: create map from works that have each equipo
  // Instead of: for each equipo, search all obras (O(n²))
  // Do: for each obra, mark all its equipos (O(n))
  const equipoToObraMap = useMemo(() => {
    const map = new Map<string, Obra>();
    obras.forEach((obra) => {
      (obra.equipoIds || []).forEach((equipoId) => {
        map.set(equipoId, obra);
      });
    });
    return map;
  }, [obras]);

  const handleAddEquipo = (equipoId: string) => {
    if (!editingObra || !onUpdateObraEquipos || !usuarioActual) return;
    if (equipoIdsActuales.includes(equipoId)) return;

    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipo) return;

    const obraActual = equipoToObraMap.get(equipoId);

    if (obraActual) {
      setConfirmDialogState({ show: true, equipoId, obraActual });
    } else {
      const logEntry = {
        id: `log-${Date.now()}`,
        fecha: getCurrentTimeGMT3(),
        tipo: 'equipo_agregado',
        usuario: usuarioActual.nombre,
        descripcion: `Equipo agregado: ${equipo.nombre}`,
        detalles: { equipoId: equipo.id, equipoNombre: equipo.nombre }
      };

      setFormObra((prev: any) => ({
        ...prev,
        historialLog: [...(prev.historialLog || []), logEntry]
      }));

      startTransition(() => {
        onUpdateObraEquipos(editingObra.id, [...equipoIdsActuales, equipoId]);
        setEquipoSearchQuery('');
      });
    }
  };

  const handleConfirmMove = () => {
    if (!editingObra || !onUpdateObraEquipos || !confirmDialogState.equipoId || !confirmDialogState.obraActual || !usuarioActual) return;

    const equipoId = confirmDialogState.equipoId;
    const obraActual = confirmDialogState.obraActual;
    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipo) return;

    const logEntries = [
      {
        id: `log-${Date.now()}`,
        fecha: getCurrentTimeGMT3(),
        tipo: 'equipo_removido',
        usuario: usuarioActual.nombre,
        descripcion: `Equipo removido: ${equipo.nombre}`,
        detalles: { equipoId: equipo.id, equipoNombre: equipo.nombre }
      },
      {
        id: `log-${Date.now() + 1}`,
        fecha: getCurrentTimeGMT3(),
        tipo: 'equipo_agregado',
        usuario: usuarioActual.nombre,
        descripcion: `Equipo agregado: ${equipo.nombre}`,
        detalles: { equipoId: equipo.id, equipoNombre: equipo.nombre }
      }
    ];

    setFormObra((prev: any) => ({
      ...prev,
      historialLog: [...(prev.historialLog || []), ...logEntries]
    }));

    startTransition(() => {
      onUpdateObraEquipos(obraActual.id, (obraActual.equipoIds || []).filter((id) => id !== equipoId));
    });

    startTransition(() => {
      onUpdateObraEquipos(editingObra.id, [...equipoIdsActuales, equipoId]);
      setEquipoSearchQuery('');
    });

    setConfirmDialogState({ show: false });
  };

  const handleCancelMove = () => {
    setConfirmDialogState({ show: false });
  };

  const handleRemoveEquipo = (equipoId: string) => {
    if (!editingObra || !onUpdateObraEquipos || !usuarioActual) return;

    const equipo = equipos.find((e) => e.id === equipoId);
    if (!equipo) return;

    const logEntry = {
      id: `log-${Date.now()}`,
      fecha: getCurrentTimeGMT3(),
      tipo: 'equipo_removido',
      usuario: usuarioActual.nombre,
      descripcion: `Equipo removido: ${equipo.nombre}`,
      detalles: { equipoId: equipo.id, equipoNombre: equipo.nombre }
    };

    setFormObra((prev: any) => ({
      ...prev,
      historialLog: [...(prev.historialLog || []), logEntry]
    }));

    onUpdateObraEquipos(editingObra.id, equipoIdsActuales.filter((id) => id !== equipoId));
  };

  const tipoIcono: Record<string, string> = {
    'Ascensor': '🛗',
    'Escalera': '🪜',
    'Rampa': '♿'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObra.nombre) return;

    const hoyISO = new Date().toISOString().split('T')[0];

    const obraFinal: Obra = {
      // Preserve every field not covered by this form
      ...(editingObra || {}),
      id: editingObra ? editingObra.id : `obr-${Date.now()}`,
      codigo: formObra.codigo || 'A-5000',
      nombre: formObra.nombre || '',
      region: (formObra.region as 'Argentina' | 'Uruguay') || 'Argentina',
      clienteId: formObra.clienteId || clientes[0]?.id || 'cli-1',
      montoUSD: Number(formObra.montoUSD) || 500000,
      estado: (formObra.estado as FunnelStage) || 'Solicitud',
      fechaIngreso: editingObra ? editingObra.fechaIngreso : hoyISO,
      fechaUltimaActualizacion: editingObra ? editingObra.fechaUltimaActualizacion : hoyISO,
      observaciones: formObra.observaciones || '',
      usuarioAsignado: formObra.usuarioAsignado || usuarioActual?.id || 'user-1',
      hardwareSpecs: formObra.hardwareSpecs || {
        velocidadMS: 1.75,
        paradas: 10,
        tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
        capacidadKg: 1000,
        modelo: 'Fujitec ZEXIA'
      },
      actividadesPorEtapa: formObra.actividadesPorEtapa || editingObra?.actividadesPorEtapa || [],
      historialLog: formObra.historialLog || editingObra?.historialLog || []
    };

    setToast({ message: '💾 Guardando...', type: 'loading' });

    try {
      onSaveObra(obraFinal);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!editingObra) {
        onUpdateProximoCodigo(generateNextCodigoObra(proximoCodigoObra));
      }

      setToast({ message: '✅ Obra guardada correctamente', type: 'success' });
      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1500);
    } catch (error) {
      setToast({ message: '❌ Error al guardar', type: 'error' });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => toast.type !== 'loading' && setToast(null)}
          duration={toast.type === 'loading' ? 0 : 3000}
        />
      )}
      <div className="fixed inset-0 bg-[#2D3436]/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-[#E0E0E0] dark:border-slate-700 shadow-2xl max-w-2xl w-full flex flex-col max-h-[calc(100vh-32px)] my-auto">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-6 border-b border-[#F1F3F5] dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2D3436] dark:text-slate-100">
                {editingObra ? `Editar Obra: ${editingObra.codigo}` : 'Registrar Nueva Obra Comercial'}
              </h3>
              <p className="text-xs text-[#B2BEC3] dark:text-slate-400 font-semibold mt-1 uppercase tracking-wide">
                {editingObra ? 'Actualizar datos de la obra existente' : 'Crear nueva oportunidad comercial'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-[#B2BEC3] dark:text-slate-400 hover:text-[#2D3436] dark:hover:text-slate-200 hover:bg-[#F1F3F5] dark:hover:bg-slate-700 rounded-lg transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Obra Basic Info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Código de Obra *</label>
              <input
                type="text"
                required
                value={formObra.codigo}
                onChange={(e) => setFormObra({...formObra, codigo: e.target.value})}
                className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl font-mono font-black text-[#C8102E]"
                id="input-modal-codigo"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-[#2D3436] mb-1">Nombre del Proyecto / Obra *</label>
              <input
                type="text"
                required
                placeholder="Ej: TORRE ALVEAR MADERO"
                value={formObra.nombre}
                onChange={(e) => setFormObra({...formObra, nombre: e.target.value})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
                id="input-modal-nombre"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Región / País</label>
              <select
                value={formObra.region}
                onChange={(e) => setFormObra({...formObra, region: e.target.value as any})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
              >
                <option value="Argentina">🇦🇷 Argentina</option>
                <option value="Uruguay">🇺🇾 Uruguay</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">
                Cliente Asignado {editingObra && editingObra.clienteId !== formObra.clienteId && '⚠️'}
              </label>
              <select
                value={formObra.clienteId}
                onChange={(e) => setFormObra({...formObra, clienteId: e.target.value})}
                className={`w-full p-2.5 bg-white border rounded-xl font-bold text-[#2D3436] ${
                  editingObra && editingObra.clienteId !== formObra.clienteId
                    ? 'border-amber-400 ring-1 ring-amber-200'
                    : 'border-[#E0E0E0]'
                }`}
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razonSocial}</option>
                ))}
              </select>
              {editingObra && editingObra.clienteId !== formObra.clienteId && (
                <p className="text-xs text-amber-600 font-semibold mt-1">
                  Se reasignará de {clientes.find(c => c.id === editingObra.clienteId)?.razonSocial || 'cliente anterior'} a {clientes.find(c => c.id === formObra.clienteId)?.razonSocial}
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Estado del Funnel</label>
              <select
                value={formObra.estado}
                onChange={(e) => setFormObra({...formObra, estado: e.target.value as any})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
              >
                <option value="Solicitud">Solicitud</option>
                <option value="En estudio de proyecto">En estudio de proyecto</option>
                <option value="Estimado">Estimado</option>
                <option value="Cotización">Cotización</option>
                <option value="Contratadas">Contratadas</option>
                <option value="Finalizadas">Finalizadas</option>
                <option value="Rechazadas">Rechazadas</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Usuario Asignado *</label>
              <select
                required
                value={formObra.usuarioAsignado || usuarioActual?.id || ''}
                onChange={(e) => setFormObra({...formObra, usuarioAsignado: e.target.value})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
              >
                {usuarios.filter(u => u.activo).map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D3436] mb-1">Monto Presupuesto (USD) *</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={formObra.montoUSD}
              onChange={(e) => {
                const val = e.target.value.replace(/^0+/, '') || '0';
                setFormObra({...formObra, montoUSD: Math.max(0, parseInt(val) || 0)});
              }}
              className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
            />
          </div>

          {/* Equipos Asignados a la Obra */}
          <div className="p-4 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0] space-y-3">
            <label className="block font-extrabold text-[#2D3436] uppercase tracking-wide text-[11px]">
              Equipos Asignados ({equipoIdsActuales.length})
            </label>

            {!editingObra ? (
              <p className="text-[11px] text-[#B2BEC3] italic">Guardá la obra primero para poder asignarle equipos.</p>
            ) : (
            <>
            {/* Currently assigned equipos */}
            {equipoIdsActuales.length === 0 ? (
              <p className="text-[11px] text-[#B2BEC3] italic">Sin equipos asignados todavía. Buscá y agregá abajo.</p>
            ) : (
              <div className="space-y-1.5">
                {equipoIdsActuales.map((equipoId) => {
                  const eq = equipos.find((e) => e.id === equipoId);
                  if (!eq) return null;
                  return (
                    <div key={equipoId} className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-[#E0E0E0]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{tipoIcono[eq.tipo] || '⚙️'}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-[#2D3436] truncate">{eq.nombre}</p>
                          <p className="text-[10px] text-[#636E72] truncate">{eq.codigoUnico} · {eq.modelo}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipo(equipoId)}
                        className="p-1.5 text-[#636E72] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Quitar equipo de la obra"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Search & Dropdown Select */}
            <div className="pt-2 border-t border-[#E0E0E0] space-y-2">
              <input
                type="text"
                placeholder="Buscar equipo por nombre, modelo o código..."
                value={equipoSearchQuery}
                onChange={(e) => setEquipoSearchQuery(e.target.value)}
                className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg font-medium text-[#2D3436]"
              />
              <div className="max-h-48 overflow-y-auto border border-[#E0E0E0] rounded-lg bg-white divide-y">
                {equiposDisponibles.length === 0 ? (
                  <p className="text-[11px] text-[#B2BEC3] italic p-2">No hay equipos disponibles</p>
                ) : (
                  equiposDisponibles.map((eq) => {
                      const obraDeEquipo = equipoToObraMap.get(eq.id);
                      return (
                      <button
                        key={eq.id}
                        type="button"
                        onClick={() => handleAddEquipo(eq.id)}
                        className="w-full flex items-center justify-between gap-2 p-2 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-base shrink-0">{tipoIcono[eq.tipo] || '⚙️'}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#2D3436] truncate text-xs">{eq.nombre}</p>
                            <p className="text-[9px] text-[#636E72] truncate">
                              {eq.codigoUnico} · {eq.modelo}
                              {obraDeEquipo && (
                                <span className="ml-1.5 text-amber-700 font-bold">⚠️ En {obraDeEquipo.codigo}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-[#C8102E] shrink-0 px-2 py-1 bg-red-50 rounded">
                          {obraDeEquipo ? 'Mover' : '+ Agregar'}
                        </span>
                      </button>
                      );
                    })
                )}
              </div>
            </div>
            </>
            )}
          </div>

          {/* Actividades por Etapa (checkboxes) */}
          {editingObra && editingObra.actividadesPorEtapa && editingObra.actividadesPorEtapa.length > 0 && (
            <div className="p-4 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0]">
              <label className="block font-extrabold text-[#2D3436] mb-2 uppercase tracking-wide text-[11px]">
                Actividades por Etapa
              </label>
              <ComponenteActividades
                actividadesPorEtapa={editingObra.actividadesPorEtapa}
                etapaActual={editingObra.estado}
                onToggleActividad={(actividadId, completada) => {
                  handleToggleActividadLocal(actividadId, completada);
                }}
                expanded={true}
              />
            </div>
          )}

          {/* Notas & Observaciones - Unified */}
          <div className="space-y-3">
            <div className="p-4 bg-[#F1F3F5] dark:bg-slate-700/50 rounded-xl border border-[#E0E0E0] dark:border-slate-600 space-y-3">
              <label className="block font-extrabold text-[#2D3436] dark:text-slate-100 uppercase tracking-wide text-[11px]">
                Notas & Observaciones Comerciales
              </label>

              {/* Nueva Nota */}
              <div className="space-y-2">
                <textarea
                  rows={3}
                  placeholder="Escribe una nota sobre la oportunidad, observaciones técnicas, o estado actual..."
                  value={notaContenido}
                  onChange={(e) => setNotaContenido(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-[#E0E0E0] dark:border-slate-600 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C8102E] dark:text-slate-100"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notaReseteaDias"
                    checked={notaReseteaDias}
                    onChange={(e) => setNotaReseteaDias(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="notaReseteaDias" className="text-xs font-medium text-[#636E72] dark:text-slate-400 cursor-pointer">
                    Reiniciar contador de días sin acción
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!notaContenido.trim() || !editingObra) return;
                    // Agregar nota al historialLog
                    const nuevoLog = {
                      id: `log-${Date.now()}`,
                      tipo: 'nota_agregada',
                      descripcion: `Nota: "${notaContenido}"`,
                      fecha: getCurrentTimeGMT3(),
                      usuario: usuarioActual?.nombre || 'Sin usuario',
                      detalles: { reseteaDias: notaReseteaDias }
                    };

                    const updatedFormObra: any = {
                      ...formObra,
                      historialLog: [...(formObra.historialLog || []), nuevoLog]
                    };

                    // If checkbox is checked, reset the counter by updating fechaUltimaActualizacion
                    if (notaReseteaDias) {
                      const hoyISO = new Date().toISOString().split('T')[0];
                      updatedFormObra.fechaUltimaActualizacion = hoyISO;
                    }

                    setFormObra(updatedFormObra);
                    setNotaContenido('');
                    setNotaReseteaDias(false);
                    setToast({ message: '✓ Nota agregada al log', type: 'success' });
                    setTimeout(() => setToast(null), 3000);

                    // If reseteaDias is true, also save to Supabase immediately
                    if (notaReseteaDias) {
                      setTimeout(() => {
                        const obraToSave: Obra = {
                          ...editingObra,
                          ...updatedFormObra
                        };
                        onSaveObra(obraToSave);
                      }, 0);
                    }
                  }}
                  disabled={!notaContenido.trim() || !editingObra}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: notaContenido.trim() && editingObra ? '#C8102E' : '#B2BEC3' }}
                >
                  <Plus size={16} />
                  Agregar Nota al Log
                </button>
              </div>

            </div>
          </div>

          {/* Log de Auditoría de la Obra */}
          {formObra && formObra.historialLog && formObra.historialLog.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-blue-600" />
                <label className="block font-extrabold text-[#2D3436] uppercase tracking-wide text-[11px]">
                  Historial de Acciones ({formObra.historialLog.length})
                </label>
              </div>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {[...formObra.historialLog].reverse().map((log) => (
                  <div key={log.id} className="bg-white p-2.5 rounded-lg border border-blue-100 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#2D3436] leading-snug">
                          {log.descripcion}
                        </p>
                        <p className="text-[#636E72] text-[10px] mt-0.5">
                          {log.fecha} · {log.usuario}
                        </p>
                      </div>
                      <span className="text-[9px] text-[#B2BEC3] font-semibold uppercase shrink-0 bg-[#F1F3F5] px-1.5 py-0.5 rounded">
                        {log.tipo.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </form>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 border-t border-[#F1F3F5] bg-white rounded-b-3xl flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg font-extrabold text-white shadow-md hover:bg-[#A60D26] transition-all text-sm"
            style={{ backgroundColor: '#C8102E' }}
            id="btn-save-obra-modal"
          >
            Guardar Obra
          </button>
        </div>
      </div>

      {/* Confirmation dialog for moving equipo between obras */}
      {confirmDialogState.show && confirmDialogState.obraActual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-[#2D3436] mb-2">
              Mover Equipo
            </h3>
            <p className="text-sm text-[#636E72] mb-6">
              Este equipo ya está asignado a <strong>{confirmDialogState.obraActual.codigo} - {confirmDialogState.obraActual.nombre}</strong>.
              <br /><br />
              Un equipo solo puede estar en una obra a la vez. ¿Confirmás moverlo a esta obra?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelMove}
                className="px-4 py-2 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-semibold text-[#2D3436] text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                className="px-4 py-2 rounded-lg font-bold text-white text-sm transition-colors"
                style={{ backgroundColor: '#C8102E' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A60D26')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C8102E')}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
