import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Clock,
  MapPin,
  Footprints,
  Navigation,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Share2,
  Calendar,
  LocateFixed,
  Bus,
  Train,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Timer,
  RotateCcw,
  CloudSun,
  ShieldAlert,
  Lightbulb,
  Radio
} from 'lucide-react';
import { TransitLine, CityNetwork } from '../types';
import { UserGpsPosition, calculateHaversineDistance } from './PhoneGpsTracker';
import { getCityWeatherData } from '../utils/weather';
import { fetchCityDisruptions, DisruptionAlert } from '../services/disruptionApi';

interface GpsCommuteCalculatorProps {
  userGps: UserGpsPosition | null;
  lines: TransitLine[];
  activeCity: CityNetwork;
  initialLineId?: string;
  onRequestGps?: () => void;
  onTrackOnMap?: (line: TransitLine) => void;
}

interface CommuteAiImpact {
  impactLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  headline: string;
  explanation: string;
  recommendedAction: string;
  timeAdjustmentMins?: number;
}

export const GpsCommuteCalculator: React.FC<GpsCommuteCalculatorProps> = ({
  userGps,
  lines,
  activeCity,
  initialLineId,
  onRequestGps,
  onTrackOnMap,
}) => {
  // Selected line & target stop
  const [selectedLineId, setSelectedLineId] = useState<string>(
    initialLineId || (lines[0]?.id ?? '')
  );
  
  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedLineId) || lines[0],
    [lines, selectedLineId]
  );

  const [selectedStopIdx, setSelectedStopIdx] = useState<number>(
    selectedLine ? Math.min(2, selectedLine.upcomingStops.length - 1) : 0
  );

  // Walking speed profile: 80 m/min (4.8 km/h), 100 m/min (6 km/h), 60 m/min (3.6 km/h)
  const [walkSpeed, setWalkSpeed] = useState<number>(80);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  // City Disruptions state & Gemini AI Summary state
  const [disruptions, setDisruptions] = useState<DisruptionAlert[]>([]);
  const [aiImpact, setAiImpact] = useState<CommuteAiImpact | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Calculate default fallback GPS if real GPS not available
  const effectiveGps = useMemo<UserGpsPosition>(() => {
    if (userGps) return userGps;
    return {
      lat: activeCity.center[0] + 0.002,
      lng: activeCity.center[1] - 0.0015,
      accuracy: 15,
      timestamp: Date.now(),
      isRealDevice: false,
    };
  }, [userGps, activeCity]);

  // Station coordinates for selected line
  const stationCoords = useMemo<[number, number]>(() => {
    if (selectedLine && selectedLine.routeCoordinates && selectedLine.routeCoordinates.length > 0) {
      return selectedLine.routeCoordinates[0];
    }
    return [activeCity.center[0], activeCity.center[1]];
  }, [selectedLine, activeCity]);

  // Commute Math Calculations
  const commuteDetails = useMemo(() => {
    if (!selectedLine) return null;

    // 1. Distance from user GPS to station
    const distanceMeters = calculateHaversineDistance(
      effectiveGps.lat,
      effectiveGps.lng,
      stationCoords[0],
      stationCoords[1]
    );

    // 2. Walking time (mins)
    const walkMins = Math.max(1, Math.ceil(distanceMeters / walkSpeed));

    // 3. Real-time vehicle arrivals & wait time sync
    const arrivals = selectedLine.arrivals.length > 0 ? selectedLine.arrivals : [5, 15];
    
    // Find arrival vehicle that user can catch (arrival time >= walk time)
    let caughtArrival = arrivals.find((arr) => arr >= walkMins);
    let missedVehiclesCount = 0;

    if (caughtArrival === undefined) {
      const lastArr = arrivals[arrivals.length - 1];
      const freq = selectedLine.frequencyMinutes || 10;
      caughtArrival = lastArr + Math.ceil((walkMins - lastArr) / freq) * freq;
      missedVehiclesCount = arrivals.length;
    } else {
      missedVehiclesCount = arrivals.indexOf(caughtArrival);
    }

    // Wait time at station platform = caught vehicle arrival time - walking time
    const waitMins = Math.max(0, caughtArrival - walkMins);

    // 4. Target stop ride duration
    const targetStop = selectedLine.upcomingStops[selectedStopIdx] || selectedLine.upcomingStops[0];
    const rideMins = targetStop ? targetStop.timeInMin : 10;

    // 5. Total commute time
    const totalMins = walkMins + waitMins + rideMins;

    // Projected ETA string
    const etaDate = new Date(Date.now() + totalMins * 60 * 1000);
    const etaString = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      distanceMeters,
      walkMins,
      waitMins,
      rideMins,
      totalMins,
      etaString,
      targetStop,
      caughtArrival,
      missedVehiclesCount,
    };
  }, [effectiveGps, stationCoords, selectedLine, selectedStopIdx, walkSpeed]);

  // Format offset minutes from current time into HH:MM format
  const formatTimeOffset = (offsetMinutes: number) => {
    const d = new Date(Date.now() + offsetMinutes * 60 * 1000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Timeline nodes visualization data
  const timelineNodes = useMemo(() => {
    if (!commuteDetails || !selectedLine) return [];

    const nowMinutes = 0;
    const walkEndMinutes = commuteDetails.walkMins;
    const boardMinutes = commuteDetails.walkMins + commuteDetails.waitMins;
    const finalMinutes = commuteDetails.totalMins;

    return [
      {
        id: 'start',
        timeStr: formatTimeOffset(nowMinutes),
        label: 'Origen GPS',
        sublabel: 'Inicio caminata',
        icon: Navigation,
        accentBg: 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-950/40',
        durationLabel: `${commuteDetails.walkMins}m caminata`,
      },
      {
        id: 'station',
        timeStr: formatTimeOffset(walkEndMinutes),
        label: selectedLine.nearbyStop || 'Estación Cercana',
        sublabel: 'Llegada a andén',
        icon: MapPin,
        accentBg: 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-blue-950/40',
        durationLabel: `${commuteDetails.waitMins}m espera`,
      },
      {
        id: 'boarding',
        timeStr: formatTimeOffset(boardMinutes),
        label: `Abordaje ${selectedLine.lineNumber}`,
        sublabel: 'Salida de vehículo',
        icon: selectedLine.type === 'train' || selectedLine.type === 'metro' ? Train : Bus,
        accentBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-indigo-950/40',
        durationLabel: `${commuteDetails.rideMins}m viaje`,
      },
      {
        id: 'destination',
        timeStr: formatTimeOffset(finalMinutes),
        label: commuteDetails.targetStop?.name || 'Destino',
        sublabel: 'Llegada final',
        icon: CheckCircle2,
        accentBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-950/40',
        durationLabel: null,
      },
    ];
  }, [commuteDetails, selectedLine]);

  // Fetch City Disruptions on city change
  useEffect(() => {
    let active = true;
    const loadDisruptions = async () => {
      try {
        const res = await fetchCityDisruptions(activeCity.id);
        if (active && res?.disruptions) {
          setDisruptions(res.disruptions);
        }
      } catch (err) {
        console.error('Error fetching city disruptions:', err);
      }
    };
    loadDisruptions();
    return () => {
      active = false;
    };
  }, [activeCity.id]);

  // Weather data
  const weather = useMemo(() => {
    return getCityWeatherData(activeCity.id, activeCity.name);
  }, [activeCity.id, activeCity.name]);

  const WeatherIcon = weather.icon;

  // Fetch Gemini AI Impact Analysis for current commute calculation
  const fetchAiImpact = useCallback(async () => {
    if (!commuteDetails || !selectedLine) return;
    setLoadingAi(true);

    try {
      const lineDisruptions = disruptions.filter(
        (d) => d.lineNumber === selectedLine.lineNumber || d.severity === 'critical'
      );

      const response = await fetch('/api/gemini/commute-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeCity: activeCity.name,
          selectedLineNumber: selectedLine.lineNumber,
          selectedLineName: selectedLine.lineName,
          targetStopName: commuteDetails.targetStop?.name || 'Estación Destino',
          walkMins: commuteDetails.walkMins,
          waitMins: commuteDetails.waitMins,
          rideMins: commuteDetails.rideMins,
          totalMins: commuteDetails.totalMins,
          weather: {
            temp: weather.temp,
            condition: weather.condition,
            wind: weather.wind,
            mobilityImpact: weather.mobilityImpact,
          },
          disruptions: lineDisruptions.map((d) => ({
            title: d.title,
            severity: d.severity,
            impact: d.impact,
            lineNumber: d.lineNumber,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiImpact(data);
      } else {
        throw new Error('API server error');
      }
    } catch (error) {
      console.error('Error getting Gemini commute analysis:', error);
      // Fallback evaluation
      const lineDisruptions = disruptions.filter(
        (d) => d.lineNumber === selectedLine.lineNumber
      );
      const isRain = weather.condition.toLowerCase().includes('lluvia');
      
      setAiImpact({
        impactLevel: lineDisruptions.length > 0 ? 'moderate' : isRain ? 'low' : 'none',
        headline: lineDisruptions.length > 0
          ? `Alerta registrada en la línea ${selectedLine.lineNumber}`
          : isRain
          ? `Lluvia activa en ${activeCity.name} - Velocidad de caminata ajustada`
          : `Trayecto libre de interrupciones climáticas`,
        explanation: lineDisruptions.length > 0
          ? `Existen incidencias notificadas en ${selectedLine.lineNumber}. Los tiempos de espera en andén pueden incrementarse ligeramente.`
          : isRain
          ? `Las condiciones meteorológicas actuales (${weather.temp}, ${weather.condition}) sugieren reservar 2 minutos adicionales para la caminata inicial.`
          : `Condiciones excelentes para completar el trayecto de ${commuteDetails.totalMins} minutos sin demoras.`,
        recommendedAction: lineDisruptions.length > 0
          ? 'Monitorea las llegadas en tiempo real para confirmar el paso del siguiente vehículo.'
          : isRain
          ? 'Inicia la caminata con calzado adecuado o paraguas.'
          : 'Mantén tu plan de salida proyectado.',
        timeAdjustmentMins: lineDisruptions.length > 0 ? 3 : isRain ? 2 : 0,
      });
    } finally {
      setLoadingAi(false);
    }
  }, [
    commuteDetails,
    selectedLine,
    disruptions,
    activeCity.name,
    weather,
  ]);

  // Re-run AI analysis when selected line, destination stop, or walk speed changes
  useEffect(() => {
    fetchAiImpact();
  }, [selectedLineId, selectedStopIdx, walkSpeed, activeCity.id]);

  const handleSharePlan = () => {
    if (!commuteDetails || !selectedLine) return;
    const text = `Plan de Trayecto vía ${selectedLine.lineNumber} a ${commuteDetails.targetStop?.name}: Total ${commuteDetails.totalMins} mins (${commuteDetails.walkMins}m caminata + ${commuteDetails.waitMins}m espera + ${commuteDetails.rideMins}m viaje). Llegada estimada: ${commuteDetails.etaString}.`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedPlan(true);
      setTimeout(() => setCopiedPlan(false), 3000);
    }
  };

  if (!selectedLine || !commuteDetails) return null;

  // Filter line specific disruptions
  const relevantLineDisruptions = disruptions.filter(
    (d) => d.lineNumber === selectedLine.lineNumber || d.severity === 'critical'
  );

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 space-y-5">
      {/* Header & Live GPS Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Calculadora de Tiempo GPS en Tiempo Real
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase">
                EN VIVO
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Tiempo total de trayecto desde tu ubicación GPS exacta hasta la estación destino
            </p>
          </div>
        </div>

        {/* GPS Badge & Refresh */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2">
            <LocateFixed className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">
              {userGps ? `GPS ±${userGps.accuracy}m` : 'GPS Simulado'}
            </span>
          </div>

          {onRequestGps && (
            <button
              onClick={onRequestGps}
              className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Actualizar GPS teléfono"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Controls: Line Selection, Destination Stop & Walking Speed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Line Selector */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
            1. Línea de Transporte
          </label>
          <select
            value={selectedLineId}
            onChange={(e) => {
              setSelectedLineId(e.target.value);
              setSelectedStopIdx(0);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.lineNumber} - {l.lineName} (hacia {l.destination})
              </option>
            ))}
          </select>
        </div>

        {/* Target Stop Selector */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
            2. Estación Destino
          </label>
          <select
            value={selectedStopIdx}
            onChange={(e) => setSelectedStopIdx(Number(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-blue-500"
          >
            {selectedLine.upcomingStops.map((s, idx) => (
              <option key={idx} value={idx}>
                {s.name} (+{s.timeInMin} min de viaje)
              </option>
            ))}
          </select>
        </div>

        {/* Walking Speed Profile */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
            3. Ritmo de Caminata
          </label>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { label: '🏃 Rápido', speed: 100 },
              { label: '🚶 Normal', speed: 80 },
              { label: '♿ Accesible', speed: 60 },
            ].map((s) => (
              <button
                key={s.speed}
                onClick={() => setWalkSpeed(s.speed)}
                className={`flex-1 text-[11px] py-1 rounded-lg font-bold transition-all ${
                  walkSpeed === s.speed
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Commute Output Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-blue-300 font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tiempo Total de Trayecto Calculado</span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {commuteDetails.totalMins}
              </span>
              <span className="text-lg font-bold text-emerald-400">minutos totales</span>
              <span className="text-xs text-slate-400 font-mono">
                (Llegada est. ~{commuteDetails.etaString})
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1">
              Desde tu ubicación GPS a <strong>{selectedLine.nearbyStop}</strong> y trayecto en {selectedLine.lineNumber} hasta <strong>{commuteDetails.targetStop?.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onTrackOnMap && (
              <button
                onClick={() => onTrackOnMap(selectedLine)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg"
              >
                <Navigation className="w-4 h-4" />
                <span>Ver en Mapa</span>
              </button>
            )}

            <button
              onClick={handleSharePlan}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all"
            >
              {copiedPlan ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedPlan ? 'Copiado!' : 'Compartir'}</span>
            </button>
          </div>
        </div>

        {/* Proportional Commute Progress Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-1 text-amber-300">
              <Footprints className="w-3.5 h-3.5" /> Caminata ({commuteDetails.walkMins}m)
            </span>
            <span className="flex items-center gap-1 text-blue-300">
              <Clock className="w-3.5 h-3.5" /> Espera ({commuteDetails.waitMins}m)
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Bus className="w-3.5 h-3.5" /> Viaje ({commuteDetails.rideMins}m)
            </span>
          </div>

          <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
            <div
              style={{ width: `${(commuteDetails.walkMins / commuteDetails.totalMins) * 100}%` }}
              className="bg-amber-500 h-full rounded-l-full transition-all duration-500"
              title={`Caminata: ${commuteDetails.walkMins} min`}
            />
            <div
              style={{ width: `${(commuteDetails.waitMins / commuteDetails.totalMins) * 100}%` }}
              className="bg-blue-500 h-full transition-all duration-500"
              title={`Espera en estación: ${commuteDetails.waitMins} min`}
            />
            <div
              style={{ width: `${(commuteDetails.rideMins / commuteDetails.totalMins) * 100}%` }}
              className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
              title={`Viaje en transporte: ${commuteDetails.rideMins} min`}
            />
          </div>
        </div>
      </div>

      {/* HORIZONTAL TIMELINE VISUALIZATION (Beneath Commute Summary) */}
      <div className="bg-[#0D1527] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/15 border border-blue-500/30 rounded-xl text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                Línea de Tiempo del Trayecto (Secuencia Temporal)
                <span className="text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full uppercase">
                  Punto a Punto
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Horarios proyectados de llegada en cada segmento según velocidad GPS y frecuencia de red
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-emerald-400 font-extrabold bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ETA Final: ~{commuteDetails.etaString}</span>
          </div>
        </div>

        {/* Scrollable Horizontal Nodes Container */}
        <div className="overflow-x-auto no-scrollbar pt-2 pb-3">
          <div className="min-w-[620px] flex items-center justify-between relative px-4">
            {/* Background Connector Line */}
            <div className="absolute top-6 left-12 right-12 h-1 bg-slate-800 -z-0 rounded-full" />
            <div
              className="absolute top-6 left-12 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500 -z-0 rounded-full transition-all duration-500"
              style={{ width: 'calc(100% - 6rem)' }}
            />

            {/* Timeline Segment Nodes */}
            {timelineNodes.map((node, idx) => {
              const NodeIcon = node.icon;
              return (
                <div key={node.id} className="relative z-10 flex flex-col items-center text-center group min-w-[120px]">
                  {/* Expected Arrival Timestamp Badge */}
                  <div className="mb-2">
                    <span className="text-[11px] font-mono font-black text-white bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl shadow-lg group-hover:border-blue-400 transition-colors block">
                      {node.timeStr}
                    </span>
                  </div>

                  {/* Icon Node Circle */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 shadow-xl transition-transform group-hover:scale-110 ${node.accentBg}`}
                  >
                    <NodeIcon className="w-5 h-5" />
                  </div>

                  {/* Node Title & Details */}
                  <div className="mt-2.5 space-y-0.5">
                    <span className="text-xs font-extrabold text-white block max-w-[130px] truncate leading-tight">
                      {node.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      {node.sublabel}
                    </span>

                    {/* Segment Duration Badge */}
                    {node.durationLabel && (
                      <span className="inline-block text-[9px] font-mono font-bold text-amber-300 bg-slate-950/90 border border-slate-800 px-2 py-0.5 rounded-md mt-1">
                        +{node.durationLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* GEMINI AI SUMMARY PANEL: Weather & Disruption Commute Impact */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
        {/* Panel Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-4 h-4 animate-spin-slow text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Análisis de Impacto Climático e Incidencias
                </h3>
                <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full uppercase">
                  gemini-3.6-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluación con Inteligencia Artificial del impacto del clima e incidencias activas en tu tiempo de trayecto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAiImpact}
              disabled={loadingAi}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin text-purple-400' : ''}`} />
              <span>{loadingAi ? 'Analizando...' : 'Re-evaluar AI'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Pills (Weather & Line Alerts Context) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Weather Pill */}
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <WeatherIcon className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-slate-200">{weather.temp}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-300">{weather.condition}</span>
            <span className="text-slate-500">({weather.wind})</span>
          </div>

          {/* Line Disruption Status Pill */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold ${
            relevantLineDisruptions.length > 0
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
          }`}>
            {relevantLineDisruptions.length > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>{relevantLineDisruptions.length} incidencia(s) en la red/línea</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Línea {selectedLine.lineNumber} Sin Alertas Activas</span>
              </>
            )}
          </div>
        </div>

        {/* Gemini AI Generated Assessment Body */}
        {loadingAi ? (
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800/80 flex items-center justify-center gap-3 text-xs text-indigo-300 font-medium">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            <span>Consultando a Gemini AI para calcular el impacto del clima y alertas...</span>
          </div>
        ) : aiImpact ? (
          <div className="space-y-3">
            {/* Headline Callout Badge */}
            <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              aiImpact.impactLevel === 'severe' || aiImpact.impactLevel === 'high'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : aiImpact.impactLevel === 'moderate'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2.5">
                {aiImpact.impactLevel === 'severe' || aiImpact.impactLevel === 'high' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                ) : aiImpact.impactLevel === 'moderate' ? (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider block opacity-80">
                    Nivel de Impacto: {aiImpact.impactLevel.toUpperCase()}
                  </span>
                  <p className="text-xs sm:text-sm font-extrabold leading-snug">
                    {aiImpact.headline}
                  </p>
                </div>
              </div>

              {aiImpact.timeAdjustmentMins !== undefined && aiImpact.timeAdjustmentMins > 0 && (
                <span className="shrink-0 text-xs font-mono font-bold bg-slate-900/90 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg self-start sm:self-center">
                  +{aiImpact.timeAdjustmentMins} min est.
                </span>
              )}
            </div>

            {/* Explanation paragraph */}
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {aiImpact.explanation}
            </p>

            {/* Actionable Recommendation Box */}
            <div className="p-3 bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 rounded-xl flex items-start gap-2.5 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-indigo-200 block mb-0.5">
                  Recomendación Inteligente de Gemini:
                </span>
                <span className="text-slate-300 leading-normal">
                  {aiImpact.recommendedAction}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Breakdown Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Step 1: Walk to station */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Footprints className="w-4 h-4" /> 1. Caminata a Estación
            </span>
            <span className="font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-md">
              {commuteDetails.walkMins} min
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-snug">
            Distancia de <strong>{commuteDetails.distanceMeters} metros</strong> desde tu posición GPS hasta <strong>{selectedLine.nearbyStop}</strong>.
          </p>
        </div>

        {/* Step 2: Platform Wait Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-400 flex items-center gap-1">
              <Clock className="w-4 h-4" /> 2. Espera en Andén
            </span>
            <span className="font-mono text-blue-300 font-bold bg-blue-950/80 px-2 py-0.5 rounded-md">
              {commuteDetails.waitMins} min
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-snug">
            Siguiente vehículo disponible a los {commuteDetails.caughtArrival} min. Llegas al andén en {commuteDetails.walkMins} min (espera {commuteDetails.waitMins}m).
          </p>
        </div>

        {/* Step 3: Transit Ride */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              {selectedLine.type === 'train' || selectedLine.type === 'metro' ? (
                <Train className="w-4 h-4" />
              ) : (
                <Bus className="w-4 h-4" />
              )}
              3. Trayecto en {selectedLine.lineNumber}
            </span>
            <span className="font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md">
              {commuteDetails.rideMins} min
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-snug">
            Viaje a bordo de {selectedLine.lineName} hasta la parada <strong>{commuteDetails.targetStop?.name}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
