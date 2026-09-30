export type UserRole = 'admin' | 'recepcionista' | 'proveedor' | 'planificacion';

export type UrgencyLevel = 'Normal' | 'Urgente';

export type AppointmentStatus = 
  | 'pendiente' 
  | 'solicitada'
  | 'confirmada' 
  | 'reprogramada' 
  | 'en_planta' 
  | 'en_atencion' 
  | 'en_descarga'
  | 'atendido' 
  | 'liquidado' 
  | 'liquidada'
  | 'cancelada'
  | 'inasistencia';

export interface PlanningValidationData {
  status: 'pendiente' | 'validado' | 'observado';
  isValidated: boolean;
  validatedBy?: string;
  validatorName?: string;
  validatedAt?: string;
  notes?: string;
  sapPoVerified?: boolean;
  quotaAssigned?: boolean;
  linesValidatedCount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName: string;
  ruc?: string;
  phone?: string;
  password?: string;
  hasDefaultPassword?: boolean;
}

export interface PurchaseOrderItem {
  id: string;
  orderNumber: string;
  positionNumber: string;
  materialCode: string;
  materialDescription: string;
  quantity: number;
  quantityUnit: string;
  palletsCount: number;
  notes?: string;
}

export interface PdfAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: string;
  documentType: 'Guía de Remisión' | 'Factura Comercial' | 'Certificado de Calidad' | 'Packing List' | 'Otro';
  fileDataUrl?: string;
  storedPath?: string;
  fileUrl?: string;
  totalPages?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  fieldChanged?: string;
  previousValue?: string;
  newValue?: string;
  notes?: string;
}

export interface ReceptionData {
  dockAssigned?: string;
  receptionistId?: string;
  receptionistName?: string;
  arrivalDateTime?: string;
  attentionEndDateTime?: string;
  liquidationEndDateTime?: string;
  receptionObservation?: string;
  arrivedAt?: string;
  unloadingStartedAt?: string;
  unloadingFinishedAt?: string;
  liquidationFinishedAt?: string;
  inspectorName?: string;
  receptionNotes?: string;
  divergencePallets?: number;
  divergenceReason?: string;
  isNoShow?: boolean;
  noShowReason?: string;
  noShowRegisteredAt?: string;
}

export interface SafetyDocumentAcceptedItem {
  id: string;
  code: string;
  title: string;
  fileName: string;
  acceptedAt: string;
}

export interface SafetyDocumentsAcceptance {
  acceptedAll: boolean;
  acceptedAt: string;
  acceptedByUserId: string;
  acceptedByUserName: string;
  documents: SafetyDocumentAcceptedItem[];
}

export interface AppointmentRequest {
  id: string;
  ticketCode: string;
  createdAt: string;
  lastUpdated: string;
  supplierId: string;
  supplierName: string;
  supplierRuc: string;
  supplierEmail: string;
  supplierPhone?: string;
  driverName?: string;
  driverDni?: string;
  vehiclePlate?: string;
  purchaseOrders?: PurchaseOrderItem[];
  orderNumber: string;
  positionNumber: string;
  materialCode: string;
  materialDescription: string;
  quantity: number;
  quantityUnit: string;
  palletsCount: number;
  urgency: UrgencyLevel;
  urgencyJustification?: string;
  requestedDate: string;
  requestedTime: string;
  scheduledDate?: string;
  scheduledTime?: string;
  plantLocation: string;
  status: AppointmentStatus;
  pdfAttachments: PdfAttachment[];
  reception: ReceptionData;
  planningValidation?: PlanningValidationData;
  safetyDocumentsAcceptance?: SafetyDocumentsAcceptance;
  auditHistory: AuditLogEntry[];
}

export interface EmailNotification {
  id: string;
  timestamp: string;
  appointmentId: string;
  ticketCode: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  triggerEvent: string;
  status: 'Enviado' | 'Pendiente' | 'Fallido';
}
