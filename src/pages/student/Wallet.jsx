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
  FiCopy,
  FiCheckCircle,
  FiServer,
  FiTag,
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
import couponService from '../../services/couponService';
import { formatCurrency, formatDate, copyToClipboard } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const CHART_COLORS = ['#10B981', '#2563EB', '#F59E0B', '#8B5CF6'];

const INCOME_LABELS = {
  direct_income: 'Direct Income',
  indirect_income: 'Indirect Income',
  trading_profit: 'Trading Profit',
  bonus: 'Bonus',
  purchase: 'Course Purchase',
  subscription: 'Subscription',
  withdrawal: 'Withdrawal',
  deposit: 'Deposit',
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
  { value: 'purchase', label: 'Course Purchase' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'withdrawal', label: 'Withdrawal' },
  { value: 'deposit', label: 'Deposit' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
];

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'usdt_bep20', label: 'USDT (BEP20)' },
  { value: 'crypto', label: 'Other Cryptocurrency' },
  { value: 'mobile_money', label: 'Mobile Money' },
];

const WALLET_TABS = [
  { key: 'main', label: 'Main Wallet', icon: FiDollarSign },
  { key: 'funding', label: 'Funding Wallet', icon: FiServer },
  { key: 'ib', label: 'IB Wallet', icon: FiLayers },
];

