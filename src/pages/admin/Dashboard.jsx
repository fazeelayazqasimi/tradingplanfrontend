import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiCreditCard,
  FiDollarSign,
  FiClock,
  FiArrowUpRight,
  FiBookOpen,
  FiTrendingUp,
  FiCalendar,
} from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import SystemFlow from '../../components/website/SystemFlow';

const statCards = [
  {
    key: 'totalStudents',
    label: 'Total Students',
    icon: FiUsers,
    lightColor: 'bg-primary-50',
    iconColor: 'text-primary-500',
  },
  {
    key: 'activeSubscriptions',
    label: 'Active Subscriptions',
    icon: FiCreditCard,
    lightColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: FiDollarSign,
    lightColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    isCurrency: true,
  },
  {
    key: 'pendingApprovals',
    label: 'Pending Approvals',
    icon: FiClock,
    lightColor: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    key: 'pendingWithdrawals',
    label: 'Pending Withdrawals',
    icon: FiArrowUpRight,
    lightColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    key: 'totalCourses',
    label: 'Total Courses',
    icon: FiBookOpen,
    lightColor: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    key: 'totalSignals',
    label: 'Total Signals',
    icon: FiTrendingUp,
    lightColor: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    key: 'monthlyRevenue',
    label: 'Monthly Revenue',
    icon: FiCalendar,
    lightColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    isCurrency: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const dbRes = await adminService.getDashboard();
        if (!cancelled) setStats(dbRes.data || dbRes);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink leading-tight">Dashboard</h1>
          <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
            Overview of your trading institute
          </p>
        </div>
        {!loading && stats?.lastUpdated && (
          <span className="inline-flex items-center rounded-full bg-dark-100 px-2.5 py-0.5 text-[11px] font-semibold text-dark-600">
            Updated {formatDate(stats.lastUpdated)}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
              <div className="flex items-center gap-4">
                <Skeleton className="h-[42px] w-[42px] rounded-[11px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key] ?? 0;

            return (
              <motion.div key={card.key} variants={item}>
                <div className="group bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card hover:-translate-y-1.5 hover:shadow-card-md hover:border-primary-200 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-[42px] h-[42px] rounded-[11px] ${card.lightColor} ${card.iconColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-dark-400 uppercase tracking-wider">
                        {card.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-ink tracking-tight">
                        {card.isCurrency ? formatCurrency(value) : value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && stats?.recentActivity && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white border border-dark-100 rounded-[18px] shadow-card">
            <div className="px-6 py-4 border-b border-dark-100">
              <h2 className="text-[17px] font-semibold text-ink">Recent Activity</h2>
            </div>
            {stats.recentActivity.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-[15px] text-dark-400">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-100">
                {stats.recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-6 py-4 hover:bg-dark-50/50 transition-colors duration-150"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-dark-500 truncate">
                        {activity.description}
                      </p>
                      <p className="mt-0.5 text-xs text-dark-400">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <span
                      className={`ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        activity.type === 'subscription'
                          ? 'bg-emerald-50 text-emerald-600'
                          : activity.type === 'withdrawal'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-primary-600'
                      }`}
                    >
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8">
        <Card className="p-6">
          <SystemFlow compact />
        </Card>
      </motion.div>
    </div>
  );
}
