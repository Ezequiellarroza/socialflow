// =====================================================
// SOCIALFLOW - Cliente Dashboard (con Grilla de Calendario)
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClienteSidebar from '../../components/ClienteSidebar';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { calendariosService, CalendarioAPI } from '../../services/calendarios';
import { publicacionesService, PublicacionAPI, EstadoPublicacion } from '../../services/publicaciones';

// =====================================================
// HELPERS
// =====================================================

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ICONOS_RED: Record<string, string> = {
  instagram: 'photo_camera',
  facebook: 'public',
  twitter: 'tag',
  linkedin: 'work',
  tiktok: 'play_circle'
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// =====================================================
// COMPONENTE: REVIEW DETAIL (Vista de aprobación)
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

  // Determinar si es formato vertical (story/reel) o cuadrado (post)
  const isVertical = pub.tipo_contenido === 'story' || pub.tipo_contenido === 'reel';

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
            <span className="material-symbols-outlined text-lg">arrow_back</span>
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
                <span 
                  className="material-symbols-outlined text-xl"
                  style={{ color: primaryColor }}
                >
                  {isVertical ? 'stay_current_portrait' : 'smartphone'}
                </span>
              </div>
            </div>

            {/* Mockup iPhone - Dinámico según tipo */}
            <div className={`relative mx-auto w-full ${isVertical ? 'max-w-70' : 'max-w-85'} bg-black rounded-[3rem] border-10 border-[#1e232d] shadow-2xl overflow-hidden ring-1 ring-white/10`}>
              {/* Status Bar */}
              <div className="px-6 pt-3 pb-2 flex justify-between items-center text-[11px] font-semibold">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                  <span className="material-symbols-outlined text-[14px]">wifi</span>
                  <span className="material-symbols-outlined text-[14px]">battery_full</span>
                </div>
              </div>

              {isVertical ? (
                /* Story/Reel View */
                <div className="relative">
                  {/* Header Story */}
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4 bg-linear-to-b from-black/60 to-transparent">
                    <div 
                      className="size-8 rounded-full border-2"
                      style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}20` }}
                    ></div>
                    <div className="flex flex-col flex-1">
                      <span className="text-[12px] font-bold text-white">marca_cliente</span>
                      <span className="text-[10px] text-white/70">hace 2h</span>
                    </div>
                    <span className="material-symbols-outlined text-white">more_horiz</span>
                  </div>

                  {/* Imagen vertical */}
                  <div className="aspect-9/16 w-full bg-[#111] overflow-hidden">
                    {pub.media_url ? (
                      <img src={pub.media_url} className="w-full h-full object-cover" alt="Story" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <span className="material-symbols-outlined text-6xl">image</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Story */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        placeholder="Enviar mensaje" 
                        className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/50"
                        disabled
                      />
                      <span className="material-symbols-outlined text-white text-2xl">favorite_border</span>
                      <span className="material-symbols-outlined text-white text-2xl">send</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Post/Carrusel View */
                <>
                  {/* Instagram Header */}
                  <div className="px-4 py-2 flex items-center justify-between">
                    <span className="material-symbols-outlined text-2xl">photo_camera</span>
                    <div className="flex gap-4">
                      <span className="material-symbols-outlined text-2xl">favorite_border</span>
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
                        <span className="material-symbols-outlined text-2xl">favorite_border</span>
                        <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
                        <span className="material-symbols-outlined text-2xl">send</span>
                      </div>
                      <span className="material-symbols-outlined text-2xl">bookmark_border</span>
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
                </>
              )}
            </div>

            {/* Tipo de contenido badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 capitalize">
                {pub.tipo_contenido} • {pub.red_social}
              </span>
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
                <p>Título: <span className="text-white">{pub.titulo || 'Sin título'}</span></p>
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
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl p-4 text-sm min-h-37.5 focus:outline-none transition-all resize-none"
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
// COMPONENTE PRINCIPAL: DASHBOARD CON GRILLA
// =====================================================

const ClienteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const primaryColor = branding.colores.primary;

  // Estado de navegación del calendario
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Estado de datos
  const [calendarioActual, setCalendarioActual] = useState<CalendarioAPI | null>(null);
  const [publicaciones, setPublicaciones] = useState<PublicacionAPI[]>([]);

  // Estado de UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado de review
  const [selectedPub, setSelectedPub] = useState<PublicacionAPI | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // CARGAR CALENDARIO Y PUBLICACIONES
  // =====================================================
  useEffect(() => {
    loadCalendario();
  }, [currentMonth, currentYear]);

  const loadCalendario = async () => {
    setIsLoading(true);
    setError(null);
    setCalendarioActual(null);
    setPublicaciones([]);

    try {
      // Para clientes, el backend detecta automáticamente su ID desde el JWT
      const calendarios = await calendariosService.getAll({
        mes: currentMonth + 1,
        anio: currentYear
      });

      if (calendarios.length > 0) {
        setCalendarioActual(calendarios[0]);
        
        // Cargar publicaciones del calendario
        const pubs = await publicacionesService.getAll({
          calendario_id: calendarios[0].id
        });
        setPublicaciones(pubs);
      }
    } catch (err: any) {
      console.error('Error cargando calendario:', err);
      setError(err.message || 'Error al cargar el calendario');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================
  // GRILLA DEL CALENDARIO
  // =====================================================
  const calendarGrid = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [currentMonth, currentYear]);

  // =====================================================
  // PUBLICACIONES POR DÍA
  // =====================================================
  const publicacionesPorDia = useMemo(() => {
    const map: Record<number, PublicacionAPI[]> = {};

    publicaciones.forEach(pub => {
      const fecha = new Date(pub.fecha_programada);
      const dia = fecha.getDate();

      if (!map[dia]) {
        map[dia] = [];
      }
      map[dia].push(pub);
    });

    return map;
  }, [publicaciones]);

  // =====================================================
  // STATS
  // =====================================================
  const stats = useMemo(() => {
    const pendientes = publicaciones.filter(p => p.estado === 'pendiente').length;
    const aprobados = publicaciones.filter(p => p.estado === 'aprobado').length;
    const modificar = publicaciones.filter(p => p.estado === 'modificar').length;
    const total = publicaciones.length;

    return { pendientes, aprobados, modificar, total };
  }, [publicaciones]);

  // =====================================================
  // NAVEGACIÓN DEL CALENDARIO
  // =====================================================
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear();
  };

  const getEstadoColor = (estado: EstadoPublicacion) => {
    switch (estado) {
      case 'aprobado':
        return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' };
      case 'pendiente':
        return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', dot: 'bg-amber-500' };
      case 'modificar':
        return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' };
      case 'rechazado':
        return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', dot: 'bg-slate-500' };
    }
  };

  // =====================================================
  // HANDLERS DE REVIEW
  // =====================================================
  const handleUpdateStatus = async (id: number, nuevoEstado: 'aprobado' | 'modificar' | 'rechazado', comentario: string) => {
    setIsSubmitting(true);
    try {
      await publicacionesService.update(id, { estado: nuevoEstado });
      // TODO: Guardar comentario con servicio de feedback
      setSelectedPub(null);
      await loadCalendario();
    } catch (err: any) {
      alert("Error al actualizar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =====================================================
  // RENDER: VISTA DE REVIEW
  // =====================================================
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

  // =====================================================
  // RENDER: DASHBOARD CON GRILLA
  // =====================================================
  return (
    <div className="min-h-screen bg-[#0b0e14] flex">
      <ClienteSidebar />

      <main className="flex-1 ml-64 p-8 flex flex-col">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              ¡Hola, {user?.nombre?.split(' ')[0] || 'Cliente'}! 👋
            </h1>
            <p className="text-slate-400">
              Revisa y aprueba el contenido de <span className="text-white font-medium">{MESES[currentMonth]} {currentYear}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Botón Hoy */}
            <button
              onClick={goToToday}
              className="px-3 py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors"
              style={{ color: primaryColor }}
            >
              Hoy
            </button>

            {/* Navegación de Mes */}
            <div className="flex items-center gap-2 bg-[#161b22] rounded-xl p-1 border border-white/5">
              <button
                onClick={goToPrevMonth}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-white text-sm font-bold w-32 text-center">
                {MESES[currentMonth]} {currentYear}
              </span>
              <button
                onClick={goToNextMonth}
                className="size-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-white transition-colors"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500">pending_actions</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Pendientes</p>
              <p className="text-xl font-bold text-white">{stats.pendientes}</p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-500">edit_note</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Con cambios</p>
              <p className="text-xl font-bold text-white">{stats.modificar}</p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500">check_circle</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Aprobados</p>
              <p className="text-xl font-bold text-white">{stats.aprobados}</p>
            </div>
          </div>

          <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 flex items-center gap-4">
            <div 
              className="size-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <span className="material-symbols-outlined" style={{ color: primaryColor }}>calendar_month</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total del mes</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <span className="material-symbols-outlined animate-spin" style={{ color: primaryColor }}>sync</span>
              <span>Cargando calendario...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6">
            {error}
            <button onClick={loadCalendario} className="ml-4 underline">Reintentar</button>
          </div>
        )}

        {/* Sin calendario */}
        {!isLoading && !error && !calendarioActual && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">event_busy</span>
            <h3 className="text-white text-xl font-bold mb-2">No hay contenido este mes</h3>
            <p className="text-slate-400 max-w-md">
              Tu agencia aún no ha creado un calendario para {MESES[currentMonth]} {currentYear}.
            </p>
          </div>
        )}

        {/* Grilla del Calendario */}
        {!isLoading && !error && calendarioActual && (
          <>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 mb-2">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-center py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden flex-1 min-h-125">
              {calendarGrid.map((day, index) => {
                const dayPubs = day ? (publicacionesPorDia[day] || []) : [];
                const isDayToday = day ? isToday(day) : false;

                return (
                  <div
                    key={index}
                    className={`min-h-28 p-2 flex flex-col gap-1 ${
                      day !== null
                        ? 'bg-[#0d1117] hover:bg-[#161b22] transition-colors'
                        : 'bg-[#0d1117]/50'
                    }`}
                  >
                    {/* Número del día */}
                    {day !== null && (
                      <span className={`text-xs font-medium self-end ${
                        isDayToday
                          ? 'text-white size-6 rounded-full flex items-center justify-center -mt-1 -mr-1'
                          : 'text-slate-500'
                      }`}
                      style={isDayToday ? { backgroundColor: primaryColor } : {}}
                      >
                        {day}
                      </span>
                    )}

                    {/* Publicaciones del día */}
                    {dayPubs.map((pub) => {
                      const colores = getEstadoColor(pub.estado);
                      const icono = ICONOS_RED[pub.red_social] || 'article';

                      return (
                        <div
                          key={pub.id}
                          onClick={() => setSelectedPub(pub)}
                          className={`w-full p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${colores.bg} ${colores.border} ${colores.text}`}
                          title={`${pub.titulo || 'Sin título'} - ${pub.estado}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="material-symbols-outlined text-sm">{icono}</span>
                            <span className={`size-1.5 rounded-full ${colores.dot}`}></span>
                          </div>
                          <p className="text-[10px] font-bold line-clamp-1 leading-tight">
                            {pub.titulo || pub.copy?.substring(0, 20) || 'Sin título'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
              <span className="text-slate-500 text-xs font-medium">Estados:</span>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-400 text-xs">Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-orange-500"></span>
                <span className="text-slate-400 text-xs">Modificar</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-400 text-xs">Aprobado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500"></span>
                <span className="text-slate-400 text-xs">Rechazado</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ClienteDashboard;