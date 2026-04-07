import React from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-start px-4 overflow-hidden"
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
      {/* Content */}
      <div className="max-w-[900px] w-full text-center z-10 space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Chau aprobaciones por WhatsApp
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
          Enviá contenido, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">
            recibí aprobaciones
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          La plataforma para agencias y community managers que quieren dejar de perseguir aprobaciones. Calendario visual, portal con tu marca y feedback centralizado en un solo lugar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/pricing" className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(19,109,236,0.3)] hover:scale-105 transition-all text-lg">
            Comenzar Gratis
          </Link>
        </div>
      </div>

      {/* 3D Glassmorphism Mockup */}
      <div className="relative w-full max-w-5xl mt-20" style={{ perspective: '2000px' }}>
        <div
          className="transition-all duration-700 rounded-2xl p-4 md:p-8 shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'float 6s ease-in-out infinite',
          }}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
            <div className="flex items-center gap-4 text-white/40">
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              <span className="text-sm font-medium">Febrero 2026</span>
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </div>
            <div className="w-10"></div>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - Aprobado */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
              <div className="h-40 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-6xl text-white/20">photo_camera</span>
                <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded uppercase">
                  Aprobado
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white text-sm font-bold">Promo Verano ☀️</p>
                <p className="text-slate-400 text-xs">Instagram — Imagen</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-emerald-400 text-xs font-bold">✓ Cliente aprobó</span>
                <span className="material-symbols-outlined text-white/30 text-sm">chat_bubble</span>
              </div>
            </div>

            {/* Card 2 - Pendiente (destacada) */}
            <div className="bg-white/10 rounded-xl p-4 border border-primary/30 space-y-4">
              <div className="h-40 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-6xl text-white/20">videocam</span>
                <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-black rounded uppercase">
                  Pendiente
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white text-sm font-bold">Reel Producto Nuevo</p>
                <p className="text-slate-400 text-xs">Instagram — Reel</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg border border-primary/20">
                  Aprobar
                </button>
                <button className="flex-1 py-2 bg-white/5 text-white/70 text-xs font-bold rounded-lg">
                  Pedir cambios
                </button>
              </div>
            </div>

            {/* Card 3 - Modificar */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-4">
              <div className="h-40 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-6xl text-white/20">view_carousel</span>
                <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] font-black rounded uppercase">
                  Cambios
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white text-sm font-bold">Carrusel Ofertas</p>
                <p className="text-slate-400 text-xs">Facebook — Carrusel</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-orange-400 text-xs font-bold">💬 "Cambiar el copy"</span>
                <span className="material-symbols-outlined text-white/30 text-sm">edit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Badge - Aprobado */}
        <div
          className="absolute -top-10 -right-10 p-4 rounded-2xl hidden lg:flex items-center gap-3 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'float 6s ease-in-out infinite',
          }}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p className="text-xs text-white/50 font-medium">Post de Instagram</p>
            <p className="text-sm text-white font-bold">¡Aprobado!</p>
          </div>
        </div>

        {/* Floating Badge - Comentario */}
        <div
          className="absolute top-1/2 -left-20 p-4 rounded-2xl hidden lg:flex items-center gap-3 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">mode_comment</span>
          </div>
          <div>
            <p className="text-xs text-white/50 font-medium">Café del Centro</p>
            <p className="text-sm text-white font-bold">Nuevo feedback</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
