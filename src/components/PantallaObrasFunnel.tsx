import React, { useState, useEffect } from 'react';
import {
  List,
  Kanban,
  Clock,
  Plus,
  Search,
  AlertTriangle,
  Building2,
  FileText,
  Edit3,
  ChevronRight,
  MapPin,
  ArrowRight,
  Filter,
  CheckCircle,
  XCircle,
  MoreVertical,
  SlidersHorizontal,
  Calendar,
  Zap,
  Minimize2,
  TrendingUp,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Obra, FunnelStage, Region, EquipmentType, Equipo } from '../types';
import { formatUSD, formatDateES, getDiasSinActualizar, tieneAlertaTemporal } from '../utils/semaforo';
import { contarEquiposPorTipo, obtenerModeloPrincipal } from '../utils/equipoUtils';
import { exportObrasToExcel } from '../utils/excelExport';
import { SoftDeleteConfirm } from './SoftDeleteConfirm';
import { ModalAdvertencia } from './ModalAdvertencia';
import { ComponenteActividades } from './ComponenteActividades';
import { NotaTooltip } from './NotaTooltip';
import { useAuth } from '../context/AuthContext';

interface PantallaObrasFunnelProps {
  obras: Obra[];
  equipos: Equipo[];
  clientes?: any[]; // Para mostrar nombres de clientes en tabla
  selectedRegion: Region;
  selectedEquipmentType: EquipmentType;
  searchQuery: string;
  onEditObra: (obra: Obra) => void;
  onGenerarOferta: (obra: Obra) => void;
  onUpdateObraState: (obraId: string, nuevoEstado: FunnelStage) => void;
  onOpenNewObraModal: () => void;
  selectedYear?: number;
  onOpenViewActividades?: (obra: Obra) => void;
  showOnlyAlerts?: boolean;
  onCloseAlertFilter?: () => void;
}

