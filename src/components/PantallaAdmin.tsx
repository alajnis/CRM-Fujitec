import React, { useState, useEffect } from 'react';
import { Settings, DollarSign, Target, TrendingUp, Save, Lock, Plus, Trash2, Edit3, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Equipo } from '../types';
import { ModalEquipo } from './ModalEquipo';

interface BudgetConfig {
  año: number;
  montoAnualUSD: number;
  mesesUSD: number[];
  unidadesAnual: number;
  unidadesMeses: number[];
  rentabilidadPorcentaje: number;
}

interface PantallaAdminProps {
  budgetConfigs: BudgetConfig[];
  onSaveBudgetConfig: (config: BudgetConfig) => void;
  equipos: Equipo[];
  onSaveEquipo: (equipo: Equipo) => void;
  onDeleteEquipo: (equipoId: string) => void;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const PantallaAdmin: React.FC<PantallaAdminProps> = ({ budgetConfigs, onSaveBudgetConfig, equipos, onSaveEquipo, onDeleteEquipo }) => {
  const { isSuperuser } = useAuth();

  if (!isSuperuser()) {
    return (
      <div className="p-8 bg-[#F1F3F5] min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 text-center space-y-4 max-w-md shadow-lg border border-[#E0E0E0]">
          <Lock size={48} className="text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-[#2D3436]">Acceso Restringido</h2>
          <p className="text-[#636E72] text-sm">
            La sección de Configuración solo está disponible para superusuarios.
          </p>
          <p className="text-[#B2BEC3] text-xs">
            Contacta con tu administrador si necesitas acceso.
          </p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalEquipoOpen, setIsModalEquipoOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);

  const initialMesesUSD = Array(12).fill(708333);
  const initialUnidadesMeses = Array(12).fill(7);

  const defaultConfig: BudgetConfig = {
    año: selectedYear,
    montoAnualUSD: 8500000,
    mesesUSD: initialMesesUSD,
    unidadesAnual: 80,
    unidadesMeses: initialUnidadesMeses,
    rentabilidadPorcentaje: 22
  };

  const currentConfig = budgetConfigs.find(c => c.año === selectedYear) || { ...defaultConfig, año: selectedYear };
  const [config, setConfig] = useState<BudgetConfig>(currentConfig);

  useEffect(() => {
    setConfig(currentConfig);
  }, [selectedYear]);

  // Calcular suma de meses
  const totalFromMeses = config.mesesUSD.reduce((sum, val) => sum + val, 0);
  const totalUnidadesFromMeses = config.unidadesMeses.reduce((sum, val) => sum + val, 0);

  // Distribuir valor entre 12 meses, asignando residuo a primeros meses
  const distributeValue = (total: number) => {
    const baseAmount = Math.floor(total / 12);
    const remainder = total % 12;
    const newMeses = Array(12).fill(baseAmount);
    // Asignar el residuo a los primeros meses
    for (let i = 0; i < remainder; i++) {
      newMeses[i] += 1;
    }
    return newMeses;
  };

  // Cuando cambia el total anual, distribuir en partes iguales
  const handleMontoAnualChange = (value: number) => {
    const newMesesUSD = distributeValue(value);
    setConfig({
      ...config,
      montoAnualUSD: value,
      mesesUSD: newMesesUSD
    });
  };

  // Cuando cambia un mes, actualizar el total
  const handleMesChange = (index: number, value: number) => {
    const newMesesUSD = [...config.mesesUSD];
    newMesesUSD[index] = value;
    const newTotal = newMesesUSD.reduce((sum, val) => sum + val, 0);
    setConfig({
      ...config,
      mesesUSD: newMesesUSD,
      montoAnualUSD: newTotal
    });
  };

  // Cuando cambia el total de unidades, distribuir en partes iguales
  const handleUnidadesAnualChange = (value: number) => {
    const newUnidadesMeses = distributeValue(value);
    setConfig({
      ...config,
      unidadesAnual: value,
      unidadesMeses: newUnidadesMeses
    });
  };

  // Cuando cambia un mes de unidades, actualizar el total
  const handleUnidadesMesChange = (index: number, value: number) => {
    const newUnidadesMeses = [...config.unidadesMeses];
    newUnidadesMeses[index] = value;
    const newTotal = newUnidadesMeses.reduce((sum, val) => sum + val, 0);
    setConfig({
      ...config,
      unidadesMeses: newUnidadesMeses,
      unidadesAnual: newTotal
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveBudgetConfig(config);
      setIsSaving(false);
    }, 500);
  };

  return (
    <div className="p-8 space-y-8 bg-[#F1F3F5] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Settings size={28} className="text-[#C8102E]" />
          <div>
            <h1 className="text-3xl font-black text-[#2D3436]">Panel de Administración</h1>
            <p className="text-sm text-[#636E72] font-medium mt-0.5">Configuración de Variables de Presupuesto</p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-[#636E72]">Año Fiscal:</label>
          <select
            value={selectedYear}
            onChange={(e) => {
              const newYear = parseInt(e.target.value);
              setSelectedYear(newYear);
              const existingConfig = budgetConfigs.find(c => c.año === newYear);
              setConfig(existingConfig || { ...defaultConfig, año: newYear });
            }}
            className="px-3 py-2 bg-white border border-[#E0E0E0] rounded-lg font-bold text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Monto USD Section */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md p-6 space-y-5">
        <div className="flex items-center gap-2">
          <DollarSign size={20} className="text-[#C8102E]" />
          <h3 className="text-lg font-extrabold text-[#2D3436]">Objetivo de Monto (USD)</h3>
        </div>

        {/* Total Anual */}
        <div className="bg-[#F1F3F5] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#636E72]">Monto Total Anual (USD)</label>
            <span className="text-xs font-bold text-[#C8102E]">Total: ${config.montoAnualUSD.toLocaleString('es-AR')}</span>
          </div>
          <input
            type="number"
            value={config.montoAnualUSD}
            onChange={(e) => handleMontoAnualChange(Number(e.target.value))}
            className="w-full p-3 bg-white border-2 border-[#C8102E] rounded-xl text-sm font-bold text-[#2D3436] focus:outline-none"
          />
          <p className="text-xs text-[#B2BEC3] italic">Al cambiar esto, se distribuye automáticamente en partes iguales en todos los meses</p>
        </div>

        {/* Meses Grid */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#636E72] uppercase">Distribución Mensual (editable)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MESES.map((mes, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-semibold text-[#636E72] block">{mes}</label>
                <input
                  type="number"
                  value={config.mesesUSD[idx]}
                  onChange={(e) => handleMesChange(idx, Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-2 text-xs text-blue-900 font-semibold">
            ✓ Suma de meses: ${totalFromMeses.toLocaleString('es-AR')} (debe coincidir con total anual)
          </div>
        </div>
      </div>

      {/* Unidades Section */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-[#C8102E]" />
          <h3 className="text-lg font-extrabold text-[#2D3436]">Objetivo de Unidades</h3>
        </div>

        {/* Total Anual */}
        <div className="bg-[#F1F3F5] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#636E72]">Unidades Totales Anual</label>
            <span className="text-xs font-bold text-[#C8102E]">Total: {config.unidadesAnual}</span>
          </div>
          <input
            type="number"
            value={config.unidadesAnual}
            onChange={(e) => handleUnidadesAnualChange(Number(e.target.value))}
            className="w-full p-3 bg-white border-2 border-[#C8102E] rounded-xl text-sm font-bold text-[#2D3436] focus:outline-none"
          />
          <p className="text-xs text-[#B2BEC3] italic">Al cambiar esto, se distribuye automáticamente en partes iguales en todos los meses</p>
        </div>

        {/* Meses Grid */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#636E72] uppercase">Distribución Mensual (editable)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MESES.map((mes, idx) => (
              <div key={idx} className="space-y-1">
                <label className="text-xs font-semibold text-[#636E72] block">{mes}</label>
                <input
                  type="number"
                  value={config.unidadesMeses[idx]}
                  onChange={(e) => handleUnidadesMesChange(idx, Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            ))}
          </div>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-2 text-xs text-blue-900 font-semibold">
            ✓ Suma de meses: {totalUnidadesFromMeses} (debe coincidir con total anual)
          </div>
        </div>
      </div>

      {/* Rentabilidad */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md p-6 space-y-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-[#C8102E]" />
          <h3 className="text-lg font-extrabold text-[#2D3436]">Rentabilidad Budget</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-[#636E72]">Rentabilidad Esperada (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={config.rentabilidadPorcentaje}
              onChange={(e) => setConfig({ ...config, rentabilidadPorcentaje: Number(e.target.value) })}
              className="flex-1 p-3 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-sm font-bold text-[#2D3436] focus:outline-none focus:border-[#C8102E]"
            />
            <span className="text-xs font-bold text-[#636E72] min-w-fit">%</span>
          </div>
          <p className="text-xs text-[#B2BEC3] italic">Margen de rentabilidad anual esperado para operaciones</p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#F1F3F5] rounded-xl p-5 space-y-3 border border-[#E0E0E0]">
        <p className="text-sm font-bold text-[#2D3436]">📊 Resumen de Targets:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 border border-[#E0E0E0]">
            <p className="text-xs text-[#636E72] font-semibold">Monto Anual</p>
            <p className="text-lg font-black text-[#C8102E]">${config.montoAnualUSD.toLocaleString('es-AR')}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#E0E0E0]">
            <p className="text-xs text-[#636E72] font-semibold">Unidades Anual</p>
            <p className="text-lg font-black text-[#C8102E]">{config.unidadesAnual}</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-[#E0E0E0]">
            <p className="text-xs text-[#636E72] font-semibold">Rentabilidad</p>
            <p className="text-lg font-black text-[#C8102E]">{config.rentabilidadPorcentaje}%</p>
          </div>
        </div>
      </div>

      {/* EQUIPOS SECTION */}
      <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-[#C8102E]" />
            <h3 className="text-lg font-extrabold text-[#2D3436]">Gestión de Equipos Fujitec</h3>
          </div>
          <button
            onClick={() => {
              setEditingEquipo(null);
              setIsModalEquipoOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C8102E] text-white font-bold text-xs hover:bg-[#A60D26] transition-all"
          >
            <Plus size={14} />
            Nuevo Equipo
          </button>
        </div>

        <div className="space-y-2">
          {equipos.length === 0 ? (
            <p className="text-xs text-[#B2BEC3] italic">No hay equipos registrados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {equipos.map((eq) => (
                <div key={eq.id} className="flex items-center justify-between p-3 bg-[#F1F3F5] rounded-lg border border-[#E0E0E0]">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-[#2D3436]">{eq.nombre}</p>
                    <div className="flex gap-4 text-xs text-[#636E72] mt-1">
                      <span>Modelo: {eq.modelo}</span>
                      <span>Vel: {eq.velocidadMS} m/s</span>
                      <span>Cap: {eq.capacidadKg} kg</span>
                      <span className="text-[#C8102E] font-semibold">{eq.codigoUnico}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingEquipo(eq);
                        setIsModalEquipoOpen(true);
                      }}
                      className="p-2 text-[#636E72] hover:text-[#C8102E] hover:bg-white rounded-lg transition-all"
                      title="Editar equipo"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDeleteEquipo(eq.id)}
                      className="p-2 text-[#636E72] hover:text-red-600 hover:bg-white rounded-lg transition-all"
                      title="Eliminar equipo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-extrabold text-sm transition-all hover:bg-[#A60D26] active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: '#C8102E' }}
        >
          <Save size={16} />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      {/* Modal Equipo */}
      <ModalEquipo
        isOpen={isModalEquipoOpen}
        onClose={() => setIsModalEquipoOpen(false)}
        equipo={editingEquipo}
        onSaveEquipo={(eq) => {
          onSaveEquipo(eq);
          setIsModalEquipoOpen(false);
        }}
      />

      {/* Info Box */}
      <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-xs text-green-900 font-medium space-y-1">
        <p>💡 <span className="font-bold">Cómo funciona:</span> Cambia el total anual y se distribuye automáticamente. O edita los meses individuales y el total se actualiza. La suma siempre debe coincidir.</p>
      </div>
    </div>
  );
};
