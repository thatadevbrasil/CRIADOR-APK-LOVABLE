
import React, { useState } from 'react';
import { Prototype, AppScreen, ScreenComponent } from '../types';

interface MobilePreviewProps {
  prototype: Prototype;
  currentScreenId?: string;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ prototype, currentScreenId }) => {
  const [activeScreenId, setActiveScreenId] = useState<string>(currentScreenId || prototype.screens[0]?.id);

  const activeScreen = prototype.screens.find(s => s.id === activeScreenId) || prototype.screens[0];

  const renderComponent = (comp: ScreenComponent) => {
    switch (comp.type) {
      case 'header':
        return (
          <div key={comp.id} className="p-4 flex items-center justify-between border-b border-white/10" style={{ backgroundColor: prototype.theme.primary }}>
            <h2 className="text-lg font-bold">{comp.props.label || comp.props.content}</h2>
            <div className="w-8 h-8 rounded-full bg-white/20" />
          </div>
        );
      case 'text':
        return (
          <div key={comp.id} className="p-4 text-sm opacity-80 leading-relaxed">
            {comp.props.content}
          </div>
        );
      case 'button':
        return (
          <button
            key={comp.id}
            className="w-full py-3 px-6 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 my-2 shadow-lg"
            style={{ backgroundColor: prototype.theme.accent, color: prototype.theme.isDark ? '#fff' : '#000' }}
          >
            {comp.props.label}
          </button>
        );
      case 'input':
        return (
          <input
            key={comp.id}
            type="text"
            placeholder={comp.props.placeholder}
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 my-2 focus:outline-none focus:ring-2"
            style={{ borderColor: prototype.theme.secondary }}
          />
        );
      case 'card':
        return (
          <div key={comp.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 my-3 hover:bg-white/10 transition-colors">
            <h3 className="font-semibold mb-1">{comp.props.label}</h3>
            <p className="text-xs opacity-60">{comp.props.content}</p>
          </div>
        );
      case 'image':
        return (
          <img
            key={comp.id}
            src={comp.props.src || `https://picsum.photos/seed/${comp.id}/400/200`}
            alt="UI Element"
            className="w-full h-40 object-cover rounded-2xl my-3 shadow-md"
          />
        );
      case 'list':
        return (
          <div key={comp.id} className="divide-y divide-white/10">
            {[1, 2, 3].map(i => (
              <div key={i} className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
                <div>
                  <div className="h-3 w-32 bg-white/20 rounded-full mb-2" />
                  <div className="h-2 w-20 bg-white/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative mx-auto w-[300px] h-[600px] bg-black rounded-[3rem] border-[8px] border-zinc-800 shadow-2xl overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-20" />
      
      {/* Screen Content */}
      <div className="relative w-full h-full overflow-y-auto overflow-x-hidden bg-zinc-900 scrollbar-hide pb-10" style={{ color: prototype.theme.isDark ? '#fff' : '#111' }}>
        <div className="min-h-full">
           {activeScreen?.components.map(renderComponent)}
        </div>
      </div>

      {/* Navigation Simulation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        {prototype.screens.map((screen) => (
          <button
            key={screen.id}
            onClick={() => setActiveScreenId(screen.id)}
            className={`w-2 h-2 rounded-full transition-all ${activeScreenId === screen.id ? 'bg-white scale-125' : 'bg-white/30'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MobilePreview;
