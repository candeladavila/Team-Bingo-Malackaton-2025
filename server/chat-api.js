import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cors from "cors";
import Database from './database.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

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

// Base de conocimiento de salud mental en España
const MENTAL_HEALTH_KNOWLEDGE = {
  crisis: {
    telefono: '717 003 717',
    emergencias: '112',
    texto: `🔴 **AYUDA INMEDIATA**:
• Teléfono de la Esperanza: 717 003 717 (24/7)
• Emergencias: 112
• Urgencias hospitalarias
No estás solo/a. Hay ayuda disponible.`
  },
  recursos: `💙 **RECURSOS EN ESPAÑA**:
• Salud Mental España: federacion@consaludmental.org
• APPF: 915 47 01 11
• Centros de Salud Mental públicos
• Psicólogos colegiados`,
  
  estadisticas: `📊 **DATOS ESPAÑA**:
• 1 de cada 4 personas tendrá problemas de salud mental
• Ansiedad y depresión son los más comunes
• Solo 30-40% busca ayuda profesional
• 75% de trastornos comienzan antes de los 25 años`
};

// Sistema de prompts especializado
const SYSTEM_PROMPT = `Eres "Acompaña", asistente virtual especializado en salud mental en España con acceso a datos reales.

DIRECTRICES:
💚 TONO: Empático, cálido, validante
💚 SEGURIDAD: No dar diagnósticos médicos
💚 ORIENTACIÓN: Dirigir a recursos profesionales
💚 DATOS: Usar información real de España cuando esté disponible

INFORMACIÓN ESPAÑA:
${Object.entries(MENTAL_HEALTH_KNOWLEDGE).map(([key, value]) => 
  `## ${key.toUpperCase()}:\n${typeof value === 'object' ? value.texto : value}`
).join('\n\n')}

RESPUESTA IDEAL:
1. Validar emoción: "Entiendo que esto debe ser difícil..."
2. Ofrecer información relevante (usar datos reales si están disponibles)
3. Sugerir recursos apropiados en España
4. Transmitir esperanza: "Con apoyo adecuado, las cosas pueden mejorar"
5. Preguntar si necesita más ayuda específica

