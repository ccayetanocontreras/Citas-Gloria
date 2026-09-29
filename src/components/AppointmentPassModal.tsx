import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  QrCode, 
  Truck, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  FileText,
  Calendar,
  Layers,
  CheckCircle2,
  Download,
  BookOpen
} from 'lucide-react';
import { AppointmentRequest } from '../types';
import { MANDATORY_SAFETY_DOCUMENTS, MandatorySafetyDocument, downloadSafetyDocumentPdf } from '../utils/safetyDocuments';
import { SafetyDocumentReaderModal } from './SafetyDocumentReaderModal';

interface AppointmentPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRequest;
}

export const AppointmentPassModal: React.FC<AppointmentPassModalProps> = ({
  isOpen,
  onClose,
  appointment
}) => {
  const [viewingSafetyDoc, setViewingSafetyDoc] = useState<MandatorySafetyDocument | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const fecha = appointment.scheduledDate || appointment.requestedDate;
  const hora = appointment.scheduledTime || appointment.requestedTime;
  const bahia = appointment.reception.dockAssigned || 'Por asignar en Garita';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Gloria */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-2">
            <div className="bg-white px-2 py-0.5 rounded text-[#00264d] font-black text-sm tracking-wider">
              GLORIA
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Pase de Ingreso a Planta</h2>
              <p className="text-xs text-blue-200">Credencial de Autorización de Descarga</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Pass Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5 text-slate-800 bg-white">
          
          {/* Top Banner with Ticket Code and QR */}
          <div className="p-4 bg-slate-50 border-2 border-slate-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                CÓDIGO DE EXPEDIENTE / CITA
              </span>
              <h3 className="text-2xl font-black text-[#00264d] tracking-wide mt-0.5">
                {appointment.ticketCode}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Estado: <strong className="text-blue-700 uppercase">{appointment.status.replace('_', ' ')}</strong>
              </p>
            </div>

            {/* Visual QR Code simulation */}
            <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-900 rounded-lg flex items-center justify-center p-2 text-white relative">
                <QrCode className="w-20 h-20 text-white" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 font-bold">
                GARITA-GLO-2025
              </span>
            </div>
          </div>

          {/* Urgency and Time Alert */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              appointment.urgency === 'Urgente'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-blue-50 border-blue-300 text-blue-900'
            }`}>
              <div className={`p-2 rounded-lg ${
                appointment.urgency === 'Urgente' ? 'bg-[#D32F2F] text-white' : 'bg-blue-700 text-white'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  Horario de Atención:
                </span>
                <p className="text-sm font-black">
                  {fecha} a las {hora} hrs
                </p>
                <p className="text-[11px]">Urgencia: <strong>{appointment.urgency}</strong></p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-white">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Bahía de Descarga:
                </span>
                <p className="text-sm font-black text-slate-800">
                  {bahia}
                </p>
                <p className="text-[11px] text-slate-600 truncate">{appointment.plantLocation.split('(')[0]}</p>
              </div>
            </div>
          </div>

          {/* Key Data Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-100 p-2.5 font-bold text-[#00264d] border-b border-slate-200 flex justify-between">
              <span>DETALLES DE LA ENTREGA Y ORDEN DE COMPRA</span>
              <span>RUC: {appointment.supplierRuc}</span>
            </div>
            
            {appointment.purchaseOrders && appointment.purchaseOrders.length > 1 ? (
              <div className="p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">
                    {appointment.supplierName}
                  </span>
                  <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                    {appointment.purchaseOrders.length} Ítems • {appointment.palletsCount} Palets Totales
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[10px]">
                      <tr>
                        <th className="py-1.5 px-2">OC</th>
                        <th className="py-1.5 px-1.5 text-center">Pos.</th>
                        <th className="py-1.5 px-2">Material</th>
                        <th className="py-1.5 px-2 text-right">Cantidad</th>
                        <th className="py-1.5 px-2 text-right">Palets</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {appointment.purchaseOrders.map((po, idx) => (
                        <tr key={po.id || idx}>
                          <td className="py-1.5 px-2 font-mono font-bold text-blue-800">{po.orderNumber}</td>
                          <td className="py-1.5 px-1.5 font-mono text-center">{po.positionNumber}</td>
                          <td className="py-1.5 px-2 text-slate-800">
                            <span className="font-mono text-[10px] text-slate-500 block">{po.materialCode}</span>
                            <span className="truncate block max-w-[200px]">{po.materialDescription}</span>
                          </td>
                          <td className="py-1.5 px-2 text-right">{po.quantity.toLocaleString()} {po.quantityUnit}</td>
                          <td className="py-1.5 px-2 text-right font-bold text-[#00264d]">{po.palletsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-4 bg-white">
                <div>
                  <span className="text-slate-400 block text-[10px]">Proveedor:</span>
                  <p className="font-bold text-slate-800">{appointment.supplierName}</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Orden de Compra:</span>
                  <p className="font-bold text-blue-700 font-mono text-sm">
                    {appointment.orderNumber} (Pos. {appointment.positionNumber})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Material:</span>
                  <p className="font-medium text-slate-800">
                    <strong className="font-mono">{appointment.materialCode}</strong> - {appointment.materialDescription}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Carga a Descargar:</span>
                  <p className="font-black text-slate-900 text-sm">
                    {appointment.quantity.toLocaleString()} {appointment.quantityUnit} ({appointment.palletsCount} Palets)
                  </p>
                </div>
              </div>
            )}

            {/* Transport details */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Conductor:</span>
                <strong className="text-slate-800">{appointment.driverName || 'Por registrar'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">DNI:</span>
                <strong className="text-slate-800">{appointment.driverDni || 'Por registrar'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Placa Furgón:</span>
                <strong className="text-slate-800 font-mono">{appointment.vehiclePlate || 'Por registrar'}</strong>
              </div>
            </div>
          </div>

          {/* Plant Security Requirements & 4 Mandatory Documents Acceptance */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-300 rounded-xl text-xs text-emerald-950 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                Constancia de Lectura Aceptada - 4 Documentos de Seguridad Planta Gloria:
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                4 / 4 Aceptados
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MANDATORY_SAFETY_DOCUMENTS.map((docItem, idx) => (
                <div
                  key={docItem.id}
                  className="p-2 bg-white rounded-lg border border-emerald-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#00264d] block">
                      Doc #{idx + 1} · {docItem.code} ({docItem.version})
                    </span>
                    <span className="text-[11px] font-semibold text-slate-800 truncate block" title={docItem.title}>
                      {docItem.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewingSafetyDoc(docItem)}
                      className="p-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 transition"
                      title={`Leer ${docItem.title}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadSafetyDocumentPdf(docItem, appointment.supplierName, appointment.supplierRuc)}
                      className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title={`Descargar ${docItem.fileName}`}
                    >
                      <Download className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Requisitos Obligatorios para Ingreso a Plantas Gloria S.A.:
            </span>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li>Portar mínimo 02 cuñas de seguridad certificadas (DP.SSO.ES.001 VE 02) y cutter auto-retráctil (GLGS00055 VE 01).</li>
              <li>Portar EPP reglamentario completo (casco con barbiquejo, chaleco de alta visibilidad, botas de seguridad y lentes).</li>
              <li>Presentar Guía de Remisión física y digital original coincidente con el expediente y SCTR vigente.</li>
              <li>Presentarse con 40 minutos de anticipación al horario asignado y circular a máx. 10 km/h en planta.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-500">
            Validez exclusiva para la fecha y planta indicada.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

        <SafetyDocumentReaderModal
          docItem={viewingSafetyDoc}
          onClose={() => setViewingSafetyDoc(null)}
          supplierName={appointment.supplierName}
          supplierRuc={appointment.supplierRuc}
        />

      </div>
    </div>
  );
};
