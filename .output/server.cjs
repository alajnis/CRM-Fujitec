var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "5mb" }));
var ai = null;
function getGenAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY configuration is missing");
    }
    ai = new import_genai.GoogleGenAI({
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
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CRM Fujitec MVP", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/gemini/assist-offer", async (req, res) => {
  try {
    const { nombreObra, cliente, montoUSD, cantidadEquipos, modelo, velocidad, paradas, garantiaAnos } = req.body;
    const prompt = `Act\xFAa como Director Comercial Senior de Fujitec Argentina / Uruguay (empresa l\xEDder mundial en ascensores y transporte vertical).
Genera una propuesta comercial ejecutiva y persuasiva en espa\xF1ol para incluir en la Carta Oferta formal dirigida al cliente.

Detalles del proyecto:
- Nombre de la Obra: ${nombreObra || "Proyecto Corporativo"}
- Cliente / Raz\xF3n Social: ${cliente || "Cliente Estimado"}
- Monto Propuesto: USD ${montoUSD || "0"}
- Cantidad de Equipos: ${cantidadEquipos || 1} unidades
- Modelo de Equipo Fujitec: ${modelo || "Fujitec ZEXIA"}
- Especificaciones: Velocidad ${velocidad || 1.75} m/s, ${paradas || 10} paradas
- Garant\xEDa Ofrecida: ${garantiaAnos || 3} a\xF1os de garant\xEDa oficial Fujitec

Redacta:
1. Resumen Ejecutivo (2 p\xE1rrafos profesionales destacando el valor tecnol\xF3gico, la confiabilidad japonesa y el soporte t\xE9cnico regional en Argentina / Uruguay).
2. Cl\xE1usulas de Valor Agregado (Puntos bala sobre eficiencia energ\xE9tica, suavidad de viaje VVVF y seguridad activa).

Usa un tono corporativo formal, limpio y convincente. Menci\xF3n explicita a Fujitec.`;
    const client = getGenAI();
    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });
    res.json({
      success: true,
      result: response.text
    });
  } catch (error) {
    console.error("Error calling Gemini API for assist-offer:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "No se pudo generar la propuesta asistida por IA"
    });
  }
});
app.post("/api/gemini/commercial-chat", async (req, res) => {
  try {
    const { message, contextObras } = req.body;
    const systemInstruction = `Eres "Fujitec Commercial Advisor", el asistente inteligente del CRM MVP Fujitec Argentina y Uruguay.
Tu objetivo es asistir al equipo comercial y directivos en:
- Recomendaci\xF3n de estrategias para destrabar obras sin actualizaci\xF3n (> 7 d\xEDas en el Funnel).
- Sugerencias t\xE9cnicas sobre selecci\xF3n de modelos Fujitec (ZEXIA, VIRIDIS, REXIA, Alta Velocidad, Montacargas) seg\xFAn paradas y velocidad.
- Asesoramiento en cotizaci\xF3n en USD y pol\xEDticas de garant\xEDa (est\xE1ndar 3 a\xF1os).
- Respuestas claras, concisas y en espa\xF1ol rioplatense neutro o corporativo.

Contexto actual de obras en sistema:
${JSON.stringify(contextObras || [])}
`;
    const client = getGenAI();
    const response = await client.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });
    res.json({
      success: true,
      reply: response.text
    });
  } catch (error) {
    console.error("Error in commercial-chat:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Error al procesar la consulta con IA"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server CRM Fujitec operational on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
