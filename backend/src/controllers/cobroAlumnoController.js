// controllers/cobroAlumnoController.js
const CobroAlumnoService = require('../services/cobroAlumnoService');
const ResponseHelper = require('../utils/responseHelper');
const { validateData, cobroAlumnoValidator } = require('../utils/validators');
const Logger = require('../utils/logger');

/** Normaliza query: soporta ?params=JSON, alias y tipos */
function normQuery(req) {
  const q = { ...req.query };

  // ?params=<json>
  if (typeof q.params === 'string') {
    try { Object.assign(q, JSON.parse(q.params)); } catch {}
  }

  // alias camel -> snake
  if (q.cursoId && !q.curso_id) q.curso_id = q.cursoId;
  if (q.alumnoId && !q.alumno_id) q.alumno_id = q.alumnoId;

  // tipos
  q.page  = Number.isFinite(Number(q.page))  ? parseInt(q.page, 10)  : 1;
  q.limit = Number.isFinite(Number(q.limit)) ? parseInt(q.limit, 10) : 10;
  if (q.curso_id  !== undefined) q.curso_id  = parseInt(q.curso_id, 10);
  if (q.alumno_id !== undefined) q.alumno_id = parseInt(q.alumno_id, 10);
  if (q.estado) q.estado = String(q.estado).toLowerCase().trim(); // pendiente|pagado|anulado
  if (q.search) q.search = String(q.search).trim();
  if (q.fecha_desde) q.fecha_desde = String(q.fecha_desde);
  if (q.fecha_hasta) q.fecha_hasta = String(q.fecha_hasta);

  return q;
}

