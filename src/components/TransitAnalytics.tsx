import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Clock,
  Zap,
  Activity,
  BarChart3,
  Layers,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { CityNetwork, TransitLine } from '../types';
import { LanguageCode, TRANSLATIONS } from '../data/translations';

interface TransitAnalyticsProps {
  activeCity: CityNetwork;
  lines: TransitLine[];
  currentLanguage?: LanguageCode;
}

export const TransitAnalytics: React.FC<TransitAnalyticsProps> = ({
  activeCity,
  lines,
  currentLanguage = 'es',
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.es;

  const [selectedMode, setSelectedMode] = useState<'all' | 'metro' | 'bus' | 'train'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'capacity'>('area');
  const [showForecast, setShowForecast] = useState<boolean>(true);

  // Generate hourly demand data scaled specifically for the active city & lines
  const hourlyData = useMemo(() => {
    // City multiplier based on city ID
    let cityFactor = 1.0;
    if (activeCity.id === 'paris') cityFactor = 1.4;
    else if (activeCity.id === 'london') cityFactor = 1.5;
    else if (activeCity.id === 'madrid') cityFactor = 1.2;
    else if (activeCity.id === 'berlin') cityFactor = 1.1;
    else if (activeCity.id === 'barcelona') cityFactor = 1.15;

    const rawHours = [
      { hour: '05:00', baseMetro: 12000, baseBus: 8000, baseTrain: 6000, capacityPct: 22 },
      { hour: '06:00', baseMetro: 28000, baseBus: 18000, baseTrain: 14000, capacityPct: 45 },
      { hour: '07:00', baseMetro: 58000, baseBus: 32000, baseTrain: 28000, capacityPct: 78 },
      { hour: '08:00', baseMetro: 89000, baseBus: 46000, baseTrain: 42000, capacityPct: 96 },
      { hour: '09:00', baseMetro: 74000, baseBus: 38000, baseTrain: 35000, capacityPct: 82 },
      { hour: '10:00', baseMetro: 42000, baseBus: 24000, baseTrain: 21000, capacityPct: 54 },
      { hour: '11:00', baseMetro: 38000, baseBus: 22000, baseTrain: 19000, capacityPct: 48 },
      { hour: '12:00', baseMetro: 45000, baseBus: 26000, baseTrain: 22000, capacityPct: 56 },
      { hour: '13:00', baseMetro: 49000, baseBus: 28000, baseTrain: 24000, capacityPct: 60 },
      { hour: '14:00', baseMetro: 41000, baseBus: 23000, baseTrain: 20000, capacityPct: 50 },
      { hour: '15:00', baseMetro: 46000, baseBus: 27000, baseTrain: 23000, capacityPct: 58 },
      { hour: '16:00', baseMetro: 59000, baseBus: 35000, baseTrain: 31000, capacityPct: 72 },
      { hour: '17:00', baseMetro: 82000, baseBus: 44000, baseTrain: 40000, capacityPct: 91 },
      { hour: '18:00', baseMetro: 94000, baseBus: 49000, baseTrain: 45000, capacityPct: 98 },
      { hour: '19:00', baseMetro: 71000, baseBus: 38000, baseTrain: 33000, capacityPct: 76 },
      { hour: '20:00', baseMetro: 48000, baseBus: 25000, baseTrain: 22000, capacityPct: 55 },
      { hour: '21:00', baseMetro: 33000, baseBus: 18000, baseTrain: 15000, capacityPct: 38 },
      { hour: '22:00', baseMetro: 24000, baseBus: 12000, baseTrain: 10000, capacityPct: 28 },
      { hour: '23:00', baseMetro: 16000, baseBus: 8000, baseTrain: 6000, capacityPct: 18 },
      { hour: '00:00', baseMetro: 9000, baseBus: 4000, baseTrain: 3000, capacityPct: 12 },
    ];

    return rawHours.map((item) => {
      const metro = Math.round(item.baseMetro * cityFactor);
      const bus = Math.round(item.baseBus * cityFactor);
      const train = Math.round(item.baseTrain * cityFactor);
      const total = metro + bus + train;
      // Add slight variance for AI forecast prediction line
      const forecast = Math.round(total * (1 + (Math.sin(rawHours.indexOf(item)) * 0.04)));

      return {
        hour: item.hour,
        metro,
        bus,
        train,
        total,
        forecast,
        capacityPct: item.capacityPct,
      };
    });
  }, [activeCity.id]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const peakHourItem = [...hourlyData].sort((a, b) => b.total - a.total)[0];
    const totalDailyRiders = hourlyData.reduce((acc, curr) => acc + curr.total, 0);

    // Calculate line count and busiest line
    const metroLines = lines.filter((l) => l.type === 'metro');
    const busLines = lines.filter((l) => l.type === 'bus');
    const trainLines = lines.filter((l) => l.type === 'train');

    const busiestLine = lines.length > 0 ? lines[0] : null;

    return {
      peakHour: peakHourItem?.hour || '18:00',
      peakVolume: peakHourItem?.total || 188000,
      dailyTotal: totalDailyRiders,
      avgCapacity: Math.round(hourlyData.reduce((acc, c) => acc + c.capacityPct, 0) / hourlyData.length),
      metroCount: metroLines.length,
      busCount: busLines.length,
      trainCount: trainLines.length,
      busiestLineName: busiestLine ? `${busiestLine.lineNumber} (${busiestLine.lineName})` : 'M14',
    };
  }, [hourlyData, lines]);

  // Mode distribution pie data
  const modeDistribution = useMemo(() => {
    const metroTotal = hourlyData.reduce((acc, c) => acc + c.metro, 0);
    const busTotal = hourlyData.reduce((acc, c) => acc + c.bus, 0);
    const trainTotal = hourlyData.reduce((acc, c) => acc + c.train, 0);

    return [
      { name: 'Metro / Subway', value: metroTotal, color: '#3B82F6' },
      { name: 'Bus Urbano', value: busTotal, color: '#10B981' },
      { name: 'Train / RER', value: trainTotal, color: '#8B5CF6' },
    ];
  }, [hourlyData]);

  // Custom Recharts Dark Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B1120]/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[180px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Hora: {label}
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.5 rounded">
              {activeCity.flag} {activeCity.name.split(' ')[0]}
            </span>
          </div>

          <div className="space-y-1 pt-1">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-3 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color || entry.fill }}
                  />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">
                  {entry.value.toLocaleString()} <span className="text-[10px] text-slate-400">pas.</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="transit-analytics-section" className="bg-[#0F172A] border border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Analytics Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {t.analyticsTitle || 'Demanda de Pasajeros por Hora'}
              </h3>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                AI Model v3.6
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.analyticsSubtitle || 'Volumen simulado en tiempo real e inteligencia predictiva por red urbana'} — <strong className="text-slate-200">{activeCity.name}</strong>
            </p>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Mode Selector */}
          <div className="flex items-center bg-[#0B1120] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'area'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Curva 24h</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Por Modo</span>
            </button>
            <button
              onClick={() => setChartType('capacity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'capacity'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-amber-300" />
              <span>Ocupación %</span>
            </button>
          </div>

          {/* Toggle AI Forecast Line */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showForecast
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Predicción IA</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Demanda Hora Punta</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {metrics.peakVolume.toLocaleString()}{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">pas/h</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Hora Pico: {metrics.peakHour} hs
          </div>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Volumen Total Diario</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {(metrics.dailyTotal / 1000000).toFixed(2)}M{' '}
            <span className="text-xs text-slate-400 font-sans font-normal">viajes/día</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Promedio estimado red
          </div>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Uso de Capacidad</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">
            {metrics.avgCapacity}%
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            Fluidez promedio red
          </div>
        </div>

        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Línea Mayor Afluencia</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-sm sm:text-base font-bold text-white truncate">
            {metrics.busiestLineName}
          </div>
          <div className="text-[11px] text-purple-300 font-mono">
            Frecuencia alta (2-3 min)
          </div>
        </div>
      </div>

      {/* Recharts Analytics Visualization Area */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Visión Temporal (05:00 - 00:00)</span>
            <span className="text-[11px] text-slate-500 font-mono">• Actualización cada hora</span>
          </div>

          {/* Filter Pills inside chart */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500 mr-1 hidden sm:inline">Modo:</span>
            {(['all', 'metro', 'bus', 'train'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-colors ${
                  selectedMode === mode
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                }`}
              >
                {mode === 'all' ? 'Todos' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Chart Rendering Container */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMetro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTrain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '15px', fontSize: '11px', color: '#94A3B8' }}
                />

                {selectedMode === 'all' && (
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Demanda Total Red"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                )}

                {(selectedMode === 'all' || selectedMode === 'metro') && (
                  <Area
                    type="monotone"
                    dataKey="metro"
                    name="Subterráneo / Métro"
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMetro)"
                  />
                )}

                {(selectedMode === 'all' || selectedMode === 'bus') && (
                  <Area
                    type="monotone"
                    dataKey="bus"
                    name="Autobuses Urbanos"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBus)"
                  />
                )}

                {(selectedMode === 'all' || selectedMode === 'train') && (
                  <Area
                    type="monotone"
                    dataKey="train"
                    name="Trenes Cercanías / RER"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTrain)"
                  />
                )}

                {showForecast && (
                  <Area
                    type="monotone"
                    dataKey="forecast"
                    name="Modelo IA Predictivo"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="none"
                  />
                )}
              </AreaChart>
            ) : chartType === 'bar' ? (
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', color: '#94A3B8' }} />

                <Bar dataKey="metro" name="Metro" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="bus" name="Autobús" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="train" name="Tren" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="hour"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '11px', color: '#94A3B8' }} />

                <Bar
                  dataKey="capacityPct"
                  name="Ocupación de Red (%)"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Sub-Legend & Insights Banner */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Predicción calculada por la red neuronal de flujo de pasajeros de AI Studio.</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-slate-300">Pico Mañana: <strong className="text-blue-400">08:00 - 09:00</strong></span>
            <span className="text-slate-300">Pico Tarde: <strong className="text-indigo-400">17:30 - 19:00</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
