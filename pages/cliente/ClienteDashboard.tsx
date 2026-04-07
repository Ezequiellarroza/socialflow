// =====================================================
// SOCIALFLOW - Cliente Dashboard (con Grilla de Calendario)
// =====================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClienteSidebar from '../../components/ClienteSidebar';
import ReviewDetail from '../../components/ReviewDetail';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../context/BrandingContext';
import { calendariosService, CalendarioAPI } from '../../services/calendarios';
import { publicacionesService, PublicacionAPI, EstadoPublicacion } from '../../services/publicaciones';
import { feedbackService } from '../../services/feedback';

// =====================================================
// HELPERS
// =====================================================

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_SEMANA_CORTO = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const ICONOS_RED: Record<string, string> = {
  instagram: 'photo_camera',
  facebook: 'public',
  tiktok: 'play_circle'
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// =====================================================
// COMPONENTE PRINCIPAL: DASHBOARD CON GRILLA
// =====================================================

const ClienteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { branding } = useBranding();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const primaryColor = branding.colores.primary;

  // Estado del sidebar mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      // Registrar feedback (comentario + acción)
      const accionMap = { aprobado: 'aprobar', modificar: 'modificar', rechazado: 'rechazar' } as const;
      await feedbackService.create({
        publicacion_id: id,
        comentario: comentario.trim() || `Publicación ${nuevoEstado}`,
        accion: accionMap[nuevoEstado],
      });
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
      <ClienteSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 flex flex-col">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Hamburger mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-white/5 text-white"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
              ¡Hola, {user?.nombre?.split(' ')[0] || 'Cliente'}! 👋
            </h1>
            <p className="text-slate-400">
              Revisa y aprueba el contenido de <span className="text-white font-medium">{MESES[currentMonth]} {currentYear}</span>
            </p>
            </div>
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
              {DIAS_SEMANA.map((d, i) => (
                <div key={d} className="text-slate-500 text-xs font-semibold uppercase tracking-wider text-center py-2">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{DIAS_SEMANA_CORTO[i]}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden flex-1 min-h-0 md:min-h-125">
              {calendarGrid.map((day, index) => {
                const dayPubs = day ? (publicacionesPorDia[day] || []) : [];
                const isDayToday = day ? isToday(day) : false;

                return (
                  <div
                    key={index}
                    className={`min-h-12 md:min-h-28 p-1 md:p-2 flex flex-col gap-0.5 md:gap-1 ${
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
                          className={`w-full p-1 md:p-2 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${colores.bg} ${colores.border} ${colores.text}`}
                          title={`${pub.titulo || 'Sin título'} - ${pub.estado}`}
                        >
                          <div className="flex items-center justify-between mb-0.5 md:mb-1">
                            <span className="material-symbols-outlined text-xs md:text-sm">{icono}</span>
                            <span className={`size-1.5 rounded-full ${colores.dot}`}></span>
                          </div>
                          <p className="text-[9px] md:text-[10px] font-bold line-clamp-1 leading-tight">
                            {pub.titulo || pub.copy?.substring(0, 20) || 'Sin título'}
                          </p>
                          <span className="hidden md:inline-flex items-center gap-0.5 bg-white/10 rounded px-1 py-px text-white/70 text-[10px] w-fit mt-0.5">
                            <span className="material-symbols-outlined text-[10px]">
                              {pub.tipo_contenido === 'carrusel' ? 'view_carousel' : pub.tipo_contenido === 'reel' ? 'play_circle' : pub.tipo_contenido === 'story' ? 'vertical_split' : pub.tipo_contenido === 'portada_reel' ? 'smart_display' : 'image'}
                            </span>
                            {pub.tipo_contenido}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 pt-4 border-t border-white/5">
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