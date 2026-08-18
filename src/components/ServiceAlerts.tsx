import React, { useState } from 'react';
import { AlertTriangle, Bell, ChevronDown, ChevronUp, RefreshCw, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TransitLine } from '../types';

interface ServiceAlertsProps {
  lines: TransitLine[];
  cityName: string;
  onSelectAlertLine?: (line: TransitLine) => void;
}

export const ServiceAlerts: React.FC<ServiceAlertsProps> = ({
  lines,
  cityName,
  onSelectAlertLine,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter lines with delays or crowd issues or alerts
  const delayedLines = lines.filter((line) => (line.delayMinutes && line.delayMinutes > 0) || line.crowdLevel === 'high');
  const totalAlerts = delayedLines.length;

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-4 text-slate-100">
      {/* Alert Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
              totalAlerts > 0
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {totalAlerts > 0 ? (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Alertas de Servicio en Directo ({cityName})
              </h3>
              {totalAlerts > 0 ? (
                <span className="bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  {totalAlerts} {totalAlerts === 1 ? 'Incidencia' : 'Incidencias'}
                </span>
              ) : (
                <span className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Servicio Normal (100% Fluido)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Monitoreo continuo de frecuencias, tiempos de espera y volumen de pasajeros en la red
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Alert Details List */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
          {totalAlerts === 0 ? (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-xl text-xs text-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-white font-bold">Todas las líneas operan a tiempo</strong>
                <span>Los algoritmos de IA no detectan retrasos significativos en esta red.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2 mt-3">
              {delayedLines.map((line) => (
                <div
                  key={line.id}
                  onClick={() => onSelectAlertLine && onSelectAlertLine(line)}
                  className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{ backgroundColor: line.color, color: line.textColor }}
                      className="font-black px-2.5 py-1 rounded-lg text-sm shadow"
                    >
                      {line.lineNumber}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{line.lineName}</span>
                        <span className="text-slate-400 text-[11px] font-normal">→ {line.destination}</span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {line.delayMinutes && line.delayMinutes > 0
                            ? `Retraso estimado de +${line.delayMinutes} min por regulación de tráfico.`
                            : 'Alta afluencia de pasajeros reportada.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      Prioridad Alta
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
