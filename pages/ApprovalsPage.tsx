import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  publicacionesService,
  PublicacionAPI,
  RedSocial,
  TipoContenido
} from '../services/publicaciones';
import notificacionesService from '../services/notificaciones';

// =====================================================
// CONSTANTS
// =====================================================

const ICONOS_RED: Record<RedSocial, string> = {
  instagram: 'photo_camera',
  facebook: 'public',
  tiktok: 'play_circle',
};

const ICONOS_TIPO: Record<TipoContenido, string> = {
  imagen: 'image',
  carrusel: 'view_carousel',
  story: 'amp_stories',
  reel: 'movie',
};

const COLORES_RED: Record<RedSocial, string> = {
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-600 to-blue-500',
  tiktok: 'from-gray-800 to-gray-700',
};

type TabType = 'atencion' | 'pendiente';

interface ClienteGroup {
  clienteId: number;
  nombreCliente: string;
  publicaciones: PublicacionAPI[];
  tieneModificar: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState<PublicacionAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('atencion');

  // Delete modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; publicacion: PublicacionAPI | null }>({
    isOpen: false,
    publicacion: null
  });
  const [deleting, setDeleting] = useState(false);

  // Retirar de revisión
  const [retirandoId, setRetirandoId] = useState<number | null>(null);

  // Notificaciones
  const [notifyingClienteId, setNotifyingClienteId] = useState<number | null>(null);
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  // =====================================================
  // GROUPING
  // =====================================================

  const gruposPorCliente = useMemo<ClienteGroup[]>(() => {
    if (activeTab !== 'atencion') return [];

    const map = new Map<number, ClienteGroup>();
    for (const pub of publicaciones) {
      const cid = pub.cliente_id ?? 0;
      const nombre = pub.nombre_cliente ?? 'Sin cliente';
      if (!map.has(cid)) {
        map.set(cid, { clienteId: cid, nombreCliente: nombre, publicaciones: [], tieneModificar: false });
      }
      const group = map.get(cid)!;
      group.publicaciones.push(pub);
      if (pub.estado === 'modificar') group.tieneModificar = true;
    }
    return Array.from(map.values());
  }, [publicaciones, activeTab]);

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
        const modificar = await publicacionesService.getAll({ estado: 'modificar' });
        const rechazado = await publicacionesService.getAll({ estado: 'rechazado' });
        data = [...modificar, ...rechazado];
      } else {
        data = await publicacionesService.getAll({ estado: 'pendiente' });
      }

      setPublicaciones(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLERS
  // =====================================================

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

  const handleOpenPost = (pubId: number) => {
    navigate(`/calendar/publicacion/${pubId}`);
  };

  const handleRetirar = async (e: React.MouseEvent, pubId: number) => {
    e.stopPropagation();
    setRetirandoId(pubId);
    try {
      await publicacionesService.update(pubId, { estado: 'pendiente' });
      fetchPublicaciones();
    } catch (err: any) {
      setError(err.message || 'Error al retirar de revisión');
    } finally {
      setRetirandoId(null);
    }
  };

  const handleNotificarCliente = async (clienteId: number) => {
    setNotifyingClienteId(clienteId);
    setNotifySuccess(null);
    try {
      await notificacionesService.notificarCliente(clienteId);
      setNotifySuccess(`Cliente notificado`);
      setTimeout(() => setNotifySuccess(null), 3000);
      fetchPublicaciones();
    } catch (err: any) {
      setError(err.message || 'Error al notificar al cliente');
    } finally {
      setNotifyingClienteId(null);
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

  // =====================================================
  // CARD RENDERER
  // =====================================================

  const renderCard = (pub: PublicacionAPI) => {
    const isRechazado = pub.estado === 'rechazado';
    const isModificar = pub.estado === 'modificar';

    return (
      <div
        key={pub.id}
        onClick={() => handleOpenPost(pub.id)}
        className={`bg-surface-dark border rounded-2xl overflow-hidden transition-all cursor-pointer hover:ring-1 hover:ring-primary/40 ${
          isRechazado ? 'border-red-500/40' :
          isModificar ? 'border-orange-500/30' :
          'border-border-dark'
        }`}
      >
        {/* Main Content */}
        <div className="flex flex-col md:flex-row">
          {/* Media Preview */}
          <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative overflow-hidden bg-[#111418]">
            {(() => {
              const previewUrl = (pub.media && pub.media.length > 0) ? pub.media[0].media_url : pub.media_url;
              const previewType = (pub.media && pub.media.length > 0) ? pub.media[0].media_type : pub.media_type;

              return previewUrl ? (
                previewType?.startsWith('video') ? (
                  <video src={previewUrl} className="absolute inset-0 size-full object-cover opacity-80" muted playsInline />
                ) : (
                  <img
                    src={previewUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-80"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400/1a1f26/9da8b9?text=Sin+imagen';
                    }}
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#9da8b9] text-5xl">
                    {ICONOS_TIPO[pub.tipo_contenido]}
                  </span>
                </div>
              );
            })()}

            {/* Badge tipo contenido */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white uppercase tracking-wider">
              {pub.tipo_contenido}
            </div>

            {/* Badge cantidad de slides (carrusel) */}
            {pub.media && pub.media.length > 1 && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">layers</span>
                {pub.media.length}
              </div>
            )}

            {/* Badge red social */}
            <div className={`absolute bottom-2 left-2 size-8 rounded-lg bg-linear-to-br ${COLORES_RED[pub.red_social]} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-base">
                {ICONOS_RED[pub.red_social]}
              </span>
            </div>

            {/* Badge estado para rechazado */}
            {isRechazado && !(pub.media && pub.media.length > 1) && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">close</span>
                Rechazado
              </div>
            )}
            {isRechazado && pub.media && pub.media.length > 1 && (
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-500 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
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

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border-dark/50 mt-auto">
              {activeTab === 'atencion' ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenPost(pub.id); }}
                    className="flex-1 h-9 bg-border-dark text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#3b4554] transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    Ver detalle
                  </button>
                  <button
                    onClick={(e) => handleRetirar(e, pub.id)}
                    disabled={retirandoId === pub.id}
                    className="h-9 px-4 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-white/10 disabled:opacity-50"
                  >
                    {retirandoId === pub.id ? (
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-base">undo</span>
                    )}
                    Reenviar a revisión
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, publicacion: pub }); }}
                    className="h-9 px-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Eliminar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenPost(pub.id); }}
                    className="flex-1 h-9 bg-border-dark text-white rounded-lg flex items-center justify-center gap-2 hover:bg-[#3b4554] transition-colors text-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-base">visibility</span>
                    Ver detalle
                  </button>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <span className="material-symbols-outlined text-amber-500 text-base">schedule</span>
                    <span className="text-amber-500 text-xs font-medium">Esperando al cliente</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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

      {/* Toast de éxito */}
      {notifySuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 flex items-center gap-3">
          <span className="material-symbols-outlined">check_circle</span>
          <span>{notifySuccess}</span>
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
      ) : activeTab === 'atencion' ? (
        /* Lista agrupada por cliente */
        <div className="flex flex-col gap-8">
          {gruposPorCliente.map((grupo) => {
            const isNotifying = notifyingClienteId === grupo.clienteId;
            return (
              <div key={grupo.clienteId} className="flex flex-col gap-4">
                {/* Header del grupo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {grupo.nombreCliente.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-white font-bold text-base">{grupo.nombreCliente}</h3>
                    <span className="text-[#5c6670] text-xs">
                      {grupo.publicaciones.length} publicación{grupo.publicaciones.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  {grupo.tieneModificar && (
                    <button
                      onClick={() => handleNotificarCliente(grupo.clienteId)}
                      disabled={isNotifying}
                      className="flex items-center gap-2 h-9 px-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                    >
                      {isNotifying ? (
                        <>
                          <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                          Notificando...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-base">send</span>
                          Notificar al cliente
                        </>
                      )}
                    </button>
                  )}
                </div>
                {/* Cards del grupo */}
                <div className="flex flex-col gap-4">
                  {grupo.publicaciones.map(renderCard)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Lista plana para tab pendiente */
        <div className="flex flex-col gap-4">
          {publicaciones.map(renderCard)}
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
