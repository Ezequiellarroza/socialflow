
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'Clientes', icon: 'group', path: '/clients' },
    { label: 'Calendario', icon: 'calendar_month', path: '/calendar' },
    { label: 'Aprobaciones', icon: 'check_circle', path: '/approvals', badge: 3 },
    { label: 'Configuración', icon: 'settings', path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-border-dark bg-[#111418] shrink-0 h-full overflow-y-auto">
      <div className="flex flex-col h-full justify-between p-4">
        <div className="flex flex-col gap-8">
          <div className="flex gap-3 items-center px-2 py-2">
            <div className="bg-primary/20 rounded-xl size-10 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-2xl font-bold">layers</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none tracking-tight">Agencia</h1>
              <p className="text-[#9da8b9] text-xs font-medium mt-1">Marketing Pro</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                  location.pathname === item.path 
                  ? 'bg-primary/10 border border-primary/20 text-primary' 
                  : 'text-[#9da8b9] hover:bg-surface-dark hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${location.pathname === item.path ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                <p className={`text-sm ${location.pathname === item.path ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </p>
                {item.badge && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-border-dark pt-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-surface-dark to-[#111418] border border-border-dark">
            <div className="flex items-center gap-3 mb-2">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
              </div>
              <span className="text-white text-sm font-bold">Plan Pro</span>
            </div>
            <p className="text-[#9da8b9] text-xs mb-3">Tienes acceso a todas las funciones.</p>
            <button className="w-full text-xs font-bold text-white bg-[#282f39] hover:bg-[#3b4554] py-2 rounded-lg transition-colors">
              Administrar
            </button>
          </div>
          <Link to="/content/new" className="flex w-full items-center justify-center gap-2 rounded-xl h-11 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-all shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Crear Contenido</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
