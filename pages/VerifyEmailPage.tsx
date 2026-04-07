import React from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import logo from '../assets/logo.webp';

const STATUS_CONFIG: Record<string, { icon: string; title: string; message: string; color: string; buttonText: string; buttonTo: string }> = {
  success: {
    icon: 'check_circle',
    title: '¡Email verificado!',
    message: 'Tu cuenta fue verificada correctamente. Ya podés iniciar sesión.',
    color: 'green',
    buttonText: 'Ir a iniciar sesión',
    buttonTo: '/login',
  },
  expired: {
    icon: 'schedule',
    title: 'Link expirado',
    message: 'El link de verificación expiró. Podés solicitar uno nuevo.',
    color: 'yellow',
    buttonText: 'Reenviar email de verificación',
    buttonTo: '/login',
  },
  invalid: {
    icon: 'cancel',
    title: 'Link inválido',
    message: 'El link de verificación no es válido o ya fue utilizado.',
    color: 'red',
    buttonText: 'Ir a iniciar sesión',
    buttonTo: '/login',
  },
  already_verified: {
    icon: 'check_circle',
    title: 'Email ya verificado',
    message: 'Tu email ya fue verificado anteriormente.',
    color: 'green',
    buttonText: 'Ir a iniciar sesión',
    buttonTo: '/login',
  },
  error: {
    icon: 'cancel',
    title: 'Error',
    message: 'Ocurrió un error al verificar tu email. Intentá de nuevo más tarde.',
    color: 'red',
    buttonText: 'Ir a iniciar sesión',
    buttonTo: '/login',
  },
};

const COLOR_CLASSES: Record<string, { icon: string; bg: string; border: string }> = {
  green: { icon: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  yellow: { icon: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  red: { icon: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');

  if (!status || !STATUS_CONFIG[status]) {
    return <Navigate to="/login" replace />;
  }

  const config = STATUS_CONFIG[status];
  const colors = COLOR_CLASSES[config.color];

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>

      <div className="max-w-md w-full flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <img src={logo} alt="SocialFlow" className="size-14 rounded-2xl bg-primary p-2 shadow-xl shadow-primary/30" />
        </div>

        <div className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-center">
          <div className={`w-16 h-16 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}>
            <span className={`material-symbols-outlined text-4xl ${colors.icon}`}>{config.icon}</span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-white text-2xl font-black tracking-tight">{config.title}</h1>
            <p className="text-[#9da8b9] text-sm">{config.message}</p>
          </div>

          <Link
            to={config.buttonTo}
            className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {config.buttonText}
          </Link>
        </div>

        <Link to="/" className="text-[#9da8b9] hover:text-white transition-colors flex items-center justify-center gap-2 text-sm">
          <span className="material-symbols-outlined text-base">arrow_back</span> Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
