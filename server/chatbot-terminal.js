// chatbot-terminal.js - VERSIÓN CON OPENAI (FUNCIONA)
import OpenAI from "openai";
import Database from './database.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// Configuración con OpenAI (MÁS CONFIABLE)
const AI_PROVIDERS = {
  openai: {
    name: "OpenAI GPT",
    enabled: !!process.env.OPENAI_API_KEY,
    client: process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null,
    model: "gpt-4o-mini"  // Rápido y económico
  }
};

// Esquema de base de datos
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

// Prompt para generar SQL
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

Responde ÚNICAMENTE con el SQL, sin explicaciones ni formato markdown.`;

// Funciones de detección
function isDataQuery(message) {
  const lowerMsg = message.toLowerCase();
  
  const dataKeywords = [
    'cuántos', 'cuántas', 'cuantos', 'cuantas', 'número', 'numero', 'cantidad',
    'estadística', 'estadísticas', 'estadistica', 'estadisticas', 'dato', 'datos',
    'casos', 'incidencia', 'prevalencia', 'total',
    'andalucía', 'andalucia', 'madrid', 'cataluña', 'cataluna', 'valencia', 
    'galicia', 'país vasco', 'pais vasco', 'castilla', 'navarra', 'aragón', 'aragon',
    'extremadura', 'murcia', 'baleares', 'canarias', 'rioja', 'asturias', 'cantabria',
    'esquizofrenia', 'depresión', 'depresion', 'ansiedad', 'trastorno bipolar',
    'trastorno obsesivo', 'tdah', 'psicosis', 'demencia', 'alzheimer',
    'trastorno alimenticio', 'bulimia', 'anorexia', 'autismo', 'asperger',
    'enfermedad mental', 'salud mental', 'diagnóstico', 'diagnostico',
  ];

  return dataKeywords.some(keyword => lowerMsg.includes(keyword));
}

function isUrgentQuery(message) {
  const urgentWords = [
    'suicidio', 'suicidarme', 'matarme', 'acabar con mi vida',
    'crisis', 'urgencia', 'emergencia', 'desesperado', 'ayuda inmediata'
  ];
  return urgentWords.some(word => message.toLowerCase().includes(word));
}

// Función de generación SQL con OpenAI
async function generateSQL(userQuestion) {
  if (!AI_PROVIDERS.openai.enabled) {
    throw new Error("OpenAI no está configurado");
  }

  try {
    const prompt = SQL_GENERATION_PROMPT.replace('{userQuestion}', userQuestion);
    
    console.log('   🤖 Solicitando generación de SQL a OpenAI...');
    
    const completion = await AI_PROVIDERS.openai.client.chat.completions.create({
      model: AI_PROVIDERS.openai.model,
      messages: [
        { role: "system", content: "Eres un experto en SQL para Oracle. Genera SOLO el SQL sin explicaciones." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    let sql = completion.choices[0].message.content.trim();
    
    // Limpiar el SQL
    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    sql = sql.replace(/;$/g, '');
    
    console.log('   ✅ SQL Generado:', sql);
    return sql;
    
  } catch (error) {
    console.error('   ❌ Error de OpenAI:', error.message);
    
    // SQL de respaldo
    const backupSQL = getBackupSQL(userQuestion);
    if (backupSQL) {
      console.log('   🔄 Usando SQL de respaldo:', backupSQL);
      return backupSQL;
    }
    throw new Error("No pude generar la consulta SQL");
  }
}

// SQLs de respaldo
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
  if (lowerQ.includes('esquizofrenia')) {
    return "SELECT region, enfermedad, num_casos FROM VISTA_MUY_INTERESANTE WHERE enfermedad LIKE '%esquizofrenia%' ORDER BY num_casos DESC";
  }
  
  return null;
}

// Función principal de procesamiento
async function processChatMessage(message) {
  const isUrgent = isUrgentQuery(message);
  const isData = isDataQuery(message);
  
  let reply;
  let usedData = false;

  console.log('\n' + '═'.repeat(70));
  console.log(`🧠 PROCESANDO: "${message}"`);
  console.log(`📊 Detección de datos: ${isData ? '✅ SÍ' : '❌ NO'}`);
  console.log(`🚨 Detección de urgencia: ${isUrgent ? '✅ SÍ' : '❌ NO'}`);

  // FLUJO AGENTIC
  if (isData && Database.pool && AI_PROVIDERS.openai.enabled) {
    try {
      console.log('🔍 Iniciando flujo agentic con OpenAI...');
      
      const generatedSQL = await generateSQL(message);
      
      console.log('   🗄️ Ejecutando consulta en Oracle...');
      const queryResults = await Database.executeQuery(generatedSQL);
      usedData = queryResults && queryResults.length > 0;
      
      if (usedData) {
        console.log(`   📊 Obtenidos ${queryResults.length} registros`);
        
        reply = `💙 Según los datos del sistema de salud mental:\n\n`;
        
        queryResults.forEach((row, index) => {
          reply += `• **${row.REGION}**: ${row.NUM_CASOS} casos de ${row.ENFERMEDAD}\n`;
        });
        
        reply += `\nEstos datos representan la situación actual en el sistema de salud público.`;
      } else {
        reply = "💙 No se encontraron datos específicos para tu consulta en la base de datos.";
      }
      
    } catch (sqlError) {
      console.error('❌ Error en flujo agentic:', sqlError.message);
      reply = "💙 Tuve problemas técnicos para consultar los datos. Por favor, intenta con una pregunta más específica.";
    }
  } 
  else if (isUrgent) {
    reply = `🚨 **URGENCIA**\n💙 Veo que estás pasando por un momento difícil.\n\n🔴 **AYUDA INMEDIATA**:\n• Teléfono 024: Atención Conducta Suicida (24/7)\n• Teléfono de la Esperanza: 717 003 717\n• Emergencias: 112\n\nNo estás solo/a. Hay ayuda disponible.`;
  } 
  else {
    if (isData && !AI_PROVIDERS.openai.enabled) {
      reply = "💙 Detecté que quieres datos, pero la IA no está disponible. Configura OPENAI_API_KEY en .env para consultas dinámicas.";
    } else if (isData && !Database.pool) {
      reply = "💙 Detecté que quieres datos, pero la base de datos no está conectada.";
    } else {
      reply = "💙 Hola, soy Acompaña. Puedo ayudarte con consultas sobre datos de salud mental en España. Por ejemplo: '¿Cuántos casos de depresión hay en Madrid?'";
    }
  }

  // Guardar en BD
  if (Database.pool) {
    try {
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
          WHEN OTHERS THEN NULL;
        END;
      `);
      
      await Database.executeQuery(
        `INSERT INTO chat_conversations (user_message, assistant_response, is_urgent, used_data) 
         VALUES (:userMessage, :assistantResponse, :isUrgent, :usedData)`,
        {
          userMessage: message.substring(0, 4000),
          assistantResponse: reply.substring(0, 4000),
          isUrgent: isUrgent ? 1 : 0,
          usedData: usedData ? 1 : 0
        }
      );
      console.log('   💾 Conversación guardada en BD');
    } catch (dbError) {
      console.log('   💾 Error al guardar en BD');
    }
  }

  return {
    reply,
    isUrgent,
    usedData,
    provider: AI_PROVIDERS.openai.enabled ? "OpenAI GPT" : "Sistema Básico"
  };
}

