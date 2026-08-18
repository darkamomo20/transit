import React from 'react';
import { List, Map as MapIcon, Navigation, Camera, Sparkles, Smartphone, Timer, LayoutGrid } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'list' | 'map' | 'planner' | 'vision' | 'analytics' | 'commute' | 'dashboard' | 'admin' | 'maps_places';
  onChangeView: (view: 'list' | 'map' | 'planner' | 'vision' | 'analytics' | 'commute' | 'dashboard' | 'admin' | 'maps_places') => void;
  onOpenAssistant: () => void;
  onOpenIPTelemetry: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onChangeView,
  onOpenAssistant,
  onOpenIPTelemetry,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-lg border-t border-slate-800 px-1 py-1.5 md:hidden shadow-2xl safe-area-pb">
      <div className="flex items-center justify-around text-[9px] font-bold">
        {/* Lines Button */}
        <button
          onClick={() => onChangeView('list')}
          className={`flex flex-col items-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeView === 'list' ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <List className="w-5 h-5 mb-0.5" />
          <span>Líneas</span>
        </button>

        {/* Dashboard Panel Button */}
        <button
          onClick={() => onChangeView('dashboard')}
          className={`flex flex-col items-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeView === 'dashboard' ? 'text-cyan-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5 text-cyan-400" />
          <span>Panel</span>
        </button>

        {/* Live GPS Map */}
        <button
          onClick={() => onChangeView('map')}
          className={`flex flex-col items-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeView === 'map' ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapIcon className="w-5 h-5 mb-0.5" />
          <span>Mapa</span>
        </button>

        {/* AI Copilot Center Floating Action Button */}
        <button
          onClick={onOpenAssistant}
          className="flex flex-col items-center -mt-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-2.5 rounded-full shadow-lg shadow-blue-500/30 border-2 border-[#0F172A] active:scale-90 transition-transform"
        >
          <Sparkles className="w-5 h-5 text-emerald-300 animate-pulse" />
          <span className="text-[8px] uppercase tracking-wider font-extrabold mt-0.5">AI</span>
        </button>

        {/* Planner */}
        <button
          onClick={() => onChangeView('planner')}
          className={`flex flex-col items-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeView === 'planner' ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-5 h-5 mb-0.5" />
          <span>Rutas</span>
        </button>

        {/* GPS Commute */}
        <button
          onClick={() => onChangeView('commute')}
          className={`flex flex-col items-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
            activeView === 'commute' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Timer className="w-5 h-5 mb-0.5 text-emerald-400" />
          <span>Tiempo</span>
        </button>
      </div>
    </nav>
  );
};
