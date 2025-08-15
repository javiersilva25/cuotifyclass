// src/services/tesoreroService.js
const { Tesorero, Curso, Usuario } = require('../models');
const { addCreateAudit, addUpdateAudit } = require('../utils/auditFields');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const TESORERO_INCLUDE = [
  { model: Curso, as: 'curso', attributes: ['id', 'nombre_curso', 'nivel_id', 'ano_escolar'] },
  { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'apellido', 'email'] },
];

class TesoreroService {
  // ---------------- CRUD base ----------------
  static async create(tesoreroData, userId) {
    return Tesorero.create({ ...tesoreroData, ...addCreateAudit(userId) });
  }

  static async findAll({ page = 1, limit = 10, activo, curso_id, usuario_id } = {}) {
    const where = {};
    if (activo !== undefined) where.activo = (activo === true || activo === 'true');
    if (curso_id) where.curso_id = curso_id;
    if (usuario_id) where.usuario_id = usuario_id;

    const { count, rows } = await Tesorero.findAndCountAll({
      where,
      include: TESORERO_INCLUDE,
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['fecha_asignacion', 'DESC']],
    });

    return {
      tesoreros: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    };
  }

  static async findById(id) {
    return Tesorero.findByPk(id, { include: TESORERO_INCLUDE });
  }

  static async findByUsuario(usuarioId) {
    return Tesorero.findByUsuario(usuarioId); // método del modelo
  }

  static async findByCurso(cursoId) {
    return Tesorero.findByCurso(cursoId); // método del modelo
  }

  static async isTesorero(usuarioId) {
    return Tesorero.isTesorero(usuarioId);
  }

  static async canAccessCourse(usuarioId, cursoId) {
    return Tesorero.canAccessCourse(usuarioId, cursoId);
  }

  static async getCursoAsignado(usuarioId) {
    return Tesorero.getCursoAsignado(usuarioId);
  }

  static async isCursoDisponible(cursoId, excludeTesoreroId = null) {
    return Tesorero.isCursoDisponible(cursoId, excludeTesoreroId);
  }

  static async isUsuarioDisponible(usuarioId, excludeTesoreroId = null) {
    return Tesorero.isUsuarioDisponible(usuarioId, excludeTesoreroId);
  }

  static async update(id, updateData, userId) {
    const tesorero = await Tesorero.findByPk(id);
    if (!tesorero) return null;
    await tesorero.update({ ...updateData, ...addUpdateAudit(userId) });
    return this.findById(id);
  }

  static async deactivate(id, userId) {
    const t = await Tesorero.findByPk(id);
    if (!t) return false;
    await t.deactivate(userId);
    return true;
  }

  static async activate(id, userId) {
    const t = await Tesorero.findByPk(id);
    if (!t) return false;
    await t.activate(userId);
    return true;
  }

  static async delete(id, userId) {
    const t = await Tesorero.findByPk(id);
    if (!t) return false;
    await t.softDelete(userId);
    return true;
  }

  static async findActive() {
    return Tesorero.findActive();
  }

  static async getEstadisticas() {
    return Tesorero.getEstadisticas();
  }

  // ---------------- Utilidades admin ----------------
  static async asignarTesoreroCurso(usuarioId, cursoId, createdBy) {
    const [cursoDisponible, usuarioDisponible] = await Promise.all([
      this.isCursoDisponible(cursoId),
      this.isUsuarioDisponible(usuarioId),
    ]);
    if (!cursoDisponible) throw new Error('El curso ya tiene un tesorero asignado');
    if (!usuarioDisponible) throw new Error('El usuario ya es tesorero de otro curso');

    return this.create({ usuario_id: usuarioId, curso_id: cursoId, activo: true }, createdBy);
  }

  static async reasignarTesoreroCurso(cursoId, nuevoUsuarioId, userId) {
    const actual = await this.findByCurso(cursoId);
    if (actual) await this.deactivate(actual.id, userId);
    return this.asignarTesoreroCurso(nuevoUsuarioId, cursoId, userId);
  }

  static async getCursosSinTesorero() {
    const cursoIdsConTesorero = (await Tesorero.findAll({
      where: { activo: true },
      attributes: ['curso_id'],
    })).map(t => t.curso_id);

    return Curso.findAll({
      where: { id: { [Op.notIn]: cursoIdsConTesorero } },
      attributes: ['id', 'nombre_curso', 'nivel_id', 'ano_escolar'],
      order: [['nombre_curso', 'ASC']],
    });
  }

  static async getUsuariosDisponibles() {
    const usuarioIdsTesoreros = (await Tesorero.findAll({
      where: { activo: true },
      attributes: ['usuario_id'],
    })).map(t => t.usuario_id);

    return Usuario.findAll({
      where: { id: { [Op.notIn]: usuarioIdsTesoreros }, activo: true },
      attributes: ['id', 'nombre', 'apellido', 'email'],
      order: [['nombre', 'ASC'], ['apellido', 'ASC']],
    });
  }

  // ---------------- Métodos para Dashboard Tesorero ----------------
  /** KPIs del curso (alumnos, recaudado, deudas, eficiencia) */
  // KPIs del curso con SUM y COUNT consistentes
  static async getIndicadoresCurso(cursoId) {
    const [rows] = await sequelize.query(
      `
      SELECT
        (SELECT COUNT(*) FROM alumnos a WHERE a.curso_id = :cursoId) AS total_alumnos,

        COALESCE(SUM(COALESCE(ca.monto_pagado,0)),0) AS total_recaudado,

        COALESCE(SUM(
          CASE WHEN (COALESCE(ca.monto,0) - COALESCE(ca.monto_pagado,0)) > 0
              THEN (COALESCE(ca.monto,0) - COALESCE(ca.monto_pagado,0))
              ELSE 0 END
        ),0) AS deudas_pendientes,

        SUM(CASE WHEN COALESCE(ca.monto_pagado,0) > 0 THEN 1 ELSE 0 END) AS total_pagos,

        SUM(CASE
              WHEN ca.estado IN ('pendiente','parcial')
              AND (COALESCE(ca.monto,0) - COALESCE(ca.monto_pagado,0)) > 0
              THEN 1 ELSE 0
            END) AS total_deudas,

        CASE WHEN COALESCE(SUM(ca.monto),0) > 0
            THEN ROUND(100 * SUM(COALESCE(ca.monto_pagado,0)) / SUM(ca.monto), 2)
            ELSE 0 END AS eficiencia_cobro
      FROM cobros_alumnos ca
      WHERE ca.curso_id = :cursoId;
      `,
      { replacements: { cursoId } }
    );
    return rows?.[0] ?? {
      total_alumnos: 0, total_recaudado: 0, deudas_pendientes: 0,
      total_pagos: 0, total_deudas: 0, eficiencia_cobro: 0
    };
  }


  /** Cobros pendientes del curso (sin depender de ca.cobro_id) */
  static async getCobrosPendientesCurso(cursoId) {
    const [rows] = await sequelize.query(
      `
      SELECT
        ca.id,
        ca.numero_comprobante,
        ca.concepto,
        ca.monto,
        ca.monto_pagado,
        ca.estado,
        ca.fecha_emision,
        ca.fecha_vencimiento,
        a.id   AS alumno_id,
        CONCAT(a.nombres, ' ', a.apellido_paterno) AS alumno_nombre
      FROM cobros_alumnos ca
      JOIN alumnos a ON a.id = ca.alumno_id AND a.curso_id = :cursoId
      LEFT JOIN cobros c ON c.id = ca.cobro_id    -- left join, por si cobro_id es NULL
      WHERE ca.curso_id = :cursoId
        AND ca.estado IN ('pendiente','parcial')
      ORDER BY ca.fecha_vencimiento ASC, ca.id ASC;
      `,
      { replacements: { cursoId } }
    );
    return rows;
  }

  /** Cobros de un alumno del curso (pendientes + parciales) */
  static async getCobrosAlumnoPendientes(alumnoId, cursoId) {
    const [rows] = await sequelize.query(
      `
      SELECT
        ca.id,
        ca.numero_comprobante,
        ca.concepto,
        ca.monto,
        ca.monto_pagado,
        ca.estado,
        ca.fecha_emision,
        ca.fecha_vencimiento
      FROM cobros_alumnos ca
      WHERE ca.alumno_id = :alumnoId
        AND ca.curso_id  = :cursoId
        AND ca.estado IN ('pendiente','parcial')
      ORDER BY ca.fecha_vencimiento ASC, ca.id ASC;
      `,
      { replacements: { alumnoId, cursoId } }
    );
    return rows;
  }
  // Al inicio ya tienes sequelize importado

