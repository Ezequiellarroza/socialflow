import React from 'react';
import logo from '../../assets/logo.webp';

const WhiteLabel: React.FC = () => {
  return (
    <section className="py-32 px-6 bg-[#0a0f16]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Texto */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark border border-border-dark mb-6">
              <span className="material-symbols-outlined text-primary text-sm">star</span>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Diferenciador clave</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Tu marca, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">no la nuestra</span>
            </h2>
            <p className="text-[#9da8b9] text-lg leading-relaxed mb-8">
              Cada cliente accede a un portal personalizado con el logo y los colores de tu agencia. Tu cliente nunca ve "SocialFlow" — ve tu marca, tu identidad, tu profesionalismo.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: 'palette', text: 'Colores personalizados por agencia' },
                { icon: 'image', text: 'Tu logo en el portal del cliente' },
                { icon: 'link', text: 'URL única para cada agencia' },
                { icon: 'visibility_off', text: 'SocialFlow es invisible para tu cliente' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                  </div>
                  <span className="text-white text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview visual */}
          <div className="relative">
            {/* Browser mockup */}
            <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden shadow-[0_0_80px_rgba(19,109,236,0.1)]">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border-dark bg-[#111418]">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-500/60"></div>
                  <div className="size-3 rounded-full bg-yellow-500/60"></div>
                  <div className="size-3 rounded-full bg-green-500/60"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background-dark rounded-lg px-3 py-1.5 text-xs text-[#9da8b9] text-center">
                    tuagencia.socialflow.com.ar
                  </div>
                </div>
              </div>
              {/* Portal preview */}
              <div className="p-6">
                {/* Header del portal simulado */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-dark">
                  <div className="size-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    TA
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Tu Agencia</p>
                    <p className="text-[#9da8b9] text-xs">Portal de contenido</p>
                  </div>
                </div>
                {/* Cards simuladas */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-background-dark border border-border-dark text-center">
                    <p className="text-emerald-400 text-lg font-bold">12</p>
                    <p className="text-[#9da8b9] text-[10px]">Publicaciones</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background-dark border border-border-dark text-center">
                    <p className="text-emerald-400 text-lg font-bold">8</p>
                    <p className="text-[#9da8b9] text-[10px]">Aprobadas</p>
                  </div>
                  <div className="p-3 rounded-xl bg-background-dark border border-border-dark text-center">
                    <p className="text-emerald-400 text-lg font-bold">4</p>
                    <p className="text-[#9da8b9] text-[10px]">Pendientes</p>
                  </div>
                </div>
                {/* Post simulado */}
                <div className="p-4 rounded-xl bg-background-dark border border-border-dark">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-pink-400 text-lg">photo_camera</span>
                      <span className="text-white text-xs font-medium">Instagram — Imagen</span>
                    </div>
                    <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Pendiente</span>
                  </div>
                  <p className="text-[#9da8b9] text-xs leading-relaxed">☕ ¡Arrancamos la semana con la mejor energía! Visitanos y...</p>
                  <div className="flex gap-2 mt-3">
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Aprobar</div>
                    <div className="px-3 py-1.5 rounded-lg bg-surface-dark text-[#9da8b9] text-[10px] font-bold border border-border-dark">Pedir cambios</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badge flotante */}
            <div className="absolute -bottom-4 -right-4 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl shadow-primary/30">
              100% tu marca ✨
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhiteLabel;
