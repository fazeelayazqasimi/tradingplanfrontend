import { useState, useEffect, useCallback } from 'react';
import {
  FiSearch,
  FiCheck,
  FiX,
  FiEye,
  FiEdit2,
  FiCreditCard,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiSave,
  FiShoppingCart,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

function getSubId(row) {
  return row._id || row.id;
}

const statusColor = {
  active: 'success',
  pending: 'warning',
  expired: 'danger',
  rejected: 'danger',
  cancelled: 'neutral',
};

const columns = [
  {
    key: 'type',
    header: 'Type',
    render: (_, row) =>
      row._type === 'purchase' ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
          <FiShoppingCart size={11} /> Course
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-dark-100 px-2.5 py-0.5 text-[11px] font-semibold text-dark-600">
          <FiCreditCard size={11} /> Plan
        </span>
      ),
  },
  {
    key: 'student',
    header: 'Student',
    render: (_, row) => {
      const s = row.student || row.userId || {};
      return (
        <div className="flex items-center gap-3">
          <img
            src={
              s.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent((s.firstName || 'U') + ' ' + (s.lastName || ''))}&background=2563EB&color=fff&size=36`
            }
            alt={s.firstName}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-dark-100"
          />
          <div>
            <p className="font-medium text-ink text-sm">
              {s.firstName ? `${s.firstName} ${s.lastName}` : 'Unknown'}
            </p>
            <p className="text-xs text-dark-500">{s.email || ''}</p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'item',
    header: 'Item',
    render: (_, row) =>
      row._type === 'purchase' ? (
        <span className="text-sm font-medium text-ink">{row.courseId?.title || row.metadata?.courseTitle || 'Course'}</span>
      ) : (
        <span className="text-sm font-medium text-ink capitalize">{row.plan || 'Plan'}</span>
      ),
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (_, row) => (
      <span className="font-semibold text-ink text-sm">{formatCurrency(row.amount)}</span>
    ),
  },
  {
    key: 'broker',
    header: 'Broker',
    render: (_, row) =>
      row._type === 'purchase' ? (
        <Badge color={row.broker === 'dma' ? 'info' : 'purple'}>
          {row.broker === 'dma' ? 'DMA' : 'StarTrading'}
        </Badge>
      ) : (
        <span className="text-sm text-dark-400">—</span>
      ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (_, row) => (
      <Badge color={statusColor[row.status] || 'neutral'}>{row.status}</Badge>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    render: (_, row) => (
      <span className="text-sm text-dark-400">{formatDate(row.createdAt || row.startDate)}</span>
    ),
  },
];

export default function Subscriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const pagination = usePagination({ totalItems: items.length, perPage: 10 });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const [subRes, purchaseRes] = await Promise.allSettled([
        adminService.getSubscriptions({
          search: searchQuery,
          status: statusFilter,
          page: 1, limit: 200,
        }),
        adminService.getCoursePurchases({
          status: statusFilter || undefined,
          page: 1, limit: 200,
        }),
      ]);
      let subs = [];
      if (subRes.status === 'fulfilled') {
        subs = (subRes.value?.data || []).map((s) => ({ ...s, _type: 'subscription', student: s.student || s.userId }));
      }
      let purchases = [];
      if (purchaseRes.status === 'fulfilled') {
        purchases = (purchaseRes.value?.data || []).map((p) => ({ ...p, _type: 'purchase', student: p.userId }));
      }
      const merged = [...subs, ...purchases].sort((a, b) => new Date(b.createdAt || b.startDate || 0) - new Date(a.createdAt || a.startDate || 0));
      pagination.setTotalItems(merged.length);
      setItems(merged);
    } catch (err) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleApprove = async (row) => {
    const id = getSubId(row);
    try {
      setProcessingId(id);
      if (row._type === 'purchase') {
        await adminService.approvePurchase(id, { status: 'approved' });
        toast.success('Purchase approved! Commissions processed.');
      } else {
        await adminService.approveSubscription(id, { status: 'approved' });
        toast.success('Subscription approved successfully');
      }
      setItems((prev) => prev.map((x) => (getSubId(x) === id ? { ...x, status: 'active' } : x)));
      if (getSubId(selectedItem) === id) setSelectedItem((prev) => (prev ? { ...prev, status: 'active' } : prev));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (row) => {
    if (!window.confirm(`Reject this ${row._type === 'purchase' ? 'purchase' : 'subscription'}?`)) return;
    const id = getSubId(row);
    try {
      setProcessingId(id);
      if (row._type === 'purchase') {
        await adminService.rejectPurchase(id);
        toast.success('Purchase rejected');
      } else {
        await adminService.rejectSubscription(id);
        toast.success('Subscription rejected');
      }
      setItems((prev) => prev.map((x) => (getSubId(x) === id ? { ...x, status: 'rejected' } : x)));
      if (getSubId(selectedItem) === id) setSelectedItem((prev) => (prev ? { ...prev, status: 'rejected' } : prev));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (row) => {
    setEditingSub(row);
    setEditForm({
      plan: row.plan || '',
      amount: row.amount || '',
      status: row.status || '',
      startDate: row.startDate ? row.startDate.split('T')[0] : '',
      endDate: row.endDate ? row.endDate.split('T')[0] : '',
      paymentMethod: row.paymentMethod || '',
    });
  };

  const handleEditSave = async () => {
    if (!editingSub) return;
    const editingId = getSubId(editingSub);
    try {
      setEditSaving(true);
      const payload = { ...editForm };
      if (payload.amount) payload.amount = Number(payload.amount);
      await adminService.updateSubscription(editingId, payload);
      toast.success('Subscription updated');
      setEditingSub(null);
      setDetailOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update subscription');
    } finally {
      setEditSaving(false);
    }
  };

  const actionColumn = {
    key: 'actions',
    header: '',
    render: (_, row) => {
      const rowId = getSubId(row);
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setSelectedItem(row); setDetailOpen(true); }}
            className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          {row._type !== 'purchase' && (
            <button
              onClick={() => { setSelectedItem(row); startEdit(row); setDetailOpen(true); }}
              className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
              title="Edit"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
          )}
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row)}
                disabled={processingId === rowId}
                className="rounded-xl p-2 text-dark-400 hover:bg-green-50 hover:text-green-500 transition-colors disabled:opacity-50"
                title="Approve"
              >
                <FiCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleReject(row)}
                disabled={processingId === rowId}
                className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Reject"
              >
                <FiX className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      );
    },
  };

  const allColumns = [...columns, actionColumn];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Subscriptions & Purchases</h1>
        <p className="mt-1 text-sm text-dark-500">
          Manage student subscriptions and course purchase approvals
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-dark-100">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
              <Input
                type="text"
                placeholder="Search by student name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); }}
              className="rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button type="submit" variant="primary">Search</Button>
          </form>
        </div>

        <DataTable
          columns={allColumns}
          data={items}
          loading={loading}
          emptyMessage="No subscriptions or purchases found"
        />
      </Card>

      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setEditingSub(null); }}
        title={selectedItem?._type === 'purchase' ? 'Purchase Details' : editingSub ? 'Edit Subscription' : 'Subscription Details'}
        size="md"
      >
        {selectedItem?._type === 'purchase' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <FiShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{selectedItem.courseId?.title || 'Course Purchase'}</h3>
                <Badge color={statusColor[selectedItem.status] || 'neutral'}>{selectedItem.status}</Badge>
              </div>
            </div>
            <div className="rounded-[18px] border border-dark-100 divide-y divide-dark-50">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiUser className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Student</p>
                  <p className="text-[15px] font-medium text-ink">
                    {selectedItem.student?.firstName ? `${selectedItem.student.firstName} ${selectedItem.student.lastName}` : 'Unknown'}
                    {selectedItem.student?.email && <span className="text-dark-500 ml-2">({selectedItem.student.email})</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiDollarSign className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Amount</p>
                  <p className="text-[15px] font-medium text-ink">{formatCurrency(selectedItem.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiShoppingCart className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Broker</p>
                  <p className="text-[15px] font-medium text-ink capitalize">{selectedItem.broker}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {selectedItem.status === 'pending' && (
                <>
                  <Button variant="success" onClick={() => handleApprove(selectedItem)} disabled={processingId === getSubId(selectedItem)}>
                    <FiCheck className="mr-1.5 h-4 w-4" /> Approve
                  </Button>
                  <Button variant="danger" onClick={() => handleReject(selectedItem)} disabled={processingId === getSubId(selectedItem)}>
                    <FiX className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => { setDetailOpen(false); setEditingSub(null); }}>Close</Button>
            </div>
          </div>
        ) : editingSub ? (
          <div className="space-y-5">
            <Select label="Plan" value={editForm.plan} onChange={(e) => setEditForm((p) => ({ ...p, plan: e.target.value }))}>
              <option value="">Select plan</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </Select>
            <Input label="Amount (USD)" type="number" value={editForm.amount} onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} />
            <Select label="Status" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}>
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </Select>
            <Input label="Start Date" type="date" value={editForm.startDate} onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={editForm.endDate} onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))} />
            <Input label="Payment Method" value={editForm.paymentMethod} onChange={(e) => setEditForm((p) => ({ ...p, paymentMethod: e.target.value }))} />
            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" onClick={handleEditSave} disabled={editSaving}><FiSave className="mr-1.5 h-4 w-4" />{editSaving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setEditingSub(null)}>Cancel</Button>
            </div>
          </div>
        ) : selectedItem ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                <FiCreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink capitalize">{selectedItem.plan} Plan</h3>
                <Badge color={statusColor[selectedItem.status] || 'neutral'}>{selectedItem.status}</Badge>
              </div>
            </div>
            <div className="rounded-[18px] border border-dark-100 divide-y divide-dark-50">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiUser className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Student</p>
                  <p className="text-[15px] font-medium text-ink">
                    {selectedItem.student?.firstName ? `${selectedItem.student.firstName} ${selectedItem.student.lastName}` : 'Unknown'}
                    {selectedItem.student?.email && <span className="text-dark-500 ml-2">({selectedItem.student.email})</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiDollarSign className="h-4 w-4 text-dark-400" />
                <div><p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Amount</p><p className="text-[15px] font-medium text-ink">{formatCurrency(selectedItem.amount)}</p></div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiCalendar className="h-4 w-4 text-dark-400" />
                <div><p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Start Date</p><p className="text-[15px] font-medium text-ink">{formatDate(selectedItem.startDate)}</p></div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiCalendar className="h-4 w-4 text-dark-400" />
                <div><p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">End Date</p><p className="text-[15px] font-medium text-ink">{formatDate(selectedItem.endDate)}</p></div>
              </div>
              {selectedItem.paymentMethod && (
                <div className="px-4 py-3.5"><p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1">Payment Method</p><p className="text-[15px] font-medium text-ink capitalize">{selectedItem.paymentMethod}</p></div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2">
              {selectedItem.status === 'pending' && (
                <>
                  <Button variant="success" onClick={() => handleApprove(selectedItem)} disabled={processingId === getSubId(selectedItem)}><FiCheck className="mr-1.5 h-4 w-4" /> Approve</Button>
                  <Button variant="danger" onClick={() => handleReject(selectedItem)} disabled={processingId === getSubId(selectedItem)}><FiX className="mr-1.5 h-4 w-4" /> Reject</Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-60 w-full rounded-[18px]" />
          </div>
        )}
      </Modal>
    </div>
  );
}
