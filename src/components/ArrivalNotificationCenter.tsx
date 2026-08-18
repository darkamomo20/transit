import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellOff,
  BellRing,
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Navigation,
  CheckCircle2,
  X,
  ChevronRight,
  Settings,
  Sparkles,
  Radio,
  Trash2,
  Play,
  Star,
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { TransitLine, CityNetwork } from '../types';
import { UserGpsPosition, calculateHaversineDistance } from './PhoneGpsTracker';
import {
  LanguageCode,
  formatArrivalVoiceSpeech,
  formatBrowserArrivalNotification,
  getTranslatedText
} from '../data/translations';

export interface NotificationLogItem {
  id: string;
  lineId: string;
  lineNumber: string;
  lineName: string;
  lineType: string;
  lineColor: string;
  textColor: string;
  nearbyStop: string;
  arrivalMinutes: number;
  distanceMeters?: number;
  timestamp: number;
  read: boolean;
}

export interface NotificationSettings {
  isEnabled: boolean;
  timeThresholdMinutes: number; // e.g. 2
  distanceThresholdMeters: number; // e.g. 500
  soundEnabled: boolean;
  voiceTtsEnabled: boolean; // Text-to-speech voice announcements
  browserNotificationsEnabled: boolean;
}

interface ArrivalNotificationCenterProps {
  lines: TransitLine[];
  activeCity: CityNetwork;
  userGps: UserGpsPosition | null;
  currentLanguage?: LanguageCode;
  onToggleFavorite: (id: string) => void;
  onSelectLine: (line: TransitLine) => void;
  onTrackOnMap?: (line: TransitLine) => void;
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  isEnabled: true,
  timeThresholdMinutes: 2,
  distanceThresholdMeters: 500,
  soundEnabled: true,
  voiceTtsEnabled: true,
  browserNotificationsEnabled: false,
};

const LANG_BCP47_MAP: Record<LanguageCode, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  nl: 'nl-NL'
};

