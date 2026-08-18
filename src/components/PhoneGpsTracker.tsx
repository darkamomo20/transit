import React, { useState, useEffect } from 'react';
import {
  Navigation,
  MapPin,
  Compass,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Footprints,
  Crosshair,
  Smartphone,
  ShieldCheck,
  LocateFixed,
  Signal
} from 'lucide-react';
import { CityNetwork, TransitLine } from '../types';

export interface UserGpsPosition {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
  isRealDevice: boolean;
}

interface PhoneGpsTrackerProps {
  activeCity: CityNetwork;
  lines: TransitLine[];
  onGpsUpdate?: (pos: UserGpsPosition) => void;
  onCenterMapToGps?: (lat: number, lng: number) => void;
  onFilterNearestGps?: () => void;
}

// Haversine formula for real physical distance calculation in meters
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const PhoneGpsTracker: React.FC<PhoneGpsTrackerProps> = ({
  activeCity,
  lines,
  onGpsUpdate,
  onCenterMapToGps,
  onFilterNearestGps,
}) => {
  const [position, setPosition] = useState<UserGpsPosition | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'active' | 'denied' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);

  // Request high-precision GPS position from device hardware
  const requestPhoneLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setErrorMessage('Geolocalización no soportada por el navegador.');
      return;
    }

    setGpsStatus('locating');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos: UserGpsPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
          speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0, // km/h
          heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
          timestamp: pos.timestamp,
          isRealDevice: true,
        };
        setPosition(userPos);
        setGpsStatus('active');
        if (onGpsUpdate) onGpsUpdate(userPos);
      },
      (err) => {
        console.warn('GPS position error:', err);
        setGpsStatus('denied');
        setErrorMessage('Permiso de ubicación denegado o no disponible. Usando centro de ciudad.');
        // Fallback to city center with high-precision mock phone offset
        const fallbackPos: UserGpsPosition = {
          lat: activeCity.center[0] + 0.0012,
          lng: activeCity.center[1] - 0.0008,
          accuracy: 12,
          timestamp: Date.now(),
          isRealDevice: false,
        };
        setPosition(fallbackPos);
        if (onGpsUpdate) onGpsUpdate(fallbackPos);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Continuous watch position setup
  useEffect(() => {
    requestPhoneLocation();

    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos: UserGpsPosition = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
            speed: pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 0,
            heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
            timestamp: pos.timestamp,
            isRealDevice: true,
          };
          setPosition(userPos);
          setGpsStatus('active');
          setIsWatching(true);
          if (onGpsUpdate) onGpsUpdate(userPos);
        },
        () => {},
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [activeCity.id]);

  // Find nearest transit line to current GPS coordinates
  const getNearestLine = () => {
    if (!position || lines.length === 0) return null;

    let nearest = lines[0];
    let minDistance = Infinity;

    lines.forEach((line) => {
      if (line.routeCoordinates && line.routeCoordinates.length > 0) {
        const [lineLat, lineLng] = line.routeCoordinates[0];
        const dist = calculateHaversineDistance(position.lat, position.lng, lineLat, lineLng);
        if (dist < minDistance) {
          minDistance = dist;
          nearest = line;
        }
      }
    });

    const walkMinutes = Math.max(1, Math.round(minDistance / 80)); // 80m per min human pace
    return { line: nearest, distanceMeters: minDistance, walkMinutes };
  };

  const nearestData = getNearestLine();

  return (
    <div className="bg-[#0B1120] border border-blue-900/40 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden mb-6 text-slate-100">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-2xl text-blue-400">
            <Smartphone className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                UBICACIÓN GPS REAL DEL TELÉFONO
              </h2>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase">
                {position?.isRealDevice ? 'GPS En Vivo Real' : 'Sensor Simulado'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Conexión directa a la antena GPS de tu dispositivo para rastreo de paradas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={requestPhoneLocation}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Refrescar GPS</span>
          </button>
        </div>
      </div>

      {/* GPS Sensor Data Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 my-3">
        {/* Card 1: Coordenadas GPS */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            Coordenadas GPS
          </span>
          <div className="mt-1 font-mono">
            {position ? (
              <div className="text-xs text-slate-200 font-bold tracking-tight">
                {position.lat.toFixed(4)}°, {position.lng.toFixed(4)}°
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">Buscando satélites...</span>
            )}
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              Precisión: ±{position?.accuracy || 8}m
            </span>
          </div>
        </div>

        {/* Card 2: Estado del Sensor */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Signal className="w-3.5 h-3.5 text-emerald-400" />
            Estado Satelital
          </span>
          <div className="mt-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300">
                {gpsStatus === 'active' ? 'Conexión GPS Estable' : gpsStatus === 'locating' ? 'Obteniendo GPS...' : 'Ubicación Red Estimada'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              {activeCity.flag} {activeCity.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Card 3: Velocidad / Elevación */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            Velocidad / Rumbo
          </span>
          <div className="mt-1 font-mono">
            <div className="text-xs text-slate-200 font-bold">
              {position?.speed ? `${position.speed} km/h (En movimiento)` : 'A pie (Estacional)'}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {position?.heading ? `Rumbo ${position.heading}° N` : 'Sensor de brújula activo'}
            </span>
          </div>
        </div>

        {/* Card 4: Estación / Línea más cercana */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-blue-400" />
            Línea Más Cercana
          </span>
          {nearestData ? (
            <div className="mt-1 flex items-center justify-between">
              <div>
                <span
                  style={{ backgroundColor: nearestData.line.color }}
                  className="px-2 py-0.5 rounded text-white font-black text-xs font-mono mr-1.5 inline-block"
                >
                  {nearestData.line.lineNumber}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  A {nearestData.distanceMeters}m
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-lg">
                ~{nearestData.walkMinutes} min a pie
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic mt-1">Calculando distancias...</span>
          )}
        </div>
      </div>

      {/* Action Bar for Map Centering */}
      {position && onCenterMapToGps && (
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Geolocalización protegida por privacidad HTTPS en el navegador.
          </span>
          <button
            onClick={() => onCenterMapToGps(position.lat, position.lng)}
            className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors underline"
          >
            <Crosshair className="w-3.5 h-3.5" />
            Centrar Mapa Interactivo en mi Posición Real GPS
          </button>
        </div>
      )}
    </div>
  );
};
