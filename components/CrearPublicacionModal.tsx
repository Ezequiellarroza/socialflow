import React, { useState, useEffect, useRef } from 'react';
import {
  publicacionesService,
  PublicacionAPI,
  RedSocial,
  TipoContenido,
  CreatePublicacionData
} from '../services/publicaciones';
import { uploadFile, uploadMultipleFiles } from '../services/upload';
import api from '../services/api';

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
  { value: 'tiktok', label: 'TikTok', icon: 'play_circle', color: 'from-gray-800 to-gray-700' },
];

const TIPOS_CONTENIDO: { value: TipoContenido; label: string; icon: string }[] = [
  { value: 'imagen', label: 'Imagen', icon: 'image' },
  { value: 'carrusel', label: 'Carrusel', icon: 'view_carousel' },
  { value: 'story', label: 'Story', icon: 'amp_stories' },
  { value: 'reel', label: 'Reel', icon: 'movie' },
  { value: 'portada_reel', label: 'Portada de Reel', icon: 'smart_display' },
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Portada de reel ---
  const [selectedPortada, setSelectedPortada] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedFile(null);
      setFilePreview(null);
      setSelectedFiles([]);
      filePreviews.forEach(url => URL.revokeObjectURL(url));
      setFilePreviews([]);
      setError(null);
      setSelectedPortada(null);
      if (portadaPreview) URL.revokeObjectURL(portadaPreview);
      setPortadaPreview(null);
      if (portadaInputRef.current) portadaInputRef.current.value = '';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.tipo_contenido === 'carrusel') {
      const newFiles = Array.from(files);
      const remaining = 10 - selectedFiles.length;
      const filesToAdd = newFiles.slice(0, remaining);
      if (filesToAdd.length === 0) return;

      setSelectedFiles(prev => [...prev, ...filesToAdd]);
      setFilePreviews(prev => [...prev, ...filesToAdd.map(f => URL.createObjectURL(f))]);
    } else {
      const file = files[0];
      setSelectedFile(file);
      if (filePreview) URL.revokeObjectURL(filePreview);
      setFilePreview(URL.createObjectURL(file));
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFileAtIndex = (index: number) => {
    URL.revokeObjectURL(filePreviews[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
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
      const isCarrusel = formData.tipo_contenido === 'carrusel';

      if (isCarrusel) {
        // --- FLUJO CARRUSEL ---
        // 1. Crear publicación sin media
        const data: CreatePublicacionData = {
          calendario_id: calendarioId,
          titulo: formData.titulo || undefined,
          red_social: formData.red_social,
          tipo_contenido: formData.tipo_contenido,
          fecha_programada: formData.fecha_programada,
          copy: formData.copy || undefined,
        };

        const nuevaPublicacion = await publicacionesService.create(data);

        // 2. Subir todos los archivos
        if (selectedFiles.length > 0) {
          setUploading(true);
          try {
            const uploadResults = await uploadMultipleFiles(selectedFiles);

            // 3. Asociar cada archivo a la publicación
            for (let i = 0; i < uploadResults.length; i++) {
              const result = uploadResults[i];
              await api.post('/publicacion-media.php', {
                publicacion_id: nuevaPublicacion.id,
                media_url: result.url,
                media_type: result.media_type,
                media_public_id: result.public_id,
                orden: i,
              });
            }
          } catch (err: any) {
            setError(err.message || 'Error al subir archivos del carrusel');
            setSaving(false);
            setUploading(false);
            return;
          }
          setUploading(false);
        }

        onCreated(nuevaPublicacion);
        onClose();
      } else {
        // --- FLUJO SINGLE (imagen, story, reel) ---
        let mediaUrl: string | undefined;
        let mediaType: string | undefined;

        if (selectedFile) {
          setUploading(true);
          try {
            const uploaded = await uploadFile(selectedFile);
            mediaUrl = uploaded.url;
            mediaType = uploaded.media_type;
          } catch (err: any) {
            setError(err.message || 'Error al subir archivo');
            setSaving(false);
            setUploading(false);
            return;
          }
          setUploading(false);
        }

        // Subir portada de reel si corresponde
        let portadaUrl: string | undefined;
        let portadaPublicId: string | undefined;
        if (formData.tipo_contenido === 'reel' && selectedPortada) {
          setUploading(true);
          try {
            const uploaded = await uploadFile(selectedPortada);
            portadaUrl = uploaded.url;
            portadaPublicId = uploaded.public_id;
          } catch (err: any) {
            setError(err.message || 'Error al subir portada');
            setSaving(false);
            setUploading(false);
            return;
          }
          setUploading(false);
        }

        const data: CreatePublicacionData = {
          calendario_id: calendarioId,
          titulo: formData.titulo || undefined,
          red_social: formData.red_social,
          tipo_contenido: formData.tipo_contenido,
          fecha_programada: formData.fecha_programada,
          copy: formData.copy || undefined,
          media_url: mediaUrl,
          media_type: mediaType,
          ...(portadaUrl && { portada_url: portadaUrl, portada_public_id: portadaPublicId }),
        };

        const nuevaPublicacion = await publicacionesService.create(data);
        onCreated(nuevaPublicacion);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear publicación');
    } finally {
      setSaving(false);
      setUploading(false);
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

          {/* Media Upload */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              {formData.tipo_contenido === 'carrusel' ? `Archivos (${selectedFiles.length}/10)` : 'Archivo (opcional)'}
            </label>

            {formData.tipo_contenido === 'carrusel' ? (
              <>
                {filePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-border-dark aspect-square bg-black">
                        {selectedFiles[index]?.type.startsWith('video/') ? (
                          <video src={preview} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={preview} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFileAtIndex(index)}
                          className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {selectedFiles.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-border-dark rounded-lg text-[#9da8b9] hover:border-primary/50 hover:text-white transition-colors flex flex-col items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                    <span className="text-xs">
                      {selectedFiles.length === 0 ? 'Agregar imágenes o videos' : 'Agregar más archivos'}
                    </span>
                  </button>
                )}
              </>
            ) : (
              <>
                {filePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border-dark">
                    {selectedFile?.type.startsWith('video/') ? (
                      <video src={filePreview} className="w-full max-h-40 object-contain bg-black" controls />
                    ) : (
                      <img src={filePreview} alt="Preview" className="w-full max-h-40 object-contain bg-black" />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 size-7 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-border-dark rounded-lg text-[#9da8b9] hover:border-primary/50 hover:text-white transition-colors flex flex-col items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                    <span className="text-xs">Imagen o video (máx. 120MB)</span>
                  </button>
                )}
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={formData.tipo_contenido === 'portada_reel' ? 'image/jpeg,image/png,image/gif,image/webp' : 'image/jpeg,image/png,image/gif,image/webp,video/mp4'}
              onChange={handleFileChange}
              className="hidden"
              multiple={formData.tipo_contenido === 'carrusel'}
            />

            {/* Portada del reel */}
            {formData.tipo_contenido === 'reel' && (
              <div className="mt-3 p-3 bg-surface-dark rounded-lg border border-border-dark">
                <label className="block text-[#9da8b9] text-sm font-medium mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">smart_display</span>
                  Portada del reel
                  <span className="text-[11px] text-[#9da8b9]/60 font-normal">(opcional)</span>
                </label>
                {portadaPreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border-dark aspect-video max-h-24 bg-black">
                    <img src={portadaPreview} alt="Portada" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPortada(null);
                        if (portadaPreview) URL.revokeObjectURL(portadaPreview);
                        setPortadaPreview(null);
                      }}
                      className="absolute top-1 right-1 size-6 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => portadaInputRef.current?.click()}
                    className="w-full py-3 border-2 border-dashed border-border-dark rounded-lg text-[#9da8b9] hover:border-primary/50 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
                    <span className="text-xs">Subir portada (JPG, PNG, WebP)</span>
                  </button>
                )}
                <input
                  ref={portadaInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setSelectedPortada(file);
                    if (portadaPreview) URL.revokeObjectURL(portadaPreview);
                    setPortadaPreview(URL.createObjectURL(file));
                    if (portadaInputRef.current) portadaInputRef.current.value = '';
                  }}
                  className="hidden"
                />
              </div>
            )}
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
            disabled={saving || uploading}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {(saving || uploading) && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
            {uploading ? (formData.tipo_contenido === 'carrusel' ? 'Subiendo archivos...' : 'Subiendo archivo...') : saving ? 'Creando...' : 'Crear Publicación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrearPublicacionModal;