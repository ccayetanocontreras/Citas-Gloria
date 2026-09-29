import { AppointmentRequest, EmailNotification, User } from './types';

export const DEFAULT_PASSWORD = 'gloria2025';

export const GLORIA_PLANTS = [
  'Complejo Industrial Huachipa - Almacén Central Lima (Av. La Capitana 190)',
  'Planta Arequipa - Panamericana Sur Km 10.5 (Yura)',
  'Planta Cajamarca - Baños del Inca (Carretera Otuzco Km 4)',
  'Planta Trujillo - Parque Industrial (Salaverry)',
  'Centro de Distribución Lurín - Almacén Secos y Refrigerados (Lurín Km 38)'
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Ing. Carlos Cayetano',
    email: 'Carlos.Cayetano@gloria.com.pe',
    role: 'admin',
    companyName: 'Leche Gloria S.A. - Gerencia de Abastecimiento',
    ruc: '20100190797',
    phone: '+51 989 341 200',
    password: DEFAULT_PASSWORD,
    hasDefaultPassword: true
  },
  {
    id: 'user-recep',
    name: 'Walter Chauca Ramos',
    email: 'recepcion.huachipa@gloria.com.pe',
    role: 'recepcionista',
    companyName: 'Leche Gloria S.A. - Almacén Central Huachipa',
    ruc: '20100190797',
    phone: '+51 993 421 876',
    password: DEFAULT_PASSWORD,
    hasDefaultPassword: true
  },
  {
    id: 'user-plan',
    name: 'Lic. Roberto Mendoza',
    email: 'planificacion.abastecimiento@gloria.com.pe',
    role: 'planificacion',
    companyName: 'Leche Gloria S.A. - Dpto. Planificación y Abastecimiento',
    ruc: '20100190797',
    phone: '+51 988 512 340',
    password: DEFAULT_PASSWORD,
    hasDefaultPassword: true
  },
  {
    id: 'user-prov-1',
    name: 'Lic. Andrés Benavides',
    email: 'despacho@envasesdelperu.com.pe',
    role: 'proveedor',
    companyName: 'Envases Metálicos del Perú S.A.',
    ruc: '20198421034',
    phone: '+51 981 765 432',
    password: DEFAULT_PASSWORD,
    hasDefaultPassword: true
  },
  {
    id: 'user-prov-2',
    name: 'Ing. Carmen Salazar',
    email: 'logistica@agroindustriascartavio.pe',
    role: 'proveedor',
    companyName: 'Agroindustrias Cartavio & Cajas S.A.C.',
    ruc: '20459821430',
    phone: '+51 972 114 908',
    password: DEFAULT_PASSWORD,
    hasDefaultPassword: true
  }
];

export const INITIAL_APPOINTMENTS: AppointmentRequest[] = [
  {
    id: 'apt-001',
    ticketCode: 'GLO-2025-4819',
    createdAt: '2026-09-21T14:30:00.000Z',
    lastUpdated: '2026-09-22T08:15:00.000Z',
    supplierId: 'user-prov-1',
    supplierName: 'Envases Metálicos del Perú S.A.',
    supplierRuc: '20198421034',
    supplierEmail: 'despacho@envasesdelperu.com.pe',
    supplierPhone: '+51 981 765 432',
    driverName: 'Jorge Luis Paredes Gómez',
    driverDni: '42981045',
    vehiclePlate: 'B8X-921',
    purchaseOrders: [
      {
        id: 'po-101',
        orderNumber: '4500981240',
        positionNumber: '10',
        materialCode: 'MAT-GLO-100234',
        materialDescription: 'Hojalata litografiada barnizada 400g p/ Leche Gloria Evaporada Azul',
        quantity: 120000,
        quantityUnit: 'Unidades',
        palletsCount: 24
      },
      {
        id: 'po-102',
        orderNumber: '4500981240',
        positionNumber: '20',
        materialCode: 'MAT-GLO-300109',
        materialDescription: 'Tapas sanitarias de hojalata abre-fácil 73mm con logotipo Gloria',
        quantity: 60000,
        quantityUnit: 'Unidades',
        palletsCount: 12
      }
    ],
    orderNumber: '4500981240',
    positionNumber: '10, 20',
    materialCode: 'MAT-GLO-100234 (+1 más)',
    materialDescription: 'Hojalata litografiada 400g y tapas sanitarias abre-fácil 73mm',
    quantity: 180000,
    quantityUnit: 'Unidades',
    palletsCount: 36,
    urgency: 'Urgente',
    urgencyJustification: 'Línea de envasado 03 en Huachipa requiere reposición para el lote de producción programado a primera hora.',
    requestedDate: '2026-09-23',
    requestedTime: '08:00',
    scheduledDate: '2026-09-23',
    scheduledTime: '08:00',
    plantLocation: GLORIA_PLANTS[0],
    status: 'confirmada',
    pdfAttachments: [
      {
        id: 'att-01',
        name: 'Guia_Remision_001_004892.pdf',
        sizeBytes: 245000,
        uploadedAt: '2026-09-21T14:32:00.000Z',
        documentType: 'Guía de Remisión',
        totalPages: 2
      },
      {
        id: 'att-02',
        name: 'Factura_Electronica_F001_10924.pdf',
        sizeBytes: 184000,
        uploadedAt: '2026-09-21T14:33:00.000Z',
        documentType: 'Factura Comercial',
        totalPages: 1
      },
      {
        id: 'att-03',
        name: 'Certificado_Calidad_Lote_8921.pdf',
        sizeBytes: 312000,
        uploadedAt: '2026-09-21T14:35:00.000Z',
        documentType: 'Certificado de Calidad',
        totalPages: 2
      }
    ],
    reception: {
      dockAssigned: 'Bahía 02 - Hojalatas y Envases Metálicos',
      receptionistId: 'user-recep',
      receptionistName: 'Walter Chauca Ramos',
      receptionObservation: 'Prioridad alta confirmada para turno de la mañana. Rampa reservada.'
    },
    auditHistory: [
      {
        id: 'aud-101',
        timestamp: '2026-09-21T14:30:00.000Z',
        userId: 'user-prov-1',
        userName: 'Lic. Andrés Benavides',
        userRole: 'proveedor',
        action: 'Creación de Solicitud de Cita',
        fieldChanged: 'Estado Inicial',
        previousValue: 'N/A',
        newValue: 'Pendiente de Confirmación',
        notes: 'Registro inicial de cita para entrega de 36 palets con justificación urgente.'
      },
      {
        id: 'aud-102',
        timestamp: '2026-09-22T08:15:00.000Z',
        userId: 'user-recep',
        userName: 'Walter Chauca Ramos',
        userRole: 'recepcionista',
        action: 'Confirmación de Solicitud de Cita',
        fieldChanged: 'Estado',
        previousValue: 'Pendiente',
        newValue: 'Confirmada',
        notes: 'Aprobado para 08:00 hrs en Bahía 02. Notificación enviada al proveedor.'
      }
    ]
  },
  {
    id: 'apt-002',
    ticketCode: 'GLO-2025-3920',
    createdAt: '2026-09-20T10:15:00.000Z',
    lastUpdated: '2026-09-22T06:30:00.000Z',
    supplierId: 'user-prov-2',
    supplierName: 'Agroindustrias Cartavio & Cajas S.A.C.',
    supplierRuc: '20459821430',
    supplierEmail: 'logistica@agroindustriascartavio.pe',
    supplierPhone: '+51 972 114 908',
    driverName: 'Marcos Vilchez Rojas',
    driverDni: '10984512',
    vehiclePlate: 'D2A-745',
    purchaseOrders: [
      {
        id: 'po-201',
        orderNumber: '4500980512',
        positionNumber: '10',
        materialCode: 'MAT-GLO-200512',
        materialDescription: 'Cajas corrugadas Master 24 unidades p/ Leche Evaporada Azul',
        quantity: 50000,
        quantityUnit: 'Cajas',
        palletsCount: 20
      }
    ],
    orderNumber: '4500980512',
    positionNumber: '10',
    materialCode: 'MAT-GLO-200512',
    materialDescription: 'Cajas corrugadas Master 24 unidades p/ Leche Evaporada Azul',
    quantity: 50000,
    quantityUnit: 'Cajas',
    palletsCount: 20,
    urgency: 'Normal',
    requestedDate: '2026-09-22',
    requestedTime: '07:00',
    scheduledDate: '2026-09-22',
    scheduledTime: '07:00',
    plantLocation: GLORIA_PLANTS[0],
    status: 'liquidado',
    pdfAttachments: [
      {
        id: 'att-21',
        name: 'GR_Remitente_002_009124.pdf',
        sizeBytes: 198000,
        uploadedAt: '2026-09-20T10:18:00.000Z',
        documentType: 'Guía de Remisión',
        totalPages: 1
      },
      {
        id: 'att-22',
        name: 'Factura_E001_8921.pdf',
        sizeBytes: 154000,
        uploadedAt: '2026-09-20T10:20:00.000Z',
        documentType: 'Factura Comercial',
        totalPages: 1
      }
    ],
    reception: {
      dockAssigned: 'Bahía 03 - Cartones y Cajas Master',
      receptionistId: 'user-recep',
      receptionistName: 'Walter Chauca Ramos',
      arrivalDateTime: '2026-09-22T06:50:00.000Z',
      attentionEndDateTime: '2026-09-22T07:45:00.000Z',
      liquidationEndDateTime: '2026-09-22T08:10:00.000Z',
      receptionObservation: 'Se descargaron los 20 palets conformes. Calidad aprobó muestra de resistencia al estibado. Liquidación conforme en SAP.'
    },
    auditHistory: [
      {
        id: 'aud-201',
        timestamp: '2026-09-20T10:15:00.000Z',
        userId: 'user-prov-2',
        userName: 'Ing. Carmen Salazar',
        userRole: 'proveedor',
        action: 'Creación de Solicitud de Cita',
        fieldChanged: 'Estado Inicial',
        previousValue: 'N/A',
        newValue: 'Pendiente de Confirmación'
      },
      {
        id: 'aud-202',
        timestamp: '2026-09-20T11:40:00.000Z',
        userId: 'user-recep',
        userName: 'Walter Chauca Ramos',
        userRole: 'recepcionista',
        action: 'Confirmación de Solicitud de Cita',
        fieldChanged: 'Estado',
        previousValue: 'Pendiente',
        newValue: 'Confirmada',
        notes: 'Confirmado para 07:00 hrs en Bahía 03.'
      },
      {
        id: 'aud-203',
        timestamp: '2026-09-22T06:50:00.000Z',
        userId: 'user-recep',
        userName: 'Walter Chauca Ramos',
        userRole: 'recepcionista',
        action: 'Registro de Llegada del Proveedor (Check-in en Garita)',
        fieldChanged: 'arrivalDateTime',
        previousValue: 'Sin llegada',
        newValue: '2026-09-22 06:50',
        notes: 'Unidad D2A-745 con conductor Marcos Vilchez ingresó a garita.'
      },
      {
        id: 'aud-204',
        timestamp: '2026-09-22T07:45:00.000Z',
        userId: 'user-recep',
        userName: 'Walter Chauca Ramos',
        userRole: 'recepcionista',
        action: 'Registro de Término de Atención y Descarga Física',
        fieldChanged: 'attentionEndDateTime',
        previousValue: 'En atención',
        newValue: '2026-09-22 07:45',
        notes: 'Descarga culminada de 20 palets en 55 minutos.'
      },
      {
        id: 'aud-205',
        timestamp: '2026-09-22T08:10:00.000Z',
        userId: 'user-recep',
        userName: 'Walter Chauca Ramos',
        userRole: 'recepcionista',
        action: 'Registro de Término de Liquidación Documentaria',
        fieldChanged: 'liquidationEndDateTime',
        previousValue: 'Pendiente liquidar',
        newValue: '2026-09-22 08:10',
        notes: 'Ingreso a SAP concluido y guías selladas.'
      }
    ]
  },
  {
    id: 'apt-003',
    ticketCode: 'GLO-2025-5104',
    createdAt: '2026-09-22T05:00:00.000Z',
    lastUpdated: '2026-09-22T05:00:00.000Z',
    supplierId: 'user-prov-1',
    supplierName: 'Envases Metálicos del Perú S.A.',
    supplierRuc: '20198421034',
    supplierEmail: 'despacho@envasesdelperu.com.pe',
    supplierPhone: '+51 981 765 432',
    driverName: 'Raúl Mendoza Carranza',
    driverDni: '09812401',
    vehiclePlate: 'F5R-902',
    purchaseOrders: [
      {
        id: 'po-301',
        orderNumber: '4500983110',
        positionNumber: '10',
        materialCode: 'MAT-GLO-600145',
        materialDescription: 'Etiquetas termoencogibles PVC Gloria Yogurt Batido 1Kg Fresa y Durazno',
        quantity: 250000,
        quantityUnit: 'Unidades',
        palletsCount: 25
      }
    ],
    orderNumber: '4500983110',
    positionNumber: '10',
    materialCode: 'MAT-GLO-600145',
    materialDescription: 'Etiquetas termoencogibles PVC Gloria Yogurt Batido 1Kg',
    quantity: 250000,
    quantityUnit: 'Unidades',
    palletsCount: 25,
    urgency: 'Normal',
    requestedDate: '2026-09-24',
    requestedTime: '10:00',
    plantLocation: GLORIA_PLANTS[0],
    status: 'pendiente',
    pdfAttachments: [
      {
        id: 'att-31',
        name: 'Guia_Remision_GR_001_004910.pdf',
        sizeBytes: 210000,
        uploadedAt: '2026-09-22T05:02:00.000Z',
        documentType: 'Guía de Remisión',
        totalPages: 1
      }
    ],
    reception: {},
    auditHistory: [
      {
        id: 'aud-301',
        timestamp: '2026-09-22T05:00:00.000Z',
        userId: 'user-prov-1',
        userName: 'Lic. Andrés Benavides',
        userRole: 'proveedor',
        action: 'Creación de Solicitud de Cita',
        fieldChanged: 'Estado Inicial',
        previousValue: 'N/A',
        newValue: 'Pendiente de Confirmación',
        notes: 'Solicitud para 25 palets de etiquetas de yogurt.'
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'mail-01',
    timestamp: '2026-09-21T14:31:00.000Z',
    appointmentId: 'apt-001',
    ticketCode: 'GLO-2025-4819',
    recipientEmail: 'despacho@envasesdelperu.com.pe',
    recipientName: 'Envases Metálicos del Perú S.A.',
    subject: 'Confirmación de Recepción de Solicitud de Cita - GLO-2025-4819 - Leche Gloria S.A.',
    bodyHtml: '<p>Estimado proveedor, su solicitud ha sido recibida en el sistema de Leche Gloria S.A.</p>',
    bodyText: 'Estimado proveedor, su solicitud GLO-2025-4819 ha sido recibida.',
    triggerEvent: 'solicitud_creada',
    status: 'Enviado'
  },
  {
    id: 'mail-02',
    timestamp: '2026-09-22T08:16:00.000Z',
    appointmentId: 'apt-001',
    ticketCode: 'GLO-2025-4819',
    recipientEmail: 'despacho@envasesdelperu.com.pe',
    recipientName: 'Envases Metálicos del Perú S.A.',
    subject: '¡Cita Aprobada y Confirmada! - GLO-2025-4819 - Leche Gloria S.A.',
    bodyHtml: '<p>Su cita para la OC 4500981240 ha sido confirmada para el 23/09/2026 a las 08:00 hrs en Bahía 02.</p>',
    bodyText: 'Cita confirmada para 23/09/2026 a las 08:00 hrs en Bahía 02.',
    triggerEvent: 'cita_confirmada',
    status: 'Enviado'
  }
];

// LocalStorage helpers
const STORAGE_KEY_USERS = 'gloria_citas_users_v1';
const STORAGE_KEY_APPOINTMENTS = 'gloria_citas_data_v1';
const STORAGE_KEY_NOTIFICATIONS = 'gloria_citas_notifications_v1';
const STORAGE_KEY_CURRENT_USER = 'gloria_citas_current_user_v1';

export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    if (data) {
      const parsed: User[] = JSON.parse(data);
      // Ensure admin user name and email are synchronized to Ing. Carlos Cayetano and Carlos.Cayetano@gloria.com.pe
      const updated = parsed.map((u) => {
        if (
          u.role === 'admin' || 
          u.id === 'user-admin' || 
          u.email.toLowerCase() === 'admin.logistica@gloria.com.pe' ||
          u.email.toLowerCase() === 'carlos.cayetano@gloria.com.pe'
        ) {
          return { 
            ...u, 
            name: 'Ing. Carlos Cayetano', 
            email: 'Carlos.Cayetano@gloria.com.pe' 
          };
        }
        return u;
      });

      // Ensure user-plan is present
      if (!updated.some(u => u.role === 'planificacion' || u.id === 'user-plan')) {
        updated.push({
          id: 'user-plan',
          name: 'Lic. Roberto Mendoza',
          email: 'planificacion.abastecimiento@gloria.com.pe',
          role: 'planificacion',
          companyName: 'Leche Gloria S.A. - Dpto. Planificación y Abastecimiento',
          ruc: '20100190797',
          phone: '+51 988 512 340',
          password: DEFAULT_PASSWORD,
          hasDefaultPassword: true
        });
      }

      return updated;
    }
  } catch (e) {
    console.error('Error reading users from localStorage', e);
  }
  return INITIAL_USERS;
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (data) {
      const parsed: User = JSON.parse(data);
      if (
        parsed.role === 'admin' || 
        parsed.id === 'user-admin' || 
        parsed.email.toLowerCase() === 'admin.logistica@gloria.com.pe' ||
        parsed.email.toLowerCase() === 'carlos.cayetano@gloria.com.pe'
      ) {
        parsed.name = 'Ing. Carlos Cayetano';
        parsed.email = 'Carlos.Cayetano@gloria.com.pe';
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading current user from localStorage', e);
  }
  return INITIAL_USERS[0]; // Default to Admin Gloria (Ing. Carlos Cayetano)
}

export function setCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (e) {
    console.error('Error saving current user to localStorage', e);
  }
}

