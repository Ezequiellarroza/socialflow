import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.webp';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-dark">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo y descripción */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="SocialFlow" className="size-9" />
              <span className="text-lg font-bold tracking-tight text-white">Social<span className="text-primary">Flow</span></span>
            </div>
            <p className="text-[#9da8b9] text-sm leading-relaxed max-w-md">
              La plataforma para agencias y community managers que quieren simplificar el envío y aprobación de contenido para redes sociales.
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Producto</h4>
            <div className="flex flex-col gap-3">
              <a href="#features" className="text-[#9da8b9] text-sm hover:text-white transition-colors">Características</a>
              <a href="#como-funciona" className="text-[#9da8b9] text-sm hover:text-white transition-colors">Cómo Funciona</a>
              <Link to="/pricing" className="text-[#9da8b9] text-sm hover:text-white transition-colors">Precios</Link>
            </div>
          </div>

          {/* Cuenta */}
          <div>
            <h4 className="text-white text-sm font-bold mb-4">Cuenta</h4>
            <div className="flex flex-col gap-3">
              <Link to="/login" className="text-[#9da8b9] text-sm hover:text-white transition-colors">Iniciar Sesión</Link>
              <Link to="/pricing" className="text-[#9da8b9] text-sm hover:text-white transition-colors">Crear Cuenta</Link>
              <a href="mailto:soporte@socialflow.com.ar" className="text-[#9da8b9] text-sm hover:text-white transition-colors">Soporte</a>
            </div>
          </div>
        </div>

        {/* Línea divisoria y copyright */}
        <div className="border-t border-border-dark mt-12 pt-8 text-center">
          <p className="text-[#9da8b9] text-sm">© 2025 SocialFlow. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
