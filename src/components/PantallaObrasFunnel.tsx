import React, { useState } from 'react';
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
  Calendar
} from 'lucide-react';
import { Obra, FunnelStage, Region, EquipmentType } from '../types';
import { formatUSD, formatDateES, getDiasSinActualizar, tieneAlertaTemporal } from '../utils/semaforo';

interface PantallaObrasFunnelProps {
  obras: Obra[];
  selectedRegion: Region;
  selectedEquipmentType: EquipmentType;
  searchQuery: string;
  onEditObra: (obra: Obra) => void;
  onGenerarOferta: (obra: Obra) => void;
  onUpdateObraState: (obraId: string, nuevoEstado: FunnelStage) => void;
  onOpenNewObraModal: () => void;
}

export const PantallaObrasFunnel: React.FC<PantallaObrasFunnelProps> = ({
  obras,
  selectedRegion,
  selectedEquipmentType,
  searchQuery,
  onEditObra,
  onGenerarOferta,
  onUpdateObraState,
  onOpenNewObraModal
}) => {
  // Toggle between Sub-view 1: Vista Lista Tradicional, Sub-view 2: Vista Funnel Kanban, Sub-view 3: Cronograma Línea de Tiempo
  const [subView, setSubView] = useState<'lista' | 'kanban' | 'cronograma'>('kanban');

  // Filter by Stage local filter
  const [stageFilter, setStageFilter] = useState<string>('Todas');

  // Filter obras
  const filteredObras = obras.filter((obra) => {
    const matchRegion = selectedRegion === 'Todas' || obra.region === selectedRegion;
    const matchEquipment = selectedEquipmentType === 'Todos' || obra.tipoEquipo === selectedEquipmentType;
    const matchStage = stageFilter === 'Todas' || obra.estado === stageFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery = !q || 
      obra.codigo.toLowerCase().includes(q) || 
      obra.nombre.toLowerCase().includes(q) || 
      obra.responsable.toLowerCase().includes(q) ||
      obra.hardwareSpecs.modelo.toLowerCase().includes(q);

    return matchRegion && matchEquipment && matchStage && matchQuery;
  });

  const stages: FunnelStage[] = ['Cotización', 'Presentada', 'En Negociación', 'Adjudicada', 'Perdida'];

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

          <button
            onClick={() => setSubView('cronograma')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              subView === 'cronograma'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
            id="btn-subview-cronograma"
          >
            <Clock size={15} className={subView === 'cronograma' ? 'text-[#C8102E]' : ''} />
            <span>Cronograma Secuencial</span>
          </button>
        </div>

        {/* Local Filter & Totals */}
        <div className="flex items-center gap-3 text-xs">
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

          <div className="hidden sm:block font-extrabold text-[#2D3436] bg-white px-3.5 py-2 rounded-xl border border-[#E0E0E0] shadow-2xs">
            Total Pipeline: {formatUSD(filteredObras.reduce((s, o) => s + o.montoUSD, 0))}
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: VISTA FUNNEL KANBAN */}
      {subView === 'kanban' && (
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x">
          {stages.map((stage) => {
            const stageObras = filteredObras.filter((o) => o.estado === stage);
            const totalStageUSD = stageObras.reduce((s, o) => s + o.montoUSD, 0);

            let headerBg = 'bg-white/80 border-[#E0E0E0] text-[#2D3436]';
            let dotColor = 'bg-[#B2BEC3]';
            if (stage === 'Cotización') { headerBg = 'bg-indigo-50/80 border-indigo-200 text-indigo-900'; dotColor = 'bg-indigo-500'; }
            if (stage === 'Presentada') { headerBg = 'bg-amber-50/80 border-amber-200 text-amber-900'; dotColor = 'bg-amber-500'; }
            if (stage === 'En Negociación') { headerBg = 'bg-blue-50/80 border-blue-200 text-blue-900'; dotColor = 'bg-blue-500'; }
            if (stage === 'Adjudicada') { headerBg = 'bg-emerald-50/80 border-emerald-200 text-emerald-900'; dotColor = 'bg-emerald-500'; }
            if (stage === 'Perdida') { headerBg = 'bg-red-50/80 border-red-200 text-red-900'; dotColor = 'bg-red-400'; }

            return (
              <div key={stage} className="flex flex-col rounded-2xl bg-white/40 backdrop-blur-md border border-[#E0E0E0] p-3.5 min-w-[270px] w-[270px] shrink-0 h-[calc(100vh-230px)] shadow-2xs snap-start">
                {/* Stage Header */}
                <div className={`p-3.5 rounded-xl border ${headerBg} mb-3 shadow-2xs backdrop-blur-sm`}>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
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
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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
                          className={`bg-white/90 backdrop-blur-md rounded-xl p-4 border shadow-2xs transition-all hover:shadow-md space-y-2.5 relative group ${
                            alerta ? 'border-amber-400 ring-2 ring-amber-200/50' : 'border-[#E0E0E0] hover:border-[#B2BEC3]'
                          }`}
                        >
                          {/* Alert Badge for >7d Stagnant */}
                          {alerta && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                              <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                              <span>⚠️ {dias}d sin actualización</span>
                            </div>
                          )}

                          {/* Code & Region Badge */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#C8102E] tracking-wide font-mono">
                              {obra.codigo}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F1F3F5] text-[#2D3436] border border-[#E0E0E0]">
                              {obra.region === 'Argentina' ? '🇦🇷 AR' : '🇺🇾 UY'}
                            </span>
                          </div>

                          {/* Obra Name & Specs */}
                          <div>
                            <h4 className="text-xs font-extrabold text-[#2D3436] leading-snug line-clamp-2">
                              {obra.nombre}
                            </h4>
                            <p className="text-[11px] text-[#636E72] font-semibold mt-0.5">
                              {obra.cantidadEquipos}x {obra.hardwareSpecs.modelo}
                            </p>
                          </div>

                          {/* Specs Mini Badges */}
                          <div className="flex flex-wrap gap-1 text-[10px] text-[#636E72]">
                            <span className="bg-[#F1F3F5] px-2 py-0.5 rounded-md font-medium">
                              {obra.hardwareSpecs.velocidadMS} m/s
                            </span>
                            <span className="bg-[#F1F3F5] px-2 py-0.5 rounded-md font-medium">
                              {obra.hardwareSpecs.paradas} paradas
                            </span>
                            <span className="bg-[#F1F3F5] px-2 py-0.5 rounded-md font-medium">
                              {obra.hardwareSpecs.capacidadKg} kg
                            </span>
                          </div>

                          {/* Price & Date */}
                          <div className="flex items-center justify-between border-t border-[#F1F3F5] pt-2 text-xs">
                            <span className="font-extrabold text-[#2D3436]">
                              {formatUSD(obra.montoUSD)}
                            </span>
                            <span className="text-[10px] text-[#B2BEC3] font-medium">
                              Act: {formatDateES(obra.fechaUltimaActualizacion)}
                            </span>
                          </div>

                          {/* Change Stage Dropdown & Action Links */}
                          <div className="flex items-center justify-between pt-1.5 text-xs border-t border-[#F1F3F5]">
                            <select
                              value={obra.estado}
                              onChange={(e) => onUpdateObraState(obra.id, e.target.value as FunnelStage)}
                              className="bg-[#F1F3F5] border border-[#E0E0E0] text-[11px] font-bold text-[#2D3436] rounded-lg py-1 px-2 focus:outline-none"
                              id={`select-stage-obra-${obra.id}`}
                            >
                              {stages.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onEditObra(obra)}
                                className="p-1.5 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-colors"
                                title="Editar Obra & Specs"
                                id={`btn-edit-obra-${obra.id}`}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => onGenerarOferta(obra)}
                                className="p-1.5 font-bold text-[#C8102E] hover:bg-red-50 rounded-lg flex items-center gap-0.5 transition-colors"
                                title="Generar Carta Oferta"
                                id={`btn-carta-oferta-obra-${obra.id}`}
                              >
                                <FileText size={14} />
                              </button>
                            </div>
                          </div>
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
                  <th className="p-4">Código Obra</th>
                  <th className="p-4">Nombre del Proyecto</th>
                  <th className="p-4">Región</th>
                  <th className="p-4">Estado del Proyecto</th>
                  <th className="p-4">Equipos & Modelo</th>
                  <th className="p-4">Monto (USD)</th>
                  <th className="p-4">Ingreso</th>
                  <th className="p-4">Última Act.</th>
                  <th className="p-4 text-center">Alerta (&gt;7d)</th>
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
                    if (obra.estado === 'Adjudicada') stageBadge = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    if (obra.estado === 'En Negociación') stageBadge = 'bg-blue-100 text-blue-800 border-blue-300';
                    if (obra.estado === 'Presentada') stageBadge = 'bg-amber-100 text-amber-900 border-amber-300';
                    if (obra.estado === 'Perdida') stageBadge = 'bg-red-100 text-red-800 border-red-300';

                    return (
                      <tr 
                        key={obra.id} 
                        className={`hover:bg-white/90 transition-colors ${
                          alerta ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="p-4 font-mono font-black text-[#C8102E]">
                          {obra.codigo}
                        </td>
                        <td className="p-4 font-bold text-[#2D3436]">
                          {obra.nombre}
                          <div className="text-[11px] font-normal text-[#636E72]">
                            Resp: {obra.responsable}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-[#2D3436]">
                            {obra.region === 'Argentina' ? '🇦🇷 Argentina' : '🇺🇾 Uruguay'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${stageBadge}`}>
                            {obra.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-[#2D3436]">
                            {obra.cantidadEquipos}x {obra.hardwareSpecs.modelo}
                          </div>
                          <div className="text-[11px] text-[#636E72]">
                            {obra.hardwareSpecs.velocidadMS}m/s | {obra.hardwareSpecs.paradas}p | {obra.hardwareSpecs.capacidadKg}kg
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-[#2D3436]">
                          {formatUSD(obra.montoUSD)}
                        </td>
                        <td className="p-4 text-[#636E72]">
                          {formatDateES(obra.fechaIngreso)}
                        </td>
                        <td className="p-4 text-[#636E72]">
                          {formatDateES(obra.fechaUltimaActualizacion)}
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
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
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
    </div>
  );
};
