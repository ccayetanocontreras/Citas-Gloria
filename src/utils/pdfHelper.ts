import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { AppointmentRequest, PdfAttachment } from '../types';

export function downloadAttachment(appointment: AppointmentRequest, file: PdfAttachment): void {
  // If we already have a real fileDataUrl uploaded by the user, trigger a direct anchor download
  if (file.fileDataUrl && file.fileDataUrl.startsWith('data:')) {
    const link = document.createElement('a');
    link.href = file.fileDataUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // If the file is stored in `src/documentos_proveedores/` and has a fileUrl
  if (file.fileUrl) {
    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Otherwise, dynamically generate a high-fidelity PDF document using jsPDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Background and Header Gloria
  doc.setFillColor(0, 38, 77); // #00264d
  doc.rect(0, 0, 210, 32, 'F');

  // Red accent line
  doc.setFillColor(211, 47, 47); // #D32F2F
  doc.rect(0, 32, 210, 3, 'F');

  // Brand text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GLORIA', 15, 18);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('LECHE GLORIA S.A. • RUC 20100190797', 55, 14);
  doc.setFontSize(9);
  doc.text('Sistema de Gestión de Citas y Recepción en Planta', 55, 22);

  // Document Title
  doc.setTextColor(0, 38, 77);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(file.documentType.toUpperCase(), 15, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Nombre de Archivo: ${file.name}`, 15, 54);
  doc.text(`Expediente / Ticket: ${appointment.ticketCode}`, 15, 60);

  // Provider Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, 66, 180, 28, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL PROVEEDOR Y DESPACHO:', 20, 73);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Razón Social: ${appointment.supplierName}`, 20, 80);
  doc.text(`RUC: ${appointment.supplierRuc}`, 20, 86);
  doc.text(`Planta Destino: ${appointment.plantLocation.split('(')[0]}`, 105, 80);
  doc.text(`Fecha y Hora Cita: ${appointment.scheduledDate || appointment.requestedDate} a las ${appointment.scheduledTime || appointment.requestedTime} hrs`, 105, 86);

  // Orders Table Header
  doc.setFillColor(0, 38, 77);
  doc.rect(15, 102, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('N° OC', 18, 107);
  doc.text('Pos', 42, 107);
  doc.text('Código SAP', 55, 107);
  doc.text('Descripción del Material', 85, 107);
  doc.text('Cantidad', 155, 107);
  doc.text('Palets', 180, 107);

  // Orders items
  let y = 117;
  const items = appointment.purchaseOrders && appointment.purchaseOrders.length > 0 
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
      }];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  items.forEach((item, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 8, 'F');
    }
    doc.text(String(item.orderNumber), 18, y);
    doc.text(String(item.positionNumber), 43, y);
    doc.text(String(item.materialCode), 55, y);
    doc.text(String(item.materialDescription).substring(0, 35), 85, y);
    doc.text(`${item.quantity.toLocaleString()} ${item.quantityUnit}`, 155, y);
    doc.text(String(item.palletsCount), 183, y);
    y += 9;
  });

  // Table summary line
  doc.setDrawColor(203, 213, 225);
  doc.line(15, y, 195, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PALETS A DESCARGAR:', 120, y);
  doc.setTextColor(211, 47, 47);
  doc.text(`${appointment.palletsCount} PALETS`, 175, y);

  // Transportation Box
  y += 12;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, y, 180, 26, 3, 3, 'FD');
  doc.setTextColor(0, 38, 77);
  doc.setFontSize(9);
  doc.text('DATOS DE LA UNIDAD DE TRANSPORTE Y CONDUCTOR:', 20, y + 7);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conductor: ${appointment.driverName || 'No registrado aún'}`, 20, y + 14);
  doc.text(`DNI: ${appointment.driverDni || 'No especificado'}`, 20, y + 20);
  doc.text(`Placa del Vehículo / Furgón: ${appointment.vehiclePlate || 'Pendiente'}`, 105, y + 14);
  doc.text(`Urgencia del Envío: ${appointment.urgency}`, 105, y + 20);

  // Verification stamp
  y += 35;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(15, y, 180, 24, 3, 3, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSTANCIA DE EXPEDIENTE DIGITALIZADO - LECHE GLORIA S.A.', 20, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('El presente documento electrónico certifica el registro en el portal de proveedores para ingreso a planta.', 20, y + 15);
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')} • Código de verificación: GLORIA-VAL-${appointment.id.toUpperCase()}`, 20, y + 20);

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('Av. República de Panamá 2461, Santa Catalina, La Victoria, Lima • Central: (01) 470-7170', 35, 285);

  doc.save(file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`);
}

export function downloadAllAttachments(appointment: AppointmentRequest): void {
  const attachments = appointment.pdfAttachments || [];
  if (attachments.length === 0) {
    alert('Esta cita no tiene documentos PDF adjuntos.');
    return;
  }

  attachments.forEach((file, index) => {
    setTimeout(() => {
      downloadAttachment(appointment, file);
    }, index * 400);
  });
}

export function exportAppointmentsToXLSX(appointments: AppointmentRequest[], _fileExtension: string = 'xlsx'): void {
  // Sync with the backend Excel database (`src/data/citas_gloria.xlsx`)
  fetch('/api/appointments/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointments })
  }).catch(() => {});

  const data = appointments.map((a) => ({
    'ID Cita': a.id || '',
    'Código Ticket': a.ticketCode || '',
    'Estado Cita': (a.status || '').replace(/_/g, ' ').toUpperCase(),
    'Fecha Creación': a.createdAt || '',
    'Última Actualización': a.lastUpdated || '',
    'N° Orden Compra': a.orderNumber || '',
    'Posición SAP': a.positionNumber || '',
    'Código Material': a.materialCode || '',
    'Descripción Material': a.materialDescription || '',
    'Cantidad': a.quantity || 0,
    'Unidad Medida': a.quantityUnit || 'UN',
    'Total Palets': a.palletsCount || 0,
    'Razón Social Proveedor': a.supplierName || '',
    'RUC Proveedor': a.supplierRuc || '',
    'Correo Electrónico': a.supplierEmail || '',
    'Teléfono': a.supplierPhone || '',
    'Nivel Urgencia': a.urgency || 'Normal',
    'Justificación Urgencia': a.urgencyJustification || '',
    'Fecha Solicitada': a.requestedDate || '',
    'Hora Solicitada': a.requestedTime || '',
    'Fecha Programada': a.scheduledDate || a.requestedDate || '',
    'Hora Programada': a.scheduledTime || a.requestedTime || '',
    'Bahía Asignada': a.reception?.dockAssigned || 'Por Asignar',
    'Recepcionista': a.reception?.receptionistName || '',
    'Llegada Garita': a.reception?.arrivalDateTime || a.reception?.arrivedAt || '',
    'Inicio Descarga': a.reception?.unloadingStartedAt || '',
    'Término Descarga': a.reception?.attentionEndDateTime || a.reception?.unloadingFinishedAt || '',
    'Término Liquidación': a.reception?.liquidationEndDateTime || a.reception?.liquidationFinishedAt || '',
    'Inasistencia': a.status === 'inasistencia' || a.reception?.isNoShow ? 'SÍ' : 'NO',
    'Motivo Inasistencia': a.reception?.noShowReason || '',
    'Observaciones Recepción': a.reception?.receptionObservation || a.reception?.receptionNotes || '',
    'OC Validada SAP (Planificación)': a.planningValidation?.isValidated ? 'SÍ' : 'NO',
    'Validador Planificación': a.planningValidation?.validatorName || '',
    'Notas Planificación': a.planningValidation?.notes || '',
    'Documentos SST Aceptados': a.safetyDocumentsAcceptance?.acceptedAll ? 'SÍ (4/4)' : 'SÍ',
    'Nombre Conductor': a.driverName || '',
    'DNI Conductor': a.driverDni || '',
    'Placa Vehículo': a.vehiclePlate || '',
    'Planta Destino': a.plantLocation || 'Planta Principal Huachipa',
    'Cantidad PDFs Proveedor': (a.pdfAttachments || []).length,
    'Rutas Documentos en src': (a.pdfAttachments || []).map((p) => p.storedPath || `src/documentos_proveedores/${p.name}`).join(' | ')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 14 }, // ID Cita
    { wch: 16 }, // Código Ticket
    { wch: 20 }, // Estado Cita
    { wch: 22 }, // Fecha Creación
    { wch: 22 }, // Última Actualización
    { wch: 18 }, // N° Orden Compra
    { wch: 14 }, // Posición SAP
    { wch: 18 }, // Código Material
    { wch: 42 }, // Descripción Material
    { wch: 12 }, // Cantidad
    { wch: 14 }, // Unidad Medida
    { wch: 14 }, // Total Palets
    { wch: 34 }, // Razón Social Proveedor
    { wch: 16 }, // RUC Proveedor
    { wch: 28 }, // Correo Electrónico
    { wch: 15 }, // Teléfono
    { wch: 15 }, // Nivel Urgencia
    { wch: 30 }, // Justificación Urgencia
    { wch: 16 }, // Fecha Solicitada
    { wch: 15 }, // Hora Solicitada
    { wch: 16 }, // Fecha Programada
    { wch: 15 }, // Hora Programada
    { wch: 30 }, // Bahía Asignada
    { wch: 24 }, // Recepcionista
    { wch: 18 }, // Llegada Garita
    { wch: 18 }, // Inicio Descarga
    { wch: 18 }, // Término Descarga
    { wch: 18 }, // Término Liquidación
    { wch: 15 }, // Inasistencia
    { wch: 30 }, // Motivo Inasistencia
    { wch: 32 }, // Observaciones Recepción
    { wch: 22 }, // OC Validada SAP
    { wch: 24 }, // Validador Planificación
    { wch: 30 }, // Notas Planificación
    { wch: 20 }, // Documentos SST
    { wch: 26 }, // Nombre Conductor
    { wch: 15 }, // DNI Conductor
    { wch: 15 }, // Placa Vehículo
    { wch: 35 }, // Planta Destino
    { wch: 18 }, // Cantidad PDFs
    { wch: 55 }  // Rutas Documentos en src
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Citas_Registradas');

  // Sheet 2: Detalle de Órdenes de Compra
  const ocRows: Record<string, any>[] = [];
  appointments.forEach((a) => {
    const items = a.purchaseOrders && a.purchaseOrders.length > 0
      ? a.purchaseOrders
      : [{
          id: `${a.id}-1`,
          orderNumber: a.orderNumber,
          positionNumber: a.positionNumber,
          materialCode: a.materialCode,
          materialDescription: a.materialDescription,
          quantity: a.quantity,
          quantityUnit: a.quantityUnit,
          palletsCount: a.palletsCount
        }];
    items.forEach((po) => {
      ocRows.push({
        'Código Ticket': a.ticketCode,
        'Proveedor': a.supplierName,
        'RUC Proveedor': a.supplierRuc,
        'N° Orden Compra': po.orderNumber,
        'Posición SAP': po.positionNumber,
        'Código Material': po.materialCode,
        'Descripción Material': po.materialDescription,
        'Cantidad': po.quantity,
        'Unidad': po.quantityUnit,
        'Palets': po.palletsCount,
        'Fecha Programada': a.scheduledDate || a.requestedDate
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ocRows), 'Ordenes_Compra_Detalle');

  // Sheet 3: Documentos de Proveedores en `src/documentos_proveedores`
  const docRows: Record<string, any>[] = [];
  appointments.forEach((a) => {
    (a.pdfAttachments || []).forEach((att) => {
      docRows.push({
        'Código Ticket': a.ticketCode,
        'Proveedor': a.supplierName,
        'RUC Proveedor': a.supplierRuc,
        'Nombre Archivo': att.name,
        'Tipo Documento': att.documentType,
        'Tamaño (KB)': (att.sizeBytes / 1024).toFixed(1),
        'Fecha Subida': att.uploadedAt,
        'Ruta en Carpeta src': att.storedPath || `src/documentos_proveedores/${att.name}`
      });
    });
  });
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(docRows), 'Documentos_Proveedores');

  const fileName = `citas_gloria_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Write file as binary blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Backward compatibility alias
export const exportAppointmentsToXLZX = exportAppointmentsToXLSX;

export const exportAppointmentsToExcel = exportAppointmentsToXLZX;

export function exportAppointmentsToCSV(appointments: AppointmentRequest[]): void {
  exportAppointmentsToXLZX(appointments, 'xlsx');
}

