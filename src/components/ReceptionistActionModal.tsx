import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Clock, 
  Truck, 
  FileCheck, 
  AlertCircle, 
  Save, 
  Calendar, 
  Send,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Download,
  Eye,
  ExternalLink,
  ShieldCheck,
  FileDown,
  Check
} from 'lucide-react';
import { AppointmentRequest, User, AppointmentStatus, AuditLogEntry, PdfAttachment } from '../types';
import { downloadAttachment, downloadAllAttachments } from '../utils/pdfHelper';

interface ReceptionistActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRequest;
  currentUser: User;
  onSave: (updated: AppointmentRequest, triggeredEvent?: string) => void;
  onOpenEmail: (appointment: AppointmentRequest, eventType: any) => void;
  onOpenPdfViewer?: (appointment: AppointmentRequest, initialAttachmentId?: string) => void;
}

const AVAILABLE_DOCKS = [
  'Bahía 01 - Rampa Principal (Insumos Secos)',
  'Bahía 02 - Hojalatas y Envases Metálicos',
  'Bahía 03 - Cartones y Cajas Master',
  'Bahía 04 - Químicos e Insumos Industriales',
  'Bahía 05 - Cisternas e Ingrediente Líquido',
  'Bahía 06 - Rampa de Despacho Rápido'
];

