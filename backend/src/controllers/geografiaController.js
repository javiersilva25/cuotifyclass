const { Region, Provincia, Comuna } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Controlador para gestión de geografía de Chile
 * Basado en CUT 2018 - Código Único Territorial
 */
class GeografiaController {
  
  /**
   * Obtener todas las regiones
   */
  async getRegiones(req, res) {
    try {
      const regiones = await Region.findAll({
        where: { activo: true },
        order: [['codigo', 'ASC']],
        attributes: ['codigo', 'nombre', 'abreviatura']
      });

      res.json({
        success: true,
        data: regiones,
        total: regiones.length,
        message: 'Regiones obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener regiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener provincias por región
   */
  async getProvinciasByRegion(req, res) {
    try {
      const { codigoRegion } = req.params;

      const provincias = await Provincia.findAll({
        where: { 
          codigoRegion: parseInt(codigoRegion),
          activo: true 
        },
        order: [['nombre', 'ASC']],
        attributes: ['codigo', 'nombre', 'codigoRegion'],
        include: [
          {
            model: Region,
            as: 'region',
            attributes: ['codigo', 'nombre', 'abreviatura']
          }
        ]
      });

      res.json({
        success: true,
        data: provincias,
        total: provincias.length,
        message: `Provincias de la región ${codigoRegion} obtenidas exitosamente`
      });
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener comunas por provincia
   */
  async getComunasByProvincia(req, res) {
    try {
      const { codigoProvincia } = req.params;

      const comunas = await Comuna.findAll({
        where: { 
          codigoProvincia: parseInt(codigoProvincia),
          activo: true 
        },
        order: [['nombre', 'ASC']],
        attributes: ['codigo', 'nombre', 'codigoProvincia', 'codigoRegion'],
        include: [
          {
            model: Provincia,
            as: 'provincia',
            attributes: ['codigo', 'nombre'],
            include: [
              {
                model: Region,
                as: 'region',
                attributes: ['codigo', 'nombre', 'abreviatura']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        data: comunas,
        total: comunas.length,
        message: `Comunas de la provincia ${codigoProvincia} obtenidas exitosamente`
      });
    } catch (error) {
      console.error('Error al obtener comunas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener comunas por región
   */
  async getComunasByRegion(req, res) {
    try {
      const { codigoRegion } = req.params;

      const comunas = await Comuna.findAll({
        where: { 
          codigoRegion: parseInt(codigoRegion),
          activo: true 
        },
        order: [['nombre', 'ASC']],
        attributes: ['codigo', 'nombre', 'codigoProvincia', 'codigoRegion'],
        include: [
          {
            model: Provincia,
            as: 'provincia',
            attributes: ['codigo', 'nombre']
          }
        ]
      });

      res.json({
        success: true,
        data: comunas,
        total: comunas.length,
        message: `Comunas de la región ${codigoRegion} obtenidas exitosamente`
      });
    } catch (error) {
      console.error('Error al obtener comunas por región:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Buscar ubicación por código de comuna
   */
  async getUbicacionByComuna(req, res) {
    try {
      const { codigoComuna } = req.params;

      const comuna = await Comuna.findOne({
        where: { 
          codigo: parseInt(codigoComuna),
          activo: true 
        },
        include: [
          {
            model: Provincia,
            as: 'provincia',
            include: [
              {
                model: Region,
                as: 'region'
              }
            ]
          }
        ]
      });

      if (!comuna) {
        return res.status(404).json({
          success: false,
          message: 'Comuna no encontrada'
        });
      }

      const ubicacion = {
        comuna: {
          codigo: comuna.codigo,
          nombre: comuna.nombre
        },
        provincia: {
          codigo: comuna.provincia.codigo,
          nombre: comuna.provincia.nombre
        },
        region: {
          codigo: comuna.provincia.region.codigo,
          nombre: comuna.provincia.region.nombre,
          abreviatura: comuna.provincia.region.abreviatura
        },
        direccionCompleta: `${comuna.nombre}, ${comuna.provincia.nombre}, ${comuna.provincia.region.nombre}`
      };

      res.json({
        success: true,
        data: ubicacion,
        message: 'Ubicación obtenida exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Buscar ubicaciones por texto
   */
  async buscarUbicaciones(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const comunas = await Comuna.findAll({
        where: {
          nombre: {
            [require('sequelize').Op.like]: `%${q}%`
          },
          activo: true
        },
        limit: 20,
        order: [['nombre', 'ASC']],
        include: [
          {
            model: Provincia,
            as: 'provincia',
            include: [
              {
                model: Region,
                as: 'region'
              }
            ]
          }
        ]
      });

      const resultados = comunas.map(comuna => ({
        comuna: {
          codigo: comuna.codigo,
          nombre: comuna.nombre
        },
        provincia: {
          codigo: comuna.provincia.codigo,
          nombre: comuna.provincia.nombre
        },
        region: {
          codigo: comuna.provincia.region.codigo,
          nombre: comuna.provincia.region.nombre,
          abreviatura: comuna.provincia.region.abreviatura
        },
        direccionCompleta: `${comuna.nombre}, ${comuna.provincia.nombre}, ${comuna.provincia.region.nombre}`
      }));

      res.json({
        success: true,
        data: resultados,
        total: resultados.length,
        message: `Se encontraron ${resultados.length} ubicaciones`
      });
    } catch (error) {
      console.error('Error al buscar ubicaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener estadísticas geográficas
   */
  async getEstadisticas(req, res) {
    try {
      const [totalRegiones, totalProvincias, totalComunas] = await Promise.all([
        Region.count({ where: { activo: true } }),
        Provincia.count({ where: { activo: true } }),
        Comuna.count({ where: { activo: true } })
      ]);

      const estadisticas = {
        regiones: totalRegiones,
        provincias: totalProvincias,
        comunas: totalComunas,
        fuente: 'CUT 2018 - Código Único Territorial',
        ultimaActualizacion: '2018'
      };

      res.json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas geográficas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new GeografiaController();

