import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  User,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  Send,
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

// Función para formatear fechas
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Función para calcular días hasta vencimiento
const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para obtener el estado de urgencia
const getUrgencyStatus = (daysUntilDue) => {
  if (daysUntilDue < 0) return { status: 'overdue', label: 'Vencido', color: 'destructive' };
  if (daysUntilDue === 0) return { status: 'today', label: 'Hoy', color: 'destructive' };
  if (daysUntilDue <= 3) return { status: 'urgent', label: 'Urgente', color: 'destructive' };
  if (daysUntilDue <= 7) return { status: 'soon', label: 'Próximo', color: 'secondary' };
  return { status: 'normal', label: 'Pendiente', color: 'outline' };
};

// Función para formatear montos
const formatAmount = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

// Componente para un item individual de pago
export function PaymentItem({ payment, index, onViewDetails, onEdit, onSendReminder }) {
  const daysUntilDue = getDaysUntilDue(payment.dueDate);
  const urgency = getUrgencyStatus(daysUntilDue);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: index * 0.1 }
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="group"
    >
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
        <div className="flex items-center space-x-4 flex-1">
          {/* Avatar del estudiante */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={payment.student.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(payment.student)}
            </AvatarFallback>
          </Avatar>

          {/* Información del pago */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900 truncate">
                {payment.student}
              </p>
              <Badge variant="outline" className="text-xs">
                {payment.course}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">
              {payment.concept}
            </p>
            
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Vence: {formatDate(payment.dueDate)}</span>
              </div>
              
              {daysUntilDue >= 0 && (
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {daysUntilDue === 0 ? 'Hoy' : 
                     daysUntilDue === 1 ? 'Mañana' : 
                     `En ${daysUntilDue} días`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Monto y estado */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatAmount(payment.amount)}
            </p>
            <Badge variant={urgency.color} className="text-xs">
              {urgency.label}
            </Badge>
          </div>

          {/* Menú de acciones */}
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
              <DropdownMenuItem onClick={() => onViewDetails?.(payment)}>
                <Eye className="w-4 h-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(payment)}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendReminder?.(payment)}>
                <Send className="w-4 h-4 mr-2" />
                Enviar recordatorio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
}

// Componente principal de próximos pagos
export function UpcomingPayments({ 
  payments = [], 
  title = "Próximos Pagos",
  description = "Pagos pendientes y próximos vencimientos",
  showViewAll = true,
  maxItems = 5,
  onViewAll,
  onViewDetails,
  onEdit,
  onSendReminder,
  className,
  ...props 
}) {
  // Ordenar pagos por fecha de vencimiento
  const sortedPayments = payments
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, maxItems);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Calcular estadísticas
  const stats = {
    total: payments.length,
    overdue: payments.filter(p => getDaysUntilDue(p.dueDate) < 0).length,
    urgent: payments.filter(p => {
      const days = getDaysUntilDue(p.dueDate);
      return days >= 0 && days <= 3;
    }).length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <Card className={cn("h-full", className)} {...props}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <span>{title}</span>
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.overdue} vencidos
                </Badge>
              )}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1">
                {description}
              </CardDescription>
            )}
          </div>
          
          {showViewAll && payments.length > maxItems && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onViewAll}
            >
              Ver todos ({payments.length})
            </Button>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
            <p className="text-xs text-red-600">Urgentes</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-600">
              {formatAmount(stats.totalAmount)}
            </p>
            <p className="text-xs text-blue-600">Monto Total</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {sortedPayments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay pagos pendientes</p>
            <p className="text-xs text-gray-400 mt-1">
              ¡Todos los pagos están al día!
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3 p-4"
          >
            {sortedPayments.map((payment, index) => (
              <PaymentItem
                key={payment.id}
                payment={payment}
                index={index}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                onSendReminder={onSendReminder}
              />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente compacto para próximos pagos
export function CompactUpcomingPayments({ payments = [], className, ...props }) {
  const urgentPayments = payments
    .filter(p => getDaysUntilDue(p.dueDate) <= 3)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <span>Pagos Urgentes</span>
          {urgentPayments.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {urgentPayments.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {urgentPayments.length === 0 ? (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm text-gray-500">Sin pagos urgentes</p>
          </div>
        ) : (
          urgentPayments.map((payment, index) => {
            const daysUntilDue = getDaysUntilDue(payment.dueDate);
            const urgency = getUrgencyStatus(daysUntilDue);
            
            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                      {getInitials(payment.student)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.student}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.concept}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAmount(payment.amount)}
                  </p>
                  <Badge variant={urgency.color} className="text-xs">
                    {urgency.label}
                  </Badge>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// Componente para resumen de pagos por estado
export function PaymentsSummary({ payments = [], className, ...props }) {
  const summary = payments.reduce((acc, payment) => {
    const daysUntilDue = getDaysUntilDue(payment.dueDate);
    
    if (daysUntilDue < 0) {
      acc.overdue.count++;
      acc.overdue.amount += payment.amount;
    } else if (daysUntilDue <= 3) {
      acc.urgent.count++;
      acc.urgent.amount += payment.amount;
    } else if (daysUntilDue <= 7) {
      acc.soon.count++;
      acc.soon.amount += payment.amount;
    } else {
      acc.normal.count++;
      acc.normal.amount += payment.amount;
    }
    
    return acc;
  }, {
    overdue: { count: 0, amount: 0 },
    urgent: { count: 0, amount: 0 },
    soon: { count: 0, amount: 0 },
    normal: { count: 0, amount: 0 },
  });

  const summaryItems = [
    { 
      label: 'Vencidos', 
      ...summary.overdue, 
      color: 'text-red-600 bg-red-100',
      icon: AlertTriangle 
    },
    { 
      label: 'Urgentes', 
      ...summary.urgent, 
      color: 'text-orange-600 bg-orange-100',
      icon: Clock 
    },
    { 
      label: 'Próximos', 
      ...summary.soon, 
      color: 'text-yellow-600 bg-yellow-100',
      icon: Calendar 
    },
    { 
      label: 'Normales', 
      ...summary.normal, 
      color: 'text-blue-600 bg-blue-100',
      icon: CheckCircle 
    },
  ];

  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader>
        <CardTitle className="text-base">Resumen de Pagos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {summaryItems.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-full", item.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.count} pagos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatAmount(item.amount)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default UpcomingPayments;

