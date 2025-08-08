const { sequelize } = require('./src/models');

async function checkRolesTable() {
  try {
    console.log('🔍 Verificando estructura de tabla roles...');
    
    // Verificar si la tabla existe
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'roles'");
    
    if (tables.length === 0) {
      console.log('❌ La tabla roles no existe');
      return;
    }
    
    console.log('✅ La tabla roles existe');
    
    // Ver estructura de la tabla
    const [columns] = await sequelize.query("DESCRIBE roles");
    
    console.log('\n📋 Estructura actual de la tabla roles:');
    console.log('┌─────────────────┬─────────────────┬──────┬─────┬─────────┬───────┐');
    console.log('│ Field           │ Type            │ Null │ Key │ Default │ Extra │');
    console.log('├─────────────────┼─────────────────┼──────┼─────┼─────────┼───────┤');
    
    columns.forEach(col => {
      const field = col.Field.padEnd(15);
      const type = col.Type.padEnd(15);
      const nullVal = col.Null.padEnd(4);
      const key = col.Key.padEnd(3);
      const defaultVal = (col.Default || '').toString().padEnd(7);
      const extra = (col.Extra || '').padEnd(5);
      
      console.log(`│ ${field} │ ${type} │ ${nullVal} │ ${key} │ ${defaultVal} │ ${extra} │`);
    });
    
    console.log('└─────────────────┴─────────────────┴──────┴─────┴─────────┴───────┘');
    
    // Verificar columnas específicas que necesitamos
    const requiredColumns = ['codigo', 'categoria', 'es_alumno', 'requiere_curso', 'activo'];
    const existingColumns = columns.map(col => col.Field);
    
    console.log('\n🔍 Verificando columnas requeridas:');
    requiredColumns.forEach(col => {
      const exists = existingColumns.includes(col);
      console.log(`   ${exists ? '✅' : '❌'} ${col}`);
    });
    
    // Contar registros
    const [count] = await sequelize.query("SELECT COUNT(*) as total FROM roles");
    console.log(`\n📊 Total de registros en roles: ${count[0].total}`);
    
  } catch (error) {
    console.error('❌ Error verificando tabla roles:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRolesTable();

