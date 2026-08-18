import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TransitLine, BikeStation, CityNetwork } from '../types';
import { UserGpsPosition } from './PhoneGpsTracker';
import { Layers, Eye, Navigation, Bike, RefreshCw, Bus, Radio, Crosshair } from 'lucide-react';

interface InteractiveMapProps {
  city: CityNetwork;
  lines: TransitLine[];
  bikeStations: BikeStation[];
  selectedLine: TransitLine | null;
  onSelectLine: (line: TransitLine) => void;
  userPosition?: UserGpsPosition | null;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  city,
  lines,
  bikeStations,
  selectedLine,
  onSelectLine,
  userPosition,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [showVehicles, setShowVehicles] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showBikes, setShowBikes] = useState(true);

  // Center on phone GPS when userPosition changes or when requested
  const handleFlyToGps = () => {
    if (leafletMap.current && userPosition) {
      leafletMap.current.flyTo([userPosition.lat, userPosition.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: city.center,
        zoom: city.zoom,
        zoomControl: false,
      });

      // CartoDB Dark Matter tile layer for slick modern dark theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      leafletMap.current = map;
    } else {
      leafletMap.current.setView(city.center, city.zoom);
    }
  }, [city]);

  // Update Layers & Vehicle Markers
  useEffect(() => {
    if (!leafletMap.current || !layerGroupRef.current) return;

    const group = layerGroupRef.current;
    group.clearLayers();

    // 1. Phone GPS Real Location Pin (If active)
    if (userPosition) {
      const gpsPhoneIcon = L.divIcon({
        className: 'custom-phone-gps-pin',
        html: `
          <div class="relative flex items-center justify-center w-10 h-10">
            <div class="absolute w-10 h-10 bg-blue-500/40 rounded-full animate-ping"></div>
            <div class="w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-2xl flex items-center justify-center text-white font-black text-xs">
              📱
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker([userPosition.lat, userPosition.lng], { icon: gpsPhoneIcon })
        .bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <div class="font-black text-xs text-blue-700 flex items-center gap-1">📱 UBICACIÓN REAL DE TELÉFONO</div>
            <div class="text-xs font-bold mt-1">${userPosition.lat.toFixed(5)}°, ${userPosition.lng.toFixed(5)}°</div>
            <div class="text-[11px] text-slate-600 mt-0.5">Precisión GPS: ±${userPosition.accuracy}m</div>
          </div>
        `)
        .addTo(group);

      // Accuracy circle
      L.circle([userPosition.lat, userPosition.lng], {
        radius: Math.max(20, userPosition.accuracy),
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(group);
    } else {
      // Default City Center Pin
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 bg-emerald-500/30 rounded-full animate-ping"></div>
            <div class="w-6 h-6 bg-emerald-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-slate-950 font-black text-xs">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      L.marker(city.center, { icon: userIcon })
        .bindPopup(`
          <div class="p-2 text-slate-900 font-sans">
            <strong class="text-xs font-bold">${city.locationLabel}</strong>
            <div class="text-[11px] text-slate-600 mt-0.5">Centro de ciudad seleccionado</div>
          </div>
        `)
        .addTo(group);
    }

    // 2. Draw Route Polylines
    if (showRoutes) {
      lines.forEach((line) => {
        if (selectedLine && selectedLine.id !== line.id) return; // focus selected line if active

        if (line.routeCoordinates && line.routeCoordinates.length > 0) {
          const poly = L.polyline(line.routeCoordinates, {
            color: line.color,
            weight: selectedLine?.id === line.id ? 7 : 4,
            opacity: selectedLine?.id === line.id ? 1 : 0.75,
            dashArray: line.type === 'bus' ? '6, 8' : undefined,
          });

          poly.on('click', () => onSelectLine(line));
          poly.addTo(group);
        }
      });
    }

    // 3. Draw Real-time Moving Vehicles
    if (showVehicles) {
      lines.forEach((line) => {
        if (selectedLine && selectedLine.id !== line.id) return;

        line.currentVehicles.forEach((veh) => {
          const vehicleIcon = L.divIcon({
            className: 'custom-vehicle-pin',
            html: `
              <div class="flex items-center justify-center px-2 py-1 rounded-full shadow-xl font-bold text-[11px] border border-white/40 transform hover:scale-110 transition-transform cursor-pointer"
                   style="background-color: ${line.color}; color: ${line.textColor}">
                <span>${line.lineNumber}</span>
              </div>
            `,
            iconSize: [40, 24],
            iconAnchor: [20, 12]
          });

          const marker = L.marker([veh.lat, veh.lng], { icon: vehicleIcon });
          marker.bindPopup(`
            <div class="p-2 text-slate-900 font-sans">
              <div class="font-black text-sm flex items-center justify-between gap-2">
                <span>Line ${line.lineNumber}</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">LIVE GPS</span>
              </div>
              <div class="text-xs font-semibold mt-1">➔ ${line.destination}</div>
              <div class="text-[11px] text-slate-600 mt-1 space-y-0.5">
                <div>Next Stop: <strong>${veh.nextStop}</strong></div>
                <div>Speed: ${veh.speedKmH} km/h</div>
                <div>Occupancy: ${veh.occupancyPct}% full</div>
              </div>
            </div>
          `);

          marker.on('click', () => onSelectLine(line));
          marker.addTo(group);
        });
      });
    }

    // 4. Draw Bike Share Stations
    if (showBikes) {
      bikeStations.forEach((bike) => {
        const bikeIcon = L.divIcon({
          className: 'custom-bike-pin',
          html: `
            <div class="w-7 h-7 bg-purple-600 text-white rounded-full border-2 border-white shadow-md flex items-center justify-center font-bold text-xs">
              🚲
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([bike.lat, bike.lng], { icon: bikeIcon })
          .bindPopup(`
            <div class="p-2 text-slate-900 font-sans">
              <strong class="text-xs font-bold">${bike.name}</strong>
              <div class="text-xs text-purple-700 font-semibold mt-1">
                🚲 ${bike.availableBikes} bikes (${bike.availableEBikes} e-bikes) available
              </div>
              <div class="text-[11px] text-slate-500">${bike.availableDocks} open docks</div>
            </div>
          `)
          .addTo(group);
      });
    }
  }, [lines, bikeStations, showVehicles, showRoutes, showBikes, selectedLine]);

  return (
    <div className="relative w-full h-[calc(100vh-210px)] sm:h-[calc(100vh-180px)] min-h-[380px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Map Leaflet Container */}
      <div ref={mapRef} className="w-full h-full z-0 bg-slate-900" />

      {/* Floating Layer Controls */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-2xl shadow-xl space-y-2 text-xs text-slate-200">
        <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          <span>Map Layers</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showVehicles}
            onChange={(e) => setShowVehicles(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
          />
          <span className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400" /> Live Vehicles
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showRoutes}
            onChange={(e) => setShowRoutes(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
          />
          <span className="flex items-center gap-1">
            <Bus className="w-3 h-3 text-cyan-400" /> Route Polylines
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-white">
          <input
            type="checkbox"
            checked={showBikes}
            onChange={(e) => setShowBikes(e.target.checked)}
            className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
          />
          <span className="flex items-center gap-1">
            <Bike className="w-3 h-3 text-purple-400" /> Bike Stations
          </span>
        </label>
      </div>

      {/* Floating GPS Recenter Button */}
      {userPosition && (
        <div className="absolute top-4 right-14 z-10">
          <button
            onClick={handleFlyToGps}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-2 rounded-2xl shadow-xl border border-blue-400/50 flex items-center gap-1.5 transition-all hover:scale-105"
            title="Centrar mapa en mi posición GPS"
          >
            <Crosshair className="w-4 h-4 animate-spin-slow" />
            <span className="hidden sm:inline">Mi GPS Real</span>
          </button>
        </div>
      )}

      {/* Selected Line Banner on Map if focused */}
      {selectedLine && (
        <div className="absolute bottom-4 left-4 right-4 z-10 max-w-md mx-auto bg-slate-900/95 border border-slate-700/90 p-3 rounded-2xl shadow-2xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: selectedLine.color, color: selectedLine.textColor }}
              className="px-2.5 py-1 rounded-lg font-black text-sm"
            >
              {selectedLine.lineNumber}
            </div>
            <div>
              <div className="text-xs font-bold">➔ {selectedLine.destination}</div>
              <div className="text-[11px] text-slate-400">Next arrival in {selectedLine.arrivals[0]} mins</div>
            </div>
          </div>

          <button
            onClick={() => onSelectLine(null as any)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700"
          >
            Show All
          </button>
        </div>
      )}
    </div>
  );
};
