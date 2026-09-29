import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  AlertTriangle, 
  Truck, 
  CheckCircle2, 
  Layers,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { AppointmentRequest, UserRole } from '../types';

interface DashboardStatsProps {
  appointments: AppointmentRequest[];
  userRole: UserRole;
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  appointments,
  userRole,
  currentFilter,
  onFilterChange,
}) => {
  const total = appointments.length;
  const pendientes = appointments.filter((a) => a.status === 'pendiente' || a.status === 'solicitada').length;
  const planifPendientes = appointments.filter((a) => !a.planningValidation?.isValidated).length;
  const planifValidadas = appointments.filter((a) => Boolean(a.planningValidation?.isValidated)).length;
  const urgentes = appointments.filter((a) => a.urgency === 'Urgente').length;
  const enPlanta = appointments.filter((a) => a.status === 'en_planta' || a.status === 'en_atencion' || a.status === 'en_descarga').length;
  const liquidadas = appointments.filter((a) => a.status === 'liquidado' || a.status === 'liquidada').length;
  const totalPalets = appointments.reduce((sum, a) => sum + (Number(a.palletsCount) || 0), 0);

  const stats = userRole === 'planificacion' ? [
    {
      id: 'todos',
      label: 'Total Solicitudes',
      count: total,
      sublabel: `${totalPalets} palets registrados`,
      icon: ClipboardList,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      activeRing: 'ring-2 ring-slate-400'
    },
    {
      id: 'planif_pendiente',
      label: 'Pendiente Validación OC',
      count: planifPendientes,
      sublabel: 'Por verificar en SAP R/3',
      icon: AlertCircle,
      color: 'text-amber-800',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-400',
      activeRing: 'ring-2 ring-amber-500 shadow-sm'
    },
    {
      id: 'planif_validado',
      label: 'OCs Validadas en SAP',
      count: planifValidadas,
      sublabel: 'Listas para confirmación',
      icon: ShieldCheck,
      color: 'text-emerald-800',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      activeRing: 'ring-2 ring-emerald-500'
    },
    {
      id: 'urgente',
      label: 'Citas Urgentes',
      count: urgentes,
      sublabel: 'Insumos críticos',
      icon: AlertTriangle,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      activeRing: 'ring-2 ring-rose-500'
    },
    {
      id: 'en_planta',
      label: 'En Planta / Almacén',
      count: enPlanta,
      sublabel: 'Operación en recepción',
      icon: Truck,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      activeRing: 'ring-2 ring-blue-500'
    }
  ] : [
    {
      id: 'todos',
      label: 'Total Solicitudes',
      count: total,
      sublabel: `${totalPalets} palets en total`,
      icon: ClipboardList,
      color: 'text-slate-700',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      activeRing: 'ring-2 ring-slate-400'
    },
    {
      id: 'pendiente',
      label: 'Pendientes Revisión',
      count: pendientes,
      sublabel: userRole === 'recepcionista' ? 'Requiere tu confirmación' : 'En cola de programación',
      icon: Clock,
      color: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      activeRing: 'ring-2 ring-amber-500'
    },
    {
      id: 'urgente',
      label: 'Citas Urgentes',
      count: urgentes,
      sublabel: 'Prioridad de descarga',
      icon: AlertTriangle,
      color: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      activeRing: 'ring-2 ring-rose-500'
    },
    {
      id: 'en_planta',
      label: 'En Planta / Bahía',
      count: enPlanta,
      sublabel: 'Operación en curso',
      icon: Truck,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      activeRing: 'ring-2 ring-blue-500'
    },
    {
      id: 'liquidado',
      label: 'Atendidas y Liquidadas',
      count: liquidadas,
      sublabel: 'Proceso culminado 100%',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      activeRing: 'ring-2 ring-emerald-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 my-6">
      {stats.map((item) => {
        const Icon = item.icon;
        const isActive = currentFilter === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onFilterChange(isActive && item.id !== 'todos' ? 'todos' : item.id)}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all text-left bg-white shadow-xs hover:shadow-sm ${
              item.borderColor
            } ${isActive ? `${item.bgColor} ${item.activeRing} shadow-md` : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600 truncate">
                {item.label}
              </span>
              <div className={`p-1.5 rounded-lg ${item.bgColor} ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl sm:text-3xl font-bold font-sans ${item.color}`}>
                {item.count}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {item.sublabel}
            </p>
          </button>
        );
      })}
    </div>
  );
};
