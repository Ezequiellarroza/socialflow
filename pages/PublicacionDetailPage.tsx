// =====================================================
// SOCIALFLOW - Detalle de Publicación (Página completa)
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  publicacionesService,
  PublicacionAPI,
  RedSocial,
  TipoContenido,
  EstadoPublicacion,
} from '../services/publicaciones';
import { feedbackService, FeedbackAPI } from '../services/feedback';
import { uploadFile, uploadMultipleFiles } from '../services/upload';
import api from '../services/api';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import MockupIPhone from '../components/MockupIPhone';

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

const ESTADOS: { value: EstadoPublicacion; label: string; color: string }[] = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-amber-500' },
  { value: 'aprobado', label: 'Aprobado', color: 'bg-emerald-500' },
  { value: 'modificar', label: 'Requiere cambios', color: 'bg-orange-500' },
  { value: 'rechazado', label: 'Rechazado', color: 'bg-red-500' },
];

const extractDate = (dateString: string): string => {
  if (!dateString) return '';
  return dateString.split(' ')[0].split('T')[0];
};

// =====================================================
// COMPONENT
// =====================================================

const PublicacionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { branding } = useBranding();
  const { user } = useAuth();

  const primaryColor = branding?.colores?.primary || '#136dec';
  const nombreMarca = branding?.nombre || '';

  // --- Publicación state ---
  const [publicacion, setPublicacion] = useState<PublicacionAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Form state ---
  const [formData, setFormData] = useState({
    titulo: '',
    red_social: 'instagram' as RedSocial,
    tipo_contenido: 'imagen' as TipoContenido,
    fecha_programada: '',
    copy: '',
    media_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [enviandoRevision, setEnviandoRevision] = useState(false);

  // --- Single file upload ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Carrusel upload ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // --- Portada de reel ---
  const [selectedPortada, setSelectedPortada] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const portadaInputRef = useRef<HTMLInputElement>(null);

  // --- Feedback state ---
  const [feedback, setFeedback] = useState<FeedbackAPI[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // =====================================================
  // FETCH DATA
  // =====================================================

  const fetchPublicacion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await publicacionesService.getById(Number(id));
      if (!data) throw new Error('Publicación no encontrada');
      setPublicacion(data);
      setFormData({
        titulo: data.titulo || '',
        red_social: data.red_social,
        tipo_contenido: data.tipo_contenido,
        fecha_programada: extractDate(data.fecha_programada),
        copy: data.copy || '',
        media_url: data.media_url || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar publicación');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchFeedback = useCallback(async () => {
    if (!id) return;
    setFeedbackLoading(true);
    try {
      const data = await feedbackService.getByPublicacion(Number(id));
      setFeedback(data);
    } catch {
      // silenciar error de feedback
    } finally {
      setFeedbackLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPublicacion();
    fetchFeedback();
  }, [fetchPublicacion, fetchFeedback]);

  // Scroll al fondo del chat cuando llegan mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedback]);

  // =====================================================
  // FORM HANDLERS
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
    // Limpiar archivos al cambiar tipo
    cleanupFiles();
  };

  const cleanupFiles = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    filePreviews.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedPortada(null);
    if (portadaPreview) URL.revokeObjectURL(portadaPreview);
    setPortadaPreview(null);
    if (portadaInputRef.current) portadaInputRef.current.value = '';
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

  // =====================================================
  // SAVE / DELETE / ESTADO
  // =====================================================

  const handleEnviarRevision = async () => {
    if (!publicacion) return;
    setEnviandoRevision(true);
    try {
      await publicacionesService.update(publicacion.id, { estado: 'pendiente' });
      navigate('/approvals');
    } catch (err: any) {
      setFormError(err.message || 'Error al enviar a revisión');
    } finally {
      setEnviandoRevision(false);
    }
  };

  const handleSave = async () => {
    if (!publicacion) return;
    setSaving(true);
    setFormError(null);

    try {
      let mediaUrl: string | undefined = formData.media_url || undefined;
      let mediaType: string | undefined;

      const isCarrusel = formData.tipo_contenido === 'carrusel';

      if (isCarrusel && selectedFiles.length > 0) {
        // Subir archivos del carrusel
        setUploading(true);
        try {
          const uploadResults = await uploadMultipleFiles(selectedFiles);
          for (let i = 0; i < uploadResults.length; i++) {
            const result = uploadResults[i];
            await api.post('/publicacion-media.php', {
              publicacion_id: publicacion.id,
              media_url: result.url,
              media_type: result.media_type,
              media_public_id: result.public_id,
              orden: (publicacion.media?.length || 0) + i,
            });
          }
        } catch (err: any) {
          setFormError(err.message || 'Error al subir archivos del carrusel');
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      } else if (!isCarrusel && selectedFile) {
        // Subir archivo individual
        setUploading(true);
        try {
          const uploaded = await uploadFile(selectedFile);
          mediaUrl = uploaded.url;
          mediaType = uploaded.media_type;
        } catch (err: any) {
          setFormError(err.message || 'Error al subir archivo');
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
          setFormError(err.message || 'Error al subir portada');
          setSaving(false);
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      const updateData: Record<string, any> = {
        titulo: formData.titulo || undefined,
        red_social: formData.red_social,
        tipo_contenido: formData.tipo_contenido,
        fecha_programada: formData.fecha_programada,
        copy: formData.copy || undefined,
        media_url: mediaUrl,
        ...(portadaUrl && { portada_url: portadaUrl, portada_public_id: portadaPublicId }),
      };
      if (mediaType) updateData.media_type = mediaType;

      const updated = await publicacionesService.update(publicacion.id, updateData);
      setPublicacion(updated);
      cleanupFiles();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleEstadoChange = async (nuevoEstado: EstadoPublicacion) => {
    if (!publicacion) return;
    setSaving(true);
    setFormError(null);
    try {
      const updated = await publicacionesService.update(publicacion.id, { estado: nuevoEstado });
      setPublicacion(updated);
    } catch (err: any) {
      setFormError(err.message || 'Error al cambiar estado');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!publicacion) return;
    setDeleting(true);
    setFormError(null);
    try {
      await publicacionesService.delete(publicacion.id);
      navigate('/calendar');
    } catch (err: any) {
      setFormError(err.message || 'Error al eliminar');
      setDeleting(false);
    }
  };

  // =====================================================
  // FEEDBACK HANDLERS
  // =====================================================

  const handleSendComment = async () => {
    if (!newComment.trim() || !id) return;
    setSendingComment(true);
    try {
      const created = await feedbackService.create({
        publicacion_id: Number(id),
        comentario: newComment.trim(),
        accion: 'comentario',
      });
      setFeedback(prev => [...prev, created]);
      setNewComment('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch {
      // silenciar
    } finally {
      setSendingComment(false);
    }
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendComment();
    }
  };

  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // =====================================================
  // LOADING / ERROR
  // =====================================================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background-dark">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
      </div>
    );
  }

  if (error || !publicacion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background-dark gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="text-[#9da8b9]">{error || 'Publicación no encontrada'}</p>
        <button
          onClick={() => navigate('/calendar')}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Volver al calendario
        </button>
      </div>
    );
  }

  const estadoActual = ESTADOS.find(e => e.value === publicacion.estado);
  const isCarrusel = formData.tipo_contenido === 'carrusel';

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="flex-1 flex flex-col bg-background-dark min-h-0">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border-dark bg-surface-dark">
        <button
          onClick={() => navigate('/calendar')}
          className="size-9 flex items-center justify-center rounded-lg hover:bg-border-dark text-[#9da8b9] hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">Detalle de Publicación</h1>
          <p className="text-[#9da8b9] text-sm">ID: #{publicacion.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${estadoActual?.color}`}>
            {estadoActual?.label}
          </span>
        </div>
      </div>

      {/* Content: 3 columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] min-h-0 overflow-hidden">

        {/* ============================================= */}
        {/* COLUMNA 1 — Mockup Preview                    */}
        {/* ============================================= */}
        <div className="overflow-y-auto p-4 flex items-start justify-center border-b lg:border-b-0 lg:border-r border-border-dark">
          <div className="w-full">
            <MockupIPhone
              mediaUrl={publicacion.media_url}
              mediaType={publicacion.media_type}
              tipoContenido={formData.tipo_contenido}
              titulo={formData.titulo || publicacion.titulo}
              primaryColor={primaryColor}
              nombreMarca={nombreMarca}
              mediaItems={publicacion.media}
              portadaUrl={publicacion.portada_url}
            />
          </div>
        </div>

        {/* ============================================= */}
        {/* COLUMNA 2 — Formulario de edición             */}
        {/* ============================================= */}
        <div className="overflow-y-auto p-6">
          <div className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {formError}
              </div>
            )}

            {/* Estado + Botones de cambio */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-background-dark rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-[#9da8b9] text-sm">Estado:</span>
                <span className={`px-2 py-1 rounded text-xs font-bold text-white ${estadoActual?.color}`}>
                  {estadoActual?.label}
                </span>
              </div>
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

            {/* Red Social */}
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-2">Red Social</label>
              <div className="flex gap-2">
                {REDES_SOCIALES.map(red => (
                  <button
                    key={red.value}
                    type="button"
                    onClick={() => handleRedSocialClick(red.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      formData.red_social === red.value
                        ? 'bg-primary/20 border-primary text-white'
                        : 'bg-background-dark border-border-dark text-[#9da8b9] hover:text-white hover:border-[#3b4554]'
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
              <label className="block text-[#9da8b9] text-sm font-medium mb-2">Tipo de Contenido</label>
              <div className="flex gap-2">
                {TIPOS_CONTENIDO.map(tipo => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => handleTipoClick(tipo.value)}
                    className={`flex-1 py-2 px-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                      formData.tipo_contenido === tipo.value
                        ? 'bg-primary/20 border-primary text-white'
                        : 'bg-background-dark border-border-dark text-[#9da8b9] hover:text-white hover:border-[#3b4554]'
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
                <label className="block text-[#9da8b9] text-sm font-medium mb-1">Fecha Programada</label>
                <input
                  type="date"
                  name="fecha_programada"
                  value={formData.fecha_programada}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-[#9da8b9] text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Título de la publicación"
                  className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Copy */}
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">Copy / Texto</label>
              <textarea
                name="copy"
                value={formData.copy}
                onChange={handleChange}
                rows={4}
                placeholder="Escribe el texto de la publicación..."
                className="w-full px-3 py-2 bg-background-dark border border-border-dark rounded-lg text-white placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                {isCarrusel ? `Archivos (${selectedFiles.length} nuevos)` : 'Archivo'}
              </label>

              {isCarrusel ? (
                <div className="flex items-center gap-3">
                  <span className="text-[#9da8b9] text-sm">
                    {(publicacion.media?.length || 0) + selectedFiles.length} archivos cargados
                  </span>
                  {selectedFiles.length < 10 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white hover:bg-border-dark transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                      Agregar archivos
                    </button>
                  )}
                </div>
              ) : (
                (selectedFile || formData.media_url) ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white hover:bg-border-dark transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    Reemplazar archivo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-[#9da8b9] hover:text-white hover:bg-border-dark transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">cloud_upload</span>
                    Subir archivo
                  </button>
                )
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={formData.tipo_contenido === 'portada_reel' ? 'image/jpeg,image/png,image/gif,image/webp' : 'image/jpeg,image/png,image/gif,image/webp,video/mp4'}
                onChange={handleFileChange}
                className="hidden"
                multiple={isCarrusel}
              />

              {/* Portada del reel */}
              {formData.tipo_contenido === 'reel' && (
                <div className="mt-3 p-3 bg-background-dark rounded-lg border border-border-dark">
                  <label className="block text-[#9da8b9] text-sm font-medium mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">smart_display</span>
                    Portada del reel
                    <span className="text-[11px] text-[#9da8b9]/60 font-normal">(opcional)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {portadaPreview || publicacion.portada_url ? (
                      <>
                        <img
                          src={portadaPreview || publicacion.portada_url}
                          alt="Portada"
                          className="w-12 h-12 object-cover rounded-lg border border-border-dark"
                        />
                        <button
                          type="button"
                          onClick={() => portadaInputRef.current?.click()}
                          className="px-3 py-1.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white hover:bg-border-dark transition-colors flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">swap_horiz</span>
                          Reemplazar portada
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => portadaInputRef.current?.click()}
                        className="px-3 py-1.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-[#9da8b9] hover:text-white hover:bg-border-dark transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-base">add_photo_alternate</span>
                        Subir portada
                      </button>
                    )}
                  </div>
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

            {/* Info adicional */}
            <div className="flex items-center gap-4 text-xs text-[#9da8b9] pt-2 border-t border-border-dark">
              <span>Versión: {publicacion.version}</span>
              <span>•</span>
              <span>Creado: {new Date(publicacion.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Actualizado: {new Date(publicacion.updated_at).toLocaleDateString()}</span>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-between pt-4 border-t border-border-dark">
              {/* Eliminar */}
              <div>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
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

              {/* Enviar a revisión — solo si estado es modificar */}
              {publicacion?.estado === 'modificar' && (
                <button
                  onClick={handleEnviarRevision}
                  disabled={enviandoRevision}
                  className="px-5 py-2 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {enviandoRevision ? (
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">send</span>
                  )}
                  {enviandoRevision ? 'Enviando...' : 'Enviar a revisión'}
                </button>
              )}

              {/* Guardar */}
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {(saving || uploading) && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
                {uploading ? 'Subiendo archivo...' : saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* COLUMNA 3 — Chat de feedback                  */}
        {/* ============================================= */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-border-dark bg-surface-dark min-h-0">

          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-border-dark space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">chat</span>
                <h2 className="text-white font-bold text-sm">Conversación</h2>
                <span className="bg-border-dark text-[#9da8b9] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {feedback.length}
                </span>
              </div>
            </div>
            {publicacion.estado === 'modificar' && (
              <div className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">warning</span>
                El cliente pidió cambios
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {feedbackLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined text-2xl text-primary animate-spin">progress_activity</span>
              </div>
            ) : feedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#9da8b9]">
                <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                <p className="text-sm">Sin mensajes aún</p>
              </div>
            ) : (
              feedback.map(msg => {
                const isAgencia = msg.tipo_autor === 'agencia';
                return (
                  <div key={msg.id} className={`flex ${isAgencia ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      isAgencia
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-background-dark border border-border-dark text-white rounded-bl-md'
                    }`}>
                      <p className={`text-[10px] font-bold mb-1 ${isAgencia ? 'text-white/70' : 'text-[#9da8b9]'}`}>
                        {msg.autor_nombre}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.comentario}</p>
                      <p className={`text-[10px] mt-1 ${isAgencia ? 'text-white/50' : 'text-[#9da8b9]/70'}`}>
                        {new Date(msg.created_at).toLocaleString('es-AR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border-dark">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onInput={handleTextareaInput}
                onKeyDown={handleCommentKeyDown}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="flex-1 px-3 py-2 bg-background-dark border border-border-dark rounded-xl text-white text-sm placeholder-[#9da8b9]/50 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none max-h-24 overflow-y-auto"
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !newComment.trim()}
                className="size-9 flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                {sendingComment ? (
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-lg">send</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicacionDetailPage;
