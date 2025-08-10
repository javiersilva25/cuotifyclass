const ExcelJS = require('exceljs');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const Persona = require('../models/persona');
const Rol = require('../models/rol');
const PersonaRol = require('../models/personaRol');
const UsuarioAuth = require('../models/usuarioAuth');
const sequelize = require('../config/database');

/**
 * Servicio de Carga Masiva de Usuarios con RUT v8.6.1
 * Soporta CSV, Excel y validaciones completas
 * SEGURO: Usa ExcelJS en lugar de xlsx vulnerable
 */
class CargaMasivaService {
  
  /**
   * Procesar archivo de carga masiva
   */
  static async procesarArchivo(archivoPath, opciones = {}) {
    try {
      const extension = path.extname(archivoPath).toLowerCase();
      let datos = [];
      
      // Leer archivo según extensión
      switch (extension) {
        case '.csv':
          datos = await this.leerCSV(archivoPath);
          break;
        case '.xlsx':
        case '.xls':
          datos = await this.leerExcel(archivoPath);
          break;
        default:
          return {
            exito: false,
            errores: ['Formato de archivo no soportado. Use CSV o Excel.'],
            datos_procesados: 0
          };
      }
      
      // Validar que hay datos
      if (!datos || datos.length === 0) {
        return {
          exito: false,
          errores: ['El archivo está vacío o no contiene datos válidos.'],
          datos_procesados: 0
        };
      }
      
      // Procesar datos en transacción
      const resultado = await sequelize.transaction(async (t) => {
        return await this.procesarDatos(datos, opciones, t);
      });
      
      return resultado;
      
    } catch (error) {
      console.error('Error en carga masiva:', error);
      return {
        exito: false,
        errores: [`Error general: ${error.message}`],
        datos_procesados: 0
      };
    }
  }
  
  /**
   * Leer archivo CSV
   */
  static async leerCSV(archivoPath) {
    return new Promise((resolve, reject) => {
      const datos = [];
      
      fs.createReadStream(archivoPath)
        .pipe(csv({
          separator: ',',
          headers: true,
          skipEmptyLines: true
        }))
        .on('data', (fila) => {
          datos.push(fila);
        })
        .on('end', () => {
          resolve(datos);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
  
  /**
   * Leer archivo Excel usando ExcelJS (SEGURO)
   */
  static async leerExcel(archivoPath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(archivoPath);
      
      // Obtener la primera hoja
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('El archivo Excel no contiene hojas de trabajo');
      }
      
      const datos = [];
      const headers = [];
      
      // Obtener headers de la primera fila
      const firstRow = worksheet.getRow(1);
      firstRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value?.toString().trim() || `col_${colNumber}`;
      });
      
      // Procesar filas de datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltar headers
        
        const fila = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            fila[header] = cell.value?.toString().trim() || '';
          }
        });
        