export const ReceptionistActionModal: React.FC<ReceptionistActionModalProps> = ({
  isOpen,
  onClose,
  appointment,
  currentUser,
  onSave,
  onOpenEmail,
  onOpenPdfViewer
}) => {
  if (!isOpen) return null;

  // 1. Scheduled Date & Time
  const [scheduledDate, setScheduledDate] = useState(
    appointment.scheduledDate || appointment.requestedDate
  );
  const [scheduledTime, setScheduledTime] = useState(
    appointment.scheduledTime || appointment.requestedTime
  );
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [dockAssigned, setDockAssigned] = useState(
    appointment.reception.dockAssigned || AVAILABLE_DOCKS[0]
  );
  const [newStatus, setNewStatus] = useState<AppointmentStatus>(appointment.status);

  // Helper to format ISO to datetime-local input string
  const toInputDateTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [arrivalDateTime, setArrivalDateTime] = useState(
    toInputDateTime(appointment.reception.arrivalDateTime)
  );
  const [attentionEndDateTime, setAttentionEndDateTime] = useState(
    toInputDateTime(appointment.reception.attentionEndDateTime)
  );
  const [liquidationEndDateTime, setLiquidationEndDateTime] = useState(
    toInputDateTime(appointment.reception.liquidationEndDateTime)
  );
  const [receptionObservation, setReceptionObservation] = useState(
    appointment.reception.receptionObservation || ''
  );
  const [isNoShow, setIsNoShow] = useState<boolean>(
    appointment.status === 'inasistencia' || Boolean(appointment.reception?.isNoShow)
  );
  const [noShowReason, setNoShowReason] = useState<string>(
    appointment.reception?.noShowReason || 'Unidad de transporte no se presentó en garita de control dentro de la ventana programada.'
  );

  const [activeTab, setActiveTab] = useState<'programacion' | 'operativo' | 'documentos'>('programacion');
  const attachments = appointment.pdfAttachments || [];
  const [selectedDocId, setSelectedDocId] = useState<string>(attachments[0]?.id || '');
  const [verifiedDocIds, setVerifiedDocIds] = useState<string[]>([]);
  const currentSelectedDoc = attachments.find(a => a.id === selectedDocId) || attachments[0];

  const toggleVerifyDoc = (id: string) => {
    setVerifiedDocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Helper to set "Now"
  const setNow = (setter: (val: string) => void) => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    setter(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`);
  };

  // Lead time calculations
  const calculateDurations = () => {
    if (!arrivalDateTime) return null;
    const arr = new Date(arrivalDateTime).getTime();
    let attentionDurationMin: number | null = null;
    let liquidationDurationMin: number | null = null;
    let totalStayMin: number | null = null;

    if (attentionEndDateTime) {
      const attEnd = new Date(attentionEndDateTime).getTime();
      attentionDurationMin = Math.max(0, Math.round((attEnd - arr) / 60000));
    }

    if (liquidationEndDateTime && attentionEndDateTime) {
      const attEnd = new Date(attentionEndDateTime).getTime();
      const liqEnd = new Date(liquidationEndDateTime).getTime();
      liquidationDurationMin = Math.max(0, Math.round((liqEnd - attEnd) / 60000));
    }

    if (liquidationEndDateTime) {
      const liqEnd = new Date(liquidationEndDateTime).getTime();
      totalStayMin = Math.max(0, Math.round((liqEnd - arr) / 60000));
    }

    return { attentionDurationMin, liquidationDurationMin, totalStayMin };
  };

  const durations = calculateDurations();

  // Save changes and generate audit trail
  const handleSave = () => {
    const nowIso = new Date().toISOString();
    const newAuditEntries: AuditLogEntry[] = [];

    const originalDate = appointment.scheduledDate || appointment.requestedDate;
    const originalTime = appointment.scheduledTime || appointment.requestedTime;
    const timeChanged = scheduledDate !== originalDate || scheduledTime !== originalTime;

    let triggeredNotificationEvent: any = undefined;

    if (timeChanged) {
      newAuditEntries.push({
        id: `aud-${Date.now()}-time`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Modificación de Horario de Cita',
        fieldChanged: 'Fecha y Hora de Cita',
        previousValue: `${originalDate} ${originalTime}`,
        newValue: `${scheduledDate} ${scheduledTime} (${dockAssigned})`,
        notes: rescheduleReason ? `Motivo: ${rescheduleReason}` : 'Horario ajustado por recepcionista según capacidad de rampa.'
      });
      triggeredNotificationEvent = 'hora_modificada';
    }

    const isPlanningValidated = Boolean(appointment.planningValidation?.isValidated);

    let finalStatus: AppointmentStatus = newStatus;
    if (appointment.status === 'pendiente' && newStatus === 'pendiente') {
      if (!isPlanningValidated && !isNoShow) {
        alert('⚠️ ACCESO BLOQUEADO: Las Órdenes de Compra de esta cita deben ser validadas por el perfil PLANIFICACIÓN antes de que el usuario RECEPCIONISTA pueda confirmar la Cita en planta.');
        return;
      }
      finalStatus = 'confirmada';
      newAuditEntries.push({
        id: `aud-${Date.now()}-conf`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Confirmación de Solicitud de Cita',
        fieldChanged: 'Estado',
        previousValue: 'Pendiente',
        newValue: 'Confirmada',
        notes: `Cita aprobada para ${scheduledDate} a las ${scheduledTime} hrs en ${dockAssigned}. Validada previamente por Planificación (${appointment.planningValidation?.validatorName || 'Planificación'}).`
      });
      if (!triggeredNotificationEvent) triggeredNotificationEvent = 'cita_confirmada';
    }

    if (arrivalDateTime && (!appointment.reception.arrivalDateTime || toInputDateTime(appointment.reception.arrivalDateTime) !== arrivalDateTime)) {
      newAuditEntries.push({
        id: `aud-${Date.now()}-arr`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Registro de Llegada del Proveedor (Check-in en Garita)',
        fieldChanged: 'arrivalDateTime',
        previousValue: appointment.reception.arrivalDateTime || 'Sin llegada registrada',
        newValue: arrivalDateTime,
        notes: 'Vehículo registrado en garita de control de accesos Gloria S.A.'
      });
      finalStatus = 'en_planta';
      if (!triggeredNotificationEvent) triggeredNotificationEvent = 'llegada_registrada';
    }

    if (attentionEndDateTime && (!appointment.reception.attentionEndDateTime || toInputDateTime(appointment.reception.attentionEndDateTime) !== attentionEndDateTime)) {
      newAuditEntries.push({
        id: `aud-${Date.now()}-att`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Registro de Término de Atención y Descarga Física',
        fieldChanged: 'attentionEndDateTime',
        previousValue: appointment.reception.attentionEndDateTime || 'En atención',
        newValue: attentionEndDateTime,
        notes: `Descarga completada de los ${appointment.palletsCount} palets en ${dockAssigned}.`
      });
      if (finalStatus !== 'liquidado') finalStatus = 'atendido';
      if (!triggeredNotificationEvent) triggeredNotificationEvent = 'atencion_terminada';
    }

    if (liquidationEndDateTime && (!appointment.reception.liquidationEndDateTime || toInputDateTime(appointment.reception.liquidationEndDateTime) !== liquidationEndDateTime)) {
      newAuditEntries.push({
        id: `aud-${Date.now()}-liq`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Registro de Término de Liquidación Documentaria',
        fieldChanged: 'liquidationEndDateTime',
        previousValue: appointment.reception.liquidationEndDateTime || 'Pendiente liquidar',
        newValue: liquidationEndDateTime,
        notes: receptionObservation ? `Observación: ${receptionObservation}` : 'Conformidad de ingreso en SAP Gloria.'
      });
      finalStatus = 'liquidado';
      triggeredNotificationEvent = 'liquidacion_terminada';
    }

    if (receptionObservation !== (appointment.reception.receptionObservation || '')) {
      newAuditEntries.push({
        id: `aud-${Date.now()}-obs`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Actualización de Observación de Recepción',
        fieldChanged: 'receptionObservation',
        previousValue: appointment.reception.receptionObservation || 'Ninguna',
        newValue: receptionObservation,
        notes: 'Nota del recepcionista guardada.'
      });
    }

    // Inasistencia override
    if (isNoShow) {
      finalStatus = 'inasistencia';
      newAuditEntries.push({
        id: `aud-${Date.now()}-noshow`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Registro de Inasistencia de Proveedor en Planta',
        fieldChanged: 'Estado de Operación',
        previousValue: appointment.status,
        newValue: 'Inasistencia',
        notes: `Inasistencia registrada en control operativo: ${noShowReason}`
      });
      triggeredNotificationEvent = 'inasistencia';
    } else if (appointment.status === 'inasistencia' && !isNoShow) {
      newAuditEntries.push({
        id: `aud-${Date.now()}-undonoshow`,
        timestamp: nowIso,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'Reversión de Inasistencia',
        fieldChanged: 'Estado de Operación',
        previousValue: 'Inasistencia',
        newValue: finalStatus,
        notes: 'Se retiró la marca de inasistencia para continuar con la atención en planta.'
      });
    }

    const updated: AppointmentRequest = {
      ...appointment,
      lastUpdated: nowIso,
      status: finalStatus,
      scheduledDate,
      scheduledTime,
      reception: {
        ...appointment.reception,
        dockAssigned,
        receptionistId: currentUser.id,
        receptionistName: currentUser.name,
        arrivalDateTime: isNoShow ? undefined : (arrivalDateTime ? new Date(arrivalDateTime).toISOString() : appointment.reception.arrivalDateTime),
        attentionEndDateTime: isNoShow ? undefined : (attentionEndDateTime ? new Date(attentionEndDateTime).toISOString() : appointment.reception.attentionEndDateTime),
        liquidationEndDateTime: isNoShow ? undefined : (liquidationEndDateTime ? new Date(liquidationEndDateTime).toISOString() : appointment.reception.liquidationEndDateTime),
        receptionObservation: receptionObservation.trim(),
        isNoShow: Boolean(isNoShow),
        noShowReason: isNoShow ? noShowReason : undefined,
        noShowRegisteredAt: isNoShow ? (appointment.reception.noShowRegisteredAt || nowIso) : undefined
      },
      auditHistory: [...appointment.auditHistory, ...newAuditEntries]
    };

    onSave(updated, triggeredNotificationEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Gestión de Recepción y Control en Planta
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                appointment.urgency === 'Urgente' ? 'bg-[#D32F2F] text-white' : 'bg-blue-800 text-blue-100'
              }`}>
                {appointment.urgency}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Expediente: {appointment.ticketCode}
            </h2>
            <p className="text-xs text-slate-300">
              {appointment.supplierName} • {appointment.purchaseOrders?.length || 1} Ítems / Órdenes ({appointment.palletsCount} Palets Totales)
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('programacion')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'programacion'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Horario y Bahía</span>
          </button>

          <button
            onClick={() => setActiveTab('operativo')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'operativo'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>2. Registro Operativo en Planta</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'documentos' ? 'text-red-600' : 'text-slate-400'}`} />
            <span>3. Documentos del Proveedor</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              attachments.length > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {attachments.length}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-5 text-slate-800">
          
          {activeTab === 'programacion' ? (
            <div className="space-y-4">
              {/* Estado de Validación por Planificación */}
              {appointment.planningValidation?.isValidated ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-900">Órdenes de Compra Validadas por Planificación: </span>
                    {appointment.planningValidation.notes || 'Validado conforme en SAP R/3 Gloria.'}
                    <span className="block text-[11px] text-emerald-700 mt-0.5 font-medium">
                      Revisor: <strong>{appointment.planningValidation.validatorName || 'Lic. Roberto Mendoza'}</strong> • Habilitado para confirmación y asignación de bahía.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-900 block text-xs">
                      ⚠️ REQUISITO PREVIO: Pendiente de Validación por el Perfil PLANIFICACIÓN
                    </span>
                    <p className="text-amber-800 text-[11px]">
                      Las Órdenes de Compra de este proveedor aún no han sido aprobadas en SAP por el área de Planificación. 
                      Según las normas operativas de Leche Gloria S.A., <strong>el Recepcionista no puede confirmar la cita</strong> hasta que Planificación otorgue el visto bueno.
                    </p>
                    {appointment.planningValidation?.status === 'observado' && (
                      <p className="text-red-700 font-semibold text-[11px]">
                        Observación de Planificación: {appointment.planningValidation.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Resumen de Documentos del Proveedor */}
              <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Documentación Digital Adjunta por el Proveedor
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {attachments.length} archivo(s)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {attachments.map(a => a.documentType).join(', ') || 'Sin documentos adjuntos'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {attachments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => downloadAllAttachments(appointment)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-2xs"
                      title="Descargar todos los documentos adjuntos"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span className="hidden sm:inline">Descargar Todos</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('documentos')}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Documentos ({attachments.length})</span>
                  </button>
                </div>
              </div>

              {/* Detalle de Órdenes de Compra y Materiales de esta Cita */}
              <div className="bg-slate-100 rounded-xl p-3.5 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-[#00264d] uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-700" />
                    Órdenes de Compra Asociadas a esta Cita ({appointment.purchaseOrders?.length || 1})
                  </span>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    Total: {appointment.palletsCount} Palets
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px] uppercase">
                      <tr>
                        <th className="py-2 px-2.5">N° OC</th>
                        <th className="py-2 px-2">Pos.</th>
                        <th className="py-2 px-2.5">Código</th>
                        <th className="py-2 px-3">Descripción Material</th>
                        <th className="py-2 px-2.5 text-right">Cantidad</th>
                        <th className="py-2 px-2.5 text-right">Palets</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {(appointment.purchaseOrders && appointment.purchaseOrders.length > 0
                        ? appointment.purchaseOrders
                        : [{
                            id: 'single',
                            orderNumber: appointment.orderNumber,
                            positionNumber: appointment.positionNumber,
                            materialCode: appointment.materialCode,
                            materialDescription: appointment.materialDescription,
                            quantity: appointment.quantity,
                            quantityUnit: appointment.quantityUnit,
                            palletsCount: appointment.palletsCount
                          }]
                      ).map((po, idx) => (
                        <tr key={po.id || idx} className="hover:bg-slate-50">
                          <td className="py-2 px-2.5 font-mono font-bold text-blue-800">{po.orderNumber}</td>
                          <td className="py-2 px-2 font-mono text-center">{po.positionNumber}</td>
                          <td className="py-2 px-2.5 font-mono text-slate-600">{po.materialCode}</td>
                          <td className="py-2 px-3 text-slate-800 max-w-[200px] truncate">{po.materialDescription}</td>
                          <td className="py-2 px-2.5 text-right text-slate-700">{po.quantity.toLocaleString()} {po.quantityUnit}</td>
                          <td className="py-2 px-2.5 text-right font-bold text-[#00264d]">{po.palletsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comparison Requested vs Scheduled */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Horario Solicitado por el Proveedor:
                  </span>
                  <p className="text-base font-bold text-slate-800">
                    {appointment.requestedDate} a las {appointment.requestedTime} hrs
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    Sede: {appointment.plantLocation}
                  </p>
                  <p className="text-xs text-slate-600">
                    Urgencia: <strong className={appointment.urgency === 'Urgente' ? 'text-red-700' : 'text-blue-700'}>{appointment.urgency}</strong>
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border-2 border-blue-300 shadow-xs">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-2">
                    Horario Aprobado / Reprogramado por Recepción:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">
                        Fecha Programada
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">
                        Hora Programada
                      </label>
                      <select
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                      >
                        <option value="07:00">07:00 AM</option>
                        <option value="07:40">07:40 AM</option>
                        <option value="08:20">08:20 AM</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="09:40">09:40 AM</option>
                        <option value="10:20">10:20 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:40">11:40 AM</option>
                        <option value="12:20">12:20 PM</option>
                        <option value="13:00">13:00 PM</option>
                        <option value="13:40">13:40 PM</option>
                        <option value="14:20">14:20 PM</option>
                        <option value="15:00">15:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-[11px] text-slate-600 font-semibold block mb-0.5">
                      Bahía / Rampa Asignada
                    </label>
                    <select
                      value={dockAssigned}
                      onChange={(e) => setDockAssigned(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {AVAILABLE_DOCKS.map((dock) => (
                        <option key={dock} value={dock}>
                          {dock}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Justification if time was changed */}
              {(scheduledDate !== appointment.requestedDate || scheduledTime !== appointment.requestedTime) && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <label className="block text-xs font-bold text-amber-900 mb-1">
                    Motivo del Ajuste de Horario (Se notificará al proveedor) *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Congestión de rampa en turno matutino, reprogramado para 2do turno."
                    value={rescheduleReason}
                    onChange={(e) => setRescheduleReason(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>
          ) : activeTab === 'operativo' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Control Operativo en Garita y Almacén: </span>
                  Registre en tiempo real cada hito de la unidad: llegada del camión a garita, término de descarga física y término de liquidación documental. También puede registrar la inasistencia si el transportista no se presenta.
                </div>
              </div>

              {/* Registro Operativo: Control de Inasistencia (No Asistió) */}
              <div className={`p-4 rounded-xl border transition-all ${
                isNoShow 
                  ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${isNoShow ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        Control de Asistencia de la Unidad en Planta
                        {isNoShow && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                            Inasistencia Marcada
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Si el transportista no llegó a garita dentro del horario o se canceló por incumplimiento, registre la inasistencia.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="btn-toggle-inasistencia"
                    onClick={() => setIsNoShow(!isNoShow)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                      isNoShow
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300'
                    }`}
                  >
                    {isNoShow ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Inasistencia Activa (Clic para revertir)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>Registrar Inasistencia</span>
                      </>
                    )}
                  </button>
                </div>

                {isNoShow && (
                  <div className="mt-3 pt-3 border-t border-red-200 space-y-2">
                    <label className="text-xs font-bold text-red-950 block">
                      Causa / Motivo de la Inasistencia:
                    </label>
                    <select
                      value={noShowReason}
                      onChange={(e) => setNoShowReason(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-800 font-medium"
                    >
                      <option value="Unidad de transporte no se presentó en garita de control dentro de la ventana programada.">
                        Unidad de transporte no se presentó en garita dentro de la ventana programada
                      </option>
                      <option value="Proveedor canceló de imprevisto por fallas mecánicas o logísticas del transporte.">
                        Falla mecánica o indisponibilidad reportada por el proveedor
                      </option>
                      <option value="Llegada con retraso severo fuera de tolerancia - Capacidad de rampa saturada.">
                        Llegada con retraso severo fuera de tolerancia horaria
                      </option>
                      <option value="Incumplimiento de requisitos de ingreso en garita (Falta SCTR, EPP o revisión técnica).">
                        Incumplimiento de requisitos de seguridad en garita (SCTR, EPP o revisión técnica)
                      </option>
                      <option value="Falta de Guía de Remisión física y documentación reglamentaria en garita.">
                        Falta de Guía de Remisión física o documentación de respaldo en garita
                      </option>
                      <option value="Sin comunicación ni respuesta telefónica de parte del proveedor/conductor.">
                        Sin respuesta de comunicación de parte del proveedor o transportista
                      </option>
                      <option value="Otro motivo operacional consignado por recepcionista de planta.">
                        Otro motivo operacional consignado por el recepcionista
                      </option>
                    </select>

                    <div className="p-2.5 bg-red-100/80 rounded-lg text-[11px] text-red-900">
                      ⚠️ Al guardar, el estado de la cita cambiará a <strong>INASISTENCIA</strong>, cerrando la rampa asignada y registrando el evento en el historial de auditoría.
                    </div>
                  </div>
                )}
              </div>

              {/* Acceso Rápido a Documentos del Proveedor */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-100 text-red-700 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Documentos de Soporte para Descarga y Garita ({attachments.length})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Revise la Guía de Remisión y Factura para cotejar con la carga física del camión
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {attachments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => downloadAllAttachments(appointment)}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                      title="Descargar todos los documentos"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      <span className="hidden sm:inline">Descargar Todos</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('documentos')}
                    className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Documentos ({attachments.length})</span>
                  </button>
                </div>
              </div>

              {/* Milestone 1: Llegada del proveedor */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">1</span>
                    Fecha y Hora a la que Llegó el Proveedor (Check-in Garita)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNow(setArrivalDateTime)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded border border-blue-200 transition"
                  >
                    Marcar Hora Actual
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={arrivalDateTime}
                  onChange={(e) => setArrivalDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-sans"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Hora en que la unidad ingresa a las instalaciones de Gloria S.A.
                </span>
              </div>

              {/* Milestone 2: Término de atención / descarga */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">2</span>
                    Fecha y Hora de Término de Atención (Fin de Descarga Física)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNow(setAttentionEndDateTime)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded border border-blue-200 transition"
                  >
                    Marcar Hora Actual
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={attentionEndDateTime}
                  onChange={(e) => setAttentionEndDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-sans"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Momento en que se desocupa la bahía de descarga de los {appointment.palletsCount} palets.
                </span>
              </div>

              {/* Milestone 3: Término de liquidación */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">3</span>
                    Fecha y Hora de Término de Liquidación (Cierre Documental)
                  </label>
                  <button
                    type="button"
                    onClick={() => setNow(setLiquidationEndDateTime)}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold rounded border border-blue-200 transition"
                  >
                    Marcar Hora Actual
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={liquidationEndDateTime}
                  onChange={(e) => setLiquidationEndDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-sans"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Firma de conformidad en SAP Gloria, sello de Guías y salida del proveedor.
                </span>
              </div>

              {/* Observación Opcional */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Observación de Recepción (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={receptionObservation}
                  onChange={(e) => setReceptionObservation(e.target.value)}
                  placeholder="Ej: Se recepcionó con precinto intacto. 24 palets conformes sin observaciones de calidad..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* Live KPI lead time summary */}
              {durations && (
                <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1.5">
                  <p className="font-bold text-blue-300 text-[11px] uppercase tracking-wider">
                    Cálculo de Tiempos Operativos en Planta:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Descarga Física</span>
                      <strong className="text-sm text-emerald-400">
                        {durations.attentionDurationMin !== null ? `${durations.attentionDurationMin} min` : 'En curso'}
                      </strong>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Liquidación SAP</span>
                      <strong className="text-sm text-blue-400">
                        {durations.liquidationDurationMin !== null ? `${durations.liquidationDurationMin} min` : 'Pendiente'}
                      </strong>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-400 block">Permanencia Total</span>
                      <strong className="text-sm text-amber-300">
                        {durations.totalStayMin !== null ? `${durations.totalStayMin} min` : 'En planta'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 3: DOCUMENTOS DEL PROVEEDOR */
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#D32F2F] text-white shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      Documentación Cargada por el Proveedor
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black">
                        {attachments.length} archivo(s)
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      RUC: <span className="font-mono font-semibold text-slate-800">{appointment.supplierRuc}</span> • Proveedor: <strong className="text-slate-800">{appointment.supplierName}</strong>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Los archivos adjuntados respaldan la orden de compra y el control de ingreso a las plantas de Gloria.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {attachments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => downloadAllAttachments(appointment)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                      title="Descargar todos los archivos PDF del proveedor en un clic"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-300" />
                      <span>Descargar Todos ({attachments.length})</span>
                    </button>
                  )}

                  {onOpenPdfViewer && (
                    <button
                      type="button"
                      onClick={() => onOpenPdfViewer(appointment, selectedDocId)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-semibold transition shadow-2xs"
                      title="Abrir visor completo de documentos"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden sm:inline">Visor Completo</span>
                    </button>
                  )}
                </div>
              </div>

              {attachments.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No se adjuntaron documentos</p>
                  <p className="text-xs text-slate-500 mt-1">
                    El proveedor no subió archivos PDF al registrar esta solicitud de cita.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left: Document list */}
                  <div className="md:col-span-5 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                      Archivos del Proveedor ({attachments.length}):
                    </span>

                    {attachments.map((file) => {
                      const isSelected = (currentSelectedDoc?.id === file.id);
                      const isVerified = verifiedDocIds.includes(file.id);

                      return (
                        <div
                          key={file.id}
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-400/40 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                          onClick={() => setSelectedDocId(file.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2.5 truncate">
                              <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                                isSelected ? 'bg-[#D32F2F] text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 truncate" title={file.name}>
                                  {file.name}
                                </p>
                                <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded mt-0.5">
                                  {file.documentType}
                                </span>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {(file.sizeBytes / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString('es-PE')}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleVerifyDoc(file.id);
                              }}
                              className={`p-1 rounded-md transition ${
                                isVerified ? 'text-emerald-700 bg-emerald-100' : 'text-slate-300 hover:text-slate-600'
                              }`}
                              title={isVerified ? 'Documento verificado conforme' : 'Marcar como verificado'}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              {file.fileDataUrl ? 'PDF original subido' : 'Documento certificado'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadAttachment(appointment, file);
                                }}
                                className="px-2.5 py-1 text-[11px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition inline-flex items-center gap-1"
                                title="Descargar este archivo PDF a su equipo"
                              >
                                <Download className="w-3 h-3" />
                                <span>Descargar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Embedded Preview / Inspector */}
                  <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
                    {currentSelectedDoc ? (
                      <div>
                        {/* Top bar */}
                        <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-bold truncate">{currentSelectedDoc.name}</span>
                            <span className="hidden sm:inline text-[10px] text-slate-400">
                              ({(currentSelectedDoc.sizeBytes / 1024).toFixed(1)} KB)
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => downloadAttachment(appointment, currentSelectedDoc)}
                              className="px-3 py-1 bg-[#D32F2F] hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar PDF</span>
                            </button>
                          </div>
                        </div>

                        {/* Document Content */}
                        {currentSelectedDoc.fileDataUrl ? (
                          <div className="w-full h-[400px] bg-slate-100">
                            <iframe
                              src={currentSelectedDoc.fileDataUrl}
                              title={currentSelectedDoc.name}
                              className="w-full h-full border-0"
                            />
                          </div>
                        ) : (
                          <div className="p-4 sm:p-5 text-xs text-slate-800 space-y-3 bg-white max-h-[440px] overflow-y-auto">
                            <div className="flex items-start justify-between border-b pb-2.5 border-slate-200">
                              <div>
                                <span className="text-[10px] font-bold text-[#00264d] uppercase">LECHE GLORIA S.A.</span>
                                <h5 className="text-sm font-black text-slate-900">{currentSelectedDoc.documentType.toUpperCase()}</h5>
                                <p className="text-[11px] text-slate-500">Expediente: {appointment.ticketCode}</p>
                              </div>
                              <div className="text-right bg-slate-50 p-1.5 rounded border border-slate-200 text-[10px]">
                                <span className="font-bold block text-slate-900">{appointment.supplierName}</span>
                                <span className="text-slate-500 font-mono">RUC: {appointment.supplierRuc}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Fecha / Hora Cita:</span>
                                <strong className="text-slate-900">{appointment.scheduledDate || appointment.requestedDate} {appointment.scheduledTime || appointment.requestedTime} hrs</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Planta Gloria:</span>
                                <strong className="text-slate-900 truncate block">{appointment.plantLocation.split('(')[0]}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Unidad / Chofer:</span>
                                <strong className="text-slate-900">{appointment.vehiclePlate || 'N/A'} - {appointment.driverName || 'Asignado'}</strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] uppercase font-bold">Total Carga:</span>
                                <strong className="text-blue-900 font-bold">{appointment.palletsCount} Palets Totales</strong>
                              </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg overflow-hidden text-[10px]">
                              <table className="w-full">
                                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                  <tr>
                                    <th className="p-1.5 text-left">OC</th>
                                    <th className="p-1.5 text-left">Código</th>
                                    <th className="p-1.5 text-left">Descripción</th>
                                    <th className="p-1.5 text-right">Cant.</th>
                                    <th className="p-1.5 text-right">Palets</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {(appointment.purchaseOrders && appointment.purchaseOrders.length > 0
                                    ? appointment.purchaseOrders
                                    : [{
                                        id: '1',
                                        orderNumber: appointment.orderNumber,
                                        positionNumber: appointment.positionNumber,
                                        materialCode: appointment.materialCode,
                                        materialDescription: appointment.materialDescription,
                                        quantity: appointment.quantity,
                                        quantityUnit: appointment.quantityUnit,
                                        palletsCount: appointment.palletsCount
                                      }]
                                  ).map((item, idx) => (
                                    <tr key={item.id || idx}>
                                      <td className="p-1.5 font-mono font-bold text-blue-900">{item.orderNumber}</td>
                                      <td className="p-1.5 font-mono">{item.materialCode}</td>
                                      <td className="p-1.5 truncate max-w-[120px]">{item.materialDescription}</td>
                                      <td className="p-1.5 text-right">{item.quantity.toLocaleString()}</td>
                                      <td className="p-1.5 text-right font-bold text-blue-800">{item.palletsCount}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-emerald-950 text-[11px] space-y-1.5">
                              <span className="font-bold flex items-center gap-1 text-emerald-800 text-xs">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Control de Recepción Documental:
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={verifiedDocIds.includes(currentSelectedDoc.id)}
                                  onChange={() => toggleVerifyDoc(currentSelectedDoc.id)}
                                  className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                />
                                <span>Conformidad: Datos del documento validados con la carga física recibida</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        Seleccione un archivo de la lista izquierda para visualizarlo.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEmail(appointment, isNoShow ? 'inasistencia' : 'cita_confirmada')}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded-xl transition"
              title="Redactar aviso de correo"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previsualizar Correo</span>
            </button>

            <button
              type="button"
              id="btn-guardar-recepcion"
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00264d] hover:bg-[#001f3f] text-white text-xs font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Registrar en Historial</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
