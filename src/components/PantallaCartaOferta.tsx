import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Clock,
  DollarSign,
  CheckCircle2,
  Building2,
  User,
  Layers,
  Cpu, 
  FileText,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Obra, Cliente, CartaOferta } from '../types';
import { formatUSD, formatDateES } from '../utils/semaforo';

interface PantallaCartaOfertaProps {
  obras: Obra[];
  clientes: Cliente[];
  selectedObraInitial?: Obra;
  searchQuery?: string;
  onSaveCartaOferta: (carta: CartaOferta) => void;
}

export const PantallaCartaOferta: React.FC<PantallaCartaOfertaProps> = ({
  obras,
  clientes,
  selectedObraInitial,
  searchQuery = '',
  onSaveCartaOferta
}) => {
  // Active selected Obra
  const [selectedObraId, setSelectedObraId] = useState<string>(
    selectedObraInitial?.id || obras[0]?.id || ''
  );

  const selectedObra = obras.find((o) => o.id === selectedObraId) || obras[0];
  const selectedCliente = selectedObra ? clientes.find((c) => c.id === selectedObra.clienteId) : null;

  // Required Form Inputs according to Document:
  const [montoNetoUSD, setMontoNetoUSD] = useState<number>(selectedObra?.montoUSD || 850000);
  const [validezDias, setValidezDias] = useState<number>(30);
  const [plazoSemanas, setPlazoSemanas] = useState<number>(24);
  const [garantiaAnos, setGarantiaAnos] = useState<number>(3); // Predeterminado 3 años
  const [terminosPago, setTerminosPago] = useState<string>(
    '30% Anticipo a la firma del contrato u Orden de Compra, 50% previo al embarque de componentes desde fábrica Fujitec, y 20% contra entrega y puesta en marcha.'
  );
  const [notasTecnicas, setNotasTecnicas] = useState<string>(
    'Equipos con tecnología japonesa Fujitec Eco-Drive, variador de frecuencia VVVF de alta precisión, maniobra duplex regenerativa y cabina con diseño exclusivo en acero inoxidable.'
  );
  const [resumenEjecutivo] = useState<string>(
    'Fujitec Argentina / Uruguay se complace en presentar la propuesta comercial para el suministro, montaje y puesta en servicio del sistema de transporte vertical solicitado. Nuestra tecnología ofrece máxima durabilidad, seguridad activa y óptimo confort de viaje.'
  );

  // States for Document Generation
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const [driveSavedSuccess, setDriveSavedSuccess] = useState(false);

  // Update form defaults when selectedObra changes
  useEffect(() => {
    if (selectedObra) {
      setMontoNetoUSD(selectedObra.montoUSD);
    }
  }, [selectedObraId]);

  // Botón de Acción Principal: "Generar Carta Oferta"
  const handleGenerarCartaOferta = () => {
    if (!selectedObra) return;

    const nuevaCarta: CartaOferta = {
      id: `oferta-${Date.now()}`,
      obraId: selectedObra.id,
      propuestaEconomicaUSD: montoNetoUSD,
      validezDias: validezDias,
      plazoEntregaSemanas: plazoSemanas,
      garantiaAnos: garantiaAnos,
      terminosPago: terminosPago,
      notasTecnicas: notasTecnicas,
      resumenEjecutivoIA: resumenEjecutivo,
      fechaGeneracion: new Date().toISOString().split('T')[0],
      generadaPor: 'Lic. Martín Gómez (Director Comercial)'
    };

    onSaveCartaOferta(nuevaCarta);

    // Fire celebratory confetti for successful document generation
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Print PDF trigger (Nativo)
  const handlePrint = () => {
    window.print();
  };

  // Google Drive Integration Simulation
  const handleSaveToDrive = () => {
    setIsDriveSaving(true);
    setTimeout(() => {
      setIsDriveSaving(false);
      setDriveSavedSuccess(true);
      setTimeout(() => {
        setDriveSavedSuccess(false);
        setIsDriveModalOpen(false);
      }, 2000);
    }, 1200);
  };

  return (
    <div className="p-8 space-y-8 bg-[#F1F3F5] min-h-screen">
      {/* Top Header Title */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#2D3436] tracking-tight flex items-center gap-2">
            <FileCheck size={20} style={{ color: '#C8102E' }} />
            Motor Documental de Carta Oferta Fujitec
          </h2>
          <p className="text-xs text-[#636E72] font-medium">
            Generación automática de propuestas comerciales formales sin reescrituras manuales
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F1F3F5] hover:bg-[#E0E0E0] text-[#2D3436] font-bold text-xs transition-colors"
            id="btn-print-carta-oferta"
          >
            <Printer size={15} />
            <span>Imprimir / PDF</span>
          </button>

          <button
            onClick={() => setIsDriveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors"
            id="btn-drive-carta-oferta"
          >
            <HardDrive size={15} className="text-emerald-600" />
            <span>Drive</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: FORMULARIO DE ENTRADA REQUERIDO (Hidden on print) */}
        <div className="lg:col-span-5 bg-white/80 backdrop-blur-lg rounded-2xl border border-[#E0E0E0] shadow-sm p-6 space-y-4 print:hidden">
          <div className="border-b border-[#F1F3F5] pb-3">
            <h3 className="text-sm font-extrabold text-[#2D3436] uppercase tracking-wider">
              1. Selección de Obra & Parámetros
            </h3>
            <p className="text-[11px] text-[#636E72]">Campos oficiales de la propuesta económica</p>
          </div>

          {/* Obra Selector */}
          <div>
            <label className="block text-xs font-bold text-[#2D3436] mb-1">
              Seleccionar Obra del Funnel *
            </label>
            <select
              value={selectedObraId}
              onChange={(e) => setSelectedObraId(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl text-xs font-bold text-[#2D3436] focus:outline-none shadow-2xs"
              id="select-obra-carta-oferta"
            >
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.codigo} - {o.nombre} ({o.region})
                </option>
              ))}
            </select>
          </div>

          {/* Form Fields according to document */}
          <div className="space-y-3.5 text-xs">
            {/* Campo 1: Propuesta Económica USD */}
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">
                Propuesta Económica (USD Netos) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#B2BEC3]">$</span>
                <input
                  type="number"
                  value={montoNetoUSD}
                  onChange={(e) => setMontoNetoUSD(Number(e.target.value))}
                  className="w-full pl-8 pr-3.5 py-2 bg-white border border-[#E0E0E0] font-black text-[#2D3436] rounded-xl focus:outline-none shadow-2xs"
                  id="input-monto-usd"
                />
              </div>
            </div>

            {/* Campo 2 & 3: Validez y Plazo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2D3436] mb-1">
                  Validez Oferta (Días)
                </label>
                <input
                  type="number"
                  value={validezDias}
                  onChange={(e) => setValidezDias(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-extrabold text-[#2D3436]"
                  id="input-validez-dias"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D3436] mb-1">
                  Plazo Entrega (Semanas)
                </label>
                <input
                  type="number"
                  value={plazoSemanas}
                  onChange={(e) => setPlazoSemanas(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-extrabold text-[#2D3436]"
                  id="input-plazo-semanas"
                />
              </div>
            </div>

            {/* Campo 4: Garantías Contractuales (Default 3 años) */}
            <div>
              <label className="block font-bold text-[#2D3436] mb-1 flex items-center justify-between">
                <span>Garantía Contractual (Años) *</span>
                <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Estándar Fujitec 3 Años
                </span>
              </label>
              <input
                type="number"
                value={garantiaAnos}
                onChange={(e) => setGarantiaAnos(Number(e.target.value))}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none font-extrabold text-[#2D3436]"
                id="input-garantia-anos"
              />
            </div>

            {/* Campo 5: Términos de Pago */}
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">
                Condiciones y Términos de Pago
              </label>
              <textarea
                rows={3}
                value={terminosPago}
                onChange={(e) => setTerminosPago(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none text-xs font-medium"
                id="textarea-terminos-pago"
              />
            </div>

            {/* Campo 6: Notas Técnicas */}
            <div>
              <label className="block font-bold text-[#2D3436] mb-1">
                Especificaciones & Notas Técnicas
              </label>
              <textarea
                rows={3}
                value={notasTecnicas}
                onChange={(e) => setNotasTecnicas(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#E0E0E0] rounded-xl focus:outline-none text-xs font-medium"
                id="textarea-notas-tecnicas"
              />
            </div>

          </div>

          {/* BOTÓN DE ACCIÓN PRINCIPAL DESTACADO EN WING RED (#C8102E) */}
          <div className="pt-3 border-t border-[#F1F3F5]">
            <button
              onClick={handleGenerarCartaOferta}
              className="w-full py-3 px-4 rounded-xl text-white font-extrabold text-sm shadow-md transition-all hover:bg-[#A60D26] active:scale-98 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#C8102E' }}
              id="btn-generar-carta-oferta-main"
            >
              <FileCheck size={18} />
              <span>GENERAR CARTA OFERTA</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVISUALIZACIÓN DEL DOCUMENTO FORMATEADO FUJITEC */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E0E0E0] shadow-md p-8 text-[#2D3436] space-y-6 print:border-none print:shadow-none print:p-0" id="documento-carta-oferta">
            {/* Corporate Header Band in Wing Red (#C8102E) */}
            <div className="border-b-4 pb-4 flex justify-between items-start" style={{ borderColor: '#C8102E' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-xs"
                  style={{ backgroundColor: '#C8102E' }}
                >
                  F
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#2D3436]">
                    FUJITEC
                  </h1>
                  <p className="text-[11px] font-bold text-[#636E72] uppercase tracking-widest">
                    Argentina / Uruguay • Transporte Vertical
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <p className="font-extrabold text-[#2D3436]">CARTA OFERTA N° FO-2026-089</p>
                <p className="text-[#636E72]">Fecha: {formatDateES(new Date().toISOString().split('T')[0])}</p>
                <p className="text-[#636E72]">Región: {selectedObra?.region || 'Argentina'}</p>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="bg-[#F1F3F5]/80 p-4 rounded-xl border border-[#E0E0E0] grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#B2BEC3]">Cliente / Destinatario:</p>
                <p className="font-extrabold text-[#2D3436] text-sm">{selectedCliente?.razonSocial || 'Cliente General'}</p>
                <p className="text-[#636E72] font-medium">Attn: {selectedCliente?.contactoPrincipal || 'Comité Ejecutivo'}</p>
                <p className="text-[#636E72] font-medium">{selectedCliente?.direccion}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#B2BEC3]">Proyecto / Obra:</p>
                <p className="font-mono font-black text-[#C8102E] text-sm">{selectedObra?.codigo} - {selectedObra?.nombre}</p>
                <p className="text-[#636E72] font-medium">Tipo: {selectedObra?.tipoEquipo}</p>
                <p className="text-[#636E72] font-medium">Cantidad: {selectedObra?.cantidadEquipos} unidades</p>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2 text-xs leading-relaxed">
              <h4 className="font-extrabold text-[#2D3436] uppercase text-[11px] border-b border-[#E0E0E0] pb-1">
                1. Resumen Ejecutivo de la Propuesta
              </h4>
              <p className="text-[#2D3436] whitespace-pre-line font-medium">
                {resumenEjecutivo}
              </p>
            </div>

            {/* Hardware Specifications Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-[#2D3436] uppercase text-[11px] border-b border-[#E0E0E0] pb-1">
                2. Especificaciones Técnicas del Hardware Fujitec
              </h4>
              <table className="w-full text-left border border-[#E0E0E0] text-xs rounded-xl overflow-hidden">
                <thead className="bg-[#F1F3F5] font-extrabold text-[#2D3436]">
                  <tr>
                    <th className="p-2.5 border-b border-[#E0E0E0]">Modelo</th>
                    <th className="p-2.5 border-b border-[#E0E0E0]">Velocidad</th>
                    <th className="p-2.5 border-b border-[#E0E0E0]">Paradas</th>
                    <th className="p-2.5 border-b border-[#E0E0E0]">Sala Máquinas</th>
                    <th className="p-2.5 border-b border-[#E0E0E0]">Capacidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-bold text-[#2D3436]">
                    <td className="p-2.5 border-b border-[#E0E0E0]">{selectedObra?.hardwareSpecs.modelo}</td>
                    <td className="p-2.5 border-b border-[#E0E0E0]">{selectedObra?.hardwareSpecs.velocidadMS} m/s</td>
                    <td className="p-2.5 border-b border-[#E0E0E0]">{selectedObra?.hardwareSpecs.paradas} paradas</td>
                    <td className="p-2.5 border-b border-[#E0E0E0]">{selectedObra?.hardwareSpecs.tipoSalaMaquinas}</td>
                    <td className="p-2.5 border-b border-[#E0E0E0]">{selectedObra?.hardwareSpecs.capacidadKg} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Economic Offer Box */}
            <div className="p-5 rounded-xl border-2 border-[#2D3436] bg-[#2D3436] text-white space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#B2BEC3] font-extrabold">PROPUESTA ECONÓMICA TOTAL NETO</p>
                  <p className="text-3xl font-black text-white">{formatUSD(montoNetoUSD)}</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-black text-xs inline-flex items-center gap-1 shadow-2xs">
                    <ShieldCheck size={14} />
                    Garantía {garantiaAnos} Años
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#B2BEC3] border-t border-neutral-700 pt-2 font-medium">
                Validez de la Oferta: {validezDias} días | Plazo Estimado de Entrega: {plazoSemanas} semanas a partir de la firma de contrato.
              </p>
            </div>

            {/* Terms and Technical Notes */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1">
                <h5 className="font-extrabold text-[#2D3436] uppercase text-[10px]">Términos de Pago:</h5>
                <p className="text-[#636E72] text-[11px] leading-snug font-medium">{terminosPago}</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-extrabold text-[#2D3436] uppercase text-[10px]">Notas Técnicas & Mantenimiento:</h5>
                <p className="text-[#636E72] text-[11px] leading-snug font-medium">{notasTecnicas}</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-8 border-t border-[#E0E0E0] flex justify-between items-end text-xs">
              <div>
                <p className="font-extrabold text-[#2D3436]">Lic. Martín Gómez</p>
                <p className="text-[#636E72] font-medium">Director Comercial • Fujitec Argentina / Uruguay</p>
                <p className="text-[#B2BEC3] text-[10px]">Impruvia Consultora Strategic CRM MVP</p>
              </div>
              <div className="w-48 border-b border-[#B2BEC3] text-center pb-1 text-[10px] text-[#B2BEC3]">
                Firma y Sello de Aceptación Cliente
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GOOGLE DRIVE INTEGRATION MODAL */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 bg-[#2D3436]/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-[#E0E0E0] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F1F3F5] pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="text-emerald-600" size={20} />
                <h3 className="text-base font-extrabold text-[#2D3436]">Exportar a Google Drive</h3>
              </div>
              <button onClick={() => setIsDriveModalOpen(false)} className="text-[#B2BEC3] font-bold">✕</button>
            </div>

            <p className="text-xs text-[#636E72] font-medium">
              Guarda el documento de la Carta Oferta formateado directamente en la carpeta compartida de Google Drive de Fujitec Comercial.
            </p>

            <div className="p-3 bg-[#F1F3F5] rounded-xl border border-[#E0E0E0] text-xs space-y-1">
              <p className="font-extrabold text-[#2D3436]">Carta_Oferta_Fujitec_{selectedObra?.codigo}.pdf</p>
              <p className="text-[#636E72] font-medium">Carpeta Destino: Drive / Fujitec Obras Nuevas / 2026</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDriveModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F1F3F5] font-bold text-[#2D3436] hover:bg-[#E0E0E0] transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveToDrive}
                disabled={isDriveSaving || driveSavedSuccess}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                id="btn-confirm-drive-save"
              >
                {driveSavedSuccess ? (
                  <>
                    <Check size={16} />
                    <span>¡Guardado en Drive!</span>
                  </>
                ) : isDriveSaving ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <HardDrive size={16} />
                    <span>Guardar PDF en Drive</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