export function validateUserLogin(identifier: string, pass: string): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers();
  const cleanId = identifier.trim().toLowerCase();
  
  const found = users.find(u => 
    u.email.toLowerCase() === cleanId || 
    (cleanId === 'admin.logistica@gloria.com.pe' && u.email.toLowerCase() === 'carlos.cayetano@gloria.com.pe') ||
    (cleanId === 'admin@gloria.com.pe' && u.role === 'admin') ||
    (u.ruc && u.ruc.toLowerCase() === cleanId)
  );

  if (!found) {
    return { success: false, error: 'Usuario o RUC no encontrado en el sistema.' };
  }

  const expectedPass = found.password || DEFAULT_PASSWORD;
  if (pass !== expectedPass) {
    return { success: false, error: 'Contraseña incorrecta. Por favor intente nuevamente.' };
  }

  return { success: true, user: found };
}

export function updateUserPassword(userId: string, newPass: string): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  const updatedUser: User = {
    ...users[index],
    password: newPass,
    hasDefaultPassword: newPass === DEFAULT_PASSWORD
  };

  users[index] = updatedUser;
  saveUsers(users);
  setCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function deleteStoredUser(userId: string): { success: boolean; error?: string; remainingUsers?: User[] } {
  const users = getStoredUsers();
  const targetUser = users.find(u => u.id === userId);
  if (!targetUser) {
    return { success: false, error: 'Usuario no encontrado' };
  }

  if (targetUser.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
    return { success: false, error: 'No se puede eliminar la cuenta principal del Administrador del sistema.' };
  }

  const remaining = users.filter(u => u.id !== userId);
  saveUsers(remaining);
  return { success: true, remainingUsers: remaining };
}

