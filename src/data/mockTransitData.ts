import { CityNetwork, TransitLine, BikeStation, RideshareOption } from '../types';

export const CITIES: CityNetwork[] = [
  {
    id: 'paris',
    name: 'Paris (RATP / Île-de-France)',
    country: 'France',
    flag: '🇫🇷',
    center: [48.8845, 2.3323], // Place de Clichy / Montmartre
    zoom: 14,
    locationLabel: 'Opciones cerca de 51-55 Boulevard de Clichy, Paris'
  },
  {
    id: 'london',
    name: 'London (TfL)',
    country: 'United Kingdom',
    flag: '🇬🇧',
    center: [51.5152, -0.1419], // Oxford Circus
    zoom: 14,
    locationLabel: 'Options near Oxford Street, London W1'
  },
  {
    id: 'madrid',
    name: 'Madrid (CRTM)',
    country: 'Spain',
    flag: '🇪🇸',
    center: [40.4168, -3.7038], // Puerta del Sol
    zoom: 14,
    locationLabel: 'Opciones cerca de Gran Vía 42, Madrid'
  },
  {
    id: 'barcelona',
    name: 'Barcelona (TMB)',
    country: 'Spain',
    flag: '🇪🇸',
    center: [41.3879, 2.1699], // Plaça de Catalunya
    zoom: 14,
    locationLabel: 'Opciones cerca de Plaça de Catalunya, Barcelona'
  },
  {
    id: 'berlin',
    name: 'Berlin (BVG / VBB)',
    country: 'Germany',
    flag: '🇩🇪',
    center: [52.5200, 13.4050], // Alexanderplatz
    zoom: 14,
    locationLabel: 'Options near Alexanderplatz, Berlin'
  },
  {
    id: 'rome',
    name: 'Roma (ATAC)',
    country: 'Italy',
    flag: '🇮🇹',
    center: [41.9028, 12.4964], // Roma Termini
    zoom: 14,
    locationLabel: 'Opzioni vicino Stazione Termini, Roma'
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam (GVB)',
    country: 'Netherlands',
    flag: '🇳🇱',
    center: [52.3791, 4.8994], // Amsterdam Centraal
    zoom: 14,
    locationLabel: 'Opties nabij Amsterdam Centraal'
  },
  {
    id: 'vienna',
    name: 'Wien (Wiener Linien)',
    country: 'Austria',
    flag: '🇦🇹',
    center: [48.2082, 16.3738], // Stephansplatz
    zoom: 14,
    locationLabel: 'Optionen nahe Stephansplatz, Wien'
  },
  {
    id: 'brussels',
    name: 'Bruxelles / Brussel (STIB)',
    country: 'Belgium',
    flag: '🇧🇪',
    center: [50.8503, 4.3517], // Grand Place
    zoom: 14,
    locationLabel: 'Options près de Grand Place, Bruxelles'
  },
  {
    id: 'zurich',
    name: 'Zürich (ZVV / SBB)',
    country: 'Switzerland',
    flag: '🇨🇭',
    center: [47.3769, 8.5417], // Zurich HB
    zoom: 14,
    locationLabel: 'Optionen nahe Zurich Hauptbahnhof'
  },
  {
    id: 'lisbon',
    name: 'Lisboa (Metro de Lisboa)',
    country: 'Portugal',
    flag: '🇵🇹',
    center: [38.7167, -9.1399], // Baixa / Chiado
    zoom: 14,
    locationLabel: 'Opções perto de Baixa-Chiado, Lisboa'
  },
  {
    id: 'stockholm',
    name: 'Stockholm (SL)',
    country: 'Sweden',
    flag: '🇸🇪',
    center: [59.3293, 18.0686], // T-Centralen
    zoom: 14,
    locationLabel: 'Alternativ nära T-Centralen, Stockholm'
  },
  {
    id: 'argenteuil',
    name: 'Argenteuil / Val-d\'Oise (Bus Argenteuil - Île-de-France Mobilités)',
    country: 'France',
    flag: '🇫🇷',
    center: [48.9470, 2.2470], // Gare d'Argenteuil
    zoom: 14,
    locationLabel: 'Opciones cerca de Gare d\'Argenteuil, Val-d\'Oise'
  },
  {
    id: 'sete',
    name: 'Sète / Castelginest (Transports Occitanie)',
    country: 'France',
    flag: '🇫🇷',
    center: [43.4079, 3.6928], // Gare de Sète / Quai de la Résistance
    zoom: 14,
    locationLabel: 'Opciones cerca de Gare de Sète / Quai de la Résistance'
  }
];