// Cobros pendientes/parciales por alumno
  static async getCobrosAlumnoPendientes(alumnoId, cursoId) {
    const [rows] = await sequelize.query(`
      SELECT ca.id, ca.numero_comprobante, ca.concepto, ca.monto, ca.monto_pagado,
            ca.estado, ca.fecha_emision, ca.fecha_vencimiento
      FROM cobros_alumnos ca
      WHERE ca.alumno_id = :alumnoId
        AND ca.curso_id  = :cursoId
        AND ca.estado IN ('pendiente','parcial')
      ORDER BY ca.fecha_vencimiento ASC, ca.id ASC
    `, { replacements: { alumnoId, cursoId }});
    return rows;
  }

  // Resumen financiero por alumno
  static async getResumenAlumno(alumnoId, cursoId) {
    const [r] = await sequelize.query(`
      SELECT
        COALESCE(SUM(ca.monto),0)                                     AS monto_total,
        COALESCE(SUM(COALESCE(ca.monto_pagado,0)),0)                  AS monto_pagado,
        COALESCE(SUM(ca.monto - COALESCE(ca.monto_pagado,0)),0)       AS deuda_total,
        SUM(CASE WHEN ca.estado IN ('pendiente','parcial')
                AND (ca.monto - COALESCE(ca.monto_pagado,0)) > 0
                THEN 1 ELSE 0 END)                                   AS items_pendientes
      FROM cobros_alumnos ca
      WHERE ca.alumno_id = :alumnoId AND ca.curso_id = :cursoId
    `, { replacements: { alumnoId, cursoId }});
    return r?.[0] ?? { monto_total:0, monto_pagado:0, deuda_total:0, items_pendientes:0 };
  }

}

module.exports = TesoreroService;
