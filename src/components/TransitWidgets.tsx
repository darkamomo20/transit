import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CityNetwork, TransitLine } from '../types';
import { getCityWeatherData } from '../utils/weather';
import { 
  Star, 
  Clock, 
  CloudSun, 
  CloudRain, 
  Sun, 
  Wind, 
  Zap, 
  Activity, 
  SlidersHorizontal, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Bike,
  ShieldCheck,
  Thermometer
} from 'lucide-react';

interface TransitWidgetsProps {
  activeCity: CityNetwork;
  lines: TransitLine[];
  onSelectLine: (line: TransitLine) => void;
  onToggleFavorite: (id: string) => void;
  onOpenPlanner?: () => void;
}

export const TransitWidgets: React.FC<TransitWidgetsProps> = ({
  activeCity,
  lines,
  onSelectLine,
  onToggleFavorite,
  onOpenPlanner
}) => {
  // Widget customization visibility state (saved in localStorage)
  const [enabledWidgets, setEnabledWidgets] = useState<{
    favoriteStatus: boolean;
    nextArrival: boolean;
    cityWeather: boolean;
    networkPulse: boolean;
  }>(() => {
    const saved = localStorage.getItem('transit_enabled_widgets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      favoriteStatus: true,
      nextArrival: true,
      cityWeather: true,
      networkPulse: true,
    };
  });

  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('transit_enabled_widgets', JSON.stringify(enabledWidgets));
  }, [enabledWidgets]);

  const toggleWidget = (key: keyof typeof enabledWidgets) => {
    setEnabledWidgets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetWidgets = () => {
    setEnabledWidgets({
      favoriteStatus: true,
      nextArrival: true,
      cityWeather: true,
      networkPulse: true,
    });
  };

  // Find Favorite Lines
  const favoriteLines = lines.filter((l) => l.isFavorite);
  const primaryFavorite = favoriteLines.length > 0 ? favoriteLines[0] : lines[0];

  // Find Next Imminent Arrival
  const lineWithEarliestArrival = lines.reduce((acc: TransitLine | null, curr: TransitLine) => {
    const currMin = curr.arrivals && curr.arrivals.length > 0 ? Math.min(...curr.arrivals) : 999;
    const accMin = acc && acc.arrivals && acc.arrivals.length > 0 ? Math.min(...acc.arrivals) : 999;
    return currMin < accMin ? curr : acc;
  }, null as TransitLine | null) || lines[0];

  const earliestMin = lineWithEarliestArrival?.arrivals[0] ?? 2;

  // City Weather Data
  const weather = getCityWeatherData(activeCity.id, activeCity.name);
  const WeatherIcon = weather.icon;

  // Calculate Network Pulse Stats
  const totalVehicles = lines.reduce((acc, l) => acc + (l.currentVehicles?.length || 0), 0);
  const avgSpeed = Math.round(
    lines.reduce((acc, l) => {
      const lineAvg = l.currentVehicles?.reduce((vAcc, v) => vAcc + v.speedKmH, 0) || 0;
      return acc + (l.currentVehicles?.length ? lineAvg / l.currentVehicles.length : 25);
    }, 0) / (lines.length || 1)
  );

  const totalDelayedLines = lines.filter((l) => (l.delayMinutes && l.delayMinutes > 0)).length;

  return (
    <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Widget Section Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Transit Widgets
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                {activeCity.flag} {activeCity.name.split(' ')[0]}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vistazo rápido a tus líneas favoritas, estado del tiempo y próximas salidas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCustomizeOpen(!isCustomizeOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isCustomizeOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Personalizar</span>
        </button>
      </div>

      {/* Customize Panel Drawer Modal */}
      <AnimatePresence>
        {isCustomizeOpen ? (
          <motion.div
            key="customize-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-950/80 border border-cyan-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Configuración de Widgets Visibles
                </span>
                <button
                  onClick={resetWidgets}
                  className="text-[11px] font-semibold text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restablecer
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => toggleWidget('favoriteStatus')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    enabledWidgets.favoriteStatus
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-semibold truncate">Línea Favorita</span>
                  {enabledWidgets.favoriteStatus ? (
                    <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </button>

                <button
                  onClick={() => toggleWidget('nextArrival')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    enabledWidgets.nextArrival
                      ? 'bg-blue-950/40 border-blue-500/50 text-blue-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-semibold truncate">Próxima Salida</span>
                  {enabledWidgets.nextArrival ? (
                    <Eye className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </button>

                <button
                  onClick={() => toggleWidget('cityWeather')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    enabledWidgets.cityWeather
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-semibold truncate">Clima & Impacto</span>
                  {enabledWidgets.cityWeather ? (
                    <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </button>

                <button
                  onClick={() => toggleWidget('networkPulse')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    enabledWidgets.networkPulse
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="font-semibold truncate">Métricas de Red</span>
                  {enabledWidgets.networkPulse ? (
                    <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {/* CARD 1: Favorite Line Status */}
          {enabledWidgets.favoriteStatus && (
            <motion.div
              key="widget-favoriteStatus"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ duration: 0.35, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/40 p-4 rounded-2xl transition-colors shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    Estado Favorito
                  </span>

                  {favoriteLines.length > 0 ? (
                    <span className="text-[10px] font-extrabold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {favoriteLines.length} Guardadas
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">
                      Línea Destacada
                    </span>
                  )}
                </div>

                {primaryFavorite && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-inner shrink-0"
                      style={{ backgroundColor: primaryFavorite.color || '#3B82F6' }}
                    >
                      {primaryFavorite.lineNumber}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {primaryFavorite.lineName}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">
                        Hacia: <span className="text-slate-200">{primaryFavorite.destination}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {primaryFavorite.delayMinutes ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            +{primaryFavorite.delayMinutes} min
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            En hora
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          Cada {primaryFavorite.frequencyMinutes}m
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Próximo: <strong className="text-white">{primaryFavorite?.arrivals[0] ?? 3} min</strong>
                </span>
                <button
                  onClick={() => primaryFavorite && onSelectLine(primaryFavorite)}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 group/btn"
                >
                  Detalles
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* CARD 2: Next Imminent Arrival */}
          {enabledWidgets.nextArrival && (
            <motion.div
              key="widget-nextArrival"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/40 p-4 rounded-2xl transition-colors shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Próxima Salida
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                {lineWithEarliestArrival && (
                  <div className="flex items-center justify-between gap-2 bg-blue-950/30 border border-blue-500/20 rounded-xl p-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-black text-white shrink-0"
                        style={{ backgroundColor: lineWithEarliestArrival.color || '#2563EB' }}
                      >
                        {lineWithEarliestArrival.lineNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {lineWithEarliestArrival.nearbyStop}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {lineWithEarliestArrival.destination}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-emerald-400 font-mono tracking-tight">
                        {earliestMin <= 0 ? 'AHORA' : `${earliestMin}m`}
                      </span>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">
                        {earliestMin <= 1 ? 'En andén' : 'Aproximándose'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  Parada más cercana a tu GPS
                </p>
                {onOpenPlanner && (
                  <button
                    onClick={onOpenPlanner}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                  >
                    Planear
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* CARD 3: City Weather & Transit Recommendation */}
          {enabledWidgets.cityWeather && (
            <motion.div
              key="widget-cityWeather"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ duration: 0.35, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/40 p-4 rounded-2xl transition-colors shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <WeatherIcon className="w-3.5 h-3.5 text-amber-400" />
                    Clima & Movilidad
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {weather.temp}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <WeatherIcon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {weather.condition}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                      <span>Viento: {weather.wind}</span>
                      <span>•</span>
                      <span>Hum: {weather.humidity}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800 p-2 rounded-xl leading-snug">
                  💡 <span className="font-semibold">{weather.recommendation}</span>
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">
                  Red: <strong className="text-emerald-400 font-bold">{weather.mobilityImpact}</strong>
                </span>
                <span className="text-slate-500">
                  UV: {weather.uvIndex}
                </span>
              </div>
            </motion.div>
          )}

          {/* CARD 4: Network Pulse & Sustainability Metrics */}
          {enabledWidgets.networkPulse && (
            <motion.div
              key="widget-networkPulse"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ duration: 0.35, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="relative group bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-4 rounded-2xl transition-colors shadow-md flex flex-col justify-between overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Métricas de Red
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    {totalDelayedLines === 0 ? '100% Fluido' : `${totalDelayedLines} Alertas`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400">Velocidad Prom.</p>
                    <p className="text-sm font-black text-white font-mono mt-0.5">
                      {avgSpeed} <span className="text-[10px] text-slate-400 font-sans">km/h</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800/80 p-2 rounded-xl">
                    <p className="text-[10px] font-semibold text-slate-400">Vehículos Activos</p>
                    <p className="text-sm font-black text-cyan-400 font-mono mt-0.5">
                      {totalVehicles} <span className="text-[10px] text-slate-400 font-sans">unidades</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs bg-emerald-950/20 border border-emerald-500/20 p-2 rounded-xl">
                  <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    Ahorro CO₂ Hoy
                  </span>
                  <span className="font-mono font-extrabold text-emerald-400 text-xs">
                    ~1.4 kg / viajero
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Algoritmo predictivo IA activo</span>
                <span className="text-slate-500">3s sync</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
