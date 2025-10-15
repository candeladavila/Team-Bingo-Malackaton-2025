import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Database from './database.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// Configuración multi-proveedor como en el proyecto de referencia
const AI_PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    enabled: !!process.env.GOOGLE_API_KEY,
    genAI: process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null,
    model: "gemini-2.0-flash"
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Demasiadas solicitudes. Por favor, espera 15 minutos." }
});
app.use("/api/chat", limiter);

// Esquema de la base de datos para el agente SQL
const DATABASE_SCHEMA = `
TABLAS DISPONIBLES EN ORACLE:
- VISTA_MUY_INTERESANTE (region, enfermedad, num_casos)
  • region: Comunidad Autónoma (Texto)
  • enfermedad: Diagnóstico Principal (Texto) 
  • num_casos: Número de casos (Número)

EJEMPLOS DE CONSULTAS VÁLIDAS:
- "SELECT region, enfermedad, num_casos FROM VISTA_MUY_INTERESANTE WHERE region LIKE '%Madrid%'"
- "SELECT enfermedad, SUM(num_casos) as total FROM VISTA_MUY_INTERESANTE GROUP BY enfermedad ORDER BY total DESC"
- "SELECT region, COUNT(*) as tipos_enfermedad FROM VISTA_MUY_INTERESANTE GROUP BY region"

RESTRICCIONES:
- Usar sólo la tabla VISTA_MUY_INTERESANTE
- No usar comillas en nombres de columnas
- Usar SQL compatible con Oracle
`;

// Prompt especializado para generación de SQL (como en el proyecto de referencia)
const SQL_GENERATION_PROMPT = `Eres un experto en SQL para Oracle especializado en salud mental. 
Genera SOLO la consulta SQL compatible con Oracle.

ESQUEMA DE LA BASE DE DATOS:
${DATABASE_SCHEMA}

INSTRUCCIONES:
1. Genera SQL válido para Oracle
2. Usa sólo columnas existentes en el esquema
3. No incluyas explicaciones, sólo el SQL
4. Para búsquedas de texto usa LIKE con %%
5. Ordena por num_casos DESC cuando sea relevante

PREGUNTA DEL USUARIO: {userQuestion}

SQL:`;

// Prompt para interpretación de resultados
const INTERPRETATION_PROMPT = `Eres un experto en análisis de datos de salud mental en España. 
Analiza e interpreta los resultados SQL y proporciona una respuesta útil y empática.

CONTEXTO:
- Datos reales del sistema de salud mental español
- Información por comunidades autónomas y diagnósticos

RESULTADOS SQL:
{queryResults}

PREGUNTA ORIGINAL: {originalQuestion}

DIRECTIVAS DE RESPUESTA:
1. Sé empático y validante
2. Proporciona contexto sobre los datos
3. Ofrece recursos de ayuda cuando sea relevante
4. Mantén un tono profesional pero accesible
5. Si hay pocos datos, explícalo amablemente

RESPUESTA:`;

// Base de conocimiento de salud mental
const MENTAL_HEALTH_RESOURCES = {
  crisis: {
    telefono: '717 003 717',
    emergencias: '112',
    texto: `🔴 **AYUDA INMEDIATA**:
• Teléfono de la Esperanza: 717 003 717 (24/7)
• Emergencias: 112
• Urgencias hospitalarias
No estás solo/a. Hay ayuda disponible.`
  }
};

