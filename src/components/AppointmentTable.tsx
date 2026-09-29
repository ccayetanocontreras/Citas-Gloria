import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Mail, 
  QrCode, 
  Eye, 
  Edit3, 
  Trash2, 
  Truck, 
  Layers, 
  Building,
  MoreVertical,
  ArrowUpDown,
  Download,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X
} from 'lucide-react';
import { AppointmentRequest, AppointmentStatus, UserRole, User } from '../types';
import { downloadAllAttachments } from '../utils/pdfHelper';

interface AppointmentTableProps {
  appointments: AppointmentRequest[];
  currentUser: User;
  onOpenReceptionistModal: (appointment: AppointmentRequest) => void;
  onOpenPlanningModal?: (appointment: AppointmentRequest) => void;
  onOpenAuditHistory: (appointment: AppointmentRequest) => void;
  onOpenPdfViewer: (appointment: AppointmentRequest) => void;
  onOpenEmailModal: (appointment: AppointmentRequest) => void;
  onOpenPassModal: (appointment: AppointmentRequest) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  currentUser,
  onOpenReceptionistModal,
  onOpenPlanningModal,
  onOpenAuditHistory,
  onOpenPdfViewer,
  onOpenEmailModal,
  onOpenPassModal,
  onDeleteAppointment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('todos');
  const [plantFilter, setPlantFilter] = useState<string>('todos');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'createdAt' | 'date' | 'pallets'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // If user is Proveedor, filter to only show their own appointments (or highlight them)
  const isSupplier = currentUser.role === 'proveedor';
  const roleFilteredAppointments = isSupplier
    ? appointments.filter((a) => a.supplierId === currentUser.id || a.supplierEmail === currentUser.email)
    : appointments;

