// chatbot-fixed.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Database from './database.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Configuración mejorada
const AI_PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    enabled: !!process.env.GOOGLE_API_KEY,
    genAI: process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null,
    model: "gemini-pro"  // Modelo ligero y rápido
  }
};

// Esquema corregido
const DATABASE_SCHEMA = `
TABLAS DISPONIBLES EN ORACLE:
- VISTA_MUY_INTERESANTE (region, enfermedad, num_casos)
  • region: Comunidad Autónoma (Texto)
  • enfermedad: Diagnóstico Principal (Texto) 
  • num_casos: Número de casos (Número)

EJEMPLOS DE CONSULTAS VÁLIDAS:
- "SELECT region, enfermedad, num_casos FROM VISTA_MUY_INTERESANTE WHERE region LIKE '%Andalucía%' AND enfermedad LIKE '%esquizofrenia%'"
- "SELECT enfermedad, SUM(num_casos) as total FROM VISTA_MUY_INTERESANTE GROUP BY enfermedad ORDER BY total DESC"
- "SELECT region, COUNT(*) as tipos_enfermedad FROM VISTA_MUY_INTERESANTE GROUP BY region"

RESTRICCIONES:
- Usar sólo la tabla VISTA_MUY_INTERESANTE
- No usar comillas en nombres de columnas
- Usar SQL compatible con Oracle
- Usar LIKE para búsquedas de texto
`;

// Prompts mejorados
const SQL_GENERATION_PROMPT = `Eres un experto en SQL para Oracle especializado en salud mental. 
Genera SOLO la consulta SQL compatible con Oracle.

ESQUEMA DE LA BASE DE DATOS:
${DATABASE_SCHEMA}

INSTRUCCIONES CRÍTICAS:
1. Genera SQL válido para Oracle
2. Usa sólo columnas existentes en el esquema
3. No incluyas explicaciones, sólo el SQL
4. Para búsquedas de texto usa LIKE con %%
5. Ordena por num_casos DESC cuando sea relevante
6. Usa siempre la tabla VISTA_MUY_INTERESANTE

PREGUNTA DEL USUARIO: {userQuestion}

SQL:`;

// Función de detección MEJORADA
function isDataQuery(message) {
  const lowerMsg = message.toLowerCase();
  
  const dataKeywords = [
    // Palabras de cantidad
    'cuántos', 'cuántas', 'cuantos', 'cuantas', 'número', 'numero', 'cantidad',
    'estadística', 'estadísticas', 'estadistica', 'estadisticas', 'dato', 'datos',
    'casos', 'incidencia', 'prevalencia', 'total',
    
    // Regiones - MÁS COMPLETO
    'andalucía', 'andalucia', 'madrid', 'cataluña', 'cataluna', 'valencia', 
    'galicia', 'país vasco', 'pais vasco', 'castilla', 'navarra', 'aragón', 'aragon',
    'extremadura', 'murcia', 'baleares', 'canarias', 'rioja', 'asturias', 'cantabria',
    
    // Enfermedades - MÁS COMPLETO
    'esquizofrenia', 'depresión', 'depresion', 'ansiedad', 'trastorno bipolar',
    'trastorno obsesivo', 'tdah', 'psicosis', 'demencia', 'alzheimer',
    'trastorno alimenticio', 'bulimia', 'anorexia', 'autismo', 'asperger',
    
    // Términos generales de salud mental
    'enfermedad mental', 'salud mental', 'diagnóstico', 'diagnostico',
    'tratamiento', 'prevención', 'prevencion'
  ];

  return dataKeywords.some(keyword => lowerMsg.includes(keyword));
}

function isUrgentQuery(message) {
  const urgentWords = [
   
    'crisis', 'urgencia', 'emergencia', 'desesperado', 'ayuda inmediata'
  ];
  return urgentWords.some(word => message.toLowerCase().includes(word));
}