// Interfaz de terminal
function createChatInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log('🚀 ' + '═'.repeat(60));
  console.log('   🤖 ACOMPAÑA - Chatbot con OpenAI');
  console.log('═'.repeat(60));
  
  console.log('\n💚 **CARACTERÍSTICAS**:');
  console.log('   • ✅ Generación de SQL con OpenAI');
  console.log('   • ✅ SQL de respaldo para preguntas comunes');
  console.log('   • ✅ Conexión a Oracle Database');
  console.log('   • ✅ Manejo robusto de errores');
  
  console.log('\n🔧 **ESTADO ACTUAL**:');
  console.log(`   • Base de datos: ${Database.pool ? '✅ CONECTADA' : '❌ NO CONECTADA'}`);
  console.log(`   • IA OpenAI: ${AI_PROVIDERS.openai.enabled ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
  
  console.log('\n' + '─'.repeat(70));
  console.log('Escribe tu mensaje (o "salir" para terminar):');

  function askQuestion() {
    rl.question('\n👤 Tú: ', async (input) => {
      if (input.toLowerCase() === 'salir') {
        console.log('\n💙 Hasta pronto. Recuerda: No estás solo/a.');
        rl.close();
        if (Database.pool) await Database.close();
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
        console.log(`📊 ${response.usedData ? '✅ CONSULTA CON DATOS' : '💬 RESPUESTA GENERAL'}`);
        console.log(`🤖 ${response.provider} | ⏱️ ${processingTime}ms`);
        if (response.isUrgent) console.log('🚨 **URGENCIA DETECTADA**');
        console.log('─'.repeat(50));

      } catch (error) {
        console.log('\n❌ Error:', error.message);
      }

      askQuestion();
    });
  }

  return askQuestion;
}

// Inicialización
async function startChatbot() {
  try {
    console.log('🔧 Inicializando sistema con OpenAI...');
    
    const dbInitialized = await Database.initialize();
    
    console.log(`\n📊 ESTADO FINAL:`);
    console.log(`   🗄️  Base de datos: ${dbInitialized ? '✅ CONECTADA' : '❌ NO CONECTADA'}`);
    console.log(`   🤖 IA OpenAI: ${AI_PROVIDERS.openai.enabled ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
    
    if (!AI_PROVIDERS.openai.enabled) {
      console.log('\n⚠️  Para IA: Configura OPENAI_API_KEY en .env');
      console.log('   📧 Obtén una key en: https://platform.openai.com/api-keys');
    }
    
    console.log('\n🎯 SISTEMA LISTO');

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
  if (Database.pool) await Database.close();
  process.exit(0);
});

// Ejecutar
startChatbot();