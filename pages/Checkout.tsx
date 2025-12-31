
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const planInfo = location.state || { planName: 'Profesional', price: '79' };

  const handleNext = () => setStep(step + 1);
  const handleComplete = () => {
    onComplete();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background-dark text-white flex items-center justify-center p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        
        {/* Lado izquierdo: Info del Plan */}
        <div className="flex flex-col gap-8 bg-surface-dark p-8 rounded-3xl border border-border-dark">
          <h2 className="text-2xl font-bold">Resumen de tu suscripción</h2>
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
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? 'bg-primary' : 'bg-border-dark'}`}></div>
            ))}
          </div>

          {step === 1 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3 className="text-3xl font-bold">Datos de tu Agencia</h3>
              <div className="flex flex-col gap-4">
                <input className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary" placeholder="Nombre de la Agencia" />
                <input className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary" placeholder="Email Corporativo" />
                <input className="w-full h-14 bg-surface-dark border border-border-dark rounded-xl px-4 focus:ring-primary focus:border-primary" placeholder="Sitio Web (Opcional)" />
              </div>
              <button onClick={handleNext} className="h-14 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-all">Siguiente Paso</button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3 className="text-3xl font-bold">Método de Pago</h3>
              <div className="p-6 bg-surface-dark border border-primary/50 rounded-2xl flex flex-col gap-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#9da8b9] uppercase">Tarjeta de Crédito</span>
                  <div className="flex gap-2">
                     <div className="w-8 h-5 bg-slate-700 rounded-sm"></div>
                     <div className="w-8 h-5 bg-slate-600 rounded-sm"></div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <input className="w-full h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" placeholder="Número de Tarjeta" defaultValue="4242 4242 4242 4242" />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" placeholder="MM/YY" />
                    <input className="h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" placeholder="CVV" />
                  </div>
                  <input className="w-full h-12 bg-[#111418] border border-border-dark rounded-lg px-4 text-sm" placeholder="Nombre en la Tarjeta" />
                </div>
              </div>
              <button onClick={handleNext} className="h-14 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-all">Pagar Ahora</button>
              <button onClick={() => setStep(1)} className="text-sm text-[#9da8b9] hover:text-white transition-colors">Volver</button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-8 text-center py-10 animate-fade-in">
              <div className="size-24 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-6xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">¡Pago Exitoso!</h3>
                <p className="text-[#9da8b9]">Tu suscripción {planInfo.planName} está activa. Tu factura ha sido enviada a tu email.</p>
              </div>
              <button onClick={handleComplete} className="h-14 bg-primary rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                Ir al Dashboard <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
