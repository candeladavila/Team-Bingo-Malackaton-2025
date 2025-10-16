// database.js - Configuración para Oracle Cloud con Wallet
import oracledb from 'oracledb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { access, constants } from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      console.log('🔗 Intentando conectar a Oracle Cloud...');
      
      // PASO 1: Verificar variables de entorno obligatorias
      const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'WALLET_PATH', 'DB_TNS_ALIAS', 'WALLET_PASSWORD'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.log('❌ Variables de entorno faltantes:', missingVars.join(', '));
        console.log('\n💡 Tu archivo .env debe contener:');
        console.log('   DB_USER=ADMIN');
        console.log('   DB_PASSWORD=tu_password');
        console.log('   WALLET_PATH=./wallet');
        console.log('   DB_TNS_ALIAS=nombre_del_servicio');
        console.log('   WALLET_PASSWORD=password_del_wallet');
        console.log('   OPENAI_API_KEY=tu_api_key');
        return false;
      }

      console.log('✅ Variables de entorno verificadas');

      // PASO 2: Verificar archivos del wallet
      const walletPath = process.env.WALLET_PATH;
      console.log('📁 Verificando wallet en:', walletPath);

      const requiredWalletFiles = [
        'tnsnames.ora',
        'sqlnet.ora',
        'cwallet.sso',
        'ewallet.pem',
        'ewallet.p12'
      ];

      const missingFiles = [];
      for (const file of requiredWalletFiles) {
        try {
          const filePath = join(walletPath, file);
          await access(filePath, constants.R_OK);
          console.log(`   ✅ ${file}`);
        } catch (err) {
          missingFiles.push(file);
          console.log(`   ❌ ${file} no encontrado`);
        }
      }

      if (missingFiles.length > 0) {
        console.log('\n❌ Archivos del wallet faltantes:', missingFiles.join(', '));
        console.log('💡 Solución:');
        console.log('   1. Descarga el wallet desde Oracle Cloud Console');
        console.log('   2. Descomprime el ZIP en la carpeta:', walletPath);
        console.log('   3. Verifica que contenga: tnsnames.ora, sqlnet.ora, cwallet.sso, etc.');
        return false;
      }

      console.log('✅ Archivos del wallet verificados');

      // PASO 3: Mostrar información de conexión
      console.log('\n📊 CONFIGURACIÓN DE CONEXIÓN:');
      console.log('   Usuario:', process.env.DB_USER);
      console.log('   Password:', '***' + process.env.DB_PASSWORD.slice(-3));
      console.log('   TNS Alias:', process.env.DB_TNS_ALIAS);
      console.log('   Wallet Path:', walletPath);

      // PASO 4: Configurar Oracle Client
      try {
        // Configurar el directorio del wallet para Oracle Client
        oracledb.initOracleClient({
          configDir: walletPath,
          libDir: undefined // Auto-detectar Oracle Instant Client
        });
        console.log('✅ Oracle Client inicializado');
      } catch (err) {
        // Si ya está inicializado, no pasa nada
        if (!err.message.includes('already been initialized')) {
          console.log('⚠️ Oracle Client:', err.message);
        }
      }

      // PASO 5: Crear pool de conexiones
      const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_TNS_ALIAS,
        walletLocation: walletPath,
        walletPassword: process.env.WALLET_PASSWORD,
        poolMin: 1,
        poolMax: 3,
        poolIncrement: 1,
        poolTimeout: 60
      };

      console.log('\n🔧 Creando pool de conexiones...');
      this.pool = await oracledb.createPool(config);
      this.isConnected = true;
      
      console.log('✅ Pool de conexiones creado exitosamente');

      // PASO 6: Verificar conexión con una consulta simple
      console.log('\n🧪 Probando conexión...');
      const testResult = await this.executeQuery("SELECT 'Conexión exitosa' as STATUS FROM DUAL");
      console.log('✅ Prueba de conexión:', testResult[0]?.STATUS);

      // PASO 7: Verificar que la vista existe
      await this.verifyViewExists();
      
      return true;
      
    } catch (error) {
      console.log('\n❌ ERROR AL CONECTAR:', error.message);
      console.log('\n💡 SOLUCIONES POSIBLES:');
      console.log('   1. Verifica que el wallet esté descomprimido en:', process.env.WALLET_PATH);
      console.log('   2. Confirma que DB_TNS_ALIAS coincida con un servicio en tnsnames.ora');
      console.log('   3. Verifica usuario y password en Oracle Cloud Console');
      console.log('   4. Asegúrate que tu IP esté en la whitelist (Access Control Lists)');
      console.log('   5. Revisa que el WALLET_PASSWORD sea correcto');
      
      if (error.message.includes('DPI-1047')) {
        console.log('\n🔴 ERROR ESPECÍFICO: Oracle Client Libraries no encontradas');
        console.log('   Solución: Instala Oracle Instant Client');
        console.log('   Windows: https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html');
        console.log('   Después ejecuta: npm rebuild oracledb');
      }
      
      if (error.message.includes('ORA-01017')) {
        console.log('\n🔴 ERROR ESPECÍFICO: Usuario o password incorrectos');
        console.log('   Verifica DB_USER y DB_PASSWORD en tu .env');
      }
      
      if (error.message.includes('NJS-516')) {
        console.log('\n🔴 ERROR ESPECÍFICO: TNS Alias no encontrado');
        console.log('   Abre', join(process.env.WALLET_PATH, 'tnsnames.ora'));
        console.log('   Copia el nombre exacto del servicio (antes del "=")');
        console.log('   Úsalo como DB_TNS_ALIAS en .env');
      }

      this.isConnected = false;
      return false;
    }
  }

  async verifyViewExists() {
    try {
      console.log('\n🔍 Verificando vista VISTA_MUY_INTERESANTE...');
      const result = await this.executeQuery(
        "SELECT COUNT(*) as COUNT FROM VISTA_MUY_INTERESANTE WHERE ROWNUM = 1"
      );
      console.log('✅ Vista VISTA_MUY_INTERESANTE verificada - Registros disponibles');
      return true;
    } catch (error) {
      console.log('❌ La vista VISTA_MUY_INTERESANTE no existe o no es accesible');
      console.log('💡 Necesitas crear la vista ejecutando el script SQL correspondiente');
      console.log('   Error:', error.message);
      return false;
    }
  }

  async executeQuery(sql, params = {}) {
    if (!this.pool || !this.isConnected) {
      throw new Error('Base de datos no disponible. Verifica la conexión.');
    }

    let connection;
    try {
      connection = await this.pool.getConnection();
      const result = await connection.execute(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      });
      return result.rows;
    } catch (error) {
      console.error('\n❌ Error ejecutando SQL:', error.message);
      console.error('   Query:', sql);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err.message);
        }
      }
    }
  }

  async close() {
    if (this.pool) {
      try {
        await this.pool.close(10);
        console.log('🔌 Conexión a Oracle cerrada correctamente');
      } catch (err) {
        console.error('Error cerrando pool:', err.message);
      }
    }
  }
}

export default new Database();