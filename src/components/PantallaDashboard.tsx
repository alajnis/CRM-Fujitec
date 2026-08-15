import React, { useState } from 'react';
import {
  TrendingUp,
  Building2,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  Clock,
  ArrowDown,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';
import { Obra, Region, EquipmentType, MonthlySalesData } from '../types';
import { getSemaforoComercial, formatUSD, tieneAlertaTemporal, getDiasSinActualizar } from '../utils/semaforo';
import { useAuth } from '../context/AuthContext';

interface PantallaDashboardProps {
  obras: Obra[];
  monthlyData: MonthlySalesData[];
  selectedRegion: Region;
  selectedEquipmentType: EquipmentType;
  searchQuery?: string;
  onNavigateToObra: (obraId: string) => void;
  onNavigateToFunnel: () => void;
  selectedYear?: number;
  onOpenViewActividades?: (obra: Obra) => void;
}

export const PantallaDashboard: React.FC<PantallaDashboardProps> = ({
  obras,
  monthlyData,
  selectedRegion,
  selectedEquipmentType,
  searchQuery = '',
  onNavigateToObra,
  onNavigateToFunnel,
  selectedYear = new Date().getFullYear(),
  onOpenViewActividades
}) => {
  const { usuarioActual, usuarios } = useAuth();
  const getNombreUsuario = (usuarioId?: string): string => {
    if (!usuarioId) return 'Sin asignar';
    return usuarios.find(u => u.id === usuarioId)?.nombre || usuarioId;
  };
  const [showEquipos, setShowEquipos] = useState(false);
  const [misObrasFilter, setMisObrasFilter] = useState<'todas' | 'alerta' | 'sin-alerta'>('todas');
  const [misObrasSortBy, setMisObrasSortBy] = useState<'dias' | 'deadline' | 'stage' | 'nombre'>('dias');

  // Filter obras based on selectedRegion & selectedEquipmentType & selectedYear & searchQuery
  const filteredObras = obras.filter((obra) => {
    const matchRegion = selectedRegion === 'Todas' || obra.region === selectedRegion;
    // Equipment filter: if 'Todos' selected, match all; otherwise check if obra has matching equipment type
    const matchEquipment = selectedEquipmentType === 'Todos' || obra.tipoEquipo === selectedEquipmentType;
    const obraYear = parseInt(obra.fechaIngreso.split('-')[0], 10);
    const matchYear = obraYear === selectedYear;
    const q = searchQuery.toLowerCase();
    const matchQuery = !q ||
      obra.codigo.toLowerCase().includes(q) ||
      obra.nombre.toLowerCase().includes(q) ||
      getNombreUsuario(obra.usuarioAsignado).toLowerCase().includes(q) ||
      (obra.hardwareSpecs?.modelo || '').toLowerCase().includes(q);
    return matchRegion && matchEquipment && matchYear && matchQuery;
  });

  // "Mis obras asignadas" - Filter for current user
  const misObrasAsignadas = obras.filter(obra =>
    obra.usuarioAsignado === usuarioActual?.id &&
    obra.estado !== 'Finalizadas' &&
    obra.estado !== 'Rechazadas'
  );

  // Apply mis obras filter
  let misObrasFilteradas = misObrasAsignadas;
  if (misObrasFilter === 'alerta') {
    misObrasFilteradas = misObrasAsignadas.filter(o => tieneAlertaTemporal(o));
  } else if (misObrasFilter === 'sin-alerta') {
    misObrasFilteradas = misObrasAsignadas.filter(o => !tieneAlertaTemporal(o));
  }

  // Sort mis obras
  misObrasFilteradas = [...misObrasFilteradas].sort((a, b) => {
    if (misObrasSortBy === 'dias') {
      return getDiasSinActualizar(b.fechaUltimaActualizacion) - getDiasSinActualizar(a.fechaUltimaActualizacion);
    } else if (misObrasSortBy === 'nombre') {
      return a.nombre.localeCompare(b.nombre);
    } else if (misObrasSortBy === 'stage') {
      const stages = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas'];
      return stages.indexOf(a.estado) - stages.indexOf(b.estado);
    }
    return 0;
  });

  // Calculate Key Performance Metrics (Indicadores Operacionales según PDF)
  const montoPlanAnualUSD = 8500000;
  const equiposPlanAnual = 80;
  const rentabilidadPlanPorcentaje = 18.0;

  // Contratadas (Ventas cerradas / Informadas)
  const obrasContratadas = filteredObras.filter((o) => o.estado === 'Contratadas');
  const montoVentasContratadas = obrasContratadas.reduce((sum, o) => sum + o.montoUSD, 0);
  const equiposVendidosTotal = obrasContratadas.length;

  const avgRentabilidadReal = obrasContratadas.length > 0
    ? obrasContratadas.reduce((sum, o) => sum + (o.rentabilidadEstimada || 16.5), 0) / obrasContratadas.length
    : 0;

  // A) 4/1: Equipos Vendidos vs Plan
  const porcentajeEquipos = Math.min(
    Math.round((equiposVendidosTotal / equiposPlanAnual) * 100) || 0,
    150
  );
  const semaforoEquipos = getSemaforoComercial(porcentajeEquipos);

  // B) 5/2: Cumplimiento de Ventas Adjudicadas vs Plan
  const porcentajeVentas = Math.min(
    Math.round((montoVentasContratadas / montoPlanAnualUSD) * 100) || 0,
    150
  );
  const semaforoVentas = getSemaforoComercial(porcentajeVentas);

  // C) 6/3: Rentabilidad vs Plan
  const porcentajeRentabilidad = Math.min(
    Math.round((avgRentabilidadReal / rentabilidadPlanPorcentaje) * 100) || 0,
    150
  );
  const semaforoRentabilidad = getSemaforoComercial(porcentajeRentabilidad);

  // Stagnant projects >7 days
  const obrasAlertas = filteredObras.filter((o) => tieneAlertaTemporal(o));

  // Stage Breakdown for Funnel summary
  const etapas = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas', 'Finalizadas', 'Rechazadas'];
  const conteoPorEtapa = etapas.map(etapa => {
    const arr = filteredObras.filter(o => o.estado === etapa);
    return {
      etapa,
      cantidad: arr.length,
      montoUSD: arr.reduce((sum, item) => sum + item.montoUSD, 0)
    };
  });

  return (
    <div className="p-8 space-y-8 bg-[#F1F3F5] min-h-screen">
      {/* Dynamic Header Banner for Active Filters */}
      {(selectedRegion !== 'Todas' || selectedEquipmentType !== 'Todos') && (
        <div className="p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-[#E0E0E0] text-xs text-[#636E72] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2D3436]">Filtros Dashboard Activos:</span>
            {selectedRegion !== 'Todas' && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E0E0E0] font-bold text-[#2D3436]">
                Región: {selectedRegion}
              </span>
            )}
            {selectedEquipmentType !== 'Todos' && (
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E0E0E0] font-bold text-[#2D3436]">
                Equipo: {selectedEquipmentType}
              </span>
            )}
          </div>
          <span className="text-[#B2BEC3] font-medium">Mostrando {filteredObras.length} de {obras.length} obras</span>
        </div>
      )}

      {/* SECTION 1: ESTADÍSTICAS COMERCIALES (SEGÚN FICHA INDICADORES) */}
      <div className="mb-2">
        <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2 mb-1">
          <Target size={18} style={{ color: '#C8102E' }} />
          Estadísticas Comerciales: Indicador Comercial de Obras Nuevas
        </h2>
        <p className="text-xs text-[#636E72]">
          Cumplimiento acumulado del plan anual respecto a órdenes recibidas (Ventas Vendidas)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI CARD 1: CUMPLIMIENTO DE EQUIPOS (A) */}
        <div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:bg-white/90"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: semaforoEquipos.colorHex }} />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B2BEC3]">
              A) Cumplimiento Equipos
            </span>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border whitespace-nowrap ${semaforoEquipos.badgeBg}`}>
              {semaforoEquipos.badgeText}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#2D3436] tracking-tight">
              {porcentajeEquipos}%
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-[#636E72] border-t border-[#F1F3F5] pt-3 mt-2">
            <div className="flex justify-between">
              <span>(4) Equipos Vendidos:</span>
              <span className="font-bold text-[#2D3436]">{equiposVendidosTotal} un.</span>
            </div>
            <div className="flex justify-between">
              <span>(1) Equipos Plan Anual:</span>
              <span className="font-medium text-[#B2BEC3]">{equiposPlanAnual} un.</span>
            </div>
          </div>

          <div className="mt-4 h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(porcentajeEquipos, 100)}%`, backgroundColor: semaforoEquipos.colorHex }} />
          </div>

          <div className="mt-3 text-[10px] font-bold flex items-center gap-1.5" style={{ color: semaforoEquipos.colorHex }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: semaforoEquipos.colorHex }} />
            <span>{semaforoEquipos.estado}</span>
          </div>
        </div>

        {/* KPI CARD 2: CUMPLIMIENTO DE VENTAS (B) */}
        <div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:bg-white/90"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: semaforoVentas.colorHex }} />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B2BEC3]">
              B) Cumplimiento Ventas
            </span>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border whitespace-nowrap ${semaforoVentas.badgeBg}`}>
              {semaforoVentas.badgeText}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#2D3436] tracking-tight">
              {porcentajeVentas}%
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-[#636E72] border-t border-[#F1F3F5] pt-3 mt-2">
            <div className="flex justify-between">
              <span>(5) Monto Ventas Inf.:</span>
              <span className="font-bold text-[#2D3436]">{formatUSD(montoVentasContratadas)}</span>
            </div>
            <div className="flex justify-between">
              <span>(2) Monto Plan Anual:</span>
              <span className="font-medium text-[#B2BEC3]">{formatUSD(montoPlanAnualUSD)}</span>
            </div>
          </div>

          <div className="mt-4 h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(porcentajeVentas, 100)}%`, backgroundColor: semaforoVentas.colorHex }} />
          </div>

          <div className="mt-3 text-[10px] font-bold flex items-center gap-1.5" style={{ color: semaforoVentas.colorHex }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: semaforoVentas.colorHex }} />
            <span>{semaforoVentas.estado}</span>
          </div>
        </div>

        {/* KPI CARD 3: CUMPLIMIENTO RENTABILIDAD (C) */}
        <div 
          className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm relative overflow-hidden transition-all hover:shadow-md hover:bg-white/90"
        >
          <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: semaforoRentabilidad.colorHex }} />

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B2BEC3]">
              C) Cumplimiento Margen
            </span>
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border whitespace-nowrap ${semaforoRentabilidad.badgeBg}`}>
              {semaforoRentabilidad.badgeText}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-[#2D3436] tracking-tight">
              {porcentajeRentabilidad}%
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-[#636E72] border-t border-[#F1F3F5] pt-3 mt-2">
            <div className="flex justify-between">
              <span>(6) Rentabilidad Inf.:</span>
              <span className="font-bold text-[#2D3436]">{avgRentabilidadReal.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>(3) Rentabilidad Plan:</span>
              <span className="font-medium text-[#B2BEC3]">{rentabilidadPlanPorcentaje.toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 h-1.5 bg-[#F1F3F5] rounded-full overflow-hidden">
            <div className="h-full transition-all duration-500" style={{ width: `${Math.min(porcentajeRentabilidad, 100)}%`, backgroundColor: semaforoRentabilidad.colorHex }} />
          </div>

          <div className="mt-3 text-[10px] font-bold flex items-center gap-1.5" style={{ color: semaforoRentabilidad.colorHex }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: semaforoRentabilidad.colorHex }} />
            <span>{semaforoRentabilidad.estado}</span>
          </div>
        </div>
      </div>

      {/* SECTION 1.5: MIS OBRAS ASIGNADAS (MANDATORY) */}
      {usuarioActual && (
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2 mb-1">
              <Building2 size={18} style={{ color: '#C8102E' }} />
              Mis Obras Asignadas
            </h2>
            <p className="text-xs text-[#636E72]">
              Proyectos asignados a {usuarioActual.nombre} • {misObrasFilteradas.length} de {misObrasAsignadas.length} obras
            </p>
          </div>

          {/* Filters and Sort Controls */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 border border-[#E0E0E0] shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMisObrasFilter('todas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  misObrasFilter === 'todas'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-[#F1F3F5] text-[#2D3436] hover:bg-[#E0E0E0]'
                }`}
              >
                Todas ({misObrasAsignadas.length})
              </button>
              <button
                onClick={() => setMisObrasFilter('alerta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  misObrasFilter === 'alerta'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                En Alerta ({misObrasAsignadas.filter(o => tieneAlertaTemporal(o)).length})
              </button>
              <button
                onClick={() => setMisObrasFilter('sin-alerta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  misObrasFilter === 'sin-alerta'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Sin Alerta ({misObrasAsignadas.filter(o => !tieneAlertaTemporal(o)).length})
              </button>
            </div>

            <select
              value={misObrasSortBy}
              onChange={(e) => setMisObrasSortBy(e.target.value as any)}
              className="sm:ml-auto px-3 py-1.5 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
            >
              <option value="dias">Ordenar por: Días sin acción</option>
              <option value="nombre">Ordenar por: Nombre</option>
              <option value="stage">Ordenar por: Estadio</option>
            </select>
          </div>

          {/* Obras Table */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0] shadow-sm overflow-hidden">
            {misObrasFilteradas.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <p className="text-sm font-bold text-[#2D3436]">
                  {misObrasFilter === 'alerta' ? '¡Sin obras en alerta!' : '¡Todo al día!'}
                </p>
                <p className="text-xs text-[#636E72]">
                  {misObrasAsignadas.length === 0
                    ? 'No tienes obras asignadas en estado activo'
                    : misObrasFilter === 'alerta'
                    ? 'Todas tus obras están dentro del plazo'
                    : 'Accede a la sección Funnel Obras para gestionar nuevos proyectos'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F1F3F5] border-b border-[#E0E0E0]">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436]">Código</th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436]">Proyecto</th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436]">Cliente</th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436]">Estadio</th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436]">Días</th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436]">Estado</th>
                      <th className="px-4 py-3 text-center font-bold text-[#2D3436]">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0]">
                    {misObrasFilteradas.map((obra) => {
                      const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);
                      const enAlerta = tieneAlertaTemporal(obra);
                      const cliente = obras.find(o => o.id === obra.id)?.clienteId || 'N/A';

                      return (
                        <tr key={obra.id} className="hover:bg-[#F9F9F9] transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#C8102E]">{obra.codigo}</td>
                          <td className="px-4 py-3 font-bold text-[#2D3436] truncate max-w-xs">{obra.nombre}</td>
                          <td className="px-4 py-3 text-[#636E72]">Cliente</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              {obra.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#2D3436] font-bold">{dias}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              enAlerta
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {enAlerta ? 'Con Alerta' : 'Sin Alerta'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => onNavigateToObra(obra.id)}
                              className="px-2 py-1 rounded-lg text-[#C8102E] hover:bg-[#F1F3F5] transition-all font-bold text-[11px]"
                            >
                              Ver →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: CENTRAL ACCUMULATED EVOLUTION CHART */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F1F3F5] pb-4">
          <div className="flex-1">
            <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2">
              <TrendingUp size={18} style={{ color: '#C8102E' }} />
              Evolución Mensual Acumulada de Ventas de Equipos Nuevos ({showEquipos ? 'Unidades' : 'USD'})
            </h2>
            <p className="text-xs text-[#636E72]">
              Comparativa de ventas reales acumuladas vs plan presupuestario anual fiscal
            </p>
          </div>

          {/* Toggle for Evolution Chart */}
          <button
            onClick={() => setShowEquipos(!showEquipos)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] text-xs font-bold text-[#2D3436] transition-all border border-[#E0E0E0] whitespace-nowrap"
            title={showEquipos ? 'Ver en USD' : 'Ver en Equipos'}
          >
            <span>{showEquipos ? '📦 Equipos' : '💵 USD'}</span>
          </button>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#C8102E] inline-block" />
              <span className="text-[#2D3436]">Ventas Reales Acumuladas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#B2BEC3] inline-block" />
              <span className="text-[#B2BEC3]">Plan Anual Acumulado</span>
            </div>
          </div>
        </div>

        {/* Recharts Monthly Sales Area Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8102E" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#C8102E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B2BEC3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#B2BEC3" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#636E72' }} />
              <YAxis
                tickFormatter={(value) => showEquipos ? `${value} un.` : `$${(value / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 11, fill: '#636E72' }}
              />
              <Tooltip
                formatter={(value: any) => showEquipos ? [`${value} unidades`, ''] : [formatUSD(Number(value)), '']}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  borderColor: '#E0E0E0',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey={showEquipos ? "equiposVendidos" : "ventasAcumuladasUSD"}
                name={showEquipos ? "Equipos Vendidos" : "Ventas Acumuladas USD"}
                stroke="#C8102E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorVentas)"
              />
              <Area
                type="monotone"
                dataKey={showEquipos ? "equiposPlan" : "planAcumuladoUSD"}
                name={showEquipos ? "Plan Anual (Equipos)" : "Plan Acumulado USD"}
                stroke="#B2BEC3"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorPlan)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 3: SECONDARY ANALYTICS & ALERT WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget 1: Funnel Pipeline Breakdown */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#2D3436] flex items-center gap-1.5">
                <Layers size={16} className="text-[#636E72]" />
                Composición del Funnel
              </h3>
              <button 
                onClick={onNavigateToFunnel}
                className="text-xs font-bold text-[#C8102E] hover:underline flex items-center gap-0.5"
                id="btn-ver-funnel-dashboard"
              >
                Ver Kanban <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {conteoPorEtapa.map((item) => {
                const totalMonto = conteoPorEtapa.reduce((s, i) => s + i.montoUSD, 0) || 1;
                const pct = Math.round((item.montoUSD / totalMonto) * 100);

                let badgeColor = 'bg-[#F1F3F5] text-[#2D3436]';
                if (item.etapa === 'Adjudicada') badgeColor = 'bg-emerald-100 text-emerald-800';
                if (item.etapa === 'Perdida') badgeColor = 'bg-red-50 text-red-700';
                if (item.etapa === 'En Negociación') badgeColor = 'bg-blue-100 text-blue-800';

                return (
                  <div key={item.etapa} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#2D3436] flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
                          {item.cantidad}
                        </span>
                        {item.etapa}
                      </span>
                      <span className="font-extrabold text-[#2D3436]">{formatUSD(item.montoUSD)}</span>
                    </div>
                    <div className="w-full bg-[#F1F3F5] h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.etapa === 'Adjudicada' ? 'bg-emerald-500' :
                          item.etapa === 'En Negociación' ? 'bg-blue-500' :
                          item.etapa === 'Presentada' ? 'bg-amber-500' :
                          item.etapa === 'Cotización' ? 'bg-indigo-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Widget 2: Temporal Alert List (> 7 days stagnant) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#2D3436] flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500" />
                Alertas Temporales (&gt;7d)
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                {obrasAlertas.length} requeridos
              </span>
            </div>

            {obrasAlertas.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#636E72] space-y-1">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1" />
                <p className="font-bold text-[#2D3436]">¡Todo al día!</p>
                <p>No existen obras congeladas por más de 7 días sin actualización.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {obrasAlertas.map((obra) => {
                  const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);
                  return (
                    <div 
                      key={obra.id} 
                      onClick={() => onNavigateToObra(obra.id)}
                      className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/80 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-extrabold text-[#2D3436] truncate max-w-[170px]">
                          {obra.codigo} - {obra.nombre}
                        </span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 shrink-0">
                          {dias}d sin mov.
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#636E72]">
                        <span>{obra.region} | {obra.estado}</span>
                        <span className="font-bold text-[#2D3436]">{formatUSD(obra.montoUSD)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F1F3F5] text-[11px] text-[#B2BEC3] text-center font-medium">
            Mantenimiento continuo para maximizar conversión del Funnel
          </div>
        </div>
      </div>
    </div>
  );
};
