
import React, { useState } from 'react';
import { PostStatus, PostFormat } from '../types';

const ApprovalsPage: React.FC = () => {
  const [pendingItems, setPendingItems] = useState([
    {
      id: '1',
      client: 'TechStart',
      title: 'Post: Innovación en la Nube',
      date: 'Oct 15, 2023',
      format: PostFormat.IMAGE,
      content: 'Descubre cómo la IA está cambiando el panorama del B2B en 2024. No te pierdas nuestro último whitepaper.',
      image: 'https://picsum.photos/seed/tech1/600/600'
    },
    {
      id: '2',
      client: 'EcoVida',
      title: 'Reel: Tips de Sostenibilidad',
      date: 'Oct 16, 2023',
      format: PostFormat.VIDEO,
      content: '5 formas rápidas de reducir tu huella de carbono hoy mismo. 🌱 #Sostenibilidad #EcoFriendly',
      image: 'https://picsum.photos/seed/eco1/600/800'
    },
    {
      id: '3',
      client: 'CafeBar',
      title: 'Post: Especial de Temporada',
      date: 'Oct 17, 2023',
      format: PostFormat.IMAGE,
      content: '¡El Pumpkin Spice Latte ya está aquí! Ven y pruébalo en nuestra sucursal centro.',
      image: 'https://picsum.photos/seed/cafe1/600/600'
    }
  ]);

  const handleAction = (id: string, approved: boolean) => {
    setPendingItems(prev => prev.filter(item => item.id !== id));
    // En una app real esto dispararía un evento de API
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Cola de Aprobaciones</h2>
        <p className="text-[#9da8b9] text-sm">Contenido esperando revisión final de los clientes o coordinadores.</p>
      </div>

      {pendingItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-dark border border-dashed border-border-dark rounded-3xl">
          <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
             <span className="material-symbols-outlined text-4xl">task_alt</span>
          </div>
          <h3 className="text-white text-xl font-bold">¡Todo al día!</h3>
          <p className="text-[#9da8b9]">No hay contenidos pendientes de aprobación en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row bg-surface-dark border border-border-dark rounded-2xl overflow-hidden group">
              <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#111418]">
                <img src={item.image} alt="" className="absolute inset-0 size-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                  {item.format}
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary text-xs font-bold uppercase tracking-widest">{item.client}</span>
                    <span className="text-[#9da8b9] text-xs">{item.date}</span>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-3">{item.title}</h3>
                  <p className="text-[#9da8b9] text-sm line-clamp-3 leading-relaxed">
                    {item.content}
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-border-dark/50">
                  <button 
                    onClick={() => handleAction(item.id, true)}
                    className="flex-1 h-10 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Aprobar
                  </button>
                  <button 
                    onClick={() => handleAction(item.id, false)}
                    className="flex-1 h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span> Rechazar
                  </button>
                  <button className="size-10 bg-[#282f39] text-white rounded-xl flex items-center justify-center hover:bg-[#3b4554] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;
