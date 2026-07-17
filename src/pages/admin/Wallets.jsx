import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiDollarSign,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
  FiPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Input from '../../components/ui/Input';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const statCards = [
  {
    key: 'totalWallets',
    label: 'Total Wallets',
    icon: FiCreditCard,
    lightColor: 'bg-primary-50',
    iconColor: 'text-primary-500',
  },
  {
    key: 'totalBalance',
    label: 'Total Balance',
    icon: FiDollarSign,
    lightColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    isCurrency: true,
  },
  {
    key: 'totalPending',
    label: 'Total Pending',
    icon: FiClock,
    lightColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    isCurrency: true,
  },
  {
    key: 'totalWithdrawn',
    label: 'Total Withdrawn',
    icon: FiTrendingUp,
    lightColor: 'bg-red-50',
    iconColor: 'text-red-600',
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

const categories = [
  { value: 'bonus', label: 'Bonus' },
  { value: 'direct_income', label: 'Direct Income' },
  { value: 'indirect_income', label: 'Indirect Income' },
];

const categoryColor = {
  bonus: 'success',
  direct_income: 'primary',
  indirect_income: 'warning',
};

const columns = [
  {
    key: 'avatar',
    header: '',
    width: 'w-10',
    render: (_, row) => (
      <img
        src={
          row.user?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            (row.user?.firstName || '') + ' ' + (row.user?.lastName || '')
          )}&background=2563EB&color=fff&size=40`
        }
        alt={row.user?.firstName}
        className="h-9 w-9 rounded-xl object-cover ring-2 ring-dark-100"
      />
    ),
  },
  {
    key: 'student',
    header: 'Student',
    render: (_, row) => (
      <div>
        <p className="font-semibold text-ink text-sm">
          {row.user?.firstName} {row.user?.lastName}
        </p>
        <p className="text-xs text-dark-400 mt-0.5">{row.user?.email}</p>
      </div>
    ),
  },
  {
    key: 'balance',
    header: 'Available Balance',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-ink">
        {formatCurrency(row.balance)}
      </span>
    ),
  },
  {
    key: 'pendingBalance',
    header: 'Pending Balance',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-amber-600">
        {formatCurrency(row.pendingBalance)}
      </span>
    ),
  },
  {
    key: 'totalEarned',
    header: 'Total Earned',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-emerald-600">
        {formatCurrency(row.totalEarned)}
      </span>
    ),
  },
  {
    key: 'totalWithdrawn',
    header: 'Total Withdrawn',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-dark-500">
        {formatCurrency(row.totalWithdrawn)}
      </span>
    ),
  },
];

const defaultForm = { amount: '', category: 'bonus', description: '' };

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [creditOpen, setCreditOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const pagination = usePagination({ totalItems: wallets.length, perPage: 10 });

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await adminService.getWalletStats();
      setStats(data.data || data);
    } catch (err) {
      // silent
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllWallets({
        search: searchQuery,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setWallets(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
  };

  const handleOpenCredit = (wallet) => {
    setSelectedWallet(wallet);
    setForm(defaultForm);
    setErrors({});
    setCreditOpen(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount greater than 0';
    }
    if (!form.category) {
      newErrors.category = 'Select a category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCredit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await adminService.creditWallet(selectedWallet.user?.id || selectedWallet.userId, {
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
      });
      toast.success('Wallet credited successfully');
      setCreditOpen(false);
      setSelectedWallet(null);
      setForm(defaultForm);
      fetchWallets();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to credit wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const actionColumn = {
    key: 'actions',
    header: 'Actions',
    width: 'w-24',
    render: (_, row) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleOpenCredit(row)}
          className="rounded-xl p-2 text-dark-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200"
          title="Credit Wallet"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      </div>
    ),
  };

  const allColumns = [...columns, actionColumn];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink leading-tight">Wallets</h1>
        <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
          Manage student wallets and balances
        </p>
      </div>

      {statsLoading ? (
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
          {statCards.map((card) => {
            const Icon = card.icon;
            const value = stats?.[card.key] ?? 0;

            return (
              <motion.div key={card.key} variants={item}>
                <div className="group bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card hover:-translate-y-1.5 hover:shadow-card-md hover:border-primary-200 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-[42px] h-[42px] rounded-[11px] ${card.lightColor} ${card.iconColor} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    >
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

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-10 pr-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <DataTable
          columns={allColumns}
          data={wallets}
          loading={loading}
          emptyMessage="No wallets found"
          rowKey="id"
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dark-100">
            <p className="text-sm text-dark-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} wallets)
            </p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm" onClick={pagination.prevPage} disabled={pagination.currentPage <= 1}>
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={page === pagination.currentPage ? 'primary' : 'outline'} size="sm" onClick={() => pagination.goToPage(page)}>{page}</Button>
              ))}
              <Button variant="outline" size="sm" onClick={pagination.nextPage} disabled={pagination.currentPage >= pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={creditOpen}
        onClose={() => setCreditOpen(false)}
        title="Credit Wallet"
        size="md"
      >
        {selectedWallet && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedWallet.user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    (selectedWallet.user?.firstName || '') + ' ' + (selectedWallet.user?.lastName || '')
                  )}&background=2563EB&color=fff&size=64`
                }
                alt={selectedWallet.user?.firstName}
                className="h-14 w-14 rounded-2xl object-cover ring-4 ring-primary-50"
              />
              <div>
                <h3 className="text-base font-bold text-ink">
                  {selectedWallet.user?.firstName} {selectedWallet.user?.lastName}
                </h3>
                <p className="text-sm text-dark-400 mt-0.5">
                  {selectedWallet.user?.email}
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  Current Balance: <span className="font-semibold text-ink">{formatCurrency(selectedWallet.balance)}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleCredit} className="space-y-4">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                icon={FiDollarSign}
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                error={errors.amount}
              />

              <div className="w-full">
                <label className="block text-[13px] font-semibold text-ink mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => handleChange('category', cat.value)}
                      className={`rounded-[11px] border px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        form.category === cat.value
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-dark-200 bg-dark-50 text-dark-500 hover:border-dark-300'
                      }`}
                    >
                      <Badge color={form.category === cat.value ? categoryColor[cat.value] : 'neutral'}>
                        {cat.label}
                      </Badge>
                    </button>
                  ))}
                </div>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="w-full">
                <label className="block text-[13px] font-semibold text-ink mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional description for this credit..."
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" loading={submitting} variant="success">
                  Credit Wallet
                </Button>
                <Button variant="outline" onClick={() => setCreditOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
