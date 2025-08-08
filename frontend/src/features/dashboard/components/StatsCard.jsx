import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

// Función para formatear valores
const formatValue = (value, format = 'number') => {
  if (value === null || value === undefined) return '0';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'number':
    default:
      return new Intl.NumberFormat('es-CL').format(value);
  }
};

// Función para obtener el color de la tendencia
const getTrendColor = (direction) => {
  switch (direction) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

// Función para obtener el icono de la tendencia
const getTrendIcon = (direction) => {
  switch (direction) {
    case 'up':
      return TrendingUp;
    case 'down':
      return TrendingDown;
    default:
      return Minus;
  }
};

// Función para obtener los colores del tema
const getColorClasses = (color) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-50',
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      hover: 'hover:bg-green-50',
    },
    emerald: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'hover:bg-emerald-50',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-200',
      hover: 'hover:bg-red-50',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      hover: 'hover:bg-orange-50',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-50',
    },
    indigo: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:bg-indigo-50',
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-50',
    },
  };

  return colorMap[color] || colorMap.blue;
};

export function StatsCard({
  title,
  value,
  trend,
  icon: iconName,
  color = 'blue',
  description,
  format = 'number',
  onClick,
  className,
  ...props
}) {
  const Icon = Icons[iconName] || Icons.BarChart3;
  const TrendIcon = trend ? getTrendIcon(trend.direction) : null;
  const colors = getColorClasses(color);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -2, transition: { duration: 0.2 } },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { delay: 0.2, type: "spring", stiffness: 200 }
    },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
  };

  const valueVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.3, duration: 0.5 }
    },
  };

  const trendVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: 0.4, duration: 0.5 }
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={className}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg",
          colors.hover,
          onClick && "hover:scale-[1.02]"
        )}
        onClick={onClick}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {title}
              </p>
              
              <motion.div
                variants={valueVariants}
                className="flex items-baseline space-x-2"
              >
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatValue(value, format)}
                </h3>
              </motion.div>

              {trend && (
                <motion.div
                  variants={trendVariants}
                  className="flex items-center mt-2"
                >
                  {TrendIcon && (
                    <TrendIcon className={cn(
                      "w-4 h-4 mr-1",
                      getTrendColor(trend.direction)
                    )} />
                  )}
                  <span className={cn(
                    "text-sm font-medium",
                    getTrendColor(trend.direction)
                  )}>
                    {Math.abs(trend.value)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    {trend.period}
                  </span>
                </motion.div>
              )}

              {description && (
                <p className="text-xs text-gray-500 mt-1">
                  {description}
                </p>
              )}
            </div>

            <motion.div
              variants={iconVariants}
              className={cn(
                "p-3 rounded-full",
                colors.bg
              )}
            >
              <Icon className={cn("w-6 h-6", colors.text)} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para una grilla de tarjetas de estadísticas
export function StatsGrid({ stats, className, ...props }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
      {...props}
    >
      {stats?.map((stat, index) => (
        <StatsCard
          key={stat.title || index}
          {...stat}
        />
      ))}
    </motion.div>
  );
}

// Componente para tarjeta de estadística compacta
export function CompactStatsCard({
  title,
  value,
  icon: iconName,
  color = 'blue',
  format = 'number',
  className,
  ...props
}) {
  const Icon = Icons[iconName] || Icons.BarChart3;
  const colors = getColorClasses(color);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn("p-2 rounded-lg", colors.bg)}>
              <Icon className={cn("w-4 h-4", colors.text)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-600 truncate">
                {title}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatValue(value, format)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente para tarjeta de estadística con progreso
export function ProgressStatsCard({
  title,
  value,
  maxValue,
  icon: iconName,
  color = 'blue',
  format = 'number',
  className,
  ...props
}) {
  const Icon = Icons[iconName] || Icons.BarChart3;
  const colors = getColorClasses(color);
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(value, format)}
              </p>
            </div>
            <div className={cn("p-3 rounded-full", colors.bg)}>
              <Icon className={cn("w-6 h-6", colors.text)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progreso</span>
              <span className="font-medium">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={cn(
                  "h-2 rounded-full",
                  percentage >= 100 ? 'bg-green-500' : 
                  percentage >= 75 ? colors.text.replace('text-', 'bg-') :
                  percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default StatsCard;

