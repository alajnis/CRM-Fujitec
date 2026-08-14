import React, { useState } from 'react';
import { FunnelStage } from '../types';

interface StageTooltipProps {
  stage: FunnelStage;
  children: React.ReactNode;
}

const stageDefinitions: Record<FunnelStage, string> = {
  'Solicitud': 'Solicitud inicial del cliente recibida',
  'En estudio de proyecto': 'En análisis técnico y viabilidad del proyecto',
  'Estimado': 'Estimación técnica y presupuestal completada',
  'Cotización': 'Propuesta formal de precios enviada',
  'Contratadas': 'Contrato firmado, proyecto adjudicado',
  'Finalizadas': 'Proyecto completado e implementado',
  'Rechazadas': 'Propuesta no aceptada, proyecto descartado'
};

export const StageTooltip: React.FC<StageTooltipProps> = ({ stage, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block group">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        {children}
      </div>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-[#2D3436] text-white text-xs rounded-lg whitespace-normal max-w-xs shadow-lg z-50 pointer-events-none">
          {stageDefinitions[stage]}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-[#2D3436]" />
        </div>
      )}
    </div>
  );
};
