import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUpCircle,
  FiArrowDownCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import signalService from '../../services/signalService';
import { SIGNAL_ACTIONS } from '../../constants/index';
import { formatDateTime } from '../../utils/helpers';

const actionColor = {
  BUY: 'success',
  SELL: 'danger',
  CLOSE: 'warning',
  MODIFY: 'info',
};

const statusColor = {
  open: 'success',
  closed: 'neutral',
  pending: 'warning',
  cancelled: 'danger',
};

const sideOptions = [
  { value: 'LONG', label: 'Long' },
  { value: 'SHORT', label: 'Short' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'pending', label: 'Pending' },
];

const actionOptions = SIGNAL_ACTIONS.map((a) => ({
  value: a,
  label: a,
}));

const initialForm = {
  symbol: '',
  action: '',
  side: '',
  volume: '',
  openPrice: '',
  stopLoss: '',
  takeProfit: '',
  openTime: '',
  description: '',
};

export default function Signals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await signalService.getSignals({
        page,
        perPage: 10,
        status: statusFilter || undefined,
      });
      const body = response.data;
      const list = body.data || [];
      setSignals(Array.isArray(list) ? list : []);
      setTotalPages(body.pagination?.totalPages || Math.ceil((body.pagination?.total || 0) / 10) || 1);
      setTotalItems(body.pagination?.total || (Array.isArray(list) ? list.length : 0));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditingSignal(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (signal) => {
    setEditingSignal(signal);
    setForm({
      symbol: signal.symbol || '',
      action: signal.action || '',
      side: signal.side || '',
      volume: signal.volume?.toString() || '',
      openPrice: signal.openPrice?.toString() || signal.price?.toString() || '',
      stopLoss: signal.stopLoss?.toString() || '',
      takeProfit: signal.takeProfit?.toString() || '',
      openTime: signal.openTime ? new Date(signal.openTime).toISOString().slice(0, 16) : '',
      description: signal.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        symbol: form.symbol.toUpperCase().trim(),
        action: form.action.toUpperCase(),
        side: form.side.toUpperCase(),
        volume: parseFloat(form.volume) || 0,
        openPrice: parseFloat(form.openPrice) || 0,
        stopLoss: parseFloat(form.stopLoss) || 0,
        takeProfit: parseFloat(form.takeProfit) || 0,
        openTime: form.openTime ? new Date(form.openTime).toISOString() : new Date().toISOString(),
        description: form.description,
      };
      if (editingSignal) {
        await signalService.updateSignal(editingSignal._id || editingSignal.id, payload);
        toast.success('Signal updated successfully');
      } else {
        await signalService.createSignal(payload);
        toast.success('Signal created successfully');
      }
      setModalOpen(false);
      fetchSignals();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save signal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (signal) => {
    if (!window.confirm(`Delete ${signal.action} signal for ${signal.symbol}? This cannot be undone.`)) return;
    const signalId = signal._id || signal.id;
    try {
      setDeletingId(signalId);
      await signalService.deleteSignal(signalId);
      toast.success('Signal deleted successfully');
      setSignals((prev) => prev.filter((s) => (s._id || s.id) !== signalId));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete signal');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: 'symbol',
      header: 'Symbol',
      render: (_, row) => (
        <span className="font-semibold text-ink tracking-wide">
          {row.symbol}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (_, row) => (
        <Badge color={actionColor[row.action] || 'neutral'}>
          <span className="flex items-center gap-1">
            {row.action === 'BUY' && <FiArrowUpCircle className="h-3 w-3" />}
            {row.action === 'SELL' && <FiArrowDownCircle className="h-3 w-3" />}
            {row.action}
          </span>
        </Badge>
      ),
    },
    {
      key: 'side',
      header: 'Side',
      render: (_, row) => (
        <span className="text-sm capitalize text-dark-500">
          {row.side || '—'}
        </span>
      ),
    },
    {
      key: 'volume',
      header: 'Volume',
      render: (_, row) => (
        <span className="text-sm text-dark-500 font-mono">
          {row.volume ?? row.lotSize ?? '—'}
        </span>
      ),
    },
    {
      key: 'openPrice',
      header: 'Price',
      render: (_, row) => (
        <span className="text-sm text-dark-500 font-mono">
          {row.openPrice ?? row.price ?? '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => (
        <Badge color={statusColor[row.status] || 'neutral'}>
          {row.status || 'open'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (_, row) => (
        <span className="text-sm text-dark-500">{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => {
        const signalId = row._id || row.id;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => openEditModal(row)}
              className="rounded-xl p-2 text-dark-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              title="Edit signal"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row)}
              disabled={deletingId === signalId}
              className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
              title="Delete signal"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Trading Signals</h1>
          <p className="mt-1 text-sm text-dark-500">
            Create and manage trading signals for students
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          New Signal
        </Button>
      </div>

      <Card>
        <div className="p-6 border-b border-dark-100">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-48"
          />
        </div>

        <DataTable
          columns={columns}
          data={signals}
          loading={loading}
          emptyMessage="No signals found. Create your first trading signal."
        />

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-100 flex items-center justify-between">
            <p className="text-sm text-dark-500">
              {totalItems} signal{totalItems !== 1 ? 's' : ''} total
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSignal ? 'Edit Signal' : 'Create Signal'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Symbol"
              placeholder="e.g. EURUSD, BTCUSD, XAUUSD"
              value={form.symbol}
              onChange={(e) => handleChange('symbol', e.target.value)}
              required
            />
            <Select
              label="Action"
              options={actionOptions}
              value={form.action}
              onChange={(e) => handleChange('action', e.target.value)}
              placeholder="Select action..."
            />
            <Select
              label="Side"
              options={sideOptions}
              value={form.side}
              onChange={(e) => handleChange('side', e.target.value)}
              placeholder="Select side..."
            />
            <Input
              label="Volume / Lot Size"
              type="number"
              step="0.01"
              placeholder="e.g. 0.10"
              value={form.volume}
              onChange={(e) => handleChange('volume', e.target.value)}
            />
            <Input
              label="Open Price"
              type="number"
              step="0.00001"
              placeholder="Entry price"
              value={form.openPrice}
              onChange={(e) => handleChange('openPrice', e.target.value)}
            />
            <Input
              label="Stop Loss"
              type="number"
              step="0.00001"
              placeholder="Stop loss level"
              value={form.stopLoss}
              onChange={(e) => handleChange('stopLoss', e.target.value)}
            />
            <Input
              label="Take Profit"
              type="number"
              step="0.00001"
              placeholder="Take profit level"
              value={form.takeProfit}
              onChange={(e) => handleChange('takeProfit', e.target.value)}
            />
            <Input
              label="Open Time"
              type="datetime-local"
              value={form.openTime}
              onChange={(e) => handleChange('openTime', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-500 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Signal rationale, analysis notes..."
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-dark-100">
            <Button type="submit" loading={submitting}>
              {editingSignal ? 'Update Signal' : 'Create Signal'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
