import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookOpen,
  FiTrendingUp,
  FiDollarSign,
  FiAward,
  FiArrowRight,
  FiActivity,
  FiCreditCard,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiShoppingCart,
  FiCopy,
  FiLink,
  FiTag,
  FiShield,
  FiUsers,
  FiServer,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import referralService from '../../services/referralService';
import courseService from '../../services/courseService';
import signalService from '../../services/signalService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getInitials, copyToClipboard } from '../../utils/helpers';
import SystemFlow from '../../components/website/SystemFlow';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const gradientPlaceholders = [
  'from-blue-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-indigo-600',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [enrolled, setEnrolled] = useState([]);
  const [signals, setSignals] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [allWallets, setAllWallets] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [showUplineModal, setShowUplineModal] = useState(false);
  const [uplineEmail, setUplineEmail] = useState('');
  const [uplineError, setUplineError] = useState('');
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [enrolledRes, signalsRes, walletRes, rankRes, approvalRes] = await Promise.allSettled([
          courseService.getEnrolled(),
          signalService.getSignals({ perPage: 5, sort: '-createdAt' }),
          studentService.getCopyStats().catch(() => null),
          studentService.getMyRank(),
          studentService.getApprovalStatus(),
        ]);

        if (cancelled) return;

        if (approvalRes.status === 'fulfilled' && approvalRes.value) {
          const ad = approvalRes.value?.data?.data || approvalRes.value?.data || approvalRes.value;
          setApprovalStatus(ad);
        }

        if (cancelled) return;

        const enrolledData = enrolledRes.status === 'fulfilled' ? enrolledRes.value : {};
        const coursesList = enrolledData.data?.courses || enrolledData.data?.data || enrolledData.courses || enrolledData.data || [];
        setEnrolled(Array.isArray(coursesList) ? coursesList.slice(0, 3) : []);

        const signalsData = signalsRes.status === 'fulfilled' ? signalsRes.value : {};
        const signalsList = signalsData.data?.signals || signalsData.data?.data || signalsData.signals || signalsData.data || [];
        setSignals(Array.isArray(signalsList) ? signalsList.slice(0, 5) : []);

        if (walletRes.status === 'fulfilled' && walletRes.value) {
          const wd = walletRes.value.data || walletRes.value;
          setWallet(wd.balance ?? wd.data?.balance ?? 0);
        }
        try {
          const walletsRes = await walletService.getAllWallets();
          const wData = walletsRes?.data?.data || walletsRes?.data || [];
          setAllWallets(Array.isArray(wData) ? wData : []);
        } catch { /* silent */ }

        if (rankRes.status === 'fulfilled' && rankRes.value) {
          const rd = rankRes.value.data || rankRes.value;
          setRank(rd.rank || rd.data?.rank || null);
        }

        // Fetch referral code
        try {
          const refRes = await referralService.getReferralCode();
          const cd = refRes?.data?.data || refRes?.data || refRes;
          const code = cd?.code || cd?.referralCode || cd || '';
          setReferralCode(typeof code === 'string' ? code : code?.toString() || '');
        } catch { /* silent */ }
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const handleActivateWithPin = async () => {
    if (!pinCode.trim()) { setPinError('Please enter a PIN code'); return; }
    setActivating(true);
    setPinError('');
    try {
      await studentService.activateWithPin({ code: pinCode });
      toast.success('Account activated successfully via PIN!');
      setShowPinModal(false);
      setPinCode('');
      window.location.reload();
    } catch (err) {
      setPinError(err?.response?.data?.message || 'Failed to activate with PIN');
    } finally {
      setActivating(false);
    }
  };

  const handleActivateWithBalance = async () => {
    setActivating(true);
    try {
      await studentService.activateWithBalance();
      toast.success('Account activated successfully via balance!');
      window.location.reload();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to activate with balance');
    } finally {
      setActivating(false);
    }
  };

  const handleUplineActivate = async () => {
    if (!uplineEmail.trim()) { setUplineError('Please enter username or email'); return; }
    setActivating(true);
    setUplineError('');
    try {
      await studentService.activateByUpline({ usernameOrEmail: uplineEmail });
      toast.success('Member activated successfully!');
      setShowUplineModal(false);
      setUplineEmail('');
      window.location.reload();
    } catch (err) {
      setUplineError(err?.response?.data?.message || 'Failed to activate member');
    } finally {
      setActivating(false);
    }
  };

  const statCards = [
    {
      key: 'courses',
      label: 'Courses Enrolled',
      icon: FiBookOpen,
      value: enrolled.length || 0,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
      link: '/student/courses',
    },
    {
      key: 'signals',
      label: 'Total Signals',
      icon: FiActivity,
      value: signals.length || 0,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      link: '/student/signals',
    },
    {
      key: 'wallet',
      label: 'Wallet Balance',
      icon: FiDollarSign,
      value: formatCurrency(wallet || 0),
      color: 'bg-amber-50',
      iconColor: 'text-amber-500',
      link: '/student/wallet',
    },
    {
      key: 'rank',
      label: 'Current Rank',
      icon: FiAward,
      value: rank?.name || rank?.rank || 'N/A',
      color: 'bg-violet-50',
      iconColor: 'text-violet-500',
      link: '/student/rank',
    },
  ];

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white border-0">
          <div className="w-[42px] h-[42px] rounded-full bg-white/20 flex items-center justify-center text-lg font-bold shrink-0">
            {getInitials(user?.firstName, user?.lastName)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-lg font-bold text-white">
              Welcome back, {user?.firstName || 'Student'}!
            </h1>
            <p className="text-sm text-white/70 mt-0.5">
              {user?.subscription?.status === 'active' || user?.subscriptionStatus === 'active'
                ? 'Your subscription is active. Keep learning!'
                : 'Activate your subscription to access all features.'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-white/60">
            <FiUser size={16} />
            <span className="text-sm">{user?.email}</span>
</div>
          </Card>
        </motion.div>

        {referralCode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="p-[22px]">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                  <FiLink size={16} className="text-primary-500" />
                  Your Referral Link
                </h2>
                <Link to="/student/referrals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                  View All <FiArrowRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/register?ref=${referralCode}`}
                  className="flex-1 text-sm font-mono text-ink bg-dark-50 border border-dark-200 rounded-xl px-4 py-2.5 outline-none"
                />
                <button
                  onClick={() => {
                    copyToClipboard(`${window.location.origin}/register?ref=${referralCode}`);
                    setCopied(true);
                    toast.success('Referral link copied!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2.5 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                >
                  {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
                </button>
              </div>
            </Card>
          </motion.div>
        )}

      {!loading && !user?.isApproved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 border-2 border-primary-200 bg-gradient-to-br from-primary-50/50 to-white">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
                <FiShield className="text-primary-600" size={32} />
              </div>
              <h2 className="font-bold text-ink text-xl">Activate Your Account</h2>
              <p className="text-sm text-dark-500 mt-1">Choose a method to activate your membership and access all features.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border border-dark-100 hover:border-primary-300 transition-colors">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <FiDollarSign className="text-emerald-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-ink text-sm">Deposit & Activate</h3>
                  <p className="text-xs text-dark-500">Deposit USDT and use your wallet balance to activate instantly.</p>
                  <Link to="/student/wallet" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Go to Wallet
                    </Button>
                  </Link>
                </div>
              </Card>
              <Card className="p-5 border border-dark-100 hover:border-primary-300 transition-colors">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <FiTag className="text-purple-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-ink text-sm">Enter PIN Code</h3>
                  <p className="text-xs text-dark-500">Use a PIN code or coupon to activate your membership.</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setShowPinModal(true); setPinCode(''); setPinError(''); }}>
                    Enter PIN
                  </Button>
                </div>
              </Card>
              <Card className="p-5 border border-dark-100 hover:border-primary-300 transition-colors">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FiUsers className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold text-ink text-sm">Ask Your Upline</h3>
                  <p className="text-xs text-dark-500">Ask your upline to activate your account using your email.</p>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setShowUplineModal(true); setUplineEmail(''); setUplineError(''); }}>
                    Request Activation
                  </Button>
                </div>
              </Card>
            </div>
          </Card>
        </motion.div>
      )}

      {!loading && approvalStatus?.isApproved && (<>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-emerald-50 border-emerald-200 border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <FiCheckCircle className="text-emerald-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-800 text-sm">
                  Course Access Active
                </h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Your purchase has been approved. Full dashboard is now available.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-[22px]">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-[42px] h-[42px] rounded-[11px]" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div key={card.key} variants={item}>
                    <Link to={card.link}>
                      <Card hover className="p-[22px]">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-[42px] h-[42px] rounded-[11px] flex items-center justify-center ${card.color}`}>
                            <Icon className={`h-5 w-5 ${card.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-dark-500">{card.label}</p>
                            <p className="mt-0.5 text-xl font-bold text-ink break-words">
                              {card.value}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-[22px] h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-ink">Recent Courses</h2>
                <Link to="/student/courses" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                  View All <FiArrowRight size={12} />
                </Link>
              </div>
              {enrolled.length === 0 ? (
                <EmptyState
                  icon={FiBookOpen}
                  title="No courses yet"
                  description="Enroll in a course to start your learning journey."
                  action="Browse Courses"
                  onAction={() => (window.location.href = '/student/courses')}
                />
              ) : (
                <div className="space-y-3">
                  {enrolled.slice(0, 3).map((course, idx) => {
                    const courseId = course._id || course.id;
                    const progress = course.progress ?? course.enrollment?.progress ?? 0;
                    const totalLessons = course.totalLessons ?? course.lessons?.length ?? 0;
                    const completedLessons = course.completedLessons ?? course.enrollment?.completedLessons ?? 0;
                    const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress;

                    return (
                      <Link
                        key={courseId || idx}
                        to={`/student/courses/${course.slug || courseId}`}
                        className="flex items-center gap-3.5 p-3 rounded-[11px] hover:bg-dark-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-[11px] bg-gradient-to-br ${gradientPlaceholders[idx % gradientPlaceholders.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {course.title?.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">{course.title}</p>
                          <div className="mt-1.5 h-1 rounded-full bg-dark-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                              className="h-full rounded-full bg-primary-500"
                            />
                          </div>
                          <p className="mt-0.5 text-xs text-dark-500">{pct}% complete</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="p-[22px] h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-ink">Recent Signals</h2>
                <Link to="/student/signals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                  View All <FiArrowRight size={12} />
                </Link>
              </div>
              {signals.length === 0 ? (
                <EmptyState
                  icon={FiTrendingUp}
                  title="No signals yet"
                  description="Trading signals will appear here once published."
                />
              ) : (
                <div className="divide-y divide-dark-100">
                  {signals.slice(0, 5).map((signal, idx) => {
                    const signalId = signal._id || signal.id;
                    const action = signal.action || signal.type || 'BUY';
                    const pair = signal.pair || signal.symbol || '---';
                    const isPositive = action === 'BUY' || action === 'buy';
                    const profit = signal.profit ?? signal.pips ?? null;

                    return (
                      <div key={signalId || idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                              {action}
                            </span>
                            <span className="font-medium text-dark-700 text-sm">{pair}</span>
                          </div>
                          {signal.entryPrice && (
                            <p className="text-xs text-dark-500 mt-0.5">
                              Entry: {signal.entryPrice} {signal.stopLoss && `| SL: ${signal.stopLoss}`} {signal.takeProfit && `| TP: ${signal.takeProfit}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          {profit != null && (
                            <span className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {profit > 0 ? '+' : ''}{typeof profit === 'number' ? profit.toFixed(2) : profit}
                            </span>
                          )}
                          <p className="text-xs text-dark-400 mt-0.5">{formatDate(signal.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-[22px]">
            <h2 className="text-sm font-semibold text-ink mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Link to="/student/courses">
                <Button variant="outline" className="w-full justify-start gap-2.5 h-12 text-sm">
                  <FiBookOpen size={18} className="text-blue-500" />
                  <span>View Courses</span>
                </Button>
              </Link>
              <Link to="/student/signals">
                <Button variant="outline" className="w-full justify-start gap-2.5 h-12 text-sm">
                  <FiTrendingUp size={18} className="text-emerald-500" />
                  <span>Check Signals</span>
                </Button>
              </Link>
              <Link to="/student/wallet">
                <Button variant="outline" className="w-full justify-start gap-2.5 h-12 text-sm">
                  <FiCreditCard size={18} className="text-amber-500" />
                  <span>Wallet</span>
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </>)}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-[22px] h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-ink">Recent Courses</h2>
              <Link to="/student/courses" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                View All <FiArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <Skeleton count={3} className="h-14 w-full" />
            ) : enrolled.length === 0 ? (
              <EmptyState
                icon={FiBookOpen}
                title="No courses yet"
                description="Enroll in a course to start your learning journey."
                action="Browse Courses"
                onAction={() => (window.location.href = '/student/courses')}
              />
            ) : (
              <div className="space-y-3">
                {enrolled.map((course, idx) => {
                  const courseId = course._id || course.id;
                  const progress = course.progress ?? course.enrollment?.progress ?? 0;
                  const totalLessons = course.totalLessons ?? course.lessons?.length ?? 0;
                  const completedLessons = course.completedLessons ?? course.enrollment?.completedLessons ?? 0;
                  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : progress;

                  return (
                    <Link
                      key={courseId || idx}
                      to={`/student/courses/${course.slug || courseId}`}
                      className="flex items-center gap-3.5 p-3 rounded-[11px] hover:bg-dark-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-[11px] bg-gradient-to-br ${gradientPlaceholders[idx % gradientPlaceholders.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {course.title?.charAt(0) || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{course.title}</p>
                        <div className="mt-1.5 h-1 rounded-full bg-dark-100 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                            className="h-full rounded-full bg-primary-500"
                          />
                        </div>
                        <p className="mt-0.5 text-xs text-dark-500">{pct}% complete</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-[22px] h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-ink">Recent Signals</h2>
              <Link to="/student/signals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                View All <FiArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <Skeleton count={5} className="h-9 w-full" />
            ) : signals.length === 0 ? (
              <EmptyState
                icon={FiTrendingUp}
                title="No signals yet"
                description="Trading signals will appear here once published."
              />
            ) : (
              <div className="divide-y divide-dark-100">
                {signals.map((signal, idx) => {
                  const signalId = signal._id || signal.id;
                  const action = signal.action || signal.type || 'BUY';
                  const pair = signal.pair || signal.symbol || '---';
                  const isPositive = action === 'BUY' || action === 'buy';
                  const profit = signal.profit ?? signal.pips ?? null;

                  return (
                    <div key={signalId || idx} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                            {action}
                          </span>
                          <span className="font-medium text-dark-700 text-sm">{pair}</span>
                        </div>
                        {signal.entryPrice && (
                          <p className="text-xs text-dark-500 mt-0.5">
                            Entry: {signal.entryPrice} {signal.stopLoss && `| SL: ${signal.stopLoss}`} {signal.takeProfit && `| TP: ${signal.takeProfit}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        {profit != null && (
                          <span className={`text-xs font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {profit > 0 ? '+' : ''}{typeof profit === 'number' ? profit.toFixed(2) : profit}
                          </span>
                        )}
                        <p className="text-xs text-dark-400 mt-0.5">{formatDate(signal.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-4">
        <Card className="p-5">
          <SystemFlow compact />
        </Card>
      </motion.div>

      {!user?.isApproved && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="p-5 border-2 border-emerald-200 bg-emerald-50/50">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <FiDollarSign className="text-emerald-600" size={24} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-ink text-sm">Activate with Balance</h3>
                <p className="text-xs text-dark-500 mt-0.5">
                  {allWallets.length > 0
                    ? `Main: ${formatCurrency(allWallets.find(w => w.type === 'main')?.availableBalance || 0)} | Funding: ${formatCurrency(allWallets.find(w => w.type === 'funding')?.availableBalance || 0)}`
                    : 'Deposit USDT to get started.'}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={handleActivateWithBalance} loading={activating}>
                <FiShield size={16} /> Activate Now
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <Modal isOpen={showPinModal} onClose={() => { setShowPinModal(false); setPinError(''); }} title="Activate with PIN Code" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-dark-500">Enter your PIN code to activate your membership instantly.</p>
          <Input
            label="PIN Code"
            placeholder="Enter your PIN code"
            icon={FiTag}
            value={pinCode}
            onChange={(e) => { setPinCode(e.target.value.toUpperCase()); setPinError(''); }}
            error={pinError}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowPinModal(false); setPinError(''); }}>Cancel</Button>
            <Button onClick={handleActivateWithPin} loading={activating} disabled={!pinCode.trim()}>
              <FiShield size={16} /> Activate
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showUplineModal} onClose={() => { setShowUplineModal(false); setUplineError(''); }} title="Activate Downline Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-dark-500">Enter your direct downline member's email or username to activate their account. The activation fee will be deducted from your main wallet.</p>
          <Input
            label="Email or Username"
            placeholder="Enter member's email or username"
            icon={FiUsers}
            value={uplineEmail}
            onChange={(e) => { setUplineEmail(e.target.value); setUplineError(''); }}
            error={uplineError}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowUplineModal(false); setUplineError(''); }}>Cancel</Button>
            <Button onClick={handleUplineActivate} loading={activating} disabled={!uplineEmail.trim()}>
              <FiShield size={16} /> Activate Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
