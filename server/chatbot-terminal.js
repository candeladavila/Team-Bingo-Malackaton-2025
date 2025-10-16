/**
 * chatbot_con_interpretacion.js
 * * Lógica principal del chatbot de terminal que implementa un flujo "agentic":
 * 1. Detecta la intención del usuario (datos, urgencia o general).
 * 2. Genera una consulta SQL si es necesario.
 * 3. Ejecuta la consulta en la base de datos Oracle.
 * 4. Interpreta los resultados con IA para dar una respuesta con sentido.
 */

import OpenAI from "openai";
import Database from './database.js';
import dotenv from 'dotenv';
import readline from 'readline';
import { DATABASE_SCHEMA, SQL_GENERATION_PROMPT, DATA_INTERPRETATION_PROMPT } from './config.js';

dotenv.config();

// --- CONFIGURACIÓN DE IA ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AI_MODEL = "gpt-4o-mini";

// --- FUNCIONES DE IA ---

/**
 * Genera una consulta SQL a partir de la pregunta de un usuario.
 * @param {string} userQuestion - La pregunta del usuario.
 * @returns {Promise<string>} La consulta SQL generada.
 */
async function generateSQL(userQuestion) {
    const prompt = SQL_GENERATION_PROMPT.replace('{userQuestion}', userQuestion);
    try {
        console.log('   🤖 Pidiendo a la IA que genere el SQL...');
        const completion = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1, // Muy bajo para que sea preciso
        });
        const sql = completion.choices[0].message.content.trim().replace(/;$/, '');
        console.log('   ✅ SQL Generado:', sql);
        return sql;
    } catch (error) {
        console.error('   ❌ Error generando SQL:', error.message);
        throw new Error("No pude crear la consulta para buscar en la base de datos.");
    }
}

/**
 * Interpreta los resultados de la base de datos para dar una respuesta en lenguaje natural.
 * @param {Array<Object>} queryResults - Los resultados de la consulta SQL.
 * @param {string} originalQuestion - La pregunta original del usuario.
 * @returns {Promise<string>} La respuesta interpretada y humanizada.
 */
async function interpretResults(queryResults, originalQuestion) {
    const prompt = DATA_INTERPRETATION_PROMPT
        .replace('{originalQuestion}', originalQuestion)
        .replace('{queryResults}', JSON.stringify(queryResults, null, 2));

    try {
        console.log('   🧠 Pidiendo a la IA que interprete los resultados...');
        const completion = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7, // Más creativo para una respuesta natural
        });
        const interpretation = completion.choices[0].message.content.trim();
        console.log('   ✅ Interpretación generada.');
        return interpretation;
    } catch (error) {
        console.error('   ❌ Error interpretando los datos:', error.message);
        return "He encontrado los datos, pero he tenido dificultades para interpretarlos. Aquí están en formato bruto: " + JSON.stringify(queryResults);
    }
}

/**
 * Genera una respuesta conversacional general.
 * @param {string} message - El mensaje del usuario.
 * @returns {Promise<string>} La respuesta generada por la IA.
 */
async function generateGeneralResponse(message) {
    console.log("   💬 Es una pregunta general. Generando respuesta con IA...");
    const prompt = `Eres "Acompaña", un asistente de IA empático. Tu función principal es dar datos de salud mental en España. Responde de forma breve y amable a esta pregunta general, recordando al usuario tu propósito principal. Pregunta: "${message}"`;
    try {
        const completion = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });
        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error('   ❌ Error en respuesta general:', error.message);
        return "Hola, soy Acompaña. Mi función es ayudarte a consultar datos sobre salud mental. ¿En qué te puedo ayudar?";
    }
}


// --- LÓGICA PRINCIPAL DEL CHATBOT ---

