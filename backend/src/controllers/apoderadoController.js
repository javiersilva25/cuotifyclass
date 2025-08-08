const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, ApoderadoAlumno } = require('../models/apoderado');
const Alumno = require('../models/alumno');
const Cuota = require('../models/cuota');
const Pago = require('../models/pago');
const EstadoPago = require('../models/estadoPago');
const Curso = require('../models/curso');
const Logger = require('../utils/logger');

class ApoderadoController {
  // Obtener todos los apoderados
  static async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search, activo } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { rol: 'apoderado' };
      
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { apellido: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (activo !== undefined) {
        whereClause.activo = activo === 'true';
      }

      const { count, rows } = await Usuario.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']],
        attributes: { exclude: ['password'] }
      });

      // Obtener hijos para cada apoderado
      for (let apoderado of rows) {
        apoderado.dataValues.hijos = await apoderado.getHijos();
      }

      res.json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      Logger.error('Error al obtener apoderados', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener apoderado por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const apoderado = await Usuario.findOne({
        where: { id, rol: 'apoderado' },
        attributes: { exclude: ['password'] }
      });

      if (!apoderado) {
        return res.status(404).json({
          success: false,
          message: 'Apoderado no encontrado'
        });
      }

      apoderado.dataValues.hijos = await apoderado.getHijos();

      res.json({
        success: true,
        data: apoderado
      });
    } catch (error) {
      Logger.error('Error al obtener apoderado', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo apoderado
  static async create(req, res) {
    try {
      const { password, hijos = [], ...apoderadoData } = req.body;

      const existingUser = await Usuario.findByEmail(apoderadoData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con ese email'
        });
      }

      let hashedPassword = null;
      if (password) {
        const saltRounds = 12;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      const apoderado = await Usuario.create({
        ...apoderadoData,
        email: apoderadoData.email.toLowerCase(),
        password: hashedPassword,
        rol: 'apoderado'
      });

      if (hijos.length > 0) {
        for (const hijoId of hijos) {
          await Usuario.addHijo(apoderado.id, hijoId);
        }
      }

      const apoderadoCompleto = await Usuario.findByPk(apoderado.id, {
        attributes: { exclude: ['password'] }
      });
      apoderadoCompleto.dataValues.hijos = await apoderadoCompleto.getHijos();

      Logger.info('Apoderado creado exitosamente', { apoderadoId: apoderado.id });

      res.status(201).json({
        success: true,
        message: 'Apoderado creado exitosamente',
        data: apoderadoCompleto
      });
    } catch (error) {
      Logger.error('Error al crear apoderado', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar apoderado
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { password, hijos, ...updateData } = req.body;

      const apoderado = await Usuario.findOne({
        where: { id, rol: 'apoderado' }
      });

      if (!apoderado) {
        return res.status(404).json({
          success: false,
          message: 'Apoderado no encontrado'
        });
      }

      if (password) {
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      await apoderado.update(updateData);

      // Actualizar relación con hijos si se proporciona
      if (hijos && Array.isArray(hijos)) {
        // Eliminar relaciones existentes
        await ApoderadoAlumno.destroy({
          where: { apoderado_id: id }
        });

        // Crear nuevas relaciones
        for (const hijoId of hijos) {
          await Usuario.addHijo(id, hijoId);
        }
      }

      const apoderadoActualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      apoderadoActualizado.dataValues.hijos = await apoderadoActualizado.getHijos();

      Logger.info('Apoderado actualizado exitosamente', { apoderadoId: id });

      res.json({
        success: true,
        message: 'Apoderado actualizado exitosamente',
        data: apoderadoActualizado
      });
    } catch (error) {
      Logger.error('Error al actualizar apoderado', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar apoderado (soft delete)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const apoderado = await Usuario.findOne({
        where: { id, rol: 'apoderado' }
      });

      if (!apoderado) {
        return res.status(404).json({
          success: false,
          message: 'Apoderado no encontrado'
        });
      }

      await apoderado.update({ activo: false });

      Logger.info('Apoderado desactivado exitosamente', { apoderadoId: id });

      res.json({
        success: true,
        message: 'Apoderado desactivado exitosamente'
      });
    } catch (error) {
      Logger.error('Error al desactivar apoderado', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener hijos del apoderado
  static async getChildren(req, res) {
    try {
      const { id } = req.params;

      const apoderado = await Usuario.findOne({
        where: { id, rol: 'apoderado' }
      });

      if (!apoderado) {
        return res.status(404).json({
          success: false,
          message: 'Apoderado no encontrado'
        });
      }

      const hijos = await apoderado.getHijos();

      res.json({
        success: true,
        data: hijos
      });
    } catch (error) {
      Logger.error('Error al obtener hijos del apoderado', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener deudas pendientes del apoderado
  static async getPendingDebts(req, res) {
    try {
      const { id } = req.params;

      const apoderado = await Usuario.findOne({
        where: { id, rol: 'apoderado' }
      });

      if (!apoderado) {
        return res.status(404).json({
          success: false,
          message: 'Apoderado no encontrado'
        });
      }

      const pagosPendientes = await Pago.findPendientesByApoderado(id);

      // Calcular resumen
      const montoTotal = pagosPendientes.reduce((sum, pago) => sum + parseFloat(pago.monto_pagado), 0);

      res.json({
        success: true,
        data: pagosPendientes,
        summary: {
          total_deudas: pagosPendientes.length,
          monto_total: montoTotal
        }
      });
    } catch (error) {
      Logger.error('Error al obtener deudas pendientes del apoderado', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Login de apoderado
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const apoderado = await Usuario.findOne({
        where: { 
          email: email.toLowerCase(),
          rol: 'apoderado'
        }
      });

      if (!apoderado) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      if (!apoderado.activo) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada. Contacte al administrador.'
        });
      }

      if (!apoderado.password) {
        return res.status(401).json({
          success: false,
          message: 'Esta cuenta usa autenticación OAuth. Use el botón de Google.'
        });
      }

      const isValidPassword = await bcrypt.compare(password, apoderado.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      await apoderado.updateLastAccess();

      const token = jwt.sign(
        { 
          id: apoderado.id, 
          email: apoderado.email,
          rol: apoderado.rol
        },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      const { password: _, ...apoderadoResponse } = apoderado.toJSON();
      apoderadoResponse.hijos = await apoderado.getHijos();

      Logger.info('Apoderado logueado exitosamente', { apoderadoId: apoderado.id });

      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          apoderado: apoderadoResponse,
          token
        }
      });
    } catch (error) {
      Logger.error('Error en login de apoderado', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar preferencias de pago
  static async updatePaymentPreferences(req, res) {
    try {
      const { id } = req.params;
      const { preferencias_pago } = req.body;

      const apoderado = await Usuario.findOne({
        where: { id, rol: 'apoderado' }
      });

      if (!apoderado) {
        return res.status(404).json({
          success: false,
          message: 'Apoderado no encontrado'
        });
      }

      await apoderado.updatePaymentPreferences(preferencias_pago);

      Logger.info('Preferencias de pago actualizadas', { apoderadoId: id });

      res.json({
        success: true,
        message: 'Preferencias de pago actualizadas exitosamente',
        data: { preferencias_pago }
      });
    } catch (error) {
      Logger.error('Error al actualizar preferencias de pago', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Métodos para pagos
  static async createPaymentIntent(req, res) {
    try {
      const { id } = req.params;
      const { cuota_ids, alumno_id } = req.body;

      if (!cuota_ids || !Array.isArray(cuota_ids) || cuota_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos una cuota para pagar'
        });
      }

      const PaymentService = require('../services/paymentService');
      const paymentIntent = await PaymentService.createPaymentIntent(id, cuota_ids, alumno_id);

      Logger.info('Payment Intent creado para apoderado', {
        apoderadoId: id,
        cuotaIds: cuota_ids,
        paymentIntentId: paymentIntent.payment_intent_id
      });

      res.json({
        success: true,
        message: 'Intención de pago creada exitosamente',
        data: paymentIntent
      });
    } catch (error) {
      Logger.error('Error al crear intención de pago', {
        error: error.message,
        apoderadoId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  static async confirmPayment(req, res) {
    try {
      const { payment_intent_id } = req.body;

      if (!payment_intent_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de intención de pago es requerido'
        });
      }

      const PaymentService = require('../services/paymentService');
      const result = await PaymentService.confirmPayment(payment_intent_id);

      Logger.info('Pago confirmado exitosamente', {
        apoderadoId: req.params.id,
        paymentIntentId: payment_intent_id
      });

      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        data: result
      });
    } catch (error) {
      Logger.error('Error al confirmar pago', {
        error: error.message,
        apoderadoId: req.params.id
      });
      res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: error.message
      });
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      const PaymentService = require('../services/paymentService');
      const historialPagos = await PaymentService.getPaymentHistory(id, limit);

      res.json({
        success: true,
        data: historialPagos
      });
    } catch (error) {
      Logger.error('Error al obtener historial de pagos', { error: error.message, id: req.params.id });
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = ApoderadoController;

