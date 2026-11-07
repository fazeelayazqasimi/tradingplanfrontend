import { useState, useEffect, useCallback } from 'react';
import { FiCpu, FiPlus, FiTrash2, FiServer, FiInfo, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import studentService from '../../services/studentService';
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

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.accountNumber.trim() || !form.server.trim()) {
      toast.error('Please enter account number and server');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        platform: form.platform,
        accountNumber: form.accountNumber.trim(),
        server: form.server.trim(),
        brokerName: form.brokerName.trim(),
        accountType: form.accountType,
        password: form.password.trim(),
      };
      await studentService.createBotAccount(payload);
      toast.success('Bot account connected successfully');
      setForm(emptyForm);
      fetchAccounts();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Connect Bot</h1>
        <p className="mt-1 text-sm text-dark-500">
          Create your trading account with a broker and connect it to the bot
        </p>
      </div>

      <Card className="flex items-start gap-3 p-4">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
          <FiInfo size={16} />
        </div>
        <p className="text-sm text-dark-500 leading-relaxed">
          Open a live or demo MT4/MT5 account with your broker, then fill the form below.
          Your account details will be shared with our team to activate the bot on your account.
        </p>
      </Card>

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

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={submitting}
              disabled={!form.accountNumber.trim() || !form.server.trim()}
            >
              <FiPlus size={16} className="mr-1.5" /> Connect Account
            </Button>
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
    </div>
  );
}
