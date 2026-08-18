import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  AlertCircle, 
  X, 
  ChevronRight, 
  Clock, 
  MapPin, 
  ShieldAlert,
  Bell,
  BellOff,
  Radio,
  ExternalLink
} from 'lucide-react';
import { DisruptionAlert, fetchCityDisruptions } from '../services/disruptionApi';
import { CityNetwork } from '../types';

interface UrgentAlertsOverlayProps {
  activeCity: CityNetwork;
  onSelectLineNumber?: (lineNumber: string) => void;
  onOpenDisruptionModal?: (alert: DisruptionAlert) => void;
}

export const UrgentAlertsOverlay: React.FC<UrgentAlertsOverlayProps> = ({
  activeCity,
  onSelectLineNumber,
  onOpenDisruptionModal,
}) => {
  const [criticalAlerts, setCriticalAlerts] = useState<DisruptionAlert[]>([]);
  const [dismissedCityAlerts, setDismissedCityAlerts] = useState<Record<string, boolean>>({});
  const [currentAlertIndex, setCurrentAlertIndex] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadAlerts = async () => {
      try {
        const response = await fetchCityDisruptions(activeCity.id);
        if (isMounted && response?.disruptions) {
          // Filter major disruptions (critical or warning severity)
          const urgent = response.disruptions.filter(
            (d) => d.severity === 'critical' || d.severity === 'warning'
          );
          setCriticalAlerts(urgent);
          setCurrentAlertIndex(0);
        }
      } catch (err) {
        console.error('Error fetching urgent disruptions:', err);
      }
    };

    loadAlerts();

    // Poll every 30s
    const timer = setInterval(loadAlerts, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [activeCity.id]);

  const isDismissed = dismissedCityAlerts[activeCity.id];
  const hasAlerts = Boolean(criticalAlerts && criticalAlerts.length > 0 && !isDismissed);
  const activeAlert = hasAlerts ? (criticalAlerts[currentAlertIndex] || criticalAlerts[0]) : null;
  const isCritical = activeAlert?.severity === 'critical';

  const handleDismiss = () => {
    setDismissedCityAlerts((prev) => ({ ...prev, [activeCity.id]: true }));
  };

  const handleNextAlert = () => {
    setCurrentAlertIndex((prev) => (prev + 1) % criticalAlerts.length);
  };

  return (
    <AnimatePresence>
      {Boolean(hasAlerts && activeAlert) ? (
        <motion.div
          key={activeAlert?.id || activeCity.id}
          initial={{ opacity: 0, y: -20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-30 mb-4"
        >
        <div
          className={`relative overflow-hidden rounded-2xl border p-3.5 sm:p-4 shadow-2xl transition-all ${
            isCritical
              ? 'bg-gradient-to-r from-rose-950/90 via-red-950/80 to-slate-950/90 border-rose-500/60 shadow-rose-950/40'
              : 'bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-slate-950/90 border-amber-500/60 shadow-amber-950/40'
          }`}
        >
          {/* Background Ambient Glow */}
          <div
            className={`absolute top-0 left-0 w-full h-1 ${
              isCritical ? 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600' : 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500'
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left Header & Alert Badge */}
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`p-2.5 rounded-xl shrink-0 flex items-center justify-center ${
                  isCritical
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                {isCritical ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : (
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isCritical
                        ? 'bg-rose-500 text-white font-mono'
                        : 'bg-amber-500 text-slate-950 font-mono'
                    }`}
                  >
                    <Radio className="w-3 h-3 animate-ping" />
                    {isCritical ? 'ALERTA CRÍTICA DE RED' : 'INCIDENCIA GRAVE'}
                  </span>

                  <span
                    style={{ backgroundColor: activeAlert.lineColor }}
                    className="px-2 py-0.5 rounded text-white font-black text-xs font-mono shadow-sm"
                  >
                    {activeAlert.lineNumber}
                  </span>

                  <span className="text-[11px] font-mono text-slate-300">
                    {activeCity.flag} {activeCity.name}
                  </span>

                  {criticalAlerts.length > 1 && (
                    <button
                      onClick={handleNextAlert}
                      className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 px-2 py-0.5 rounded-full transition-colors"
                    >
                      {currentAlertIndex + 1} de {criticalAlerts.length} (Siguiente)
                    </button>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug truncate">
                  {activeAlert.title}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  {activeAlert.description}
                </p>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-xs font-extrabold font-mono bg-slate-900/90 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-xl">
                {activeAlert.impact}
              </span>

              {onSelectLineNumber && (
                <button
                  onClick={() => {
                    onSelectLineNumber(activeAlert.lineNumber);
                    if (onOpenDisruptionModal) {
                      onOpenDisruptionModal(activeAlert);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-1 ${
                    isCritical
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50'
                      : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/50'
                  }`}
                >
                  <span>Ver Línea</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
                title="Ignorar alerta urgente para esta sesión"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Affected Stations Pill Strip */}
          {activeAlert.affectedStations && activeAlert.affectedStations.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] text-slate-300">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                Estaciones afectadas:
              </span>
              {activeAlert.affectedStations.map((st, idx) => (
                <span
                  key={idx}
                  className="bg-slate-900/80 border border-slate-800 px-2 py-0.5 rounded-md font-medium text-slate-200 shrink-0"
                >
                  {st}
                </span>
              ))}
              {activeAlert.estimatedResolution && (
                <span className="ml-auto text-amber-300 font-mono text-[10px] shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Resolución estimada: {activeAlert.estimatedResolution}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
