import { RegisteredUser, PaymentTransaction, AdminCriticalAlert } from '../types';
import { calculateDaysRemaining } from './userDatabase';
import { LanguageCode } from '../data/translations';

const STORAGE_ADMIN_ALERTS_KEY = 'ubical_admin_critical_alerts_v1';
const STORAGE_ADMIN_SOUND_PREF_KEY = 'ubical_admin_alert_sound_enabled';

/**
 * Web Audio API synthesizer for Admin Critical Subscription Alert
 * Plays a clear 2-stage urgency chime (No external audio files needed)
 */
export function playAdminCriticalAlertSound(): void {
  try {
    if (typeof window === 'undefined') return;
    const isSoundEnabled = localStorage.getItem(STORAGE_ADMIN_SOUND_PREF_KEY) !== 'false';
    if (!isSoundEnabled) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    // Tone 1: 659.25 Hz (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Tone 2: 880 Hz (A5 - High attention cue)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.46);
  } catch (err) {
    console.warn('Admin critical alert sound failed:', err);
  }
}

/**
 * Generates and evaluates real-time critical alerts from the current user database and transaction logs
 */
export function evaluateCriticalSubscriptionAlerts(
  users: RegisteredUser[],
  transactions: PaymentTransaction[]
): AdminCriticalAlert[] {
  const alerts: AdminCriticalAlert[] = [];
  const now = new Date();
  const timestampStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // Map transactions by user email
  const failedTxByUser = new Map<string, PaymentTransaction>();
  const pendingTxByUser = new Map<string, PaymentTransaction>();

  transactions.forEach((tx) => {
    if (tx.status === 'failed') {
      failedTxByUser.set(tx.userEmail.toLowerCase(), tx);
    } else if (tx.status === 'pending') {
      pendingTxByUser.set(tx.userEmail.toLowerCase(), tx);
    }
  });

  users.forEach((user) => {
    // Exclude guests or free accounts without debt
    if (user.role === 'guest' || (!user.isRegistered && user.plan === 'free')) {
      return;
    }

    const emailKey = user.email.toLowerCase();
    const failedTx = failedTxByUser.get(emailKey);
    const pendingTx = pendingTxByUser.get(emailKey);
    const daysLeft = calculateDaysRemaining(user.subscriptionExpiryDate) ?? user.subscriptionDaysLeft;

    // 1. CRITICAL: Failed Payment Transaction or explicit paymentFailureReason
    if (failedTx || user.paymentFailureReason) {
      const amount = failedTx ? failedTx.amount : user.plan === 'enterprise' ? 14.99 : 4.99;
      alerts.push({
        id: `alert-fail-${user.id}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userIp: user.ipAddress,
        userLanguage: (user.language || 'es') as LanguageCode,
        plan: user.plan,
        type: 'payment_failed',
        severity: 'critical',
        title: `Pago Rechazado en Pasarela (€${amount.toFixed(2)})`,
        description: `El cobro recurrente automático para ${user.name} falló. Motivo: ${user.paymentFailureReason || 'Tarjeta rechazada / Fondos insuficientes'}.`,
        amountDue: amount,
        daysLeft,
        expiryDate: user.subscriptionExpiryDate,
        timestamp: timestampStr,
        isRead: false,
        isResolved: false
      });
    }

    // 2. CRITICAL: Pending Balance / Saldo Pendiente Deudor
    if ((user.pendingBalance && user.pendingBalance > 0) || pendingTx) {
      const balance = user.pendingBalance || (pendingTx ? pendingTx.amount : 4.99);
      // Only push if not already covered by failed payment alert
      if (!alerts.some((a) => a.userId === user.id && a.type === 'payment_failed')) {
        alerts.push({
          id: `alert-balance-${user.id}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userIp: user.ipAddress,
          userLanguage: (user.language || 'es') as LanguageCode,
          plan: user.plan,
          type: 'pending_balance',
          severity: 'critical',
          title: `Saldo Pendiente de Cobro: €${balance.toFixed(2)}`,
          description: `La cuenta de ${user.name} tiene un saldo deudor acumulado de €${balance.toFixed(2)} por renovación de plan ${user.plan.toUpperCase()}.`,
          amountDue: balance,
          daysLeft,
          expiryDate: user.subscriptionExpiryDate,
          timestamp: timestampStr,
          isRead: false,
          isResolved: false
        });
      }
    }

    // 3. CRITICAL / WARNING: Imminent Expiration (<= 1 day or 0 days / Expired)
    if (
      user.plan !== 'free' &&
      daysLeft !== null &&
      daysLeft !== undefined &&
      daysLeft <= 1 &&
      user.status !== 'suspended'
    ) {
      const isExpiredNow = daysLeft <= 0;
      alerts.push({
        id: `alert-exp-${user.id}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userIp: user.ipAddress,
        userLanguage: (user.language || 'es') as LanguageCode,
        plan: user.plan,
        type: isExpiredNow ? 'expired_today' : 'expiry_imminent',
        severity: isExpiredNow ? 'critical' : 'warning',
        title: isExpiredNow ? `Suscripción Expirada HOY (${user.subscriptionExpiryDate})` : `Vence en 24 Horas (${user.subscriptionExpiryDate})`,
        description: isExpiredNow
          ? `El plan ${user.plan.toUpperCase()} de ${user.name} ha alcanzado su fecha límite de renovación hoy.`
          : `Falta menos de 1 día para que expire el pase de transporte de ${user.name}.`,
        amountDue: user.plan === 'enterprise' ? 14.99 : 4.99,
        daysLeft,
        expiryDate: user.subscriptionExpiryDate,
        timestamp: timestampStr,
        isRead: false,
        isResolved: false
      });
    }

    // 4. CRITICAL: Suspended Account with active debts
    if (user.status === 'suspended' && (user.pendingBalance || user.plan !== 'free')) {
      // If not already in alerts
      if (!alerts.some((a) => a.userId === user.id)) {
        alerts.push({
          id: `alert-susp-${user.id}`,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userIp: user.ipAddress,
          userLanguage: (user.language || 'es') as LanguageCode,
          plan: user.plan,
          type: 'account_suspended_balance',
          severity: 'warning',
          title: `Cuenta Suspendida con Estado Deudor`,
          description: `El usuario ${user.name} se encuentra suspendido. Requiere regularización de saldo o reactivación manual.`,
          amountDue: user.pendingBalance || 4.99,
          daysLeft,
          expiryDate: user.subscriptionExpiryDate,
          timestamp: timestampStr,
          isRead: false,
          isResolved: false
        });
      }
    }
  });

  return alerts;
}

/**
 * Storage helpers for admin alert management & resolution logs
 */
export function getSavedAdminAlerts(): AdminCriticalAlert[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveAdminAlertsToStorage(alerts: AdminCriticalAlert[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_ADMIN_ALERTS_KEY, JSON.stringify(alerts));
  } catch (e) {}
}

export function getAdminSoundPreference(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_ADMIN_SOUND_PREF_KEY) !== 'false';
}

export function setAdminSoundPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_ADMIN_SOUND_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * Dispatches a simulated live real-time critical subscription event
 * for testing and real-time response demonstration
 */
export function dispatchSimulatedLiveCriticalAlert(
  customUser?: Partial<RegisteredUser>
): AdminCriticalAlert {
  const randomId = Math.floor(1000 + Math.random() * 9000);
  const simAlert: AdminCriticalAlert = {
    id: `sim-alert-${Date.now()}`,
    userId: customUser?.id || `usr_sim_${randomId}`,
    userName: customUser?.name || `Pasajero VIP #${randomId}`,
    userEmail: customUser?.email || `vip.passenger${randomId}@ubical.eu`,
    userIp: customUser?.ipAddress || `88.172.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
    userLanguage: customUser?.language || 'es',
    plan: customUser?.plan || 'enterprise',
    type: 'payment_failed',
    severity: 'critical',
    title: `🚨 ALERTA EN VIVO: Saldo Pendiente (€14.99) & Pago Rechazado`,
    description: `Pasarela Stripe reporta fallo de cargo automático (Tarjeta sin fondos) para ${customUser?.name || `Pasajero VIP #${randomId}`}.`,
    amountDue: 14.99,
    daysLeft: 0,
    expiryDate: new Date().toLocaleDateString('es-ES'),
    timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    isRead: false,
    isResolved: false
  };

  playAdminCriticalAlertSound();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ubical_admin_critical_alert_event', {
        detail: { alert: simAlert }
      })
    );
  }

  return simAlert;
}
