import { AppointmentRequest, User } from '../types';

export interface EmailData {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
}

export function generateAppointmentEmail(
  eventType: 
    | 'solicitud_creada'
    | 'cita_confirmada'
    | 'hora_modificada'
    | 'llegada_registrada'
    | 'atencion_terminada'
    | 'liquidacion_terminada'
    | string,
  appointment: AppointmentRequest,
  currentUser: User
): EmailData {
  const fecha = appointment.scheduledDate || appointment.requestedDate;
  const hora = appointment.scheduledTime || appointment.requestedTime;
  const bahia = appointment.reception.dockAssigned || 'Bahía por asignar en Garita';
  const oc = appointment.orderNumber;
  const proveedor = appointment.supplierName;
  const ruc = appointment.supplierRuc;
  const ticket = appointment.ticketCode;
  const palets = appointment.palletsCount;
  const urgencia = appointment.urgency;

  let eventTitle = 'Actualización de Estado de Cita';
  let bannerColor = '#00264d';
  let messageIntro = 'Le informamos sobre el estado actual de su entrega en almacenes de Leche Gloria S.A.';

  switch (eventType) {
    case 'solicitud_creada':
      eventTitle = 'Solicitud de Cita Registrada con Éxito';
      bannerColor = '#00264d';
      messageIntro = `Su solicitud de cita ha sido recibida en el sistema de Leche Gloria S.A. y se encuentra en proceso de revisión por el equipo de almacén.`;
      break;
    case 'cita_confirmada':
      eventTitle = '¡Cita de Entrega Aprobada y Confirmada!';
      bannerColor = '#16a34a';
      messageIntro = `Nos complace confirmarle que su cita de entrega ha sido APROBADA para la fecha y horario especificado.`;
      break;
    case 'hora_modificada':
      eventTitle = 'Aviso: Ajuste / Reprogramación de Horario de Cita';
      bannerColor = '#ea580c';
      messageIntro = `Por motivos de balanceo de capacidad y asignación de rampas en planta, el horario de atención para su entrega ha sido ajustado por el recepcionista.`;
      break;
    case 'llegada_registrada':
      eventTitle = 'Ingreso a Planta Registrado (Check-in en Garita)';
      bannerColor = '#2563eb';
      messageIntro = `Se ha registrado el ingreso de la unidad de transporte a las instalaciones de Leche Gloria S.A. Proceda a la bahía indicada cuando se le asigne turno.`;
      break;
    case 'atencion_terminada':
      eventTitle = 'Descarga Física Culminada en Bahía';
      bannerColor = '#4f46e5';
      messageIntro = `Se ha completado la descarga física de los palets en la bahía designada. Por favor pase al área de recepción documentaria para la liquidación.`;
      break;
    case 'liquidacion_terminada':
      eventTitle = 'Conformidad de Recepción y Liquidación Concluida';
      bannerColor = '#059669';
      messageIntro = `La recepción física y documental de su carga ha culminado satisfactoriamente en el sistema SAP Gloria. Se da por concluido el expediente.`;
      break;
    case 'inasistencia':
      eventTitle = 'Aviso de Inasistencia / Cita No Atendida en Planta';
      bannerColor = '#dc2626';
      messageIntro = `Se ha registrado formalmente la inasistencia de su unidad de transporte a la cita programada en las instalaciones de Leche Gloria S.A. debido a que el vehículo no se presentó en garita de control dentro de la ventana horaria autorizada.`;
      break;
  }

  const subject = `[GLORIA S.A.] ${eventTitle} - ${ticket} - OC #${oc} (${proveedor})`;

  const bodyText = `
LECHE GLORIA S.A. - PORTAL DE GESTIÓN DE CITAS A PROVEEDORES
===========================================================
Notificación Oficial de Entrega en Planta

Estimado Proveedor: ${proveedor} (RUC: ${ruc})

${messageIntro}

RESUMEN DEL EXPEDIENTE:
-----------------------------------------------------------
- Código de Cita / Ticket: ${ticket}
- Orden(es) de Compra: OC #${oc} (Posición: ${appointment.positionNumber})
- Sede Gloria: ${appointment.plantLocation}
- Fecha Programada: ${fecha}
- Hora Programada: ${hora} hrs
- Bahía / Rampa Asignada: ${bahia}
- Cantidad de Palets: ${palets} Palets
- Nivel de Urgencia: ${urgencia}
${appointment.driverName ? `- Conductor Asignado: ${appointment.driverName} (DNI: ${appointment.driverDni || 'N/A'})` : ''}
${appointment.vehiclePlate ? `- Placa del Furgón: ${appointment.vehiclePlate}` : ''}

${appointment.reception.receptionObservation ? `OBSERVACIONES DE ALMACÉN:\n${appointment.reception.receptionObservation}\n` : ''}
IMPORTANTE PARA EL INGRESO:
- Presentarse con 15 minutos de anticipación en garita de control.
- Portar EPP reglamentario (casco, chaleco reflectivo, calzado de seguridad).
- Presentar Guía de Remisión física y digital original coincidente con el expediente.
- Todo el personal a bordo debe contar con SCTR vigente.

Atentamente,
Departamento de Logística y Abastecimiento
LECHE GLORIA S.A. - Complejo Industrial Huachipa
Mesa de Ayuda Proveedores: (01) 470-7170
`.trim();

  const bodyHtml = `
<div style="font-family: Arial, Helvetica, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  
  <!-- Header Gloria -->
  <div style="background-color: ${bannerColor}; padding: 20px 24px; color: #ffffff; border-bottom: 4px solid #D32F2F;">
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 24px; font-weight: 900; letter-spacing: 2px; color: #ffffff; background-color: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 6px;">GLORIA</span>
      <span style="font-size: 11px; background-color: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Portal de Citas</span>
    </div>
    <h1 style="margin: 12px 0 4px 0; font-size: 18px; font-weight: 700; color: #ffffff;">${eventTitle}</h1>
    <p style="margin: 0; font-size: 12px; color: #e2e8f0;">Expediente de Cita: <strong>${ticket}</strong></p>
  </div>

  <!-- Body Content -->
  <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
    <p style="margin-top: 0;">Estimados señores de <strong>${proveedor}</strong> (RUC: ${ruc}),</p>
    
    <p style="background-color: #f8fafc; border-left: 4px solid ${bannerColor}; padding: 12px 14px; border-radius: 0 8px 8px 0; margin: 16px 0; font-size: 13px; color: #1e293b;">
      ${messageIntro}
    </p>

    <h3 style="font-size: 13px; text-transform: uppercase; color: #00264d; margin: 20px 0 10px 0; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
      Detalle de la Programación:
    </h3>

    <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
      <tbody>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b; width: 40%;">N° Orden(es) de Compra:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #00264d; font-family: monospace;">OC #${oc} (Pos. ${appointment.positionNumber})</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Fecha de Cita:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${fecha}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Hora Programada:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #00264d;">${hora} hrs</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Bahía / Rampa Asignada:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #1e293b;">${bahia}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Carga a Descargar:</td>
          <td style="padding: 8px 0; font-weight: bold; color: #D32F2F;">${palets} Palets (${appointment.quantity.toLocaleString()} ${appointment.quantityUnit})</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b;">Nivel de Urgencia:</td>
          <td style="padding: 8px 0; font-weight: bold; color: ${urgencia === 'Urgente' ? '#D32F2F' : '#2563eb'};">${urgencia}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">Sede de Entrega:</td>
          <td style="padding: 8px 0; color: #334155;">${appointment.plantLocation}</td>
        </tr>
      </tbody>
    </table>

    ${appointment.reception.receptionObservation ? `
      <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 8px; margin-bottom: 18px; font-size: 12px; color: #854d0e;">
        <strong>Nota del Almacén:</strong> ${appointment.reception.receptionObservation}
      </div>
    ` : ''}

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 12px; color: #475569;">
      <strong style="color: #00264d; display: block; margin-bottom: 6px;">Protocolo de Ingreso y Seguridad en Planta Gloria:</strong>
      <ul style="margin: 0; padding-left: 18px; line-height: 1.5;">
        <li>Presentarse 15 minutos antes de la hora pactada en Garita de Control.</li>
        <li>Conductor y acompañante con EPP reglamentario y SCTR vigente.</li>
        <li>Presentar Guía de Remisión física y digital original.</li>
      </ul>
    </div>
  </div>

  <!-- Footer Gloria -->
  <div style="background-color: #f1f5f9; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center;">
    <p style="margin: 0 0 4px 0; font-weight: bold; color: #1e293b;">LECHE GLORIA S.A. • RUC 20100190797</p>
    <p style="margin: 0;">Complejo Industrial Huachipa • Av. La Capitana 190, Lurigancho-Chosica, Lima</p>
    <p style="margin: 4px 0 0 0;">Mesa de Ayuda Proveedores: (01) 470-7170 • citas.proveedores@gloria.com.pe</p>
  </div>
</div>
`.trim();

  return {
    recipientEmail: appointment.supplierEmail,
    recipientName: appointment.supplierName,
    subject,
    bodyHtml,
    bodyText
  };
}

export function buildGmailUrl(to: string, subject: string, bodyText: string): string {
  const base = 'https://mail.google.com/mail/?view=cm&fs=1';
  const params = new URLSearchParams({
    to: to,
    su: subject,
    body: bodyText
  });
  return `${base}&${params.toString()}`;
}

export function buildOutlookUrl(to: string, subject: string, bodyText: string): string {
  const base = 'https://outlook.live.com/mail/0/deeplink/compose';
  const params = new URLSearchParams({
    to: to,
    subject: subject,
    body: bodyText
  });
  return `${base}?${params.toString()}`;
}

export function buildMailtoUrl(to: string, subject: string, bodyText: string): string {
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
}