class CobroAlumnoController {
  /** ================== CREAR ================== */
  static async create(req, res) {
    try {
      // Permite tomar IDs desde la ruta si existen (p.ej. /cursos/:cursoId/alumnos/:alumnoId/cobros)
      const alumnoIdRuta = req.params?.alumnoId ?? req.params?.alumno_id;
      const cursoIdRuta  = req.params?.cursoId ?? req.params?.curso_id;

      const body = {
        ...req.body,
        alumno_id: req.body?.alumno_id ?? (alumnoIdRuta ? parseInt(alumnoIdRuta, 10) : undefined),
        curso_id:  req.body?.curso_id  ?? (cursoIdRuta  ? parseInt(cursoIdRuta, 10)  : undefined),
      };

      const { isValid, errors, data } = validateData(cobroAlumnoValidator, body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      if (!data.alumno_id) {
        return ResponseHelper.validationError(res, [{ field: 'alumno_id', message: 'Requerido' }]);
      }
      if (!data.curso_id) {
        return ResponseHelper.validationError(res, [{ field: 'curso_id', message: 'Requerido' }]);
      }
      const montoNum = Number(data.monto);
      if (!(montoNum > 0)) {
        return ResponseHelper.validationError(res, [{ field: 'monto', message: 'Monto inválido' }]);
      }

      const userId = req.user?.id || 'system';
      const cobro = await CobroAlumnoService.create({
        ...data,
        concepto: (data.concepto ?? null),
        monto: montoNum,
      }, userId);

      Logger.info('Cobro de alumno creado', { cobroId: cobro.id, userId });
      return ResponseHelper.created(res, cobro, 'Cobro de alumno creado exitosamente');
    } catch (error) {
      Logger.error('create cobro alumno', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** ================== LISTAR / CONSULTAS ================== */
  // GET ?page=&limit=&curso_id/cursoId=&alumno_id/alumnoId=&estado=&search=
  static async getAll(req, res) {
    try {
      const q = normQuery(req);
      const options = {
        page: q.page,
        limit: q.limit,
        curso_id: q.curso_id,
        alumno_id: q.alumno_id,
        estado: q.estado,         // 'pendiente' | 'pagado' | 'anulado'
        search: q.search || '',   // por concepto / rut / nombre
      };
      const result = await CobroAlumnoService.findAll(options);
      return ResponseHelper.paginated(res, result.items, result.pagination);
    } catch (error) {
      Logger.error('getAll cobros alumnos', { error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getById(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const cobro = await CobroAlumnoService.findById(id);
      if (!cobro) return ResponseHelper.notFound(res, 'Cobro de alumno');
      return ResponseHelper.success(res, cobro);
    } catch (error) {
      Logger.error('getById cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getByCurso(req, res) {
    try {
      const cursoId = parseInt(req.params.cursoId ?? req.params.curso_id, 10);
      const cobros = await CobroAlumnoService.findByCurso(cursoId);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('getByCurso cobro alumno', { cursoId: req.params.cursoId, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getByAlumno(req, res) {
    try {
      const alumnoId = parseInt(req.params.alumnoId ?? req.params.alumno_id, 10);
      const cobros = await CobroAlumnoService.findByAlumno(alumnoId);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('getByAlumno cobro alumno', { alumnoId: req.params.alumnoId, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  // Hijos de un cobro padre
  static async getByParent(req, res) {
    try {
      const cobroId = parseInt(req.params.cobroId, 10);
      const cobros = await CobroAlumnoService.findByParentCobro(cobroId);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('getByParent cobro alumno', { cobroId: req.params.cobroId, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getPendientes(req, res) {
    try {
      const q = normQuery(req);
      const filters = {
        curso_id: q.curso_id,
        alumno_id: q.alumno_id,
      };
      const cobros = await CobroAlumnoService.findPendientes(filters);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('getPendientes cobro alumno', { error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async searchByConcepto(req, res) {
    try {
      const q = normQuery(req);
      const concepto = (q.concepto || '').trim();
      if (concepto.length < 2) {
        return ResponseHelper.validationError(res, [
          { field: 'concepto', message: 'El concepto debe tener al menos 2 caracteres' },
        ]);
      }
      const cobros = await CobroAlumnoService.findByConcepto(concepto);
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('searchByConcepto cobro alumno', { error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** ================== UPDATE (solo pendientes) ================== */
  static async update(req, res) {
    try {
      const id = parseInt(req.params.id, 10);

      // Permite conservar alumno_id/curso_id si vienen por ruta y no en body
      const alumnoIdRuta = req.params?.alumnoId ?? req.params?.alumno_id;
      const cursoIdRuta  = req.params?.cursoId ?? req.params?.curso_id;

      const body = {
        ...req.body,
        alumno_id: req.body?.alumno_id ?? (alumnoIdRuta ? parseInt(alumnoIdRuta, 10) : undefined),
        curso_id:  req.body?.curso_id  ?? (cursoIdRuta  ? parseInt(cursoIdRuta, 10)  : undefined),
      };

      const { isValid, errors, data } = validateData(cobroAlumnoValidator, body);
      if (!isValid) return ResponseHelper.validationError(res, errors);

      if (data.monto !== undefined) {
        const montoNum = Number(data.monto);
        if (!(montoNum > 0)) {
          return ResponseHelper.validationError(res, [{ field: 'monto', message: 'Monto inválido' }]);
        }
        data.monto = montoNum;
      }

      const userId = req.user?.id || 'system';
      const cobro = await CobroAlumnoService.update(id, data, userId);
      if (!cobro) return ResponseHelper.notFound(res, 'Cobro de alumno');

      Logger.info('Cobro alumno actualizado', { id, userId });
      return ResponseHelper.updated(res, cobro, 'Cobro de alumno actualizado exitosamente');
    } catch (error) {
      Logger.error('update cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** ================== PAGO / REVERSION / ANULACIÓN ================== */
  static async registrarPago(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { monto, metodo_pago, transaccion_id, fecha_pago } = req.body || {};
      const montoNum = Number(monto);
      if (!(montoNum > 0)) {
        return ResponseHelper.validationError(res, [{ field: 'monto', message: 'Monto inválido' }]);
      }

      const userId = req.user?.id || 'system';
      const result = await CobroAlumnoService.registrarPago(
        id,
        {
          monto: montoNum,
          metodo_pago: metodo_pago || null,
          transaccion_id: transaccion_id || null,
          fecha_pago: fecha_pago || null,
        },
        userId
      );

      if (!result) return ResponseHelper.notFound(res, 'Cobro de alumno');
      return ResponseHelper.success(res, result, 'Pago registrado');
    } catch (error) {
      Logger.error('registrarPago cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async revertirPago(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id || 'system';
      const result = await CobroAlumnoService.revertirPago(id, userId);
      if (!result) return ResponseHelper.notFound(res, 'Cobro de alumno');
      return ResponseHelper.success(res, result, 'Pago revertido');
    } catch (error) {
      Logger.error('revertirPago cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async anular(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id || 'system';
      const { motivo } = req.body || {};
      const result = await CobroAlumnoService.anular(id, { motivo: motivo || null }, userId);
      if (!result) return ResponseHelper.notFound(res, 'Cobro de alumno');
      return ResponseHelper.success(res, result, 'Cobro anulado');
    } catch (error) {
      Logger.error('anular cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async reasignarAlumno(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { nuevo_alumno_id } = req.body || {};
      if (!nuevo_alumno_id) {
        return ResponseHelper.validationError(res, [{ field: 'nuevo_alumno_id', message: 'Requerido' }]);
      }
      const userId = req.user?.id || 'system';
      const result = await CobroAlumnoService.reasignarAlumno(id, parseInt(nuevo_alumno_id, 10), userId);
      if (!result) return ResponseHelper.notFound(res, 'Cobro de alumno');
      return ResponseHelper.success(res, result, 'Cobro reasignado');
    } catch (error) {
      Logger.error('reasignarAlumno cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** ================== DELETE / RESTORE ================== */
  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.id || 'system';

      const blocked = await CobroAlumnoService.isPaid(id);
      if (blocked) return ResponseHelper.conflict(res, 'No se puede eliminar: el cobro está pagado');

      const deleted = await CobroAlumnoService.delete(id, userId);
      if (!deleted) return ResponseHelper.notFound(res, 'Cobro de alumno');

      Logger.info('Cobro alumno eliminado', { id, userId });
      return ResponseHelper.deleted(res, 'Cobro de alumno eliminado exitosamente');
    } catch (error) {
      Logger.error('delete cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async restore(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const restored = await CobroAlumnoService.restore(id);
      if (!restored) return ResponseHelper.notFound(res, 'Cobro de alumno eliminado');
      Logger.info('Cobro alumno restaurado', { id });
      return ResponseHelper.success(res, null, 'Cobro de alumno restaurado exitosamente');
    } catch (error) {
      Logger.error('restore cobro alumno', { id: req.params.id, error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** ================== MÉTRICAS ================== */
  static async getTotalByCurso(req, res) {
    try {
      const cursoId = parseInt(req.params.cursoId ?? req.params.curso_id, 10);
      const total = await CobroAlumnoService.getTotalByCurso(cursoId);
      return ResponseHelper.success(res, { total });
    } catch (error) {
      Logger.error('getTotalByCurso cobro alumno', { cursoId: req.params.cursoId, error: error.message });
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
      const estadisticas = await CobroAlumnoService.getEstadisticas(filters);
      return ResponseHelper.success(res, estadisticas);
    } catch (error) {
      Logger.error('getEstadisticas cobro alumno', { error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  static async getGroupedByCurso(req, res) {
    try {
      const cobros = await CobroAlumnoService.getGroupedByCurso();
      return ResponseHelper.success(res, cobros);
    } catch (error) {
      Logger.error('getGroupedByCurso cobro alumno', { error: error.message });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }

  /** ================== BULK ================== */
  static async createBulk(req, res) {
    try {
      const cursoId = parseInt(req.params.cursoId ?? req.params.curso_id, 10);
      const { cobros } = req.body || {};
      if (!Array.isArray(cobros) || cobros.length === 0) {
        return ResponseHelper.validationError(res, [
          { field: 'cobros', message: 'Se debe proporcionar un array de cobros' },
        ]);
      }

      for (let i = 0; i < cobros.length; i++) {
        const c = cobros[i] || {};
        if (!c.alumno_id) {
          return ResponseHelper.validationError(res, [{ field: `cobros[${i}].alumno_id`, message: 'Requerido' }]);
        }
        const montoNum = Number(c.monto);
        if (!(montoNum > 0)) {
          return ResponseHelper.validationError(res, [{ field: `cobros[${i}].monto`, message: 'Monto inválido' }]);
        }
        // Si no viene curso_id en cada item, usa el de la ruta
        if (!c.curso_id && cursoId) c.curso_id = cursoId;
      }

      const userId = req.user?.id || 'system';
      const creados = await CobroAlumnoService.createBulk(cursoId, cobros, userId);

      Logger.info('createBulk cobros alumnos', { cursoId, cantidad: creados.length, userId });
      return ResponseHelper.created(res, creados, `${creados.length} cobros creados exitosamente`);
    } catch (error) {
      Logger.error('createBulk cobros alumnos', { cursoId: req.params.cursoId, error: error.message, stack: error.stack });
      return ResponseHelper.error(res, 'Error interno del servidor');
    }
  }
}

module.exports = CobroAlumnoController;
