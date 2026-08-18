import { RegisteredUser, UserAccount } from '../types';
import {
  getRegisteredUsersDB,
  saveRegisteredUsersDB,
  calculateDaysRemaining
} from './userDatabase';
import {
  LanguageCode,
  formatSubscriptionNotice,
  getTranslatedText
} from '../data/translations';

const STORAGE_LAST_DAILY_CHECK_KEY = 'transit_last_subscription_daily_check';
const STORAGE_NOTIFICATION_LOGS_KEY = 'transit_notification_logs';

export interface SubscriptionExpiryCheckResult {
  checkedAt: string;
  timestamp: number;
  totalUsersChecked: number;
  expiringUsersCount: number;
  notifiedUsers: Array<{
    id: string;
    name: string;
    email: string;
    plan: string;
    language?: LanguageCode;
    daysRemaining: number;
    expiryDate: string;
    channelsNotified: string[];
    notificationMessage: string;
  }>;
  skippedAlreadyNotifiedCount: number;
  status: 'completed' | 'no_action_needed';
}

export interface MockNotificationPayload {
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  language: LanguageCode;
  plan: string;
  daysRemaining: number;
  expiryDate: string;
  title: string;
  body: string;
  channels: ('in_app' | 'push_simulation' | 'email_simulation')[];
  timestamp: number;
}

/**
 * Triggers mock multi-channel notification dispatch for a user with an expiring subscription,
 * strictly rendered in the user's configured language.
 */
export function triggerMockSubscriptionExpiryNotification(
  user: RegisteredUser,
  daysLeft: number
): MockNotificationPayload {
  const expiryDate = user.subscriptionExpiryDate || '2 days';
  
  // Resolve user's preferred language, falling back to stored app language or default 'es'
  let userLang: LanguageCode = user.language || 'es';
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('transit_lang') as LanguageCode;
    if (!user.language && storedLang) {
      userLang = storedLang;
    }
  }

  const { title, body } = formatSubscriptionNotice(userLang, user.plan, daysLeft, expiryDate);

  // 1. Dispatch In-App Notification Center log with localized text
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_NOTIFICATION_LOGS_KEY);
      const logs = raw ? JSON.parse(raw) : [];
      logs.unshift({
        id: `sub_exp_${user.id}_${Date.now()}`,
        lineId: 'subscription_renewal',
        lineNumber: `${daysLeft}D`,
        lineName: title,
        lineType: 'train',
        lineColor: daysLeft <= 1 ? '#EF4444' : '#F59E0B',
        textColor: '#FFFFFF',
        nearbyStop: `${user.plan.toUpperCase()} • ${getTranslatedText(userLang, 'subRenewalWarningTitle')} (${expiryDate})`,
        arrivalMinutes: 0,
        timestamp: Date.now(),
        read: false
      });
      localStorage.setItem(STORAGE_NOTIFICATION_LOGS_KEY, JSON.stringify(logs.slice(0, 40)));
    }
  } catch (err) {
    console.warn('[SubscriptionService] Could not write to in-app notification logs:', err);
  }

  // 2. Simulated Web Notification API in the user's language if permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: `renewal-${user.id}`
      });
    } catch (e) {
      // Ignored in preview environment
    }
  }

  // 3. Log simulated push & email notification delivery in user language
  console.log(`[SubscriptionService] [MOCK NOTIFICATION DISPATCHED] -> Recipient: ${user.name} <${user.email}> | Lang: [${userLang.toUpperCase()}] | Plan: ${user.plan} | Expiry: ${expiryDate} (${daysLeft} days left)`);

  return {
    recipientId: user.id,
    recipientName: user.name,
    recipientEmail: user.email,
    language: userLang,
    plan: user.plan,
    daysRemaining: daysLeft,
    expiryDate,
    title,
    body,
    channels: ['in_app', 'push_simulation', 'email_simulation'],
    timestamp: Date.now()
  };
}

