import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowUpCircle,
  FiArrowDownCircle,
  FiCheckCircle,
  FiXCircle,
  FiStopCircle,
} from 'react-icons/fi';import toast from 'react-hot-toast';
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
  openPrices: [''],
  stopLoss: '',
  takeProfit: '',
  takeProfits: [{ price: '' }],
  openTime: '',
  description: '',
  isPublished: true,
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
  const [hittingId, setHittingId] = useState(null);
  const [closingId, setClosingId] = useState(null);

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
    const existingOpenPrices = Array.isArray(signal.openPrices) && signal.openPrices.length
      ? signal.openPrices
      : [signal.openPrice ?? signal.price ?? ''];
    const existingTps = Array.isArray(signal.takeProfits) && signal.takeProfits.length
      ? signal.takeProfits
      : [{ price: signal.takeProfit ?? '' }];
    setEditingSignal(signal);
    setForm({
      symbol: signal.symbol || '',
      action: signal.action || '',
      side: signal.side || '',
      volume: signal.volume?.toString() || '',
      openPrice: signal.openPrice?.toString() || signal.price?.toString() || '',
      openPrices: existingOpenPrices.map((p) => p?.toString() ?? ''),
      stopLoss: signal.stopLoss?.toString() || '',
      takeProfit: signal.takeProfit?.toString() || '',
      takeProfits: existingTps.map((tp) => ({ price: (tp?.price ?? tp)?.toString() || '' })),
      openTime: signal.openTime ? new Date(signal.openTime).toISOString().slice(0, 16) : '',
      description: signal.description || '',
      isPublished: signal.isPublished ?? true,
    });
    setModalOpen(true);
  };

  const setOpenPriceAt = (index, value) => {
    setForm((prev) => {
      const list = [...prev.openPrices];
      list[index] = value;
      return { ...prev, openPrices: list };
    });
  };

  const addOpenPrice = () => {
    setForm((prev) => ({ ...prev, openPrices: [...prev.openPrices, ''] }));
  };

  const removeOpenPrice = (index) => {
    setForm((prev) => {
      const list = prev.openPrices.filter((_, i) => i !== index);
      return { ...prev, openPrices: list.length ? list : [''] };
    });
  };

  const setTakeProfitAt = (index, value) => {
    setForm((prev) => {
      const list = [...prev.takeProfits];
      list[index] = { ...list[index], price: value };
      return { ...prev, takeProfits: list };
    });
  };

  const addTakeProfit = () => {
    setForm((prev) => ({ ...prev, takeProfits: [...prev.takeProfits, { price: '' }] }));
  };

  const removeTakeProfit = (index) => {
    setForm((prev) => {
      const list = prev.takeProfits.filter((_, i) => i !== index);
      return { ...prev, takeProfits: list.length ? list : [{ price: '' }] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const openPrices = form.openPrices
        .map((p) => parseFloat(p))
        .filter((p) => !isNaN(p) && p > 0);
      const takeProfits = form.takeProfits
        .map((tp) => parseFloat(tp.price))
        .filter((p) => !isNaN(p) && p > 0);
      const payload = {
        symbol: form.symbol.toUpperCase().trim(),
        action: form.action.toUpperCase(),
        side: form.side.toUpperCase(),
        volume: parseFloat(form.volume) || 0,
        openPrice: (openPrices[0] ?? parseFloat(form.openPrice)) || 0,
        openPrices,
        stopLoss: parseFloat(form.stopLoss) || 0,
        takeProfit: (takeProfits[0] ?? parseFloat(form.takeProfit)) || 0,
        takeProfits: takeProfits.map((price) => ({ price })),
        openTime: form.openTime ? new Date(form.openTime).toISOString() : new Date().toISOString(),
        description: form.description,
        isPublished: form.isPublished,
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

  const handleHit = async (signal, outcome, tpIndex = null) => {
    const isTP = outcome === 'tp';
    const label = isTP
      ? (tpIndex != null ? `Take Profit ${tpIndex + 1} (TP ${tpIndex + 1})` : 'Take Profit (TP)')
      : 'Stop Loss (SL)';
    if (!window.confirm(
      isTP
        ? (tpIndex != null
          ? `Confirm TP ${tpIndex + 1} hit for ${signal.symbol}? A target-achieved email will be sent to ALL students.`
          : `Confirm TP hit for ${signal.symbol}? A target-achieved email will be sent to ALL students.`)
        : `Confirm SL hit for ${signal.symbol}? A motivational email will be sent to ALL students.`
    )) return;
    const signalId = signal._id || signal.id;
    try {
      setHittingId(signalId);
      if (isTP) {
        if (tpIndex != null) await signalService.hitTP(signalId, undefined, tpIndex);
        else await signalService.hitTP(signalId);
      } else await signalService.hitSL(signalId);
      toast.success(isTP
        ? (tpIndex != null ? `TP ${tpIndex + 1} hit! Email sent to all students` : 'TP hit! Email sent to all students')
        : 'SL hit! Motivational email sent to all students');
      fetchSignals();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || `Failed to mark ${label} hit`);
    } finally {
      setHittingId(null);
    }
  };

  const handleClose = async (signal) => {
    const signalId = signal._id || signal.id;
    if (!window.confirm(
      `Close ${signal.action} signal for ${signal.symbol}? A close notification email will be sent to ALL students.`
    )) return;
    try {
      setClosingId(signalId);
      await signalService.closeSignal(signalId);
      toast.success('Signal closed! Email sent to all students');
      fetchSignals();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to close signal');
    } finally {
      setClosingId(null);
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
      header: 'Open Price',
      render: (_, row) => {
        const prices = Array.isArray(row.openPrices) && row.openPrices.length
          ? row.openPrices
          : [row.openPrice ?? row.price];
        return (
          <div className="flex flex-wrap gap-1">
            {prices.map((p, i) => (
              <span key={i} className="text-xs font-mono text-dark-600 bg-dark-50 rounded px-1.5 py-0.5">
                {p}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'tp',
      header: 'Take Profits',
      render: (_, row) => {
        const tps = Array.isArray(row.takeProfits) && row.takeProfits.length
          ? row.takeProfits
          : (row.takeProfit != null ? [{ price: row.takeProfit, hit: row.result === 'tp' }] : []);
        if (!tps.length) return <span className="text-sm text-dark-400">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {tps.map((tp, i) => (
              <span
                key={i}
                className={`text-xs font-mono rounded px-1.5 py-0.5 ${tp.hit ? 'bg-emerald-50 text-emerald-700' : 'bg-dark-50 text-dark-600'}`}
                title={tp.hit ? 'Hit' : 'Not hit'}
              >
                TP{i + 1}: {tp.price ?? tp}{tp.hit ? ' ✓' : ''}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        if (row.result === 'tp') {
          return (
            <Badge color="success">
              <span className="flex items-center gap-1">
                <FiCheckCircle className="h-3 w-3" />
                TP Hit
              </span>
            </Badge>
          );
        }
        if (row.result === 'sl') {
          return (
            <Badge color="danger">
              <span className="flex items-center gap-1">
                <FiXCircle className="h-3 w-3" />
                SL Hit
              </span>
            </Badge>
          );
        }
        return (
          <Badge color={statusColor[row.status] || 'neutral'}>
            {row.status || 'open'}
          </Badge>
        );
      },
    },
    {
      key: 'profit',
      header: 'Result',
      render: (_, row) =>
        row.profit !== undefined && row.profit !== null ? (
          <span
            className={`text-sm font-semibold font-mono ${
              row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {row.profit >= 0 ? '+' : ''}
            {Number(row.profit).toFixed(2)}
            {row.pips ? ` (${row.pips} pips)` : ''}
          </span>
        ) : (
          <span className="text-sm text-dark-400">—</span>
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
        const isOpen = row.status === 'open' || row.status === 'pending';
        const hitting = hittingId === signalId;
        const closing = closingId === signalId;
        const multiTps = Array.isArray(row.takeProfits) && row.takeProfits.length;
        return (
          <div className="flex items-center justify-end gap-1">
            {isOpen && !row.result && (
              <>
                {multiTps ? (
                  row.takeProfits.map((tp, i) => !tp.hit && (
                    <button
                      key={i}
                      onClick={() => handleHit(row, 'tp', i)}
                      disabled={hitting}
                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                      title={`Mark Take Profit ${i + 1} hit and email all students`}
                    >
                      HIT TP{i + 1}
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => handleHit(row, 'tp')}
                    disabled={hitting}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    title="Mark Take Profit hit and email all students"
                  >
                    HIT TP
                  </button>
                )}
                <button
                  onClick={() => handleHit(row, 'sl')}
                  disabled={hitting}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                  title="Mark Stop Loss hit and email all students"
                >
                  HIT SL
                </button>
                <button
                  onClick={() => handleClose(row)}
                  disabled={closing}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  title="Close signal and email all students"
                >
                  <FiStopCircle className="h-3 w-3" />
                  {closing ? 'CLOSING...' : 'CLOSE'}
                </button>
              </>
            )}
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
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-1.5">
                Open Price{form.openPrices.length > 1 ? 's' : ''}
              </label>
              <div className="space-y-2">
                {form.openPrices.map((price, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder={`Entry price ${i + 1}`}
                      value={price}
                      onChange={(e) => setOpenPriceAt(i, e.target.value)}
                    />
                    {form.openPrices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeOpenPrice(i)}
                        className="shrink-0 rounded-lg p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove open price"
                      >
                        <FiXCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addOpenPrice}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  + Add another open price
                </button>
              </div>
            </div>
            <Input
              label="Stop Loss"
              type="number"
              step="0.00001"
              placeholder="Stop loss level"
              value={form.stopLoss}
              onChange={(e) => handleChange('stopLoss', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-dark-500 mb-1.5">
                Take Profit{form.takeProfits.length > 1 ? 's' : ''}
              </label>
              <div className="space-y-2">
                {form.takeProfits.map((tp, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.00001"
                      placeholder={`Take profit level ${i + 1}`}
                      value={tp.price}
                      onChange={(e) => setTakeProfitAt(i, e.target.value)}
                    />
                    {form.takeProfits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTakeProfit(i)}
                        className="shrink-0 rounded-lg p-2 text-dark-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Remove take profit"
                      >
                        <FiXCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTakeProfit}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  + Add another take profit
                </button>
              </div>
            </div>
            <Input
              label="Open Time"
              type="datetime-local"
              value={form.openTime}
              onChange={(e) => handleChange('openTime', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.isPublished}
                onChange={(e) => handleChange('isPublished', e.target.checked)}
              />
              <div className="w-9 h-5 bg-dark-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500" />
            </label>
            <span className="text-sm font-medium text-dark-500">Publish immediately</span>
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
