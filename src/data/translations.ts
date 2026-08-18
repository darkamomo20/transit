export type LanguageCode = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'nl';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];

export const BCP47_LOCALE_MAP: Record<LanguageCode, string> = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  nl: 'nl-NL',
};

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  es: {
    appTitle: 'TRANSIT AI EUROPA',
    subTitle: 'RED DE TRANSPORTE REAL • CAPITALES',
    lines: 'Líneas',
    map: 'Mapa GPS',
    planner: 'Planificador',
    stopVision: 'Visión Foto',
    plans: 'Planes',
    ipTelemetry: 'IP Móvil',
    account: 'Cuenta',
    copilot: 'AI Copilot',
    searchPlaceholder: 'Buscar línea, estación o parada en Europa...',
    allModes: 'Todas las Líneas',
    favorites: '★ Favoritas',
    metro: '🚇 Metro',
    bus: '🚌 Bus',
    train: '🚆 Tren / RER',
    bike: '🚲 Bici Share',
    rideshare: '🚗 Taxi / VTC',
    serviceAlerts: 'Alertas de Servicio en Directo',
    normalService: 'Servicio Normal (100% Fluido)',
    incidents: 'Incidencias',
    realtimeSync: 'Red de Transporte Europa en Tiempo Real',
    telemetryActive: 'Telemetría activa en directo',
    accountStatus: 'Estado de Cuenta',
    serverConnected: 'Servidor Europa Conectado',
    dataSaverTitle: 'Ahorro de Batería y Datos',
    pauseTelemetryLabel: 'Pausar actualización en directo (3s)',
    pauseTelemetryDesc: 'Detiene las consultas automáticas cada 3 segundos para conservar batería y datos móviles.',
    telemetryPaused: 'Telemetría Pausada (Ahorro Activo)',
    resumeTelemetry: 'Reanudar',
    manualRefresh: 'Actualizar Ahora',
    profileTitle: 'Perfil y Ajustes de Cuenta',
    analytics: 'Analytics',
    analyticsTitle: 'Demanda de Pasajeros por Hora',
    analyticsSubtitle: 'Volumen simulado en tiempo real e inteligencia predictiva por red urbana',
    gpsCommute: 'Calculadora GPS',
    voiceTtsTitle: 'Notificaciones de Voz (Text-to-Speech)',
    voiceTtsDesc: 'Anuncia por voz la llegada del transporte cuando tu GPS esté a menos de 500m de la parada.',
    voiceTtsRadius: 'Radio de Proximidad GPS',
    voiceTtsTest: 'Probar Voz (TTS)',
    voiceTtsActive: 'Voz Activa (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Centro de Notificaciones y Avisos',
    notifCenterSubtitle: 'Alertas de llegada en tiempo real, avisos de servicio y estado de suscripción',
    notifTabAlerts: 'Avisos en Vivo',
    notifTabHistory: 'Historial',
    notifTabSettings: 'Configuración',
    notifAtStation: '¡EN LA ESTACIÓN!',
    notifArrivingIn: 'Llega en {min} min',
    notifFavoriteNearStop: 'Línea favorita próxima a',
    notifGpsDistance: 'GPS: A solo {meters} m de tu posición',
    notifTrackOnMap: 'Ver en Mapa',
    notifLineDetails: 'Ver Detalles',
    notifTestButton: 'Probar Notificación y Voz',
    notifClearHistory: 'Borrar Historial',
    notifMarkAllRead: 'Marcar todo como leído',
    notifEmptyTitle: 'Sin avisos pendientes',
    notifEmptyDesc: 'Añade tus líneas a favoritas (★) para recibir avisos de llegada con sonido y voz.',
    notifSoundChime: 'Sonido de campanilla',
    notifVoiceTTS: 'Anuncios por voz (TTS)',
    notifPushEnabled: 'Notificaciones del navegador / Push',
    notifTimeThreshold: 'Avisar cuando falten',
    notifDistanceThreshold: 'Distancia GPS máxima',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'ALERTA CRÍTICA DE RED',
    urgentWarningTitle: 'INCIDENCIA GRAVE DE SERVICIO',
    urgentNextAlert: 'Siguiente ({current} de {total})',
    urgentViewDetails: 'Ver detalles de incidencia',
    urgentDismiss: 'Ocultar aviso',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ Tu suscripción {plan} vence HOY',
    subExpiringTomorrow: '⚠️ Tu suscripción {plan} vence MAÑANA',
    subExpiringInDays: '⚠️ Tu suscripción {plan} vence en {days} días',
    subExpiringBody: 'Tu suscripción a {plan} expirará el {date}. Renueva ahora para mantener acceso ilimitado a telemetría en tiempo real y notificaciones prioritarias.',
    subRenewalWarningTitle: 'Aviso de Renovación de Suscripción',
    subBatchRenewalTitle: 'Aviso General: Su suscripción se renovará automáticamente en 2 días',
    subRenewNow: 'Renovar Plan',
  },
  en: {
    appTitle: 'TRANSIT AI EUROPE',
    subTitle: 'REAL TRANSPORT NETWORK • CAPITALS',
    lines: 'Lines',
    map: 'GPS Map',
    planner: 'Planner',
    stopVision: 'Stop Vision',
    plans: 'Plans',
    ipTelemetry: 'Mobile IP',
    account: 'Account',
    copilot: 'AI Copilot',
    searchPlaceholder: 'Search line, station or stop in Europe...',
    allModes: 'All Lines',
    favorites: '★ Favorites',
    metro: '🚇 Metro',
    bus: '🚌 Bus',
    train: '🚆 Train / RER',
    bike: '🚲 Bike Share',
    rideshare: '🚗 Rideshare / Taxi',
    serviceAlerts: 'Live Service Alerts',
    normalService: 'Normal Service (100% Smooth)',
    incidents: 'Incidents',
    realtimeSync: 'Real-Time European Transport Network',
    telemetryActive: 'Live Telemetry Active',
    accountStatus: 'Account Status',
    serverConnected: 'Europe Server Connected',
    dataSaverTitle: 'Battery & Data Saver',
    pauseTelemetryLabel: 'Pause live 3s telemetry update',
    pauseTelemetryDesc: 'Stops background updates every 3 seconds to save mobile data and extend battery life.',
    telemetryPaused: 'Telemetry Paused (Data Saver Active)',
    resumeTelemetry: 'Resume',
    manualRefresh: 'Refresh Now',
    profileTitle: 'Profile & Settings',
    analytics: 'Analytics',
    analyticsTitle: 'Hourly Passenger Demand',
    analyticsSubtitle: 'Simulated real-time passenger volume & predictive city network intelligence',
    gpsCommute: 'GPS Calc',
    voiceTtsTitle: 'Voice Announcements (Text-to-Speech)',
    voiceTtsDesc: 'Speaks transit arrivals aloud when your GPS position is within 500m of the stop.',
    voiceTtsRadius: 'GPS Proximity Radius',
    voiceTtsTest: 'Test Voice (TTS)',
    voiceTtsActive: 'Voice Active (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Notification & Alerts Center',
    notifCenterSubtitle: 'Real-time arrival alerts, service notices, and subscription status',
    notifTabAlerts: 'Live Alerts',
    notifTabHistory: 'History',
    notifTabSettings: 'Settings',
    notifAtStation: 'AT THE STATION!',
    notifArrivingIn: 'Arrives in {min} min',
    notifFavoriteNearStop: 'Favorite line approaching',
    notifGpsDistance: 'GPS: Just {meters} m from your location',
    notifTrackOnMap: 'Track on Map',
    notifLineDetails: 'View Details',
    notifTestButton: 'Test Notification & Voice',
    notifClearHistory: 'Clear History',
    notifMarkAllRead: 'Mark all as read',
    notifEmptyTitle: 'No pending alerts',
    notifEmptyDesc: 'Add lines to favorites (★) to receive real-time arrival chimes and voice alerts.',
    notifSoundChime: 'Audio chime sound',
    notifVoiceTTS: 'Voice announcements (TTS)',
    notifPushEnabled: 'Browser / Push notifications',
    notifTimeThreshold: 'Notify when arrival is under',
    notifDistanceThreshold: 'Maximum GPS radius',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'CRITICAL NETWORK ALERT',
    urgentWarningTitle: 'MAJOR SERVICE DISRUPTION',
    urgentNextAlert: 'Next ({current} of {total})',
    urgentViewDetails: 'View incident details',
    urgentDismiss: 'Dismiss alert',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ Your {plan} subscription expires TODAY',
    subExpiringTomorrow: '⚠️ Your {plan} subscription expires TOMORROW',
    subExpiringInDays: '⚠️ Your {plan} subscription expires in {days} days',
    subExpiringBody: 'Your {plan} subscription is set to expire on {date}. Renew now to keep unlimited access to real-time predictive telemetry and priority alerts.',
    subRenewalWarningTitle: 'Subscription Renewal Notice',
    subBatchRenewalTitle: 'General Notice: Your subscription will auto-renew in 2 days',
    subRenewNow: 'Renew Plan',
  },
  fr: {
    appTitle: 'TRANSIT AI EUROPE',
    subTitle: 'RÉSEAU DE TRANSPORT RÉEL • CAPITALES',
    lines: 'Lignes',
    map: 'Carte GPS',
    planner: 'Planificateur',
    stopVision: 'Vision Arrêt',
    plans: 'Forfaits',
    ipTelemetry: 'IP Mobile',
    account: 'Compte',
    copilot: 'Copilote IA',
    searchPlaceholder: 'Rechercher une ligne, station ou arrêt en Europe...',
    allModes: 'Toutes les Lignes',
    favorites: '★ Favoris',
    metro: '🚇 Métro',
    bus: '🚌 Bus',
    train: '🚆 Train / RER',
    bike: '🚲 Vélos Libres',
    rideshare: '🚗 VTC / Taxi',
    serviceAlerts: 'Alertas Trafic en Direct',
    normalService: 'Trafic Fluide (100% Normal)',
    incidents: 'Perturbations',
    realtimeSync: 'Réseau de Transport Européen en Temps Réel',
    telemetryActive: 'Télémétrie en Direct',
    accountStatus: 'Statut du Compte',
    serverConnected: 'Serveur Europe Connecté',
    dataSaverTitle: 'Économie de Batterie & Données',
    pauseTelemetryLabel: 'Mettre en pause la télémétrie (3s)',
    pauseTelemetryDesc: 'Arrête la mise à jour automatique toutes les 3s pour économiser les données et la batterie.',
    telemetryPaused: 'Télémétrie en Pause (Mode Éco)',
    resumeTelemetry: 'Reprendre',
    manualRefresh: 'Actualiser',
    profileTitle: 'Profil & Paramètres',
    analytics: 'Analytique',
    analyticsTitle: 'Fréquentation des Passagers par Heure',
    analyticsSubtitle: 'Volume de passagers en temps réel et prévisions pour le réseau urbain',
    voiceTtsTitle: 'Annonces Vocales (Text-to-Speech)',
    voiceTtsDesc: 'Annonce vocalement l’arrivée du transport lorsque votre GPS est à moins de 500m de l’arrêt.',
    voiceTtsRadius: 'Rayon de Proximité GPS',
    voiceTtsTest: 'Tester la Voix (TTS)',
    voiceTtsActive: 'Voix Active (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Centre de Notifications & Alertes',
    notifCenterSubtitle: 'Alertes d’arrivée en temps réel, perturbations et état de l’abonnement',
    notifTabAlerts: 'Alertes Directes',
    notifTabHistory: 'Historique',
    notifTabSettings: 'Paramètres',
    notifAtStation: 'EN GARE / À L’ARRÊT !',
    notifArrivingIn: 'Arrive dans {min} min',
    notifFavoriteNearStop: 'Ligne favorite proche de',
    notifGpsDistance: 'GPS : À seulement {meters} m de votre position',
    notifTrackOnMap: 'Voir sur la Carte',
    notifLineDetails: 'Détails Ligne',
    notifTestButton: 'Tester Notification & Voix',
    notifClearHistory: 'Effacer l’Historique',
    notifMarkAllRead: 'Tout marquer comme lu',
    notifEmptyTitle: 'Aucune alerte en attente',
    notifEmptyDesc: 'Ajoutez des lignes en favoris (★) pour recevoir des alertes sonores et vocales en direct.',
    notifSoundChime: 'Sonnerie de notification',
    notifVoiceTTS: 'Annonces vocales (TTS)',
    notifPushEnabled: 'Notifications navigateur / Push',
    notifTimeThreshold: 'Alerter quand il reste',
    notifDistanceThreshold: 'Rayon GPS maximal',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'ALERTE CRITIQUE DU RÉSEAU',
    urgentWarningTitle: 'PERTURBATION MAJEURE DU TRAFIC',
    urgentNextAlert: 'Suivant ({current} sur {total})',
    urgentViewDetails: 'Voir les détails',
    urgentDismiss: 'Fermer l’alerte',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ Votre forfait {plan} expire AUJOURD’HUI',
    subExpiringTomorrow: '⚠️ Votre forfait {plan} expire DEMAIN',
    subExpiringInDays: '⚠️ Votre forfait {plan} expire dans {days} jours',
    subExpiringBody: 'Votre forfait {plan} expirera le {date}. Renouvelez dès maintenant pour conserver l’accès illimité à la télémétrie en temps réel et aux alertes prioritaires.',
    subRenewalWarningTitle: 'Avis de Renouvellement de Forfait',
    subBatchRenewalTitle: 'Avis Général : Votre abonnement sera renouvelé automatiquement dans 2 jours',
    subRenewNow: 'Renouveler le Forfait',
  },
  de: {
    appTitle: 'TRANSIT AI EUROPA',
    subTitle: 'ECHTZEIT VERKEHRSNETZ • HAUPTSTÄDTE',
    lines: 'Linien',
    map: 'GPS-Karte',
    planner: 'Planer',
    stopVision: 'Haltestellen-Cam',
    plans: 'Tarife',
    ipTelemetry: 'Mobil-IP',
    account: 'Konto',
    copilot: 'KI-Copilot',
    searchPlaceholder: 'Linie, Station oder Haltestelle in Europa suchen...',
    allModes: 'Alle Linien',
    favorites: '★ Favoriten',
    metro: '🚇 U-Bahn',
    bus: '🚌 Bus',
    train: '🚆 S-Bahn / Zug',
    bike: '🚲 Leihräder',
    rideshare: '🚗 Taxi / VTC',
    serviceAlerts: 'Live-Meldungen & Störungen',
    normalService: 'Normaler Betrieb (100% Pünktlich)',
    incidents: 'Meldungen',
    realtimeSync: 'Europäisches Nahverkehrsnetz in Echtzeit',
    telemetryActive: 'Live-Telemetrie Aktiv',
    accountStatus: 'Kontostatus',
    serverConnected: 'Europa-Server Verbunden',
    dataSaverTitle: 'Daten- & Akkusparmodus',
    pauseTelemetryLabel: 'Live-Telemetrie pausieren (3s)',
    pauseTelemetryDesc: 'Stoppt automatische Updates alle 3s, um Akku und Datenvolumen zu sparen.',
    telemetryPaused: 'Telemetrie Pausiert (Sparmodus)',
    resumeTelemetry: 'Fortsetzen',
    manualRefresh: 'Jetzt Aktualisieren',
    profileTitle: 'Profil & Einstellungen',
    analytics: 'Analysen',
    analyticsTitle: 'Stündliche Fahrgastnachfrage',
    analyticsSubtitle: 'Echtzeit-Fahrgastaufkommen und prädiktive Netzauslastung',
    gpsCommute: 'GPS-Rechner',
    voiceTtsTitle: 'Sprachansagen (Text-to-Speech)',
    voiceTtsDesc: 'Sagt die Ankunft des Verkehrs laut an, wenn Ihre GPS-Position weniger als 500m entfernt ist.',
    voiceTtsRadius: 'GPS-Näherungsradius',
    voiceTtsTest: 'Sprachansage Testen (TTS)',
    voiceTtsActive: 'Sprache Aktiv (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Benachrichtigungs- & Alarmzentrale',
    notifCenterSubtitle: 'Echtzeit-Ankunftswarnungen, Verkehrsmeldungen und Abostatus',
    notifTabAlerts: 'Live-Meldungen',
    notifTabHistory: 'Verlauf',
    notifTabSettings: 'Einstellungen',
    notifAtStation: 'IN DER STATION!',
    notifArrivingIn: 'Kommt in {min} Min.',
    notifFavoriteNearStop: 'Favorisierte Linie nähert sich',
    notifGpsDistance: 'GPS: Nur {meters} m von Ihrer Position',
    notifTrackOnMap: 'Auf Karte anzeigen',
    notifLineDetails: 'Details anzeigen',
    notifTestButton: 'Test-Benachrichtigung & Audio',
    notifClearHistory: 'Verlauf löschen',
    notifMarkAllRead: 'Alle als gelesen markieren',
    notifEmptyTitle: 'Keine aktuellen Meldungen',
    notifEmptyDesc: 'Fügen Sie Linien zu Favoriten hinzu (★), um Audio- und Sprachmeldungen in Echtzeit zu erhalten.',
    notifSoundChime: 'Signalton (Chime)',
    notifVoiceTTS: 'Sprachansagen (TTS)',
    notifPushEnabled: 'Browser- / Push-Benachrichtigungen',
    notifTimeThreshold: 'Benachrichtigen bei weniger als',
    notifDistanceThreshold: 'Maximaler GPS-Radius',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'KRITISCHE NETZWERK-WARNUNG',
    urgentWarningTitle: 'SCHWERE VERKEHRSSTÖRUNG',
    urgentNextAlert: 'Weiter ({current} von {total})',
    urgentViewDetails: 'Störungsdetails ansehen',
    urgentDismiss: 'Meldung schließen',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ Ihr {plan}-Abonnement läuft HEUTE ab',
    subExpiringTomorrow: '⚠️ Ihr {plan}-Abonnement läuft MORGEN ab',
    subExpiringInDays: '⚠️ Ihr {plan}-Abonnement läuft in {days} Tagen ab',
    subExpiringBody: 'Ihr {plan}-Abonnement läuft am {date} ab. Jetzt verlängern für unbegrenzten Zugriff auf Echtzeit-Telemetrie und Prioritätsmeldungen.',
    subRenewalWarningTitle: 'Abonnement-Verlängerungshinweis',
    subBatchRenewalTitle: 'Allgemeiner Hinweis: Ihr Abonnement verlängert sich in 2 Tagen automatisch',
    subRenewNow: 'Abonnement Verlängern',
  },
  it: {
    appTitle: 'TRANSIT AI EUROPA',
    subTitle: 'RETE DI TRASPORTO REALE • CAPITALI',
    lines: 'Linee',
    map: 'Mappa GPS',
    planner: 'Pianificatore',
    stopVision: 'Visione Fermata',
    plans: 'Piani',
    ipTelemetry: 'IP Mobile',
    account: 'Account',
    copilot: 'Copilot IA',
    searchPlaceholder: 'Cerca linea, stazione o fermata in Europa...',
    allModes: 'Tutte le Linee',
    favorites: '★ Preferiti',
    metro: '🚇 Metro',
    bus: '🚌 Bus',
    train: '🚆 Treno / RER',
    bike: '🚲 Bici Sharing',
    rideshare: '🚗 Taxi / VTC',
    serviceAlerts: 'Avvisi di Servizio in Tempo Reale',
    normalService: 'Servizio Regolare (100% Fluido)',
    incidents: 'Anomalie',
    realtimeSync: 'Rete di Trasporto Europea in Tempo Reale',
    telemetryActive: 'Telemetria in Diretta',
    accountStatus: 'Stato Account',
    serverConnected: 'Server Europa Connesso',
    dataSaverTitle: 'Risparmio Batteria e Dati',
    pauseTelemetryLabel: 'Pausa aggiornamento telemetria (3s)',
    pauseTelemetryDesc: 'Interrompe gli aggiornamenti automatici ogni 3s per risparmiare dati e batteria.',
    telemetryPaused: 'Telemetria in Pausa (Risparmio Attivo)',
    resumeTelemetry: 'Riprendi',
    manualRefresh: 'Aggiorna Ora',
    profileTitle: 'Profilo e Impostazioni',
    analytics: 'Analisi',
    analyticsTitle: 'Domanda Oraria Passeggeri',
    analyticsSubtitle: 'Affluenza in tempo reale ed elaborazione predittiva di rete',
    gpsCommute: 'Calcolatore GPS',
    voiceTtsTitle: 'Annunci Vocali (Text-to-Speech)',
    voiceTtsDesc: 'Annuncia vocalmente l’arrivo del trasporto quando il tuo GPS è a meno di 500m dalla fermata.',
    voiceTtsRadius: 'Raggio di Prossimità GPS',
    voiceTtsTest: 'Prova Voce (TTS)',
    voiceTtsActive: 'Voce Attiva (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Centro Notifiche e Avvisi',
    notifCenterSubtitle: 'Avvisi di arrivo in tempo reale, segnalazioni sul servizio e stato abbonamento',
    notifTabAlerts: 'Avvisi Diretti',
    notifTabHistory: 'Cronologia',
    notifTabSettings: 'Impostazioni',
    notifAtStation: 'IN STAZIONE!',
    notifArrivingIn: 'Arriva in {min} min',
    notifFavoriteNearStop: 'Linea preferita in arrivo a',
    notifGpsDistance: 'GPS: A soli {meters} m dalla tua posizione',
    notifTrackOnMap: 'Mostra su Mappa',
    notifLineDetails: 'Dettagli Linea',
    notifTestButton: 'Test Notifica e Voce',
    notifClearHistory: 'Cancella Cronologia',
    notifMarkAllRead: 'Segna tutto come letto',
    notifEmptyTitle: 'Nessun avviso in sospeso',
    notifEmptyDesc: 'Aggiungi le tue linee ai preferiti (★) per ricevere notifiche sonore e vocali in tempo reale.',
    notifSoundChime: 'Avviso acustico',
    notifVoiceTTS: 'Annunci vocali (TTS)',
    notifPushEnabled: 'Notifiche browser / Push',
    notifTimeThreshold: 'Avvisa quando mancano',
    notifDistanceThreshold: 'Raggio massimo GPS',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'ALLERTA CRITICA DI RETE',
    urgentWarningTitle: 'ANOMALIA GRAVE DI SERVIZIO',
    urgentNextAlert: 'Successivo ({current} di {total})',
    urgentViewDetails: 'Vedi dettagli anomalia',
    urgentDismiss: 'Chiudi avviso',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ Il tuo abbonamento {plan} scade OGGI',
    subExpiringTomorrow: '⚠️ Il tuo abbonamento {plan} scade DOMANI',
    subExpiringInDays: '⚠️ Il tuo abbonamento {plan} scade tra {days} giorni',
    subExpiringBody: 'Il tuo abbonamento a {plan} scadrà il {date}. Rinnova ora per mantenere accesso illimitato alla telemetria predittiva in tempo reale e alle notifiche prioritarie.',
    subRenewalWarningTitle: 'Avviso di Rinnovo Abbonamento',
    subBatchRenewalTitle: 'Avviso Generale: Il tuo abbonamento si rinnoverà automaticamente tra 2 giorni',
    subRenewNow: 'Rinnova Abbonamento',
  },
  pt: {
    appTitle: 'TRANSIT AI EUROPA',
    subTitle: 'REDE DE TRANSPORTE REAL • CAPITAIS',
    lines: 'Linhas',
    map: 'Mapa GPS',
    planner: 'Planeador',
    stopVision: 'Visão Paragem',
    plans: 'Planos',
    ipTelemetry: 'IP Móvel',
    account: 'Conta',
    copilot: 'Copiloto IA',
    searchPlaceholder: 'Pesquisar linha, estação ou paragem na Europa...',
    allModes: 'Todas as Linhas',
    favorites: '★ Favoritos',
    metro: '🚇 Metro',
    bus: '🚌 Autocarro',
    train: '🚆 Comboio / RER',
    bike: '🚲 Bicycles',
    rideshare: '🚗 Táxi / VTC',
    serviceAlerts: 'Alertas de Serviço em Direto',
    normalService: 'Serviço Normal (100% Fluido)',
    incidents: 'Ocorrências',
    realtimeSync: 'Rede de Transporte Europeia em Tempo Real',
    telemetryActive: 'Telemetria Ativa',
    accountStatus: 'Estado da Conta',
    serverConnected: 'Servidor Europa Conectado',
    dataSaverTitle: 'Poupança de Bateria e Dados',
    pauseTelemetryLabel: 'Pausar atualização de telemetria (3s)',
    pauseTelemetryDesc: 'Pára as atualizações a cada 3s para poupar dados móveis e bateria.',
    telemetryPaused: 'Telemetria Pausada (Poupança Ativa)',
    resumeTelemetry: 'Retomar',
    manualRefresh: 'Atualizar Agora',
    profileTitle: 'Perfil e Definições',
    analytics: 'Análise',
    analyticsTitle: 'Procura Horária de Passageiros',
    analyticsSubtitle: 'Afluência em tempo real e inteligência preditiva de rede',
    gpsCommute: 'Calculadora GPS',
    voiceTtsTitle: 'Avisos por Voz (Text-to-Speech)',
    voiceTtsDesc: 'Anuncia por voz a chegada do transporte quando o seu GPS estiver a menos de 500m da paragem.',
    voiceTtsRadius: 'Raio de Proximidade GPS',
    voiceTtsTest: 'Testar Voz (TTS)',
    voiceTtsActive: 'Voz Ativa (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Centro de Notificações e Alertas',
    notifCenterSubtitle: 'Alertas de chegada em tempo real, avisos de tráfego e estado da subscrição',
    notifTabAlerts: 'Alertas em Direto',
    notifTabHistory: 'Histórico',
    notifTabSettings: 'Definições',
    notifAtStation: 'NA ESTAÇÃO!',
    notifArrivingIn: 'Chega em {min} min',
    notifFavoriteNearStop: 'Linha favorita a aproximar-se de',
    notifGpsDistance: 'GPS: A apenas {meters} m da sua posição',
    notifTrackOnMap: 'Ver no Mapa',
    notifLineDetails: 'Ver Detalhes',
    notifTestButton: 'Testar Notificação e Voz',
    notifClearHistory: 'Limpar Histórico',
    notifMarkAllRead: 'Marcar tudo como lido',
    notifEmptyTitle: 'Sem avisos pendentes',
    notifEmptyDesc: 'Adicione linhas aos favoritos (★) para receber alertas de áudio e voz em direto.',
    notifSoundChime: 'Som de notificação',
    notifVoiceTTS: 'Avisos por voz (TTS)',
    notifPushEnabled: 'Notificações do navegador / Push',
    notifTimeThreshold: 'Avisar quando faltarem',
    notifDistanceThreshold: 'Raio GPS máximo',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'ALERTA CRÍTICO DE REDE',
    urgentWarningTitle: 'OCORRÊNCIA GRAVE DE SERVIÇO',
    urgentNextAlert: 'Seguinte ({current} de {total})',
    urgentViewDetails: 'Ver detalhes da ocorrência',
    urgentDismiss: 'Fechar alerta',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ A sua subscrição {plan} expira HOJE',
    subExpiringTomorrow: '⚠️ A sua subscrição {plan} expira AMANHÃ',
    subExpiringInDays: '⚠️ A sua subscrição {plan} expira em {days} dias',
    subExpiringBody: 'A sua subscrição de {plan} expirará a {date}. Renove agora para manter o acesso ilimitado à telemetria preditiva em tempo real e notificações prioritárias.',
    subRenewalWarningTitle: 'Aviso de Renovação de Subscrição',
    subBatchRenewalTitle: 'Aviso Geral: A sua subscrição renova automaticamente em 2 dias',
    subRenewNow: 'Renovar Plano',
  },
  nl: {
    appTitle: 'TRANSIT AI EUROPA',
    subTitle: 'ECHTVERVOERSNETWERK • HOOFDSTEDEN',
    lines: 'Lijnen',
    map: 'GPS-Kaart',
    planner: 'Routeplanner',
    stopVision: 'Halte-Cam',
    plans: 'Abonnementen',
    ipTelemetry: 'Mobiel IP',
    account: 'Account',
    copilot: 'AI Copilot',
    searchPlaceholder: 'Zoek lijn, station of halte in Europa...',
    allModes: 'Alle Lijnen',
    favorites: '★ Favorieten',
    metro: '🚇 Metro',
    bus: '🚌 Bus',
    train: '🚆 Trein / RER',
    bike: '🚲 Deelfietsen',
    rideshare: '🚗 Taxi / VTC',
    serviceAlerts: 'Live Servicemeldingen',
    normalService: 'Normale Dienstregeling (100%)',
    incidents: 'Storingen',
    realtimeSync: 'Europees Openbaar Vervoer in Echtzeit',
    telemetryActive: 'Live Telemetrie Actief',
    accountStatus: 'Accountstatus',
    serverConnected: 'Europa Server Verbonden',
    dataSaverTitle: 'Batterij- & Databesparing',
    pauseTelemetryLabel: 'Pauzeer live telemetrie (3s)',
    pauseTelemetryDesc: 'Stopt elke 3s updates om mobiele data en batterij te besparen.',
    telemetryPaused: 'Telemetrie Gepauzeerd (Spaarstand)',
    resumeTelemetry: 'Hervatten',
    manualRefresh: 'Nu Vernieuwen',
    profileTitle: 'Profiel & Instellingen',
    analytics: 'Analyses',
    analyticsTitle: 'Uurlijkse Passagiersvraag',
    analyticsSubtitle: 'Realtime passagiersvolumes en voorspellende netwerkinzichten',
    gpsCommute: 'GPS-Rekenmachine',
    voiceTtsTitle: 'Spraakberichten (Text-to-Speech)',
    voiceTtsDesc: 'Spreekt aankomsten luid uit wanneer uw GPS-locatie binnen 500m van de halte is.',
    voiceTtsRadius: 'GPS Nabijheidsstraal',
    voiceTtsTest: 'Spraak Testen (TTS)',
    voiceTtsActive: 'Spraak Actief (<500m)',

    // Notification Center & Arrival Alerts
    notifCenterTitle: 'Meldingen- & Alarmcentrum',
    notifCenterSubtitle: 'Realtime aankomstwaarschuwingen, servicemeldingen en abonnementstatus',
    notifTabAlerts: 'Live Meldingen',
    notifTabHistory: 'Geschiedenis',
    notifTabSettings: 'Instellingen',
    notifAtStation: 'OP HET STATION!',
    notifArrivingIn: 'Aankomst over {min} min',
    notifFavoriteNearStop: 'Favoriete lijn nadert',
    notifGpsDistance: 'GPS: Slechts {meters} m van uw locatie',
    notifTrackOnMap: 'Volgen op Kaart',
    notifLineDetails: 'Lijndetails',
    notifTestButton: 'Test Melding & Spraak',
    notifClearHistory: 'Geschiedenis Wissen',
    notifMarkAllRead: 'Alles als gelezen markeren',
    notifEmptyTitle: 'Geen openstaande meldingen',
    notifEmptyDesc: 'Voeg lijnen toe aan favorieten (★) om realtime audio- en spraakmeldingen te ontvangen.',
    notifSoundChime: 'Geluidssignaal (Chime)',
    notifVoiceTTS: 'Spraakmeldingen (TTS)',
    notifPushEnabled: 'Browser- / Pushmeldingen',
    notifTimeThreshold: 'Waarschuwen bij minder dan',
    notifDistanceThreshold: 'Maximale GPS-straal',

    // Urgent Disruption Overlay
    urgentCriticalTitle: 'KRITIEKE NETWERKMELDING',
    urgentWarningTitle: 'ERNSTIGE SERVICESTORING',
    urgentNextAlert: 'Volgende ({current} van {total})',
    urgentViewDetails: 'Bekijk storingsdetails',
    urgentDismiss: 'Melding sluiten',

    // Subscription Expiry Notices
    subExpiringToday: '⚠️ Uw {plan}-abonnement verloopt VANDAAG',
    subExpiringTomorrow: '⚠️ Uw {plan}-abonnement verloopt MORGEN',
    subExpiringInDays: '⚠️ Uw {plan}-abonnement verloopt over {days} dagen',
    subExpiringBody: 'Uw {plan}-abonnement verloopt op {date}. Verleng nu om onbeperkt toegang te behouden tot realtime voorspellende telemetrie en prioriteitsmeldingen.',
    subRenewalWarningTitle: 'Abonnementsverlengingsbericht',
    subBatchRenewalTitle: 'Algemeen Bericht: Uw abonnement wordt over 2 dagen automatisch verlengd',
    subRenewNow: 'Abonnement Verlengen',
  },
};

