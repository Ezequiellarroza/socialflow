// =====================================================
// SOCIALFLOW - Cliente Aprobaciones Page
// =====================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClienteSidebar from '../../components/ClienteSidebar';
import ReviewDetail from '../../components/ReviewDetail';
import { useBranding } from '../../context/BrandingContext';
import { publicacionesService, PublicacionAPI } from '../../services/publicaciones';
import { feedbackService } from '../../services/feedback';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================
const ClienteAprobaciones: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<PublicacionAPI[]>([]);
  const [filtro, setFiltro] = useState<'pendiente' | 'todas'>('pendiente');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPub, setSelectedPub] = useState<PublicacionAPI | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { branding } = useBranding();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const primaryColor = branding.colores.primary;

  useEffect(() => {
    loadPublicaciones();
  }, [filtro]);

  const loadPublicaciones = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = filtro === 'pendiente' ? { estado: 'pendiente' as const } : {};
      const data = await publicacionesService.getAll(params);
      setPublicaciones(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar publicaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, nuevoEstado: 'aprobado' | 'modificar' | 'rechazado', comentario: string) => {
    setIsSubmitting(true);
    try {
      await publicacionesService.update(id, { estado: nuevoEstado });
      // Registrar feedback (comentario + acción)
      const accionMap = { aprobado: 'aprobar', modificar: 'modificar', rechazado: 'rechazar' } as const;
      await feedbackService.create({
        publicacion_id: id,
        comentario: comentario.trim() || `Publicación ${nuevoEstado}`,
        accion: accionMap[nuevoEstado],
      });
      setSelectedPub(null);
      await loadPublicaciones();
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (slug) {
      navigate(`/portal/${slug}/dashboard`);
    } else {
      navigate('/cliente/dashboard');
    }
  };

  // Vista de detalle
  if (selectedPub) {
    return (
      <ReviewDetail 
        pub={selectedPub} 
        onBack={() => setSelectedPub(null)}
        onAction={handleUpdateStatus}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Vista de lista
  return (
    <div className="min-h-screen bg-[#0b0e14] flex">
      <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 p-4 md:p-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-10">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-white"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2 tracking-tight">Aprobaciones</h1>
              <p className="text-slate-400 font-medium text-sm md:text-base">Contenido listo para tu revision final.</p>
            </div>
          </div>
          <div className="flex bg-[#161b22] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setFiltro('pendiente')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                filtro === 'pendiente' 
                  ? 'text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
              style={filtro === 'pendiente' ? { backgroundColor: primaryColor } : {}}
            >
              Pendientes
            </button>
            <button 
              onClick={() => setFiltro('todas')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                filtro === 'todas' 
                  ? 'text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
              style={filtro === 'todas' ? { backgroundColor: primaryColor } : {}}
            >
              Historial
            </button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span 
              className="animate-spin material-symbols-outlined text-4xl"
              style={{ color: primaryColor }}
            >
              sync
            </span>
          </div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">inbox</span>
            <p className="text-slate-400">No hay publicaciones {filtro === 'pendiente' ? 'pendientes' : ''} para mostrar.</p>
          </div>
        ) : (
          /* Grid de Publicaciones */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {publicaciones.map(pub => (
              <div 
                key={pub.id}
                onClick={() => setSelectedPub(pub)}
                className="group bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden hover:border-opacity-50 transition-all cursor-pointer"
                style={{ '--hover-color': primaryColor } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = primaryColor}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
              >
                <div className="aspect-video w-full overflow-hidden bg-black">
                  {pub.media_url ? (
                    pub.media_type?.startsWith('video') ? (
                      <video src={pub.media_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" muted playsInline />
                    ) : (
                      <img
                        src={pub.media_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        alt={pub.titulo || 'Publicación'}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <span className="material-symbols-outlined text-5xl">image</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span 
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: primaryColor }}
                    >
                      {pub.red_social}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      pub.estado === 'pendiente' 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : pub.estado === 'aprobado'
                        ? 'bg-green-500/10 text-green-500'
                        : pub.estado === 'modificar'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {pub.estado}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 text-white/70 text-[10px] w-fit mb-2">
                    <span className="material-symbols-outlined text-[10px]">
                      {pub.tipo_contenido === 'carrusel' ? 'view_carousel' : pub.tipo_contenido === 'reel' ? 'play_circle' : pub.tipo_contenido === 'story' ? 'vertical_split' : pub.tipo_contenido === 'portada_reel' ? 'smart_display' : 'image'}
                    </span>
                    {pub.tipo_contenido}
                  </span>
                  <h3 className="text-white font-bold mb-2 line-clamp-1">{pub.titulo || 'Sin título'}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{pub.copy || 'Sin descripción'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClienteAprobaciones;