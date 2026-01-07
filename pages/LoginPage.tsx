import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
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
      // El error ya se maneja en el contexto, pero podemos mostrar uno local
      setLocalError(err.message || 'Error al iniciar sesión');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full -z-10"></div>
      
      <div className="max-w-md w-full flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary rounded-2xl size-14 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-primary/30">
            <span className="material-symbols-outlined text-[32px]">layers</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-3xl font-black tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-[#9da8b9] text-sm">Gestiona tu agencia con poder IA</p>
          </div>
        </div>

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
              className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
              placeholder="agencia@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Contraseña</label>
              <a href="#" className="text-[10px] text-primary hover:underline font-bold uppercase">¿La olvidaste?</a>
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

          {/* Credenciales de prueba - ELIMINAR EN PRODUCCIÓN */}
          <div className="mt-2 p-3 bg-[#111418] rounded-lg border border-border-dark">
            <p className="text-[10px] text-[#9da8b9] uppercase tracking-wider mb-2">Credenciales de prueba:</p>
            <p className="text-xs text-white">admin@trinity.com / password</p>
          </div>
        </form>

        <p className="text-center text-sm text-[#9da8b9]">
          ¿No tienes cuenta? <Link to="/pricing" className="text-primary font-bold hover:underline">Suscríbete aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
