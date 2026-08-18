import { RegisteredUser, UserAccount, PaymentTransaction, UserPlanType } from '../types';
import { LanguageCode, formatSubscriptionNotice, getTranslatedText } from '../data/translations';

const STORAGE_USERS_KEY = 'transit_registered_users_db';
const STORAGE_PAYMENTS_KEY = 'transit_payment_transactions_db';
const STORAGE_AUDIT_LOGS_KEY = 'transit_admin_audit_logs';

/**
 * Calculates remaining days until subscription expiry date (formatted DD/MM/YYYY or YYYY-MM-DD)
 */
export function calculateDaysRemaining(expiryDateStr?: string): number | null {
  if (!expiryDateStr || expiryDateStr === 'N/A' || expiryDateStr.includes('Gratis') || expiryDateStr.includes('Ilimitado')) {
    return null;
  }

  try {
    let expiryDate: Date;
    if (expiryDateStr.includes('/')) {
      const parts = expiryDateStr.split('/');
      // DD/MM/YYYY
      expiryDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      expiryDate = new Date(expiryDateStr);
    }

    if (isNaN(expiryDate.getTime())) return null;

    // Use current date or simulate 13/08/2026 if current date is close to 2026
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (e) {
    return null;
  }
}

/**
 * Initial dataset of users including:
 * 1. Registered users with accounts
 * 2. Active users currently browsing
 * 3. Devices that installed the app (PWA/App) without an account
 * 4. Varied subscription expiration dates (including 2-day renewal warnings)
 */
export const DEFAULT_USERS_DATABASE: RegisteredUser[] = [
  {
    id: 'usr_001',
    name: 'Carlos Mendoza',
    email: 'carlos.m@example.com',
    role: 'user',
    plan: 'pro',
    status: 'active',
    registeredDate: '12/04/2026',
    lastLogin: 'Hace 5 min',
    isRegistered: true,
    ipAddress: '88.172.94.21',
    deviceModel: 'iPhone 15 Pro (iOS 18)',
    location: 'París, Île-de-France',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '12/04/2026',
    subscriptionExpiryDate: '15/08/2026', // ¡Vence en 2 DÍAS!
    subscriptionDaysLeft: 2,
    subscriptionAutoRenew: true,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 42
  },
  {
    id: 'usr_002',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@paris.fr',
    role: 'user',
    plan: 'free',
    status: 'active',
    registeredDate: '01/05/2026',
    lastLogin: 'Ayer a las 18:30',
    isRegistered: true,
    ipAddress: '176.182.10.45',
    deviceModel: 'Samsung Galaxy S24 (Android 14)',
    location: 'Boulogne-Billancourt',
    connectionStatus: 'En Reposo',
    isAppInstalled: true,
    appInstallDate: '01/05/2026',
    subscriptionExpiryDate: 'Ilimitado (Plan Gratis)',
    subscriptionDaysLeft: null,
    subscriptionAutoRenew: false,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 12
  },
  {
    id: 'usr_003',
    name: 'Admin Principal (Tú)',
    email: 'admin@transports-castelginest.fr',
    role: 'admin',
    plan: 'enterprise',
    status: 'active',
    registeredDate: '10/01/2026',
    lastLogin: 'En línea ahora',
    isRegistered: true,
    ipAddress: '192.168.1.104',
    deviceModel: 'MacBook Pro M3 / App Web',
    location: 'Centro de Operaciones Castelginest',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '10/01/2026',
    subscriptionExpiryDate: '10/01/2028',
    subscriptionDaysLeft: 515,
    subscriptionAutoRenew: true,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 180
  },
  {
    id: 'usr_004',
    name: 'Mateo Gómez',
    email: 'mateo.g@gmail.com',
    role: 'user',
    plan: 'pro',
    status: 'suspended',
    language: 'es',
    registeredDate: '20/06/2026',
    lastLogin: 'Hace 12 días',
    isRegistered: true,
    ipAddress: '10.0.4.18',
    deviceModel: 'Xiaomi Redmi Note 13',
    location: 'Madrid, España',
    connectionStatus: 'Desconectado',
    isAppInstalled: false,
    subscriptionExpiryDate: '20/07/2026', // Expirado
    subscriptionDaysLeft: -24,
    subscriptionAutoRenew: false,
    pendingBalance: 4.99,
    paymentFailureReason: 'Tarjeta rechazada / Saldo insuficiente',
    renewalWarningSent: true,
    renewalWarningSentDate: '18/07/2026 10:00',
    activeSessionDurationMinutes: 0
  },
  {
    id: 'usr_005',
    name: 'Elena Rostova',
    email: 'elena.rostova@tech.io',
    role: 'moderator',
    plan: 'pro',
    status: 'active',
    registeredDate: '03/07/2026',
    lastLogin: 'Hace 15 min',
    isRegistered: true,
    ipAddress: '92.184.102.33',
    deviceModel: 'Google Pixel 8 Pro (Android 14)',
    location: 'Versalles, Île-de-France',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '03/07/2026',
    subscriptionExpiryDate: '15/08/2026', // ¡Vence en 2 DÍAS!
    subscriptionDaysLeft: 2,
    subscriptionAutoRenew: true,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 95
  },
  {
    id: 'usr_006',
    name: 'Jean-Luc Picard',
    email: 'jeanluc@enterprise.org',
    role: 'user',
    plan: 'enterprise',
    status: 'active',
    registeredDate: '15/07/2026',
    lastLogin: 'Hace 8 min',
    isRegistered: true,
    ipAddress: '88.172.88.90',
    deviceModel: 'iPhone 15 Pro Max',
    location: 'Aéroport Paris-Orly',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '15/07/2026',
    subscriptionExpiryDate: '15/07/2027',
    subscriptionDaysLeft: 336,
    subscriptionAutoRenew: true,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 120
  },
  {
    id: 'usr_007',
    name: 'Lucía Fernández',
    email: 'lucia.f@transports.es',
    role: 'user',
    plan: 'pro',
    status: 'active',
    registeredDate: '02/08/2026',
    lastLogin: 'Hace 1 hora',
    isRegistered: true,
    ipAddress: '80.28.140.12',
    deviceModel: 'Samsung Galaxy Flip 5',
    location: 'Barcelona, España',
    connectionStatus: 'En Reposo',
    isAppInstalled: true,
    appInstallDate: '02/08/2026',
    subscriptionExpiryDate: '02/09/2026',
    subscriptionDaysLeft: 20,
    subscriptionAutoRenew: true,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 35
  },
  {
    id: 'usr_008',
    name: 'Marc Lefebvre',
    email: 'm.lefebvre@lyon-metro.fr',
    role: 'user',
    plan: 'pro',
    status: 'active',
    language: 'fr',
    registeredDate: '15/07/2026',
    lastLogin: 'Hace 3 horas',
    isRegistered: true,
    ipAddress: '194.254.60.18',
    deviceModel: 'OnePlus 12 (Android 14)',
    location: 'Lyon, Auvergne-Rhône-Alpes',
    connectionStatus: 'En Reposo',
    isAppInstalled: true,
    appInstallDate: '15/07/2026',
    subscriptionExpiryDate: '16/08/2026', // ¡Vence en 1 DÍA!
    subscriptionDaysLeft: 1,
    subscriptionAutoRenew: false,
    pendingBalance: 4.99,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 50
  },
  {
    id: 'usr_009',
    name: 'Klaus Weber',
    email: 'klaus.weber@berlin-bahn.de',
    role: 'user',
    plan: 'enterprise',
    status: 'active',
    language: 'de',
    registeredDate: '01/06/2026',
    lastLogin: 'En línea ahora',
    isRegistered: true,
    ipAddress: '91.22.140.88',
    deviceModel: 'Google Pixel 8 (Android 14)',
    location: 'Berlín, Alemania',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '01/06/2026',
    subscriptionExpiryDate: '15/08/2026', // ¡Vence HOY!
    subscriptionDaysLeft: 0,
    subscriptionAutoRenew: true,
    pendingBalance: 14.99,
    paymentFailureReason: 'Cargo automático rechazado: 3D-Secure no validado',
    renewalWarningSent: false,
    activeSessionDurationMinutes: 110
  },
  {
    id: 'usr_010',
    name: 'Giulia Conti',
    email: 'giulia.conti@milano.it',
    role: 'user',
    plan: 'pro',
    status: 'active',
    language: 'it',
    registeredDate: '15/05/2026',
    lastLogin: 'Hace 30 min',
    isRegistered: true,
    ipAddress: '151.15.80.34',
    deviceModel: 'iPhone 15 (iOS 17)',
    location: 'Milán, Italia',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '15/05/2026',
    subscriptionExpiryDate: '15/08/2026', // ¡Vence HOY!
    subscriptionDaysLeft: 0,
    subscriptionAutoRenew: false,
    pendingBalance: 4.99,
    paymentFailureReason: 'Fondos insuficientes en cuenta',
    renewalWarningSent: false,
    activeSessionDurationMinutes: 75
  },
  // --- USUARIOS QUE HAN INSTALADO LA APP PERO NO HAN REGISTRADO CUENTA (SOLO APP INSTALADA / MÓVIL) ---
  {
    id: 'app_phone_9921',
    name: '📱 Móvil Anónimo #9921',
    email: 'Sin Registro (Solo App Instalada)',
    role: 'guest',
    plan: 'free',
    status: 'active',
    registeredDate: 'Instalado Hoy 10:15',
    lastLogin: 'En vivo (Hace 2 min)',
    isRegistered: false,
    ipAddress: '88.172.102.14',
    deviceModel: 'iPhone 14 (iOS 17.5 / PWA Instalada)',
    location: 'París Gare du Nord',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '13/08/2026',
    subscriptionExpiryDate: 'Sin Suscripción (App Libre)',
    subscriptionDaysLeft: null,
    subscriptionAutoRenew: false,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 18
  },
  {
    id: 'app_phone_4402',
    name: '📱 Móvil Anónimo #4402',
    email: 'Sin Registro (Solo App Instalada)',
    role: 'guest',
    plan: 'free',
    status: 'active',
    registeredDate: 'Instalado Ayer 16:40',
    lastLogin: 'Hace 8 min',
    isRegistered: false,
    ipAddress: '176.185.12.90',
    deviceModel: 'Samsung Galaxy A54 (Android 14 / PWA)',
    location: 'Aéroport Charles de Gaulle',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: true,
    appInstallDate: '12/08/2026',
    subscriptionExpiryDate: 'Sin Suscripción (App Libre)',
    subscriptionDaysLeft: null,
    subscriptionAutoRenew: false,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 29
  },
  {
    id: 'app_phone_7718',
    name: '📱 Móvil Anónimo #7718',
    email: 'Sin Registro (Solo App Instalada)',
    role: 'guest',
    plan: 'free',
    status: 'active',
    registeredDate: 'Instalado 10/08/2026',
    lastLogin: 'Hace 25 min',
    isRegistered: false,
    ipAddress: '83.156.40.111',
    deviceModel: 'iPhone 13 mini (iOS 17 / App Web)',
    location: 'Montparnasse, París',
    connectionStatus: 'En Reposo',
    isAppInstalled: true,
    appInstallDate: '10/08/2026',
    subscriptionExpiryDate: 'Sin Suscripción (App Libre)',
    subscriptionDaysLeft: null,
    subscriptionAutoRenew: false,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 14
  }
];

export const DEFAULT_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx_901',
    transactionRef: 'TRX-2026-88192',
    userName: 'Carlos Mendoza',
    userEmail: 'carlos.m@example.com',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'Tarjeta crédito',
    status: 'paid',
    date: '15/07/2026 14:10',
    expiryDate: '15/08/2026' // Expira en 2 días
  },
  {
    id: 'tx_902',
    transactionRef: 'TRX-2026-88193',
    userName: 'Jean-Luc Picard',
    userEmail: 'jeanluc@enterprise.org',
    plan: 'enterprise',
    amount: 149.99,
    paymentMethod: 'PayPal',
    status: 'paid',
    date: '15/07/2026 12:45',
    expiryDate: '15/07/2027'
  },
  {
    id: 'tx_903',
    transactionRef: 'TRX-2026-88194',
    userName: 'Lucía Fernández',
    userEmail: 'lucia.f@transports.es',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'Apple Pay',
    status: 'paid',
    date: '02/08/2026 18:20',
    expiryDate: '02/09/2026'
  },
  {
    id: 'tx_904',
    transactionRef: 'TRX-2026-88195',
    userName: 'Mateo Gómez',
    userEmail: 'mateo.g@gmail.com',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'Tarjeta crédito',
    status: 'failed',
    date: '08/08/2026 09:12',
    expiryDate: 'N/A'
  },
  {
    id: 'tx_905',
    transactionRef: 'TRX-2026-88196',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@tech.io',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'Google Pay',
    status: 'paid',
    date: '15/07/2026 11:30',
    expiryDate: '15/08/2026' // Expira en 2 días
  },
  {
    id: 'tx_906',
    transactionRef: 'TRX-2026-88197',
    userName: 'Marc Lefebvre',
    userEmail: 'm.lefebvre@lyon-metro.fr',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'Tarjeta crédito',
    status: 'paid',
    date: '14/07/2026 08:00',
    expiryDate: '14/08/2026' // Expira en 1 día
  },
  {
    id: 'tx_907',
    transactionRef: 'TRX-2026-88198',
    userName: 'Antoine Dupont',
    userEmail: 'a.dupont@rugby.fr',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'Tarjeta crédito',
    status: 'refunded',
    date: '05/08/2026 10:15',
    expiryDate: '05/09/2026'
  },
  {
    id: 'tx_908',
    transactionRef: 'TRX-2026-88199',
    userName: 'Klaus Weber',
    userEmail: 'klaus.weber@berlin-bahn.de',
    plan: 'enterprise',
    amount: 14.99,
    paymentMethod: 'Tarjeta crédito',
    status: 'failed',
    date: '15/08/2026 04:30',
    expiryDate: '15/08/2026'
  },
  {
    id: 'tx_909',
    transactionRef: 'TRX-2026-88200',
    userName: 'Giulia Conti',
    userEmail: 'giulia.conti@milano.it',
    plan: 'pro',
    amount: 4.99,
    paymentMethod: 'PayPal',
    status: 'pending',
    date: '15/08/2026 06:15',
    expiryDate: '15/08/2026'
  }
];

