const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Probando APIs del backend v8.0...\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      expected: 'success'
    },
    {
      name: 'Info del Sistema',
      url: `${BASE_URL}/api/info`,
      expected: 'success'
    },
    {
      name: 'Regiones',
      url: `${BASE_URL}/api/geografia/regiones`,
      expected: 'success'
    },
    {
      name: 'Provincias de RM',
      url: `${BASE_URL}/api/geografia/regiones/13/provincias`,
      expected: 'success'
    },
    {
      name: 'Comunas de Santiago',
      url: `${BASE_URL}/api/geografia/provincias/131/comunas`,
      expected: 'success'
    },
    {
      name: 'Estadísticas',
      url: `${BASE_URL}/api/geografia/estadisticas`,
      expected: 'success'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`🔍 ${test.name}...`);
      const response = await axios.get(test.url, { timeout: 5000 });
      
      if (response.data.success === true) {
        console.log(`✅ ${test.name} - OK`);
        if (response.data.data) {
          const dataLength = Array.isArray(response.data.data) 
            ? response.data.data.length 
            : Object.keys(response.data.data).length;
          console.log(`   📊 Datos: ${dataLength} elementos`);
        }
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAIL: ${response.data.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  console.log('📋 RESUMEN DE PRUEBAS:');
  console.log(`✅ Exitosas: ${passed}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡Todas las APIs funcionan correctamente!');
  } else {
    console.log(`\n⚠️  ${failed} APIs necesitan corrección`);
  }
}

// Ejecutar tests
testAPIs().catch(console.error);

