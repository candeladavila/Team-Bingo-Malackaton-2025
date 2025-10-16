// database.js
import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
  }

  async initialize() {
    try {
      console.log('🔗 Intentando conectar a Oracle...');
      
      // Verificar variables del wallet
      const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'WALLET_PATH', 'DB_TNS_ALIAS', 'WALLET_PASSWORD'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.log('❌ Variables de entorno faltantes:', missingVars.join(', '));
        console.log('💡 Asegúrate de que tu archivo .env tenga todas las variables del wallet');
        return false;
      }

      // Verificar archivos del wallet
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const walletPath = process.env.WALLET_PATH;
        const tnsnames = path.join(walletPath, 'tnsnames.ora');
        const ewallet = path.join(walletPath, 'ewallet.pem');
        
        await fs.access(tnsnames);
        await fs.access(ewallet);
        console.log('✅ Archivos del wallet verificados');
      } catch (err) {
        console.log('❌ Error verificando wallet:', err.message);
        console.log('💡 Asegúrate de que existan tnsnames.ora y ewallet.pem en:', process.env.WALLET_PATH);
        return false;
      }

      console.log('📡 Usando TNS Alias:', process.env.DB_TNS_ALIAS);

      const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_TNS_ALIAS,
        configDir: process.env.WALLET_PATH,
        walletLocation: process.env.WALLET_PATH,
        walletPassword: process.env.WALLET_PASSWORD,
        poolMin: 1,
        poolMax: 3,
        poolTimeout: 60
      };

      console.log('👤 Usuario:', process.env.DB_USER);
      console.log('🔑 Password:', '***' + process.env.DB_PASSWORD.slice(-3)); // Solo muestra últimos 3 chars
      
      this.pool = await oracledb.createPool(config);
      this.isConnected = true;
      
      console.log('✅ Conexión a Oracle establecida correctamente');
      
      // Verificar que la vista existe
      await this.verifyViewExists();
      return true;
      
    } catch (error) {
      console.log('❌ Error conectando a Oracle:', error.message);
      console.log('💡 Posibles soluciones:');
      console.log('   1. Verifica que Oracle esté ejecutándose');
      console.log('   2. Revisa las credenciales en .env');
      console.log('   3. Verifica el nombre del servicio/host');
      this.isConnected = false;
      return false;
    }
  }

  async verifyViewExists() {
    try {
      const result = await this.executeQuery(
        "SELECT COUNT(*) as count FROM VISTA_MUY_INTERESANTE WHERE ROWNUM = 1"
      );
      console.log('✅ Vista VISTA_MUY_INTERESANTE verificada');
      return true;
    } catch (error) {
      console.log('❌ La vista VISTA_MUY_INTERESANTE no existe o no es accesible');
      console.log('💡 Ejecuta el script SQL para crear la vista');
      return false;
    }
  }

  async executeQuery(sql, params = {}) {
    if (!this.pool || !this.isConnected) {
      throw new Error('Base de datos no disponible');
    }

    let connection;
    try {
      connection = await this.pool.getConnection();
      const result = await connection.execute(sql, params, {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      });
      return result.rows;
    } catch (error) {
      console.error('❌ Error en consulta SQL:', error.message);
      console.error('   Consulta:', sql);
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.close();
      console.log('🔌 Conexión a BD cerrada');
    }
  }
}

export default new Database();