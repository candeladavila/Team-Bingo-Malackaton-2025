// chatbot-terminal.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Database from './database.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Configuración de IA
const AI_PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    enabled: !!process.env.GOOGLE_API_KEY,
    genAI: process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null,
    model: "gemini-2.0-flash"
  }
};

// Esquema de la base de datos
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

// Prompts especializados
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

// Recursos de salud mental
const MENTAL_HEALTH_RESOURCES = {
  crisis: {
    telefono: '717 003 717',
    emergencias: '112',
    texto: `🔴 **AYUDA INMEDIATA**:\n• Teléfono de la Esperanza: 717 003 717 (24/7)\n• Emergencias: 112\n• Urgencias hospitalarias\nNo estás solo/a. Hay ayuda disponible.`
  }
};

// Funciones de utilidad
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

function isUrgentQuery(message) {
  const urgentWords = [
    'suicidio', 'matarme', 'acabar con todo', 'no quiero vivir',
    'crisis', 'urgencia', 'emergencia', 'desesperado'
  ];
  return urgentWords.some(word => message.toLowerCase().includes(word));
}

// Funciones de IA
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
    
    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    
    console.log('🤖 SQL Generado:', sql);
    return sql;
  } catch (error) {
    console.error('Error generando SQL:', error);
    throw new Error("No pude generar la consulta SQL");
  }
}

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

// Función principal del chatbot
async function processMessage(message) {
  const isUrgent = isUrgentQuery(message);
  const isData = isDataQuery(message);
  
  let reply;
  let usedData = false;

  console.log('\n' + '═'.repeat(60));
  console.log(`🧠 Procesando: "${message}"`);
  console.log(`📊 Es consulta de datos: ${isData ? 'SÍ' : 'NO'}`);
  console.log(`🚨 Es urgente: ${isUrgent ? 'SÍ' : 'NO'}`);

  // Flujo agentic
  if (isData && Database.pool && AI_PROVIDERS.gemini.enabled) {
    try {
      console.log('🔍 Detectada pregunta de datos, generando SQL...');
      
      const generatedSQL = await generateSQL(message);
      
      console.log('🗄️ Ejecutando consulta en Oracle...');
      const queryResults = await Database.executeQuery(generatedSQL);
      usedData = queryResults && queryResults.length > 0;
      
      if (usedData) {
        console.log(`📊 Obtenidos ${queryResults.length} registros de Oracle`);
        console.log('🤖 Interpretando resultados con IA...');
        reply = await interpretResults(queryResults, message);
      } else {
        reply = "💙 No encontré datos específicos para tu consulta. ¿Podrías reformularla o preguntar sobre otra comunidad o diagnóstico?";
      }
      
    } catch (sqlError) {
      console.error('❌ Error en flujo agentic:', sqlError.message);
      reply = "💙 Tuve problemas para consultar los datos. Por favor, intenta con una pregunta más específica sobre comunidades autónomas o diagnósticos.";
    }
  } else if (isUrgent) {
    reply = `💙 Veo que estás pasando por un momento difícil.\n${MENTAL_HEALTH_RESOURCES.crisis.texto}`;
  } else {
    console.log('💭 Generando respuesta general con IA...');
    reply = await generateGeneralResponse(message);
  }

  // Guardar en base de datos si es posible
  if (Database.pool) {
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
      // Silencioso si falla
    }
  }

  return {
    reply,
    isUrgent,
    usedData,
    provider: AI_PROVIDERS.gemini.enabled ? "Google Gemini" : "Sistema Básico"
  };
}

// Interfaz de terminal
function createChatInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log('🚀 ' + '═'.repeat(50));
  console.log('   🤖 ACOMPAÑA - Chatbot Agentic de Salud Mental');
  console.log('   🧠 IA Generativa + Base de Datos Oracle');
  console.log('═'.repeat(50));
  
  console.log('\n💚 Hola, soy Acompaña. Usando inteligencia artificial, puedo consultar');
  console.log('   datos reales de salud mental en España y explicártelos de forma comprensible.');
  console.log('\n📊 Puedes preguntarme sobre:');
  console.log('   • Estadísticas por comunidad autónoma');
  console.log('   • Enfermedades mentales más comunes');
  console.log('   • Comparativas entre regiones');
  console.log('   • Recursos de ayuda y apoyo');
  
  console.log('\n💡 Ejemplos que activan consultas inteligentes:');
  console.log('   • "¿Cuántos casos de depresión hay en Madrid?"');
  console.log('   • "Estadísticas de ansiedad por comunidad"');
  console.log('   • "Enfermedades más comunes en Cataluña"');
  
  console.log('\n🚨 Si necesitas ayuda inmediata, escribe:');
  console.log('   • "crisis", "urgencia", "necesito ayuda"');
  
  console.log('\n' + '─'.repeat(60));
  console.log('Escribe tu mensaje (o "salir" para terminar):');
  console.log('─'.repeat(60));

  function askQuestion() {
    rl.question('\n👤 Tú: ', async (input) => {
      if (input.toLowerCase() === 'salir') {
        console.log('\n💙 Gracias por conversar. Recuerda: No estás solo/a. Cuídate.');
        rl.close();
        if (Database.pool) {
          await Database.close();
        }
        process.exit(0);
      }

      if (input.trim() === '') {
        console.log('💙 Por favor, escribe tu mensaje.');
        return askQuestion();
      }

      try {
        const startTime = Date.now();
        const response = await processMessage(input);
        const processingTime = Date.now() - startTime;

        console.log(`\n🤖 Acompaña (${response.provider}):`);
        console.log('─'.repeat(40));
        
        if (response.isUrgent) {
          console.log('🚨 ' + response.reply);
        } else {
          console.log(response.reply);
        }
        
        if (response.usedData) {
          console.log('📊 [Consulta inteligente a base de datos]');
        }
        
        console.log(`⏱️  [Procesado en ${processingTime}ms]`);
        console.log('─'.repeat(40));

      } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('💙 Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.');
      }

      askQuestion();
    });
  }

  return askQuestion;
}

// Inicialización y ejecución
async function startChatbot() {
  try {
    console.log('🔧 Inicializando sistema...');
    
    // Inicializar base de datos
    const dbInitialized = await Database.initialize();
    
    console.log(`🗄️  Base de datos: ${dbInitialized ? 'CONECTADA' : 'NO CONECTADA'}`);
    console.log(`🤖 IA: ${AI_PROVIDERS.gemini.enabled ? 'Google Gemini CONFIGURADO' : 'NO CONFIGURADO'}`);
    
    if (!AI_PROVIDERS.gemini.enabled) {
      console.log('⚠️  Advertencia: Sin configuración de IA. Las respuestas serán básicas.');
      console.log('   Configura GOOGLE_API_KEY en tu archivo .env para funcionalidad completa.');
    }
    
    if (!dbInitialized) {
      console.log('⚠️  Advertencia: Sin conexión a base de datos.');
      console.log('   Las consultas de datos no estarán disponibles.');
    }

    // Iniciar interfaz de chat
    const startChat = createChatInterface();
    startChat();

  } catch (error) {
    console.error('❌ Error al iniciar el chatbot:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n\n💙 Cerrando chatbot... Hasta pronto!');
  if (Database.pool) {
    await Database.close();
  }
  process.exit(0);
});

// Iniciar la aplicación
startChatbot();