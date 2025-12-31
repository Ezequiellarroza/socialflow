
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background-dark/80 backdrop-blur-md border-b border-border-dark">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg size-10 flex items-center justify-center text-white font-bold">
              <span className="material-symbols-outlined">layers</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Agencia<span className="text-primary">Creative</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Características</a>
            <Link to="/pricing" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Precios</Link>
            <Link to="/login" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Iniciar Sesión</Link>
            <Link to="/pricing" className="bg-primary hover:bg-blue-600 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-primary/20">
              Prueba Gratuita
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full -z-10 opacity-30"></div>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark border border-border-dark mb-8 animate-fade-in">
            <span className="bg-primary size-2 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Nueva Función: Copywriting con IA</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
            Escala tu Agencia con <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">Inteligencia Creativa</span>
          </h1>
          <p className="text-xl text-[#9da8b9] max-w-3xl mx-auto mb-12 leading-relaxed">
            La plataforma todo-en-uno para gestionar clientes, calendarios editoriales y aprobaciones de contenido. Ahora potenciado con Gemini Pro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/pricing" className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-blue-600 rounded-xl text-lg font-bold transition-all shadow-xl shadow-primary/30">
              Ver Planes y Precios
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-surface-dark border border-border-dark hover:bg-border-dark rounded-xl text-lg font-bold transition-all">
              Demo Interactiva
            </Link>
          </div>
        </div>
        
        {/* Product Preview */}
        <div className="max-w-6xl mx-auto mt-24 rounded-2xl border border-border-dark overflow-hidden shadow-[0_0_100px_rgba(19,109,236,0.15)] bg-surface-dark">
          <img 
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3" 
            alt="Dashboard Preview" 
            className="w-full h-auto opacity-80"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-[#0a0f16]">
        <div className="max-w-7xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Diseñado para Agencias Modernas</h2>
          <p className="text-[#9da8b9]">Todo lo que necesitas para que tu equipo y clientes estén en sintonía.</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: 'auto_awesome', title: 'Copywriting con IA', desc: 'Genera captions, hashtags y estrategias de contenido en segundos con tecnología Gemini.' },
            { icon: 'calendar_month', title: 'Calendario Visual', desc: 'Organiza meses de contenido en una interfaz drag-and-drop intuitiva y rápida.' },
            { icon: 'verified', title: 'Flujo de Aprobación', desc: 'Tus clientes pueden aprobar o dar feedback con un solo clic, sin emails infinitos.' },
          ].map((f, i) => (
            <div key={i} className="p-8 rounded-2xl bg-surface-dark border border-border-dark hover:border-primary/50 transition-all group">
              <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">{f.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-[#9da8b9] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-primary to-indigo-600 p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">¿Listo para transformar <br /> tu flujo de trabajo?</h2>
          <Link to="/pricing" className="inline-block px-12 py-5 bg-white text-primary rounded-2xl text-xl font-bold hover:bg-slate-100 transition-all shadow-2xl">
            Comenzar Ahora
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-border-dark text-center">
        <p className="text-[#9da8b9] text-sm">© 2023 Agencia Creative Panel. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
