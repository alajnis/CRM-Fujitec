import { useEffect, useState } from 'react';
import { Obra } from '../types';

const HOVER_DELAY_MS = 2000;

interface NotaTooltipState {
  visible: boolean;
  position: { x: number; y: number };
  nota: { texto: string; fecha: string; autor: string } | null;
}

// Las "notas" se guardan como entradas tipo 'nota_agregada' dentro del
// historialLog de la obra (ver ModalObra), no en una tabla notas separada.
export const getUltimaNota = (obra: Obra) => {
  const notasLog = (obra.historialLog || []).filter((log) => log.tipo === 'nota_agregada');
  if (notasLog.length === 0) return null;

  const ultima = notasLog[notasLog.length - 1];
  // descripcion tiene el formato: Nota: "contenido"
  const match = ultima.descripcion.match(/^Nota: "([\s\S]*)"$/);
  const texto = match ? match[1] : ultima.descripcion;

  return {
    texto,
    fecha: ultima.fecha,
    autor: ultima.usuario,
  };
};

/**
 * Muestra un tooltip con la última nota de una obra cuando el mouse
 * permanece quieto sobre una tarjeta/fila con atributo data-obra-id.
 */
export const useNotaTooltip = (obras: Obra[]) => {
  const [notaTooltip, setNotaTooltip] = useState<NotaTooltipState>({
    visible: false,
    position: { x: 0, y: 0 },
    nota: null,
  });
  const [hoverTimeoutId, setHoverTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [currentHoveredObraId, setCurrentHoveredObraId] = useState<string | null>(null);

  useEffect(() => {
    const handleCardMouseOver = (e: MouseEvent) => {
      const card = (e.target as HTMLElement).closest('[data-obra-id]');
      if (!card) return;

      const obraId = card.getAttribute('data-obra-id');
      const obra = obras.find((o) => o.id === obraId);
      const ultimaNota = obra ? getUltimaNota(obra) : null;
      if (!obra || !ultimaNota) return;

      setCurrentHoveredObraId(obraId);

      const timeoutId = setTimeout(() => {
        setNotaTooltip({
          visible: true,
          position: { x: e.clientX, y: e.clientY },
          nota: ultimaNota,
        });
      }, HOVER_DELAY_MS);

      setHoverTimeoutId(timeoutId);
    };

    const handleCardMouseMove = (e: MouseEvent) => {
      if (!currentHoveredObraId) return;

      const card = (e.target as HTMLElement).closest('[data-obra-id]');
      if (card?.getAttribute('data-obra-id') === currentHoveredObraId) {
        setNotaTooltip((prev) => ({
          ...prev,
          position: { x: e.clientX, y: e.clientY },
        }));
      }
    };

    const handleCardMouseOut = () => {
      setCurrentHoveredObraId(null);
      setHoverTimeoutId((prev) => {
        if (prev) clearTimeout(prev);
        return null;
      });
      setNotaTooltip({
        visible: false,
        position: { x: 0, y: 0 },
        nota: null,
      });
    };

    document.addEventListener('mouseover', handleCardMouseOver, false);
    document.addEventListener('mousemove', handleCardMouseMove, false);
    document.addEventListener('mouseout', handleCardMouseOut, false);

    return () => {
      document.removeEventListener('mouseover', handleCardMouseOver, false);
      document.removeEventListener('mousemove', handleCardMouseMove, false);
      document.removeEventListener('mouseout', handleCardMouseOut, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obras, currentHoveredObraId]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutId) clearTimeout(hoverTimeoutId);
    };
  }, [hoverTimeoutId]);

  return notaTooltip;
};
