import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Mail,
  Lock,
  User,
  Sparkles,
  LogIn,
  ArrowRight,
  Zap,
  Battery,
  WifiOff,
  RefreshCw,
  Shield,
  CheckCircle2,
  LogOut,
  Volume2,
  VolumeX,
  Radio,
  MapPin,
  Play,
  Square,
  AudioWaveform as Waveform
} from 'lucide-react';
import { UserAccount } from '../types';
import { LanguageCode, TRANSLATIONS } from '../data/translations';
import { speakArrivalAnnouncement } from './ArrivalNotificationCenter';
import { UbicalLogo } from './UbicalLogo';
import { syncUserAccountToAdminDB } from '../services/userDatabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAccount: UserAccount;
  onLoginSuccess: (user: UserAccount) => void;
  isTelemetryPaused: boolean;
  onToggleTelemetry: (paused: boolean) => void;
  currentLanguage?: LanguageCode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userAccount,
  onLoginSuccess,
  isTelemetryPaused,
  onToggleTelemetry,
  currentLanguage = 'es',
}) => {
  const [isRegister, setIsRegister] = useState(!userAccount.isLoggedIn);
  const [email, setEmail] = useState(userAccount.email || '');
  const [name, setName] = useState(userAccount.name || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Text-to-Speech (TTS) Voice Settings State
  const [voiceTtsEnabled, setVoiceTtsEnabled] = useState<boolean>(() => {
    if (userAccount.voiceTtsEnabled !== undefined) return userAccount.voiceTtsEnabled;
    try {
      const savedNotif = localStorage.getItem('transit_notification_settings');
      if (savedNotif) {
        const parsed = JSON.parse(savedNotif);
        if (parsed.voiceTtsEnabled !== undefined) return parsed.voiceTtsEnabled;
      }
    } catch (e) {}
    return true;
  });

  const [ttsRadiusMeters, setTtsRadiusMeters] = useState<number>(() => {
    return userAccount.ttsRadiusMeters || 500;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.es;

  if (!isOpen) return null;

  const handleToggleTts = (enabled: boolean) => {
    setVoiceTtsEnabled(enabled);
    const updatedUser: UserAccount = {
      ...userAccount,
      voiceTtsEnabled: enabled,
      ttsRadiusMeters,
    };
    onLoginSuccess(updatedUser);

    // Synchronize with transit_notification_settings
    try {
      const saved = localStorage.getItem('transit_notification_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        'transit_notification_settings',
        JSON.stringify({ ...parsed, voiceTtsEnabled: enabled, distanceThresholdMeters: ttsRadiusMeters })
      );
    } catch (e) {}
  };

  const handleUpdateTtsRadius = (radius: number) => {
    setTtsRadiusMeters(radius);
    const updatedUser: UserAccount = {
      ...userAccount,
      voiceTtsEnabled,
      ttsRadiusMeters: radius,
    };
    onLoginSuccess(updatedUser);

    try {
      const saved = localStorage.getItem('transit_notification_settings');
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem(
        'transit_notification_settings',
        JSON.stringify({ ...parsed, distanceThresholdMeters: radius })
      );
    } catch (e) {}
  };

  const handleTestTtsSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz (Web Speech API).');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const langCode = currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'en' ? 'en-US' : 'es-ES';
    const sampleMessage =
      currentLanguage === 'fr'
        ? `Attention. Le bus de la ligne 12 direction Gare Centrale arrive à votre arrêt dans 2 minutes. Position GPS à moins de ${ttsRadiusMeters} mètres.`
        : currentLanguage === 'en'
        ? `Attention. Transit Line 12 heading to Central Station is arriving at your stop in 2 minutes. GPS proximity within ${ttsRadiusMeters} meters.`
        : `Atención. El transporte de la línea 12 en dirección Estación Central está llegando a tu parada en 2 minutos. Tu posición GPS está a menos de ${ttsRadiusMeters} metros de la parada.`;

    const utterance = new SpeechSynthesisUtterance(sampleMessage);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const matchedVoice = voices.find(
        (v) => (v.lang.startsWith(langCode.slice(0, 2)) || v.lang.includes('es')) && !v.name.includes('Google')
      ) || voices.find((v) => v.lang.startsWith(langCode.slice(0, 2)));
      if (matchedVoice) utterance.voice = matchedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleAdminLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const adminUser: UserAccount = {
        id: 'admin_001',
        email: 'admin@transports-castelginest.fr',
        name: 'Administrador / Operador de Red',
        plan: 'enterprise',
        registeredDate: new Date().toLocaleDateString('es-ES'),
        isLoggedIn: true,
        isAdmin: true,
        role: 'admin',
        voiceTtsEnabled,
        ttsRadiusMeters,
      };
      syncUserAccountToAdminDB(adminUser);
      onLoginSuccess(adminUser);
      onClose();
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const user: UserAccount = {
        id: userAccount.isLoggedIn ? userAccount.id : `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: email || userAccount.email || 'usuario@europa-transit.eu',
        name: name || (email ? email.split('@')[0] : userAccount.name) || 'Viajero Europa',
        plan: userAccount.plan || 'free',
        registeredDate: userAccount.registeredDate || new Date().toLocaleDateString('es-ES'),
        isLoggedIn: true,
        role: 'user',
        pauseTelemetry: isTelemetryPaused,
        voiceTtsEnabled,
        ttsRadiusMeters,
      };
      syncUserAccountToAdminDB(user, { isNewRegistration: true });
      onLoginSuccess(user);
      onClose();
    }, 600);
  };

  const handleLogout = () => {
    const guestUser: UserAccount = {
      id: 'guest_001',
      name: 'Viajero Invitado',
      plan: 'free',
      isLoggedIn: false,
      voiceTtsEnabled,
      ttsRadiusMeters,
    };
    onLoginSuccess(guestUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0B1120] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with UBICAL App Logo */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <UbicalLogo size="sm" showText={true} />
            <div className="w-8 h-8 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 shadow-md">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {userAccount.isLoggedIn ? t.profileTitle : isRegister ? 'Registro de Cuenta Europa Transit' : 'Iniciar Sesión'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {userAccount.isLoggedIn
                ? 'Gestiona tu perfil de viajero, notificaciones de voz por GPS y ajustes de red.'
                : isRegister
                ? 'Crea tu cuenta para guardar rutas favoritas, sincronizar en varios móviles y activar tu pase.'
                : 'Accede a tu cuenta sincronizada y a tu plan activo.'}
            </p>
          </div>
        </div>

        {/* Logged-In User Profile Details */}
        {userAccount.isLoggedIn && (
          <div className={`mb-5 p-4 rounded-2xl space-y-3 shadow-lg border ${
            userAccount.isAdmin || userAccount.role === 'admin'
              ? 'bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 border-amber-500/50 shadow-amber-500/10'
              : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userAccount.isAdmin || userAccount.role === 'admin' ? (
                  <div className="relative shrink-0">
                    <img
                      src="/ubical_logo.png"
                      alt="UBICAL Admin Logo"
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full border-2 border-amber-400 object-cover bg-white shadow-lg"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-400 border-2 border-slate-950 rounded-full animate-pulse shadow-sm" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    {(userAccount.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white">{userAccount.name}</h3>
                    {(userAccount.isAdmin || userAccount.role === 'admin') && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                        ADMIN UBICAL
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block">{userAccount.email || 'Sincronizado'}</span>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                userAccount.isAdmin || userAccount.role === 'admin'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-500/40'
              }`}>
                {userAccount.plan} PASS
              </span>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between items-center">
              <span>Registro: {userAccount.registeredDate || '2026'}</span>
              <button
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}

        {/* SECTION 1: NOTIFICACIONES DE VOZ (TEXT-TO-SPEECH) GPS A < 500 METROS */}
        <div className="mb-5 p-4 bg-gradient-to-br from-[#0F172A] to-[#0A101D] border border-cyan-500/40 rounded-2xl space-y-3.5 shadow-lg relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`p-2 rounded-xl transition-colors ${voiceTtsEnabled ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' : 'bg-slate-800 text-slate-500'}`}>
                <Volume2 className={`w-4 h-4 ${voiceTtsEnabled ? 'animate-pulse text-cyan-300' : ''}`} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-white tracking-wide">
                    {t.voiceTtsTitle || 'Notificaciones de Voz (Text-to-Speech)'}
                  </h4>
                  <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                    GPS &lt;500m
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Anuncia mediante voz la llegada cuando tu GPS esté a menos de 500 m
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => handleToggleTts(!voiceTtsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                voiceTtsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  voiceTtsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
            {t.voiceTtsDesc ||
              'Cuando tu posición GPS en el teléfono se encuentre a menos de 500 metros de la estación y tu transporte favorito esté por llegar, el asistente leerá el aviso en voz alta con nombre de parada y tiempo restante.'}
          </p>

          {/* Distance Radius Selector */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Radio de Detección GPS
              </label>
              <select
                value={ttsRadiusMeters}
                onChange={(e) => handleUpdateTtsRadius(Number(e.target.value))}
                className="w-full bg-slate-900 text-white font-bold text-xs p-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
              >
                <option value={200}>200 metros (A pie inmediato)</option>
                <option value={500}>500 metros (Predeterminado)</option>
                <option value={1000}>1000 metros (1 km)</option>
              </select>
            </div>

            <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Motor Síntesis de Voz
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Web Speech API Activo
              </span>
            </div>
          </div>

          {/* Interactive Test Voice Announcement Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestTtsSpeech}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2 px-3 rounded-xl border transition-all active:scale-95 ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border-cyan-500/50 shadow-md'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Detener Reproducción de Voz</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>{t.voiceTtsTest || 'Probar Anuncio de Voz (TTS)'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 2: DATA SAVER & TELEMETRY TOGGLE */}
        <div className="mb-6 p-4 bg-[#0F172A] border border-blue-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg">
                <Battery className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t.dataSaverTitle}</h4>
                <p className="text-[10px] text-slate-400">Optimización para tarifa móvil limitada</p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => onToggleTelemetry(!isTelemetryPaused)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isTelemetryPaused ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isTelemetryPaused ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            {t.pauseTelemetryDesc}
          </p>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="font-bold flex items-center gap-1.5">
              {isTelemetryPaused ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <WifiOff className="w-3.5 h-3.5" />
                  {t.telemetryPaused}
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {t.telemetryActive} (3s)
                </span>
              )}
            </span>

            {isTelemetryPaused && (
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
                Ahorro Activo
              </span>
            )}
          </div>
        </div>

        {/* Login / Register Form if not logged in */}
        {!userAccount.isLoggedIn && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@europa-transit.eu"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Crear Cuenta y Activar Prueba Pro' : 'Entrar a mi Cuenta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Admin Demo Login Button with UBICAL App Logo */}
            <button
              type="button"
              onClick={handleAdminLogin}
              className="w-full bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 hover:from-slate-850 hover:to-slate-850 text-amber-300 border border-amber-500/50 font-black text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <img
                src="/ubical_logo.png"
                alt="UBICAL Admin"
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full border border-amber-400 object-cover bg-white"
              />
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Entrar como Administrador UBICAL</span>
            </button>

            {/* Toggle Mode */}
            <div className="mt-4 text-center text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              {isRegister ? (
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              ) : (
                <p>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="text-blue-400 font-bold hover:underline"
                  >
                    Regístrate gratis
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
