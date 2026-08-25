import React from 'react';

interface NotaTooltipProps {
  nota: {
    texto: string;
    fecha: string;
    autor: string;
  } | null;
  position: { x: number; y: number };
  visible: boolean;
}

export const NotaTooltip: React.FC<NotaTooltipProps> = ({ nota, position, visible }) => {
  if (!visible || !nota) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-100%, -100%)',
      }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-[#E0E0E0] dark:border-slate-700 p-4 max-w-xs w-80 space-y-3">
        {/* Fecha */}
        <div className="text-xs font-semibold text-[#636E72] dark:text-slate-400 tracking-wide uppercase">
          {nota.fecha}
        </div>

        {/* Contenido de la nota */}
        <div className="text-sm text-[#2D3436] dark:text-slate-200 leading-relaxed line-clamp-4">
          {nota.texto}
        </div>

        {/* Autor */}
        <div className="text-xs font-medium text-[#B2BEC3] dark:text-slate-500 border-t border-[#F1F3F5] dark:border-slate-700 pt-2">
          Por: <span className="text-[#2D3436] dark:text-slate-300 font-semibold">{nota.autor}</span>
        </div>
      </div>
    </div>
  );
};
