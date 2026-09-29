import React, { useState } from 'react';
import { 
  Building2, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  PlusCircle, 
  Shield, 
  ClipboardCheck, 
  Truck, 
  Menu, 
  X, 
  ChevronDown,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  LogIn,
  Users
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getStoredUsers, DEFAULT_PASSWORD } from '../mockData';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onOpenNewAppointment: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  isImpersonatedByAdmin?: boolean;
  onReturnToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onOpenNewAppointment,
  onOpenNotifications,
  unreadNotificationsCount,
  onOpenChangePassword,
  onLogout,
  onOpenLoginModal,
  isImpersonatedByAdmin,
  onReturnToAdmin
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const storedUsers = getStoredUsers();

  const getRoleBadge = (role?: UserRole | string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrador Gloria',
          bg: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: Shield
        };
      case 'recepcionista':
        return {
          label: 'Recepcionista Almacén',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: ClipboardCheck
        };
      case 'planificacion':
        return {
          label: 'Planificación de Demanda',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: ShieldCheck
        };
      case 'proveedor':
        return {
          label: 'Proveedor Autorizado',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Truck
        };
      default:
        return {
          label: (role || 'Usuario').toString().toUpperCase(),
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Shield
        };
    }
  };

  const badge = getRoleBadge(currentUser?.role);
  const RoleIcon = badge.icon || Shield;

  return (
    <header className="sticky top-0 z-30 bg-[#00264d] text-white border-b-4 border-[#D32F2F] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Company Title */}
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded shadow flex items-center justify-center">
              <span className="font-extrabold text-[#00264d] text-xl tracking-wider font-sans">
                GLORIA
              </span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                PORTAL DE CITAS A PROVEEDORES
              </h1>
              <p className="text-[11px] text-blue-200 tracking-wide font-normal">
                Leche Gloria S.A. • Gestión Logística de Almacenes
              </p>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Direct Change Password shortcut if using default password */}
            {currentUser.hasDefaultPassword && (
              <button
                id="btn-nav-default-pass-warning"
                onClick={onOpenChangePassword}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold transition animate-pulse"
                title="Haga clic para cambiar la contraseña por defecto (gloria2025)"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Cambiar Clave por Defecto</span>
              </button>
            )}

            {/* Action button: Solicitar Cita (Only for Proveedor or Admin) */}
            {(currentUser.role === 'proveedor' || currentUser.role === 'admin') && (
              <button
                id="btn-nueva-cita-desktop"
                onClick={onOpenNewAppointment}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold tracking-wide transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Solicitar Cita de Entrega</span>
              </button>
            )}

            {/* Notifications Button - Exclusivo para ADMINISTRADOR y RECEPCIONISTA */}
            {(currentUser.role === 'admin' || currentUser.role === 'recepcionista') && (
              <button
                id="btn-notificaciones-desktop"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-white transition flex items-center gap-1.5 text-xs font-medium border border-blue-700/50"
                title="Centro de Notificaciones (Gmail / Outlook)"
              >
                <Bell className="w-4 h-4 text-blue-200" />
                <span className="hidden lg:inline">Avisos Correo</span>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#00264d]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile & Security Dropdown */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/70 border border-blue-700/60 hover:bg-blue-900/80 transition text-left"
              >
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <RoleIcon className="w-4 h-4 text-blue-300" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-white leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showRoleMenu && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-slate-800"
                  onMouseLeave={() => setShowRoleMenu(false)}
                >
                  {/* Current User Card */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Usuario Activo
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${badge.bg}`}>
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-900 mt-0.5">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-600 truncate">{currentUser.companyName}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>

                    {/* Password Status */}
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Estado de Clave:</span>
                      {currentUser.hasDefaultPassword ? (
                        <span className="text-amber-800 bg-amber-100 border border-amber-300 font-bold px-1.5 py-0.2 rounded text-[10px] flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Por Defecto</span>
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 font-bold px-1.5 py-0.2 rounded text-[10px] flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Personalizada</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="p-1.5 border-b border-slate-100 space-y-1">
                    <button
                      id="menu-btn-change-password"
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenChangePassword();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-900 flex items-center gap-2 transition"
                    >
                      <KeyRound className="w-4 h-4 text-blue-700" />
                      <div className="flex-1">
                        <span>Cambiar mi Contraseña</span>
                        {currentUser.hasDefaultPassword && (
                          <span className="block text-[10px] text-amber-600 font-normal">
                            Recomendado: Modificar 'gloria2025'
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Only Administrator can see and access all accounts */}
                    {currentUser.role === 'admin' && (
                      <button
                        id="menu-btn-open-login"
                        type="button"
                        onClick={() => {
                          setShowRoleMenu(false);
                          onOpenLoginModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 flex items-center gap-2 transition border border-purple-200"
                      >
                        <Users className="w-4 h-4 text-purple-700" />
                        <div className="flex-1">
                          <span>Ver y Acceder a Todas las Cuentas</span>
                          <span className="block text-[10px] text-purple-600 font-normal">
                            Panel exclusivo de Administrador
                          </span>
                        </div>
                      </button>
                    )}

                    {/* If Admin is inspecting a user account, provide return button */}
                    {isImpersonatedByAdmin && onReturnToAdmin && (
                      <button
                        id="menu-btn-return-admin"
                        type="button"
                        onClick={() => {
                          setShowRoleMenu(false);
                          onReturnToAdmin();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-purple-900 bg-purple-50 hover:bg-purple-100 flex items-center gap-2 transition border border-purple-300"
                      >
                        <Shield className="w-4 h-4 text-purple-700" />
                        <span>Volver a Administrador (Ing. Carlos Cayetano)</span>
                      </button>
                    )}

                    <button
                      id="menu-btn-logout"
                      type="button"
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>

                  {/* Account Access Section: ONLY ADMINISTRATOR has visibility and access to all accounts */}
                  {currentUser.role === 'admin' ? (
                    <div className="px-3 pt-2 pb-2 bg-purple-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1">
                          <Shield className="w-3 h-3 text-purple-700" />
                          <span>Acceso Global a Cuentas (Admin):</span>
                        </p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">
                          {storedUsers.length} usuarios
                        </span>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {storedUsers.map((u) => {
                          const isCurrent = u.id === currentUser.id;
                          return (
                            <button
                              key={u.id}
                              onClick={() => {
                                onSwitchUser(u);
                                setShowRoleMenu(false);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition hover:bg-purple-100/70 ${
                                isCurrent ? 'bg-purple-100 text-purple-950 font-bold border border-purple-300' : 'text-slate-700'
                              }`}
                            >
                              <div className="truncate mr-1.5 min-w-0">
                                <span className="truncate block font-medium text-slate-800">{u.name}</span>
                                <span className="text-[10px] text-slate-500 truncate block">{u.companyName || u.email}</span>
                              </div>
                              <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-200 text-slate-700 shrink-0 font-semibold">
                                {u.role}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2.5 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-100">
                      <div className="flex items-start gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="leading-tight">
                          <strong>Acceso Restringido:</strong> Como perfil <span className="uppercase font-semibold text-slate-700">{currentUser.role}</span>, solo puede acceder a su cuenta y citas autorizadas. Solo el Administrador puede ver y acceder a todas las cuentas.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Logout shortcut button */}
            <button
              id="btn-logout-navbar"
              onClick={onLogout}
              className="p-2 rounded-lg bg-blue-950/60 hover:bg-red-600/80 text-white transition flex items-center gap-1 text-xs border border-blue-800"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {currentUser.hasDefaultPassword && (
              <button
                onClick={onOpenChangePassword}
                className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40"
                title="Cambiar clave"
              >
                <KeyRound className="w-4 h-4" />
              </button>
            )}

            {(currentUser.role === 'admin' || currentUser.role === 'recepcionista') && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg bg-blue-900/60 text-white"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D32F2F] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-blue-900 text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#001f3f] border-t border-blue-800 px-4 pt-3 pb-5 space-y-3">
          <div className="p-3 bg-blue-950/80 rounded-lg border border-blue-800 space-y-1">
            <p className="text-xs text-blue-200">Usuario conectado:</p>
            <p className="text-sm font-bold text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-300">{currentUser.companyName}</p>
            <div className="flex items-center gap-2 pt-1">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.bg}`}>
                {badge.label}
              </span>
              {currentUser.hasDefaultPassword ? (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-700">
                  Clave por defecto
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-700">
                  Clave personalizada
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenChangePassword();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-semibold shadow"
          >
            <KeyRound className="w-4 h-4 text-amber-300" />
            <span>Cambiar mi Contraseña</span>
          </button>

          {(currentUser.role === 'proveedor' || currentUser.role === 'admin') && (
            <button
              id="btn-nueva-cita-mobile"
              onClick={() => {
                onOpenNewAppointment();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-sm font-semibold shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Solicitar Nueva Cita de Entrega</span>
            </button>
          )}

          <div className="pt-2 border-t border-blue-900 flex flex-col gap-2">
            {isImpersonatedByAdmin && onReturnToAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReturnToAdmin();
                }}
                className="w-full py-2.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <Shield className="w-4 h-4" />
                <span>Volver a Administrador (Ing. Carlos Cayetano)</span>
              </button>
            )}

            <div className="flex gap-2">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal();
                  }}
                  className="flex-1 py-2 rounded-lg bg-blue-950 text-blue-200 text-xs font-semibold border border-blue-800 flex items-center justify-center gap-1.5"
                >
                  <Users className="w-4 h-4 text-purple-300" />
                  <span>Gestionar Cuentas</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2 rounded-lg bg-red-900/80 text-white text-xs font-semibold border border-red-700 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