        // Solo agregar filas que tengan al menos un campo no vacío
        if (Object.values(fila).some(val => val !== '')) {
          datos.push(fila);
        }
      });
      
      return datos;
    } catch (error) {
      throw new Error(`Error al leer archivo Excel: ${error.message}`);
    }
  }
  
  /**
   * Procesar datos y crear usuarios
   */
  static async procesarDatos(datos, opciones, transaction) {
    const errores = [];
    const exitosos = [];
    const duplicados = [];
    
    for (let i = 0; i < datos.length; i++) {
      const fila = datos[i];
      const numeroFila = i + 2; // +2 porque empezamos en fila 2 (después de headers)
      
      try {
        // Validar campos requeridos
        const validacion = this.validarFila(fila, numeroFila);
        if (!validacion.valido) {
          errores.push(...validacion.errores);
          continue;
        }
        
        // Verificar si el RUT ya existe
        const rutLimpio = this.limpiarRUT(fila.rut);
        const personaExistente = await Persona.findOne({
          where: { rut: rutLimpio },
          transaction
        });
        
        if (personaExistente) {
          duplicados.push(`Fila ${numeroFila}: RUT ${fila.rut} ya existe`);
          continue;
        }
        
        // Crear persona
        const persona = await this.crearPersona(fila, transaction);
        
        // Crear usuario de autenticación
        const usuario = await this.crearUsuarioAuth(persona, fila, transaction);
        
        // Asignar rol
        await this.asignarRol(persona, fila, transaction);
        
        exitosos.push({
          fila: numeroFila,
          rut: persona.rut,
          nombre: `${persona.nombres} ${persona.apellido_paterno}`,
          rol: fila.rol
        });
        
      } catch (error) {
        errores.push(`Fila ${numeroFila}: ${error.message}`);
      }
    }
    
    return {
      exito: errores.length === 0,
      datos_procesados: exitosos.length,
      errores,
      duplicados,
      exitosos,
      resumen: {
        total_filas: datos.length,
        exitosos: exitosos.length,
        errores: errores.length,
        duplicados: duplicados.length
      }
    };
  }
  
  /**
   * Validar fila de datos
   */
  static validarFila(fila, numeroFila) {
    const errores = [];
    
    // Campos requeridos
    const camposRequeridos = ['rut', 'nombres', 'apellido_paterno', 'email', 'rol'];
    
    for (const campo of camposRequeridos) {
      if (!fila[campo] || fila[campo].trim() === '') {
        errores.push(`Fila ${numeroFila}: Campo '${campo}' es requerido`);
      }
    }
    
    // Validar RUT
    if (fila.rut && !this.validarRUT(fila.rut)) {
      errores.push(`Fila ${numeroFila}: RUT '${fila.rut}' no es válido`);
    }
    
    // Validar email
    if (fila.email && !this.validarEmail(fila.email)) {
      errores.push(`Fila ${numeroFila}: Email '${fila.email}' no es válido`);
    }
    
    // Validar rol
    const rolesValidos = ['administrador', 'apoderado', 'profesor', 'tesorero', 'alumno'];
    if (fila.rol && !rolesValidos.includes(fila.rol.toLowerCase())) {
      errores.push(`Fila ${numeroFila}: Rol '${fila.rol}' no es válido. Roles permitidos: ${rolesValidos.join(', ')}`);
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  }
  
  /**
   * Crear persona
   */
  static async crearPersona(fila, transaction) {
    const persona = await Persona.create({
      rut: this.limpiarRUT(fila.rut),
      nombres: fila.nombres.trim(),
      apellido_paterno: fila.apellido_paterno.trim(),
      apellido_materno: fila.apellido_materno?.trim() || '',
      email: fila.email.trim().toLowerCase(),
      telefono: fila.telefono?.trim() || null,
      direccion: fila.direccion?.trim() || null,
      fecha_nacimiento: fila.fecha_nacimiento ? new Date(fila.fecha_nacimiento) : null,
      genero: fila.genero?.trim() || null,
      estado_civil: fila.estado_civil?.trim() || null,
      profesion: fila.profesion?.trim() || null,
      comuna_id: fila.comuna_id || null,
      provincia_id: fila.provincia_id || null,
      region_id: fila.region_id || null
    }, { transaction });
    
    return persona;
  }
  
  /**
   * Crear usuario de autenticación
   */
  static async crearUsuarioAuth(persona, fila, transaction) {
    const bcrypt = require('bcrypt');
    
    // Generar contraseña si no se proporciona
    const password = fila.password || this.generarPasswordTemporal();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const usuario = await UsuarioAuth.create({
      rut: persona.rut,
      password_hash: hashedPassword,
      email: persona.email,
      activo: true,
      ultimo_acceso: null,
      intentos_fallidos: 0,
      bloqueado_hasta: null
    }, { transaction });
    
    return usuario;
  }
  
  /**
   * Asignar rol a persona
   */
  static async asignarRol(persona, fila, transaction) {
    // Buscar rol
    const rol = await Rol.findOne({
      where: { nombre: fila.rol.toLowerCase() },
      transaction
    });
    
    if (!rol) {
      throw new Error(`Rol '${fila.rol}' no encontrado`);
    }
    
    // Crear relación persona-rol
    await PersonaRol.create({
      persona_id: persona.id,
      rol_id: rol.id,
      curso_id: fila.curso_id || null,
      activo: true,
      fecha_asignacion: new Date()
    }, { transaction });
  }
  
  /**
   * Generar plantilla Excel para descarga
   */
  static async generarPlantilla() {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Usuarios');
      
      // Definir headers
      const headers = [
        'rut',
        'nombres', 
        'apellido_paterno',
        'apellido_materno',
        'email',
        'telefono',
        'direccion',
        'fecha_nacimiento',
        'genero',
        'rol',
        'curso_id',
        'password'
      ];
      
      // Agregar headers
      worksheet.addRow(headers);
      
      // Agregar filas de ejemplo
      const ejemplos = [
        [
          '12.345.678-9',
          'Juan Carlos',
          'Pérez',
          'González',
          'juan.perez@email.com',
          '+56912345678',
          'Av. Principal 123',
          '1985-03-15',
          'masculino',
          'apoderado',
          '',
          'password123'
        ],
        [
          '98.765.432-1',
          'María Elena',
          'Silva',
          'Rodríguez',
          'maria.silva@email.com',
          '+56987654321',
          'Calle Secundaria 456',
          '1990-07-22',
          'femenino',
          'profesor',
          '1',
          'profesor456'
        ]
      ];
      
      ejemplos.forEach(ejemplo => {
        worksheet.addRow(ejemplo);
      });
      
      // Formatear headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }
      };
      headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      // Ajustar ancho de columnas
      worksheet.columns.forEach(column => {
        column.width = 20;
      });
      
      // Generar buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      return buffer;
    } catch (error) {
      throw new Error(`Error al generar plantilla: ${error.message}`);
    }
  }
  
  /**
   * Validar RUT chileno
   */
  static validarRUT(rut) {
    if (!rut) return false;
    
    // Limpiar RUT
    const rutLimpio = rut.toString().replace(/[^0-9kK]/g, '');
    
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toLowerCase();
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const dvCalculado = 11 - (suma % 11);
    const dvFinal = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString();
    
    return dv === dvFinal;
  }
  
  /**
   * Limpiar RUT
   */
  static limpiarRUT(rut) {
    if (!rut) return '';
    return rut.toString().replace(/[^0-9kK]/g, '');
  }
  
  /**
   * Validar email
   */
  static validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  /**
   * Generar contraseña temporal
   */
  static generarPasswordTemporal() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
  
  /**
   * Obtener estadísticas de carga
   */
  static async obtenerEstadisticas() {
    try {
      const [totalPersonas, totalUsuarios, totalRoles] = await Promise.all([
        Persona.count(),
        UsuarioAuth.count(),
        PersonaRol.count()
      ]);
      
      const rolesPorTipo = await PersonaRol.findAll({
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['nombre']
        }],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('PersonaRol.id')), 'total']
        ],
        group: ['rol.id', 'rol.nombre'],
        raw: true
      });
      
      return {
        total_personas: totalPersonas,
        total_usuarios: totalUsuarios,
        total_asignaciones_rol: totalRoles,
        distribucion_roles: rolesPorTipo
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
  
  /**
   * Validar estructura de archivo
   */
  static validarEstructura(datos) {
    const errores = [];
    
    if (!Array.isArray(datos) || datos.length === 0) {
      errores.push('El archivo debe contener al menos una fila de datos');
      return { valido: false, errores };
    }
    
    // Verificar headers requeridos
    const headersRequeridos = ['rut', 'nombres', 'apellido_paterno', 'email', 'rol'];
    const primeraFila = datos[0];
    
    for (const header of headersRequeridos) {
      if (!(header in primeraFila)) {
        errores.push(`Columna requerida '${header}' no encontrada`);
      }
    }
    
    return {
      valido: errores.length === 0,
      errores
    };
  }
  
  /**
   * Limpiar datos de archivo
   */
  static limpiarDatos(datos) {
    return datos.map(fila => {
      const filaLimpia = {};
      
      Object.keys(fila).forEach(key => {
        const valor = fila[key];
        
        if (typeof valor === 'string') {
          filaLimpia[key.toLowerCase().trim()] = valor.trim();
        } else {
          filaLimpia[key.toLowerCase().trim()] = valor;
        }
      });
      
      return filaLimpia;
    });
  }
  
  /**
   * Generar reporte de carga
   */
  static async generarReporte(resultado) {
    try {
      const workbook = new ExcelJS.Workbook();
      
      // Hoja de resumen
      const resumenSheet = workbook.addWorksheet('Resumen');
      resumenSheet.addRow(['Reporte de Carga Masiva']);
      resumenSheet.addRow(['Fecha:', new Date().toLocaleString('es-CL')]);
      resumenSheet.addRow([]);
      resumenSheet.addRow(['Total filas procesadas:', resultado.resumen.total_filas]);
      resumenSheet.addRow(['Usuarios creados exitosamente:', resultado.resumen.exitosos]);
      resumenSheet.addRow(['Errores encontrados:', resultado.resumen.errores]);
      resumenSheet.addRow(['Duplicados omitidos:', resultado.resumen.duplicados]);
      
      // Hoja de exitosos
      if (resultado.exitosos.length > 0) {
        const exitososSheet = workbook.addWorksheet('Usuarios Creados');
        exitososSheet.addRow(['Fila', 'RUT', 'Nombre Completo', 'Rol']);
        
        resultado.exitosos.forEach(usuario => {
          exitososSheet.addRow([
            usuario.fila,
            usuario.rut,
            usuario.nombre,
            usuario.rol
          ]);
        });
      }
      
      // Hoja de errores
      if (resultado.errores.length > 0) {
        const erroresSheet = workbook.addWorksheet('Errores');
        erroresSheet.addRow(['Error']);
        
        resultado.errores.forEach(error => {
          erroresSheet.addRow([error]);
        });
      }
      
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      throw new Error(`Error al generar reporte: ${error.message}`);
    }
  }
}

module.exports = CargaMasivaService;

