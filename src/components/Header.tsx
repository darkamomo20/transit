import React from 'react';
import {
  MapPin,
  Search,
  Map as MapIcon,
  List,
  Sparkles,
  Camera,
  Navigation,
  Globe,
  Footprints,
  Zap,
  Bookmark,
  Languages,
  BarChart3,
  Star,
  Timer,
  LayoutGrid,
  User,
  Activity,
  Bell,
  Sun,
  Moon,
  Shield,
  X
} from 'lucide-react';
import { CityNetwork } from '../types';
import { CITIES } from '../data/mockTransitData';
import { LanguageCode, LANGUAGES, TRANSLATIONS } from '../data/translations';
import { UbicalLogo } from './UbicalLogo';

const ubicalLogoUrl = '/ubical_logo.png';

interface HeaderProps {
  activeCity: CityNetwork;
  onSelectCity: (city: CityNetwork) => void;
  activeView: 'list' | 'map' | 'planner' | 'vision' | 'analytics' | 'commute' | 'dashboard' | 'admin' | 'maps_places';
  onChangeView: (view: 'list' | 'map' | 'planner' | 'vision' | 'analytics' | 'commute' | 'dashboard' | 'admin' | 'maps_places') => void;
  filterMode: string;
  onChangeFilterMode: (mode: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAssistant: () => void;
  walkingTimeMinutes: number;
  onOpenSubscription: () => void;
  onOpenAuth: () => void;
  onOpenIPTelemetry: () => void;
  userAccount: any;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCity,
  onSelectCity,
  activeView,
  onChangeView,
  filterMode,
  onChangeFilterMode,
  searchQuery,
  onSearchChange,
  onOpenAssistant,
  walkingTimeMinutes,
  onOpenSubscription,
  onOpenAuth,
  onOpenIPTelemetry,
  userAccount,
  currentLanguage,
  onSelectLanguage,
  onOpenNotifications,
  unreadNotificationCount = 0,
  theme = 'dark',
  onToggleTheme,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.es;
  const activeLangOption = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  // Persistent favorite cities state
  const [favoriteCityIds, setFavoriteCityIds] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('transit_favorite_cities');
      return saved ? JSON.parse(saved) : ['paris', 'madrid', 'london'];
    } catch (e) {
      return ['paris', 'madrid', 'london'];
    }
  });

  // Dropdown states
  const [isCityMenuOpen, setIsCityMenuOpen] = React.useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = React.useState(false);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setIsCityMenuOpen(false);
      setIsLangMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const toggleFavoriteCity = (cityId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteCityIds((prev) => {
      const next = prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId];
      try {
        localStorage.setItem('transit_favorite_cities', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save favorite cities', err);
      }
      return next;
    });
  };

  const favoriteCities = CITIES.filter((c) => favoriteCityIds.includes(c.id));
  const otherCities = CITIES.filter((c) => !favoriteCityIds.includes(c.id));

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A] border-b border-slate-800 text-slate-200 shadow-2xl">
      {/* BRANDING TITLE BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 pb-2 flex items-center justify-between gap-2">
        {/* Logo & Network Title */}
        <UbicalLogo size="md" showText={true} />
      </div>

      {/* HEADER CONTROL PILLS ROW (MATCHING IMAGE: [FR Paris 🌐] [ES ES 🌐] [✨ AI Copilot]) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-2.5 flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pr-3">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* City Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsCityMenuOpen(!isCityMenuOpen);
                setIsLangMenuOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#131C31] hover:bg-[#1E2B45] border border-slate-700/80 text-slate-200 text-xs px-2 sm:px-3 py-1.5 rounded-2xl transition-all active:scale-95 shadow-sm shrink-0"
            >
              <span className="text-sm">{activeCity.flag}</span>
              <span className="font-extrabold text-white text-xs truncate max-w-[65px] sm:max-w-none">
                {activeCity.name.split(' ')[0]}
              </span>
              <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </button>

            {isCityMenuOpen && (
              <div className="absolute left-0 mt-1 w-60 sm:w-64 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 max-h-80 overflow-y-auto">
                {favoriteCities.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      Ciudades Favoritas
                    </div>
                    {favoriteCities.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCity(c);
                          setIsCityMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors ${
                          activeCity.id === c.id ? 'bg-blue-600/15 text-blue-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span>{c.flag}</span> {c.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={(e) => toggleFavoriteCity(c.id, e)}
                            className="p-1 hover:bg-slate-700 rounded transition-colors text-amber-400"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="my-1.5 border-t border-slate-800/80" />
                  </>
                )}

                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Redes Europeas ({CITIES.length})
                </div>
                {otherCities.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCity(c);
                      setIsCityMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 cursor-pointer transition-colors ${
                      activeCity.id === c.id ? 'bg-blue-600/15 text-blue-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{c.flag}</span> {c.name}
                    </span>
                    <button
                      onClick={(e) => toggleFavoriteCity(c.id, e)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-500 hover:text-amber-400 shrink-0"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsCityMenuOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#131C31] hover:bg-[#1E2B45] border border-slate-700/80 text-slate-200 text-xs px-2 sm:px-3 py-1.5 rounded-2xl transition-all active:scale-95 shadow-sm shrink-0"
            >
              <span className="text-sm">{activeLangOption.flag}</span>
              <span className="font-extrabold uppercase text-xs text-amber-300">{activeLangOption.code}</span>
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute left-0 mt-1 w-44 bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Idiomas de Europa
                </div>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang.code);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      currentLanguage === lang.code ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span> {lang.name}
                    </span>
                    {currentLanguage === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Persistent Theme Selector (Dark / Light) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 sm:gap-1.5 bg-[#131C31] hover:bg-[#1E2B45] border border-slate-700/80 px-2 sm:px-2.5 py-1.5 rounded-2xl transition-all active:scale-95 shadow-sm shrink-0"
              title={theme === 'light' ? 'Cambiar a Modo Oscuro' : 'Cambiar a Modo Claro'}
            >
              {theme === 'light' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-extrabold text-amber-500 hidden sm:inline">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="text-[11px] font-extrabold text-cyan-300 hidden sm:inline">Oscuro</span>
                </>
              )}
            </button>
          )}

          {/* Notification Bell Button */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative flex items-center justify-center bg-[#131C31] hover:bg-[#1E2B45] border border-slate-700/80 text-slate-200 px-2 sm:px-2.5 py-1.5 rounded-2xl transition-all active:scale-95 shadow-sm shrink-0"
              title="Notificaciones y Avisos"
            >
              <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-md">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* AI Copilot Button (Matching Image: Bright Blue Pill) - NEVER TRUNCATED */}
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xs px-2.5 sm:px-3.5 py-1.5 rounded-2xl shadow-lg shadow-blue-600/30 transition-all border border-blue-400/40 active:scale-95 shrink-0 whitespace-nowrap min-w-fit ml-1"
          title="Asistente de Inteligencia Artificial"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse shrink-0" />
          <span className="font-extrabold text-xs tracking-tight whitespace-nowrap">{t.copilot}</span>
        </button>
      </div>

      {/* ROW 2: APP VIEW NAVIGATION TABS & STATUS BADGES BAR */}
      <div className="bg-[#0B1120] border-t border-b border-slate-800/80 px-2 sm:px-4 py-2">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Main Navigation Tabs - Organized in 2 rows on mobile so ALL sections are visible */}
          <div className="flex flex-col gap-1.5 w-full sm:w-auto">
            {/* Nav Row 1 */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => onChangeView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                  activeView === 'list'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md ring-1 ring-blue-400/40'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <List className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.lines}</span>
              </button>

              <button
                onClick={() => onChangeView('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                  activeView === 'map'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md ring-1 ring-blue-400/40'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.map}</span>
              </button>

              <button
                onClick={() => onChangeView('planner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                  activeView === 'planner'
                    ? 'bg-blue-600 text-white font-extrabold shadow-md ring-1 ring-blue-400/40'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.planner}</span>
              </button>

              <button
                onClick={() => onChangeView('commute')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                  activeView === 'commute'
                    ? 'bg-emerald-600 text-white font-extrabold shadow-md ring-1 ring-emerald-400/40'
                    : 'bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-800/50'
                }`}
              >
                <Timer className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.gpsCommute || 'Calculadora GPS'}</span>
              </button>

              <button
                onClick={() => onChangeView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                  activeView === 'dashboard'
                    ? 'bg-cyan-600 text-white font-extrabold shadow-md ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Panel</span>
              </button>

              {/* Admin Panel Button - Only visible if logged in with Administrator privileges */}
              {(userAccount?.isAdmin || userAccount?.role === 'admin') && (
                <button
                  onClick={() => onChangeView('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                    activeView === 'admin'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg ring-1 ring-amber-300'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panel Admin</span>
                </button>
              )}
            </div>

            {/* Nav Row 2 + Status Badges on Mobile */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onChangeView('maps_places')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                    activeView === 'maps_places'
                      ? 'bg-emerald-600 text-white font-extrabold shadow-md ring-1 ring-emerald-400/40'
                      : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-700/50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Maps</span>
                </button>

                <button
                  onClick={() => onChangeView('vision')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                    activeView === 'vision'
                      ? 'bg-purple-600 text-white font-extrabold shadow-md ring-1 ring-purple-400/40'
                      : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/40 border border-purple-800/50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.stopVision}</span>
                </button>

                <button
                  onClick={() => onChangeView('analytics')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 min-h-[32px] ${
                    activeView === 'analytics'
                      ? 'bg-indigo-600 text-white font-extrabold shadow-md ring-1 ring-indigo-400/40'
                      : 'bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.analytics}</span>
                </button>
              </div>

              {/* Quick Badges: Plan, Account, Telemetry */}
              <div className="flex items-center gap-1 shrink-0 bg-slate-900/80 p-1 rounded-xl border border-slate-800/90 shadow-sm ml-auto">
                <button
                  onClick={onOpenSubscription}
                  className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all shrink-0"
                  title="Plan de suscripción"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="uppercase tracking-wider">
                    {userAccount?.plan ? userAccount.plan.toUpperCase() : 'FREE'}
                  </span>
                </button>

                <button
                  onClick={onOpenIPTelemetry}
                  className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/80 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors shrink-0"
                  title="Telemetría IP Móvil"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">IP</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all shrink-0 border ${
                    userAccount?.isAdmin || userAccount?.role === 'admin'
                      ? 'bg-gradient-to-r from-slate-900 to-amber-950/40 text-amber-300 border-amber-500/50 shadow-sm'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700/80'
                  }`}
                  title={userAccount?.isAdmin || userAccount?.role === 'admin' ? 'Cuenta Administrador UBICAL' : 'Gestión de Cuenta'}
                >
                  {userAccount?.isAdmin || userAccount?.role === 'admin' ? (
                    <img
                      src="/ubical_logo.png"
                      alt="UBICAL Admin"
                      referrerPolicy="no-referrer"
                      className="w-3.5 h-3.5 rounded-full border border-amber-400 object-cover bg-white"
                    />
                  ) : (
                    <User className="w-3 h-3 text-blue-400" />
                  )}
                  <span className="hidden xs:inline truncate max-w-[70px]">
                    {userAccount?.isLoggedIn ? userAccount.name : t.account}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: LOCATION BANNER & SEARCH BAR */}
      <div className="bg-[#0F172A] py-2 px-3 sm:px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          {/* Location Title & Walk Badge */}
          <div className="flex items-center gap-2 text-slate-300 min-w-0">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate text-xs">
              <span className="text-slate-400">Opciones cerca de </span>
              <span className="font-bold text-slate-100 underline decoration-blue-500/50 underline-offset-4">
                {activeCity.locationLabel.replace('Opciones cerca de ', '').replace('Options near ', '')}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-blue-950/70 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0">
              <Footprints className="w-3 h-3 text-blue-400" />
              <span>{walkingTimeMinutes} min a pie</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ROW 4: MODE FILTER PILLS ORGANIZED IN 2 LINES FOR MOBILE */}
      <div className="bg-[#0B1120] px-3 sm:px-4 py-2 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
          {/* Mode Row 1 */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {([
              { id: 'all', label: t.allModes },
              { id: 'favorites', label: t.favorites, icon: <Bookmark className="w-3.5 h-3.5 text-amber-400" /> },
              { id: 'metro', label: t.metro },
              { id: 'bus', label: t.bus }
            ] as { id: string; label: string; icon?: React.ReactNode }[]).map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeFilterMode(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shrink-0 active:scale-95 min-h-[30px] ${
                  filterMode === item.id
                    ? 'bg-blue-600 text-white font-black shadow-lg ring-2 ring-blue-400/40'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/90 font-bold shadow-sm'
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Mode Row 2 */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {([
              { id: 'train', label: t.train },
              { id: 'bike', label: t.bike },
              { id: 'rideshare', label: t.rideshare }
            ] as { id: string; label: string; icon?: React.ReactNode }[]).map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeFilterMode(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shrink-0 active:scale-95 min-h-[30px] ${
                  filterMode === item.id
                    ? 'bg-blue-600 text-white font-black shadow-lg ring-2 ring-blue-400/40'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/90 font-bold shadow-sm'
                }`}
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
