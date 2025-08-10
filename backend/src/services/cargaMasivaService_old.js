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
 * Servicio de Carga Masiva de Usuarios con RUT v7.0
 * Soporta CSV, Excel y validaciones completas
 */
class CargaMasivaService {
  
  /**
   * Procesar archivo de carga masiva
   */
  static async procesarArchivo(archivoPath, tipoArchivo, opciones = {}) {
    try {
      let datos = [];
      
      // Leer archivo según tipo
      if (tipoArchivo === 'csv') {
        datos = await this.leerCSV(archivoPath);
      } else if (tipoArchivo === 'excel') {
        datos = await this.leerExcel(archivoPath);
      } else {
        throw new Error('Tipo de archivo no soportado');
      }
      
      // Validar estructura
      const validacion = this.validarEstructura(datos);
      if (!validacion.valido) {
        return {
          exito: false,
          errores: validacion.errores,
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
   * Leer archivo Excel
   */
  static async leerExcel(archivoPath) {
    try {
      const workbook = XLSX.readFile(archivoPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const datos = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: ''
      });
      
      if (datos.length === 0) {
        throw new Error('Archivo Excel vacío');
      }
      
      // Convertir a formato objeto usando primera fila como headers
      const headers = datos[0];
      const filas = datos.slice(1);
      
      return filas.map(fila => {
        const objeto = {};
        headers.forEach((header, index) => {
          objeto[header] = fila[index] || '';
        });
        return objeto;
      });
      
    } catch (error) {
      throw new Error(`Error leyendo Excel: ${error.message}`);
    }
  }
  
  /**
   * Validar estructura del archivo
   */
  static validarEstructura(datos) {
    const errores = [];
    
    if (!datos || datos.length === 0) {
      errores.push('Archivo vacío o sin datos');
      return { valido: false, errores };
    }
    
    // Campos requeridos
    const camposRequeridos = [
      'rut', 'nombres', 'apellido_paterno', 'fecha_nacimiento', 
      'genero', 'email', 'roles'
    ];
    
    const primeraFila = datos[0];
    const camposFaltantes = camposRequeridos.filter(campo => 
      !primeraFila.hasOwnProperty(campo) || primeraFila[campo] === undefined
    );
    
    if (camposFaltantes.length > 0) {
      errores.push(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
    }
    
    // Validar datos de muestra
    const muestraValidacion = datos.slice(0, 5);
    muestraValidacion.forEach((fila, index) => {
      const erroresFila = this.validarFila(fila, index + 1);
      errores.push(...erroresFila);
    });
    
    return {
      valido: errores.length === 0,
      errores: errores.slice(0, 10) // Limitar errores mostrados
    };
  }
  
  /**
   * Validar una fila individual
   */
  static validarFila(fila, numeroFila) {
    const errores = [];
    const prefijo = `Fila ${numeroFila}:`;
    
    // Validar RUT
    if (!fila.rut || !Persona.validarRUT(fila.rut)) {
      errores.push(`${prefijo} RUT inválido (${fila.rut})`);
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fila.email || !emailRegex.test(fila.email)) {
      errores.push(`${prefijo} Email inválido (${fila.email})`);
    }
    
    // Validar fecha de nacimiento
    if (!fila.fecha_nacimiento || isNaN(Date.parse(fila.fecha_nacimiento))) {
      errores.push(`${prefijo} Fecha de nacimiento inválida (${fila.fecha_nacimiento})`);
    }
    
    // Validar género
    if (!fila.genero || !['M', 'F', 'O'].includes(fila.genero.toUpperCase())) {
      errores.push(`${prefijo} Género inválido (${fila.genero}). Debe ser M, F o O`);
    }
    
    // Validar roles
    if (!fila.roles || fila.roles.trim() === '') {
      errores.push(`${prefijo} Debe especificar al menos un rol`);
    }
    
    return errores;
  }
  
  /**
   * Procesar datos validados
   */
  static async procesarDatos(datos, opciones, transaction) {
    const resultado = {
      exito: true,
      datos_procesados: 0,
      personas_creadas: 0,
      personas_actualizadas: 0,
      usuarios_creados: 0,
      roles_asignados: 0,
      errores: [],
      advertencias: [],
      credenciales_generadas: []
    };
    
    for (let i = 0; i < datos.length; i++) {
      const fila = datos[i];
      const numeroFila = i + 1;
      
      try {
        // Procesar persona
        const resultadoPersona = await this.procesarPersona(fila, opciones, transaction);
        
        if (resultadoPersona.creada) {
          resultado.personas_creadas++;
        } else if (resultadoPersona.actualizada) {
          resultado.personas_actualizadas++;
        }
        
        // Procesar autenticación
        const resultadoAuth = await this.procesarAutenticacion(
          resultadoPersona.persona, opciones, transaction
        );
        
        if (resultadoAuth.creado) {
          resultado.usuarios_creados++;
          if (resultadoAuth.credenciales) {
            resultado.credenciales_generadas.push(resultadoAuth.credenciales);
          }
        }
        
        // Procesar roles
        const resultadoRoles = await this.procesarRoles(
          resultadoPersona.persona, fila.roles, opciones, transaction
        );
        
        resultado.roles_asignados += resultadoRoles.asignados;
        resultado.advertencias.push(...resultadoRoles.advertencias);
        
        resultado.datos_procesados++;
        
      } catch (error) {
        resultado.errores.push(`Fila ${numeroFila}: ${error.message}`);
        
        // Si hay muchos errores, detener procesamiento
        if (resultado.errores.length > 50) {
          resultado.errores.push('Demasiados errores. Procesamiento detenido.');
          break;
        }
      }
    }
    
    return resultado;
  }
  
  /**
   * Procesar datos de persona
   */
  static async procesarPersona(fila, opciones, transaction) {
    const rutLimpio = Persona.limpiarRUT(fila.rut);
    
    // Buscar persona existente
    let persona = await Persona.findByPk(rutLimpio, { transaction });
    
    const datosPersona = {
      rut: rutLimpio,
      nombres: fila.nombres.trim(),
      apellido_paterno: fila.apellido_paterno.trim(),
      apellido_materno: fila.apellido_materno ? fila.apellido_materno.trim() : null,
      fecha_nacimiento: new Date(fila.fecha_nacimiento),
      genero: fila.genero.toUpperCase(),
      email: fila.email.toLowerCase().trim(),
      telefono: fila.telefono || null,
      direccion: fila.direccion || null,
      comuna: fila.comuna || null,
      provincia: fila.provincia || null,
      region: fila.region || null,
      es_dato_prueba: opciones.marcarComoPrueba || false
    };
    
    if (persona) {
      // Actualizar persona existente
      if (opciones.actualizarExistentes) {
        await persona.update(datosPersona, { transaction });
        return { persona, actualizada: true };
      } else {
        return { persona, actualizada: false };
      }
    } else {
      // Crear nueva persona
      persona = await Persona.create(datosPersona, { transaction });
      return { persona, creada: true };
    }
  }
  
  /**
   * Procesar autenticación de usuario
   */
  static async procesarAutenticacion(persona, opciones, transaction) {
    // Verificar si ya tiene autenticación
    let usuario = await UsuarioAuth.findByPk(persona.rut, { transaction });
    
    if (usuario) {
      return { creado: false, usuario };
    }
    
    // Crear autenticación
    const passwordTemporal = opciones.passwordPorDefecto || 
                            UsuarioAuth.generarPasswordSegura();
    
    const resultado = await UsuarioAuth.crearUsuario(
      persona.rut, 
      passwordTemporal,
      { transaction }
    );
    
    return {
      creado: true,
      usuario: resultado.usuario,
      credenciales: {
        rut: persona.rut_formateado,
        nombre: persona.getNombreCompleto(),
        email: persona.email,
        password: passwordTemporal
      }
    };
  }
  
  /**
   * Procesar asignación de roles
   */
  static async procesarRoles(persona, rolesString, opciones, transaction) {
    const resultado = {
      asignados: 0,
      advertencias: []
    };
    
    // Parsear roles
    const codigosRoles = rolesString.split(',').map(r => r.trim().toUpperCase());
    
    for (const codigoRol of codigosRoles) {
      try {
        // Buscar rol
        const rol = await Rol.findOne({
          where: { codigo: codigoRol, activo: true },
          transaction
        });
        
        if (!rol) {
          resultado.advertencias.push(
            `Rol "${codigoRol}" no encontrado para ${persona.getNombreCompleto()}`
          );
          continue;
        }
        
        // Verificar si ya tiene el rol
        const rolExistente = await PersonaRol.findOne({
          where: {
            rut_persona: persona.rut,
            rol_id: rol.id,
            activo: true
          },
          transaction
        });
        
        if (rolExistente) {
          resultado.advertencias.push(
            `${persona.getNombreCompleto()} ya tiene el rol "${rol.nombre}"`
          );
          continue;
        }
        
        // Asignar rol
        await PersonaRol.create({
          rut_persona: persona.rut,
          rol_id: rol.id,
          curso_id: null, // Se asignará después si es necesario
          fecha_inicio: new Date(),
          activo: true,
          es_dato_prueba: opciones.marcarComoPrueba || false
        }, { transaction });
        
        resultado.asignados++;
        
      } catch (error) {
        resultado.advertencias.push(
          `Error asignando rol "${codigoRol}" a ${persona.getNombreCompleto()}: ${error.message}`
        );
      }
    }
    
    return resultado;
  }
  
  /**
   * Generar plantilla CSV
   */
  static generarPlantillaCSV() {
    const headers = [
      'rut',
      'nombres', 
      'apellido_paterno',
      'apellido_materno',
      'fecha_nacimiento',
      'genero',
      'email',
      'telefono',
      'direccion',
      'comuna',
      'provincia',
      'region',
      'roles'
    ];
    
    const ejemplos = [
      {
        rut: '12345678-9',
        nombres: 'Juan Carlos',
        apellido_paterno: 'González',
        apellido_materno: 'Pérez',
        fecha_nacimiento: '1985-03-15',
        genero: 'M',
        email: 'juan.gonzalez@email.com',
        telefono: '+56912345678',
        direccion: 'Av. Principal 123',
        comuna: 'Santiago',
        provincia: 'Santiago',
        region: 'Región Metropolitana',
        roles: 'APODERADO,TESORERO_APODERADOS'
      },
      {
        rut: '98765432-1',
        nombres: 'María Elena',
        apellido_paterno: 'Silva',
        apellido_materno: 'Torres',
        fecha_nacimiento: '2010-07-22',
        genero: 'F',
        email: 'maria.silva@estudiante.cl',
        telefono: '',
        direccion: 'Calle Secundaria 456',
        comuna: 'Las Condes',
        provincia: 'Santiago',
        region: 'Región Metropolitana',
        roles: 'ALUMNO'
      }
    ];
    
    // Generar CSV
    let csv = headers.join(',') + '\n';
    ejemplos.forEach(ejemplo => {
      const fila = headers.map(header => {
        const valor = ejemplo[header] || '';
        return `"${valor}"`;
      }).join(',');
      csv += fila + '\n';
    });
    
    return csv;
  }
  
  /**
   * Generar plantilla Excel
   */
  static generarPlantillaExcel() {
    const datos = [
      [
        'rut', 'nombres', 'apellido_paterno', 'apellido_materno',
        'fecha_nacimiento', 'genero', 'email', 'telefono',
        'direccion', 'comuna', 'provincia', 'region', 'roles'
      ],
      [
        '12345678-9', 'Juan Carlos', 'González', 'Pérez',
        '1985-03-15', 'M', 'juan.gonzalez@email.com', '+56912345678',
        'Av. Principal 123', 'Santiago', 'Santiago', 'Región Metropolitana',
        'APODERADO,TESORERO_APODERADOS'
      ],
      [
        '98765432-1', 'María Elena', 'Silva', 'Torres',
        '2010-07-22', 'F', 'maria.silva@estudiante.cl', '',
        'Calle Secundaria 456', 'Las Condes', 'Santiago', 'Región Metropolitana',
        'ALUMNO'
      ]
    ];
    
    const worksheet = XLSX.utils.aoa_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    
    return workbook;
  }
  
  /**
   * Validar archivo antes de procesar
   */
  static async validarArchivo(archivoPath, tipoArchivo) {
    try {
      // Verificar que el archivo existe
      if (!fs.existsSync(archivoPath)) {
        return {
          valido: false,
          errores: ['Archivo no encontrado']
        };
      }
      
      // Verificar tamaño (máximo 10MB)
      const stats = fs.statSync(archivoPath);
      if (stats.size > 10 * 1024 * 1024) {
        return {
          valido: false,
          errores: ['Archivo demasiado grande (máximo 10MB)']
        };
      }
      
      // Leer y validar estructura
      let datos = [];
      if (tipoArchivo === 'csv') {
        datos = await this.leerCSV(archivoPath);
      } else if (tipoArchivo === 'excel') {
        datos = await this.leerExcel(archivoPath);
      }
      
      return this.validarEstructura(datos);
      
    } catch (error) {
      return {
        valido: false,
        errores: [`Error validando archivo: ${error.message}`]
      };
    }
  }
  
  /**
   * Limpiar datos de prueba
   */
  static async limpiarDatosPrueba() {
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar en orden correcto por dependencias
      await PersonaRol.destroy({
        where: { es_dato_prueba: true },
        force: true,
        transaction
      });
      
      await UsuarioAuth.destroy({
        where: { es_dato_prueba: true },
        force: true,
        transaction
      });
      
      await Persona.destroy({
        where: { es_dato_prueba: true },
        force: true,
        transaction
      });
      
      await transaction.commit();
      
      return {
        exito: true,
        mensaje: 'Datos de prueba eliminados correctamente'
      };
      
    } catch (error) {
      await transaction.rollback();
      return {
        exito: false,
        mensaje: `Error eliminando datos de prueba: ${error.message}`
      };
    }
  }
}

module.exports = CargaMasivaService;

