import React from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.webp';

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const agencyName = user?.nombre?.split(' ')[0] || 'SocialFlow';

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#111418] border-b border-border-dark">
      {/* Logo y nombre */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="SocialFlow" className="size-8 rounded-lg bg-primary p-1.5" />
        <span className="text-white font-bold text-lg">{agencyName}</span>
      </div>

      {/* Botón hamburger */}
      <button
        onClick={onMenuToggle}
        className="size-10 rounded-xl flex items-center justify-center text-[#9da8b9] hover:bg-surface-dark hover:text-white transition-all"
        aria-label="Abrir menú"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>
    </header>
  );
};

export default MobileHeader;