import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiCreditCard,
  FiDollarSign,
  FiClock,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiBookOpen,
  FiTrendingUp,
  FiCalendar,
  FiPieChart,
  FiLayers,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiPercent,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import SystemFlow from '../../components/website/SystemFlow';

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

const StatusBadge = ({ type, status }) => {
  const colors = {
    deposit: { pending: 'warning', approved: 'success', rejected: 'danger', failed: 'danger', expired: 'neutral' },
    withdrawal: { pending: 'warning', approved: 'info', processing: 'info', paid: 'success', rejected: 'danger', failed: 'danger' },
    subscription: { pending: 'warning', active: 'success', cancelled: 'danger', expired: 'neutral' },
  };
  const c = colors[type]?.[status] || 'neutral';
  return <Badge color={c}>{status}</Badge>;
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

  const s = stats || {};
  const d = s.deposits || {};
  const w = s.withdrawals || {};
  const wall = s.wallets || {};
  const ref = s.referrals || {};

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-extrabold text-ink leading-tight">Dashboard</h1>
            <p className="mt-1 text-[15px] text-dark-500">Loading overview...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[18px] border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
        {error}
      </div>
    );
  }

  const sections = [
    {
      title: 'Institute Overview',
      cards: [
        { key: 'totalStudents', label: 'Total Students', icon: FiUsers, value: s.totalStudents ?? 0, color: 'bg-primary-50 text-primary-500' },
        { key: 'activeSubscriptions', label: 'Active Subscriptions', icon: FiCreditCard, value: s.activeSubscriptions ?? 0, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'totalCourses', label: 'Total Courses', icon: FiBookOpen, value: s.totalCourses ?? 0, color: 'bg-violet-50 text-violet-600' },
        { key: 'totalSignals', label: 'Total Signals', icon: FiTrendingUp, value: s.totalSignals ?? 0, color: 'bg-cyan-50 text-cyan-600' },
      ],
    },
    {
      title: 'Revenue',
      cards: [
        { key: 'totalRevenue', label: 'Total Revenue (Courses)', icon: FiDollarSign, value: s.totalRevenue ?? 0, isCurrency: true, color: 'bg-amber-50 text-amber-600' },
        { key: 'subscriptionRevenue', label: 'Subscription Revenue', icon: FiCreditCard, value: s.subscriptionRevenue ?? 0, isCurrency: true, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: FiCalendar, value: s.monthlyRevenue ?? 0, isCurrency: true, color: 'bg-indigo-50 text-indigo-600' },
        { key: 'pendingApprovals', label: 'Pending Course Approvals', icon: FiClock, value: s.pendingApprovals ?? 0, color: 'bg-red-50 text-red-600' },
      ],
    },
    {
      title: 'Deposits',
      cards: [
        { key: 'depositsTotal', label: 'Total Deposits', icon: FiLayers, value: d.total ?? 0, color: 'bg-blue-50 text-blue-600' },
        { key: 'depositsAmount', label: 'Total Deposit Amount', icon: FiDollarSign, value: d.totalAmount ?? 0, isCurrency: true, color: 'bg-blue-50 text-blue-600' },
        { key: 'pendingDeposits', label: 'Pending Deposits', icon: FiClock, value: d.pending ?? 0, color: 'bg-amber-50 text-amber-600' },
        { key: 'pendingDepositAmount', label: 'Pending Deposit Amount', icon: FiArrowDownLeft, value: d.pendingAmount ?? 0, isCurrency: true, color: 'bg-amber-50 text-amber-600' },
        { key: 'approvedDeposits', label: 'Approved Deposits', icon: FiCheckCircle, value: d.approved ?? 0, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'approvedDepositAmount', label: 'Approved Deposit Amount', icon: FiDollarSign, value: d.approvedAmount ?? 0, isCurrency: true, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'rejectedDeposits', label: 'Rejected Deposits', icon: FiXCircle, value: d.rejected ?? 0, color: 'bg-red-50 text-red-600' },
        { key: 'failedDeposits', label: 'Failed / Expired', icon: FiAlertCircle, value: d.failed ?? 0, color: 'bg-red-50 text-red-600' },
      ],
    },
    {
      title: 'Withdrawals',
      cards: [
        { key: 'withdrawalsTotal', label: 'Total Withdrawals', icon: FiLayers, value: w.total ?? 0, color: 'bg-orange-50 text-orange-600' },
        { key: 'withdrawalsAmount', label: 'Total Withdrawal Amount', icon: FiArrowUpRight, value: w.totalAmount ?? 0, isCurrency: true, color: 'bg-orange-50 text-orange-600' },
        { key: 'pendingWithdrawals', label: 'Pending Withdrawals', icon: FiClock, value: w.pending ?? 0, color: 'bg-amber-50 text-amber-600' },
        { key: 'pendingWithdrawalAmount', label: 'Pending Withdrawal Amount', icon: FiArrowUpRight, value: w.pendingAmount ?? 0, isCurrency: true, color: 'bg-amber-50 text-amber-600' },
        { key: 'processingWithdrawals', label: 'Processing', icon: FiRefreshCw, value: w.processing ?? 0, color: 'bg-blue-50 text-blue-600' },
        { key: 'paidWithdrawals', label: 'Paid Withdrawals', icon: FiCheckCircle, value: w.paid ?? 0, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'paidWithdrawalAmount', label: 'Total Paid Out', icon: FiDollarSign, value: w.paidAmount ?? 0, isCurrency: true, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'failedWithdrawals', label: 'Failed Withdrawals', icon: FiAlertCircle, value: w.failed ?? 0, color: 'bg-red-50 text-red-600' },
      ],
    },
    {
      title: 'Wallet & Referrals',
      cards: [
        { key: 'totalBalance', label: 'Total Wallet Balance', icon: FiDollarSign, value: wall.totalBalance ?? 0, isCurrency: true, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'totalPendingBalance', label: 'Total Pending Balance', icon: FiClock, value: wall.totalPending ?? 0, isCurrency: true, color: 'bg-amber-50 text-amber-600' },
        { key: 'totalEarned', label: 'Total Earned (All Users)', icon: FiTrendingUp, value: wall.totalEarned ?? 0, isCurrency: true, color: 'bg-blue-50 text-blue-600' },
        { key: 'totalWithdrawn', label: 'Total Withdrawn (All Users)', icon: FiArrowUpRight, value: wall.totalWithdrawn ?? 0, isCurrency: true, color: 'bg-purple-50 text-purple-600' },
        { key: 'totalReferrals', label: 'Total Referrals', icon: FiUsers, value: ref.totalReferrals ?? 0, color: 'bg-indigo-50 text-indigo-600' },
        { key: 'convertedReferrals', label: 'Converted Referrals', icon: FiCheckCircle, value: ref.convertedCount ?? 0, color: 'bg-emerald-50 text-emerald-600' },
        { key: 'totalCommission', label: 'Total Commission Paid', icon: FiPercent, value: ref.totalCommission ?? 0, isCurrency: true, color: 'bg-violet-50 text-violet-600' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink leading-tight">Dashboard</h1>
          <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
            Complete overview of your trading institute
          </p>
        </div>
      </div>

      {sections.map((section, si) => (
        <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-ink">{section.title}</h2>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {section.cards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.key} variants={item}>
                  <div className="group bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card hover:-translate-y-1.5 hover:shadow-card-md hover:border-primary-200 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className={`w-[42px] h-[42px] rounded-[11px] ${card.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-dark-400 uppercase tracking-wider">
                          {card.label}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-ink tracking-tight">
                          {card.isCurrency ? formatCurrency(card.value) : (card.value ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      ))}

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="bg-white border border-dark-100 rounded-[18px] shadow-card">
          <div className="px-6 py-4 border-b border-dark-100">
            <h2 className="text-[17px] font-semibold text-ink">Recent Activity</h2>
          </div>
          {(!s.recentActivity || s.recentActivity.length === 0) ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[15px] text-dark-400">No recent activity</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-100">
              {s.recentActivity.map((activity, idx) => (
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
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge type={activity.type} status={activity.status} />
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      activity.type === 'subscription'
                        ? 'bg-emerald-50 text-emerald-600'
                        : activity.type === 'withdrawal'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-blue-50 text-primary-600'
                    }`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="p-6">
          <SystemFlow compact />
        </Card>
      </motion.div>
    </div>
  );
}
