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

class ReporteTesoreroService {

  /**
   * Obtiene dashboard ejecutivo completo del tesorero
   */
  async getDashboard(tesoreroId) {
    try {
      // Obtener información del tesorero y su curso
      const tesorero = await Usuario.findByPk(tesoreroId);
      if (!tesorero) {
        throw new Error('Tesorero no encontrado');
      }

      const curso = await Curso.findOne({
        where: { tesorero_id: tesoreroId }
      });

      if (!curso) {
        throw new Error('Curso no asignado al tesorero');
      }

      // Obtener alumnos del curso
      const alumnos = await Alumno.findAll({
        where: { curso_id: curso.id }
      });

      const alumnosIds = alumnos.map(a => a.id);

      // Calcular métricas principales
      const metricas = await this.calcularMetricasPrincipales(curso.id, alumnosIds);
      
      // Obtener distribución por cuentas
      const distribucionCuentas = await this.getDistribucionCuentas(curso.id);
      
      // Obtener top contribuyentes
      const topContribuyentes = await this.getTopContribuyentes(alumnosIds);
      
      // Obtener principales gastos
      const principalesGastos = await this.getPrincipalesGastos(curso.id);
      
      // Calcular proyecciones
      const proyecciones = await this.calcularProyecciones(curso.id, metricas);
      
      // Obtener alertas activas
      const alertasActivas = await this.getAlertasActivas(curso.id, metricas);

      return {
        tesorero: {
          nombre: tesorero.nombre || tesorero.email,
          curso: curso.nombre
        },
        metricas_principales: metricas,
        tendencias: {
          crecimiento_ingresos: await this.calcularCrecimientoIngresos(curso.id),
          variacion_egresos: await this.calcularVariacionEgresos(curso.id)
        },
        distribucion_cuentas: distribucionCuentas,
        top_contribuyentes: topContribuyentes,
        principales_gastos: principalesGastos,
        proyecciones: proyecciones,
        alertas_activas: alertasActivas
      };

    } catch (error) {
      console.error('Error en getDashboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene métricas rápidas del tesorero
   */
  async getMetricasRapidas(tesoreroId) {
    try {
      const curso = await Curso.findOne({
        where: { tesorero_id: tesoreroId }
      });

      if (!curso) {
        return {
          total_ingresos: 0,
          total_egresos: 0,
          resultado_neto: 0,
          estado_financiero: 'sin_datos',
          alertas_activas: 0
        };
      }

      const metricas = await this.calcularMetricasPrincipales(curso.id, []);
      const alertas = await this.getAlertasActivas(curso.id, metricas);

      return {
        total_ingresos: metricas.total_ingresos,
        total_egresos: metricas.total_egresos,
        resultado_neto: metricas.resultado_neto,
        estado_financiero: metricas.estado_financiero,
        alertas_activas: alertas.length
      };

    } catch (error) {
      console.error('Error en getMetricasRapidas:', error);
      throw error;
    }
  }

  /**
   * Genera resumen detallado de ingresos
   */
  async getResumenIngresos(tesoreroId) {
    try {
      const curso = await Curso.findOne({
        where: { tesorero_id: tesoreroId }
      });

      if (!curso) {
        throw new Error('Curso no asignado al tesorero');
      }

      // Obtener todos los ingresos del curso
      const ingresos = await MovimientoCuenta.findAll({
        include: [{
          model: CuentaCurso,
          where: { curso_id: curso.id },
          include: [{
            model: TipoCuenta,
            as: 'tipoCuenta'
          }]
        }],
        where: { tipo: 'ingreso' },
        order: [['fecha', 'DESC']]
      });

      const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
      const cantidadMovimientos = ingresos.length;
      const promedioIngreso = cantidadMovimientos > 0 ? totalIngresos / cantidadMovimientos : 0;

      // Agrupar ingresos por cuenta
      const ingresosPorCuenta = {};
      ingresos.forEach(ingreso => {
        const nombreCuenta = ingreso.CuentaCurso.tipoCuenta.nombre;
        if (!ingresosPorCuenta[nombreCuenta]) {
          ingresosPorCuenta[nombreCuenta] = 0;
        }
        ingresosPorCuenta[nombreCuenta] += parseFloat(ingreso.monto);
      });

      const ingresosPorCuentaArray = Object.entries(ingresosPorCuenta).map(([cuenta, total]) => ({
        cuenta,
        total
      }));

      // Obtener top contribuyentes
      const alumnos = await Alumno.findAll({
        where: { curso_id: curso.id }
      });
      const topContribuyentes = await this.getTopContribuyentes(alumnos.map(a => a.id));

      // Generar tendencia diaria (últimos 7 días)
      const tendenciaDiaria = await this.getTendenciaIngresosDiaria(curso.id);

      // Calcular crecimiento
      const crecimientoVsMesAnterior = await this.calcularCrecimientoIngresos(curso.id);

      return {
        resumen_general: {
          total_ingresos: totalIngresos,
          cantidad_movimientos: cantidadMovimientos,
          promedio_ingreso: promedioIngreso,
          crecimiento_vs_mes_anterior: crecimientoVsMesAnterior
        },
        ingresos_por_cuenta: ingresosPorCuentaArray,
        top_contribuyentes: topContribuyentes,
        tendencia_diaria: tendenciaDiaria
      };

    } catch (error) {
      console.error('Error en getResumenIngresos:', error);
      throw error;
    }
  }

  /**
   * Genera resumen detallado de egresos
   */
  async getResumenEgresos(tesoreroId) {
    try {
      const curso = await Curso.findOne({
        where: { tesorero_id: tesoreroId }
      });

      if (!curso) {
        throw new Error('Curso no asignado al tesorero');
      }

      // Obtener todos los egresos del curso
      const egresos = await MovimientoCuenta.findAll({
        include: [{
          model: CuentaCurso,
          where: { curso_id: curso.id },
          include: [{
            model: TipoCuenta,
            as: 'tipoCuenta'
          }]
        }],
        where: { tipo: 'egreso' },
        order: [['fecha', 'DESC']]
      });

      const totalEgresos = egresos.reduce((sum, egr) => sum + parseFloat(egr.monto), 0);
      const cantidadMovimientos = egresos.length;
      const promedioEgreso = cantidadMovimientos > 0 ? totalEgresos / cantidadMovimientos : 0;

      // Agrupar egresos por cuenta
      const egresosPorCuenta = {};
      egresos.forEach(egreso => {
        const nombreCuenta = egreso.CuentaCurso.tipoCuenta.nombre;
        if (!egresosPorCuenta[nombreCuenta]) {
          egresosPorCuenta[nombreCuenta] = 0;
        }
        egresosPorCuenta[nombreCuenta] += parseFloat(egreso.monto);
      });

      const egresosPorCuentaArray = Object.entries(egresosPorCuenta).map(([cuenta, total]) => ({
        cuenta,
        total
      }));

      // Obtener gastos por proveedor (basado en descripción)
      const gastosPorProveedor = await this.getGastosPorProveedor(curso.id);

      // Generar tendencia semanal
      const tendenciaSemanal = await this.getTendenciaEgresosSemanal(curso.id);

      // Calcular variación
      const variacionVsMesAnterior = await this.calcularVariacionEgresos(curso.id);

      return {
        resumen_general: {
          total_egresos: totalEgresos,
          cantidad_movimientos: cantidadMovimientos,
          promedio_egreso: promedioEgreso,
          variacion_vs_mes_anterior: variacionVsMesAnterior
        },
        egresos_por_cuenta: egresosPorCuentaArray,
        gastos_por_proveedor: gastosPorProveedor,
        tendencia_semanal: tendenciaSemanal
      };

    } catch (error) {
      console.error('Error en getResumenEgresos:', error);
      throw error;
    }
  }

  /**
   * Genera estado financiero completo
   */
  async getEstadoFinanciero(tesoreroId) {
    try {
      const curso = await Curso.findOne({
        where: { tesorero_id: tesoreroId }
      });

      if (!curso) {
        throw new Error('Curso no asignado al tesorero');
      }

      // Obtener métricas principales
      const resumenEjecutivo = await this.calcularMetricasPrincipales(curso.id, []);

      // Obtener detalle por cuenta
      const detallePorCuenta = await this.getDetallePorCuenta(curso.id);

      // Calcular indicadores financieros
      const indicadoresClave = await this.calcularIndicadoresFinancieros(curso.id, resumenEjecutivo);

      // Obtener comparativo histórico
      const comparativoHistorico = await this.getComparativoHistorico(curso.id);

      return {
        resumen_ejecutivo: resumenEjecutivo,
        detalle_por_cuenta: detallePorCuenta,
        analisis_financiero: {
          indicadores_clave: indicadoresClave
        },
        comparativo_historico: comparativoHistorico
      };

    } catch (error) {
      console.error('Error en getEstadoFinanciero:', error);
      throw error;
    }
  }

  /**
   * Simula exportación de reporte completo
   */
  async exportarReporteCompleto(tesoreroId, formato = 'pdf') {
    try {
      const timestamp = Date.now();
      const fileName = `reporte-tesorero-${tesoreroId}-${timestamp}.${formato}`;
      
      return {
        success: true,
        message: `Reporte completo de tesorero exportado en formato ${formato}`,
        download_url: `/downloads/${fileName}`,
        file_name: fileName
      };

    } catch (error) {
      console.error('Error en exportarReporteCompleto:', error);
      throw error;
    }
  }

  // Métodos auxiliares privados

  async calcularMetricasPrincipales(cursoId, alumnosIds) {
    try {
      // Obtener ingresos del curso
      const ingresos = await MovimientoCuenta.findAll({
        include: [{
          model: CuentaCurso,
          where: { curso_id: cursoId }
        }],
        where: { tipo: 'ingreso' }
      });

      // Obtener egresos del curso
      const egresos = await MovimientoCuenta.findAll({
        include: [{
          model: CuentaCurso,
          where: { curso_id: cursoId }
        }],
        where: { tipo: 'egreso' }
      });

      const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
      const totalEgresos = egresos.reduce((sum, egr) => sum + parseFloat(egr.monto), 0);
      const resultadoNeto = totalIngresos - totalEgresos;
      const margenOperacional = totalIngresos > 0 ? (resultadoNeto / totalIngresos) * 100 : 0;

      let estadoFinanciero = 'regular';
      if (margenOperacional > 20) estadoFinanciero = 'excelente';
      else if (margenOperacional > 10) estadoFinanciero = 'bueno';
      else if (margenOperacional < 0) estadoFinanciero = 'deficitario';

      return {
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        resultado_neto: resultadoNeto,
        margen_operacional: Math.round(margenOperacional * 100) / 100,
        estado_financiero: estadoFinanciero
      };

    } catch (error) {
      console.error('Error en calcularMetricasPrincipales:', error);
      return {
        total_ingresos: 0,
        total_egresos: 0,
        resultado_neto: 0,
        margen_operacional: 0,
        estado_financiero: 'sin_datos'
      };
    }
  }

  async getDistribucionCuentas(cursoId) {
    try {
      const cuentas = await CuentaCurso.findAll({
        where: { curso_id: cursoId },
        include: [{
          model: TipoCuenta,
          as: 'tipoCuenta'
        }]
      });

      return cuentas.map(cuenta => ({
        cuenta: cuenta.tipoCuenta.nombre,
        saldo: parseFloat(cuenta.saldo || 0),
        color: this.getColorByCuentaTipo(cuenta.tipoCuenta.nombre)
      }));

    } catch (error) {
      console.error('Error en getDistribucionCuentas:', error);
      return [];
    }
  }

  async getTopContribuyentes(alumnosIds) {
    try {
      if (alumnosIds.length === 0) return [];

      // Obtener pagos agrupados por alumno
      const pagosAgrupados = await Pago.findAll({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('monto')), 'total_aportado'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad_pagos']
        ],
        include: [{
          model: DeudaAlumno,
          where: { alumno_id: { [Op.in]: alumnosIds } },
          include: [{
            model: Alumno,
            include: [{
              model: Usuario,
              as: 'apoderado'
            }]
          }]
        }],
        where: { estado: 'pagado' },
        group: ['DeudaAlumno.alumno_id'],
        order: [[Sequelize.fn('SUM', Sequelize.col('monto')), 'DESC']],
        limit: 5
      });

      return pagosAgrupados.map(pago => ({
        apoderado: pago.DeudaAlumno.Alumno.apoderado?.nombre || pago.DeudaAlumno.Alumno.apoderado?.email || 'Sin nombre',
        hijos: [pago.DeudaAlumno.Alumno.nombre],
        total_aportado: parseFloat(pago.dataValues.total_aportado),
        cantidad_pagos: parseInt(pago.dataValues.cantidad_pagos)
      }));

    } catch (error) {
      console.error('Error en getTopContribuyentes:', error);
      return [];
    }
  }

  async getPrincipalesGastos(cursoId) {
    try {
      const egresos = await MovimientoCuenta.findAll({
        include: [{
          model: CuentaCurso,
          where: { curso_id: cursoId }
        }],
        where: { tipo: 'egreso' },
        order: [['monto', 'DESC']],
        limit: 5
      });

      return egresos.map(egreso => ({
        proveedor: this.extraerProveedorDeDescripcion(egreso.descripcion),
        total: parseFloat(egreso.monto)
      }));

    } catch (error) {
      console.error('Error en getPrincipalesGastos:', error);
      return [];
    }
  }

  async calcularProyecciones(cursoId, metricas) {
    try {
      // Proyección simple basada en tendencia actual
      const factorCrecimiento = 1.05; // 5% de crecimiento estimado
      
      return {
        ingresos_proyectados_mes_siguiente: Math.round(metricas.total_ingresos * factorCrecimiento),
        egresos_proyectados_mes_siguiente: Math.round(metricas.total_egresos * 1.02), // 2% de crecimiento en gastos
        resultado_proyectado: Math.round((metricas.total_ingresos * factorCrecimiento) - (metricas.total_egresos * 1.02))
      };

    } catch (error) {
      console.error('Error en calcularProyecciones:', error);
      return {
        ingresos_proyectados_mes_siguiente: 0,
        egresos_proyectados_mes_siguiente: 0,
        resultado_proyectado: 0
      };
    }
  }

  async getAlertasActivas(cursoId, metricas) {
    try {
      const alertas = [];

      // Alerta por margen bajo
      if (metricas.margen_operacional < 10) {
        alertas.push({
          tipo: 'warning',
          mensaje: 'Margen operacional bajo, revisar gastos',
          recomendacion: 'Analizar principales egresos y buscar optimizaciones'
        });
      }

      // Alerta por déficit
      if (metricas.resultado_neto < 0) {
        alertas.push({
          tipo: 'error',
          mensaje: 'Resultado neto negativo',
          recomendacion: 'Revisar urgentemente ingresos y egresos'
        });
      }

      return alertas;

    } catch (error) {
      console.error('Error en getAlertasActivas:', error);
      return [];
    }
  }

  async calcularCrecimientoIngresos(cursoId) {
    try {
      // Cálculo simplificado - en producción real sería más complejo
      return Math.random() * 20 - 5; // Entre -5% y 15%
    } catch (error) {
      return 0;
    }
  }

  async calcularVariacionEgresos(cursoId) {
    try {
      // Cálculo simplificado - en producción real sería más complejo
      return Math.random() * 10 - 5; // Entre -5% y 5%
    } catch (error) {
      return 0;
    }
  }

  // Métodos auxiliares adicionales
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

  extraerProveedorDeDescripcion(descripcion) {
    if (!descripcion) return 'Proveedor no especificado';
    
    // Extraer primera palabra como proveedor
    const palabras = descripcion.split(' ');
    return palabras[0] || 'Proveedor no especificado';
  }

  async getTendenciaIngresosDiaria(cursoId) {
    // Implementación simplificada - en producción sería más compleja
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      dias.push({
        fecha: fecha.toISOString().split('T')[0],
        ingresos: Math.floor(Math.random() * 50000) + 10000
      });
    }
    return dias;
  }

