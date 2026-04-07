import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.webp';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'rate_limited'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Ingresá tu email');
      return;
    }

    setStatus('sending');
    try {
      await api.post('/auth/forgot-password.php', { email });
      setStatus('sent');
    } catch (err: any) {
      if (err.status === 429) {
        setStatus('rate_limited');
        setErrorMessage('Demasiados intentos. Intenta en 15 minutos.');
      } else {
        setStatus('error');
        setErrorMessage('Error de conexión. Intentá de nuevo.');
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
            <h1 className="text-white text-3xl font-black tracking-tight">¿Olvidaste tu contraseña?</h1>
            <p className="text-[#9da8b9] text-sm">Ingresá tu email y te enviaremos las instrucciones para restablecerla.</p>
          </div>
        </div>

        {status === 'sent' ? (
          <div className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-green-400">mark_email_read</span>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-white text-2xl font-black tracking-tight">¡Revisá tu email!</h2>
              <p className="text-[#9da8b9] text-sm">Si el email está registrado, te enviamos las instrucciones. Revisá tu bandeja y spam.</p>
            </div>
            <Link
              to="/login"
              className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {errorMessage}
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

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'sending' ? (
                <>
                  <span className="animate-spin material-symbols-outlined">sync</span>
                  <span>Enviando...</span>
                </>
              ) : (
                'Enviar instrucciones'
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

export default ForgotPasswordPage;
