import React, { useState, useEffect } from 'react';
import { Obra, Cliente, FunnelStage, Region, EquipmentType, HardwareSpecs } from '../types';

interface ModalObraProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveObra: (obra: Obra) => void;
  clientes: Cliente[];
  editingObra?: Obra | null;
}

export const ModalObra: React.FC<ModalObraProps> = ({
  isOpen,
  onClose,
  onSaveObra,
  clientes,
  editingObra
}) => {
  const [formObra, setFormObra] = useState<Partial<Obra>>({
    codigo: 'A-5300',
    nombre: '',
    region: 'Argentina',
    clienteId: clientes[0]?.id || '',
    montoUSD: 500000,
    tipoEquipo: 'Ascensor de Pasajeros',
    cantidadEquipos: 4,
    estado: 'Cotización',
    responsable: 'Lic. Martín Gómez',
    observaciones: '',
    hardwareSpecs: {
      velocidadMS: 1.75,
      paradas: 15,
      tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
      capacidadKg: 1000,
      modelo: 'Fujitec ZEXIA MRL'
    }
  });

  useEffect(() => {
    if (editingObra) {
      setFormObra(editingObra);
    } else {
      setFormObra({
        codigo: `A-${Math.floor(4500 + Math.random() * 1000)}`,
        nombre: '',
        region: 'Argentina',
        clienteId: clientes[0]?.id || '',
        montoUSD: 650000,
        tipoEquipo: 'Ascensor de Pasajeros',
        cantidadEquipos: 4,
        estado: 'Cotización',
        responsable: 'Lic. Martín Gómez',
        observaciones: 'Nueva oportunidad comercial ingresada al CRM.',
        hardwareSpecs: {
          velocidadMS: 2.0,
          paradas: 20,
          tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
          capacidadKg: 1000,
          modelo: 'Fujitec ZEXIA'
        }
      });
    }
  }, [editingObra, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObra.nombre) return;

    const hoyISO = new Date().toISOString().split('T')[0];

    const obraFinal: Obra = {
      id: editingObra ? editingObra.id : `obr-${Date.now()}`,
      codigo: formObra.codigo || 'A-5000',
      nombre: formObra.nombre || '',
      region: (formObra.region as 'Argentina' | 'Uruguay') || 'Argentina',
      clienteId: formObra.clienteId || clientes[0]?.id || 'cli-1',
      montoUSD: Number(formObra.montoUSD) || 500000,
      tipoEquipo: (formObra.tipoEquipo as EquipmentType) || 'Ascensor de Pasajeros',
      cantidadEquipos: Number(formObra.cantidadEquipos) || 1,
      estado: (formObra.estado as FunnelStage) || 'Cotización',
      fechaIngreso: editingObra ? editingObra.fechaIngreso : hoyISO,
      fechaUltimaActualizacion: hoyISO,
      observaciones: formObra.observaciones || '',
      responsable: formObra.responsable || 'Lic. Martín Gómez',
      hardwareSpecs: formObra.hardwareSpecs || {
        velocidadMS: 1.75,
        paradas: 10,
        tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
        capacidadKg: 1000,
        modelo: 'Fujitec ZEXIA'
      }
    };

    onSaveObra(obraFinal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-2xl w-full p-8 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-4">
          <div>
            <h3 className="text-xl font-black text-[#2D3436]">
              {editingObra ? `Editar Obra: ${editingObra.codigo}` : 'Registrar Nueva Obra Comercial'}
            </h3>
            <p className="text-xs text-[#B2BEC3] font-semibold mt-1 uppercase tracking-wide">
              {editingObra ? 'Actualizar datos de la obra existente' : 'Crear nueva oportunidad comercial'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Obra Basic Info */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Código de Obra *</label>
              <input
                type="text"
                required
                value={formObra.codigo}
                onChange={(e) => setFormObra({...formObra, codigo: e.target.value})}
                className="w-full p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl font-mono font-black text-[#C8102E]"
                id="input-modal-codigo"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-bold text-[#2D3436] mb-1">Nombre del Proyecto / Obra *</label>
              <input
                type="text"
                required
                placeholder="Ej: TORRE ALVEAR MADERO"
                value={formObra.nombre}
                onChange={(e) => setFormObra({...formObra, nombre: e.target.value})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
                id="input-modal-nombre"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Región / País</label>
              <select
                value={formObra.region}
                onChange={(e) => setFormObra({...formObra, region: e.target.value as any})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
              >
                <option value="Argentina">🇦🇷 Argentina</option>
                <option value="Uruguay">🇺🇾 Uruguay</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Cliente Asignado</label>
              <select
                value={formObra.clienteId}
                onChange={(e) => setFormObra({...formObra, clienteId: e.target.value})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.razonSocial}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Estado del Funnel</label>
              <select
                value={formObra.estado}
                onChange={(e) => setFormObra({...formObra, estado: e.target.value as any})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-bold text-[#2D3436]"
              >
                <option value="Cotización">Cotización</option>
                <option value="Presentada">Presentada</option>
                <option value="En Negociación">En Negociación</option>
                <option value="Adjudicada">Adjudicada</option>
                <option value="Pérdida">Pérdida</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Monto Presupuesto (USD) *</label>
              <input
                type="number"
                required
                value={formObra.montoUSD}
                onChange={(e) => setFormObra({...formObra, montoUSD: Number(e.target.value)})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Tipo de Equipo</label>
              <select
                value={formObra.tipoEquipo}
                onChange={(e) => setFormObra({...formObra, tipoEquipo: e.target.value as any})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-semibold text-[#2D3436]"
              >
                <option value="Ascensor de Pasajeros">Ascensor de Pasajeros</option>
                <option value="Ascensor de Carga / Montacargas">Ascensor de Carga / Montacargas</option>
                <option value="Alta Velocidad">Alta Velocidad</option>
                <option value="Escalera Mecánica / Rampa">Escalera Mecánica / Rampa</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#2D3436] mb-1">Cantidad de Unidades</label>
              <input
                type="number"
                value={formObra.cantidadEquipos}
                onChange={(e) => setFormObra({...formObra, cantidadEquipos: Number(e.target.value)})}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl font-extrabold text-[#2D3436]"
              />
            </div>
          </div>

          {/* HARDWARE SPECS SUB-FORM */}
          <div className="p-3.5 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0] space-y-2">
            <span className="font-black text-[#2D3436] uppercase tracking-wider text-[11px] block">
              Ficha Técnica de Hardware Elevador (Fujitec)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-[#636E72] mb-1">Modelo Fujitec</label>
                <input
                  type="text"
                  value={formObra.hardwareSpecs?.modelo}
                  onChange={(e) => setFormObra({
                    ...formObra,
                    hardwareSpecs: { ...formObra.hardwareSpecs!, modelo: e.target.value }
                  })}
                  className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg font-extrabold text-[#2D3436]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#636E72] mb-1">Velocidad (m/s)</label>
                <input
                  type="number"
                  step="0.25"
                  value={formObra.hardwareSpecs?.velocidadMS}
                  onChange={(e) => setFormObra({
                    ...formObra,
                    hardwareSpecs: { ...formObra.hardwareSpecs!, velocidadMS: Number(e.target.value) }
                  })}
                  className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg font-extrabold text-[#2D3436]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#636E72] mb-1">Paradas</label>
                <input
                  type="number"
                  value={formObra.hardwareSpecs?.paradas}
                  onChange={(e) => setFormObra({
                    ...formObra,
                    hardwareSpecs: { ...formObra.hardwareSpecs!, paradas: Number(e.target.value) }
                  })}
                  className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg font-extrabold text-[#2D3436]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block font-bold text-[#636E72] mb-1">Tipo Sala Máquinas</label>
                <select
                  value={formObra.hardwareSpecs?.tipoSalaMaquinas}
                  onChange={(e) => setFormObra({
                    ...formObra,
                    hardwareSpecs: { ...formObra.hardwareSpecs!, tipoSalaMaquinas: e.target.value as any }
                  })}
                  className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg font-bold text-[#2D3436]"
                >
                  <option value="Sin Sala de Máquinas (MRL)">Sin Sala de Máquinas (MRL)</option>
                  <option value="Con Sala de Máquinas">Con Sala de Máquinas</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#636E72] mb-1">Capacidad (Kg)</label>
                <input
                  type="number"
                  value={formObra.hardwareSpecs?.capacidadKg}
                  onChange={(e) => setFormObra({
                    ...formObra,
                    hardwareSpecs: { ...formObra.hardwareSpecs!, capacidadKg: Number(e.target.value) }
                  })}
                  className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg font-extrabold text-[#2D3436]"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0]">
            <label className="block font-extrabold text-[#2D3436] mb-2 uppercase tracking-wide text-[11px]">Notas & Observaciones Comerciales</label>
            <textarea
              rows={3}
              placeholder="Agregar notas sobre la oportunidad, observaciones técnicas, o estado actual..."
              value={formObra.observaciones}
              onChange={(e) => setFormObra({...formObra, observaciones: e.target.value})}
              className="w-full p-3 bg-white border border-[#E0E0E0] rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            />
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
              id="btn-save-obra-modal"
            >
              Guardar Obra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
