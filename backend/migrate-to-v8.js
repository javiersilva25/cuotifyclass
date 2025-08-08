const { sequelize } = require('./src/config/database');

async function migrateToV8() {
  console.log('🔄 Migrando a Sistema v8.0 con Geografía CUT 2018...');
  
  try {
    // Forzar recreación de tablas
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos migrada exitosamente a v8.0');
    
    // Cargar datos de geografía
    console.log('📍 Cargando datos de geografía CUT 2018...');
    
    // Aquí se cargarían los datos del SQL generado
    console.log('⚠️  Recuerde ejecutar el script SQL de geografía:');
    console.log('   mysql -u $DB_USER -p$DB_PASSWORD -h $DB_HOST $DB_NAME < scripts/insert-geografia-chile-cut2018.sql');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateToV8();
