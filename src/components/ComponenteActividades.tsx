import React from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { ActividadPorEtapa, FunnelStage } from '../types';

interface ComponenteActividadesProps {
  actividadesPorEtapa: ActividadPorEtapa[];
  etapaActual: FunnelStage;
  onToggleActividad: (actividadId: string, completada: boolean) => void;
  expanded?: boolean;
}

export const ComponenteActividades: React.FC<ComponenteActividadesProps> = ({
  actividadesPorEtapa,
  etapaActual,
  onToggleActividad,
  expanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);

  const agrupadasPorEtapa = actividadesPorEtapa.reduce((acc, act) => {
    if (!acc[act.etapa]) acc[act.etapa] = [];
    acc[act.etapa].push(act);
    return acc;
  }, {} as Record<FunnelStage, ActividadPorEtapa[]>);

  const allStages: FunnelStage[] = [
    'Solicitud',
    'En estudio de proyecto',
    'Estimado',
    'Cotización',
    'Contratadas',
    'Finalizadas',
    'Rechazadas'
  ];

  const getTotalCompleted = (stage: FunnelStage) => {
    const acts = agrupadasPorEtapa[stage] || [];
    return acts.filter(a => a.completada).length;
  };

  const getStageBgColor = (stage: FunnelStage): string => {
    const colors: Record<FunnelStage, string> = {
      'Solicitud': 'bg-slate-50',
      'En estudio de proyecto': 'bg-cyan-50',
      'Estimado': 'bg-indigo-50',
      'Cotización': 'bg-amber-50',
      'Contratadas': 'bg-emerald-50',
      'Finalizadas': 'bg-green-50',
      'Rechazadas': 'bg-red-50'
    };
    return colors[stage] || 'bg-gray-50';
  };

  const getStageBorderColor = (stage: FunnelStage): string => {
    const colors: Record<FunnelStage, string> = {
      'Solicitud': 'border-slate-200',
      'En estudio de proyecto': 'border-cyan-200',
      'Estimado': 'border-indigo-200',
      'Cotización': 'border-amber-200',
      'Contratadas': 'border-emerald-200',
      'Finalizadas': 'border-green-200',
      'Rechazadas': 'border-red-200'
    };
    return colors[stage] || 'border-gray-200';
  };

  const getStageDotColor = (stage: FunnelStage): string => {
    const colors: Record<FunnelStage, string> = {
      'Solicitud': 'bg-slate-500',
      'En estudio de proyecto': 'bg-cyan-500',
      'Estimado': 'bg-indigo-500',
      'Cotización': 'bg-amber-500',
      'Contratadas': 'bg-emerald-500',
      'Finalizadas': 'bg-green-600',
      'Rechazadas': 'bg-red-500'
    };
    return colors[stage] || 'bg-gray-500';
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E0E0E0] hover:bg-[#F1F3F5] transition-all text-xs font-bold text-[#2D3436]"
      >
        <span className="flex items-center gap-1.5">📋 Actividades por Etapa</span>
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="space-y-1.5">
          {allStages.map((stage) => {
            const actividades = agrupadasPorEtapa[stage] || [];
            const completadas = getTotalCompleted(stage);
            const isCurrentStage = stage === etapaActual;

            if (actividades.length === 0) return null;

            return (
              <div
                key={stage}
                className={`rounded-lg border ${getStageBgColor(stage)} ${getStageBorderColor(stage)} p-2 space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${getStageDotColor(stage)}`} />
                    <span className="text-[10px] font-black text-[#2D3436] uppercase tracking-wider">{stage}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#636E72] bg-white px-1.5 py-0.5 rounded-md border border-[#E0E0E0]">
                    {completadas}/{actividades.length}
                  </span>
                </div>

                <div className="space-y-0.5">
                  {actividades.map((actividad) => (
                    <div
                      key={actividad.id}
                      className={`flex items-start gap-1.5 p-1.5 rounded-md transition-all ${
                        isCurrentStage
                          ? 'bg-white cursor-pointer hover:bg-[#F1F3F5]'
                          : 'bg-white/50 opacity-60'
                      }`}
                      onClick={() => {
                        if (isCurrentStage) {
                          onToggleActividad(actividad.id, !actividad.completada);
                        }
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrentStage) {
                            onToggleActividad(actividad.id, !actividad.completada);
                          }
                        }}
                        disabled={!isCurrentStage}
                        className={`mt-0.5 flex-shrink-0 transition-all ${
                          !isCurrentStage && 'cursor-not-allowed opacity-50'
                        }`}
                      >
                        {actividad.completada ? (
                          <CheckCircle2 size={14} className="text-green-600" />
                        ) : (
                          <Circle size={14} className="text-[#B2BEC3]" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[11px] font-medium leading-snug ${
                            actividad.completada
                              ? 'line-through text-[#B2BEC3]'
                              : 'text-[#2D3436]'
                          }`}
                        >
                          {actividad.descripcion}
                        </p>
                        {actividad.completada && actividad.fechaCompletada && (
                          <p className="text-[9px] text-[#B2BEC3] mt-0.5">
                            ✓ {actividad.fechaCompletada}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
