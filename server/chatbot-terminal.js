// chatbot-terminal.js - VERSIÓN DEFINITIVA BD + OPENAI
import OpenAI from "openai";
import Database from './database.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

// CONFIGURACIÓN OBLIGATORIA
const AI_PROVIDERS = {
  openai: {
    name: "OpenAI GPT-4",
    enabled: !!process.env.OPENAI_API_KEY,
    client: process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null,
    model: "gpt-4o-mini"
  }
};

// ESQUEMA DE BASE DE DATOS
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

// PROMPT PARA GENERAR SQL
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

// DETECCIÓN DE CONSULTAS
function isDataQuery(message) {
  const lowerMsg = message.toLowerCase();
  
  const dataKeywords = [
    // Palabras de cantidad
    'cuántos', 'cuántas', 'cuantos', 'cuantas', 'número', 'numero', 'cantidad',
    'estadística', 'estadísticas', 'estadistica', 'estadisticas', 'dato', 'datos',
    'casos', 'incidencia', 'prevalencia', 'total',
    
    // Regiones
    'andalucía', 'andalucia', 'madrid', 'cataluña', 'cataluna', 'valencia', 
    'galicia', 'país vasco', 'pais vasco', 'castilla', 'navarra', 'aragón', 'aragon',
    'extremadura', 'murcia', 'baleares', 'canarias', 'rioja', 'asturias', 'cantabria',
    
    // Enfermedades
    'esquizofrenia', 'depresión', 'depresion', 'ansiedad', 'trastorno bipolar',
    'trastorno obsesivo', 'tdah', 'psicosis', 'demencia', 'alzheimer',
    'trastorno alimenticio', 'bulimia', 'anorexia', 'autismo', 'asperger',
    
    // Términos generales
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

// GENERACIÓN DE SQL CON OPENAI
async function generateSQL(userQuestion) {
  if (!AI_PROVIDERS.openai.enabled) {
    throw new Error("OpenAI no está configurado. Configura OPENAI_API_KEY en .env");
  }

  try {
    const prompt = SQL_GENERATION_PROMPT.replace('{userQuestion}', userQuestion);
    
    console.log('   🤖 Generando SQL con OpenAI...');
    
    const completion = await AI_PROVIDERS.openai.client.chat.completions.create({
      model: AI_PROVIDERS.openai.model,
      messages: [
        { role: "system", content: "Eres un experto en SQL para Oracle. Genera SOLO el SQL sin explicaciones." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Baja temperatura para SQL consistente
      max_tokens: 200
    });

    let sql = completion.choices[0].message.content.trim();
    
    // Limpiar el SQL
    sql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
    sql = sql.replace(/;$/g, ''); // Eliminar punto y coma final
    
    console.log('   ✅ SQL Generado:', sql);
    return sql;
    
  } catch (error) {
    console.error('   ❌ Error de OpenAI:', error.message);
    throw new Error("No pude generar la consulta SQL: " + error.message);
  }
}

// FUNCIÓN PRINCIPAL - SOLO BD + OPENAI
async function processChatMessage(message) {
  const isUrgent = isUrgentQuery(message);
  const isData = isDataQuery(message);
  
  let reply;
  let usedData = false;

  console.log('\n' + '═'.repeat(70));
  console.log(`🧠 PROCESANDO: "${message}"`);
  console.log(`📊 Detección de datos: ${isData ? '✅ SÍ' : '❌ NO'}`);
  console.log(`🚨 Detección de urgencia: ${isUrgent ? '✅ SÍ' : '❌ NO'}`);

  // VERIFICAR CONFIGURACIÓN OBLIGATORIA
  if (!AI_PROVIDERS.openai.enabled) {
    return {
      reply: "❌ **ERROR**: OPENAI_API_KEY no configurada en .env\n\n💡 Solución:\n1. Obtén una API key en: https://platform.openai.com/api-keys\n2. Agrega: OPENAI_API_KEY=tu_key_al_.env",
      isUrgent: false,
      usedData: false
    };
  }

  if (!Database.pool) {
    return {
      reply: "❌ **ERROR**: Base de datos no conectada\n\n💡 Solución:\n1. Verifica DB_USER, DB_PASSWORD, DB_HOST en .env\n2. Asegúrate que Oracle esté funcionando",
      isUrgent: false,
      usedData: false
    };
  }

  // FLUJO PRINCIPAL: BD + OPENAI
  if (isUrgent) {
    reply = `🚨 **URGENCIA**\n💙 Veo que estás pasando por un momento difícil.\n\n🔴 **AYUDA INMEDIATA**:\n• Teléfono 024: Atención Conducta Suicida (24/7)\n• Teléfono de la Esperanza: 717 003 717\n• Emergencias: 112\n\nNo estás solo/a. Hay ayuda disponible.`;
  } 
  else if (isData) {
    try {
      console.log('🔍 Iniciando flujo agentic (OpenAI + Oracle)...');
      
      // 1. GENERAR SQL CON OPENAI
      const generatedSQL = await generateSQL(message);
      
      // 2. EJECUTAR EN ORACLE
      console.log('   🗄️ Ejecutando consulta en Oracle...');
      const queryResults = await Database.executeQuery(generatedSQL);
      usedData = true;
      
      if (queryResults && queryResults.length > 0) {
        console.log(`   📊 Obtenidos ${queryResults.length} registros`);
        
        // 3. CONSTRUIR RESPUESTA CON DATOS REALES
        reply = `💙 **Resultados de la consulta**:\n\n`;
        
        queryResults.forEach((row, index) => {
          reply += `• **${row.REGION}**: ${row.NUM_CASOS?.toLocaleString() || 0} casos de ${row.ENFERMEDAD}\n`;
        });
        
        reply += `\n📋 Estos son datos reales del sistema de salud mental español.`;
        
      } else {
        reply = "💙 La consulta no devolvió resultados. No hay datos para esa combinación específica en la base de datos.";
      }
      
    } catch (error) {
      console.error('❌ Error en flujo agentic:', error.message);
      reply = `💙 Error al procesar tu consulta: ${error.message}\n\nPor favor, intenta con una pregunta más específica.`;
    }
  } 
  else {
    // RESPUESTAS GENERALES
    if (message.toLowerCase().includes('hola') || message.toLowerCase().includes('buenas')) {
      reply = `💙 **¡HOLA! Soy Acompaña** 🤖\n\nSistema agentic especializado en salud mental española.\n\n📊 **Puedo consultar**:\n• Datos reales de Oracle Database\n• Generación automática de SQL con OpenAI\n• Información por comunidades autónomas\n\n💡 **Ejemplo**: "¿Cuántos casos de esquizofrenia hay en Andalucía?"`;
    } else if (message.toLowerCase().includes('ayuda')) {
      reply = `💙 **CÓMO USARME**:\n\n🔧 **TECNOLOGÍA**:\n• OpenAI GPT-4 para generar SQL\n• Oracle Database para datos reales\n• Detección automática de consultas\n\n📊 **CONSULTAS VÁLIDAS**:\n"casos de depresión en Madrid"\n"esquizofrenia en Andalucía"\n"ansiedad en Cataluña"\n"enfermedades más comunes"\n\n🚨 **URGENCIAS**: "crisis", "suicidio", "urgencia"`;
    } else {
      reply = "💙 Soy un sistema agentic que combina OpenAI con Oracle Database. Puedo ayudarte con consultas específicas sobre datos de salud mental en España.";
    }
  }

  return {
    reply,
    isUrgent,
    usedData,
    provider: "OpenAI + Oracle"
  };
}

// INTERFAZ DE TERMINAL
function createChatInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.clear();
  console.log('🚀 ' + '═'.repeat(60));
  console.log('   🤖 ACOMPAÑA - Sistema Agentic BD + OpenAI');
  console.log('   🎯 EXCLUSIVAMENTE Base de Datos + IA');
  console.log('═'.repeat(60));
  
  console.log('\n💚 **CONFIGURACIÓN ACTUAL**:');
  console.log(`   • Base de datos Oracle: ${Database.pool ? '✅ CONECTADA' : '❌ NO CONECTADA'}`);
  console.log(`   • OpenAI GPT-4: ${AI_PROVIDERS.openai.enabled ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
  
  if (!AI_PROVIDERS.openai.enabled) {
    console.log('\n❌ **CONFIGURA OPENAI**:');
    console.log('   1. Ve a: https://platform.openai.com/api-keys');
    console.log('   2. Crea una API key');
    console.log('   3. Agrega OPENAI_API_KEY=tu_key a .env');
  }
  
  if (!Database.pool) {
    console.log('\n❌ **CONFIGURA ORACLE**:');
    console.log('   1. Verifica DB_USER, DB_PASSWORD en .env');
    console.log('   2. Configura DB_HOST, DB_PORT, DB_SERVICE');
    console.log('   3. Asegúrate que Oracle esté ejecutándose');
  }
  
  if (Database.pool && AI_PROVIDERS.openai.enabled) {
    console.log('\n🎯 **SISTEMA LISTO**:');
    console.log('   • ✅ OpenAI → Generación SQL automática');
    console.log('   • ✅ Oracle → Consulta datos reales');
    console.log('   • ✅ Agente → Procesamiento completo');
  }

  console.log('\n' + '─'.repeat(70));
  console.log('Escribe tu mensaje (o "salir" para terminar):');

  function askQuestion() {
    rl.question('\n👤 Tú: ', async (input) => {
      if (input.toLowerCase() === 'salir') {
        console.log('\n💙 Cerrando sistema agentic...');
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
        console.log(`📊 ${response.usedData ? '✅ DATOS REALES (Oracle)' : '💬 RESPUESTA GENERAL'}`);
        console.log(`🤖 ${response.provider} | ⏱️ ${processingTime}ms`);
        if (response.isUrgent) console.log('🚨 **URGENCIA - BUSCA AYUDA**');
        console.log('─'.repeat(50));

      } catch (error) {
        console.log('\n❌ Error:', error.message);
        console.log('💙 Error en el sistema. Verifica la configuración.');
      }

      askQuestion();
    });
  }

  return askQuestion;
}

// INICIALIZACIÓN
async function startChatbot() {
  try {
    console.log('🔧 Inicializando sistema agentic (BD + OpenAI)...');
    
    // Inicializar base de datos
    const dbInitialized = await Database.initialize();
    
    console.log(`\n📊 **ESTADO DEL SISTEMA**:`);
    console.log(`   🗄️  Oracle Database: ${dbInitialized ? '✅ CONECTADA' : '❌ FALLÓ'}`);
    console.log(`   🧠 OpenAI GPT-4: ${AI_PROVIDERS.openai.enabled ? '✅ CONFIGURADA' : '❌ FALTANTE'}`);
    
    if (!dbInitialized || !AI_PROVIDERS.openai.enabled) {
      console.log('\n❌ **SISTEMA INCOMPLETO**:');
      if (!dbInitialized) console.log('   • Configura las variables de Oracle en .env');
      if (!AI_PROVIDERS.openai.enabled) console.log('   • Configura OPENAI_API_KEY en .env');
      console.log('\n💡 El sistema requiere ambas configuraciones para funcionar.');
    } else {
      console.log('\n🎯 **SISTEMA AGENTIC ACTIVADO**:');
      console.log('   • OpenAI → Generación SQL inteligente');
      console.log('   • Oracle → Datos reales en tiempo real');
      console.log('   • Agente → Procesamiento automático');
    }

    const startChat = createChatInterface();
    startChat();

  } catch (error) {
    console.error('❌ Error crítico al iniciar:', error.message);
    process.exit(1);
  }
}

// MANEJO DE CIERRE
process.on('SIGINT', async () => {
  console.log('\n💙 Cerrando sistema agentic...');
  if (Database.pool) await Database.close();
  process.exit(0);
});

// EJECUTAR
startChatbot();