/**
 * Returns a translated string with parameter replacements.
 */
export function getTranslatedText(
  lang: LanguageCode,
  key: string,
  params?: Record<string, string | number>
): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.es;
  let text = dictionary[key] || TRANSLATIONS.es[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

/**
 * Constructs localized TTS arrival voice announcements according to user's selected language.
 */
export function formatArrivalVoiceSpeech(
  lang: LanguageCode,
  lineNumber: string,
  destination: string,
  nearbyStop: string,
  arrivalMin: number,
  distMeters?: number
): string {
  const distText = distMeters ? `${Math.round(distMeters)}` : '500';

  switch (lang) {
    case 'en':
      return arrivalMin === 0
        ? `Attention. Transit line ${lineNumber} towards ${destination} is arriving at your stop ${nearbyStop} now.`
        : `Attention. Your transit line ${lineNumber} towards ${destination} will arrive in ${arrivalMin} minutes at ${nearbyStop}. Approximate GPS distance: ${distText} meters.`;
    case 'fr':
      return arrivalMin === 0
        ? `Attention. Le transport de la ligne ${lineNumber} en direction de ${destination} entre en gare à votre arrêt ${nearbyStop}.`
        : `Attention. Votre ligne ${lineNumber} en direction de ${destination} arrive dans ${arrivalMin} minutes à l'arrêt ${nearbyStop}. Distance GPS estimée : ${distText} mètres.`;
    case 'de':
      return arrivalMin === 0
        ? `Achtung. Die Linie ${lineNumber} in Richtung ${destination} fährt jetzt an Ihrer Haltestelle ${nearbyStop} ein.`
        : `Achtung. Ihre Linie ${lineNumber} in Richtung ${destination} kommt in ${arrivalMin} Minuten an der Haltestelle ${nearbyStop} an. GPS-Distanz: ${distText} Meter.`;
    case 'it':
      return arrivalMin === 0
        ? `Attenzione. Il trasporto della linea ${lineNumber} in direzione ${destination} sta arrivando alla fermata ${nearbyStop}.`
        : `Attenzione. La tua linea ${lineNumber} in direzione ${destination} arriverà tra ${arrivalMin} minuti alla fermata ${nearbyStop}. Distanza GPS stimata: ${distText} metri.`;
    case 'pt':
      return arrivalMin === 0
        ? `Atenção. O transporte da linha ${lineNumber} com destino a ${destination} está a entrar na sua paragem ${nearbyStop}.`
        : `Atenção. A sua linha ${lineNumber} com destino a ${destination} chegará em ${arrivalMin} minutos à paragem ${nearbyStop}. Distância GPS: ${distText} metros.`;
    case 'nl':
      return arrivalMin === 0
        ? `Let op. Lijn ${lineNumber} richting ${destination} arriveert nu bij uw halte ${nearbyStop}.`
        : `Let op. Uw lijn ${lineNumber} richting ${destination} arriveert over ${arrivalMin} minuten bij halte ${nearbyStop}. GPS-afstand: ${distText} meter.`;
    case 'es':
    default:
      return arrivalMin === 0
        ? `Atención. El transporte de la línea ${lineNumber} en dirección ${destination} está entrando a tu parada ${nearbyStop}.`
        : `Atención. Tu transporte de la línea ${lineNumber} en dirección ${destination} llegará en ${arrivalMin} minutos a la parada ${nearbyStop}. Distancia GPS aproximada: ${distText} metros.`;
  }
}

/**
 * Constructs localized TTS test voice announcement.
 */
export function formatTestVoiceSpeech(
  lang: LanguageCode,
  lineNumber: string,
  destination: string,
  nearbyStop: string
): string {
  switch (lang) {
    case 'en':
      return `Audio test completed. Your favorite line ${lineNumber} towards ${destination} is approaching stop ${nearbyStop}.`;
    case 'fr':
      return `Test audio terminé. Votre ligne favorite ${lineNumber} en direction de ${destination} approche de l'arrêt ${nearbyStop}.`;
    case 'de':
      return `Audio-Test abgeschlossen. Ihre Favoritenlinie ${lineNumber} in Richtung ${destination} nähert sich der Haltestelle ${nearbyStop}.`;
    case 'it':
      return `Test audio completato. La tua linea preferita ${lineNumber} in direzione ${destination} è vicina alla fermata ${nearbyStop}.`;
    case 'pt':
      return `Teste de áudio concluído. A sua linha favorita ${lineNumber} com destino a ${destination} está a aproximar-se da paragem ${nearbyStop}.`;
    case 'nl':
      return `Audiotest voltooid. Uw favoriete lijn ${lineNumber} richting ${destination} nadert halte ${nearbyStop}.`;
    case 'es':
    default:
      return `Prueba de audio completada. Tu línea favorita ${lineNumber} en dirección ${destination} está próxima a la parada ${nearbyStop}.`;
  }
}

/**
 * Formats localized browser push notification title and body.
 */
export function formatBrowserArrivalNotification(
  lang: LanguageCode,
  lineNumber: string,
  nearbyStop: string,
  destination: string,
  arrivalMin: number,
  distMeters?: number
): { title: string; body: string } {
  const distText = distMeters ? ` (${Math.round(distMeters)} m)` : '';

  switch (lang) {
    case 'en':
      return {
        title: `🚆 Favorite line ${lineNumber} is arriving!`,
        body: `${nearbyStop}: ${arrivalMin === 0 ? 'Arriving now!' : `Arrives in ${arrivalMin} min`}${distText} towards ${destination}.`,
      };
    case 'fr':
      return {
        title: `🚆 Votre ligne favorite ${lineNumber} arrive !`,
        body: `${nearbyStop} : ${arrivalMin === 0 ? 'Arrive maintenant !' : `Arrive dans ${arrivalMin} min`}${distText} vers ${destination}.`,
      };
    case 'de':
      return {
        title: `🚆 Favorisierte Linie ${lineNumber} kommt an!`,
        body: `${nearbyStop}: ${arrivalMin === 0 ? 'Fährt jetzt ein!' : `In ${arrivalMin} Min.`}${distText} Richtung ${destination}.`,
      };
    case 'it':
      return {
        title: `🚆 La tua linea preferita ${lineNumber} sta arrivando!`,
        body: `${nearbyStop}: ${arrivalMin === 0 ? 'Arriva adesso!' : `Arriva in ${arrivalMin} min`}${distText} verso ${destination}.`,
      };
    case 'pt':
      return {
        title: `🚆 A sua linha favorita ${lineNumber} está a chegar!`,
        body: `${nearbyStop}: ${arrivalMin === 0 ? 'A chegar agora!' : `Chega em ${arrivalMin} min`}${distText} rumo a ${destination}.`,
      };
    case 'nl':
      return {
        title: `🚆 Favoriete lijn ${lineNumber} komt eraan!`,
        body: `${nearbyStop}: ${arrivalMin === 0 ? 'Komt nu aan!' : `Over ${arrivalMin} min`}${distText} richting ${destination}.`,
      };
    case 'es':
    default:
      return {
        title: `🚆 ¡Tu línea favorita ${lineNumber} está llegando!`,
        body: `${nearbyStop}: ${arrivalMin === 0 ? '¡Llegando ahora a la estación!' : `Llega en ${arrivalMin} min`}${distText} en dirección a ${destination}.`,
      };
  }
}

/**
 * Formats localized subscription expiry notice strings.
 */
export function formatSubscriptionNotice(
  lang: LanguageCode,
  planType: string,
  daysLeft: number,
  expiryDate: string
): { title: string; body: string } {
  const planDisplay = planType === 'enterprise' ? 'Pass VIP Europa' : planType === 'pro' ? 'Pass Pro' : 'Plan Free';
  let title = '';

  if (daysLeft === 0) {
    title = getTranslatedText(lang, 'subExpiringToday', { plan: planDisplay });
  } else if (daysLeft === 1) {
    title = getTranslatedText(lang, 'subExpiringTomorrow', { plan: planDisplay });
  } else {
    title = getTranslatedText(lang, 'subExpiringInDays', { plan: planDisplay, days: daysLeft });
  }

  const body = getTranslatedText(lang, 'subExpiringBody', {
    plan: planDisplay,
    date: expiryDate || '2 days',
  });

  return { title, body };
}
