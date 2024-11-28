require('dotenv').config(); // Cargar variables de entorno desde .env
const mysql = require('mysql2');
const winston = require('winston'); // Librería para logs estructurados

// Configurar logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(), // Imprimir logs en la consola
    new winston.transports.File({ filename: 'database.log' }) // Guardar logs en un archivo
  ]
});

// Validar variables de entorno necesarias
const requiredEnvVariables = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_DATABASE'];
requiredEnvVariables.forEach((varName) => {
  if (!process.env[varName]) {
    logger.error(`Falta la variable de entorno: ${varName}`);
    throw new Error(`Falta la variable de entorno: ${varName}`);
  }
});

// Configuración del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Función para intentar la conexión con reintentos
const connectWithRetry = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      await promisePool.query('SELECT 1');
      logger.info('Conexión a la base de datos exitosa');
      return;
    } catch (err) {
      logger.warn(`Reintentando conexión... intentos restantes: ${retries}`, {
        error: err.message,
        stack: err.stack
      });
      retries--;
      if (retries === 0) {
        logger.error('Error conectando a la base de datos', {
          error: err.message,
          stack: err.stack
        });
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Iniciar conexión con reintentos
connectWithRetry().catch((err) => {
  logger.error('No se pudo establecer conexión a la base de datos. La aplicación se cerrará.', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1); // Salir de la aplicación en caso de fallo
});

// Exportar el pool de promesas
module.exports = promisePool;