SI EL USUARIO PREGUNTA SOBRE DATOS ESPECÍFICOS:
- Comunidades autónomas
- Diagnósticos principales  
- Número de casos
- Estadísticas por región
Consulta la base de datos y proporciona información precisa.`;

// Detección de palabras clave para consultas a BD
function detectDataKeywords(message) {
  const dataKeywords = [
    'estadística', 'estadísticas', 'dato', 'datos', 'casos', 'número',
    'cuántos', 'cuántas', 'incidencia', 'prevalencia', 'comunidad autónoma',
    'región', 'diagnóstico', 'enfermedad mental', 'salud mental españa',
    'andalucía', 'cataluña', 'madrid', 'valencia', 'galicia', 'castilla',
    'aragón', 'navarra', 'país vasco', 'cantabria', 'asturias', 'extremadura',
    'murcia', 'baleares', 'canarias', 'rioja'
  ];
  return dataKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Detección de urgencias
function detectUrgentKeywords(message) {
  const urgentWords = [
    'suicidio', 'matarme', 'acabar con todo', 'no quiero vivir',
    'crisis', 'urgencia', 'emergencia', 'desesperado'
  ];
  return urgentWords.some(word => message.toLowerCase().includes(word));
}

// Función para consultar datos de salud mental desde Oracle
async function queryMentalHealthData(userQuestion) {
  try {
    let sqlQuery = `
      SELECT region, enfermedad, num_casos 
      FROM VISTA_MUY_INTERESANTE 
      WHERE 1=1
    `;
    
    const params = {};
    
    // Detectar región en la pregunta
    const regions = [
      'andalucía', 'cataluña', 'madrid', 'valencia', 'galicia', 'castilla',
      'aragón', 'navarra', 'país vasco', 'cantabria', 'asturias', 'extremadura',
      'murcia', 'baleares', 'canarias', 'rioja'
    ];
    
    const foundRegion = regions.find(region => 
      userQuestion.toLowerCase().includes(region)
    );
    
    if (foundRegion) {
      sqlQuery += ` AND LOWER(region) LIKE LOWER(:region)`;
      params.region = `%${foundRegion}%`;
    }
    
    // Detectar enfermedad específica
    const diseases = [
      'depresión', 'ansiedad', 'trastorno', 'esquizofrenia', 'bipolar',
      'estrés', 'pánico', 'fobia', 'obsesivo', 'compulsivo'
    ];
    
    const foundDisease = diseases.find(disease => 
      userQuestion.toLowerCase().includes(disease)
    );
    
    if (foundDisease) {
      sqlQuery += ` AND LOWER(enfermedad) LIKE LOWER(:enfermedad)`;
      params.enfermedad = `%${foundDisease}%`;
    }
    
    sqlQuery += ` ORDER BY num_casos DESC FETCH FIRST 10 ROWS ONLY`;
    
    const results = await Database.executeQuery(sqlQuery, params);
    return results;
    
  } catch (error) {
    console.error('Error consultando datos de salud mental:', error);
    return null;
  }
}

// Endpoint principal de chat
app.post("/api/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  
  if (!message?.trim()) {
    return res.status(400).json({ 
      error: "Mensaje vacío",
      reply: "Por favor, escribe tu mensaje."
    });
  }

  const isUrgent = detectUrgentKeywords(message);
  const hasDataQuery = detectDataKeywords(message);
  
  try {
    let dataContext = '';
    
    // Consultar datos reales si es necesario
    if (hasDataQuery && Database.pool) {
      const mentalHealthData = await queryMentalHealthData(message);
      if (mentalHealthData && mentalHealthData.length > 0) {
        dataContext = `\n\n📊 **DATOS REALES DE SALUD MENTAL EN ESPAÑA**:\n`;
        mentalHealthData.forEach(row => {
          dataContext += `• ${row.REGION}: ${row.ENFERMEDAD} - ${row.NUM_CASOS} casos\n`;
        });
        dataContext += `\nEstos son datos reales del sistema de salud español.`;
      } else {
        dataContext = `\n\nℹ️ No encontré datos específicos para tu consulta, pero puedo ofrecerte información general sobre salud mental en España.`;
      }
    }

    const messages = [
      { 
        role: "system", 
        content: SYSTEM_PROMPT + (dataContext ? `\n\nINFORMACIÓN ACTUAL DE LA BASE DE DATOS:${dataContext}` : '') 
      },
      ...history.slice(-6),
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content?.trim() 
      || "💙 Lo siento, no puedo generar una respuesta en este momento. ¿Podrías intentarlo de nuevo?";

    // Añadir recursos de crisis si es urgente
    if (isUrgent) {
      reply += `\n\n${MENTAL_HEALTH_KNOWLEDGE.crisis.texto}`;
    }

    // Guardar en base de datos
    try {
      await Database.executeQuery(
        `INSERT INTO chat_conversations (user_message, assistant_response, is_urgent, has_data_query, created_at) 
         VALUES (:userMessage, :assistantResponse, :isUrgent, :hasDataQuery, SYSDATE)`,
        {
          userMessage: message.substring(0, 4000),
          assistantResponse: reply.substring(0, 4000),
          isUrgent: isUrgent ? 1 : 0,
          hasDataQuery: hasDataQuery ? 1 : 0
        }
      );
    } catch (dbError) {
      console.log('Chat guardado localmente (sin BD)');
    }

    res.json({ 
      reply,
      isUrgent,
      hasData: hasDataQuery && dataContext !== '',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en /api/chat:", error);
    
    const fallbackReply = isUrgent 
      ? `💙 Veo que estás pasando por un momento difícil. Contacta inmediatamente: ${MENTAL_HEALTH_KNOWLEDGE.crisis.telefono} o emergencias: 112`
      : "💙 Lo siento, hay problemas técnicos. Por favor, intenta de nuevo o contacta directamente con los recursos de ayuda.";

    res.status(500).json({ 
      reply: fallbackReply,
      isUrgent,
      error: true
    });
  }
});

// Endpoint para consultas directas a la base de datos
app.get("/api/mental-health-data", async (req, res) => {
  try {
    const { region, enfermedad, limit = 20 } = req.query;
    
    let sqlQuery = `
      SELECT region, enfermedad, num_casos 
      FROM VISTA_MUY_INTERESANTE 
      WHERE 1=1
    `;
    
    const params = {};
    
    if (region) {
      sqlQuery += ` AND LOWER(region) LIKE LOWER(:region)`;
      params.region = `%${region}%`;
    }
    
    if (enfermedad) {
      sqlQuery += ` AND LOWER(enfermedad) LIKE LOWER(:enfermedad)`;
      params.enfermedad = `%${enfermedad}%`;
    }
    
    sqlQuery += ` ORDER BY num_casos DESC FETCH FIRST :limit ROWS ONLY`;
    params.limit = parseInt(limit);
    
    const results = await Database.executeQuery(sqlQuery, params);
    
    res.json({
      success: true,
      data: results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en /api/mental-health-data:', error);
    res.status(500).json({
      success: false,
      error: "Error consultando la base de datos",
      data: []
    });
  }
});

// Endpoints de información
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    service: "Team Bingo - Mental Health Chat con Oracle",
    database: Database.pool ? "connected" : "not_configured",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/resources", (req, res) => {
  res.json(MENTAL_HEALTH_KNOWLEDGE);
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    error: "Error interno del servidor",
    message: "Por favor, intenta más tarde."
  });
});

// Ruta no encontrada
app.use("*", (req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Inicializar y arrancar servidor
const startServer = async () => {
  try {
    await Database.initialize();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`💚 Chatbot de salud mental con Oracle Database`);
      console.log(`📊 Vista de datos: VISTA_MUY_INTERESANTE`);
    });
    
  } catch (error) {
    console.log('⚠️  Iniciando servidor sin base de datos...');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT} (sin BD)`);
      console.log(`💚 Chatbot de salud mental (modo básico)`);
    });
  }
};

startServer();

export default app;