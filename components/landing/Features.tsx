import React from 'react';

const features = [
  {
    icon: 'verified',
    title: 'Flujo de Aprobación',
    desc: 'Tu cliente revisa, aprueba o pide cambios con un clic. Sin emails infinitos, sin audios de WhatsApp, sin capturas de pantalla.',
  },
  {
    icon: 'calendar_month',
    title: 'Calendario Visual',
    desc: 'Organizá todo el contenido del mes en un calendario visual. Tu cliente ve exactamente qué se publica, cuándo y en qué red social.',
  },
  {
    icon: 'palette',
    title: 'Portal con Tu Marca',
    desc: 'Tu cliente accede a un portal con tu logo y tus colores. Ve tu marca, no la nuestra. El diferencial que tu agencia necesita.',
  },
  {
    icon: 'chat',
    title: 'Feedback Centralizado',
    desc: 'Cada publicación tiene su propio hilo de conversación. No más buscar comentarios entre chats y emails.',
  },
  {
    icon: 'group',
    title: 'Multi-Cliente',
    desc: 'Gestioná todos tus clientes desde un solo dashboard. Cada uno con su calendario, sus publicaciones y su portal independiente.',
  },
  {
    icon: 'smartphone',
    title: 'Mobile First',
    desc: 'Tu cliente puede revisar y aprobar contenido desde el celular, en cualquier momento y lugar.',
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-32 px-6 bg-[#0a0f16]">
      <div className="max-w-7xl mx-auto text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Todo lo que tu agencia necesita</h2>
        <p className="text-[#9da8b9] max-w-2xl mx-auto">Dejá de usar 5 herramientas distintas. SocialFlow centraliza el envío, revisión y aprobación de contenido en un solo lugar.</p>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="p-8 rounded-2xl bg-surface-dark border border-border-dark hover:border-primary/50 transition-all group">
            <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl">{f.icon}</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">{f.title}</h3>
            <p className="text-[#9da8b9] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
