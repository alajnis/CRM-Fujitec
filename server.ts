import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

/**
 * Los endpoints de Gemini no requieren login (no hay sesión de servidor: el
 * login de la app es contra Supabase desde el cliente) y consumen la
 * GEMINI_API_KEY del servidor. Sin límite, cualquiera que descubra la URL
 * pública de Vercel puede pegarle directo con curl y generar costos en la
 * cuenta de Google AI. Rate limit simple en memoria por IP: alcanza para
 * frenar abuso automatizado sin agregar una dependencia ni un store externo.
 */
const LIMITE_IA_POR_MINUTO = 15;
const solicitudesPorIp = new Map<string, number[]>();

function limitarSolicitudesIA(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'desconocida';
  const ahora = Date.now();
  const ventana = 60_000;

  const previas = (solicitudesPorIp.get(ip) || []).filter((t) => ahora - t < ventana);
  if (previas.length >= LIMITE_IA_POR_MINUTO) {
    res.status(429).json({ success: false, error: "Demasiadas solicitudes. Esperá un minuto e intentá de nuevo." });
    return;
  }

  previas.push(ahora);
  solicitudesPorIp.set(ip, previas);
  next();
}

// Initialize Gemini AI Client if API key is present
let ai: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY configuration is missing");
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return ai;
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CRM Fujitec MVP", time: new Date().toISOString() });
});

// API Endpoint 1: Generar Resumen Comercial / Carta Oferta con IA
app.post("/api/gemini/assist-offer", limitarSolicitudesIA, async (req, res) => {
  try {
    const { nombreObra, cliente, montoUSD, cantidadEquipos, modelo, velocidad, paradas, garantiaAnos } = req.body;

    const prompt = `Actúa como Director Comercial Senior de Fujitec Argentina / Uruguay (empresa líder mundial en ascensores y transporte vertical).
Genera una propuesta comercial ejecutiva y persuasiva en español para incluir en la Carta Oferta formal dirigida al cliente.

Detalles del proyecto:
- Nombre de la Obra: ${nombreObra || 'Proyecto Corporativo'}
- Cliente / Razón Social: ${cliente || 'Cliente Estimado'}
- Monto Propuesto: USD ${montoUSD || '0'}
- Cantidad de Equipos: ${cantidadEquipos || 1} unidades
- Modelo de Equipo Fujitec: ${modelo || 'Fujitec ZEXIA'}
- Especificaciones: Velocidad ${velocidad || 1.75} m/s, ${paradas || 10} paradas
- Garantía Ofrecida: ${garantiaAnos || 3} años de garantía oficial Fujitec

Redacta:
1. Resumen Ejecutivo (2 párrafos profesionales destacando el valor tecnológico, la confiabilidad japonesa y el soporte técnico regional en Argentina / Uruguay).
2. Cláusulas de Valor Agregado (Puntos bala sobre eficiencia energética, suavidad de viaje VVVF y seguridad activa).

Usa un tono corporativo formal, limpio y convincente. Mención explicita a Fujitec.`;

    const client = getGenAI();
    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      result: response.text
    });
  } catch (error: any) {
    console.error("Error calling Gemini API for assist-offer:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "No se pudo generar la propuesta asistida por IA"
    });
  }
});

// API Endpoint 2: Asistente Virtual Comercial Fujitec Chat
app.post("/api/gemini/commercial-chat", limitarSolicitudesIA, async (req, res) => {
  try {
    const { message, contextObras } = req.body;

    const systemInstruction = `Eres "Fujitec Commercial Advisor", el asistente inteligente del CRM MVP Fujitec Argentina y Uruguay.
Tu objetivo es asistir al equipo comercial y directivos en:
- Recomendación de estrategias para destrabar obras sin actualización (> 7 días en el Funnel).
- Sugerencias técnicas sobre selección de modelos Fujitec (ZEXIA, VIRIDIS, REXIA, Alta Velocidad, Montacargas) según paradas y velocidad.
- Asesoramiento en cotización en USD y políticas de garantía (estándar 3 años).
- Respuestas claras, concisas y en español rioplatense neutro o corporativo.

Contexto actual de obras en sistema:
${JSON.stringify(contextObras || [])}
`;

    const client = getGenAI();
    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7
      }
    });

    res.json({
      success: true,
      reply: response.text
    });
  } catch (error: any) {
    console.error("Error in commercial-chat:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Error al procesar la consulta con IA"
    });
  }
});

async function startServer() {
  // Setup Vite or static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server CRM Fujitec operational on http://localhost:${PORT}`);
  });
}

startServer();
