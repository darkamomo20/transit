import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Clock,
  Sparkles,
  Footprints,
  Users,
  ShieldCheck,
  ChevronRight,
  Leaf,
  ArrowRight,
  Bus,
  Train,
  Bike,
  Car,
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';
import { CityNetwork, AIRoutePlan } from '../types';

interface SmartItineraryPlannerProps {
  activeCity: CityNetwork;
}

export const SmartItineraryPlanner: React.FC<SmartItineraryPlannerProps> = ({ activeCity }) => {
  const [origin, setOrigin] = useState('51-55 Boulevard de Clichy, Paris');
  const [destination, setDestination] = useState('Eiffel Tower (Tour Eiffel)');
  const [preference, setPreference] = useState<'fastest' | 'least_walking' | 'least_crowded' | 'wheelchair_accessible'>('fastest');
  const [planning, setPlanning] = useState(false);
  const [routes, setRoutes] = useState<AIRoutePlan[] | null>(null);

  const handlePlanItinerary = async () => {
    if (!destination.trim()) return;

    setPlanning(true);
    try {
      const response = await fetch('/api/gemini/smart-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          preference,
          activeCity: activeCity.name
        })
      });

      const data = await response.json();
      setRoutes(data.routes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPlanning(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'metro': return <Train className="w-4 h-4 text-purple-400" />;
      case 'bus': return <Bus className="w-4 h-4 text-emerald-400" />;
      case 'bike': return <Bike className="w-4 h-4 text-cyan-400" />;
      case 'rideshare': return <Car className="w-4 h-4 text-amber-400" />;
      default: return <Footprints className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Planner Card Header & Form */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/15 border border-blue-500/30 rounded-2xl text-blue-400">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Planificador Multimodal de Rutas</h2>
                <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  Google Maps
                </span>
              </div>
              <p className="text-xs text-slate-400">Optimización predictiva entre Metro, Bus, Andando y Bicicletas</p>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 px-3.5 py-2 rounded-xl transition-all shadow-sm shrink-0"
            title="Abrir itinerario en Google Maps"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Abrir en Google Maps</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Origen</label>
            <MapPin className="w-4 h-4 text-blue-400 absolute left-3 top-8" />
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Destino</label>
            <MapPin className="w-4 h-4 text-rose-400 absolute left-3 top-8" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Ej. Torre Eiffel, Museo del Prado, Plaza Mayor..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Preferences Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'fastest', label: '⚡ Más Rápido' },
              { id: 'least_walking', label: '🚶 Menos Caminata' },
              { id: 'least_crowded', label: '👥 Menor Ocupación' },
              { id: 'wheelchair_accessible', label: '♿ Accesible Silla de Ruedas' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPreference(p.id as any)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  preference === p.id
                    ? 'bg-blue-600 text-white border-blue-500 font-bold shadow'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlanItinerary}
            disabled={planning}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{planning ? 'Calculando Rutas...' : 'Buscar Rutas con IA'}</span>
          </button>
        </div>
      </div>

      {/* Generated AI Route Cards */}
      {routes && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-300">
              Itinerarios Recomendados ({routes.length})
            </h3>
            <a
              href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=transit`}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg"
            >
              <MapPin className="w-3 h-3" />
              <span>Ver en Google Maps</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          {routes.map((route, index) => (
            <div
              key={index}
              className="bg-[#0B1120] border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-slate-700 transition-colors space-y-4 text-slate-100"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="font-extrabold text-base text-white">{route.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{route.summary}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{route.totalDurationMinutes}</span>
                    <span className="text-xs text-slate-400 ml-1 font-semibold">min total</span>
                  </div>

                  <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>-{route.co2SavedKg || 0.7}kg CO2</span>
                  </span>
                </div>
              </div>

              {/* Timeline Steps */}
              <div className="space-y-3">
                {route.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-3 text-xs bg-slate-900 p-3 rounded-2xl border border-slate-800">
                    <div className="p-2 bg-[#0B1120] rounded-xl border border-slate-800 shrink-0">
                      {getModeIcon(step.mode)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span className="capitalize">{step.mode}: {step.lineOrDetails || step.instruction}</span>
                        <span className="text-slate-400">{step.durationMinutes} min</span>
                      </div>
                      <p className="text-slate-400 mt-0.5">{step.instruction}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Advice Footer */}
              <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-2xl text-xs text-blue-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-blue-300">Consejo de Viaje Transit AI:</strong>
                  <span>{route.aiAdvice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
