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
  FiCopy,
  FiLink,
  FiShield,
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiTarget,
  FiVideo,
  FiRepeat,
  FiGift,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import referralService from '../../services/referralService';
import courseService from '../../services/courseService';
import signalService from '../../services/signalService';
import marketOverviewService from '../../services/marketOverviewService';
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

const quickLinks = [
  { label: 'New Signal', icon: FiTrendingUp, color: 'from-emerald-500 to-emerald-700', textColor: 'text-emerald-300', link: '/student/signals' },
  { label: 'Live Class', icon: FiVideo, color: 'from-violet-500 to-violet-700', textColor: 'text-violet-300', link: '/student/classes' },
  { label: 'Copy Trade', icon: FiRepeat, color: 'from-cyan-500 to-cyan-700', textColor: 'text-cyan-300', link: '/student/copy-trading' },
  { label: 'Affiliates', icon: FiGift, color: 'from-amber-500 to-amber-700', textColor: 'text-amber-300', link: '/student/referrals' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [signals, setSignals] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [allWallets, setAllWallets] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);
  const [todaySignalsCount, setTodaySignalsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [enrolledRes, signalsRes, walletRes, rankRes, overviewRes, signalsCountRes] = await Promise.allSettled([
          courseService.getEnrolled(),
          signalService.getSignals({ perPage: 5, sort: '-createdAt' }),
          walletService.getWallet('main'),
          studentService.getMyRank(),
          marketOverviewService.getMarketOverview(),
          signalService.getSignals({ status: 'open', isPublished: true, perPage: 1 }),
        ]);

        if (cancelled) return;

        const enrolledData = enrolledRes.status === 'fulfilled' ? enrolledRes.value : {};
        const coursesList = enrolledData.data?.courses || enrolledData.data?.data || enrolledData.courses || enrolledData.data || [];
        setEnrolled(Array.isArray(coursesList) ? coursesList.slice(0, 3) : []);

        const signalsData = signalsRes.status === 'fulfilled' ? signalsRes.value : {};
        const signalsBody = signalsData?.data || signalsData || {};
        const signalsList = signalsBody?.data || signalsBody?.signals || [];
        setSignals(Array.isArray(signalsList) ? signalsList.slice(0, 5) : []);

        if (walletRes.status === 'fulfilled' && walletRes.value) {
          const wd = walletRes.value.data || walletRes.value;
          setWallet(wd.availableBalance ?? wd.balance ?? 0);
          const walletsData = wd.wallets || (Array.isArray(wd) ? wd : []);
          setAllWallets(Array.isArray(walletsData) ? walletsData : []);
        }

        if (rankRes.status === 'fulfilled' && rankRes.value) {
          const rd = rankRes.value.data || rankRes.value;
          setRank(rd.rank || rd.data?.rank || null);
        }

        if (overviewRes.status === 'fulfilled' && overviewRes.value) {
          const od = overviewRes.value.data || overviewRes.value;
          setMarketOverview(od.data || od || {});
        }

        if (signalsCountRes.status === 'fulfilled' && signalsCountRes.value) {
          const sc = signalsCountRes.value.data || signalsCountRes.value;
          const scList = sc?.data || sc?.signals || sc || [];
          setTodaySignalsCount(Array.isArray(scList) ? scList.length : 0);
        }

        try {
          const refRes = await referralService.getReferralCode();
          const cd = refRes?.data?.data || refRes?.data || refRes;
          const code = cd?.code || cd?.referralCode || cd || '';
          setReferralCode(typeof code === 'string' ? code : code?.toString() || '');
        } catch { /* silent */ }

        try {
          const statsRes = await referralService.getStats();
          const statsData = statsRes?.data?.data || statsRes?.data || statsRes;
          setReferralStats(statsData);
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

  const totalReferrals = (referralStats?.directReferrals || 0) + (referralStats?.indirectReferrals || 0);
  const rewardCredits = referralStats?.totalEarnings || 0;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-600 text-white border-0 p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/80 uppercase tracking-widest mb-2">Welcome Back</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  {user?.firstName || 'Student'}!
                </h1>
                <p className="text-sm text-white/70 max-w-md">
                  {user?.subscription?.status === 'active' || user?.subscriptionStatus === 'active'
                    ? 'Your subscription is active. Keep learning and growing!'
                    : 'Activate your subscription to access all features.'}
                </p>
              </div>
              <div className="hidden sm:block w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <FiTarget size={12} /> Trading Education
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <FiTrendingUp size={12} /> Live Signals
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium">
                <FiAward size={12} /> Rank Progress
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FiTrendingUp size={16} />
              Today's Market Overview
            </h2>
            <span className="text-xs text-white/70">Live</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-white/70">Gold</span>
            {marketOverview?.goldTrend === 'bullish' && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                <FiArrowUp size={12} /> Bullish
              </span>
            )}
            {marketOverview?.goldTrend === 'bearish' && (
              <span className="inline-flex items-center gap-1 bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                <FiArrowDown size={12} /> Bearish
              </span>
            )}
            {marketOverview?.goldTrend === 'neutral' && (
              <span className="inline-flex items-center gap-1 bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                <FiMinus size={12} /> Neutral
              </span>
            )}
          </div>

          {marketOverview?.marketNews && (
            <div className="mb-3">
              <p className="text-xs font-medium text-white/70 mb-1">Market News</p>
              <p className="text-sm text-white/90 truncate">{marketOverview.marketNews}</p>
            </div>
          )}

          {marketOverview?.nextLiveClassDate && (
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiClock size={14} className="text-white/60" />
                <div>
                  <p className="text-xs font-medium text-white/70">Next Live Class</p>
                  <p className="text-sm text-white/90">
                    {marketOverview.nextLiveClassDate} at {marketOverview.nextLiveClassTime}
                  </p>
                </div>
              </div>
              {marketOverview.nextLiveClassLink && (
                <a
                  href={marketOverview.nextLiveClassLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                >
                  Join
                </a>
              )}
            </div>
          )}

          {marketOverview?.dailyMarketSummary && (
            <div className="mb-3">
              <p className="text-xs font-medium text-white/70 mb-1">Daily Summary</p>
              <p className="text-sm text-white/90">{marketOverview.dailyMarketSummary}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-3 border-t border-white/20">
            <FiActivity size={14} className="text-white/60" />
            <span className="text-xs font-medium text-white/70">Today's Open Signals</span>
            <span className="ml-auto text-lg font-bold text-white">{todaySignalsCount}</span>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
          <FiTarget size={16} className="text-primary-500" />
          Quick Links
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((ql) => {
            const Icon = ql.icon;
            return (
              <Link key={ql.label} to={ql.link}>
                <Card className="p-4 group hover:shadow-lg transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ql.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <p className="text-sm font-semibold text-ink">{ql.label}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {referralCode && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-primary-50 to-emerald-50 border-primary-200 border">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white">
                  <FiUsers size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-ink">Referral Rewards</h2>
                  <p className="text-xs text-dark-500">Invite friends to earn rewards</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-dark-500 mb-1">Invite Friends</p>
                  <p className="text-sm text-dark-600">Share your referral link and earn $1 credit per signup</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/register?ref=${referralCode}`}
                  className="flex-1 text-sm font-mono text-ink bg-white border border-primary-200 rounded-xl px-4 py-2.5 outline-none"
                />
                <button
                  onClick={() => {
                    copyToClipboard(`${window.location.origin}/register?ref=${referralCode}`);
                    setCopied(true);
                    toast.success('Referral link copied!');
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shrink-0"
                >
                  {copied ? <FiCheckCircle size={18} /> : <FiCopy size={18} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-primary-100">
                  <p className="text-xs font-medium text-dark-500">Total Referrals</p>
                  <p className="mt-1 text-xl font-bold text-primary-600">{totalReferrals}</p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-primary-100">
                  <p className="text-xs font-medium text-dark-500">Reward Credits</p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">{formatCurrency(rewardCredits)}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {!loading && !user?.isApproved && (
        <motion.div variants={item}>
          <Card variant="warning" className="p-5 flex items-center gap-3">
            <FiShield className="w-8 h-8 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-ink">Account Not Activated</p>
              <p className="text-sm text-dark-500">Activate your account to access all features.</p>
            </div>
            <Link to="/student/activation">
              <Button variant="primary" size="sm">Activate Now</Button>
            </Link>
          </Card>
        </motion.div>
      )}

      {!loading && user?.isApproved && (
        <>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5 bg-emerald-50 border-emerald-200 border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <FiCheckCircle className="text-emerald-600" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-800 text-sm">Course Access Active</h3>
                  <p className="text-sm text-emerald-700 mt-1">Your purchase has been approved. Full dashboard is now available.</p>
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
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

          {referralStats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <Card className="p-[22px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
                    <FiUsers size={16} className="text-primary-500" />
                    My Team
                  </h2>
                  <Link to="/student/team" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
                    View All <FiArrowRight size={12} />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs font-medium text-blue-600">Total Downlines</p>
                    <p className="mt-1 text-xl font-bold text-blue-700">{(referralStats.directReferrals || 0) + (referralStats.indirectReferrals || 0)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-600">Direct</p>
                    <p className="mt-1 text-xl font-bold text-emerald-700">{referralStats.directReferrals || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                    <p className="text-xs font-medium text-violet-600">Indirect</p>
                    <p className="mt-1 text-xl font-bold text-violet-700">{referralStats.indirectReferrals || 0}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs font-medium text-amber-600">Active</p>
                    <p className="mt-1 text-xl font-bold text-amber-700">{referralStats.activeReferrals || 0}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </>
      )}

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
    </div>
  );
}