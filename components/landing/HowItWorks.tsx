import React from 'react';

const steps = [
  {
    number: '01',
    icon: 'upload',
    title: 'Creá y enviá contenido',
    desc: 'Subí las publicaciones al calendario del cliente. Imágenes, videos, copies, hashtags — todo organizado por fecha y red social.',
  },
  {
    number: '02',
    icon: 'rate_review',
    title: 'Tu cliente revisa',
    desc: 'Tu cliente recibe acceso a su portal personalizado con tu marca. Revisa cada publicación y deja su feedback directamente en la plataforma.',
  },
  {
    number: '03',
    icon: 'rocket_launch',
    title: 'Aprobado y listo',
    desc: 'El cliente aprueba, pide cambios o rechaza. Vos recibís la respuesta al instante en tu dashboard. Sin idas y vueltas interminables.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="como-funciona" className="py-32 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/8 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Cómo funciona</h2>
          <p className="text-[#9da8b9] max-w-2xl mx-auto">Tres pasos simples para transformar la forma en que gestionás aprobaciones de contenido.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Línea conectora (solo desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/50 via-blue-400/50 to-indigo-400/50"></div>

          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              {/* Número con ícono */}
              <div className="relative mb-8">
                <div className="size-32 rounded-2xl bg-surface-dark border border-border-dark flex flex-col items-center justify-center gap-2 relative z-10">
                  <span className="text-primary text-xs font-bold uppercase tracking-widest">{step.number}</span>
                  <span className="material-symbols-outlined text-4xl text-primary">{step.icon}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
              <p className="text-[#9da8b9] leading-relaxed max-w-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
