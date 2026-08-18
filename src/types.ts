export type TransportType = 'metro' | 'bus' | 'tram' | 'train' | 'bike' | 'rideshare';

export type LanguageCode = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'nl';

export interface TransitLine {
  id: string;
  lineNumber: string; // e.g. "13", "40", "95", "80", "21", "M14"
  lineName: string; // e.g. "Châtillon - Montrouge"
  type: TransportType;
  color: string; // Background color hex or tailwind class
  textColor: string;
  destination: string; // e.g. "Aéroport d'Orly"
  nearbyStop: string; // e.g. "Place de Clichy - Caulaincourt"
  walkTimeMinutes: number; // e.g. 13
  walkDistanceMeters: number;
  arrivals: number[]; // Array of arrival times in minutes, e.g. [0, 6, 15]
  isFavorite?: boolean;
  delayMinutes?: number; // 0 = on time, >0 = delayed
  crowdLevel: 'low' | 'moderate' | 'high'; // Predictive AI crowd estimation
  predictiveConfidence: number; // e.g. 96 (%)
  frequencyMinutes: number; // e.g. every 5 mins
  vehicleType?: string; // e.g. "Electric Bus", "Automated Metro"
  wheelchairAccessible: boolean;
  hasWifi: boolean;
  hasAC: boolean;
  upcomingStops: { name: string; timeInMin: number; isTransfer?: boolean; transferLines?: string[] }[];
  routeCoordinates: [number, number][]; // [lat, lng] array for polylines
  currentVehicles: {
    id: string;
    lat: number;
    lng: number;
    heading: number; // 0-360 deg
    nextStop: string;
    speedKmH: number;
    occupancyPct: number;
  }[];
}

export interface TransitStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  lines: string[]; // lineNumbers
  distanceMeters: number;
}

export interface BikeStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  availableBikes: number;
  availableEBikes: number;
  availableDocks: number;
  distanceMeters: number;
}

export interface RideshareOption {
  provider: 'Uber' | 'Cabify' | 'Bolt' | 'Taxi';
  serviceType: string;
  estimatedPrice: string;
  etaMinutes: number;
  icon: string;
}

export interface AIRoutePlan {
  title: string;
  summary: string;
  totalDurationMinutes: number;
  walkingMinutes: number;
  transfersCount: number;
  crowdPrediction: string;
  delayRisk: 'Low' | 'Medium' | 'High';
  co2SavedKg: number;
  steps: {
    mode: TransportType | 'walk';
    lineOrDetails: string;
    instruction: string;
    durationMinutes: number;
    stopFrom?: string;
    stopTo?: string;
    color?: string;
  }[];
  aiAdvice: string;
}

export interface AIStopAnalysisResult {
  stopName: string;
  detectedLines: string[];
  schedulesFound: string[];
  aiNotes: string;
  realtimeAdvice: string;
  confidenceScore: number;
}

export interface CityNetwork {
  id: string;
  name: string;
  country: string;
  flag: string;
  center: [number, number];
  zoom: number;
  locationLabel: string;
}

export type UserPlanType = 'free' | 'pro' | 'enterprise';

export interface PlanConfig {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  activeUsersCount?: number;
  popular?: boolean;
  features: string[];
}

export interface LinkedDeviceItem {
  id: string;
  deviceId?: string;
  name: string;
  ipAddress: string;
  deviceModel: string;
  linkedAt: string;
  plan?: string;
  location?: string;
  isPrimary?: boolean;
  lastSeen?: string;
}

export interface UserAccount {
  id: string;
  email?: string;
  name?: string;
  plan: UserPlanType;
  registeredDate?: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  pauseTelemetry?: boolean;
  isAdmin?: boolean; // Flag de permisos de administración
  role?: 'admin' | 'user' | 'moderator' | 'guest';
  language?: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'nl';
  voiceTtsEnabled?: boolean; // Notificaciones de voz (Text-to-Speech)
  ttsRadiusMeters?: number; // Radio de proximidad GPS (por defecto 500m)
  subscriptionExpiryDate?: string; // Fecha en que vence la suscripción (ej: "15/08/2026")
  subscriptionAutoRenew?: boolean;
  isAppInstalled?: boolean; // Si ha instalado la app PWA en el dispositivo
  appInstallDate?: string;
  ipAddress?: string;
  deviceModel?: string;
  linkedDevices?: LinkedDeviceItem[];
  linkedAccountIds?: string[];
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator' | 'guest';
  language?: 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'nl';
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended';
  registeredDate: string;
  lastLogin: string;
  isRegistered: boolean; // true = Usuario con cuenta; false = Solo App Instalada / Móvil sin cuenta
  ipAddress: string; // IP pública del teléfono / dispositivo
  deviceModel: string; // ej: "iPhone 15 Pro (iOS 18)"
  location?: string; // ej: "París, Île-de-France"
  connectionStatus?: 'Online (GPS Activo)' | 'En Reposo' | 'Desconectado';
  isAppInstalled?: boolean; // Si tiene la PWA o App móvil instalada
  appInstallDate?: string; // Fecha de instalación de la app
  subscriptionExpiryDate?: string; // Fecha fin de suscripción / renovación
  subscriptionDaysLeft?: number; // Días restantes calculados
  subscriptionAutoRenew?: boolean; // Renovación automática activa
  autoRenew?: boolean; // Alias de renovación automática
  pendingBalance?: number; // Saldo deudor pendiente en EUR
  paymentFailureReason?: string; // Motivo de rechazo de pago (ej. Fondos insuficientes)
  renewalWarningSent?: boolean; // Si se le envió el aviso de 2 días
  renewalWarningSentDate?: string; // Fecha y hora del aviso enviado
  activeSessionDurationMinutes?: number; // Tiempo de uso en la app
  linkedDevices?: LinkedDeviceItem[]; // Dispositivos o cuentas móviles unificadas
  linkedAccountIds?: string[]; // IDs de cuentas fusionadas en esta
  isMerged?: boolean; // Si esta cuenta fue unificada dentro de otra
  mergedIntoId?: string; // ID de la cuenta principal receptora
}

export interface AdminCriticalAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userIp: string;
  ipAddress?: string;
  deviceModel?: string;
  userLanguage?: LanguageCode;
  language?: string;
  plan: 'pro' | 'enterprise' | 'free';
  type: 'expiry_imminent' | 'expired_today' | 'pending_balance' | 'payment_failed' | 'account_suspended_balance';
  severity: 'critical' | 'warning';
  urgency?: 'critical' | 'warning' | 'high' | 'medium';
  title: string;
  description: string;
  amountDue?: number;
  daysLeft?: number | null;
  daysRemaining?: number | null;
  expiryDate?: string;
  paymentFailureReason?: string;
  timestamp: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedAction?: string;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  userName: string;
  userEmail: string;
  plan: 'pro' | 'enterprise' | 'free';
  amount: number;
  paymentMethod: 'Tarjeta crédito' | 'PayPal' | 'Apple Pay' | 'Google Pay';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  date: string;
  expiryDate: string;
  invoiceUrl?: string;
}

export interface IPTelemetryData {
  ip: string;
  networkCarrier: string;
  deviceType: string;
  userAgent: string;
  detectedRegion: string;
  sessionToken: string;
  registeredInstances: number;
  connectionStatus: string;
  timestamp: string;
}
