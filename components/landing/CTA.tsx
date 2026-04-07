import React from 'react';
import { Link } from 'react-router-dom';

const CTA: React.FC = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-indigo-600 p-12 md:p-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight text-white">
          ¿Listo para dejar de perseguir <br /> aprobaciones?
        </h2>
        <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
          Probá SocialFlow gratis y descubrí cómo simplificar el flujo de trabajo con tus clientes.
        </p>
        <Link to="/pricing" className="inline-block px-12 py-5 bg-white text-primary rounded-2xl text-xl font-bold hover:bg-slate-100 transition-all shadow-2xl">
          Comenzar Gratis
        </Link>
      </div>
    </section>
  );
};

export default CTA;
