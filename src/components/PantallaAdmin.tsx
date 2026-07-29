import React, { useState } from 'react';
import { Settings, DollarSign, Target, TrendingUp, Save } from 'lucide-react';

interface BudgetConfig {
  montoAnualUSD: number;
  mesesUSD: number[];
  unidadesAnual: number;
  unidadesMeses: number[];
  rentabilidadPorcentaje: number;
}

interface PantallaAdminProps {
  onSaveBudgetConfig: (config: BudgetConfig) => void;
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const PantallaAdmin: React.FC<PantallaAdminProps> = ({ onSaveBudgetConfig }) => {
  const initialMesesUSD = Array(12).fill(708333);
  const initialUnidadesMeses = Array(12).fill(7);

  const [config, setConfig] = useState<BudgetConfig>({
    montoAnualUSD: 8500000,
    mesesUSD: initialMesesUSD,
    unidadesAnual: 80,
    unidadesMeses: initialUnidadesMeses,
    rentabilidadPorcentaje: 22
  });

  const [isSaving, setIsSaving] = useState(false);

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
      <div className="flex items-center gap-3">
        <Settings size={28} className="text-[#C8102E]" />
        <div>
          <h1 className="text-3xl font-black text-[#2D3436]">Panel de Administración</h1>
          <p className="text-sm text-[#636E72] font-medium mt-0.5">Configuración de Variables de Presupuesto</p>
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

      {/* Info Box */}
      <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-xs text-green-900 font-medium space-y-1">
        <p>💡 <span className="font-bold">Cómo funciona:</span> Cambia el total anual y se distribuye automáticamente. O edita los meses individuales y el total se actualiza. La suma siempre debe coincidir.</p>
      </div>
    </div>
  );
};
