import React, { useState, useEffect } from 'react';
import { 
  PublicacionAPI, 
  RedSocial, 
  TipoContenido, 
  EstadoPublicacion,
  publicacionesService 
} from '../services/publicaciones';

// =====================================================
// TYPES
// =====================================================

interface PublicacionModalProps {
  publicacion: PublicacionAPI | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (publicacion: PublicacionAPI) => void;
  onDelete: (id: number) => void;
}

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

const TIPOS_CONTENIDO: { value: TipoContenido; label: string }[] = [
  { value: 'imagen', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'carrusel', label: 'Carrusel' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' },
];

const ESTADOS: { value: EstadoPublicacion; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-amber-500' },
  { value: 'aprobado', label: 'Aprobado', color: 'bg-emerald-500' },
  { value: 'modificar', label: 'Requiere cambios', color: 'bg-orange-500' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-red-500' },
];

// Helper para extraer solo la fecha (sin hora)
const extractDate = (dateString: string): string => {
  if (!dateString) return '';
  // Si viene "2026-01-01 00:00:00", extraer solo "2026-01-01"
  return dateString.split(' ')[0].split('T')[0];
};

// =====================================================
// COMPONENT
// =====================================================

const PublicacionModal: React.FC<PublicacionModalProps> = ({
  publicacion,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    red_social: 'instagram' as RedSocial,
    tipo_contenido: 'imagen' as TipoContenido,
    fecha_programada: '',
    copy: '',
    media_url: '',
  });
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // =====================================================
  // SYNC FORM WITH PUBLICACION
  // =====================================================
  useEffect(() => {
    if (publicacion) {
      setFormData({
        titulo: publicacion.titulo || '',
        red_social: publicacion.red_social,
        tipo_contenido: publicacion.tipo_contenido,
        fecha_programada: extractDate(publicacion.fecha_programada),
        copy: publicacion.copy || '',
        media_url: publicacion.media_url || '',
      });
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [publicacion]);

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!publicacion) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const updated = await publicacionesService.update(publicacion.id, {
        titulo: formData.titulo || undefined,
        red_social: formData.red_social,
        tipo_contenido: formData.tipo_contenido,
        fecha_programada: formData.fecha_programada,
        copy: formData.copy || undefined,
        media_url: formData.media_url || undefined,
      });
      
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEstadoChange = async (nuevoEstado: EstadoPublicacion) => {
    if (!publicacion) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const updated = await publicacionesService.update(publicacion.id, {
        estado: nuevoEstado,
      });
      
      onUpdate(updated);
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!publicacion) return;
    
    setDeleting(true);
    setError(null);
    
    try {
      await publicacionesService.delete(publicacion.id);
      onDelete(publicacion.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  if (!isOpen || !publicacion) return null;

  const estadoActual = ESTADOS.find(e => e.value === publicacion.estado);
  const redActual = REDES_SOCIALES.find(r => r.value === publicacion.red_social);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111418] border border-border-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-lg flex items-center justify-center ${
              publicacion.red_social === 'instagram' ? 'bg-linear-to-br from-purple-500 to-pink-500' :
              publicacion.red_social === 'facebook' ? 'bg-blue-600' :
              publicacion.red_social === 'twitter' ? 'bg-sky-500' :
              publicacion.red_social === 'linkedin' ? 'bg-blue-700' :
              'bg-gray-700'
            }`}>
              <span className="material-symbols-outlined text-white text-xl">
                {redActual?.icon || 'public'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold">Editar Publicación</h3>
              <p className="text-[#9da8b9] text-sm">ID: #{publicacion.id}</p>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Estado actual */}
          <div className="flex items-center justify-between p-3 bg-surface-dark rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-[#9da8b9] text-sm">Estado actual:</span>
              <span className={`px-2 py-1 rounded text-xs font-bold text-white ${estadoActual?.color}`}>
                {estadoActual?.label}
              </span>
            </div>
            
            {/* Botones rápidos de estado */}
            <div className="flex items-center gap-2">
              {ESTADOS.filter(e => e.value !== publicacion.estado).map(estado => (
                <button
                  key={estado.value}
                  onClick={() => handleEstadoChange(estado.value)}
                  disabled={saving}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    estado.value === 'aprobado' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' :
                    estado.value === 'modificar' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30' :
                    estado.value === 'rechazado' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                    'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  } disabled:opacity-50`}
                >
                  {estado.label}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Título de la publicación"
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Red Social y Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                Red Social
              </label>
              <select
                name="red_social"
                value={formData.red_social}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {REDES_SOCIALES.map(red => (
                  <option key={red.value} value={red.value}>{red.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                Tipo de Contenido
              </label>
              <select
                name="tipo_contenido"
                value={formData.tipo_contenido}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {TIPOS_CONTENIDO.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              Fecha Programada
            </label>
            <input
              type="date"
              name="fecha_programada"
              value={formData.fecha_programada}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
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
              rows={4}
              placeholder="Escribe el texto de la publicación..."
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Media URL */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              URL de Media
            </label>
            <input
              type="url"
              name="media_url"
              value={formData.media_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {formData.media_url && (
              <div className="mt-2 p-2 bg-surface-dark rounded-lg border border-border-dark">
                <img 
                  src={formData.media_url} 
                  alt="Preview" 
                  className="max-h-40 rounded mx-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Info adicional */}
          <div className="flex items-center gap-4 text-xs text-[#9da8b9] pt-2 border-t border-border-dark">
            <span>Versión: {publicacion.version}</span>
            <span>•</span>
            <span>Creado: {new Date(publicacion.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>Actualizado: {new Date(publicacion.updated_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border-dark bg-surface-dark">
          {/* Delete */}
          <div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-lg align-middle mr-1">delete</span>
                Eliminar
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-sm">¿Confirmar?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 text-[#9da8b9] hover:text-white text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#9da8b9] hover:text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicacionModal;