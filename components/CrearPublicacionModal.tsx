import React, { useState, useEffect } from 'react';
import { 
  publicacionesService, 
  PublicacionAPI,
  RedSocial, 
  TipoContenido,
  CreatePublicacionData 
} from '../services/publicaciones';

// =====================================================
// TYPES
// =====================================================

interface CrearPublicacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (publicacion: PublicacionAPI) => void;
  calendarioId: number;
  fechaDefault: string;
  clienteNombre: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const REDES_SOCIALES: { value: RedSocial; label: string; icon: string; color: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: 'photo_camera', color: 'from-purple-500 to-pink-500' },
  { value: 'facebook', label: 'Facebook', icon: 'public', color: 'from-blue-600 to-blue-500' },
  { value: 'twitter', label: 'Twitter/X', icon: 'tag', color: 'from-sky-500 to-sky-400' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'work', color: 'from-blue-700 to-blue-600' },
  { value: 'tiktok', label: 'TikTok', icon: 'play_circle', color: 'from-gray-800 to-gray-700' },
];

const TIPOS_CONTENIDO: { value: TipoContenido; label: string; icon: string }[] = [
  { value: 'imagen', label: 'Imagen', icon: 'image' },
  { value: 'video', label: 'Video', icon: 'videocam' },
  { value: 'carrusel', label: 'Carrusel', icon: 'view_carousel' },
  { value: 'story', label: 'Story', icon: 'amp_stories' },
  { value: 'reel', label: 'Reel', icon: 'movie' },
];

// =====================================================
// COMPONENT
// =====================================================

const CrearPublicacionModal: React.FC<CrearPublicacionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  calendarioId,
  fechaDefault,
  clienteNombre,
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    red_social: 'instagram' as RedSocial,
    tipo_contenido: 'imagen' as TipoContenido,
    fecha_programada: fechaDefault,
    copy: '',
    media_url: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        titulo: '',
        red_social: 'instagram',
        tipo_contenido: 'imagen',
        fecha_programada: fechaDefault,
        copy: '',
        media_url: '',
      });
      setError(null);
    }
  }, [isOpen, fechaDefault]);

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRedSocialClick = (red: RedSocial) => {
    setFormData(prev => ({ ...prev, red_social: red }));
  };

  const handleTipoClick = (tipo: TipoContenido) => {
    setFormData(prev => ({ ...prev, tipo_contenido: tipo }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fecha_programada) {
      setError('Selecciona una fecha');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const data: CreatePublicacionData = {
        calendario_id: calendarioId,
        titulo: formData.titulo || undefined,
        red_social: formData.red_social,
        tipo_contenido: formData.tipo_contenido,
        fecha_programada: formData.fecha_programada,
        copy: formData.copy || undefined,
        media_url: formData.media_url || undefined,
      };

      const nuevaPublicacion = await publicacionesService.create(data);
      onCreated(nuevaPublicacion);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear publicación');
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  if (!isOpen) return null;

  const redActual = REDES_SOCIALES.find(r => r.value === formData.red_social);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111418] border border-border-dark rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-lg bg-linear-to-br ${redActual?.color || 'from-primary to-primary'} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-xl">
                {redActual?.icon || 'add'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold">Nueva Publicación</h3>
              <p className="text-[#9da8b9] text-sm">{clienteNombre}</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-border-dark text-[#9da8b9] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Red Social */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-2">
              Red Social
            </label>
            <div className="flex gap-2">
              {REDES_SOCIALES.map(red => (
                <button
                  key={red.value}
                  type="button"
                  onClick={() => handleRedSocialClick(red.value)}
                  className={`flex-1 py-2 px-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                    formData.red_social === red.value
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-surface-dark border-border-dark text-[#9da8b9] hover:text-white hover:border-[#3b4554]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{red.icon}</span>
                  <span className="text-[10px] font-medium">{red.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de Contenido */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-2">
              Tipo de Contenido
            </label>
            <div className="flex gap-2">
              {TIPOS_CONTENIDO.map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => handleTipoClick(tipo.value)}
                  className={`flex-1 py-2 px-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                    formData.tipo_contenido === tipo.value
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-surface-dark border-border-dark text-[#9da8b9] hover:text-white hover:border-[#3b4554]'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{tipo.icon}</span>
                  <span className="text-[10px] font-medium">{tipo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fecha y Título */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                Fecha
              </label>
              <input
                type="date"
                name="fecha_programada"
                value={formData.fecha_programada}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                Título
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Promo Verano"
                className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Copy */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              Copy / Texto
            </label>
            <textarea
              name="copy"
              value={formData.copy}
              onChange={handleChange}
              rows={3}
              placeholder="Escribe el texto de la publicación..."
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              URL de Media (opcional)
            </label>
            <input
              type="url"
              name="media_url"
              value={formData.media_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border-dark bg-surface-dark">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#9da8b9] hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
            {saving ? 'Creando...' : 'Crear Publicación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;