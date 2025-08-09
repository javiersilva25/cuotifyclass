// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Asegúrate de cargar .env antes de usar las variables

// Validador de variables requeridas
function req(name) {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`Falta variable de entorno: ${name}`);
  }
  return v.trim();
}

const DB_NAME = req('DB_NAME');
const DB_USER = req('DB_USER');
const DB_PASSWORD = req('DB_PASSWORD');
const DB_HOST = req('DB_HOST');
const DB_PORT = Number(process.env.DB_PORT || 3306);

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: false,     // Manejamos timestamps manualmente
    underscored: true,     // snake_case para nombres de columnas
    freezeTableName: true  // Nombres de tabla exactos
  },
  timezone: '-03:00'       // Zona horaria de Chile (ajústalo si corresponde)
});

// Probar conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    throw error;
  }
};

// Sincronizar modelos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