export default function Wallet() {
  const [walletTab, setWalletTab] = useState('main');
  const [wallet, setWallet] = useState(null);
  const [allWallets, setAllWallets] = useState([]);
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
  const [depositForm, setDepositForm] = useState({ accountId: '', amount: '', paymentMethod: 'bank_transfer', coinType: '' });
  const [depositErrors, setDepositErrors] = useState({});
  const [depositHistory, setDepositHistory] = useState([]);
  const [supportedCoins, setSupportedCoins] = useState({});
  const [coinPayment, setCoinPayment] = useState(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);

  const { page, limit, nextPage, prevPage, goToPage } = usePagination(1, 10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWallet = useCallback(async (type) => {
    try {
      const res = await walletService.getWallet(type || walletTab);
      const data = res?.data?.data || res?.data || res;
      setWallet(data);
    } catch {
      toast.error('Failed to load wallet data');
    }
  }, [walletTab]);

  const fetchAllWallets = useCallback(async () => {
    try {
      const res = await walletService.getAllWallets();
      const data = res?.data?.data || res?.data || [];
      setAllWallets(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
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
      const params = { page, limit };
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
      await Promise.all([fetchWallet(walletTab), fetchStats(), fetchAllWallets()]);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [fetchWallet, fetchStats, fetchAllWallets, walletTab]);

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

  const fetchSupportedCoins = useCallback(async () => {
    try {
      const res = await depositService.getSupportedCoins();
      const data = res?.data?.data?.supportedCoins || {};
      setSupportedCoins(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPaymentAccounts();
    fetchDepositHistory();
    fetchSupportedCoins();
  }, [fetchPaymentAccounts, fetchDepositHistory, fetchSupportedCoins]);

  const validateDeposit = () => {
    const errors = {};
    const amt = parseFloat(depositForm.amount);
    if (!depositForm.amount || isNaN(amt) || amt <= 0) errors.amount = 'Enter a valid amount';
    if (depositForm.paymentMethod === 'crypto' || depositForm.paymentMethod === 'coin') {
      if (!depositForm.coinType) errors.coinType = 'Select a coin type';
    } else {
      if (!depositForm.accountId) errors.accountId = 'Select a payment account';
    }
    setDepositErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDeposit = async () => {
    if (!validateDeposit()) return;
    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(depositForm.amount),
        paymentMethod: depositForm.paymentMethod,
        walletType: walletTab,
      };
      if (depositForm.paymentMethod === 'crypto' || depositForm.paymentMethod === 'coin') {
        payload.coinType = depositForm.coinType;
      } else {
        payload.accountId = depositForm.accountId;
      }
      const res = await depositService.createDeposit(payload);
      if (depositForm.paymentMethod === 'crypto' || depositForm.paymentMethod === 'coin') {
        setCoinPayment(res?.data?.data?.coinPayment || null);
        toast.success('Coin deposit initiated! Send payment to the address below.');
      } else {
        toast.success('Deposit request submitted! Admin will verify and approve.');
        setShowDeposit(false);
        setDepositForm({ accountId: '', amount: '', paymentMethod: 'bank_transfer', coinType: '' });
        setDepositErrors({});
        fetchDepositHistory();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit deposit request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    try {
      const res = await couponService.validateCoupon({ code: couponCode, amount: wallet?.availableBalance || 0 });
      setCouponResult(res?.data?.data || null);
      toast.success('Coupon is valid!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid coupon');
      setCouponResult(null);
    }
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    goToPage(1);
  };

  const handleRefresh = () => {
    fetchWallet(walletTab);
    fetchStats();
    fetchTransactions();
    fetchAllWallets();
    toast.success('Wallet data refreshed');
  };

  const byCategory = stats?.byCategory || {};
  const expenses = stats?.expenses || {};
  const chartData = stats
    ? [
        { name: 'Direct Income', value: byCategory.direct_income ?? byCategory.directIncome ?? 0 },
        { name: 'Indirect Income', value: byCategory.indirect_income ?? byCategory.indirectIncome ?? 0 },
        { name: 'Trading Profit', value: byCategory.trading_profit ?? byCategory.tradingProfit ?? 0 },
        { name: 'Bonus', value: byCategory.bonus ?? 0 },
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
      render: (_, row) => (
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
      render: (_, row) => (
        <span className="text-dark-600 capitalize">
          {INCOME_LABELS[row.category] || row.category?.replace(/_/g, ' ') || '\u2014'}
        </span>
      ),
    },
    {
      header: 'Amount',
      render: (_, row) => (
        <span className={`font-semibold ${row.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
          {row.type === 'credit' ? '+' : '-'}{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Description',
      render: (_, row) => {
        const refName = row.metadata?.referredName;
        return (
          <span className="text-dark-500 max-w-[220px] truncate block" title={row.description || ''}>
            {row.description || '\u2014'}
            {refName && <span className="text-primary-500 font-medium"> ({refName})</span>}
          </span>
        );
      },
    },
    {
      header: 'Date',
      render: (_, row) => (
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
          <p className="mt-1 text-sm text-dark-500">Manage your finances, deposits, and withdrawals</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => { setShowCoupon(true); setCouponCode(''); setCouponResult(null); }}>
            <FiTag size={16} />
            Coupon
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || loadingTx}>
            <FiRefreshCw size={16} className={loading || loadingTx ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setDepositForm({ accountId: '', amount: '', paymentMethod: 'bank_transfer', coinType: '' }); setCoinPayment(null); setDepositErrors({}); setShowDeposit(true); }}>
            <FiPlus size={16} />
            Deposit
          </Button>
          <Button size="sm" onClick={() => setShowWithdraw(true)}>
            <FiCreditCard size={16} />
            Withdraw
          </Button>
        </div>
      </div>

      {/* Wallet Type Tabs */}
      <div className="flex gap-2 bg-dark-50 p-1.5 rounded-xl">
        {WALLET_TABS.map((tab) => {
          const Icon = tab.icon;
          const w = allWallets.find(w => w.type === tab.key);
          return (
            <button
              key={tab.key}
              onClick={() => setWalletTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center ${
                walletTab === tab.key
                  ? 'bg-white text-primary-600 shadow-sm border border-dark-100'
                  : 'text-dark-500 hover:text-dark-700 hover:bg-white/50'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
              {w && <span className="text-xs text-dark-400 ml-1">({formatCurrency(w.availableBalance || 0)})</span>}
            </button>
          );
        })}
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
                  { label: 'Direct Income', value: byCategory.direct_income ?? byCategory.directIncome ?? 0, color: 'bg-emerald-500' },
                  { label: 'Indirect Income', value: byCategory.indirect_income ?? byCategory.indirectIncome ?? 0, color: 'bg-blue-500' },
                  { label: 'Trading Profit', value: byCategory.trading_profit ?? byCategory.tradingProfit ?? 0, color: 'bg-amber-500' },
                  { label: 'Bonus', value: byCategory.bonus ?? 0, color: 'bg-purple-500' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                      <span className="text-sm text-dark-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-ink">{formatCurrency(s.value)}</span>
                  </div>
                ))}
                {Object.keys(expenses).length > 0 && (
                  <>
                    <div className="pt-3 mt-3 border-t border-dark-100">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-dark-400 mb-3">Expenses</p>
                      {Object.entries(expenses).filter(([, v]) => v > 0).map(([cat, val]) => (
                        <div key={cat} className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-sm text-dark-600">{INCOME_LABELS[cat] || cat?.replace(/_/g, ' ') || cat}</span>
                          </div>
                          <span className="text-sm font-semibold text-red-500">-{formatCurrency(val)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="pt-3 mt-3 border-t border-dark-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-dark-700">Available Balance</span>
                    <span className="text-lg font-bold text-ink">
                      {formatCurrency(wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0)}
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

      <Modal isOpen={showDeposit} onClose={() => { setShowDeposit(false); setDepositErrors({}); setCoinPayment(null); }} title={`Deposit to ${WALLET_TABS.find(t => t.key === walletTab)?.label || 'Wallet'}`} size={coinPayment ? 'md' : 'lg'}>
        {coinPayment ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <FiCheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-emerald-700">Deposit Initiated!</p>
              <p className="text-xs text-emerald-600 mt-1">Send the exact amount to the address below</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl bg-dark-50">
              <div>
                <p className="text-xs text-dark-500 font-medium mb-1">Coin / Network</p>
                <p className="text-sm font-semibold text-ink">{coinPayment.coinName} ({coinPayment.network})</p>
              </div>
              <div>
                <p className="text-xs text-dark-500 font-medium mb-1">Amount</p>
                <p className="text-lg font-bold text-ink">{formatCurrency(coinPayment.amount)}</p>
              </div>
              {coinPayment.qrcodeUrl && (
                <div className="flex justify-center">
                  <img src={coinPayment.qrcodeUrl} alt="QR Code" className="w-40 h-40 rounded-xl border border-dark-200" />
                </div>
              )}
              <div>
                <p className="text-xs text-dark-500 font-medium mb-1">Deposit Address</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-dark-200">
                  <code className="text-xs font-mono text-ink break-all flex-1">{coinPayment.depositAddress}</code>
                  <button
                    onClick={() => { copyToClipboard(coinPayment.depositAddress); toast.success('Address copied!'); }}
                    className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-500 shrink-0"
                  >
                    <FiCopy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-dark-500 font-medium mb-1">Payment Reference</p>
                <code className="text-xs font-mono text-primary-600">{coinPayment.paymentRef}</code>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">Important:</p>
              <ul className="text-xs text-amber-600 mt-1 space-y-1 list-disc list-inside">
                <li>Send only {coinPayment.coinName} on {coinPayment.network} network</li>
                <li>Sending other coins may result in permanent loss</li>
                <li>Minimum 1 network confirmation required</li>
                <li>Your deposit will be credited after confirmation</li>
              </ul>
            </div>
            <p className="text-xs text-dark-400 text-center">Expires: {new Date(coinPayment.expiresAt).toLocaleString()}</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowDeposit(false); setCoinPayment(null); setDepositForm({ accountId: '', amount: '', paymentMethod: 'bank_transfer', coinType: '' }); }}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-dark-500">Choose a payment method and enter the amount to deposit into your <strong>{WALLET_TABS.find(t => t.key === walletTab)?.label}</strong>.</p>

            <Select
              label="Payment Method"
              options={[
                { value: 'bank_transfer', label: 'Bank Transfer' },
                { value: 'usdt_bep20', label: 'USDT (BEP20) \u2014 Auto-credit' },
                { value: 'crypto', label: 'Other Cryptocurrency' },
                { value: 'coin', label: 'Coin Payment' },
              ]}
              value={depositForm.paymentMethod}
              onChange={(e) => setDepositForm((p) => ({ ...p, paymentMethod: e.target.value, accountId: '', coinType: e.target.value === 'usdt_bep20' ? 'USDT_BEP20' : '' }))}
            />

            {(depositForm.paymentMethod === 'crypto' || depositForm.paymentMethod === 'coin' || depositForm.paymentMethod === 'usdt_bep20') ? (
              <Select
                label="Select Coin"
                options={[
                  { value: '', label: 'Select a coin...' },
                  ...Object.entries(supportedCoins).map(([key, coin]) => ({
                    value: key,
                    label: `${coin.name} (${coin.network})`
                  }))
                ]}
                value={depositForm.coinType}
                onChange={(e) => setDepositForm((p) => ({ ...p, coinType: e.target.value }))}
                error={depositErrors.coinType}
              />
            ) : (
              <>
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
              </>
            )}

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
              <Button variant="outline" onClick={() => { setShowDeposit(false); setDepositErrors({}); setCoinPayment(null); }}>Cancel</Button>
              <Button onClick={handleDeposit} loading={submitting} disabled={(depositForm.paymentMethod !== 'crypto' && depositForm.paymentMethod !== 'coin' && depositForm.paymentMethod !== 'usdt_bep20' && paymentAccounts.length === 0)}>
                {depositForm.paymentMethod === 'crypto' || depositForm.paymentMethod === 'coin' || depositForm.paymentMethod === 'usdt_bep20' ? 'Generate Payment' : 'Submit Deposit'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCoupon} onClose={() => { setShowCoupon(false); setCouponResult(null); }} title="Apply Coupon / PIN" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-dark-500">Enter your coupon code or PIN to get a discount or credit.</p>
          <Input
            label="Coupon Code / PIN"
            placeholder="Enter code..."
            icon={FiTag}
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          {couponResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-700">Coupon Applied!</p>
              <p className="text-xs text-emerald-600 mt-1">
                Discount: {formatCurrency(couponResult.discount)} | Final: {formatCurrency(couponResult.finalAmount)}
              </p>
              <p className="text-xs text-emerald-500 mt-0.5">{couponResult.coupon.description || ''}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowCoupon(false); setCouponResult(null); }}>Close</Button>
            <Button onClick={handleValidateCoupon} disabled={!couponCode.trim()}>Validate</Button>
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