export const INITIAL_PARIS_LINES: TransitLine[] = [
  {
    id: 'argenteuil-bus140',
    lineNumber: 'Bus 140',
    lineName: 'Bus 140 (Gare d\'Argenteuil <-> Asnières-Gennevilliers Les Courtilles)',
    type: 'bus',
    color: '#008559', // RATP Jade Green
    textColor: '#FFFFFF',
    destination: 'Gare d\'Argenteuil / Asnières Les Courtilles M13',
    nearbyStop: 'Gare d\'Argenteuil - Parvis SNCF',
    walkTimeMinutes: 1,
    walkDistanceMeters: 90,
    arrivals: [2, 9, 17],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'moderate',
    predictiveConfidence: 98,
    frequencyMinutes: 7,
    vehicleType: 'Bus Articulé Hybride High-Capacity',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 2, isTransfer: true, transferLines: ['Ligne J', 'Bus 272', 'Bus 361'] },
      { name: 'Paul Vaillant-Couturier', timeInMin: 5 },
      { name: 'Gabriel Péri - Henri Barbusse', timeInMin: 9 },
      { name: 'Pont d\'Argenteuil', timeInMin: 13 },
      { name: 'Les Agnettes (M13)', timeInMin: 18, isTransfer: true, transferLines: ['M13'] },
      { name: 'Asnières-Gennevilliers Les Courtilles', timeInMin: 24, isTransfer: true, transferLines: ['M13', 'T1'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9410, 2.2530],
      [48.9320, 2.2610],
      [48.9250, 2.2740],
      [48.9180, 2.2840]
    ],
    currentVehicles: [
      { id: 'arg-b140-v1', lat: 48.9450, lng: 2.2490, heading: 140, nextStop: 'Gare d\'Argenteuil', speedKmH: 28, occupancyPct: 42 }
    ]
  },
  {
    id: 'argenteuil-bus272',
    lineNumber: 'Bus 272',
    lineName: 'Bus 272 (Gare d\'Argenteuil <-> Sartrouville RER)',
    type: 'bus',
    color: '#008559',
    textColor: '#FFFFFF',
    destination: 'Sartrouville RER / Gare d\'Argenteuil',
    nearbyStop: 'Gare d\'Argenteuil - Boulevard Karl Marx',
    walkTimeMinutes: 2,
    walkDistanceMeters: 140,
    arrivals: [4, 12, 22],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 97,
    frequencyMinutes: 8,
    vehicleType: '100% Electric Low-Floor Bus',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 4, isTransfer: true, transferLines: ['Ligne J', 'Bus 140'] },
      { name: 'Léon Feix - Mairie', timeInMin: 8 },
      { name: 'Val Notre-Dame', timeInMin: 14 },
      { name: 'Parc d\'Activités du Val d\'Argenteuil', timeInMin: 20 },
      { name: 'Sartrouville RER', timeInMin: 28, isTransfer: true, transferLines: ['RER A', 'Ligne L'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9490, 2.2350],
      [48.9450, 2.2150],
      [48.9380, 2.1850],
      [48.9370, 2.1580]
    ],
    currentVehicles: [
      { id: 'arg-b272-v1', lat: 48.9480, lng: 2.2400, heading: 270, nextStop: 'Léon Feix', speedKmH: 32, occupancyPct: 35 }
    ]
  },
  {
    id: 'argenteuil-bus361',
    lineNumber: 'Bus 361',
    lineName: 'Bus 361 (Gare d\'Argenteuil <-> Saint-Denis Université M13)',
    type: 'bus',
    color: '#008559',
    textColor: '#FFFFFF',
    destination: 'Saint-Denis Université / Gare d\'Argenteuil',
    nearbyStop: 'Gare d\'Argenteuil Nord',
    walkTimeMinutes: 2,
    walkDistanceMeters: 130,
    arrivals: [3, 10, 18],
    isFavorite: true,
    delayMinutes: 1,
    crowdLevel: 'moderate',
    predictiveConfidence: 96,
    frequencyMinutes: 7,
    vehicleType: 'Eco Bus Hybride RATP',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 3, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Gare du Val d\'Argenteuil', timeInMin: 9, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Épinay-sur-Seine RER', timeInMin: 17, isTransfer: true, transferLines: ['RER C', 'T11'] },
      { name: 'Saint-Denis Université', timeInMin: 26, isTransfer: true, transferLines: ['M13'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9560, 2.2280],
      [48.9550, 2.3080],
      [48.9460, 2.3610]
    ],
    currentVehicles: [
      { id: 'arg-b361-v1', lat: 48.9510, lng: 2.2380, heading: 320, nextStop: 'Val d\'Argenteuil', speedKmH: 30, occupancyPct: 50 }
    ]
  },
  {
    id: 'argenteuil-bus164',
    lineNumber: 'Bus 164',
    lineName: 'Bus 164 (Argenteuil Collège Monet <-> Porte de Champerret)',
    type: 'bus',
    color: '#008559',
    textColor: '#FFFFFF',
    destination: 'Porte de Champerret / Argenteuil Claude Monet',
    nearbyStop: 'Argenteuil - Victor Hugo / Monet',
    walkTimeMinutes: 3,
    walkDistanceMeters: 210,
    arrivals: [5, 14, 25],
    isFavorite: false,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 95,
    frequencyMinutes: 10,
    vehicleType: 'Standard Low-Floor Bus',
    wheelchairAccessible: true,
    hasWifi: false,
    hasAC: true,
    upcomingStops: [
      { name: 'Argenteuil Collège Claude Monet', timeInMin: 5 },
      { name: 'Place du 11 Novembre', timeInMin: 10 },
      { name: 'Gare de Colombes', timeInMin: 16, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Porte de Champerret', timeInMin: 28, isTransfer: true, transferLines: ['M3', 'T3b'] }
    ],
    routeCoordinates: [
      [48.9420, 2.2350],
      [48.9220, 2.2530],
      [48.8850, 2.2880]
    ],
    currentVehicles: [
      { id: 'arg-b164-v1', lat: 48.9350, lng: 2.2420, heading: 160, nextStop: '11 Novembre', speedKmH: 26, occupancyPct: 28 }
    ]
  },
  {
    id: 'argenteuil-bus1',
    lineNumber: 'Bus 1 (TVO)',
    lineName: 'Bus Ligne 1 (Gare d\'Argenteuil <-> Gare d\'Enghien-les-Bains)',
    type: 'bus',
    color: '#E6007E', // Magenta / TVO
    textColor: '#FFFFFF',
    destination: 'Gare d\'Enghien-les-Bains / Gare d\'Argenteuil',
    nearbyStop: 'Gare d\'Argenteuil - Rue Paul Vaillant',
    walkTimeMinutes: 2,
    walkDistanceMeters: 110,
    arrivals: [1, 7, 15],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'moderate',
    predictiveConfidence: 98,
    frequencyMinutes: 6,
    vehicleType: 'Bus Urbain TVO Val-d\'Oise',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 1, isTransfer: true, transferLines: ['Ligne J', 'Bus 140', 'Bus 272'] },
      { name: 'Centre Hospitalier Victor Dupouy (Hôpital d\'Argenteuil)', timeInMin: 6 },
      { name: 'Sannois Gare', timeInMin: 12, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Gare d\'Enghien-les-Bains', timeInMin: 20, isTransfer: true, transferLines: ['Ligne H'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9580, 2.2550],
      [48.9710, 2.2580],
      [48.9700, 2.3050]
    ],
    currentVehicles: [
      { id: 'arg-b1-v1', lat: 48.9500, lng: 2.2500, heading: 20, nextStop: 'Hôpital d\'Argenteuil', speedKmH: 34, occupancyPct: 40 }
    ]
  },
  {
    id: 'argenteuil-bus9',
    lineNumber: 'Bus 9 (TVO)',
    lineName: 'Bus Ligne 9 (Gare d\'Argenteuil <-> Val d\'Argenteuil <-> Sartrouville)',
    type: 'bus',
    color: '#F59E0B', // Amber
    textColor: '#FFFFFF',
    destination: 'Gare du Val d\'Argenteuil / Sartrouville Station',
    nearbyStop: 'Esplanade Salvador Allende - Val d\'Argenteuil',
    walkTimeMinutes: 2,
    walkDistanceMeters: 140,
    arrivals: [3, 9, 18],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'high',
    predictiveConfidence: 97,
    frequencyMinutes: 6,
    vehicleType: 'Bus Articulé TVO Île-de-France',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 3, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Mairie d\'Argenteuil', timeInMin: 6 },
      { name: 'Esplanade Salvador Allende', timeInMin: 10 },
      { name: 'Gare du Val d\'Argenteuil', timeInMin: 15, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Sartrouville Gare', timeInMin: 25, isTransfer: true, transferLines: ['RER A'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9510, 2.2380],
      [48.9560, 2.2280],
      [48.9380, 2.1580]
    ],
    currentVehicles: [
      { id: 'arg-b9-v1', lat: 48.9530, lng: 2.2330, heading: 300, nextStop: 'Salvador Allende', speedKmH: 30, occupancyPct: 65 }
    ]
  },
  {
    id: 'argenteuil-bus8',
    lineNumber: 'Bus 8 (TVO)',
    lineName: 'Bus Ligne 8 (Gare d\'Argenteuil <-> ZI Argenteuil <-> Cormeilles)',
    type: 'bus',
    color: '#8B5CF6', // Purple
    textColor: '#FFFFFF',
    destination: 'Cormeilles-en-Parisis Gare / ZI Argenteuil',
    nearbyStop: 'Gare d\'Argenteuil - Place Rabelais',
    walkTimeMinutes: 3,
    walkDistanceMeters: 180,
    arrivals: [6, 18, 32],
    isFavorite: false,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 96,
    frequencyMinutes: 12,
    vehicleType: 'Bus Standard Euro 6',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 6, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Zone Industrielle d\'Argenteuil', timeInMin: 12 },
      { name: 'Val Notre-Dame Ouest', timeInMin: 18 },
      { name: 'Gare de Cormeilles-en-Parisis', timeInMin: 28, isTransfer: true, transferLines: ['Ligne J'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9600, 2.2100],
      [48.9730, 2.0980]
    ],
    currentVehicles: [
      { id: 'arg-b8-v1', lat: 48.9520, lng: 2.2300, heading: 290, nextStop: 'ZI Argenteuil', speedKmH: 35, occupancyPct: 22 }
    ]
  },
  {
    id: 'argenteuil-bus340',
    lineNumber: 'Bus 340',
    lineName: 'Bus 340 (Gare d\'Argenteuil <-> Gennevilliers RER C)',
    type: 'bus',
    color: '#008559',
    textColor: '#FFFFFF',
    destination: 'Gennevilliers RER C / Gare d\'Argenteuil',
    nearbyStop: 'Gare d\'Argenteuil - Quai de Seine',
    walkTimeMinutes: 2,
    walkDistanceMeters: 120,
    arrivals: [8, 20, 36],
    isFavorite: false,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 95,
    frequencyMinutes: 12,
    vehicleType: 'Bus Hybride Eco RATP',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare d\'Argenteuil', timeInMin: 8, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Quai de Seine Argenteuil', timeInMin: 13 },
      { name: 'Gennevilliers RER', timeInMin: 22, isTransfer: true, transferLines: ['RER C', 'T1'] }
    ],
    routeCoordinates: [
      [48.9470, 2.2470],
      [48.9320, 2.2700],
      [48.9280, 2.2980]
    ],
    currentVehicles: [
      { id: 'arg-b340-v1', lat: 48.9400, lng: 2.2580, heading: 120, nextStop: 'Quai de Seine', speedKmH: 28, occupancyPct: 30 }
    ]
  },
  {
    id: 'paris-m14',
    lineNumber: 'M 14',
    lineName: 'Métro Line 14',
    type: 'metro',
    color: '#62259D', // Official RATP Metro 14 Deep Purple
    textColor: '#FFFFFF',
    destination: 'Aéroport d\'Orly',
    nearbyStop: 'Saint-Lazare / Place de Clichy',
    walkTimeMinutes: 4,
    walkDistanceMeters: 280,
    arrivals: [0, 2, 5, 9], // 0 minutes like screenshot!
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'moderate',
    predictiveConfidence: 99,
    frequencyMinutes: 2,
    vehicleType: 'Automated Rubber-Tyred Train',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Saint-Lazare', timeInMin: 0, isTransfer: true, transferLines: ['M3', 'M12', 'M13', 'RER E', 'Ligne J', 'Ligne L'] },
      { name: 'Madeleine', timeInMin: 2, isTransfer: true, transferLines: ['M8', 'M12'] },
      { name: 'Pyramides', timeInMin: 4 },
      { name: 'Châtelet', timeInMin: 6, isTransfer: true, transferLines: ['M1', 'M4', 'M7', 'M11', 'RER A', 'RER B', 'RER D'] },
      { name: 'Gare de Lyon', timeInMin: 9, isTransfer: true, transferLines: ['M1', 'RER A', 'RER D'] },
      { name: 'Bercy', timeInMin: 11 },
      { name: 'Cour Saint-Émilion', timeInMin: 13 },
      { name: 'Bibliothèque François Mitterrand', timeInMin: 15 },
      { name: 'Maison Blanche', timeInMin: 18 },
      { name: 'Aéroport d\'Orly', timeInMin: 27 }
    ],
    routeCoordinates: [
      [48.8845, 2.3323],
      [48.8755, 2.3255],
      [48.8698, 2.3242],
      [48.8660, 2.3340],
      [48.8584, 2.3470],
      [48.8448, 2.3735],
      [48.8315, 2.3830],
      [48.7285, 2.3615]
    ],
    currentVehicles: [
      { id: 'm14-v1', lat: 48.8755, lng: 2.3255, heading: 140, nextStop: 'Saint-Lazare', speedKmH: 52, occupancyPct: 45 },
      { id: 'm14-v2', lat: 48.8660, lng: 2.3340, heading: 135, nextStop: 'Pyramides', speedKmH: 60, occupancyPct: 62 }
    ]
  },
  {
    id: 'paris-bus21',
    lineNumber: '21',
    lineName: 'Bus Line 21',
    type: 'bus',
    color: '#008559', // Official RATP Bus Jade Green
    textColor: '#FFFFFF',
    destination: 'Stade Charléty - Porte de Gentilly',
    nearbyStop: 'Place de Clichy',
    walkTimeMinutes: 2,
    walkDistanceMeters: 140,
    arrivals: [1, 8, 16], // 1 minute like screenshot!
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 97,
    frequencyMinutes: 7,
    vehicleType: '100% Electric Hybrid Bus',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Place de Clichy', timeInMin: 1 },
      { name: 'Liège - Rome', timeInMin: 4 },
      { name: 'Gare Saint-Lazare', timeInMin: 7, isTransfer: true, transferLines: ['M3', 'M12', 'M14', 'RER E'] },
      { name: 'Opéra - Scribe', timeInMin: 11, isTransfer: true, transferLines: ['M7', 'M8'] },
      { name: 'Pyramides - Tuileries', timeInMin: 15 },
      { name: 'Louvre - Rivoli', timeInMin: 18 },
      { name: 'Châtelet', timeInMin: 22 },
      { name: 'Luxembourg', timeInMin: 28 },
      { name: 'Stade Charléty', timeInMin: 38 }
    ],
    routeCoordinates: [
      [48.8842, 2.3320],
      [48.8780, 2.3290],
      [48.8750, 2.3260],
      [48.8705, 2.3310],
      [48.8640, 2.3350],
      [48.8580, 2.3460],
      [48.8470, 2.3390],
      [48.8190, 2.3460]
    ],
    currentVehicles: [
      { id: 'b21-v1', lat: 48.8842, lng: 2.3320, heading: 175, nextStop: 'Place de Clichy', speedKmH: 22, occupancyPct: 28 }
    ]
  },
  {
    id: 'paris-bus80',
    lineNumber: '80',
    lineName: 'Bus Line 80',
    type: 'bus',
    color: '#008559', // Official RATP Bus Jade Green
    textColor: '#FFFFFF',
    destination: 'Porte de Versailles',
    nearbyStop: 'Place de Clichy - Caulaincourt',
    walkTimeMinutes: 5,
    walkDistanceMeters: 320,
    arrivals: [6, 14, 25],
    isFavorite: true,
    delayMinutes: 1,
    crowdLevel: 'moderate',
    predictiveConfidence: 94,
    frequencyMinutes: 8,
    vehicleType: 'Standard Low-Floor Bus',
    wheelchairAccessible: true,
    hasWifi: false,
    hasAC: true,
    upcomingStops: [
      { name: 'Place de Clichy - Caulaincourt', timeInMin: 6 },
      { name: 'Europe', timeInMin: 10 },
      { name: 'Saint-Augustin', timeInMin: 14 },
      { name: 'Franklin D. Roosevelt', timeInMin: 19 },
      { name: 'Alma - Marceau (Eiffel)', timeInMin: 24 },
      { name: 'Bosquet - Grenelle', timeInMin: 29 },
      { name: 'Mairie du 15e', timeInMin: 36 },
      { name: 'Porte de Versailles', timeInMin: 42 }
    ],
    routeCoordinates: [
      [48.8845, 2.3323],
      [48.8800, 2.3220],
      [48.8750, 2.3190],
      [48.8690, 2.3100],
      [48.8640, 2.3010],
      [48.8550, 2.3010],
      [48.8400, 2.2980],
      [48.8320, 2.2870]
    ],
    currentVehicles: [
      { id: 'b80-v1', lat: 48.8850, lng: 2.3350, heading: 210, nextStop: 'Place de Clichy', speedKmH: 18, occupancyPct: 55 }
    ]
  },
  {
    id: 'paris-bus95',
    lineNumber: '95',
    lineName: 'Bus Line 95',
    type: 'bus',
    color: '#008559', // Official RATP Bus Jade Green
    textColor: '#FFFFFF',
    destination: 'Porte de Vanves - Place Simard',
    nearbyStop: 'Place de Clichy - Caulaincourt',
    walkTimeMinutes: 5,
    walkDistanceMeters: 310,
    arrivals: [17, 28, 41],
    isFavorite: true,
    delayMinutes: 3,
    crowdLevel: 'high',
    predictiveConfidence: 91,
    frequencyMinutes: 11,
    vehicleType: 'Articulated High-Capacity Bus',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Place de Clichy - Caulaincourt', timeInMin: 17 },
      { name: 'Bucarest', timeInMin: 21 },
      { name: 'Gare Saint-Lazare', timeInMin: 25 },
      { name: 'Opéra', timeInMin: 30 },
      { name: 'Musée du Louvre', timeInMin: 36 },
      { name: 'Saint-Germain-des-Prés', timeInMin: 42 },
      { name: 'Montparnasse - Alésia', timeInMin: 50 },
      { name: 'Porte de Vanves', timeInMin: 58 }
    ],
    routeCoordinates: [
      [48.8845, 2.3323],
      [48.8780, 2.3270],
      [48.8700, 2.3310],
      [48.8620, 2.3360],
      [48.8540, 2.3330],
      [48.8410, 2.3220],
      [48.8280, 2.3050]
    ],
    currentVehicles: [
      { id: 'b95-v1', lat: 48.8920, lng: 2.3380, heading: 190, nextStop: 'Damrémont', speedKmH: 15, occupancyPct: 82 }
    ]
  },
  {
    id: 'paris-bus40',
    lineNumber: '40',
    lineName: 'Bus Line 40 (Montmartrobus)',
    type: 'bus',
    color: '#008559', // Official RATP Bus Jade Green
    textColor: '#FFFFFF',
    destination: 'Mairie du 18e - Jules Joffrin Tholoze',
    nearbyStop: 'Tholoze / Blanche',
    walkTimeMinutes: 7,
    walkDistanceMeters: 450,
    arrivals: [23, 38],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 98,
    frequencyMinutes: 15,
    vehicleType: 'Compact Electric Hill Bus',
    wheelchairAccessible: false,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Tholoze', timeInMin: 23 },
      { name: 'Place des Abbesses', timeInMin: 26 },
      { name: 'Sacré-Cœur / Norvins', timeInMin: 30 },
      { name: 'Lamarck - Caulaincourt', timeInMin: 34 },
      { name: 'Mairie du 18e - Jules Joffrin', timeInMin: 38 }
    ],
    routeCoordinates: [
      [48.8830, 2.3350],
      [48.8848, 2.3385],
      [48.8865, 2.3410],
      [48.8890, 2.3390],
      [48.8920, 2.3440]
    ],
    currentVehicles: [
      { id: 'b40-v1', lat: 48.8810, lng: 2.3320, heading: 45, nextStop: 'Tholoze', speedKmH: 14, occupancyPct: 30 }
    ]
  },
  {
    id: 'paris-m13',
    lineNumber: 'M 13',
    lineName: 'Métro Line 13',
    type: 'metro',
    color: '#6EC4E8', // Official RATP Metro 13 Sky Blue (Bleu Ciel)
    textColor: '#000000',
    destination: 'Châtillon - Montrouge / Saint-Denis - Université',
    nearbyStop: 'Blanche / Place de Clichy',
    walkTimeMinutes: 10,
    walkDistanceMeters: 650,
    arrivals: [10, 14, 18],
    isFavorite: true,
    delayMinutes: 2,
    crowdLevel: 'high',
    predictiveConfidence: 92,
    frequencyMinutes: 3,
    vehicleType: 'Heavy Urban Metro MF 77',
    wheelchairAccessible: false,
    hasWifi: false,
    hasAC: false,
    upcomingStops: [
      { name: 'Blanche', timeInMin: 10 },
      { name: 'Place de Clichy', timeInMin: 12, isTransfer: true, transferLines: ['M2'] },
      { name: 'Liège', timeInMin: 14 },
      { name: 'Saint-Lazare', timeInMin: 16, isTransfer: true, transferLines: ['M3', 'M12', 'M14', 'RER E', 'Ligne J', 'Ligne L'] },
      { name: 'Miromesnil', timeInMin: 18, isTransfer: true, transferLines: ['M9'] },
      { name: 'Champs-Élysées - Clemenceau', timeInMin: 21 },
      { name: 'Invalides', timeInMin: 24 },
      { name: 'Montparnasse - Bienvenüe', timeInMin: 29 },
      { name: 'Châtillon - Montrouge', timeInMin: 39 }
    ],
    routeCoordinates: [
      [48.8835, 2.3330],
      [48.8830, 2.3275],
      [48.8785, 2.3260],
      [48.8755, 2.3255],
      [48.8735, 2.3140],
      [48.8670, 2.3120],
      [48.8620, 2.3130],
      [48.8420, 2.3200],
      [48.8090, 2.3020]
    ],
    currentVehicles: [
      { id: 'm13-v1', lat: 48.8880, lng: 2.3370, heading: 200, nextStop: 'Blanche', speedKmH: 48, occupancyPct: 88 }
    ]
  },
  {
    id: 'paris-rerb',
    lineNumber: 'RER B',
    lineName: 'RER Line B Express',
    type: 'train',
    color: '#1E88E5', // Royal Blue card
    textColor: '#FFFFFF',
    destination: 'Aéroport Charles de Gaulle / Mitry-Claye',
    nearbyStop: 'Gare du Nord (12 min walk)',
    walkTimeMinutes: 12,
    walkDistanceMeters: 800,
    arrivals: [4, 12, 19],
    isFavorite: false,
    delayMinutes: 0,
    crowdLevel: 'moderate',
    predictiveConfidence: 96,
    frequencyMinutes: 6,
    vehicleType: 'Double-Decker Express Train',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare du Nord', timeInMin: 4, isTransfer: true, transferLines: ['M4', 'M5', 'RER D', 'Eurostar'] },
      { name: 'Châtelet - Les Halles', timeInMin: 8 },
      { name: 'Saint-Michel - Notre-Dame', timeInMin: 11 },
      { name: 'Luxembourg', timeInMin: 14 },
      { name: 'Cité Universitaire', timeInMin: 19 },
      { name: 'Aéroport CDG 2 TGV', timeInMin: 38 }
    ],
    routeCoordinates: [
      [48.8808, 2.3553],
      [48.8625, 2.3470],
      [48.8530, 2.3440],
      [48.8470, 2.3390],
      [48.8190, 2.3380]
    ],
    currentVehicles: [
      { id: 'rerb-v1', lat: 48.8890, lng: 2.3600, heading: 180, nextStop: 'Gare du Nord', speedKmH: 70, occupancyPct: 50 }
    ]
  },
  {
    id: 'paris-m1',
    lineNumber: 'M 1',
    lineName: 'Métro Line 1 (Automated)',
    type: 'metro',
    color: '#FFCD00',
    textColor: '#000000',
    destination: 'La Défense - Grande Arche / Château de Vincennes',
    nearbyStop: 'Châtelet / Champs-Élysées - Clemenceau',
    walkTimeMinutes: 5,
    walkDistanceMeters: 350,
    arrivals: [1, 3, 6, 10],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'moderate',
    predictiveConfidence: 99,
    frequencyMinutes: 2,
    vehicleType: 'Automatic Rubber-Tyred MP 05',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'La Défense', timeInMin: 1, isTransfer: true, transferLines: ['RER A', 'T2'] },
      { name: 'Charles de Gaulle - Étoile', timeInMin: 5, isTransfer: true, transferLines: ['M2', 'M6', 'RER A'] },
      { name: 'Champs-Élysées - Clemenceau', timeInMin: 9, isTransfer: true, transferLines: ['M13'] },
      { name: 'Palais Royal - Musée du Louvre', timeInMin: 13, isTransfer: true, transferLines: ['M7'] },
      { name: 'Châtelet', timeInMin: 16, isTransfer: true, transferLines: ['M4', 'M7', 'M11', 'M14', 'RER A', 'RER B', 'RER D'] },
      { name: 'Gare de Lyon', timeInMin: 21, isTransfer: true, transferLines: ['M14', 'RER A', 'RER D'] },
      { name: 'Château de Vincennes', timeInMin: 32 }
    ],
    routeCoordinates: [[48.892, 2.238], [48.873, 2.295], [48.866, 2.311], [48.862, 2.336], [48.858, 2.347], [48.844, 2.373], [48.843, 2.438]],
    currentVehicles: [{ id: 'm1-v1', lat: 48.866, lng: 2.311, heading: 90, nextStop: 'Champs-Élysées', speedKmH: 55, occupancyPct: 60 }]
  },
  {
    id: 'paris-m2',
    lineNumber: 'M 2',
    lineName: 'Métro Line 2',
    type: 'metro',
    color: '#003CA6',
    textColor: '#FFFFFF',
    destination: 'Porte Dauphine / Nation',
    nearbyStop: 'Place de Clichy / Pigalle / Blanche',
    walkTimeMinutes: 2,
    walkDistanceMeters: 110,
    arrivals: [2, 5, 9],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 98,
    frequencyMinutes: 3,
    vehicleType: 'Standard Steel Wheel Metro MF 01',
    wheelchairAccessible: true,
    hasWifi: false,
    hasAC: true,
    upcomingStops: [
      { name: 'Place de Clichy', timeInMin: 2, isTransfer: true, transferLines: ['M13'] },
      { name: 'Blanche', timeInMin: 4 },
      { name: 'Pigalle', timeInMin: 6, isTransfer: true, transferLines: ['M12'] },
      { name: 'Anvers (Sacré-Cœur)', timeInMin: 8 },
      { name: 'Barbès - Rochechouart', timeInMin: 10, isTransfer: true, transferLines: ['M4'] },
      { name: 'Jaurès', timeInMin: 14, isTransfer: true, transferLines: ['M5', 'M7bis'] },
      { name: 'Père Lachaise', timeInMin: 22, isTransfer: true, transferLines: ['M3'] },
      { name: 'Nation', timeInMin: 28, isTransfer: true, transferLines: ['M1', 'M6', 'M9', 'RER A'] }
    ],
    routeCoordinates: [[48.871, 2.274], [48.884, 2.332], [48.882, 2.337], [48.882, 2.342], [48.883, 2.349], [48.883, 2.370], [48.848, 2.396]],
    currentVehicles: [{ id: 'm2-v1', lat: 48.884, lng: 2.332, heading: 95, nextStop: 'Place de Clichy', speedKmH: 42, occupancyPct: 35 }]
  },
  {
    id: 'paris-m4',
    lineNumber: 'M 4',
    lineName: 'Métro Line 4 (Automated)',
    type: 'metro',
    color: '#CF009B',
    textColor: '#FFFFFF',
    destination: 'Porte de Clignancourt / Bagneux - Lucie Aubrac',
    nearbyStop: 'Gare du Nord / Les Halles',
    walkTimeMinutes: 6,
    walkDistanceMeters: 410,
    arrivals: [1, 4, 7],
    isFavorite: false,
    delayMinutes: 0,
    crowdLevel: 'high',
    predictiveConfidence: 97,
    frequencyMinutes: 2,
    vehicleType: 'Automatic Rubber-Tyred MP 89',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Porte de Clignancourt', timeInMin: 1 },
      { name: 'Barbès - Rochechouart', timeInMin: 4, isTransfer: true, transferLines: ['M2'] },
      { name: 'Gare du Nord', timeInMin: 6, isTransfer: true, transferLines: ['M5', 'RER B', 'RER D'] },
      { name: 'Gare de l\'Est', timeInMin: 8, isTransfer: true, transferLines: ['M5', 'M7'] },
      { name: 'Châtelet', timeInMin: 14, isTransfer: true, transferLines: ['M1', 'M7', 'M11', 'M14', 'RER A', 'RER B'] },
      { name: 'Saint-Germain-des-Prés', timeInMin: 18 },
      { name: 'Montparnasse - Bienvenüe', timeInMin: 22, isTransfer: true, transferLines: ['M6', 'M12', 'M13'] },
      { name: 'Bagneux - Lucie Aubrac', timeInMin: 32 }
    ],
    routeCoordinates: [[48.898, 2.344], [48.883, 2.349], [48.880, 2.355], [48.876, 2.358], [48.858, 2.347], [48.853, 2.333], [48.842, 2.320], [48.803, 2.316]],
    currentVehicles: [{ id: 'm4-v1', lat: 48.880, lng: 2.355, heading: 180, nextStop: 'Gare du Nord', speedKmH: 50, occupancyPct: 75 }]
  },
  {
    id: 'paris-rera',
    lineNumber: 'RER A',
    lineName: 'RER Line A High Capacity Express',
    type: 'train',
    color: '#E3051C',
    textColor: '#FFFFFF',
    destination: 'Saint-Germain-en-Laye / Boissy-Saint-Léger / Marne-la-Vallée (Disneyland)',
    nearbyStop: 'Auber / Châtelet - Les Halles',
    walkTimeMinutes: 7,
    walkDistanceMeters: 480,
    arrivals: [2, 5, 9],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'high',
    predictiveConfidence: 99,
    frequencyMinutes: 2,
    vehicleType: 'MI 09 Double-Decker Heavy Commuter',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'La Défense', timeInMin: 2, isTransfer: true, transferLines: ['M1', 'T2'] },
      { name: 'Charles de Gaulle - Étoile', timeInMin: 6, isTransfer: true, transferLines: ['M1', 'M2', 'M6'] },
      { name: 'Auber (Opéra)', timeInMin: 9, isTransfer: true, transferLines: ['M3', 'M7', 'M8', 'M9'] },
      { name: 'Châtelet - Les Halles', timeInMin: 12, isTransfer: true, transferLines: ['M1', 'M4', 'M7', 'M11', 'M14', 'RER B', 'RER D'] },
      { name: 'Gare de Lyon', timeInMin: 16, isTransfer: true, transferLines: ['M1', 'M14', 'RER D'] },
      { name: 'Nation', timeInMin: 20, isTransfer: true, transferLines: ['M1', 'M2', 'M6', 'M9'] },
      { name: 'Marne-la-Vallée (Disneyland Paris)', timeInMin: 44 }
    ],
    routeCoordinates: [[48.892, 2.238], [48.873, 2.295], [48.873, 2.328], [48.862, 2.347], [48.844, 2.373], [48.848, 2.396], [48.870, 2.780]],
    currentVehicles: [{ id: 'rera-v1', lat: 48.873, lng: 2.328, heading: 90, nextStop: 'Auber', speedKmH: 80, occupancyPct: 82 }]
  },
  {
    id: 'paris-bus38',
    lineNumber: '38',
    lineName: 'Bus Line 38 (Ligne Structurante)',
    type: 'bus',
    color: '#008559',
    textColor: '#FFFFFF',
    destination: 'Porte d\'Orléans / Porte de la Chapelle',
    nearbyStop: 'Gare du Nord / Les Halles / Saint-Michel',
    walkTimeMinutes: 4,
    walkDistanceMeters: 290,
    arrivals: [3, 9, 16],
    isFavorite: true,
    delayMinutes: 1,
    crowdLevel: 'moderate',
    predictiveConfidence: 96,
    frequencyMinutes: 6,
    vehicleType: 'MAN Lion\'s City Hybrid Articulated Bus',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Porte de la Chapelle', timeInMin: 3 },
      { name: 'Gare du Nord', timeInMin: 8, isTransfer: true, transferLines: ['M4', 'M5', 'RER B', 'RER D'] },
      { name: 'Gare de l\'Est', timeInMin: 12, isTransfer: true, transferLines: ['M4', 'M5', 'M7'] },
      { name: 'Centre Pompidou - Châtelet', timeInMin: 20, isTransfer: true, transferLines: ['M1', 'M4', 'M11'] },
      { name: 'Cité - Palais de Justice', timeInMin: 24 },
      { name: 'Luxembourg', timeInMin: 30, isTransfer: true, transferLines: ['RER B'] },
      { name: 'Porte d\'Orléans', timeInMin: 42, isTransfer: true, transferLines: ['M4', 'T3a'] }
    ],
    routeCoordinates: [[48.897, 2.359], [48.880, 2.355], [48.876, 2.358], [48.860, 2.350], [48.855, 2.346], [48.847, 2.339], [48.822, 2.325]],
    currentVehicles: [{ id: 'b38-v1', lat: 48.880, lng: 2.355, heading: 180, nextStop: 'Gare du Nord', speedKmH: 24, occupancyPct: 45 }]
  },
  {
    id: 'paris-line-j',
    lineNumber: 'Ligne J',
    lineName: 'Transilien Line J (SNCF)',
    type: 'train',
    color: '#B5B600',
    textColor: '#FFFFFF',
    destination: 'Paris Saint-Lazare / Ermont-Eaubonne / Gisors / Mantes-la-Jolie',
    nearbyStop: 'Gare Saint-Lazare (8 min walk)',
    walkTimeMinutes: 8,
    walkDistanceMeters: 550,
    arrivals: [3, 11, 21],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'moderate',
    predictiveConfidence: 98,
    frequencyMinutes: 8,
    vehicleType: 'SNCF Z 50000 (Francilien) Electric Train',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare Saint-Lazare', timeInMin: 3, isTransfer: true, transferLines: ['M3', 'M12', 'M13', 'M14', 'RER E', 'Ligne L'] },
      { name: 'Asnières-sur-Seine', timeInMin: 8, isTransfer: true, transferLines: ['Ligne L'] },
      { name: 'Bois-Colombes', timeInMin: 12 },
      { name: 'Argenteuil', timeInMin: 17 },
      { name: 'Conflans-Sainte-Honorine', timeInMin: 27 },
      { name: 'Mantes-la-Jolie', timeInMin: 45 }
    ],
    routeCoordinates: [
      [48.8765, 2.3252],
      [48.9100, 2.2850],
      [48.9160, 2.2680],
      [48.9470, 2.2470],
      [48.9950, 2.0950],
      [48.9900, 1.7100]
    ],
    currentVehicles: [
      { id: 'tj-v1', lat: 48.8850, lng: 2.3180, heading: 310, nextStop: 'Gare Saint-Lazare', speedKmH: 68, occupancyPct: 42 }
    ]
  },
  {
    id: 'paris-line-l',
    lineNumber: 'Ligne L',
    lineName: 'Transilien Line L (SNCF)',
    type: 'train',
    color: '#A976B2',
    textColor: '#FFFFFF',
    destination: 'Paris Saint-Lazare / Cergy-le-Haut / Versailles-Rive-Droite',
    nearbyStop: 'Gare Saint-Lazare / Pont Cardinet (5 min walk)',
    walkTimeMinutes: 5,
    walkDistanceMeters: 380,
    arrivals: [2, 7, 15],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 99,
    frequencyMinutes: 5,
    vehicleType: 'SNCF Z 50000 (Francilien) High Frequency Train',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Gare Saint-Lazare', timeInMin: 2, isTransfer: true, transferLines: ['M3', 'M12', 'M13', 'M14', 'RER E', 'Ligne J'] },
      { name: 'Pont Cardinet', timeInMin: 5, isTransfer: true, transferLines: ['M14'] },
      { name: 'Clichy - Levallois', timeInMin: 8 },
      { name: 'Asnières-sur-Seine', timeInMin: 11, isTransfer: true, transferLines: ['Ligne J'] },
      { name: 'Bécon-les-Bruyères', timeInMin: 14 },
      { name: 'Nanterre-Université', timeInMin: 19, isTransfer: true, transferLines: ['RER A'] },
      { name: 'Cergy-le-Haut', timeInMin: 38 }
    ],
    routeCoordinates: [
      [48.8765, 2.3252],
      [48.8885, 2.3140],
      [48.8960, 2.2980],
      [48.9100, 2.2850],
      [48.9080, 2.2680],
      [48.8970, 2.2150],
      [49.0480, 2.0120]
    ],
    currentVehicles: [
      { id: 'tl-v1', lat: 48.8820, lng: 2.3200, heading: 320, nextStop: 'Pont Cardinet', speedKmH: 72, occupancyPct: 38 }
    ]
  },
  {
    id: 'paris-rere',
    lineNumber: 'RER E',
    lineName: 'RER Line E (Éole Extension)',
    type: 'train',
    color: '#CC007A',
    textColor: '#FFFFFF',
    destination: 'Nanterre-La Folie / Haussmann - Saint-Lazare / Chelles-Gournay / Tournan',
    nearbyStop: 'Haussmann - Saint-Lazare / Porte Maillot',
    walkTimeMinutes: 4,
    walkDistanceMeters: 290,
    arrivals: [1, 6, 12],
    isFavorite: true,
    delayMinutes: 0,
    crowdLevel: 'low',
    predictiveConfidence: 99,
    frequencyMinutes: 4,
    vehicleType: 'RER NG (Nouvelle Génération) Double-Decker',
    wheelchairAccessible: true,
    hasWifi: true,
    hasAC: true,
    upcomingStops: [
      { name: 'Nanterre-La Folie', timeInMin: 1, isTransfer: true, transferLines: ['RER A'] },
      { name: 'Porte Maillot', timeInMin: 4, isTransfer: true, transferLines: ['M1', 'T3b', 'RER C'] },
      { name: 'Haussmann - Saint-Lazare', timeInMin: 7, isTransfer: true, transferLines: ['M3', 'M12', 'M13', 'M14', 'Ligne J', 'Ligne L'] },
      { name: 'Magenta (Gare du Nord)', timeInMin: 11, isTransfer: true, transferLines: ['M4', 'M5', 'RER B', 'RER D'] },
      { name: 'Rosa Parks', timeInMin: 15, isTransfer: true, transferLines: ['T3b'] },
      { name: 'Chelles-Gournay', timeInMin: 28 },
      { name: 'Tournan', timeInMin: 42 }
    ],
    routeCoordinates: [
      [48.8950, 2.2280],
      [48.8780, 2.2820],
      [48.8755, 2.3280],
      [48.8820, 2.3580],
      [48.8950, 2.3740],
      [48.8750, 2.5920]
    ],
    currentVehicles: [
      { id: 'rere-v1', lat: 48.8760, lng: 2.3150, heading: 90, nextStop: 'Haussmann - Saint-Lazare', speedKmH: 85, occupancyPct: 30 }
    ]
  }
];

export const MOCK_BIKE_STATIONS: BikeStation[] = [
  {
    id: 'velib-1',
    name: 'Vélib Station 18033 - Place de Clichy',
    lat: 48.8842,
    lng: 2.3325,
    availableBikes: 8,
    availableEBikes: 5,
    availableDocks: 12,
    distanceMeters: 120
  },
  {
    id: 'velib-2',
    name: 'Vélib Station 18012 - Rue Caulaincourt',
    lat: 48.8858,
    lng: 2.3340,
    availableBikes: 14,
    availableEBikes: 9,
    availableDocks: 6,
    distanceMeters: 230
  },
  {
    id: 'velib-3',
    name: 'Vélib Station 09028 - Rue de Blanche',
    lat: 48.8815,
    lng: 2.3310,
    availableBikes: 4,
    availableEBikes: 2,
    availableDocks: 18,
    distanceMeters: 310
  }
];

export const MOCK_RIDESHARES: RideshareOption[] = [
  {
    provider: 'Uber',
    serviceType: 'UberX (Comfort Electric)',
    estimatedPrice: '€12 - €15',
    etaMinutes: 3,
    icon: '🚗'
  },
  {
    provider: 'Bolt',
    serviceType: 'Bolt Green (100% EV)',
    estimatedPrice: '€10 - €13',
    etaMinutes: 2,
    icon: '⚡'
  },
  {
    provider: 'Cabify',
    serviceType: 'Cabify Lite',
    estimatedPrice: '€13 - €16',
    etaMinutes: 5,
    icon: '🚙'
  }
];

export function getLinesForCity(cityId: string): TransitLine[] {
  if (cityId === 'paris' || cityId === 'argenteuil') return INITIAL_PARIS_LINES;

  const city = CITIES.find((c) => c.id === cityId) || CITIES[0];
  const [lat, lng] = city.center;

  switch (cityId) {
    case 'london':
      return [
        {
          id: 'london-tube-central',
          lineNumber: 'Central',
          lineName: 'Central Underground Line',
          type: 'metro',
          color: '#E15B5B',
          textColor: '#FFFFFF',
          destination: 'Epping / Hainault',
          nearbyStop: 'Oxford Circus',
          walkTimeMinutes: 3,
          walkDistanceMeters: 210,
          arrivals: [1, 5, 9],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'moderate',
          predictiveConfidence: 98,
          frequencyMinutes: 3,
          vehicleType: 'TfL Tube Train',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: false,
          upcomingStops: [
            { name: 'Oxford Circus', timeInMin: 1, isTransfer: true, transferLines: ['Victoria', 'Bakerloo'] },
            { name: 'Tottenham Court Road', timeInMin: 3, isTransfer: true, transferLines: ['Elizabeth Line'] },
            { name: 'Holborn', timeInMin: 6 },
            { name: 'Bank', timeInMin: 10, isTransfer: true, transferLines: ['DLR', 'Northern', 'Waterloo & City'] },
            { name: 'Stratford', timeInMin: 18 }
          ],
          routeCoordinates: [[lat, lng], [lat + 0.01, lng + 0.02], [lat + 0.02, lng + 0.04]],
          currentVehicles: [{ id: 'lon-c1', lat: lat + 0.002, lng: lng + 0.003, heading: 90, nextStop: 'Oxford Circus', speedKmH: 45, occupancyPct: 58 }]
        },
        {
          id: 'london-bus73',
          lineNumber: '73',
          lineName: 'Bus Line 73',
          type: 'bus',
          color: '#DC2626',
          textColor: '#FFFFFF',
          destination: 'Stoke Newington',
          nearbyStop: 'Oxford Street / Marble Arch',
          walkTimeMinutes: 2,
          walkDistanceMeters: 120,
          arrivals: [2, 9, 15],
          isFavorite: false,
          delayMinutes: 1,
          crowdLevel: 'low',
          predictiveConfidence: 95,
          frequencyMinutes: 6,
          vehicleType: 'Routemaster Double Decker Bus',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Marble Arch', timeInMin: 2 },
            { name: 'Oxford Circus', timeInMin: 5 },
            { name: 'Euston Station', timeInMin: 14, isTransfer: true, transferLines: ['Overground', 'Avanti'] },
            { name: 'Angel', timeInMin: 22 }
          ],
          routeCoordinates: [[lat - 0.005, lng - 0.01], [lat, lng], [lat + 0.015, lng + 0.01]],
          currentVehicles: [{ id: 'lon-b73', lat: lat - 0.002, lng: lng - 0.005, heading: 45, nextStop: 'Marble Arch', speedKmH: 22, occupancyPct: 35 }]
        },
        {
          id: 'london-elizabeth',
          lineNumber: 'Elizabeth',
          lineName: 'Elizabeth Line Express',
          type: 'train',
          color: '#9333EA',
          textColor: '#FFFFFF',
          destination: 'Heathrow Airport / Reading',
          nearbyStop: 'Tottenham Court Road (5 min walk)',
          walkTimeMinutes: 5,
          walkDistanceMeters: 380,
          arrivals: [4, 11, 18],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'moderate',
          predictiveConfidence: 99,
          frequencyMinutes: 5,
          vehicleType: 'Class 345 High Speed Crossrail',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Tottenham Court Road', timeInMin: 4 },
            { name: 'Paddington', timeInMin: 9, isTransfer: true, transferLines: ['GWR', 'Bakerloo', 'Circle'] },
            { name: 'Heathrow Terminals 2 & 3', timeInMin: 28 }
          ],
          routeCoordinates: [[lat - 0.01, lng - 0.03], [lat, lng], [lat + 0.01, lng + 0.05]],
          currentVehicles: [{ id: 'lon-e1', lat: lat - 0.005, lng: lng - 0.015, heading: 80, nextStop: 'Paddington', speedKmH: 75, occupancyPct: 40 }]
        }
      ];

    case 'madrid':
      return [
        {
          id: 'madrid-m1',
          lineNumber: 'L1',
          lineName: 'Metro Línea 1 (Azul)',
          type: 'metro',
          color: '#0284C7',
          textColor: '#FFFFFF',
          destination: 'Pinar de Chamartín / Valdecarros',
          nearbyStop: 'Puerta del Sol / Gran Vía',
          walkTimeMinutes: 2,
          walkDistanceMeters: 150,
          arrivals: [1, 4, 8],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 97,
          frequencyMinutes: 3,
          vehicleType: 'Tren Automático Metro Madrid',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Sol', timeInMin: 1, isTransfer: true, transferLines: ['L2', 'L3', 'Cercanías'] },
            { name: 'Gran Vía', timeInMin: 3, isTransfer: true, transferLines: ['L5'] },
            { name: 'Tribunal', timeInMin: 5, isTransfer: true, transferLines: ['L10'] },
            { name: 'Atocha Renfe', timeInMin: 11, isTransfer: true, transferLines: ['AVE', 'Cercanías'] }
          ],
          routeCoordinates: [[lat - 0.01, lng], [lat, lng], [lat + 0.02, lng]],
          currentVehicles: [{ id: 'mad-m1', lat: lat - 0.003, lng: lng, heading: 0, nextStop: 'Sol', speedKmH: 50, occupancyPct: 30 }]
        },
        {
          id: 'madrid-bus146',
          lineNumber: '146',
          lineName: 'EMT Autobús 146',
          type: 'bus',
          color: '#16A34A',
          textColor: '#FFFFFF',
          destination: 'Los Cármenes',
          nearbyStop: 'Callao / Gran Vía',
          walkTimeMinutes: 3,
          walkDistanceMeters: 200,
          arrivals: [3, 10, 18],
          isFavorite: false,
          delayMinutes: 0,
          crowdLevel: 'moderate',
          predictiveConfidence: 96,
          frequencyMinutes: 7,
          vehicleType: 'Autobús 100% Eléctrico EMT',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Callao', timeInMin: 3 },
            { name: 'Plaza de España', timeInMin: 7 },
            { name: 'Cibeles', timeInMin: 13 }
          ],
          routeCoordinates: [[lat, lng - 0.01], [lat, lng], [lat, lng + 0.015]],
          currentVehicles: [{ id: 'mad-b146', lat: lat, lng: lng - 0.005, heading: 90, nextStop: 'Callao', speedKmH: 25, occupancyPct: 42 }]
        },
        {
          id: 'madrid-cercanias-c4',
          lineNumber: 'C-4',
          lineName: 'Cercanías C-4 A/B',
          type: 'train',
          color: '#EA580C',
          textColor: '#FFFFFF',
          destination: 'Parla / Alcobendas - San Sebastián',
          nearbyStop: 'Estación de Sol Subterránea',
          walkTimeMinutes: 3,
          walkDistanceMeters: 180,
          arrivals: [5, 12, 20],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 98,
          frequencyMinutes: 6,
          vehicleType: 'Tren Civia Renfe Cercanías',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Sol', timeInMin: 5, isTransfer: true, transferLines: ['L1', 'L2', 'L3'] },
            { name: 'Nuevos Ministerios', timeInMin: 11, isTransfer: true, transferLines: ['L6', 'L8', 'L10'] },
            { name: 'Chamartín Clara Campoamor', timeInMin: 16 }
          ],
          routeCoordinates: [[lat - 0.02, lng], [lat, lng], [lat + 0.03, lng + 0.01]],
          currentVehicles: [{ id: 'mad-c4', lat: lat - 0.01, lng: lng, heading: 10, nextStop: 'Sol', speedKmH: 68, occupancyPct: 38 }]
        }
      ];

    case 'berlin':
      return [
        {
          id: 'berlin-u2',
          lineNumber: 'U2',
          lineName: 'U-Bahn Line U2',
          type: 'metro',
          color: '#D97706',
          textColor: '#FFFFFF',
          destination: 'Pankow / Ruhleben',
          nearbyStop: 'Alexanderplatz',
          walkTimeMinutes: 2,
          walkDistanceMeters: 140,
          arrivals: [2, 6, 11],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 99,
          frequencyMinutes: 4,
          vehicleType: 'BVG Kleinprofil U-Bahn',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Alexanderplatz', timeInMin: 2, isTransfer: true, transferLines: ['U5', 'U8', 'S-Bahn'] },
            { name: 'Stadtmitte', timeInMin: 7, isTransfer: true, transferLines: ['U6'] },
            { name: 'Potsdamer Platz', timeInMin: 11 }
          ],
          routeCoordinates: [[lat - 0.01, lng - 0.01], [lat, lng], [lat + 0.015, lng + 0.02]],
          currentVehicles: [{ id: 'ber-u2', lat: lat - 0.004, lng: lng - 0.004, heading: 45, nextStop: 'Alexanderplatz', speedKmH: 50, occupancyPct: 35 }]
        },
        {
          id: 'berlin-sbahn-s5',
          lineNumber: 'S5',
          lineName: 'S-Bahn Line S5 Express',
          type: 'train',
          color: '#15803D',
          textColor: '#FFFFFF',
          destination: 'Strausberg Nord / Westkreuz',
          nearbyStop: 'Berlin Hauptbahnhof',
          walkTimeMinutes: 4,
          walkDistanceMeters: 290,
          arrivals: [3, 10, 17],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'moderate',
          predictiveConfidence: 97,
          frequencyMinutes: 5,
          vehicleType: 'S-Bahn BR 483/484 Electric Train',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Berlin Hauptbahnhof', timeInMin: 3, isTransfer: true, transferLines: ['ICE', 'U5'] },
            { name: 'Friedrichstraße', timeInMin: 7 },
            { name: 'Alexanderplatz', timeInMin: 10 }
          ],
          routeCoordinates: [[lat, lng - 0.03], [lat, lng], [lat, lng + 0.03]],
          currentVehicles: [{ id: 'ber-s5', lat: lat, lng: lng - 0.01, heading: 90, nextStop: 'Berlin Hbf', speedKmH: 65, occupancyPct: 48 }]
        }
      ];

    case 'sete':
      return [
        {
          id: 'sete-line-1',
          lineNumber: 'Ligne 1',
          lineName: 'Sète Agglopôle Ligne 1 (Gare SNCF - Passage)',
          type: 'bus',
          color: '#E6007E',
          textColor: '#FFFFFF',
          destination: 'Gare SNCF de Sète / Le Passage / Plages',
          nearbyStop: 'Quai de la Résistance (2 min walk)',
          walkTimeMinutes: 2,
          walkDistanceMeters: 140,
          arrivals: [3, 11, 22],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 98,
          frequencyMinutes: 10,
          vehicleType: 'Sète Eco-Hybrid Bus',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Gare SNCF Sète', timeInMin: 3, isTransfer: true, transferLines: ['TER Occitanie', 'TGV'] },
            { name: 'Quai de la Résistance', timeInMin: 6 },
            { name: 'Les Halles', timeInMin: 9 },
            { name: 'Le Passage', timeInMin: 14 },
            { name: 'Plage du Lazaret', timeInMin: 21 }
          ],
          routeCoordinates: [[43.4080, 3.6930], [43.4040, 3.6960], [43.3980, 3.6820], [43.3910, 3.6650]],
          currentVehicles: [{ id: 's1-v1', lat: 43.4060, lng: 3.6940, heading: 200, nextStop: 'Quai de la Résistance', speedKmH: 32, occupancyPct: 30 }]
        },
        {
          id: 'sete-line-3',
          lineNumber: 'Ligne 3',
          lineName: 'Sète Line 3 (Centre Ville - Mont Saint-Clair)',
          type: 'bus',
          color: '#009EE0',
          textColor: '#FFFFFF',
          destination: 'Mont Saint-Clair / Notre-Dame de la Salette',
          nearbyStop: 'Passage Le Roy',
          walkTimeMinutes: 3,
          walkDistanceMeters: 210,
          arrivals: [5, 18, 32],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'moderate',
          predictiveConfidence: 97,
          frequencyMinutes: 15,
          vehicleType: 'Midibus Montagne',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Passage Le Roy', timeInMin: 5 },
            { name: 'Pont Pierre Marly', timeInMin: 10 },
            { name: 'Mont Saint-Clair Panorama', timeInMin: 18 }
          ],
          routeCoordinates: [[43.4030, 3.6950], [43.3990, 3.6890], [43.3960, 3.6820]],
          currentVehicles: [{ id: 's3-v1', lat: 43.4010, lng: 3.6920, heading: 220, nextStop: 'Pont Pierre Marly', speedKmH: 28, occupancyPct: 45 }]
        },
        {
          id: 'sete-ter',
          lineNumber: 'TER Occitanie',
          lineName: 'Transports Castelginest / TER Occitanie',
          type: 'train',
          color: '#D2001A',
          textColor: '#FFFFFF',
          destination: 'Montpellier / Castelginest / Toulouse / Béziers',
          nearbyStop: 'Gare de Sète (4 min walk)',
          walkTimeMinutes: 4,
          walkDistanceMeters: 310,
          arrivals: [4, 16, 28],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 99,
          frequencyMinutes: 12,
          vehicleType: 'TER LiO Occitanie Regio2N',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Gare de Sète', timeInMin: 4, isTransfer: true, transferLines: ['Ligne 1', 'Ligne 3', 'TGV'] },
            { name: 'Frontignan', timeInMin: 11 },
            { name: 'Vic - Mireval', timeInMin: 16 },
            { name: 'Montpellier Saint-Roch', timeInMin: 24, isTransfer: true, transferLines: ['Tram 1', 'Tram 2', 'Tram 3', 'Tram 4'] },
            { name: 'Castelginest - Toulouse Matabiau', timeInMin: 55 }
          ],
          routeCoordinates: [[43.4090, 3.6980], [43.4470, 3.7550], [43.6047, 3.8806]],
          currentVehicles: [{ id: 'ster-v1', lat: 43.4150, lng: 3.7100, heading: 50, nextStop: 'Frontignan', speedKmH: 110, occupancyPct: 35 }]
        }
      ];

    default:
      // Generic European City Transit Lines Fallback generator
      return [
        {
          id: `${cityId}-m1`,
          lineNumber: 'M1',
          lineName: `${city.name} Metro Line 1`,
          type: 'metro',
          color: '#2563EB',
          textColor: '#FFFFFF',
          destination: 'Central Station / Airport',
          nearbyStop: city.locationLabel.replace(/^.*near\s*/i, '').replace(/^.*cerca de\s*/i, ''),
          walkTimeMinutes: 3,
          walkDistanceMeters: 220,
          arrivals: [2, 7, 13],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 97,
          frequencyMinutes: 5,
          vehicleType: 'Modern European Electric Metro',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'City Center', timeInMin: 2 },
            { name: 'Museum Square', timeInMin: 6 },
            { name: 'Central Station', timeInMin: 12, isTransfer: true, transferLines: ['Train', 'Bus'] }
          ],
          routeCoordinates: [[lat - 0.01, lng - 0.01], [lat, lng], [lat + 0.01, lng + 0.01]],
          currentVehicles: [{ id: `${cityId}-m1-v1`, lat: lat - 0.003, lng: lng - 0.003, heading: 45, nextStop: 'City Center', speedKmH: 48, occupancyPct: 35 }]
        },
        {
          id: `${cityId}-b10`,
          lineNumber: '10',
          lineName: `${city.name} Bus Line 10`,
          type: 'bus',
          color: '#059669',
          textColor: '#FFFFFF',
          destination: 'Grand Boulevard Park',
          nearbyStop: 'Central Avenue',
          walkTimeMinutes: 4,
          walkDistanceMeters: 280,
          arrivals: [4, 11, 19],
          isFavorite: false,
          delayMinutes: 1,
          crowdLevel: 'moderate',
          predictiveConfidence: 94,
          frequencyMinutes: 8,
          vehicleType: 'Zero-Emission Eco Bus',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Central Avenue', timeInMin: 4 },
            { name: 'University Campus', timeInMin: 9 },
            { name: 'North Terminal', timeInMin: 17 }
          ],
          routeCoordinates: [[lat + 0.005, lng - 0.02], [lat, lng], [lat - 0.01, lng + 0.02]],
          currentVehicles: [{ id: `${cityId}-b10-v1`, lat: lat + 0.002, lng: lng - 0.008, heading: 120, nextStop: 'Central Avenue', speedKmH: 26, occupancyPct: 40 }]
        },
        {
          id: `${cityId}-t1`,
          lineNumber: 'R-1',
          lineName: `${city.name} Regional Train / RER`,
          type: 'train',
          color: '#7C3AED',
          textColor: '#FFFFFF',
          destination: 'International Airport',
          nearbyStop: 'Main Rail Terminal',
          walkTimeMinutes: 6,
          walkDistanceMeters: 420,
          arrivals: [5, 15, 25],
          isFavorite: true,
          delayMinutes: 0,
          crowdLevel: 'low',
          predictiveConfidence: 99,
          frequencyMinutes: 10,
          vehicleType: 'European High Speed Commuter Train',
          wheelchairAccessible: true,
          hasWifi: true,
          hasAC: true,
          upcomingStops: [
            { name: 'Main Rail Terminal', timeInMin: 5 },
            { name: 'Financial Hub', timeInMin: 12 },
            { name: 'Airport Terminal 1 & 2', timeInMin: 22 }
          ],
          routeCoordinates: [[lat - 0.02, lng - 0.02], [lat, lng], [lat + 0.02, lng + 0.03]],
          currentVehicles: [{ id: `${cityId}-t1-v1`, lat: lat - 0.008, lng: lng - 0.008, heading: 45, nextStop: 'Main Terminal', speedKmH: 72, occupancyPct: 32 }]
        }
      ];
  }
}