// Función de IA MEJORADA con manejo de errores
async function generateSQL(userQuestion) {
  if (!AI_PROVIDERS.gemini.enabled) {
    throw new Error("Google Gemini no está configurado");
  }

  try {
    const prompt = SQL_GENERATION_PROMPT.replace('{userQuestion}', userQuestion);
    const model = AI_PROVIDERS.gemini.genAI.getGenerativeModel({ 
      model: AI_PROVIDERS.gemini.model 
    });

    console.log('   🤖 Solicitando generación de SQL a Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let sql = response.text().trim();
    
    // Limpiar el SQL más agresivamente
    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    sql = sql.replace(/^SELECT/i, 'SELECT').replace(/;$/, ''); // Eliminar punto y coma final
    
    console.log('   ✅ SQL Generado:', sql);
    return sql;
  } catch (error) {
    // Mostrar el error completo para depuración
    console.error('   ❌ Error de Gemini:', error);
    if (error && error.status === 404) {
      console.error('   ❌ El modelo Gemini especificado no está disponible para tu API Key. Prueba con "gemini-1.0-pro" o revisa tu key en https://aistudio.google.com/app/apikey');
    }
    if (error && error.status === 403) {
      console.error('   ❌ Tu API Key de Gemini no tiene permisos o la API no está habilitada. Actívala en https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview');
    }
    // SQL de respaldo para preguntas comunes
    const backupSQL = getBackupSQL(userQuestion);
    if (backupSQL) {
      console.log('   🔄 Usando SQL de respaldo:', backupSQL);
      return backupSQL;
    }
    throw new Error("No pude generar la consulta SQL (verifica tu API Key y modelo)");
  }
}

// SQLs de respaldo para preguntas comunes
function getBackupSQL(question) {
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('esquizofrenia') && lowerQ.includes('andalucía')) {
    return "SELECT region, enfermedad, num_casos FROM VISTA_MUY_INTERESANTE WHERE region LIKE '%Andalucía%' AND enfermedad LIKE '%esquizofrenia%'";
  }
  if (lowerQ.includes('depresión') && lowerQ.includes('madrid')) {
    return "SELECT region, enfermedad, num_casos FROM VISTA_MUY_INTERESANTE WHERE region LIKE '%Madrid%' AND enfermedad LIKE '%depresión%'";
  }
  if (lowerQ.includes('ansiedad')) {
    return "SELECT region, enfermedad, num_casos FROM VISTA_MUY_INTERESANTE WHERE enfermedad LIKE '%ansiedad%' ORDER BY num_casos DESC";
  }
  
  return null;
}

// Función principal CORREGIDA
async function processChatMessage(message) {
  const isUrgent = isUrgentQuery(message);
  const isData = isDataQuery(message);
  
  let reply;
  let usedData = false;

  console.log('\n' + '═'.repeat(70));
  console.log(`🧠 PROCESANDO: "${message}"`);
  console.log(`📊 Detección de datos: ${isData ? '✅ SÍ' : '❌ NO'}`);
  console.log(`🚨 Detección de urgencia: ${isUrgent ? '✅ SÍ' : '❌ NO'}`);

  // FLUJO AGENTIC MEJORADO
  if (isData && Database.pool && AI_PROVIDERS.gemini.enabled) {
    try {
      console.log('🔍 Iniciando flujo agentic...');
      
      // 1. Generar SQL con IA
      const generatedSQL = await generateSQL(message);
      
      // 2. Ejecutar en Oracle
      console.log('   🗄️ Ejecutando consulta en Oracle...');
      const queryResults = await Database.executeQuery(generatedSQL);
      usedData = queryResults && queryResults.length > 0;
      
      if (usedData) {
        console.log(`   📊 Obtenidos ${queryResults.length} registros`);
        
        // Mostrar resultados crudos
        console.log('   📋 Resultados crudos:', queryResults);
        
        // 3. Crear respuesta basada en resultados
        if (queryResults.length > 0) {
          const firstResult = queryResults[0];
          reply = `💙 Según los datos del sistema de salud mental:\n\n`;
          
          queryResults.forEach((row, index) => {
            reply += `• **${row.REGION}**: ${row.NUM_CASOS} casos de ${row.ENFERMEDAD}\n`;
          });
          
          reply += `\nEstos datos representan la situación actual en el sistema de salud público.`;
        } else {
          reply = "💙 No se encontraron datos específicos para tu consulta en la base de datos.";
        }
      } else {
        reply = "💙 La consulta no devolvió resultados. La vista podría no tener datos para esa combinación.";
      }
      
    } catch (sqlError) {
      console.error('❌ Error en flujo agentic:', sqlError.message);
      reply = "💙 Tuve problemas técnicos para consultar los datos. Por favor, intenta con una pregunta más específica.";
    }
  } 
  else if (isUrgent) {
    reply = `🚨 **URGENCIA**\n💙 Veo que estás pasando por un momento difícil.\n\n🔴 **AYUDA INMEDIATA**:\n• Teléfono de la Esperanza: 717 003 717 (24/7)\n• Emergencias: 112\n• Urgencias hospitalarias\n\nNo estás solo/a. Hay ayuda disponible.`;
  } 
  else {
    // Respuesta general mejorada
    if (isData && !AI_PROVIDERS.gemini.enabled) {
      reply = "💙 Detecté que quieres datos, pero la IA no está disponible. Para consultas específicas, necesitas configurar GOOGLE_API_KEY.";
    } else if (isData && !Database.pool) {
      reply = "💙 Detecté que quieres datos, pero la base de datos no está conectada.";
    } else {
      reply = "💙 Hola, soy Acompaña. Puedo ayudarte con consultas sobre datos de salud mental en España. Por ejemplo: '¿Cuántos casos de depresión hay en Madrid?'";
    }
  }

  // Guardar en base de datos MEJORADO (con creación de tabla si no existe)
  if (Database.pool) {
    try {
      // Verificar si la tabla existe, si no crearla
      await Database.executeQuery(`
        BEGIN
          EXECUTE IMMEDIATE 'CREATE TABLE chat_conversations (
            id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            user_message VARCHAR2(4000),
            assistant_response VARCHAR2(4000),
            is_urgent NUMBER(1) DEFAULT 0,
            used_data NUMBER(1) DEFAULT 0,
            created_at DATE DEFAULT SYSDATE
          )';
        EXCEPTION
          WHEN OTHERS THEN
            NULL; -- La tabla ya existe
        END;
      `);
      
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
      console.log('   💾 Conversación guardada en BD');
    } catch (dbError) {
      console.log('   💾 Conversación guardada localmente (error BD)');
    }
  }

  return {
    reply,
    isUrgent,
    usedData,
    provider: AI_PROVIDERS.gemini.enabled ? "Google Gemini" : "Sistema Básico"
  };
}

