import React from 'react';
import {
  Bell,
  User,
  Settings,
  Search,
  SlidersHorizontal,
  Bus,
  Train,
  Car,
  Bike,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Compass,
  List,
  Map as MapIcon,
  Navigation,
  Timer,
  LayoutGrid,
  Camera,
  BarChart3,
  Globe,
  Languages,
  Zap,
  Bookmark,
  Footprints,
  AlertTriangle,
  X,
  Radio,
  Star,
  QrCode
} from 'lucide-react';
import { TransitLine, CityNetwork } from '../types';
import { UbicalLogo } from './UbicalLogo';

interface MobileDashboardLayoutProps {
  activeCity: CityNetwork;
  lines: TransitLine[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterMode: string;
  onChangeFilterMode: (mode: string) => void;
  onSelectLine: (line: TransitLine) => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenAssistant: () => void;
  onChangeView?: (view: 'list' | 'map' | 'planner' | 'vision' | 'analytics' | 'commute' | 'dashboard' | 'admin') => void;
  activeView?: string;
  onOpenSubscription?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
}

export const MobileDashboardLayout: React.FC<MobileDashboardLayoutProps> = ({
  activeCity,
  lines,
  searchQuery,
  onSearchChange,
  filterMode,
  onChangeFilterMode,
  onSelectLine,
  onOpenAuth,
  onOpenSettings,
  onOpenAssistant,
  onChangeView,
  activeView = 'list',
  onOpenSubscription,
  onOpenNotifications,
  unreadNotificationCount = 0,
}) => {
  const [isAlertVisible, setIsAlertVisible] = React.useState(true);

  // Calculate upcoming departures
  const upcomingDepartures = lines.slice(0, 5).map((line) => {
    const nextArr = line.arrivals[0] || 3;
    let badgeBg = 'bg-red-500';
    let typeName = 'EMT';

    if (line.type === 'metro') {
      badgeBg = 'bg-blue-600';
      typeName = 'METRO';
    } else if (line.type === 'train') {
      badgeBg = 'bg-cyan-500';
      typeName = 'CERCANÍAS';
    } else if (line.type === 'rideshare') {
      badgeBg = 'bg-amber-500';
      typeName = 'VTC';
    }

    return {
      id: line.id,
      typeName,
      lineNumber: line.lineNumber,
      destination: line.destination,
      minutes: nextArr,
      lineObj: line,
      badgeBg,
    };
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-3 text-slate-100 pb-20">
      
      {/* CUADRADO PEQUEÑO PRINCIPAL (ESTILO COMPACTO EXACTO A LA IMAGEN) */}
      <div className="bg-[#0B132B] border-2 border-slate-800/90 rounded-2xl p-3 shadow-2xl space-y-3">
        
        {/* ROW 1: BRANDING & TOP UTILITIES */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/70">
          {/* Brand */}
          <UbicalLogo size="sm" showText={true} />

          {/* Top Quick Badges */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-[10px] font-bold text-slate-200">
              <span>{activeCity.flag}</span>
              <span className="text-white">{activeCity.name.split(' ')[0]}</span>
              <Globe className="w-3 h-3 text-blue-400" />
            </span>

            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-1.5 py-1 rounded-xl text-[10px] font-black text-amber-300">
              <span>🇫🇷</span>
              <span>ES</span>
            </span>

            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] px-2 py-1 rounded-xl shadow border border-blue-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>AI Copilot</span>
            </button>
          </div>
        </div>

        {/* SECCIONES DEL SISTEMA ORGANIZADAS EN 2 LÍNEAS */}
        <div className="space-y-1.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-0.5 flex items-center justify-between">
            <span>Secciones del Sistema</span>
            <span className="text-cyan-400 font-mono text-[8px]">Organizado en 2 Líneas</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* LÍNEA 1: NAVEGACIÓN PRINCIPAL */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => onChangeView && onChangeView('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'list'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/50 ring-2 ring-blue-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Líneas</span>
              </button>

              <button
                onClick={() => onChangeView && onChangeView('map')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'map'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/50 ring-2 ring-blue-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Mapa GPS</span>
              </button>

              <button
                onClick={() => onChangeView && onChangeView('planner')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'planner'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/50 ring-2 ring-blue-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Planificador</span>
              </button>

              <button
                onClick={() => onChangeView && onChangeView('commute')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'commute'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Calculadora GPS</span>
              </button>

              <button
                onClick={() => onChangeView && onChangeView('dashboard')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'dashboard'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md ring-2 ring-cyan-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Panel</span>
              </button>
            </div>

            {/* LÍNEA 2: HERRAMIENTAS Y MI CUENTA */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {onOpenNotifications && (
                <button
                  onClick={onOpenNotifications}
                  className="relative flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black bg-blue-950/60 border border-cyan-500/50 text-cyan-300 hover:bg-blue-900/60 shrink-0"
                >
                  <Bell className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Alertas GPS</span>
                  {unreadNotificationCount > 0 && (
                    <span className="bg-cyan-400 text-slate-950 text-[9px] font-black rounded-full px-1.5 py-0.2 animate-bounce">
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => onChangeView && onChangeView('vision')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'vision'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-2 ring-purple-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Visión Foto</span>
              </button>

              <button
                onClick={() => onChangeView && onChangeView('analytics')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black transition-all shrink-0 border ${
                  activeView === 'analytics'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-300/40'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Analytics</span>
              </button>

              {/* Account / IP / Plan Quick Pills */}
              <button
                onClick={onOpenSubscription}
                className="flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-[10px] font-black shrink-0"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>FREE</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1 bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shrink-0"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">IP</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="p-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl shrink-0"
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>
        </div>

        {/* ROW 3: LOCATION & SEARCH BOX */}
        <div className="space-y-2 pt-1 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-slate-400 text-[10px] truncate">
                Opciones cerca de <strong className="text-white underline decoration-blue-500/60">51-55 Boulevard de Clichy, Paris</strong>
              </span>
            </div>
            <span className="bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2 py-0.5 rounded-full font-bold text-[9px] shrink-0 flex items-center gap-1">
              <Footprints className="w-3 h-3 text-blue-400" />
              <span>13 min a pie</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar línea, estación o parada en Europa..."
              className="w-full bg-slate-900 text-white placeholder-slate-500 text-[11px] font-semibold pl-9 pr-8 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* MODOS DE VIAJE ORGANIZADOS EN 2 LÍNEAS VISIBLES */}
        <div className="pt-1.5 border-t border-slate-800/60 space-y-1.5">
          <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-0.5 flex items-center justify-between">
            <span>Modos de Viaje • Filtros de Transporte</span>
            <span className="text-amber-400 font-mono text-[8px]">Organizado en 2 Líneas</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* LÍNEA 1 DE MODOS DE VIAJE */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => onChangeFilterMode('all')}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-black transition-all shrink-0 border ${
                  filterMode === 'all'
                    ? 'bg-blue-600 text-white border-cyan-300 shadow-md shadow-blue-600/50 ring-2 ring-cyan-300/60'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                Todas las Líneas
              </button>

              <button
                onClick={() => onChangeFilterMode('favorites')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border ${
                  filterMode === 'favorites'
                    ? 'bg-amber-600 text-white border-amber-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Bookmark className="w-3 h-3 text-amber-400" />
                <span>★ Favoritas</span>
              </button>

              <button
                onClick={() => onChangeFilterMode('metro')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border ${
                  filterMode === 'metro'
                    ? 'bg-blue-600 text-white border-blue-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🚇</span>
                <span>Metro</span>
              </button>

              <button
                onClick={() => onChangeFilterMode('bus')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border ${
                  filterMode === 'bus'
                    ? 'bg-red-600 text-white border-red-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🚌</span>
                <span>Bus</span>
              </button>
            </div>

            {/* LÍNEA 2 DE MODOS DE VIAJE */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => onChangeFilterMode('train')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border ${
                  filterMode === 'train'
                    ? 'bg-cyan-600 text-white border-cyan-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🚆</span>
                <span>Tren / RER</span>
              </button>

              <button
                onClick={() => onChangeFilterMode('bike')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border ${
                  filterMode === 'bike'
                    ? 'bg-emerald-600 text-white border-emerald-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🚲</span>
                <span>Bici Share</span>
              </button>

              <button
                onClick={() => onChangeFilterMode('rideshare')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 border ${
                  filterMode === 'rideshare'
                    ? 'bg-amber-600 text-white border-amber-300 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🚗</span>
                <span>Taxi / VTC</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* BANNER DE INCIDENCIA GRAVE (IF VISIBLE) */}
      {isAlertVisible && (
        <div className="bg-[#0B132B] border-2 border-amber-500/80 rounded-2xl p-3 shadow-2xl relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded">
                INCIDENCIA GRAVE
              </span>
              <span className="bg-purple-600 text-white font-mono font-bold text-[9px] px-2 py-0.5 rounded">
                M 14
              </span>
            </div>
            <button
              onClick={() => setIsAlertVisible(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] font-bold text-white leading-tight">
            Incidencia técnica de señalización en Châtelet
          </p>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[10px] font-mono font-black text-amber-400">
              +12 a 15 min de demora
            </span>
            <button
              onClick={() => onSelectLine(lines[0] || {} as TransitLine)}
              className="bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow flex items-center gap-1"
            >
              <span>Ver Línea</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* UPCOMING DEPARTURES IN NEAT COMPACT CARD */}
      <div className="bg-[#0B132B] border-2 border-slate-800 rounded-2xl p-3 space-y-2 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h3 className="text-xs font-black uppercase text-slate-100 tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            PRÓXIMAS SALIDAS EN DIRECTO
          </h3>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En vivo
          </span>
        </div>

        <div className="space-y-1.5">
          {upcomingDepartures.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => onSelectLine(item.lineObj)}
              className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full ${item.badgeBg} shrink-0`} />
                <div className="min-w-0">
                  <div className="text-[11px] font-black text-white truncate">
                    {item.typeName} • {item.lineNumber}
                  </div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {item.destination}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-black text-amber-300 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                  {item.minutes} min
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

