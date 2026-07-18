import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiClock,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiCreditCard,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const STATUS_CONFIG = {
  pending: { color: 'warning', label: 'Pending' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'danger', label: 'Rejected' },
  paid: { color: 'success', label: 'Paid' },
};

const PAYMENT_METHODS = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'usdt_bep20', label: 'USDT (BEP20)' },
  { value: 'crypto', label: 'Other Cryptocurrency' },
  { value: 'mobile_money', label: 'Mobile Money' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

export default function Withdrawals() {
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    paymentMethod: '',
    accountNumber: '',
    accountName: '',
    bankName: '',
    walletAddress: '',
    cryptocurrency: 'USDT',
  });
  const [formErrors, setFormErrors] = useState({});

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

  const fetchWithdrawals = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await studentService.getMyWithdrawals({ page, perPage: limit });
      const data = res?.data?.data || res?.data || res;
      const list = data?.withdrawals || data?.docs || (Array.isArray(data) ? data : []);
      setWithdrawals(list);
      setTotalPages(data?.totalPages || data?.pages || Math.ceil((data?.total || list.length) / limit) || 1);
    } catch {
      toast.error('Failed to load withdrawals');
    } finally {
      setLoadingList(false);
    }
  }, [page, limit]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      await Promise.all([fetchWallet(), fetchWithdrawals()]);
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [fetchWallet, fetchWithdrawals]);

  const handleRefresh = () => {
    fetchWallet();
    fetchWithdrawals();
    toast.success('Withdrawals refreshed');
  };

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'paid' || w.status === 'approved')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

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
      label: 'Pending Withdrawals',
      icon: FiClock,
      value: pendingCount,
      color: 'bg-amber-50 text-amber-500',
      isCount: true,
    },
    {
      key: 'withdrawn',
      label: 'Total Withdrawn',
      icon: FiCheck,
      value: wallet?.totalWithdrawn ?? wallet?.total_withdrawn ?? totalWithdrawn,
      color: 'bg-blue-50 text-blue-500',
    },
  ];

  const columns = [
    {
      header: 'Amount',
      render: (row) => (
        <span className="font-semibold text-ink">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Payment Method',
      render: (row) => (
        <span className="text-dark-600 capitalize">{(row.paymentMethod || row.payment_method || '').replace(/_/g, ' ')}</span>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
        return <Badge color={cfg.color}>{cfg.label}</Badge>;
      },
    },
    {
      header: 'Requested Date',
      render: (row) => (
        <span className="text-dark-500 text-xs">{formatDate(row.createdAt || row.created_at || row.requestedDate)}</span>
      ),
    },
    {
      header: 'Processed Date',
      render: (row) => (
        <span className="text-dark-500 text-xs">{row.processedAt || row.processed_at ? formatDate(row.processedAt || row.processed_at) : '\u2014'}</span>
      ),
    },
  ];

  const validateForm = () => {
    const errors = {};
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      errors.amount = 'Enter a valid amount';
    }
    const available = wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0;
    if (amt > available) {
      errors.amount = 'Insufficient balance';
    }
    if (!form.paymentMethod) {
      errors.paymentMethod = 'Select a payment method';
    }
    const isCrypto = form.paymentMethod === 'usdt_bep20' || form.paymentMethod === 'crypto';
    if (isCrypto) {
      if (!form.walletAddress?.trim()) {
        errors.walletAddress = 'Wallet address is required';
      }
    } else {
      if (!form.accountNumber?.trim()) {
        errors.accountNumber = 'Account number is required';
      }
      if (!form.accountName?.trim()) {
        errors.accountName = 'Account name is required';
      }
      if (form.paymentMethod === 'bank_transfer' && !form.bankName?.trim()) {
        errors.bankName = 'Bank name is required for bank transfers';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const isCrypto = form.paymentMethod === 'usdt_bep20' || form.paymentMethod === 'crypto';
      const payload = {
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
      };
      if (isCrypto) {
        payload.walletAddress = form.walletAddress.trim();
        payload.cryptocurrency = form.cryptocurrency || 'USDT';
      } else {
        payload.accountNumber = form.accountNumber.trim();
        payload.accountName = form.accountName.trim();
        payload.bankName = form.bankName.trim() || undefined;
      }
      await studentService.requestWithdrawal(payload);
      toast.success('Withdrawal request submitted successfully');
      setShowModal(false);
      setForm({ amount: '', paymentMethod: '', accountNumber: '', accountName: '', bankName: '', walletAddress: '', cryptocurrency: 'USDT' });
      setFormErrors({});
      fetchWallet();
      fetchWithdrawals();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Withdrawals</h1>
          <p className="mt-1 text-sm text-dark-500">View your withdrawal history and request new withdrawals</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || loadingList}>
            <FiRefreshCw size={16} className={loading || loadingList ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <FiCreditCard size={16} />
            Request Withdrawal
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                        {card.isCount ? card.value : formatCurrency(card.value)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-ink mb-5">Withdrawal History</h2>

          {loadingList ? (
            <Skeleton count={5} className="h-12 w-full" />
          ) : withdrawals.length === 0 ? (
            <EmptyState
              icon={FiDollarSign}
              title="No withdrawals found"
              description="You haven't made any withdrawal requests yet."
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={withdrawals}
                page={page}
                totalPages={totalPages}
                onNextPage={nextPage}
                onPrevPage={prevPage}
                emptyMessage="No withdrawals found"
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

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormErrors({}); }} title="Request Withdrawal" size="md">
        <div className="space-y-4">
          <Input
            label="Amount ($)"
            type="number"
            placeholder="0.00"
            icon={FiDollarSign}
            value={form.amount}
            onChange={updateField('amount')}
            error={formErrors.amount}
            min="0"
            step="0.01"
          />
          <Select
            label="Payment Method"
            options={PAYMENT_METHODS}
            value={form.paymentMethod}
            onChange={updateField('paymentMethod')}
            error={formErrors.paymentMethod}
          />
          {form.paymentMethod === 'bank_transfer' && (
            <Input
              label="Bank Name"
              placeholder="Enter your bank name"
              value={form.bankName}
              onChange={updateField('bankName')}
              error={formErrors.bankName}
            />
          )}
          {(form.paymentMethod === 'usdt_bep20' || form.paymentMethod === 'crypto') ? (
            <>
              <Input
                label="Wallet Address"
                placeholder="Enter your USDT BEP20 wallet address"
                value={form.walletAddress}
                onChange={updateField('walletAddress')}
                error={formErrors.walletAddress}
              />
              {form.paymentMethod === 'crypto' && (
                <Select
                  label="Cryptocurrency"
                  options={[
                    { value: 'USDT', label: 'USDT' },
                    { value: 'BTC', label: 'Bitcoin' },
                    { value: 'ETH', label: 'Ethereum' },
                    { value: 'BNB', label: 'BNB' },
                  ]}
                  value={form.cryptocurrency}
                  onChange={updateField('cryptocurrency')}
                />
              )}
            </>
          ) : (
            <>
              <Input
                label="Account Number"
                placeholder="Enter account number"
                value={form.accountNumber}
                onChange={updateField('accountNumber')}
                error={formErrors.accountNumber}
              />
              <Input
                label="Account Name"
                placeholder="Enter account holder name"
                value={form.accountName}
                onChange={updateField('accountName')}
                error={formErrors.accountName}
              />
            </>
          )}

          {wallet && (
            <div className="p-3 rounded-[11px] bg-dark-50">
              <p className="text-xs text-dark-500">Available for withdrawal</p>
              <p className="text-lg font-bold text-ink">
                {formatCurrency(wallet?.availableBalance ?? wallet?.available ?? wallet?.balance ?? 0)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowModal(false); setFormErrors({}); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
