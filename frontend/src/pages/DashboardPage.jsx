import { motion } from 'framer-motion';
import { StatsGrid } from '../features/dashboard/components/StatsCard';
import {
  MonthlyTrendsChart,
  BalanceChart,
  CourseStatsChart,
  ExpenseCategoriesChart,
  StudentDistributionChart,
} from '../features/dashboard/components/Charts';
import ActivityFeed from '../features/dashboard/components/ActivityFeed';
import UpcomingPayments from '../features/dashboard/components/UpcomingPayments';
import Navbar from '../pages/Navbar';

export default function DashboardPage() {
  // Datos simulados para estadísticas
  const statsData = [
    {
      title: 'Ventas Mensuales',
      value: 3500000,
      trend: { direction: 'up', value: 12.5, period: 'últimos 30 días' },
      icon: 'TrendingUp',
      color: 'green',
      format: 'currency',
    },
    {
      title: 'Usuarios Nuevos',
      value: 512,
      trend: { direction: 'down', value: 3.2, period: 'última semana' },
      icon: 'UserPlus',
      color: 'blue',
      format: 'number',
    },
    {
      title: 'Retención',
      value: 78.6,
      trend: { direction: 'up', value: 1.8, period: 'este mes' },
      icon: 'Repeat',
      color: 'purple',
      format: 'percentage',
    },
    {
      title: 'Abandonos',
      value: 27,
      trend: { direction: 'down', value: 2.1, period: 'últimos 15 días' },
      icon: 'UserX',
      color: 'red',
      format: 'number',
    },
  ];

  // Datos para MonthlyTrendsChart
  const monthlyTrendsData = [
    { month: 'Mar', ingresos: 5000000, gastos: 3200000 },
    { month: 'Abr', ingresos: 4500000, gastos: 3000000 },
    { month: 'May', ingresos: 4700000, gastos: 2900000 },
    { month: 'Jun', ingresos: 5200000, gastos: 3500000 },
    { month: 'Jul', ingresos: 5800000, gastos: 4000000 },
    { month: 'Ago', ingresos: 6100000, gastos: 4200000 },
  ];

  // Datos para BalanceChart
  const balanceData = [
    { month: 'Mar', balance: 1800000 },
    { month: 'Abr', balance: 1500000 },
    { month: 'May', balance: 1800000 },
    { month: 'Jun', balance: 1700000 },
    { month: 'Jul', balance: 1800000 },
    { month: 'Ago', balance: 1900000 },
  ];

  // Datos para CourseStatsChart
  const courseStatsData = [
    { name: 'Curso A', alumnos: 120, ingresos: 2400000 },
    { name: 'Curso B', alumnos: 80, ingresos: 1600000 },
    { name: 'Curso C', alumnos: 95, ingresos: 1900000 },
    { name: 'Curso D', alumnos: 70, ingresos: 1400000 },
  ];

  // Datos para ExpenseCategoriesChart
  const expenseCategoriesData = [
    { name: 'Marketing', value: 1500000, color: '#3b82f6' },
    { name: 'Sueldos', value: 3000000, color: '#10b981' },
    { name: 'Servicios', value: 800000, color: '#f59e0b' },
    { name: 'Tecnología', value: 1200000, color: '#8b5cf6' },
  ];

  // Datos para StudentDistributionChart
  const studentDistributionData = [
    { name: 'Curso A', value: 120, color: '#3b82f6' },
    { name: 'Curso B', value: 80, color: '#10b981' },
    { name: 'Curso C', value: 95, color: '#f59e0b' },
    { name: 'Curso D', value: 70, color: '#ef4444' },
  ];

  return (
    <>
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 max-w-7xl mx-auto space-y-6"
      >
        <h1 className="text-3xl font-bold text-primary">Panel de Control</h1>

        {/* Tarjetas de estadísticas */}
        <section>
          <StatsGrid stats={statsData} />
        </section>

        {/* Gráficos principales */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MonthlyTrendsChart data={monthlyTrendsData} />
          <BalanceChart data={balanceData} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CourseStatsChart data={courseStatsData} />
          <ExpenseCategoriesChart data={expenseCategoriesData} />
        </section>

        <section>
          <StudentDistributionChart data={studentDistributionData} />
        </section>

        {/* Actividad reciente */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Actividad Reciente
          </h2>
          <ActivityFeed />
        </section>
      </motion.div>
    </>
  );
}
