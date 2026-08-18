import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Radio,
  RefreshCw,
  ExternalLink,
  Clock,
  ShieldAlert,
  Server,
  Zap,
  ChevronRight,
  X,
  Info,
  CheckCircle2,
  Activity,
  MapPin,
} from 'lucide-react';
import { fetchCityDisruptions, DisruptionAlert, DisruptionApiResponse } from '../services/disruptionApi';
import { CityNetwork } from '../types';

interface DisruptionTickerProps {
  activeCity: CityNetwork;
  onSelectLineNumber?: (lineNumber: string) => void;
}

export const DisruptionTicker: React.FC<DisruptionTickerProps> = ({
  activeCity,
  onSelectLineNumber,
}) => {
  const [data, setData] = useState<DisruptionApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDisruption, setSelectedDisruption] = useState<DisruptionAlert | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showApiDetails, setShowApiDetails] = useState<boolean>(false);

  const loadDisruptions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchCityDisruptions(activeCity.id);
      setData(result);
    } catch (err: any) {
      setError('Failed to fetch external transit API disruptions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisruptions();

    // Auto-polling external API feed every 30 seconds
    const timer = setInterval(() => {
      loadDisruptions();
    }, 30000);

    return () => clearInterval(timer);
  }, [activeCity.id]);

  const disruptions = data?.disruptions || [];

  return (
    <div className="space-y-2 mb-4">
      {/* Dynamic Animated Ticker Bar */}
      <div className="bg-[#0B1120] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden relative">
        {/* Ticker Header / Live API Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>

            <span className="font-extrabold text-white tracking-wide uppercase flex items-center gap-1.5 font-mono">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              API DISRUPTIONS TICKER
            </span>

            <span className="hidden sm:inline-block text-slate-500 text-[11px]">•</span>

            <span className="text-slate-300 font-medium hidden sm:inline">
              {activeCity.flag} {activeCity.name} Live Feed
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            {data && (
              <button
                onClick={() => setShowApiDetails(!showApiDetails)}
                className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700/60"
                title="Ver detalles de conexión API Externa"
              >
                <Server className="w-3 h-3 text-blue-400" />
                <span className="hidden md:inline">{data.apiSource}</span>
                <span className="text-emerald-400 font-bold">({data.latencyMs}ms)</span>
              </button>
            )}

            <button
              onClick={loadDisruptions}
              disabled={isLoading}
              className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors flex items-center gap-1 px-2"
              title="Refrescar datos API"
            >
              <RefreshCw className={`w-3 h-3 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[10px] hidden sm:inline">API Sync</span>
            </button>
          </div>
        </div>

        {/* Ticker Content Row */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative overflow-hidden py-3 px-4 bg-[#090D16] min-h-[48px] flex items-center"
        >
          {isLoading && !data ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-1 font-mono animate-pulse">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              <span>Conectando con la API externa de transportes de {activeCity.name}...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs text-rose-400 py-1">
              <ShieldAlert className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : disruptions.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sin incidencias registradas en tiempo real para {activeCity.name}. Red operando al 100% de fluidez.</span>
            </div>
          ) : (
            <div className="w-full flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
              {/* Horizontal ticker items */}
              {disruptions.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    setSelectedDisruption(alert);
                    if (onSelectLineNumber) onSelectLineNumber(alert.lineNumber);
                  }}
                  className={`shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] shadow-md ${
                    alert.severity === 'critical'
                      ? 'bg-rose-950/40 border-rose-800/60 hover:bg-rose-900/50 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/40 border-amber-800/60 hover:bg-amber-900/50 text-amber-200'
                      : 'bg-blue-950/40 border-blue-800/60 hover:bg-blue-900/50 text-blue-200'
                  }`}
                >
                  <span
                    style={{ backgroundColor: alert.lineColor }}
                    className="px-2 py-0.5 rounded text-white font-black text-xs font-mono shadow-sm"
                  >
                    {alert.lineNumber}
                  </span>

                  <span className="text-xs font-bold truncate max-w-[220px] sm:max-w-[320px]">
                    {alert.title}
                  </span>

                  <span className="bg-slate-900/80 border border-slate-700/60 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold text-amber-300">
                    {alert.impact}
                  </span>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Details Drawer overlay */}
        {showApiDetails && data && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Server className="w-3.5 h-3.5" />
                Detalles de Endpoint API de Transporte Externo
              </span>
              <button
                onClick={() => setShowApiDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-400">
              <div>
                <span className="text-slate-500 block">Proveedor API:</span>
                <strong className="text-slate-200">{data.apiSource}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Endpoint REST:</span>
                <span className="text-blue-300 underline break-all">{data.disruptions[0]?.apiEndpoint || 'https://api.transit-europe.eu/v1/disruptions'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Latencia Red:</span>
                <strong className="text-emerald-400">{data.latencyMs} ms</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Disruption Detail Modal */}
      {selectedDisruption && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0B1120] border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 relative text-slate-100">
            {/* Close button */}
            <button
              onClick={() => setSelectedDisruption(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-full border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <span
                style={{ backgroundColor: selectedDisruption.lineColor }}
                className="px-3 py-1.5 rounded-xl font-black text-white text-base shadow-lg font-mono"
              >
                {selectedDisruption.lineNumber}
              </span>
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                  {selectedDisruption.lineName}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {selectedDisruption.title}
                </h3>
              </div>
            </div>

            {/* Severity & Category Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-lg font-bold font-mono uppercase">
                {selectedDisruption.severity}
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg font-bold font-mono">
                Impacto: {selectedDisruption.impact}
              </span>
              {selectedDisruption.estimatedResolution && (
                <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  Resolución: {selectedDisruption.estimatedResolution}
                </span>
              )}
            </div>

            {/* Description Body */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-400" />
                Informe de Incidencia en Directo
              </div>
              <p>{selectedDisruption.description}</p>
            </div>

            {/* Affected Stations */}
            {selectedDisruption.affectedStations.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Estaciones o Tramos Afectados:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {selectedDisruption.affectedStations.map((st, i) => (
                    <span
                      key={i}
                      className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-200 font-medium"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Source API Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-slate-500">
                <Server className="w-3 h-3 text-blue-400" />
                Fuente: {selectedDisruption.sourceProvider}
              </span>
              <button
                onClick={() => setSelectedDisruption(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold px-4 py-2 rounded-xl transition-colors text-xs"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
