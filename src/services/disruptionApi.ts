export interface DisruptionAlert {
  id: string;
  cityId: string;
  lineId?: string;
  lineNumber: string;
  lineName: string;
  lineType: 'metro' | 'bus' | 'train' | 'tram';
  lineColor: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'delay' | 'maintenance' | 'strike' | 'overcrowding' | 'incident' | 'weather';
  title: string;
  description: string;
  impact: string;
  affectedStations: string[];
  estimatedResolution?: string;
  updatedAt: string;
  sourceProvider: string;
  apiEndpoint: string;
}

export interface DisruptionApiResponse {
  status: 'ok' | 'error';
  cityId: string;
  cityName: string;
  timestamp: string;
  activeDisruptionsCount: number;
  apiSource: string;
  latencyMs: number;
  disruptions: DisruptionAlert[];
}

// City-specific real-world disruption database template generator
const CITY_API_PROVIDERS: Record<string, { provider: string; endpoint: string }> = {
  paris: { provider: 'Île-de-France Mobilités / RATP Open API', endpoint: 'https://api-ratp.idfm.fr/v2/disruptions/live' },
  london: { provider: 'TfL Unified API v2', endpoint: 'https://api.tfl.gov.uk/Line/Mode/tube,bus,overground/Disruption' },
  madrid: { provider: 'Consorcio Regional de Transportes de Madrid (CRTM)', endpoint: 'https://api.crtm.es/v1/incidencias/tiempo-real' },
  berlin: { provider: 'BVG Realtime Transit Feed', endpoint: 'https://v6.bvg.transport.rest/disruptions' },
  barcelona: { provider: 'TMB iBus & Metro Realtime API', endpoint: 'https://api.tmb.cat/v1/ibus/lines/disruptions' },
  rome: { provider: 'ATAC Roma Trasporti Live Feed', endpoint: 'https://api.muoversiaroma.it/v2/disruptions' },
  amsterdam: { provider: 'GVB Open Data API', endpoint: 'https://api.gvb.nl/v1/disruptions/current' },
};

export const fetchCityDisruptions = async (cityId: string): Promise<DisruptionApiResponse> => {
  const startTime = Date.now();
  // Simulate network latency for external public transport API (350ms - 550ms)
  const latency = Math.floor(Math.random() * 200) + 350;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const providerInfo = CITY_API_PROVIDERS[cityId] || {
    provider: 'European Transit Open Data Network',
    endpoint: `https://api.transit-europe.eu/v1/${cityId}/disruptions`,
  };

  const nowISO = new Date().toISOString();

  let disruptions: DisruptionAlert[] = [];

  switch (cityId) {
    case 'paris':
      disruptions = [
        {
          id: 'dis-par-m14',
          cityId: 'paris',
          lineId: 'paris-m14',
          lineNumber: 'M 14',
          lineName: 'Métro Line 14 Automated High-Speed',
          lineType: 'metro',
          lineColor: '#62259D',
          severity: 'warning',
          category: 'delay',
          title: 'Incidencia técnica de señalización en Châtelet',
          description: 'Tráfico ralentizado en toda la línea 14 entre Saint-Denis Pleyel y Aéroport d\'Orly debido a regulación de agujas de cambio en Châtelet.',
          impact: '+12 a 15 min de demora',
          affectedStations: ['Châtelet', 'Gare de Lyon', 'Pyramides', 'Bercy'],
          estimatedResolution: '20 min',
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
        {
          id: 'dis-par-rerb',
          cityId: 'paris',
          lineId: 'paris-rerb',
          lineNumber: 'RER B',
          lineName: 'RER B Express Aéroport Charles de Gaulle',
          lineType: 'train',
          lineColor: '#5291CE',
          severity: 'critical',
          category: 'maintenance',
          title: 'Obras de modernización en eje Gare du Nord',
          description: 'Interrupción parcial del servicio de trenes directos hacia CDG Aéroport entre Gare du Nord y Aulnay-sous-Bois. Bus de sustitución activo.',
          impact: 'Frecuencia reducida (1 tren cada 15 min)',
          affectedStations: ['Gare du Nord', 'La Plaine Stade de France', 'Aulnay-sous-Bois'],
          estimatedResolution: 'Hoy a las 22:00',
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
        {
          id: 'dis-par-bus38',
          cityId: 'paris',
          lineId: 'paris-bus38',
          lineNumber: '38',
          lineName: 'Bus Line 38 Structurante',
          lineType: 'bus',
          lineColor: '#008559',
          severity: 'info',
          category: 'overcrowding',
          title: 'Afluencia elevada por evento cultural en Les Halles',
          description: 'Fuerte congestión de pasajeros en parada Cité - Palais de Justice y Châtelet.',
          impact: '+5 min de espera',
          affectedStations: ['Centre Pompidou', 'Cité', 'Luxembourg'],
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
      ];
      break;

    case 'london':
      disruptions = [
        {
          id: 'dis-lon-central',
          cityId: 'london',
          lineNumber: 'Central',
          lineName: 'Central Line Underground',
          lineType: 'metro',
          lineColor: '#E32017',
          severity: 'critical',
          category: 'delay',
          title: 'Severe Delays: Signal failure at Holborn',
          description: 'Severe delays along the Central Line due to an earlier signal failure at Holborn station. London Buses accepting Underground tickets.',
          impact: '+25 min severe delay',
          affectedStations: ['Holborn', 'Tottenham Court Road', 'Bank', 'Liverpool Street'],
          estimatedResolution: '45 min',
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
        {
          id: 'dis-lon-elizabeth',
          cityId: 'london',
          lineNumber: 'Elizabeth',
          lineName: 'Elizabeth Line Crossrail',
          lineType: 'train',
          lineColor: '#6950A1',
          severity: 'info',
          category: 'maintenance',
          title: 'Minor Delays: Platform door calibration at Paddington',
          description: 'Minor delays eastbound towards Abbey Wood while technicians complete automated platform screen door adjustments.',
          impact: '+4 min minor delay',
          affectedStations: ['Paddington', 'Bond Street', 'Farringdon'],
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
      ];
      break;

    case 'madrid':
      disruptions = [
        {
          id: 'dis-mad-m1',
          cityId: 'madrid',
          lineNumber: 'Línea 1',
          lineName: 'Metro de Madrid Línea 1 (Pinar de Chamartín - Valdecarros)',
          lineType: 'metro',
          lineColor: '#00A3E0',
          severity: 'warning',
          category: 'maintenance',
          title: 'Avería en instalación eléctrica entre Atocha y Sol',
          description: 'Intervalos entre trenes superiores a lo habitual por asistencia técnica en vía 1 en Estación del Arte (Atocha).',
          impact: '+10 min de espera',
          affectedStations: ['Atocha', 'Estación del Arte', 'Antón Martín', 'Sol'],
          estimatedResolution: '30 min',
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
        {
          id: 'dis-mad-c5',
          cityId: 'madrid',
          lineNumber: 'C-5',
          lineName: 'Cercanías C-5 (Humanes - Móstoles El Soto)',
          lineType: 'train',
          lineColor: '#E60000',
          severity: 'info',
          category: 'delay',
          title: 'Retrasos puntuales por regulación de paso en Embajadores',
          description: 'Trenes con destino Móstoles circulan con demoras medias de 6 minutos.',
          impact: '+6 min demora',
          affectedStations: ['Atocha Cercanías', 'Embajadores', 'Laguna'],
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
      ];
      break;

    case 'berlin':
      disruptions = [
        {
          id: 'dis-ber-u2',
          cityId: 'berlin',
          lineNumber: 'U2',
          lineName: 'BVG U-Bahn Line U2',
          lineType: 'metro',
          lineColor: '#DA421E',
          severity: 'warning',
          category: 'maintenance',
          title: 'Gleisarbeiten Alexanderplatz (Pankow - Ruhleben)',
          description: 'Eingeschränkter Takt wegen Gleisinstandsetzung am Alexanderplatz. Bitte Nutzen Sie die S-Bahn als Ausweichroute.',
          impact: '+8 min Wartezeit',
          affectedStations: ['Alexanderplatz', 'Klosterstraße', 'Märkisches Museum'],
          estimatedResolution: '18:00 Uhr',
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
      ];
      break;

    case 'barcelona':
      disruptions = [
        {
          id: 'dis-bcn-l3',
          cityId: 'barcelona',
          lineNumber: 'L3',
          lineName: 'TMB Metro Línea 3 Verdaguer - Zona Universitària',
          lineType: 'metro',
          lineColor: '#00A859',
          severity: 'warning',
          category: 'delay',
          title: 'Incidència tècnica a l\'estació de Catalunya',
          description: 'Freqüència de pas alterada a la L3 per regulació d\'agulles a Plaça Catalunya. Trens amb aturades prolongades.',
          impact: '+8 min de demora',
          affectedStations: ['Passeig de Gràcia', 'Catalunya', 'Liceu'],
          estimatedResolution: '25 min',
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
      ];
      break;

    default:
      disruptions = [
        {
          id: `dis-${cityId}-gen`,
          cityId,
          lineNumber: 'L 1',
          lineName: 'Main Transit Trunk Line',
          lineType: 'metro',
          lineColor: '#2563EB',
          severity: 'info',
          category: 'delay',
          title: 'Automated fleet regulation in progress',
          description: 'Real-time telemetry algorithms optimizing vehicle dispatch frequencies across city center stations.',
          impact: '+2 min minor gap',
          affectedStations: ['Central Station', 'City Hall'],
          updatedAt: nowISO,
          sourceProvider: providerInfo.provider,
          apiEndpoint: providerInfo.endpoint,
        },
      ];
      break;
  }

  return {
    status: 'ok',
    cityId,
    cityName: cityId.toUpperCase(),
    timestamp: nowISO,
    activeDisruptionsCount: disruptions.length,
    apiSource: providerInfo.provider,
    latencyMs: Date.now() - startTime,
    disruptions,
  };
};
