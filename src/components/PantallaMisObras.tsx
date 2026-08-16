import React, { useState } from 'react';
import { Building2, CheckCircle2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Obra } from '../types';
import { useAuth } from '../context/AuthContext';
import { getDiasSinActualizar } from '../utils/semaforo';

interface PantallaMisObrasProps {
  obras: Obra[];
  onNavigateToObra: (obraId: string) => void;
  getDiasMaximosForEtapa?: (etapa: string) => number;
}

export const PantallaMisObras: React.FC<PantallaMisObrasProps> = ({
  obras,
  onNavigateToObra,
  getDiasMaximosForEtapa = () => 7
}) => {
  const { usuarioActual } = useAuth();
  const [misObrasFilter, setMisObrasFilter] = useState<'todas' | 'alerta' | 'sin-alerta'>('todas');
  const [sortColumn, setSortColumn] = useState<'codigo' | 'nombre' | 'cliente' | 'estado' | 'dias' | null>('dias');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleColumnSort = (column: 'codigo' | 'nombre' | 'cliente' | 'estado' | 'dias') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ column }: { column: 'codigo' | 'nombre' | 'cliente' | 'estado' | 'dias' }) => {
    if (sortColumn !== column) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // Helper function to check if obra has alert using configured dias
  const checkAlerta = (obra: Obra): boolean => {
    const diasMaximos = getDiasMaximosForEtapa(obra.estado);
    const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);
    if (obra.estado === 'Finalizadas' || obra.estado === 'Rechazadas') {
      return false;
    }
    return dias > diasMaximos;
  };

  // "Mis obras asignadas" - Filter for current user
  const misObrasAsignadas = obras.filter(obra =>
    obra.usuarioAsignado === usuarioActual?.id &&
    obra.estado !== 'Finalizadas' &&
    obra.estado !== 'Rechazadas'
  );

  // Apply mis obras filter
  let misObrasFilteradas = misObrasAsignadas;
  if (misObrasFilter === 'alerta') {
    misObrasFilteradas = misObrasAsignadas.filter(o => checkAlerta(o));
  } else if (misObrasFilter === 'sin-alerta') {
    misObrasFilteradas = misObrasAsignadas.filter(o => !checkAlerta(o));
  }

  // Sort mis obras by selected column
  misObrasFilteradas = [...misObrasFilteradas].sort((a, b) => {
    let compareValue = 0;

    if (sortColumn === 'codigo') {
      compareValue = a.codigo.localeCompare(b.codigo);
    } else if (sortColumn === 'nombre') {
      compareValue = a.nombre.localeCompare(b.nombre);
    } else if (sortColumn === 'dias') {
      compareValue = getDiasSinActualizar(a.fechaUltimaActualizacion) - getDiasSinActualizar(b.fechaUltimaActualizacion);
    } else if (sortColumn === 'estado') {
      const stages = ['Solicitud', 'En estudio de proyecto', 'Estimado', 'Cotización', 'Contratadas'];
      compareValue = stages.indexOf(a.estado) - stages.indexOf(b.estado);
    }

    return sortDirection === 'asc' ? compareValue : -compareValue;
  });

  return (
    <div className="p-8 space-y-6 bg-[#F1F3F5] min-h-screen dark:bg-slate-900">
      {usuarioActual && (
        <div className="space-y-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#2D3436] dark:text-slate-100 flex items-center gap-2 mb-2">
              <Building2 size={24} style={{ color: '#C8102E' }} />
              Mis Obras Asignadas
            </h1>
            <p className="text-sm text-[#636E72] dark:text-slate-400">
              Proyectos asignados a {usuarioActual.nombre} • {misObrasFilteradas.length} de {misObrasAsignadas.length} obras
            </p>
          </div>

          {/* Filters and Sort Controls */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-4 border border-[#E0E0E0] dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setMisObrasFilter('todas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  misObrasFilter === 'todas'
                    ? 'bg-[#C8102E] text-white'
                    : 'bg-[#F1F3F5] dark:bg-slate-700 text-[#2D3436] dark:text-slate-100 hover:bg-[#E0E0E0]'
                }`}
              >
                Todas ({misObrasAsignadas.length})
              </button>
              <button
                onClick={() => setMisObrasFilter('alerta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  misObrasFilter === 'alerta'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                En Alerta ({misObrasAsignadas.filter(o => checkAlerta(o)).length})
              </button>
              <button
                onClick={() => setMisObrasFilter('sin-alerta')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  misObrasFilter === 'sin-alerta'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Sin Alerta ({misObrasAsignadas.filter(o => !checkAlerta(o)).length})
              </button>
            </div>

            <p className="sm:ml-auto text-xs text-[#636E72] dark:text-slate-400 font-medium flex items-center gap-1">
              <span>Clickea en los títulos para ordenar</span>
            </p>
          </div>

          {/* Obras Table */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0] dark:border-slate-700 shadow-sm overflow-hidden">
            {misObrasFilteradas.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
                <p className="text-sm font-bold text-[#2D3436] dark:text-slate-100">
                  {misObrasFilter === 'alerta' ? '¡Sin obras en alerta!' : '¡Todo al día!'}
                </p>
                <p className="text-xs text-[#636E72] dark:text-slate-400">
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
                  <thead className="bg-[#F1F3F5] dark:bg-slate-700/50 border-b border-[#E0E0E0] dark:border-slate-700">
                    <tr>
                      <th
                        onClick={() => handleColumnSort('codigo')}
                        className="px-4 py-3 text-left font-bold text-[#2D3436] dark:text-slate-100 cursor-pointer hover:bg-[#E0E0E0] dark:hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
                      >
                        Código <SortIcon column="codigo" />
                      </th>
                      <th
                        onClick={() => handleColumnSort('nombre')}
                        className="px-4 py-3 text-left font-bold text-[#2D3436] dark:text-slate-100 cursor-pointer hover:bg-[#E0E0E0] dark:hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
                      >
                        Proyecto <SortIcon column="nombre" />
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436] dark:text-slate-100">Cliente</th>
                      <th
                        onClick={() => handleColumnSort('estado')}
                        className="px-4 py-3 text-left font-bold text-[#2D3436] dark:text-slate-100 cursor-pointer hover:bg-[#E0E0E0] dark:hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
                      >
                        Estadio <SortIcon column="estado" />
                      </th>
                      <th
                        onClick={() => handleColumnSort('dias')}
                        className="px-4 py-3 text-left font-bold text-[#2D3436] dark:text-slate-100 cursor-pointer hover:bg-[#E0E0E0] dark:hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
                      >
                        Días <SortIcon column="dias" />
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-[#2D3436] dark:text-slate-100">Estado</th>
                      <th className="px-4 py-3 text-center font-bold text-[#2D3436] dark:text-slate-100">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E0E0E0] dark:divide-slate-700">
                    {misObrasFilteradas.map((obra) => {
                      const dias = getDiasSinActualizar(obra.fechaUltimaActualizacion);
                      const enAlerta = checkAlerta(obra);
                      const cliente = obras.find(o => o.id === obra.id)?.clienteId || 'N/A';

                      return (
                        <tr key={obra.id} className="hover:bg-[#F9F9F9] dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#C8102E]">{obra.codigo}</td>
                          <td className="px-4 py-3 font-bold text-[#2D3436] dark:text-slate-100 truncate max-w-xs">{obra.nombre}</td>
                          <td className="px-4 py-3 text-[#636E72] dark:text-slate-400">Cliente</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                              {obra.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#2D3436] dark:text-slate-100 font-bold">{dias}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              enAlerta
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700'
                            }`}>
                              {enAlerta ? 'Con Alerta' : 'Sin Alerta'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => onNavigateToObra(obra.id)}
                              className="px-2 py-1 rounded-lg text-[#C8102E] dark:text-[#FF6B6B] hover:bg-[#F1F3F5] dark:hover:bg-slate-700 transition-all font-bold text-[11px]"
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
    </div>
  );
};
