
import React, { useState } from 'react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('perfil');

  const tabs = [
    { id: 'perfil', label: 'Perfil de Agencia', icon: 'storefront' },
    { id: 'equipo', label: 'Equipo', icon: 'groups' },
    { id: 'facturacion', label: 'Facturación', icon: 'credit_card' },
    { id: 'integraciones', label: 'Integraciones', icon: 'hub' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Configuración</h2>
        <p className="text-[#9da8b9] text-sm">Personaliza tu espacio de trabajo y gestiona tu suscripción.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs */}
        <aside className="lg:w-64 shrink-0 flex flex-col gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${
                activeTab === tab.id 
                ? 'bg-primary/10 border border-primary/20 text-primary' 
                : 'text-[#9da8b9] hover:bg-surface-dark hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="flex-1 bg-surface-dark border border-border-dark rounded-2xl p-8">
          {activeTab === 'perfil' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex flex-col gap-6">
                <h3 className="text-white text-xl font-bold">Información General</h3>
                <div className="flex items-center gap-6">
                  <div className="size-24 rounded-2xl bg-[#111418] border border-border-dark flex items-center justify-center relative group cursor-pointer">
                    <span className="material-symbols-outlined text-4xl text-[#9da8b9]">photo_camera</span>
                    <div className="absolute inset-0 bg-primary/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-bold">Cambiar</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-white font-bold text-lg">SocialFlow</p>
                    <p className="text-[#9da8b9] text-xs">Tamaño: 5-10 empleados • Creado Oct 2023</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Nombre de la Agencia</label>
                    <input className="h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white text-sm focus:ring-primary" defaultValue="SocialFlow" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Email Principal</label>
                    <input className="h-12 bg-[#111418] border border-border-dark rounded-xl px-4 text-white text-sm focus:ring-primary" defaultValue="contacto@agenciacreative.com" />
                  </div>
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Biografía Corta</label>
                    <textarea className="bg-[#111418] border border-border-dark rounded-xl p-4 text-white text-sm focus:ring-primary h-32 resize-none" defaultValue="Ayudamos a marcas innovadoras a destacar en el mundo digital con estrategias de contenido potenciadas por IA y creatividad humana." />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-border-dark">
                <button className="px-8 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                  Guardar Cambios
                </button>
              </div>
            </div>
          )}

          {activeTab === 'equipo' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-xl font-bold">Miembros del Equipo</h3>
                <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-bold hover:bg-primary/20 transition-all">
                  Invitar Miembro
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Ana Garcia', role: 'Owner', email: 'ana@agencia.com', img: 'https://i.pravatar.cc/150?u=1' },
                  { name: 'Marcos Rivas', role: 'Copywriter', email: 'marcos@agencia.com', img: 'https://i.pravatar.cc/150?u=2' },
                  { name: 'Carla Soto', role: 'Social Media Manager', email: 'carla@agencia.com', img: 'https://i.pravatar.cc/150?u=3' },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#111418] border border-border-dark rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={member.img} className="size-10 rounded-full" alt="" />
                      <div>
                        <p className="text-white font-bold text-sm">{member.name}</p>
                        <p className="text-[#9da8b9] text-xs">{member.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-surface-dark border border-border-dark rounded-lg text-[#9da8b9] text-[10px] font-bold uppercase">
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'facturacion' && (
            <div className="flex flex-col gap-8 animate-fade-in">
              <h3 className="text-white text-xl font-bold">Plan Actual</h3>
              <div className="p-6 bg-linear-to-br from-primary/10 to-indigo-500/10 border border-primary/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h4 className="text-white text-2xl font-black mb-1">Plan Profesional</h4>
                   <p className="text-[#9da8b9] text-sm">Facturado mensualmente ($79.00 USD)</p>
                   <p className="text-emerald-500 text-xs font-bold mt-2">Siguiente cobro: 15 de Nov, 2023</p>
                </div>
                <button className="px-6 py-3 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition-all">
                   Mejorar Plan
                </button>
              </div>

              <div>
                <h4 className="text-white font-bold mb-4">Método de Pago</h4>
                <div className="flex items-center justify-between p-4 bg-[#111418] border border-border-dark rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className="size-10 bg-slate-800 rounded flex items-center justify-center font-bold text-xs">VISA</div>
                      <div>
                         <p className="text-white text-sm font-bold">Visa terminada en 4242</p>
                         <p className="text-[#9da8b9] text-xs">Expira 12/26</p>
                      </div>
                   </div>
                   <button className="text-primary text-sm font-bold hover:underline">Editar</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integraciones' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <h3 className="text-white text-xl font-bold">Conectar Cuentas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Instagram', icon: 'photo_camera', status: 'connected' },
                  { name: 'TikTok', icon: 'video_library', status: 'not_connected' },
                  { name: 'LinkedIn', icon: 'work', status: 'connected' },
                  { name: 'Facebook', icon: 'groups', status: 'not_connected' },
                ].map((platform, i) => (
                  <div key={i} className="p-4 bg-[#111418] border border-border-dark rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#9da8b9]">{platform.icon}</span>
                      <span className="text-white font-bold text-sm">{platform.name}</span>
                    </div>
                    <button className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                      platform.status === 'connected' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-primary border-primary/20 bg-primary/10'
                    }`}>
                      {platform.status === 'connected' ? 'Conectado' : 'Conectar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
