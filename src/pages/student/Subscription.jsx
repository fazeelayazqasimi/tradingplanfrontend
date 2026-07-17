import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiCreditCard,
  FiCheck,
  FiClock,
  FiX,
  FiRefreshCw,
  FiCalendar,
  FiDollarSign,
  FiShield,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    amount: 29,
    period: 'month',
    features: ['Market analysis access', 'Basic trading signals', 'Community forum access', 'Email support'],
  },
  {
    key: 'pro',
    name: 'Pro',
    amount: 49,
    period: 'month',
    features: ['Everything in Basic', 'Advanced trading signals', 'Copy trading access', 'Priority support', 'Live webinars'],
    popular: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    amount: 99,
    period: 'month',
    features: ['Everything in Pro', '1-on-1 mentorship', 'Custom trading strategies', 'API access', 'VIP support', 'Early feature access'],
  },
];

const STATUS_MAP = {
  active: 'success',
  cancelled: 'danger',
  expired: 'warning',
};

export default function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await studentService.getSubscription();
      const data = res?.data?.data || res?.data || res;
      setSubscription(data);
    } catch {
      toast.error('Failed to load subscription data');
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await walletService.getWallet();
      const data = res?.data?.data || res?.data || res;
      setWallet(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      await Promise.all([fetchSubscription(), fetchWallet()]);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [fetchSubscription, fetchWallet]);

  const handleRefresh = () => {
    setLoading(true);
    fetchSubscription().finally(() => setLoading(false));
    toast.success('Subscription data refreshed');
  };

  const handleSubscribeClick = (plan) => {
    setConfirmPlan(plan);
    setShowConfirm(true);
  };

  const handleConfirmSubscribe = async () => {
    if (!confirmPlan) return;
    setSubscribing(confirmPlan.key);
    setShowConfirm(false);
    try {
      const res = await studentService.createSubscription({
        plan: confirmPlan.key,
        amount: confirmPlan.amount,
        paymentMethod: 'wallet',
      });
      toast.success(`Subscribed to ${confirmPlan.name} plan successfully via wallet`);
      await Promise.all([fetchSubscription(), fetchWallet()]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create subscription');
    } finally {
      setSubscribing(null);
      setConfirmPlan(null);
    }
  };

  const handleCancel = async () => {
    const confirmed = window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of the billing period.');
    if (!confirmed) return;
    setCancelling(true);
    try {
      await studentService.cancelSubscription();
      toast.success('Subscription cancelled successfully');
      await fetchSubscription();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  const isActive = subscription?.status === 'active';
  const hasSubscription = subscription && subscription.plan;
  const statusColor = STATUS_MAP[subscription?.status] || 'neutral';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Subscription</h1>
          <p className="mt-1 text-sm text-dark-500">Manage your subscription plan and billing</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : hasSubscription ? (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div key="plan" variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-primary-50 text-primary-500">
                  <FiCreditCard className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dark-500">Current Plan</p>
                  <p className="mt-1 text-2xl font-bold text-ink capitalize">
                    {subscription.plan}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div key="status" variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-emerald-50 text-emerald-500">
                  {isActive ? <FiCheck className="h-6 w-6" /> : <FiClock className="h-6 w-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dark-500">Status</p>
                  <div className="mt-1">
                    <Badge color={statusColor}>
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div key="amount" variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-emerald-50 text-emerald-500">
                  <FiCreditCard className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dark-500">Amount</p>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    {formatCurrency(subscription.amount)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
          <motion.div key="renewal" variants={item}>
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[11px] bg-amber-50 text-amber-500">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-dark-500">Renewal Date</p>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}

      {hasSubscription && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Subscription Details</h2>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} className="text-dark-400" />
                    <span className="text-sm text-dark-500">Start Date:</span>
                    <span className="text-sm font-medium text-ink">{formatDate(subscription.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={14} className="text-dark-400" />
                    <span className="text-sm text-dark-500">End Date:</span>
                    <span className="text-sm font-medium text-ink">{formatDate(subscription.endDate)}</span>
                  </div>
                  {subscription.autoRenew !== undefined && (
                    <div className="flex items-center gap-2">
                      <FiRefreshCw size={14} className="text-dark-400" />
                      <span className="text-sm text-dark-500">Auto-Renew:</span>
                      <span className="text-sm font-medium text-ink">{subscription.autoRenew ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>
              </div>
              {isActive && (
                <Button variant="danger" size="sm" onClick={handleCancel} loading={cancelling}>
                  <FiX size={16} />
                  Cancel Subscription
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      <div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: hasSubscription ? 0.4 : 0.1 }}>
          <h2 className="text-lg font-semibold text-ink mb-4">
            {hasSubscription ? 'Change Plan' : 'Choose a Plan'}
          </h2>
        </motion.div>
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = subscription?.plan === plan.key;
            return (
              <motion.div key={plan.key} variants={item}>
                <Card
                  className={`p-6 h-full flex flex-col ${plan.popular ? 'border-primary-500 border-2 shadow-card-md' : ''}`}
                >
                  {plan.popular && (
                    <div className="text-xs font-bold text-primary-500 uppercase tracking-wider mb-2">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                  <div className="mt-3 mb-5">
                    <span className="text-4xl font-bold text-ink">{formatCurrency(plan.amount)}</span>
                    <span className="text-sm text-dark-500 ml-1">/ {plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <FiCheck size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-dark-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button variant="outline" size="md" disabled className="w-full">
                      <FiCheck size={16} />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      size="md"
                      onClick={() => handleSubscribeClick(plan)}
                      loading={subscribing === plan.key}
                      className="w-full"
                    >
                      <FiShield size={16} />
                      {hasSubscription ? 'Switch Plan' : 'Subscribe'}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {wallet && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <FiDollarSign size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-500">Wallet Balance</p>
                  <p className="text-xl font-bold text-ink">
                    {formatCurrency(wallet.availableBalance ?? wallet.available ?? 0)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-400">Pending: {formatCurrency(wallet.pendingBalance ?? 0)}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <Modal isOpen={showConfirm} onClose={() => { setShowConfirm(false); setConfirmPlan(null); }} title="Confirm Subscription" size="sm">
        {confirmPlan && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-3">
                <FiShield size={28} />
              </div>
              <h3 className="text-lg font-bold text-ink">{confirmPlan.name} Plan</h3>
              <p className="text-3xl font-bold text-ink mt-2">{formatCurrency(confirmPlan.amount)}</p>
              <p className="text-sm text-dark-400">per {confirmPlan.period}</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Payment via Wallet:</strong> This amount will be deducted from your wallet balance.
                {wallet && (wallet.availableBalance ?? wallet.available ?? 0) < confirmPlan.amount && (
                  <span className="block mt-1 text-red-600">Insufficient balance! Please deposit first.</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleConfirmSubscribe}
                disabled={(wallet?.availableBalance ?? wallet?.available ?? 0) < confirmPlan.amount}
                loading={subscribing === confirmPlan.key}
              >
                <FiCheck size={16} /> Confirm & Pay
              </Button>
              <Button variant="outline" onClick={() => { setShowConfirm(false); setConfirmPlan(null); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
