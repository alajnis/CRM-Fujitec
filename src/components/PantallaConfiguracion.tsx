import React, { useState } from 'react';
import { Settings, X, Save, AlertTriangle, Plus, Edit3, ToggleRight, ToggleLeft, DollarSign, Target } from 'lucide-react';
import { FunnelStage, ConfiguracionDiasEtapa, Usuario } from '../types';
import { useAuth } from '../context/AuthContext';
import { ModalUsuario } from './ModalUsuario';

interface PantallaConfiguracionProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDiasConfig: (config: ConfiguracionDiasEtapa[]) => void;
  onSaveBudgetConfig?: (config: any) => void;
  onAssignAllToAdmin?: () => Promise<void>;
}

const INITIAL_DIAS_CONFIG: ConfiguracionDiasEtapa[] = [
  { etapa: 'Solicitud', diasMaximosSinAccion: 7 },
  { etapa: 'En estudio de proyecto', diasMaximosSinAccion: 7 },
  { etapa: 'Estimado', diasMaximosSinAccion: 7 },
  { etapa: 'Cotización', diasMaximosSinAccion: 7 },
  { etapa: 'Contratadas', diasMaximosSinAccion: 7 },
  { etapa: 'Finalizadas', diasMaximosSinAccion: 7 },
  { etapa: 'Rechazadas', diasMaximosSinAccion: 7 }
];

