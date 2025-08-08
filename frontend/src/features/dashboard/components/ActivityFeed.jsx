import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Receipt,
  CreditCard,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { cn } from '../../../lib/utils';

// Función para obtener el icono según el tipo de actividad
const getActivityIcon = (type) => {
  const icons = {
    payment: CheckCircle,
    expense: DollarSign,
    student: Users,
    overdue: AlertTriangle,
    income: TrendingUp,
    debt: CreditCard,
    course: Users,
    default: Clock,
  };
  return icons[type] || icons.default;
};

// Función para obtener el color según el estado
const getStatusColor = (status) => {
  const colors = {
    success: 'text-green-600 bg-green-100',
    info: 'text-blue-600 bg-blue-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    default: 'text-gray-600 bg-gray-100',
  };
  return colors[status] || colors.default;
};

// Función para formatear tiempo relativo
const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return new Date(date).toLocaleDateString('es-CL');
};

// Función para formatear montos
const formatAmount = (amount) => {
  if (!amount) return '';
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

// Función para obtener iniciales
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Componente para un item individual de actividad
export function ActivityItem({ activity, index, onViewDetails, onMarkAsRead }) {
  const Icon = getActivityIcon(activity.type);
  const statusColor = getStatusColor(activity.status);

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { delay: index * 0.1 }
    },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group"
    >
      <div className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
        {/* Icono de actividad */}
        <div className={cn("p-2 rounded-full flex-shrink-0", statusColor)}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                {activity.title}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {activity.description}
              </p>
              
              {/* Información adicional */}
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.time)}
                </span>
                
                {activity.user && (
                  <div className="flex items-center space-x-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {getInitials(activity.user)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-500">
                      {activity.user}
                    </span>
                  </div>
                )}
                
                {activity.course && (
                  <Badge variant="outline" className="text-xs">
                    {activity.course}
                  </Badge>
                )}
              </div>
            </div>

            {/* Monto y acciones */}
            <div className="flex items-center space-x-2 ml-4">
              {activity.amount && (
                <span className={cn(
                  "font-semibold text-sm",
                  activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {activity.amount > 0 ? '+' : ''}
                  {formatAmount(activity.amount)}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewDetails?.(activity)}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver detalles
                  </DropdownMenuItem>
                  {onMarkAsRead && (
                    <DropdownMenuItem onClick={() => onMarkAsRead(activity.id)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como leído
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Componente principal del feed de actividad
export function ActivityFeed({ 
  activities = [], 
  title = "Actividad Reciente",
  description = "Últimas transacciones y eventos del sistema",
  showViewAll = true,
  maxItems = 5,
  onViewAll,
  onViewDetails,
  onMarkAsRead,
  className,
  ...props 
}) {
  const displayedActivities = activities.slice(0, maxItems);

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
    <Card className={cn("h-full", className)} {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          
          {showViewAll && activities.length > maxItems && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAll}
            >
              Ver todas
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {displayedActivities.map((activity, index) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  index={index}
                  onViewDetails={onViewDetails}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente compacto para actividad reciente
export function CompactActivityFeed({ activities = [], className, ...props }) {
  const recentActivities = activities.slice(0, 3);

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Actividad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Sin actividad reciente
          </p>
        ) : (
          recentActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const statusColor = getStatusColor(activity.status);
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className={cn("p-1.5 rounded-full", statusColor)}>
                  <Icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(activity.time)}
                  </p>
                </div>
                {activity.amount && (
                  <span className={cn(
                    "text-xs font-medium",
                    activity.amount > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {formatAmount(activity.amount)}
                  </span>
                )}
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// Componente para timeline de actividades
export function ActivityTimeline({ activities = [], className, ...props }) {
  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader>
        <CardTitle>Timeline de Actividades</CardTitle>
        <CardDescription>
          Cronología de eventos del sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Línea vertical del timeline */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const statusColor = getStatusColor(activity.status);
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex items-start space-x-4"
                >
                  {/* Punto del timeline */}
                  <div className={cn(
                    "relative z-10 p-2 rounded-full border-2 border-white",
                    statusColor
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  {/* Contenido */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(activity.time)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {activity.description}
                    </p>
                    
                    {activity.amount && (
                      <div className="mt-2">
                        <Badge 
                          variant={activity.amount > 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {activity.amount > 0 ? '+' : ''}
                          {formatAmount(activity.amount)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityFeed;

