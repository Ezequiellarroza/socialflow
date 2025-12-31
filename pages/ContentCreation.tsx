
import React, { useState } from 'react';
import { PostFormat, PostStatus } from '../types';
import { generateCaption, suggestHashtags } from '../geminiService';

const ContentCreation: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [format, setFormat] = useState<PostFormat>(PostFormat.IMAGE);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    if (!topic) return alert('Por favor ingresa un tema para generar el contenido.');
    setIsGenerating(true);
    try {
      const generatedText = await generateCaption(topic, format);
      setCaption(generatedText || '');
    } catch (error) {
      console.error(error);
      alert('Error al generar contenido.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestHashtags = async () => {
    if (!caption) return alert('Primero escribe o genera un pie de foto.');
    setIsGenerating(true);
    try {
      const suggested = await suggestHashtags(caption);
      setHashtags(suggested || '');
    } catch (error) {
      console.error(error);
      alert('Error al sugerir hashtags.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-white tracking-tight text-3xl font-bold leading-tight">Cargar Nuevo Contenido</h1>
          <p className="text-[#9da8b9] text-sm">Configura y programa tu publicación con ayuda de IA.</p>
        </div>

        <div className="p-6 rounded-xl bg-surface-dark border border-border-dark flex flex-col gap-6">
          <h3 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span> Configuración
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Cliente / Cuenta</p>
              <select className="appearance-none w-full rounded-lg text-white border border-[#3b4554] bg-[#111418] h-12 px-4 focus:ring-primary">
                <option>Apex Fitness - Instagram</option>
                <option>TechFlow Systems - LinkedIn</option>
                <option>Urban Coffee - TikTok</option>
              </select>
            </label>

            <label className="flex flex-col flex-1">
              <p className="text-white text-sm font-medium pb-2">Formato</p>
              <div className="flex h-12 w-full items-center justify-center rounded-lg bg-[#111418] border border-[#3b4554] p-1">
                {(Object.values(PostFormat)).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f as PostFormat)}
                    className={`flex-1 h-full rounded-md text-xs font-bold transition-all ${format === f ? 'bg-surface-dark text-white shadow-sm' : 'text-[#9da8b9]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </label>
          </div>
          
          <div className="flex flex-col gap-2">
            <p className="text-white text-sm font-medium pb-1">¿De qué trata la publicación? (Tema/Topic)</p>
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full rounded-lg border border-[#3b4554] bg-[#111418] text-white px-4 h-12 focus:ring-primary"
              placeholder="Ej: Lanzamiento de nueva línea de ropa deportiva de verano"
            />
          </div>
        </div>

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
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full min-h-[200px] rounded-xl text-white border border-[#3b4554] bg-[#111418] p-4 text-base focus:ring-primary resize-y"
            placeholder="Escribe el pie de foto aquí o usa la IA para empezar..."
          />
          {hashtags && (
             <div className="p-3 bg-pink-500/5 border border-pink-500/10 rounded-lg text-pink-400 text-sm italic">
                {hashtags}
             </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 xl:col-span-4 relative hidden lg:block">
        <div className="sticky top-10 flex flex-col gap-4">
          <h3 className="text-white text-lg font-bold px-2">Vista Previa</h3>
          <div className="border-[8px] border-[#111418] rounded-[2.5rem] bg-white overflow-hidden shadow-2xl relative h-[650px] w-full max-w-[340px] mx-auto">
            <div className="h-6 bg-white flex items-center justify-center pt-2">
              <div className="w-16 h-4 bg-black rounded-full"></div>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
               <span className="material-symbols-outlined text-black text-sm">arrow_back</span>
               <span className="font-bold text-xs text-black uppercase">PREVIEW</span>
               <span className="material-symbols-outlined text-black text-sm">more_horiz</span>
            </div>
            <div className="overflow-y-auto h-[calc(100%-80px)] scrollbar-hide">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="size-8 rounded-full bg-gray-200"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-black">Tu Marca</span>
                  <span className="text-[8px] text-gray-500">Ubicación</span>
                </div>
              </div>
              <div className="aspect-square bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-slate-300">image</span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <div className="flex gap-3 text-black">
                   <span className="material-symbols-outlined text-xl">favorite</span>
                   <span className="material-symbols-outlined text-xl">chat_bubble</span>
                   <span className="material-symbols-outlined text-xl">send</span>
                </div>
                <p className="text-[11px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  <span className="font-bold mr-1">tu_marca</span>
                  {caption || 'Tu pie de foto aparecerá aquí...'}
                  <br /><br />
                  <span className="text-blue-900">{hashtags}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCreation;
