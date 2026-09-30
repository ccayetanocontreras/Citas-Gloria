import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  Package, 
  Truck, 
  Check, 
  AlertTriangle,
  Building,
  Info,
  Plus,
  Copy,
  Layers,
  ShieldCheck,
  Eye,
  Download,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { AppointmentRequest, PdfAttachment, UrgencyLevel, User, PurchaseOrderItem } from '../types';
import { GLORIA_PLANTS } from '../mockData';
import { MANDATORY_SAFETY_DOCUMENTS, MandatorySafetyDocument, downloadSafetyDocumentPdf } from '../utils/safetyDocuments';
import { SafetyDocumentReaderModal } from './SafetyDocumentReaderModal';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newAppointment: AppointmentRequest) => void;
  currentUser: User;
}

interface FormPurchaseOrderItem {
  id: string;
  orderNumber: string;
  positionNumber: string;
  materialCode: string;
  materialDescription: string;
  quantity: number | '';
  quantityUnit: string;
  palletsCount: number | '';
  notes?: string;
}

const COMMON_GLORIA_MATERIALS = [
  { code: 'MAT-GLO-100234', desc: 'Hojalata litografiada barnizada 400g p/ Leche Gloria Evaporada', unit: 'Unidades', defaultPalletCapacity: 5000 },
  { code: 'MAT-GLO-200512', desc: 'Cajas corrugadas Master 24 unidades p/ Leche Evaporada Azul', unit: 'Cajas', defaultPalletCapacity: 2500 },
  { code: 'MAT-GLO-300109', desc: 'Tapas abre-fácil sanitarias hojalata/aluminio dia. 73mm', unit: 'Unidades', defaultPalletCapacity: 5000 },
  { code: 'MAT-GLO-400870', desc: 'Leche fresca cruda refrigerada grado A', unit: 'Litros', defaultPalletCapacity: 1000 },
  { code: 'MAT-GLO-500320', desc: 'Film polietileno termoencogible tricapa 50 micras', unit: 'Kg', defaultPalletCapacity: 800 },
  { code: 'MAT-GLO-600145', desc: 'Etiquetas termoencogibles PVC Gloria Yogurt Batido 1Kg', unit: 'Unidades', defaultPalletCapacity: 10000 },
  { code: 'MAT-GLO-700911', desc: 'Azúcar refinada grado industrial p/ néctares y lácteos', unit: 'Kg', defaultPalletCapacity: 1250 }
];

