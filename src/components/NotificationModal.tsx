import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  ExternalLink, 
  Copy, 
  Check, 
  Inbox, 
  Clock, 
  Building,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { AppointmentRequest, EmailNotification, User } from '../types';
import { 
  generateAppointmentEmail, 
  buildGmailUrl, 
  buildOutlookUrl, 
  buildMailtoUrl 
} from '../utils/emailService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppointment: AppointmentRequest | null;
  currentUser: User;
  sentNotifications: EmailNotification[];
  onRecordNotification: (notification: EmailNotification) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  selectedAppointment,
  currentUser,
  sentNotifications,
  onRecordNotification
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'redactar' | 'historial'>('redactar');
  const [eventType, setEventType] = useState<
    'solicitud_creada' | 'cita_confirmada' | 'hora_modificada' | 'llegada_registrada' | 'atencion_terminada' | 'liquidacion_terminada' | 'inasistencia'
  >('cita_confirmada');

  const [copied, setCopied] = useState(false);
  const [customToEmail, setCustomToEmail] = useState(selectedAppointment?.supplierEmail || '');

  // RBAC: Solo ADMINISTRADOR y RECEPCIONISTA pueden notificar por correo
  if (currentUser.role !== 'admin' && currentUser.role !== 'recepcionista') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-red-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Acceso Restringido</h3>
            <p className="text-xs text-slate-600 mt-1">
              Solo los usuarios con perfil <strong>ADMINISTRADOR</strong> y <strong>RECEPCIONISTA</strong> tienen permisos para emitir y redactar notificaciones por correo a los proveedores.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-[#00264d] hover:bg-[#001f3f] text-white rounded-xl text-xs font-bold transition"
          >
            Entendido y Volver
          </button>
        </div>
      </div>
    );
  }

  if (!selectedAppointment) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-sm text-slate-600">Por favor seleccione un expediente para redactar o ver sus notificaciones.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-200 rounded-lg text-xs font-bold">Cerrar</button>
        </div>
      </div>
    );
  }

  const emailTemplate = generateAppointmentEmail(eventType, selectedAppointment, currentUser);

  const handleCopyText = () => {
    navigator.clipboard.writeText(emailTemplate.bodyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendViaGmail = () => {
    const to = customToEmail || emailTemplate.recipientEmail;
    const url = buildGmailUrl(to, emailTemplate.subject, emailTemplate.bodyText);
    window.open(url, '_blank');
    recordSentNotification('Gmail');
  };

  const handleSendViaOutlook = () => {
    const to = customToEmail || emailTemplate.recipientEmail;
    const url = buildOutlookUrl(to, emailTemplate.subject, emailTemplate.bodyText);
    window.open(url, '_blank');
    recordSentNotification('Outlook');
  };

  const handleSendViaMailto = () => {
    const to = customToEmail || emailTemplate.recipientEmail;
    window.location.href = buildMailtoUrl(to, emailTemplate.subject, emailTemplate.bodyText);
    recordSentNotification('Cliente Local / Mailto');
  };

  const recordSentNotification = (client: string) => {
    const newNote: EmailNotification = {
      id: `mail-${Date.now()}`,
      timestamp: new Date().toISOString(),
      appointmentId: selectedAppointment.id,
      ticketCode: selectedAppointment.ticketCode,
      recipientEmail: customToEmail || emailTemplate.recipientEmail,
      recipientName: emailTemplate.recipientName,
      subject: emailTemplate.subject,
      bodyHtml: emailTemplate.bodyHtml,
      bodyText: emailTemplate.bodyText,
      triggerEvent: `${eventType} (${client})`,
      status: 'Enviado'
    };
    onRecordNotification(newNote);
  };

  const relevantHistory = sentNotifications.filter(
    (n) => n.appointmentId === selectedAppointment.id
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Gloria */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-900/80 text-blue-200 border border-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Centro de Notificaciones por Correo (Gmail / Outlook)
                </h2>
              </div>
              <p className="text-xs text-blue-200">
                Notificación automática institucional para: {selectedAppointment.supplierName} ({selectedAppointment.ticketCode})
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('redactar')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'redactar'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            Redactar y Disparar Correo
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
              activeTab === 'historial'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Buzón de Envíos Realizados ({relevantHistory.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto p-5 sm:p-6 flex-1 text-slate-800 space-y-4">
          
          {activeTab === 'redactar' ? (
            <div className="space-y-4">
              
              {/* Event trigger selector */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Seleccione el Evento / Estado para Notificar al Proveedor:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'solicitud_creada', label: '1. Solicitud Recibida' },
                    { id: 'cita_confirmada', label: '2. Cita Confirmada' },
                    { id: 'hora_modificada', label: '3. Reprogramación de Hora' },
                    { id: 'llegada_registrada', label: '4. Check-in Garita (Llegó)' },
                    { id: 'atencion_terminada', label: '5. Término de Descarga' },
                    { id: 'liquidacion_terminada', label: '6. Término de Liquidación' },
                    { id: 'inasistencia', label: '7. Inasistencia en Planta' }
                  ].map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => setEventType(evt.id as any)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition ${
                        eventType === evt.id
                          ? 'bg-[#00264d] text-white border-[#00264d] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {evt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email details summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Destinatario:</label>
                  <input
                    type="email"
                    value={customToEmail}
                    onChange={(e) => setCustomToEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Asunto Oficial:</label>
                  <input
                    type="text"
                    readOnly
                    value={emailTemplate.subject}
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Instant Action Bar: Gmail vs Outlook */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-xl text-white shadow-md">
                <p className="text-xs text-blue-200 mb-2 font-medium">
                  Disparar notificación automática directa al cliente de correo preferido:
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Gmail Button */}
                  <button
                    id="btn-enviar-gmail"
                    onClick={handleSendViaGmail}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-red-600 text-xs font-bold rounded-xl transition shadow"
                  >
                    <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">G</span>
                    <span>Abrir y Enviar en Gmail</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Outlook Button */}
                  <button
                    id="btn-enviar-outlook"
                    onClick={handleSendViaOutlook}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0078D4] hover:bg-[#0060aa] text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    <span className="w-4 h-4 rounded-full bg-white text-[#0078D4] flex items-center justify-center font-bold text-[10px]">O</span>
                    <span>Abrir y Enviar en Outlook</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                  </button>

                  {/* Local mailto */}
                  <button
                    onClick={handleSendViaMailto}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition border border-white/20"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>App de Correo Nativa</span>
                  </button>

                  {/* Copy button */}
                  <button
                    onClick={handleCopyText}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition border border-white/20"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado al Portapapeles' : 'Copiar Texto'}</span>
                  </button>
                </div>
              </div>

              {/* Email HTML Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Vista Previa del Correo Corporativo Gloria S.A.:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Formato HTML con membrete oficial
                  </span>
                </div>

                <div 
                  className="p-4 bg-slate-100 rounded-xl border border-slate-300 max-h-72 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailTemplate.bodyHtml }}
                />
              </div>

            </div>
          ) : (
            <div className="space-y-3">
              {relevantHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Aún no se han registrado envíos de notificación para este expediente.
                </div>
              ) : (
                relevantHistory.map((note) => (
                  <div key={note.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{note.triggerEvent}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(note.timestamp).toLocaleString('es-PE')}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-1">Destinatario: <strong>{note.recipientEmail}</strong></p>
                    <p className="text-slate-700 font-semibold text-[11px] bg-white p-2 rounded border border-slate-200">
                      {note.subject}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
