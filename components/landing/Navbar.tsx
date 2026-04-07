import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.webp';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
    <nav className="fixed top-0 w-full z-50 bg-background-dark/80 backdrop-blur-md border-b border-border-dark">
      <div className="relative z-60 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="SocialFlow" className="size-10" />
          <span className="text-xl font-bold tracking-tight text-white">Social<span className="text-primary">Flow</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Características</a>
          <a href="#como-funciona" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Cómo Funciona</a>
          <Link to="/pricing" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Precios</Link>
          <Link to="/login" className="text-sm font-medium text-[#9da8b9] hover:text-white transition-colors">Iniciar Sesión</Link>
          <Link to="/pricing" className="bg-primary hover:bg-blue-600 px-5 py-2.5 rounded-full text-sm font-bold text-white transition-all shadow-lg shadow-primary/20">
            Comenzar Gratis
          </Link>
        </div>

        {/* Botón hamburguesa — solo mobile */}
        <button
          className="md:hidden relative w-8 h-8 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          aria-expanded={isOpen}
        >
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>
    </nav>

      {/* Backdrop - FUERA del nav */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Panel slide-in - FUERA del nav */}
      <div
        className={`fixed top-0 right-0 h-full w-4/5 max-w-sm z-50 bg-gray-900 border-l border-white/10 transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        style={{ backgroundColor: '#111827' }}
      >
        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-white"
          aria-label="Cerrar menú"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="flex flex-col h-full pt-24 px-8">
          <div className="flex flex-col gap-6">
            <a href="#features" onClick={closeMenu} className="text-lg font-medium text-[#9da8b9] hover:text-white transition-colors">Características</a>
            <a href="#como-funciona" onClick={closeMenu} className="text-lg font-medium text-[#9da8b9] hover:text-white transition-colors">Cómo Funciona</a>
            <Link to="/pricing" onClick={closeMenu} className="text-lg font-medium text-[#9da8b9] hover:text-white transition-colors">Precios</Link>
            <Link to="/login" onClick={closeMenu} className="text-lg font-medium text-[#9da8b9] hover:text-white transition-colors">Iniciar Sesión</Link>
          </div>
          <div className="mt-8">
            <Link to="/pricing" onClick={closeMenu} className="block text-center bg-primary hover:bg-blue-600 px-5 py-3 rounded-full text-sm font-bold text-white transition-all shadow-lg shadow-primary/20">
              Comenzar Gratis
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
