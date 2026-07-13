import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiRefreshCw,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
import walletService from '../../services/walletService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const INCOME_LABELS = {
  direct_income: 'Direct Income',
  indirect_income: 'Indirect Income',
  trading_profit: 'Trading Profit',
  bonus: 'Bonus',
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'direct_income', label: 'Direct Income' },
  { value: 'indirect_income', label: 'Indirect Income' },
  { value: 'trading_profit', label: 'Trading Profit' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'subscription', label: 'Subscription' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');

  const { page, limit, nextPage, prevPage, goToPage } = usePagination(1, 10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, perPage: limit };
      if (category) params.category = category;
      if (type) params.type = type;
      const res = await walletService.getTransactions(params);
      const data = res?.data?.data || res?.data || res;
      const list = data?.transactions || data?.docs || (Array.isArray(data) ? data : []);
      setTransactions(list);
      setTotalPages(data?.totalPages || data?.pages || Math.ceil((data?.total || list.length) / limit) || 1);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [page, limit, category, type]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    goToPage(1);
  };

  const handleRefresh = () => {
    fetchTransactions();
    toast.success('Transactions refreshed');
  };

  const columns = [
    {
      header: 'Type',
      render: (row) => (
        <Badge color={row.type === 'credit' ? 'success' : 'danger'}>
          <span className="flex items-center gap-1">
            {row.type === 'credit' ? <FiArrowDown size={12} /> : <FiArrowUp size={12} />}
            {row.type === 'credit' ? 'Credit' : 'Debit'}
          </span>
        </Badge>
      ),
    },
    {
      header: 'Category',
      render: (row) => (
        <span className="text-dark-600 capitalize">
          {INCOME_LABELS[row.category] || row.category?.replace(/_/g, ' ') || '—'}
        </span>
      ),
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className={`font-semibold ${row.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
          {row.type === 'credit' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Description',
      render: (row) => (
        <span className="text-dark-500 max-w-[200px] truncate block">{row.description || '—'}</span>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-dark-500 text-xs">{formatDate(row.createdAt || row.date)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Transaction History</h1>
          <p className="mt-1 text-sm text-dark-500">View all your wallet transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
            <div className="flex items-center gap-2 text-dark-500">
              <FiFilter size={18} />
              <h2 className="text-lg font-semibold text-ink">All Transactions</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-48">
                <Select
                  options={CATEGORY_OPTIONS}
                  value={category}
                  onChange={handleFilterChange(setCategory)}
                  placeholder="Category"
                />
              </div>
              <div className="w-40">
                <Select
                  options={TYPE_OPTIONS}
                  value={type}
                  onChange={handleFilterChange(setType)}
                  placeholder="Type"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <Skeleton count={5} className="h-12 w-full" />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={FiDollarSign}
              title="No transactions found"
              description="Your transaction history will appear here."
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={transactions}
                page={page}
                totalPages={totalPages}
                onNextPage={nextPage}
                onPrevPage={prevPage}
                emptyMessage="No transactions found"
              />
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
