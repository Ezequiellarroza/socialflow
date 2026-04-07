import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logo from '../assets/logo.webp';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'rate_limited'>('idle');

  // Leer state de post-registro (viene de RegisterPage)
  useEffect(() => {
    const state = location.state as { registered?: boolean; email?: string } | null;
    if (state?.registered && state?.email) {
      setRegisteredEmail(state.email);
      // Limpiar el state para que no se muestre al recargar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setEmailNotVerified(false);
    setResendStatus('idle');
    clearError();

    // Validación básica
    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      await login({
        email,
        password,
        user_type: 'agencia',
      });
      navigate('/dashboard');
    } catch (err: any) {
      if (err.status === 403) {
        setRegisteredEmail(null);
        setEmailNotVerified(true);
        setUnverifiedEmail(email);
      } else {
        setLocalError(err.message || 'Error al iniciar sesión');
      }
    }
  };

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      await api.post('/auth/resend-verification.php', { email: unverifiedEmail });
      setLocalError('');
      clearError();
      setResendStatus('sent');
    } catch (err: any) {
      setResendStatus(err.status === 429 ? 'rate_limited' : 'error');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>
      
      <div className="max-w-md w-full flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={logo} alt="SocialFlow" className="size-14 rounded-2xl bg-primary p-2 shadow-xl shadow-primary/30" />
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-[#9da8b9] text-sm">Gestiona tu agencia con poder IA</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          {/* Banner post-registro */}
          {registeredEmail && !emailNotVerified && (
            <div className="bg-primary/10 border border-primary/30 px-4 py-3 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl mt-0.5">mark_email_read</span>
              <p className="text-sm text-primary">
                Te enviamos un email de verificación a <strong>{registeredEmail}</strong>. Revisá tu bandeja de entrada y la carpeta de spam.
              </p>
            </div>
          )}

          {/* Banner email no verificado (403) */}
          {emailNotVerified && resendStatus !== 'sent' && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 rounded-xl flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-yellow-400 text-xl mt-0.5">mark_email_unread</span>
                <p className="text-sm text-yellow-400">
                  {resendStatus === 'rate_limited'
                    ? 'Demasiados intentos. Intenta en 15 minutos.'
                    : resendStatus === 'error'
                      ? 'Error al reenviar. Intentá de nuevo.'
                      : 'Verificá tu email antes de iniciar sesión. Revisá tu bandeja de entrada y spam.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendStatus === 'sending' || resendStatus === 'rate_limited'}
                className="text-xs text-yellow-400 hover:text-yellow-300 font-bold uppercase tracking-wider self-end hover:underline transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendStatus === 'sending' ? 'Enviando...' : 'Reenviar email de verificación'}
              </button>
            </div>
          )}

          {/* Banner reenvío exitoso */}
          {emailNotVerified && resendStatus === 'sent' && (
            <div className="bg-green-500/10 border border-green-500/30 px-4 py-3 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-green-400 text-xl mt-0.5">mark_email_read</span>
              <p className="text-sm text-green-400">
                Te reenviamos el email de verificación. Revisá tu bandeja de entrada y spam.
              </p>
            </div>
          )}

          {displayError && !emailNotVerified && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {displayError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Email</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
              placeholder="agencia@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Contraseña</label>
              <Link to="/forgot-password" className="text-[10px] text-primary hover:underline font-bold uppercase">¿La olvidaste?</Link>
            </div>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="animate-spin material-symbols-outlined">sync</span>
                <span>Ingresando...</span>
              </>
            ) : (
              'Ingresar al Panel'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#9da8b9]">
          ¿No tienes cuenta? <Link to="/pricing" className="text-primary font-bold hover:underline">Suscríbete aquí</Link>
        </p>
        <Link to="/" className="text-[#9da8b9] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">
          <span className="material-symbols-outlined text-base">arrow_back</span> Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