/**
 * Loads all users from storage or default list, updating their dynamic days remaining
 */
export function getRegisteredUsersDB(): RegisteredUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS_DATABASE;
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    let list: RegisteredUser[] = raw ? JSON.parse(raw) : DEFAULT_USERS_DATABASE;

    // Recalculate dynamic days left on load
    list = list.map((u) => {
      const days = calculateDaysRemaining(u.subscriptionExpiryDate);
      return {
        ...u,
        subscriptionDaysLeft: days !== null ? days : u.subscriptionDaysLeft
      };
    });

    return list;
  } catch (e) {
    console.error('Error loading users DB:', e);
    return DEFAULT_USERS_DATABASE;
  }
}

/**
 * Saves users list and triggers sync event
 */
export function saveRegisteredUsersDB(users: RegisteredUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new CustomEvent('ubical_db_updated', { detail: { type: 'users', count: users.length } }));
  } catch (e) {
    console.error('Error saving users DB:', e);
  }
}

/**
 * Loads payment transactions
 */
export function getPaymentTransactionsDB(): PaymentTransaction[] {
  if (typeof window === 'undefined') return DEFAULT_PAYMENT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_PAYMENTS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PAYMENT_TRANSACTIONS;
  } catch (e) {
    return DEFAULT_PAYMENT_TRANSACTIONS;
  }
}

/**
 * Saves payment transactions and triggers sync
 */
export function savePaymentTransactionsDB(txs: PaymentTransaction[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(txs));
    window.dispatchEvent(new CustomEvent('ubical_db_updated', { detail: { type: 'payments', count: txs.length } }));
  } catch (e) {
    console.error('Error saving payments DB:', e);
  }
}

/**
 * Ensures any user logging in or registering in the app is immediately added/synced to the admin DB
 */
export function syncUserAccountToAdminDB(user: UserAccount, options?: { isNewRegistration?: boolean; isAppInstalled?: boolean }): RegisteredUser {
  const currentUsers = getRegisteredUsersDB();
  const existingIdx = currentUsers.findIndex((u) => (user.id && u.id === user.id) || (user.email && u.email.toLowerCase() === user.email.toLowerCase()));

  // Calculate default subscription expiry based on plan
  const now = new Date();
  let defaultExpiry = 'Ilimitado (Plan Gratis)';
  let daysLeft: number | null = null;
  if (user.plan === 'pro' || user.plan === 'enterprise') {
    const expiryDate = new Date();
    expiryDate.setDate(now.getDate() + 30); // 30 days from now
    defaultExpiry = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;
    daysLeft = 30;
  }

  const deviceModel = user.deviceModel || (navigator.userAgent.includes('iPhone') ? 'iPhone (iOS)' : navigator.userAgent.includes('Android') ? 'Android Device' : 'Web Browser');

  const registeredUser: RegisteredUser = {
    id: user.id || `usr_${Date.now()}`,
    name: user.name || (user.email ? user.email.split('@')[0] : 'Viajero Registrado'),
    email: user.email || 'usuario@ubical.eu',
    role: user.role || (user.isAdmin ? 'admin' : 'user'),
    plan: user.plan || 'free',
    status: 'active',
    registeredDate: user.registeredDate || new Date().toLocaleDateString('es-ES'),
    lastLogin: 'Ahora mismo (En línea)',
    isRegistered: user.isLoggedIn !== false,
    ipAddress: user.ipAddress || '88.172.94.21',
    deviceModel,
    location: 'Castelginest / París, Francia',
    connectionStatus: 'Online (GPS Activo)',
    isAppInstalled: user.isAppInstalled !== undefined ? user.isAppInstalled : true,
    appInstallDate: user.appInstallDate || new Date().toLocaleDateString('es-ES'),
    subscriptionExpiryDate: user.subscriptionExpiryDate || defaultExpiry,
    subscriptionDaysLeft: daysLeft,
    subscriptionAutoRenew: true,
    renewalWarningSent: false,
    activeSessionDurationMinutes: 5
  };

  let updatedList: RegisteredUser[];
  if (existingIdx >= 0) {
    updatedList = [...currentUsers];
    updatedList[existingIdx] = {
      ...updatedList[existingIdx],
      ...registeredUser,
      lastLogin: 'Ahora mismo (En línea)',
      connectionStatus: 'Online (GPS Activo)',
      isRegistered: user.isLoggedIn !== false ? true : updatedList[existingIdx].isRegistered
    };
  } else {
    updatedList = [registeredUser, ...currentUsers];
  }

  saveRegisteredUsersDB(updatedList);
  return registeredUser;
}

/**
 * Tracks an anonymous device that has opened or installed the app without registering an account
 */
export function trackAnonymousAppInstall(): void {
  if (typeof window === 'undefined') return;
  const installedKey = 'transit_tracked_device_id';
  let deviceId = localStorage.getItem(installedKey);

  const currentUsers = getRegisteredUsersDB();

  if (!deviceId) {
    deviceId = `app_phone_${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(installedKey, deviceId);

    const deviceModel = navigator.userAgent.includes('iPhone')
      ? 'iPhone (iOS / App Instalada)'
      : navigator.userAgent.includes('Android')
      ? 'Android (Chrome / PWA Instalada)'
      : 'Dispositivo Móvil / Web App';

    const newAppOnlyUser: RegisteredUser = {
      id: deviceId,
      name: `📱 Móvil Anónimo #${deviceId.replace('app_phone_', '')}`,
      email: 'Sin Registro (Solo App Instalada)',
      role: 'guest',
      plan: 'free',
      status: 'active',
      registeredDate: `Instalado Hoy ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      lastLogin: 'En vivo (Ahora)',
      isRegistered: false,
      ipAddress: '88.172.94.21',
      deviceModel,
      location: 'Castelginest / Toulouse, Francia',
      connectionStatus: 'Online (GPS Activo)',
      isAppInstalled: true,
      appInstallDate: new Date().toLocaleDateString('es-ES'),
      subscriptionExpiryDate: 'Sin Suscripción (App Libre)',
      subscriptionDaysLeft: null,
      subscriptionAutoRenew: false,
      renewalWarningSent: false,
      activeSessionDurationMinutes: 1
    };

    saveRegisteredUsersDB([newAppOnlyUser, ...currentUsers]);
  } else {
    // Update last activity for this anonymous app
    const exists = currentUsers.find((u) => u.id === deviceId);
    if (exists) {
      const updated = currentUsers.map((u) =>
        u.id === deviceId ? { ...u, lastLogin: 'En vivo (Ahora)', connectionStatus: 'Online (GPS Activo)' as const } : u
      );
      saveRegisteredUsersDB(updated);
    }
  }
}

/**
 * Records a new payment transaction and updates the user's subscription in DB
 */
export function processNewPaymentTransaction(params: {
  userId?: string;
  userName: string;
  userEmail: string;
  plan: 'pro' | 'enterprise';
  amount: number;
  paymentMethod: 'Tarjeta crédito' | 'PayPal' | 'Apple Pay' | 'Google Pay';
  isYearly?: boolean;
}): PaymentTransaction {
  const now = new Date();
  const expiryDate = new Date();
  if (params.isYearly) {
    expiryDate.setFullYear(now.getFullYear() + 1);
  } else {
    expiryDate.setDate(now.getDate() + 30);
  }

  const expiryStr = `${String(expiryDate.getDate()).padStart(2, '0')}/${String(expiryDate.getMonth() + 1).padStart(2, '0')}/${expiryDate.getFullYear()}`;
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newTx: PaymentTransaction = {
    id: `tx_${Date.now()}`,
    transactionRef: `TRX-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    userName: params.userName,
    userEmail: params.userEmail,
    plan: params.plan,
    amount: params.amount,
    paymentMethod: params.paymentMethod,
    status: 'paid',
    date: dateStr,
    expiryDate: expiryStr
  };

  const currentTxs = getPaymentTransactionsDB();
  savePaymentTransactionsDB([newTx, ...currentTxs]);

  // Update user in users DB
  const users = getRegisteredUsersDB();
  const updatedUsers = users.map((u) => {
    if ((params.userId && u.id === params.userId) || (u.email && u.email.toLowerCase() === params.userEmail.toLowerCase())) {
      return {
        ...u,
        plan: params.plan,
        subscriptionExpiryDate: expiryStr,
        subscriptionDaysLeft: params.isYearly ? 365 : 30,
        subscriptionAutoRenew: true,
        renewalWarningSent: false
      };
    }
    return u;
  });
  saveRegisteredUsersDB(updatedUsers);

  // Send in-app notification to current user if active
  try {
    const rawNotifs = localStorage.getItem('transit_notification_logs');
    const logs = rawNotifs ? JSON.parse(rawNotifs) : [];
    logs.unshift({
      id: `pay_notif_${Date.now()}`,
      lineId: 'payment',
      lineNumber: 'UBI',
      lineName: `Pago Confirmado: Plan ${params.plan === 'pro' ? 'Pase Pro' : 'Europa VIP'}`,
      lineType: 'train',
      lineColor: '#10B981',
      textColor: '#FFFFFF',
      nearbyStop: `Factura: ${newTx.transactionRef}`,
      arrivalMinutes: 0,
      timestamp: Date.now(),
      read: false
    });
    localStorage.setItem('transit_notification_logs', JSON.stringify(logs.slice(0, 30)));
  } catch (e) {}

  return newTx;
}

/**
 * Sends a 2-day renewal warning notice to a single user in their preferred language
 */
export function sendRenewalWarningNotice(
  userId: string,
  adminName: string = 'Administrador'
): { success: boolean; user?: RegisteredUser; message: string } {
  const users = getRegisteredUsersDB();
  const user = users.find((u) => u.id === userId);
  if (!user) {
    return { success: false, message: 'Usuario no encontrado' };
  }

  const daysLeft = calculateDaysRemaining(user.subscriptionExpiryDate) ?? user.subscriptionDaysLeft ?? 2;
  const expiryDate = user.subscriptionExpiryDate || 'en los próximos días';
  const userLang: LanguageCode = user.language || 'es';

  const updatedUsers = users.map((u) => {
    if (u.id === userId) {
      return {
        ...u,
        renewalWarningSent: true,
        renewalWarningSentDate: new Date().toLocaleString()
      };
    }
    return u;
  });

  saveRegisteredUsersDB(updatedUsers);

  // Format notice in the user's explicit language
  const { title, body } = formatSubscriptionNotice(userLang, user.plan, daysLeft, expiryDate);

  // Send notice into notification logs for the user to see when opening the app
  try {
    const rawNotifs = localStorage.getItem('transit_notification_logs');
    const logs = rawNotifs ? JSON.parse(rawNotifs) : [];
    logs.unshift({
      id: `renewal_alert_${Date.now()}`,
      lineId: 'subscription_warning',
      lineNumber: `${daysLeft}D`,
      lineName: title,
      lineType: 'train',
      lineColor: daysLeft <= 1 ? '#EF4444' : '#F59E0B',
      textColor: '#FFFFFF',
      nearbyStop: body,
      arrivalMinutes: 0,
      timestamp: Date.now(),
      read: false
    });
    localStorage.setItem('transit_notification_logs', JSON.stringify(logs.slice(0, 30)));
  } catch (e) {}

  return {
    success: true,
    user: updatedUsers.find((u) => u.id === userId),
    message: `Aviso en idioma [${userLang.toUpperCase()}] enviado con éxito a ${user.name} (${user.email})`
  };
}

/**
 * Sends 2-day renewal warnings to ALL users whose subscriptions expire within 2 days (0 to 2 days remaining),
 * localized specifically for each user's designated language.
 */
export function sendBatch2DayRenewalWarnings(adminName: string = 'Administrador'): {
  totalSent: number;
  targetedUsers: string[];
} {
  const users = getRegisteredUsersDB();
  const eligibleUsers = users.filter((u) => {
    const days = calculateDaysRemaining(u.subscriptionExpiryDate);
    // Target users whose subscription expires in <= 2 days (and is not already expired long ago)
    return days !== null && days >= 0 && days <= 2 && u.plan !== 'free';
  });

  if (eligibleUsers.length === 0) {
    return { totalSent: 0, targetedUsers: [] };
  }

  const targetedNames: string[] = [];
  const updatedUsers = users.map((u) => {
    const days = calculateDaysRemaining(u.subscriptionExpiryDate);
    if (days !== null && days >= 0 && days <= 2 && u.plan !== 'free') {
      const userLang: LanguageCode = u.language || 'es';
      const expiryDate = u.subscriptionExpiryDate || '';
      targetedNames.push(`${u.name} (${u.email}) [${userLang.toUpperCase()}]`);
      
      const { title, body } = formatSubscriptionNotice(userLang, u.plan, days, expiryDate);

      // Add individual localized log for the user
      try {
        const rawNotifs = localStorage.getItem('transit_notification_logs');
        const logs = rawNotifs ? JSON.parse(rawNotifs) : [];
        logs.unshift({
          id: `batch_renewal_alert_${u.id}_${Date.now()}`,
          lineId: 'subscription_warning',
          lineNumber: `${days}D`,
          lineName: title,
          lineType: 'train',
          lineColor: days <= 1 ? '#EF4444' : '#F59E0B',
          textColor: '#FFFFFF',
          nearbyStop: body,
          arrivalMinutes: 0,
          timestamp: Date.now(),
          read: false
        });
        localStorage.setItem('transit_notification_logs', JSON.stringify(logs.slice(0, 40)));
      } catch (e) {}

      return {
        ...u,
        renewalWarningSent: true,
        renewalWarningSentDate: new Date().toLocaleString()
      };
    }
    return u;
  });

  saveRegisteredUsersDB(updatedUsers);

  return {
    totalSent: eligibleUsers.length,
    targetedUsers: targetedNames
  };
}

/**
 * Merges multiple user accounts or devices into a single primary user account
 */
export function mergeUserAccounts(
  primaryUserId: string,
  sourceUserIds: string[],
  adminName: string = 'Administrador'
): {
  success: boolean;
  primaryUser?: RegisteredUser;
  mergedCount: number;
  message: string;
} {
  const users = getRegisteredUsersDB();
  const primaryUser = users.find((u) => u.id === primaryUserId);

  if (!primaryUser) {
    return { success: false, mergedCount: 0, message: 'La cuenta principal no fue encontrada.' };
  }

  const validSourceIds = sourceUserIds.filter((id) => id !== primaryUserId);
  const sourceUsers = users.filter((u) => validSourceIds.includes(u.id));

  if (sourceUsers.length === 0) {
    return { success: false, mergedCount: 0, message: 'No se encontraron cuentas secundarias válidas para unificar.' };
  }

  // 1. Determine highest subscription plan
  const planHierarchy: Record<'free' | 'pro' | 'enterprise', number> = {
    free: 0,
    pro: 1,
    enterprise: 2
  };

  let bestPlan = primaryUser.plan;
  sourceUsers.forEach((su) => {
    if (planHierarchy[su.plan] > planHierarchy[bestPlan]) {
      bestPlan = su.plan;
    }
  });

  // 2. Consolidate subscription expiry (take latest valid date)
  let bestExpiry = primaryUser.subscriptionExpiryDate || 'Ilimitado (Plan Gratis)';
  let bestDaysLeft = calculateDaysRemaining(primaryUser.subscriptionExpiryDate) ?? primaryUser.subscriptionDaysLeft ?? 0;

  sourceUsers.forEach((su) => {
    const suDays = calculateDaysRemaining(su.subscriptionExpiryDate) ?? su.subscriptionDaysLeft ?? 0;
    if (suDays > bestDaysLeft && su.plan !== 'free') {
      bestDaysLeft = suDays;
      bestExpiry = su.subscriptionExpiryDate || bestExpiry;
    }
  });

  // 3. Consolidate devices
  const existingLinkedDevices = primaryUser.linkedDevices || [];
  
  // Ensure primary user's own current device is captured if not already
  const initialDevices = existingLinkedDevices.length > 0 ? [...existingLinkedDevices] : [
    {
      id: primaryUser.id,
      name: `${primaryUser.name} (Dispositivo Original)`,
      ipAddress: primaryUser.ipAddress || '88.172.94.21',
      deviceModel: primaryUser.deviceModel || 'Dispositivo Principal',
      linkedAt: primaryUser.registeredDate || new Date().toLocaleDateString('es-ES'),
      plan: primaryUser.plan,
      location: primaryUser.location || 'París, Francia'
    }
  ];

  sourceUsers.forEach((su) => {
    const isAlreadyLinked = initialDevices.some((d) => d.id === su.id || (d.ipAddress === su.ipAddress && d.deviceModel === su.deviceModel));
    if (!isAlreadyLinked) {
      initialDevices.push({
        id: su.id,
        name: su.name,
        ipAddress: su.ipAddress || '88.172.94.21',
        deviceModel: su.deviceModel || 'Dispositivo Móvil',
        linkedAt: new Date().toLocaleDateString('es-ES'),
        plan: su.plan,
        location: su.location || 'Francia'
      });
    }

    // Also bring in any existing linked devices from source user
    if (su.linkedDevices && su.linkedDevices.length > 0) {
      su.linkedDevices.forEach((subDev) => {
        if (!initialDevices.some((d) => d.id === subDev.id)) {
          initialDevices.push(subDev);
        }
      });
    }
  });

  // 4. Consolidate linked account IDs
  const combinedAccountIds = Array.from(new Set([
    ...(primaryUser.linkedAccountIds || []),
    ...sourceUsers.map((su) => su.id),
    ...sourceUsers.flatMap((su) => su.linkedAccountIds || [])
  ]));

  // 5. Consolidate pending balance and session durations
  const totalPendingBalance = (primaryUser.pendingBalance || 0) + sourceUsers.reduce((sum, su) => sum + (su.pendingBalance || 0), 0);
  const totalSessionMinutes = (primaryUser.activeSessionDurationMinutes || 0) + sourceUsers.reduce((sum, su) => sum + (su.activeSessionDurationMinutes || 0), 0);

  // 6. Update Primary User
  const updatedPrimaryUser: RegisteredUser = {
    ...primaryUser,
    plan: bestPlan,
    subscriptionExpiryDate: bestPlan === 'free' ? 'Ilimitado (Plan Gratis)' : bestExpiry,
    subscriptionDaysLeft: bestPlan === 'free' ? null : bestDaysLeft,
    pendingBalance: totalPendingBalance > 0 ? totalPendingBalance : undefined,
    activeSessionDurationMinutes: totalSessionMinutes,
    linkedDevices: initialDevices,
    linkedAccountIds: combinedAccountIds,
    lastLogin: 'Ahora mismo (Cuentas Unificadas)',
    connectionStatus: 'Online (GPS Activo)'
  };

  // 7. Update database: remove source users, replace primary user
  const remainingUsers = users.filter((u) => !validSourceIds.includes(u.id) && u.id !== primaryUserId);
  const newUsersList = [updatedPrimaryUser, ...remainingUsers];
  saveRegisteredUsersDB(newUsersList);

  // 8. Reassign payment transactions from source users to primary user
  try {
    const txs = getPaymentTransactionsDB();
    const sourceEmails = sourceUsers.map((su) => su.email.toLowerCase());
    const sourceNames = sourceUsers.map((su) => su.name.toLowerCase());

    const updatedTxs = txs.map((tx) => {
      if (sourceEmails.includes(tx.userEmail.toLowerCase()) || sourceNames.includes(tx.userName.toLowerCase())) {
        return {
          ...tx,
          userName: updatedPrimaryUser.name,
          userEmail: updatedPrimaryUser.email
        };
      }
      return tx;
    });

    savePaymentTransactionsDB(updatedTxs);
  } catch (e) {
    console.error('Error reassigning payment transactions during merge:', e);
  }

  // 9. Record audit log
  try {
    const rawAudit = localStorage.getItem('transit_admin_audit_logs');
    const logs = rawAudit ? JSON.parse(rawAudit) : [];
    const sourceNamesList = sourceUsers.map((s) => `${s.name} (${s.id})`).join(', ');
    logs.unshift({
      id: `audit_merge_${Date.now()}`,
      timestamp: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      adminName,
      adminEmail: 'admin@transports-castelginest.fr',
      actionType: 'user_modified',
      targetUser: `${updatedPrimaryUser.name} (${updatedPrimaryUser.id})`,
      details: `Unificación de cuentas: Se fusionaron ${sourceUsers.length} cuenta(s) [${sourceNamesList}] en la cuenta principal. Plan final: ${bestPlan.toUpperCase()}, ${initialDevices.length} dispositivos vinculados.`
    });
    localStorage.setItem('transit_admin_audit_logs', JSON.stringify(logs.slice(0, 50)));
  } catch (e) {}

  return {
    success: true,
    primaryUser: updatedPrimaryUser,
    mergedCount: sourceUsers.length,
    message: `¡Éxito! Se han unificado ${sourceUsers.length} cuenta(s) en la cuenta principal de ${updatedPrimaryUser.name}. Todos los dispositivos, pagos y suscripciones han sido consolidados.`
  };
}

/**
 * Automatically suggests duplicate or linkable accounts based on IP, Location, or anonymous mobile installs
 */
export function autoSuggestAccountMerges(): {
  primaryUser: RegisteredUser;
  candidates: RegisteredUser[];
  reason: string;
}[] {
  const users = getRegisteredUsersDB();
  const registered = users.filter((u) => u.isRegistered);
  const suggestions: { primaryUser: RegisteredUser; candidates: RegisteredUser[]; reason: string }[] = [];

  registered.forEach((primary) => {
    // Look for anonymous app installs with same IP or same location
    const matchingAppUsers = users.filter(
      (u) =>
        u.id !== primary.id &&
        !u.isRegistered &&
        (u.ipAddress === primary.ipAddress || (u.location && primary.location && u.location.toLowerCase() === primary.location.toLowerCase()))
    );

    if (matchingAppUsers.length > 0) {
      suggestions.push({
        primaryUser: primary,
        candidates: matchingAppUsers,
        reason: `Misma dirección IP (${primary.ipAddress}) o red local detectada en dispositivos anónimos sin cuenta.`
      });
    }
  });

  return suggestions;
}
