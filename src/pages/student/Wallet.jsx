import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiCreditCard,
  FiRefreshCw,
  FiPlus,
  FiLayers,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import walletService from '../../services/walletService';
import studentService from '../../services/studentService';
import depositService from '../../services/depositService';
import paymentAccountService from '../../services/paymentAccountService';
import { formatCurrency, formatDate, copyToClipboard } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const CHART_COLORS = ['#10B981', '#2563EB', '#F59E0B', '#8B5CF6'];

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

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'mobile_money', label: 'Mobile Money' },
];

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    paymentMethod: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [depositForm, setDepositForm] = useState({ accountId: '', amount: '' });
  const [depositErrors, setDepositErrors] = useState({});
  const [depositHistory, setDepositHistory] = useState([]);

  const { page, limit, nextPage, prevPage, goToPage } = usePagination(1, 10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await walletService.getWallet();
      const data = res?.data?.data || res?.data || res;
      setWallet(data);
    } catch {
      toast.error('Failed to load wallet data');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await walletService.getStats();
      const data = res?.data?.data || res?.data || res;
      setStats(data);
    } catch {
      toast.error('Failed to load wallet stats');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
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
      setLoadingTx(false);
    }
  }, [page, limit, category, type]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      await Promise.all([fetchWallet(), fetchStats()]);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [fetchWallet, fetchStats]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const fetchPaymentAccounts = useCallback(async () => {
    try {
      const res = await paymentAccountService.getAccounts();
      const data = res?.data?.data || res?.data || res;
      setPaymentAccounts(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
  }, []);

  const fetchDepositHistory = useCallback(async () => {
    try {
      const res = await depositService.getMyDeposits();
      const data = res?.data?.data || res?.data || res;
      setDepositHistory(data?.docs || (Array.isArray(data) ? data : []));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPaymentAccounts();
    fetchDepositHistory();
  }, [fetchPaymentAccounts, fetchDepositHistory]);

  const validateDeposit = () => {
    const errors = {};
    if (!depositForm.accountId) errors.accountId = 'Select a payment account';
    const amt = parseFloat(depositForm.amount);
    if (!depositForm.amount || isNaN(amt) || amt <= 0) errors.amount = 'Enter a valid amount';
    setDepositErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeposit = async () => {
    if (!validateDeposit()) return;
    setSubmitting(true);
    try {
      await depositService.createDeposit({
        accountId: depositForm.accountId,
        amount: parseFloat(depositForm.amount),
      });
      toast.success('Deposit request submitted! Admin will verify and approve.');
      setShowDeposit(false);
      setDepositForm({ accountId: '', amount: '' });
      setDepositErrors({});
      fetchDepositHistory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit deposit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    goToPage(1);
  };

  const handleRefresh = () => {
    fetchWallet();
    fetchStats();
    fetchTransactions();
    toast.success('Wallet data refreshed');
  };

  const chartData = stats
    ? [
        { name: 'Direct Income', value: stats.directIncome ?? stats.direct_income ?? 0 },
        { name: 'Indirect Income', value: stats.indirectIncome ?? stats.indirect_income ?? 0 },
        { name: 'Trading Profit', value: stats.tradingProfit ?? stats.trading_profit ?? 0 },
        { name: 'Bonus', value: stats.bonus ?? 0 },
      ].filter((d) => d.value > 0)
    : [];

  const summaryCards = [
    {
      key: 'available',
      label: 'Available Balance',
      icon: FiDollarSign,
      value: wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0,
      color: 'bg-emerald-50 text-emerald-500',
    },
    {
      key: 'pending',
      label: 'Pending Balance',
      icon: FiClock,
      value: wallet?.pendingBalance ?? wallet?.pending ?? 0,
      color: 'bg-amber-50 text-amber-500',
    },
    {
      key: 'earned',
      label: 'Total Earned',
      icon: FiTrendingUp,
      value: wallet?.totalEarned ?? wallet?.total_earned ?? 0,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      key: 'withdrawn',
      label: 'Total Withdrawn',
      icon: FiArrowUp,
      value: wallet?.totalWithdrawn ?? wallet?.total_withdrawn ?? 0,
      color: 'bg-purple-50 text-purple-500',
    },
  ];

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
          {INCOME_LABELS[row.category] || row.category?.replace(/_/g, ' ') || '\u2014'}
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
        <span className="text-dark-500 max-w-[200px] truncate block">{row.description || '\u2014'}</span>
      ),
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-dark-500 text-xs">{formatDate(row.createdAt || row.date)}</span>
      ),
    },
  ];

  const validateWithdraw = () => {
    const errors = {};
    const amt = parseFloat(withdrawForm.amount);
    if (!withdrawForm.amount || isNaN(amt) || amt <= 0) {
      errors.amount = 'Enter a valid amount';
    }
    const available = wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0;
    if (amt > available) {
      errors.amount = 'Insufficient balance';
    }
    if (!withdrawForm.paymentMethod) {
      errors.paymentMethod = 'Select a payment method';
    }
    if (!withdrawForm.accountNumber?.trim()) {
      errors.accountNumber = 'Account number is required';
    }
    if (!withdrawForm.accountName?.trim()) {
      errors.accountName = 'Account name is required';
    }
    if ((withdrawForm.paymentMethod === 'bank_transfer') && !withdrawForm.bankName?.trim()) {
      errors.bankName = 'Bank name is required for bank transfers';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleWithdraw = async () => {
    if (!validateWithdraw()) return;
    setSubmitting(true);
    try {
      await studentService.requestWithdrawal({
        amount: parseFloat(withdrawForm.amount),
        paymentMethod: withdrawForm.paymentMethod,
        accountNumber: withdrawForm.accountNumber.trim(),
        accountName: withdrawForm.accountName.trim(),
        bankName: withdrawForm.bankName.trim() || undefined,
      });
      toast.success('Withdrawal request submitted successfully');
      setShowWithdraw(false);
      setWithdrawForm({ amount: '', paymentMethod: '', accountNumber: '', accountName: '', bankName: '' });
      setFormErrors({});
      fetchWallet();
      fetchStats();
      fetchTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const updateWithdrawField = (field) => (e) => {
    setWithdrawForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Wallet</h1>
          <p className="mt-1 text-sm text-dark-500">Manage your finances and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || loadingTx}>
            <FiRefreshCw size={16} className={loading || loadingTx ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setDepositForm({ accountId: '', amount: '' }); setDepositErrors({}); setShowDeposit(true); }}>
            <FiPlus size={16} />
            Deposit
          </Button>
          <Button size="sm" onClick={() => setShowWithdraw(true)}>
            <FiCreditCard size={16} />
            Withdraw
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
              <h2 className="text-lg font-semibold text-ink">Income Breakdown</h2>
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
            <h2 className="text-lg font-semibold text-ink mb-4">Summary</h2>
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
                  { label: 'Direct Income', value: stats?.directIncome ?? stats?.direct_income ?? 0, color: 'bg-emerald-500' },
                  { label: 'Indirect Income', value: stats?.indirectIncome ?? stats?.indirect_income ?? 0, color: 'bg-blue-500' },
                  { label: 'Trading Profit', value: stats?.tradingProfit ?? stats?.trading_profit ?? 0, color: 'bg-amber-500' },
                  { label: 'Bonus', value: stats?.bonus ?? 0, color: 'bg-purple-500' },
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
                    <span className="text-sm font-medium text-dark-700">Net Balance</span>
                    <span className="text-lg font-bold text-ink">
                      {formatCurrency(
                        (stats?.directIncome ?? stats?.direct_income ?? 0) +
                        (stats?.indirectIncome ?? stats?.indirect_income ?? 0) +
                        (stats?.tradingProfit ?? stats?.trading_profit ?? 0) +
                        (stats?.bonus ?? 0)
                      )}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
            <h2 className="text-lg font-semibold text-ink">Transaction History</h2>
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

          {loadingTx ? (
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-ink">Deposit History</h2>
          </div>
          {depositHistory.length === 0 ? (
            <EmptyState icon={FiLayers} title="No deposits yet" description="Submit a deposit request to fund your wallet." />
          ) : (
            <div className="space-y-2">
              {depositHistory.slice(0, 5).map((dep) => {
                const statusColors = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700' };
                return (
                  <div key={dep._id} className="flex items-center justify-between p-3 rounded-xl bg-dark-50/50">
                    <div>
                      <p className="text-sm font-semibold text-ink">{formatCurrency(dep.amount)}</p>
                      <p className="text-xs text-dark-400">{dep.accountId?.bankName || 'Account'} &middot; {formatDate(dep.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[dep.status] || 'bg-dark-100 text-dark-600'}`}>
                      {dep.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      <Modal isOpen={showDeposit} onClose={() => { setShowDeposit(false); setDepositErrors({}); }} title="Deposit to Wallet" size="md">
        <div className="space-y-4">
          <p className="text-sm text-dark-500">Select a payment account and enter the amount you want to deposit. Admin will verify and approve your request.</p>

          {paymentAccounts.length === 0 ? (
            <div className="p-6 text-center text-dark-400 text-sm bg-dark-50 rounded-xl">
              No payment accounts available yet. Please contact admin.
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {paymentAccounts.map((acc) => (
                <label
                  key={acc._id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    depositForm.accountId === acc._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-dark-100 bg-white hover:border-dark-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="account"
                    value={acc._id}
                    checked={depositForm.accountId === acc._id}
                    onChange={(e) => setDepositForm((p) => ({ ...p, accountId: e.target.value }))}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <FiLayers size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{acc.bankName}</p>
                    <p className="text-xs text-dark-400">{acc.accountHolderName} &middot; {acc.accountNumber}</p>
                    {acc.iban && <p className="text-xs text-dark-400">IBAN: {acc.iban}</p>}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    depositForm.accountId === acc._id ? 'border-primary-500' : 'border-dark-300'
                  }`}>
                    {depositForm.accountId === acc._id && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                  </div>
                </label>
              ))}
            </div>
          )}
          {depositErrors.accountId && <p className="text-xs text-red-500">{depositErrors.accountId}</p>}

          <Input
            label="Amount ($)"
            type="number"
            placeholder="Enter amount to deposit"
            icon={FiDollarSign}
            value={depositForm.amount}
            onChange={(e) => setDepositForm((p) => ({ ...p, amount: e.target.value }))}
            error={depositErrors.amount}
            min="1"
            step="0.01"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowDeposit(false); setDepositErrors({}); }}>Cancel</Button>
            <Button onClick={handleDeposit} loading={submitting} disabled={paymentAccounts.length === 0}>
              Submit Deposit
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showWithdraw} onClose={() => { setShowWithdraw(false); setFormErrors({}); }} title="Request Withdrawal" size="md">
        <div className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            placeholder="0.00"
            icon={FiDollarSign}
            value={withdrawForm.amount}
            onChange={updateWithdrawField('amount')}
            error={formErrors.amount}
            min="0"
            step="0.01"
          />
          <Select
            label="Payment Method"
            options={PAYMENT_METHODS}
            value={withdrawForm.paymentMethod}
            onChange={updateWithdrawField('paymentMethod')}
            error={formErrors.paymentMethod}
          />
          {withdrawForm.paymentMethod === 'bank_transfer' && (
            <Input
              label="Bank Name"
              placeholder="Enter your bank name"
              value={withdrawForm.bankName}
              onChange={updateWithdrawField('bankName')}
              error={formErrors.bankName}
            />
          )}
          <Input
            label="Account Number"
            placeholder="Enter account number"
            value={withdrawForm.accountNumber}
            onChange={updateWithdrawField('accountNumber')}
            error={formErrors.accountNumber}
          />
          <Input
            label="Account Name"
            placeholder="Enter account holder name"
            value={withdrawForm.accountName}
            onChange={updateWithdrawField('accountName')}
            error={formErrors.accountName}
          />

          {wallet && (
            <div className="p-3 rounded-[11px] bg-dark-50">
              <p className="text-xs text-dark-500">Available for withdrawal</p>
              <p className="text-lg font-bold text-ink">
                {formatCurrency(wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowWithdraw(false); setFormErrors({}); }}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} loading={submitting}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
