import React, { useState } from 'react';
import { 
  X, 
  History, 
  User, 
  Clock, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import { AppointmentRequest, AuditLogEntry } from '../types';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRequest;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('todos');

  const history = [...appointment.auditHistory].reverse(); // newest first

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = 
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.notes && entry.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.fieldChanged && entry.fieldChanged.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'todos' || entry.userRole === filterRole;

    return matchesSearch && matchesRole;
  });

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return iso;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'recepcionista':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'proveedor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-900/80 text-blue-200 border border-blue-700">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Historial de Cambios y Trazabilidad (Auditoría)
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-800 text-[11px] font-semibold text-blue-100">
                  {appointment.ticketCode}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Registro inmutable de modificaciones para la OC #{appointment.orderNumber} (Posición {appointment.positionNumber})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción, campo o nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filtrar por rol:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="todos">Todos los Roles</option>
              <option value="admin">Administrador</option>
              <option value="recepcionista">Recepcionista</option>
              <option value="proveedor">Proveedor</option>
            </select>
          </div>
        </div>

        {/* Timeline body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 text-slate-800 space-y-4">
          
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron registros de auditoría que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {filteredHistory.map((entry, idx) => (
                <div key={entry.id || idx} className="relative group">
                  
                  {/* Dot on timeline */}
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs ring-2 ring-blue-100" />

                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs transition hover:border-blue-300 hover:shadow-sm">
                    
                    {/* Entry Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {entry.action}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getRoleBadge(entry.userRole)}`}>
                          {entry.userRole.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDateTime(entry.timestamp)}</span>
                      </div>
                    </div>

                    {/* Actor Details */}
                    <p className="text-xs text-slate-600 mb-2.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Responsable: <strong>{entry.userName}</strong></span>
                    </p>

                    {/* Values Diff (if any) */}
                    {(entry.previousValue || entry.newValue) && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs my-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          {entry.fieldChanged || 'Cambio registrado'}:
                        </span>
                        
                        {entry.previousValue && (
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded line-through text-[11px]">
                            {entry.previousValue}
                          </span>
                        )}

                        {entry.previousValue && entry.newValue && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}

                        {entry.newValue && (
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded text-[11px]">
                            {entry.newValue}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {entry.notes && (
                      <p className="text-xs text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 mt-2 italic">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Registro conforme a estándares de trazabilidad y seguridad Gloria S.A.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
