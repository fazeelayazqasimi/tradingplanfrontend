import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiTrendingUp, FiUsers, FiDollarSign, FiBookOpen, FiBarChart2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const summaryCards = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: FiDollarSign,
    bg: 'bg-amber-50',
    color: 'text-amber-600',
    isCurrency: true,
  },
  {
    key: 'monthlyRevenue',
    label: 'Monthly Revenue',
    icon: FiBarChart2,
    bg: 'bg-indigo-50',
    color: 'text-indigo-600',
    isCurrency: true,
  },
  {
    key: 'activeSubscriptions',
    label: 'Active Subscriptions',
    icon: FiTrendingUp,
    bg: 'bg-emerald-50',
    color: 'text-emerald-600',
  },
  {
    key: 'totalStudents',
    label: 'Total Students',
    icon: FiUsers,
    bg: 'bg-primary-50',
    color: 'text-primary-500',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const periodOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatLabel(entry, period) {
  if (period === 'daily' && entry._id?.day) {
    return `${MONTH_NAMES[entry._id.month - 1] || ''} ${entry._id.day}`;
  }
  if (entry._id?.month) {
    return `${MONTH_NAMES[entry._id.month - 1] || ''} ${entry._id.year || ''}`;
  }
  return entry._id?.label || '';
}

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        setLoading(true);
        const data = await adminService.getDashboard();
        if (!cancelled) setStats(data.data || data);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Failed to load dashboard stats');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const fetchRevenue = useCallback(async () => {
    try {
      setRevenueLoading(true);
      const data = await adminService.getRevenue({ period });
      setRevenue(data.data || data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load revenue data');
    } finally {
      setRevenueLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  const chartData = revenue.map((entry) => ({
    name: formatLabel(entry, period),
    revenue: entry.revenue || 0,
    count: entry.count || 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[28px] font-extrabold text-ink leading-tight">Reports & Analytics</h1>
          <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
            Revenue insights and subscription trends
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          {summaryCards.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key] ?? 0;
            return (
              <motion.div key={card.key} variants={item}>
                <div className="group bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card hover:-translate-y-1.5 hover:shadow-card-md hover:border-primary-200 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-[42px] h-[42px] rounded-[11px] ${card.bg} ${card.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
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

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-[17px] font-semibold text-ink">Revenue Overview</h2>
        <div className="w-full sm:w-48">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={periodOptions}
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <h3 className="text-[15px] font-semibold text-ink mb-4">Revenue</h3>
          {revenueLoading ? (
            <Skeleton className="h-[320px] w-full rounded-[11px]" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[320px] text-dark-400 text-sm">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 11, border: '1px solid #e5e7eb', fontSize: 13 }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <h3 className="text-[15px] font-semibold text-ink mb-4">Subscriptions Over Time</h3>
          {revenueLoading ? (
            <Skeleton className="h-[320px] w-full rounded-[11px]" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-[320px] text-dark-400 text-sm">
              No subscription data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 11, border: '1px solid #e5e7eb', fontSize: 13 }}
                  formatter={(value) => [value, 'Subscriptions']}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