// Función para generar SQL con Gemini (como en el notebook de referencia)
async function generateSQL(userQuestion) {
  if (!AI_PROVIDERS.gemini.enabled) {
    throw new Error("Google Gemini no está configurado");
  }

  const prompt = SQL_GENERATION_PROMPT.replace('{userQuestion}', userQuestion);
  const model = AI_PROVIDERS.gemini.genAI.getGenerativeModel({ 
    model: AI_PROVIDERS.gemini.model 
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let sql = response.text().trim();
    
    // Limpiar el SQL (eliminar markdown si existe)
    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    
    console.log('🤖 SQL Generado:', sql);
    return sql;
  } catch (error) {
    console.error('Error generando SQL:', error);
    throw new Error("No pude generar la consulta SQL");
  }
}

// Función para interpretar resultados con Gemini
async function interpretResults(queryResults, originalQuestion) {
  if (!AI_PROVIDERS.gemini.enabled) {
    return "💙 Basándome en los datos: " + JSON.stringify(queryResults);
  }

  const prompt = INTERPRETATION_PROMPT
    .replace('{queryResults}', JSON.stringify(queryResults, null, 2))
    .replace('{originalQuestion}', originalQuestion);

  const model = AI_PROVIDERS.gemini.genAI.getGenerativeModel({ 
    model: AI_PROVIDERS.gemini.model 
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error interpretando resultados:', error);
    return "💙 He consultado los datos pero tengo dificultades para interpretarlos. Contacta con profesionales para más información.";
  }
}

// Detección de preguntas sobre datos
function isDataQuery(message) {
  const dataKeywords = [
    'estadística', 'estadísticas', 'dato', 'datos', 'casos', 'número',
    'cuántos', 'cuántas', 'incidencia', 'prevalencia', 'comunidad autónoma',
    'región', 'diagnóstico', 'enfermedad mental', 'salud mental',
    'madrid', 'cataluña', 'andalucía', 'valencia', 'galicia', 'país vasco',
    'castilla', 'navarra', 'aragón', 'extremadura', 'murcia', 'baleares', 'canarias'
  ];
  return dataKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Detección de urgencias
function isUrgentQuery(message) {
  const urgentWords = [
    'suicidio', 'matarme', 'acabar con todo', 'no quiero vivir',
    'crisis', 'urgencia', 'emergencia', 'desesperado'
  ];
  return urgentWords.some(word => message.toLowerCase().includes(word));
}

// Endpoint principal mejorado con enfoque agentic
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  
  if (!message?.trim()) {
    return res.status(400).json({ 
      error: "Mensaje vacío",
      reply: "Por favor, escribe tu mensaje."
    });
  }

  const isUrgent = isUrgentQuery(message);
  const isData = isDataQuery(message);
  
  try {
    let reply;
    let usedData = false;

    // Flujo agentic: Si es pregunta de datos → Generar SQL → Ejecutar → Interpretar
    if (isData && Database.pool && AI_PROVIDERS.gemini.enabled) {
      try {
        console.log('🔍 Detectada pregunta de datos, generando SQL...');
        
        // 1. Generar SQL con IA
        const generatedSQL = await generateSQL(message);
        
        // 2. Ejecutar en Oracle
        const queryResults = await Database.executeQuery(generatedSQL);
        usedData = queryResults && queryResults.length > 0;
        
        if (usedData) {
          console.log(`📊 Obtenidos ${queryResults.length} registros de Oracle`);
          
          // 3. Interpretar resultados con IA
          reply = await interpretResults(queryResults, message);
        } else {
          reply = "💙 No encontré datos específicos para tu consulta. ¿Podrías reformularla o preguntar sobre otra comunidad o diagnóstico?";
        }
        
      } catch (sqlError) {
        console.error('Error en flujo agentic:', sqlError);
        reply = "💙 Tuve problemas para consultar los datos. Por favor, intenta con una pregunta más específica sobre comunidades autónomas o diagnósticos.";
      }
    } else if (isUrgent) {
      // Respuesta directa para crisis
      reply = `💙 Veo que estás pasando por un momento difícil. ${MENTAL_HEALTH_RESOURCES.crisis.texto}`;
    } else {
      // Respuesta general con IA
      reply = await generateGeneralResponse(message);
    }

    // Guardar en base de datos
    try {
      await Database.executeQuery(
        `INSERT INTO chat_conversations (user_message, assistant_response, is_urgent, used_data, created_at) 
         VALUES (:userMessage, :assistantResponse, :isUrgent, :usedData, SYSDATE)`,
        {
          userMessage: message.substring(0, 4000),
          assistantResponse: reply.substring(0, 4000),
          isUrgent: isUrgent ? 1 : 0,
          usedData: usedData ? 1 : 0
        }
      );
    } catch (dbError) {
      console.log('Conversación guardada localmente');
    }

    res.json({ 
      reply,
      isUrgent,
      usedData,
      provider: AI_PROVIDERS.gemini.enabled ? "Google Gemini" : "Sistema Básico",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en /api/chat:", error);
    
    const fallbackReply = isUrgent 
      ? `💙 Veo que estás pasando por un momento difícil. Contacta inmediatamente: ${MENTAL_HEALTH_RESOURCES.crisis.telefono}`
      : "💙 Lo siento, hay problemas técnicos. Por favor, intenta de nuevo.";

    res.status(500).json({ 
      reply: fallbackReply,
      isUrgent,
      error: true
    });
  }
});

// Función para respuestas generales
async function generateGeneralResponse(message) {
  if (!AI_PROVIDERS.gemini.enabled) {
    return "💙 Soy Acompaña, tu asistente de salud mental. Puedo ayudarte con información sobre recursos en España y datos de salud mental. ¿En qué puedo ayudarte?";
  }

  const generalPrompt = `Eres "Acompaña", un asistente virtual especializado en salud mental en España.

Responde de manera empática y útil a la siguiente pregunta. Si es sobre datos específicos, indica que puedes consultar información por comunidades autónomas.

Pregunta: ${message}

Respuesta:`;

  const model = AI_PROVIDERS.gemini.genAI.getGenerativeModel({ 
    model: AI_PROVIDERS.gemini.model 
  });

  try {
    const result = await model.generateContent(generalPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "💙 Hola, soy Acompaña. Puedo ayudarte con información sobre salud mental en España. ¿En qué puedo ayudarte?";
  }
}

// Endpoint para probar generación de SQL directamente
app.post("/api/generate-sql", async (req, res) => {
  const { question } = req.body;
  
  if (!question?.trim()) {
    return res.status(400).json({ error: "Pregunta vacía" });
  }

  try {
    const sql = await generateSQL(question);
    res.json({ sql, question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoints existentes
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    service: "Team Bingo - Agentic Mental Health Chat",
    database: Database.pool ? "connected" : "not_configured",
    ai_provider: AI_PROVIDERS.gemini.enabled ? "Google Gemini" : "none",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/schema", (req, res) => {
  res.json({ schema: DATABASE_SCHEMA });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await Database.initialize();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor Agentic ejecutándose en puerto ${PORT}`);
      console.log(`💚 Chatbot de salud mental con IA Generativa`);
      console.log(`🤖 Proveedor IA: ${AI_PROVIDERS.gemini.enabled ? 'Google Gemini' : 'Ninguno'}`);
      console.log(`🗄️  Base de datos: ${Database.pool ? 'CONECTADA' : 'NO CONECTADA'}`);
    });
    
  } catch (error) {
    console.log('⚠️  Iniciando servidor sin base de datos...');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT} (sin BD)`);
    });
  }
};

startServer();

export default app;