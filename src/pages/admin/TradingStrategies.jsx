import { useState, useEffect, useCallback } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCpu,
  FiDollarSign,
  FiImage,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';

const initialForm = {
  name: '',
  tag: '',
  imageUrl: '',
  minAmount: 250,
  maxAmount: 5000,
  sortOrder: 0,
  isActive: true,
};

const FEE_KEY = 'bot_connect_fee_amount';

export default function TradingStrategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [feeValue, setFeeValue] = useState('20');
  const [savingFee, setSavingFee] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [strategyRes, settingsRes] = await Promise.all([
        adminService.getStrategies(),
        adminService.getSettings(),
      ]);
      const list = strategyRes?.data || strategyRes;
      setStrategies(Array.isArray(list) ? list : []);

      const settingsArr = settingsRes?.data || settingsRes;
      const flat = Array.isArray(settingsArr)
        ? settingsArr.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
          }, {})
        : {};
      if (flat[FEE_KEY] !== undefined && flat[FEE_KEY] !== null && flat[FEE_KEY] !== '') {
        setFeeValue(String(flat[FEE_KEY]));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load strategies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (strategy) => {
    setEditing(strategy);
    setForm({
      name: strategy.name || '',
      tag: strategy.tag || '',
      imageUrl: strategy.imageUrl || '',
      minAmount: strategy.minAmount ?? 250,
      maxAmount: strategy.maxAmount ?? 5000,
      sortOrder: strategy.sortOrder ?? 0,
      isActive: strategy.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const data = await adminService.uploadStrategyImage(fd);
      const url = data?.data?.url || data?.url;
      if (url) {
        handleChange('imageUrl', url);
        toast.success('Image uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Strategy name is required');
      return;
    }
    const minAmount = Number(form.minAmount);
    const maxAmount = Number(form.maxAmount);
    if (!Number.isFinite(minAmount) || !Number.isFinite(maxAmount) || minAmount < 0 || maxAmount < 0) {
      toast.error('Minimum and maximum amounts must be valid numbers');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: form.name.trim(),
        tag: form.tag.trim() || null,
        imageUrl: form.imageUrl || null,
        minAmount,
        maxAmount,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
      };
      if (editing) {
        await adminService.updateStrategy(editing._id || editing.id, payload);
        toast.success('Strategy updated successfully');
      } else {
        await adminService.createStrategy(payload);
        toast.success('Strategy created successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save strategy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (strategy) => {
    if (!window.confirm(`Delete strategy "${strategy.name}"? This cannot be undone.`)) return;
    try {
      await adminService.deleteStrategy(strategy._id || strategy.id);
      toast.success('Strategy deleted successfully');
      setStrategies((prev) => prev.filter((s) => (s._id || s.id) !== (strategy._id || strategy.id)));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete strategy');
    }
  };

  const handleToggle = async (strategy) => {
    try {
      const updated = await adminService.updateStrategy(strategy._id || strategy.id, {
        isActive: strategy.isActive === false,
      });
      const next = updated?.data || updated;
      setStrategies((prev) =>
        prev.map((s) =>
          (s._id || s.id) === (strategy._id || strategy.id)
            ? { ...s, isActive: next?.isActive ?? strategy.isActive === false }
            : s
        )
      );
      toast.success(`Strategy ${strategy.isActive !== false ? 'deactivated' : 'activated'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update strategy');
    }
  };

  const handleSaveFee = async () => {
    const amount = Number(feeValue);
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Enter a valid fee amount');
      return;
    }
    try {
      setSavingFee(true);
      await adminService.updateSetting({
        key: FEE_KEY,
        value: String(amount),
        category: 'trading',
        description: 'Fee charged from main wallet when connecting a real trading bot account (USD)',
      });
      setFeeValue(String(amount));
      toast.success('Connect fee updated');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save fee');
    } finally {
      setSavingFee(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Trading Strategies</h1>
          <p className="mt-1 text-sm text-dark-500">
            Manage the strategy cards students choose when connecting a bot
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <FiPlus className="h-4 w-4" />
          New Strategy
        </Button>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FiDollarSign className="h-5 w-5" />
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="font-semibold text-ink">Bot Connect Fee</p>
            <p className="mt-0.5 text-xs text-dark-500">
              Charged from the student's main wallet when connecting a real account (demo is free)
            </p>
          </div>
          <div className="flex items-end gap-2">
            <Input
              label="Amount (USD)"
              type="number"
              min="0"
              step="0.01"
              value={feeValue}
              onChange={(e) => setFeeValue(e.target.value)}
              placeholder="20"
            />
            <Button onClick={handleSaveFee} loading={savingFee} className="mb-0.5">
              Save Fee
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : strategies.length === 0 ? (
        <Card className="p-10 text-center">
          <FiCpu className="mx-auto h-10 w-10 text-dark-400" />
          <p className="mt-3 font-medium text-ink">No strategies yet</p>
          <p className="mt-1 text-sm text-dark-500">Create your first strategy card to get started.</p>
          <div className="mt-4 flex justify-center">
            <Button onClick={openCreateModal}>
              <FiPlus className="h-4 w-4" /> New Strategy
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {strategies.map((strategy) => (
            <div
              key={strategy._id}
              className="overflow-hidden rounded-2xl border border-dark-100 bg-white shadow-card transition-all hover:border-primary-200 hover:shadow-card-lg"
            >
              <div className="relative h-40 bg-dark-100">
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
                <button
                  onClick={() => handleToggle(strategy)}
                  className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur transition-colors ${
                    strategy.isActive !== false
                      ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                      : 'bg-dark-500/90 text-white hover:bg-dark-600'
                  }`}
                >
                  {strategy.isActive !== false ? <FiCheck className="h-3 w-3" /> : <FiX className="h-3 w-3" />}
                  {strategy.isActive !== false ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-ink">{strategy.name}</h3>
                    {strategy.tag && (
                      <span className="mt-1.5 inline-block rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary-600">
                        {strategy.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0">
                    <button
                      onClick={() => openEditModal(strategy)}
                      className="rounded-lg p-2 text-dark-400 transition-colors hover:bg-primary-50 hover:text-primary-500"
                      title="Edit"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(strategy)}
                      className="rounded-lg p-2 text-dark-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 rounded-xl bg-dark-50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-500">Minimum</span>
                    <span className="font-semibold text-ink">${Number(strategy.minAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-500">Maximum</span>
                    <span className="font-semibold text-ink">${Number(strategy.maxAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Strategy' : 'New Strategy'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Strategy Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. TITAN EDGE"
            required
          />
          <Input
            label="Tag / Category"
            value={form.tag}
            onChange={(e) => handleChange('tag', e.target.value)}
            placeholder="e.g. Trend, Balanced, Advanced, Adaptive AI"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum ($)"
              type="number"
              min="0"
              value={form.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
              placeholder="250"
            />
            <Input
              label="Maximum ($)"
              type="number"
              min="0"
              value={form.maxAmount}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
              placeholder="5000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Order"
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) => handleChange('sortOrder', e.target.value)}
              placeholder="0"
            />
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-dark-500">
                Card Image
              </label>
              <div className="flex items-center gap-2">
                <label className="flex h-10 cursor-pointer items-center gap-2 rounded-[11px] border border-dark-200 bg-dark-50 px-4 text-sm text-dark-500 transition-colors hover:border-primary-300 hover:text-primary-600">
                  <FiImage className="h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : form.imageUrl ? 'Change' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="h-10 w-10 rounded-lg object-cover" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChange('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                form.isActive ? 'bg-primary-500' : 'bg-dark-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  form.isActive ? 'translate-x-5' : 'translate-x-0.5'
                } mt-0.5 ml-0.5`}
              />
            </button>
            <span className="text-sm text-dark-500">
              {form.isActive ? 'Visible to students' : 'Hidden from students'}
            </span>
          </div>

          <div className="flex items-center gap-3 border-t border-dark-100 pt-4">
            <Button type="submit" loading={submitting}>
              {editing ? 'Update Strategy' : 'Create Strategy'}
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
