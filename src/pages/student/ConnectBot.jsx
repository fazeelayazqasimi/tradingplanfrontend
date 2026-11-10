import { useState, useEffect, useCallback } from 'react';
import {
  FiCpu,
  FiPlus,
  FiTrash2,
  FiServer,
  FiInfo,
  FiShield,
  FiCreditCard,
  FiImage,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import { formatDate } from '../../utils/helpers';

const emptyForm = {
  platform: 'MT4',
  accountNumber: '',
  server: '',
  brokerName: '',
  accountType: 'real',
  password: '',
};

export default function ConnectBot() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [strategies, setStrategies] = useState([]);
  const [strategiesLoading, setStrategiesLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [feeAmount, setFeeAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(null);
  const [feeLoading, setFeeLoading] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await studentService.getBotAccounts();
      const data = res?.data?.data || res?.data || res;
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load bot accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStrategies = useCallback(async () => {
    try {
      setStrategiesLoading(true);
      const res = await studentService.getStrategies();
      const data = res?.data?.data || res?.data || res;
      setStrategies(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load trading strategies');
    } finally {
      setStrategiesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchStrategies();
  }, [fetchAccounts, fetchStrategies]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const openPayModal = async () => {
    setPayModalOpen(true);
    setFeeLoading(true);
    try {
      const [feeRes, walletRes] = await Promise.all([
        studentService.getBotFeeInfo(),
        walletService.getWallet('main').catch(() => null),
      ]);
      const feeData = feeRes?.data?.data || feeRes?.data || feeRes;
      setFeeAmount(Number(feeData?.amount) || 0);
      const walletData = walletRes?.data?.data || walletRes?.data || walletRes;
      setWalletBalance(
        typeof walletData?.availableBalance === 'number' ? walletData.availableBalance : null
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load payment details');
      setPayModalOpen(false);
    } finally {
      setFeeLoading(false);
    }
  };

  const doConnect = async () => {
    const payload = {
      platform: form.platform,
      accountNumber: form.accountNumber.trim(),
      server: form.server.trim(),
      brokerName: form.brokerName.trim(),
      accountType: form.accountType,
      password: form.password.trim(),
      strategyId: selectedStrategy._id,
    };
    await studentService.createBotAccount(payload);
    toast.success('Bot account connected successfully');
    setForm(emptyForm);
    setPayModalOpen(false);
    fetchAccounts();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStrategy) {
      toast.error('Please select a trading strategy');
      return;
    }
    if (!form.accountNumber.trim() || !form.server.trim()) {
      toast.error('Please enter account number and server');
      return;
    }
    if (form.accountType === 'demo') {
      setSubmitting(true);
      try {
        await doConnect();
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to connect bot account');
      } finally {
        setSubmitting(false);
      }
      return;
    }
    await openPayModal();
  };

  const handlePay = async () => {
    try {
      setSubmitting(true);
      await doConnect();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to connect bot account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Remove MT account ${account.accountNumber}?`)) return;
    try {
      setDeletingId(account._id);
      await studentService.deleteBotAccount(account._id);
      toast.success('Bot account removed');
      setAccounts((prev) => prev.filter((a) => a._id !== account._id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove bot account');
    } finally {
      setDeletingId(null);
    }
  };

  const tagColorClass = (index) => {
    const colors = [
      'bg-blue-50 text-blue-600',
      'bg-emerald-50 text-emerald-600',
      'bg-orange-50 text-orange-600',
      'bg-sky-50 text-sky-600',
      'bg-purple-50 text-purple-600',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Connect Bot</h1>
        <p className="mt-1 text-sm text-dark-500">
          Choose a trading strategy, create your account with a broker and connect it to the bot
        </p>
      </div>

      <Card className="flex items-start gap-3 p-4">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
          <FiInfo size={16} />
        </div>
        <p className="text-sm text-dark-500 leading-relaxed">
          Select a strategy below, then open a live or demo MT4/MT5 account with your broker and fill
          the form. Connecting a <span className="font-semibold text-ink">real</span> account requires
          a one-time activation fee (demo accounts are free).
        </p>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-ink">AI Trading Strategies</h2>
        <p className="mt-0.5 text-sm text-dark-500">Choose your trading strategy</p>

        {strategiesLoading ? (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-2xl" />
            ))}
          </div>
        ) : strategies.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-dark-200 bg-dark-50 p-6 text-center">
            <p className="text-sm font-medium text-ink">No strategies available yet</p>
            <p className="mt-1 text-xs text-dark-400">Please check back later.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {strategies.map((strategy, index) => {
              const isSelected = selectedStrategy?._id === strategy._id;
              return (
                <button
                  key={strategy._id}
                  type="button"
                  onClick={() => setSelectedStrategy(strategy)}
                  className={`overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-200 shadow-card-lg'
                      : 'border-dark-100 hover:border-primary-200 shadow-card'
                  }`}
                >
                  <div className="h-36 w-full overflow-hidden rounded-xl bg-dark-100">
                    {strategy.imageUrl ? (
                      <img
                        src={strategy.imageUrl}
                        alt={strategy.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FiImage className="h-8 w-8 text-dark-400" />
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-center text-base font-bold uppercase tracking-wide text-ink">
                    {strategy.name}
                  </p>
                  {strategy.tag && (
                    <div className="mt-2 flex justify-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${tagColorClass(index)}`}
                      >
                        {strategy.tag}
                      </span>
                    </div>
                  )}
                  <div className="mt-3 space-y-1 text-center text-sm text-dark-500">
                    <p>Minimum: ${Number(strategy.minAmount || 0).toLocaleString()}</p>
                    <p>Maximum: ${Number(strategy.maxAmount || 0).toLocaleString()}</p>
                    <p className="text-xs text-dark-400">Illustrative limits</p>
                  </div>
                  {isSelected && (
                    <div className="mt-3 flex justify-center">
                      <Badge color="success">Selected</Badge>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
              <FiCpu size={16} />
            </div>
            <span className="font-semibold text-ink">Add Trading Account</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Platform"
                value={form.platform}
                onChange={setField('platform')}
                options={[
                  { value: 'MT4', label: 'MT4' },
                  { value: 'MT5', label: 'MT5' },
                ]}
              />
              <Select
                label="Account Type"
                value={form.accountType}
                onChange={setField('accountType')}
                options={[
                  { value: 'real', label: 'Real' },
                  { value: 'demo', label: 'Demo' },
                ]}
              />
            </div>

            <Input
              label="Account Number"
              value={form.accountNumber}
              onChange={setField('accountNumber')}
              placeholder="e.g. 12345678"
            />
            <Input
              label="Server"
              value={form.server}
              onChange={setField('server')}
              placeholder="e.g. MetaQuotes-Demo"
            />
            <Input
              label="Broker Name"
              value={form.brokerName}
              onChange={setField('brokerName')}
              placeholder="e.g. IC Markets (optional)"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={setField('password')}
              placeholder="Trading / investor password (optional)"
            />

            {!selectedStrategy && (
              <p className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600">
                Please select a trading strategy above to continue.
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={submitting}
              disabled={
                strategiesLoading ||
                !selectedStrategy ||
                !form.accountNumber.trim() ||
                !form.server.trim()
              }
            >
              <FiPlus size={16} className="mr-1.5" />{' '}
              {form.accountType === 'demo' ? 'Connect Demo Account' : 'Connect Account'}
            </Button>
            {form.accountType === 'real' && (
              <p className="text-center text-xs text-dark-400">
                A one-time activation fee will be charged from your wallet
              </p>
            )}
          </form>
        </Card>

        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <FiServer size={16} />
              </div>
              <span className="font-semibold text-ink">Connected Accounts</span>
            </div>
            <Badge color="info">{accounts.length} total</Badge>
          </div>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-dark-200 bg-dark-50 p-6 text-center">
              <FiCpu className="mx-auto h-8 w-8 text-dark-400" />
              <p className="mt-2 text-sm font-medium text-ink">No accounts connected yet</p>
              <p className="mt-1 text-xs text-dark-400">Fill the form to connect your first trading account.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="rounded-xl border border-dark-100 bg-dark-50 p-4 transition-colors hover:border-primary-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{account.accountNumber}</span>
                        <Badge color="info">{account.platform}</Badge>
                        <Badge color={account.accountType === 'demo' ? 'warning' : 'success'}>
                          {account.accountType === 'demo' ? 'Demo' : 'Real'}
                        </Badge>
                        {account.strategyName && (
                          <Badge color="purple">{account.strategyName}</Badge>
                        )}
                      </div>
                      <p className="mt-1.5 truncate text-sm text-dark-500">
                        {account.server}
                        {account.brokerName ? ` • ${account.brokerName}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-dark-400">
                        Connected {formatDate(account.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(account)}
                      disabled={deletingId === account._id}
                      className="rounded-xl p-2 text-dark-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      title="Remove account"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl bg-primary-50 p-3">
            <FiShield className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
            <p className="text-xs text-primary-700 leading-relaxed">
              Your credentials are stored securely and used only to connect the trading bot.
            </p>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={payModalOpen}
        onClose={() => !submitting && setPayModalOpen(false)}
        title="Activate Bot"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <FiCreditCard className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-dark-500">Pay</p>
            <p className="text-4xl font-extrabold text-ink">
              {feeLoading ? '…' : `$${feeAmount.toFixed(2)}`}
            </p>
            <p className="mt-1 text-sm text-dark-500">
              to connect <span className="font-semibold text-ink">{selectedStrategy?.name}</span>
            </p>
          </div>

          <div className="space-y-2 rounded-xl bg-dark-50 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-dark-500">Account</span>
              <span className="font-medium text-ink">
                {form.accountNumber} ({form.platform})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-dark-500">Wallet balance</span>
              <span className="font-medium text-ink">
                {feeLoading
                  ? '…'
                  : walletBalance !== null
                  ? `$${walletBalance.toFixed(2)}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between border-t border-dark-100 pt-2">
              <span className="text-dark-500">After payment</span>
              <span
                className={`font-semibold ${
                  walletBalance !== null && walletBalance < feeAmount ? 'text-red-500' : 'text-ink'
                }`}
              >
                {feeLoading || walletBalance === null
                  ? '—'
                  : `$${Math.max(0, walletBalance - feeAmount).toFixed(2)}`}
              </span>
            </div>
          </div>

          {walletBalance !== null && walletBalance < feeAmount && !feeLoading && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              Insufficient wallet balance. Please top up your wallet first.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPayModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handlePay}
              loading={submitting || feeLoading}
              disabled={feeLoading || (walletBalance !== null && walletBalance < feeAmount)}
            >
              {feeAmount > 0 ? `Pay $${feeAmount.toFixed(2)}` : 'Connect'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
