import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Equipo, EquipmentType } from '../types';

interface ModalEquipoProps {
  isOpen: boolean;
  onClose: () => void;
  equipo?: Equipo | null;
  onSaveEquipo: (equipo: Equipo) => void;
}

export const ModalEquipo: React.FC<ModalEquipoProps> = ({
  isOpen,
  onClose,
  equipo,
  onSaveEquipo
}) => {
  const [formEquipo, setFormEquipo] = useState<Partial<Equipo>>({
    nombre: '',
    tipo: 'Ascensor de Pasajeros',
    velocidadMS: 2.0,
    paradas: 20,
    tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
    capacidadKg: 1000,
    modelo: ''
  });

  useEffect(() => {
    if (equipo) {
      setFormEquipo(equipo);
    } else {
      setFormEquipo({
        nombre: '',
        tipo: 'Ascensor de Pasajeros',
        velocidadMS: 2.0,
        paradas: 20,
        tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
        capacidadKg: 1000,
        modelo: ''
      });
    }
  }, [equipo, isOpen]);

  if (!isOpen) return null;

  const generateCodigoUnico = (nombre: string, tipo: EquipmentType): string => {
    const prefix = 'FJT';
    const typeMap: Record<EquipmentType, string> = {
      'Todos': 'GEN',
      'Ascensor de Pasajeros': 'PASS',
      'Ascensor de Carga / Montacargas': 'CARGA',
      'Alta Velocidad': 'HV',
      'Escalera Mecánica / Rampa': 'ESC'
    };
    const typeCode = typeMap[tipo] || 'GEN';
    const modelCode = nombre.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${typeCode}-${modelCode}-${timestamp}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquipo.nombre || !formEquipo.modelo) return;

    const equipoFinal: Equipo = {
      id: equipo ? equipo.id : `eqp-${Date.now()}`,
      codigoUnico: equipo?.codigoUnico || generateCodigoUnico(formEquipo.nombre, formEquipo.tipo as EquipmentType),
      nombre: formEquipo.nombre || '',
      tipo: (formEquipo.tipo as EquipmentType) || 'Ascensor de Pasajeros',
      velocidadMS: Number(formEquipo.velocidadMS) || 2.0,
      paradas: Number(formEquipo.paradas) || 20,
      tipoSalaMaquinas: (formEquipo.tipoSalaMaquinas as 'Con Sala de Máquinas' | 'Sin Sala de Máquinas (MRL)') || 'Sin Sala de Máquinas (MRL)',
      capacidadKg: Number(formEquipo.capacidadKg) || 1000,
      modelo: formEquipo.modelo || ''
    };

    onSaveEquipo(equipoFinal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-4">
          <div>
            <h3 className="text-xl font-black text-[#2D3436]">
              {equipo ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
            </h3>
            <p className="text-xs text-[#B2BEC3] font-semibold mt-1 uppercase tracking-wide">
              {equipo ? 'Actualizar especificaciones' : 'Crear nuevo equipo Fujitec'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Nombre del Equipo *</label>
              <input
                type="text"
                required
                placeholder="Ej: Fujitec ZEXIA MRL 2.5m/s"
                value={formEquipo.nombre}
                onChange={(e) => setFormEquipo({...formEquipo, nombre: e.target.value})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Modelo Fujitec *</label>
              <input
                type="text"
                required
                placeholder="Ej: Fujitec ZEXIA"
                value={formEquipo.modelo}
                onChange={(e) => setFormEquipo({...formEquipo, modelo: e.target.value})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D3436] mb-1">Tipo de Equipo</label>
            <select
              value={formEquipo.tipo}
              onChange={(e) => setFormEquipo({...formEquipo, tipo: e.target.value as any})}
              className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
            >
              <option value="Ascensor de Pasajeros">Ascensor de Pasajeros</option>
              <option value="Ascensor de Carga / Montacargas">Ascensor de Carga / Montacargas</option>
              <option value="Alta Velocidad">Alta Velocidad</option>
              <option value="Escalera Mecánica / Rampa">Escalera Mecánica / Rampa</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Velocidad (m/s)</label>
              <input
                type="number"
                step="0.1"
                value={formEquipo.velocidadMS}
                onChange={(e) => setFormEquipo({...formEquipo, velocidadMS: Number(e.target.value)})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Paradas</label>
              <input
                type="number"
                value={formEquipo.paradas}
                onChange={(e) => setFormEquipo({...formEquipo, paradas: Number(e.target.value)})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Capacidad (Kg)</label>
              <input
                type="number"
                value={formEquipo.capacidadKg}
                onChange={(e) => setFormEquipo({...formEquipo, capacidadKg: Number(e.target.value)})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D3436] mb-1">Tipo de Sala de Máquinas</label>
            <select
              value={formEquipo.tipoSalaMaquinas}
              onChange={(e) => setFormEquipo({...formEquipo, tipoSalaMaquinas: e.target.value as any})}
              className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
            >
              <option value="Sin Sala de Máquinas (MRL)">Sin Sala de Máquinas (MRL)</option>
              <option value="Con Sala de Máquinas">Con Sala de Máquinas</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#F1F3F5]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E0E0E0] transition-colors font-bold text-[#2D3436] text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg font-extrabold text-white shadow-md hover:bg-[#A60D26] transition-all text-sm"
              style={{ backgroundColor: '#C8102E' }}
            >
              {equipo ? 'Actualizar Equipo' : 'Crear Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
