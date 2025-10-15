import fetch from 'node-fetch';

// Pruebas específicas para el enfoque agentic
const agenticQueries = [
  // Preguntas que generarán SQL automáticamente
  "¿Cuántos casos de depresión hay en Madrid?",
  "Mostrar las estadísticas de ansiedad por comunidad autónoma",
  "¿Qué enfermedades mentales son más comunes en Cataluña?",
  "Ranking de comunidades por número de casos de salud mental",
  "Distribución de diagnósticos principales en España",
  "Comparar depresión entre Madrid y Barcelona",
  
  // Preguntas que probarán la generación de SQL
  "Lista todas las regiones con casos de trastorno bipolar",
  "¿Cuál es la enfermedad mental más prevalente?",
  "Estadísticas de esquizofrenia por región",
  "Número total de casos registrados en el sistema"
];

async function testAgenticSystem() {
  console.log('🧪 PROBANDO SISTEMA AGENTIC CON GENERACIÓN DE SQL\n');
  
  for (const query of agenticQueries) {
    console.log(`📤 PREGUNTA: "${query}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query,
          history: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        console.log('✅ RESPUESTA DEL SISTEMA AGENTIC:');
        console.log(`   🤖 Proveedor: ${data.provider}`);
        console.log(`   📊 Usó datos: ${data.usedData ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   🔴 Urgente: ${data.isUrgent ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   💬 Respuesta: ${data.reply.substring(0, 200)}...`);
        
      } else {
        console.log('❌ Error en la respuesta:', response.status);
      }
      
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }
    
    console.log('─'.repeat(100));
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

// También probar generación directa de SQL
async function testSQLGeneration() {
  console.log('\n🔍 PROBANDO GENERACIÓN DIRECTA DE SQL\n');
  
  const testQuestions = [
    "Casos de depresión en Madrid",
    "Enfermedades más comunes en Andalucía",
    "Total de casos por región"
  ];

  for (const question of testQuestions) {
    try {
      const response = await fetch('http://localhost:3001/api/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`❓ Pregunta: "${data.question}"`);
        console.log(`   🗃️  SQL Generado: ${data.sql}`);
      }
      
      console.log('─'.repeat(80));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log('Error:', error.message);
    }
  }
}

// Ejecutar pruebas
async function runTests() {
  await testAgenticSystem();
  await testSQLGeneration();
}

runTests();