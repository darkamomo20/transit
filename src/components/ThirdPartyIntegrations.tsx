import React from 'react';
import { Bike, Car, Share2, Calendar, ShieldCheck, Zap, ExternalLink, MapPin } from 'lucide-react';
import { BikeStation, RideshareOption } from '../types';

interface ThirdPartyIntegrationsProps {
  bikeStations: BikeStation[];
  rideshares: RideshareOption[];
}

export const ThirdPartyIntegrations: React.FC<ThirdPartyIntegrationsProps> = ({
  bikeStations,
  rideshares,
}) => {
  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 text-slate-100">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Third-Party Platform Integrations</h2>
          <p className="text-xs text-slate-400">Micro-mobility bike docks, rideshare pricing & calendar sync</p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/15 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
          Connected APIs
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bike Share Docks */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Bike className="w-4 h-4" />
            <span>Nearby Bike Share Docks (Vélib / Lime)</span>
          </h3>

          <div className="space-y-2">
            {bikeStations.map((station) => (
              <div key={station.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                <div>
                  <div className="font-bold text-white">{station.name}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{station.distanceMeters}m walk • {station.availableDocks} open docks</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-400">{station.availableBikes} bikes</div>
                  <div className="text-[10px] text-blue-300 font-medium">⚡ {station.availableEBikes} e-bikes</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rideshare Pricing */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Car className="w-4 h-4" />
            <span>Rideshare Real-Time Estimator</span>
          </h3>

          <div className="space-y-2">
            {rideshares.map((ride, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{ride.icon}</span>
                  <div>
                    <div className="font-bold text-white">{ride.provider} ({ride.serviceType})</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">ETA: {ride.etaMinutes} mins pickup</div>
                  </div>
                </div>

                <div className="text-right font-bold text-amber-300 text-sm">
                  {ride.estimatedPrice}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
