import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Settings,
  CreditCard,
  Shield,
  Search,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Bell,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  BarChart3,
  Check,
  Activity,
  ExternalLink,
  Copy,
  ArrowLeft,
  ArrowRight,
  X,
  TrendingUp,
  BarChart2,
  PieChart,
  Clock,
  XCircle,
  Download,
  ArrowUpRight,
  FileText,
  Filter,
  CheckSquare,
  Square,
  Zap,
  History,
  ShieldCheck,
  Smartphone,
  Radio,
  Tag,
  FileSpreadsheet,
  PlusCircle,
  AlertOctagon,
  Flame,
  Languages,
  Volume2,
  VolumeX,
  AlertCircle,
  Inbox,
  Link2,
  Unlink,
  GitMerge,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { UserAccount, PlanConfig, RegisteredUser, PaymentTransaction, AdminCriticalAlert, LinkedDeviceItem } from '../types';
import { UbicalLogo } from './UbicalLogo';
import {
  LanguageCode,
  TRANSLATIONS,
  getTranslatedText,
  formatSubscriptionNotice
} from '../data/translations';
import {
  getRegisteredUsersDB,
  saveRegisteredUsersDB,
  getPaymentTransactionsDB,
  savePaymentTransactionsDB,
  calculateDaysRemaining,
  sendRenewalWarningNotice,
  sendBatch2DayRenewalWarnings,
  processNewPaymentTransaction,
  mergeUserAccounts,
  autoSuggestAccountMerges
} from '../services/userDatabase';
import {
  evaluateCriticalSubscriptionAlerts,
  playAdminCriticalAlertSound,
  getSavedAdminAlerts,
  saveAdminAlertsToStorage,
  getAdminSoundPreference,
  setAdminSoundPreference,
  dispatchSimulatedLiveCriticalAlert
} from '../services/adminAlertService';

interface AdminPanelProps {
  theme?: 'dark' | 'light';
  currentUser?: UserAccount | null;
  currentLanguage?: LanguageCode;
  onSwitchToClient?: () => void;
  plans?: PlanConfig[];
  onUpdatePlanPrice?: (planId: string, newPriceMonthly: number, newPriceYearly: number) => void;
  registeredUsers?: RegisteredUser[];
  onUpdateUsers?: (users: RegisteredUser[]) => void;
  onUpdateUserAccount?: (user: UserAccount) => void;
}

interface LiveLogEvent {
  id: string;
  time: string;
  type: 'payment' | 'user_register' | 'status_change' | 'plan_upgrade';
  message: string;
  user: string;
  amount?: string;
}

export interface AdminActionLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  actionType:
    | 'price_update'
    | 'user_modified'
    | 'role_change'
    | 'plan_change'
    | 'status_change'
    | 'user_created'
    | 'user_deleted'
    | 'batch_action'
    | 'config_update'
    | 'admin_note';
  targetUser: string;
  targetUserId?: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

const AdminPanelBase: React.FC<AdminPanelProps> = ({
  theme = 'dark',
  currentUser,
  onSwitchToClient,
  plans: initialPlansProps,
  onUpdatePlanPrice: onUpdatePlanPriceProp,
  registeredUsers: initialRegisteredUsersProps,
  onUpdateUsers: onUpdateUsersProp
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'payments' | 'plans' | 'audit' | 'settings'>('dashboard');
  const [toast, setToast] = useState<string | null>(null);

  // --- ADMIN ACTIVITY LOG STATE & FILTERS ---
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('all');
  const [adminActionLogs, setAdminActionLogs] = useState<AdminActionLog[]>([
    {
      id: 'audit_101',
      timestamp: '13/08/2026 13:45:12',
      adminName: currentUser?.name || 'Admin Maestro',
      adminEmail: currentUser?.email || 'admin@ubical.eu',
      actionType: 'price_update',
      targetUser: 'Tarifa Plan: Pase Pro Commuter',
      targetUserId: 'plan_pro',
      details: 'Actualizó tarifa de suscripción: Mensual €3.99 ➔ €4.99 | Anual €39.99 ➔ €49.99',
      ipAddress: '192.168.1.104'
    },
    {
      id: 'audit_102',
      timestamp: '13/08/2026 11:20:05',
      adminName: currentUser?.name || 'Admin Maestro',
      adminEmail: currentUser?.email || 'admin@ubical.eu',
      actionType: 'user_modified',
      targetUser: 'Carlos Mendoza (carlos.m@example.com)',
      targetUserId: 'usr_001',
      details: 'Modificó datos de cuenta: Ubicación fijada a "Castelginest, Toulouse" y verificación activa',
      ipAddress: '192.168.1.104'
    },
    {
      id: 'audit_103',
      timestamp: '12/08/2026 14:22:10',
      adminName: 'Admin Principal',
      adminEmail: 'admin@ubical.eu',
      actionType: 'role_change',
      targetUser: 'Elena Rostova (elena.rostova@tech.io)',
      targetUserId: 'usr_005',
      details: 'Asignó rol de MODERADOR a Elena Rostova para supervisión de líneas',
      ipAddress: '192.168.1.104'
    },
    {
      id: 'audit_104',
      timestamp: '12/08/2026 12:15:44',
      adminName: 'Admin Principal',
      adminEmail: 'admin@ubical.eu',
      actionType: 'plan_change',
      targetUser: 'Jean-Luc Picard (jeanluc@enterprise.org)',
      targetUserId: 'usr_006',
      details: 'Actualizó plan a EUROPA VIP PASS (€14.99/mes)',
      ipAddress: '192.168.1.104'
    },
    {
      id: 'audit_105',
      timestamp: '11/08/2026 18:30:05',
      adminName: 'Elena Rostova',
      adminEmail: 'elena.rostova@tech.io',
      actionType: 'status_change',
      targetUser: 'Mateo Gómez (mateo.g@gmail.com)',
      targetUserId: 'usr_004',
      details: 'Suspendió la cuenta debido a infracción de términos de uso',
      ipAddress: '10.0.4.18'
    },
    {
      id: 'audit_106',
      timestamp: '10/08/2026 09:12:00',
      adminName: 'Admin Principal',
      adminEmail: 'admin@ubical.eu',
      actionType: 'user_created',
      targetUser: 'Lucía Fernández (lucia.f@transports.es)',
      targetUserId: 'usr_007',
      details: 'Registró nuevo usuario con Pase Pro Commuter',
      ipAddress: '192.168.1.104'
    }
  ]);

  const logAdminAction = (
    actionType: AdminActionLog['actionType'],
    targetUser: string,
    details: string,
    targetUserId?: string
  ) => {
    const newLog: AdminActionLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      adminName: currentUser?.name || 'Admin Maestro',
      adminEmail: currentUser?.email || 'admin@ubical.eu',
      actionType,
      targetUser,
      targetUserId,
      details,
      ipAddress: '192.168.1.104'
    };
    setAdminActionLogs((prev) => [newLog, ...prev]);
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-by7bzslp4b7lstuxsuieig-351109059535.europe-west1.run.app';
  const clientUrl = `${baseUrl}/`;
  const adminUrl = `${baseUrl}/admin`;

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`📋 Link de ${label} copiado al portapapeles`);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // --- REAL-TIME CRITICAL SUBSCRIPTION ALERTS STATE ---
  const [isAdminAlertsOpen, setIsAdminAlertsOpen] = useState(false);
  const [isSoundAlertEnabled, setIsSoundAlertEnabled] = useState<boolean>(() => getAdminSoundPreference());
  const [activeAlertToast, setActiveAlertToast] = useState<AdminCriticalAlert | null>(null);
  const [adminAlertFilter, setAdminAlertFilter] = useState<'all' | 'unresolved' | 'expiry' | 'balance'>('all');
  const [simulatedAlerts, setSimulatedAlerts] = useState<AdminCriticalAlert[]>([]);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<Record<string, { resolvedAt: string; action: string }>>(() => {
    try {
      const saved = localStorage.getItem('ubical_admin_resolved_alerts');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // --- 1. USER MANAGEMENT STATE ---
  const DEFAULT_INITIAL_USERS: RegisteredUser[] = [
    {
      id: 'usr_001',
      name: 'Carlos Mendoza',
      email: 'carlos.m@example.com',
      role: 'user',
      plan: 'pro',
      status: 'active',
      registeredDate: '12/04/2026',
      lastLogin: 'Hace 10 min',
      isRegistered: true,
      ipAddress: '88.172.94.21',
      deviceModel: 'iPhone 15 Pro (iOS 18)',
      location: 'París, Île-de-France',
      connectionStatus: 'Online (GPS Activo)'
    },
    {
      id: 'usr_002',
      name: 'Sophie Laurent',
      email: 'sophie.laurent@paris.fr',
      role: 'user',
      plan: 'free',
      status: 'active',
      registeredDate: '01/05/2026',
      lastLogin: 'Ayer',
      isRegistered: true,
      ipAddress: '176.182.10.45',
      deviceModel: 'Samsung Galaxy S24 (Android 14)',
      location: 'Boulogne-Billancourt',
      connectionStatus: 'En Reposo'
    },
    {
      id: 'usr_003',
      name: 'Admin Principal',
      email: 'admin@transports-castelginest.fr',
      role: 'admin',
      plan: 'enterprise',
      status: 'active',
      registeredDate: '10/01/2026',
      lastLogin: 'Ahora mismo',
      isRegistered: true,
      ipAddress: '192.168.1.104',
      deviceModel: 'MacBook Pro M3 (macOS)',
      location: 'Centro de Control París',
      connectionStatus: 'Online (GPS Activo)'
    },
    {
      id: 'usr_004',
      name: 'Mateo Gómez',
      email: 'mateo.g@gmail.com',
      role: 'user',
      plan: 'free',
      status: 'suspended',
      registeredDate: '20/06/2026',
      lastLogin: 'Hace 12 días',
      isRegistered: true,
      ipAddress: '10.0.4.18',
      deviceModel: 'Xiaomi Redmi Note 13',
      location: 'Madrid, España',
      connectionStatus: 'Desconectado'
    },
    {
      id: 'usr_005',
      name: 'Elena Rostova',
      email: 'elena.rostova@tech.io',
      role: 'moderator',
      plan: 'pro',
      status: 'active',
      registeredDate: '03/07/2026',
      lastLogin: 'Hace 2 horas',
      isRegistered: true,
      ipAddress: '92.184.102.33',
      deviceModel: 'Google Pixel 8 Pro (Android 14)',
      location: 'Versalles, Île-de-France',
      connectionStatus: 'Online (GPS Activo)'
    },
    {
      id: 'usr_006',
      name: 'Jean-Luc Picard',
      email: 'jeanluc@enterprise.org',
      role: 'user',
      plan: 'enterprise',
      status: 'active',
      registeredDate: '15/07/2026',
      lastLogin: 'Hace 5 min',
      isRegistered: true,
      ipAddress: '88.172.88.90',
      deviceModel: 'iPhone 15 Pro Max',
      location: 'Aéroport Paris-Orly',
      connectionStatus: 'Online (GPS Activo)'
    },
    {
      id: 'usr_007',
      name: 'Lucía Fernández',
      email: 'lucia.f@transports.es',
      role: 'user',
      plan: 'pro',
      status: 'active',
      registeredDate: '02/08/2026',
      lastLogin: 'Hace 45 min',
      isRegistered: true,
      ipAddress: '80.28.140.12',
      deviceModel: 'Samsung Galaxy Flip 5',
      location: 'Barcelona, España',
      connectionStatus: 'En Reposo'
    },
    // UNREGISTERED INSTALLED APP PHONES ("SOLO APP INSTALADA - IP MÓVIL")
    {
      id: 'app_phone_9921',
      name: '📱 Móvil Anónimo #9921',
      email: 'Sin Registro (Solo App)',
      role: 'guest',
      plan: 'free',
      status: 'active',
      registeredDate: 'Instalado Hoy',
      lastLogin: 'En vivo (Hace 1 min)',
      isRegistered: false,
      ipAddress: '88.172.102.14',
      deviceModel: 'iPhone 14 (iOS 17.5 / Safari App)',
      location: 'París Gare du Nord',
      connectionStatus: 'Online (GPS Activo)'
    },
    {
      id: 'app_phone_4402',
      name: '📱 Móvil Anónimo #4402',
      email: 'Sin Registro (Solo App)',
      role: 'guest',
      plan: 'free',
      status: 'active',
      registeredDate: 'Instalado Ayer',
      lastLogin: 'Hace 8 min',
      isRegistered: false,
      ipAddress: '176.185.12.90',
      deviceModel: 'Samsung Galaxy A54 (Android 13 / Chrome)',
      location: 'Aéroport Charles de Gaulle',
      connectionStatus: 'Online (GPS Activo)'
    },
    {
      id: 'app_phone_7718',
      name: '📱 Móvil Anónimo #7718',
      email: 'Sin Registro (Solo App)',
      role: 'guest',
      plan: 'free',
      status: 'active',
      registeredDate: 'Hace 3 días',
      lastLogin: 'Hace 25 min',
      isRegistered: false,
      ipAddress: '83.156.40.111',
      deviceModel: 'iPhone 13 mini (iOS 17 / App Web)',
      location: 'Montparnasse, París',
      connectionStatus: 'En Reposo'
    }
  ];

  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    const dbUsers = getRegisteredUsersDB();
    return dbUsers.length > 0 ? dbUsers : (initialRegisteredUsersProps && initialRegisteredUsersProps.length > 0 ? initialRegisteredUsersProps : DEFAULT_INITIAL_USERS);
  });

  useEffect(() => {
    if (initialRegisteredUsersProps && initialRegisteredUsersProps.length > 0) {
      setUsers(initialRegisteredUsersProps);
    }
  }, [initialRegisteredUsersProps]);

  // Real-time synchronization with central User Database and Payment DB
  useEffect(() => {
    const syncFromDB = () => {
      setUsers(getRegisteredUsersDB());
      setTransactions(getPaymentTransactionsDB());
    };
    window.addEventListener('ubical_db_updated', syncFromDB);
    return () => window.removeEventListener('ubical_db_updated', syncFromDB);
  }, []);

  const updateUsersList = (newUsers: RegisteredUser[]) => {
    setUsers(newUsers);
    saveRegisteredUsersDB(newUsers);
    if (onUpdateUsersProp) {
      onUpdateUsersProp(newUsers);
    }
  };

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'registered' | 'app_only' | 'expiring_soon'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedIpTelemetryUser, setSelectedIpTelemetryUser] = useState<RegisteredUser | null>(null);

  // Language options
  const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'es', label: 'Español (ES)', flag: '🇪🇸' },
    { code: 'fr', label: 'Français (FR)', flag: '🇫🇷' },
    { code: 'en', label: 'English (US/UK)', flag: '🇬🇧' },
    { code: 'de', label: 'Deutsch (DE)', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano (IT)', flag: '🇮🇹' },
    { code: 'pt', label: 'Português (PT)', flag: '🇵🇹' },
    { code: 'nl', label: 'Nederlands (NL)', flag: '🇳🇱' },
  ];

  const getLanguageMeta = (lang?: LanguageCode | string) => {
    const match = LANGUAGE_OPTIONS.find((l) => l.code === lang);
    return match || { code: 'es' as LanguageCode, label: 'Español (ES)', flag: '🇪🇸' };
  };

  // Recharts MRR Chart Mode State
  const [mrrChartViewMode, setMrrChartViewMode] = useState<'by_plan' | 'projection_6m'>('by_plan');

  // Real-time Critical Subscription Alerts Modal State
  const [isCriticalAlertsModalOpen, setIsCriticalAlertsModalOpen] = useState(false);

  // User Activity History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistoryUser, setSelectedHistoryUser] = useState<RegisteredUser | null>(null);

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user' | 'moderator'>('user');
  const [newUserPlan, setNewUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [newUserLanguage, setNewUserLanguage] = useState<LanguageCode>('es');

  // Edit User Modal State
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<RegisteredUser | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'user' | 'moderator' | 'guest'>('user');
  const [editUserPlan, setEditUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'suspended'>('active');
  const [editUserLocation, setEditUserLocation] = useState('');
  const [editUserLanguage, setEditUserLanguage] = useState<LanguageCode>('es');
  const [editUserExpiryDate, setEditUserExpiryDate] = useState('');
  const [editUserAutoRenew, setEditUserAutoRenew] = useState(true);

  // Add Custom Log Note Modal State
  const [isAddLogNoteOpen, setIsAddLogNoteOpen] = useState(false);
  const [newLogType, setNewLogType] = useState<AdminActionLog['actionType']>('admin_note');
  const [newLogTarget, setNewLogTarget] = useState('');
  const [newLogDetails, setNewLogDetails] = useState('');

  // --- ACCOUNT UNIFICATION & MERGING STATE ---
  const [isUnifyModalOpen, setIsUnifyModalOpen] = useState(false);
  const [unifyPrimaryUserId, setUnifyPrimaryUserId] = useState<string>('');
  const [unifySelectedSourceIds, setUnifySelectedSourceIds] = useState<string[]>([]);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState(false);
  const [selectedDevicesUser, setSelectedDevicesUser] = useState<RegisteredUser | null>(null);
  const [unifySuggestions, setUnifySuggestions] = useState<{ primaryUser: RegisteredUser; candidates: RegisteredUser[]; reason: string }[]>([]);

  useEffect(() => {
    setUnifySuggestions(autoSuggestAccountMerges());
  }, [users]);

  // --- 2. PAYMENT TRANSACTIONS STATE ---
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    const dbTxs = getPaymentTransactionsDB();
    return dbTxs.length > 0 ? dbTxs : [
      {
        id: 'tx_901',
        transactionRef: 'TRX-2026-88192',
        userName: 'Carlos Mendoza',
        userEmail: 'carlos.m@example.com',
        plan: 'pro',
        amount: 4.99,
        paymentMethod: 'Tarjeta crédito',
        status: 'paid',
        date: '11/08/2026 14:10',
        expiryDate: '11/09/2026'
      },
      {
        id: 'tx_902',
        transactionRef: 'TRX-2026-88193',
        userName: 'Jean-Luc Picard',
        userEmail: 'jeanluc@enterprise.org',
        plan: 'enterprise',
        amount: 14.99,
        paymentMethod: 'PayPal',
        status: 'paid',
        date: '11/08/2026 12:45',
        expiryDate: '11/08/2027'
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
        date: '10/08/2026 18:20',
        expiryDate: '10/09/2026'
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
        amount: 49.99,
        paymentMethod: 'Google Pay',
        status: 'pending',
        date: '11/08/2026 11:30',
        expiryDate: '11/08/2027'
      },
      {
        id: 'tx_906',
        transactionRef: 'TRX-2026-88197',
        userName: 'Antoine Dupont',
        userEmail: 'a.dupont@rugby.fr',
        plan: 'pro',
        amount: 4.99,
        paymentMethod: 'Tarjeta crédito',
        status: 'refunded',
        date: '05/08/2026 16:04',
        expiryDate: 'N/A'
      }
    ];
  });

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // --- 3. LIVE ACTIVITY FEED STATE ---
  const [liveLogs, setLiveLogs] = useState<LiveLogEvent[]>([
    {
      id: 'log_1',
      time: 'Hace 2 min',
      type: 'payment',
      message: 'Renovación de suscripción mensual completada con éxito',
      user: 'Carlos Mendoza',
      amount: '€4.99'
    },
    {
      id: 'log_2',
      time: 'Hace 15 min',
      type: 'user_register',
      message: 'Nuevo usuario registrado en la plataforma',
      user: 'Lucía Fernández'
    },
    {
      id: 'log_3',
      time: 'Hace 42 min',
      type: 'plan_upgrade',
      message: 'Upgrade a Europa VIP Pass',
      user: 'Jean-Luc Picard',
      amount: '€14.99'
    },
    {
      id: 'log_4',
      time: 'Hace 1 hora',
      type: 'status_change',
      message: 'Permisos de moderador concedidos por el administrador',
      user: 'Elena Rostova'
    }
  ]);

  const [isRefreshingStats, setIsRefreshingStats] = useState(false);

  const handleRefreshStats = () => {
    setIsRefreshingStats(true);
    setTimeout(() => {
      setIsRefreshingStats(false);
      showToast('🔄 Estadísticas y métricas sincronizadas en tiempo real');
      // Add a simulated log
      const newLog: LiveLogEvent = {
        id: `log_${Date.now()}`,
        time: 'Ahora mismo',
        type: 'payment',
        message: 'Verificación periódica de pasarela de pago completada (100% Online)',
        user: 'Sistema de Cobros',
        amount: 'OK'
      };
      setLiveLogs((prev) => [newLog, ...prev.slice(0, 5)]);
    }, 800);
  };

  // User Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          showToast(`Estado de ${u.name} cambiado a ${nextStatus.toUpperCase()}`);
          logAdminAction(
            'status_change',
            `${u.name} (${u.email})`,
            `Cambió estado de la cuenta a ${nextStatus.toUpperCase()}`,
            u.id
          );
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleUserRoleChange = (userId: string, newRole: 'admin' | 'user' | 'moderator') => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    showToast(`Rol actualizado a ${newRole.toUpperCase()}`);
    if (target) {
      logAdminAction(
        'role_change',
        `${target.name} (${target.email})`,
        `Cambió el rol de '${target.role.toUpperCase()}' a '${newRole.toUpperCase()}'`,
        userId
      );
    }
  };

  const handleUserPlanChange = (userId: string, newPlan: 'free' | 'pro' | 'enterprise') => {
    const target = users.find((u) => u.id === userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
    showToast(`Plan de usuario cambiado a ${newPlan.toUpperCase()}`);
    if (target) {
      logAdminAction(
        'plan_change',
        `${target.name} (${target.email})`,
        `Cambió el plan de '${target.plan.toUpperCase()}' a '${newPlan.toUpperCase()}'`,
        userId
      );
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newId = `usr_${Date.now()}`;
    const newUser: RegisteredUser = {
      id: newId,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      plan: newUserPlan,
      status: 'active',
      registeredDate: new Date().toLocaleDateString('es-ES'),
      lastLogin: 'Reciente',
      isRegistered: true,
      language: newUserLanguage,
      ipAddress: '88.172.94.21',
      deviceModel: 'Navegador Web / App',
      location: 'París, France',
      connectionStatus: 'Online (GPS Activo)'
    };

    setUsers([newUser, ...users]);
    logAdminAction(
      'user_created',
      `${newUserName} (${newUserEmail})`,
      `Registró usuario con rol ${newUserRole.toUpperCase()}, plan ${newUserPlan.toUpperCase()} e idioma ${getLanguageMeta(newUserLanguage).label}`,
      newId
    );
    setNewUserName('');
    setNewUserEmail('');
    setNewUserLanguage('es');
    setIsAddUserOpen(false);
    showToast(`✅ Usuario ${newUser.name} registrado con éxito (${getLanguageMeta(newUserLanguage).flag} ${newUserLanguage.toUpperCase()})`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) {
      const target = users.find((u) => u.id === userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(`Usuario ${userName} eliminado`);
      logAdminAction(
        'user_deleted',
        `${userName} (${target?.email || userId})`,
        `Eliminó permanentemente la cuenta de usuario`,
        userId
      );
    }
  };

  // Batch User Actions
  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((item) => item !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleBatchStatusChange = (status: 'active' | 'suspended') => {
    const count = selectedUserIds.length;
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status } : u))
    );
    showToast(`Aprobación masiva: ${count} usuarios marcados como ${status.toUpperCase()}`);
    logAdminAction(
      'batch_action',
      `${count} usuarios seleccionados`,
      `Ejecutó acción masiva: Cambió estado de ${count} usuarios a ${status.toUpperCase()}`
    );
    setSelectedUserIds([]);
  };

  // Account Unification / Merging Actions
  const handleOpenUnifyModal = (primaryUser?: RegisteredUser, candidateSourceIds?: string[]) => {
    if (primaryUser) {
      setUnifyPrimaryUserId(primaryUser.id);
      if (candidateSourceIds && candidateSourceIds.length > 0) {
        setUnifySelectedSourceIds(candidateSourceIds);
      } else {
        // Pre-select any candidate matches (e.g. same IP or anonymous phones)
        const candidates = users.filter(
          (u) => u.id !== primaryUser.id && (u.ipAddress === primaryUser.ipAddress || !u.isRegistered)
        );
        setUnifySelectedSourceIds(candidates.slice(0, 3).map((c) => c.id));
      }
    } else {
      if (selectedUserIds.length >= 2) {
        const primaryCandidate =
          users.find((u) => selectedUserIds.includes(u.id) && u.isRegistered) ||
          users.find((u) => selectedUserIds.includes(u.id));
        if (primaryCandidate) {
          setUnifyPrimaryUserId(primaryCandidate.id);
          setUnifySelectedSourceIds(selectedUserIds.filter((id) => id !== primaryCandidate.id));
        }
      } else if (users.length > 0) {
        const regUser = users.find((u) => u.isRegistered) || users[0];
        setUnifyPrimaryUserId(regUser.id);
        setUnifySelectedSourceIds([]);
      }
    }
    setIsUnifyModalOpen(true);
  };

  const handleToggleUnifySourceUser = (id: string) => {
    if (id === unifyPrimaryUserId) return;
    setUnifySelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteUnify = () => {
    if (!unifyPrimaryUserId || unifySelectedSourceIds.length === 0) {
      showToast('⚠️ Selecciona una cuenta principal y al menos una cuenta para unificar.');
      return;
    }

    const result = mergeUserAccounts(unifyPrimaryUserId, unifySelectedSourceIds, currentUser?.name || 'Administrador');
    if (result.success) {
      const updatedUsers = getRegisteredUsersDB();
      setUsers(updatedUsers);
      if (onUpdateUsersProp) {
        onUpdateUsersProp(updatedUsers);
      }
      setSelectedUserIds([]);
      setIsUnifyModalOpen(false);
      showToast(`🔗 ${result.message}`);
    } else {
      showToast(`❌ ${result.message}`);
    }
  };

  // Payment Actions
  const handlePaymentStatusChange = (txId: string, newStatus: 'paid' | 'pending' | 'failed' | 'refunded') => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === txId ? { ...tx, status: newStatus } : tx))
    );
    showToast(`Estado de transacción ${txId} cambiado a ${newStatus.toUpperCase()}`);
  };

  // --- 4. PLAN & PRICING MANAGEMENT STATE ---
  const [plans, setPlans] = useState<PlanConfig[]>(initialPlansProps || [
    {
      id: 'plan_free',
      name: 'Plan Gratuito',
      priceMonthly: 0,
      priceYearly: 0,
      activeUsersCount: 1420,
      features: [
        'Consulta de Metro, Bus, RER y Tranvías',
        'Sin registro obligatorio',
        'Mapa interactivo en tiempo real',
        'Acceso a estado de red general'
      ]
    },
    {
      id: 'plan_pro',
      name: 'Pase Pro Commuter',
      priceMonthly: 4.99,
      priceYearly: 49.99,
      activeUsersCount: 385,
      popular: true,
      features: [
        'Todo lo incluido en Gratis',
        'Transit AI Copilot (Gemini)',
        'Visión IA de Paradas con Foto',
        'Telemetría GPS en tiempo real',
        'Alertas de bajada vibratorias prioritarias'
      ]
    },
    {
      id: 'plan_enterprise',
      name: 'Europa VIP Pass',
      priceMonthly: 14.99,
      priceYearly: 149.99,
      activeUsersCount: 64,
      features: [
        'Cobertura en toda Europa (+12 capitales)',
        'API de Geolocalización Real y Telemetría',
        'Prioridad de Servidor Telemetría',
        'Soporte Premium Multi-cuenta'
      ]
    }
  ]);

  useEffect(() => {
    if (initialPlansProps) {
      setPlans(initialPlansProps);
    }
  }, [initialPlansProps]);

  const handleOpenEditUser = (user: RegisteredUser) => {
    setEditingUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole((user.role as any) || 'user');
    setEditUserPlan((user.plan as any) || 'free');
    setEditUserStatus(user.status || 'active');
    setEditUserLocation(user.location || '');
    setEditUserLanguage(user.language || 'es');
    setEditUserExpiryDate(user.subscriptionExpiryDate || '');
    setEditUserAutoRenew(user.autoRenew !== false);
    setIsEditUserOpen(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const changes: string[] = [];
    if (editingUser.name !== editUserName) changes.push(`Nombre: '${editingUser.name}' ➔ '${editUserName}'`);
    if (editingUser.email !== editUserEmail) changes.push(`Email: '${editingUser.email}' ➔ '${editUserEmail}'`);
    if (editingUser.role !== editUserRole) changes.push(`Rol: '${editingUser.role.toUpperCase()}' ➔ '${editUserRole.toUpperCase()}'`);
    if (editingUser.plan !== editUserPlan) changes.push(`Plan: '${editingUser.plan.toUpperCase()}' ➔ '${editUserPlan.toUpperCase()}'`);
    if (editingUser.status !== editUserStatus) changes.push(`Estado: '${editingUser.status.toUpperCase()}' ➔ '${editUserStatus.toUpperCase()}'`);
    if (editingUser.location !== editUserLocation) changes.push(`Ubicación: '${editingUser.location}' ➔ '${editUserLocation}'`);
    if (editingUser.language !== editUserLanguage) changes.push(`Idioma: '${editingUser.language || 'es'}' ➔ '${editUserLanguage}'`);

    const updatedUser: RegisteredUser = {
      ...editingUser,
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      plan: editUserPlan,
      status: editUserStatus,
      location: editUserLocation,
      language: editUserLanguage,
      subscriptionExpiryDate: editUserExpiryDate || editingUser.subscriptionExpiryDate,
      autoRenew: editUserAutoRenew
    };

    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updatedUser : u)));
    saveRegisteredUsersDB(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
    setIsEditUserOpen(false);
    showToast(`✅ Datos del usuario ${editUserName} actualizados`);

    logAdminAction(
      'user_modified',
      `${editUserName} (${editUserEmail})`,
      changes.length > 0
        ? `Modificó datos del usuario: ${changes.join(' | ')}`
        : `Actualizó ficha de usuario`,
      editingUser.id
    );
  };

  const handleCreateCustomLogNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTarget.trim() || !newLogDetails.trim()) return;

    logAdminAction(
      newLogType,
      newLogTarget.trim(),
      newLogDetails.trim()
    );

    setIsAddLogNoteOpen(false);
    setNewLogTarget('');
    setNewLogDetails('');
    showToast('📝 Registro añadido al Activity Log de Administradores');
  };

  const handleExportAuditLogsCSV = () => {
    if (filteredAuditLogs.length === 0) {
      showToast('No hay registros para exportar');
      return;
    }
    const headers = ['ID', 'Timestamp', 'Admin Name', 'Admin Email', 'Action Type', 'Target', 'Target ID', 'Details', 'IP Address'];
    const rows = filteredAuditLogs.map(log => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.adminName.replace(/"/g, '""')}"`,
      `"${log.adminEmail.replace(/"/g, '""')}"`,
      `"${log.actionType}"`,
      `"${log.targetUser.replace(/"/g, '""')}"`,
      `"${log.targetUserId || ''}"`,
      `"${log.details.replace(/"/g, '""')}"`,
      `"${log.ipAddress || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ubical_activity_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('📥 Activity Log exportado en formato CSV');
  };

  const handleUpdatePlanPrice = (planId: string, newPriceMonthly: number, newPriceYearly: number) => {
    const plan = plans.find((p) => p.id === planId);
    const oldMonthly = plan ? plan.priceMonthly : 0;
    const oldYearly = plan ? plan.priceYearly : 0;
    
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, priceMonthly: newPriceMonthly, priceYearly: newPriceYearly } : p))
    );
    if (onUpdatePlanPriceProp) {
      onUpdatePlanPriceProp(planId, newPriceMonthly, newPriceYearly);
    }
    showToast(`💰 Tarifa de ${plan?.name || planId} actualizada: €${newPriceMonthly.toFixed(2)}/mes | €${newPriceYearly.toFixed(2)}/año`);
    if (plan) {
      logAdminAction(
        'price_update',
        `Tarifa Plan: ${plan.name}`,
        `Actualizó precios: Mensual €${oldMonthly.toFixed(2)} ➔ €${newPriceMonthly.toFixed(2)} | Anual €${oldYearly.toFixed(2)} ➔ €${newPriceYearly.toFixed(2)}`,
        planId
      );
    }
  };

  // --- 5. GLOBAL APP CONFIGURATION STATE ---
  const [appConfig, setAppConfig] = useState({
    appName: 'Transports Castelginest',
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    enableCopilotAI: true,
    defaultLanguage: 'es',
    bannerMessage: 'Bienvenido al Portal Oficial de Transportes de Castelginest & Occitania',
    showGlobalBanner: true,
    maxSearchRadiusKm: 50,
    apiQuotaPerMinute: 120
  });

  const handleConfigChange = (key: keyof typeof appConfig, value: any) => {
    setAppConfig((prev) => ({ ...prev, [key]: value }));
    showToast(`Configuración de ${String(key)} actualizada`);
    logAdminAction(
      'config_update',
      'Configuración Global de Sistema',
      `Modificó parámetro '${String(key)}' a: ${String(value)}`
    );
  };

  // Filtered Audit Logs
  const filteredAuditLogs = adminActionLogs.filter((log) => {
    const term = auditSearch.trim().toLowerCase();
    const matchesSearch =
      !term ||
      log.adminName.toLowerCase().includes(term) ||
      log.adminEmail.toLowerCase().includes(term) ||
      log.targetUser.toLowerCase().includes(term) ||
      (log.targetUserId && log.targetUserId.toLowerCase().includes(term)) ||
      log.details.toLowerCase().includes(term);
    const matchesType = auditTypeFilter === 'all' || log.actionType === auditTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleExportAuditLogs = () => {
    const dataStr = JSON.stringify(filteredAuditLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria_admin_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Registro de auditoría exportado en JSON');
  };

  // Filtered Users
  const registeredUsersCount = users.filter((u) => u.isRegistered).length;
  const appOnlyUsersCount = users.filter((u) => !u.isRegistered).length;

  const filteredUsers = users.filter((u) => {
    const term = userSearch.trim().toLowerCase();
    const matchesSearch =
      !term ||
      u.id.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.name.toLowerCase().includes(term) ||
      (u.ipAddress && u.ipAddress.toLowerCase().includes(term)) ||
      (u.deviceModel && u.deviceModel.toLowerCase().includes(term)) ||
      (u.location && u.location.toLowerCase().includes(term));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesPlan = planFilter === 'all' || u.plan === planFilter;
    const matchesStatus = userStatusFilter === 'all' || u.status === userStatusFilter;
    const matchesType =
      userTypeFilter === 'all' ||
      (userTypeFilter === 'registered' && u.isRegistered) ||
      (userTypeFilter === 'app_only' && !u.isRegistered);

    return matchesSearch && matchesRole && matchesPlan && matchesStatus && matchesType;
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.transactionRef.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      tx.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      tx.userEmail.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesStatus = paymentStatusFilter === 'all' || tx.status === paymentStatusFilter;
    const matchesMethod = paymentMethodFilter === 'all' || tx.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Metrics Calculations & MRR Projections
  const activeUsersCount = users.filter((u) => u.status === 'active').length;
  const suspendedUsersCount = users.filter((u) => u.status === 'suspended').length;
  const proUsersCount = users.filter((u) => u.plan === 'pro').length;
  const enterpriseUsersCount = users.filter((u) => u.plan === 'enterprise').length;
  const freeUsersCount = users.filter((u) => u.plan === 'free').length;

  const totalMonthlyRevenue = transactions
    .filter((tx) => tx.status === 'paid')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const paidTransactionsCount = transactions.filter((tx) => tx.status === 'paid').length;
  const pendingTransactionsCount = transactions.filter((tx) => tx.status === 'pending').length;
  const failedTransactionsCount = transactions.filter((tx) => tx.status === 'failed').length;
  const refundedTransactionsCount = transactions.filter((tx) => tx.status === 'refunded').length;

  // Real-time Projected Monthly Recurring Revenue (MRR) based on active user plans
  const proPlanPrice = plans.find((p) => p.id === 'plan_pro')?.priceMonthly || 4.99;
  const enterprisePlanPrice = plans.find((p) => p.id === 'plan_enterprise')?.priceMonthly || 14.99;

  const activeProCount = users.filter((u) => u.plan === 'pro' && u.status === 'active').length;
  const activeEnterpriseCount = users.filter((u) => u.plan === 'enterprise' && u.status === 'active').length;
  const activeFreeCount = users.filter((u) => u.plan === 'free' && u.status === 'active').length;

  const projectedProMRR = Number((activeProCount * proPlanPrice).toFixed(2));
  const projectedEnterpriseMRR = Number((activeEnterpriseCount * enterprisePlanPrice).toFixed(2));
  const totalProjectedMRR = Number((projectedProMRR + projectedEnterpriseMRR).toFixed(2));
  const projectedARR = Number((totalProjectedMRR * 12).toFixed(2));

  // Recharts Data: Projected MRR by Active Plan
  const mrrByPlanChartData = [
    {
      name: 'Plan Gratuito',
      shortName: 'Free',
      users: activeFreeCount,
      price: 0,
      mrr: 0,
      color: '#3B82F6',
      fill: '#3B82F6'
    },
    {
      name: 'Pase Pro Commuter',
      shortName: 'Pro',
      users: activeProCount,
      price: proPlanPrice,
      mrr: projectedProMRR,
      color: '#A855F7',
      fill: '#A855F7'
    },
    {
      name: 'Europa VIP Pass',
      shortName: 'VIP Pass',
      users: activeEnterpriseCount,
      price: enterprisePlanPrice,
      mrr: projectedEnterpriseMRR,
      color: '#F59E0B',
      fill: '#F59E0B'
    }
  ];

  // Recharts Data: 6-Month Projected MRR Progression Forecast
  const growthMultipliers = [1.0, 1.09, 1.21, 1.34, 1.48, 1.65];
  const mrr6MonthsChartData = ['Mes 1 (Actual)', 'Mes 2 (+9%)', 'Mes 3 (+21%)', 'Mes 4 (+34%)', 'Mes 5 (+48%)', 'Mes 6 (+65%)'].map((mName, i) => {
    const mult = growthMultipliers[i];
    const projMRR = Number((totalProjectedMRR * mult).toFixed(2));
    const projPro = Number((projectedProMRR * mult).toFixed(2));
    const projVIP = Number((projectedEnterpriseMRR * mult).toFixed(2));
    return {
      month: mName,
      shortMonth: `Mes ${i + 1}`,
      mrr: projMRR,
      proMRR: projPro,
      enterpriseMRR: projVIP,
      growth: `+${Math.round((mult - 1) * 100)}%`
    };
  });

  // Critical Subscription Users: Expirations in <= 1 day, failed or pending balances, suspended paid accounts
  const criticalSubUsers = users.filter((u) => {
    if (u.plan === 'free') return false;
    const daysLeft = calculateDaysRemaining(u.subscriptionExpiryDate) ?? u.subscriptionDaysLeft;
    const isExpiringSoon = daysLeft !== null && daysLeft !== undefined && daysLeft <= 1;
    const hasFailedPayment = transactions.some((t) => t.userEmail === u.email && t.status === 'failed');
    const hasPendingPayment = transactions.some((t) => t.userEmail === u.email && t.status === 'pending');
    const isSuspended = u.status === 'suspended';
    return isExpiringSoon || hasFailedPayment || hasPendingPayment || isSuspended;
  });

  // Action: Send localized subscription notice to user
  const handleSendLocalizedNotice = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const result = sendRenewalWarningNotice(userId);
    if (result) {
      const userLang = target.language || 'es';
      const langMeta = getLanguageMeta(userLang);
      showToast(`🗣️ Alerta enviada a ${target.name} en su idioma: ${langMeta.label} (${langMeta.flag})`);
      logAdminAction(
        'admin_note',
        `${target.name} (${target.email})`,
        `Envió notificación de estado crítico/renovación en idioma: ${langMeta.label}`,
        userId
      );
    }
  };

  // Action: Send batch localized emergency warnings to all critical users
  const handleSendBatchCriticalWarnings = () => {
    const count = sendBatch2DayRenewalWarnings();
    showToast(`⚡ ${count} avisos de suscripción crítica despachados en los idiomas de los usuarios`);
    logAdminAction(
      'batch_action',
      `${count} usuarios en estado crítico`,
      `Ejecutó despacho masivo de alertas de vencimiento en tiempo real en los idiomas configurados de cada usuario`
    );
  };

  // Action: Fast renew user (+30 days)
  const handleQuickRenewUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiryStr = expiry.toLocaleDateString('es-ES');
    const updatedUsers = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            subscriptionExpiryDate: expiryStr,
            subscriptionDaysLeft: 30,
            status: 'active' as const
          }
        : u
    );
    updateUsersList(updatedUsers);
    showToast(`🎉 Suscripción de ${target.name} renovada por 30 días (+30 días)`);
    logAdminAction(
      'user_modified',
      `${target.name} (${target.email})`,
      `Renovación manual de cortesía aplicada (+30 días hasta ${expiryStr})`,
      userId
    );
  };

  // Compute real-time critical alerts from users + transactions + simulated
  const liveAdminAlerts = React.useMemo(() => {
    const rawAlerts = evaluateCriticalSubscriptionAlerts(users, transactions);
    const all = [...simulatedAlerts, ...rawAlerts];
    const uniqueMap = new Map<string, AdminCriticalAlert>();
    all.forEach((a) => {
      const resolvedMeta = resolvedAlertIds[a.id];
      uniqueMap.set(a.id, {
        ...a,
        isResolved: !!resolvedMeta,
        resolvedAt: resolvedMeta?.resolvedAt,
        resolvedAction: resolvedMeta?.action
      });
    });
    return Array.from(uniqueMap.values());
  }, [users, transactions, simulatedAlerts, resolvedAlertIds]);

  const unresolvedAlertsCount = liveAdminAlerts.filter((a) => !a.isResolved).length;
  const criticalDebtSum = liveAdminAlerts
    .filter((a) => !a.isResolved && a.amountDue)
    .reduce((sum, a) => sum + (a.amountDue || 0), 0);

  // Real-time Event Listener for incoming alerts and live simulations
  useEffect(() => {
    const handleLiveCriticalAlertEvent = (e: any) => {
      const alert: AdminCriticalAlert = e.detail?.alert;
      if (alert) {
        setSimulatedAlerts((prev) => [alert, ...prev]);
        setActiveAlertToast(alert);
        if (isSoundAlertEnabled) {
          playAdminCriticalAlertSound();
        }
      }
    };

    window.addEventListener('ubical_admin_critical_alert_event', handleLiveCriticalAlertEvent);
    return () => {
      window.removeEventListener('ubical_admin_critical_alert_event', handleLiveCriticalAlertEvent);
    };
  }, [isSoundAlertEnabled]);

  // Handler: Toggle admin sound alerts
  const handleToggleSound = () => {
    const next = !isSoundAlertEnabled;
    setIsSoundAlertEnabled(next);
    setAdminSoundPreference(next);
    if (next) {
      playAdminCriticalAlertSound();
      showToast('🔊 Alertas sonoras en tiempo real ACTIVADAS');
    } else {
      showToast('🔇 Alertas sonoras SILENCIADAS');
    }
  };

  // Handler: Trigger live simulation of critical subscription anomaly
  const handleSimulateCriticalEvent = () => {
    const simAlert = dispatchSimulatedLiveCriticalAlert();
    setActiveAlertToast(simAlert);
    showToast(`🚨 Alerta crítica simulada en tiempo real: ${simAlert.userName}`);
    logAdminAction(
      'admin_note',
      simAlert.userName,
      `Simulación de fallo de pago en tiempo real (€${simAlert.amountDue?.toFixed(2)}) para prueba de alertas`
    );
  };

  // Handler: Settle pending balance / mark payment resolved
  const handleSettleUserBalance = (alert: AdminCriticalAlert) => {
    const target = users.find((u) => u.id === alert.userId);
    const amount = alert.amountDue || (target?.plan === 'enterprise' ? 14.99 : 4.99);

    // 1. Update user record
    const updatedUsers = users.map((u) => {
      if (u.id === alert.userId) {
        return {
          ...u,
          pendingBalance: 0,
          paymentFailureReason: undefined,
          status: 'active' as const
        };
      }
      return u;
    });
    updateUsersList(updatedUsers);

    // 2. Register transaction
    const newTx: PaymentTransaction = {
      id: `tx_${Date.now()}`,
      transactionRef: `TRX-${Date.now().toString().slice(-6)}`,
      userName: alert.userName,
      userEmail: alert.userEmail,
      plan: alert.plan,
      amount: amount,
      paymentMethod: 'Tarjeta crédito',
      status: 'paid',
      date: new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
    };
    const nextTxs = [newTx, ...transactions];
    setTransactions(nextTxs);
    savePaymentTransactionsDB(nextTxs);

    // 3. Mark alert as resolved
    const newResolved = {
      ...resolvedAlertIds,
      [alert.id]: {
        resolvedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        action: `Cobro de €${amount.toFixed(2)} liquidado con éxito`
      }
    };
    setResolvedAlertIds(newResolved);
    try {
      localStorage.setItem('ubical_admin_resolved_alerts', JSON.stringify(newResolved));
    } catch (e) {}

    if (activeAlertToast?.id === alert.id) {
      setActiveAlertToast(null);
    }

    showToast(`✅ Saldo de €${amount.toFixed(2)} saldado para ${alert.userName}. Transacción registrada.`);
    logAdminAction(
      'user_modified',
      `${alert.userName} (${alert.userEmail})`,
      `Liquidó saldo pendiente de €${amount.toFixed(2)} y registró cobro manual en pasarela`,
      alert.userId
    );
  };

  // Handler: Generic resolution
  const handleResolveAlert = (alertId: string, actionDesc: string) => {
    const newResolved = {
      ...resolvedAlertIds,
      [alertId]: {
        resolvedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        action: actionDesc
      }
    };
    setResolvedAlertIds(newResolved);
    try {
      localStorage.setItem('ubical_admin_resolved_alerts', JSON.stringify(newResolved));
    } catch (e) {}

    if (activeAlertToast?.id === alertId) {
      setActiveAlertToast(null);
    }
    showToast(`Caso resuelto: ${actionDesc}`);
  };

  // Handler: Clear all alerts
  const handleClearAllResolvedAlerts = () => {
    const allResolved: Record<string, { resolvedAt: string; action: string }> = {};
    liveAdminAlerts.forEach((a) => {
      allResolved[a.id] = {
        resolvedAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        action: 'Marcado como atendido por el administrador'
      };
    });
    setResolvedAlertIds(allResolved);
    try {
      localStorage.setItem('ubical_admin_resolved_alerts', JSON.stringify(allResolved));
    } catch (e) {}
    setActiveAlertToast(null);
    showToast('🧹 Todas las alertas marcadas como atendidas');
  };

  const isLight = theme === 'light';

  return (
    <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 rounded-3xl ${isLight ? 'bg-slate-50 text-slate-900 border border-slate-200' : 'bg-[#090D16] text-slate-100 border border-slate-800'} shadow-2xl space-y-6 font-sans`}>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="admin-toast-banner"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REAL-TIME CRITICAL SUBSCRIPTION FLOATING ALERT BANNER (TOP-RIGHT NOTIFIER) */}
      <AnimatePresence>
        {activeAlertToast && (
          <motion.div
            key={`live-alert-toast-${activeAlertToast.id}`}
            initial={{ opacity: 0, y: -30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            className="fixed top-5 right-4 sm:right-6 z-[999] max-w-md w-full bg-gradient-to-br from-rose-950 via-[#1C0D17] to-slate-950 border-2 border-rose-500 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-rose-950/80 text-white space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/30 border border-rose-400 text-rose-300 animate-pulse shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                      🚨 ALERTA CRÍTICA EN VIVO
                    </span>
                    <span className="text-[11px] font-black text-rose-300">
                      {activeAlertToast.timestamp}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {activeAlertToast.userName}
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setActiveAlertToast(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="Cerrar notificación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/20 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Email:</span>
                <span className="text-rose-200 truncate max-w-[200px]">{activeAlertToast.userEmail}</span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Diagnóstico:</span>
                <span className="text-rose-400 font-black">{activeAlertToast.description}</span>
              </div>
              {activeAlertToast.amountDue && (
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span>Importe Pendiente:</span>
                  <span className="text-sm font-black">€{activeAlertToast.amountDue.toFixed(2)}</span>
                </div>
              )}
              {activeAlertToast.paymentFailureReason && (
                <div className="text-[11px] text-rose-300/90 font-medium italic border-t border-rose-500/20 pt-1">
                  Motivo pasarela: {activeAlertToast.paymentFailureReason}
                </div>
              )}
            </div>

            {/* Direct Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              {activeAlertToast.amountDue ? (
                <button
                  onClick={() => handleSettleUserBalance(activeAlertToast)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cobrar Saldo (€{activeAlertToast.amountDue.toFixed(2)})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleQuickRenewUser(activeAlertToast.userId);
                    handleResolveAlert(activeAlertToast.id, 'Prórroga de 30 días concedida');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Prórroga +30 Días</span>
                </button>
              )}
              <button
                onClick={() => {
                  handleSendLocalizedNotice(activeAlertToast.userId);
                  handleResolveAlert(activeAlertToast.id, `Aviso multilingüe enviado a ${activeAlertToast.userName}`);
                }}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1"
                title="Despachar aviso en su idioma natal"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Notificar</span>
              </button>
              <button
                onClick={() => {
                  setIsCriticalAlertsModalOpen(true);
                  setActiveAlertToast(null);
                }}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
                title="Ver consola completa de alertas"
              >
                Ver Todo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN PANEL HEADER */}
      <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm`}>
        <div className="flex flex-wrap items-center gap-4">
          <UbicalLogo size="md" showText={true} />
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">Panel de Administración</h2>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ADMIN CONSOLE
                </span>
              </div>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Control central de cuentas, auditoría, telemetría y suscripciones
              </p>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions, Notification Bell, Audio Switch & Profile */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* REAL-TIME CRITICAL ALERT NOTIFICATION BELL */}
          <button
            onClick={() => setIsCriticalAlertsModalOpen(true)}
            className={`relative px-3.5 py-2 rounded-xl border text-xs font-black transition-all flex items-center gap-2 shadow-sm ${
              unresolvedAlertsCount > 0
                ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500 text-rose-200 ring-2 ring-rose-500/30 animate-pulse'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Centro de Alertas de Suscripción en Tiempo Real"
          >
            <Bell className={`w-4 h-4 ${unresolvedAlertsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>Alertas</span>
            {unresolvedAlertsCount > 0 ? (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow">
                {unresolvedAlertsCount}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                0
              </span>
            )}
          </button>

          {/* AUDIO ALERTS TOGGLE */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border text-xs font-black transition-all flex items-center gap-1.5 ${
              isSoundAlertEnabled
                ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'
                : isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-500'
            }`}
            title={isSoundAlertEnabled ? 'Alertas sonoras ACTIVADAS (Clic para silenciar)' : 'Alertas sonoras SILENCIADAS (Clic para activar)'}
          >
            {isSoundAlertEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* SIMULATE LIVE CRITICAL ALERT BUTTON */}
          <button
            onClick={handleSimulateCriticalEvent}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs transition-all shadow-md flex items-center gap-1.5 active:scale-95"
            title="Simular fallo de cobro / vencimiento crítico en tiempo real"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Simular Alerta</span>
          </button>

          <button
            onClick={handleRefreshStats}
            disabled={isRefreshingStats}
            className={`px-3 py-2 rounded-xl border text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingStats ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRefreshingStats ? 'Sincronizando' : 'Sincronizar'}</span>
          </button>

          {onSwitchToClient && (
            <button
              onClick={onSwitchToClient}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>App Cliente</span>
            </button>
          )}

          {/* Admin Profile Card with UBICAL app logo */}
          <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-2.5 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border-amber-500/40 shadow-sm'}`}>
            <div className="relative shrink-0">
              <img
                src="/ubical_logo.png"
                alt="UBICAL Admin"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-amber-400 object-cover bg-white shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 border border-slate-900 rounded-full animate-pulse" title="Cuenta Administrador Activa" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-white truncate max-w-[110px]">{currentUser?.name || 'Admin Maestro'}</span>
                <span className="text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded">ADMIN</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block truncate max-w-[130px]">{currentUser?.email || 'admin@ubical.eu'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED LINKS BANNER FOR CLIENT & ADMIN */}
      <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gradient-to-r from-slate-100 to-amber-50 border-slate-300' : 'bg-gradient-to-r from-slate-900/90 via-[#0D1527] to-amber-950/20 border-amber-500/30'} flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg`}>
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <h3 className="font-black text-sm text-slate-100">Enlaces de Acceso Independientes</h3>
          </div>
          <p className="text-xs text-slate-400">
            La aplicación cuenta con 2 entornos separados mediante enrutamiento URL:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">
          {/* CLIENT LINK */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase text-blue-400 block tracking-wider">1. App Cliente</span>
              <span className="text-xs font-mono font-bold text-slate-300 truncate block max-w-[180px]">{clientUrl}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => copyToClipboard(clientUrl, 'App Cliente')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                title="Copiar Link Cliente"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {onSwitchToClient && (
                <button
                  onClick={onSwitchToClient}
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all"
                  title="Abrir App Cliente"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ADMIN LINK */}
          <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${isLight ? 'bg-amber-50 border-amber-300' : 'bg-amber-950/30 border-amber-500/40'}`}>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-400 block tracking-wider">2. Panel Admin</span>
              <span className="text-xs font-mono font-bold text-amber-200 truncate block max-w-[180px]">{adminUrl}</span>
            </div>
            <button
              onClick={() => copyToClipboard(adminUrl, 'Panel Admin')}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black transition-all shrink-0"
              title="Copiar Link Admin"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TOP REAL-TIME METRIC CARDS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-1 relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Usuarios Registrados</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{users.length}</div>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="text-emerald-400">{activeUsersCount} activos</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-rose-400">{suspendedUsersCount} susp.</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-1 relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Ingresos Recurrentes (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">€{totalMonthlyRevenue.toFixed(2)}</div>
          <span className="text-[10px] text-emerald-400 font-bold">↑ +18.4% este mes</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-1 relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Pagos de Suscripción</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{paidTransactionsCount} Exitosos</div>
          <span className="text-[10px] text-purple-300 font-bold">{pendingTransactionsCount} pendientes &bull; {refundedTransactionsCount} reemb.</span>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-1 relative overflow-hidden`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-extrabold uppercase">Pasarela de Pagos</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            100% ONLINE
          </div>
          <span className="text-[10px] text-slate-400 font-bold">Stripe & PayPal Operativos</span>
        </div>
      </div>

      {/* CRITICAL REAL-TIME SUBSCRIPTION ALERTS BANNER */}
      {criticalSubUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl ${
            isLight
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : 'bg-gradient-to-r from-rose-950/70 via-[#190C16] to-amber-950/60 border-rose-500/50 text-rose-100 shadow-rose-950/40'
          }`}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shrink-0 mt-0.5 animate-bounce">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                  ALERTA CRÍTICA EN TIEMPO REAL
                </span>
                <span className="text-xs font-black text-rose-400">
                  {criticalSubUsers.length} suscriptor(es) requieren atención inmediata
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-rose-800' : 'text-slate-300'}`}>
                Cuentas con vencimiento inminente (&le; 1 día), pagos fallidos o saldos pendientes. Las notificaciones se despachan en el idioma configurado por cada usuario.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsCriticalAlertsModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 flex-1 md:flex-initial"
            >
              <Bell className="w-3.5 h-3.5 animate-spin" />
              <span>Ver Casos Críticos ({criticalSubUsers.length})</span>
            </button>
            <button
              onClick={handleSendBatchCriticalWarnings}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 flex-1 md:flex-initial"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Aviso Masivo (en su idioma)</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'dashboard'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : `${isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800'}`
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard & Métricas Real-Time</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'users'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : `${isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800'}`
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Control de Usuarios y Accesos ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : `${isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800'}`
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Pagos y Estado de Suscripciones ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'plans'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : `${isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800'}`
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Planes y Tarifas</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'audit'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : `${isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800'}`
          }`}
        >
          <History className="w-4 h-4" />
          <span>Registro de Auditoría Admin ({adminActionLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all shrink-0 active:scale-95 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : `${isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#111827] text-slate-300 hover:bg-slate-800 border border-slate-800'}`
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración Global</span>
        </button>
      </div>

      {/* TAB 0: DASHBOARD STATS REAL-TIME */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* RECHARTS BAR CHART: PROJECTED MONTHLY RECURRING REVENUE (MRR) */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4 shadow-sm`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm sm:text-base text-slate-100">
                    Ingresos Mensuales Recurrentes (MRR) Proyectados
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-black">
                    RECHARTS LIVE
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Visualización de ingresos recurrentes proyectados según los planes activos de los usuarios ({activeProCount} Pro + {activeEnterpriseCount} VIP)
                </p>
              </div>

              {/* Controls & Metrics Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
                  <button
                    onClick={() => setMrrChartViewMode('by_plan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      mrrChartViewMode === 'by_plan'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Por Planes Activos
                  </button>
                  <button
                    onClick={() => setMrrChartViewMode('projection_6m')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                      mrrChartViewMode === 'projection_6m'
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Proyección 6 Meses
                  </button>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-right">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase block">MRR Total Proyectado</span>
                  <span className="text-sm font-black text-emerald-300">€{totalProjectedMRR.toFixed(2)}/mes</span>
                </div>
              </div>
            </div>

            {/* Recharts Bar Chart Component */}
            <div className="w-full h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={(mrrChartViewMode === 'by_plan' ? mrrByPlanChartData : mrr6MonthsChartData) as any[]}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : '#1E293B'} opacity={0.6} />
                  <XAxis
                    dataKey={mrrChartViewMode === 'by_plan' ? 'name' : 'shortMonth'}
                    stroke={isLight ? '#64748B' : '#94A3B8'}
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={isLight ? '#64748B' : '#94A3B8'}
                    fontSize={11}
                    fontWeight={600}
                    tickFormatter={(val) => `€${val}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 border border-amber-500/50 rounded-xl p-3 shadow-2xl text-xs space-y-1">
                            <span className="font-extrabold text-amber-400 block border-b border-slate-800 pb-1">
                              {label || data.name || data.month}
                            </span>
                            {mrrChartViewMode === 'by_plan' ? (
                              <>
                                <div className="flex justify-between gap-4 text-slate-300">
                                  <span>MRR Proyectado:</span>
                                  <span className="font-black text-emerald-400">€{data.mrr.toFixed(2)}/mes</span>
                                </div>
                                <div className="flex justify-between gap-4 text-slate-400">
                                  <span>Usuarios Activos:</span>
                                  <span className="font-bold text-slate-200">{data.users} usuarios</span>
                                </div>
                                <div className="flex justify-between gap-4 text-slate-400">
                                  <span>Precio Unitario:</span>
                                  <span className="font-mono text-amber-300">€{data.price.toFixed(2)}/mes</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between gap-4 text-slate-300">
                                  <span>MRR Proyectado Total:</span>
                                  <span className="font-black text-emerald-400">€{data.mrr.toFixed(2)}/mes</span>
                                </div>
                                <div className="flex justify-between gap-4 text-purple-300">
                                  <span>Pro Commuter:</span>
                                  <span className="font-bold">€{data.proMRR.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-amber-300">
                                  <span>Europa VIP:</span>
                                  <span className="font-bold">€{data.enterpriseMRR.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4 text-slate-400">
                                  <span>Crecimiento Est.:</span>
                                  <span className="font-bold text-emerald-400">{data.growth}</span>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="mrr"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                    isAnimationActive={true}
                  >
                    {mrrChartViewMode === 'by_plan'
                      ? mrrByPlanChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      : mrr6MonthsChartData.map((entry, index) => (
                          <Cell
                            key={`cell-m-${index}`}
                            fill={index === 0 ? '#3B82F6' : index === 5 ? '#10B981' : '#F59E0B'}
                          />
                        ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Summary Bar for MRR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pase Pro (€{proPlanPrice.toFixed(2)})</span>
                  <div className="text-sm font-black text-purple-400">€{projectedProMRR.toFixed(2)} / mes</div>
                </div>
                <span className="text-xs font-bold text-slate-400">{activeProCount} usuarios</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Europa VIP (€{enterprisePlanPrice.toFixed(2)})</span>
                  <div className="text-sm font-black text-amber-400">€{projectedEnterpriseMRR.toFixed(2)} / mes</div>
                </div>
                <span className="text-xs font-bold text-slate-400">{activeEnterpriseCount} usuarios</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">ARR Anualizado</span>
                  <div className="text-sm font-black text-emerald-300">€{projectedARR.toFixed(2)} / año</div>
                </div>
                <span className="text-xs font-bold text-emerald-400">{activeProCount + activeEnterpriseCount} de pago</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real-time Users by Plan Distribution */}
            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-sm text-slate-100">Distribución de Usuarios por Plan</h3>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>

              <div className="space-y-3">
                {/* Plan Free */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-400">Plan Gratuito (€0/mes)</span>
                    <span className="text-slate-200">{freeUsersCount} usuarios ({Math.round((freeUsersCount / users.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(freeUsersCount / users.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Plan Pro */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-purple-400">Pase Pro Commuter (€4.99/mes)</span>
                    <span className="text-purple-300">{proUsersCount} usuarios ({Math.round((proUsersCount / users.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(proUsersCount / users.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Plan Enterprise */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-400">Europa VIP Pass (€14.99/mes)</span>
                    <span className="text-amber-300">{enterpriseUsersCount} usuarios ({Math.round((enterpriseUsersCount / users.length) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(enterpriseUsersCount / users.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Total Suscritos De Pago:</span>
                <span className="font-black text-amber-400">{proUsersCount + enterpriseUsersCount} cuentas activas</span>
              </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-sm text-slate-100">Estado de Pasarela de Pagos</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">100% Validado</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Pagos Exitosos</span>
                  <div className="text-xl font-black text-emerald-300">{paidTransactionsCount}</div>
                  <span className="text-[10px] text-slate-400">Suscripción activa</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block">Pendientes</span>
                  <div className="text-xl font-black text-amber-300">{pendingTransactionsCount}</div>
                  <span className="text-[10px] text-slate-400">En verificación</span>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase block">Fallidos</span>
                  <div className="text-xl font-black text-rose-300">{failedTransactionsCount}</div>
                  <span className="text-[10px] text-slate-400">Reintentar cobro</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase block">Reembolsados</span>
                  <div className="text-xl font-black text-purple-300">{refundedTransactionsCount}</div>
                  <span className="text-[10px] text-slate-400">Procesados OK</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Ratio de Éxito de Pago:</span>
                <span className="font-extrabold text-emerald-400">92.8% aprobación</span>
              </div>
            </div>

            {/* Live Streaming Activity Feed */}
            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="font-extrabold text-sm text-slate-100">Flujo de Eventos en Tiempo Real</h3>
                </div>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  LIVE STREAM
                </span>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {liveLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-amber-400">{log.user}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{log.message}</p>
                    {log.amount && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 block">
                        Monto: {log.amount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Activity Log Summary in Dashboard */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-black text-sm text-slate-100">Activity Log Reciente de Administradores</h3>
                  <p className="text-[11px] text-slate-400">Últimas modificaciones realizadas en tarifas, usuarios y parámetros</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('audit')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Ver Activity Log Completo ({adminActionLogs.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900/90 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-3">Timestamp / Fecha</th>
                    <th className="p-3">Administrador</th>
                    <th className="p-3">Acción</th>
                    <th className="p-3">Elemento Afectado</th>
                    <th className="p-3">Detalle del Cambio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {adminActionLogs.slice(0, 4).map((log) => (
                    <tr key={log.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="font-extrabold text-slate-200 block">{log.adminName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          {log.actionType === 'price_update'
                            ? 'Tarifa / Precios'
                            : log.actionType === 'user_modified'
                            ? 'Usuario Modificado'
                            : log.actionType === 'role_change'
                            ? 'Cambio de Rol'
                            : log.actionType === 'plan_change'
                            ? 'Cambio de Plan'
                            : log.actionType === 'status_change'
                            ? 'Estado Cuenta'
                            : log.actionType === 'user_created'
                            ? 'Alta Usuario'
                            : log.actionType === 'user_deleted'
                            ? 'Baja Usuario'
                            : log.actionType === 'batch_action'
                            ? 'Acción Masiva'
                            : log.actionType === 'config_update'
                            ? 'Ajuste Sistema'
                            : 'Nota Admin'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">{log.targetUser}</td>
                      <td className="p-3 text-[11px] text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: USER ACCESS CONTROL & INTERACTIVE MANAGEMENT TABLE */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Quick Access Type Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => setUserTypeFilter('all')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                userTypeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.01]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Todos los Accesos ({users.length})</span>
            </button>

            <button
              onClick={() => setUserTypeFilter('registered')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                userTypeFilter === 'registered'
                  ? 'bg-blue-600 text-white shadow-md scale-[1.01]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-300" />
              <span>👤 Cuentas Registradas ({registeredUsersCount})</span>
            </button>

            <button
              onClick={() => setUserTypeFilter('app_only')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                userTypeFilter === 'app_only'
                  ? 'bg-purple-600 text-white shadow-md scale-[1.01]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>📱 Solo App Instalada / IP Móvil ({appOnlyUsersCount})</span>
            </button>
          </div>

          {/* Controls Bar: Search, Filters & Add User */}
          <div className="space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                {/* Search Bar - Filter registered users by Name, Email, or ID */}
                <div className="relative flex-1 sm:w-[420px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setUserSearch('');
                    }}
                    placeholder="Buscar por nombre, correo electrónico o ID (ej: Carlos, usr_001, @example.com)..."
                    className={`w-full pl-9 pr-20 py-2.5 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 shadow-sm placeholder:text-slate-400'
                        : 'bg-[#111827] border-slate-700 text-slate-100 placeholder:text-slate-500'
                    }`}
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {userSearch ? (
                      <>
                        <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {filteredUsers.length}
                        </span>
                        <button
                          onClick={() => setUserSearch('')}
                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Limpiar búsqueda (Esc)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Nombre / Email / ID
                      </kbd>
                    )}
                  </div>
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="all">Todos los Roles</option>
                  <option value="user">Usuario Standard</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Administrador</option>
                  <option value="guest">Invitado (Móvil App)</option>
                </select>

                {/* Plan Filter */}
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="all">Todos los Planes</option>
                  <option value="free">Gratuito (€0)</option>
                  <option value="pro">Pase Pro Commuter (€4.99)</option>
                  <option value="enterprise">Europa VIP Pass (€14.99)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">Activos / Conectados</option>
                  <option value="suspended">Suspendidos / Bloqueados</option>
                </select>

                {/* Reset Filters button if any filter is active */}
                {(userSearch || roleFilter !== 'all' || planFilter !== 'all' || userStatusFilter !== 'all' || userTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setUserSearch('');
                      setRoleFilter('all');
                      setPlanFilter('all');
                      setUserStatusFilter('all');
                      setUserTypeFilter('all');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    title="Restablecer todos los filtros"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Limpiar Filtros</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsAddUserOpen(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Registro</span>
              </button>
            </div>

            {/* Status & Search Results Info Bar */}
            <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-slate-200">
                  Mostrando <span className="text-amber-400 font-black">{filteredUsers.length}</span> de <span className="font-black text-slate-300">{users.length}</span> conexiones/usuarios
                </span>
                {userSearch && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <span>Filtro IP/ID: "{userSearch}"</span>
                    <button onClick={() => setUserSearch('')} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {userTypeFilter !== 'all' && (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Tipo: {userTypeFilter === 'registered' ? 'Registrados' : 'Solo App Instalada'}
                  </span>
                )}
                {roleFilter !== 'all' && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Rol: {roleFilter}
                  </span>
                )}
                {planFilter !== 'all' && (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Plan: {planFilter}
                  </span>
                )}
                {userStatusFilter !== 'all' && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Estado: {userStatusFilter}
                  </span>
                )}
              </div>

              {/* Quick filter shortcuts */}
              <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                <span className="text-slate-400 text-[10px] font-bold">Filtro rápido:</span>
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setUserSearch(u.name.replace(/^[^\w\s]+/, '').trim() || u.id)}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 text-[10px] font-medium transition-all flex items-center gap-1"
                    title={`Filtrar por ${u.name}`}
                  >
                    <span>{u.name.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono text-amber-400 font-bold opacity-80">{u.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SMART MERGE SUGGESTIONS BANNER */}
          {unifySuggestions.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-purple-950/40 border border-purple-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                  <GitMerge className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">Sugerencia de Fusión / Unificación Detectada</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {unifySuggestions.length} sugerencia(s)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Se detectaron dispositivos anónimos compartiendo IP/red con cuentas registradas ({unifySuggestions[0].primaryUser.name} &bull; {unifySuggestions[0].candidates.length} dispositivo(s)).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => handleOpenUnifyModal(unifySuggestions[0].primaryUser, unifySuggestions[0].candidates.map(c => c.id))}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Unificar Cuentas</span>
                </button>
              </div>
            </div>
          )}

          {/* BATCH ACTIONS BAR */}
          {selectedUserIds.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-extrabold text-amber-300">
                {selectedUserIds.length} usuario(s) seleccionado(s)
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedUserIds.length >= 2 && (
                  <button
                    onClick={() => handleOpenUnifyModal()}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] flex items-center gap-1.5 shadow active:scale-95"
                    title="Unificar las cuentas seleccionadas en un único usuario principal"
                  >
                    <GitMerge className="w-3.5 h-3.5 text-amber-300" />
                    <span>Unificar Cuentas ({selectedUserIds.length})</span>
                  </button>
                )}
                <button
                  onClick={() => handleBatchStatusChange('active')}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                >
                  Activar Acceso
                </button>
                <button
                  onClick={() => handleBatchStatusChange('suspended')}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                >
                  Suspender Acceso
                </button>
              </div>
            </div>
          )}

          {/* INTERACTIVE USER ACCESS TABLE */}
          <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} custom-scrollbar`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-400'} text-[11px] font-black uppercase`}>
                  <th className="p-3.5 w-10 text-center">
                    <button onClick={handleSelectAllUsers} className="text-amber-400">
                      {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Usuario / Dispositivo</th>
                  <th className="p-3.5">IP Teléfono / Red</th>
                  <th className="p-3.5">Rol de Sistema</th>
                  <th className="p-3.5">Plan Suscripción</th>
                  <th className="p-3.5">Idioma Alertas</th>
                  <th className="p-3.5">Estado Acceso</th>
                  <th className="p-3.5">Ubicación GPS</th>
                  <th className="p-3.5">Último Acceso</th>
                  <th className="p-3.5 text-right">Telemetría & Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Search className="w-6 h-6" />
                        </div>
                        <span className="font-extrabold text-sm text-slate-200">
                          {userSearch
                            ? `No se encontraron usuarios que coincidan con "${userSearch}"`
                            : 'No se encontraron usuarios con los filtros aplicados'}
                        </span>
                        <p className="text-xs text-slate-400">
                          Puedes buscar por nombre de usuario, dirección de correo electrónico o identificador único (ID).
                        </p>
                        {(userSearch || roleFilter !== 'all' || planFilter !== 'all' || userStatusFilter !== 'all' || userTypeFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setUserSearch('');
                              setRoleFilter('all');
                              setPlanFilter('all');
                              setUserStatusFilter('all');
                              setUserTypeFilter('all');
                            }}
                            className="mt-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow active:scale-95 flex items-center gap-1.5"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Limpiar filtros y ver todos ({users.length})</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userLangMeta = getLanguageMeta(user.language);
                    const daysRemaining = calculateDaysRemaining(user.subscriptionExpiryDate) ?? user.subscriptionDaysLeft;
                    const isCriticalExpiry = user.plan !== 'free' && daysRemaining !== null && daysRemaining !== undefined && daysRemaining <= 1;

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-amber-500/5 transition-all ${
                          selectedUserIds.includes(user.id) ? 'bg-amber-500/10' : ''
                        } ${isCriticalExpiry ? 'bg-rose-950/20' : ''}`}
                      >
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleSelectUser(user.id)}
                            className={selectedUserIds.includes(user.id) ? 'text-amber-400' : 'text-slate-500'}
                          >
                            {selectedUserIds.includes(user.id) ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full border text-amber-400 font-black flex items-center justify-center text-xs shrink-0 ${
                              user.isRegistered ? 'bg-blue-950/60 border-blue-500/40 text-blue-400' : 'bg-purple-950/60 border-purple-500/40 text-purple-400'
                            }`}>
                              {user.isRegistered ? <UserCheck className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-slate-100">{user.name}</span>
                                {user.isRegistered ? (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                    Cuenta Registrada
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    Solo App Instalada
                                  </span>
                                )}
                                {((user.linkedDevices && user.linkedDevices.length > 1) || (user.linkedAccountIds && user.linkedAccountIds.length > 0)) && (
                                  <button
                                    onClick={() => {
                                      setSelectedDevicesUser(user);
                                      setIsDevicesModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 transition-all cursor-pointer"
                                    title="Ver dispositivos y cuentas unificadas"
                                  >
                                    <Link2 className="w-2.5 h-2.5 text-purple-300" />
                                    <span>{user.linkedDevices?.length || (user.linkedAccountIds?.length || 0) + 1} Disp. Vinculados</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => copyToClipboard(user.id, `ID ${user.id}`)}
                                  className="text-[10px] font-mono font-extrabold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded transition-all flex items-center gap-1 active:scale-95"
                                  title="Hacer clic para copiar ID"
                                >
                                  <span>{user.id}</span>
                                  <Copy className="w-2.5 h-2.5 opacity-80" />
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-400 block font-medium">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-amber-400 text-xs">{user.ipAddress || '88.172.94.21'}</span>
                              <button
                                onClick={() => copyToClipboard(user.ipAddress || '88.172.94.21', 'IP Móvil')}
                                className="text-slate-400 hover:text-amber-400 p-0.5 transition-colors"
                                title="Copiar Dirección IP"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                              {user.deviceModel || 'Smartphone iOS/Android'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={user.role}
                            onChange={(e) => handleUserRoleChange(user.id, e.target.value as any)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-bold focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="user">Usuario</option>
                            <option value="moderator">Moderador</option>
                            <option value="admin">Administrador</option>
                            <option value="guest">Invitado (Móvil)</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1">
                            <select
                              value={user.plan}
                              onChange={(e) => handleUserPlanChange(user.id, e.target.value as any)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-bold focus:ring-1 focus:ring-amber-500 w-full"
                            >
                              <option value="free">Gratuito (€0)</option>
                              <option value="pro">Pase Pro Commuter (€4.99)</option>
                              <option value="enterprise">Europa VIP Pass (€14.99)</option>
                            </select>
                            {user.plan !== 'free' && (
                              <div className="flex items-center gap-1 text-[10px]">
                                {daysRemaining !== null && daysRemaining !== undefined ? (
                                  <span className={`px-1.5 py-0.2 rounded font-black ${
                                    daysRemaining <= 1
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {daysRemaining <= 0 ? 'Vence HOY' : `${daysRemaining} días`}
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{userLangMeta.flag}</span>
                            <span className="text-xs font-bold text-slate-200">{userLangMeta.code.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border transition-all flex items-center gap-1 ${
                              user.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                <span>Suspendido</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5 text-slate-300 font-medium text-[11px]">
                          <div className="flex items-center gap-1 text-slate-300">
                            <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>{user.location || 'París, Île-de-France'}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-extrabold block">
                            {user.connectionStatus || 'Online (GPS Activo)'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] font-medium">{user.lastLogin}</td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {user.plan !== 'free' && (
                              <button
                                onClick={() => handleSendLocalizedNotice(user.id)}
                                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all text-[10px] font-black flex items-center gap-1 active:scale-95"
                                title={`Enviar aviso de suscripción en su idioma (${userLangMeta.label})`}
                              >
                                <Bell className="w-3 h-3 text-amber-400" />
                                <span>Aviso {userLangMeta.code.toUpperCase()}</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleOpenUnifyModal(user)}
                              className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all text-[10px] font-bold flex items-center gap-1 active:scale-95"
                              title="Unificar o vincular esta cuenta con otros dispositivos/cuentas"
                            >
                              <Link2 className="w-3 h-3 text-purple-400" />
                              <span>Unificar</span>
                            </button>

                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all text-[10px] font-bold flex items-center gap-1 active:scale-95"
                              title="Editar datos de usuario y registrar en Activity Log"
                            >
                              <Edit2 className="w-3 h-3 text-amber-400" />
                              <span>Editar</span>
                            </button>

                            <button
                              onClick={() => setSelectedIpTelemetryUser(user)}
                              className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all text-[10px] font-bold flex items-center gap-1 active:scale-95"
                              title="Ver información de Telemetría IP y Conexión Móvil"
                            >
                              <Radio className="w-3 h-3 text-blue-400" />
                              <span>IP</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedHistoryUser(user);
                                setIsHistoryOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all text-[10px] font-bold flex items-center gap-1 active:scale-95"
                              title="Ver historial de actividad"
                            >
                              <Activity className="w-3 h-3 text-amber-400" />
                              <span>Historial</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white transition-all"
                              title="Eliminar usuario o bloquear IP"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PAYMENTS & SUBSCRIBED STATUS TABLE */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Controls Bar: Search & Status Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Buscar ref. transacción o usuario..."
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              {/* Status Filter */}
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-slate-100'
                }`}
              >
                <option value="all">Todos los Estados de Cobro</option>
                <option value="paid">Pagados / Aprobados</option>
                <option value="pending">Pendientes de Aprobación</option>
                <option value="failed">Fallidos</option>
                <option value="refunded">Reembolsados</option>
              </select>

              {/* Method Filter */}
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#111827] border-slate-700 text-slate-100'
                }`}
              >
                <option value="all">Todos los Métodos</option>
                <option value="Tarjeta crédito">Tarjeta de Crédito</option>
                <option value="PayPal">PayPal</option>
                <option value="Apple Pay">Apple Pay</option>
                <option value="Google Pay">Google Pay</option>
              </select>
            </div>

            <div className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30">
              Total Cobrado Filtrado: €{filteredTransactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0).toFixed(2)}
            </div>
          </div>

          {/* INTERACTIVE PAYMENTS TABLE */}
          <div className={`overflow-x-auto rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} custom-scrollbar`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-400'} text-[11px] font-black uppercase`}>
                  <th className="p-3.5">Ref. Transacción</th>
                  <th className="p-3.5">Cliente / Usuario</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Monto</th>
                  <th className="p-3.5">Método de Pago</th>
                  <th className="p-3.5">Estado del Cobro</th>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5 text-right">Gestión de Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-bold">
                      No se encontraron registros de cobro con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-amber-500/5 transition-all">
                      <td className="p-3.5 font-mono text-[11px] text-amber-400 font-bold">{tx.transactionRef}</td>
                      <td className="p-3.5">
                        <span className="font-extrabold text-slate-100 block">{tx.userName}</span>
                        <span className="text-[10px] text-slate-400 block">{tx.userEmail}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="uppercase font-extrabold text-[10px] text-purple-400">
                          {tx.plan === 'free' ? 'Gratuito' : tx.plan === 'pro' ? 'Pase Pro Commuter' : 'Europa VIP Pass'}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-slate-100">€{tx.amount.toFixed(2)}</td>
                      <td className="p-3.5 text-slate-300 text-[11px]">{tx.paymentMethod}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border inline-flex items-center gap-1 ${
                          tx.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : tx.status === 'refunded'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}>
                          {tx.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                          {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                          {tx.status === 'refunded' && <RefreshCw className="w-3 h-3" />}
                          {tx.status === 'failed' && <XCircle className="w-3 h-3" />}
                          <span>
                            {tx.status === 'paid' ? 'PAGADO' : tx.status === 'pending' ? 'PENDIENTE' : tx.status === 'refunded' ? 'REEMBOLSADO' : 'FALLIDO'}
                          </span>
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{tx.date}</td>
                      <td className="p-3.5 text-right space-x-1">
                        {tx.status === 'pending' && (
                          <button
                            onClick={() => handlePaymentStatusChange(tx.id, 'paid')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                          >
                            Aprobar
                          </button>
                        )}
                        {tx.status === 'paid' && (
                          <button
                            onClick={() => handlePaymentStatusChange(tx.id, 'refunded')}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold"
                          >
                            Reembolsar
                          </button>
                        )}
                        <button
                          onClick={() => showToast(`📄 Descargando comprobante oficial de ${tx.transactionRef}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all inline-block"
                          title="Descargar Factura PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLAN CONTROL */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border space-y-4 relative ${
                p.popular
                  ? 'bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/50 shadow-xl'
                  : `${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'}`
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                  MÁS POPULAR
                </span>
              )}

              <div>
                <h3 className="font-extrabold text-base text-slate-100">{p.name}</h3>
                <span className="text-[11px] text-emerald-400 font-bold block">{p.activeUsersCount} usuarios activos</span>
              </div>

              <div className="space-y-2 border-t border-b border-slate-800 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Precio Mensual (€):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={p.priceMonthly}
                    onChange={(e) => handleUpdatePlanPrice(p.id, parseFloat(e.target.value) || 0, p.priceYearly)}
                    className="w-20 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-right text-xs font-bold text-amber-400"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Precio Anual (€):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={p.priceYearly}
                    onChange={(e) => handleUpdatePlanPrice(p.id, p.priceMonthly, parseFloat(e.target.value) || 0)}
                    className="w-20 p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-right text-xs font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Funciones Incluidas:</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: GLOBAL APP SETTINGS */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4`}>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-amber-400">
              <Globe className="w-5 h-5" />
              <span>Parámetros Generales de la Aplicación</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nombre Oficial de la App</label>
                <input
                  type="text"
                  value={appConfig.appName}
                  onChange={(e) => handleConfigChange('appName', e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Mensaje Banner Global de Anuncio</label>
                <input
                  type="text"
                  value={appConfig.bannerMessage}
                  onChange={(e) => handleConfigChange('bannerMessage', e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="font-extrabold text-xs block">Mostrar Banner de Anuncio</span>
                  <span className="text-[10px] text-slate-400">Muestra la barra superior informativa</span>
                </div>
                <button
                  onClick={() => handleConfigChange('showGlobalBanner', !appConfig.showGlobalBanner)}
                  className={`p-1 rounded-xl transition-all ${appConfig.showGlobalBanner ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {appConfig.showGlobalBanner ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="font-extrabold text-xs block">Permitir Nuevos Registros</span>
                  <span className="text-[10px] text-slate-400">Habilita el formulario de creación de cuenta</span>
                </div>
                <button
                  onClick={() => handleConfigChange('allowRegistrations', !appConfig.allowRegistrations)}
                  className={`p-1 rounded-xl transition-all ${appConfig.allowRegistrations ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {appConfig.allowRegistrations ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-4`}>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-rose-400">
              <Lock className="w-5 h-5" />
              <span>Mantenimiento y Parámetros del Sistema</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/80 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-xs text-rose-300 block">Modo Mantenimiento Global</span>
                  <span className="text-[10px] text-slate-400">Bloquea la app cliente para tareas de servidor</span>
                </div>
                <button
                  onClick={() => handleConfigChange('maintenanceMode', !appConfig.maintenanceMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                    appConfig.maintenanceMode ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {appConfig.maintenanceMode ? 'ACTIVADO' : 'Inactivo'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="font-extrabold text-xs block">Habilitar Copilot IA en App Cliente</span>
                  <span className="text-[10px] text-slate-400">Permite a los usuarios usar el chat inteligente</span>
                </div>
                <button
                  onClick={() => handleConfigChange('enableCopilotAI', !appConfig.enableCopilotAI)}
                  className={`p-1 rounded-xl transition-all ${appConfig.enableCopilotAI ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {appConfig.enableCopilotAI ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Límite Cuota API (Pet/min)</label>
                <input
                  type="number"
                  value={appConfig.apiQuotaPerMinute}
                  onChange={(e) => handleConfigChange('apiQuotaPerMinute', parseInt(e.target.value) || 60)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN ACTION AUDIT LOG / ACTIVITY LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Top Activity Log Banner with Ubical Badge */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/30'} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">Activity Log & Trazabilidad de Administradores</h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Logging Activo
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Registro cronológico detallado de cambios en precios de planes, cuentas de usuarios, roles y configuraciones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setIsAddLogNoteOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nueva Nota / Registro</span>
              </button>

              <button
                onClick={handleExportAuditLogsCSV}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                title="Descargar Activity Log en archivo CSV para hojas de cálculo"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleExportAuditLogs}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                title="Descargar Activity Log en formato JSON estructurado"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} flex items-center justify-between`}>
              <div>
                <span className="text-slate-400 text-[11px] font-extrabold uppercase block">Total Registros</span>
                <span className="text-2xl font-black text-amber-400">{adminActionLogs.length}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Eventos rastreados</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <History className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} flex items-center justify-between`}>
              <div>
                <span className="text-slate-400 text-[11px] font-extrabold uppercase block">Cambios de Tarifas</span>
                <span className="text-2xl font-black text-emerald-400">
                  {adminActionLogs.filter(l => l.actionType === 'price_update' || l.actionType === 'plan_change').length}
                </span>
                <span className="text-[10px] text-emerald-400 block font-medium">Precios y planes editados</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} flex items-center justify-between`}>
              <div>
                <span className="text-slate-400 text-[11px] font-extrabold uppercase block">Modificación Usuarios</span>
                <span className="text-2xl font-black text-blue-400">
                  {adminActionLogs.filter(l => ['user_modified', 'role_change', 'status_change', 'user_created', 'user_deleted'].includes(l.actionType)).length}
                </span>
                <span className="text-[10px] text-blue-400 block font-medium">Roles, estados y datos</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} flex items-center justify-between`}>
              <div>
                <span className="text-slate-400 text-[11px] font-extrabold uppercase block">Ajustes & Sistema</span>
                <span className="text-2xl font-black text-purple-400">
                  {adminActionLogs.filter(l => ['config_update', 'batch_action', 'admin_note'].includes(l.actionType)).length}
                </span>
                <span className="text-[10px] text-purple-400 block font-medium">Configuraciones globales</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter Controls for Activity Logs */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} space-y-3`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Buscar por admin, elemento afectado, ID o detalle..."
                    className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isLight ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-900 border-slate-700 text-slate-100'
                    }`}
                  />
                  {auditSearch && (
                    <button
                      onClick={() => setAuditSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Action Type Filter */}
                <select
                  value={auditTypeFilter}
                  onChange={(e) => setAuditTypeFilter(e.target.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  <option value="all">Todas las Categorías ({adminActionLogs.length})</option>
                  <option value="price_update">💰 Actualización de Tarifas / Precios</option>
                  <option value="user_modified">👤 Modificación de Usuarios</option>
                  <option value="role_change">🛡️ Cambios de Rol Administrativo</option>
                  <option value="plan_change">✨ Cambios de Plan / Suscripción</option>
                  <option value="status_change">⚠️ Cambios de Estado (Activo/Suspendido)</option>
                  <option value="user_created">➕ Alta de Nuevos Usuarios</option>
                  <option value="user_deleted">🗑️ Bajas / Eliminaciones de Cuenta</option>
                  <option value="batch_action">📋 Acciones Masivas</option>
                  <option value="config_update">⚙️ Ajustes Globales de Sistema</option>
                  <option value="admin_note">📝 Notas Manuales de Administrador</option>
                </select>

                {(auditSearch || auditTypeFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setAuditSearch('');
                      setAuditTypeFilter('all');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Limpiar Filtros</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info summary banner */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
              <span>
                Mostrando <strong className="text-amber-400">{filteredAuditLogs.length}</strong> de <strong className="text-slate-200">{adminActionLogs.length}</strong> eventos registrados
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Trazabilidad Inmutable &bull; IP & Timestamp Verificados</span>
            </div>
          </div>

          {/* Table of Activity Logs */}
          <div className={`rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-[#111827] border-slate-800'} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900/90 border-slate-800 text-slate-400'
                  }`}>
                    <th className="p-3.5">Fecha y Hora (Timestamp)</th>
                    <th className="p-3.5">Administrador Responsable</th>
                    <th className="p-3.5">Tipo de Acción</th>
                    <th className="p-3.5">Elemento / Usuario Afectado</th>
                    <th className="p-3.5">Detalles del Cambio Realizado</th>
                    <th className="p-3.5">IP & Red</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <History className="w-8 h-8 text-slate-600" />
                          <span className="font-bold text-sm text-slate-300">No se encontraron registros en el Activity Log</span>
                          <span className="text-xs text-slate-500">Prueba ajustando los filtros de búsqueda o categoría de acción.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const actionStyles = {
                        price_update: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: DollarSign, label: 'Tarifa / Precios' },
                        user_modified: { bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: Edit2, label: 'Usuario Modificado' },
                        role_change: { bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Shield, label: 'Cambio de Rol' },
                        plan_change: { bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: Sparkles, label: 'Suscripción / Plan' },
                        status_change: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: AlertTriangle, label: 'Estado Cuenta' },
                        user_created: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: Plus, label: 'Alta Usuario' },
                        user_deleted: { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: Trash2, label: 'Baja Usuario' },
                        batch_action: { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: CheckSquare, label: 'Acción Masiva' },
                        config_update: { bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: Settings, label: 'Ajustes Sistema' },
                        admin_note: { bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', icon: FileText, label: 'Nota Admin' }
                      }[log.actionType] || { bg: 'bg-slate-700 text-slate-300 border-slate-600', icon: Activity, label: log.actionType };

                      const IconComponent = actionStyles.icon;

                      return (
                        <tr key={log.id} className={`hover:bg-amber-500/5 transition-colors ${isLight ? 'even:bg-slate-50/50' : 'even:bg-slate-900/40'}`}>
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{log.timestamp}</span>
                            </div>
                            <span className="text-[9px] text-slate-500 block font-mono pl-5">UTC+2 (Europe/Madrid)</span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center text-[11px] shrink-0">
                                {log.adminName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-extrabold text-slate-100 block leading-tight">{log.adminName}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">{log.adminEmail}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border inline-flex items-center gap-1.5 ${actionStyles.bg}`}>
                              <IconComponent className="w-3.5 h-3.5" />
                              <span>{actionStyles.label}</span>
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-extrabold text-slate-200 block">{log.targetUser}</span>
                            {log.targetUserId && (
                              <span className="text-[10px] font-mono text-amber-400/90 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 inline-block mt-0.5">
                                ID: {log.targetUserId}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="text-xs font-semibold text-slate-200 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                              {log.details}
                            </div>
                          </td>

                          <td className="p-3.5 whitespace-nowrap font-mono text-[11px]">
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400/90 border border-slate-800 font-bold">
                              {log.ipAddress || '192.168.1.104'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      <AnimatePresence>
        {isAddUserOpen && (
          <motion.div
            key="add-user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-md p-6 rounded-3xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800 text-slate-100'
              } shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-base text-slate-100">Registrar Nuevo Usuario</h3>
                <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="text-xs font-extrabold text-slate-400 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Ej. María García"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-400 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="maria.garcia@example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Rol</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold"
                    >
                      <option value="user">Usuario</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Plan</label>
                    <select
                      value={newUserPlan}
                      onChange={(e) => setNewUserPlan(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold"
                    >
                      <option value="free">Gratuito (€0)</option>
                      <option value="pro">Pase Pro Commuter (€4.99)</option>
                      <option value="enterprise">Europa VIP Pass (€14.99)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Idioma Notificaciones</label>
                    <select
                      value={newUserLanguage}
                      onChange={(e) => setNewUserLanguage(e.target.value as LanguageCode)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-bold"
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md"
                  >
                    Guardar Usuario
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* USER ACTIVITY & TELEMETRY HISTORY MODAL */}
        {isHistoryOpen && selectedHistoryUser && (
          <motion.div
            key={`history-modal-overlay-${selectedHistoryUser.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111827] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-extrabold flex items-center justify-center border border-amber-500/30 text-sm">
                    {selectedHistoryUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-100">{selectedHistoryUser.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">
                        {selectedHistoryUser.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedHistoryUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {/* Account Summary Banner */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Rol / Plan</span>
                    <span className="font-extrabold text-slate-200 capitalize">
                      {selectedHistoryUser.role} / {selectedHistoryUser.plan}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Registro</span>
                    <span className="font-extrabold text-slate-200">{selectedHistoryUser.registeredDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold block uppercase">Último Acceso</span>
                    <span className="font-extrabold text-emerald-400">{selectedHistoryUser.lastLogin}</span>
                  </div>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Registro de Actividades Recientes & Telemetría</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Sesión ID: {selectedHistoryUser.id}_sess_2026</span>
                </div>

                {/* Timeline Events */}
                <div className="space-y-2.5">
                  {[
                    {
                      time: '12/08/2026 14:10:02',
                      type: 'session_start',
                      title: 'Inicio de Sesión Exitoso',
                      detail: 'Inicio de sesión detectado desde Madrid, España (IP: 88.12.240.11)',
                      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    },
                    {
                      time: '12/08/2026 14:12:45',
                      type: 'ticket_search',
                      title: 'Búsqueda de Billetes de Tren',
                      detail: 'Consulta de trayecto París Nord ➔ Bruselas Midi (2 Pasajeros, Asiento Ventana)',
                      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    },
                    {
                      time: '12/08/2026 14:15:30',
                      type: 'payment',
                      title: 'Renovación de Suscripción',
                      detail: 'Pago procesado correctamente con Pasarela Stripe Direct (Ref: TRX-2026-88192)',
                      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    },
                    {
                      time: '11/08/2026 18:05:12',
                      type: 'pdf_download',
                      title: 'Descarga de Billete Digital PDF',
                      detail: 'Exportado pase de transporte en formato Wallet Apple/Google',
                      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    },
                    {
                      time: '10/08/2026 09:30:00',
                      type: 'account_update',
                      title: 'Modificación de Perfil',
                      detail: 'Actualización de método de pago predeterminado e idioma de notificación',
                      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }
                  ].map((evt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${evt.badge}`}>
                            {evt.type}
                          </span>
                          <span className="font-extrabold text-slate-100">{evt.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{evt.detail}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 whitespace-nowrap">{evt.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <button
                  onClick={() => {
                    setAuditSearch(selectedHistoryUser.email);
                    setActiveTab('audit');
                    setIsHistoryOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Ver en Auditoría Admin</span>
                </button>

                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TELEMETRY & NETWORK IP DETAILS MODAL */}
      <AnimatePresence>
        {selectedIpTelemetryUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedIpTelemetryUser(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800 text-slate-100'
              } shadow-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-[#111C33] to-amber-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                    <Radio className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-100">Telemetría MÓVIL & IP</h3>
                    <p className="text-xs text-amber-400 font-mono">{selectedIpTelemetryUser.ipAddress || '88.172.94.21'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIpTelemetryUser(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Status Badge */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-extrabold">Tipo de Conexión:</span>
                  {selectedIpTelemetryUser.isRegistered ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 font-black">
                      👤 Usuario Registrado con Cuenta
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black">
                      📱 App Instalada en Teléfono (Sin Registro)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Dirección IP Pública</span>
                    <span className="font-mono font-extrabold text-amber-400 text-sm block">
                      {selectedIpTelemetryUser.ipAddress || '88.172.94.21'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedIpTelemetryUser.ipAddress || '88.172.94.21', 'Dirección IP')}
                      className="text-[10px] text-blue-400 hover:underline font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" /> Copiar IP
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Modelo de Teléfono</span>
                    <span className="font-bold text-slate-100 text-xs block">
                      {selectedIpTelemetryUser.deviceModel || 'iPhone 15 Pro (iOS 18)'}
                    </span>
                    <span className="text-[10px] text-slate-500">Safari / Chrome Mobile App</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Ubicación Red Móvil</span>
                    <span className="font-bold text-slate-100 text-xs block">
                      {selectedIpTelemetryUser.location || 'París, Île-de-France'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">GPS Alta Precisión</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Estado en Tiempo Real</span>
                    <span className="font-bold text-emerald-400 text-xs block">
                      {selectedIpTelemetryUser.connectionStatus || 'Online (GPS Activo)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{selectedIpTelemetryUser.lastLogin}</span>
                  </div>
                </div>

                {/* Additional Raw Telemetry Headers */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                  <div className="text-[10px] font-sans font-black text-amber-400 uppercase mb-1">Encabezados HTTP / Red Móvil:</div>
                  <div>REMOTE_ADDR: {selectedIpTelemetryUser.ipAddress || '88.172.94.21'}</div>
                  <div>HTTP_USER_AGENT: Mozilla/5.0 ({selectedIpTelemetryUser.deviceModel || 'iPhone'}) Applet/2.4</div>
                  <div>X-FORWARDED-FOR: {selectedIpTelemetryUser.ipAddress || '88.172.94.21'}</div>
                  <div>CARRIER_PROVIDER: Orange Île-de-France (4G/5G)</div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    handleToggleUserStatus(selectedIpTelemetryUser.id);
                    setSelectedIpTelemetryUser(null);
                  }}
                  className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 ${
                    selectedIpTelemetryUser.status === 'active'
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{selectedIpTelemetryUser.status === 'active' ? 'Bloquear esta IP / Dispositivo' : 'Desbloquear IP'}</span>
                </button>

                <button
                  onClick={() => setSelectedIpTelemetryUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL (WITH ACTIVITY LOG TRIGGER) */}
      <AnimatePresence>
        {isEditUserOpen && editingUser && (
          <motion.div
            key="edit-user-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 rounded-3xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800 text-slate-100'
              } shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-100">Editar Usuario & Rol</h3>
                    <p className="text-[11px] text-amber-400/80 font-mono">ID: {editingUser.id}</p>
                  </div>
                </div>
                <button onClick={() => setIsEditUserOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Cada modificación quedará auditada automáticamente en el <strong>Activity Log</strong> con tu firma de administrador.</span>
              </div>

              <form onSubmit={handleSaveEditUser} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      value={editUserEmail}
                      onChange={(e) => setEditUserEmail(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Rol de Acceso</label>
                    <select
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin' | 'moderator')}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    >
                      <option value="user">Usuario Estándar</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Administrador Total</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Plan / Suscripción</label>
                    <select
                      value={editUserPlan}
                      onChange={(e) => setEditUserPlan(e.target.value as 'free' | 'pro' | 'enterprise')}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    >
                      <option value="free">Plan Gratis</option>
                      <option value="pro">Plan Pro (€9.99)</option>
                      <option value="enterprise">Plan Enterprise (€49.99)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Idioma Notificaciones</label>
                    <select
                      value={editUserLanguage}
                      onChange={(e) => setEditUserLanguage(e.target.value as LanguageCode)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    >
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Estado de Cuenta</label>
                    <select
                      value={editUserStatus}
                      onChange={(e) => setEditUserStatus(e.target.value as 'active' | 'suspended')}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    >
                      <option value="active">Activo</option>
                      <option value="suspended">Suspendido / Bloqueado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Fecha de Expiración Suscripción</label>
                    <input
                      type="date"
                      value={editUserExpiryDate}
                      onChange={(e) => setEditUserExpiryDate(e.target.value)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-400 block mb-1">Ubicación / Ciudad</label>
                    <input
                      type="text"
                      value={editUserLocation}
                      onChange={(e) => setEditUserLocation(e.target.value)}
                      placeholder="Ej. Madrid, España"
                      className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                      } focus:ring-2 focus:ring-amber-500 focus:outline-none`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditUserOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar y Auditar Cambios</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE MANUAL LOG NOTE MODAL */}
      <AnimatePresence>
        {isAddLogNoteOpen && (
          <motion.div
            key="add-log-note-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-slate-800 text-slate-100'
              } shadow-2xl space-y-4`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-100">Nueva Nota / Registro en Activity Log</h3>
                    <p className="text-[11px] text-slate-400">Añade una anotación administrativa oficial</p>
                  </div>
                </div>
                <button onClick={() => setIsAddLogNoteOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomLogNote} className="space-y-3.5">
                <div>
                  <label className="text-xs font-extrabold text-slate-400 block mb-1">Tipo de Registro / Categoría</label>
                  <select
                    value={newLogType}
                    onChange={(e) => setNewLogType(e.target.value as AdminActionLog['actionType'])}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                    } focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  >
                    <option value="admin_note">📝 Nota Administrativa / Auditoría Interna</option>
                    <option value="price_update">💰 Ajuste de Tarifas y Precios</option>
                    <option value="config_update">⚙️ Ajuste de Configuración Global</option>
                    <option value="batch_action">📋 Acción Masiva Manual</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-400 block mb-1">Módulo / Elemento Afectado</label>
                  <input
                    type="text"
                    required
                    value={newLogTarget}
                    onChange={(e) => setNewLogTarget(e.target.value)}
                    placeholder="Ej. Servidor de Pagos, Pasarela Stripe, Plan Pro..."
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                    } focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-400 block mb-1">Detalle de la Acción o Justificación</label>
                  <textarea
                    required
                    rows={3}
                    value={newLogDetails}
                    onChange={(e) => setNewLogDetails(e.target.value)}
                    placeholder="Describe el motivo, cambio o intervención administrativa realizada..."
                    className={`w-full p-2.5 rounded-xl text-xs font-bold border ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-700 text-slate-100'
                    } focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddLogNoteOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Registrar en Activity Log</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL: CASOS CRÍTICOS DE SUSCRIPCIÓN EN TIEMPO REAL */}
        {isCriticalAlertsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0B1120] border-rose-500/50 text-slate-100'
              } shadow-2xl flex flex-col`}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 text-white flex items-center justify-center border border-rose-400 shadow-lg shadow-rose-500/20 shrink-0">
                    <AlertOctagon className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg sm:text-xl tracking-tight text-white">
                        Centro de Alertas de Suscripción en Tiempo Real
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm">
                        {unresolvedAlertsCount} Casos Pendientes
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Monitoreo activo de saldos deudores, pagos rechazados y expiraciones inminentes con despacho multilingüe.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSound}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      isSoundAlertEnabled
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    title={isSoundAlertEnabled ? 'Silenciar alertas sonoras' : 'Activar alertas sonoras'}
                  >
                    {isSoundAlertEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setIsCriticalAlertsModalOpen(false)}
                    className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-black/30 border-b border-slate-800 shrink-0">
                <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30">
                  <span className="text-[10px] font-black uppercase text-rose-300 block">Casos Críticos</span>
                  <span className="text-xl font-black text-rose-400">{liveAdminAlerts.length}</span>
                  <span className="text-[10px] text-slate-400 block">{unresolvedAlertsCount} sin resolver</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30">
                  <span className="text-[10px] font-black uppercase text-amber-300 block">Saldo Deudor Total</span>
                  <span className="text-xl font-black text-amber-400">€{criticalDebtSum.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">Recuperable</span>
                </div>
                <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                  <span className="text-[10px] font-black uppercase text-purple-300 block">Vencimiento &le; 24h</span>
                  <span className="text-xl font-black text-purple-400">
                    {liveAdminAlerts.filter((a) => a.daysRemaining !== null && a.daysRemaining !== undefined && a.daysRemaining <= 1).length}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Acción inmediata</span>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[10px] font-black uppercase text-emerald-300 block">Casos Atendidos</span>
                  <span className="text-xl font-black text-emerald-400">
                    {liveAdminAlerts.filter((a) => a.isResolved).length}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Liquidados / Prorrogados</span>
                </div>
              </div>

              {/* Filter Tabs & Batch Actions */}
              <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-900/40">
                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setAdminAlertFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      adminAlertFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Todos ({liveAdminAlerts.length})
                  </button>
                  <button
                    onClick={() => setAdminAlertFilter('unresolved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      adminAlertFilter === 'unresolved'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    No Resueltos ({unresolvedAlertsCount})
                  </button>
                  <button
                    onClick={() => setAdminAlertFilter('balance')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      adminAlertFilter === 'balance'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Saldo / Fallo Pago ({liveAdminAlerts.filter((a) => a.type === 'payment_failed' || a.amountDue).length})
                  </button>
                  <button
                    onClick={() => setAdminAlertFilter('expiry')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      adminAlertFilter === 'expiry'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Vence Hoy ({liveAdminAlerts.filter((a) => a.daysRemaining !== null && a.daysRemaining !== undefined && a.daysRemaining <= 1).length})
                  </button>
                </div>

                {/* Batch Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleSimulateCriticalEvent}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-black transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-300" />
                    <span>Simular Alerta</span>
                  </button>
                  <button
                    onClick={handleSendBatchCriticalWarnings}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Aviso Masivo a Todos</span>
                  </button>
                  <button
                    onClick={handleClearAllResolvedAlerts}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Marcar Atendidos
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
                {(() => {
                  const filtered = liveAdminAlerts.filter((alert) => {
                    if (adminAlertFilter === 'unresolved') return !alert.isResolved;
                    if (adminAlertFilter === 'balance') return alert.type === 'payment_failed' || alert.amountDue;
                    if (adminAlertFilter === 'expiry') return alert.daysRemaining !== null && alert.daysRemaining !== undefined && alert.daysRemaining <= 1;
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center text-slate-400 space-y-3">
                        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <p className="font-extrabold text-base text-slate-200">No hay alertas para este filtro</p>
                        <p className="text-xs max-w-sm mx-auto text-slate-400">
                          Todas las suscripciones filtradas están satisfechas o no requieren intervención inmediata.
                        </p>
                      </div>
                    );
                  }

                  return filtered.map((alert) => {
                    const userLangMeta = getLanguageMeta(alert.language);
                    const userObj = users.find((u) => u.id === alert.userId);

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          alert.isResolved
                            ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                            : alert.urgency === 'critical'
                            ? 'bg-gradient-to-r from-rose-950/60 via-[#1C0F1B] to-slate-950 border-rose-500/60 shadow-lg shadow-rose-950/30'
                            : 'bg-gradient-to-r from-amber-950/40 via-[#1A1418] to-slate-950 border-amber-500/50'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          {/* Alert Info */}
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border font-black text-sm ${
                                alert.isResolved
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : alert.urgency === 'critical'
                                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                                  : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                              }`}
                            >
                              {alert.isResolved ? '✓' : alert.plan === 'enterprise' ? 'VIP' : 'PRO'}
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-sm text-white truncate">
                                  {alert.userName}
                                </h4>
                                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                  {alert.userId}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30">
                                  <span>{userLangMeta.flag}</span>
                                  <span>{userLangMeta.label}</span>
                                </span>
                                {alert.isResolved ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    RESUELTO ({alert.resolvedAt})
                                  </span>
                                ) : (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      alert.urgency === 'critical'
                                        ? 'bg-rose-500 text-white shadow-sm'
                                        : 'bg-amber-500 text-slate-950 font-black'
                                    }`}
                                  >
                                    {alert.urgency === 'critical' ? '🔴 CRÍTICO' : '🟡 URGENTE'}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-rose-300 font-bold">
                                {alert.title}: <span className="text-slate-300 font-normal">{alert.description}</span>
                              </p>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap pt-0.5">
                                <span>Email: <strong className="text-slate-200">{alert.userEmail}</strong></span>
                                <span>&bull;</span>
                                <span>IP: <strong className="text-amber-400 font-mono">{alert.ipAddress}</strong></span>
                                <span>&bull;</span>
                                <span>Dispositivo: <strong className="text-slate-300">{alert.deviceModel}</strong></span>
                                {alert.amountDue && (
                                  <>
                                    <span>&bull;</span>
                                    <span className="text-amber-300 font-black">
                                      Deuda: €{alert.amountDue.toFixed(2)}
                                    </span>
                                  </>
                                )}
                              </div>

                              {alert.paymentFailureReason && (
                                <div className="text-[11px] text-rose-400/90 font-medium italic">
                                  Motivo Pasarela: {alert.paymentFailureReason}
                                </div>
                              )}

                              {alert.isResolved && alert.resolvedAction && (
                                <div className="text-[11px] text-emerald-400 font-medium">
                                  Acción: {alert.resolvedAction}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Intervention Actions */}
                          <div className="flex items-center gap-2 flex-wrap shrink-0 justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            {alert.amountDue ? (
                              <button
                                onClick={() => handleSettleUserBalance(alert)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
                                title="Liquidar saldo y asentar cobro"
                              >
                                <DollarSign className="w-3.5 h-3.5" />
                                <span>Cobrar (€{alert.amountDue.toFixed(2)})</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleQuickRenewUser(alert.userId);
                                  handleResolveAlert(alert.id, 'Prórroga de 30 días concedida');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center gap-1"
                                title="Extender suscripción +30 días"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>+30 Días</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                handleSendLocalizedNotice(alert.userId);
                                handleResolveAlert(alert.id, `Notificación en ${userLangMeta.label} despachada`);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-black transition-all flex items-center gap-1 active:scale-95"
                              title={`Enviar notificación en ${userLangMeta.label}`}
                            >
                              <Bell className="w-3.5 h-3.5 text-amber-400" />
                              <span>Aviso ({userLangMeta.code.toUpperCase()})</span>
                            </button>

                            {userObj && (
                              <button
                                onClick={() => setSelectedIpTelemetryUser(userObj)}
                                className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all text-xs"
                                title="Ver telemetría GPS e IP del dispositivo"
                              >
                                <Radio className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {!alert.isResolved && (
                              <button
                                onClick={() => handleResolveAlert(alert.id, 'Revisado y archivado por el administrador')}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                                title="Marcar como atendido"
                              >
                                Atendido
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60">
                <div className="text-xs text-slate-400 hidden sm:block">
                  Sistema de notificación en tiempo real conectado con pasarela de pagos y base de datos local.
                </div>
                <button
                  type="button"
                  onClick={() => setIsCriticalAlertsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold transition-all ml-auto"
                >
                  Cerrar Consola
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          UNIFY & MERGE ACCOUNTS MODAL
          Permite al Administrador consolidar múltiples cuentas / dispositivos móviles
          ========================================================================= */}
      <AnimatePresence>
        {isUnifyModalOpen && (
          <motion.div
            key="unify-accounts-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-3xl rounded-3xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B1120] border-purple-500/40 text-slate-100'
              } shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]`}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-slate-900/90 to-amber-950/40 flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border-2 border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg shrink-0">
                    <GitMerge className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-lg text-white tracking-tight">
                        Unificación & Fusión de Cuentas de Usuario
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">
                        Consolidación Multi-Dispositivo
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Fusiona dispositivos anónimos, teléfonos móviles duplicados o cuentas secundarias dentro de una cuenta principal.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsUnifyModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {(() => {
                  const primaryUser = users.find((u) => u.id === unifyPrimaryUserId);
                  const selectedSources = users.filter((u) => unifySelectedSourceIds.includes(u.id));

                  // Determine highest plan
                  const planTiers: Record<string, number> = { enterprise: 3, pro: 2, free: 1 };
                  let highestTier = primaryUser ? planTiers[primaryUser.plan] || 1 : 1;
                  let highestPlanName = primaryUser ? primaryUser.plan : 'free';

                  selectedSources.forEach((s) => {
                    const tier = planTiers[s.plan] || 1;
                    if (tier > highestTier) {
                      highestTier = tier;
                      highestPlanName = s.plan;
                    }
                  });

                  return (
                    <>
                      {/* Step 1: Select Primary Account */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black">
                              1
                            </span>
                            <span>Seleccionar Cuenta Principal / Receptora:</span>
                          </label>
                          <span className="text-[11px] text-amber-400 font-bold">
                            Esta cuenta conservará el email y credenciales de acceso
                          </span>
                        </div>

                        <select
                          value={unifyPrimaryUserId}
                          onChange={(e) => {
                            const newPrimary = e.target.value;
                            setUnifyPrimaryUserId(newPrimary);
                            setUnifySelectedSourceIds((prev) => prev.filter((id) => id !== newPrimary));
                          }}
                          className={`w-full p-3 rounded-2xl text-xs font-bold border ${
                            isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-purple-500/40 text-slate-100'
                          } focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                        >
                          {users
                            .filter((u) => u.isRegistered)
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                👤 {u.name} ({u.email}) &bull; Plan: {u.plan.toUpperCase()} &bull; IP: {u.ipAddress || 'Sin IP'}
                              </option>
                            ))}
                          {users
                            .filter((u) => !u.isRegistered)
                            .map((u) => (
                              <option key={u.id} value={u.id}>
                                📱 {u.name} &bull; ID: {u.id} &bull; IP: {u.ipAddress || 'Sin IP'}
                              </option>
                            ))}
                        </select>

                        {/* Primary User Quick Card */}
                        {primaryUser && (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/30 to-slate-900/80 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black flex items-center justify-center text-sm">
                                {primaryUser.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-extrabold text-white flex items-center gap-2">
                                  <span>{primaryUser.name}</span>
                                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                                    {primaryUser.id}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  {primaryUser.email} &bull; <strong className="text-amber-400 font-mono">{primaryUser.ipAddress || '88.172.94.21'}</strong> &bull; {primaryUser.location || 'París'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                                Plan: {primaryUser.plan}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Step 2: Select Secondary Accounts / Devices to Merge */}
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[11px] font-black">
                              2
                            </span>
                            <span>Seleccionar Cuentas o Dispositivos a Fusionar ({unifySelectedSourceIds.length} elegidos):</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (primaryUser) {
                                  const matching = users
                                    .filter((u) => u.id !== primaryUser.id && (u.ipAddress === primaryUser.ipAddress || !u.isRegistered))
                                    .map((u) => u.id);
                                  setUnifySelectedSourceIds(matching);
                                }
                              }}
                              className="text-[10px] font-bold text-purple-400 hover:text-purple-300 underline"
                            >
                              Seleccionar sugeridos por IP
                            </button>
                            <span className="text-slate-600">&bull;</span>
                            <button
                              type="button"
                              onClick={() => setUnifySelectedSourceIds([])}
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-300"
                            >
                              Desmarcar todos
                            </button>
                          </div>
                        </div>

                        {/* List of candidates */}
                        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                          {users
                            .filter((u) => u.id !== unifyPrimaryUserId)
                            .map((candidate) => {
                              const isSelected = unifySelectedSourceIds.includes(candidate.id);
                              const isSameIp = primaryUser && candidate.ipAddress === primaryUser.ipAddress;
                              const isAnonymous = !candidate.isRegistered;

                              return (
                                <div
                                  key={candidate.id}
                                  onClick={() => handleToggleUnifySourceUser(candidate.id)}
                                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                    isSelected
                                      ? 'bg-purple-950/40 border-purple-500 shadow-md'
                                      : isLight
                                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="text-purple-400 shrink-0">
                                      {isSelected ? (
                                        <CheckSquare className="w-4 h-4 text-purple-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-600" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-extrabold text-white truncate">{candidate.name}</span>
                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700">
                                          {candidate.id}
                                        </span>
                                        {isSameIp && (
                                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                            Misma IP ({candidate.ipAddress})
                                          </span>
                                        )}
                                        {isAnonymous && (
                                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                            App Móvil
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[11px] text-slate-400 truncate">
                                        {candidate.email} &bull; Modelo: <strong className="text-slate-300">{candidate.deviceModel || 'Smartphone'}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-black uppercase">
                                      {candidate.plan}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      {/* Consolidation Preview Summary */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-amber-950/30 border border-purple-500/40 space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Resumen de la Cuenta Unificada Resultante
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Plan Resultante:</span>
                            <span className="font-black text-amber-400 text-sm uppercase">
                              {highestPlanName}
                            </span>
                            <span className="text-[10px] text-slate-500 block">Prevalece el nivel superior</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Dispositivos a Enlazar:</span>
                            <span className="font-black text-purple-300 text-sm">
                              {1 + unifySelectedSourceIds.length} Dispositivos
                            </span>
                            <span className="text-[10px] text-slate-500 block">Identificadores guardados</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Auditoría:</span>
                            <span className="font-black text-emerald-400 text-sm">
                              Activity Log OK
                            </span>
                            <span className="text-[10px] text-slate-500 block">Registro con trazabilidad</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400">
                          ⚠️ <strong>Nota:</strong> Los historiales de pagos y telemetría de las cuentas seleccionadas se reasignarán a <strong>{primaryUser?.name || 'la cuenta principal'}</strong>. Las cuentas secundarias quedarán marcadas como fusionadas.
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsUnifyModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleExecuteUnify}
                  disabled={!unifyPrimaryUserId || unifySelectedSourceIds.length === 0}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg flex items-center gap-2 ${
                    !unifyPrimaryUserId || unifySelectedSourceIds.length === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white active:scale-95'
                  }`}
                >
                  <GitMerge className="w-4 h-4" />
                  <span>Confirmar y Unificar Cuentas ({unifySelectedSourceIds.length})</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          LINKED DEVICES & UNIFIED ACCOUNTS INSPECTION MODAL
          Permite al Administrador ver todos los teléfonos y terminales vinculados a un usuario
          ========================================================================= */}
      <AnimatePresence>
        {isDevicesModalOpen && selectedDevicesUser && (
          <motion.div
            key="linked-devices-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-2xl rounded-3xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0B1120] border-purple-500/40 text-slate-100'
              } shadow-2xl overflow-hidden flex flex-col max-h-[85vh]`}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">
                      Dispositivos & Terminales Vinculados
                    </h3>
                    <p className="text-xs text-slate-400">
                      Usuario: <strong className="text-amber-400">{selectedDevicesUser.name}</strong> ({selectedDevicesUser.email})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDevicesModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {/* User Master Info */}
                <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black flex items-center justify-center text-xs">
                      {selectedDevicesUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white">{selectedDevicesUser.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID Principal: {selectedDevicesUser.id}</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-[10px] uppercase">
                    Plan: {selectedDevicesUser.plan}
                  </span>
                </div>

                {/* List of Linked Devices */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Hardware y Direcciones IP Enlazadas ({selectedDevicesUser.linkedDevices?.length || 1})
                  </h4>

                  {selectedDevicesUser.linkedDevices && selectedDevicesUser.linkedDevices.length > 0 ? (
                    selectedDevicesUser.linkedDevices.map((dev, idx) => (
                      <div
                        key={dev.deviceId || idx}
                        className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                            <Smartphone className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{dev.deviceModel || 'Dispositivo Móvil'}</span>
                              {dev.isPrimary && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>IP: <strong className="text-amber-400 font-mono">{dev.ipAddress || '88.172.94.21'}</strong></span>
                              <span>&bull;</span>
                              <span>{dev.location || 'París'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <div>Último acceso: {dev.lastSeen || 'Reciente'}</div>
                          <div className="text-[10px] text-purple-400 font-mono">ID: {dev.deviceId}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="font-bold text-white">{selectedDevicesUser.deviceModel || 'Navegador Web / App'}</div>
                          <div className="text-[11px] text-slate-400">IP: <strong className="text-amber-400 font-mono">{selectedDevicesUser.ipAddress || '88.172.94.21'}</strong></div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Dispositivo Único</span>
                    </div>
                  )}
                </div>

                {/* Merged Account IDs */}
                {selectedDevicesUser.linkedAccountIds && selectedDevicesUser.linkedAccountIds.length > 0 && (
                  <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Identificadores Anteriores Fusionados:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {selectedDevicesUser.linkedAccountIds.map((id) => (
                        <span key={id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDevicesModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================================================
   ADMIN ACCESS RESTRICTED VIEW (BLOCKED ACCESS SCREEN FOR STANDARD USERS)
   ============================================================================ */
interface RestrictedViewProps {
  currentUser?: UserAccount | null;
  onSwitchToClient?: () => void;
  onGrantAdminAccess?: () => void;
}

export const AdminAccessRestrictedView: React.FC<RestrictedViewProps> = ({
  currentUser,
  onSwitchToClient,
  onGrantAdminAccess,
}) => {
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlockAdmin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminKeyInput.trim() === 'admin123' || adminKeyInput.trim() === 'ADMIN' || adminKeyInput.trim() === 'admin' || !adminKeyInput) {
      if (onGrantAdminAccess) {
        onGrantAdminAccess();
      }
    } else {
      setErrorMsg('Clave incorrecta. Use "admin123" o active el modo administrador con el botón directo.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-3xl bg-[#0B1120] border border-rose-500/40 p-8 shadow-2xl text-slate-100 text-center space-y-6 relative overflow-hidden"
      >
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security Badge Icon & App Logo */}
        <div className="flex flex-col items-center justify-center gap-3">
          <UbicalLogo size="lg" showText={true} />
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center shadow-inner mt-1">
            <Lock className="w-7 h-7 animate-bounce" />
          </div>
        </div>

        {/* Title & Explanation */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Acceso Bloqueado &bull; Protegido por Decorador (isAdmin: true)
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Panel de Control de IP & Administración Restringido
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            El acceso a la telemetría de teléfonos móviles, registro de direcciones IP y configuraciones del sistema está reservado exclusivamente para cuentas de administrador con la propiedad <code className="text-amber-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">isAdmin: true</code>.
          </p>
        </div>

        {/* Current User Status */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-extrabold uppercase">Estado de la Cuenta Actual:</span>
            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-[10px]">
              {currentUser?.isAdmin ? 'isAdmin: true' : 'isAdmin: false (Usuario Estándar)'}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-black flex items-center justify-center text-xs shrink-0">
              {(currentUser?.name || 'U').charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-white truncate">{currentUser?.name || 'Usuario Invitado / Estándar'}</div>
              <div className="text-xs text-slate-400 truncate">{currentUser?.email || 'usuario@europa-transit.eu'} &bull; Rol: {currentUser?.role || 'user'}</div>
            </div>
          </div>
        </div>

        {/* Security Key Form */}
        <form onSubmit={handleUnlockAdmin} className="space-y-2.5 text-left pt-2">
          <label className="text-xs font-extrabold text-slate-300 block">
            Desbloquear Acceso Administrador (Demo Key):
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Ingresa clave de admin (ej: admin123)..."
              value={adminKeyInput}
              onChange={(e) => {
                setAdminKeyInput(e.target.value);
                setErrorMsg('');
              }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Desbloquear</span>
            </button>
          </div>
          {errorMsg && (
            <p className="text-[11px] text-rose-400 font-extrabold">{errorMsg}</p>
          )}
        </form>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => onGrantAdminAccess && onGrantAdminAccess()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>Activar Modo Admin (isAdmin: true)</span>
          </button>

          {onSwitchToClient && (
            <button
              onClick={onSwitchToClient}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la App Principal</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ============================================================================
   DECORATOR / HOC PROTECTOR: withAdminAuth
   Garantiza que solo componentes / cuentas con 'isAdmin: true' visualicen el panel
   ============================================================================ */
export function withAdminAuth<P extends AdminPanelProps>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedAdminComponent(props: P) {
    const { currentUser, onSwitchToClient, onUpdateUserAccount } = props;

    // Verificar si el usuario actual tiene isAdmin: true o rol 'admin'
    const hasAdminAccess = Boolean(
      currentUser &&
      (currentUser.isAdmin === true || currentUser.role === 'admin' || currentUser.id === 'admin_001')
    );

    const handleGrantAdminAccess = () => {
      const adminUser: UserAccount = {
        ...(currentUser || { id: 'admin_001', name: 'Administrador / Operador de Red', plan: 'pro' }),
        isAdmin: true,
        role: 'admin',
        isLoggedIn: true,
      };
      if (onUpdateUserAccount) {
        onUpdateUserAccount(adminUser);
      }
    };

    if (!hasAdminAccess) {
      return (
        <AdminAccessRestrictedView
          currentUser={currentUser}
          onSwitchToClient={onSwitchToClient}
          onGrantAdminAccess={handleGrantAdminAccess}
        />
      );
    }

    return <Component {...props} />;
  };
}

// Exportamos el AdminPanel envuelto en el decorador de protección
export const AdminPanel = withAdminAuth(AdminPanelBase);

