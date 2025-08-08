const axios = require('axios');

const API_BASE = 'http://localhost:3008/api';

async function testBackendV8() {
  console.log('🧪 Probando Backend v8.0 - Sistema con Geografía CUT 2018');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Health check
    console.log('\n1. 🏥 Health Check');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Estado:', health.data.estado);
    console.log('✅ Versión:', health.data.version);
    
    // Test 2: Info del sistema
    console.log('\n2. ℹ️  Información del Sistema');
    const info = await axios.get(`${API_BASE}/info`);
    console.log('✅ Nombre:', info.data.nombre);
    console.log('✅ Versión:', info.data.version);
    console.log('✅ Geografía:', info.data.geografia?.fuente);
    
    // Test 3: Geografía - Regiones
    console.log('\n3. 🗺️  Geografía - Regiones');
    const regiones = await axios.get(`${API_BASE}/geografia/regiones`);
    console.log('✅ Total regiones:', regiones.data.total);
    console.log('✅ Primera región:', regiones.data.data[0]?.nombre);
    
    // Test 4: Geografía - Provincias de RM
    console.log('\n4. 🏙️  Geografía - Provincias de RM (Región 13)');
    const provincias = await axios.get(`${API_BASE}/geografia/regiones/13/provincias`);
    console.log('✅ Total provincias RM:', provincias.data.total);
    console.log('✅ Primera provincia:', provincias.data.data[0]?.nombre);
    
    // Test 5: Geografía - Comunas de Santiago
    console.log('\n5. 🏘️  Geografía - Comunas de Santiago (Provincia 131)');
    const comunas = await axios.get(`${API_BASE}/geografia/provincias/131/comunas`);
    console.log('✅ Total comunas Santiago:', comunas.data.total);
    console.log('✅ Primera comuna:', comunas.data.data[0]?.nombre);
    
    // Test 6: Búsqueda geográfica
    console.log('\n6. 🔍 Búsqueda Geográfica - "Santiago"');
    const busqueda = await axios.get(`${API_BASE}/geografia/buscar?q=Santiago`);
    console.log('✅ Resultados encontrados:', busqueda.data.total);
    
    // Test 7: Estadísticas geográficas
    console.log('\n7. 📊 Estadísticas Geográficas');
    const estadisticas = await axios.get(`${API_BASE}/geografia/estadisticas`);
    console.log('✅ Total regiones:', estadisticas.data.data.regiones);
    console.log('✅ Total provincias:', estadisticas.data.data.provincias);
    console.log('✅ Total comunas:', estadisticas.data.data.comunas);
    
    console.log('\n🎉 ¡Todas las pruebas del Backend v8.0 pasaron exitosamente!');
    console.log('✅ Sistema de Geografía CUT 2018 funcionando correctamente');
    
  } catch (error) {
    console.error('\n❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('📄 Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar pruebas
testBackendV8();
