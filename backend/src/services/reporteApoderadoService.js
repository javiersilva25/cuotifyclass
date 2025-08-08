const { Sequelize, Op } = require('sequelize');
const { 
  Usuario, 
  Alumno, 
  Curso, 
  DeudaAlumno, 
  Pago, 
  CuentaCurso, 
  MovimientoCuenta,
  TipoCuenta 
} = require('../models');

class ReporteApoderadoService {
  
  /**
   * Obtiene métricas rápidas del apoderado para el mes actual
   */
  async getMetricasRapidas(apoderadoId) {
    try {
      // Verificar que el apoderado existe
      const apoderado = await Usuario.findByPk(apoderadoId);
      if (!apoderado) {
        throw new Error('Apoderado no encontrado');
      }

      // Obtener hijos del apoderado
      const hijos = await Alumno.findAll({
        include: [{
          model: Usuario,
          as: 'apoderado',
          where: { id: apoderadoId }
        }]
      });

      if (hijos.length === 0) {
        return {
          mes_actual: {
            total_pagado: 0,
            total_pendiente: 0,
            cantidad_hijos: 0
          },
          estado_general: {
            cumplimiento: 0
          }
        };
      }

      const hijosIds = hijos.map(h => h.id);
      const fechaInicioMes = new Date();
      fechaInicioMes.setDate(1);
      fechaInicioMes.setHours(0, 0, 0, 0);

      // Calcular total pagado en el mes
      const pagosMes = await Pago.findAll({
        include: [{
          model: DeudaAlumno,
          where: { alumno_id: { [Op.in]: hijosIds } }
        }],
        where: {
          fecha_pago: { [Op.gte]: fechaInicioMes },
          estado: 'pagado'
        }
      });

      const totalPagado = pagosMes.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);

      // Calcular total pendiente
      const deudasPendientes = await DeudaAlumno.findAll({
        where: {
          alumno_id: { [Op.in]: hijosIds },
          estado: 'pendiente'
        }
      });

      const totalPendiente = deudasPendientes.reduce((sum, deuda) => sum + parseFloat(deuda.monto), 0);

      // Calcular cumplimiento
      const totalDeudas = totalPagado + totalPendiente;
      const cumplimiento = totalDeudas > 0 ? Math.round((totalPagado / totalDeudas) * 100) : 100;

      return {
        mes_actual: {
          total_pagado: totalPagado,
          total_pendiente: totalPendiente,
          cantidad_hijos: hijos.length
        },
        estado_general: {
          cumplimiento: cumplimiento
        }
      };

    } catch (error) {
      console.error('Error en getMetricasRapidas:', error);
      throw error;
    }
  }

  /**
   * Obtiene actividades disponibles para reportes
   */
  async getActividadesDisponibles(apoderadoId) {
    try {
      // Obtener cursos de los hijos del apoderado
      const hijos = await Alumno.findAll({
        include: [{
          model: Usuario,
          as: 'apoderado',
          where: { id: apoderadoId }
        }, {
          model: Curso,
          as: 'curso'
        }]
      });

      const cursosIds = [...new Set(hijos.map(h => h.curso_id))];

      // Obtener tipos de cuenta como "actividades"
      const tiposActividad = await TipoCuenta.findAll({
        where: {
          nombre: { [Op.in]: ['Actividades', 'Ayuda Social', 'Eventos'] }
        }
      });

      // Obtener cuentas de estos tipos en los cursos del apoderado
      const cuentasActividades = await CuentaCurso.findAll({
        where: {
          curso_id: { [Op.in]: cursosIds },
          tipo_cuenta_id: { [Op.in]: tiposActividad.map(t => t.id) }
        },
        include: [{
          model: TipoCuenta,
          as: 'tipoCuenta'
        }, {
          model: Curso,
          as: 'curso'
        }]
      });

      return cuentasActividades.map(cuenta => ({
        id: cuenta.id,
        nombre: `${cuenta.tipoCuenta.nombre} - ${cuenta.curso.nombre}`,
        tipo: cuenta.tipoCuenta.nombre,
        curso: cuenta.curso.nombre
      }));

    } catch (error) {
      console.error('Error en getActividadesDisponibles:', error);
      throw error;
    }
  }

  /**
   * Genera resumen general del apoderado
   */
  async getResumenGeneral(apoderadoId) {
    try {
      const hijos = await Alumno.findAll({
        include: [{
          model: Usuario,
          as: 'apoderado',
          where: { id: apoderadoId }
        }, {
          model: Curso,
          as: 'curso'
        }]
      });

      if (hijos.length === 0) {
        return {
          resumen_consolidado: {
            total_pagado: 0,
            total_pendiente: 0,
            promedio_por_hijo: 0
          },
          distribucion_global: [],
          tendencias: {
            porcentaje_completitud: 0,
            recomendacion: 'No hay datos disponibles'
          }
        };
      }

      const hijosIds = hijos.map(h => h.id);
      const cursosIds = [...new Set(hijos.map(h => h.curso_id))];

      // Calcular totales
      const pagosRealizados = await Pago.findAll({
        include: [{
          model: DeudaAlumno,
          where: { alumno_id: { [Op.in]: hijosIds } }
        }],
        where: { estado: 'pagado' }
      });

      const deudasPendientes = await DeudaAlumno.findAll({
        where: {
          alumno_id: { [Op.in]: hijosIds },
          estado: 'pendiente'
        }
      });

      const totalPagado = pagosRealizados.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
      const totalPendiente = deudasPendientes.reduce((sum, deuda) => sum + parseFloat(deuda.monto), 0);
      const promedioHijo = hijos.length > 0 ? totalPagado / hijos.length : 0;

      // Obtener distribución por cuenta
      const cuentasCurso = await CuentaCurso.findAll({
        where: { curso_id: { [Op.in]: cursosIds } },
        include: [{
          model: TipoCuenta,
          as: 'tipoCuenta'
        }]
      });

      const distribucionGlobal = await Promise.all(
        cuentasCurso.map(async (cuenta) => {
          const movimientos = await MovimientoCuenta.findAll({
            where: {
              cuenta_id: cuenta.id,
              tipo: 'ingreso'
            }
          });

          const monto = movimientos.reduce((sum, mov) => sum + parseFloat(mov.monto), 0);
          const porcentaje = totalPagado > 0 ? Math.round((monto / totalPagado) * 100) : 0;

          return {
            cuenta: cuenta.tipoCuenta.nombre,
            monto: monto,
            porcentaje: porcentaje,
            color: this.getColorByCuentaTipo(cuenta.tipoCuenta.nombre)
          };
        })
      );

      // Calcular tendencias
      const totalDeudas = totalPagado + totalPendiente;
      const porcentajeCompletitud = totalDeudas > 0 ? Math.round((totalPagado / totalDeudas) * 100) : 100;
      
      let recomendacion = 'Mantener el ritmo de pagos actual';
      if (porcentajeCompletitud < 50) {
        recomendacion = 'Se recomienda ponerse al día con los pagos pendientes';
      } else if (porcentajeCompletitud > 90) {
        recomendacion = 'Excelente cumplimiento de pagos';
      }

      return {
        resumen_consolidado: {
          total_pagado: totalPagado,
          total_pendiente: totalPendiente,
          promedio_por_hijo: promedioHijo
        },
        distribucion_global: distribucionGlobal.filter(d => d.monto > 0),
        tendencias: {
          porcentaje_completitud: porcentajeCompletitud,
          recomendacion: recomendacion
        }
      };

    } catch (error) {
      console.error('Error en getResumenGeneral:', error);
      throw error;
    }
  }

  /**
   * Genera reporte por alumno específico
   */
  async getReportePorAlumno(apoderadoId, alumnoId) {
    try {
      // Verificar que el alumno pertenece al apoderado
      const alumno = await Alumno.findOne({
        where: { id: alumnoId },
        include: [{
          model: Usuario,
          as: 'apoderado',
          where: { id: apoderadoId }
        }, {
          model: Curso,
          as: 'curso'
        }]
      });

      if (!alumno) {
        throw new Error('Alumno no encontrado o no pertenece al apoderado');
      }

      // Obtener pagos del alumno
      const pagos = await Pago.findAll({
        include: [{
          model: DeudaAlumno,
          where: { alumno_id: alumnoId }
        }],
        where: { estado: 'pagado' }
      });

      // Obtener deudas pendientes
      const deudasPendientes = await DeudaAlumno.findAll({
        where: {
          alumno_id: alumnoId,
          estado: 'pendiente'
        }
      });

      const totalPagado = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
      const totalPendiente = deudasPendientes.reduce((sum, deuda) => sum + parseFloat(deuda.monto), 0);

      // Calcular distribución por cuenta (simplificada)
      const distribucionPorCuenta = [
        { cuenta: 'Tesorería General', monto: totalPagado * 0.7 },
        { cuenta: 'Ayuda Social', monto: totalPagado * 0.2 },
        { cuenta: 'Actividades', monto: totalPagado * 0.1 }
      ].filter(d => d.monto > 0);

      return {
        alumno: {
          id: alumno.id,
          nombre: alumno.nombre,
          curso: alumno.curso.nombre
        },
        resumen: {
          total_pagado: totalPagado,
          total_pendiente: totalPendiente,
          cantidad_pagos: pagos.length,
          promedio_mensual: pagos.length > 0 ? totalPagado / Math.max(pagos.length, 1) : 0
        },
        distribucion_por_cuenta: distribucionPorCuenta
      };

    } catch (error) {
      console.error('Error en getReportePorAlumno:', error);
      throw error;
    }
  }

  /**
   * Genera reporte por tipo de pago
   */
  async getReportePorTipoPago(apoderadoId) {
    try {
      const hijos = await Alumno.findAll({
        include: [{
          model: Usuario,
          as: 'apoderado',
          where: { id: apoderadoId }
        }]
      });

      if (hijos.length === 0) {
        return {
          total_general: 0,
          resumen_por_tipo: []
        };
      }

      const hijosIds = hijos.map(h => h.id);

      // Obtener todas las deudas pagadas
      const deudasPagadas = await DeudaAlumno.findAll({
        where: { alumno_id: { [Op.in]: hijosIds } },
        include: [{
          model: Pago,
          where: { estado: 'pagado' }
        }]
      });

      // Agrupar por concepto (tipo de pago)
      const tiposPago = {};
      deudasPagadas.forEach(deuda => {
        const concepto = deuda.concepto || 'Otros';
        if (!tiposPago[concepto]) {
          tiposPago[concepto] = {
            total_pagado: 0,
            cantidad_pagos: 0,
            cuenta_destino: this.getCuentaDestinoByConcepto(concepto)
          };
        }
        
        deuda.Pagos.forEach(pago => {
          tiposPago[concepto].total_pagado += parseFloat(pago.monto);
          tiposPago[concepto].cantidad_pagos += 1;
        });
      });

      const totalGeneral = Object.values(tiposPago).reduce((sum, tipo) => sum + tipo.total_pagado, 0);

      const resumenPorTipo = Object.entries(tiposPago).map(([tipo, datos]) => ({
        tipo_pago: tipo,
        cuenta_destino: datos.cuenta_destino,
        total_pagado: datos.total_pagado,
        cantidad_pagos: datos.cantidad_pagos
      }));

      return {
        total_general: totalGeneral,
        resumen_por_tipo: resumenPorTipo
      };

    } catch (error) {
      console.error('Error en getReportePorTipoPago:', error);
      throw error;
    }
  }

  /**
   * Genera reporte por actividad específica
   */
  async getReportePorActividad(apoderadoId, actividadId) {
    try {
      // Obtener información de la cuenta/actividad
      const cuenta = await CuentaCurso.findByPk(actividadId, {
        include: [{
          model: TipoCuenta,
          as: 'tipoCuenta'
        }, {
          model: Curso,
          as: 'curso'
        }]
      });

      if (!cuenta) {
        throw new Error('Actividad no encontrada');
      }

      // Verificar que el apoderado tiene hijos en este curso
      const hijos = await Alumno.findAll({
        where: { curso_id: cuenta.curso_id },
        include: [{
          model: Usuario,
          as: 'apoderado',
          where: { id: apoderadoId }
        }]
      });

      // Obtener movimientos de la cuenta
      const ingresos = await MovimientoCuenta.findAll({
        where: {
          cuenta_id: actividadId,
          tipo: 'ingreso'
        }
      });

      const egresos = await MovimientoCuenta.findAll({
        where: {
          cuenta_id: actividadId,
          tipo: 'egreso'
        }
      });

      const totalIngresos = ingresos.reduce((sum, mov) => sum + parseFloat(mov.monto), 0);
      const totalGastos = egresos.reduce((sum, mov) => sum + parseFloat(mov.monto), 0);
      const balance = totalIngresos - totalGastos;

      return {
        actividad: {
          id: cuenta.id,
          nombre: cuenta.tipoCuenta.nombre,
          tipo: cuenta.tipoCuenta.nombre,
          curso: cuenta.curso.nombre,
          fecha_actividad: new Date().toISOString().split('T')[0],
          estado: balance >= 0 ? 'completada' : 'en_proceso'
        },
        balance_financiero: {
          total_ingresos: totalIngresos,
          total_gastos: totalGastos,
          balance: balance
        },
        participacion: {
          hijos: hijos.map(hijo => ({
            nombre: hijo.nombre,
            participa: true // Por defecto, si está en el curso participa
          }))
        }
      };

    } catch (error) {
      console.error('Error en getReportePorActividad:', error);
      throw error;
    }
  }

  /**
   * Simula exportación de reporte completo
   */
  async exportarReporteCompleto(apoderadoId, formato = 'pdf') {
    try {
      // En producción real, aquí se generaría el archivo
      const timestamp = Date.now();
      const fileName = `reporte-completo-${apoderadoId}-${timestamp}.${formato}`;
      
      return {
        success: true,
        message: `Reporte completo exportado en formato ${formato}`,
        download_url: `/downloads/${fileName}`,
        file_name: fileName
      };

    } catch (error) {
      console.error('Error en exportarReporteCompleto:', error);
      throw error;
    }
  }

  /**
   * Programa envío automático de reportes
   */
  async programarEnvio(apoderadoId, configuracion) {
    try {
      // En producción real, aquí se configuraría el cron job
      const proximoEnvio = new Date();
      proximoEnvio.setMonth(proximoEnvio.getMonth() + 1);

      return {
        id: Date.now(),
        apoderado_id: apoderadoId,
        ...configuracion,
        proximo_envio: proximoEnvio.toISOString(),
        estado: 'activo'
      };

    } catch (error) {
      console.error('Error en programarEnvio:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  getColorByCuentaTipo(tipo) {
    const colores = {
      'Tesorería General': '#22c55e',
      'Ayuda Social': '#3b82f6',
      'Actividades': '#f59e0b',
      'Infraestructura': '#ef4444',
      'Otros': '#6b7280'
    };
    return colores[tipo] || colores['Otros'];
  }

  getCuentaDestinoByConcepto(concepto) {
    const mapeo = {
      'Mensualidad': 'Tesorería General',
      'Cuota': 'Tesorería General',
      'Cupón Gas': 'Ayuda Social',
      'Beca': 'Ayuda Social',
      'Paseo': 'Actividades',
      'Evento': 'Actividades',
      'Material': 'Tesorería General'
    };
    
    for (const [key, value] of Object.entries(mapeo)) {
      if (concepto.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return 'Tesorería General';
  }
}

module.exports = new ReporteApoderadoService();