// Natural speech announcement using Web Speech API (TTS) in user's selected language
export function speakArrivalAnnouncement(text: string, lang: LanguageCode | string = 'es') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser environment.');
    return;
  }
  try {
    const bcpLang = (LANG_BCP47_MAP[lang as LanguageCode]) || (lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`);
    window.speechSynthesis.cancel(); // Stop prior speech if active
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcpLang;
    utterance.rate = 0.95; // Clear natural cadence
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = bcpLang.slice(0, 2).toLowerCase();
      const match =
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix) && !v.name.includes('Google')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (match) utterance.voice = match;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis execution failed:', err);
  }
}

// Play synthesized dual-tone chime sound via Web Audio API (No external sound files required)
export function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Tone 1: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.25);

    // Tone 2: A5 (880 Hz) at +0.12s
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.45);
  } catch (e) {
    console.warn('AudioContext sound chime blocked or not supported:', e);
  }
}

// Request and trigger browser native desktop/mobile OS notifications
export async function sendNativeBrowserNotification(title: string, body: string, icon?: string) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const options: NotificationOptions = {
        body,
        icon: icon || '/ubical_logo.png',
        badge: '/ubical_logo.png',
      };
      new Notification(title, options);
    } catch (e) {
      console.warn('Browser notification failed:', e);
    }
  }
}

export const ArrivalNotificationCenter: React.FC<ArrivalNotificationCenterProps> = ({
  lines,
  activeCity,
  userGps,
  currentLanguage = 'es',
  onToggleFavorite,
  onSelectLine,
  onTrackOnMap,
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  // Settings State
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('transit_notification_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  // Notification History State
  const [logs, setLogs] = useState<NotificationLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('transit_notification_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Active floating toast notification
  const [activeToast, setActiveToast] = useState<NotificationLogItem | null>(null);

  // Track last time notification was fired per line to prevent spam (cooldown 45s)
  const lastNotifiedMap = useRef<Record<string, number>>({});

  // Browser Permission State
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if ('Notification' in window) return Notification.permission;
    return 'denied';
  });

  // Save Settings
  useEffect(() => {
    localStorage.setItem('transit_notification_settings', JSON.stringify(settings));
  }, [settings]);

  // Save Logs
  useEffect(() => {
    localStorage.setItem('transit_notification_logs', JSON.stringify(logs.slice(0, 30)));
    const unread = logs.filter((l) => !l.read).length;
    if (onUnreadCountChange) onUnreadCountChange(unread);
  }, [logs, onUnreadCountChange]);

  // Check browser notification permission
  const handleRequestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('Tu navegador no soporta Notificaciones Push Nativas.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
      if (result === 'granted') {
        setSettings((prev) => ({ ...prev, browserNotificationsEnabled: true }));
        sendNativeBrowserNotification(
          '🔔 Notificaciones Activadas - Castelginest Transport',
          'Recibirás avisos en tiempo real cuando tu línea favorita se aproxime a tu parada.'
        );
      } else {
        setSettings((prev) => ({ ...prev, browserNotificationsEnabled: false }));
      }
    } catch (err) {
      console.error('Permission error:', err);
    }
  };

  // REAL-TIME ARRIVAL & GEOLOCATION MONITORING ENGINE
  useEffect(() => {
    if (!settings.isEnabled) return;

    const favoriteLines = lines.filter((l) => l.isFavorite);
    if (favoriteLines.length === 0) return;

    const now = Date.now();

    favoriteLines.forEach((line) => {
      const nextArrivalMin = line.arrivals[0];
      if (nextArrivalMin === undefined) return;

      // Condition 1: Arrival time is at or below configured threshold (e.g., <= 2 mins)
      const isArrivalImminent = nextArrivalMin <= settings.timeThresholdMinutes;

      // Condition 2: Geolocation distance check (if GPS is active)
      let calculatedDist: number | undefined;
      let isNearStationGps = true;

      if (userGps && line.currentVehicles && line.currentVehicles.length > 0) {
        // Calculate distance from user GPS to closest vehicle on this line
        const distances = line.currentVehicles.map((v) =>
          calculateHaversineDistance(userGps.lat, userGps.lng, v.lat, v.lng)
        );
        calculatedDist = Math.min(...distances);

        // If distance threshold is set, check if within range
        if (settings.distanceThresholdMeters > 0) {
          isNearStationGps = calculatedDist <= settings.distanceThresholdMeters;
        }
      } else if (userGps) {
        // Fallback: estimate based on line walk distance or city center
        calculatedDist = line.walkDistanceMeters || 300;
      }

      // Check if both arrival time and GPS distance criteria are satisfied
      if (isArrivalImminent && isNearStationGps) {
        const lastTime = lastNotifiedMap.current[line.id] || 0;
        const cooldownMs = 45000; // 45 seconds cooldown between alerts for same line

        if (now - lastTime > cooldownMs) {
          lastNotifiedMap.current[line.id] = now;

          // Build notification log item
          const newAlert: NotificationLogItem = {
            id: `notif-${line.id}-${now}`,
            lineId: line.id,
            lineNumber: line.lineNumber,
            lineName: line.lineName,
            lineType: line.type,
            lineColor: line.color,
            textColor: line.textColor,
            nearbyStop: line.nearbyStop,
            arrivalMinutes: nextArrivalMin,
            distanceMeters: calculatedDist,
            timestamp: now,
            read: false,
          };

          // Update state with new alert
          setLogs((prev) => [newAlert, ...prev]);
          setActiveToast(newAlert);

          // Play audio chime if sound enabled
          if (settings.soundEnabled) {
            playNotificationChime();
          }

          // Resolved user language
          const userLang: LanguageCode = (currentLanguage || (typeof window !== 'undefined' ? (localStorage.getItem('transit_lang') as LanguageCode) : null) || 'es') as LanguageCode;

          // Voice Text-to-Speech (TTS) Announcement (<500m proximity) in user language
          if (settings.voiceTtsEnabled) {
            const speechText = formatArrivalVoiceSpeech(
              userLang,
              line.lineNumber,
              line.destination,
              line.nearbyStop,
              nextArrivalMin,
              calculatedDist ? Math.round(calculatedDist) : undefined
            );
            speakArrivalAnnouncement(speechText, userLang);
          }

          // Trigger native browser notification in user language
          if (settings.browserNotificationsEnabled && browserPermission === 'granted') {
            const { title: notifTitle, body: notifBody } = formatBrowserArrivalNotification(
              userLang,
              line.lineNumber,
              line.destination,
              line.nearbyStop,
              nextArrivalMin,
              calculatedDist ? Math.round(calculatedDist) : undefined
            );

            sendNativeBrowserNotification(notifTitle, notifBody);
          }
        }
      }
    });
  }, [lines, userGps, settings, browserPermission, currentLanguage]);

  // Trigger test notification
  const handleTriggerTestNotification = () => {
    const mockLine = lines.find((l) => l.isFavorite) || lines[0];
    const userLang: LanguageCode = (currentLanguage || (typeof window !== 'undefined' ? (localStorage.getItem('transit_lang') as LanguageCode) : null) || 'es') as LanguageCode;
    const testAlert: NotificationLogItem = {
      id: `test-notif-${Date.now()}`,
      lineId: mockLine.id,
      lineNumber: mockLine.lineNumber,
      lineName: mockLine.lineName,
      lineType: mockLine.type,
      lineColor: mockLine.color,
      textColor: mockLine.textColor,
      nearbyStop: mockLine.nearbyStop,
      arrivalMinutes: 1,
      distanceMeters: userGps ? 180 : mockLine.walkDistanceMeters || 220,
      timestamp: Date.now(),
      read: false,
    };

    setLogs((prev) => [testAlert, ...prev]);
    setActiveToast(testAlert);

    if (settings.soundEnabled) {
      playNotificationChime();
    }

    if (settings.voiceTtsEnabled) {
      const speechText = formatArrivalVoiceSpeech(
        userLang,
        mockLine.lineNumber,
        mockLine.destination,
        mockLine.nearbyStop,
        1,
        180
      );
      speakArrivalAnnouncement(speechText, userLang);
    }

    if (settings.browserNotificationsEnabled && browserPermission === 'granted') {
      const { title: notifTitle, body: notifBody } = formatBrowserArrivalNotification(
        userLang,
        mockLine.lineNumber,
        mockLine.destination,
        mockLine.nearbyStop,
        1,
        180
      );
      sendNativeBrowserNotification(notifTitle, notifBody);
    }
  };

  const handleMarkAllAsRead = () => {
    setLogs((prev) => prev.map((l) => ({ ...l, read: true })));
  };

  const handleClearHistory = () => {
    setLogs([]);
  };

  return (
    <>
      {/* FLOATING TOAST BANNER (APPEARS AT TOP WHEN FAVORITE LINE ARRIVES AT STATION) */}
      <AnimatePresence>
        {activeToast ? (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg"
          >
            <div className="bg-[#0B132B] border-2 border-cyan-400/90 rounded-2xl p-3.5 shadow-2xl shadow-cyan-950/80 backdrop-blur-md relative overflow-hidden">
              {/* Top Accent Light Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 animate-pulse" />

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md">
                      <BellRing className="w-5 h-5 text-cyan-300 animate-bounce" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase font-mono shadow-sm"
                        style={{
                          backgroundColor: activeToast.lineColor,
                          color: activeToast.textColor,
                        }}
                      >
                        {activeToast.lineType.toUpperCase()} {activeToast.lineNumber}
                      </span>

                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {activeToast.arrivalMinutes === 0
                          ? '¡EN LA ESTACIÓN!'
                          : `Llega en ${activeToast.arrivalMinutes} min`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1 truncate">
                      Línea favorita próxima a <span className="text-cyan-300 underline">{activeToast.nearbyStop}</span>
                    </h4>

                    {activeToast.distanceMeters && (
                      <p className="text-[10px] font-mono text-slate-300 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        <span>GPS: A solo {activeToast.distanceMeters} m de tu posición</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Close Toast */}
                <button
                  onClick={() => setActiveToast(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action Buttons inside Toast */}
              <div className="flex items-center justify-end gap-2 mt-2.5 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    const line = lines.find((l) => l.id === activeToast.lineId);
                    if (line) onSelectLine(line);
                    setActiveToast(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-200 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  Ver Detalles
                </button>

                <button
                  onClick={() => {
                    const line = lines.find((l) => l.id === activeToast.lineId);
                    if (line && onTrackOnMap) onTrackOnMap(line);
                    setActiveToast(null);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-[10px] px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1 transition-all"
                >
                  <Navigation className="w-3 h-3 text-cyan-200" />
                  <span>Rastrear en Mapa GPS</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* NOTIFICATION CENTER MODAL / DRAWER */}
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="notification-center-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B132B] border-2 border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-100"
            >
              {/* MODAL HEADER */}
              <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                      <span>Alertas GPS de Líneas Favoritas</span>
                      <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[9px] font-mono px-2 py-0.5 rounded-full">
                        REAL-TIME
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400 truncate">
                      Avisos de llegada a estación con geolocalización activa
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-4 sm:p-5 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                
                {/* 1. MAIN SYSTEM TRACTOR TOGGLE */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Radio className={`w-5 h-5 ${settings.isEnabled ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                      <div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          Monitor de Salidas Favoritas
                        </h3>
                        <p className="text-[10px] text-slate-400">
                          {settings.isEnabled
                            ? 'Escaneando posición GPS y llegadas cada 3 segundos'
                            : 'Alertas desactivadas'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSettings((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Geolocation Status Indicator */}
                  <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-cyan-400" />
                      <span className="text-slate-300">
                        GPS Móvil:{' '}
                        {userGps ? (
                          <strong className="text-emerald-400">
                            Activo ({userGps.lat.toFixed(4)}, {userGps.lng.toFixed(4)})
                          </strong>
                        ) : (
                          <strong className="text-amber-400">Parada Cercana por Defecto</strong>
                        )}
                      </span>
                    </div>
                    {userGps && (
                      <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800">
                        ±{userGps.accuracy}m precisión
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. CONFIGURATION CONTROLS */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-blue-400" />
                    Ajustes de Alerta de Llegada
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Time Threshold */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">
                        Avisar cuando llegue en:
                      </label>
                      <select
                        value={settings.timeThresholdMinutes}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            timeThresholdMinutes: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-slate-900 text-white font-bold text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value={1}>1 minuto antes (Inminente)</option>
                        <option value={2}>2 minutos antes (Recomendado)</option>
                        <option value={3}>3 minutos antes</option>
                        <option value={5}>5 minutos antes</option>
                      </select>
                    </div>

                    {/* Distance Threshold */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 block uppercase">
                        Radio GPS de Parada:
                      </label>
                      <select
                        value={settings.distanceThresholdMeters}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            distanceThresholdMeters: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-slate-900 text-white font-bold text-xs p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value={200}>200 metros (A pie corto)</option>
                        <option value={500}>500 metros (Estación cercana)</option>
                        <option value={1000}>1 kilómetro</option>
                        <option value={0}>Sin límite GPS (Solo tiempo)</option>
                      </select>
                    </div>
                  </div>

                  {/* Sound, Voice TTS & Web Push Permissions Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {/* Voice TTS Toggle */}
                    <button
                      onClick={() => {
                        const nextVal = !settings.voiceTtsEnabled;
                        setSettings((prev) => ({ ...prev, voiceTtsEnabled: nextVal }));
                        if (nextVal) {
                          speakArrivalAnnouncement('Notificaciones de voz activadas por GPS a menos de 500 metros.', 'es-ES');
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                        settings.voiceTtsEnabled
                          ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className={`w-4 h-4 ${settings.voiceTtsEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                        <span>Voz (TTS) &lt;500m</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                        {settings.voiceTtsEnabled ? 'SÍ' : 'NO'}
                      </span>
                    </button>

                    {/* Audio Chime Toggle */}
                    <button
                      onClick={() => {
                        const newSound = !settings.soundEnabled;
                        setSettings((prev) => ({ ...prev, soundEnabled: newSound }));
                        if (newSound) playNotificationChime();
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                        settings.soundEnabled
                          ? 'bg-blue-950/40 border-blue-600/60 text-blue-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {settings.soundEnabled ? (
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-slate-500" />
                        )}
                        <span>Chime Audio</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                        {settings.soundEnabled ? 'SÍ' : 'NO'}
                      </span>
                    </button>

                    {/* Browser Native Notifications Toggle */}
                    <button
                      onClick={handleRequestBrowserPermission}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                        browserPermission === 'granted'
                          ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-amber-400" />
                        <span>Push Web</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                          browserPermission === 'granted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {browserPermission === 'granted' ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  </div>

                  {/* Test Button */}
                  <div className="pt-1">
                    <button
                      onClick={handleTriggerTestNotification}
                      className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-cyan-300 font-bold text-xs py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 shadow transition-all active:scale-[0.98]"
                    >
                      <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                      <span>Probar Alerta de Prueba (Sonido + Notificación)</span>
                    </button>
                  </div>
                </div>

                {/* 3. FAVORITE LINES QUICK MANAGER */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      Tus Líneas Favoritas Registradas
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {lines.filter((l) => l.isFavorite).length} de {lines.length} elegidas
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1.5">
                    {lines.map((line) => (
                      <div
                        key={line.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          line.isFavorite
                            ? 'bg-amber-950/20 border-amber-500/40 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-7 h-7 rounded-lg font-black text-xs font-mono flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: line.color, color: line.textColor }}
                          >
                            {line.lineNumber}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {line.lineName}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              Próxima parada: {line.nearbyStop} • Llega en {line.arrivals[0]} min
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleFavorite(line.id)}
                          className={`p-2 rounded-lg transition-colors shrink-0 ${
                            line.isFavorite
                              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                              : 'bg-slate-900 text-slate-500 hover:text-white'
                          }`}
                          title={line.isFavorite ? 'Quitar de Favoritas' : 'Marcar como Favorita'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              line.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. NOTIFICATION HISTORY LOG */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Historial de Avisos Recibidos
                    </h3>
                    {logs.length > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[10px] font-bold text-blue-400 hover:underline"
                        >
                          Marcar leídos
                        </button>
                        <button
                          onClick={handleClearHistory}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Borrar historial"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {logs.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs space-y-1">
                      <p className="font-bold text-slate-400">Sin historial de avisos aún</p>
                      <p className="text-[10px]">
                        Los avisos automáticos aparecerán aquí cuando tus líneas favoritas estén llegando.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1.5">
                      {logs.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                            item.read
                              ? 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                              : 'bg-blue-950/30 border-blue-600/50 text-white font-semibold'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono"
                                style={{
                                  backgroundColor: item.lineColor,
                                  color: item.textColor,
                                }}
                              >
                                {item.lineType.toUpperCase()} {item.lineNumber}
                              </span>
                              <span className="text-[11px] font-bold text-white truncate">
                                {item.nearbyStop}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 shrink-0">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span>
                              Llegada en {item.arrivalMinutes} min
                              {item.distanceMeters && ` • A ${item.distanceMeters} m de distancia`}
                            </span>
                            <button
                              onClick={() => {
                                const line = lines.find((l) => l.id === item.lineId);
                                if (line) {
                                  onSelectLine(line);
                                  onClose();
                                }
                              }}
                              className="text-cyan-400 hover:underline font-bold flex items-center gap-0.5"
                            >
                              <span>Ver</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[10px]">
                  Algoritmo GPS Predicción v3.6 • Paradas Castelginest
                </span>
                <button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black px-4 py-2 rounded-xl shadow-lg transition-colors"
                >
                  Entendido
                </button>
              </div>

            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
