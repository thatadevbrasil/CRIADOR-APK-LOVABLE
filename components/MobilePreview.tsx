
import React, { useState, useRef, useEffect } from 'react';
import { Prototype, ScreenComponent } from '../types';

interface MobilePreviewProps {
  prototype: Prototype;
  currentScreenId?: string;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ prototype, currentScreenId }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);

  // Sync external prop change to scroll position
  useEffect(() => {
    if (currentScreenId && scrollRef.current) {
      const index = prototype.screens.findIndex(s => s.id === currentScreenId);
      if (index !== -1) {
        scrollRef.current.scrollTo({
          left: index * scrollRef.current.clientWidth,
          behavior: 'smooth'
        });
        setActiveScreenIndex(index);
      }
    }
  }, [currentScreenId, prototype.screens]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollRef.current.scrollLeft / width);
      if (index !== activeScreenIndex) {
        setActiveScreenIndex(index);
      }
    }
  };

  const scrollToScreen = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  };

  const renderComponent = (comp: ScreenComponent) => {
    switch (comp.type) {
      case 'header':
        return (
          <div key={comp.id} className="p-5 flex items-center justify-between shadow-sm sticky top-0 z-10" style={{ backgroundColor: prototype.theme.primary }}>
            <h2 className="text-lg font-bold tracking-tight">{comp.props.label || comp.props.content}</h2>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md" />
          </div>
        );
      case 'text':
        return (
          <div key={comp.id} className="px-5 py-3 text-sm opacity-90 leading-relaxed font-medium">
            {comp.props.content}
          </div>
        );
      case 'button':
        return (
          <div key={comp.id} className="px-5 py-2">
            <button
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{ backgroundColor: prototype.theme.accent, color: prototype.theme.isDark ? '#fff' : '#000' }}
            >
              {comp.props.label}
            </button>
          </div>
        );
      case 'input':
        return (
          <div key={comp.id} className="px-5 py-2">
            <input
              type="text"
              placeholder={comp.props.placeholder}
              className="w-full p-4 rounded-2xl bg-white/5 border border-black/5 dark:border-white/10 focus:outline-none focus:ring-2 transition-all placeholder:text-current placeholder:opacity-40"
              style={{ borderColor: prototype.theme.secondary, '--tw-ring-color': prototype.theme.accent } as any}
            />
          </div>
        );
      case 'card':
        return (
          <div key={comp.id} className="px-5 py-2">
            <div className="p-5 rounded-3xl bg-white/5 border border-black/5 dark:border-white/10 hover:bg-white/10 transition-colors shadow-sm">
              <h3 className="font-bold text-base mb-1.5">{comp.props.label}</h3>
              <p className="text-xs opacity-70 leading-relaxed">{comp.props.content}</p>
            </div>
          </div>
        );
      case 'image':
        return (
          <div key={comp.id} className="px-5 py-2">
            <img
              src={comp.props.src || `https://picsum.photos/seed/${comp.id}/800/400`}
              alt="UI Element"
              className="w-full h-48 object-cover rounded-3xl shadow-md hover:shadow-lg transition-shadow"
            />
          </div>
        );
      case 'list':
        return (
          <div key={comp.id} className="px-5 py-2">
            <div className="divide-y divide-current opacity-100">
              {[1, 2, 3].map(i => (
                <div key={i} className="py-4 flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-current opacity-10 shrink-0 group-hover:scale-105 transition-transform" />
                  <div>
                    <div className="h-3 w-32 bg-current opacity-20 rounded-full mb-2" />
                    <div className="h-2 w-20 bg-current opacity-10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine text color class based on theme darkness
  const textColorClass = prototype.theme.isDark ? 'text-white' : 'text-slate-900';
  const bgColorStyle = prototype.theme.isDark ? '#09090b' : '#ffffff';

  return (
    <div className="relative mx-auto h-[640px] aspect-[9/16] bg-black rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
      {/* Notch / Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-30 flex items-center justify-center gap-2 px-3 shadow-lg">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-pulse" />
           <div className="w-full h-1 rounded-full bg-zinc-800" />
      </div>
      
      {/* Screens Carousel */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 w-full flex overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ scrollBehavior: 'smooth' }}
      >
        {prototype.screens.map((screen) => (
          <div 
            key={screen.id} 
            className={`w-full h-full flex-shrink-0 snap-center overflow-y-auto pb-20 ${textColorClass}`}
            style={{ backgroundColor: bgColorStyle }}
          >
             {/* Status Bar Spacer */}
             <div className="h-10 w-full shrink-0" />
             
             <div className="min-h-[calc(100%-2.5rem)] pb-4 space-y-1">
                {screen.components.map(renderComponent)}
             </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Indicators (Dots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-30 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/5 shadow-2xl">
        {prototype.screens.map((screen, idx) => (
          <button
            key={screen.id}
            onClick={() => scrollToScreen(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${activeScreenIndex === idx ? 'bg-white w-6' : 'bg-white/30 w-2 hover:bg-white/50'}`}
            aria-label={`Go to screen ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-30 pointer-events-none" />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-thin::-webkit-scrollbar { height: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(128,128,128, 0.4); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default MobilePreview;
