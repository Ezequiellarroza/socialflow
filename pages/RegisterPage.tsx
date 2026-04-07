import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const PLANS: Record<string, { label: string; price: string; features: string[] }> = {
  free: {
    label: 'Free',
    price: 'Gratis',
    features: ['1 Cliente', '1 Usuario de agencia', '10 Publicaciones/mes', 'Portal white-label', 'Calendario visual', 'Feedback y aprobaciones'],
  },
  starter: {
    label: 'Starter',
    price: '$8/mes',
    features: ['5 Clientes', '2 Usuarios de agencia', '50 Publicaciones/mes', '1 GB Almacenamiento', 'Portal white-label', 'Calendario visual', 'Feedback y aprobaciones'],
  },
  pro: {
    label: 'Pro',
    price: '$20/mes',
    features: ['15 Clientes', '5 Usuarios de agencia', 'Publicaciones ilimitadas', '5 GB Almacenamiento', 'Portal white-label', 'Calendario visual', 'Feedback y aprobaciones', 'Soporte prioritario'],
  },
};

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos 1 minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos 1 número', test: (p: string) => /\d/.test(p) },
  { label: 'Al menos 1 carácter especial', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planKey = PLANS[searchParams.get('plan') || ''] ? searchParams.get('plan')! : 'free';
  const plan = PLANS[planKey];
  const isPaid = planKey !== 'free';

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!form.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresá un email válido';
    }
    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!PASSWORD_RULES.every((r) => r.test(form.password))) {
      newErrors.password = 'La contraseña no cumple todos los requisitos';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirmá tu contraseña';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!form.agencyName.trim()) newErrors.agencyName = 'El nombre de la agencia es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://socialflow.com.ar/api';

      const res = await fetch(`${API_URL}/auth/register.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.confirmPassword,
          nombre_agencia: form.agencyName,
          plan: planKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: data.error || 'El email ya está registrado' });
        } else if (res.status === 422 && data.errors) {
          setErrors(data.errors);
        } else if (res.status === 429) {
          setErrors({ general: 'Demasiados intentos. Esperá unos minutos.' });
        } else {
          setErrors({ general: data.error || 'Error al crear la cuenta. Intentá de nuevo.' });
        }
        return;
      }

      // Registro exitoso — redirigir según plan
      navigate('/login', { state: { registered: true, email: form.email } });

    } catch (err) {
      setErrors({ general: 'Error de conexión. Verificá tu internet e intentá de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col">
      <Navbar />

      <main
        className="flex-1 pt-28 pb-16 px-6"
        style={{
          backgroundColor: '#0a0f16',
          backgroundImage: `
            radial-gradient(at 0% 0%, hsla(220,50%,10%,1) 0, transparent 50%),
            radial-gradient(at 50% 0%, hsla(220,80%,25%,1) 0, transparent 50%),
            radial-gradient(at 100% 0%, hsla(240,60%,30%,1) 0, transparent 50%),
            radial-gradient(at 50% 100%, hsla(220,50%,10%,1) 0, transparent 50%)
          `,
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Columna derecha — Resumen del plan (arriba en mobile) */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 lg:sticky lg:top-28">
              <h2 className="text-lg font-bold text-[#9da8b9] uppercase tracking-wider mb-6">Tu plan seleccionado</h2>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-white">Plan {plan.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black text-primary">{plan.price}</span>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                {plan.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span className="text-sm text-white font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-dark pt-6 flex flex-col gap-4">
                {isPaid ? (
                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-primary text-lg">lock</span>
                    <span className="text-sm text-primary font-medium">Pago seguro con Stripe</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-green-400 text-lg">credit_card_off</span>
                    <span className="text-sm text-green-400 font-medium">Sin tarjeta de crédito requerida</span>
                  </div>
                )}

                <Link to="/pricing" className="text-sm text-[#9da8b9] hover:text-white transition-colors text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-base">swap_horiz</span>
                  Ver todos los planes
                </Link>
              </div>
            </div>
          </div>

          {/* Columna izquierda — Formulario (abajo en mobile) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-surface-dark border border-border-dark rounded-2xl p-8 shadow-2xl">
              <div className="mb-8">
                <h1 className="text-white text-3xl font-black tracking-tight">Crear tu cuenta</h1>
                <p className="text-[#9da8b9] text-sm mt-2">Empezá a gestionar tu agencia en minutos</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Nombre completo */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Nombre completo</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                    placeholder="Juan Pérez"
                  />
                  {errors.name && <span className="text-red-400 text-xs">{errors.name}</span>}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                    placeholder="agencia@ejemplo.com"
                  />
                  {errors.email && <span className="text-red-400 text-xs">{errors.email}</span>}
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Contraseña</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  {errors.password && <span className="text-red-400 text-xs">{errors.password}</span>}
                  {form.password && (
                    <div className="flex flex-col gap-1 mt-1">
                      {PASSWORD_RULES.map((rule, idx) => {
                        const passed = rule.test(form.password);
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

                {/* Confirmar contraseña */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && <span className="text-red-400 text-xs">{errors.confirmPassword}</span>}
                </div>

                {/* Nombre de la agencia */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Nombre de la agencia</label>
                  <input
                    type="text"
                    value={form.agencyName}
                    onChange={(e) => updateField('agencyName', e.target.value)}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white focus:ring-primary focus:border-primary transition-all"
                    placeholder="Mi Agencia Digital"
                  />
                  {errors.agencyName && <span className="text-red-400 text-xs">{errors.agencyName}</span>}
                </div>

                {/* Stripe notice */}
                {isPaid && (
                  <p className="text-[#9da8b9] text-xs text-center">
                    Después de registrarte, te guiaremos al pago seguro con Stripe.
                  </p>
                )}

                {/* Error general */}
                {errors.general && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                    {errors.general}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin material-symbols-outlined">sync</span>
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    'Crear Cuenta'
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-[#9da8b9] mt-6">
                ¿Ya tenés cuenta? <Link to="/login" className="text-primary font-bold hover:underline">Iniciar Sesión</Link>
              </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