export const PantallaConfiguracion: React.FC<PantallaConfiguracionProps> = ({
  isOpen,
  onClose,
  onSaveDiasConfig,
  onSaveBudgetConfig,
  onAssignAllToAdmin
}) => {
  const { usuarios, crearUsuario, actualizarUsuario, activarDesactivarUsuario } = useAuth();
  const [activeTab, setActiveTab] = useState<'dias' | 'usuarios' | 'presupuesto'>('dias');
  const [diasConfig, setDiasConfig] = useState<ConfiguracionDiasEtapa[]>(INITIAL_DIAS_CONFIG);
  const [isModalUsuarioOpen, setIsModalUsuarioOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  // Función para distribuir un valor entre 12 meses
  const distributeValue = (total: number) => {
    const baseAmount = Math.floor(total / 12);
    const remainder = total % 12;
    const newMeses = Array(12).fill(baseAmount);
    for (let i = 0; i < remainder; i++) {
      newMeses[i] += 1;
    }
    return newMeses;
  };

  const [budgetConfig, setBudgetConfig] = useState({
    año: new Date().getFullYear(),
    montoAnualUSD: 8500000,
    mesesUSD: distributeValue(8500000),
    unidadesAnual: 80,
    unidadesMeses: distributeValue(80),
    rentabilidadPorcentaje: 22
  });

  const handleSave = () => {
    onSaveDiasConfig(diasConfig);
    if (onSaveBudgetConfig) {
      onSaveBudgetConfig(budgetConfig);
    }
    onClose();
  };

  const handleUpdateDias = (etapa: FunnelStage, nuevosDias: number) => {
    setDiasConfig(prev =>
      prev.map(config =>
        config.etapa === etapa ? { ...config, diasMaximosSinAccion: nuevosDias } : config
      )
    );
  };

  const handleSaveUsuario = (usuario: Omit<Usuario, 'id'> | Usuario) => {
    if (usuarioEditando && 'id' in usuario) {
      actualizarUsuario(usuario.id, usuario);
    } else {
      crearUsuario(usuario as Omit<Usuario, 'id'>);
    }
    setIsModalUsuarioOpen(false);
    setUsuarioEditando(null);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setIsModalUsuarioOpen(true);
  };

  const handleNuevoUsuario = () => {
    setUsuarioEditando(null);
    setIsModalUsuarioOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <Settings size={24} className="text-[#C8102E]" />
            <div>
              <h2 className="text-xl font-bold text-[#2D3436]">Configuración</h2>
              <p className="text-xs text-[#B2BEC3] mt-0.5">Superadmin - Administración del Sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-[#F1F3F5] p-1.5 rounded-xl border border-[#E0E0E0] overflow-x-auto">
          <button
            onClick={() => setActiveTab('dias')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'dias'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            Días por Etapa
          </button>
          <button
            onClick={() => setActiveTab('presupuesto')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'presupuesto'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            Presupuesto Anual
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'usuarios'
                ? 'bg-white text-[#2D3436] shadow-xs border border-[#E0E0E0]'
                : 'text-[#636E72] hover:text-[#2D3436]'
            }`}
          >
            Gestión de Usuarios
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* TAB 1: Días máximos sin acción por etapa */}
          {activeTab === 'dias' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-[#2D3436]">Días máximos sin acción por etapa</h3>
                <p className="text-xs text-[#636E72] mt-1">
                  Configura el límite de días después del cual una obra genera una alerta temporal. Este valor se usa para calcular el estado de riesgo en el dashboard.
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-[#F1F3F5] rounded-2xl p-6">
              {diasConfig.map((config) => (
                <div key={config.etapa} className="flex items-center justify-between bg-white rounded-xl p-4 border border-[#E0E0E0]">
                  <label className="font-bold text-sm text-[#2D3436] flex-1">
                    {config.etapa}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={config.diasMaximosSinAccion}
                      onChange={(e) => handleUpdateDias(config.etapa, Math.max(1, parseInt(e.target.value) || 7))}
                      className="w-16 px-3 py-2 border border-[#E0E0E0] rounded-lg text-sm font-bold text-center focus:outline-none focus:border-[#C8102E]"
                    />
                    <span className="text-xs text-[#636E72] font-medium min-w-[40px]">días</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-900">ℹ️ Información importante</p>
              <p className="text-xs text-blue-800">
                Los cambios en esta configuración se aplicarán a todas las obras al momento de guardar. Las alertas se recalcularán en tiempo real basándose en estos nuevos límites.
              </p>
            </div>

            {/* Testing: Assign all to admin */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <button
                onClick={async () => {
                  setIsAssigning(true);
                  try {
                    await onAssignAllToAdmin?.();
                  } finally {
                    setIsAssigning(false);
                  }
                }}
                disabled={isAssigning}
                className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 transition-colors font-bold text-white text-sm"
              >
                {isAssigning ? '⏳ Asignando todas las obras al admin...' : '🔧 Asignar todas las obras al admin (Testing)'}
              </button>
            </div>
          </div>
          )}

          {/* TAB 2: Presupuesto Anual */}
          {activeTab === 'presupuesto' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <DollarSign size={16} className="text-emerald-500 mt-1 shrink-0" />
              <div>
                <h3 className="font-bold text-[#2D3436]">Presupuesto Anual y Plan de Equipos</h3>
                <p className="text-xs text-[#636E72] mt-1">
                  Configura el presupuesto anual en USD y la cantidad de equipos planeados para el año fiscal.
                </p>
              </div>
            </div>

            <div className="bg-[#F1F3F5] rounded-2xl p-6 space-y-4">
              <div className="bg-white rounded-xl p-4 border border-[#E0E0E0] space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#2D3436] mb-2">Año Fiscal</label>
                  <input
                    type="number"
                    value={budgetConfig.año}
                    onChange={(e) => setBudgetConfig({...budgetConfig, año: Number(e.target.value)})}
                    className="w-full p-3 border border-[#E0E0E0] rounded-lg text-sm font-bold focus:outline-none focus:border-[#C8102E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2D3436] mb-2">Monto Anual Planeado (USD)</label>
                  <input
                    type="number"
                    value={budgetConfig.montoAnualUSD}
                    onChange={(e) => {
                      const newMonto = Number(e.target.value);
                      setBudgetConfig({
                        ...budgetConfig,
                        montoAnualUSD: newMonto,
                        mesesUSD: distributeValue(newMonto)
                      });
                    }}
                    className="w-full p-3 border border-[#E0E0E0] rounded-lg text-sm font-bold focus:outline-none focus:border-[#C8102E]"
                  />
                  <p className="text-xs text-[#636E72] mt-1">Presupuesto total esperado para el año</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2D3436] mb-2">Equipos Planeados (Cantidad)</label>
                  <input
                    type="number"
                    value={budgetConfig.unidadesAnual}
                    onChange={(e) => {
                      const newUnidades = Number(e.target.value);
                      setBudgetConfig({
                        ...budgetConfig,
                        unidadesAnual: newUnidades,
                        unidadesMeses: distributeValue(newUnidades)
                      });
                    }}
                    className="w-full p-3 border border-[#E0E0E0] rounded-lg text-sm font-bold focus:outline-none focus:border-[#C8102E]"
                  />
                  <p className="text-xs text-[#636E72] mt-1">Cantidad total de equipos a vender este año</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-bold text-emerald-900">📊 Resumen</p>
                  <p className="text-xs text-emerald-800">
                    Presupuesto por equipo: <span className="font-bold">${(budgetConfig.montoAnualUSD / budgetConfig.unidadesAnual).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-900">ℹ️ Información importante</p>
              <p className="text-xs text-blue-800">
                Estos valores se usarán para calcular KPIs y el cumplimiento de la meta anual en el dashboard gerencial.
              </p>
            </div>
          </div>
          )}

          {/* TAB 3: Gestión de Usuarios */}
          {activeTab === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-[#2D3436]">Gestión de Usuarios</h3>
                  <p className="text-xs text-[#636E72] mt-1">
                    Crea, edita y administra los usuarios del sistema. Los usuarios activos pueden iniciar sesión.
                  </p>
                </div>
              </div>
              <button
                onClick={handleNuevoUsuario}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold text-xs shadow-md hover:bg-[#A60D26] transition-all bg-[#C8102E]"
              >
                <Plus size={14} />
                Nuevo Usuario
              </button>
            </div>

            {/* Users List */}
            <div className="bg-[#F1F3F5] rounded-2xl p-6 space-y-3">
              {usuarios.length === 0 ? (
                <p className="text-xs text-[#636E72] italic text-center py-8">No hay usuarios disponibles</p>
              ) : (
                usuarios.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-[#E0E0E0] hover:border-[#B2BEC3] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-[#2D3436]">{usuario.nombre}</p>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap ${
                          usuario.rol === 'superusuario'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {usuario.rol === 'superusuario' ? 'Superadmin' : 'Comercial'}
                        </span>
                      </div>
                      <p className="text-xs text-[#636E72] mt-1">{usuario.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => activarDesactivarUsuario(usuario.id, !usuario.activo)}
                        className="p-2 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-colors"
                        title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                      >
                        {usuario.activo ? (
                          <ToggleRight size={18} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={18} className="text-[#B2BEC3]" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditarUsuario(usuario)}
                        className="p-2 text-[#636E72] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-blue-900">ℹ️ Información importante</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Los usuarios desactivados no pueden iniciar sesión</li>
                <li>• El historial y las asignaciones se conservan siempre</li>
                <li>• Solo Superadmin puede crear/editar usuarios</li>
              </ul>
            </div>
          </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-[#F1F3F5] mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white shadow-md hover:bg-[#A60D26] transition-all text-sm"
            style={{ backgroundColor: '#C8102E' }}
          >
            <Save size={16} />
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Modal Usuario */}
      <ModalUsuario
        isOpen={isModalUsuarioOpen}
        onClose={() => {
          setIsModalUsuarioOpen(false);
          setUsuarioEditando(null);
        }}
        usuario={usuarioEditando}
        onSaveUsuario={handleSaveUsuario}
      />
    </div>
  );
};
