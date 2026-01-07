import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AgencyData {
  nombre_agencia: string;
  email: string;
  password: string;
  website?: string;
}

interface PaymentData {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardName: string;
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const planInfo = location.state || { planName: 'Profesional', price: '79' };

  // Form data
  const [agencyData, setAgencyData] = useState<AgencyData>({
    nombre_agencia: '',
    email: '',
    password: '',
    website: '',
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  });

  const handleAgencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgencyData({ ...agencyData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!agencyData.nombre_agencia.trim()) {
      setError('El nombre de la agencia es requerido');
      return false;
    }
    if (!agencyData.email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!agencyData.password || agencyData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implementar registro en el backend
      // Por ahora simulamos el registro y hacemos login
      // const response = await api.post('/auth/register.php', {
      //   ...agencyData,
      //   plan: planInfo.planName,
      // });

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Ir al paso de éxito
      setStep(3);

    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = async () => {
    setIsLoading(true);
    try {
      // Intentar login con las credenciales recién creadas
      await login({
        email: agencyData.email,
        password: agencyData.password,
        user_type: 'agencia',
      });
      navigate('/dashboard');
    } catch (err: any) {
      // Si falla el login automático, redirigir al login manual
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Lado izquierdo: Info del Plan */}
        <div className="flex flex-col gap-8 bg-surface-dark p-8 rounded-3xl border border-border-dark">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/pricing')}
              className="size-10 rounded-full bg-[#282f39] hover:bg-[#3b4554] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[#9da8b9]">arrow_back</span>
            </button>
            <h2 className="text-2xl font-bold">Resumen de tu suscripción</h2>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#111418] rounded-2xl">
            <div>
              <p className="text-xs text-[#9da8b9] uppercase font-bold tracking-widest">Plan Seleccionado</p>
              <h3 className="text-xl font-bold text-primary">{planInfo.planName}</h3>
            </div>
            <p className="text-2xl font-black">${planInfo.price}<span className="text-xs font-normal text-[#9da8b9]">/mes</span></p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#9da8b9]">Subtotal</span>
              <span>${planInfo.price}.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#9da8b9]">Impuestos (0%)</span>
              <span>$0.00</span>
            </div>
            <div className="h-px bg-border-dark my-2"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total a pagar</span>
              <span className="text-white">${planInfo.price}.00</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 border-t border-border-dark">
            <p className="text-xs text-[#9da8b9] uppercase font-bold tracking-widest">Incluye:</p>
            <ul className="flex flex-col gap-2">
              {['Clientes ilimitados', 'Calendario de contenido', 'Portal de aprobación', 'Soporte prioritario'].map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white">
                  <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-[#9da8b9] uppercase font-bold">
            <span className="material-symbols-outlined text-emerald-500 text-sm">verified_user</span>
            Transacción Segura y Encriptada
          </div>
        </div>

        {/* Lado derecho: Formulario */}
        <div className="flex flex-col gap-8">
          {/* Progress Indicator */}
          <div className="flex items-center gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-border-dark'}`}></div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Datos de Agencia */}
          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-3xl font-bold">Crea tu cuenta</h3>
                <p className="text-[#9da8b9] text-sm mt-1">Configura tu agencia en menos de 2 minutos</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">
                    Nombre de la Agencia *
                  </label>
                  <input 
                    name="nombre_agencia"
                    value={agencyData.nombre_agencia}
                    onChange={handleAgencyChange}
                    className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary transition-all" 
                    placeholder="Mi Agencia Digital"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">
                    Email Corporativo *
                  </label>
                  <input 
                    name="email"
                    type="email"
                    value={agencyData.email}
                    onChange={handleAgencyChange}
                    className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary transition-all" 
                    placeholder="contacto@miagencia.com"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">
                    Contraseña *
                  </label>
                  <input 
                    name="password"
                    type="password"
                    value={agencyData.password}
                    onChange={handleAgencyChange}
                    className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary transition-all" 
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">
                    Sitio Web <span className="text-[#9da8b9] font-normal">(opcional)</span>
                  </label>
                  <input 
                    name="website"
                    value={agencyData.website}
                    onChange={handleAgencyChange}
                    className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary transition-all" 
                    placeholder="https://miagencia.com"
                  />
                </div>
              </div>

              <button 
                onClick={handleNext} 
                className="h-14 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                Siguiente Paso
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}

          {/* Step 2: Método de Pago */}
          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-3xl font-bold">Método de Pago</h3>
                <p className="text-[#9da8b9] text-sm mt-1">Tu información está protegida</p>
              </div>

              <div className="p-6 bg-surface-dark border border-primary/50 rounded-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#9da8b9] uppercase">Tarjeta de Crédito / Débito</span>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-[8px] font-bold">VISA</div>
                    <div className="w-10 h-6 bg-gradient-to-r from-red-500 to-yellow-500 rounded flex items-center justify-center text-white text-[8px] font-bold">MC</div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <input 
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handlePaymentChange}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" 
                    placeholder="Número de Tarjeta"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      name="expiry"
                      value={paymentData.expiry}
                      onChange={handlePaymentChange}
                      className="h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" 
                      placeholder="MM/YY"
                    />
                    <input 
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handlePaymentChange}
                      className="h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" 
                      placeholder="CVV"
                    />
                  </div>
                  <input 
                    name="cardName"
                    value={paymentData.cardName}
                    onChange={handlePaymentChange}
                    className="w-full h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" 
                    placeholder="Nombre en la Tarjeta"
                  />
                </div>
              </div>

              <button 
                onClick={handleComplete}
                disabled={isLoading}
                className="h-14 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">lock</span>
                    Pagar ${planInfo.price}.00
                  </>
                )}
              </button>

              <button 
                onClick={handleBack}
                disabled={isLoading}
                className="text-sm text-[#9da8b9] hover:text-white transition-colors disabled:opacity-50"
              >
                ← Volver
              </button>
            </div>
          )}

          {/* Step 3: Éxito */}
          {step === 3 && (
            <div className="flex flex-col gap-8 text-center py-10 animate-fade-in">
              <div className="size-24 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-6xl">check_circle</span>
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-2">¡Bienvenido a Socialflow!</h3>
                <p className="text-[#9da8b9]">
                  Tu cuenta ha sido creada exitosamente. Tu suscripción al plan {planInfo.planName} está activa.
                </p>
              </div>

              <div className="bg-[#111418] rounded-xl p-4 text-left">
                <p className="text-xs text-[#9da8b9] uppercase tracking-wider mb-2">Tus credenciales</p>
                <p className="text-white text-sm"><strong>Email:</strong> {agencyData.email}</p>
                <p className="text-[#9da8b9] text-xs mt-1">Hemos enviado un email de confirmación</p>
              </div>

              <button 
                onClick={handleGoToDashboard}
                disabled={isLoading}
                className="h-14 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin material-symbols-outlined">sync</span>
                    Ingresando...
                  </>
                ) : (
                  <>
                    Ir al Dashboard 
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
