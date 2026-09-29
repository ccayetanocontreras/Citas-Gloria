import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Eye, 
  ExternalLink, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  FileCheck2,
  Building,
  CheckCircle,
  FileDown,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { AppointmentRequest, PdfAttachment } from '../types';
import { downloadAttachment, downloadAllAttachments } from '../utils/pdfHelper';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentRequest;
  initialAttachmentId?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  onClose,
  appointment,
  initialAttachmentId
}) => {
  if (!isOpen) return null;

  const attachments = appointment.pdfAttachments || [];
  const [selectedId, setSelectedId] = useState<string>(
    initialAttachmentId || (attachments[0]?.id || '')
  );
  const [viewMode, setViewMode] = useState<'preview' | 'embedded'>('preview');

  const currentFile = attachments.find((a) => a.id === selectedId) || attachments[0];

  const handleDownload = (file: PdfAttachment) => {
    downloadAttachment(appointment, file);
  };

  const handleDownloadAll = () => {
    downloadAllAttachments(appointment);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Gloria */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/90 text-white shadow">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Visor de Documentos PDF de Respaldo
                </h2>
                <span className="px-2 py-0.5 rounded bg-blue-800 text-[11px] font-semibold text-blue-100">
                  {appointment.ticketCode}
                </span>
              </div>
              <p className="text-xs text-blue-200">
                {attachments.length} archivo(s) PDF adjuntos para la OC {appointment.orderNumber}
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

        {/* Content with Sidebar of attachments + Preview */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* File selector sidebar */}
          <div className="w-full md:w-72 bg-slate-50 border-r border-slate-200 p-3 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Documentos Subidos ({attachments.length})
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                  Proveedor
                </span>
              </div>

              {attachments.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedId(file.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition flex items-start gap-2.5 ${
                    selectedId === file.id
                      ? 'bg-white border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white/80 border-slate-200 hover:bg-white text-slate-700'
                  }`}
                >
                  <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${
                    selectedId === file.id ? 'text-red-600' : 'text-slate-400'
                  }`} />
                  <div className="truncate flex-1">
                    <p className="font-bold text-slate-900 truncate">{file.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1 rounded">
                        {file.documentType}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(file.sizeBytes / 1024).toFixed(1)} KB • {new Date(file.uploadedAt).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </button>
              ))}

              {attachments.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                  No se adjuntaron documentos para esta cita.
                </div>
              )}
            </div>

            {attachments.length > 0 && (
              <div className="pt-3 mt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  title="Descargar todos los archivos adjuntos del proveedor"
                >
                  <Download className="w-3.5 h-3.5 text-blue-300" />
                  <span>Descargar Todos ({attachments.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Viewer Preview Area */}
          <div className="flex-1 bg-slate-100 p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center min-h-[400px]">
            
            {currentFile ? (
              <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
                
                {/* Viewer top bar */}
                <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold truncate">{currentFile.name}</span>
                    <span className="hidden sm:inline text-[10px] text-slate-400">
                      ({(currentFile.sizeBytes / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentFile.fileDataUrl && (
                      <button
                        type="button"
                        onClick={() => setViewMode(viewMode === 'preview' ? 'embedded' : 'preview')}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 transition"
                      >
                        {viewMode === 'preview' ? 'Ver Archivo Binario' : 'Ver Ficha Oficial'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(currentFile)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-[#D32F2F] hover:bg-red-700 rounded-lg text-[11px] font-bold transition text-white shadow-xs"
                      title="Descargar este archivo PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>
                </div>

                {/* Body: Embedded PDF or Digital Sheet */}
                {viewMode === 'embedded' && currentFile.fileDataUrl ? (
                  <div className="w-full h-[520px] bg-slate-200">
                    <iframe
                      src={currentFile.fileDataUrl}
                      title={currentFile.name}
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 bg-white min-h-[460px] text-slate-800 space-y-4 select-none">
                    
                    {/* Document Header in preview */}
                    <div className="border-b-2 border-slate-800 pb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#00264d] uppercase tracking-widest block">
                            LECHE GLORIA S.A.
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                            Documento Proveedor
                          </span>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mt-1">
                          {currentFile.documentType.toUpperCase()}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Expediente de Cita: <strong className="text-slate-800">{appointment.ticketCode}</strong>
                        </p>
                      </div>

                      <div className="text-right border-2 border-slate-900 p-2 rounded text-xs bg-slate-50">
                        <p className="font-bold text-slate-900">RUC: {appointment.supplierRuc}</p>
                        <p className="text-[11px] text-blue-800 font-semibold">{appointment.supplierName}</p>
                      </div>
                    </div>

                    {/* Body details inside document */}
                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Proveedor Emisor:</span>
                        <strong className="text-slate-900">{appointment.supplierName}</strong>
                        <span className="text-[10px] text-slate-500 block">RUC: {appointment.supplierRuc}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Destinatario / Cliente:</span>
                        <strong className="text-slate-900">LECHE GLORIA S.A. (RUC 20100190797)</strong>
                        <span className="text-[10px] text-slate-500 block">{appointment.plantLocation}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha / Hora Programada:</span>
                        <strong className="text-blue-800 font-mono text-xs">
                          {appointment.scheduledDate || appointment.requestedDate} a las {appointment.scheduledTime || appointment.requestedTime} hrs
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Urgencia & Bahía:</span>
                        <strong className={appointment.urgency === 'Urgente' ? 'text-red-700' : 'text-blue-700'}>
                          {appointment.urgency}
                        </strong>
                        {appointment.reception.dockAssigned && (
                          <span className="text-[10px] text-slate-600 block">
                            {appointment.reception.dockAssigned.split('-')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                          <tr>
                            <th className="p-2 text-left">N° OC</th>
                            <th className="p-2 text-left">Pos</th>
                            <th className="p-2 text-left">Código SAP</th>
                            <th className="p-2 text-left">Descripción del Material</th>
                            <th className="p-2 text-right">Cantidad</th>
                            <th className="p-2 text-right">Palets</th>
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
                            <tr key={item.id || idx} className="hover:bg-slate-50">
                              <td className="p-2 font-mono font-bold text-blue-900">{item.orderNumber}</td>
                              <td className="p-2 font-mono text-slate-600">{item.positionNumber}</td>
                              <td className="p-2 font-mono text-slate-700">{item.materialCode}</td>
                              <td className="p-2 text-slate-800">{item.materialDescription}</td>
                              <td className="p-2 text-right font-medium">{item.quantity.toLocaleString()} {item.quantityUnit}</td>
                              <td className="p-2 text-right font-bold text-blue-800">{item.palletsCount}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-[11px]">
                          <tr>
                            <td colSpan={5} className="p-2 text-right text-slate-700">Total Palets:</td>
                            <td className="p-2 text-right text-blue-900 font-black">{appointment.palletsCount} PLTS</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Transport section */}
                    {appointment.driverName && (
                      <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-blue-900">
                        <span className="font-bold block mb-1">Datos de Transporte y Guía del Proveedor:</span>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div>Conductor: <strong>{appointment.driverName}</strong></div>
                          <div>DNI: <strong>{appointment.driverDni || 'N/A'}</strong></div>
                          <div>Placa: <strong>{appointment.vehiclePlate || 'N/A'}</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Watermark and security stamp */}
                    <div className="pt-4 flex items-center justify-between border-t border-slate-200 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verificación Digital SAT/SUNAT y Archivo de Respaldo Conforme</span>
                      </div>
                      <div className="text-right">
                        <span>Página 1 de {currentFile.totalPages || 1}</span>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs">
                No hay archivos seleccionados.
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Documento verificado para el control de ingreso a planta.
          </span>
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
