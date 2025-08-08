const multer = require('multer');
const path = require('path');
const fs = require('fs');
const CargaMasivaService = require('../services/cargaMasivaService');

/**
 * Controlador de Carga Masiva v7.0
 * Gestiona la carga masiva de usuarios con RUT
 */

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/carga-masiva');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const nombre = `carga_masiva_${timestamp}${extension}`;
    cb(null, nombre);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo
    const tiposPermitidos = ['.csv', '.xlsx', '.xls'];
    const extension = path.extname(file.originalname).toLowerCase();
    
    if (tiposPermitidos.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo CSV y Excel.'));
    }
  }
});

class CargaMasivaController {
  
  /**
   * Subir y procesar archivo de carga masiva
   */
  static subirArchivo = upload.single('archivo');
  
  static async procesarCargaMasiva(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          exito: false,
          mensaje: 'No se recibió ningún archivo'
        });
      }
      
      const archivoPath = req.file.path;
      const extension = path.extname(req.file.originalname).toLowerCase();
      const tipoArchivo = extension === '.csv' ? 'csv' : 'excel';
      
      // Opciones de procesamiento
      const opciones = {
        actualizarExistentes: req.body.actualizar_existentes === 'true',
        marcarComoPrueba: req.body.marcar_como_prueba === 'true',
        passwordPorDefecto: req.body.password_por_defecto || null,
        enviarCredenciales: req.body.enviar_credenciales === 'true'
      };
      
      // Procesar archivo
      const resultado = await CargaMasivaService.procesarArchivo(
        archivoPath, 
        tipoArchivo, 
        opciones
      );
      
      // Limpiar archivo temporal
      fs.unlinkSync(archivoPath);
      
      // Responder con resultado
      res.json({
        exito: resultado.exito,
        mensaje: resultado.exito ? 'Carga masiva completada' : 'Carga masiva con errores',
        estadisticas: {
          datos_procesados: resultado.datos_procesados,
          personas_creadas: resultado.personas_creadas,
          personas_actualizadas: resultado.personas_actualizadas,
          usuarios_creados: resultado.usuarios_creados,
          roles_asignados: resultado.roles_asignados
        },
        errores: resultado.errores,
        advertencias: resultado.advertencias,
        credenciales_generadas: resultado.credenciales_generadas
      });
      
    } catch (error) {
      console.error('Error en carga masiva:', error);
      
      // Limpiar archivo si existe
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: error.message
      });
    }
  }
  
  /**
   * Validar archivo antes de procesar
   */
  static async validarArchivo(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          exito: false,
          mensaje: 'No se recibió ningún archivo'
        });
      }
      
      const archivoPath = req.file.path;
      const extension = path.extname(req.file.originalname).toLowerCase();
      const tipoArchivo = extension === '.csv' ? 'csv' : 'excel';
      
      // Validar archivo
      const validacion = await CargaMasivaService.validarArchivo(archivoPath, tipoArchivo);
      
      // Limpiar archivo temporal
      fs.unlinkSync(archivoPath);
      
      res.json({
        exito: validacion.valido,
        mensaje: validacion.valido ? 'Archivo válido' : 'Archivo con errores',
        errores: validacion.errores || []
      });
      
    } catch (error) {
      console.error('Error validando archivo:', error);
      
      // Limpiar archivo si existe
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        exito: false,
        mensaje: 'Error validando archivo',
        error: error.message
      });
    }
  }
  
  /**
   * Descargar plantilla CSV
   */
  static async descargarPlantillaCSV(req, res) {
    try {
      const csv = CargaMasivaService.generarPlantillaCSV();
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_usuarios.csv"');
      res.send(csv);
      
    } catch (error) {
      console.error('Error generando plantilla CSV:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error generando plantilla CSV',
        error: error.message
      });
    }
  }
  
  /**
   * Descargar plantilla Excel
   */
  static async descargarPlantillaExcel(req, res) {
    try {
      const workbook = CargaMasivaService.generarPlantillaExcel();
      
      // Generar buffer
      const buffer = require('xlsx').write(workbook, { 
        type: 'buffer', 
        bookType: 'xlsx' 
      });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="plantilla_usuarios.xlsx"');
      res.send(buffer);
      
    } catch (error) {
      console.error('Error generando plantilla Excel:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error generando plantilla Excel',
        error: error.message
      });
    }
  }
  
  /**
   * Obtener roles disponibles
   */
  static async obtenerRolesDisponibles(req, res) {
    try {
      const Rol = require('../models/rol');
      
      const roles = await Rol.findAll({
        where: { activo: true },
        attributes: ['id', 'codigo', 'nombre', 'descripcion', 'categoria', 'es_alumno'],
        order: [['categoria', 'ASC'], ['nombre', 'ASC']]
      });
      
      // Agrupar por categoría
      const rolesPorCategoria = roles.reduce((acc, rol) => {
        if (!acc[rol.categoria]) {
          acc[rol.categoria] = [];
        }
        acc[rol.categoria].push(rol);
        return acc;
      }, {});
      
      res.json({
        exito: true,
        roles: roles,
        roles_por_categoria: rolesPorCategoria
      });
      
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error obteniendo roles disponibles',
        error: error.message
      });
    }
  }
  
  /**
   * Obtener estadísticas de usuarios
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const Persona = require('../models/persona');
      const PersonaRol = require('../models/personaRol');
      const UsuarioAuth = require('../models/usuarioAuth');
      const Rol = require('../models/rol');
      
      // Estadísticas generales
      const totalPersonas = await Persona.count({ where: { activo: true } });
      const totalUsuarios = await UsuarioAuth.count();
      const totalRolesAsignados = await PersonaRol.count({ where: { activo: true } });
      
      // Personas por categoría de edad
      const personasAdultas = await Persona.count({
        where: {
          activo: true,
          fecha_nacimiento: {
            [require('sequelize').Op.lte]: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)
          }
        }
      });
      
      const personasMenores = totalPersonas - personasAdultas;
      
      // Roles más asignados
      const rolesPopulares = await PersonaRol.findAll({
        where: { activo: true },
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['codigo', 'nombre']
        }],
        attributes: [
          'rol_id',
          [require('sequelize').fn('COUNT', require('sequelize').col('PersonaRol.id')), 'cantidad']
        ],
        group: ['rol_id', 'rol.id'],
        order: [[require('sequelize').fn('COUNT', require('sequelize').col('PersonaRol.id')), 'DESC']],
        limit: 5
      });
      
      // Datos de prueba
      const datosPrueba = {
        personas: await Persona.count({ where: { es_dato_prueba: true } }),
        usuarios: await UsuarioAuth.count({ where: { es_dato_prueba: true } }),
        roles: await PersonaRol.count({ where: { es_dato_prueba: true } })
      };
      
      res.json({
        exito: true,
        estadisticas: {
          total_personas: totalPersonas,
          total_usuarios: totalUsuarios,
          total_roles_asignados: totalRolesAsignados,
          personas_adultas: personasAdultas,
          personas_menores: personasMenores,
          roles_populares: rolesPopulares,
          datos_prueba: datosPrueba
        }
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error obteniendo estadísticas',
        error: error.message
      });
    }
  }
  
  /**
   * Limpiar datos de prueba
   */
  static async limpiarDatosPrueba(req, res) {
    try {
      const resultado = await CargaMasivaService.limpiarDatosPrueba();
      
      res.json({
        exito: resultado.exito,
        mensaje: resultado.mensaje
      });
      
    } catch (error) {
      console.error('Error limpiando datos de prueba:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error limpiando datos de prueba',
        error: error.message
      });
    }
  }
  
  /**
   * Buscar personas con filtros
   */
  static async buscarPersonas(req, res) {
    try {
      const { 
        busqueda, 
        categoria_rol, 
        activo, 
        es_dato_prueba,
        pagina = 1, 
        limite = 20 
      } = req.query;
      
      const Persona = require('../models/persona');
      const PersonaRol = require('../models/personaRol');
      const Rol = require('../models/rol');
      const { Op } = require('sequelize');
      
      // Construir filtros
      const where = {};
      const include = [];
      
      if (activo !== undefined) {
        where.activo = activo === 'true';
      }
      
      if (es_dato_prueba !== undefined) {
        where.es_dato_prueba = es_dato_prueba === 'true';
      }
      
      if (busqueda) {
        where[Op.or] = [
          { nombres: { [Op.like]: `%${busqueda}%` } },
          { apellido_paterno: { [Op.like]: `%${busqueda}%` } },
          { apellido_materno: { [Op.like]: `%${busqueda}%` } },
          { email: { [Op.like]: `%${busqueda}%` } },
          { rut: { [Op.like]: `%${busqueda}%` } }
        ];
      }
      
      // Incluir roles
      const includeRoles = {
        model: PersonaRol,
        as: 'roles',
        where: { activo: true },
        required: false,
        include: [{
          model: Rol,
          as: 'rol'
        }]
      };
      
      if (categoria_rol) {
        includeRoles.include[0].where = { categoria: categoria_rol };
        includeRoles.required = true;
      }
      
      include.push(includeRoles);
      
      // Ejecutar consulta
      const offset = (parseInt(pagina) - 1) * parseInt(limite);
      
      const { count, rows } = await Persona.findAndCountAll({
        where,
        include,
        limit: parseInt(limite),
        offset: offset,
        order: [['apellido_paterno', 'ASC'], ['nombres', 'ASC']],
        distinct: true
      });
      
      res.json({
        exito: true,
        personas: rows,
        paginacion: {
          total: count,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total_paginas: Math.ceil(count / parseInt(limite))
        }
      });
      
    } catch (error) {
      console.error('Error buscando personas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error buscando personas',
        error: error.message
      });
    }
  }
}

module.exports = CargaMasivaController;

