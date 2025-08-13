// controllers/cobroController.js
const CobroService = require('../services/cobroService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, cobroValidator } = require('../utils/validators');
const Logger = require('../utils/logger');
const { sequelize } = require('../config/database');

/** Normaliza query: acepta ?params=JSON, alias y tipos */
function normQuery(req) {
  const q = { ...req.query };
  if (typeof q.params === 'string') {
    try { Object.assign(q, JSON.parse(q.params)); } catch (_) {}
  }
  // alias
  if (q.cursoId && !q.curso_id) q.curso_id = q.cursoId;
  if (q.fechaDesde && !q.fecha_desde) q.fecha_desde = q.fechaDesde;
  if (q.fechaHasta && !q.fecha_hasta) q.fecha_hasta = q.fechaHasta;
  if (q.vencidos !== undefined && q.vencidos_only === undefined)
    q.vencidos_only = q.vencidos;

  // tipos
  q.page  = parseInt(q.page ?? 1, 10);
  q.limit = parseInt(q.limit ?? 10, 10);
  if (q.curso_id !== undefined) q.curso_id = parseInt(q.curso_id, 10);
  if (q.vencidos_only !== undefined)
    q.vencidos_only = String(q.vencidos_only).toLowerCase() === 'true';

  return q;
}

class CobroController {
  /** Crear cobro por curso + fan-out a cobros_alumnos */
  static async create(req, res) {
    try {
      const { isValid, errors, data } = validateData(cobroValidator, req.body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      const userId = req.user?.id || 'system';
      const cobro = await CobroService.create(data, userId); // { id, curso_id, ... }

      const t = await sequelize.transaction();
      try {
        const [alumnos] = await sequelize.query(
          `SELECT id FROM alumnos WHERE curso_id = :curso_id`,
          { replacements: { curso_id: cobro.curso_id }, transaction: t }
        );

        let creados = 0;
        if (alumnos.length > 0) {
          const values = alumnos
            .map((a, i) =>
              `( :cobro_id, :alumno_id_${i}, :curso_id, :concepto, :monto, :fv, 'pendiente', :user, NOW())`
            ).join(',');

          const replacements = {
            cobro_id: cobro.id,
            curso_id: cobro.curso_id,
            concepto: cobro.concepto,
            monto: cobro.monto_total,
            fv: cobro.fecha_vencimiento || null,
            user: userId,
          };
          alumnos.forEach((a, i) => (replacements[`alumno_id_${i}`] = a.id));

          await sequelize.query(
            `INSERT INTO cobros_alumnos
              (cobro_id, alumno_id, curso_id, concepto, monto, fecha_vencimiento, estado, creado_por, fecha_creacion)
             VALUES ${values}`,
            { replacements, transaction: t }
          );
          creados = alumnos.length;
        }

        await t.commit();
        Logger.info('Cobro por curso creado y fan-out aplicado', {
          cobroId: cobro.id, cursoId: cobro.curso_id, items_creados: creados, userId,
        });

        return ResponseHelper.created(res, { ...cobro, items_creados: creados }, 'Cobro creado exitosamente');
      } catch (fanoutErr) {
        await t.rollback();
        Logger.error('Error en fan-out de cobros_alumnos', {
          cobroId: cobro?.id, error: fanoutErr.message, stack: fanoutErr.stack,
        });
        return ResponseHelper.error(res, 'Error al generar cobros por alumno');
      }
    } catch (error) {
      Logger.error('Error al crear cobro', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** Listado (padres) con filtros */
  static async getAll(req, res) {
    try {
      const q = normQuery(req);
      const options = {
        page: q.page,
        limit: q.limit,
        curso_id: q.curso_id,
        fecha_desde: q.fecha_desde,
        fecha_hasta: q.fecha_hasta,
        vencidos_only: q.vencidos_only,
      };
      const result = await CobroService.findAll(options);
      return ResponseHelper.paginated(res, result.cobros, result.pagination);
    } catch (error) {
      Logger.error('Error al obtener cobros', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** Detalle */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const cobro = await CobroService.findById(id);
      if (!cobro) return ResponseHelper.notFound(res, 'Cobro');
      return ResponseHelper.success(res, cobro);
    } catch (error) {
      Logger.error('Error al obtener cobro', { cobroId: req.params.id, error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** Por curso */
  static async getByCurso(req, res) {
    try {
      const cursoId = req.params.cursoId ?? req.params.curso_id;
      const cobros = await CobroService.findByCurso(cursoId);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros por curso', { cursoId: req.params.cursoId, error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getVencidos(req, res) {
    try {
      const cobros = await CobroService.findVencidos();
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros vencidos', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getProximosAVencer(req, res) {
    try {
      const dias = parseInt(req.query.dias, 10) || 7;
      const cobros = await CobroService.findProximosAVencer(dias);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros próximos a vencer', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getByDateRange(req, res) {
    try {
      const q = normQuery(req);
      if (!q.fecha_inicio || !q.fecha_fin) {
        return ResponseHelper.validationError(res, [
          { field: 'fecha_inicio', message: 'La fecha de inicio es requerida' },
          { field: 'fecha_fin', message: 'La fecha de fin es requerida' },
        ]);
      }
      const cobros = await CobroService.findByDateRange(q.fecha_inicio, q.fecha_fin);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('Error al obtener cobros por rango de fechas', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** Update */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { isValid, errors, data } = validateData(cobroValidator, req.body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      const userId = req.user?.id || 'system';
      const cobro = await CobroService.update(id, data, userId);
      if (!cobro) return ResponseHelper.notFound(res, 'Cobro');

      Logger.info('Cobro actualizado exitosamente', { cobroId: id, userId });
      return ResponseHelper.updated(res, cobro, 'Cobro actualizado exitosamente');
    } catch (error) {
      Logger.error('Error al actualizar cobro', { cobroId: req.params.id, error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** Delete (valida pagos) */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'system';

      const [rows] = await sequelize.query(
        `SELECT COUNT(*) AS cnt FROM cobros_alumnos WHERE cobro_id = :id AND estado = 'pagado'`,
        { replacements: { id } }
      );
      const cnt = Number(rows?.[0]?.cnt ?? 0);
      if (cnt > 0) {
        return ResponseHelper.conflict(res, 'No se puede eliminar: existen pagos asociados a este cobro');
      }

      const deleted = await CobroService.delete(id, userId);
      if (!deleted) return ResponseHelper.notFound(res, 'Cobro');

      Logger.info('Cobro eliminado exitosamente', { cobroId: id, userId });
      return ResponseHelper.deleted(res, 'Cobro eliminado exitosamente');
    } catch (error) {
      Logger.error('Error al eliminar cobro', { cobroId: req.params.id, error: error.message, stack: error.stack });
      if (error.message?.includes('deudas asociadas')) {
        return ResponseHelper.conflict(res, error.message);
      }
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async restore(req, res) {
    try {
      const { id } = req.params;
      const restored = await CobroService.restore(id);
      if (!restored) return ResponseHelper.notFound(res, 'Cobro eliminado');

      Logger.info('Cobro restaurado exitosamente', { cobroId: id });
      return ResponseHelper.success(res, null, 'Cobro restaurado exitosamente');
    } catch (error) {
      Logger.error('Error al restaurar cobro', { cobroId: req.params.id, error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getTotalByCurso(req, res) {
    try {
      const cursoId = req.params.cursoId ?? req.params.curso_id;
      const total = await CobroService.getTotalByCurso(cursoId);
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('Error al obtener total de cobros por curso', { cursoId: req.params.cursoId, error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getEstadisticas(req, res) {
    try {
      const q = normQuery(req);
      const filters = {
        curso_id: q.curso_id,
        fecha_desde: q.fecha_desde,
        fecha_hasta: q.fecha_hasta,
      };
      const estadisticas = await CobroService.getEstadisticas(filters);
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('Error al obtener estadísticas de cobros', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = CobroController;