export const SupplierFormModal: React.FC<SupplierFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  if (!isOpen) return null;

  // Form states - Multi-Purchase Orders list
  const [purchaseOrders, setPurchaseOrders] = useState<FormPurchaseOrderItem[]>([
    {
      id: `po-${Date.now()}-1`,
      orderNumber: '',
      positionNumber: '10',
      materialCode: '',
      materialDescription: '',
      quantity: '',
      quantityUnit: 'Unidades',
      palletsCount: '',
      notes: ''
    }
  ]);

  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [urgencyJustification, setUrgencyJustification] = useState('');
  
  // Date & Time
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [requestedDate, setRequestedDate] = useState(defaultDateStr);
  const [requestedTime, setRequestedTime] = useState('09:00');
  const [plantLocation, setPlantLocation] = useState(GLORIA_PLANTS[0]);

  // Driver details (for Gate Check-in)
  const [driverName, setDriverName] = useState('');
  const [driverDni, setDriverDni] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');

  // PDF Attachments
  const [attachments, setAttachments] = useState<PdfAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mandatory 4 Safety Documents Acceptance state
  const [acceptedSafetyDocs, setAcceptedSafetyDocs] = useState<Record<string, string>>({});
  const [viewingSafetyDoc, setViewingSafetyDoc] = useState<MandatorySafetyDocument | null>(null);

  const acceptedDocsCount = MANDATORY_SAFETY_DOCUMENTS.filter(doc => Boolean(acceptedSafetyDocs[doc.id])).length;
  const allSafetyDocsAccepted = acceptedDocsCount === MANDATORY_SAFETY_DOCUMENTS.length;

  const handleToggleSafetyDoc = (docId: string) => {
    setErrorMsg('');
    setAcceptedSafetyDocs(prev => {
      const next = { ...prev };
      if (next[docId]) {
        delete next[docId];
      } else {
        next[docId] = new Date().toISOString();
      }
      return next;
    });
  };

  const handleAcceptSingleSafetyDoc = (docId: string) => {
    setErrorMsg('');
    setAcceptedSafetyDocs(prev => ({
      ...prev,
      [docId]: prev[docId] || new Date().toISOString()
    }));
  };

  const handleToggleAllSafetyDocs = () => {
    setErrorMsg('');
    if (allSafetyDocsAccepted) {
      setAcceptedSafetyDocs({});
    } else {
      const now = new Date().toISOString();
      const next: Record<string, string> = {};
      MANDATORY_SAFETY_DOCUMENTS.forEach(doc => {
        next[doc.id] = acceptedSafetyDocs[doc.id] || now;
      });
      setAcceptedSafetyDocs(next);
    }
  };

  // Calculated totals
  const totalPallets = purchaseOrders.reduce((sum, item) => {
    const p = typeof item.palletsCount === 'number' ? item.palletsCount : 0;
    return sum + p;
  }, 0);

  const distinctOrders = Array.from(new Set(purchaseOrders.map(p => p.orderNumber.trim()).filter(Boolean)));

  // Add new purchase order item
  const handleAddPurchaseOrder = () => {
    const lastItem = purchaseOrders[purchaseOrders.length - 1];
    let nextPos = '10';
    if (lastItem && !isNaN(Number(lastItem.positionNumber))) {
      nextPos = String(Number(lastItem.positionNumber) + 10);
    }

    setPurchaseOrders(prev => [
      ...prev,
      {
        id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        orderNumber: lastItem ? lastItem.orderNumber : '',
        positionNumber: nextPos,
        materialCode: '',
        materialDescription: '',
        quantity: '',
        quantityUnit: 'Unidades',
        palletsCount: '',
        notes: ''
      }
    ]);
  };

  // Duplicate item
  const handleDuplicatePurchaseOrder = (index: number) => {
    const source = purchaseOrders[index];
    let nextPos = '10';
    if (!isNaN(Number(source.positionNumber))) {
      nextPos = String(Number(source.positionNumber) + 10);
    }

    const duplicated: FormPurchaseOrderItem = {
      ...source,
      id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      positionNumber: nextPos
    };

    const nextList = [...purchaseOrders];
    nextList.splice(index + 1, 0, duplicated);
    setPurchaseOrders(nextList);
  };

  // Remove purchase order item
  const handleRemovePurchaseOrder = (id: string) => {
    if (purchaseOrders.length <= 1) {
      setErrorMsg('Debe registrar al menos una (1) Orden de Compra para la cita.');
      return;
    }
    setPurchaseOrders(prev => prev.filter(p => p.id !== id));
  };

  // Update item field
  const handleUpdateItem = (id: string, field: keyof FormPurchaseOrderItem, value: any) => {
    setPurchaseOrders(prev => prev.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      if (field === 'quantity' && typeof value === 'number' && value > 0) {
        const match = COMMON_GLORIA_MATERIALS.find(m => m.code === updated.materialCode);
        if (match && match.defaultPalletCapacity) {
          updated.palletsCount = Math.ceil(value / match.defaultPalletCapacity);
        }
      }

      return updated;
    }));
  };

  // Quick fill material for a specific item
  const handleSelectPredefinedMaterial = (id: string, mat: typeof COMMON_GLORIA_MATERIALS[0]) => {
    setPurchaseOrders(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = {
        ...item,
        materialCode: mat.code,
        materialDescription: mat.desc,
        quantityUnit: mat.unit
      };
      if (typeof item.quantity === 'number' && item.quantity > 0 && mat.defaultPalletCapacity > 0) {
        updated.palletsCount = Math.ceil(item.quantity / mat.defaultPalletCapacity);
      }
      return updated;
    }));
  };

  // PDF Upload Handlers
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMsg('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setErrorMsg('Solo se permiten archivos en formato PDF de documentos de respaldo.');
        continue;
      }

      if (file.size > 15 * 1024 * 1024) {
        setErrorMsg('El archivo ' + file.name + ' excede el límite máximo permitido de 15MB.');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        let docType: PdfAttachment['documentType'] = 'Guía de Remisión';
        const lower = file.name.toLowerCase();
        if (lower.includes('factura')) docType = 'Factura Comercial';
        else if (lower.includes('calidad') || lower.includes('cert')) docType = 'Certificado de Calidad';
        else if (lower.includes('packing')) docType = 'Packing List';

        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const attachId = `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const defaultStoredPath = `src/documentos_proveedores/${safeFileName}`;
        const defaultFileUrl = `/api/documents/file/${encodeURIComponent(safeFileName)}`;

        const newAttach: PdfAttachment = {
          id: attachId,
          name: file.name,
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
          documentType: docType,
          fileDataUrl: dataUrl,
          storedPath: defaultStoredPath,
          fileUrl: defaultFileUrl,
          totalPages: Math.floor(Math.random() * 3) + 1
        };

        setAttachments(prev => [...prev, newAttach]);

        // Persist immediately in `src/documentos_proveedores/` on the server
        fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: attachId,
            name: file.name,
            documentType: docType,
            sizeBytes: file.size,
            fileDataUrl: dataUrl,
            totalPages: newAttach.totalPages
          })
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((saved) => {
            if (saved && saved.storedPath) {
              setAttachments((prev) =>
                prev.map((item) =>
                  item.id === attachId
                    ? { ...item, storedPath: saved.storedPath, fileUrl: saved.fileUrl }
                    : item
                )
              );
            }
          })
          .catch(() => {});
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Validation and submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (purchaseOrders.length === 0) {
      setErrorMsg('Debe registrar al menos una Orden de Compra para solicitar la cita.');
      return;
    }

    for (let i = 0; i < purchaseOrders.length; i++) {
      const item = purchaseOrders[i];
      const itemIndexLabel = `Ítem #${i + 1}`;

      if (!item.orderNumber.trim()) {
        setErrorMsg(`En el ${itemIndexLabel}: Debe ingresar el número de Orden de Compra (OC).`);
        return;
      }
      if (!item.positionNumber.trim()) {
        setErrorMsg(`En el ${itemIndexLabel}: Debe ingresar el número de posición.`);
        return;
      }
      if (!item.materialCode.trim() || !item.materialDescription.trim()) {
        setErrorMsg(`En el ${itemIndexLabel}: Debe registrar el código y descripción del material.`);
        return;
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        setErrorMsg(`En el ${itemIndexLabel}: Debe ingresar una cantidad válida mayor a 0.`);
        return;
      }
      if (!item.palletsCount || Number(item.palletsCount) <= 0) {
        setErrorMsg(`En el ${itemIndexLabel}: Debe especificar el número de palets que representa este material.`);
        return;
      }
    }

    if (totalPallets <= 0) {
      setErrorMsg('El número total de palets de la entrega debe ser mayor a 0.');
      return;
    }

    if (urgency === 'Urgente' && !urgencyJustification.trim()) {
      setErrorMsg('Para citas con urgencia URGENTE, es obligatorio ingresar el motivo/justificación.');
      return;
    }

    if (attachments.length === 0) {
      setErrorMsg('Debe adjuntar al menos un (1) archivo PDF de respaldo (Guía de Remisión o Factura).');
      return;
    }

    const missingDocs = MANDATORY_SAFETY_DOCUMENTS.filter(doc => !acceptedSafetyDocs[doc.id]);
    if (missingDocs.length > 0) {
      setErrorMsg(
        `Es obligatorio leer y aceptar los 4 documentos de Seguridad de Planta Gloria antes de solicitar su cita. Pendientes (${missingDocs.length}): ${missingDocs.map(d => d.title).join(' | ')}.`
      );
      return;
    }

    const ticketNumber = Math.floor(1000 + Math.random() * 9000);
    const newId = `apt-${Date.now()}`;
    const ticketCode = `GLO-2025-${ticketNumber}`;
    const nowIso = new Date().toISOString();

    const formattedPurchaseOrders: PurchaseOrderItem[] = purchaseOrders.map((item, idx) => ({
      id: item.id || `po-${Date.now()}-${idx}`,
      orderNumber: item.orderNumber.trim(),
      positionNumber: item.positionNumber.trim(),
      materialCode: item.materialCode.trim(),
      materialDescription: item.materialDescription.trim(),
      quantity: Number(item.quantity),
      quantityUnit: item.quantityUnit,
      palletsCount: Number(item.palletsCount),
      notes: item.notes?.trim() || undefined
    }));

    const distinctOcs = Array.from(new Set(formattedPurchaseOrders.map(p => p.orderNumber)));
    const primaryOrderNumber = distinctOcs.join(', ');
    const primaryPosition = formattedPurchaseOrders.map(p => p.positionNumber).join(', ');
    const primaryMaterialCode = formattedPurchaseOrders.length === 1 
      ? formattedPurchaseOrders[0].materialCode 
      : `${formattedPurchaseOrders[0].materialCode} (+${formattedPurchaseOrders.length - 1} más)`;
    const primaryMaterialDesc = formattedPurchaseOrders.length === 1
      ? formattedPurchaseOrders[0].materialDescription
      : `${formattedPurchaseOrders[0].materialDescription} y otros ${formattedPurchaseOrders.length - 1} materiales`;
    const totalQuantity = formattedPurchaseOrders.reduce((sum, p) => sum + p.quantity, 0);
    const primaryUnit = formattedPurchaseOrders.every(p => p.quantityUnit === formattedPurchaseOrders[0].quantityUnit)
      ? formattedPurchaseOrders[0].quantityUnit
      : 'Varios';

    const newAppointment: AppointmentRequest = {
      id: newId,
      ticketCode,
      createdAt: nowIso,
      lastUpdated: nowIso,
      supplierId: currentUser.id,
      supplierName: currentUser.companyName || currentUser.name,
      supplierRuc: currentUser.ruc || '20512345678',
      supplierEmail: currentUser.email,
      supplierPhone: currentUser.phone || '+51 999 000 111',
      driverName: driverName.trim() || undefined,
      driverDni: driverDni.trim() || undefined,
      vehiclePlate: vehiclePlate.trim() ? vehiclePlate.toUpperCase() : undefined,
      purchaseOrders: formattedPurchaseOrders,
      orderNumber: primaryOrderNumber,
      positionNumber: primaryPosition,
      materialCode: primaryMaterialCode,
      materialDescription: primaryMaterialDesc,
      quantity: totalQuantity,
      quantityUnit: primaryUnit,
      palletsCount: totalPallets,
      urgency,
      urgencyJustification: urgency === 'Urgente' ? urgencyJustification.trim() : undefined,
      requestedDate,
      requestedTime,
      plantLocation,
      status: 'pendiente',
      pdfAttachments: attachments,
      reception: {},
      planningValidation: {
        status: 'pendiente',
        isValidated: false,
        notes: 'Pendiente de validación de Orden de Compra por el perfil Planificación.'
      },
      safetyDocumentsAcceptance: {
        acceptedAll: true,
        acceptedAt: nowIso,
        acceptedByUserId: currentUser.id,
        acceptedByUserName: currentUser.name,
        documents: MANDATORY_SAFETY_DOCUMENTS.map(doc => ({
          id: doc.id,
          code: doc.code,
          title: doc.title,
          fileName: doc.fileName,
          acceptedAt: acceptedSafetyDocs[doc.id] || nowIso
        }))
      },
      auditHistory: [
        {
          id: `aud-${Date.now()}`,
          timestamp: nowIso,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'Creación de Solicitud de Cita y Aceptación de 4 Documentos SST',
          fieldChanged: 'Estado Inicial / Seguridad Planta',
          previousValue: 'N/A',
          newValue: 'Pendiente de Confirmación (4/4 Documentos SST Aceptados)',
          notes: `Solicitud generada con ${formattedPurchaseOrders.length} línea(s) en ${distinctOcs.length} Orden(es) de Compra (${distinctOcs.join(', ')}), sumando ${totalPallets} palets y ${attachments.length} archivo(s) PDF adjunto(s). El proveedor aceptó la lectura de los 4 documentos obligatorios de seguridad (Estándar de Uso de Cuñas, Cartilla GLGS00055 Cutter Auto Retráctil, Medidas de Seguridad Generales y Protocolo de Ingreso/Parqueo/Carga/Descarga).`
        }
      ]
    };

    onSubmit(newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Gloria Branding */}
        <div className="bg-[#00264d] text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-0.5 rounded text-[#00264d] font-black text-sm tracking-wider">
              GLORIA
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Nueva Solicitud de Cita para Entrega
              </h2>
              <p className="text-xs text-blue-200">
                Registro oficial de Orden de Compra, cubicaje de palets y documentación de respaldo
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

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-slate-800">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SECTION 1: Órdenes de Compra y Materiales */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            
            {/* Header & Real-time Totals Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00264d] flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-700" />
                  1. Órdenes de Compra (OCs) y Materiales a Entregar
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Una sola cita puede contener varias Órdenes de Compra y distintas posiciones para el mismo viaje.
                </p>
              </div>

              <button
                type="button"
                id="btn-agregar-orden-compra"
                onClick={handleAddPurchaseOrder}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Otra Orden de Compra</span>
              </button>
            </div>

            {/* Summary Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white p-3 rounded-xl border border-blue-200 shadow-xs">
              <div className="text-center border-r border-slate-200 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Órdenes Distintas</span>
                <span className="text-base sm:text-lg font-black text-blue-900">
                  {distinctOrders.length > 0 ? distinctOrders.length : 1}
                </span>
                <span className="text-[10px] text-slate-500 block">OCs en este envío</span>
              </div>

              <div className="text-center border-r border-slate-200 pr-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Ítems / Pos.</span>
                <span className="text-base sm:text-lg font-black text-[#00264d]">
                  {purchaseOrders.length}
                </span>
                <span className="text-[10px] text-slate-500 block">Líneas registradas</span>
              </div>

              <div className="text-center bg-blue-50/80 rounded-lg p-1">
                <span className="text-[10px] uppercase font-bold text-blue-800 block">Cubicaje Total</span>
                <span className="text-base sm:text-lg font-black text-[#D32F2F]">
                  {totalPallets}
                </span>
                <span className="text-[10px] font-bold text-blue-900 uppercase block">Palets Totales</span>
              </div>
            </div>

            {/* List of Purchase Order Items Cards */}
            <div className="space-y-4">
              {purchaseOrders.map((item, index) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-xs hover:border-blue-300 transition relative"
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#00264d] text-white text-[11px] font-bold">
                        Ítem #{index + 1}
                      </span>
                      {item.orderNumber ? (
                        <span className="text-xs font-mono font-bold text-blue-800">
                          OC: {item.orderNumber} (Pos. {item.positionNumber || '-'})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Nueva Orden de Compra
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicatePurchaseOrder(index)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition text-[11px] flex items-center gap-1"
                        title="Duplicar ítem para otra posición"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[10px]">Duplicar</span>
                      </button>

                      {purchaseOrders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePurchaseOrder(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar este ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Item Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* Order Number */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        N° Orden de Compra (OC) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 4500982314"
                        value={item.orderNumber}
                        onChange={(e) => handleUpdateItem(item.id, 'orderNumber', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-mono"
                      />
                      <span className="text-[10px] text-slate-400">10 dígitos SAP Gloria</span>
                    </div>

                    {/* Position Number */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Posición *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="10"
                        value={item.positionNumber}
                        onChange={(e) => handleUpdateItem(item.id, 'positionNumber', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-center font-mono"
                      />
                      <span className="text-[10px] text-slate-400">Pos. pedido</span>
                    </div>

                    {/* Material Code */}
                    <div className="sm:col-span-6">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Código de Material *
                        </label>
                        <div className="flex items-center gap-1 overflow-x-auto text-[9px] text-slate-500">
                          <span className="hidden md:inline">Sugerencias:</span>
                          {COMMON_GLORIA_MATERIALS.slice(0, 2).map((mat) => (
                            <button
                              type="button"
                              key={mat.code}
                              onClick={() => handleSelectPredefinedMaterial(item.id, mat)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-900 rounded transition border border-slate-200"
                            >
                              {mat.code.replace('MAT-GLO-', '')}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ej: MAT-GLO-100234"
                        value={item.materialCode}
                        onChange={(e) => handleUpdateItem(item.id, 'materialCode', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-mono"
                      />
                    </div>

                    {/* Material Description */}
                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Descripción del Material *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Hojalata litografiada barnizada 400g p/ Leche Gloria Evaporada"
                        value={item.materialDescription}
                        onChange={(e) => handleUpdateItem(item.id, 'materialDescription', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Ej: 80000"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none font-semibold"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Unidad de Medida *
                      </label>
                      <select
                        value={item.quantityUnit}
                        onChange={(e) => handleUpdateItem(item.id, 'quantityUnit', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                      >
                        <option value="Unidades">Unidades (UND)</option>
                        <option value="Cajas">Cajas (CJ)</option>
                        <option value="Kg">Kilogramos (KG)</option>
                        <option value="TM">Toneladas (TM)</option>
                        <option value="Litros">Litros (LT)</option>
                        <option value="Bobinas">Bobinas (BOB)</option>
                      </select>
                    </div>

                    {/* Pallets for this item */}
                    <div className="sm:col-span-4 bg-blue-50/60 p-2.5 rounded-lg border border-blue-200">
                      <label className="block text-[11px] font-bold text-blue-900 mb-1">
                        N° de Palets de este ítem *
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Ej: 16"
                          value={item.palletsCount}
                          onChange={(e) => handleUpdateItem(item.id, 'palletsCount', e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-3 py-1 text-sm font-bold text-[#00264d] bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                        />
                        <span className="text-[11px] font-bold text-blue-800">PALETS</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            {/* Button to add another OC at the bottom */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleAddPurchaseOrder}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-800 text-xs font-bold transition w-full justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar otra Orden de Compra o Posición a esta Cita</span>
              </button>
            </div>

          </div>

          {/* SECTION 2: Sede, Nivel de Urgencia y Fecha/Hora Solicitada */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00264d] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              2. Sede Gloria, Nivel de Urgencia y Programación Solicitada
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Plant selection */}
              <div className="sm:col-span-12">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sede / Planta Gloria de Entrega *
                </label>
                <select
                  id="select-planta"
                  value={plantLocation}
                  onChange={(e) => setPlantLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                >
                  {GLORIA_PLANTS.map((planta) => (
                    <option key={planta} value={planta}>
                      {planta}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency selector */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Nivel de Urgencia de la Cita *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="btn-urgencia-normal"
                    onClick={() => setUrgency('Normal')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      urgency === 'Normal'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-400'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Check className={`w-4 h-4 ${urgency === 'Normal' ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">NORMAL</span>
                    <span className={`text-[10px] ${urgency === 'Normal' ? 'text-blue-100' : 'text-slate-400'}`}>
                      Turno regular
                    </span>
                  </button>

                  <button
                    type="button"
                    id="btn-urgencia-urgente"
                    onClick={() => setUrgency('Urgente')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                      urgency === 'Urgente'
                        ? 'bg-[#D32F2F] text-white border-red-700 shadow-sm ring-2 ring-red-400'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-rose-50'
                    }`}
                  >
                    <AlertTriangle className={`w-4 h-4 ${urgency === 'Urgente' ? 'text-white' : 'text-rose-500'}`} />
                    <span className="text-xs font-bold">URGENTE</span>
                    <span className={`text-[10px] ${urgency === 'Urgente' ? 'text-rose-100' : 'text-slate-400'}`}>
                      Prioridad planta
                    </span>
                  </button>
                </div>
              </div>

              {/* Date and Time */}
              <div className="sm:col-span-7 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Solicitada *
                  </label>
                  <div className="relative">
                    <input
                      id="input-fecha-solicitada"
                      type="date"
                      required
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora Solicitada *
                  </label>
                  <select
                    id="select-hora-solicitada"
                    value={requestedTime}
                    onChange={(e) => setRequestedTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                        <option value="07:00">07:00 AM</option>
                        <option value="07:40">07:40 AM</option>
                        <option value="08:20">08:20 AM</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="09:40">09:40 AM</option>
                        <option value="10:20">10:20 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:40">11:40 AM</option>
                        <option value="12:20">12:20 PM</option>
                        <option value="13:00">13:00 PM</option>
                        <option value="13:40">13:40 PM</option>
                        <option value="14:20">14:20 PM</option>
                        <option value="15:00">15:00 PM</option>
                  </select>
                </div>

                <div className="col-span-2 text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-700">Nota operativa:</span> El horario definitivo de atención será confirmado o reprogramado por el recepcionista de almacén según disponibilidad de rampas.
                </div>
              </div>

              {/* Justification if Urgent */}
              {urgency === 'Urgente' && (
                <div className="sm:col-span-12 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <label className="block text-xs font-bold text-rose-800 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Motivo / Justificación de Urgencia (Obligatorio) *
                  </label>
                  <textarea
                    id="textarea-justificacion-urgente"
                    required
                    rows={2}
                    placeholder="Especifique el motivo de urgencia (ej. Quiebre de stock en línea de producción, parada de planta, producto perecible)..."
                    value={urgencyJustification}
                    onChange={(e) => setUrgencyJustification(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none text-slate-800"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Datos de Transporte / Chofer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00264d] mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-700" />
              3. Datos del Transportista y Vehículo (Ingreso a Garita)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Conductor
                </label>
                <input
                  type="text"
                  placeholder="Ej: Manuel Quispe Flores"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  DNI / Carnet de Extranjería
                </label>
                <input
                  type="text"
                  placeholder="Ej: 44892103"
                  value={driverDni}
                  onChange={(e) => setDriverDni(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placa del Vehículo / Furgón
                </label>
                <input
                  type="text"
                  placeholder="Ej: B4K-892"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Adjuntar Archivos PDF de Respaldo */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#00264d] flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-700" />
                4. Documentos Adjuntos de Respaldo en PDF *
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {attachments.length} archivo(s) adjunto(s)
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Suba los documentos que respaldan la entrega: Guía de Remisión (Remitente y Transportista), Factura Comercial, Certificado de Calidad o Packing List. Todos los archivos subidos se almacenan dentro de la aplicación web en la carpeta <code className="font-mono font-bold text-[#00264d] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">src/documentos_proveedores/</code>.
            </p>

            {/* Drag & Drop Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/80 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-500 bg-white hover:bg-blue-50/30'
              }`}
            >
              <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Arrastre sus archivos PDF aquí o haga clic para examinar
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Archivos PDF permitidos (Máx. 15MB por archivo). Puede cargar uno o varios documentos.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* List of uploaded PDF files */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {file.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                          <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                          <span>•</span>
                          <span className="text-blue-700 font-semibold">{file.documentType}</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 font-semibold">
                            Guardado en: {file.storedPath || `src/documentos_proveedores/${file.name}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={file.documentType}
                        onChange={(e) => {
                          const val = e.target.value as PdfAttachment['documentType'];
                          setAttachments(prev => prev.map(a => a.id === file.id ? { ...a, documentType: val } : a));
                        }}
                        className="text-[11px] bg-slate-100 border border-slate-300 rounded px-2 py-1 outline-none"
                      >
                        <option value="Guía de Remisión">Guía de Remisión</option>
                        <option value="Factura Comercial">Factura Comercial</option>
                        <option value="Certificado de Calidad">Certificado de Calidad</option>
                        <option value="Packing List">Packing List</option>
                        <option value="Otro">Otro Documento</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                        title="Eliminar archivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: Lectura y Aceptación Obligatoria de los 4 Documentos de Seguridad SST Gloria */}
          <div className={`p-4 sm:p-5 rounded-xl border-2 transition space-y-4 ${
            allSafetyDocsAccepted
              ? 'bg-emerald-50/50 border-emerald-300'
              : 'bg-amber-50/50 border-amber-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#00264d] flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${allSafetyDocsAccepted ? 'text-emerald-600' : 'text-amber-600'}`} />
                  5. Lectura y Aceptación Obligatoria de Documentos de Seguridad (4 Documentos) *
                </h3>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Para solicitar su cita, el Proveedor debe leer y aceptar obligatoriamente los 4 documentos normativos de Seguridad y Operaciones de Leche Gloria S.A.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                  allSafetyDocsAccepted
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  {acceptedDocsCount} de 4 aceptados
                </span>
                <button
                  type="button"
                  onClick={handleToggleAllSafetyDocs}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                    allSafetyDocsAccepted
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-[#00264d] hover:bg-blue-950 text-white'
                  }`}
                >
                  {allSafetyDocsAccepted ? 'Desmarcar todos' : 'Aceptar los 4 documentos'}
                </button>
              </div>
            </div>

            {/* List of 4 Mandatory Safety Documents */}
            <div className="grid grid-cols-1 gap-3">
              {MANDATORY_SAFETY_DOCUMENTS.map((docItem, idx) => {
                const isAccepted = Boolean(acceptedSafetyDocs[docItem.id]);
                return (
                  <div
                    key={docItem.id}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isAccepted
                        ? 'bg-white border-emerald-400 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <label className="relative flex items-center cursor-pointer mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          id={`check-safety-doc-${idx + 1}`}
                          checked={isAccepted}
                          onChange={() => handleToggleSafetyDoc(docItem.id)}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                      </label>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
                          <span className="font-bold text-[#00264d]">Documento #{idx + 1}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono font-semibold text-blue-800">{docItem.code} ({docItem.version})</span>
                          <span aria-hidden="true">·</span>
                          <span className={isAccepted ? 'text-emerald-700 font-bold' : 'text-amber-700 font-semibold'}>
                            {isAccepted ? 'Lectura Aceptada' : 'Lectura Pendiente'}
                          </span>
                        </div>

                        <label
                          htmlFor={`check-safety-doc-${idx + 1}`}
                          className="text-xs sm:text-sm font-bold text-slate-900 cursor-pointer block leading-snug hover:text-blue-900"
                        >
                          {docItem.title}
                        </label>

                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate">
                          Archivo: {docItem.fileName}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          {docItem.summary}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setViewingSafetyDoc(docItem)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-xs font-bold transition"
                        title="Abrir y leer el contenido completo del documento"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                        <span>Leer Documento</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadSafetyDocumentPdf(docItem, currentUser.companyName || currentUser.name, currentUser.ruc)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
                        title={`Descargar ${docItem.fileName}`}
                      >
                        <Download className="w-3.5 h-3.5 text-red-600" />
                        <span className="hidden md:inline">PDF</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legal confirmation banner */}
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-3 ${
              allSafetyDocsAccepted
                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-100/70 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-2">
                {allSafetyDocsAccepted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                )}
                <span className="font-medium">
                  {allSafetyDocsAccepted
                    ? 'Ha confirmado la lectura y aceptación de los 4 documentos de seguridad obligatorios de Leche Gloria S.A. Ya puede registrar su solicitud de cita.'
                    : `Debe marcar la aceptación de lectura de los 4 documentos normativos (faltan ${4 - acceptedDocsCount}) para habilitar el envío de su solicitud de cita.`}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              id="btn-enviar-solicitud"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition ${
                allSafetyDocsAccepted
                  ? 'bg-[#00264d] hover:bg-[#001f3f] text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-600 hover:bg-slate-400 cursor-pointer'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {allSafetyDocsAccepted
                  ? `Registrar Cita (${distinctOrders.length > 0 ? distinctOrders.length : 1} OC • ${totalPallets} Palets)`
                  : `Acepte los 4 Documentos de Seguridad (${acceptedDocsCount}/4) para Solicitar Cita`}
              </span>
            </button>
          </div>

        </form>

        {/* Modal Lector de Documento de Seguridad */}
        <SafetyDocumentReaderModal
          docItem={viewingSafetyDoc}
          onClose={() => setViewingSafetyDoc(null)}
          onAccept={(docId) => handleAcceptSingleSafetyDoc(docId)}
          isAccepted={viewingSafetyDoc ? Boolean(acceptedSafetyDocs[viewingSafetyDoc.id]) : false}
          supplierName={currentUser.companyName || currentUser.name}
          supplierRuc={currentUser.ruc}
        />

      </div>
    </div>
  );
};
