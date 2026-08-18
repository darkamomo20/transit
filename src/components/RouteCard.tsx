import React from 'react';
import {
  Crown,
  Star,
  Wifi,
  ArrowRight,
  MapPin,
  Clock,
  AlertTriangle,
  Users,
  Footprints,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { TransitLine } from '../types';

interface RouteCardProps {
  line: TransitLine;
  onToggleFavorite: (id: string) => void;
  onClickCard: (line: TransitLine) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  line,
  onToggleFavorite,
  onClickCard,
}) => {
  const nextArrival = line.arrivals[0] ?? 0;
  const secondArrival = line.arrivals[1];

  // Determine crowd color indicator
  const crowdColor =
    line.crowdLevel === 'low'
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
      : line.crowdLevel === 'moderate'
      ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
      : 'bg-rose-500/20 text-rose-200 border-rose-500/40';

  const crowdText =
    line.crowdLevel === 'low' ? 'Low Crowd' : line.crowdLevel === 'moderate' ? 'Moderate' : 'High Crowd';

  return (
    <div
      onClick={() => onClickCard(line)}
      style={{ backgroundColor: line.color, color: line.textColor }}
      className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-white/10 group p-4 sm:p-5 text-white"
    >
      {/* Subtle background glow effect */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

      {/* Main Card Content Grid */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Column: Route Number, Crown, Destination & Nearby Stop */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            {/* Big Bold Route Number / Badge */}
            <div className="flex items-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">
                {line.lineNumber}
              </span>

              {/* Crown / Favorite Star Icon */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(line.id);
                }}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
                title="Toggle Favorite"
              >
                {line.isFavorite ? (
                  <Crown className="w-5 h-5 fill-amber-300 text-amber-300 drop-shadow" />
                ) : (
                  <Star className="w-5 h-5 text-white/50 hover:text-white" />
                )}
              </button>
            </div>

            {/* Delay Warning Badge if delayed */}
            {line.delayMinutes && line.delayMinutes > 0 ? (
              <span className="flex items-center gap-1.5 bg-rose-950/90 text-rose-200 text-[10px] font-black px-2.5 py-1 rounded-full border border-rose-500/80 shadow-lg animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>ALERTA: +{line.delayMinutes}m retraso</span>
              </span>
            ) : null}
          </div>

          {/* Destination with Arrow */}
          <div className="flex items-start gap-1.5 text-sm sm:text-base font-bold tracking-tight opacity-95 leading-tight mb-1">
            <ArrowRight className="w-4 h-4 shrink-0 mt-0.5 stroke-[3]" />
            <span className="truncate">{line.destination}</span>
          </div>

          {/* Nearby Stop Location */}
          <div className="flex items-center gap-1 text-xs opacity-80 font-medium">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{line.nearbyStop}</span>
          </div>

          {/* Additional Features: Walk time, AI crowd & confidence */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/15 text-[11px] font-medium">
            <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
              <Footprints className="w-3 h-3" />
              {line.walkTimeMinutes} min walk
            </span>

            <span className={`flex items-center gap-1 border px-2 py-0.5 rounded-full ${crowdColor}`}>
              <Users className="w-3 h-3" />
              {crowdText}
            </span>

            <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-white/90">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              {line.predictiveConfidence}% AI Accuracy
            </span>
          </div>

          {/* Compact Vehicle Occupancy Indicator vs Historical Peak */}
          {(() => {
            const primaryVehicle = line.currentVehicles && line.currentVehicles.length > 0 ? line.currentVehicles[0] : null;
            const occPct = primaryVehicle?.occupancyPct ?? (line.crowdLevel === 'low' ? 32 : line.crowdLevel === 'moderate' ? 64 : 88);
            const peakPct = line.type === 'metro' || line.type === 'train' ? 92 : 84;
            const barFillColor = occPct >= 78 ? 'bg-rose-400' : occPct >= 48 ? 'bg-amber-300' : 'bg-emerald-300';

            return (
              <div className="mt-2 pt-1.5 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] opacity-90 mb-1">
                  <span className="font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-200" />
                    Ocupación: <strong className="text-white font-mono">{occPct}%</strong>
                  </span>
                  <span className="text-[9px] opacity-75 font-mono">
                    Pico Histórico: {peakPct}%
                  </span>
                </div>
                <div className="relative w-full h-2 bg-black/30 rounded-full overflow-visible border border-white/20">
                  <div
                    className={`h-full rounded-full ${barFillColor} transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(8, occPct))}%` }}
                  />
                  {/* Historical peak marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-300 z-10"
                    style={{ left: `${peakPct}%` }}
                    title={`Pico habitual: ${peakPct}%`}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Real-Time Countdown Minutes & Live Signal */}
        <div className="flex flex-col items-end justify-between shrink-0 pl-2">
          {/* Real-time live wifi signal icon matching screenshot */}
          <div className="flex items-center gap-1 text-xs font-bold text-white/90 bg-black/20 px-2 py-0.5 rounded-full mb-1">
            <Wifi className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
            <span className="text-[10px] uppercase tracking-wider hidden sm:inline">LIVE</span>
          </div>

          {/* Big Minutes Number */}
          <div className="text-right">
            <div className="text-4xl sm:text-5xl font-black tracking-tighter leading-none drop-shadow-lg">
              {nextArrival}
            </div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-90 text-right mt-0.5">
              {nextArrival === 1 ? 'minuto' : 'minutos'}
            </div>
          </div>

          {/* Second arrival countdown */}
          {secondArrival !== undefined && (
            <div className="text-[11px] font-semibold opacity-80 mt-1.5 flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              <span>Next: {secondArrival} min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
