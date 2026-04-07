
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: null,
      priceLabel: 'Gratis',
      desc: 'Para empezar a organizar tu agencia sin costo.',
      features: ['1 Cliente', '1 Usuario de agencia', '10 Publicaciones/mes', 'Portal white-label', 'Calendario visual', 'Feedback y aprobaciones'],
      cta: 'Comenzar Gratis',
      href: '/register?plan=free',
      popular: false
    },
    {
      name: 'Starter',
      price: '8',
      priceLabel: null,
      desc: 'Ideal para freelancers y agencias pequeñas.',
      features: ['5 Clientes', '2 Usuarios de agencia', '50 Publicaciones/mes', '1 GB Almacenamiento', 'Portal white-label', 'Calendario visual', 'Feedback y aprobaciones'],
      cta: 'Empezar Ahora',
      href: '/register?plan=starter',
      popular: false
    },
    {
      name: 'Pro',
      price: '20',
      priceLabel: null,
      desc: 'La solución completa para agencias en crecimiento.',
      features: ['15 Clientes', '5 Usuarios de agencia', 'Publicaciones ilimitadas', '5 GB Almacenamiento', 'Portal white-label', 'Calendario visual', 'Feedback y aprobaciones', 'Soporte prioritario'],
      cta: 'Suscribirse Pro',
      href: '/register?plan=pro',
      popular: true
    },
    {
      name: 'Agencia',
      price: null,
      priceLabel: 'Personalizado',
      desc: 'Para agencias grandes con múltiples equipos.',
      features: ['Clientes ilimitados', 'Usuarios ilimitados', 'Publicaciones ilimitadas', 'Almacenamiento ilimitado', 'Todo lo de Pro', 'API access', 'Onboarding personalizado'],
      cta: 'Contactar Ventas',
      href: '#',
      popular: false
    }
  ];

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
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Planes que crecen contigo</h1>
          <p className="text-[#9da8b9] max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu agencia. Puedes cambiar de plan en cualquier momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          {plans.map((plan, i) => (
            <div key={i} className={`flex flex-col p-6 rounded-[2rem] bg-surface-dark border transition-all ${plan.popular ? 'border-primary shadow-[0_0_40px_rgba(19,109,236,0.2)] relative' : 'border-border-dark'}`}>
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                  Más Popular
                </span>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-[#9da8b9] text-sm mb-8">{plan.desc}</p>
              
              <div className="flex items-baseline gap-1 mb-8">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-black">${plan.price}</span>
                    <span className="text-[#9da8b9] text-sm">/mes</span>
                  </>
                ) : (
                  <span className="text-4xl font-black">{plan.priceLabel}</span>
                )}
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
                to={plan.href}
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
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
