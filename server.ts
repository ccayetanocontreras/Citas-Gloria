import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';
import { createServer as createViteServer } from 'vite';
import { AppointmentRequest, PdfAttachment } from './src/types';
import { INITIAL_APPOINTMENTS } from './src/mockData';

const app = express();
const PORT = 3000;

// Body parsers with support for PDF base64 / documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories inside `src` and `data`
const SRC_DIR = path.join(process.cwd(), 'src');
const SRC_DOCS_DIR = path.join(SRC_DIR, 'documentos_proveedores');
const SRC_DATA_DIR = path.join(SRC_DIR, 'data');
const DATA_DIR = path.join(process.cwd(), 'data');

// Primary Excel database file inside `src/data/citas_gloria.xlsx` and mirror in `data/citas_gloria.xlsx`
const EXCEL_DB_SRC_FILE = path.join(SRC_DATA_DIR, 'citas_gloria.xlsx');
const EXCEL_DB_DATA_FILE = path.join(DATA_DIR, 'citas_gloria.xlsx');

// Ensure directories exist
[SRC_DOCS_DIR, SRC_DATA_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function sanitizeFileName(rawName: string): string {
  const cleaned = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned.toLowerCase().endsWith('.pdf') ? cleaned : `${cleaned}.pdf`;
}

// Create a minimal valid PDF binary if a demo attachment doesn't have a physical file yet
function createPlaceholderPdfBuffer(title: string, ticketCode: string, supplierName: string): Buffer {
  const textContent = `LECHE GLORIA S.A. - Documento Proveedor: ${title} - Ticket: ${ticketCode} - Proveedor: ${supplierName}`;
  const safeText = textContent.replace(/[()\\]/g, '');
  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length ${safeText.length + 45} >>
stream
BT
/F1 11 Tf
40 780 Td
(${safeText}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000229 00000 n 
0000000297 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;
  return Buffer.from(pdfString, 'utf-8');
}

// Save supplier uploaded PDF attachments physically into `src/documentos_proveedores/`
function persistSupplierAttachmentsToSrc(apt: AppointmentRequest): AppointmentRequest {
  const updatedAttachments: PdfAttachment[] = (apt.pdfAttachments || []).map((att) => {
    const safeFileName = sanitizeFileName(att.name || `${apt.ticketCode}_documento.pdf`);
    const targetFilePath = path.join(SRC_DOCS_DIR, safeFileName);
    const relativeSrcPath = `src/documentos_proveedores/${safeFileName}`;
    const publicFileUrl = `/api/documents/file/${encodeURIComponent(safeFileName)}`;

    try {
      if (att.fileDataUrl && att.fileDataUrl.startsWith('data:')) {
        const base64Index = att.fileDataUrl.indexOf('base64,');
        if (base64Index !== -1) {
          const base64Data = att.fileDataUrl.substring(base64Index + 7);
          const fileBuffer = Buffer.from(base64Data, 'base64');
          fs.writeFileSync(targetFilePath, fileBuffer);
        }
      } else if (!fs.existsSync(targetFilePath)) {
        // Ensure initial demo files also exist inside `src/documentos_proveedores/`
        const demoBuffer = createPlaceholderPdfBuffer(att.name, apt.ticketCode, apt.supplierName);
        fs.writeFileSync(targetFilePath, demoBuffer);
      }
    } catch (err) {
      console.error(`Error guardando documento ${safeFileName} en src/documentos_proveedores:`, err);
    }

    return {
      ...att,
      storedPath: relativeSrcPath,
      fileUrl: publicFileUrl
    };
  });

  return {
    ...apt,
    pdfAttachments: updatedAttachments
  };
}

// Build and write the complete Excel (.xlsx) workbook with all appointments data
function saveAppointmentsToExcel(appointments: AppointmentRequest[]): void {
  // Ensure all attachments are persisted to `src/documentos_proveedores`
  const normalized = appointments.map(persistSupplierAttachmentsToSrc);
  inMemoryAppointments = normalized;

  try {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Main Appointments Table (All Fields + Full JSON backup for lossless reload)
    const citasRows = normalized.map((a) => {
      // Strip heavy base64 from JSON backup column since the binary PDF is already stored in `src/documentos_proveedores/`
      const lightweightForJson: AppointmentRequest = {
        ...a,
        pdfAttachments: (a.pdfAttachments || []).map((att) => ({
          ...att,
          fileDataUrl: undefined
        }))
      };

      return {
        'ID Cita': a.id || '',
        'Código Ticket': a.ticketCode || '',
        'Estado Cita': a.status || 'pendiente',
        'Fecha Creación': a.createdAt || '',
        'Última Actualización': a.lastUpdated || '',
        'ID Proveedor': a.supplierId || '',
        'Razón Social Proveedor': a.supplierName || '',
        'RUC Proveedor': a.supplierRuc || '',
        'Correo Electrónico': a.supplierEmail || '',
        'Teléfono Proveedor': a.supplierPhone || '',
        'Nombre Conductor': a.driverName || '',
        'DNI Conductor': a.driverDni || '',
        'Placa Vehículo': a.vehiclePlate || '',
        'N° Orden Compra': a.orderNumber || '',
        'Posición SAP': a.positionNumber || '',
        'Código Material': a.materialCode || '',
        'Descripción Material': a.materialDescription || '',
        'Cantidad Total': a.quantity || 0,
        'Unidad Medida': a.quantityUnit || 'Unidades',
        'Total Palets': a.palletsCount || 0,
        'Nivel Urgencia': a.urgency || 'Normal',
        'Justificación Urgencia': a.urgencyJustification || '',
        'Fecha Solicitada': a.requestedDate || '',
        'Hora Solicitada': a.requestedTime || '',
        'Fecha Programada': a.scheduledDate || a.requestedDate || '',
        'Hora Programada': a.scheduledTime || a.requestedTime || '',
        'Planta Destino': a.plantLocation || '',
        'Bahía Asignada': a.reception?.dockAssigned || 'Por Asignar',
        'Recepcionista': a.reception?.receptionistName || '',
        'Llegada Garita': a.reception?.arrivalDateTime || a.reception?.arrivedAt || '',
        'Inicio Descarga': a.reception?.unloadingStartedAt || '',
        'Término Descarga': a.reception?.attentionEndDateTime || a.reception?.unloadingFinishedAt || '',
        'Término Liquidación': a.reception?.liquidationEndDateTime || a.reception?.liquidationFinishedAt || '',
        'Inasistencia': a.status === 'inasistencia' || a.reception?.isNoShow ? 'SÍ' : 'NO',
        'Motivo Inasistencia': a.reception?.noShowReason || '',
        'Observaciones Recepción': a.reception?.receptionObservation || a.reception?.receptionNotes || '',
        'Estado Planificación': a.planningValidation?.status || 'pendiente',
        'OC Validada SAP': a.planningValidation?.isValidated ? 'SÍ' : 'NO',
        'Validador Planificación': a.planningValidation?.validatorName || '',
        'Fecha Validación SAP': a.planningValidation?.validatedAt || '',
        'Notas Planificación': a.planningValidation?.notes || '',
        'Documentos SST Aceptados': a.safetyDocumentsAcceptance?.acceptedAll ? 'SÍ (4/4)' : 'SÍ',
        'Cantidad PDFs Proveedor': (a.pdfAttachments || []).length,
        'Rutas Documentos en src': (a.pdfAttachments || []).map((p) => p.storedPath || `src/documentos_proveedores/${p.name}`).join(' | '),
        'JSON_Expediente': JSON.stringify(lightweightForJson)
      };
    });

    const wsCitas = XLSX.utils.json_to_sheet(citasRows);
    wsCitas['!cols'] = [
      { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 22 },
      { wch: 14 }, { wch: 34 }, { wch: 15 }, { wch: 28 }, { wch: 16 },
      { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 18 }, { wch: 14 },
      { wch: 20 }, { wch: 40 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
      { wch: 14 }, { wch: 32 }, { wch: 16 }, { wch: 14 }, { wch: 16 },
      { wch: 14 }, { wch: 36 }, { wch: 28 }, { wch: 24 }, { wch: 20 },
      { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 26 },
      { wch: 34 }, { wch: 18 }, { wch: 14 }, { wch: 24 }, { wch: 20 },
      { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 50 }, { wch: 40 }
    ];
    XLSX.utils.book_append_sheet(workbook, wsCitas, 'Citas_Registradas');

    // Sheet 2: Purchase Orders Detail (`Ordenes_Compra_Detalle`)
    const ocRows: Record<string, any>[] = [];
    normalized.forEach((a) => {
      const items = a.purchaseOrders && a.purchaseOrders.length > 0
        ? a.purchaseOrders
        : [{
            id: `${a.id}-po-1`,
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
          'RUC Proveedor': a.supplierRuc,
          'Proveedor': a.supplierName,
          'N° Orden Compra': po.orderNumber,
          'Posición SAP': po.positionNumber,
          'Código Material': po.materialCode,
          'Descripción Material': po.materialDescription,
          'Cantidad': po.quantity,
          'Unidad': po.quantityUnit,
          'Palets': po.palletsCount,
          'Fecha Cita': a.scheduledDate || a.requestedDate
        });
      });
    });
    const wsOcs = XLSX.utils.json_to_sheet(ocRows);
    XLSX.utils.book_append_sheet(workbook, wsOcs, 'Ordenes_Compra_Detalle');

    // Sheet 3: Supplier Uploaded Documents in `src/documentos_proveedores` (`Documentos_Proveedores`)
    const docRows: Record<string, any>[] = [];
    normalized.forEach((a) => {
      (a.pdfAttachments || []).forEach((att) => {
        docRows.push({
          'ID Documento': att.id,
          'Código Ticket': a.ticketCode,
          'Proveedor': a.supplierName,
          'RUC Proveedor': a.supplierRuc,
          'Nombre Archivo': att.name,
          'Tipo Documento': att.documentType,
          'Tamaño (Bytes)': att.sizeBytes,
          'Fecha Subida': att.uploadedAt,
          'Ruta en Carpeta src': att.storedPath || `src/documentos_proveedores/${sanitizeFileName(att.name)}`
        });
      });
    });
    const wsDocs = XLSX.utils.json_to_sheet(docRows);
    XLSX.utils.book_append_sheet(workbook, wsDocs, 'Documentos_Proveedores');

    // Sheet 4: Audit History (`Historial_Auditoria`)
    const auditRows: Record<string, any>[] = [];
    normalized.forEach((a) => {
      (a.auditHistory || []).forEach((aud) => {
        auditRows.push({
          'Código Ticket': a.ticketCode,
          'Fecha / Hora': aud.timestamp,
          'Usuario': aud.userName,
          'Rol': aud.userRole,
          'Acción': aud.action,
          'Campo Modificado': aud.fieldChanged || '',
          'Valor Anterior': aud.previousValue || '',
          'Valor Nuevo': aud.newValue || '',
          'Notas': aud.notes || ''
        });
      });
    });
    const wsAudit = XLSX.utils.json_to_sheet(auditRows);
    XLSX.utils.book_append_sheet(workbook, wsAudit, 'Historial_Auditoria');

    // Write Excel file to both `src/data/citas_gloria.xlsx` and `data/citas_gloria.xlsx`
    XLSX.writeFile(workbook, EXCEL_DB_SRC_FILE);
    XLSX.writeFile(workbook, EXCEL_DB_DATA_FILE);
  } catch (err) {
    console.error('Error escribiendo base de datos Excel de citas:', err);
  }
}

// Load appointments from the Excel file (`src/data/citas_gloria.xlsx`)
function loadAppointmentsFromExcel(): AppointmentRequest[] {
  const targetExcel = fs.existsSync(EXCEL_DB_SRC_FILE)
    ? EXCEL_DB_SRC_FILE
    : fs.existsSync(EXCEL_DB_DATA_FILE)
    ? EXCEL_DB_DATA_FILE
    : null;

  if (targetExcel) {
    try {
      const workbook = XLSX.readFile(targetExcel);
      const sheetName = workbook.SheetNames[0];
      if (sheetName) {
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
        if (rows.length > 0) {
          const loaded: AppointmentRequest[] = rows.map((row, idx) => {
            if (row['JSON_Expediente']) {
              try {
                const parsed: AppointmentRequest = JSON.parse(String(row['JSON_Expediente']));
                return persistSupplierAttachmentsToSrc(parsed);
              } catch {
                // Fallback to column reconstruction below
              }
            }
            const reconstructed: AppointmentRequest = {
              id: String(row['ID Cita'] || `apt-row-${idx}`),
              ticketCode: String(row['Código Ticket'] || ''),
              createdAt: String(row['Fecha Creación'] || new Date().toISOString()),
              lastUpdated: String(row['Última Actualización'] || new Date().toISOString()),
              supplierId: String(row['ID Proveedor'] || 'user-prov-1'),
              supplierName: String(row['Razón Social Proveedor'] || ''),
              supplierRuc: String(row['RUC Proveedor'] || ''),
              supplierEmail: String(row['Correo Electrónico'] || ''),
              supplierPhone: String(row['Teléfono Proveedor'] || ''),
              driverName: row['Nombre Conductor'] ? String(row['Nombre Conductor']) : undefined,
              driverDni: row['DNI Conductor'] ? String(row['DNI Conductor']) : undefined,
              vehiclePlate: row['Placa Vehículo'] ? String(row['Placa Vehículo']) : undefined,
              orderNumber: String(row['N° Orden Compra'] || ''),
              positionNumber: String(row['Posición SAP'] || '10'),
              materialCode: String(row['Código Material'] || ''),
              materialDescription: String(row['Descripción Material'] || ''),
              quantity: Number(row['Cantidad Total'] || 0),
              quantityUnit: String(row['Unidad Medida'] || 'Unidades'),
              palletsCount: Number(row['Total Palets'] || 0),
              urgency: String(row['Nivel Urgencia']) === 'Urgente' ? 'Urgente' : 'Normal',
              urgencyJustification: row['Justificación Urgencia'] ? String(row['Justificación Urgencia']) : undefined,
              requestedDate: String(row['Fecha Solicitada'] || ''),
              requestedTime: String(row['Hora Solicitada'] || ''),
              scheduledDate: row['Fecha Programada'] ? String(row['Fecha Programada']) : undefined,
              scheduledTime: row['Hora Programada'] ? String(row['Hora Programada']) : undefined,
              plantLocation: String(row['Planta Destino'] || ''),
              status: (row['Estado Cita'] || 'pendiente') as AppointmentRequest['status'],
              pdfAttachments: [],
              reception: {
                dockAssigned: row['Bahía Asignada'] ? String(row['Bahía Asignada']) : undefined,
                receptionistName: row['Recepcionista'] ? String(row['Recepcionista']) : undefined,
                arrivalDateTime: row['Llegada Garita'] ? String(row['Llegada Garita']) : undefined,
                unloadingStartedAt: row['Inicio Descarga'] ? String(row['Inicio Descarga']) : undefined,
                attentionEndDateTime: row['Término Descarga'] ? String(row['Término Descarga']) : undefined,
                liquidationEndDateTime: row['Término Liquidación'] ? String(row['Término Liquidación']) : undefined,
                receptionObservation: row['Observaciones Recepción'] ? String(row['Observaciones Recepción']) : undefined
              },
              auditHistory: []
            };
            return persistSupplierAttachmentsToSrc(reconstructed);
          });
          return loaded;
        }
      }
    } catch (err) {
      console.error('Error leyendo archivo Excel de citas, inicializando con datos base:', err);
    }
  }

  // Initialize Excel file on first run
  const seeded = INITIAL_APPOINTMENTS.map(persistSupplierAttachmentsToSrc);
  saveAppointmentsToExcel(seeded);
  return seeded;
}

let inMemoryAppointments: AppointmentRequest[] = [];
inMemoryAppointments = loadAppointmentsFromExcel();

// ---------------- REST API ROUTES ----------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Portal de Citas y Logística Leche Gloria S.A.',
    excelDatabasePath: 'src/data/citas_gloria.xlsx',
    supplierDocumentsDir: 'src/documentos_proveedores',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve supplier documents stored in `src/documentos_proveedores`
app.use('/src/documentos_proveedores', express.static(SRC_DOCS_DIR));

app.get('/api/documents/file/:fileName', (req: Request, res: Response) => {
  const safeName = sanitizeFileName(req.params.fileName);
  const fullPath = path.join(SRC_DOCS_DIR, safeName);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Documento no encontrado en src/documentos_proveedores' });
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(fullPath);
});

// List all supplier documents saved inside `src/documentos_proveedores`
app.get('/api/documents', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(SRC_DOCS_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'));
    const list = files.map((fileName) => {
      const stat = fs.statSync(path.join(SRC_DOCS_DIR, fileName));
      return {
        fileName,
        storedPath: `src/documentos_proveedores/${fileName}`,
        fileUrl: `/api/documents/file/${encodeURIComponent(fileName)}`,
        sizeBytes: stat.size,
        updatedAt: stat.mtime.toISOString()
      };
    });
    res.json({ folder: 'src/documentos_proveedores', count: list.length, files: list });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo listar src/documentos_proveedores' });
  }
});

