// =====================================================
// SOCIALFLOW - ReviewDetail (Componente compartido)
// Vista de aprobacion/review de una publicacion
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { PublicacionAPI } from '../services/publicaciones';
import { feedbackService, FeedbackAPI } from '../services/feedback';
import MockupIPhone from './MockupIPhone';
import logo from '../assets/logo.webp';

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
        return { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-500', label: 'PENDIENTE DE REVISION' };
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

  const [feedback, setFeedback] = useState<FeedbackAPI[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedbackService.getByPublicacion(pub.id)
      .then(data => setFeedback(data))
      .catch(() => {})
      .finally(() => setFeedbackLoading(false));
  }, [pub.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feedback]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      const created = await feedbackService.create({
        publicacion_id: pub.id,
        comentario: newComment.trim(),
        accion: 'comentario',
      });
      setFeedback(prev => [...prev, created]);
      setNewComment('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch {
      // silenciar
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0e14] text-white">
      {/* Header — igual que antes */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#0b0e14] border-b border-white/5">
        <div className="flex items-center gap-3">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt={branding.nombre} className="h-8 w-auto object-contain" />
          ) : (
            <img src={logo} alt="SocialFlow" className="size-10 rounded-xl bg-primary p-1.5" />
          )}
          <span className="text-lg font-bold tracking-tight hidden sm:inline">{branding.nombre}</span>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="hidden sm:inline">Volver al Calendario</span>
          </button>
          <div className="hidden md:flex items-center gap-3 pl-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-sm font-bold text-white leading-none">{user?.nombre || 'Usuario'}</p>
            </div>
            <div className="size-10 rounded-full bg-orange-200 border-2 border-slate-800 overflow-hidden">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nombre || 'U')}&background=ffedd5&color=c2410c`} alt="User" />
            </div>
          </div>
        </div>
      </header>

      {/* 3 columnas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] min-h-0 overflow-hidden max-w-7xl mx-auto w-full">

        {/* COL 1 — Mockup */}
        <div className="overflow-y-auto p-4 flex items-start justify-center border-b lg:border-b-0 lg:border-r border-white/5">
          <div className="w-full">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 text-center">Previsualización móvil</p>
            <MockupIPhone
              mediaUrl={pub.media_url}
              mediaType={pub.media_type}
              tipoContenido={pub.tipo_contenido}
              titulo={pub.titulo}
              primaryColor={primaryColor}
              nombreMarca={user?.empresa || branding.slug}
              mediaItems={pub.media?.map(m => ({ id: m.id, media_url: m.media_url, media_type: m.media_type, orden: m.orden }))}
              portadaUrl={pub.portada_url}
            />
            <div className="flex justify-center mt-3">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400 capitalize">
                {pub.tipo_contenido} • {pub.red_social}
              </span>
            </div>
          </div>
        </div>

        {/* COL 2 — Info + Acción */}
        <div className="overflow-y-auto p-6">
          <div className="space-y-6">

            {/* Título y estado */}
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl font-black capitalize">Post: {fechaFormateada}</h2>
                <span className={`px-3 py-1 ${estadoBadge.bg} border ${estadoBadge.border} ${estadoBadge.text} text-[10px] font-black uppercase tracking-widest rounded-full`}>
                  {estadoBadge.label}
                </span>
              </div>
              <div className="flex gap-4 text-slate-400 text-sm flex-wrap">
                <p>Versión: <span className="text-white">{pub.version || 1}.0</span></p>
                <span>•</span>
                <p>Título: <span className="text-white">{pub.titulo || 'Sin título'}</span></p>
                <span>•</span>
                <p>Canal: <span className="text-white capitalize">{pub.red_social} {pub.tipo_contenido}</span></p>
              </div>
            </div>

            {/* Copy */}
            {pub.copy && (
              <div className="bg-[#161b22] border border-white/5 rounded-2xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Copy</h4>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{pub.copy}</p>
              </div>
            )}

            {/* Feedback + Acciones */}
            <div className="bg-[#161b22] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-base" style={{ color: primaryColor }}>chat</span>
                <h3 className="font-bold">Comentarios y Feedback</h3>
              </div>
              <p className="text-slate-400 text-xs mb-4">Si solicitás cambios, el comentario es obligatorio.</p>

              <div className="relative">
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe aquí tus comentarios sobre la imagen, el copy o los hashtags..."
                  className="w-full bg-[#0d1117] border border-white/10 rounded-xl p-4 text-sm min-h-32 focus:outline-none transition-all resize-none"
                  onFocus={(e) => e.target.style.borderColor = primaryColor}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {pub.estado === 'aprobado' || pub.estado === 'rechazado' ? (
                <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${
                  pub.estado === 'aprobado'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  <span className="material-symbols-outlined text-base">
                    {pub.estado === 'aprobado' ? 'check_circle' : 'cancel'}
                  </span>
                  {pub.estado === 'aprobado' ? 'Ya aprobaste este contenido' : 'Ya rechazaste este contenido'}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-4 gap-3">
                  <button
                    onClick={() => onAction(pub.id, 'rechazado', comentario)}
                    disabled={isSubmitting}
                    className="text-slate-500 hover:text-red-400 flex items-center justify-center gap-2 text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                    Rechazar
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => onAction(pub.id, 'modificar', comentario)}
                      disabled={isSubmitting || !comentario.trim()}
                      className="px-4 h-10 border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                      Pedir Cambios
                    </button>
                    <button
                      onClick={() => onAction(pub.id, 'aprobado', comentario)}
                      disabled={isSubmitting}
                      className="px-4 h-10 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px -10px ${primaryColor}50` }}
                    >
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                      Aprobar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COL 3 — Chat historial (read-only) */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 bg-[#0d1117] min-h-0">

          {/* Chat header */}
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base" style={{ color: primaryColor }}>forum</span>
              <h2 className="text-white font-bold text-sm">Historial</h2>
              <span className="bg-white/5 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {feedback.length}
              </span>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {feedbackLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="material-symbols-outlined text-2xl animate-spin" style={{ color: primaryColor }}>progress_activity</span>
              </div>
            ) : feedback.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                <p className="text-sm">Sin actividad aún</p>
              </div>
            ) : (
              feedback.map(msg => {
                const isAgencia = msg.tipo_autor === 'agencia';
                const esComentario = msg.accion === 'comentario';
                const fechaFormateada = new Date(msg.created_at).toLocaleString('es-AR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                });

                if (!esComentario) {
                  const accionLabel: Record<string, string> = {
                    aprobar: 'aprobó',
                    modificar: 'solicitó cambios',
                    rechazar: 'rechazó',
                  };
                  return (
                    <div key={msg.id} className="flex justify-center my-1">
                      <span className="text-xs text-white/30 italic">
                        {msg.autor_nombre} {accionLabel[msg.accion] ?? msg.accion} · {fechaFormateada}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isAgencia ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                      isAgencia
                        ? 'bg-[#161b22] border border-white/5 text-white rounded-bl-md'
                        : 'text-white rounded-br-md'
                    }`}
                    style={!isAgencia ? { backgroundColor: primaryColor } : {}}
                    >
                      <p className={`text-[10px] font-bold mb-1 ${isAgencia ? 'text-slate-400' : 'text-white/70'}`}>
                        {msg.autor_nombre}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.comentario}</p>
                      <p className={`text-[10px] mt-1 ${isAgencia ? 'text-slate-500' : 'text-white/50'}`}>
                        {fechaFormateada}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input comentario libre */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onInput={() => {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendComment();
                  }
                }}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="flex-1 px-3 py-2 bg-[#161b22] border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 resize-none max-h-24 overflow-y-auto"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !newComment.trim()}
                className="size-9 flex items-center justify-center rounded-xl text-white hover:opacity-80 transition-opacity disabled:opacity-30"
                style={{ backgroundColor: primaryColor }}
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

export default ReviewDetail;
