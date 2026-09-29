import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parsers with support for PDF base64 / documents
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial sample data for Leche Gloria S.A.
interface AppointmentItem {
  id: string;
  ticketCode: string;
  orderNumber: string;
  positionNumber: string;
  materialCode: string;
  materialDescription: string;
  quantity: number;
  quantityUnit: string;
  palletsCount: number;
  supplierName: string;
  supplierRuc: string;
  supplierEmail: string;
  supplierPhone?: string;
  urgency: string;
  requestedDate: string;
  requestedTime: string;
  scheduledDate?: string;
  scheduledTime?: string;
  status: string;
  plantLocation: string;
  driverName?: string;
  driverDni?: string;
  vehiclePlate?: string;
  observations?: string;
  pdfAttachments: any[];
  auditHistory: any[];
  reception: {
    dockAssigned?: string;
    arrivedAt?: string;
    unloadingStartedAt?: string;
    unloadingFinishedAt?: string;
    liquidationFinishedAt?: string;
    inspectorName?: string;
    receptionNotes?: string;
    divergencePallets?: number;
    divergenceReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Data storage directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'appointments.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock dataset
const INITIAL_DATA: AppointmentItem[] = [
  {
    id: 'appt-1',
    ticketCode: 'GLO-2025-001',
    orderNumber: '4500982341',
    positionNumber: '10',
    materialCode: 'ENV-PET-1000',
    materialDescription: 'Botellas PET 1000ml Transparente Grado Alimentario',
    quantity: 48000,
    quantityUnit: 'UN',
    palletsCount: 24,
    supplierName: 'Envases y Empaques del Perú S.A.C.',
    supplierRuc: '20512345678',
    supplierEmail: 'logistica@envasesperu.com.pe',
    supplierPhone: '+51 987 654 321',
    urgency: 'Urgente',
    requestedDate: '2025-10-15',
    requestedTime: '08:30',
    scheduledDate: '2025-10-15',
    scheduledTime: '08:30',
    status: 'en_descarga',
    plantLocation: 'Planta Huachipa (Av. Las Torres s/n)',
    driverName: 'Juan Carlos Morales Ríos',
    driverDni: '42318902',
    vehiclePlate: 'B9K-812',
    observations: 'Entrega prioritaria para línea de llenado N° 3. Contenedor sellado.',
    pdfAttachments: [
      {
        id: 'pdf-1',
        name: 'Guia_Remision_001-9821.pdf',
        documentType: 'Guía de Remisión',
        sizeBytes: 245000,
        uploadedAt: '2025-10-14T14:30:00Z',
        totalPages: 2
      },
      {
        id: 'pdf-2',
        name: 'Orden_Compra_4500982341.pdf',
        documentType: 'Orden de Compra',
        sizeBytes: 182000,
        uploadedAt: '2025-10-14T14:32:00Z',
        totalPages: 1
      },
      {
        id: 'pdf-3',
        name: 'Certificado_Calidad_Lote_89.pdf',
        documentType: 'Certificado de Calidad',
        sizeBytes: 310000,
        uploadedAt: '2025-10-14T14:35:00Z',
        totalPages: 3
      }
    ],
    auditHistory: [
      {
        id: 'audit-1',
        timestamp: '2025-10-14T14:35:00Z',
        userId: 'prov-1',
        userName: 'Envases del Perú (Logística)',
        userRole: 'proveedor',
        action: 'Creación de Solicitud de Cita',
        fieldChanged: 'status',
        previousValue: '',
        newValue: 'solicitada',
        notes: 'Registro inicial de cita para 24 palets con 3 documentos adjuntos.'
      },
      {
        id: 'audit-2',
        timestamp: '2025-10-14T16:10:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Confirmación y Asignación de Bahía',
        fieldChanged: 'dockAssigned',
        previousValue: 'Por asignar',
        newValue: 'Bahía 02',
        notes: 'Aprobado para turno mañana. Bahía 02 asignada.'
      },
      {
        id: 'audit-3',
        timestamp: '2025-10-15T08:15:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Check-in y Registro de Llegada a Garita',
        fieldChanged: 'reception.arrivedAt',
        previousValue: '',
        newValue: '2025-10-15 08:15:00',
        notes: 'Vehículo se presentó puntualmente con EPP reglamentario y SCTR.'
      },
      {
        id: 'audit-4',
        timestamp: '2025-10-15T08:35:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Inicio de Descarga',
        fieldChanged: 'reception.unloadingStartedAt',
        previousValue: '',
        newValue: '2025-10-15 08:35:00',
        notes: 'Cuadrilla de montacargas asignada.'
      }
    ],
    reception: {
      dockAssigned: 'Bahía 02 - Almacén Insumos Huachipa',
      arrivedAt: '2025-10-15T08:15:00Z',
      unloadingStartedAt: '2025-10-15T08:35:00Z',
      inspectorName: 'Ing. Rodrigo Cárdenas',
      receptionNotes: 'Inspección visual de palets conforme. Sin abolladuras ni roturas.'
    },
    createdAt: '2025-10-14T14:35:00Z',
    updatedAt: '2025-10-15T08:35:00Z'
  },
  {
    id: 'appt-2',
    ticketCode: 'GLO-2025-002',
    orderNumber: '4500982510',
    positionNumber: '20',
    materialCode: 'ETIQ-EVP-400G',
    materialDescription: 'Etiquetas Termoencogibles Gloria Evaporada Entera 400g',
    quantity: 120000,
    quantityUnit: 'MLL',
    palletsCount: 16,
    supplierName: 'Industrias Gráficas del Centro S.A.',
    supplierRuc: '20109988776',
    supplierEmail: 'despacho@graficascentro.pe',
    supplierPhone: '+51 999 888 777',
    urgency: 'Normal',
    requestedDate: '2025-10-15',
    requestedTime: '10:00',
    scheduledDate: '2025-10-15',
    scheduledTime: '10:00',
    status: 'confirmada',
    plantLocation: 'Planta Huachipa (Av. Las Torres s/n)',
    driverName: 'Raúl Mendoza Flores',
    driverDni: '10492811',
    vehiclePlate: 'T7A-901',
    observations: 'Bobinas de etiquetas empacadas al vacío con film stretch.',
    pdfAttachments: [
      {
        id: 'pdf-4',
        name: 'Guia_Remision_002-3312.pdf',
        documentType: 'Guía de Remisión',
        sizeBytes: 198000,
        uploadedAt: '2025-10-14T17:00:00Z',
        totalPages: 2
      }
    ],
    auditHistory: [
      {
        id: 'audit-5',
        timestamp: '2025-10-14T17:00:00Z',
        userId: 'prov-2',
        userName: 'Industrias Gráficas (Ventas)',
        userRole: 'proveedor',
        action: 'Creación de Solicitud de Cita',
        fieldChanged: 'status',
        previousValue: '',
        newValue: 'solicitada',
        notes: 'Solicitud enviada para 16 palets de etiquetas.'
      },
      {
        id: 'audit-6',
        timestamp: '2025-10-14T17:40:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Confirmación de Cita',
        fieldChanged: 'status',
        previousValue: 'solicitada',
        newValue: 'confirmada',
        notes: 'Cita confirmada para las 10:00 hrs. Bahía 04 reservada.'
      }
    ],
    reception: {
      dockAssigned: 'Bahía 04 - Almacén Insumos Huachipa'
    },
    createdAt: '2025-10-14T17:00:00Z',
    updatedAt: '2025-10-14T17:40:00Z'
  },
  {
    id: 'appt-3',
    ticketCode: 'GLO-2025-003',
    orderNumber: '4500982633',
    positionNumber: '10',
    materialCode: 'CAJA-CART-24U',
    materialDescription: 'Cajas de Cartón Corrugado 24x400g Gloria Leche Azul',
    quantity: 35000,
    quantityUnit: 'UN',
    palletsCount: 30,
    supplierName: 'Cartones y Empaques de Exportación S.A.',
    supplierRuc: '20304050607',
    supplierEmail: 'coordinacion@cartonex.com.pe',
    supplierPhone: '+51 977 112 233',
    urgency: 'Urgente',
    requestedDate: '2025-10-15',
    requestedTime: '11:30',
    scheduledDate: '2025-10-15',
    scheduledTime: '11:30',
    status: 'solicitada',
    plantLocation: 'Planta Huachipa (Av. Las Torres s/n)',
    driverName: 'Wilmer Peña Salazar',
    driverDni: '44882190',
    vehiclePlate: 'F4J-772',
    observations: 'Cajas flejadas sobre palets normalizados de madera tratada con sello NIMF 15.',
    pdfAttachments: [
      {
        id: 'pdf-5',
        name: 'Guia_Remision_005-1289.pdf',
        documentType: 'Guía de Remisión',
        sizeBytes: 212000,
        uploadedAt: '2025-10-15T07:15:00Z',
        totalPages: 2
      }
    ],
    auditHistory: [
      {
        id: 'audit-7',
        timestamp: '2025-10-15T07:15:00Z',
        userId: 'prov-3',
        userName: 'Cartones y Empaques (Despacho)',
        userRole: 'proveedor',
        action: 'Creación de Solicitud de Cita Urgente',
        fieldChanged: 'status',
        previousValue: '',
        newValue: 'solicitada',
        notes: 'Urgente por reposición de stock de envasado.'
      }
    ],
    reception: {},
    createdAt: '2025-10-15T07:15:00Z',
    updatedAt: '2025-10-15T07:15:00Z'
  },
  {
    id: 'appt-4',
    ticketCode: 'GLO-2025-004',
    orderNumber: '4500981990',
    positionNumber: '30',
    materialCode: 'AZUCAR-REF-50KG',
    materialDescription: 'Azúcar Refinada Extra Blanca en Sacos de 50 Kg',
    quantity: 600,
    quantityUnit: 'SC',
    palletsCount: 30,
    supplierName: 'Agroindustrial Paramonga S.A.A.',
    supplierRuc: '20100085497',
    supplierEmail: 'despachos@paramonga.com.pe',
    supplierPhone: '+51 988 554 433',
    urgency: 'Normal',
    requestedDate: '2025-10-14',
    requestedTime: '15:00',
    scheduledDate: '2025-10-14',
    scheduledTime: '15:00',
    status: 'liquidada',
    plantLocation: 'Planta Huachipa (Av. Las Torres s/n)',
    driverName: 'Marcos Villegas Toro',
    driverDni: '09812455',
    vehiclePlate: 'C2V-889',
    observations: 'Materia prima grado alimenticio. Inspeccionado en garita.',
    pdfAttachments: [
      {
        id: 'pdf-6',
        name: 'Guia_Remision_001-4432.pdf',
        documentType: 'Guía de Remisión',
        sizeBytes: 250000,
        uploadedAt: '2025-10-14T09:00:00Z',
        totalPages: 2
      },
      {
        id: 'pdf-7',
        name: 'Certificado_Analisis_Calidad.pdf',
        documentType: 'Certificado de Calidad',
        sizeBytes: 180000,
        uploadedAt: '2025-10-14T09:05:00Z',
        totalPages: 1
      }
    ],
    auditHistory: [
      {
        id: 'audit-8',
        timestamp: '2025-10-14T09:05:00Z',
        userId: 'prov-4',
        userName: 'Paramonga (Despacho)',
        userRole: 'proveedor',
        action: 'Creación de Solicitud',
        fieldChanged: 'status',
        previousValue: '',
        newValue: 'solicitada',
        notes: 'Solicitud aprobada y coordinada.'
      },
      {
        id: 'audit-9',
        timestamp: '2025-10-14T14:45:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Registro de Llegada (Check-in)',
        fieldChanged: 'reception.arrivedAt',
        previousValue: '',
        newValue: '2025-10-14 14:45:00',
        notes: 'Llegada dentro de tolerancia.'
      },
      {
        id: 'audit-10',
        timestamp: '2025-10-14T15:10:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Inicio Descarga en Bahía 01',
        fieldChanged: 'reception.unloadingStartedAt',
        previousValue: '',
        newValue: '2025-10-14 15:10:00',
        notes: 'Ingreso directo a rampa.'
      },
      {
        id: 'audit-11',
        timestamp: '2025-10-14T16:20:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Término de Descarga',
        fieldChanged: 'reception.unloadingFinishedAt',
        previousValue: '',
        newValue: '2025-10-14 16:20:00',
        notes: '30 palets descargados completos sin mermas.'
      },
      {
        id: 'audit-12',
        timestamp: '2025-10-14T16:45:00Z',
        userId: 'rec-1',
        userName: 'Marita Ramos (Recepcionista Almacén)',
        userRole: 'recepcionista',
        action: 'Término de Liquidación y Firma de Conformidad',
        fieldChanged: 'status',
        previousValue: 'atencion_terminada',
        newValue: 'liquidada',
        notes: 'Guía física sellada y firmada conforme en sistema SAP Gloria.'
      }
    ],
    reception: {
      dockAssigned: 'Bahía 01 - Materias Primas',
      arrivedAt: '2025-10-14T14:45:00Z',
      unloadingStartedAt: '2025-10-14T15:10:00Z',
      unloadingFinishedAt: '2025-10-14T16:20:00Z',
      liquidationFinishedAt: '2025-10-14T16:45:00Z',
      inspectorName: 'Ing. Rodrigo Cárdenas',
      receptionNotes: 'Lote analizado en laboratorio de calidad. Parámetros fisicoquímicos aprobados.'
    },
    createdAt: '2025-10-14T09:05:00Z',
    updatedAt: '2025-10-14T16:45:00Z'
  }
];

// Helper to load or persist appointments
function loadAppointments(): AppointmentItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading appointments file, using in-memory store:', err);
  }
  return INITIAL_DATA;
}

let inMemoryAppointments: AppointmentItem[] = loadAppointments();

function saveAppointmentsToDisk(data: AppointmentItem[]) {
  inMemoryAppointments = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving appointments to disk:', err);
  }
}

// ---------------- REST API ROUTES ----------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Portal de Citas y Logística Leche Gloria S.A. (Node.js Express Engine)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// GET all appointments
app.get('/api/appointments', (req: Request, res: Response) => {
  res.json(inMemoryAppointments);
});

// GET appointment by ID
app.get('/api/appointments/:id', (req: Request, res: Response) => {
  const item = inMemoryAppointments.find((a) => a.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Cita no encontrada' });
  }
  res.json(item);
});

// POST new appointment
app.post('/api/appointments', (req: Request, res: Response) => {
  const newAppt: AppointmentItem = req.body;
  if (!newAppt.ticketCode || !newAppt.orderNumber) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (ticketCode, orderNumber)' });
  }

  // Prepend
  const updated = [newAppt, ...inMemoryAppointments];
  saveAppointmentsToDisk(updated);
  res.status(201).json(newAppt);
});

// PUT update appointment
app.put('/api/appointments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = inMemoryAppointments.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Cita no encontrada para actualizar' });
  }

  const updatedItem = {
    ...inMemoryAppointments[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  inMemoryAppointments[index] = updatedItem;
  saveAppointmentsToDisk(inMemoryAppointments);
  res.json(updatedItem);
});

// DELETE appointment
app.delete('/api/appointments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const filtered = inMemoryAppointments.filter((a) => a.id !== id);
  saveAppointmentsToDisk(filtered);
  res.json({ success: true, message: `Cita ${id} eliminada` });
});

// Reset data to demo state
app.post('/api/appointments/reset', (req: Request, res: Response) => {
  saveAppointmentsToDisk(INITIAL_DATA);
  res.json({ success: true, message: 'Datos de demostración reiniciados', data: INITIAL_DATA });
});

// Start Server and mount Vite / Static handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Vite middleware
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
    // Production mode: static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GLORIA LOGISTICS] Servidor Node.js Express activo en http://localhost:${PORT}`);
  });
}

startServer();