export function addStoredUser(newUser: User): { success: boolean; error?: string; updatedUsers?: User[] } {
  const users = getStoredUsers();
  const cleanEmail = newUser.email.trim().toLowerCase();
  
  const existing = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

  if (existing) {
    return { success: false, error: `Ya existe un usuario registrado con el correo ${newUser.email}` };
  }

  {/* Esta es la sección de validación de RUC

  if (newUser.ruc) {
    const existingRuc = users.find(u => u.ruc === newUser.ruc);
    if (existingRuc) {
      return { success: false, error: `Ya existe una empresa registrada con el RUC ${newUser.ruc}` };
    }
  }  
  */}

  const updated = [...users, newUser];
  saveUsers(updated);
  return { success: true, updatedUsers: updated };
}

export function getStoredAppointments(): AppointmentRequest[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (data) {
      const parsed: AppointmentRequest[] = JSON.parse(data);
      return parsed.map((apt) => {
        if (!apt.planningValidation) {
          const isPreConfirmed = ['confirmada', 'reprogramada', 'en_planta', 'en_atencion', 'en_descarga', 'atendido', 'liquidado', 'liquidada'].includes(apt.status);
          return {
            ...apt,
            planningValidation: isPreConfirmed ? {
              status: 'validado',
              isValidated: true,
              validatorName: 'Lic. Roberto Mendoza',
              validatedBy: 'user-plan',
              validatedAt: apt.createdAt,
              sapPoVerified: true,
              quotaAssigned: true,
              notes: 'Órdenes de Compra validadas conforme en SAP Gloria.'
            } : {
              status: 'pendiente',
              isValidated: false,
              notes: 'Pendiente de validación de OCs por el área de Planificación Gloria S.A.'
            }
          };
        }
        return apt;
      });
    }
  } catch (e) {
    console.error('Error reading appointments from localStorage', e);
  }
  return INITIAL_APPOINTMENTS;
}

export function saveAppointments(appointments: AppointmentRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  } catch (e) {
    console.error('Error saving appointments to localStorage', e);
  }
}

export function getStoredNotifications(): EmailNotification[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading notifications from localStorage', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifications: EmailNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications to localStorage', e);
  }
}

export function resetToInitialDemo(): AppointmentRequest[] {
  try {
    localStorage.removeItem(STORAGE_KEY_APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
  } catch (e) {
    console.error('Error clearing demo data', e);
  }
  return INITIAL_APPOINTMENTS;
}