// Upload a supplier PDF document directly into `src/documentos_proveedores/`
app.post('/api/documents/upload', (req: Request, res: Response) => {
  const { id, name, documentType, sizeBytes, fileDataUrl, ticketCode, totalPages } = req.body || {};
  if (!name || !fileDataUrl) {
    return res.status(400).json({ error: 'Se requiere nombre y contenido del archivo PDF (fileDataUrl).' });
  }

  const prefix = ticketCode ? `${String(ticketCode).replace(/[^a-zA-Z0-9_-]/g, '')}_` : '';
  const safeFileName = sanitizeFileName(`${prefix}${name}`);
  const targetFilePath = path.join(SRC_DOCS_DIR, safeFileName);
  const relativeSrcPath = `src/documentos_proveedores/${safeFileName}`;
  const publicFileUrl = `/api/documents/file/${encodeURIComponent(safeFileName)}`;

  try {
    const base64Index = String(fileDataUrl).indexOf('base64,');
    const base64Data = base64Index !== -1 ? String(fileDataUrl).substring(base64Index + 7) : String(fileDataUrl);
    const fileBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(targetFilePath, fileBuffer);

    const savedAttachment: PdfAttachment = {
      id: id || `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      sizeBytes: sizeBytes || fileBuffer.length,
      uploadedAt: new Date().toISOString(),
      documentType: documentType || 'Guía de Remisión',
      storedPath: relativeSrcPath,
      fileUrl: publicFileUrl,
      totalPages: totalPages || 1
    };

    res.status(201).json(savedAttachment);
  } catch (err) {
    console.error('Error al guardar documento del proveedor en src/documentos_proveedores:', err);
    res.status(500).json({ error: 'No se pudo almacenar el documento en la carpeta src/documentos_proveedores.' });
  }
});

// Download the live Excel database (`src/data/citas_gloria.xlsx`)
app.get('/api/appointments/excel', (_req: Request, res: Response) => {
  saveAppointmentsToExcel(inMemoryAppointments);
  if (fs.existsSync(EXCEL_DB_SRC_FILE)) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="citas_gloria.xlsx"');
    return res.sendFile(EXCEL_DB_SRC_FILE);
  }
  res.status(404).json({ error: 'Archivo Excel de citas no encontrado' });
});

// GET all appointments (from Excel store)
app.get('/api/appointments', (_req: Request, res: Response) => {
  res.json(inMemoryAppointments);
});

// Sync full appointments list to Excel file (`src/data/citas_gloria.xlsx`)
app.post('/api/appointments/sync', (req: Request, res: Response) => {
  const { appointments } = req.body || {};
  if (!Array.isArray(appointments)) {
    return res.status(400).json({ error: 'Se requiere un arreglo de citas para sincronizar en el archivo Excel.' });
  }
  saveAppointmentsToExcel(appointments);
  res.json({
    success: true,
    excelPath: 'src/data/citas_gloria.xlsx',
    count: inMemoryAppointments.length,
    appointments: inMemoryAppointments
  });
});

// GET appointment by ID
app.get('/api/appointments/:id', (req: Request, res: Response) => {
  const item = inMemoryAppointments.find((a) => a.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }
  res.json(item);
});

// POST new appointment -> saves documents in `src/documentos_proveedores` & writes to Excel `src/data/citas_gloria.xlsx`
app.post('/api/appointments', (req: Request, res: Response) => {
  const newAppt: AppointmentRequest = req.body;
  if (!newAppt.ticketCode || !newAppt.orderNumber) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (ticketCode, orderNumber)' });
  }

  const persistedAppt = persistSupplierAttachmentsToSrc(newAppt);
  const updated = [persistedAppt, ...inMemoryAppointments.filter((a) => a.id !== persistedAppt.id)];
  saveAppointmentsToExcel(updated);
  res.status(201).json(persistedAppt);
});

// PUT update appointment -> updates Excel `src/data/citas_gloria.xlsx`
app.put('/api/appointments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = inMemoryAppointments.findIndex((a) => a.id === id);
  if (index === -1) {
    const created = persistSupplierAttachmentsToSrc(req.body);
    const updated = [created, ...inMemoryAppointments];
    saveAppointmentsToExcel(updated);
    return res.json(created);
  }

  const updatedItem = persistSupplierAttachmentsToSrc({
    ...inMemoryAppointments[index],
    ...req.body,
    lastUpdated: new Date().toISOString()
  });

  inMemoryAppointments[index] = updatedItem;
  saveAppointmentsToExcel(inMemoryAppointments);
  res.json(updatedItem);
});

// DELETE appointment -> RESTRICTED EXCLUSIVELY TO ADMIN (`role === 'admin'`)
app.delete('/api/appointments/:id', (req: Request, res: Response) => {
  const userRole = String(req.headers['x-user-role'] || req.query.role || '').toLowerCase();
  if (userRole !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado: Solo el administrador puede eliminar las citas registradas.'
    });
  }

  const { id } = req.params;
  const filtered = inMemoryAppointments.filter((a) => a.id !== id);
  saveAppointmentsToExcel(filtered);
  res.json({
    success: true,
    message: `Cita ${id} eliminada del archivo Excel por el Administrador.`,
    excelPath: 'src/data/citas_gloria.xlsx'
  });
});

// Reset data to demo state
app.post('/api/appointments/reset', (_req: Request, res: Response) => {
  const seeded = INITIAL_APPOINTMENTS.map(persistSupplierAttachmentsToSrc);
  saveAppointmentsToExcel(seeded);
  res.json({ success: true, message: 'Datos de demostración reiniciados en archivo Excel', data: seeded });
});

// Start Server and mount Vite / Static handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GLORIA LOGISTICS] Servidor activo en http://localhost:${PORT} | Base Excel: src/data/citas_gloria.xlsx | Docs: src/documentos_proveedores`);
  });
}

startServer();
