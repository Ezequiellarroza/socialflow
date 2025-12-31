
import React from 'react';
import { Client } from '../types';

const Dashboard: React.FC = () => {
  const clients: Client[] = [
    { id: '1', name: 'TechStart', industry: 'SaaS B2B', logo: 'https://picsum.photos/seed/tech/100/100', status: 'pending', pendingPosts: 3 },
    { id: '2', name: 'EcoVida', industry: 'E-commerce', logo: 'https://picsum.photos/seed/eco/100/100', status: 'active', pendingPosts: 0 },
    { id: '3', name: 'CafeBar', industry: 'Restaurante', logo: 'https://picsum.photos/seed/cafe/100/100', status: 'urgent', pendingPosts: 1 },
  ];

  const stats = [
    { label: 'Contenidos por Aprobar', value: '12', trend: '+2%', icon: 'fact_check', color: 'text-primary' },
    { label: 'Clientes Activos', value: '8', trend: '+1', icon: 'groups', color: 'text-emerald-500' },
    { label: 'Publicaciones Hoy', value: '5', trend: 'Hoy', icon: 'send', color: 'text-blue-300' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Dashboard Principal</h2>
        <p className="text-[#9da8b9] text-sm">Bienvenido de nuevo, Agencia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl p-6 bg-[#1a1d23] border border-[#282f39] hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className={`absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <span className={`material-symbols-outlined text-6xl ${stat.color}`}>{stat.icon}</span>
            </div>
            <div>
              <p className="text-[#9da8b9] text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-white text-3xl font-bold tracking-tight">{stat.value}</h3>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <span className="bg-emerald-500/10 text-emerald-500 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                {stat.trend}
              </span>
              <span className="text-[#9da8b9] text-xs">actualizado hoy</span>
            </div>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold tracking-tight">Resumen de Clientes</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#282f39] text-white text-sm hover:bg-[#282f39] transition-colors">
              <span className="material-symbols-outlined text-base">filter_list</span> Filtrar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="flex flex-col bg-[#1a1d23] rounded-xl border border-[#282f39] overflow-hidden hover:shadow-xl hover:shadow-black/20 transition-all group">
              <div className="p-5 border-b border-[#282f39] flex justify-between items-start">
                <div className="flex gap-4">
                  <img src={client.logo} alt={client.name} className="size-12 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-white font-bold text-lg">{client.name}</h3>
                    <p className="text-[#9da8b9] text-sm">{client.industry}</p>
                  </div>
                </div>
                <button className="text-[#9da8b9] hover:text-white">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center bg-[#111418] p-3 rounded-lg border border-[#282f39]">
                  <span className="text-[#9da8b9] text-sm">Estado</span>
                  <span className={`flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded ${
                    client.status === 'urgent' ? 'text-red-500 bg-red-500/10' : 
                    client.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' : 'text-emerald-500 bg-emerald-500/10'
                  }`}>
                    <span className={`size-2 rounded-full ${
                      client.status === 'urgent' ? 'bg-red-500' : 
                      client.status === 'pending' ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}></span>
                    {client.status === 'urgent' ? 'Urgente' : client.status === 'pending' ? 'Pendiente' : 'Al día'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#9da8b9] font-medium uppercase tracking-wider">Próximas publicaciones</p>
                  <div className="flex gap-2">
                    {[1, 2].map(i => (
                      <div key={i} className="flex-1 h-14 bg-[#111418] rounded-lg border border-[#282f39] relative overflow-hidden group/post cursor-pointer">
                        <img src={`https://picsum.photos/seed/post${client.id}${i}/200/200`} className="absolute inset-0 object-cover opacity-40 group-hover/post:opacity-60 transition-opacity" alt="Post thumbnail" />
                        <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 rounded text-[10px] text-white backdrop-blur-sm">Oct {12+i}</div>
                      </div>
                    ))}
                    <div className="flex-1 h-14 bg-[#111418] rounded-lg border border-[#282f39] flex items-center justify-center text-[#9da8b9] text-xs font-medium cursor-pointer hover:bg-[#282f39] transition-colors">
                      +2
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 mt-auto">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#282f39] hover:bg-primary text-white text-sm font-bold transition-colors group/btn">
                  <span>Ver Calendario</span>
                  <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
          <button className="flex flex-col items-center justify-center min-h-[300px] bg-[#111418] rounded-xl border border-dashed border-[#3b4554] hover:border-primary/50 hover:bg-[#1a1d23] transition-all group">
            <div className="size-16 rounded-full bg-[#282f39] group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
              <span className="material-symbols-outlined text-3xl text-[#9da8b9] group-hover:text-primary transition-colors">add_business</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Añadir Nuevo Cliente</h3>
            <p className="text-[#9da8b9] text-sm max-w-[200px] text-center">Configura un nuevo espacio de trabajo.</p>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