/**
 * Service function that checks all user subscription expiry dates daily and
 * triggers mock notification logic for users who are within 2 days of their subscription ending.
 * 
 * @param forceCheck If true, bypasses the "already checked today" throttle and re-evaluates all users.
 */
export function checkSubscriptionsDailyAndNotifyExpiringSoon(forceCheck: boolean = false): SubscriptionExpiryCheckResult {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // If not forced, check if already executed in the last 24h
  if (!forceCheck && typeof window !== 'undefined') {
    const lastCheck = localStorage.getItem(STORAGE_LAST_DAILY_CHECK_KEY);
    if (lastCheck === todayStr) {
      const users = getRegisteredUsersDB();
      const expiringUsers = users.filter((u) => {
        const days = calculateDaysRemaining(u.subscriptionExpiryDate);
        return days !== null && days >= 0 && days <= 2 && u.plan !== 'free';
      });

      return {
        checkedAt: new Date().toLocaleTimeString(),
        timestamp: Date.now(),
        totalUsersChecked: users.length,
        expiringUsersCount: expiringUsers.length,
        notifiedUsers: [],
        skippedAlreadyNotifiedCount: expiringUsers.length,
        status: 'no_action_needed'
      };
    }
  }

  const users = getRegisteredUsersDB();
  const notifiedUsers: SubscriptionExpiryCheckResult['notifiedUsers'] = [];
  let skippedCount = 0;

  const updatedUsers = users.map((user) => {
    // Free plan users do not have subscriptions to expire
    if (user.plan === 'free') return user;

    const daysLeft = calculateDaysRemaining(user.subscriptionExpiryDate);

    // Target users within 2 days of ending (0, 1, or 2 days left)
    if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 2) {
      // Trigger mock notification in the user's specified language
      const mockResult = triggerMockSubscriptionExpiryNotification(user, daysLeft);

      notifiedUsers.push({
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        language: mockResult.language,
        daysRemaining: daysLeft,
        expiryDate: user.subscriptionExpiryDate || '',
        channelsNotified: ['In-App Notice', 'Push Simulation', 'Email Alert'],
        notificationMessage: mockResult.body
      });

      return {
        ...user,
        subscriptionDaysLeft: daysLeft,
        renewalWarningSent: true,
        renewalWarningSentDate: new Date().toLocaleString()
      };
    }

    return user;
  });

  // Save updated users state to persistent database
  saveRegisteredUsersDB(updatedUsers);

  // Store last daily check stamp
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_LAST_DAILY_CHECK_KEY, todayStr);
    
    // Broadcast event for UI components to refresh
    window.dispatchEvent(
      new CustomEvent('ubical_daily_subscription_check_completed', {
        detail: {
          timestamp: Date.now(),
          notifiedCount: notifiedUsers.length
        }
      })
    );
  }

  return {
    checkedAt: new Date().toLocaleString(),
    timestamp: Date.now(),
    totalUsersChecked: users.length,
    expiringUsersCount: notifiedUsers.length + skippedCount,
    notifiedUsers,
    skippedAlreadyNotifiedCount: skippedCount,
    status: notifiedUsers.length > 0 ? 'completed' : 'no_action_needed'
  };
}

/**
 * Initializes the background daily subscription check scheduler (runs on app launch and every 24h).
 */
export function initDailySubscriptionScheduler(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Run on startup
  try {
    checkSubscriptionsDailyAndNotifyExpiringSoon(false);
  } catch (e) {
    console.error('[SubscriptionService] Startup daily check failed:', e);
  }

  // Interval check (every 24 hours: 86,400,000 ms)
  const intervalId = window.setInterval(() => {
    try {
      checkSubscriptionsDailyAndNotifyExpiringSoon(false);
    } catch (e) {
      console.error('[SubscriptionService] Periodic daily check failed:', e);
    }
  }, 24 * 60 * 60 * 1000);

  return () => {
    window.clearInterval(intervalId);
  };
}
