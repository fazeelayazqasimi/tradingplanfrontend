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

function getSubId(sub) {
  return sub._id || sub.id;
}

const statusColor = {
  active: 'success',
  pending: 'warning',
  expired: 'danger',
  rejected: 'danger',
  cancelled: 'neutral',
};

const planColors = {
  basic: 'bg-dark-100 text-dark-600',
  pro: 'bg-primary-50 text-primary-700',
  premium: 'bg-purple-50 text-purple-700',
  enterprise: 'bg-amber-50 text-amber-700',
};

const columns = [
  {
    key: 'student',
    header: 'Student',
    render: (_, row) => (
      <div className="flex items-center gap-3">
        <img
          src={
            row.student?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent((row.student?.firstName || 'U') + ' ' + (row.student?.lastName || ''))}&background=2563EB&color=fff&size=36`
          }
          alt={row.student?.firstName}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-dark-100"
        />
        <div>
          <p className="font-medium text-ink">
            {row.student?.firstName ? `${row.student.firstName} ${row.student.lastName}` : 'Unknown'}
          </p>
          <p className="text-xs text-dark-500">
            {row.student?.email || ''}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: 'plan',
    header: 'Plan',
    render: (_, row) => {
      const planKey = (row.plan || 'basic').toLowerCase();
      return (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${
            planColors[planKey] || planColors.basic
          }`}
        >
          {row.plan}
        </span>
      );
    },
  },
  {
    key: 'amount',
    header: 'Amount',
    render: (_, row) => (
      <span className="font-semibold text-ink">
        {formatCurrency(row.amount)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (_, row) => (
      <Badge color={statusColor[row.status] || 'neutral'}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'startDate',
    header: 'Start Date',
    render: (_, row) => (
      <span className="text-[14.5px] text-dark-500">
        {formatDate(row.startDate)}
      </span>
    ),
  },
  {
    key: 'endDate',
    header: 'End Date',
    render: (_, row) => (
      <span className="text-[14.5px] text-dark-500">
        {formatDate(row.endDate)}
      </span>
    ),
  },
];

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const pagination = usePagination({ totalItems: subscriptions.length, perPage: 10 });

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getSubscriptions({
        search: searchQuery,
        status: statusFilter,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setSubscriptions(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    fetchSubscriptions();
  };

  const handleApprove = async (sub) => {
    const subId = getSubId(sub);
    try {
      setProcessingId(subId);
      await adminService.approveSubscription(subId, { status: 'approved' });
      toast.success('Subscription approved successfully');
      setSubscriptions((prev) =>
        prev.map((s) => (getSubId(s) === subId ? { ...s, status: 'active' } : s))
      );
      if (getSubId(selectedSub) === subId) {
        setSelectedSub((prev) => (prev ? { ...prev, status: 'active' } : prev));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to approve subscription');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sub) => {
    const subId = getSubId(sub);
    if (!window.confirm('Are you sure you want to reject this subscription?')) return;
    try {
      setProcessingId(subId);
      await adminService.rejectSubscription(subId);
      toast.success('Subscription rejected');
      setSubscriptions((prev) =>
        prev.map((s) => (getSubId(s) === subId ? { ...s, status: 'rejected' } : s))
      );
      if (getSubId(selectedSub) === subId) {
        setSelectedSub((prev) => (prev ? { ...prev, status: 'rejected' } : prev));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reject subscription');
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (sub) => {
    setEditingSub(sub);
    setEditForm({
      plan: sub.plan || '',
      amount: sub.amount || '',
      status: sub.status || '',
      startDate: sub.startDate ? sub.startDate.split('T')[0] : '',
      endDate: sub.endDate ? sub.endDate.split('T')[0] : '',
      paymentMethod: sub.paymentMethod || '',
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
      fetchSubscriptions();
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
            onClick={() => {
              setSelectedSub(row);
              setDetailOpen(true);
            }}
            className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedSub(row);
              startEdit(row);
              setDetailOpen(true);
            }}
            className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
            title="Edit"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
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
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Subscriptions</h1>
        <p className="mt-1 text-sm text-dark-500">
          Manage student subscriptions and approvals
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                pagination.goToPage(1);
              }}
              className="rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white transition-colors"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>

        <DataTable
          columns={allColumns}
          data={subscriptions}
          loading={loading}
          emptyMessage="No subscriptions found"
        />

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-100 flex items-center justify-between">
            <p className="text-sm text-dark-500">
              Showing {pagination.from} to {pagination.to} of {pagination.totalItems} subscriptions
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.prevPage}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              {pagination.pageNumbers.map((p) => (
                <Button
                  key={p}
                  variant={p === pagination.currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => pagination.goToPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.nextPage}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setEditingSub(null); }}
        title={editingSub ? 'Edit Subscription' : 'Subscription Details'}
        size="md"
      >
        {editingSub ? (
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
              <Button variant="primary" onClick={handleEditSave} disabled={editSaving}>
                <FiSave className="mr-1.5 h-4 w-4" />
                {editSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditingSub(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : selectedSub ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                <FiCreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink capitalize">
                  {selectedSub.plan} Plan
                </h3>
                <Badge color={statusColor[selectedSub.status] || 'neutral'}>
                  {selectedSub.status}
                </Badge>
              </div>
            </div>

            <div className="rounded-[18px] border border-dark-100 divide-y divide-dark-50">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiUser className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Student</p>
                  <p className="text-[15px] font-medium text-ink">
                    {selectedSub.student?.firstName ? `${selectedSub.student.firstName} ${selectedSub.student.lastName}` : 'Unknown'}
                    {selectedSub.student?.email && (
                      <span className="text-dark-500 ml-2">
                        ({selectedSub.student.email})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiDollarSign className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Amount</p>
                  <p className="text-[15px] font-medium text-ink">
                    {formatCurrency(selectedSub.amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiCalendar className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Start Date</p>
                  <p className="text-[15px] font-medium text-ink">
                    {formatDate(selectedSub.startDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiCalendar className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">End Date</p>
                  <p className="text-[15px] font-medium text-ink">
                    {formatDate(selectedSub.endDate)}
                  </p>
                </div>
              </div>
              {selectedSub.paymentMethod && (
                <div className="px-4 py-3.5">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1">Payment Method</p>
                  <p className="text-[15px] font-medium text-ink capitalize">
                    {selectedSub.paymentMethod}
                  </p>
                </div>
              )}
              {selectedSub.notes && (
                <div className="px-4 py-3.5 last:border-0">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500 mb-1">Notes</p>
                  <p className="text-[14.5px] text-dark-500">{selectedSub.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              {selectedSub.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleApprove(selectedSub)}
                    disabled={processingId === getSubId(selectedSub)}
                  >
                    <FiCheck className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(selectedSub)}
                    disabled={processingId === getSubId(selectedSub)}
                  >
                    <FiX className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => { setDetailOpen(false); setEditingSub(null); }}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-dark-500">Loading...</p>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-60 w-full rounded-[18px]" />
          </div>
        )}
      </Modal>
    </div>
  );
}
