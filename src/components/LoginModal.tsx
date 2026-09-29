import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  ClipboardCheck, 
  Truck, 
  Lock, 
  Mail, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle2,
  LogIn,
  Users,
  Search,
  Building2,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { User, UserRole } from '../types';
import { 
  getStoredUsers, 
  validateUserLogin, 
  DEFAULT_PASSWORD, 
  saveUsers,
  deleteStoredUser,
  addStoredUser,
  GLORIA_PLANTS
} from '../mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  currentUser: User | null;
  onOpenChangePassword?: () => void;
  onUsersChange?: (users: User[]) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentUser,
  onOpenChangePassword,
  onUsersChange
}) => {
  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const [mode, setMode] = useState<'switch' | 'form' | 'register'>('switch');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'recepcionista' | 'planificacion' | 'proveedor'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [usersList, setUsersList] = useState<User[]>(() => getStoredUsers());
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Register state - Administrator can select between RECEPCIONISTA, PLANIFICACIÓN, and PROVEEDOR
  const [regRole, setRegRole] = useState<'recepcionista' | 'planificacion' | 'proveedor'>('recepcionista');
  const [regName, setRegName] = useState('');
  const [regCompany, setRegCompany] = useState(GLORIA_PLANTS[0]);
  const [regRuc, setRegRuc] = useState('20100190797');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState(DEFAULT_PASSWORD);
  const [regError, setRegError] = useState<string | null>(null);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = validateUserLogin(identifier, password);
    if (result.success && result.user) {
      onLogin(result.user);
      onClose();
    } else {
      setErrorMsg(result.error || 'Credenciales inválidas. Verifique su contraseña.');
    }
  };

  const handleFastDirectLogin = (u: User) => {
    onLogin(u);
    onClose();
  };

  const handleDeleteClick = (u: User) => {
    setErrorMsg(null);
    if (u.role === 'admin' && usersList.filter(x => x.role === 'admin').length <= 1) {
      setErrorMsg('No es posible eliminar la cuenta principal del Administrador del sistema.');
      return;
    }
    if (currentUser && u.id === currentUser.id) {
      setErrorMsg('No puedes eliminar la cuenta con la que actualmente tienes la sesión activa.');
      return;
    }
    setUserToDelete(u);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    const res = deleteStoredUser(userToDelete.id);
    if (res.success && res.remainingUsers) {
      setUsersList(res.remainingUsers);
      if (onUsersChange) onUsersChange(res.remainingUsers);
      setActionSuccessMsg(`Usuario "${userToDelete.name}" (${userToDelete.role.toUpperCase()}) eliminado del sistema.`);
      setUserToDelete(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setErrorMsg(res.error || 'Error al eliminar el usuario.');
      setUserToDelete(null);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regRole === 'proveedor') {
      if (regRuc.trim().length !== 11) {
        setRegError('El RUC del proveedor debe tener 11 dígitos.');
        return;
      }
      if (!regCompany.trim()) {
        setRegError('Debe ingresar la Razón Social del proveedor.');
        return;
      }
    }

    const newUser: User = {
      id: `${regRole === 'recepcionista' ? 'recep' : regRole === 'planificacion' ? 'plan' : 'prov'}-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      role: regRole,
      companyName: regRole === 'recepcionista' 
        ? (regCompany.trim() || 'Leche Gloria S.A. - Almacén Central Huachipa')
        : regRole === 'planificacion'
        ? (regCompany.trim() || 'Leche Gloria S.A. - Dpto. Planificación y Abastecimiento')
        : regCompany.trim(),
      ruc: (regRole === 'recepcionista' || regRole === 'planificacion') ? '20100190797' : regRuc.trim(),
      phone: regPhone.trim() || undefined,
      password: regPassword,
      hasDefaultPassword: regPassword === DEFAULT_PASSWORD
    };

    const res = addStoredUser(newUser);
    if (res.success && res.updatedUsers) {
      setUsersList(res.updatedUsers);
      if (onUsersChange) onUsersChange(res.updatedUsers);
      setActionSuccessMsg(`Usuario "${newUser.name}" creado con éxito con perfil ${newUser.role.toUpperCase()}.`);
      setMode('switch');
      
      // Reset form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword(DEFAULT_PASSWORD);
      if (regRole === 'proveedor') {
        setRegCompany('');
        setRegRuc('');
      } else {
        setRegCompany(GLORIA_PLANTS[0]);
        setRegRuc('20100190797');
      }

      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setRegError(res.error || 'Error al registrar el usuario.');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesRole;
    const matchesSearch = 
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.companyName.toLowerCase().includes(term) ||
      (u.ruc && u.ruc.includes(term));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Gloria */}
        <div className="bg-[#00264d] text-white px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded text-[#00264d] font-black text-base tracking-wider font-sans">
              GLORIA
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>Panel de Gestión de Cuentas y Accesos</span>
                <span className="text-[10px] bg-purple-700 text-purple-100 px-2 py-0.5 rounded-full font-bold uppercase">
                  Exclusivo Administrador
                </span>
              </h2>
              <p className="text-[11px] text-blue-200">
                Supervisión Global, Creación de Recepcionistas y Eliminación de Usuarios • Ing. Carlos Cayetano
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

        {/* Security check if user is not Administrator */}
        {!isAdmin ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Acceso Restringido por Política de Seguridad</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Los usuarios con perfil <strong>PROVEEDOR</strong> y <strong>RECEPCIONISTA</strong> solo pueden acceder a sus cuentas asignadas. Únicamente el perfil <strong>ADMINISTRADOR</strong> tiene autorización para ver, crear usuarios de recepción y eliminar cuentas en el sistema.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#00264d] text-white text-xs font-bold rounded-lg shadow hover:bg-[#001f3f]"
              >
                Entendido y Cerrar
              </button>
            </div>
          </div>
        ) : (
          /* Content for Administrator */
          <div className="p-5 sm:p-6 text-slate-800 space-y-4">
            
            {/* Success message banner */}
            {actionSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{actionSuccessMsg}</span>
              </div>
            )}

            {/* General error message banner */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-300 text-red-900 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => {
                  setMode('switch');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'switch' ? 'bg-white shadow text-[#00264d]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-700" />
                <span>Cuentas Registradas ({usersList.length})</span>
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setRegError(null);
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'register' ? 'bg-white shadow text-[#00264d]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-700" />
                <span>Agregar Nuevo Usuario</span>
              </button>
              <button
                onClick={() => {
                  setMode('form');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'form' ? 'bg-white shadow text-[#00264d]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-700" />
                <span>Validar Credenciales</span>
              </button>
            </div>

            {/* Mode 1: Quick preset user cards and deletion */}
            {mode === 'switch' && (
              <div className="space-y-3">
                
                {/* Confirmation Box for Deletion */}
                {userToDelete && (
                  <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-xl space-y-2.5 animate-in fade-in">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-red-100 rounded-lg text-red-700 shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="text-xs">
                        <h4 className="font-bold text-red-900">¿Desea eliminar este usuario del sistema?</h4>
                        <p className="text-red-700 mt-0.5">
                          Se eliminará la cuenta de <strong>{userToDelete.name}</strong> ({userToDelete.role.toUpperCase()}) con correo <strong>{userToDelete.email}</strong>. Esta acción revocará todos sus accesos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setUserToDelete(null)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={confirmDeleteUser}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sí, Eliminar Usuario</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, RUC o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {(['all', 'admin', 'recepcionista', 'planificacion', 'proveedor'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setRoleFilter(r)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                          roleFilter === r
                            ? 'bg-[#00264d] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {r === 'all' ? 'Todos' : r === 'admin' ? 'Admin' : r === 'recepcionista' ? 'Recepción' : r === 'planificacion' ? 'Planificación' : 'Proveedores'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                      No se encontraron cuentas que coincidan con la búsqueda.
                    </div>
                  ) : (
                    filteredUsers.map((u) => {
                      let RoleIcon = Shield;
                      let colorClass = 'border-purple-200 bg-purple-50/70 hover:bg-purple-100/60 text-purple-900';

                      if (u.role === 'recepcionista') {
                        RoleIcon = ClipboardCheck;
                        colorClass = 'border-blue-200 bg-blue-50/70 hover:bg-blue-100/60 text-blue-900';
                      } else if (u.role === 'planificacion') {
                        RoleIcon = ShieldCheck;
                        colorClass = 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/60 text-emerald-900';
                      } else if (u.role === 'proveedor') {
                        RoleIcon = Truck;
                        colorClass = 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/60 text-amber-900';
                      }

                      const isCurrent = currentUser && u.id === currentUser.id;
                      const isCustomPass = !u.hasDefaultPassword;

                      return (
                        <div
                          key={u.id}
                          className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 ${colorClass} ${
                            isCurrent ? 'ring-2 ring-purple-600 shadow-xs' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
                              <RoleIcon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-slate-900">{u.name}</span>
                                <span className="px-2 py-0.2 rounded text-[10px] font-extrabold uppercase bg-white border border-slate-300">
                                  {u.role}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-purple-900 bg-purple-200/80 px-2 py-0.2 rounded-full">
                                    Sesión Activa
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 font-medium truncate">{u.companyName}</p>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap font-mono mt-0.5">
                                <span>{u.email}</span>
                                {u.ruc && <span>RUC: {u.ruc}</span>}
                              </div>
                              
                              {/* Password info badge */}
                              <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                                <span className="text-slate-500 font-medium">Contraseña:</span>
                                {isCustomPass ? (
                                  <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                                    {u.password} (Personalizada)
                                  </span>
                                ) : (
                                  <span className="font-mono font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-300">
                                    gloria2025 (Por defecto)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0 self-center">
                            <button
                              type="button"
                              onClick={() => handleFastDirectLogin(u)}
                              className="px-3 py-1.5 bg-[#00264d] hover:bg-[#001f3f] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                              title={`Acceder a la cuenta de ${u.name}`}
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span>{isCurrent ? 'Actual' : 'Acceder'}</span>
                            </button>

                            {/* Delete User Button - Administrator privilege */}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(u)}
                                className="p-1.5 sm:px-2.5 sm:py-1.5 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-900 border border-red-200 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                                title={`Eliminar cuenta de ${u.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                <span className="hidden sm:inline">Eliminar</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {currentUser && onOpenChangePassword && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">¿Deseas cambiar tu contraseña de administrador?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenChangePassword();
                      }}
                      className="text-blue-700 hover:underline font-bold flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Cambiar mi Contraseña</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Form mode */}
            {mode === 'form' && (
              <form onSubmit={handleCustomLogin} className="space-y-3.5 text-xs">
                <p className="text-slate-600 font-medium">
                  Prueba o valida el inicio de sesión con cualquier correo o RUC registrado:
                </p>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-300 text-red-900 p-2.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correo Electrónico o RUC:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="usuario@gloria.com.pe o RUC"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Contraseña:</label>
                    <span className="text-[11px] text-slate-500">Por defecto: gloria2025</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMode('switch')}
                    className="text-slate-500 hover:underline"
                  >
                    ← Volver a lista de cuentas
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00264d] text-white rounded-lg font-bold shadow hover:bg-[#001f3f] flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Validar e Iniciar Sesión</span>
                  </button>
                </div>
              </form>
            )}

            {/* Mode 3: Register mode (Admin can create RECEPCIONISTA or PROVEEDOR) */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                
                {/* Admin Policy Notice */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <p className="font-bold text-purple-950 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-700" />
                    <span>Privilegio Exclusivo del Administrador:</span>
                  </p>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Solo usted como Administrador puede dar de alta nuevos usuarios con perfil <strong>RECEPCIONISTA</strong> para la garita y almacenes de Planta, así como registrar nuevos proveedores corporativos.
                  </p>
                </div>

                {regError && (
                  <div className="bg-red-50 border border-red-300 text-red-900 p-2.5 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Role Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Seleccione el Perfil del Nuevo Usuario *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('recepcionista');
                        setRegCompany(GLORIA_PLANTS[0]);
                        setRegRuc('20100190797');
                        setRegError(null);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                        regRole === 'recepcionista'
                          ? 'border-blue-600 bg-blue-50/90 text-blue-950 ring-2 ring-blue-600 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ClipboardCheck className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs">Recepcionista</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Personal de garita y almacén de planta Gloria.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('planificacion');
                        setRegCompany('Leche Gloria S.A. - Dpto. Planificación y Abastecimiento');
                        setRegRuc('20100190797');
                        setRegError(null);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                        regRole === 'planificacion'
                          ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-600 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-xs">Planificación</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Valida las Órdenes de Compra en SAP antes de confirmar.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setRegRole('proveedor');
                        setRegCompany('');
                        setRegRuc('');
                        setRegError(null);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                        regRole === 'proveedor'
                          ? 'border-amber-600 bg-amber-50/90 text-amber-950 ring-2 ring-amber-600 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-xs">Proveedor</span>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                          Empresa proveedora con órdenes y citas.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Specific fields depending on Role */}
                {regRole === 'recepcionista' || regRole === 'planificacion' ? (
                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {regRole === 'planificacion' ? 'Nombre del Planificador *' : 'Nombre del Recepcionista *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={regRole === 'planificacion' ? 'Ej: Roberto Mendoza' : 'Ej: Walter Chauca Ramos'}
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Correo Institucional Gloria *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="ejemplo@gloria.com.pe"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-700" />
                          <span>{regRole === 'planificacion' ? 'Área / Centro de Planificación *' : 'Sede / Almacén Asignado *'}</span>
                        </label>
                        {regRole === 'planificacion' ? (
                          <input
                            type="text"
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-800"
                          />
                        ) : (
                          <select
                            value={regCompany}
                            onChange={(e) => setRegCompany(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs font-medium text-slate-800"
                          >
                            {GLORIA_PLANTS.map((plant) => (
                              <option key={plant} value={plant}>
                                {plant}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          {regRole === 'planificacion' ? 'Anexo SAP / Teléfono' : 'Teléfono Corporativo / Radio'}
                        </label>
                        <input
                          type="text"
                          placeholder="+51 993 421 876"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Razón Social del Proveedor *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Envases Metálicos del Perú S.A."
                          value={regCompany}
                          onChange={(e) => setRegCompany(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          RUC (11 dígitos) *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          placeholder="20198421034"
                          value={regRuc}
                          onChange={(e) => setRegRuc(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Contacto *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Lic. Andrés Benavides"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Teléfono de Coordinación
                        </label>
                        <input
                          type="text"
                          placeholder="+51 981 765 432"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Correo Corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="logistica@proveedor.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Common Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Contraseña Inicial *</label>
                    <span className="text-[11px] text-slate-500 font-mono">Por defecto: gloria2025</span>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 text-xs font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setMode('switch')}
                    className="text-slate-500 hover:underline font-semibold"
                  >
                    ← Volver a lista
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#00264d] text-white rounded-lg font-bold shadow-md hover:bg-[#001f3f] flex items-center gap-2 transition"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Crear y Registrar Usuario</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

