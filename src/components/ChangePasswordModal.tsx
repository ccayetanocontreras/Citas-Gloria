import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';
import { updateUserPassword, DEFAULT_PASSWORD } from '../mockData';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPasswordChanged: (updatedUser: User) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPasswordChanged
}) => {
  if (!isOpen) return null;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements checks
  const isLengthValid = newPassword.length >= 6;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const isMatchValid = newPassword.length > 0 && newPassword === confirmPassword;

  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const actualCurrentPassword = currentUser.password || DEFAULT_PASSWORD;
    if (currentPassword !== actualCurrentPassword) {
      setErrorMsg('La contraseña actual ingresada es incorrecta. Verifique sus credenciales.');
      return;
    }

    if (!isLengthValid) {
      setErrorMsg('La nueva contraseña debe tener como mínimo 6 caracteres.');
      return;
    }

    if (newPassword === actualCurrentPassword) {
      setErrorMsg('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La nueva contraseña y la confirmación no coinciden.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = updateUserPassword(currentUser.id, newPassword);
      if (result.success && result.user) {
        setSuccessMsg('¡Su contraseña ha sido modificada exitosamente! Se ha guardado de forma segura.');
        onPasswordChanged(result.user);
        setTimeout(() => {
          handleReset();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(result.error || 'Ocurrió un error al actualizar la contraseña.');
      }
    } catch (err) {
      setErrorMsg('Error inesperado al procesar el cambio de contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#00264d] text-white px-6 py-4 flex items-center justify-between border-b-4 border-[#D32F2F]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-white">
              <KeyRound className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold leading-tight">
                Cambiar Contraseña de Acceso
              </h2>
              <p className="text-[11px] text-blue-200">
                Portal de Citas y Logística • Leche Gloria S.A.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-800">
          
          {/* User info card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500">{currentUser.email}</p>
              <p className="text-[11px] text-slate-600 font-medium">{currentUser.companyName}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                {currentUser.role}
              </span>
            </div>
          </div>

          {/* Default Password Notice */}
          {currentUser.hasDefaultPassword ? (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Contraseña por defecto activa</strong>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Actualmente tu cuenta usa la clave predeterminada del sistema (<code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">gloria2025</code>). Modifícala por una propia para mayor privacidad.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-medium">
                Tu cuenta cuenta con una contraseña personalizada activa.
              </span>
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 text-red-900 p-3 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* Contraseña Actual */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Contraseña Actual *
                </label>
                {currentUser.hasDefaultPassword && (
                  <button
                    type="button"
                    onClick={() => setCurrentPassword(currentUser.password || DEFAULT_PASSWORD)}
                    className="text-[10px] text-blue-700 hover:underline font-semibold"
                  >
                    Usar por defecto (gloria2025)
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  placeholder="Ingrese su contraseña actual"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  placeholder="Reingrese la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Requisitos visuales */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-600">
              <p className="font-semibold text-slate-700 text-xs mb-1">Requisitos de seguridad:</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isLengthValid ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  ✓
                </span>
                <span className={isLengthValid ? 'text-emerald-700 font-medium' : ''}>
                  Al menos 6 caracteres
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isDifferentFromCurrent ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  ✓
                </span>
                <span className={isDifferentFromCurrent ? 'text-emerald-700 font-medium' : ''}>
                  Diferente a la contraseña actual
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isMatchValid ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                  ✓
                </span>
                <span className={isMatchValid ? 'text-emerald-700 font-medium' : ''}>
                  Ambas contraseñas coinciden
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !isLengthValid || !isMatchValid}
                className="px-4 py-2 bg-[#00264d] text-white rounded-lg text-xs font-bold hover:bg-[#001f3f] transition shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Guardando...' : 'Guardar Nueva Contraseña'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
