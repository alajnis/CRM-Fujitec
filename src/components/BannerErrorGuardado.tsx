import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { onErrorGuardado, ErrorGuardado } from '../utils/errorGuardado';

/**
 * Muestra los errores de persistencia en pantalla. Sin esto un guardado que
 * falla es indistinguible de uno exitoso: el cambio se ve en la UI porque el
 * estado local ya se actualizó, pero nunca llegó a la base.
 */
export const BannerErrorGuardado: React.FC = () => {
  const [errores, setErrores] = useState<(ErrorGuardado & { id: number })[]>([]);

  useEffect(
    () =>
      onErrorGuardado((error) => {
        const id = Date.now() + Math.random();
        setErrores((prev) => [...prev.slice(-2), { ...error, id }]);
        setTimeout(() => {
          setErrores((prev) => prev.filter((e) => e.id !== id));
        }, 12000);
      }),
    []
  );

  if (errores.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 max-w-md print:hidden">
      {errores.map((error) => (
        <div
          key={error.id}
          role="alert"
          className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 rounded-xl shadow-lg p-4 flex items-start gap-3"
        >
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-900 dark:text-red-100">
              No se pudo {error.operacion} {error.entidad}
            </p>
            <p className="text-xs text-red-800 dark:text-red-200 mt-1">{error.mensaje}</p>
            {error.detalle && (
              <p className="text-[11px] text-red-700 dark:text-red-300 mt-1 font-mono break-words">
                {error.detalle}
              </p>
            )}
            <p className="text-[11px] text-red-700 dark:text-red-300 mt-1.5 italic">
              El cambio se ve en pantalla pero no quedó guardado.
            </p>
          </div>
          <button
            onClick={() => setErrores((prev) => prev.filter((e) => e.id !== error.id))}
            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
