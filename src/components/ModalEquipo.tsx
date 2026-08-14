import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Equipo, EquipmentMainType } from '../types';

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
  const [formEquipo, setFormEquipo] = useState<Partial<Equipo>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicos: true,
    ascensor: true,
    escalera: true,
    checkboxes: false
  });

  useEffect(() => {
    if (equipo) {
      setFormEquipo(equipo);
    } else {
      setFormEquipo({
        tipo: 'Ascensor',
        velocidadMS: 2.0,
        paradas: 20,
        tipoSalaMaquinas: 'Sin Sala de Máquinas (MRL)',
        capacidadKg: 1000,
        capacidadPersonas: 8
      });
    }
  }, [equipo, isOpen]);

  if (!isOpen) return null;

  const generateCodigoUnico = (nombre: string, tipo: any): string => {
    const prefix = 'FJT';
    const typeMap: Record<string, string> = { 'Ascensor': 'ASC', 'Escalera': 'ESC', 'Rampa': 'RAM' };
    const typeCode = typeMap[tipo] || 'GEN';
    const modelCode = nombre.substring(0, 4).toUpperCase().replace(/\s/g, '');
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${typeCode}-${modelCode}-${timestamp}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEquipo.nombre || !formEquipo.modelo || !formEquipo.tipo) return;

    const equipoFinal: Equipo = {
      id: equipo?.id || `eqp-${Date.now()}`,
      codigoUnico: equipo?.codigoUnico || generateCodigoUnico(formEquipo.nombre!, formEquipo.tipo),
      nombre: formEquipo.nombre!,
      tipo: formEquipo.tipo as EquipmentMainType,
      modelo: formEquipo.modelo!,
      velocidadMS: Number(formEquipo.velocidadMS) || 2.0,
      paradas: Number(formEquipo.paradas) || 20,
      tipoSalaMaquinas: formEquipo.tipoSalaMaquinas as any,
      capacidadKg: Number(formEquipo.capacidadKg) || 1000,
      capacidadPersonas: Number(formEquipo.capacidadPersonas),
      ascensorNumero: formEquipo.ascensorNumero,
      pasadizoNumero: formEquipo.pasadizoNumero,
      codigoFabricacion: formEquipo.codigoFabricacion,
      alturaTotal: formEquipo.alturaTotal ? Number(formEquipo.alturaTotal) : undefined,
      recorrido: formEquipo.recorrido ? Number(formEquipo.recorrido) : undefined,
      anchoPasadizo: formEquipo.anchoPasadizo ? Number(formEquipo.anchoPasadizo) : undefined,
      profundidadPasadizo: formEquipo.profundidadPasadizo ? Number(formEquipo.profundidadPasadizo) : undefined,
      anchoCabina: formEquipo.anchoCabina ? Number(formEquipo.anchoCabina) : undefined,
      profundidadCabina: formEquipo.profundidadCabina ? Number(formEquipo.profundidadCabina) : undefined,
      altoCabina: formEquipo.altoCabina ? Number(formEquipo.altoCabina) : undefined,
      cantidadEquipos: formEquipo.cantidadEquipos ? Number(formEquipo.cantidadEquipos) : undefined,
      designacionPisos: formEquipo.designacionPisos,
      origenEquipo: formEquipo.origenEquipo,
      accesosFrente: formEquipo.accesosFrente ? Number(formEquipo.accesosFrente) : undefined,
      accesosContrafrente: formEquipo.accesosContrafrente ? Number(formEquipo.accesosContrafrente) : undefined,
      dobleAcceso: formEquipo.dobleAcceso,
      uso: formEquipo.uso,
      doorOP: formEquipo.doorOP ? Number(formEquipo.doorOP) : undefined,
      doorH: formEquipo.doorH ? Number(formEquipo.doorH) : undefined,
      contrapeso: formEquipo.contrapeso,
      ancho: formEquipo.ancho ? Number(formEquipo.ancho) : undefined,
      inclinacion: formEquipo.inclinacion ? Number(formEquipo.inclinacion) : undefined,
      rise: formEquipo.rise ? Number(formEquipo.rise) : undefined,
      escalonesPlanso: formEquipo.escalonesPlanso ? Number(formEquipo.escalonesPlanso) : undefined,
      cantidadTramos: formEquipo.cantidadTramos ? Number(formEquipo.cantidadTramos) : undefined,
      destino: formEquipo.destino,
      disposicionEquipos: formEquipo.disposicionEquipos,
      pisoIngreso: formEquipo.pisoIngreso,
      pisoSalida: formEquipo.pisoSalida,
      balustrada: formEquipo.balustrada,
      recepcionProvisoria: formEquipo.recepcionProvisoria,
      fechaRDP: formEquipo.fechaRDP,
      recepcionDefinitiva: formEquipo.recepcionDefinitiva,
      fechaRD: formEquipo.fechaRD,
      desmontaje: formEquipo.desmontaje,
      vigasSeparacion: formEquipo.vigasSeparacion,
      revestimientos: formEquipo.revestimientos,
      angulosEntrada: formEquipo.angulosEntrada,
      operacionContraIncendio: formEquipo.operacionContraIncendio,
      obraCivil: formEquipo.obraCivil,
      vonic: formEquipo.vonic,
      wtb: formEquipo.wtb,
      marmoleria: formEquipo.marmoleria,
      bgmSpeaker: formEquipo.bgmSpeaker,
      elvic: formEquipo.elvic,
      marcosConDintel: formEquipo.marcosConDintel,
      marcoCubreMochetas: formEquipo.marcoCubreMochetas,
      anchoDintel: formEquipo.anchoDintel ? Number(formEquipo.anchoDintel) : undefined,
      anchoMochetas: formEquipo.anchoMochetas ? Number(formEquipo.anchoMochetas) : undefined,
      eskalonerosA: formEquipo.eskalonerosA,
      portico: formEquipo.portico,
      ahorroEnergia: formEquipo.ahorroEnergia,
      ganchosEnLosa: formEquipo.ganchosEnLosa,
      detallesRevestimientos: formEquipo.detallesRevestimientos,
      observaciones: formEquipo.observaciones
    };

    onSaveEquipo(equipoFinal);
    onClose();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderInput = (label: string, value: any, key: keyof Equipo, type = 'text', step = undefined) => (
    <div className="flex-1">
      <label className="block text-xs font-bold text-[#2D3436] mb-1">{label}</label>
      <input
        type={type}
        step={step}
        value={value || ''}
        onChange={(e) => setFormEquipo({...formEquipo, [key]: e.target.value})}
        className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436]"
      />
    </div>
  );

  const renderCheckbox = (label: string, value: boolean | undefined, key: keyof Equipo) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => setFormEquipo({...formEquipo, [key]: e.target.checked})}
        className="w-4 h-4 rounded"
      />
      <span className="text-xs font-bold text-[#2D3436]">{label}</span>
    </label>
  );

  const SectionHeader = ({ title, sectionKey }: { title: string; sectionKey: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between bg-[#F1F3F5] hover:bg-[#E0E0E0] p-3 rounded-lg border border-[#E0E0E0] transition-all"
    >
      <span className="text-xs font-bold text-[#2D3436]">{title}</span>
      <ChevronDown size={16} className={`transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-[#2D3436]/50 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E0E0E0] shadow-2xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-[#F1F3F5]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#2D3436]">
                {equipo ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}
              </h3>
              <p className="text-xs text-[#B2BEC3] font-semibold mt-1 uppercase tracking-wide">
                Especificaciones técnicas Fujitec
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-[#B2BEC3] hover:text-[#2D3436] hover:bg-[#F1F3F5] rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* BÁSICOS */}
          <SectionHeader title="📋 Información Básica" sectionKey="basicos" />
          {expandedSections.basicos && (
            <div className="space-y-4 bg-[#F1F3F5] p-4 rounded-xl">
              <div className="grid grid-cols-3 gap-3">
                {renderInput('Nombre del Equipo *', formEquipo.nombre, 'nombre')}
                {renderInput('Modelo *', formEquipo.modelo, 'modelo')}
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#2D3436] mb-1">Tipo de Equipo *</label>
                  <select
                    value={formEquipo.tipo || ''}
                    onChange={(e) => setFormEquipo({...formEquipo, tipo: e.target.value as EquipmentMainType})}
                    className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436]"
                  >
                    <option value="Ascensor">Ascensor</option>
                    <option value="Escalera">Escalera</option>
                    <option value="Rampa">Rampa</option>
                  </select>
                </div>
              </div>
              {formEquipo.tipo === 'Ascensor' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {renderInput('ID U del Equipo', formEquipo.ascensorNumero, 'ascensorNumero')}
                    {renderInput('Pasadizo #', formEquipo.pasadizoNumero, 'pasadizoNumero')}
                    {renderInput('Código de Fabricación', formEquipo.codigoFabricacion, 'codigoFabricacion')}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#2D3436] mb-1">Uso de Equipo</label>
                      <select
                        value={formEquipo.uso || ''}
                        onChange={(e) => setFormEquipo({...formEquipo, uso: e.target.value as any})}
                        className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436]"
                      >
                        <option value="">Selecciona...</option>
                        <option value="Pasajeros">Pasajeros</option>
                        <option value="Montacargas">Montacargas</option>
                        <option value="Alta Velocidad">Alta Velocidad</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-[#2D3436] mb-1">Sala de Máquinas</label>
                      <select
                        value={formEquipo.tipoSalaMaquinas || ''}
                        onChange={(e) => setFormEquipo({...formEquipo, tipoSalaMaquinas: e.target.value as any})}
                        className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436]"
                      >
                        <option value="Sin Sala de Máquinas (MRL)">Sin Sala (MRL)</option>
                        <option value="Con Sala de Máquinas">Con Sala</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              {(formEquipo.tipo === 'Escalera' || formEquipo.tipo === 'Rampa') && (
                <div className="grid grid-cols-3 gap-3">
                  {renderInput('ID US ES/AW del Equipo', formEquipo.designacionPasadizo, 'designacionPasadizo')}
                  {renderInput('Origen de Equipo', formEquipo.origenEquipo, 'origenEquipo')}
                  {renderInput('Destino', formEquipo.destino, 'destino')}
                </div>
              )}
            </div>
          )}

          {/* ASCENSOR */}
          {formEquipo.tipo === 'Ascensor' && (
            <>
              <SectionHeader title="🛗 Especificaciones de Ascensor" sectionKey="ascensor" />
              {expandedSections.ascensor && (
                <div className="space-y-4 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Velocidad (m/s)', formEquipo.velocidadMS, 'velocidadMS', 'number', '0.1')}
                    {renderInput('Paradas', formEquipo.paradas, 'paradas', 'number')}
                    {renderInput('Capacidad (Kg)', formEquipo.capacidadKg, 'capacidadKg', 'number')}
                    {renderInput('Personas', formEquipo.capacidadPersonas, 'capacidadPersonas', 'number')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Altura Total (m)', formEquipo.alturaTotal, 'alturaTotal', 'number', '0.1')}
                    {renderInput('Recorrido (m)', formEquipo.recorrido, 'recorrido', 'number', '0.1')}
                    {renderInput('Altura Cabina (m)', formEquipo.altoCabina, 'altoCabina', 'number', '0.1')}
                    {renderInput('Zona Express', formEquipo.zonaExpress, 'zonaExpress')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Ancho Pasadizo (cm)', formEquipo.anchoPasadizo, 'anchoPasadizo', 'number')}
                    {renderInput('Prof. Pasadizo (cm)', formEquipo.profundidadPasadizo, 'profundidadPasadizo', 'number')}
                    {renderInput('Ancho Cabina (cm)', formEquipo.anchoCabina, 'anchoCabina', 'number')}
                    {renderInput('Prof. Cabina (cm)', formEquipo.profundidadCabina, 'profundidadCabina', 'number')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Accesos Frente', formEquipo.accesosFrente, 'accesosFrente', 'number')}
                    {renderInput('Accesos Contrafrente', formEquipo.accesosContrafrente, 'accesosContrafrente', 'number')}
                    {renderInput('Ancho Dintel (cm)', formEquipo.anchoDintel, 'anchoDintel', 'number')}
                    {renderInput('Ancho Mochetas (cm)', formEquipo.anchoMochetas, 'anchoMochetas', 'number')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Cantidad de Equipos', formEquipo.cantidadEquipos, 'cantidadEquipos', 'number')}
                    {renderInput('Designación de Pisos', formEquipo.designacionPisos, 'designacionPisos')}
                    {renderInput('Origen de Equipo', formEquipo.origenEquipo, 'origenEquipo')}
                    {renderInput('Contrapeso', formEquipo.contrapeso, 'contrapeso')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Grupo', formEquipo.grupo, 'grupo')}
                    {renderInput('Control', formEquipo.control, 'control')}
                    {renderInput('Maniobra', formEquipo.maniobra, 'maniobra')}
                    {renderInput('Tipo Apertura', formEquipo.tipoApertura, 'tipoApertura')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Door OP', formEquipo.doorOP, 'doorOP', 'number')}
                    {renderInput('Door H', formEquipo.doorH, 'doorH', 'number')}
                    {renderInput('Operador Puerta', formEquipo.operadorPuerta, 'operadorPuerta')}
                    {renderInput('Roping', formEquipo.roping, 'roping')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Guías Coche', formEquipo.guiasCoche, 'guiasCoche')}
                    {renderInput('Guías Contrapeso', formEquipo.guiasContrapeso, 'guiasContrapeso')}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {renderCheckbox('Doble Acceso', formEquipo.dobleAcceso, 'dobleAcceso')}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ESCALERA/RAMPA */}
          {(formEquipo.tipo === 'Escalera' || formEquipo.tipo === 'Rampa') && (
            <>
              <SectionHeader title="🪜 Especificaciones de Escalera/Rampa" sectionKey="escalera" />
              {expandedSections.escalera && (
                <div className="space-y-4 bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Rise/Desnivel (m)', formEquipo.rise, 'rise', 'number', '0.1')}
                    {renderInput('Ancho (cm)', formEquipo.ancho, 'ancho', 'number')}
                    {renderInput('Inclinación (°)', formEquipo.inclinacion, 'inclinacion', 'number')}
                    {renderInput('Escalones Planos', formEquipo.escalonesPlanso, 'escalonesPlanso', 'number')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Cantidad Tramos', formEquipo.cantidadTramos, 'cantidadTramos', 'number')}
                    {renderInput('Piso Ingreso', formEquipo.pisoIngreso, 'pisoIngreso')}
                    {renderInput('Piso Salida', formEquipo.pisoSalida, 'pisoSalida')}
                    {renderInput('Balustrada', formEquipo.balustrada, 'balustrada')}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {renderInput('Cantidad de Equipos', formEquipo.cantidadEquipos, 'cantidadEquipos', 'number')}
                    {renderInput('Disposición de Equipos', formEquipo.disposicionEquipos, 'disposicionEquipos')}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-[10px]">
                    {renderInput('Recepción Provisoria', formEquipo.recepcionProvisoria, 'recepcionProvisoria')}
                    {renderInput('Fecha R.P.', formEquipo.fechaRDP, 'fechaRDP', 'date')}
                    {renderInput('Recepción Definitiva', formEquipo.recepcionDefinitiva, 'recepcionDefinitiva')}
                    {renderInput('Fecha R.D.', formEquipo.fechaRD, 'fechaRD', 'date')}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {renderCheckbox('Escalones A', formEquipo.eskalonerosA, 'eskalonerosA')}
                    {renderCheckbox('Pórtico', formEquipo.portico, 'portico')}
                    {renderCheckbox('Ahorro de Energía', formEquipo.ahorroEnergia, 'ahorroEnergia')}
                    {renderCheckbox('Revestimientos', formEquipo.revestimientos, 'revestimientos')}
                    {renderCheckbox('Ganchos en Losa', formEquipo.ganchosEnLosa, 'ganchosEnLosa')}
                    {renderCheckbox('WTB', formEquipo.wtb, 'wtb')}
                  </div>
                  {formEquipo.revestimientos && (
                    <div>
                      {renderInput('Detalles de Revestimientos', formEquipo.detallesRevestimientos, 'detallesRevestimientos')}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CHECKBOXES TÉCNICOS */}
          <SectionHeader title="☑️ Checkboxes Técnicos" sectionKey="checkboxes" />
          {expandedSections.checkboxes && (
            <div className="space-y-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="grid grid-cols-2 gap-3">
                {renderCheckbox('Desmontaje', formEquipo.desmontaje, 'desmontaje')}
                {renderCheckbox('Vigas Separación', formEquipo.vigasSeparacion, 'vigasSeparacion')}
                {renderCheckbox('Revestimientos', formEquipo.revestimientos, 'revestimientos')}
                {renderCheckbox('Ángulos Entrada', formEquipo.angulosEntrada, 'angulosEntrada')}
                {renderCheckbox('Operación Contra Incendio', formEquipo.operacionContraIncendio, 'operacionContraIncendio')}
                {renderCheckbox('Obra Civil', formEquipo.obraCivil, 'obraCivil')}
                {renderCheckbox('Vonic', formEquipo.vonic, 'vonic')}
                {renderCheckbox('WTB', formEquipo.wtb, 'wtb')}
                {renderCheckbox('Marmolería', formEquipo.marmoleria, 'marmoleria')}
                {renderCheckbox('BGM Speaker', formEquipo.bgmSpeaker, 'bgmSpeaker')}
                {renderCheckbox('ELVIC', formEquipo.elvic, 'elvic')}
                {renderCheckbox('Marcos Dintel', formEquipo.marcosConDintel, 'marcosConDintel')}
                {renderCheckbox('Marco Cubremoches', formEquipo.marcoCubreMochetas, 'marcoCubreMochetas')}
              </div>
            </div>
          )}

          {/* OBSERVACIONES */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1">Observaciones</label>
            <textarea
              rows={2}
              value={formEquipo.observaciones || ''}
              onChange={(e) => setFormEquipo({...formEquipo, observaciones: e.target.value})}
              className="w-full p-2 bg-white border border-[#E0E0E0] rounded-lg text-xs font-bold text-[#2D3436] resize-none"
              placeholder="Notas adicionales sobre el equipo..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-[#F1F3F5] bg-white flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F3F5] hover:bg-[#E0E0E0] text-[#2D3436] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-[#C8102E] hover:bg-[#A60D26] transition-colors"
          >
            Guardar Equipo
          </button>
        </div>
      </div>
    </div>
  );
};
