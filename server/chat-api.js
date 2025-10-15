import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware de seguridad
app.use(cors());
app.use(express.json());

// Rate limiting para prevenir abusos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por ventana
});
app.use("/api/chat", limiter);

// Base de conocimiento sobre salud mental en España
const MENTAL_HEALTH_KNOWLEDGE = {
  "estadísticas": `
En España (datos aproximados):
• 1 de cada 4 personas tendrá problemas de salud mental a lo largo de su vida
• La ansiedad y depresión son los trastornos más comunes
• Solo el 30-40% busca ayuda profesional
• El 75% de los trastornos mentales comienzan antes de los 25 años
• Tasa de suicidio: ~10 por 100,000 habitantes (segunda causa de muerte en jóvenes)
  `,
  "recursos": `
Recursos disponibles en España:
• Teléfono de la Esperanza: 717 003 717
• Salud Mental España: federacion@consaludmental.org
• Urgencias: 112
• APPF (Asociación Pro Salud Mental): 915 47 01 11
• Hospitales con unidades de salud mental
• Centros de salud mental públicos
  `,
  "crisis": `
EN CASO DE CRISIS INMEDIATA:
• Llama al 112 (emergencias)
• Acude a urgencias del hospital más cercano
• Contacta con familiares o amigos de confianza
• No estás solo/a - hay ayuda disponible

Recuerda: Los pensamientos de crisis son temporales.
  `
};

// Prompt especializado para salud mental
const SYSTEM_PROMPT = `Eres "Acompaña", un asistente virtual especializado en salud mental en España. 

DIRECTRICES ESENCIALES:
1. TONO: Empático, cálido, comprensivo y no juzgador
2. LENGUAJE: Claro, sencillo y cercano
3. ACTITUD: Validar emociones, ofrecer esperanza, ser realista
4. SEGURIDAD: Nunca dar diagnósticos ni tratamientos médicos
5. ORIENTACIÓN: Dirigir a recursos profesionales cuando sea necesario

INFORMACIÓN CLAVE SOBRE ESPAÑA:
${Object.entries(MENTAL_HEALTH_KNOWLEDGE).map(([key, value]) => `${key}: ${value}`).join('\n')}

RESPUESTA IDEAL:
• Validar la emoción: "Entiendo que debe ser difícil..."
• Ofrecer información útil contextualizada
• Sugerir recursos apropiados
• Transmitir esperanza: "Con apoyo adecuado, las cosas pueden mejorar"
• Preguntar si necesita más ayuda específica

SI DETECTAS UNA CRISIS GRAVE:
Ofrecer inmediatamente los recursos de crisis y animar a contactar con profesionales.`;

function detectUrgentKeywords(message) {
  const urgentWords = ['suicidio', 'matarme', 'acabar con todo', 'no quiero vivir', 'crisis', 'urgencia', 'emergencia', 'desesperado'];
  return urgentWords.some(word => message.toLowerCase().includes(word));
}

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  
  if (!message?.trim()) {
    return res.status(400).json({ error: "Mensaje vacío" });
  }

  // Detectar urgencia
  const isUrgent = detectUrgentKeywords(message);

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-8), // Más contexto histórico
      { role: "user", content: message }
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 500,
        temperature: 0.7, // Un poco más creativo pero controlado
      })
    });

    if (!openaiRes.ok) {
      throw new Error(`OpenAI API error: ${openaiRes.status}`);
    }

    const json = await openaiRes.json();
    let reply = json.choices?.[0]?.message?.content ?? "Lo siento, en este momento no puedo procesar tu mensaje. ¿Podrías intentarlo de nuevo?";

    // Añadir alerta de crisis si es urgente
    if (isUrgent) {
      reply += `\n\n🔴 **Recursos inmediatos**: ${MENTAL_HEALTH_KNOWLEDGE.crisis}`;
    }

    res.json({ 
      reply,
      isUrgent,
      resources: isUrgent ? MENTAL_HEALTH_KNOWLEDGE.crisis : null
    });

  } catch (err) {
    console.error("Error en /api/chat:", err);
    
    // Respuesta de respaldo para errores
    const fallbackReply = detectUrgentKeywords(message) 
      ? `Veo que puedes estar pasando por un momento difícil. Por favor, contacta inmediatamente con el Teléfono de la Esperanza: 717 003 717 o urgencias al 112. No estás solo/a.`
      : "Lo siento, estoy teniendo dificultades técnicas. Por favor, intenta de nuevo en un momento o contacta con los recursos de ayuda directamente.";

    res.status(500).json({ 
      reply: fallbackReply,
      isUrgent: detectUrgentKeywords(message),
      error: true 
    });
  }
});

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    service: "Mental Health Chat API",
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor de chat ejecutándose en puerto ${PORT}`);
  console.log(`💚 Especializado en salud mental - Modo: ${process.env.NODE_ENV || 'development'}`);
});