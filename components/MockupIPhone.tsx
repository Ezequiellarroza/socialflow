// =====================================================
// SOCIALFLOW - Mockup iPhone 14/15 (Componente Reutilizable)
// =====================================================

import React, { useState } from 'react';

// =====================================================
// TYPES
// =====================================================

interface MediaItem {
  id?: number;
  media_url: string;
  media_type?: string;
  orden?: number;
}

interface MockupIPhoneProps {
  mediaUrl?: string;
  mediaType?: string;
  tipoContenido: 'imagen' | 'carrusel' | 'story' | 'reel' | 'portada_reel';
  titulo?: string;
  primaryColor: string;
  nombreMarca?: string;
  mediaItems?: MediaItem[];
  portadaUrl?: string;
}

// =====================================================
// COMPONENT
// =====================================================

const MockupIPhone: React.FC<MockupIPhoneProps> = ({
  mediaUrl,
  mediaType,
  tipoContenido,
  titulo,
  primaryColor,
  nombreMarca,
  mediaItems,
  portadaUrl,
}) => {
  const isVertical = tipoContenido === 'story' || tipoContenido === 'reel';
  const isVideo = mediaType?.startsWith('video');

  // Video play state
  const [isPlaying, setIsPlaying] = useState(false);

  // Carrusel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const isCarrusel = !isVertical && mediaItems && mediaItems.length > 1;
  // Reset play state on slide change
  React.useEffect(() => {
    setIsPlaying(false);
  }, [currentIndex]);

  // Reset play state on publication change
  React.useEffect(() => {
    setIsPlaying(false);
  }, [mediaUrl, mediaItems]);

  const tipoIcon: Record<string, string> = {
    imagen: 'image',
    carrusel: 'view_carousel',
    reel: 'play_circle',
    story: 'vertical_split',
    portada_reel: 'smart_display',
  };

  const currentItem = isCarrusel ? mediaItems[currentIndex] : null;
  const currentMediaUrl = currentItem?.media_url ?? mediaUrl;
  const currentIsVideo = currentItem ? currentItem.media_type?.startsWith('video') : isVideo;

  return (
    <div className={`relative mx-auto w-full ${isVertical ? 'max-w-70' : 'max-w-85'} bg-black rounded-[2.5rem] border-[6px] border-[#1e232d] shadow-2xl overflow-hidden ring-1 ring-white/10`}>
      {/* Status Bar con Dynamic Island */}
      <div className="relative px-5 pt-3 pb-2">
        {/* Dynamic Island */}
        <div className="mx-auto w-28 h-6.25 bg-black rounded-full relative z-10" />
        {/* Hora y iconos */}
        <div className="absolute inset-x-0 top-3 px-7 flex justify-between items-center text-[11px] font-semibold text-white">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-[14px]">wifi</span>
            <span className="material-symbols-outlined text-[14px]">battery_full</span>
          </div>
        </div>
      </div>

      {isVertical ? (
        /* ============================================= */
        /* Story/Reel View                               */
        /* ============================================= */
        <div className="relative">
          {/* Header Story */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 p-4 bg-linear-to-b from-black/60 to-transparent">
            <div
              className="size-8 rounded-full border-2"
              style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}20` }}
            ></div>
            <div className="flex flex-col flex-1">
              <span className="text-[12px] font-bold text-white">{nombreMarca || 'marca_cliente'}</span>
              <span className="text-[10px] text-white/70">hace 2h</span>
            </div>
            <span className="material-symbols-outlined text-white">more_horiz</span>
          </div>

          {/* Media vertical */}
          <div className="aspect-9/16 w-full bg-[#111] overflow-hidden relative">
            {/* Badge tipo contenido */}
            <span className="absolute top-12 left-2 z-20 flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px] uppercase tracking-wide">
              <span className="material-symbols-outlined text-[12px]">{tipoIcon[tipoContenido] || 'image'}</span>
              {tipoContenido}
            </span>

            {mediaUrl ? (
              isVideo ? (
                !isPlaying ? (
                  <div className="relative w-full h-full">
                    {portadaUrl ? (
                      <img src={portadaUrl} className="w-full h-full object-cover" alt="Portada reel" />
                    ) : (
                      <video src={mediaUrl} preload="metadata" className="w-full h-full object-cover" muted playsInline />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-black text-4xl ml-1">play_arrow</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <video src={mediaUrl} className="w-full h-full object-cover" controls autoPlay muted playsInline />
                )
              ) : (
                <img src={mediaUrl} className="w-full h-full object-cover" alt="Story" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <span className="material-symbols-outlined text-6xl">image</span>
              </div>
            )}
          </div>

          {/* Footer Story - ocultar en videos para no tapar controles */}
          {!isVideo && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/60 to-transparent">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enviar mensaje"
                  className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/50"
                  disabled
                />
                <span className="material-symbols-outlined text-white text-2xl">favorite_border</span>
                <span className="material-symbols-outlined text-white text-2xl">send</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================= */
        /* Post/Carrusel View                            */
        /* ============================================= */
        <>
          {/* Instagram Header */}
          <div className="px-4 py-2 flex items-center justify-between">
            <span className="material-symbols-outlined text-2xl">photo_camera</span>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-2xl">favorite_border</span>
              <span className="material-symbols-outlined text-2xl">send</span>
            </div>
          </div>

          {/* Post Header */}
          <div className="flex items-center gap-3 px-4 py-2">
            <div
              className="size-8 rounded-full border-2"
              style={{ borderColor: primaryColor, backgroundColor: `${primaryColor}20` }}
            ></div>
            <div className="flex flex-col flex-1">
              <span className="text-[12px] font-bold">{nombreMarca || 'marca_cliente'}</span>
              <span className="text-[10px] text-slate-400">{titulo || 'Publicación'}</span>
            </div>
            <span className="material-symbols-outlined text-lg">more_horiz</span>
          </div>

          {/* Media del Post */}
          <div className="relative aspect-4/5 w-full bg-[#111] overflow-hidden">
            {/* Badge tipo contenido */}
            <span className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-[10px] uppercase tracking-wide">
              <span className="material-symbols-outlined text-[12px]">{tipoIcon[tipoContenido] || 'image'}</span>
              {tipoContenido === 'portada_reel' ? 'portada reel' : tipoContenido}
            </span>

            {/* Overlay portada de reel */}
            {tipoContenido === 'portada_reel' && (
              <span className="absolute bottom-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-white text-[9px]">
                <span className="material-symbols-outlined text-[11px]">play_circle</span>
                Reel
              </span>
            )}

            {currentMediaUrl ? (
              currentIsVideo ? (
                isPlaying ? (
                  <video src={currentMediaUrl} className="w-full h-full object-contain" controls autoPlay muted playsInline />
                ) : (
                  <div className="relative w-full h-full">
                    <video src={currentMediaUrl} preload="metadata" className="w-full h-full object-contain" muted playsInline />
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-black text-4xl ml-1">play_arrow</span>
                      </div>
                    </button>
                  </div>
                )
              ) : (
                <img src={currentMediaUrl} className="w-full h-full object-contain" alt="Post" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <span className="material-symbols-outlined text-6xl">image</span>
              </div>
            )}

            {/* Flechas carrusel */}
            {isCarrusel && (
              <>
                {currentIndex > 0 && (
                  <button
                    onClick={() => setCurrentIndex(i => i - 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-white text-base">chevron_left</span>
                  </button>
                )}
                {currentIndex < mediaItems.length - 1 && (
                  <button
                    onClick={() => setCurrentIndex(i => i + 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 size-7 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-white text-base">chevron_right</span>
                  </button>
                )}
              </>
            )}

            {/* Dots indicadores */}
            {isCarrusel && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {(() => {
                  const total = mediaItems.length;
                  let start = 0;
                  let end = total;
                  if (total > 5) {
                    start = Math.max(0, Math.min(currentIndex - 2, total - 5));
                    end = start + 5;
                  }
                  return mediaItems.slice(start, end).map((_, i) => {
                    const realIndex = start + i;
                    return (
                      <div
                        key={realIndex}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          realIndex === currentIndex ? 'bg-blue-500' : 'bg-white/40'
                        }`}
                      />
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Acciones del Post */}
          <div className="p-4">
            <div className="flex justify-between mb-3">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-2xl">favorite_border</span>
                <span className="material-symbols-outlined text-2xl">chat_bubble_outline</span>
                <span className="material-symbols-outlined text-2xl">send</span>
              </div>
              <span className="material-symbols-outlined text-2xl">bookmark_border</span>
            </div>
            <p className="text-[12px] font-bold mb-2">1,243 Me gusta</p>
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-around py-3 border-t border-white/10">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="material-symbols-outlined text-2xl">search</span>
            <span className="material-symbols-outlined text-2xl">add_box</span>
            <span className="material-symbols-outlined text-2xl">movie</span>
            <div className="size-6 rounded-full bg-slate-600"></div>
          </div>
        </>
      )}

      {/* Home Indicator */}
      <div className="py-2 flex justify-center">
        <div className="w-32 h-1 bg-white/60 rounded-full" />
      </div>
    </div>
  );
};

export default MockupIPhone;
