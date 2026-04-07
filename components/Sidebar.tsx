import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.webp';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { label: 'Clientes', icon: 'group', path: '/clients' },
    { label: 'Calendarios', icon: 'calendar_month', path: '/calendar' },
    { label: 'Aprobaciones', icon: 'check_circle', path: '/approvals', badge: (user?.pendientes_aprobacion || 0) + (user?.requieren_modificacion || 0) },
    { label: 'Configuración', icon: 'settings', path: '/settings' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const agencyName = user?.nombre?.split(' ')[0] || 'Agencia';
  const planName = user?.plan ? 'Plan ' + user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Plan Free';

  const planDescription = (() => {
    switch (user?.plan) {
      case 'starter': return 'Ideal para agencias en crecimiento.';
      case 'pro': return 'Acceso completo a todas las funciones.';
      case 'agencia': return 'Plan personalizado para tu agencia.';
      default: return 'Plan gratuito con funciones básicas.';
    }
  })();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const handleSupportClick = () => {
    window.open('mailto:soporte@socialflow.com.ar?subject=Soporte SocialFlow', '_blank');
    onClose?.();
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-72 flex-col border-r border-border-dark bg-[#111418] shrink-0 h-full overflow-y-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:flex
      `}>
        <div className="flex flex-col h-full justify-between p-4">
          <div className="flex flex-col gap-8">
            {/* Header con botón cerrar en mobile */}
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center px-2 py-2">
                <img src={logo} alt="SocialFlow" className="size-10 rounded-xl bg-primary p-1.5 shadow-lg shadow-primary/10" />
                <div className="flex flex-col">
                  <h1 className="text-white text-lg font-bold leading-none tracking-tight">
                    {agencyName}
                  </h1>
                  <p className="text-[#9da8b9] text-xs font-medium mt-1">
                    {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'editor' ? 'Editor' : 'Usuario'}
                  </p>
                </div>
              </div>
              
              {/* Botón cerrar - solo mobile */}
              <button
                onClick={onClose}
                className="lg:hidden size-9 rounded-xl flex items-center justify-center text-[#9da8b9] hover:bg-surface-dark hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Navegación */}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
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

              {/* Soporte */}
              <button
                onClick={handleSupportClick}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-[#9da8b9] hover:bg-surface-dark hover:text-white"
              >
                <span className="material-symbols-outlined text-[24px]">support_agent</span>
                <p className="text-sm font-medium">Soporte</p>
              </button>
            </nav>
          </div>

          {/* Footer del sidebar */}
          <div className="flex flex-col gap-4 border-t border-border-dark pt-6">
            {/* Info del plan */}
            <div className="p-4 rounded-xl bg-linear-to-br from-surface-dark to-[#111418] border border-border-dark">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">rocket_launch</span>
                </div>
                <span className="text-white text-sm font-bold">{planName}</span>
              </div>
              <p className="text-[#9da8b9] text-xs mb-3">{planDescription}</p>
              <Link 
                to="/settings?tab=facturacion"
                onClick={handleNavClick}
                className="w-full text-xs font-bold text-white bg-border-dark hover:bg-[#3b4554] py-2 rounded-lg transition-colors block text-center"
              >
                Administrar
              </Link>
            </div>

            {/* Perfil del usuario con logout */}
            {user && (
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                  {getInitials(user.nombre)}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{user.nombre}</p>
                  <p className="text-[#9da8b9] text-xs truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="size-9 rounded-xl flex items-center justify-center text-[#9da8b9] hover:bg-red-500/10 hover:text-red-500 transition-all"
                  title="Cerrar sesión"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;