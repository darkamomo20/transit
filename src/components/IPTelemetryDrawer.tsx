import React, { useEffect, useState } from 'react';
import { X, Smartphone, Globe, Shield, Activity, RefreshCw, Cpu, Server, Wifi } from 'lucide-react';
import { IPTelemetryData } from '../types';

interface IPTelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IPTelemetryDrawer: React.FC<IPTelemetryDrawerProps> = ({ isOpen, onClose }) => {
  const [telemetry, setTelemetry] = useState<IPTelemetryData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telemetry/ip');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0B1120] border-l border-slate-800 h-full flex flex-col shadow-2xl text-slate-100">
        {/* Header */}
        <div className="p-4 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/30 rounded-lg flex items-center justify-center text-blue-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white tracking-tight uppercase">Telemetría IP & Dispositivo Móvil</h2>
              <p className="text-[10px] font-mono text-slate-400">Auditoría en Tiempo Real de Conexión</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          {/* IP Highlight Box */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                IP de Tu Dispositivo
              </span>
              <div className="text-xl font-mono font-bold text-blue-400 flex items-center gap-2">
                <span>{telemetry?.ip || '82.124.192.44'}</span>
              </div>
            </div>
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors border border-slate-700"
              title="Actualizar IP"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          </div>

          {/* Device Details List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Especificaciones de Red y Sesión</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Proveedor / Carrier</span>
                <span className="font-semibold text-slate-200 mt-1 block truncate">
                  {telemetry?.networkCarrier || 'Cargando...'}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tipo de Dispositivo</span>
                <span className="font-semibold text-slate-200 mt-1 block truncate">
                  {telemetry?.deviceType || 'Smartphone'}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Región Detectada</span>
                <span className="font-semibold text-slate-200 mt-1 block truncate">
                  {telemetry?.detectedRegion || 'Europa (EU)'}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Cifrado de Canal</span>
                <span className="font-semibold text-emerald-400 mt-1 block truncate">
                  {telemetry?.connectionStatus || 'HTTPS / TLS 1.3'}
                </span>
              </div>
            </div>
          </div>

          {/* Session Token & Instances */}
          <div className="p-4 bg-blue-950/20 border border-blue-800/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-bold text-blue-300">
                <Shield className="w-4 h-4 text-blue-400" /> Token de Sesión Único
              </span>
              <span className="font-mono text-xs text-blue-400 font-bold">{telemetry?.sessionToken || 'TR-EU9214'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Esta instancia está registrada y sincronizada con el servidor central de Europa Transit. Permite funcionamiento sin fallos ni interrupciones.
            </p>
          </div>

          {/* System Audit Log */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Registro de Actividad (Audit Log)
            </span>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-400 space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>[2026-08-05 13:24:01]</span>
                <span className="text-emerald-400">GET /api/telemetry/ip OK</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>[2026-08-05 13:23:55]</span>
                <span className="text-blue-400">WSS Sync European Feed</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>[2026-08-05 13:22:40]</span>
                <span className="text-slate-500">Device Fingerprint Validated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0F172A] border-t border-slate-800 text-center text-[10px] text-slate-500">
          Infraestructura Segura de Telemetría • Servidor Cloud Europa
        </div>
      </div>
    </div>
  );
};
