import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  Building2, 
  Truck, 
  ClipboardCheck, 
  Shield, 
  UserPlus, 
  LogIn,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Info
} from 'lucide-react';
import { User } from '../types';
import { 
  getStoredUsers, 
  validateUserLogin, 
  DEFAULT_PASSWORD, 
  saveUsers 
} from '../mockData';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [identifier, setIdentifier] = useState('admin@gloria.com.pe');
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Register form state
  const [regCompany, setRegCompany] = useState('');
  const [regRuc, setRegRuc] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState(DEFAULT_PASSWORD);
  const [regPasswordConfirm, setRegPasswordConfirm] = useState(DEFAULT_PASSWORD);
  const [regError, setRegError] = useState<string | null>(null);

  const storedUsers = getStoredUsers();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg('Por favor ingrese su correo electrónico o RUC registrado.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor ingrese su contraseña de acceso.');
      return;
    }

    const result = validateUserLogin(identifier, password);
    if (result.success && result.user) {
      setSuccessMsg(`¡Bienvenido al sistema, ${result.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 500);
    } else {
      setErrorMsg(result.error || 'Credenciales inválidas. Verifique sus datos.');
    }
  };

  const handleFastSelect = (user: User) => {
    setIdentifier(user.email);
    setPassword(user.password || DEFAULT_PASSWORD);
    setErrorMsg(null);
  };

  const handleFastDirectLogin = (user: User) => {
    const effectivePass = user.password || DEFAULT_PASSWORD;
    const result = validateUserLogin(user.email, effectivePass);
    if (result.success && result.user) {
      setSuccessMsg(`Iniciando sesión como ${result.user.name}...`);
      setTimeout(() => {
        onLoginSuccess(result.user!);
      }, 300);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regRuc.trim().length !== 11 || !/^\d+$/.test(regRuc.trim())) {
      setRegError('El RUC debe constar de 11 dígitos numéricos.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }

    const users = getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setRegError('El correo ingresado ya se encuentra registrado.');
      return;
    }

    const isDefault = regPassword === DEFAULT_PASSWORD;

    const newUser: User = {
      id: `prov-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim(),
      role: 'proveedor',
      companyName: regCompany.trim(),
      ruc: regRuc.trim(),
      phone: regPhone.trim() || undefined,
      password: regPassword,
      hasDefaultPassword: isDefault
    };

    saveUsers([...users, newUser]);
    setSuccessMsg(`¡Empresa ${newUser.companyName} registrada exitosamente!`);
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between selection:bg-red-500 selection:text-white">
      
      {/* Top Gloria Header */}
      <header className="bg-[#00264d] text-white border-b-4 border-[#D32F2F] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1 rounded shadow-md flex items-center justify-center">
              <span className="font-black text-[#00264d] text-xl sm:text-2xl tracking-wider font-sans">
                GLORIA
              </span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                PORTAL DE CITAS A PROVEEDORES
              </h1>
              <p className="text-[11px] text-blue-200">
                Leche Gloria S.A. • Sistema Integrado de Control y Recepción Logística
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-blue-200 bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Acceso Seguro Encriptado SSL</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-w-5xl">
          
          {/* Left Column: Brand & Security Info */}
          <div className="lg:col-span-5 text-white space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Control de Acceso por Usuario y Contraseña</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Ingreso al Sistema de Gestión de Citas
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Plataforma oficial para la coordinación, confirmación y recepción de entregas en los centros de distribución y plantas de <strong className="text-white">Leche Gloria S.A.</strong>
              </p>
            </div>

            {/* Feature points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Proveedores Autorizados</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Registro de múltiples OCs, palets, nivel de urgencia, adjuntos PDF y pase digital con QR.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <div className="p-2 rounded-lg bg-amber-600/20 text-amber-400 shrink-0">
                  <ClipboardCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Recepción y Almacén Huachipa</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Aprobación de citas, asignación de bahías y registro de tiempos (Llegada, Descarga y Liquidación).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
                <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Administración y Seguridad</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Trazabilidad de auditoría completa y capacidad de cambio de contraseña por cada usuario.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white font-semibold">Contraseñas por Defecto:</strong>
                <span className="text-[11px] text-amber-300">
                  Todos los usuarios cuentan con la contraseña inicial <code className="bg-amber-900/60 px-1.5 py-0.5 rounded font-mono font-bold text-white border border-amber-700/50">gloria2025</code>. Cada usuario puede cambiarla en cualquier momento desde su perfil.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login / Register Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Card Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
                <button
                  id="tab-login"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                    setRegError(null);
                  }}
                  className={`flex-1 py-3.5 px-4 text-center transition flex items-center justify-center gap-2 border-b-2 ${
                    activeTab === 'login'
                      ? 'border-[#00264d] text-[#00264d] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  id="tab-register"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg(null);
                    setRegError(null);
                  }}
                  className={`flex-1 py-3.5 px-4 text-center transition flex items-center justify-center gap-2 border-b-2 ${
                    activeTab === 'register'
                      ? 'border-[#00264d] text-[#00264d] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrar Proveedor</span>
                </button>
              </div>

              <div className="p-6 sm:p-7">
                
                {/* LOGIN TAB */}
                {activeTab === 'login' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Autenticación de Usuarios
                      </h3>
                      <p className="text-xs text-slate-500">
                        Ingrese su correo o RUC y su clave de acceso para continuar.
                      </p>
                    </div>

                    {/* Alerts */}
                    {errorMsg && (
                      <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <strong className="block font-semibold">Error de autenticación</strong>
                          <span>{errorMsg}</span>
                        </div>
                      </div>
                    )}

                    {successMsg && (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{successMsg}</span>
                      </div>
                    )}

                    {/* Main Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Correo Electrónico *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            id="input-login-identifier"
                            type="text"
                            required
                            placeholder="usuario@gloria.com.pe o RUC"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">
                            Contraseña de Acceso *
                          </label>
                          <span className="text-[11px] text-slate-500">
                            Por defecto: <span className="font-mono font-bold text-slate-700">gloria2025</span>
                          </span>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            id="input-login-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs font-mono transition"
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

                      <button
                        id="btn-login-submit"
                        type="submit"
                        className="w-full py-2.5 px-4 bg-[#00264d] hover:bg-[#001b36] text-white rounded-lg font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Iniciar Sesión en el Portal</span>
                      </button>
                    </form>

                    {/* Pre-configured Demo Accounts */}

                    <div className="pt-4 border-t border-slate-200">
                       {/** <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                          <span>Perfiles y Cuentas de Acceso al Sistema</span>
                        </p>
                       </div>*/}

                      {/* Access Rule Notice */}

                      <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Política de Acceso por Roles (RBAC):</span>
                        </p>
                        <p className="text-[10px] leading-relaxed">
                          • <strong>PROVEEDOR, RECEPCIONISTA y PLANIFICACIÓN:</strong> Solo pueden acceder a sus cuentas y módulos de trabajo autorizados.
                        </p>
                        <p className="text-[10px] leading-relaxed">
                          • <strong>PLANIFICACIÓN (Lic. Roberto Mendoza):</strong> Valida las Órdenes de Compra en SAP antes de que el Recepcionista confirme las citas.
                        </p>
                        <p className="text-[10px] leading-relaxed">
                          • <strong>ADMINISTRADOR (Ing. Carlos Cayetano):</strong> Autorización total para ver y acceder a todas las cuentas registradas.
                        </p>
                      </div>
                      
                       {/** <p className="text-[11px] text-slate-500 mb-2">
                        Seleccione una cuenta para auto-completar sus credenciales o ingresar directamente:
                       </p>*/}

                      {/** SECCIÓN DE CUENTAS POR DEFAULT
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {storedUsers.map((u) => {
                          const isCustomPass = !u.hasDefaultPassword;
                          const roleColor = 
                            u.role === 'admin' 
                              ? 'border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 text-purple-950' 
                              : u.role === 'recepcionista'
                              ? 'border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-950'
                              : 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-amber-950';

                          return (
                            <div
                              key={u.id}
                              className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition ${roleColor}`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-bold text-slate-900 truncate">{u.name}</span>
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-white border border-slate-300 shrink-0">
                                    {u.role}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 truncate font-mono">{u.email}</p>

                                <div className="mt-1">
                                  {u.role === 'admin' ? (
                                    <span className="inline-block text-[9px] font-semibold text-purple-800 bg-purple-100 px-1.5 py-0.2 rounded border border-purple-200">
                                      Acceso a Todas las Cuentas
                                    </span>
                                  ) : (
                                    <span className="inline-block text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                      Acceso Exclusivo a su Cuenta
                                    </span>
                                  )}
                                </div>
                                
                                <div className="mt-1.5 flex items-center gap-1 text-[10px]">
                                  <span className="text-slate-500 font-medium">Clave:</span>
                                  {isCustomPass ? (
                                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-1 rounded">
                                      {u.password} (Personalizada)
                                    </span>
                                  ) : (
                                    <span className="font-mono font-bold text-slate-700 bg-white/90 px-1 rounded border border-slate-200">
                                      gloria2025 (Por defecto)
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleFastSelect(u)}
                                  className="text-[10px] text-blue-700 hover:underline font-semibold"
                                >
                                  Cargar datos
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleFastDirectLogin(u)}
                                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-white font-bold hover:bg-black transition flex items-center gap-1"
                                >
                                  <span>Ingresar</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div> */}

                    </div>

                  </div>
                )}

                {/* REGISTER TAB */}
                {activeTab === 'register' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Registro de Empresa Proveedora
                      </h3>
                      <p className="text-xs text-slate-500">
                        Crea una cuenta para registrar y hacer seguimiento a las citas de entrega de tu empresa.
                      </p>
                    </div>

                    {/* Notice that Recepcionista can only be added by Admin */}
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-2.5 rounded-xl text-xs flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div className="leading-snug">
                        <span className="font-bold">Política de Cuentas:</span> Solo las empresas proveedoras pueden autorregistrarse aquí. Los usuarios con perfil <strong>RECEPCIONISTA</strong> son creados exclusivamente por el <strong>ADMINISTRADOR</strong> desde el panel de control.
                      </div>
                    </div>

                    {regError && (
                      <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{regError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Razón Social Proveedor *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Agroindustrias del Sur S.A."
                          value={regCompany}
                          onChange={(e) => setRegCompany(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs"
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
                          placeholder="20123456789"
                          value={regRuc}
                          onChange={(e) => setRegRuc(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Nombre del Contacto *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Lic. Mario Vargas"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Teléfono de Coordinación
                        </label>
                        <input
                          type="text"
                          placeholder="+51 999 123 456"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs"
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
                        placeholder="logistica@empresa.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Contraseña de Acceso *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Mínimo 6 caracteres"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Confirmar Contraseña *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Reingrese contraseña"
                          value={regPasswordConfirm}
                          onChange={(e) => setRegPasswordConfirm(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#00264d] focus:bg-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#00264d] hover:bg-[#001b36] text-white rounded-lg font-bold text-xs shadow-md transition flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Completar Registro e Ingresar</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#001830] text-slate-400 border-t border-slate-800 py-4 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="text-white font-bold">Leche Gloria S.A. • RUC 20100190797</p>
            <p className="text-[11px] text-slate-400">Av. República de Panamá 2461, Santa Catalina, La Victoria, Lima - Perú</p>
          </div>
          <div className="text-[11px] text-slate-400">
            <span>Mesa de Ayuda Logística: +51 974930272</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
