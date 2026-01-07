import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  publicacionesService, 
  PublicacionAPI, 
  RedSocial, 
  TipoContenido,
  EstadoPublicacion 
} from '../services/publicaciones';
import { feedbackService, FeedbackAPI } from '../services/feedback';

// =====================================================
// CONSTANTS
// =====================================================

const ICONOS_RED: Record<RedSocial, string> = {
  instagram: 'photo_camera',
  facebook: 'public',
  twitter: 'tag',
  linkedin: 'work',
  tiktok: 'play_circle',
};

const ICONOS_TIPO: Record<TipoContenido, string> = {
  imagen: 'image',
  video: 'videocam',
  carrusel: 'view_carousel',
  story: 'amp_stories',
  reel: 'movie',
};

const COLORES_RED: Record<RedSocial, string> = {
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-600 to-blue-500',
  twitter: 'from-sky-500 to-sky-400',
  linkedin: 'from-blue-700 to-blue-600',
  tiktok: 'from-gray-800 to-gray-700',
};

type TabType = 'atencion' | 'pendiente';

// =====================================================
// COMPONENT
// =====================================================

const ApprovalsPage: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<PublicacionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('atencion');
  
  // Feedback
  const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackAPI[]>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Respuesta de agencia
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; publicacion: PublicacionAPI | null }>({ 
    isOpen: false, 
    publicacion: null 
  });
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // FETCH DATA
  // =====================================================
  
  useEffect(() => {
    fetchPublicaciones();
  }, [activeTab]);

  const fetchPublicaciones = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let data: PublicacionAPI[] = [];
      
      if (activeTab === 'atencion') {
        // Traer modificar y rechazado
        const modificar = await publicacionesService.getAll({ estado: 'modificar' });
        const rechazado = await publicacionesService.getAll({ estado: 'rechazado' });
        data = [...modificar, ...rechazado];
      } else {
        data = await publicacionesService.getAll({ estado: 'pendiente' });
      }
      
      setPublicaciones(data);
      
      // Cargar feedback para las que requieren atención
      if (activeTab === 'atencion') {
        for (const pub of data) {
          loadFeedback(pub.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async (publicacionId: number) => {
    if (feedbackMap[publicacionId]) return;
    
    setLoadingFeedback(publicacionId);
    try {
      const feedback = await feedbackService.getByPublicacion(publicacionId);
      setFeedbackMap(prev => ({ ...prev, [publicacionId]: feedback }));
    } catch (err) {
      console.error('Error cargando feedback:', err);
    } finally {
      setLoadingFeedback(null);
    }
  };

  // =====================================================
  // HANDLERS
  // =====================================================
  
  const handleUpdateEstado = async (id: number, nuevoEstado: EstadoPublicacion) => {
    setUpdatingId(id);
    
    try {
      await publicacionesService.update(id, { estado: nuevoEstado });
      setPublicaciones(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.publicacion) return;
    
    setDeleting(true);
    try {
      await publicacionesService.delete(deleteModal.publicacion.id);
      setPublicaciones(prev => prev.filter(p => p.id !== deleteModal.publicacion?.id));
      setDeleteModal({ isOpen: false, publicacion: null });
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendReply = async (publicacionId: number) => {
    if (!replyText.trim()) return;
    
    setSendingReply(true);
    try {
      const newFeedback = await feedbackService.create({
        publicacion_id: publicacionId,
        comentario: replyText.trim(),
        accion: 'comentario'
      });
      
      setFeedbackMap(prev => ({
        ...prev,
        [publicacionId]: [...(prev[publicacionId] || []), newFeedback]
      }));
      
      setReplyText('');
      setReplyingTo(null);
    } catch (err: any) {
      setError(err.message || 'Error al enviar respuesta');
    } finally {
      setSendingReply(false);
    }
  };

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      loadFeedback(id);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastClientFeedback = (publicacionId: number): FeedbackAPI | null => {
    const feedback = feedbackMap[publicacionId] || [];
    const clientFeedback = feedback.filter(f => f.tipo_autor === 'cliente');
    return clientFeedback.length > 0 ? clientFeedback[clientFeedback.length - 1] : null;
  };

  // Contadores
  const countAtencion = publicaciones.length;
  const countPendiente = publicaciones.length;

  // =====================================================
  // LOADING
  // =====================================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-[#9da8b9]">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span>Cargando publicaciones...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col">
        <h2 className="text-white text-3xl font-black leading-tight tracking-tight">
          Aprobaciones
        </h2>
        <p className="text-[#9da8b9] text-sm">
          Gestiona el contenido y responde a los comentarios de tus clientes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border-dark">
        <button
          onClick={() => setActiveTab('atencion')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'atencion'
              ? 'text-orange-500 border-orange-500'
              : 'text-[#9da8b9] border-transparent hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-lg">feedback</span>
          Requieren Atención
        </button>
        <button
          onClick={() => setActiveTab('pendiente')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'pendiente'
              ? 'text-amber-500 border-amber-500'
              : 'text-[#9da8b9] border-transparent hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-lg">hourglass_top</span>
          Esperando Revisión
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto px-3 py-1 bg-red-500/20 rounded hover:bg-red-500/30 transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Empty State */}
      {publicaciones.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-surface-dark border border-dashed border-border-dark rounded-2xl">
          <div className={`size-16 rounded-full flex items-center justify-center mb-4 ${
            activeTab === 'atencion' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            <span className="material-symbols-outlined text-3xl">
              {activeTab === 'atencion' ? 'task_alt' : 'inbox'}
            </span>
          </div>
          <h3 className="text-white text-lg font-bold">
            {activeTab === 'atencion' ? '¡Todo al día!' : 'Sin publicaciones pendientes'}
          </h3>
          <p className="text-[#9da8b9] text-sm mt-1">
            {activeTab === 'atencion' 
              ? 'No hay contenidos que requieran tu atención.' 
              : 'No hay contenidos esperando revisión del cliente.'}
          </p>
        </div>
      ) : (
        /* Lista de Publicaciones */
        <div className="flex flex-col gap-4">
          {publicaciones.map((pub) => {
            const isUpdating = updatingId === pub.id;
            const isExpanded = expandedId === pub.id;
            const feedback = feedbackMap[pub.id] || [];
            const lastClientFeedback = getLastClientFeedback(pub.id);
            const isLoadingFeedback = loadingFeedback === pub.id;
            const isRechazado = pub.estado === 'rechazado';
            const isModificar = pub.estado === 'modificar';
            
            return (
              <div 
                key={pub.id} 
                className={`bg-surface-dark border rounded-2xl overflow-hidden transition-all ${
                  isUpdating ? 'opacity-50' : ''
                } ${
                  isRechazado ? 'border-red-500/40' : 
                  isModificar ? 'border-orange-500/30' : 
                  'border-border-dark'
                }`}
              >
                {/* Main Content */}
                <div className="flex flex-col md:flex-row">
                  {/* Media Preview */}
                  <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#111418]">
                    {pub.media_url ? (
                      <img 
                        src={pub.media_url} 
                        alt="" 
                        className="absolute inset-0 size-full object-cover opacity-80"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400/1a1f26/9da8b9?text=Sin+imagen';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[#9da8b9] text-5xl">
                          {ICONOS_TIPO[pub.tipo_contenido]}
                        </span>
                      </div>
                    )}
                    
                    {/* Badge tipo contenido */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {pub.tipo_contenido}
                    </div>
                    
                    {/* Badge red social */}
                    <div className={`absolute bottom-2 left-2 size-8 rounded-lg bg-linear-to-br ${COLORES_RED[pub.red_social]} flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white text-base">
                        {ICONOS_RED[pub.red_social]}
                      </span>
                    </div>

                    {/* Badge estado para rechazado */}
                    {isRechazado && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">close</span>
                        Rechazado
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[#9da8b9] text-xs font-medium">
                          {pub.nombre_cliente}
                        </span>
                        <span className="text-[#5c6670]">•</span>
                        <span className="text-[#9da8b9] text-xs">
                          {formatDate(pub.fecha_programada)}
                        </span>
                        {isModificar && (
                          <>
                            <span className="text-[#5c6670]">•</span>
                            <span className="text-orange-500 text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">edit_note</span>
                              Pidió cambios
                            </span>
                          </>
                        )}
                        {isRechazado && (
                          <>
                            <span className="text-[#5c6670]">•</span>
                            <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">block</span>
                              Rechazado por el cliente
                            </span>
                          </>
                        )}
                        {activeTab === 'pendiente' && (
                          <>
                            <span className="text-[#5c6670]">•</span>
                            <span className="text-amber-500 text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">hourglass_top</span>
                              Esperando revisión
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-white text-lg font-bold mb-2">
                        {pub.titulo || 'Sin título'}
                      </h3>
                      <p className="text-[#9da8b9] text-sm line-clamp-2 leading-relaxed">
                        {pub.copy || 'Sin descripción'}
                      </p>
                    </div>

                    {/* Último comentario del cliente (preview) - Solo en tab atención */}
                    {activeTab === 'atencion' && lastClientFeedback && !isExpanded && (
                      <div 
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          isRechazado 
                            ? 'bg-red-500/5 border border-red-500/20 hover:bg-red-500/10'
                            : 'bg-orange-500/5 border border-orange-500/20 hover:bg-orange-500/10'
                        }`}
                        onClick={() => toggleExpand(pub.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                            isRechazado ? 'bg-red-500/20' : 'bg-orange-500/20'
                          }`}>
                            <span className={`material-symbols-outlined text-sm ${
                              isRechazado ? 'text-red-500' : 'text-orange-500'
                            }`}>person</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-medium">{lastClientFeedback.autor_nombre}</span>
                              <span className="text-[#5c6670] text-xs">{formatDateTime(lastClientFeedback.created_at)}</span>
                            </div>
                            <p className="text-[#9da8b9] text-sm line-clamp-2">{lastClientFeedback.comentario}</p>
                          </div>
                          <span className="material-symbols-outlined text-[#5c6670] text-lg">expand_more</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border-dark/50 mt-auto">
                      {activeTab === 'atencion' ? (
                        // Tab Requieren Atención
                        isRechazado ? (
                          // Rechazado: solo eliminar
                          <>
                            <button 
                              onClick={() => toggleExpand(pub.id)}
                              className="flex-1 h-9 bg-border-dark text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#3b4554] transition-colors text-sm font-medium"
                            >
                              <span className="material-symbols-outlined text-base">
                                {isExpanded ? 'expand_less' : 'chat'}
                              </span>
                              {isExpanded ? 'Cerrar' : 'Ver comentario'}
                            </button>
                            <button 
                              onClick={() => setDeleteModal({ isOpen: true, publicacion: pub })}
                              disabled={isUpdating}
                              className="h-9 px-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border border-red-500/20 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                              Eliminar
                            </button>
                          </>
                        ) : (
                          // Modificar: editar, ver chat, enviar a revisión
                          <>
                            <button 
                              onClick={() => handleUpdateEstado(pub.id, 'pendiente')}
                              disabled={isUpdating}
                              className="flex-1 h-9 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border border-primary/20 disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-base">send</span>
                              Enviar a Revisión
                            </button>
                            <button 
                              onClick={() => toggleExpand(pub.id)}
                              className="h-9 px-3 bg-border-dark text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#3b4554] transition-colors text-sm font-medium"
                            >
                              <span className="material-symbols-outlined text-base">
                                {isExpanded ? 'expand_less' : 'chat'}
                              </span>
                            </button>
                          </>
                        )
                      ) : (
                        // Tab Esperando Revisión: solo editar
                        <>
                          <Link 
                            to={`/calendar?publicacion_id=${pub.id}`}
                            className="flex-1 h-9 bg-border-dark text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#3b4554] transition-colors text-sm font-medium"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                            Editar contenido
                          </Link>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <span className="material-symbols-outlined text-amber-500 text-base">schedule</span>
                            <span className="text-amber-500 text-xs font-medium">Esperando al cliente</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Feedback Section */}
                {isExpanded && (
                  <div className="border-t border-border-dark bg-[#111418] p-5">
                    <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">forum</span>
                      Conversación
                    </h4>
                    
                    {isLoadingFeedback ? (
                      <div className="flex items-center justify-center py-8 text-[#9da8b9]">
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        Cargando conversación...
                      </div>
                    ) : feedback.length === 0 ? (
                      <p className="text-[#9da8b9] text-sm text-center py-4">No hay comentarios aún.</p>
                    ) : (
                      <div className="flex flex-col gap-3 mb-4 max-h-80 overflow-y-auto">
                        {feedback.map((fb) => (
                          <div 
                            key={fb.id} 
                            className={`flex gap-3 ${fb.tipo_autor === 'agencia' ? 'flex-row-reverse' : ''}`}
                          >
                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                              fb.tipo_autor === 'cliente' 
                                ? 'bg-orange-500/20 text-orange-500' 
                                : 'bg-primary/20 text-primary'
                            }`}>
                              <span className="material-symbols-outlined text-sm">person</span>
                            </div>
                            <div className={`flex-1 max-w-[80%] ${fb.tipo_autor === 'agencia' ? 'text-right' : ''}`}>
                              <div className={`inline-block p-3 rounded-xl ${
                                fb.tipo_autor === 'cliente'
                                  ? 'bg-[#1a1d23] border border-border-dark'
                                  : 'bg-primary/10 border border-primary/20'
                              }`}>
                                <div className={`flex items-center gap-2 mb-1 ${fb.tipo_autor === 'agencia' ? 'justify-end' : ''}`}>
                                  <span className="text-white text-xs font-medium">{fb.autor_nombre}</span>
                                  {fb.accion !== 'comentario' && (
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                      fb.accion === 'aprobar' ? 'bg-emerald-500/20 text-emerald-500' :
                                      fb.accion === 'modificar' ? 'bg-orange-500/20 text-orange-500' :
                                      'bg-red-500/20 text-red-500'
                                    }`}>
                                      {fb.accion === 'aprobar' ? 'Aprobó' : 
                                       fb.accion === 'modificar' ? 'Pidió cambios' : 'Rechazó'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[#9da8b9] text-sm">{fb.comentario}</p>
                              </div>
                              <p className={`text-[#5c6670] text-[10px] mt-1 ${fb.tipo_autor === 'agencia' ? 'text-right' : ''}`}>
                                {formatDateTime(fb.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Input - Solo si no está rechazado */}
                    {!isRechazado && (
                      <div className="flex gap-3 pt-4 border-t border-border-dark">
                        <input
                          type="text"
                          value={replyingTo === pub.id ? replyText : ''}
                          onChange={(e) => {
                            setReplyingTo(pub.id);
                            setReplyText(e.target.value);
                          }}
                          onFocus={() => setReplyingTo(pub.id)}
                          placeholder="Escribí una respuesta..."
                          className="flex-1 px-4 py-2.5 bg-[#1a1d23] border border-border-dark rounded-lg text-white text-sm placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <button
                          onClick={() => handleSendReply(pub.id)}
                          disabled={sendingReply || !replyText.trim()}
                          className="px-4 py-2.5 bg-primary hover:bg-blue-600 disabled:bg-primary/50 text-white rounded-lg font-bold text-sm transition-all flex items-center gap-2"
                        >
                          {sendingReply ? (
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-base">send</span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.publicacion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-3xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">¿Eliminar publicación?</h3>
                <p className="text-[#9da8b9] text-sm mt-2">
                  Esta publicación fue rechazada por el cliente. 
                  Al eliminarla se borrará permanentemente junto con todos sus comentarios.
                </p>
                {deleteModal.publicacion.titulo && (
                  <p className="text-white text-sm mt-3 font-medium">
                    "{deleteModal.publicacion.titulo}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2 w-full">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, publicacion: null })}
                  className="flex-1 px-5 py-2.5 border border-border-dark text-[#9da8b9] hover:text-white hover:border-[#3d4654] rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-xl font-bold transition-all"
                >
                  {deleting ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalsPage;