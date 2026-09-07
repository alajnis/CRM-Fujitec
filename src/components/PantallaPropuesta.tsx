import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Check,
  AlertTriangle,
  Building2,
  Layers,
  DollarSign,
  FileSignature,
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  Loader2
} from 'lucide-react';
import {
  Obra,
  Cliente,
  Equipo,
  PropuestaTecnicoEconomica,
  PropuestaVersion
} from '../types';
import { useAuth } from '../context/AuthContext';
import { propuestasService } from '../services/propuestasService';
import { generarPropuestaPdf } from '../utils/propuestaPdf';
import {
  CLAUSULAS_DEFAULT,
  OPCIONES_TECNICAS,
  OPCIONES_TECNICAS_DEFAULT
} from '../utils/propuestaTemplates';
import {
  agruparEquipos,
  detectarCamposFaltantes,
  describirSuministro,
  velocidadMetrosPorMinuto,
  formatearNumero
} from '../utils/propuestaEquipos';
import { Toast } from './Toast';

interface PantallaPropuestaProps {
  obras: Obra[];
  clientes: Cliente[];
  equipos: Equipo[];
  selectedObraInitial?: Obra;
  onEditEquipo?: (equipo: Equipo) => void;
}

const PASOS = [
  { id: 1, nombre: 'Destinatario', icono: Building2 },
  { id: 2, nombre: 'Equipos', icono: Layers },
  { id: 3, nombre: 'Precios', icono: DollarSign },
  { id: 4, nombre: 'Cláusulas', icono: FileSignature }
];

const hoyISO = () => new Date().toISOString().split('T')[0];

const crearPropuestaInicial = (
  obra: Obra,
  cliente: Cliente | undefined,
  equipoIds: string[]
): PropuestaTecnicoEconomica => ({
  id: `prop-${obra.id}`,
  obraId: obra.id,
  destinatario: {
    empresa: cliente?.razonSocial || '',
    direccion: cliente?.direccion || '',
    localidad: '',
    atencionA: cliente?.contactoPrincipal || '',
    referencia: `Oferta ${obra.nombre} (${obra.codigo})`,
    numeroFA: `FA ${String(new Date().getFullYear()).slice(2)}-0000`,
    fecha: hoyISO()
  },
  precios: {
    parteImportadaUSD: 0,
    gastosDespachoUSD: 0,
    instalacionNacionalARS: 0,
    mantenimientoMensual: equipoIds.map((equipoId) => ({ equipoId, valorUnitarioARS: 0 })),
    baseAjusteUOM: '1 de febrero de 2025',
    importacionACargoDelCliente: false
  },
  clausulas: { ...CLAUSULAS_DEFAULT },
  opcionesTecnicas: { ...OPCIONES_TECNICAS_DEFAULT },
  equipoIdsIncluidos: equipoIds,
  versiones: [],
  ultimaVersion: 0,
  fechaCreacion: new Date().toISOString(),
  fechaActualizacion: new Date().toISOString()
});

export const PantallaPropuesta: React.FC<PantallaPropuestaProps> = ({
  obras,
  clientes,
  equipos,
  selectedObraInitial,
  onEditEquipo
}) => {
  const { usuarioActual } = useAuth();

  const [selectedObraId, setSelectedObraId] = useState<string>(
    selectedObraInitial?.id || obras[0]?.id || ''
  );
  const [paso, setPaso] = useState(1);
  const [propuesta, setPropuesta] = useState<PropuestaTecnicoEconomica | null>(null);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'loading' } | null>(null);

  const obra = obras.find((o) => o.id === selectedObraId);
  const cliente = obra ? clientes.find((c) => c.id === obra.clienteId) : undefined;

  /** Ascensores de la obra: el flujo actual cubre este tipo de equipo. */
  const equiposObra = useMemo(() => {
    if (!obra) return [];
    return (obra.equipoIds || [])
      .map((id) => equipos.find((e) => e.id === id))
      .filter((e): e is Equipo => !!e && !e.isDeleted && e.tipo === 'Ascensor');
  }, [obra, equipos]);

  const equiposIncluidos = useMemo(() => {
    if (!propuesta) return equiposObra;
    if (propuesta.equipoIdsIncluidos.length === 0) return equiposObra;
    return equiposObra.filter((e) => propuesta.equipoIdsIncluidos.includes(e.id));
  }, [propuesta, equiposObra]);

  const grupos = useMemo(() => agruparEquipos(equiposIncluidos), [equiposIncluidos]);
  const camposFaltantes = useMemo(
    () => detectarCamposFaltantes(equiposIncluidos),
    [equiposIncluidos]
  );

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      if (!obra) {
        setCargando(false);
        return;
      }
      setCargando(true);

      const existente = await propuestasService.getPropuestaPorObra(obra.id);
      if (cancelado) return;

      if (existente) {
        setPropuesta(existente);
      } else {
        setPropuesta(
          crearPropuestaInicial(
            obra,
            cliente,
            equiposObra.map((e) => e.id)
          )
        );
      }
      setCargando(false);
    };

    cargar();
    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedObraId]);

  const actualizar = (cambios: Partial<PropuestaTecnicoEconomica>) => {
    setPropuesta((previa) => (previa ? { ...previa, ...cambios } : previa));
  };

  const guardarBorrador = async () => {
    if (!propuesta) return;
    const guardada = await propuestasService.guardarPropuesta(propuesta);
    setPropuesta(guardada);
    setToast({ message: '✓ Borrador guardado', type: 'success' });
    setTimeout(() => setToast(null), 2000);
  };

  const handleGenerar = async () => {
    if (!propuesta || !obra) return;

    setGenerando(true);
    setToast({ message: '📄 Generando documento...', type: 'loading' });

    try {
      const version = propuesta.ultimaVersion + 1;
      const { blob, nombreArchivo } = await generarPropuestaPdf(
        propuesta,
        obra,
        cliente,
        equiposIncluidos,
        version
      );

      // Descarga inmediata para el usuario.
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);

      const storagePath = await propuestasService.subirPdfVersion(
        obra.id,
        version,
        nombreArchivo,
        blob
      );

      const nuevaVersion: PropuestaVersion = {
        version,
        fechaGeneracion: new Date().toISOString(),
        generadaPor: usuarioActual?.nombre || 'Sin usuario',
        nombreArchivo,
        storagePath: storagePath || undefined
      };

      const actualizada = await propuestasService.registrarVersion(propuesta, nuevaVersion);
      setPropuesta(actualizada);

      setToast({ message: `✅ ${nombreArchivo} generado`, type: 'success' });
      setTimeout(() => setToast(null), 3500);
    } catch (error) {
      console.error('Error generando la propuesta:', error);
      setToast({ message: '❌ No se pudo generar el documento', type: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setGenerando(false);
    }
  };

  const descargarVersion = async (version: PropuestaVersion) => {
    if (!version.storagePath) {
      setToast({ message: 'Esta versión no quedó archivada', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const url = await propuestasService.getUrlVersion(version.storagePath);
    if (url) {
      window.open(url, '_blank');
    } else {
      setToast({ message: 'No se pudo recuperar el archivo', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (!obra) {
    return (
      <div className="p-8 bg-[#F1F3F5] dark:bg-slate-900 min-h-screen">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-[#E0E0E0] dark:border-slate-700">
          <FileText size={40} className="mx-auto text-[#B2BEC3] mb-3" />
          <p className="font-bold text-[#2D3436] dark:text-slate-100">No hay obras disponibles</p>
        </div>
      </div>
    );
  }

  if (cargando || !propuesta) {
    return (
      <div className="p-8 bg-[#F1F3F5] dark:bg-slate-900 min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#C8102E]" />
      </div>
    );
  }

  const listoParaGenerar = equiposIncluidos.length > 0 && camposFaltantes.length === 0;

  return (
    <div className="p-8 space-y-6 bg-[#F1F3F5] dark:bg-slate-900 min-h-screen">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => toast.type !== 'loading' && setToast(null)}
          duration={toast.type === 'loading' ? 0 : 3000}
        />
      )}

      {/* Cabecera */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] dark:border-slate-700 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-[#2D3436] dark:text-slate-100 flex items-center gap-2">
              <FileText size={22} style={{ color: '#C8102E' }} />
              Propuesta Técnico-Económica
            </h1>
            <p className="text-xs text-[#636E72] dark:text-slate-400 mt-1">
              Genera el documento completo con los datos de la obra y sus equipos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedObraId}
              onChange={(e) => {
                setSelectedObraId(e.target.value);
                setPaso(1);
              }}
              className="bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-[#2D3436] dark:text-slate-100"
            >
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.codigo} — {o.nombre}
                </option>
              ))}
            </select>

            {propuesta.ultimaVersion > 0 && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F1F3F5] dark:bg-slate-700 text-[#636E72] dark:text-slate-300 whitespace-nowrap">
                Última: V{propuesta.ultimaVersion}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pasos */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-2 border border-[#E0E0E0] dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap gap-1">
          {PASOS.map((p) => {
            const Icono = p.icono;
            const activo = paso === p.id;
            const alerta = p.id === 2 && camposFaltantes.length > 0;

            return (
              <button
                key={p.id}
                onClick={() => setPaso(p.id)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activo
                    ? 'bg-[#C8102E] text-white shadow-sm'
                    : 'text-[#636E72] dark:text-slate-400 hover:bg-[#F1F3F5] dark:hover:bg-slate-700'
                }`}
              >
                <Icono size={15} />
                <span>{p.id}. {p.nombre}</span>
                {alerta && (
                  <AlertTriangle size={13} className={activo ? 'text-white' : 'text-amber-500'} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Contenido del paso */}
        <div className="xl:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-6 border border-[#E0E0E0] dark:border-slate-700 shadow-sm space-y-5">
          {paso === 1 && (
            <PasoDestinatario propuesta={propuesta} onActualizar={actualizar} />
          )}
          {paso === 2 && (
            <PasoEquipos
              grupos={grupos}
              equiposObra={equiposObra}
              propuesta={propuesta}
              camposFaltantes={camposFaltantes}
              onActualizar={actualizar}
              onEditEquipo={onEditEquipo}
            />
          )}
          {paso === 3 && (
            <PasoPrecios
              propuesta={propuesta}
              obra={obra}
              equipos={equiposIncluidos}
              onActualizar={actualizar}
            />
          )}
          {paso === 4 && (
            <PasoClausulas propuesta={propuesta} onActualizar={actualizar} />
          )}

          {/* Navegación */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F1F3F5] dark:border-slate-700">
            <button
              onClick={() => setPaso((p) => Math.max(1, p - 1))}
              disabled={paso === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F3F5] dark:bg-slate-700 text-[#2D3436] dark:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E0E0E0] transition-colors"
            >
              <ChevronLeft size={15} /> Anterior
            </button>

            <button
              onClick={guardarBorrador}
              className="text-xs font-bold text-[#636E72] dark:text-slate-400 hover:text-[#2D3436] dark:hover:text-slate-100 transition-colors"
            >
              Guardar borrador
            </button>

            <button
              onClick={() => setPaso((p) => Math.min(4, p + 1))}
              disabled={paso === 4}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#F1F3F5] dark:bg-slate-700 text-[#2D3436] dark:text-slate-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#E0E0E0] transition-colors"
            >
              Siguiente <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#2D3436] dark:text-slate-100">
              Contenido del documento
            </h3>

            <div className="space-y-1.5 text-xs">
              {[
                { nombre: 'Carta de presentación', listo: true },
                { nombre: 'Oferta económica', listo: propuesta.precios.parteImportadaUSD > 0 },
                { nombre: 'Especificaciones técnicas', listo: listoParaGenerar },
                { nombre: 'Características generales', listo: false, anexo: true },
                { nombre: 'Ayuda de gremio', listo: false, anexo: true }
              ].map((doc) => (
                <div
                  key={doc.nombre}
                  className="flex items-center justify-between py-1.5 border-b border-[#F1F3F5] dark:border-slate-700 last:border-0"
                >
                  <span className="text-[#2D3436] dark:text-slate-200">{doc.nombre}</span>
                  {doc.anexo ? (
                    <span className="text-[10px] font-bold text-[#B2BEC3]">Anexo pendiente</span>
                  ) : doc.listo ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-500" />
                  )}
                </div>
              ))}
            </div>

            {camposFaltantes.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <p className="font-bold mb-1">
                  {camposFaltantes.length} dato{camposFaltantes.length > 1 ? 's' : ''} sin completar
                </p>
                <p>Revisá el paso 2 para completar los equipos.</p>
              </div>
            )}

            <button
              onClick={handleGenerar}
              disabled={generando || equiposIncluidos.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#C8102E' }}
            >
              {generando ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Download size={16} /> Generar V{propuesta.ultimaVersion + 1}
                </>
              )}
            </button>

            {!listoParaGenerar && equiposIncluidos.length > 0 && (
              <p className="text-[10px] text-center text-[#B2BEC3]">
                Podés generar igual: los datos faltantes salen como ____
              </p>
            )}
          </div>

          {/* Historial */}
          {propuesta.versiones.length > 0 && (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl p-5 border border-[#E0E0E0] dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-[#2D3436] dark:text-slate-100 flex items-center gap-1.5 mb-3">
                <History size={15} /> Historial de versiones
              </h3>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {[...propuesta.versiones].reverse().map((version) => (
                  <button
                    key={version.version}
                    onClick={() => descargarVersion(version)}
                    className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#F1F3F5] dark:bg-slate-700/60 hover:bg-[#E0E0E0] dark:hover:bg-slate-700 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2D3436] dark:text-slate-100">
                        V{version.version}
                      </p>
                      <p className="text-[10px] text-[#636E72] dark:text-slate-400 truncate">
                        {new Date(version.fechaGeneracion).toLocaleDateString('es-AR')} ·{' '}
                        {version.generadaPor}
                      </p>
                    </div>
                    <RotateCcw size={13} className="text-[#636E72] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Paso 1: Destinatario
// ---------------------------------------------------------------------------

const Campo: React.FC<{
  label: string;
  value: string | number;
  onChange: (valor: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-[#2D3436] dark:text-slate-200 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2.5 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-xl text-xs font-medium text-[#2D3436] dark:text-slate-100"
    />
  </div>
);

const PasoDestinatario: React.FC<{
  propuesta: PropuestaTecnicoEconomica;
  onActualizar: (cambios: Partial<PropuestaTecnicoEconomica>) => void;
}> = ({ propuesta, onActualizar }) => {
  const set = (campo: string, valor: string) =>
    onActualizar({ destinatario: { ...propuesta.destinatario, [campo]: valor } });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#2D3436] dark:text-slate-100">Destinatario</h2>
        <p className="text-xs text-[#636E72] dark:text-slate-400">
          Datos de la carátula. Se precargan del cliente de la obra.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Campo
          label="Número FA *"
          value={propuesta.destinatario.numeroFA}
          onChange={(v) => set('numeroFA', v)}
          placeholder="FA 26-0018"
        />
        <Campo
          label="Fecha"
          type="date"
          value={propuesta.destinatario.fecha}
          onChange={(v) => set('fecha', v)}
        />
      </div>

      <Campo
        label="Empresa *"
        value={propuesta.destinatario.empresa}
        onChange={(v) => set('empresa', v)}
        placeholder="OBRING"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Campo
          label="Dirección"
          value={propuesta.destinatario.direccion}
          onChange={(v) => set('direccion', v)}
          placeholder="Av. Eva Perón 822"
        />
        <Campo
          label="Localidad"
          value={propuesta.destinatario.localidad}
          onChange={(v) => set('localidad', v)}
          placeholder="Santa Fe"
        />
      </div>

      <Campo
        label="Atención a"
        value={propuesta.destinatario.atencionA}
        onChange={(v) => set('atencionA', v)}
        placeholder="Arq. Julián Torresetti"
      />

      <Campo
        label="Referencia"
        value={propuesta.destinatario.referencia}
        onChange={(v) => set('referencia', v)}
      />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Paso 2: Equipos
// ---------------------------------------------------------------------------

const PasoEquipos: React.FC<{
  grupos: ReturnType<typeof agruparEquipos>;
  equiposObra: Equipo[];
  propuesta: PropuestaTecnicoEconomica;
  camposFaltantes: ReturnType<typeof detectarCamposFaltantes>;
  onActualizar: (cambios: Partial<PropuestaTecnicoEconomica>) => void;
  onEditEquipo?: (equipo: Equipo) => void;
}> = ({ grupos, equiposObra, propuesta, camposFaltantes, onActualizar, onEditEquipo }) => {
  const incluidos = propuesta.equipoIdsIncluidos;

  const alternar = (equipoId: string) => {
    const nuevos = incluidos.includes(equipoId)
      ? incluidos.filter((id) => id !== equipoId)
      : [...incluidos, equipoId];
    onActualizar({ equipoIdsIncluidos: nuevos });
  };

  const faltantesPorEquipo = useMemo(() => {
    const mapa = new Map<string, string[]>();
    camposFaltantes.forEach((f) => {
      mapa.set(f.equipoId, [...(mapa.get(f.equipoId) || []), f.etiqueta]);
    });
    return mapa;
  }, [camposFaltantes]);

  const setOpcion = (campo: string, valor: string | boolean) =>
    onActualizar({ opcionesTecnicas: { ...propuesta.opcionesTecnicas, [campo]: valor } });

  if (equiposObra.length === 0) {
    return (
      <div className="py-10 text-center space-y-2">
        <Layers size={32} className="mx-auto text-[#B2BEC3]" />
        <p className="font-bold text-sm text-[#2D3436] dark:text-slate-100">
          La obra no tiene ascensores asignados
        </p>
        <p className="text-xs text-[#636E72] dark:text-slate-400">
          Asigná equipos a la obra para poder generar las especificaciones técnicas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-[#2D3436] dark:text-slate-100">
          Equipos ({equiposObra.length})
        </h2>
        <p className="text-xs text-[#636E72] dark:text-slate-400">
          Los equipos con especificaciones idénticas se agrupan automáticamente en el documento.
        </p>
      </div>

      {/* Agrupación */}
      <div className="space-y-2">
        {grupos.map((grupo) => (
          <div
            key={grupo.etiqueta}
            className="p-3 rounded-xl bg-[#F1F3F5] dark:bg-slate-700/50 border border-[#E0E0E0] dark:border-slate-600"
          >
            <p className="text-[11px] font-black text-[#C8102E] mb-1">{grupo.etiqueta}</p>
            <p className="text-xs font-medium text-[#2D3436] dark:text-slate-200">
              {describirSuministro(grupo)}
            </p>
          </div>
        ))}
      </div>

      {/* Detalle por equipo */}
      <div className="space-y-2">
        {equiposObra.map((equipo) => {
          const incluido = incluidos.length === 0 || incluidos.includes(equipo.id);
          const faltantes = faltantesPorEquipo.get(equipo.id) || [];

          return (
            <div
              key={equipo.id}
              className={`p-3 rounded-xl border transition-colors ${
                incluido
                  ? 'bg-white dark:bg-slate-700/40 border-[#E0E0E0] dark:border-slate-600'
                  : 'bg-[#F1F3F5]/50 dark:bg-slate-800/40 border-transparent opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-2.5 cursor-pointer min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={incluido}
                    onChange={() => alternar(equipo.id)}
                    className="mt-0.5 w-4 h-4 rounded shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2D3436] dark:text-slate-100 truncate">
                      {equipo.nombre || equipo.codigoUnico}
                    </p>
                    <p className="text-[10px] text-[#636E72] dark:text-slate-400">
                      {velocidadMetrosPorMinuto(equipo)} m/min ·{' '}
                      {formatearNumero(equipo.capacidadKg)} kg · {equipo.paradas ?? '__'} paradas
                    </p>
                  </div>
                </label>

                {onEditEquipo && (
                  <button
                    onClick={() => onEditEquipo(equipo)}
                    className="text-[10px] font-bold text-[#C8102E] hover:underline shrink-0"
                  >
                    Completar
                  </button>
                )}
              </div>

              {incluido && faltantes.length > 0 && (
                <div className="mt-2 ml-6 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-[10px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <AlertTriangle size={11} /> Falta: {faltantes.join(', ')}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Opciones técnicas */}
      <div className="pt-4 border-t border-[#F1F3F5] dark:border-slate-700 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[#2D3436] dark:text-slate-100">
            Opciones de terminación
          </h3>
          <p className="text-xs text-[#636E72] dark:text-slate-400">
            En el Word estas variantes se elegían borrando las que no aplican.
          </p>
        </div>

        {[
          { campo: 'cielorraso', label: 'Cielorraso (1.1.5)', opciones: OPCIONES_TECNICAS.cielorraso },
          { campo: 'revestimientoCabina', label: 'Revestimiento de cabina (1.1.8)', opciones: OPCIONES_TECNICAS.revestimientoCabina },
          { campo: 'senalPasillo', label: 'Señal de pasillo (1.3.2)', opciones: OPCIONES_TECNICAS.senalPasillo },
          { campo: 'puertasPasillo', label: 'Puertas de pasillo (1.5)', opciones: OPCIONES_TECNICAS.puertasPasillo },
          { campo: 'marcos', label: 'Marcos (1.6)', opciones: OPCIONES_TECNICAS.marcos },
          { campo: 'contrapeso', label: 'Contrapesos (1.8)', opciones: OPCIONES_TECNICAS.contrapeso }
        ].map(({ campo, label, opciones }) => (
          <div key={campo}>
            <label className="block text-xs font-bold text-[#2D3436] dark:text-slate-200 mb-1">
              {label}
            </label>
            <select
              value={(propuesta.opcionesTecnicas as any)[campo]}
              onChange={(e) => setOpcion(campo, e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-xl text-xs text-[#2D3436] dark:text-slate-100"
            >
              {opciones.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion.length > 90 ? `${opcion.slice(0, 90)}...` : opcion}
                </option>
              ))}
            </select>
          </div>
        ))}

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={propuesta.opcionesTecnicas.incluyeElvic}
            onChange={(e) => setOpcion('incluyeElvic', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-xs font-bold text-[#2D3436] dark:text-slate-200">
            Incluir sistema ELVIC (sección 1.10)
          </span>
        </label>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Paso 3: Precios
// ---------------------------------------------------------------------------

const PasoPrecios: React.FC<{
  propuesta: PropuestaTecnicoEconomica;
  obra: Obra;
  equipos: Equipo[];
  onActualizar: (cambios: Partial<PropuestaTecnicoEconomica>) => void;
}> = ({ propuesta, obra, equipos, onActualizar }) => {
  const { precios } = propuesta;

  const set = (campo: string, valor: number | boolean | string) =>
    onActualizar({ precios: { ...precios, [campo]: valor } });

  const setMantenimiento = (equipoId: string, valor: number) => {
    const existe = precios.mantenimientoMensual.some((m) => m.equipoId === equipoId);
    const nuevos = existe
      ? precios.mantenimientoMensual.map((m) =>
          m.equipoId === equipoId ? { ...m, valorUnitarioARS: valor } : m
        )
      : [...precios.mantenimientoMensual, { equipoId, valorUnitarioARS: valor }];
    onActualizar({ precios: { ...precios, mantenimientoMensual: nuevos } });
  };

  const totalUSD = precios.parteImportadaUSD + precios.gastosDespachoUSD;
  const totalMantenimiento = precios.mantenimientoMensual.reduce(
    (suma, m) => suma + (m.valorUnitarioARS || 0),
    0
  );

  const CampoNumero: React.FC<{ label: string; value: number; onChange: (v: number) => void; prefijo: string }> = ({
    label,
    value,
    onChange,
    prefijo
  }) => (
    <div>
      <label className="block text-xs font-bold text-[#2D3436] dark:text-slate-200 mb-1">
        {label}
      </label>
      <div className="flex items-center">
        <span className="px-2.5 py-2.5 bg-[#F1F3F5] dark:bg-slate-600 border border-r-0 border-[#E0E0E0] dark:border-slate-600 rounded-l-xl text-xs font-bold text-[#636E72] dark:text-slate-300">
          {prefijo}
        </span>
        <input
          type="number"
          min={0}
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="flex-1 p-2.5 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-r-xl text-xs font-bold text-[#2D3436] dark:text-slate-100"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-[#2D3436] dark:text-slate-100">Precios</h2>
        <p className="text-xs text-[#636E72] dark:text-slate-400">
          Monto de la obra como referencia:{' '}
          <span className="font-bold text-[#2D3436] dark:text-slate-200">
            USD {obra.montoUSD.toLocaleString('es-AR')}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CampoNumero
          label="A) Parte importada (CIF)"
          value={precios.parteImportadaUSD}
          onChange={(v) => set('parteImportadaUSD', v)}
          prefijo="USD"
        />
        <CampoNumero
          label="B) Gastos de despacho"
          value={precios.gastosDespachoUSD}
          onChange={(v) => set('gastosDespachoUSD', v)}
          prefijo="USD"
        />
      </div>

      <CampoNumero
        label="C) Instalación nacional"
        value={precios.instalacionNacionalARS}
        onChange={(v) => set('instalacionNacionalARS', v)}
        prefijo="ARS"
      />

      <div className="p-3 rounded-xl bg-[#F1F3F5] dark:bg-slate-700/50 border border-[#E0E0E0] dark:border-slate-600 flex items-center justify-between">
        <span className="text-xs font-bold text-[#636E72] dark:text-slate-300">Total USD</span>
        <span className="text-sm font-black text-[#2D3436] dark:text-slate-100">
          USD {totalUSD.toLocaleString('es-AR')}
        </span>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={precios.importacionACargoDelCliente}
          onChange={(e) => set('importacionACargoDelCliente', e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className="text-xs font-bold text-[#2D3436] dark:text-slate-200">
          Importación a cargo del cliente
        </span>
      </label>

      {/* Mantenimiento */}
      <div className="pt-4 border-t border-[#F1F3F5] dark:border-slate-700 space-y-3">
        <h3 className="text-sm font-bold text-[#2D3436] dark:text-slate-100">
          Mantenimiento mensual (sin IVA)
        </h3>

        {equipos.map((equipo) => {
          const item = precios.mantenimientoMensual.find((m) => m.equipoId === equipo.id);
          return (
            <div key={equipo.id} className="flex items-center gap-3">
              <span className="flex-1 text-xs text-[#2D3436] dark:text-slate-200 truncate">
                {equipo.nombre || equipo.codigoUnico}
              </span>
              <div className="flex items-center w-40">
                <span className="px-2 py-2 bg-[#F1F3F5] dark:bg-slate-600 border border-r-0 border-[#E0E0E0] dark:border-slate-600 rounded-l-lg text-[10px] font-bold text-[#636E72] dark:text-slate-300">
                  ARS
                </span>
                <input
                  type="number"
                  min={0}
                  value={item?.valorUnitarioARS || ''}
                  onChange={(e) =>
                    setMantenimiento(equipo.id, Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-full p-2 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-r-lg text-xs font-bold text-[#2D3436] dark:text-slate-100"
                />
              </div>
            </div>
          );
        })}

        {totalMantenimiento > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F5] dark:border-slate-700">
            <span className="text-xs font-bold text-[#636E72] dark:text-slate-300">
              Total mensual
            </span>
            <span className="text-sm font-black text-[#2D3436] dark:text-slate-100">
              ARS {totalMantenimiento.toLocaleString('es-AR')}
            </span>
          </div>
        )}

        <Campo
          label="Base de ajuste UOM"
          value={precios.baseAjusteUOM}
          onChange={(v) => set('baseAjusteUOM', v)}
          placeholder="1 de febrero de 2025"
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Paso 4: Cláusulas
// ---------------------------------------------------------------------------

const ListaEditable: React.FC<{
  titulo: string;
  items: string[];
  onChange: (items: string[]) => void;
}> = ({ titulo, items, onChange }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold text-[#2D3436] dark:text-slate-200">{titulo}</label>
      <button
        onClick={() => onChange([...items, ''])}
        className="text-[10px] font-bold text-[#C8102E] hover:underline"
      >
        + Agregar
      </button>
    </div>

    {items.map((item, indice) => (
      <div key={indice} className="flex items-start gap-2">
        <textarea
          rows={2}
          value={item}
          onChange={(e) => {
            const nuevos = [...items];
            nuevos[indice] = e.target.value;
            onChange(nuevos);
          }}
          className="flex-1 p-2 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-lg text-[11px] text-[#2D3436] dark:text-slate-100 resize-none"
        />
        <button
          onClick={() => onChange(items.filter((_, i) => i !== indice))}
          className="p-1.5 text-[#B2BEC3] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
          title="Quitar"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ))}
  </div>
);

const PasoClausulas: React.FC<{
  propuesta: PropuestaTecnicoEconomica;
  onActualizar: (cambios: Partial<PropuestaTecnicoEconomica>) => void;
}> = ({ propuesta, onActualizar }) => {
  const { clausulas } = propuesta;

  const set = (campo: string, valor: any) =>
    onActualizar({ clausulas: { ...clausulas, [campo]: valor } });

  const restaurar = () => onActualizar({ clausulas: { ...CLAUSULAS_DEFAULT } });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#2D3436] dark:text-slate-100">
            Cláusulas y textos
          </h2>
          <p className="text-xs text-[#636E72] dark:text-slate-400">
            Los cambios aplican solo a esta propuesta.
          </p>
        </div>
        <button
          onClick={restaurar}
          className="flex items-center gap-1 text-[10px] font-bold text-[#636E72] dark:text-slate-400 hover:text-[#C8102E] transition-colors shrink-0"
        >
          <RotateCcw size={12} /> Restaurar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-[#2D3436] dark:text-slate-200 mb-1">
            Garantía (años)
          </label>
          <input
            type="number"
            min={1}
            value={clausulas.garantiaAnos}
            onChange={(e) => set('garantiaAnos', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2.5 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-xl text-xs font-bold text-[#2D3436] dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#2D3436] dark:text-slate-200 mb-1">
            Validez de la oferta (días)
          </label>
          <input
            type="number"
            min={1}
            value={clausulas.validezDias}
            onChange={(e) => set('validezDias', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2.5 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-xl text-xs font-bold text-[#2D3436] dark:text-slate-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#2D3436] dark:text-slate-200 mb-1">
          Plazo de entrega
        </label>
        <textarea
          rows={3}
          value={clausulas.plazoEntrega}
          onChange={(e) => set('plazoEntrega', e.target.value)}
          className="w-full p-2.5 bg-white dark:bg-slate-700 border border-[#E0E0E0] dark:border-slate-600 rounded-xl text-[11px] text-[#2D3436] dark:text-slate-100 resize-none"
        />
      </div>

      <ListaEditable
        titulo="Tareas incluidas"
        items={clausulas.tareasIncluidas}
        onChange={(items) => set('tareasIncluidas', items)}
      />

      <ListaEditable
        titulo="No incluido en la oferta"
        items={clausulas.tareasNoIncluidas}
        onChange={(items) => set('tareasNoIncluidas', items)}
      />

      <ListaEditable
        titulo="Forma de pago — equipo importado"
        items={clausulas.formaPagoImportado}
        onChange={(items) => set('formaPagoImportado', items)}
      />

      <ListaEditable
        titulo="Forma de pago — parte nacional"
        items={clausulas.formaPagoNacional}
        onChange={(items) => set('formaPagoNacional', items)}
      />

      <ListaEditable
        titulo="Notas sobre el precio"
        items={clausulas.notasPrecio}
        onChange={(items) => set('notasPrecio', items)}
      />
    </div>
  );
};
