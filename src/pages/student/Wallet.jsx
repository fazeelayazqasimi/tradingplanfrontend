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
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
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
import { formatCurrency, formatDate, copyToClipboard, getAssetUrl } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const CHART_COLORS = ['#10B981', '#45F000', '#F59E0B', '#8B5CF6'];

const INCOME_LABELS = {
  direct_income: 'Direct Income',
  indirect_income: 'Indirect Income',
  trading_profit: 'Trading Profit',
  bonus: 'Bonus',
  registration: 'Registration Bonus',
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
  { value: 'registration', label: 'Registration Bonus' },
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
  { value: 'usdt_bep20', label: 'USDT (BEP20)' },
];

const WALLET_TABS = [
  { key: 'main', label: 'Main Wallet', icon: FiDollarSign },
  { key: 'funding', label: 'Funding Wallet', icon: FiServer },
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
    walletAddress: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [depositForm, setDepositForm] = useState({ accountId: '', amount: '', paymentMethod: 'usdt_bep20', coinType: '' });
  const [depositErrors, setDepositErrors] = useState({});
  const [depositHistory, setDepositHistory] = useState([]);
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const [depositSubmitted, setDepositSubmitted] = useState(null);
  const [qrBroken, setQrBroken] = useState(false);
  const [withdrawFeeInfo, setWithdrawFeeInfo] = useState({ feeType: 'percent', feePercent: 10, feeFixed: 0, processingHours: 24 });

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

  const fetchWithdrawFeeInfo = useCallback(async () => {
    try {
      const res = await studentService.getWithdrawalFeeInfo();
      const data = res?.data?.data || {};
      if (data.feeType) setWithdrawFeeInfo(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPaymentAccounts();
    fetchDepositHistory();
    fetchWithdrawFeeInfo();
  }, [fetchPaymentAccounts, fetchDepositHistory, fetchWithdrawFeeInfo]);

  const validateDeposit = () => {
    const errors = {};
    const amt = parseFloat(depositForm.amount);
    if (!depositForm.amount || isNaN(amt) || amt <= 0) errors.amount = 'Enter a valid amount';
    setDepositErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUploadDepositScreenshot = async (file) => {
    const formData = new FormData();
    formData.append('screenshot', file);
    const res = await depositService.uploadScreenshot(formData);
    return res?.data?.data?.url || res?.data?.url || null;
  };

  const handleDeposit = async () => {
    if (!validateDeposit()) return;
    if (!depositScreenshot) { toast.error('Please attach the payment screenshot'); return; }
    setSubmitting(true);
    try {
      let screenshotUrl = null;
      if (depositScreenshot) screenshotUrl = await handleUploadDepositScreenshot(depositScreenshot);
      const payload = {
        amount: parseFloat(depositForm.amount),
        paymentMethod: 'usdt_bep20',
        walletType: walletTab === 'funding' ? 'funding' : 'main',
        screenshot: screenshotUrl,
        accountId: activePaymentAccount?._id || null,
      };
      const res = await depositService.createDeposit(payload);
      const data = res.data?.data || res.data;
      setDepositSubmitted(data);
      toast.success('Deposit request submitted! Awaiting admin approval.');
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
    fetchWallet(walletTab);
    fetchStats();
    fetchTransactions();
    fetchAllWallets();
    toast.success('Wallet data refreshed');
  };

  const byCategory = stats?.byCategory || {};
  const expenses = stats?.expenses || {};
  const activePaymentAccount = paymentAccounts.find((a) => a.isActive && a.paymentType === 'crypto' && a.walletAddress) || null;
  const depositQrUrl = activePaymentAccount?.qrCodeUrl
    ? getAssetUrl(activePaymentAccount.qrCodeUrl)
    : (activePaymentAccount?.qrDataUrl || '');
  const showGeneratedQr = !depositQrUrl || qrBroken;
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
      value: stats?.totalEarned ?? wallet?.totalEarned ?? wallet?.total_earned ?? 0,
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
          <span className="text-dark-500 break-words text-xs leading-relaxed min-w-[200px]">
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
    if (!withdrawForm.walletAddress?.trim()) {
      errors.walletAddress = 'Wallet address is required';
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
        paymentMethod: 'usdt_bep20',
        walletAddress: withdrawForm.walletAddress.trim(),
      });
      toast.success('Withdrawal request submitted. Awaiting admin approval.');
      setShowWithdraw(false);
      setWithdrawForm({ amount: '', walletAddress: '' });
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
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || loadingTx}>
            <FiRefreshCw size={16} className={loading || loadingTx ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setDepositForm({ amount: '' }); setDepositScreenshot(null); setDepositSubmitted(null); setDepositErrors({}); setQrBroken(false); setShowDeposit(true); }}>
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

      <Modal isOpen={showDeposit} onClose={() => { setShowDeposit(false); setDepositErrors({}); setDepositScreenshot(null); setDepositSubmitted(null); setQrBroken(false); setSubmitting(false); }} title={depositSubmitted ? 'Deposit Submitted' : `Deposit to ${WALLET_TABS.find(t => t.key === walletTab)?.label || 'Wallet'}`} size="sm">
          {depositSubmitted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Deposit Request Submitted</p>
                    <p className="text-xs text-emerald-600">Your payment will be verified by the admin.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-dark-50 border border-dark-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Amount</span>
                  <span className="font-semibold text-ink">{formatCurrency(depositSubmitted.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Status</span>
                  <span className="font-semibold capitalize text-amber-600">{depositSubmitted.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500">Date</span>
                  <span className="text-dark-600">{formatDate(depositSubmitted.createdAt)}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700">Your wallet will be credited once the admin approves your deposit. This usually takes a few hours.</p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => { setShowDeposit(false); setDepositSubmitted(null); setDepositForm({ amount: '' }); setDepositScreenshot(null); setSubmitting(false); }}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activePaymentAccount && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <FiDollarSign className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">USDT (BEP20)</p>
                      <p className="text-xs text-blue-600">Send USDT to the address below, then submit your payment proof</p>
                    </div>
                  </div>
                </div>
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

              {activePaymentAccount ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-dark-50 border border-dark-200">
                    <p className="text-xs font-medium text-dark-500 mb-2">USDT BEP20 Deposit Address</p>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap rounded-lg bg-white border border-dark-100 px-3 py-2">
                        <p className="text-sm font-mono text-ink">{activePaymentAccount.walletAddress}</p>
                      </div>
                      <button
                        onClick={() => { copyToClipboard(activePaymentAccount.walletAddress); toast.success('Address copied!'); }}
                        className="shrink-0 p-2 rounded-lg bg-white border border-dark-100 hover:bg-primary-50 transition-colors"
                        title="Copy address"
                      >
                        <FiCopy size={16} className="text-dark-400" />
                      </button>
                    </div>
                    <p className="text-xs text-dark-400 mt-2">Network: <span className="font-semibold text-ink">{activePaymentAccount.network || 'BEP20'}</span></p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {showGeneratedQr ? (
                      <div className="p-3 bg-white border border-dark-200 rounded-xl">
                        <QRCodeSVG value={activePaymentAccount.walletAddress} size={176} marginSize={1} />
                      </div>
                    ) : (
                      <img
                        src={depositQrUrl}
                        alt="Deposit QR Code"
                        onError={() => setQrBroken(true)}
                        className="w-44 h-44 border border-dark-200 rounded-xl object-contain bg-white"
                      />
                    )}
                    <p className="text-xs text-dark-400">Scan to send USDT (BEP20)</p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-ink mb-1.5">Payment Screenshot (Proof)</label>
                    <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-dark-200 bg-dark-50 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                      {depositScreenshot ? (
                        <img src={depositScreenshot && typeof depositScreenshot === 'string' ? depositScreenshot : URL.createObjectURL(depositScreenshot)} alt="Screenshot preview" className="h-full w-auto max-w-full object-contain rounded-lg" />
                      ) : (
                        <span className="text-sm text-dark-500">Click to attach screenshot</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setDepositScreenshot(file);
                        }}
                      />
                    </label>
                    {depositScreenshot && (
                      <button
                        type="button"
                        className="text-xs text-red-500 mt-1.5 hover:underline"
                        onClick={() => setDepositScreenshot(null)}
                      >
                        Remove screenshot
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <p className="text-xs text-amber-700">No active USDT deposit address found. Please contact support.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => { setShowDeposit(false); setDepositErrors({}); }}>Cancel</Button>
                <Button onClick={handleDeposit} loading={submitting} disabled={!activePaymentAccount}>
                  Submit Deposit Request
                </Button>
              </div>
            </div>
          )}
        </Modal>

      <Modal isOpen={showWithdraw} onClose={() => { setShowWithdraw(false); setFormErrors({}); }} title="Request Withdrawal (USDT BEP20)" size="sm">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <FiCreditCard className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-800">Withdraw USDT (BEP20)</p>
                  <p className="text-xs text-purple-600">Funds sent to your wallet address within {withdrawFeeInfo.processingHours || 24} hours</p>
                </div>
              </div>
            </div>

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

            {withdrawForm.amount && parseFloat(withdrawForm.amount) > 0 && (
              <div className="p-3 rounded-[11px] bg-dark-50 text-xs text-dark-500 space-y-1">
                <div className="flex justify-between">
                  <span>Withdrawal Fee ({withdrawFeeInfo.feeType === 'fixed' ? `$${withdrawFeeInfo.feeFixed}` : `${withdrawFeeInfo.feePercent}%`})</span>
                  <span className="font-semibold text-red-500">
                    -{formatCurrency(withdrawFeeInfo.feeType === 'fixed' ? withdrawFeeInfo.feeFixed : (parseFloat(withdrawForm.amount) * withdrawFeeInfo.feePercent / 100))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>You will receive</span>
                  <span className="font-semibold text-ink">
                    {formatCurrency(withdrawFeeInfo.feeType === 'fixed'
                      ? Math.max(0, parseFloat(withdrawForm.amount) - withdrawFeeInfo.feeFixed)
                      : parseFloat(withdrawForm.amount) * (100 - withdrawFeeInfo.feePercent) / 100)}
                  </span>
                </div>
              </div>
            )}

            <Input
              label="USDT BEP20 Wallet Address"
              placeholder="Enter your USDT BEP20 wallet address"
              value={withdrawForm.walletAddress}
              onChange={updateWithdrawField('walletAddress')}
              error={formErrors.walletAddress}
            />

{wallet && (
               <div className="p-3 rounded-[11px] bg-dark-50">
                 <p className="text-xs text-dark-500">Available for withdrawal</p>
                 <p className="text-lg font-bold text-ink">
                   {formatCurrency(wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0)}
                 </p>
               </div>
             )}

             <div className="p-3 rounded-xl bg-green-50 border border-green-200">
               <p className="text-xs text-green-700">Minimum withdrawal: $30</p>
             </div>

             <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700">Withdrawal processing takes up to {withdrawFeeInfo.processingHours || 24} hours. A {withdrawFeeInfo.feeType === 'fixed' ? `$${withdrawFeeInfo.feeFixed} ` : `${withdrawFeeInfo.feePercent}% `}withdrawal fee will be deducted.</p>
            </div>

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
