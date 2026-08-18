import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles, CreditCard, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserPlanType, PlanConfig, UserAccount } from '../types';
import { processNewPaymentTransaction } from '../services/userDatabase';

interface SubscriptionModalProps {
  currentPlan: UserPlanType;
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: UserPlanType) => void;
  plans?: PlanConfig[];
  currentUser?: UserAccount;
}

const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'plan_free',
    name: 'Plan Gratuito',
    priceMonthly: 0,
    priceYearly: 0,
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
    features: [
      'Cobertura en toda Europa (+12 capitales)',
      'API de Geolocalización Real y Telemetría',
      'Prioridad de Servidor Telemetría',
      'Soporte Premium Multi-cuenta'
    ]
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  currentPlan,
  isOpen,
  onClose,
  onSelectPlan,
  plans = DEFAULT_PLANS,
  currentUser
}) => {
  const [selectedPlan, setSelectedPlan] = useState<UserPlanType>(currentPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'Tarjeta crédito' | 'PayPal' | 'Apple Pay' | 'Google Pay'>('Tarjeta crédito');
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  if (!isOpen) return null;

  const freePlan = plans.find((p) => p.id === 'plan_free' || p.id.includes('free')) || DEFAULT_PLANS[0];
  const proPlan = plans.find((p) => p.id === 'plan_pro' || p.id.includes('pro')) || DEFAULT_PLANS[1];
  const enterprisePlan = plans.find((p) => p.id === 'plan_enterprise' || p.id.includes('enterprise') || p.id.includes('vip')) || DEFAULT_PLANS[2];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      
      // If choosing a paid plan, record the payment transaction in the Admin database
      if (selectedPlan !== 'free') {
        const planObj = selectedPlan === 'pro' ? proPlan : enterprisePlan;
        const amount = billingCycle === 'yearly' ? planObj.priceYearly : planObj.priceMonthly;
        
        processNewPaymentTransaction({
          userId: currentUser?.id,
          userName: currentUser?.name || 'Viajero Registrado',
          userEmail: currentUser?.email || 'viajero@ubical.eu',
          plan: selectedPlan,
          amount,
          paymentMethod,
          isYearly: billingCycle === 'yearly'
        });
      }

      onSelectPlan(selectedPlan);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '€0';
    return `€${price.toFixed(2).replace('.', ',')}`;
  };

  const getSelectedPriceText = () => {
    if (selectedPlan === 'pro') {
      return billingCycle === 'yearly'
        ? `${formatPrice(proPlan.priceYearly)} / año`
        : `${formatPrice(proPlan.priceMonthly)} / mes`;
    }
    if (selectedPlan === 'enterprise') {
      return billingCycle === 'yearly'
        ? `${formatPrice(enterprisePlan.priceYearly)} / año`
        : `${formatPrice(enterprisePlan.priceMonthly)} / mes`;
    }
    return formatPrice(freePlan.priceMonthly);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0B1120] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Planes de Pago Europa Transit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Desbloquea el Potencial Completo</h2>
            <p className="text-xs text-slate-400 mt-1">
              Accede a todas las redes de transporte de Europa con IA predictiva, visión de paradas e itinerarios en tiempo real.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="my-4 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="block text-white font-bold">¡Plan Activado Correctamente!</strong>
              <span>Tu pase ha sido actualizado. Disfruta de la experiencia real sin límites.</span>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center my-4">
          <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pago Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Pago Anual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                -17% Ahorro
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* FREE PLAN */}
          <div
            onClick={() => setSelectedPlan('free')}
            className={`cursor-pointer relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              selectedPlan === 'free'
                ? 'bg-slate-900 border-blue-500 ring-1 ring-blue-500/50'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{freePlan.name}</div>
              <div className="text-2xl font-bold text-white my-1">
                {formatPrice(freePlan.priceMonthly)} <span className="text-xs font-normal text-slate-400">/ mes</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">Uso básico para consultar horarios sin registro obligatorio.</p>
              
              <ul className="space-y-2 text-xs text-slate-300">
                {freePlan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* PRO PLAN */}
          <div
            onClick={() => setSelectedPlan('pro')}
            className={`cursor-pointer relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              selectedPlan === 'pro'
                ? 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/60 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
              Más Popular
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{proPlan.name}</div>
              <div className="text-2xl font-bold text-white my-1">
                {formatPrice(proPlan.priceMonthly)} <span className="text-xs font-normal text-slate-400">/ mes</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">Para viajeros habituales que quieren predicciones e IA.</p>
              
              <ul className="space-y-2 text-xs text-slate-300">
                {proPlan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ENTERPRISE VIP PLAN */}
          <div
            onClick={() => setSelectedPlan('enterprise')}
            className={`cursor-pointer relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
              selectedPlan === 'enterprise'
                ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">{enterprisePlan.name}</div>
              <div className="text-2xl font-bold text-white my-1">
                {formatPrice(enterprisePlan.priceMonthly)} <span className="text-xs font-normal text-slate-400">/ mes</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">Roaming total por +12 capitales europeas sin restricciones.</p>
              
              <ul className="space-y-2 text-xs text-slate-300">
                {enterprisePlan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Checkout Form Simulation */}
        {selectedPlan !== 'free' && (
          <form onSubmit={handleSubscribe} className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-semibold">
                <CreditCard className="w-4 h-4 text-blue-400" /> Método de Pago Seguro
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                <Lock className="w-3 h-3 text-emerald-400" /> Encriptación 256-bit SSL
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-4 gap-2 my-2">
              {(['Tarjeta crédito', 'PayPal', 'Apple Pay', 'Google Pay'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    paymentMethod === method
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {method === 'Tarjeta crédito' ? '💳 Tarjeta' : method === 'PayPal' ? '🅿️ PayPal' : method === 'Apple Pay' ? '🍎 Apple Pay' : '🌐 Google Pay'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder={
                  paymentMethod === 'Tarjeta crédito'
                    ? '4000 1234 5678 9010 (Tarjeta)'
                    : paymentMethod === 'PayPal'
                    ? 'cuenta.paypal@email.com'
                    : `${paymentMethod} vinculada a tu dispositivo`
                }
                className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <span>Procesando pago seguro...</span>
                ) : (
                  <>
                    <span>Confirmar Plan ({getSelectedPriceText()})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {selectedPlan === 'free' && (
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => {
                onSelectPlan('free');
                onClose();
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all"
            >
              Continuar con Plan Gratuito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

