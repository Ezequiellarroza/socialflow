
import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Básico',
      price: '29',
      desc: 'Ideal para freelancers y agencias pequeñas empezando.',
      features: ['Hasta 3 Clientes', 'Calendario Editorial', 'IA Copywriting Básica', 'Soporte por Email'],
      cta: 'Empezar Gratis',
      popular: false
    },
    {
      name: 'Profesional',
      price: '79',
      desc: 'Nuestra solución completa para agencias en crecimiento.',
      features: ['Clientes Ilimitados', 'Aprobaciones con Cliente', 'IA Gemini Pro Full', 'Estadísticas Avanzadas', 'Soporte 24/7'],
      cta: 'Suscribirse Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '199',
      desc: 'Para grandes corporativos con múltiples equipos.',
      features: ['White-label (Tu Marca)', 'API de IA Personalizada', 'Account Manager', 'Contratos Personalizados'],
      cta: 'Contactar Ventas',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-background-dark text-white py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Planes que crecen contigo</h1>
          <p className="text-[#9da8b9] max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu agencia. Puedes cambiar de plan en cualquier momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {plans.map((plan, i) => (
            <div key={i} className={`flex flex-col p-8 rounded-[2rem] bg-surface-dark border transition-all ${plan.popular ? 'border-primary shadow-[0_0_40px_rgba(19,109,236,0.2)] relative scale-105 z-10' : 'border-border-dark'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Más Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-[#9da8b9] text-sm mb-8">{plan.desc}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">${plan.price}</span>
                <span className="text-[#9da8b9] text-sm">/mes</span>
              </div>

              <div className="flex flex-col gap-4 mb-12 flex-1">
                {plan.features.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    <span className="text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <Link 
                to="/checkout" 
                state={{ planName: plan.name, price: plan.price }}
                className={`w-full py-4 rounded-xl font-bold text-center transition-all ${plan.popular ? 'bg-primary hover:bg-blue-600 shadow-lg shadow-primary/20' : 'bg-white text-black hover:bg-slate-200'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <Link to="/" className="text-[#9da8b9] hover:text-white transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">arrow_back</span> Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
