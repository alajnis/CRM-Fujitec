import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Obra } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  obras: Obra[];
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  obras
}) => {
  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: '¡Hola! Soy Fujitec Commercial AI Advisor. ¿En qué puedo asistirte hoy? Puedo analizar obras congeladas (>7 días sin actualización), sugerir modelos Fujitec (ZEXIA, VIRIDIS, MRL) o dar recomendaciones para aumentar el cierre en Argentina y Uruguay.',
      timestamp: 'Ahora'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setInputMsg('');

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/commercial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          contextObras: obras.map(o => ({
            codigo: o.codigo,
            nombre: o.nombre,
            region: o.region,
            montoUSD: o.montoUSD,
            estado: o.estado,
            fechaUltimaActualizacion: o.fechaUltimaActualizacion,
            hardwareSpecs: o.hardwareSpecs
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        throw new Error('No reply from server');
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: 'Disculpa, no pude procesar tu consulta en este momento. Por favor reintenta.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2D3436]/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-md h-full flex flex-col shadow-2xl border-l border-[#E0E0E0] animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#2D3436] text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl text-white shadow-2xs" style={{ backgroundColor: '#C8102E' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Fujitec Commercial Advisor</h3>
              <p className="text-[10px] text-[#B2BEC3] font-medium">Inteligencia Artificial para Obras Nuevas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-neutral-800 text-[#B2BEC3] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-[#F1F3F5]/80 border-b border-[#E0E0E0] flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
          <button
            onClick={() => setInputMsg('¿Cuáles son las obras que llevan más de 7 días congeladas y qué sugieres?')}
            className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold shrink-0 hover:bg-amber-100 transition-colors"
          >
            ⚠️ Obras &gt;7d Congeladas
          </button>
          <button
            onClick={() => setInputMsg('¿Qué modelo de ascensor Fujitec recomendar para un edificio de 30 paradas a 2.5 m/s?')}
            className="px-3 py-1.5 rounded-full bg-white text-[#2D3436] border border-[#E0E0E0] font-bold shrink-0 hover:bg-[#F1F3F5] transition-colors"
          >
            🏢 Asesoramiento Hardware
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F1F3F5]/40 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div 
                  className="w-7 h-7 rounded-xl text-white flex items-center justify-center shrink-0 font-black text-xs shadow-2xs"
                  style={{ backgroundColor: '#C8102E' }}
                >
                  F
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[82%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#2D3436] text-white rounded-br-xs shadow-2xs font-medium'
                    : 'bg-white/90 text-[#2D3436] border border-[#E0E0E0] shadow-2xs rounded-bl-xs font-medium'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <span className={`text-[9px] block text-right mt-1 ${m.sender === 'user' ? 'text-neutral-400' : 'text-[#B2BEC3]'}`}>
                  {m.timestamp}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-[#2D3436] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-2xs">
                  U
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center text-xs text-[#636E72] font-semibold italic">
              <div 
                className="w-6 h-6 rounded-xl text-white flex items-center justify-center text-xs font-bold animate-pulse shadow-2xs"
                style={{ backgroundColor: '#C8102E' }}
              >
                F
              </div>
              <span>Analizando datos Fujitec...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E0E0E0] flex gap-2">
          <input
            type="text"
            placeholder="Pregunta a la IA sobre obras, precios o specs..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 p-2.5 bg-[#F1F3F5] border border-[#E0E0E0] rounded-xl text-xs font-medium focus:outline-none focus:bg-white text-[#2D3436]"
            id="input-chat-ai"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMsg.trim()}
            className="p-2.5 rounded-xl text-white font-bold transition-all disabled:opacity-40 hover:bg-[#A60D26]"
            style={{ backgroundColor: '#C8102E' }}
            id="btn-send-chat-ai"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