  // Calendar month state initialized to the month of the first appointment or Sept 2026
  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>(() => {
    const firstDateStr = roleFilteredAppointments[0]?.scheduledDate || roleFilteredAppointments[0]?.requestedDate || '2026-09-23';
    const parts = firstDateStr.split('-');
    if (parts.length === 3) {
      return { year: Number(parts[0]), month: Number(parts[1]) - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Group appointments by effective date (scheduledDate || requestedDate) for calendar badges
  const appointmentsByDate = React.useMemo(() => {
    const map: Record<string, { count: number; pallets: number; hasUrgent: boolean; items: AppointmentRequest[] }> = {};
    roleFilteredAppointments.forEach((apt) => {
      const effDate = apt.scheduledDate || apt.requestedDate;
      if (!effDate) return;
      if (!map[effDate]) {
        map[effDate] = { count: 0, pallets: 0, hasUrgent: false, items: [] };
      }
      map[effDate].count += 1;
      map[effDate].pallets += apt.palletsCount || 0;
      if (apt.urgency === 'Urgente') {
        map[effDate].hasUrgent = true;
      }
      map[effDate].items.push(apt);
    });
    return map;
  }, [roleFilteredAppointments]);

  const availableDatesSorted = React.useMemo(() => {
    return Object.keys(appointmentsByDate).sort();
  }, [appointmentsByDate]);

  const handleSelectCalendarDate = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate('');
    } else {
      setSelectedDate(dateStr);
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        setCalendarMonth({ year: Number(parts[0]), month: Number(parts[1]) - 1 });
      }
    }
  };

  const handleShiftSelectedDate = (daysDelta: number) => {
    const base = selectedDate || availableDatesSorted[0] || '2026-09-23';
    const [y, m, d] = base.split('-').map(Number);
    const dt = new Date(y, m - 1, d + daysDelta);
    const nextStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    setSelectedDate(nextStr);
    setCalendarMonth({ year: dt.getFullYear(), month: dt.getMonth() });
  };

  const formatReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return dt.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const calendarDays = React.useMemo(() => {
    const { year, month } = calendarMonth;
    const firstDayOfMonth = new Date(year, month, 1);
    // Monday-based week: Monday=0 ... Sunday=6
    const startWeekday = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number | null; dateStr: string }> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ day: null, dateStr: '' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, dateStr });
    }
    return cells;
  }, [calendarMonth]);

  const filteredAppointments = roleFilteredAppointments.filter((a) => {
    const search = searchTerm.toLowerCase();
    
    // Check in root fields
    const inRoot =
      a.ticketCode.toLowerCase().includes(search) ||
      a.orderNumber.toLowerCase().includes(search) ||
      a.materialCode.toLowerCase().includes(search) ||
      a.materialDescription.toLowerCase().includes(search) ||
      a.supplierName.toLowerCase().includes(search) ||
      (a.vehiclePlate && a.vehiclePlate.toLowerCase().includes(search));

    // Also check inside individual purchaseOrders items if present
    const inPurchaseOrders = a.purchaseOrders?.some(po =>
      po.orderNumber.toLowerCase().includes(search) ||
      po.materialCode.toLowerCase().includes(search) ||
      po.materialDescription.toLowerCase().includes(search) ||
      po.positionNumber.toLowerCase().includes(search)
    );

    const matchesSearch = inRoot || Boolean(inPurchaseOrders);
    let matchesStatus = true;
    if (statusFilter === 'planif_pendiente') {
      matchesStatus = !a.planningValidation?.isValidated;
    } else if (statusFilter === 'planif_validado') {
      matchesStatus = Boolean(a.planningValidation?.isValidated);
    } else if (statusFilter !== 'todos') {
      matchesStatus = a.status === statusFilter;
    }

    const matchesUrgency = urgencyFilter === 'todos' || a.urgency === urgencyFilter;
    const matchesPlant = plantFilter === 'todos' || a.plantLocation.includes(plantFilter);
    const effectiveDate = a.scheduledDate || a.requestedDate;
    const matchesDate =
      !selectedDate ||
      effectiveDate === selectedDate ||
      a.requestedDate === selectedDate ||
      a.scheduledDate === selectedDate;

    return matchesSearch && matchesStatus && matchesUrgency && matchesPlant && matchesDate;
  }).sort((a, b) => {
    if (sortField === 'pallets') {
      return sortAsc ? a.palletsCount - b.palletsCount : b.palletsCount - a.palletsCount;
    }
    if (sortField === 'createdAt') {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortAsc ? timeA - timeB : timeB - timeA;
    }
    // Default by scheduled/requested date
    const dateA = new Date((a.scheduledDate || a.requestedDate) + 'T' + (a.scheduledTime || a.requestedTime)).getTime();
    const dateB = new Date((b.scheduledDate || b.requestedDate) + 'T' + (b.scheduledTime || b.requestedTime)).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const getStatusBadge = (status: AppointmentStatus | string) => {
    switch (status) {
      case 'pendiente':
      case 'solicitada':
        return {
          label: 'Pendiente Revisión',
          bg: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'confirmada':
        return {
          label: 'Cita Confirmada',
          bg: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'reprogramada':
        return {
          label: 'Hora Reprogramada',
          bg: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'en_planta':
        return {
          label: 'En Garita / Espera',
          bg: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      case 'en_descarga':
      case 'en_atencion':
        return {
          label: 'En Descarga',
          bg: 'bg-cyan-100 text-cyan-900 border-cyan-300'
        };
      case 'atendido':
        return {
          label: 'Descarga Culminada',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300'
        };
      case 'liquidado':
      case 'liquidada':
        return {
          label: 'Liquidado Conforme',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'cancelada':
        return {
          label: 'Cancelada',
          bg: 'bg-rose-100 text-rose-800 border-rose-300'
        };
      case 'inasistencia':
        return {
          label: 'Inasistencia',
          bg: 'bg-red-100 text-red-800 border-red-300'
        };
      default:
        return {
          label: (status || 'Registrado').toString().replace(/_/g, ' ').toUpperCase(),
          bg: 'bg-slate-100 text-slate-800 border-slate-300'
        };
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Search & Filtering Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Main Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-citas"
              type="text"
              placeholder="Buscar por Orden de Compra, Material, Proveedor, Código o Placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            
            {/* Calendar Date Input Picker + Day Stepper */}
            <div className={`flex items-center rounded-xl border px-2 py-1 transition ${
              selectedDate
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-200'
                : 'bg-slate-50 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => handleShiftSelectedDate(-1)}
                className="p-1 text-slate-500 hover:text-[#00264d] hover:bg-slate-200/70 rounded transition"
                title="Día anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                <Calendar className={`w-3.5 h-3.5 ${selectedDate ? 'text-blue-700' : 'text-slate-500'}`} />
                <input
                  id="input-filtro-fecha-calendario"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedDate(val);
                    if (val) {
                      const parts = val.split('-');
                      if (parts.length === 3) {
                        setCalendarMonth({ year: Number(parts[0]), month: Number(parts[1]) - 1 });
                      }
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  title="Elegir fecha de calendario para ver las citas de ese día"
                />
              </div>

              <button
                type="button"
                onClick={() => handleShiftSelectedDate(1)}
                className="p-1 text-slate-500 hover:text-[#00264d] hover:bg-slate-200/70 rounded transition"
                title="Día siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {selectedDate && (
                <button
                  type="button"
                  onClick={() => setSelectedDate('')}
                  className="ml-1 p-1 text-slate-400 hover:text-red-600 rounded transition"
                  title="Quitar filtro de fecha (Ver todas las fechas)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Interactive Monthly Calendar Toggle Button */}
            <button
              id="btn-toggle-calendario-citas"
              type="button"
              onClick={() => setIsCalendarOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                isCalendarOpen || selectedDate
                  ? 'bg-[#00264d] text-white border-[#00264d] shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="Abrir calendario mensual para ver y elegir citas por fecha"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>

            {/* Urgency Selector */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="todos">Urgencia: Todas</option>
              <option value="Normal">Normal</option>
              <option value="Urgente">🚨 Urgente</option>
            </select>

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="todos">Estado: Todos</option>
              <option value="planif_pendiente">⏳ Planif: Pendiente de Validación</option>
              <option value="planif_validado">✅ Planif: OC Validada en SAP</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_planta">En Planta</option>
              <option value="atendido">Descarga Culminada</option>
              <option value="liquidado">Liquidado</option>
              <option value="inasistencia">Inasistencia (No Asistió)</option>
            </select>

            {/* Sorting toggle */}
            <button
              onClick={() => {
                if (sortField === 'date') setSortAsc(!sortAsc);
                else {
                  setSortField('date');
                  setSortAsc(false);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              title="Ordenar por fecha programada"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Fecha</span>
            </button>

          </div>

        </div>

        {/* Quick Date Selector Bar (Fechas con Citas Programadas) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#00264d]" />
              <span>Ver citas por fecha:</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                !selectedDate
                  ? 'bg-[#00264d] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({roleFilteredAppointments.length})
            </button>

            {availableDatesSorted.map((dateStr) => {
              const info = appointmentsByDate[dateStr];
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleSelectCalendarDate(dateStr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <span>{formatReadableDate(dateStr)}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-100' : 'text-blue-700'}`}>
                    · {info.count} {info.count === 1 ? 'cita' : 'citas'}
                  </span>
                  {info.hasUrgent && (
                    <span className="w-2 h-2 rounded-full bg-[#D32F2F]" title="Incluye cita urgente" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{isCalendarOpen ? 'Ocultar calendario mensual' : 'Elegir en calendario mensual'}</span>
          </button>
        </div>

        {/* Interactive Monthly Calendar Panel */}
        {isCalendarOpen && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#00264d] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#D32F2F]" />
                  <span>Calendario de Programación de Citas — {monthNames[calendarMonth.month]} {calendarMonth.year}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Haga clic en cualquier día del calendario para filtrar y ver las citas programadas en esa fecha.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth((prev) =>
                      prev.month === 0
                        ? { year: prev.year - 1, month: 11 }
                        : { year: prev.year, month: prev.month - 1 }
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                  title="Mes anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-800 min-w-[120px] text-center">
                  {monthNames[calendarMonth.month]} {calendarMonth.year}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarMonth((prev) =>
                      prev.month === 11
                        ? { year: prev.year + 1, month: 0 }
                        : { year: prev.year, month: prev.month + 1 }
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
                  title="Mes siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
              <div>Dom</div>
            </div>

            {/* Monthly Grid Cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => {
                if (!cell.day) {
                  return <div key={`empty-${idx}`} className="h-14 sm:h-16 rounded-lg bg-slate-100/50" />;
                }

                const dayInfo = appointmentsByDate[cell.dateStr];
                const isSelected = selectedDate === cell.dateStr;
                const hasAppointments = Boolean(dayInfo && dayInfo.count > 0);

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => handleSelectCalendarDate(cell.dateStr)}
                    className={`h-14 sm:h-16 p-1.5 rounded-xl border text-left flex flex-col justify-between transition relative ${
                      isSelected
                        ? 'bg-[#00264d] text-white border-[#00264d] ring-2 ring-blue-400 shadow-sm'
                        : hasAppointments
                        ? 'bg-white hover:bg-blue-50 border-blue-300 text-slate-900 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : hasAppointments ? 'text-[#00264d]' : 'text-slate-500'}`}>
                        {cell.day}
                      </span>
                      {dayInfo?.hasUrgent && (
                        <span
                          className="w-2 h-2 rounded-full bg-[#D32F2F]"
                          title="Contiene cita urgente"
                        />
                      )}
                    </div>

                    {hasAppointments ? (
                      <div className="w-full">
                        <span
                          className={`text-[10px] font-bold block truncate ${
                            isSelected ? 'text-blue-200' : 'text-blue-700'
                          }`}
                        >
                          {dayInfo.count} {dayInfo.count === 1 ? 'cita' : 'citas'}
                        </span>
                        <span
                          className={`text-[9px] hidden sm:block truncate ${
                            isSelected ? 'text-slate-200' : 'text-slate-500'
                          }`}
                        >
                          {dayInfo.pallets} palets
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-300 hidden sm:block">Sin citas</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Selected Date Banner & Daily Schedule Summary */}
        {selectedDate && (
          <div className="p-3.5 bg-blue-50/90 border border-blue-200 rounded-xl space-y-3 text-xs text-[#00264d]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  Citas programadas para el <strong className="uppercase">{formatReadableDate(selectedDate)}</strong> ({selectedDate}):{' '}
                  <strong>{filteredAppointments.length}</strong> {filteredAppointments.length === 1 ? 'cita encontrada' : 'citas encontradas'}
                  {filteredAppointments.length > 0 && (
                    <span>
                      {' '}• Total del día: <strong>{filteredAppointments.reduce((acc, a) => acc + (a.palletsCount || 0), 0)} Palets</strong>
                    </span>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-[11px] transition shrink-0 self-start sm:self-center"
              >
                Ver todas las fechas
              </button>
            </div>

            {filteredAppointments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {filteredAppointments.map((apt) => {
                  const statusBadge = getStatusBadge(apt.status);
                  const hora = apt.scheduledTime || apt.requestedTime;
                  return (
                    <div
                      key={`cal-summary-${apt.id}`}
                      className="bg-white p-2.5 rounded-lg border border-blue-200/80 shadow-2xs flex items-center justify-between gap-2 hover:border-blue-400 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-blue-900 bg-blue-100/80 px-1.5 py-0.5 rounded text-[11px]">
                            {hora} hrs
                          </span>
                          <span className="font-bold text-slate-900 truncate">{apt.ticketCode}</span>
                          {apt.urgency === 'Urgente' && (
                            <span className="text-[9px] font-bold text-[#D32F2F] uppercase">· Urgente</span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-slate-800 truncate mt-1" title={apt.supplierName}>
                          {apt.supplierName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          OC #{apt.orderNumber} · {apt.palletsCount} palets · {statusBadge.label}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenPassModal(apt)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-blue-900 transition"
                          title="Ver Pase Digital QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        {(currentUser.role === 'recepcionista' || currentUser.role === 'admin') && (
                          <button
                            type="button"
                            onClick={() => onOpenReceptionistModal(apt)}
                            className="p-1.5 rounded-lg bg-[#00264d] hover:bg-[#001f3f] text-white transition"
                            title="Gestionar Cita"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Counter and filter summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div>
            Mostrando <strong>{filteredAppointments.length}</strong> de {roleFilteredAppointments.length} expedientes de cita
            {isSupplier && <span className="ml-1 text-amber-700 font-semibold">(Vista exclusiva de tu empresa)</span>}
          </div>
          {(searchTerm || statusFilter !== 'todos' || urgencyFilter !== 'todos' || selectedDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setUrgencyFilter('todos');
                setPlantFilter('todos');
                setSelectedDate('');
              }}
              className="text-blue-700 hover:underline font-semibold"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          
          <thead className="bg-[#00264d] text-white uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="py-3.5 px-4">Ticket / OC</th>
              <th className="py-3.5 px-3">Urgencia</th>
              <th className="py-3.5 px-3">Proveedor / RUC</th>
              <th className="py-3.5 px-4">Material y Carga</th>
              <th className="py-3.5 px-3 text-center">Palets</th>
              <th className="py-3.5 px-3">Fecha y Hora</th>
              <th className="py-3.5 px-3">Estado</th>
              <th className="py-3.5 px-3 text-center">PDFs</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No se encontraron citas programadas que coincidan con los criterios de búsqueda.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((apt) => {
                const statusBadge = getStatusBadge(apt.status);
                const fecha = apt.scheduledDate || apt.requestedDate;
                const hora = apt.scheduledTime || apt.requestedTime;

                return (
                  <tr 
                    key={apt.id} 
                    className="hover:bg-blue-50/40 transition group"
                  >
                    
                    {/* Ticket / OC */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-slate-900 font-sans">
                          {apt.ticketCode}
                        </span>
                        {apt.purchaseOrders && apt.purchaseOrders.length > 1 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold">
                            {Array.from(new Set(apt.purchaseOrders.map(p => p.orderNumber))).length} OCs
                          </span>
                        )}
                      </div>

                      {/* Display primary or multi OCs */}
                      {apt.purchaseOrders && apt.purchaseOrders.length > 1 ? (
                        <div className="space-y-0.5">
                          {Array.from(new Set(apt.purchaseOrders.map(p => p.orderNumber))).slice(0, 2).map((oc) => (
                            <span key={oc} className="text-[11px] font-mono text-blue-800 font-bold block">
                              OC #{oc}
                            </span>
                          ))}
                          {Array.from(new Set(apt.purchaseOrders.map(p => p.orderNumber))).length > 2 && (
                            <span className="text-[10px] text-slate-500 italic block">
                              +{Array.from(new Set(apt.purchaseOrders.map(p => p.orderNumber))).length - 2} OC(s) más
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 block">
                            {apt.purchaseOrders.length} posiciones en total
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-[11px] font-mono text-blue-800 font-bold block">
                            OC #{apt.orderNumber}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Posición: {apt.positionNumber}
                          </span>
                        </>
                      )}
                    </td>

                    {/* Urgency Badge */}
                    <td className="py-3.5 px-3">
                      {apt.urgency === 'Urgente' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D32F2F] text-white animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          URGENTE
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          NORMAL
                        </span>
                      )}
                    </td>

                    {/* Supplier */}
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-800 line-clamp-1 max-w-[150px]">
                        {apt.supplierName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        RUC {apt.supplierRuc}
                      </p>
                      {apt.vehiclePlate && (
                        <span className="text-[10px] font-mono text-slate-600 block">
                          Placa: {apt.vehiclePlate}
                        </span>
                      )}
                    </td>

                    {/* Material */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      {apt.purchaseOrders && apt.purchaseOrders.length > 1 ? (
                        <div>
                          <div className="flex items-center gap-1 mb-0.5">
                            <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                              {apt.purchaseOrders[0].materialCode}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              (+{apt.purchaseOrders.length - 1} más)
                            </span>
                          </div>
                          <p className="text-slate-800 line-clamp-1 text-xs font-medium" title={apt.purchaseOrders.map(p => `${p.materialCode}: ${p.materialDescription}`).join(' | ')}>
                            {apt.purchaseOrders[0].materialDescription}
                          </p>
                          <span className="text-[11px] text-blue-800 font-semibold block mt-0.5">
                            Total: {apt.quantity.toLocaleString()} {apt.quantityUnit} ({apt.purchaseOrders.length} ítems)
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-600 block">
                            {apt.materialCode}
                          </span>
                          <p className="text-slate-800 line-clamp-2 text-xs font-medium">
                            {apt.materialDescription}
                          </p>
                          <span className="text-[11px] text-slate-500 font-semibold">
                            {apt.quantity.toLocaleString()} {apt.quantityUnit}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Pallets Count */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-block bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg">
                        <span className="text-sm font-black text-[#00264d] block font-sans">
                          {apt.palletsCount}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-blue-700">
                          Palets
                        </span>
                      </div>
                    </td>

                    {/* Scheduled Date/Time */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fecha}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{hora} hrs</span>
                      </div>
                      {apt.reception.dockAssigned && (
                        <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                          {apt.reception.dockAssigned.split('-')[0]}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge?.bg || 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                        {statusBadge?.label || apt.status || 'Registrado'}
                      </span>
                      {apt.reception.arrivalDateTime && (
                        <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                          ✓ En planta
                        </span>
                      )}

                      {/* Indicador de Validación de Planificación */}
                      {apt.planningValidation?.isValidated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-1 block" title={`Validado por ${apt.planningValidation.validatorName || 'Planificación'}`}>
                          <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                          <span>OC Validada</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 mt-1 block" title="Pendiente de validación de OCs por Planificación">
                          <AlertCircle className="w-3 h-3 text-amber-600 inline" />
                          <span>Planif: Pendiente</span>
                        </span>
                      )}
                    </td>

                    {/* PDF Attachments */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenPdfViewer(apt)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition shadow-2xs"
                          title="Ver y revisar documentos PDF del proveedor"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-600" />
                          <span>{apt.pdfAttachments?.length || 0}</span>
                        </button>
                        {apt.pdfAttachments && apt.pdfAttachments.length > 0 && (
                          <button
                            onClick={() => downloadAllAttachments(apt)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-700 transition"
                            title="Descargar todos los documentos PDF de esta cita"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Role-Aware Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      
                      {/* Planificación / Admin: Validar Órdenes de Compra en SAP */}
                      {(currentUser.role === 'planificacion' || currentUser.role === 'admin') && onOpenPlanningModal && (
                        <button
                          onClick={() => onOpenPlanningModal(apt)}
                          className={`px-2.5 py-1.5 rounded-lg text-white text-[11px] font-bold transition shadow-xs inline-flex items-center gap-1 ${
                            apt.planningValidation?.isValidated
                              ? 'bg-emerald-700 hover:bg-emerald-800'
                              : 'bg-amber-600 hover:bg-amber-700 ring-2 ring-amber-400/50'
                          }`}
                          title="Validar Órdenes de Compra en SAP Gloria"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>{apt.planningValidation?.isValidated ? 'OC Validada' : 'Validar OC'}</span>
                        </button>
                      )}

                      {/* Recepcionista or Admin Actions: Confirm / Modify time & Plant registration */}
                      {(currentUser.role === 'recepcionista' || currentUser.role === 'admin') && (
                        <button
                          onClick={() => onOpenReceptionistModal(apt)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#00264d] hover:bg-[#001f3f] text-white text-[11px] font-bold transition shadow-xs inline-flex items-center gap-1"
                          title="Gestionar Cita y Registro Operativo"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Gestionar</span>
                        </button>
                      )}

                      {/* Supplier or All: View Digital Pass / QR */}
                      <button
                        onClick={() => onOpenPassModal(apt)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-blue-900 border border-slate-200 transition"
                        title="Ver Pase Digital con QR"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {/* Audit History */}
                      <button
                        onClick={() => onOpenAuditHistory(apt)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                        title="Ver Historial Detallado de Cambios (Auditoría)"
                      >
                        <History className="w-4 h-4" />
                      </button>

                      {/* Email Notification - Solo ADMINISTRADOR y RECEPCIONISTA */}
                      {(currentUser.role === 'admin' || currentUser.role === 'recepcionista') && (
                        <button
                          onClick={() => onOpenEmailModal(apt)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-blue-700 border border-slate-200 transition"
                          title="Notificar por Correo (Gmail / Outlook)"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      )}

                      {/* Admin Delete */}
                      {currentUser.role === 'admin' && onDeleteAppointment && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Desea eliminar la cita ${apt.ticketCode}?`)) {
                              onDeleteAppointment(apt.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Eliminar Expediente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </td>

                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW */}
      <div className="block lg:hidden space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No se encontraron citas que coincidan con la búsqueda.
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const statusBadge = getStatusBadge(apt.status);
            const fecha = apt.scheduledDate || apt.requestedDate;
            const hora = apt.scheduledTime || apt.requestedTime;

            return (
              <div 
                key={apt.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{apt.ticketCode}</span>
                      {apt.urgency === 'Urgente' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D32F2F] text-white">
                          URGENTE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                          NORMAL
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      {apt.purchaseOrders && apt.purchaseOrders.length > 1 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                            {Array.from(new Set(apt.purchaseOrders.map(p => p.orderNumber))).length} OCs ({apt.purchaseOrders.length} posiciones)
                          </span>
                          <span className="text-[11px] font-mono text-blue-800 font-bold">
                            {Array.from(new Set(apt.purchaseOrders.map(p => p.orderNumber))).join(', ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-bold text-blue-700 block">
                          OC #{apt.orderNumber} (Pos: {apt.positionNumber})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusBadge?.bg || 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                      {statusBadge?.label || apt.status || 'Registrado'}
                    </span>
                    {apt.planningValidation?.isValidated ? (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                        <span>OC OK</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        <span>Planif. Pend.</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body Details */}
                <div className="text-xs space-y-1.5">
                  <p className="text-slate-800 font-semibold">{apt.supplierName}</p>
                  
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    {apt.purchaseOrders && apt.purchaseOrders.length > 1 ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 border-b border-slate-200 pb-1">
                          <span>Detalle de {apt.purchaseOrders.length} Ítems:</span>
                          <span className="text-[10px] text-slate-500 font-normal">{apt.quantity.toLocaleString()} {apt.quantityUnit} tot.</span>
                        </div>
                        {apt.purchaseOrders.map((item, idx) => (
                          <div key={item.id || idx} className="text-[11px] py-1 border-b border-slate-100 last:border-0 flex justify-between gap-2">
                            <div>
                              <span className="font-mono font-bold text-slate-700 block">
                                OC {item.orderNumber} (Pos {item.positionNumber}): {item.materialCode}
                              </span>
                              <span className="text-slate-600 line-clamp-1">{item.materialDescription}</span>
                            </div>
                            <span className="font-bold text-blue-800 whitespace-nowrap">
                              {item.palletsCount} pal.
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="font-mono text-[11px] text-slate-600 font-bold">{apt.materialCode}</p>
                        <p className="text-slate-800 font-medium line-clamp-2">{apt.materialDescription}</p>
                      </>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-200 text-xs">
                      <span>{apt.quantity.toLocaleString()} {apt.quantityUnit}</span>
                      <strong className="text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-black">
                        {apt.palletsCount} PALETS TOTALES
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{fecha}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{hora} hrs</span>
                    </div>
                  </div>

                  {apt.reception.arrivalDateTime && (
                    <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded border border-emerald-200">
                      Llegada registrada: {new Date(apt.reception.arrivalDateTime).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })} hrs
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenPdfViewer(apt)}
                      className="px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 text-red-700 hover:bg-red-100 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      <span>PDFs ({apt.pdfAttachments?.length || 0})</span>
                    </button>

                    {apt.pdfAttachments && apt.pdfAttachments.length > 0 && (
                      <button
                        onClick={() => downloadAllAttachments(apt)}
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition"
                        title="Descargar todos los documentos PDF"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-700" />
                      </button>
                    )}

                    <button
                      onClick={() => onOpenPassModal(apt)}
                      className="p-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200"
                      title="Ver Pase Digital QR"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenAuditHistory(apt)}
                      className="p-1.5 bg-slate-100 text-slate-700 rounded-lg"
                      title="Historial de Auditoría"
                    >
                      <History className="w-4 h-4" />
                    </button>

                    {/* Email Notification - Solo ADMINISTRADOR y RECEPCIONISTA */}
                    {(currentUser.role === 'admin' || currentUser.role === 'recepcionista') && (
                      <button
                        onClick={() => onOpenEmailModal(apt)}
                        className="p-1.5 bg-blue-50 text-blue-700 rounded-lg"
                        title="Notificación Correo"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Planificación / Admin: Validar Órdenes de Compra */}
                    {(currentUser.role === 'planificacion' || currentUser.role === 'admin') && onOpenPlanningModal && (
                      <button
                        onClick={() => onOpenPlanningModal(apt)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1 text-white ${
                          apt.planningValidation?.isValidated
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{apt.planningValidation?.isValidated ? 'OC Validada' : 'Validar OC'}</span>
                      </button>
                    )}

                    {/* Operational Action for Receptionist or Admin */}
                    {(currentUser.role === 'recepcionista' || currentUser.role === 'admin') && (
                      <button
                        onClick={() => onOpenReceptionistModal(apt)}
                        className="px-3.5 py-1.5 bg-[#00264d] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Gestionar</span>
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
