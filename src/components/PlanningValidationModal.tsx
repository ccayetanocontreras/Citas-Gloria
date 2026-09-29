import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileText, 
  Calendar, 
  Clock, 
  Building2, 
  Package, 
  ShieldCheck, 
  FileSpreadsheet, 
  Check, 
  Eye, 
  AlertTriangle 
} from 'lucide-react';
import { AppointmentRequest, User } from '../types';

interface PlanningValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRequest | null;
  currentUser: User;
  onSaveValidation: (updated: AppointmentRequest) => void;
  onOpenPdfViewer?: (appt: AppointmentRequest, docId?: string) => void;
}

export const PlanningValidationModal: React.FC<PlanningValidationModalProps> = ({
  isOpen,
  onClose,
  appointment,
  currentUser,
  onSaveValidation,
  onOpenPdfViewer
}) => {
  if (!isOpen || !appointment) return null;

  const currentValidation = appointment.planningValidation || {
    status: 'pendiente',
    isValidated: false,
    notes: ''
  };

  const [validationNotes, setValidationNotes] = useState(
    currentValidation.notes || 'Órdenes de Compra validadas y cotejadas en SAP R/3 Leche Gloria S.A. Cumple con saldo disponible de entrega.'
  );
  const [sapPoVerified, setSapPoVerified] = useState(currentValidation.sapPoVerified ?? true);
  const [quotaAssigned, setQuotaAssigned] = useState(currentValidation.quotaAssigned ?? true);
  const [contractualDateMatches, setContractualDateMatches] = useState(true);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState(
    'La Orden de Compra no cuenta con saldo disponible suficiente en SAP Gloria para la cantidad solicitada.'
  );

  const purchaseOrders = appointment.purchaseOrders && appointment.purchaseOrders.length > 0 
    ? appointment.purchaseOrders 
    : [
        {
          id: 'po-single',
          orderNumber: appointment.orderNumber,
          positionNumber: appointment.positionNumber,
          materialCode: appointment.materialCode,
          materialDescription: appointment.materialDescription,
          quantity: appointment.quantity,
          quantityUnit: appointment.quantityUnit,
          palletsCount: appointment.palletsCount
        }
      ];

  const handleApprove = () => {
    const nowIso = new Date().toISOString();
    const updated: AppointmentRequest = {
      ...appointment,
      lastUpdated: nowIso,
      planningValidation: {
        status: 'validado',
        isValidated: true,
        validatedBy: currentUser.id,
        validatorName: currentUser.name,
        validatedAt: nowIso,
        sapPoVerified,
        quotaAssigned,
        linesValidatedCount: purchaseOrders.length,
        notes: validationNotes.trim()
      },
      auditHistory: [
        ...appointment.auditHistory,
        {
          id: `aud-${Date.now()}-plan-approve`,
          timestamp: nowIso,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Validación de OCs por Planificación',
          fieldChanged: 'Validación Planificación',
          previousValue: currentValidation.status === 'validado' ? 'Validado Conforme' : 'Pendiente de Validación',
          newValue: 'Validado Conforme',
          notes: validationNotes.trim() || 'Órdenes de Compra aprobadas en SAP Gloria para confirmación de cita.'
        }
      ]
    };

    onSaveValidation(updated);
    onClose();
  };

  const handleReject = () => {
    const nowIso = new Date().toISOString();
    const updated: AppointmentRequest = {
      ...appointment,
      lastUpdated: nowIso,
      planningValidation: {
        status: 'observado',
        isValidated: false,
        validatedBy: currentUser.id,
        validatorName: currentUser.name,
        validatedAt: nowIso,
        sapPoVerified: false,
        quotaAssigned: false,
        linesValidatedCount: purchaseOrders.length,
        notes: rejectReason.trim()
      },
      auditHistory: [
        ...appointment.auditHistory,
        {
          id: `aud-${Date.now()}-plan-reject`,
          timestamp: nowIso,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Observación de OCs por Planificación',
          fieldChanged: 'Validación Planificación',
          previousValue: currentValidation.status === 'validado' ? 'Validado Conforme' : 'Pendiente de Validación',
          newValue: 'Observado por Planificación',
          notes: `Observación de Planificación: ${rejectReason.trim()}`
        }
      ]
    };

    onSaveValidation(updated);
    onClose();
  };

  const isAlreadyValidated = currentValidation.status === 'validado';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Gloria Branding */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-950 rounded-xl shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Dpto. de Planificación y Abastecimiento
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isAlreadyValidated 
                    ? 'bg-emerald-500 text-white' 
                    : currentValidation.status === 'observado'
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-400 text-slate-950'
                }`}>
                  {isAlreadyValidated ? 'Validado' : currentValidation.status === 'observado' ? 'Observado' : 'Pendiente de Validación'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Validación de Órdenes de Compra - Cita {appointment.ticketCode}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative Workflow Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-950 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Responsabilidad de Planificación: </span>
            Usted está a cargo de validar las Órdenes de Compra solicitadas por el proveedor en SAP Gloria. 
            El usuario <strong>RECEPCIONISTA</strong> solo podrá confirmar la cita y asignar bahía una vez que estas OCs hayan sido aprobadas por Planificación.
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 flex-1">
          
          {/* General Appointment Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Proveedor / Solicitante:</span>
              <span className="font-bold text-slate-900 block truncate">{appointment.supplierName}</span>
              <span className="text-[11px] text-slate-600 font-mono">RUC: {appointment.supplierRuc}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Fecha & Horario Solicitado:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                {appointment.requestedDate}
              </span>
              <span className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-blue-700" />
                {appointment.requestedTime} hrs
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Planta & Nivel Urgencia:</span>
              <span className="font-bold text-slate-900 block truncate">{appointment.plantLocation.split(' - ')[0]}</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                appointment.urgency === 'Urgente' 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {appointment.urgency}
              </span>
            </div>
          </div>

          {/* List of Purchase Orders to Validate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Órdenes de Compra para Validación ({purchaseOrders.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                Total Palets: <strong>{appointment.palletsCount}</strong>
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white shadow-xs">
              {purchaseOrders.map((po, idx) => (
                <div key={po.id || idx} className="p-3.5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 font-mono text-xs font-bold rounded">
                        OC #{po.orderNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        Pos: {po.positionNumber}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[11px] rounded">
                        {po.materialCode}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {po.materialDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        {po.quantity.toLocaleString('es-PE')} {po.quantityUnit}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {po.palletsCount} palet(s)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>SAP OK</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments quick check */}
          {appointment.pdfAttachments && appointment.pdfAttachments.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">
                  Documentación de sustento adjunta por el proveedor ({appointment.pdfAttachments.length})
                </span>
              </div>
              {onOpenPdfViewer && (
                <button
                  type="button"
                  onClick={() => onOpenPdfViewer(appointment)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver PDFs</span>
                </button>
              )}
            </div>
          )}

          {/* Validation Checklist */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              Criterios de Validación de Planificación (SAP Gloria)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition text-xs">
                <input
                  type="checkbox"
                  checked={sapPoVerified}
                  onChange={(e) => setSapPoVerified(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">OC Vigente y Liberada en SAP</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition text-xs">
                <input
                  type="checkbox"
                  checked={quotaAssigned}
                  onChange={(e) => setQuotaAssigned(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Saldo de Entrega Disponible</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 transition text-xs">
                <input
                  type="checkbox"
                  checked={contractualDateMatches}
                  onChange={(e) => setContractualDateMatches(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-medium text-slate-800">Fecha en Ventana Contractual</span>
              </label>
            </div>

            {/* Validation Notes */}
            {!isRejecting ? (
              <div className="mt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dictamen / Observaciones de Planificación:
                </label>
                <textarea
                  rows={2}
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Ingrese observaciones de validación para el recepcionista y auditoría..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-red-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Motivo de la Observación / Rechazo de OC:
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-slate-900 font-medium"
                >
                  <option value="La Orden de Compra no cuenta con saldo disponible suficiente en SAP Gloria para la cantidad solicitada.">
                    OC sin saldo disponible suficiente en SAP Gloria
                  </option>
                  <option value="La Orden de Compra se encuentra bloqueada o pendiente de liberación por Gerencia de Compras.">
                    OC bloqueada o pendiente de estrategia de liberación
                  </option>
                  <option value="La fecha de entrega solicitada excede la ventana contractual pactada con Gloria S.A.">
                    Fecha excede la ventana contractual pactada
                  </option>
                  <option value="El código de material solicitado no coincide con la línea de entrega autorizada en SAP.">
                    Código de material no coincide con línea autorizada
                  </option>
                  <option value="Razón social del proveedor no coincide con la titularidad de la Orden de Compra en SAP.">
                    Razón social no coincide con titularidad de la OC
                  </option>
                  <option value="Observación técnica de balance de capacidad de almacenamiento en planta.">
                    Capacidad saturada para esta familia de insumos
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* Current validation badge if already reviewed */}
          {currentValidation.validatedAt && (
            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span>Última revisión realizada por: <strong>{currentValidation.validatorName || 'Planificación'}</strong></span>
                <span className="block text-[11px] text-slate-500">
                  {new Date(currentValidation.validatedAt).toLocaleString('es-PE')}
                </span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                currentValidation.status === 'validado' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                Estado: {currentValidation.status}
              </span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            {!isRejecting ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsRejecting(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 rounded-xl transition border border-red-200"
                >
                  Observar / Rechazar OCs
                </button>

                <button
                  type="button"
                  id="btn-aprobar-planificacion"
                  onClick={handleApprove}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar y Aprobar Órdenes de Compra</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancelar Observación
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Confirmar Observación de OCs</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
