
import React from 'react';
import { PostStatus } from '../types';

const CalendarView: React.FC = () => {
  const days = Array.from({ length: 35 }, (_, i) => i - 1); // Mock days for October starting slightly early
  
  const events = [
    { day: 5, title: 'Lanzamiento Web 2.0', status: PostStatus.APPROVED, icon: 'public' },
    { day: 12, title: 'Newsletter Semanal', status: PostStatus.APPROVED, icon: 'mail' },
    { day: 4, title: 'Historia IG: BTS', status: PostStatus.PENDING, icon: 'photo_camera' },
    { day: 18, title: 'Reels: Tendencias Q4', status: PostStatus.PENDING, icon: 'video_library' },
    { day: 2, title: 'Borrador: Blog IA', status: PostStatus.DRAFT, icon: 'article' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Calendario Editorial</h2>
          <p className="text-[#9da8b9] text-sm">Gestiona y planifica el contenido para Octubre 2023.</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-dark rounded-lg p-1 border border-border-dark">
          <button className="size-8 flex items-center justify-center rounded hover:bg-[#282f39] text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-white text-sm font-bold w-32 text-center">Octubre 2023</span>
          <button className="size-8 flex items-center justify-center rounded hover:bg-[#282f39] text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-border-dark mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
          <div key={d} className="text-[#9da8b9] text-xs font-semibold uppercase tracking-wider text-center py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-border-dark border border-border-dark rounded-xl overflow-hidden shadow-2xl flex-1 overflow-y-auto min-h-[500px]">
        {days.map((d, i) => {
          const dayEvents = events.filter(e => e.day === d);
          const isCurrentMonth = d > 0 && d <= 31;
          
          return (
            <div key={i} className={`min-h-[120px] p-2 flex flex-col gap-1 transition-colors relative group ${
              isCurrentMonth ? 'bg-[#111418] hover:bg-[#15191e]' : 'bg-[#111418]/50 opacity-40'
            }`}>
              {isCurrentMonth && (
                <span className={`text-[#9da8b9] font-medium text-xs ml-auto ${d === 5 ? 'bg-primary text-white size-6 rounded-full flex items-center justify-center -mt-1 -mr-1' : ''}`}>
                  {d}
                </span>
              )}
              {dayEvents.map((e, idx) => (
                <div 
                  key={idx} 
                  className={`w-full p-2 rounded border cursor-pointer transition-all shadow-sm ${
                    e.status === PostStatus.APPROVED ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                    e.status === PostStatus.PENDING ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                    'bg-slate-500/10 border-slate-500/30 text-[#9da8b9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="material-symbols-outlined text-[14px]">{e.icon}</span>
                    <span className={`size-1.5 rounded-full ${
                      e.status === PostStatus.APPROVED ? 'bg-emerald-500' : 
                      e.status === PostStatus.PENDING ? 'bg-amber-500' : 'bg-slate-500'
                    }`}></span>
                  </div>
                  <p className="text-[10px] font-bold line-clamp-1 leading-tight">{e.title}</p>
                </div>
              ))}
              {isCurrentMonth && (
                <button className="mt-auto opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 w-full py-1 text-[10px] text-primary font-bold border border-dashed border-primary/40 rounded transition-opacity">
                  <span className="material-symbols-outlined text-sm">add</span> Añadir
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