export const PantallaObrasFunnel: React.FC<PantallaObrasFunnelProps> = ({
  obras,
  equipos,
  clientes = [],
  selectedRegion,
  selectedEquipmentType,
  searchQuery,
  onEditObra,
  onGenerarOferta,
  onUpdateObraState,
  onOpenNewObraModal,
  selectedYear = new Date().getFullYear(),
  onOpenViewActividades,
  showOnlyAlerts = false,
  onCloseAlertFilter
}) => {
  const { isSuperuser, usuarios } = useAuth();

  // Toggle between Sub-view 1: Vista Lista Tradicional, Sub-view 2: Vista Funnel Kanban
  const [subView, setSubView] = useState<'lista' | 'kanban'>('kanban');

  // Filter by Stage local filter
  const [stageFilter, setStageFilter] = useState<string>('Todas');
  const [showFinalizadosRechazados, setShowFinalizadosRechazados] = useState<boolean>(false);

  // Table sorting state
  const [sortColumn, setSortColumn] = useState<'codigo' | 'nombre' | 'cliente' | 'estado' | 'monto' | null>('codigo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleColumnSort = (column: 'codigo' | 'nombre' | 'cliente' | 'estado' | 'monto') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: 'codigo' | 'nombre' | 'cliente' | 'estado' | 'monto' }) => {
    if (sortColumn !== column) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Card view mode (persisted in localStorage)
  const [cardViewMode, setCardViewModeState] = useState<'complete' | 'summarized'>(() => {
    const saved = localStorage.getItem('kanban-view-mode');
    return (saved as 'complete' | 'summarized') || 'complete';
  });

  const setCardViewMode = (mode: 'complete' | 'summarized') => {
    localStorage.setItem('kanban-view-mode', mode);
    setCardViewModeState(mode);
  };

  // Soft delete state
  const [obraToDelete, setObraToDelete] = useState<Obra | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Drag-and-drop + Warning modal state
  const [draggedObra, setDraggedObra] = useState<Obra | null>(null);
  const [pendingStageChange, setPendingStageChange] = useState<{ obra: Obra; nuevoEstado: FunnelStage } | null>(null);
  const [isAdvertenciaOpen, setIsAdvertenciaOpen] = useState(false);

  // Tooltip state for notas
  const [notaTooltip, setNotaTooltip] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    nota: { texto: string; fecha: string; autor: string } | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    nota: null,
  });
  const [hoverTimeoutId, setHoverTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Build usuario map for quick lookup
  const usuarioMap = new Map<string, string>();
  usuarios.forEach(u => usuarioMap.set(u.id, u.nombre));

  // Filter obras - simple inline
  let filteredObras = obras.filter((obra) => {
    const matchRegion = selectedRegion === 'Todas' || obra.region === selectedRegion;
    const matchEquipment = selectedEquipmentType === 'Todos';
    const matchStage = stageFilter === 'Todas' || obra.estado === stageFilter;
    const obraYear = parseInt(obra.fechaIngreso.split('-')[0], 10);
    const matchYear = obraYear === selectedYear;
    const q = searchQuery.toLowerCase();
    const usuarioNombre = obra.usuarioAsignado ? (usuarioMap.get(obra.usuarioAsignado) || 'Sin asignar') : 'Sin asignar';
    const matchQuery = !q ||
      obra.codigo.toLowerCase().includes(q) ||
      obra.nombre.toLowerCase().includes(q) ||
      usuarioNombre.toLowerCase().includes(q) ||
      (obra.hardwareSpecs?.modelo || '').toLowerCase().includes(q);
    const matchAlert = !showOnlyAlerts || tieneAlertaTemporal(obra);
    const matchFinalizadas = showFinalizadosRechazados || (obra.estado !== 'Finalizadas' && obra.estado !== 'Rechazadas');

    return matchRegion && matchEquipment && matchStage && matchQuery && matchYear && matchAlert && matchFinalizadas;
  });

  // Sort filtered obras by selected column
  filteredObras = [...filteredObras].sort((a, b) => {
    let compareValue = 0;

    if (sortColumn === 'codigo') {
      compareValue = a.codigo.localeCompare(b.codigo);
    } else if (sortColumn === 'nombre') {
      compareValue = a.nombre.localeCompare(b.nombre);
    } else if (sortColumn === 'cliente') {
      const clienteA = a.clienteId || '';
      const clienteB = b.clienteId || '';
      compareValue = clienteA.localeCompare(clienteB);
    } else if (sortColumn === 'estado') {
      compareValue = a.estado.localeCompare(b.estado);
    } else if (sortColumn === 'monto') {
      compareValue = a.montoUSD - b.montoUSD;
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  console.log('PantallaObrasFunnel - searchQuery:', searchQuery, 'filteredObras:', filteredObras.length, 'totalObras:', obras.length);

  const allStages: FunnelStage[] = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas', 'Finalizadas', 'Rechazadas'];
  const stages = showFinalizadosRechazados
    ? allStages
    : allStages.filter(s => s !== 'Finalizadas' && s !== 'Rechazadas');

  // Pipeline: exclude Finalizadas and Rechazadas from total
  const pipelineObras = filteredObras.filter(o => o.estado !== 'Finalizadas' && o.estado !== 'Rechazadas');
  const totalPipelineUSD = pipelineObras.reduce((s, o) => s + o.montoUSD, 0);
  const totalPipelineCount = pipelineObras.length;

  const handleStageChangeRequest = (obra: Obra, nuevoEstado: FunnelStage) => {
    if (nuevoEstado === obra.estado) return;

    const actividadesEtapa = obra.actividadesPorEtapa?.filter(a => a.etapa === obra.estado) || [];
    const tieneIncompletas = actividadesEtapa.some(a => !a.completada);

    if (tieneIncompletas) {
      setPendingStageChange({ obra, nuevoEstado });
      setIsAdvertenciaOpen(true);
    } else {
      onUpdateObraState(obra.id, nuevoEstado);
    }
  };

  const handleConfirmStageChange = () => {
    if (pendingStageChange) {
      onUpdateObraState(pendingStageChange.obra.id, pendingStageChange.nuevoEstado);
      setPendingStageChange(null);
      setIsAdvertenciaOpen(false);
    }
  };

  const handleObraMouseEnter = (obra: Obra, e: React.MouseEvent) => {
    console.log('Mouse enter en obra:', obra.codigo, 'Notas:', obra.notas?.length || 0);
    if (!obra.notas || obra.notas.length === 0) {
      console.log('Sin notas, retornando');
      return;
    }

    const timeoutId = setTimeout(() => {
      const lastNota = obra.notas![obra.notas!.length - 1];
      console.log('Mostrando nota:', lastNota);

      setNotaTooltip({
        visible: true,
        position: { x: e.clientX, y: e.clientY },
        nota: {
          texto: lastNota.contenido,
          fecha: lastNota.fecha,
          autor: lastNota.autor,
        },
      });
    }, 1000);

    setHoverTimeoutId(timeoutId);
  };

  const handleObraMouseMove = (e: React.MouseEvent) => {
    setNotaTooltip((prev: any) => ({
      ...prev,
      position: { x: e.clientX, y: e.clientY },
      visible: prev.visible,
    }));
  };

  const handleObraMouseLeave = () => {
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    setNotaTooltip({
      visible: false,
      position: { x: 0, y: 0 },
      nota: null,
    });
  };

  return (
    <div className="p-8 space-y-8 bg-[#F1F3F5] min-h-screen">
      {/* Top Controls Bar: Sub-views Switch + Stage Filter */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub-view Switcher Pills */}
        <div className="flex bg-[#F1F3F5] p-1.5 rounded-xl border border-[#E0E0E0]">
          <button
            onClick={() => setSubView('kanban')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subView === 'kanban'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
            id="btn-subview-kanban"
          >
            <Kanban size={15} className={subView === 'kanban' ? 'text-[#C8102E]' : ''} />
            <span>Vista Funnel Kanban</span>
          </button>

          <button
            onClick={() => setSubView('lista')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subView === 'lista'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
            id="btn-subview-lista"
          >
            <List size={15} className={subView === 'lista' ? 'text-[#C8102E]' : ''} />
            <span>Vista Lista Tradicional</span>
          </button>

        </div>

        {/* Local Filter & Totals */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#636E72] font-bold">Etapa:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-white border border-[#E0E0E0] font-bold text-[#2D3436] py-1.5 px-3 rounded-xl focus:outline-none shadow-2xs"
              id="select-stage-filter"
            >
              <option value="Todas">Todas las etapas ({filteredObras.length})</option>
              {stages.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowFinalizadosRechazados(!showFinalizadosRechazados)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showFinalizadosRechazados
                ? 'bg-emerald-500 text-white'
                : 'bg-[#F1F3F5] text-[#636E72] hover:bg-[#E0E0E0]'
            }`}
            title={showFinalizadosRechazados ? 'Ocultar finalizadas y rechazadas' : 'Mostrar finalizadas y rechazadas'}
            id="btn-toggle-finalizadas"
          >
            {showFinalizadosRechazados ? '✓ Mostrar finalizadas y rechazadas' : 'Mostrar finalizadas y rechazadas'}
          </button>

          {subView === 'kanban' && (
            <button
              onClick={() => setCardViewMode(cardViewMode === 'complete' ? 'summarized' : 'complete')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cardViewMode === 'summarized'
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#F1F3F5] text-[#636E72] hover:bg-[#E0E0E0]'
              }`}
              id="btn-toggle-card-view"
              title={cardViewMode === 'complete' ? 'Cambiar a vista resumida' : 'Cambiar a vista completa'}
            >
              {cardViewMode === 'summarized' ? '◀ Vista Resumida' : 'Vista Completa'}
            </button>
          )}

          <button
            onClick={() => exportObrasToExcel(pipelineObras, `Obras_${new Date().toISOString().split('T')[0]}.xlsx`)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-2xs"
            title="Descargar obras en Excel"
          >
            <Download size={14} />
            Descargar Excel
          </button>

          <div className="hidden sm:block font-extrabold text-[#2D3436] bg-white px-3.5 py-2 rounded-xl border border-[#E0E0E0] shadow-2xs">
            Total Pipeline: {formatUSD(totalPipelineUSD)} ({totalPipelineCount} obras)
          </div>
        </div>
      </div>

      {/* Alert Filter Active Badge */}
      {showOnlyAlerts && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-sm font-bold text-amber-900">
              Mostrando {filteredObras.length} obra(s) que requieren atención (sin actualizar por más de 7 días)
            </span>
          </div>
          <button
            onClick={onCloseAlertFilter}
            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-all"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {/* SUB-VIEW 1: VISTA FUNNEL KANBAN */}
      {subView === 'kanban' && (
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x">
          {stages.map((stage) => {
            const stageObras = filteredObras.filter((o) => o.estado === stage);
            const totalStageUSD = stageObras.reduce((s, o) => s + o.montoUSD, 0);

            let headerBg = 'bg-white/80 dark:bg-slate-700/80 border-[#E0E0E0] dark:border-slate-600 text-[#2D3436] dark:text-slate-100';
            let dotColor = 'bg-[#B2BEC3] dark:bg-slate-500';
            if (stage === 'Solicitud') { headerBg = 'bg-slate-50/80 dark:bg-slate-700/80 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100'; dotColor = 'bg-slate-500'; }
            if (stage === 'En estudio de proyecto') { headerBg = 'bg-cyan-50/80 dark:bg-cyan-900/40 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-300'; dotColor = 'bg-cyan-500'; }
            if (stage === 'Estimado') { headerBg = 'bg-indigo-50/80 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-300'; dotColor = 'bg-indigo-500'; }
            if (stage === 'Cotización') { headerBg = 'bg-amber-50/80 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300'; dotColor = 'bg-amber-500'; }
            if (stage === 'Contratadas') { headerBg = 'bg-emerald-50/80 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'; dotColor = 'bg-emerald-500'; }
            if (stage === 'Finalizadas') { headerBg = 'bg-green-50/80 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-900 dark:text-green-300'; dotColor = 'bg-green-600'; }
            if (stage === 'Rechazadas') { headerBg = 'bg-red-50/80 dark:bg-red-900/40 border-red-200 dark:border-red-800 text-red-900 dark:text-red-300'; dotColor = 'bg-red-500'; }

            return (
              <div key={stage} className="flex flex-col rounded-2xl bg-white/40 backdrop-blur-md border border-[#E0E0E0] p-3.5 min-w-[270px] w-[270px] shrink-0 h-[calc(100vh-230px)] shadow-2xs snap-start">
                {/* Stage Header */}
                <div className={`p-3.5 rounded-xl border ${headerBg} mb-3 shadow-2xs backdrop-blur-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                      {stage}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white border border-[#E0E0E0] text-[#2D3436]">
                      {stageObras.length}
                    </span>
                  </div>
                  <div className="text-xs font-black text-[#2D3436] mt-1.5">
                    {formatUSD(totalStageUSD)}
                  </div>
                </div>

                {/* Stage Obra Cards Column */}
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden space-y-3 pr-1 transition-all rounded-lg"
                  style={{
                    backgroundColor: draggedObra ? 'rgba(200, 16, 46, 0.05)' : 'transparent'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedObra) {
                      handleStageChangeRequest(draggedObra, stage);
                      setDraggedObra(null);
                    }
                  }}
                  onMouseMove={(e: any) => {
                    const target = e.target as HTMLElement;
                    const obraElement = target.closest('[data-obra-id]');
                    if (obraElement) {
                      handleObraMouseMove(e);
                    }
                  }}
                  onMouseLeave={handleObraMouseLeave}
                >
                  {stageObras.length === 0 ? (
                    <div className="p-5 text-center text-xs text-[#B2BEC3] italic border border-dashed border-[#E0E0E0] rounded-xl bg-white/30">
                      Sin obras en {stage.toLowerCase()}
                    </div>
                  ) : (
                    stageObras.map((obra) => {
                      const alerta = tieneAlertaTemporal(obra);
                      const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);

                      return (
                        <div
                          key={obra.id}
                          data-obra-id={obra.id}
                          draggable
                          onDragStart={() => setDraggedObra(obra)}
                          onDragEnd={() => setDraggedObra(null)}
                          onClick={() => onEditObra(obra)}
                          onMouseEnter={(e: any) => {
                            console.log('KANBAN - Mouse enter:', obra.codigo);
                            handleObraMouseEnter(obra, e);
                          }}
                          className={`bg-white/90 backdrop-blur-md rounded-xl border shadow-2xs transition-all hover:shadow-md relative group cursor-pointer active:cursor-grabbing w-full min-w-0 max-w-full overflow-hidden box-border ${
                            cardViewMode === 'summarized' ? 'p-2.5 space-y-1' : 'p-4 space-y-2.5'
                          } ${
                            alerta ? 'border-amber-400 ring-2 ring-amber-200/50' : 'border-[#E0E0E0] hover:border-[#B2BEC3]'
                          } ${draggedObra?.id === obra.id ? 'opacity-50' : ''}`}
                        >
                          {/* Alert Badge for >7d Stagnant */}
                          {alerta && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                              <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                              <span>⚠️ {dias}d sin actualización</span>
                            </div>
                          )}

                          {/* Code & Region Badge */}
                          <div className="flex items-center justify-between gap-1.5 min-w-0">
                            <span className="text-xs font-black text-[#C8102E] tracking-wide font-mono truncate min-w-0">
                              {obra.codigo}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F3F5] text-[#2D3436] border border-[#E0E0E0] shrink-0">
                              {obra.region === 'Argentina' ? 'AR' : 'UY'}
                            </span>
                          </div>

                          {/* Obra Name */}
                          <div>
                            <h4 className="text-xs font-extrabold text-[#2D3436] leading-snug line-clamp-2">
                              {obra.nombre}
                            </h4>
                          </div>

                          {/* Assigned User - hidden in summarized mode */}
                          {cardViewMode === 'complete' && (
                            <div className="text-xs text-[#636E72] font-medium truncate">
                              👤 <span className="font-bold text-[#2D3436]">{obra.usuarioAsignado ? (usuarioMap.get(obra.usuarioAsignado) || 'Sin asignar') : 'Sin asignar'}</span>
                            </div>
                          )}

                          {/* Equipment Counts by Type */}
                          {(() => {
                            const counts = contarEquiposPorTipo(obra, equipos);
                            const totalEquipos = counts.ascensores + counts.escaleras + counts.rampas;
                            return totalEquipos > 0 ? (
                              <div className="flex flex-wrap gap-2 text-[10px]">
                                {counts.ascensores > 0 && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold border border-blue-300 flex items-center gap-1">
                                    <Building2 size={12} /> {counts.ascensores} asc.
                                  </span>
                                )}
                                {counts.escaleras > 0 && (
                                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-semibold border border-purple-300 flex items-center gap-1">
                                    <Minimize2 size={12} /> {counts.escaleras} esc.
                                  </span>
                                )}
                                {counts.rampas > 0 && (
                                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-md font-semibold border border-green-300 flex items-center gap-1">
                                    <TrendingUp size={12} /> {counts.rampas} ram.
                                  </span>
                                )}
                                {counts.montacargas > 0 && (
                                  <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-md font-semibold border border-orange-300 flex items-center gap-1">
                                    <Zap size={12} /> {counts.montacargas} mont.
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] text-[#B2BEC3] italic">Sin equipos asignados</p>
                            );
                          })()}

                          {/* Price & Date - hidden in summarized mode */}
                          {cardViewMode === 'complete' && (
                            <div className="flex items-center justify-between gap-1.5 min-w-0 border-t border-[#F1F3F5] pt-2 text-xs">
                              <span className="font-extrabold text-[#2D3436] truncate">
                                {formatUSD(obra.montoUSD)}
                              </span>
                              <span className="text-[10px] text-[#B2BEC3] font-medium shrink-0">
                                Act: {formatDateES(obra.fechaUltimaActualizacion)}
                              </span>
                            </div>
                          )}

                          {/* Change Stage Dropdown & Action Links - hidden in summarized mode */}
                          {cardViewMode === 'complete' && (
                          <div className="flex items-center gap-1.5 pt-1.5 text-xs border-t border-[#F1F3F5]" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={obra.estado}
                              onChange={(e) => handleStageChangeRequest(obra, e.target.value as FunnelStage)}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 min-w-0 bg-[#F1F3F5] border border-[#E0E0E0] text-[10px] font-bold text-[#2D3436] rounded-lg py-1 px-1.5 focus:outline-none"
                              id={`select-stage-obra-${obra.id}`}
                            >
                              {stages.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); onEditObra(obra); }}
                                className="p-1 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-colors"
                                title="Editar Obra & Specs"
                                id={`btn-edit-obra-${obra.id}`}
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onGenerarOferta(obra); }}
                                className="p-1 font-bold text-[#C8102E] hover:bg-red-50 rounded-lg flex items-center gap-0.5 transition-colors"
                                title="Generar Carta Oferta"
                                id={`btn-carta-oferta-obra-${obra.id}`}
                              >
                                <FileText size={13} />
                              </button>
                              {isSuperuser() && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setObraToDelete(obra);
                                    setIsDeleteConfirmOpen(true);
                                  }}
                                  className="p-1 text-[#636E72] hover:text-red-600 hover:bg-[#F1F3F5] rounded-lg transition-colors"
                                  title="Eliminar Obra"
                                  id={`btn-delete-obra-${obra.id}`}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-VIEW 2: VISTA DE LISTA TRADICIONAL */}
      {subView === 'lista' && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2D3436] border-collapse">
              <thead>
                <tr className="bg-[#2D3436] text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4 cursor-pointer hover:bg-[#3D4344] transition-colors" onClick={() => handleColumnSort('codigo')}>
                    <div className="inline-flex items-center gap-1.5">
                      Código <SortIcon column="codigo" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#3D4344] transition-colors" onClick={() => handleColumnSort('nombre')}>
                    <div className="inline-flex items-center gap-1.5">
                      Proyecto <SortIcon column="nombre" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#3D4344] transition-colors" onClick={() => handleColumnSort('cliente')}>
                    <div className="inline-flex items-center gap-1.5">
                      Cliente <SortIcon column="cliente" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-[#3D4344] transition-colors" onClick={() => handleColumnSort('estado')}>
                    <div className="inline-flex items-center gap-1.5">
                      Estado <SortIcon column="estado" />
                    </div>
                  </th>
                  <th className="p-4">Asignado</th>
                  <th className="p-4">Ingreso</th>
                  <th className="p-4">Última Act.</th>
                  <th className="p-4 cursor-pointer hover:bg-[#3D4344] transition-colors" onClick={() => handleColumnSort('monto')}>
                    <div className="inline-flex items-center gap-1.5">
                      Monto (USD) <SortIcon column="monto" />
                    </div>
                  </th>
                  <th className="p-4 text-center">Alerta</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0] font-medium">
                {filteredObras.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#B2BEC3] italic">
                      No se encontraron obras coincidentes con el filtro.
                    </td>
                  </tr>
                ) : (
                  filteredObras.map((obra) => {
                    const alerta = tieneAlertaTemporal(obra);
                    const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);

                    let stageBadge = 'bg-[#F1F3F5] text-[#2D3436]';
                    if (obra.estado === 'Solicitud') stageBadge = 'bg-slate-100 text-slate-800 border-slate-300';
                    if (obra.estado === 'En estudio de proyecto') stageBadge = 'bg-cyan-100 text-cyan-800 border-cyan-300';
                    if (obra.estado === 'Estimado') stageBadge = 'bg-indigo-100 text-indigo-800 border-indigo-300';
                    if (obra.estado === 'Cotización') stageBadge = 'bg-amber-100 text-amber-900 border-amber-300';
                    if (obra.estado === 'Contratadas') stageBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    if (obra.estado === 'Finalizadas') stageBadge = 'bg-green-100 text-green-800 border-green-300';
                    if (obra.estado === 'Rechazadas') stageBadge = 'bg-red-100 text-red-800 border-red-300';

                    return (
                      <tr
                        key={obra.id}
                        onClick={() => onEditObra(obra)}
                        onMouseEnter={(e: any) => {
                          console.log('LISTA - Mouse enter:', obra.codigo);
                          handleObraMouseEnter(obra, e);
                        }}
                        onMouseMove={handleObraMouseMove}
                        onMouseLeave={handleObraMouseLeave}
                        className={`hover:bg-white/90 transition-colors cursor-pointer ${
                          alerta ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="p-4 font-mono font-black text-[#C8102E] text-xs">
                          {obra.codigo}
                        </td>
                        <td className="p-4 font-bold text-[#2D3436] text-xs">
                          {obra.nombre}
                        </td>
                        <td className="p-4 text-xs text-[#636E72]">
                          <span className="font-medium text-[#2D3436]">
                            {clientes.find(c => c.id === obra.clienteId)?.razonSocial || 'Sin cliente'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${stageBadge}`}>
                            {obra.estado}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-[#636E72]">
                          {obra.usuarioAsignado ? (usuarioMap.get(obra.usuarioAsignado) || 'Sin asignar') : 'Sin asignar'}
                        </td>
                        <td className="p-4 text-xs text-[#636E72]">
                          {formatDateES(obra.fechaIngreso)}
                        </td>
                        <td className="p-4 text-xs text-[#636E72]">
                          {formatDateES(obra.fechaUltimaActualizacion)}
                        </td>
                        <td className="p-4 font-extrabold text-[#2D3436] text-xs">
                          {formatUSD(obra.montoUSD)}
                        </td>
                        <td className="p-4 text-center">
                          {alerta ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] inline-flex items-center gap-1">
                              <AlertTriangle size={12} className="text-amber-600" />
                              <span>⚠️ {dias}d</span>
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-[10px] font-bold">Al día</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onEditObra(obra)}
                            className="px-3 py-1.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] text-[#2D3436] font-bold text-xs transition-colors"
                            id={`btn-table-edit-${obra.id}`}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onGenerarOferta(obra)}
                            className="px-3 py-1.5 rounded-lg text-white font-bold text-xs transition-all shadow-xs hover:bg-[#A60D26]"
                            style={{ backgroundColor: '#C8102E' }}
                            id={`btn-table-oferta-${obra.id}`}
                          >
                            Carta Oferta
                          </button>
                          {isSuperuser() && (
                            <button
                              onClick={() => {
                                setObraToDelete(obra);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
                              id={`btn-table-delete-${obra.id}`}
                            >
                              Eliminar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: CRONOGRAMA LÍNEA DE TIEMPO */}
      {subView === 'cronograma' && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm space-y-4">
          <div className="border-b border-[#F1F3F5] pb-3">
            <h3 className="text-base font-bold text-[#2D3436] flex items-center gap-2">
              <Clock size={18} style={{ color: '#C8102E' }} />
              Cronograma Secuencial Comercial (Línea de Tiempo)
            </h3>
            <p className="text-xs text-[#636E72]">
              Ordenamiento cronológico de obras por fecha de ingreso y requerimiento de actualización comercial
            </p>
          </div>

          <div className="relative border-l-2 border-red-300 ml-4 pl-6 space-y-6 pt-2">
            {filteredObras
              .sort((a, b) => new Date(b.fechaIngreso).getTime() - new Date(a.fechaIngreso).getTime())
              .map((obra) => {
                const alerta = tieneAlertaTemporal(obra);
                const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);

                return (
                  <div key={obra.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div 
                      className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                        alerta ? 'border-amber-500 bg-amber-400' : 'border-[#C8102E]'
                      }`} 
                    />

                    <div className="p-5 rounded-2xl bg-white border border-[#E0E0E0] hover:border-[#B2BEC3] transition-all space-y-2.5 shadow-2xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#C8102E] text-sm">{obra.codigo}</span>
                          <span className="font-extrabold text-[#2D3436] text-sm">{obra.nombre}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-[#F1F3F5] text-[#2D3436] font-bold">
                            {obra.region}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-[#2D3436] text-sm">
                            {formatUSD(obra.montoUSD)}
                          </span>
                          <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#2D3436] text-white">
                            {obra.estado}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#636E72] flex flex-wrap justify-between items-center gap-2 border-t border-[#F1F3F5] pt-2">
                        <span>Ingresada: <strong>{formatDateES(obra.fechaIngreso)}</strong></span>
                        <span>Último contacto: <strong>{formatDateES(obra.fechaUltimaActualizacion)}</strong> ({dias} días)</span>
                        <span>Equipos: <strong>{obra.cantidadEquipos}x {obra.hardwareSpecs.modelo}</strong></span>
                      </div>

                      {alerta && (
                        <div className="p-3 rounded-xl bg-amber-100/80 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-between">
                          <span>⚠️ Alerta: Registro sin movimiento desde hace {dias} días. Requiere contacto comercial.</span>
                          <button
                            onClick={() => onGenerarOferta(obra)}
                            className="px-3 py-1 rounded-lg bg-amber-900 text-white text-[11px] font-bold hover:bg-amber-950 transition-colors"
                            id={`btn-timeline-recontact-${obra.id}`}
                          >
                            Enviar Propuesta
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Soft Delete Confirmation Modal */}
      <SoftDeleteConfirm
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setObraToDelete(null);
          setIsDeleteConfirmOpen(false);
        }}
        onConfirm={() => {
          // Note: actual deletion logic should be handled in parent App component
          if (obraToDelete) {
            console.log('Soft delete obra:', obraToDelete.id);
          }
          setObraToDelete(null);
          setIsDeleteConfirmOpen(false);
        }}
        entityType="obra"
        entityName={obraToDelete ? `${obraToDelete.codigo} - ${obraToDelete.nombre}` : ''}
      />

      {/* Stage Change Warning Modal */}
      {pendingStageChange && (
        <ModalAdvertencia
          isOpen={isAdvertenciaOpen}
          onClose={() => {
            setIsAdvertenciaOpen(false);
            setPendingStageChange(null);
          }}
          onConfirm={handleConfirmStageChange}
          actividadesIncompletas={pendingStageChange.obra.actividadesPorEtapa?.filter(a => a.etapa === pendingStageChange.obra.estado) || []}
          etapaActual={pendingStageChange.obra.estado}
        />
      )}

      {/* Nota Tooltip */}
      <NotaTooltip
        nota={notaTooltip.nota}
        position={notaTooltip.position}
        visible={notaTooltip.visible}
      />
    </div>
  );
};