function isDataQuery(message) {
    const lowerMessage = message.toLowerCase();
    const keywords = [
        // Palabras de consulta
        'dato', 'cuántos', 'cuántas', 'número', 'casos', 'estadística', 'incidencia',
        'prevalencia', 'total', 'dime', 'muéstrame', 'cuál es', 'cuáles son', 'porcentaje',
        // Sujetos
        'región', 'enfermedad', 'diagnóstico', 'comunidad', 'ciudad',
        // Comunidades Autónomas
        'andalucía', 'aragón', 'asturias', 'baleares', 'canarias', 'cantabria',
        'castilla y león', 'castilla-la mancha', 'cataluña', 'comunidad valenciana',
        'extremadura', 'galicia', 'madrid', 'murcia', 'navarra', 'país vasco', 'la rioja',
        // Enfermedades comunes
        'depresión', 'ansiedad', 'esquizofrenia', 'bipolar', 'toc', 'tdah', 'psicosis', 'alimenticio'
    ];
    return keywords.some(k => lowerMessage.includes(k));
}

function isUrgentQuery(message) {
    const lowerMessage = message.toLowerCase();
    const keywords = [
        'suicidio', 'matarme', 'acabar con todo', 'no quiero vivir', 'crisis',
        'urgencia', 'emergencia', 'desesperado', 'ayuda inmediata'
    ];
    return keywords.some(k => lowerMessage.includes(k));
}

async function processChatMessage(message) {
    console.log('\n' + '═'.repeat(70));
    console.log(`🧠 Procesando: "${message}"`);
    
    if (isUrgentQuery(message)) {
        console.log("   🚨 ¡URGENCIA DETECTADA!");
        return "Veo que estás pasando por un momento muy difícil. Por favor, busca ayuda profesional de inmediato. Puedes llamar al 024 (Línea de atención a la conducta suicida) o al 112 (Emergencias). Hay personas dispuestas a ayudarte ahora mismo.";
    }

    if (isDataQuery(message)) {
        console.log("   📊 Es una consulta de datos.");
        try {
            // Flujo Agentic Completo
            const sqlQuery = await generateSQL(message);
            const dbResults = await Database.executeQuery(sqlQuery);
            const finalReply = await interpretResults(dbResults, message);
            return finalReply;
        } catch (error) {
            console.error('❌ Error en el flujo de datos:', error.message);
            return `Lo siento, ha ocurrido un error técnico al procesar tu consulta de datos: ${error.message}`;
        }
    } else {
        // Respuesta general para preguntas que no son de datos
        return await generateGeneralResponse(message);
    }
}

// --- INTERFAZ DE TERMINAL ---
async function startChat() {
    await Database.initialize();
    if (!Database.isConnected) {
        console.error("❌ No se pudo iniciar el chatbot porque la conexión a la base de datos falló.");
        return;
    }
     if (!process.env.OPENAI_API_KEY) {
        console.error("❌ Falta la variable de entorno OPENAI_API_KEY. El chatbot no puede funcionar sin ella.");
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.clear();
    console.log('🚀 ' + '═'.repeat(60));
    console.log('   🤖 Chatbot "Acompaña" Iniciado');
    console.log('   ✅ Conectado a Oracle y OpenAI.');
    console.log('   Escribe tu consulta o "salir" para terminar.');
    console.log('═'.repeat(60));

    rl.setPrompt('\n👤 Tú: ');
    rl.prompt();

    rl.on('line', async (line) => {
        if (line.toLowerCase() === 'salir') {
            rl.close();
            return;
        }

        // Añadir un indicador de que está "pensando"
        const loadingIndicator = setInterval(() => process.stdout.write('.'), 200);
        
        const response = await processChatMessage(line);
        
        clearInterval(loadingIndicator);
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);

        console.log(`\n🤖 Acompaña: ${response}`);
        rl.prompt();

    }).on('close', async () => {
        await Database.close();
        console.log('\n💙 ¡Hasta pronto! Cuídate.');
        process.exit(0);
    });
}

startChat();

