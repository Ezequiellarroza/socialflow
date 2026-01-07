import React, { useState, useEffect, useMemo } from 'react';
import { calendariosService, CalendarioAPI } from '../services/calendarios';
import { publicacionesService, PublicacionAPI, RedSocial, EstadoPublicacion } from '../services/publicaciones';
import { clientesService, ClienteAPI } from '../services/clientes';
import PublicacionModal from '../components/PublicacionModal';
import CrearCalendarioModal from '../components/CrearCalendarioModal';
import CrearPublicacionModal from '../components/CrearPublicacionModal';

// =====================================================
// HELPERS
// =====================================================

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ICONOS_RED: Record<RedSocial, string> = {
  instagram: 'photo_camera',
  facebook: 'public',
  twitter: 'tag',
  linkedin: 'work',
  tiktok: 'play_circle'
};

const COLORES_ESTADO: Record<EstadoPublicacion, { bg: string; border: string; text: string; dot: string }> = {
  aprobado: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  pendiente: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', dot: 'bg-amber-500' },
  modificar: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  rechazado: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' }
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// =====================================================
// COMPONENT
// =====================================================

const CalendarView: React.FC = () => {
  // Estado de navegación
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Estado de datos
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [calendarioActual, setCalendarioActual] = useState<CalendarioAPI | null>(null);
  const [publicaciones, setPublicaciones] = useState<PublicacionAPI[]>([]);
  
  // Estado de UI
  const [loading, setLoading] = useState(true);
  const [loadingCalendario, setLoadingCalendario] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de modales
  const [selectedPublicacion, setSelectedPublicacion] = useState<PublicacionAPI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCrearCalendarioOpen, setIsCrearCalendarioOpen] = useState(false);
  const [isCrearPublicacionOpen, setIsCrearPublicacionOpen] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  // =====================================================
  // CARGAR CLIENTES AL MONTAR
  // =====================================================
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await clientesService.getAll();
        const data = response.clientes || [];
        setClientes(data);
        if (data.length > 0) {
          setSelectedClienteId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // =====================================================
  // CARGAR CALENDARIO CUANDO CAMBIA CLIENTE/MES/AÑO
  // =====================================================
  useEffect(() => {
    if (!selectedClienteId) return;

    const fetchCalendario = async () => {
      setLoadingCalendario(true);
      setCalendarioActual(null);
      setPublicaciones([]);
      
      try {
        const cals = await calendariosService.getAll({
          cliente_id: selectedClienteId,
          mes: currentMonth + 1,
          anio: currentYear
        });
        
        if (cals.length > 0) {
          setCalendarioActual(cals[0]);
          // Cargar publicaciones del calendario
          const pubs = await publicacionesService.getAll({
            calendario_id: cals[0].id
          });
          setPublicaciones(pubs);
        }
      } catch (err: any) {
        console.error('Error cargando calendario:', err);
      } finally {
        setLoadingCalendario(false);
      }
    };

    fetchCalendario();
  }, [selectedClienteId, currentMonth, currentYear]);

  // =====================================================
  // CALENDARIO GRID
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
  // NAVEGACIÓN
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
  // HANDLERS DEL MODAL PUBLICACIÓN
  // =====================================================
  const handlePublicacionClick = (pub: PublicacionAPI) => {
    setSelectedPublicacion(pub);
    setIsModalOpen(true);
  };

  const handlePublicacionUpdate = (updated: PublicacionAPI) => {
    setPublicaciones(prev => 
      prev.map(p => p.id === updated.id ? updated : p)
    );
  };

  const handlePublicacionDelete = (id: number) => {
    setPublicaciones(prev => prev.filter(p => p.id !== id));
  };

  // =====================================================
  // HANDLER CREAR CALENDARIO
  // =====================================================
  const handleCalendarioCreated = (nuevoCalendario: CalendarioAPI) => {
    setCalendarioActual(nuevoCalendario);
    setPublicaciones([]);
  };

  // =====================================================
  // HANDLER CREAR PUBLICACIÓN
  // =====================================================
  const handleAgregarPublicacion = (dia: number) => {
    const fecha = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    setFechaSeleccionada(fecha);
    setIsCrearPublicacionOpen(true);
  };

  const handlePublicacionCreated = (nuevaPublicacion: PublicacionAPI) => {
    setPublicaciones(prev => [...prev, nuevaPublicacion]);
  };

  // =====================================================
  // HELPERS UI
  // =====================================================
  const isToday = (day: number): boolean => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
  };

  const clienteActual = clientes.find(c => c.id === selectedClienteId);

  // =====================================================
  // LOADING STATE
  // =====================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#9da8b9]">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <span className="material-symbols-outlined text-red-400 text-4xl mb-2">error</span>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // EMPTY STATE - Sin clientes
  // =====================================================
  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <span className="material-symbols-outlined text-[#9da8b9] text-5xl mb-4">group_off</span>
        <h3 className="text-white text-xl font-bold mb-2">No hay clientes</h3>
        <p className="text-[#9da8b9] mb-4">Primero necesitás agregar un cliente para crear calendarios.</p>
        <a 
          href="/dashboard/clients"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
        >
          Ir a Clientes
        </a>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-3xl font-black leading-tight tracking-tight">
            Calendario Editorial
          </h2>
          <p className="text-[#9da8b9] text-sm">
            Gestiona y planifica el contenido para {MESES[currentMonth]} {currentYear}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Cliente */}
          <select
            value={selectedClienteId || ''}
            onChange={(e) => setSelectedClienteId(Number(e.target.value))}
            className="bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre_cliente}
              </option>
            ))}
          </select>

          {/* Botón Hoy */}
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
          >
            Hoy
          </button>

          {/* Navegación de Mes */}
          <div className="flex items-center gap-3 bg-surface-dark rounded-lg p-1 border border-border-dark">
            <button 
              onClick={goToPrevMonth}
              className="size-8 flex items-center justify-center rounded hover:bg-border-dark text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <span className="text-white text-sm font-bold w-36 text-center">
              {MESES[currentMonth]} {currentYear}
            </span>
            <button 
              onClick={goToNextMonth}
              className="size-8 flex items-center justify-center rounded hover:bg-border-dark text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </header>

      {/* Loading Calendario */}
      {loadingCalendario && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 text-[#9da8b9]">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <span>Cargando calendario...</span>
          </div>
        </div>
      )}

      {/* Sin Calendario - Mostrar opción de crear */}
      {!loadingCalendario && !calendarioActual && (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-dark border border-dashed border-border-dark rounded-3xl">
          <div className="size-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl">calendar_add_on</span>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">No hay calendario</h3>
          <p className="text-[#9da8b9] text-center mb-6 max-w-md">
            No existe un calendario para <span className="text-white font-medium">{clienteActual?.nombre_cliente}</span> en <span className="text-white font-medium">{MESES[currentMonth]} {currentYear}</span>.
            <br />Creá uno para empezar a agregar publicaciones.
          </p>
          <button 
            onClick={() => setIsCrearCalendarioOpen(true)}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Crear Calendario
          </button>
        </div>
      )}

      {/* Con Calendario - Mostrar grilla */}
      {!loadingCalendario && calendarioActual && (
        <>
          {/* Estado del Calendario */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-surface-dark rounded-lg border border-border-dark">
            <div className="flex items-center gap-2">
              <span className="text-[#9da8b9] text-sm">Cliente:</span>
              <span className="text-white font-medium">{clienteActual?.nombre_cliente}</span>
            </div>
            <div className="w-px h-4 bg-border-dark"></div>
            <div className="flex items-center gap-2">
              <span className="text-[#9da8b9] text-sm">Estado:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                calendarioActual.estado_general === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400' :
                calendarioActual.estado_general === 'enviado' ? 'bg-blue-500/20 text-blue-400' :
                calendarioActual.estado_general === 'cerrado' ? 'bg-slate-500/20 text-slate-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {calendarioActual.estado_general.charAt(0).toUpperCase() + calendarioActual.estado_general.slice(1)}
              </span>
            </div>
            <div className="w-px h-4 bg-border-dark"></div>
            <div className="flex items-center gap-2">
              <span className="text-[#9da8b9] text-sm">Publicaciones:</span>
              <span className="text-white font-medium">{publicaciones.length}</span>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 border-b border-border-dark mb-2">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-[#9da8b9] text-xs font-semibold uppercase tracking-wider text-center py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Grid del calendario */}
          <div className="grid grid-cols-7 gap-px bg-border-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl flex-1 overflow-y-auto min-h-125">
            {calendarGrid.map((day, index) => {
              const dayPublicaciones = day ? (publicacionesPorDia[day] || []) : [];
              const isDayToday = day ? isToday(day) : false;
              
              return (
                <div 
                  key={index} 
                  className={`min-h-28 p-2 flex flex-col gap-1 transition-colors relative group ${
                    day !== null 
                      ? 'bg-[#111418] hover:bg-[#15191e]' 
                      : 'bg-[#111418]/50'
                  }`}
                >
                  {/* Número del día */}
                  {day !== null && (
                    <span className={`text-xs font-medium ml-auto ${
                      isDayToday 
                        ? 'bg-primary text-white size-6 rounded-full flex items-center justify-center -mt-1 -mr-1' 
                        : 'text-[#9da8b9]'
                    }`}>
                      {day}
                    </span>
                  )}

                  {/* Publicaciones del día */}
                  {dayPublicaciones.map((pub) => {
                    const colores = COLORES_ESTADO[pub.estado];
                    const icono = ICONOS_RED[pub.red_social];
                    
                    return (
                      <div 
                        key={pub.id}
                        onClick={() => handlePublicacionClick(pub)}
                        className={`w-full p-2 rounded border cursor-pointer transition-all shadow-sm hover:scale-[1.02] ${colores.bg} ${colores.border} ${colores.text}`}
                        title={`${pub.titulo || 'Sin título'} - ${pub.red_social}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="material-symbols-outlined text-sm">{icono}</span>
                          <span className={`size-1.5 rounded-full ${colores.dot}`}></span>
                        </div>
                        <p className="text-[10px] font-bold line-clamp-1 leading-tight">
                          {pub.titulo || pub.copy?.substring(0, 30) || 'Sin título'}
                        </p>
                      </div>
                    );
                  })}

                  {/* Botón agregar */}
                  {day !== null && (
                    <button 
                      onClick={() => handleAgregarPublicacion(day)}
                      className="mt-auto opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 w-full py-1 text-[10px] text-primary font-bold border border-dashed border-primary/40 rounded transition-opacity hover:bg-primary/10"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Añadir
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border-dark">
            <span className="text-[#9da8b9] text-xs font-medium">Estados:</span>
            {Object.entries(COLORES_ESTADO).map(([estado, colores]) => (
              <div key={estado} className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${colores.dot}`}></span>
                <span className="text-[#9da8b9] text-xs capitalize">{estado}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal de Publicación (ver/editar) */}
      <PublicacionModal
        publicacion={selectedPublicacion}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPublicacion(null);
        }}
        onUpdate={handlePublicacionUpdate}
        onDelete={handlePublicacionDelete}
      />

      {/* Modal Crear Calendario */}
      <CrearCalendarioModal
        isOpen={isCrearCalendarioOpen}
        onClose={() => setIsCrearCalendarioOpen(false)}
        onCreated={handleCalendarioCreated}
        clientes={clientes}
        defaultClienteId={selectedClienteId}
        defaultMes={currentMonth + 1}
        defaultAnio={currentYear}
      />

      {/* Modal Crear Publicación */}
      {calendarioActual && (
        <CrearPublicacionModal
          isOpen={isCrearPublicacionOpen}
          onClose={() => setIsCrearPublicacionOpen(false)}
          onCreated={handlePublicacionCreated}
          calendarioId={calendarioActual.id}
          fechaDefault={fechaSeleccionada}
          clienteNombre={clienteActual?.nombre_cliente || ''}
        />
      )}
    </div>
  );
};

export default CalendarView;