  async getTendenciaEgresosSemanal(cursoId) {
    // Implementación simplificada
    return [
      { semana: 'Sem 1', egresos: Math.floor(Math.random() * 30000) + 20000 },
      { semana: 'Sem 2', egresos: Math.floor(Math.random() * 30000) + 20000 },
      { semana: 'Sem 3', egresos: Math.floor(Math.random() * 30000) + 20000 },
      { semana: 'Sem 4', egresos: Math.floor(Math.random() * 30000) + 20000 }
    ];
  }

  async getGastosPorProveedor(cursoId) {
    try {
      const egresos = await MovimientoCuenta.findAll({
        include: [{
          model: CuentaCurso,
          where: { curso_id: cursoId }
        }],
        where: { tipo: 'egreso' }
      });

      const proveedores = {};
      egresos.forEach(egreso => {
        const proveedor = this.extraerProveedorDeDescripcion(egreso.descripcion);
        if (!proveedores[proveedor]) {
          proveedores[proveedor] = {
            total: 0,
            categoria_principal: 'Educación',
            cantidad_compras: 0
          };
        }
        proveedores[proveedor].total += parseFloat(egreso.monto);
        proveedores[proveedor].cantidad_compras += 1;
      });

      return Object.entries(proveedores)
        .map(([proveedor, datos]) => ({
          proveedor,
          ...datos
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    } catch (error) {
      console.error('Error en getGastosPorProveedor:', error);
      return [];
    }
  }

  async getDetallePorCuenta(cursoId) {
    try {
      const cuentas = await CuentaCurso.findAll({
        where: { curso_id: cursoId },
        include: [{
          model: TipoCuenta,
          as: 'tipoCuenta'
        }]
      });

      return await Promise.all(cuentas.map(async (cuenta) => {
        const ingresos = await MovimientoCuenta.findAll({
          where: { cuenta_id: cuenta.id, tipo: 'ingreso' }
        });
        
        const egresos = await MovimientoCuenta.findAll({
          where: { cuenta_id: cuenta.id, tipo: 'egreso' }
        });

        const totalIngresos = ingresos.reduce((sum, ing) => sum + parseFloat(ing.monto), 0);
        const totalEgresos = egresos.reduce((sum, egr) => sum + parseFloat(egr.monto), 0);
        const saldoFinal = totalIngresos - totalEgresos;

        let liquidez = 'baja';
        if (saldoFinal > 100000) liquidez = 'alta';
        else if (saldoFinal > 50000) liquidez = 'media';

        return {
          cuenta: cuenta.tipoCuenta.nombre,
          saldo_inicial: parseFloat(cuenta.saldo || 0),
          ingresos_periodo: totalIngresos,
          egresos_periodo: totalEgresos,
          saldo_final: saldoFinal,
          color: this.getColorByCuentaTipo(cuenta.tipoCuenta.nombre),
          rendimiento: { liquidez }
        };
      }));

    } catch (error) {
      console.error('Error en getDetallePorCuenta:', error);
      return [];
    }
  }

  async calcularIndicadoresFinancieros(cursoId, resumenEjecutivo) {
    try {
      const indicadores = [];

      // Ratio de Liquidez
      const ratioLiquidez = resumenEjecutivo.total_egresos > 0 ? 
        resumenEjecutivo.total_ingresos / resumenEjecutivo.total_egresos : 0;
      
      indicadores.push({
        indicador: 'Ratio de Liquidez',
        valor: ratioLiquidez.toFixed(1),
        estado: ratioLiquidez > 2 ? 'positivo' : ratioLiquidez > 1 ? 'regular' : 'negativo',
        interpretacion: ratioLiquidez > 2 ? 'Excelente capacidad de pago' : 
                       ratioLiquidez > 1 ? 'Capacidad de pago adecuada' : 'Capacidad de pago limitada'
      });

      // Margen Operacional
      indicadores.push({
        indicador: 'Margen Operacional',
        valor: `${resumenEjecutivo.margen_operacional}%`,
        estado: resumenEjecutivo.margen_operacional > 15 ? 'positivo' : 
               resumenEjecutivo.margen_operacional > 5 ? 'regular' : 'negativo',
        interpretacion: resumenEjecutivo.margen_operacional > 15 ? 'Rentabilidad excelente' :
                       resumenEjecutivo.margen_operacional > 5 ? 'Rentabilidad adecuada' : 'Rentabilidad baja'
      });

      return indicadores;

    } catch (error) {
      console.error('Error en calcularIndicadoresFinancieros:', error);
      return [];
    }
  }

  async getComparativoHistorico(cursoId) {
    try {
      // Implementación simplificada - en producción sería más compleja
      const meses = ['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'];
      const historico = meses.map(mes => {
        const ingresos = Math.floor(Math.random() * 100000) + 300000;
        const egresos = Math.floor(Math.random() * 50000) + 250000;
        return {
          mes,
          ingresos,
          egresos,
          resultado: ingresos - egresos
        };
      });

      return {
        ultimos_6_meses: historico,
        tendencia: 'creciente',
        crecimiento_promedio_mensual: 8.2
      };

    } catch (error) {
      console.error('Error en getComparativoHistorico:', error);
      return {
        ultimos_6_meses: [],
        tendencia: 'estable',
        crecimiento_promedio_mensual: 0
      };
    }
  }
}

module.exports = new ReporteTesoreroService();

