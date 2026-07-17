import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiTag, FiPercent, FiDollarSign, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import couponService from '../../services/couponService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const typeColors = { percentage: 'primary', fixed: 'success', pin: 'warning' };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', minPurchase: 0, maxDiscount: '',
    usageLimit: '', perUserLimit: 1, applicableTo: 'all',
    startsAt: '', expiresAt: '', description: '', isActive: true,
  });

  const { page, limit, nextPage, prevPage, goToPage, setTotalItems, currentPage, totalPages } = usePagination(1, 10);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, perPage: limit };
      if (search) params.search = search;
      const res = await couponService.getCoupons(params);
      const data = res?.data?.data || [];
      setCoupons(data);
      setTotalItems(res?.data?.pagination?.total || data.length);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, search, setTotalItems]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const resetForm = () => {
    setForm({ code: '', type: 'percentage', value: '', minPurchase: 0, maxDiscount: '', usageLimit: '', perUserLimit: 1, applicableTo: 'all', startsAt: '', expiresAt: '', description: '', isActive: true });
    setEditing(null);
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code, type: coupon.type, value: coupon.value.toString(),
      minPurchase: coupon.minPurchase?.toString() || '0', maxDiscount: coupon.maxDiscount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '', perUserLimit: coupon.perUserLimit?.toString() || '1',
      applicableTo: coupon.applicableTo || 'all', startsAt: coupon.startsAt ? coupon.startsAt.slice(0, 16) : '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '', description: coupon.description || '',
      isActive: coupon.isActive,
    });
    setEditing(coupon);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...form,
      value: parseFloat(form.value),
      minPurchase: parseFloat(form.minPurchase) || 0,
      maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
      perUserLimit: parseInt(form.perUserLimit) || 1,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    try {
      if (editing) {
        await couponService.updateCoupon(editing._id, payload);
        toast.success('Coupon updated');
      } else {
        await couponService.createCoupon(payload);
        toast.success('Coupon created');
      }
      setShowForm(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await couponService.deleteCoupon(coupon._id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await couponService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update');
    }
  };

  const columns = [
    { header: 'Code', render: (_, row) => <span className="font-mono font-bold text-primary-600">{row.code}</span> },
    { header: 'Type', render: (_, row) => <Badge color={typeColors[row.type]}>{row.type}</Badge> },
    { header: 'Value', render: (_, row) => row.type === 'percentage' ? `${row.value}%` : formatCurrency(row.value) },
    { header: 'Used', render: (_, row) => `${row.usedCount || 0}${row.usageLimit ? ` / ${row.usageLimit}` : ''}` },
    {
      header: 'Status',
      render: (_, row) => {
        const expired = row.expiresAt && new Date(row.expiresAt) < new Date();
        if (expired) return <Badge color="danger">Expired</Badge>;
        return row.isActive ? <Badge color="success">Active</Badge> : <Badge color="default">Inactive</Badge>;
      },
    },
    { header: 'Expires', render: (_, row) => row.expiresAt ? formatDate(row.expiresAt) : '\u2014' },
    {
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleToggleActive(row)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-primary-600" title={row.isActive ? 'Deactivate' : 'Activate'}>
            {row.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
          </button>
          <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-primary-600"><FiEdit2 size={16} /></button>
          <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-500 hover:text-red-600"><FiTrash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Coupons & PINs</h1>
          <p className="mt-1 text-sm text-dark-500">Manage discount coupons, promo codes, and PIN-based offers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-dark-200 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><FiPlus size={16} /> Create Coupon</Button>
        </div>
      </div>

      <motion.div variants={container} initial="hidden" animate="show">
        <Card className="p-5">
          {loading ? (
            <Skeleton count={5} className="h-12 w-full" />
          ) : coupons.length === 0 ? (
            <div className="py-12 text-center text-dark-400">
              <FiTag size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No coupons found. Create your first coupon to get started.</p>
            </div>
          ) : (
            <>
              <DataTable columns={columns} data={coupons} page={page} totalPages={totalPages} onNextPage={nextPage} onPrevPage={prevPage} />
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.div>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Coupon' : 'Create Coupon'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Coupon Code" placeholder="e.g. SAVE20" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required disabled={editing} />
            <Select label="Type" options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount ($)' }, { value: 'pin', label: 'PIN Code' }]} value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label={form.type === 'percentage' ? 'Discount (%)' : 'Discount Amount ($)'} type="number" placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 50'} value={form.value} onChange={(e) => setForm(p => ({ ...p, value: e.target.value }))} required min="0" step="0.01" />
            <Input label="Max Discount ($)" type="number" placeholder="Leave empty for no limit" value={form.maxDiscount} onChange={(e) => setForm(p => ({ ...p, maxDiscount: e.target.value }))} min="0" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Purchase ($)" type="number" placeholder="0 for no minimum" value={form.minPurchase} onChange={(e) => setForm(p => ({ ...p, minPurchase: e.target.value }))} min="0" step="0.01" />
            <Input label="Usage Limit" type="number" placeholder="Leave empty for unlimited" value={form.usageLimit} onChange={(e) => setForm(p => ({ ...p, usageLimit: e.target.value }))} min="1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Per User Limit" type="number" placeholder="1" value={form.perUserLimit} onChange={(e) => setForm(p => ({ ...p, perUserLimit: e.target.value }))} min="1" />
            <Select label="Applicable To" options={[{ value: 'all', label: 'All Purchases' }, { value: 'courses', label: 'Courses Only' }, { value: 'subscriptions', label: 'Subscriptions Only' }]} value={form.applicableTo} onChange={(e) => setForm(p => ({ ...p, applicableTo: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="datetime-local" value={form.startsAt} onChange={(e) => setForm(p => ({ ...p, startsAt: e.target.value }))} />
            <Input label="Expiry Date" type="datetime-local" value={form.expiresAt} onChange={(e) => setForm(p => ({ ...p, expiresAt: e.target.value }))} />
          </div>
          <Input label="Description (optional)" placeholder="Brief description of this coupon" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'} Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
