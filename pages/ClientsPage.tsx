
import React from 'react';
import { Client } from '../types';

const ClientsPage: React.FC = () => {
  const clients: Client[] = [
    { id: '1', name: 'TechStart', industry: 'SaaS B2B', logo: 'https://picsum.photos/seed/tech/100/100', status: 'pending', pendingPosts: 3 },
    { id: '2', name: 'EcoVida', industry: 'E-commerce', logo: 'https://picsum.photos/seed/eco/100/100', status: 'active', pendingPosts: 0 },
    { id: '3', name: 'CafeBar', industry: 'Restaurante', logo: 'https://picsum.photos/seed/cafe/100/100', status: 'urgent', pendingPosts: 1 },
    { id: '4', name: 'Apex Gym', industry: 'Fitness', logo: 'https://picsum.photos/seed/gym/100/100', status: 'active', pendingPosts: 5 },
    { id: '5', name: 'Z-Fashion', industry: 'Retail', logo: 'https://picsum.photos/seed/fashion/100/100', status: 'pending', pendingPosts: 2 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Mis Clientes</h2>
          <p className="text-[#9da8b9] text-sm">Gestiona el acceso y la configuración de cada cuenta.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined">add</span>
          Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-dark bg-[#111418]/50">
                <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Industria</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider text-center">Posts Pendientes</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-[#111418]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={client.logo} alt="" className="size-10 rounded-lg object-cover" />
                      <span className="text-white font-bold">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#9da8b9] text-sm">{client.industry}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      client.status === 'urgent' ? 'text-red-500 bg-red-500/10 border border-red-500/20' : 
                      client.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/20' : 
                      'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-white font-mono font-bold bg-[#111418] px-2 py-1 rounded border border-border-dark">
                      {client.pendingPosts}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-[#282f39] hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-[#282f39] hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[18px]">analytics</span>
                      </button>
                      <button className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-red-500/10 hover:text-red-500 transition-all">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
