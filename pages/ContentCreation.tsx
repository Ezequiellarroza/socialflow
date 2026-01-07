import React, { useState, useEffect } from 'react';
import { generateCaption, suggestHashtags } from '../geminiService';
import { clientesService, ClienteAPI } from '../services/clientes';
import { calendariosService, CalendarioAPI } from '../services/calendarios';
import { 
  publicacionesService, 
  RedSocial, 
  TipoContenido,
  CreatePublicacionData 
} from '../services/publicaciones';

// =====================================================
// CONSTANTS
// =====================================================

const REDES_SOCIALES: { value: RedSocial; label: string; icon: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: 'photo_camera' },
  { value: 'facebook', label: 'Facebook', icon: 'public' },
  { value: 'twitter', label: 'Twitter/X', icon: 'tag' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'work' },
  { value: 'tiktok', label: 'TikTok', icon: 'play_circle' },
];

const TIPOS_CONTENIDO: { value: TipoContenido; label: string; icon: string }[] = [
  { value: 'imagen', label: 'Imagen', icon: 'image' },
  { value: 'video', label: 'Video', icon: 'videocam' },
  { value: 'carrusel', label: 'Carrusel', icon: 'view_carousel' },
  { value: 'story', label: 'Story', icon: 'amp_stories' },
  { value: 'reel', label: 'Reel', icon: 'movie' },
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// =====================================================
// COMPONENT
// =====================================================

const ContentCreation: React.FC = () => {
  // Data state
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [calendarios, setCalendarios] = useState<CalendarioAPI[]>([]);
  
  // Form state
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  const [selectedCalendarioId, setSelectedCalendarioId] = useState<number | null>(null);
  const [redSocial, setRedSocial] = useState<RedSocial>('instagram');
  const [tipoContenido, setTipoContenido] = useState<TipoContenido>('imagen');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [titulo, setTitulo] = useState('');
  const [copy, setCopy] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingCalendarios, setLoadingCalendarios] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // =====================================================
  // FETCH CLIENTES
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
  // FETCH CALENDARIOS CUANDO CAMBIA CLIENTE
  // =====================================================
  useEffect(() => {
    if (!selectedClienteId) {
      setCalendarios([]);
      return;
    }

    const fetchCalendarios = async () => {
      setLoadingCalendarios(true);
      try {
        const cals = await calendariosService.getAll({ cliente_id: selectedClienteId });
        setCalendarios(cals);
        // Seleccionar el primer calendario o ninguno
        if (cals.length > 0) {
          setSelectedCalendarioId(cals[0].id);
        } else {
          setSelectedCalendarioId(null);
        }
      } catch (err: any) {
        console.error('Error cargando calendarios:', err);
        setCalendarios([]);
      } finally {
        setLoadingCalendarios(false);
      }
    };

    fetchCalendarios();
  }, [selectedClienteId]);

  // =====================================================
  // AI HANDLERS
  // =====================================================
  const handleGenerateAI = async () => {
    if (!titulo) {
      setError('Por favor ingresa un título o tema para generar el contenido.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const generatedText = await generateCaption(titulo, tipoContenido);
      setCopy(generatedText || '');
    } catch (error) {
      console.error(error);
      setError('Error al generar contenido con IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestHashtags = async () => {
    if (!copy) {
      setError('Primero escribe o genera un pie de foto.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const suggested = await suggestHashtags(copy);
      setHashtags(suggested || '');
    } catch (error) {
      console.error(error);
      setError('Error al sugerir hashtags.');
    } finally {
      setIsGenerating(false);
    }
  };

  // =====================================================
  // SAVE HANDLER
  // =====================================================
  const handleSave = async () => {
    // Validaciones
    if (!selectedCalendarioId) {
      setError('Selecciona un calendario para guardar la publicación.');
      return;
    }
    if (!fechaProgramada) {
      setError('Selecciona una fecha de publicación.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data: CreatePublicacionData = {
        calendario_id: selectedCalendarioId,
        titulo: titulo || undefined,
        red_social: redSocial,
        tipo_contenido: tipoContenido,
        fecha_programada: fechaProgramada,
        copy: copy ? `${copy}${hashtags ? '\n\n' + hashtags : ''}` : undefined,
        media_url: mediaUrl || undefined,
      };

      await publicacionesService.create(data);
      
      setSuccess('¡Publicación creada exitosamente!');
      
      // Limpiar formulario
      setTitulo('');
      setCopy('');
      setHashtags('');
      setMediaUrl('');
      setFechaProgramada('');
      
    } catch (err: any) {
      setError(err.message || 'Error al guardar publicación');
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const clienteActual = clientes.find(c => c.id === selectedClienteId);
  const calendarioActual = calendarios.find(c => c.id === selectedCalendarioId);

  const formatCalendarioLabel = (cal: CalendarioAPI) => {
    return `${MESES[cal.mes - 1]} ${cal.anio} (${cal.estado_general})`;
  };

  // =====================================================
  // LOADING
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
  // RENDER
  // =====================================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      {/* Form Column */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-white tracking-tight text-3xl font-bold leading-tight">
            Cargar Nuevo Contenido
          </h1>
          <p className="text-[#9da8b9] text-sm">
            Configura y programa tu publicación con ayuda de IA.
          </p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            {success}
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        )}

        {/* Configuración */}
        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-6">
          <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span> Configuración
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Cliente</p>
              <select 
                value={selectedClienteId || ''}
                onChange={(e) => setSelectedClienteId(Number(e.target.value))}
                className="appearance-none w-full rounded-lg text-white border border-[#3b4554] bg-[#111418] h-12 px-4 focus:ring-primary focus:outline-none"
              >
                {clientes.length === 0 && (
                  <option value="">No hay clientes</option>
                )}
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_cliente}
                  </option>
                ))}
              </select>
            </label>

            {/* Calendario */}
            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Calendario</p>
              <select 
                value={selectedCalendarioId || ''}
                onChange={(e) => setSelectedCalendarioId(Number(e.target.value))}
                disabled={loadingCalendarios || calendarios.length === 0}
                className="appearance-none w-full rounded-lg text-white border border-[#3b4554] bg-[#111418] h-12 px-4 focus:ring-primary focus:outline-none disabled:opacity-50"
              >
                {loadingCalendarios && (
                  <option value="">Cargando...</option>
                )}
                {!loadingCalendarios && calendarios.length === 0 && (
                  <option value="">No hay calendarios</option>
                )}
                {calendarios.map(cal => (
                  <option key={cal.id} value={cal.id}>
                    {formatCalendarioLabel(cal)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Red Social */}
            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Red Social</p>
              <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#111418] border border-[#3b4554] p-1 gap-1">
                {REDES_SOCIALES.map(red => (
                  <button
                    key={red.value}
                    type="button"
                    onClick={() => setRedSocial(red.value)}
                    className={`flex-1 h-full rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      redSocial === red.value 
                        ? 'bg-surface-dark text-white shadow-sm' 
                        : 'text-[#9da8b9] hover:text-white'
                    }`}
                    title={red.label}
                  >
                    <span className="material-symbols-outlined text-sm">{red.icon}</span>
                    <span className="hidden xl:inline">{red.label}</span>
                  </button>
                ))}
              </div>
            </label>

            {/* Tipo Contenido */}
            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Formato</p>
              <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#111418] border border-[#3b4554] p-1 gap-1">
                {TIPOS_CONTENIDO.map(tipo => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => setTipoContenido(tipo.value)}
                    className={`flex-1 h-full rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      tipoContenido === tipo.value 
                        ? 'bg-surface-dark text-white shadow-sm' 
                        : 'text-[#9da8b9] hover:text-white'
                    }`}
                    title={tipo.label}
                  >
                    <span className="material-symbols-outlined text-sm">{tipo.icon}</span>
                    <span className="hidden xl:inline">{tipo.label}</span>
                  </button>
                ))}
              </div>
            </label>
          </div>

          {/* Fecha y Título */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Fecha Programada</p>
              <input 
                type="date"
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
                className="w-full rounded-lg border border-[#3b4554] bg-[#111418] text-white px-4 h-12 focus:ring-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Título / Tema</p>
              <input 
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full rounded-lg border border-[#3b4554] bg-[#111418] text-white px-4 h-12 focus:ring-primary focus:outline-none"
                placeholder="Ej: Lanzamiento nueva colección"
              />
            </label>
          </div>
        </div>

        {/* Contenido / Copy */}
        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">edit_note</span> Contenido (Copy)
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span> 
                {isGenerating ? 'Generando...' : 'Generar con IA'}
              </button>
              <button 
                onClick={handleSuggestHashtags}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 text-xs font-bold hover:bg-pink-500/20 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">tag</span> Sugerir Hashtags
              </button>
            </div>
          </div>
          <textarea 
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            className="w-full min-h-48 rounded-xl text-white border border-[#3b4554] bg-[#111418] p-4 text-base focus:ring-primary focus:outline-none resize-y"
            placeholder="Escribe el pie de foto aquí o usa la IA para empezar..."
          />
          {hashtags && (
            <div className="p-3 bg-pink-500/5 border border-pink-500/10 rounded-lg text-pink-400 text-sm italic">
              {hashtags}
            </div>
          )}
        </div>

        {/* Media URL */}
        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-4">
          <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">image</span> Media
          </h3>
          <label className="flex flex-col gap-2">
            <p className="text-white text-sm font-medium">URL de la imagen o video</p>
            <input 
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full rounded-lg border border-[#3b4554] bg-[#111418] text-white px-4 h-12 focus:ring-primary focus:outline-none"
              placeholder="https://..."
            />
            <p className="text-[#9da8b9] text-xs">
              Tip: Puedes subir imágenes a Cloudinary o similar y pegar la URL aquí.
            </p>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !selectedCalendarioId}
            className="flex-1 h-12 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary/80 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <span className="material-symbols-outlined animate-spin">progress_activity</span>}
            {saving ? 'Guardando...' : 'Guardar Publicación'}
          </button>
        </div>
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-5 xl:col-span-4 relative hidden lg:block">
        <div className="sticky top-10 flex flex-col gap-4">
          <h3 className="text-white text-lg font-bold px-2">Vista Previa</h3>
          <div className="border-8 border-[#111418] rounded-[2.5rem] bg-white overflow-hidden shadow-2xl relative h-162.5 w-full max-w-80 mx-auto">
            {/* Phone notch */}
            <div className="h-6 bg-white flex items-center justify-center pt-2">
              <div className="w-16 h-4 bg-black rounded-full"></div>
            </div>
            {/* Phone header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="material-symbols-outlined text-black text-sm">arrow_back</span>
              <span className="font-bold text-xs text-black uppercase">{redSocial}</span>
              <span className="material-symbols-outlined text-black text-sm">more_horiz</span>
            </div>
            {/* Phone content */}
            <div className="overflow-y-auto h-[calc(100%-80px)] scrollbar-hide">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="size-8 rounded-full bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-black">
                    {clienteActual?.nombre_cliente || 'Tu Marca'}
                  </span>
                  <span className="text-[8px] text-gray-500">Ubicación</span>
                </div>
              </div>
              {/* Media preview */}
              <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {mediaUrl ? (
                  <img 
                    src={mediaUrl} 
                    alt="Preview" 
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="material-symbols-outlined text-6xl text-slate-300">
                    {tipoContenido === 'video' || tipoContenido === 'reel' ? 'videocam' : 'image'}
                  </span>
                )}
              </div>
              {/* Post content */}
              <div className="p-3 flex flex-col gap-2">
                <div className="flex gap-3 text-black">
                  <span className="material-symbols-outlined text-xl">favorite</span>
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                  <span className="material-symbols-outlined text-xl">send</span>
                </div>
                <p className="text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  <span className="font-bold mr-1">
                    {clienteActual?.nombre_cliente?.toLowerCase().replace(/\s+/g, '_') || 'tu_marca'}
                  </span>
                  {copy || 'Tu pie de foto aparecerá aquí...'}
                  <br /><br />
                  <span className="text-blue-900">{hashtags}</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Info del calendario */}
          {calendarioActual && (
            <div className="p-3 bg-surface-dark rounded-lg border border-border-dark text-center">
              <p className="text-[#9da8b9] text-xs">
                Guardando en: <span className="text-white font-medium">{formatCalendarioLabel(calendarioActual)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCreation;