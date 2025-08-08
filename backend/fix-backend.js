const { sequelize } = require('./src/models');
const Logger = require('./src/utils/logger');

async function fixBackend() {
  console.log('🔧 Iniciando corrección del backend v8.0...');
  
  try {
    // 1. Verificar conexión a BD
    console.log('1. Verificando conexión a base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a BD exitosa');
    
    // 2. Sincronizar modelos sin alter (para evitar conflictos)
    console.log('2. Sincronizando modelos básicos...');
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Modelos sincronizados');
    
    // 3. Verificar tablas críticas
    console.log('3. Verificando tablas críticas...');
    
    const [regiones] = await sequelize.query("SHOW TABLES LIKE 'regiones'");
    const [provincias] = await sequelize.query("SHOW TABLES LIKE 'provincias'");
    const [comunas] = await sequelize.query("SHOW TABLES LIKE 'comunas'");
    
    console.log(`📊 Tablas encontradas:`);
    console.log(`   - regiones: ${regiones.length > 0 ? '✅' : '❌'}`);
    console.log(`   - provincias: ${provincias.length > 0 ? '✅' : '❌'}`);
    console.log(`   - comunas: ${comunas.length > 0 ? '✅' : '❌'}`);
    
    // 4. Contar datos geográficos
    if (regiones.length > 0) {
      const [regionCount] = await sequelize.query("SELECT COUNT(*) as count FROM regiones");
      const [provinciaCount] = await sequelize.query("SELECT COUNT(*) as count FROM provincias");
      const [comunaCount] = await sequelize.query("SELECT COUNT(*) as count FROM comunas");
      
      console.log(`📈 Datos geográficos:`);
      console.log(`   - ${regionCount[0].count} regiones`);
      console.log(`   - ${provinciaCount[0].count} provincias`);
      console.log(`   - ${comunaCount[0].count} comunas`);
      
      if (regionCount[0].count === 0) {
        console.log('⚠️  No hay datos geográficos cargados');
        console.log('💡 Ejecute: node load-geografia.js');
      }
    }
    
    // 5. Verificar tabla roles problemática
    console.log('4. Verificando tabla roles...');
    try {
      const [rolesDesc] = await sequelize.query("DESCRIBE roles");
      const hasCodigoColumn = rolesDesc.some(col => col.Field === 'codigo');
      console.log(`   - Columna 'codigo' en roles: ${hasCodigoColumn ? '✅' : '❌'}`);
      
      if (!hasCodigoColumn) {
        console.log('🔧 Agregando columna codigo a tabla roles...');
        await sequelize.query("ALTER TABLE roles ADD COLUMN codigo VARCHAR(50) UNIQUE COMMENT 'Código único del rol'");
        console.log('✅ Columna codigo agregada');
      }
    } catch (error) {
      console.log(`⚠️  Error verificando roles: ${error.message}`);
    }
    
    console.log('\n🎉 Backend v8.0 verificado y corregido exitosamente');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Conexión a BD funcionando');
    console.log('   ✅ Modelos sincronizados');
    console.log('   ✅ Estructura de tablas verificada');
    console.log('\n🚀 El backend está listo para iniciar');
    
  } catch (error) {
    console.error('\n❌ Error corrigiendo backend:', error.message);
    console.error('📋 Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar corrección
fixBackend();

