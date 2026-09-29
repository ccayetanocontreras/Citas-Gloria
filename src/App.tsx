import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  FileSpreadsheet, 
  Building2, 
  LogIn,
  Shield,
  Users
} from 'lucide-react';

import { 
  AppointmentRequest, 
  User, 
  EmailNotification 
} from './types';
import { 
  getStoredAppointments, 
  saveAppointments, 
  getStoredUsers, 
  getStoredNotifications, 
  saveNotifications, 
  INITIAL_USERS,
  resetToInitialDemo
} from './mockData';
import { exportAppointmentsToXLSX } from './utils/pdfHelper';

import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { AppointmentTable } from './components/AppointmentTable';
import { SupplierFormModal } from './components/SupplierFormModal';
import { ReceptionistActionModal } from './components/ReceptionistActionModal';
import { AuditHistoryModal } from './components/AuditHistoryModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { NotificationModal } from './components/NotificationModal';
import { AppointmentPassModal } from './components/AppointmentPassModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { PlanningValidationModal } from './components/PlanningValidationModal';

export default function App() {
  // State: Current user and login screen view
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const users = getStoredUsers();
    return users[0] || INITIAL_USERS[0];
  });
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(false);
  const [impersonatedByAdmin, setImpersonatedByAdmin] = useState<boolean>(false);

  // State: Appointments
  const [appointments, setAppointments] = useState<AppointmentRequest[]>(() => {
    return getStoredAppointments();
  });

  // State: Notifications sent
  const [sentNotifications, setSentNotifications] = useState<EmailNotification[]>(() => {
    return getStoredNotifications();
  });

  // Modals state
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  // Selected item for modals
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | undefined>(undefined);

  // Dashboard filter state
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync with Node.js Express API if active
  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Fallback to local storage');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAppointments(data);
          saveAppointments(data);
        }
      })
      .catch(() => {
        // Fallback already loaded from localStorage
      });
  }, []);

  // Handlers for Appointment CRUD
  const handleSaveNewAppointment = (newAppt: AppointmentRequest) => {
    const updated = [newAppt, ...appointments];
    setAppointments(updated);
    saveAppointments(updated);

    // Call server API
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppt)
    }).catch(() => {});

    setIsSupplierModalOpen(false);
    showToast(`¡Cita ${newAppt.ticketCode} registrada exitosamente!`, 'success');
  };

  const handleUpdateAppointment = (updatedAppt: AppointmentRequest) => {
    const updated = appointments.map((a) => (a.id === updatedAppt.id ? updatedAppt : a));
    setAppointments(updated);
    saveAppointments(updated);

    // Update selected appointment if it was modified
    if (selectedAppointment && selectedAppointment.id === updatedAppt.id) {
      setSelectedAppointment(updatedAppt);
    }

    // Call server API
    fetch(`/api/appointments/${updatedAppt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAppt)
    }).catch(() => {});

    showToast(`Expediente ${updatedAppt.ticketCode} actualizado.`, 'success');
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    const target = appointments.find((a) => a.id === appointmentId);
    if (!target) return;

    if (window.confirm(`¿Está seguro de eliminar la cita ${target.ticketCode} de ${target.supplierName}?`)) {
      const updated = appointments.filter((a) => a.id !== appointmentId);
      setAppointments(updated);
      saveAppointments(updated);

      fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      }).catch(() => {});

      showToast(`Cita ${target.ticketCode} eliminada.`, 'info');
    }
  };

  const handleRecordNotification = (notification: EmailNotification) => {
    const updated = [notification, ...sentNotifications];
    setSentNotifications(updated);
    saveNotifications(updated);
    showToast(`Notificación por correo registrada para ${notification.ticketCode}`, 'success');
  };

  const handleResetDemoData = () => {
    if (window.confirm('¿Desea restaurar los datos de demostración de Leche Gloria S.A.?')) {
      const reset = resetToInitialDemo();
      setAppointments(reset);
      showToast('Datos de demostración reinicializados.', 'info');
    }
  };

  const canExportExcel = currentUser?.role === 'admin' || currentUser?.role === 'recepcionista' || impersonatedByAdmin;

  const handleExportXLSX = () => {
    if (!canExportExcel) {
      showToast('Acceso denegado: Solo los usuarios con perfil ADMINISTRADOR y RECEPCIONISTA pueden descargar el Excel.', 'warning');
      return;
    }
    exportAppointmentsToXLSX(appointments, 'xlsx');
    showToast('Reporte descargado exitosamente en formato .xlsx', 'success');
  };

  // Login & Session Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedOut(false);
    setImpersonatedByAdmin(false);
    showToast(`Sesión iniciada como ${user.name} (${user.role.toUpperCase()})`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
    setImpersonatedByAdmin(false);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  const handleSwitchUser = (user: User) => {
    // Security check: Only administrator or someone in admin inspection mode can switch
    if (currentUser?.role !== 'admin' && !impersonatedByAdmin) {
      showToast('Acceso denegado: Los usuarios Proveedor y Recepcionista solo pueden acceder a sus cuentas. Solo el Administrador puede ver y acceder a todas las cuentas.', 'warning');
      return;
    }

    if (user.role === 'admin') {
      setImpersonatedByAdmin(false);
    } else {
      setImpersonatedByAdmin(true);
    }
    setCurrentUser(user);
    showToast(`Accediendo a la cuenta: ${user.name} (${user.role.toUpperCase()})`, 'info');
  };

  const handleReturnToAdmin = () => {
    const users = getStoredUsers();
    const adminUser = users.find(u => u.role === 'admin') || INITIAL_USERS[0];
    setCurrentUser(adminUser);
    setImpersonatedByAdmin(false);
    showToast('Retornado al perfil Administrador (Ing. Carlos Cayetano)', 'success');
  };

  // If user explicitly chose to log out, show the login screen
  if (isLoggedOut || !currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Filtered by role permissions
  // Proveedor only sees their own appointments
  const visibleAppointments = currentUser.role === 'proveedor'
    ? appointments.filter(
        (a) =>
          a.supplierRuc === currentUser.ruc ||
          a.supplierEmail.toLowerCase() === currentUser.email.toLowerCase() ||
          a.supplierName.toLowerCase().includes(currentUser.companyName.toLowerCase())
      )
    : appointments;

  // Filtered by Dashboard status if selected
  const filteredAppointments = statusFilter === 'todos'
    ? visibleAppointments
    : statusFilter === 'planif_pendiente'
    ? visibleAppointments.filter((a) => !a.planningValidation?.isValidated)
    : statusFilter === 'planif_validado'
    ? visibleAppointments.filter((a) => Boolean(a.planningValidation?.isValidated))
    : statusFilter === 'pendiente'
    ? visibleAppointments.filter((a) => a.status === 'pendiente' || a.status === 'solicitada')
    : statusFilter === 'urgente'
    ? visibleAppointments.filter((a) => a.urgency === 'Urgente')
    : statusFilter === 'en_planta'
    ? visibleAppointments.filter((a) => a.status === 'en_planta' || a.status === 'en_atencion' || a.status === 'en_descarga')
    : statusFilter === 'liquidado'
    ? visibleAppointments.filter((a) => a.status === 'liquidado' || a.status === 'liquidada')
    : visibleAppointments.filter((a) => a.status === statusFilter);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-600'
              : toastMessage.type === 'warning'
              ? 'bg-amber-600 text-white border-amber-500'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Admin Inspection Banner if switched into another account */}
      {impersonatedByAdmin && currentUser && (
        <div className="bg-[#4a148c] text-white px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-purple-500 shadow-md">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-200 shrink-0" />
            <span>
              <strong>Supervisión de Administrador:</strong> Está accediendo a la cuenta de <strong>{currentUser.name}</strong> (<span className="uppercase font-semibold">{currentUser.role}</span>) - {currentUser.companyName}.
            </span>
          </div>
          <button
            id="btn-return-admin-banner"
            onClick={handleReturnToAdmin}
            className="px-3 py-1 bg-white text-purple-950 font-bold rounded-lg text-xs hover:bg-purple-100 transition shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-purple-700" />
            <span>Volver a Administrador (Ing. Carlos Cayetano)</span>
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onOpenNewAppointment={() => setIsSupplierModalOpen(true)}
        onOpenNotifications={() => {
          if (currentUser.role !== 'admin' && currentUser.role !== 'recepcionista') {
            showToast('Acceso restringido: Solo el Administrador y el Recepcionista pueden notificar por correo.', 'warning');
            return;
          }
          if (appointments.length > 0) {
            setSelectedAppointment(appointments[0]);
          }
          setIsNotificationModalOpen(true);
        }}
        unreadNotificationsCount={sentNotifications.length}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        isImpersonatedByAdmin={impersonatedByAdmin}
        onReturnToAdmin={handleReturnToAdmin}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Plant Status & Quick Action Ribbon */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00264d] text-white rounded-xl shadow-xs">
              <Building2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-[#00264d] tracking-tight">
                  Recepción de Mercadería & Descarga en Planta
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Operativo 24/7
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Planta Principal Huachipa • Av. Las Torres s/n • Almacén Central de Insumos y Envases
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* New Appointment button */}
            <button
              id="btn-nueva-cita"
              type="button"
              onClick={() => setIsSupplierModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#D32F2F] hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Solicitar Nueva Cita</span>
            </button>

            {/* Export .xlsx / Excel button - Exclusivo para ADMINISTRADOR y RECEPCIONISTA */}
            {canExportExcel && (
              <button
                id="btn-exportar-xlsx"
                type="button"
                onClick={handleExportXLSX}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs hover:shadow active:scale-95 border border-emerald-600"
                title="Descargar reporte consolidado de citas en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Exportar Excel (.xlsx)</span>
              </button>
            )}

            {/* View / Access Accounts - ONLY for Administrator or Admin in inspection mode */}
            {(currentUser.role === 'admin' || impersonatedByAdmin) && (
              <button
                id="btn-ver-todas-cuentas"
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-semibold rounded-xl transition border border-purple-200 shadow-xs"
                title="Panel de Administrador: Ver y acceder a todas las cuentas registradas"
              >
                <Users className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden sm:inline">Ver / Acceder a Cuentas</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboard Statistics with Interactive Click Filters */}
        <DashboardStats 
          appointments={visibleAppointments}
          userRole={currentUser.role}
          currentFilter={statusFilter}
          onFilterChange={(filter: string) => setStatusFilter(filter)}
        />

        {/* Notification Banner for Planificación User */}
        {currentUser.role === 'planificacion' && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-950 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <strong className="block font-bold">Módulo Exclusivo de Planificación y Abastecimiento Gloria:</strong>
                <span>Su función principal es validar en SAP R/3 las Órdenes de Compra solicitadas por los proveedores antes de que el Recepcionista autorice y confirme la cita.</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
              <span>SAP R/3 Conectado</span>
            </div>
          </div>
        )}

        {/* Main Appointment Management Table */}
        <AppointmentTable
          appointments={filteredAppointments}
          currentUser={currentUser}
          onOpenReceptionistModal={(appt: AppointmentRequest) => {
            setSelectedAppointment(appt);
            setIsReceptionModalOpen(true);
          }}
          onOpenPlanningModal={(appt: AppointmentRequest) => {
            setSelectedAppointment(appt);
            setIsPlanningModalOpen(true);
          }}
          onOpenAuditHistory={(appt: AppointmentRequest) => {
            setSelectedAppointment(appt);
            setIsAuditModalOpen(true);
          }}
          onOpenPdfViewer={(appt: AppointmentRequest) => {
            setSelectedAppointment(appt);
            setSelectedAttachmentId(undefined);
            setIsPdfModalOpen(true);
          }}
          onOpenEmailModal={(appt: AppointmentRequest) => {
            if (currentUser.role !== 'admin' && currentUser.role !== 'recepcionista') {
              showToast('Acceso restringido: Solo el Administrador y el Recepcionista pueden notificar por correo.', 'warning');
              return;
            }
            setSelectedAppointment(appt);
            setIsNotificationModalOpen(true);
          }}
          onOpenPassModal={(appt: AppointmentRequest) => {
            setSelectedAppointment(appt);
            setIsPassModalOpen(true);
          }}
          onDeleteAppointment={handleDeleteAppointment}
        />

      </main>

      {/* Footer Gloria */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#00264d]">LECHE GLORIA S.A.</span>
            <span>•</span>
            <span>RUC: 20100190797</span>
            <span>•</span>
            <span>Sistema Logístico de Citas y Almacén</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Servidor Node.js Express + React 19</span>
            <span>•</span>
            <button
              onClick={handleResetDemoData}
              className="text-blue-700 hover:underline"
            >
              Reiniciar Datos Demo
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Supplier Form Modal */}
      <SupplierFormModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSubmit={handleSaveNewAppointment}
        currentUser={currentUser}
      />

      {/* 2. Receptionist Action Modal */}
      {selectedAppointment && (
        <ReceptionistActionModal
          isOpen={isReceptionModalOpen}
          onClose={() => setIsReceptionModalOpen(false)}
          appointment={selectedAppointment}
          currentUser={currentUser}
          onSave={(updated: AppointmentRequest) => {
            handleUpdateAppointment(updated);
          }}
          onOpenEmail={(appt: AppointmentRequest) => {
            setSelectedAppointment(appt);
            setIsReceptionModalOpen(false);
            setIsNotificationModalOpen(true);
          }}
          onOpenPdfViewer={(appt: AppointmentRequest, attachmentId?: string) => {
            setSelectedAppointment(appt);
            setSelectedAttachmentId(attachmentId);
            setIsReceptionModalOpen(false);
            setIsPdfModalOpen(true);
          }}
        />
      )}

      {/* 2.5. Planning Validation Modal (Exclusivo Planificación / Admin) */}
      {selectedAppointment && (
        <PlanningValidationModal
          isOpen={isPlanningModalOpen}
          onClose={() => setIsPlanningModalOpen(false)}
          appointment={selectedAppointment}
          currentUser={currentUser}
          onSaveValidation={(updated: AppointmentRequest) => {
            handleUpdateAppointment(updated);
            showToast(
              updated.planningValidation?.isValidated
                ? `Cita ${updated.ticketCode}: Órdenes de Compra validadas conforme en SAP Gloria.`
                : `Cita ${updated.ticketCode}: Observaciones de Planificación registradas.`,
              updated.planningValidation?.isValidated ? 'success' : 'warning'
            );
          }}
          onOpenPdfViewer={(appt: AppointmentRequest, docId?: string) => {
            setSelectedAppointment(appt);
            setSelectedAttachmentId(docId);
            setIsPlanningModalOpen(false);
            setIsPdfModalOpen(true);
          }}
        />
      )}

      {/* 3. Audit History Modal */}
      {selectedAppointment && (
        <AuditHistoryModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          appointment={selectedAppointment}
        />
      )}

      {/* 4. PDF Viewer Modal */}
      {selectedAppointment && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          appointment={selectedAppointment}
          initialAttachmentId={selectedAttachmentId}
        />
      )}

      {/* 5. Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        selectedAppointment={selectedAppointment}
        currentUser={currentUser}
        sentNotifications={sentNotifications}
        onRecordNotification={handleRecordNotification}
      />

      {/* 6. Gate Pass Modal */}
      {selectedAppointment && (
        <AppointmentPassModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          appointment={selectedAppointment}
        />
      )}

      {/* 7. Quick Login / Account Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(u) => {
          setCurrentUser(u);
          showToast(`Ingresó como ${u.name} (${u.role.toUpperCase()})`, 'success');
        }}
        currentUser={currentUser}
        onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
      />

      {/* 8. Change Password Modal */}
      {currentUser && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          currentUser={currentUser}
          onPasswordChanged={(updated) => {
            setCurrentUser(updated);
            showToast('Contraseña actualizada correctamente.', 'success');
          }}
        />
      )}

    </div>
  );
}
