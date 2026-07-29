import React from 'react';
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
  Clock
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

interface PantallaDashboardProps {
  obras: Obra[];
  monthlyData: MonthlySalesData[];
  selectedRegion: Region;
  selectedEquipmentType: EquipmentType;
  onNavigateToObra: (obraId: string) => void;
  onNavigateToFunnel: () => void;
}

export const PantallaDashboard: React.FC<PantallaDashboardProps> = ({
  obras,
  monthlyData,
  selectedRegion,
  selectedEquipmentType,
  onNavigateToObra,
  onNavigateToFunnel
}) => {
  // Filter obras based on selectedRegion & selectedEquipmentType
  const filteredObras = obras.filter((obra) => {
    const matchRegion = selectedRegion === 'Todas' || obra.region === selectedRegion;
    const matchEquipment = selectedEquipmentType === 'Todos' || obra.tipoEquipo === selectedEquipmentType;
    return matchRegion && matchEquipment;
  });

  // Calculate Key Performance Metrics (Indicadores Operacionales según PDF)
  const montoPlanAnualUSD = selectedRegion === 'Argentina' ? 6000000 : selectedRegion === 'Uruguay' ? 2500000 : 8500000;
  const equiposPlanAnual = selectedRegion === 'Argentina' ? 55 : selectedRegion === 'Uruguay' ? 25 : 80;
  const rentabilidadPlanPorcentaje = 18.0; // 18% target margin

  // Adjudicadas (Ventas cerradas / Informadas)
  const obrasAdjudicadas = filteredObras.filter((o) => o.estado === 'Adjudicada');
  const montoVentasAdjudicadasUSD = obrasAdjudicadas.reduce((sum, o) => sum + o.montoUSD, 0);
  const equiposVendidosTotal = obrasAdjudicadas.reduce((sum, o) => sum + o.cantidadEquipos, 0);

  const avgRentabilidadReal = obrasAdjudicadas.length > 0
    ? obrasAdjudicadas.reduce((sum, o) => sum + (o.rentabilidadEstimada || 16.5), 0) / obrasAdjudicadas.length
    : 0;

  // A) 4/1: Equipos Vendidos vs Plan
  const porcentajeEquipos = Math.min(
    Math.round((equiposVendidosTotal / equiposPlanAnual) * 100) || 0,
    150
  );
  const semaforoEquipos = getSemaforoComercial(porcentajeEquipos);

  // B) 5/2: Cumplimiento de Ventas Adjudicadas vs Plan
  const porcentajeVentas = Math.min(
    Math.round((montoVentasAdjudicadasUSD / montoPlanAnualUSD) * 100) || 0,
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

  // Regional breakdown data for bar chart
  const datosRegion = [
    {
      name: 'Argentina',
      montoAdjudicado: obras.filter(o => o.region === 'Argentina' && o.estado === 'Adjudicada').reduce((s, o) => s + o.montoUSD, 0),
      montoPipeline: obras.filter(o => o.region === 'Argentina' && ['Cotización', 'Presentada', 'En Negociación'].includes(o.estado)).reduce((s, o) => s + o.montoUSD, 0),
      equipos: obras.filter(o => o.region === 'Argentina' && o.estado === 'Adjudicada').reduce((s, o) => s + o.cantidadEquipos, 0)
    },
    {
      name: 'Uruguay',
      montoAdjudicado: obras.filter(o => o.region === 'Uruguay' && o.estado === 'Adjudicada').reduce((s, o) => s + o.montoUSD, 0),
      montoPipeline: obras.filter(o => o.region === 'Uruguay' && ['Cotización', 'Presentada', 'En Negociación'].includes(o.estado)).reduce((s, o) => s + o.montoUSD, 0),
      equipos: obras.filter(o => o.region === 'Uruguay' && o.estado === 'Adjudicada').reduce((s, o) => s + o.cantidadEquipos, 0)
    }
  ];

  // Stage Breakdown for Funnel summary
  const etapas = ['Cotización', 'Presentada', 'En Negociación', 'Adjudicada', 'Pérdida'];
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
          Cumplimiento acumulado del plan anual respecto a órdenes recibidas (Ventas Informadas)
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
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${semaforoEquipos.badgeBg}`}>
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
              <span>(4) Equipos Informados:</span>
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
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${semaforoVentas.badgeBg}`}>
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
              <span className="font-bold text-[#2D3436]">{formatUSD(montoVentasAdjudicadasUSD)}</span>
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
            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${semaforoRentabilidad.badgeBg}`}>
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

      {/* SECTION 2: CENTRAL ACCUMULATED EVOLUTION CHART */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F1F3F5] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#2D3436] flex items-center gap-2">
              <TrendingUp size={18} style={{ color: '#C8102E' }} />
              Evolución Mensual Acumulada de Ventas de Equipos Nuevos (USD)
            </h2>
            <p className="text-xs text-[#636E72]">
              Comparativa de ventas reales acumuladas vs plan presupuestario anual fiscal
            </p>
          </div>

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
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                tick={{ fontSize: 11, fill: '#636E72' }} 
              />
              <Tooltip 
                formatter={(value: any) => [formatUSD(Number(value)), '']}
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
                dataKey="ventasAcumuladasUSD" 
                name="Ventas Acumuladas USD" 
                stroke="#C8102E" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorVentas)" 
              />
              <Area 
                type="monotone" 
                dataKey="planAcumuladoUSD" 
                name="Plan Acumulado USD" 
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
                if (item.etapa === 'Pérdida') badgeColor = 'bg-red-50 text-red-700';
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

        {/* Widget 2: Regional Performance (AR vs UY) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="border-b border-[#F1F3F5] pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#2D3436] flex items-center gap-1.5">
                <MapPin size={16} className="text-[#636E72]" />
                Desglose Regional (AR / UY)
              </h3>
              <p className="text-[11px] text-[#B2BEC3]">Monto adjudicado y en negociación consolidado en USD</p>
            </div>

            <div className="space-y-3 pt-1">
              {datosRegion.map((reg) => (
                <div key={reg.name} className="p-3.5 bg-white rounded-xl border border-[#E0E0E0] shadow-2xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-[#2D3436] flex items-center gap-1">
                      {reg.name === 'Argentina' ? '🇦🇷 Argentina' : '🇺🇾 Uruguay'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Adjudicado: {formatUSD(reg.montoAdjudicado)}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#636E72] flex justify-between border-t border-[#F1F3F5] pt-2">
                    <span>En Pipeline: <strong>{formatUSD(reg.montoPipeline)}</strong></span>
                    <span>Equipos: <strong>{reg.equipos} un.</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: Temporal Alert List (> 7 days stagnant) */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3 mb-3">
              <h3 className="text-sm font-bold text-[#2D3436] flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500" />
                Alertas Temporales (&gt;7d)
              </h3>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
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
