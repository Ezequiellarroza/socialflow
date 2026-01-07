// =====================================================
// SOCIALFLOW - Cliente Login Page (con Marca Blanca)
// =====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';

const ClienteLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { login, isLoading, error, clearError } = useAuth();
  const { branding, isLoading: brandingLoading, error: brandingError, loadBranding } = useBranding();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Cargar branding al montar si hay slug
  useEffect(() => {
    if (slug) {
      loadBranding(slug);
    }
  }, [slug, loadBranding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos');
      return;
    }

    try {
      await login({
        email,
        password,
        user_type: 'cliente',
      });
      // Redirigir al dashboard del portal o al legacy
      if (slug) {
        navigate(`/portal/${slug}/dashboard`);
      } else {
        navigate('/cliente/dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Error al iniciar sesión');
    }
  };

  const displayError = localError || error || brandingError;
  const primaryColor = branding.colores.primary;
  const secondaryColor = branding.colores.secondary;

  // Loading del branding
  if (brandingLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#9da8b9]">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 overflow-hidden relative">
      {/* Efecto de fondo con color dinámico */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 blur-[150px] rounded-full -z-10 opacity-20"
        style={{ backgroundColor: primaryColor }}
      ></div>
      
      <div className="max-w-md w-full flex flex-col gap-10">
        {/* Header con logo/nombre dinámico */}
        <div className="flex flex-col items-center gap-4 text-center">
          {branding.logo_url ? (
            <img 
              src={branding.logo_url} 
              alt={branding.nombre}
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div 
              className="rounded-2xl size-14 flex items-center justify-center text-white text-3xl font-bold shadow-xl"
              style={{ 
                backgroundColor: primaryColor,
                boxShadow: `0 10px 40px -10px ${primaryColor}50`
              }}
            >
              <span className="material-symbols-outlined text-[32px]">person</span>
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black tracking-tight">
              {slug ? branding.nombre : 'Portal del Cliente'}
            </h1>
            <p className="text-[#9da8b9] text-sm">Revisa y aprueba tu contenido</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          {displayError && (
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
              className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white transition-all focus:outline-none"
              style={{ 
                borderColor: email ? primaryColor : undefined,
              }}
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = email ? primaryColor : ''}
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Contraseña</label>
              <a 
                href="#" 
                className="text-[10px] hover:underline font-bold uppercase"
                style={{ color: primaryColor }}
              >
                ¿La olvidaste?
              </a>
            </div>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white transition-all focus:outline-none"
              onFocus={(e) => e.target.style.borderColor = primaryColor}
              onBlur={(e) => e.target.style.borderColor = password ? primaryColor : ''}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 text-white rounded-xl font-bold transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 10px 40px -10px ${primaryColor}50`
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = secondaryColor}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
          >
            {isLoading ? (
              <>
                <span className="animate-spin material-symbols-outlined">sync</span>
                <span>Ingresando...</span>
              </>
            ) : (
              'Ingresar al Portal'
            )}
          </button>

          {/* Credenciales de prueba - ELIMINAR EN PRODUCCIÓN */}
          <div className="mt-2 p-3 bg-[#111418] rounded-lg border border-border-dark">
            <p className="text-[10px] text-[#9da8b9] uppercase tracking-wider mb-2">Credenciales de prueba:</p>
            <p className="text-xs text-white">juan@cliente.com / password</p>
          </div>
        </form>

        {/* Link a login de agencia - solo si no es portal con marca */}
        {!slug && (
          <p className="text-center text-sm text-[#9da8b9]">
            ¿Eres una agencia? <Link to="/login" className="font-bold hover:underline" style={{ color: primaryColor }}>Ingresa aquí</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ClienteLoginPage;
