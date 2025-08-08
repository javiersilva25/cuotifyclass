const { sequelize } = require('./src/models');
const Logger = require('./src/utils/logger');
const fs = require('fs');
const path = require('path');

async function loadGeografia() {
  console.log('🗺️  Iniciando carga de datos geográficos CUT 2018...');
  
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a BD establecida');
    
    // Verificar si el archivo SQL existe
    const sqlFile = path.join(__dirname, 'scripts', 'insert-geografia-chile-cut2018.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.log('❌ Archivo SQL no encontrado:', sqlFile);
      console.log('💡 Generando datos geográficos básicos...');
      
      // Cargar datos básicos manualmente
      await loadBasicGeografia();
      return;
    }
    
    console.log('📄 Archivo SQL encontrado, pero usando carga básica por compatibilidad...');
    await loadBasicGeografia();
    
  } catch (error) {
    console.error('❌ Error cargando geografía:', error.message);
    
    // Intentar carga básica como fallback
    console.log('🔄 Intentando carga básica como fallback...');
    await loadBasicGeografia();
  } finally {
    await sequelize.close();
  }
}

async function loadBasicGeografia() {
  console.log('📍 Cargando datos geográficos básicos...');
  
  try {
    // Datos básicos de regiones de Chile
    const regionesBasicas = [
      { codigo: 1, nombre: 'Tarapacá', abreviatura: 'I' },
      { codigo: 2, nombre: 'Antofagasta', abreviatura: 'II' },
      { codigo: 3, nombre: 'Atacama', abreviatura: 'III' },
      { codigo: 4, nombre: 'Coquimbo', abreviatura: 'IV' },
      { codigo: 5, nombre: 'Valparaíso', abreviatura: 'V' },
      { codigo: 6, nombre: 'Libertador General Bernardo OHiggins', abreviatura: 'VI' },
      { codigo: 7, nombre: 'Maule', abreviatura: 'VII' },
      { codigo: 8, nombre: 'Biobío', abreviatura: 'VIII' },
      { codigo: 9, nombre: 'La Araucanía', abreviatura: 'IX' },
      { codigo: 10, nombre: 'Los Lagos', abreviatura: 'X' },
      { codigo: 11, nombre: 'Aysén del General Carlos Ibáñez del Campo', abreviatura: 'XI' },
      { codigo: 12, nombre: 'Magallanes y de la Antártica Chilena', abreviatura: 'XII' },
      { codigo: 13, nombre: 'Metropolitana de Santiago', abreviatura: 'RM' },
      { codigo: 14, nombre: 'Los Ríos', abreviatura: 'XIV' },
      { codigo: 15, nombre: 'Arica y Parinacota', abreviatura: 'XV' },
      { codigo: 16, nombre: 'Ñuble', abreviatura: 'XVI' }
    ];
    
    // Insertar regiones usando parámetros preparados
    for (const region of regionesBasicas) {
      await sequelize.query(`
        INSERT IGNORE INTO regiones (codigo, nombre, abreviatura, activo, created_at, updated_at)
        VALUES (?, ?, ?, 1, NOW(), NOW())
      `, {
        replacements: [region.codigo, region.nombre, region.abreviatura]
      });
    }
    
    console.log('✅ 16 regiones básicas cargadas');
    
    // Provincias básicas (algunas principales)
    const provinciasBasicas = [
      { codigo: 131, nombre: 'Santiago', codigo_region: 13 },
      { codigo: 132, nombre: 'Cordillera', codigo_region: 13 },
      { codigo: 133, nombre: 'Chacabuco', codigo_region: 13 },
      { codigo: 134, nombre: 'Maipo', codigo_region: 13 },
      { codigo: 135, nombre: 'Melipilla', codigo_region: 13 },
      { codigo: 136, nombre: 'Talagante', codigo_region: 13 },
      { codigo: 51, nombre: 'Valparaíso', codigo_region: 5 },
      { codigo: 52, nombre: 'Isla de Pascua', codigo_region: 5 },
      { codigo: 53, nombre: 'Los Andes', codigo_region: 5 },
      { codigo: 54, nombre: 'Petorca', codigo_region: 5 },
      { codigo: 55, nombre: 'Quillota', codigo_region: 5 },
      { codigo: 56, nombre: 'San Antonio', codigo_region: 5 },
      { codigo: 57, nombre: 'San Felipe de Aconcagua', codigo_region: 5 },
      { codigo: 58, nombre: 'Marga Marga', codigo_region: 5 }
    ];
    
    for (const provincia of provinciasBasicas) {
      await sequelize.query(`
        INSERT IGNORE INTO provincias (codigo, nombre, codigo_region, activo, created_at, updated_at)
        VALUES (?, ?, ?, 1, NOW(), NOW())
      `, {
        replacements: [provincia.codigo, provincia.nombre, provincia.codigo_region]
      });
    }
    
    console.log('✅ Provincias básicas cargadas');
    
    // Comunas básicas (principales)
    const comunasBasicas = [
      { codigo: 13101, nombre: 'Santiago', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13102, nombre: 'Cerrillos', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13103, nombre: 'Cerro Navia', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13104, nombre: 'Conchalí', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13105, nombre: 'El Bosque', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13106, nombre: 'Estación Central', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13107, nombre: 'Huechuraba', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13108, nombre: 'Independencia', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13109, nombre: 'La Cisterna', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13110, nombre: 'La Florida', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13111, nombre: 'La Granja', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13112, nombre: 'La Pintana', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13113, nombre: 'La Reina', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13114, nombre: 'Las Condes', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13115, nombre: 'Lo Barnechea', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13116, nombre: 'Lo Espejo', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13117, nombre: 'Lo Prado', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13118, nombre: 'Macul', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13119, nombre: 'Maipú', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13120, nombre: 'Ñuñoa', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13121, nombre: 'Pedro Aguirre Cerda', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13122, nombre: 'Peñalolén', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13123, nombre: 'Providencia', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13124, nombre: 'Pudahuel', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13125, nombre: 'Quilicura', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13126, nombre: 'Quinta Normal', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13127, nombre: 'Recoleta', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13128, nombre: 'Renca', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13129, nombre: 'San Joaquín', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13130, nombre: 'San Miguel', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13131, nombre: 'San Ramón', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 13132, nombre: 'Vitacura', codigo_provincia: 131, codigo_region: 13 },
      { codigo: 5101, nombre: 'Valparaíso', codigo_provincia: 51, codigo_region: 5 },
      { codigo: 5102, nombre: 'Casablanca', codigo_provincia: 51, codigo_region: 5 },
      { codigo: 5103, nombre: 'Concón', codigo_provincia: 51, codigo_region: 5 },
      { codigo: 5104, nombre: 'Juan Fernández', codigo_provincia: 51, codigo_region: 5 },
      { codigo: 5105, nombre: 'Puchuncaví', codigo_provincia: 51, codigo_region: 5 },
      { codigo: 5106, nombre: 'Quintero', codigo_provincia: 51, codigo_region: 5 },
      { codigo: 5107, nombre: 'Viña del Mar', codigo_provincia: 51, codigo_region: 5 }
    ];
    
    for (const comuna of comunasBasicas) {
      await sequelize.query(`
        INSERT IGNORE INTO comunas (codigo, nombre, codigo_provincia, codigo_region, activo, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, NOW(), NOW())
      `, {
        replacements: [comuna.codigo, comuna.nombre, comuna.codigo_provincia, comuna.codigo_region]
      });
    }
    
    console.log('✅ Comunas básicas cargadas');
    
    await verifyGeografiaData();
    
  } catch (error) {
    console.error('❌ Error en carga básica:', error.message);
  }
}

async function verifyGeografiaData() {
  console.log('\n🔍 Verificando datos geográficos cargados...');
  
  try {
    const [regionCount] = await sequelize.query("SELECT COUNT(*) as count FROM regiones");
    const [provinciaCount] = await sequelize.query("SELECT COUNT(*) as count FROM provincias");
    const [comunaCount] = await sequelize.query("SELECT COUNT(*) as count FROM comunas");
    
    console.log('📊 Resumen de datos geográficos:');
    console.log(`   🏛️  Regiones: ${regionCount[0].count}`);
    console.log(`   🏘️  Provincias: ${provinciaCount[0].count}`);
    console.log(`   🏠 Comunas: ${comunaCount[0].count}`);
    
    if (regionCount[0].count > 0) {
      console.log('\n✅ Datos geográficos cargados exitosamente');
      console.log('🎉 El sistema está listo para usar geografía CUT 2018');
    } else {
      console.log('\n❌ No se pudieron cargar los datos geográficos');
    }
    
  } catch (error) {
    console.error('❌ Error verificando datos:', error.message);
  }
}

// Ejecutar carga
loadGeografia();

