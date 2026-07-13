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
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import studentService from '../../services/studentService';
import courseService from '../../services/courseService';
import signalService from '../../services/signalService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getInitials } from '../../utils/helpers';
import { STATUS_COLORS } from '../../constants/index';

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
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [enrolledRes, signalsRes, walletRes, rankRes] = await Promise.allSettled([
          courseService.getEnrolled(),
          signalService.getSignals({ perPage: 5, sort: '-createdAt' }),
          studentService.getCopyStats().catch(() => null),
          studentService.getMyRank(),
        ]);

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

        if (rankRes.status === 'fulfilled' && rankRes.value) {
          const rd = rankRes.value.data || rankRes.value;
          setRank(rd.rank || rd.data?.rank || null);
        }
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
            <h1 className="text-lg font-bold text-ink">
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-[22px]">
              <div className="flex items-center gap-4">
                <Skeleton className="w-[42px] h-[42px] rounded-[11px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
                        <p className="truncate text-xs font-medium text-dark-500">{card.label}</p>
                        <p className="mt-0.5 text-xl font-bold text-ink">
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
    </div>
  );
}
