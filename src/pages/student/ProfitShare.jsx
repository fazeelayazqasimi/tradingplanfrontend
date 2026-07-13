import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiDollarSign,
  FiPieChart,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import walletService from '../../services/walletService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const CHART_COLORS = ['#10B981', '#2563EB', '#F59E0B', '#8B5CF6'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function ProfitShare() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await walletService.getStats();
      const data = res?.data?.data || res?.data || res;
      setStats(data);
    } catch {
      toast.error('Failed to load profit share data');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await walletService.getTransactions({ page: 1, perPage: 10, type: 'credit' });
      const data = res?.data?.data || res?.data || res;
      const list = data?.transactions || data?.docs || (Array.isArray(data) ? data : []);
      setTransactions(list);
    } catch {
      toast.error('Failed to load recent payouts');
    } finally {
      setLoadingTx(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      await Promise.all([fetchStats(), fetchTransactions()]);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [fetchStats, fetchTransactions]);

  const handleRefresh = () => {
    setLoading(true);
    setLoadingTx(true);
    Promise.all([fetchStats(), fetchTransactions()]).then(() => {
      toast.success('Profit share data refreshed');
    });
  };

  const byCategory = stats?.byCategory || {};

  const directIncome = byCategory.direct_income ?? stats?.directIncome ?? stats?.direct_income ?? 0;
  const indirectIncome = byCategory.indirect_income ?? stats?.indirectIncome ?? stats?.indirect_income ?? 0;
  const tradingProfit = byCategory.trading_profit ?? stats?.tradingProfit ?? stats?.trading_profit ?? 0;
  const bonus = byCategory.bonus ?? stats?.bonus ?? 0;

  const chartData = [
    { name: 'Direct Income', value: directIncome },
    { name: 'Indirect Income', value: indirectIncome },
    { name: 'Trading Profit', value: tradingProfit },
    { name: 'Bonus', value: bonus },
  ].filter((d) => d.value > 0);

  const summaryCards = [
    {
      key: 'direct',
      label: 'Direct Earnings',
      icon: FiTrendingUp,
      value: directIncome,
      badgeColor: 'success',
      badgeText: 'Direct',
      color: 'bg-emerald-50 text-emerald-500',
    },
    {
      key: 'indirect',
      label: 'Indirect Earnings',
      icon: FiDollarSign,
      value: indirectIncome,
      badgeColor: 'info',
      badgeText: 'Indirect',
      color: 'bg-blue-50 text-blue-500',
    },
    {
      key: 'trading',
      label: 'Trading Profit',
      icon: FiPieChart,
      value: tradingProfit,
      badgeColor: 'warning',
      badgeText: 'Trading',
      color: 'bg-amber-50 text-amber-500',
    },
    {
      key: 'bonus',
      label: 'Bonus',
      icon: FiTrendingUp,
      value: bonus,
      badgeColor: 'purple',
      badgeText: 'Bonus',
      color: 'bg-purple-50 text-purple-500',
    },
  ];

  const recentPayouts = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Profit Share</h1>
          <p className="mt-1 text-sm text-dark-500">View your profit share distribution and earnings breakdown</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || loadingTx}>
            <FiRefreshCw size={16} className={loading || loadingTx ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
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
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key} variants={item}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[11px] ${card.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-dark-500">{card.label}</p>
                      <p className="mt-1 text-2xl font-bold text-ink">
                        {formatCurrency(card.value)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge color={card.badgeColor}>{card.badgeText}</Badge>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-ink">Income Sources</h2>
            </div>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-dark-400 text-sm">
                No income data available yet
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        color: '#1a1a2e',
                        fontSize: '13px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => <span className="text-sm text-dark-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-5 h-full">
            <h2 className="text-lg font-semibold text-ink mb-4">Earnings Summary</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Direct Income', value: directIncome, color: 'bg-emerald-500' },
                  { label: 'Indirect Income', value: indirectIncome, color: 'bg-blue-500' },
                  { label: 'Trading Profit', value: tradingProfit, color: 'bg-amber-500' },
                  { label: 'Bonus', value: bonus, color: 'bg-purple-500' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      <span className="text-sm text-dark-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-ink">{formatCurrency(s.value)}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-dark-700">Total Earned</span>
                    <span className="text-lg font-bold text-ink">
                      {formatCurrency(stats?.totalEarned ?? stats?.total_earned ?? 0)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-dark-700">Total Withdrawn</span>
                  <span className="text-lg font-bold text-red-500">
                    {formatCurrency(stats?.totalWithdrawn ?? stats?.total_withdrawn ?? 0)}
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-dark-700">Available Balance</span>
                    <span className="text-lg font-bold text-emerald-600">
                      {formatCurrency(stats?.available ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-ink">Recent Payouts</h2>
          </div>

          {loadingTx ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : recentPayouts.length === 0 ? (
            <EmptyState
              icon={FiDollarSign}
              title="No payouts yet"
              description="Your profit share payouts will appear here once you start earning."
            />
          ) : (
            <div className="space-y-3">
              {recentPayouts.map((tx, idx) => (
                <motion.div
                  key={tx._id || tx.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-dark-50 hover:bg-dark-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                      <FiArrowDown className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate max-w-[250px]">
                        {tx.description || 'Profit Share Payout'}
                      </p>
                      <p className="text-xs text-dark-500 mt-0.5">
                        {formatDate(tx.createdAt || tx.date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                    +{formatCurrency(tx.amount)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
