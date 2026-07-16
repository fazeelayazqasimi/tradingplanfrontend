import { useState, useEffect, useCallback } from 'react';
import {
  FiCheck,
  FiX,
  FiEye,
  FiSearch,
  FiCreditCard,
  FiUser,
  FiBookOpen,
  FiDollarSign,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

function getId(p) {
  return p._id || p.id;
}

const statusColor = {
  active: 'success',
  pending: 'warning',
  rejected: 'danger',
};

export default function CoursePurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const pagination = usePagination({ totalItems: purchases.length, perPage: 10 });

  const fetchPurchases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoursePurchases({
        search: searchQuery,
        status: statusFilter,
        page: pagination.currentPage,
        perPage: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setPurchases(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    fetchPurchases();
  };

  const handleApprove = async (p) => {
    const pid = getId(p);
    try {
      setProcessingId(pid);
      await adminService.approvePurchase(pid, { status: 'approved' });
      toast.success('Purchase approved! Commissions processed.');
      setPurchases((prev) =>
        prev.map((x) => (getId(x) === pid ? { ...x, status: 'active' } : x))
      );
      if (getId(selectedPurchase) === pid) {
        setSelectedPurchase((prev) => (prev ? { ...prev, status: 'active' } : prev));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (p) => {
    if (!window.confirm('Reject this purchase?')) return;
    const pid = getId(p);
    try {
      setProcessingId(pid);
      await adminService.rejectPurchase(pid);
      toast.success('Purchase rejected');
      setPurchases((prev) =>
        prev.map((x) => (getId(x) === pid ? { ...x, status: 'rejected' } : x))
      );
      if (getId(selectedPurchase) === pid) {
        setSelectedPurchase((prev) => (prev ? { ...prev, status: 'rejected' } : prev));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={
              row.userId?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent((row.userId?.firstName || 'U') + ' ' + (row.userId?.lastName || ''))}&background=2563EB&color=fff&size=36`
            }
            alt={row.userId?.firstName}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-dark-100"
          />
          <div>
            <p className="font-semibold text-ink text-sm">
              {row.userId?.firstName ? `${row.userId.firstName} ${row.userId.lastName}` : 'Unknown'}
            </p>
            <p className="text-xs text-dark-500">{row.userId?.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'course',
      header: 'Course',
      render: (_, row) => (
        <span className="text-sm font-medium text-ink">
          {row.courseId?.title || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'broker',
      header: 'Broker',
      render: (_, row) => (
        <Badge color={row.broker === 'dma' ? 'info' : 'purple'}>
          {row.broker === 'dma' ? 'DMA' : 'StarTrading'}
        </Badge>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (_, row) => (
        <span className="font-semibold text-ink">{formatCurrency(row.amount)}</span>
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
      key: 'createdAt',
      header: 'Date',
      render: (_, row) => (
        <span className="text-sm text-dark-400">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  const actionColumn = {
    key: 'actions',
    header: '',
    render: (_, row) => {
      const rowId = getId(row);
      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setSelectedPurchase(row); setDetailOpen(true); }}
            className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
            title="View details"
          >
            <FiEye className="h-4 w-4" />
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
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Course Purchases</h1>
        <p className="mt-1 text-sm text-dark-500">
          Approve or reject student course purchase requests
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button type="submit" variant="primary">Search</Button>
          </form>
        </div>

        <DataTable
          columns={allColumns}
          data={purchases}
          loading={loading}
          emptyMessage="No course purchases found"
        />

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-dark-100 flex items-center justify-between">
            <p className="text-sm text-dark-500">
              Showing {pagination.from} to {pagination.to} of {pagination.totalItems} purchases
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={pagination.prevPage} disabled={!pagination.hasPrev}>
                Previous
              </Button>
              {pagination.pageNumbers.map((p) => (
                <Button key={p} variant={p === pagination.currentPage ? 'primary' : 'outline'} size="sm" onClick={() => pagination.goToPage(p)}>
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={pagination.nextPage} disabled={!pagination.hasNext}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Purchase Details"
        size="md"
      >
        {selectedPurchase ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
                <FiCreditCard className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  {selectedPurchase.courseId?.title || 'Unknown Course'}
                </h3>
                <Badge color={statusColor[selectedPurchase.status] || 'neutral'}>
                  {selectedPurchase.status}
                </Badge>
              </div>
            </div>

            <div className="rounded-[18px] border border-dark-100 divide-y divide-dark-50">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiUser className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Student</p>
                  <p className="text-[15px] font-medium text-ink">
                    {selectedPurchase.userId?.firstName
                      ? `${selectedPurchase.userId.firstName} ${selectedPurchase.userId.lastName}`
                      : 'Unknown'}
                    {selectedPurchase.userId?.email && (
                      <span className="text-dark-500 ml-2">({selectedPurchase.userId.email})</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiBookOpen className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Course</p>
                  <p className="text-[15px] font-medium text-ink">{selectedPurchase.courseId?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <FiDollarSign className="h-4 w-4 text-dark-400" />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Amount</p>
                  <p className="text-[15px] font-medium text-ink">{formatCurrency(selectedPurchase.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="h-4 w-4 text-dark-400 flex items-center justify-center">
                  <span className="text-xs font-bold">B</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Broker</p>
                  <p className="text-[15px] font-medium text-ink capitalize">{selectedPurchase.broker}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {selectedPurchase.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleApprove(selectedPurchase)}
                    disabled={processingId === getId(selectedPurchase)}
                  >
                    <FiCheck className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReject(selectedPurchase)}
                    disabled={processingId === getId(selectedPurchase)}
                  >
                    <FiX className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-[18px]" />
          </div>
        )}
      </Modal>
    </div>
  );
}