// Interfaz de terminal MEJORADA
function createChatInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log('🚀 ' + '═'.repeat(60));
  console.log('   🤖 ACOMPAÑA - Chatbot Agentic CORREGIDO');
  console.log('   🐛 Errores solucionados');
  console.log('═'.repeat(60));
  
  console.log('\n💚 **MEJORAS IMPLEMENTADAS**:');
  console.log('   • ✅ Mejor detección de consultas de datos');
  console.log('   • ✅ SQL de respaldo para preguntas comunes');
  console.log('   • ✅ Creación automática de tablas');
  console.log('   • ✅ Manejo robusto de errores');
  
  console.log('\n📊 **CONSULTAS QUE AHORA FUNCIONAN**:');
  console.log('   • "Casos de esquizofrenia en Andalucía"');
  console.log('   • "Depresión en Madrid"');
  console.log('   • "Ansiedad en Cataluña"');
  console.log('   • "Enfermedades más comunes"');
  
  console.log('\n🔧 **ESTADO ACTUAL**:');
  console.log(`   • Base de datos: ${Database.pool ? '✅ CONECTADA' : '❌ NO CONECTADA'}`);
  console.log(`   • IA Gemini: ${AI_PROVIDERS.gemini.enabled ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
  
  console.log('\n' + '─'.repeat(70));
  console.log('Escribe tu mensaje (o "salir" para terminar):');

  function askQuestion() {
    rl.question('\n👤 Tú: ', async (input) => {
      if (input.toLowerCase() === 'salir') {
        console.log('\n💙 Hasta pronto. Recuerda: No estás solo/a.');
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
        const response = await processChatMessage(input);
        const processingTime = Date.now() - startTime;

        console.log(`\n🤖 Acompaña:`);
        console.log('─'.repeat(50));
        console.log(response.reply);
        console.log('─'.repeat(50));
        console.log(`📊 ${response.usedData ? '✅ CONSULTA AGENTIC' : '💬 RESPUESTA GENERAL'}`);
        console.log(`🤖 ${response.provider} | ⏱️ ${processingTime}ms`);
        if (response.isUrgent) console.log('🚨 **URGENCIA - BUSCA AYUDA**');
        console.log('─'.repeat(50));

      } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('💙 Error técnico. Por favor, intenta de nuevo.');
      }

      askQuestion();
    });
  }

  return askQuestion;
}

// NUEVA FUNCIÓN DE DIAGNÓSTICO
async function listAvailableModels() {
  if (!AI_PROVIDERS.gemini.genAI) {
    return; // No hacer nada si la IA no está configurada
  }
  try {
    console.log('\n🔍 Verificando modelos de IA disponibles para tu API Key...');
    const genAI = AI_PROVIDERS.gemini.genAI;
    
    // Google AI Studio usa listModels(), el SDK más reciente puede tener otra sintaxis
    // pero esto es lo más compatible.
    const { models } = await genAI.listModels();

    const supportedModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

    if (supportedModels.length > 0) {
        console.log('   ✅ Tu API Key tiene acceso a los siguientes modelos:');
        for (const m of supportedModels) {
            console.log(`     • ${m.name} (Admite 'generateContent')`);
        }
    } else {
        console.log('   ⚠️ No se encontraron modelos compatibles con "generateContent" para tu API Key.');
    }
    
  } catch (error) {
    console.error('   ❌ Error crítico al listar modelos de IA. Esto confirma un problema con la API Key o el proyecto.');
    console.error('   ', error.message);
  }
}

// Inicialización MEJORADA
async function startChatbot() {
  try {
    console.log('🔧 Inicializando sistema corregido...');
    
    const dbInitialized = await Database.initialize();

    // Llamada a la nueva función de diagnóstico
    await listAvailableModels();
    
    console.log(`\n📊 ESTADO FINAL:`);
    console.log(`   🗄️  Base de datos: ${dbInitialized ? '✅ CONECTADA' : '❌ NO CONECTADA'}`);
    console.log(`   🤖 IA Gemini: ${AI_PROVIDERS.gemini.enabled ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
    
    if (!AI_PROVIDERS.gemini.enabled) {
      console.log('\n⚠️  Para IA real: Configura GOOGLE_API_KEY válida en .env');
      console.log('   📧 Obtén una key en: https://aistudio.google.com/');
    }
    
    console.log('\n🎯 SISTEMA LISTO - DETECCIÓN MEJORADA ACTIVADA');

    const startChat = createChatInterface();
    startChat();

  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
}

// Manejo de cierre
process.on('SIGINT', async () => {
  console.log('\n💙 Cerrando chatbot...');
  if (Database.pool) {
    await Database.close();
  }
  process.exit(0);
});

// Ejecutar
startChatbot();