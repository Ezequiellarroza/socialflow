// =====================================================
// SOCIALFLOW - Cliente Aprobaciones Page
// =====================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClienteSidebar from '../../components/ClienteSidebar';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { publicacionesService, PublicacionAPI } from '../../services/publicaciones';

// =====================================================
// COMPONENTE: VISTA DE DETALLE (REVIEW)
// =====================================================
interface ReviewDetailProps {
  pub: PublicacionAPI;
  onBack: () => void;
  onAction: (id: number, accion: 'aprobado' | 'modificar' | 'rechazado', comentario: string) => void;
  isSubmitting: boolean;
}

const ReviewDetail: React.FC<ReviewDetailProps> = ({ pub, onBack, onAction, isSubmitting }) => {
  const [comentario, setComentario] = useState('');
  const { user } = useAuth();
  const { branding } = useBranding();
  const { slug } = useParams<{ slug: string }>();

  const primaryColor = branding.colores.primary;

  const fechaFormateada = new Date(pub.fecha_programada).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  });

  const getEstadoBadge = () => {
    switch (pub.estado) {
      case 'pendiente':
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-500', label: 'PENDIENTE DE REVISIÓN' };
      case 'aprobado':
        return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-500', label: 'APROBADO' };
      case 'modificar':
        return { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-500', label: 'CAMBIOS SOLICITADOS' };
      case 'rechazado':
        return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-500', label: 'RECHAZADO' };
      default:
        return { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-500', label: pub.estado.toUpperCase() };
    }
  };

  const estadoBadge = getEstadoBadge();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0e14] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#0b0e14] border-b border-white/5">
        <div className="flex items-center gap-3">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt={branding.nombre} className="h-8 w-auto object-contain" />
          ) : (
            <div 
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="material-symbols-outlined text-white text-lg">layers</span>
            </div>
          )}
          <span className="text-lg font-bold tracking-tight">{branding.nombre}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">calendar_today</span>
            Volver al Calendario
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-none">{user?.nombre || 'Usuario'}</p>
            </div>
            <div className="size-10 rounded-full bg-orange-200 border-2 border-slate-800 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=ffedd5&color=c2410c`} alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-350 mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLUMNA IZQUIERDA: Mockup iPhone */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest">PREVISUALIZACIÓN MÓVIL</h2>
              <div className="flex gap-2">
                <button className="text-slate-500 hover:text-white p-1">
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                </button>
                <button className="p-1" style={{ color: primaryColor }}>
                  <span className="material-symbols-outlined text-xl">smartphone</span>
                </button>
              </div>
            </div>

            {/* Mockup iPhone */}
            <div className="relative mx-auto w-full max-w-85 bg-black rounded-[3rem] border-10 border-[#1e232d] shadow-2xl overflow-hidden ring-1 ring-white/10">
              {/* Status Bar */}
              <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[11px] font-semibold">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                  <span className="material-symbols-outlined text-[14px]">wifi</span>
                  <span className="material-symbols-outlined text-[14px]">battery_full</span>
                </div>
              </div>
              
              {/* Instagram Header */}
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-2xl">favorite</span>
                  <span className="material-symbols-outlined text-2xl">send</span>
                </div>
              </div>

              {/* Post Header */}
              <div className="flex items-center gap-3 px-4 py-2">
                <div 
                  className="size-8 rounded-full border-2"
                  style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}20` }}
                ></div>
                <div className="flex flex-col flex-1">
                  <span className="text-[12px] font-bold">marca_cliente</span>
                  <span className="text-[10px] text-slate-400">{pub.titulo || 'Publicación'}</span>
                </div>
                <span className="material-symbols-outlined text-lg">more_horiz</span>
              </div>

              {/* Imagen del Post */}
              <div className="aspect-square w-full bg-[#111] overflow-hidden">
                {pub.media_url ? (
                  <img src={pub.media_url} className="w-full h-full object-cover" alt="Post" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <span className="material-symbols-outlined text-6xl">image</span>
                  </div>
                )}
              </div>

              {/* Acciones del Post */}
              <div className="p-4">
                <div className="flex justify-between mb-3">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-2xl">favorite</span>
                    <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                    <span className="material-symbols-outlined text-2xl">send</span>
                  </div>
                  <span className="material-symbols-outlined text-2xl">bookmark</span>
                </div>
                <p className="text-[12px] font-bold mb-2">1,243 Me gusta</p>
                <p className="text-[12px] leading-relaxed">
                  <span className="font-bold mr-1">marca_cliente</span>
                  {pub.copy || 'Sin descripción'}
                </p>
              </div>

              {/* Bottom Navigation */}
              <div className="flex justify-around py-3 border-t border-white/10">
                <span className="material-symbols-outlined text-2xl">home</span>
                <span className="material-symbols-outlined text-2xl">search</span>
                <span className="material-symbols-outlined text-2xl">add_box</span>
                <span className="material-symbols-outlined text-2xl">movie</span>
                <div className="size-6 rounded-full bg-slate-600"></div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Info y Feedback */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            {/* Título y Estado */}
            <div>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <h2 className="text-3xl font-black capitalize">Post: {fechaFormateada}</h2>
                <span className={`px-3 py-1 ${estadoBadge.bg} border ${estadoBadge.border} ${estadoBadge.text} text-[10px] font-black uppercase tracking-widest rounded-full`}>
                  {estadoBadge.label}
                </span>
                <span className="ml-auto text-slate-500 text-sm font-medium">Versión {pub.version || 1}.0</span>
              </div>
              <div className="flex gap-4 text-slate-400 text-sm flex-wrap">
                <p>Campaña: <span className="text-white">{pub.titulo || 'Sin título'}</span></p>
                <span>•</span>
                <p>Canal: <span className="text-white capitalize">{pub.red_social} {pub.tipo_contenido}</span></p>
              </div>
            </div>

            {/* Card de Comentarios */}
            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined" style={{ color: primaryColor }}>chat</span>
                <h3 className="text-lg font-bold">Comentarios y Feedback</h3>
              </div>
              <p className="text-slate-400 text-sm mb-4">Por favor deja tus observaciones. Si solicitas cambios, este campo es obligatorio.</p>
              
              <div className="relative">
                <textarea 
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe aquí tus comentarios sobre la imagen, el copy o los hashtags..."
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl p-4 text-sm min-h-37.5 focus:outline-none focus:border-opacity-50 transition-all resize-none"
                  style={{ 
                    focusBorderColor: primaryColor 
                  }}
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <span className="absolute bottom-3 right-4 text-[10px] text-slate-600">Markdown soportado</span>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
                <button 
                  onClick={() => onAction(pub.id, 'rechazado', comentario)}
                  disabled={isSubmitting}
                  className="text-slate-500 hover:text-red-400 flex items-center gap-2 text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                  Rechazar Post
                </button>

                <div className="flex gap-3">
                  <button 
                    onClick={() => onAction(pub.id, 'modificar', comentario)}
                    disabled={isSubmitting || !comentario.trim()}
                    className="px-6 h-11 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                    Pedir Modificaciones
                  </button>
                  <button 
                    onClick={() => onAction(pub.id, 'aprobado', comentario)}
                    disabled={isSubmitting}
                    className="px-6 h-11 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                    style={{ 
                      backgroundColor: primaryColor,
                      boxShadow: `0 10px 30px -10px ${primaryColor}50`
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Aprobar Contenido
                  </button>
                </div>
              </div>
            </div>

            {/* Historial de Actividad */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold">Historial de Actividad</h3>
              <div className="space-y-4 relative pl-4">
                <div className="absolute left-1.75 top-2 bottom-2 w-px bg-white/10"></div>
                
                <div className="flex gap-4 relative">
                  <div 
                    className="size-2.5 rounded-full ring-4 z-10 mt-1.5"
                    style={{ backgroundColor: primaryColor, ringColor: `${primaryColor}30` }}
                  ></div>
                  <div>
                    <p className="text-sm font-bold">Post creado por Equipo Creativo</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {new Date(pub.created_at).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {pub.updated_at !== pub.created_at && (
                  <div className="flex gap-4 relative opacity-60">
                    <div className="size-2.5 rounded-full bg-slate-600 z-10 mt-1.5"></div>
                    <div>
                      <p className="text-sm font-bold">Última actualización</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {new Date(pub.updated_at).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
      // TODO: Guardar comentario con servicio de feedback cuando esté listo
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
      <ClienteSidebar />
      
      <main className="flex-1 ml-64 p-10">
        {/* Header */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Aprobaciones</h1>
            <p className="text-slate-400 font-medium">Contenido listo para tu revisión final.</p>
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
                    <img 
                      src={pub.media_url} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                      alt={pub.titulo || 'Publicación'} 
                    />
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