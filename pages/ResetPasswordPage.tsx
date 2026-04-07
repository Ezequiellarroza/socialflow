import React, { useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.webp';

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos 1 minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos 1 número', test: (p: string) => /\d/.test(p) },
  { label: 'Al menos 1 carácter especial', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!PASSWORD_RULES.every((r) => r.test(password))) {
      newErrors.password = 'La contraseña no cumple todos los requisitos';
    }

    if (!confirmPassword) {
      newErrors.password_confirmation = 'Confirmá tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    setErrors({});

    try {
      await api.post('/auth/reset-password.php', {
        token,
        password,
        password_confirmation: confirmPassword,
      });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      if (err.status === 422 && err.errors) {
        setErrors(err.errors);
      } else {
        setErrors({ general: err.message || 'Error al restablecer la contraseña.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>

      <div className="max-w-md w-full flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={logo} alt="SocialFlow" className="size-14 rounded-2xl bg-primary p-2 shadow-xl shadow-primary/30" />
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black tracking-tight">Nueva contraseña</h1>
            <p className="text-[#9da8b9] text-sm">Ingresá tu nueva contraseña.</p>
          </div>
        </div>

        {status === 'success' ? (
          <div className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-2xl font-black tracking-tight">¡Contraseña actualizada!</h2>
              <p className="text-[#9da8b9] text-sm">Tu contraseña fue actualizada correctamente.</p>
            </div>
            <Link
              to="/login"
              className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {errors.general}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Nueva contraseña</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: '' })); }}
                className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                placeholder="••••••••"
              />
              {errors.password && <span className="text-red-400 text-xs">{errors.password}</span>}
              {password && (
                <div className="flex flex-col gap-1 mt-1">
                  {PASSWORD_RULES.map((rule, idx) => {
                    const passed = rule.test(password);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-sm ${passed ? 'text-green-400' : 'text-[#9da8b9]'}`}>
                          {passed ? 'check_circle' : 'cancel'}
                        </span>
                        <span className={`text-xs ${passed ? 'text-green-400' : 'text-[#9da8b9]'}`}>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Confirmar contraseña</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.password_confirmation) setErrors((prev) => ({ ...prev, password_confirmation: '' })); }}
                className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                placeholder="••••••••"
              />
              {errors.password_confirmation && <span className="text-red-400 text-xs">{errors.password_confirmation}</span>}
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? (
                <>
                  <span className="animate-spin material-symbols-outlined">sync</span>
                  <span>Restableciendo...</span>
                </>
              ) : (
                'Restablecer contraseña'
              )}
            </button>
          </form>
        )}

        <Link to="/login" className="text-[#9da8b9] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">
          <span className="material-symbols-outlined text-base">arrow_back</span> Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
