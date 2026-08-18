import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { TransitLine } from '../types';

interface OccupancyProgressBarProps {
  line: TransitLine;
  compact?: boolean;
  className?: string;
  showHistoricalChart?: boolean;
}

export const OccupancyProgressBar: React.FC<OccupancyProgressBarProps> = ({
  line,
  compact = false,
  className = '',
  showHistoricalChart = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  // 1. Current Vehicle live occupancy calculation
  const primaryVehicle = line.currentVehicles && line.currentVehicles.length > 0
    ? line.currentVehicles[0]
    : null;

  // Fallback realistic occupancy percentage based on crowdLevel if no active telemetry vehicle
  const fallbackPct = line.crowdLevel === 'low' ? 32 : line.crowdLevel === 'moderate' ? 64 : 88;
  const currentOccupancyPct = primaryVehicle?.occupancyPct ?? fallbackPct;

  // 2. Historical Peak metrics calculation based on line type and route
  const historicalPeakPct = line.type === 'metro' || line.type === 'train' ? 92 : 84;
  const morningPeakHours = '07:30 - 09:15';
  const eveningPeakHours = '17:45 - 19:30';

  // Relative delta comparison vs peak
  const diffFromPeak = currentOccupancyPct - historicalPeakPct;
  const pctOfPeak = Math.round((currentOccupancyPct / historicalPeakPct) * 100);

  // Status & color scheme
  let statusText = 'Baja Afluencia';
  let statusSubtext = 'Asientos disponibles';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let barGradient = 'from-emerald-500 via-teal-400 to-cyan-400';
  let textColor = 'text-emerald-400';

  if (currentOccupancyPct >= 78) {
    statusText = 'Afluencia Alta';
    statusSubtext = 'Espacio de pie limitado';
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    barGradient = 'from-amber-500 via-orange-500 to-rose-500';
    textColor = 'text-rose-400';
  } else if (currentOccupancyPct >= 48) {
    statusText = 'Afluencia Moderada';
    statusSubtext = 'Asientos y espacio regular';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    barGradient = 'from-teal-500 via-amber-400 to-amber-500';
    textColor = 'text-amber-400';
  }

  // 3. Hourly historical occupancy profile data (06:00 to 23:00)
  const hourlyData = [
    { hour: '06:00', pct: 25, isPeak: false },
    { hour: '07:00', pct: 68, isPeak: false },
    { hour: '08:00', pct: historicalPeakPct, isPeak: true, label: 'Pico Mañana' },
    { hour: '09:00', pct: 74, isPeak: false },
    { hour: '11:00', pct: 42, isPeak: false },
    { hour: '13:00', pct: 58, isPeak: false },
    { hour: '15:00', pct: 46, isPeak: false },
    { hour: '17:00', pct: 72, isPeak: false },
    { hour: '18:30', pct: historicalPeakPct - 2, isPeak: true, label: 'Pico Tarde' },
    { hour: '20:00', pct: 50, isPeak: false },
    { hour: '22:00', pct: 28, isPeak: false },
  ];

  // Current car / wagon simulation for train / metro, or front/middle/rear for bus
  const sectionBreakdown = line.type === 'metro' || line.type === 'train'
    ? [
        { name: 'Vagón 1 (Cabina)', pct: Math.min(100, Math.max(10, currentOccupancyPct - 15)) },
        { name: 'Vagón 2 (Central)', pct: Math.min(100, Math.max(15, currentOccupancyPct + 8)) },
        { name: 'Vagón 3 (Central)', pct: Math.min(100, Math.max(15, currentOccupancyPct + 5)) },
        { name: 'Vagón 4 (Cola)', pct: Math.min(100, Math.max(10, currentOccupancyPct - 12)) },
      ]
    : [
        { name: 'Sección Delantera', pct: Math.min(100, Math.max(10, currentOccupancyPct + 6)) },
        { name: 'Área Central / PMR', pct: Math.min(100, Math.max(10, currentOccupancyPct - 8)) },
        { name: 'Sección Trasera', pct: Math.min(100, Math.max(10, currentOccupancyPct - 2)) },
      ];

  return (
    <div
      className={`bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 text-slate-200 shadow-xl relative overflow-hidden transition-all ${className}`}
    >
      {/* Glow background effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              Ocupación en Vivo vs Pico Histórico
              <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded-full uppercase">
                IA SENSOR
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Línea {line.lineNumber} • {line.lineName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xl border font-mono ${badgeColor}`}>
            {currentOccupancyPct}% en Vivo
          </span>

          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Expandir detalles"
            >
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* PRIMARY OCCUPANCY PROGRESS BAR */}
      <div className="space-y-2 pt-1 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-sm sm:text-base font-mono ${textColor}`}>
              {currentOccupancyPct}%
            </span>
            <span className="text-xs text-slate-300 font-semibold">• {statusText}</span>
          </div>

          <div className="text-right text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pico Máximo: <strong className="text-amber-300 font-mono">{historicalPeakPct}%</strong></span>
          </div>
        </div>

        {/* PROGRESS TRACK CONTAINER WITH HISTORICAL PEAK MARKER */}
        <div className="relative w-full h-5 sm:h-6 bg-slate-900 rounded-xl border border-slate-800/80 p-0.5 overflow-visible">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px)] bg-[size:10%_100%]" />

          {/* ACTIVE OCCUPANCY FILL BAR */}
          <div
            className={`h-full rounded-lg bg-gradient-to-r ${barGradient} transition-all duration-700 shadow-md relative overflow-hidden flex items-center justify-end pr-1.5`}
            style={{ width: `${Math.min(100, Math.max(6, currentOccupancyPct))}%` }}
          >
            {/* Animated shimmer light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            <span className="text-[10px] font-black text-slate-950 drop-shadow-sm font-mono select-none">
              {currentOccupancyPct >= 18 ? `${currentOccupancyPct}%` : ''}
            </span>
          </div>

          {/* HISTORICAL PEAK MARKER LINE & PIN */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
            style={{ left: `${historicalPeakPct}%` }}
          >
            {/* Top Indicator Triangle Pin */}
            <div className="absolute -top-2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-amber-400" />
            {/* Bottom Indicator Triangle Pin */}
            <div className="absolute -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[5px] border-b-amber-400" />
          </div>
        </div>

        {/* SCALE & RELATIVE COMPARISON FOOTER */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
          <div className="flex items-center gap-2">
            <span>0% Vacío</span>
            <span className="text-slate-600">•</span>
            <span>50% Media</span>
            <span className="text-slate-600">•</span>
            <span>100% Completo</span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            {diffFromPeak < 0 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-bold">
                <TrendingDown className="w-3 h-3" />
                {Math.abs(diffFromPeak)}% bajo pico
              </span>
            ) : diffFromPeak === 0 ? (
              <span className="text-amber-400 flex items-center gap-0.5 font-bold">
                En pico histórico
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-0.5 font-bold">
                <TrendingUp className="w-3 h-3" />
                +{diffFromPeak}% sobre pico
              </span>
            )}
          </div>
        </div>
      </div>

      {/* EXPANDED DETAILS (HISTORICAL CURVE & SECTIONS) */}
      {isExpanded && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3 mt-1 animate-fade-in">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Horas Pico Habituales</span>
              <span className="text-xs font-bold text-amber-300 font-mono mt-0.5 block">
                {morningPeakHours} / {eveningPeakHours}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Comparativa Pico</span>
              <span className="text-xs font-bold text-cyan-300 font-mono mt-0.5 block">
                {pctOfPeak}% del pico máximo
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl col-span-2 sm:col-span-1">
              <span className="text-[9px] text-slate-400 uppercase font-bold block">Disponibilidad Estimada</span>
              <span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                {statusSubtext}
              </span>
            </div>
          </div>

          {/* HISTORICAL HOURLY DISTRIBUTION MINI-CHART */}
          {showHistoricalChart && (
            <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span className="font-bold flex items-center gap-1 text-slate-200">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  Curva de Afluencia Histórica (24h)
                </span>
                <span className="text-[9px] text-slate-400 font-mono">Lunes a Viernes</span>
              </div>

              {/* Bar Columns Chart */}
              <div className="grid grid-cols-11 gap-1 items-end h-16 pt-2 px-1">
                {hourlyData.map((item, idx) => {
                  const isCurrentHourBar = idx === 4; // Mock representing mid-day / current window
                  return (
                    <div key={item.hour} className="flex flex-col items-center gap-1 group relative h-full justify-end">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-7 bg-slate-800 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {item.hour}: {item.pct}% {item.isPeak ? '★ Pico' : ''}
                      </div>

                      {/* Bar fill */}
                      <div
                        className={`w-full rounded-t transition-all ${
                          item.isPeak
                            ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : isCurrentHourBar
                            ? 'bg-cyan-400 ring-1 ring-cyan-300'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        style={{ height: `${item.pct}%` }}
                      />
                      <span className="text-[7px] text-slate-400 font-mono truncate w-full text-center">
                        {item.hour.slice(0, 2)}h
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1 border-t border-slate-800">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-amber-400 inline-block" />
                  <span>Horas Pico ({historicalPeakPct}%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-cyan-400 inline-block" />
                  <span>Ocupación Actual ({currentOccupancyPct}%)</span>
                </div>
              </div>
            </div>
          )}

          {/* VAGONES / SECCIONES DE OCUPACIÓN */}
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl space-y-1.5">
            <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              {line.type === 'metro' || line.type === 'train' ? 'Ocupación por Vagón' : 'Afluencia por Sección del Bus'}
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {sectionBreakdown.map((sec, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800/90 p-1.5 rounded-lg text-center space-y-1">
                  <div className="text-[8px] text-slate-400 truncate">{sec.name}</div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sec.pct >= 75 ? 'bg-rose-500' : sec.pct >= 45 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${sec.pct}%` }}
                    />
                  </div>
                  <div className="text-[9px] font-black font-mono text-slate-200">{sec.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
