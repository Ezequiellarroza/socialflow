// =====================================================
// SOCIALFLOW - Cliente Sidebar (con Marca Blanca)
// =====================================================

import React from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';

const ClienteSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const primaryColor = branding.colores.primary;

  // Rutas dinámicas según si es portal o legacy
  const basePath = slug ? `/portal/${slug}` : '/cliente';

  const handleLogout = async () => {
    await logout();
    if (slug) {
      navigate(`/portal/${slug}/login`);
    } else {
      navigate('/cliente/login');
    }
  };

  const navItems = [
    { to: `${basePath}/dashboard`, icon: 'calendar_month', label: 'Mi Contenido' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0d1117] border-r border-white/5 flex flex-col z-40">
      {/* Logo de la Agencia */}
      <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
        {branding.logo_url ? (
          <img 
            src={branding.logo_url} 
            alt={branding.nombre} 
            className="h-10 w-auto object-contain"
          />
        ) : (
          <div 
            className="rounded-xl size-10 flex items-center justify-center text-white font-bold shadow-lg"
            style={{ 
              backgroundColor: primaryColor,
              boxShadow: `0 4px 20px -4px ${primaryColor}40`
            }}
          >
            <span className="material-symbols-outlined">layers</span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm">{branding.nombre}</span>
          <span className="text-slate-500 text-xs truncate max-w-35">Portal Cliente</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
            style={({ isActive }) => 
              isActive 
                ? { backgroundColor: `${primaryColor}20`, color: primaryColor } 
                : {}
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-3">
          <div 
            className="size-9 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: `${primaryColor}30` }}
          >
            <span className="material-symbols-outlined text-lg" style={{ color: primaryColor }}>person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.nombre || 'Cliente'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default ClienteSidebar;