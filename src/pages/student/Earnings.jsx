import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDollarSign, FiTrendingUp, FiAward, FiDownload, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import walletService from '../../services/walletService';
import { formatCurrency } from '../../utils/helpers';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Earnings() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, txRes] = await Promise.allSettled([
        walletService.getStats(),
        walletService.getTransactions({ limit: 20, type: 'credit' }),
      ]);

      if (statsRes.status === 'fulfilled') {
        const sd = statsRes.value?.data?.data || statsRes.value?.data || statsRes.value;
        setStats(sd);
      }
      if (txRes.status === 'fulfilled') {
        const td = txRes.value?.data?.data || txRes.value?.data?.transactions || txRes.value?.data || [];
        setTransactions(Array.isArray(td) ? td : []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const byCategory = stats?.byCategory || {};
  const pieData = Object.entries(byCategory)
    .filter(([, val]) => val > 0)
    .map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
    }));

  const barData = transactions.slice(0, 10).reverse().map(tx => ({
    date: new Date(tx.createdAt).toLocaleDateString(),
    amount: tx.amount,
    category: tx.category,
  }));

  const summaryCards = [
    { label: 'Total Earned', value: stats?.totalEarned || 0, icon: FiDollarSign, color: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Available Balance', value: stats?.available || 0, icon: FiTrendingUp, color: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { label: 'Pending Balance', value: stats?.pending || 0, icon: FiAward, color: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Total Withdrawn', value: stats?.totalWithdrawn || 0, icon: FiDownload, color: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-ink">Earnings</h1>
          <p className="text-sm text-dark-500 mt-0.5">All your earnings and income reports in one place.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchData(); toast.success('Refreshed'); }}>
          <FiRefreshCw className="mr-1" /> Refresh
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4"><Skeleton className="h-16" /></Card>
          ))
        ) : (
          summaryCards.map(card => (
            <Card key={card.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-dark-500 truncate">{card.label}</p>
                  <p className="text-sm font-bold text-ink">{formatCurrency(card.value)}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div variants={item}>
          <Card className="p-5">
            <h3 className="font-semibold text-ink text-sm mb-4">Income Breakdown</h3>
            {loading ? (
              <Skeleton className="h-48" />
            ) : pieData.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-8">No income data yet</p>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[200px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val) => formatCurrency(val)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full mt-3 space-y-1.5">
                  {pieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-dark-600">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {entry.name}
                      </span>
                      <span className="font-medium text-ink">{formatCurrency(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="p-5">
            <h3 className="font-semibold text-ink text-sm mb-4">Recent Earnings</h3>
            {loading ? (
              <Skeleton className="h-48" />
            ) : transactions.length === 0 ? (
              <p className="text-sm text-dark-400 text-center py-8">No recent earnings</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between py-1.5 border-b border-dark-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink truncate">{tx.description || tx.category}</p>
                      <p className="text-[11px] text-dark-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 shrink-0">+{formatCurrency(tx.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
