import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiDollarSign, FiCreditCard, FiEye, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';
import adminService from '../../services/adminService';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'paid', label: 'Paid' },
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', color: 'danger' },
  paid: { label: 'Paid', color: 'info' },
};

export default function Withdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [processing, setProcessing] = useState(null);
  const { page, perPage, setPage, total, setTotal } = usePagination(1, 10);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (statusFilter) params.status = statusFilter;
      const res = await adminService.getWithdrawals(params);
      setWithdrawals(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [page, perPage, statusFilter]);

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleApprove = async (id) => {
    setProcessing(id);
    try {
      await adminService.approveWithdrawal(id);
      toast.success('Withdrawal approved');
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    setProcessing(id);
    try {
      await adminService.rejectWithdrawal(id);
      toast.success('Withdrawal rejected');
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const handleMarkPaid = async (id) => {
    setProcessing(id);
    try {
      await adminService.markPaid(id);
      toast.success('Marked as paid');
      fetchWithdrawals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    } finally {
      setProcessing(null);
    }
  };

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (_, row) => (
        <span className="font-medium text-ink">{row.student?.firstName ? `${row.student.firstName} ${row.student.lastName}` : '—'}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (_, row) => (
        <span className="font-semibold text-ink">{formatCurrency(row.amount || 0)}</span>
      ),
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (_, row) => (
        <span className="text-dark-500 capitalize">{row.paymentMethod || row.method || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
        return <Badge color={cfg.color}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'date',
      header: 'Date',
      render: (_, row) => (
        <span className="text-[14.5px] text-dark-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (_, row) => {
        const isProcessing = processing === (row.id || row._id);
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => setDetailModal(row)}
              className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
              title="View details"
            >
              <FiEye size={15} />
            </button>
            {row.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(row.id || row._id)}
                  disabled={isProcessing}
                  className="rounded-xl p-2 text-dark-400 hover:bg-green-50 hover:text-green-500 transition-colors disabled:opacity-50"
                  title="Approve"
                >
                  <FiCheck size={15} />
                </button>
                <button
                  onClick={() => handleReject(row.id || row._id)}
                  disabled={isProcessing}
                  className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Reject"
                >
                  <FiX size={15} />
                </button>
              </>
            )}
            {row.status === 'approved' && (
              <button
                onClick={() => handleMarkPaid(row.id || row._id)}
                disabled={isProcessing}
                className="rounded-xl p-2 text-dark-400 hover:bg-primary-50 hover:text-primary-600 transition-colors disabled:opacity-50"
                title="Mark as paid"
              >
                <FiDollarSign size={15} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Withdrawal Requests</h1>
        <p className="text-sm text-dark-500 mt-1">Review and manage student withdrawal requests</p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-dark-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <FiFilter size={15} className="text-dark-400" />
            <Select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              options={STATUS_OPTIONS}
              className="w-44"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={withdrawals}
          loading={loading}
          emptyMessage="No withdrawal requests found"
        />

        {total > perPage && (
          <div className="px-6 py-4 border-t border-dark-100">
            <Pagination
              page={page}
              perPage={perPage}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Withdrawal Details"
        size="md"
      >
        {detailModal && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Student</p>
                <p className="text-[15px] font-medium text-ink mt-1">
                  {detailModal.student?.firstName ? `${detailModal.student.firstName} ${detailModal.student.lastName}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Amount</p>
                <p className="text-[15px] font-semibold text-ink mt-1">
                  {formatCurrency(detailModal.amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Status</p>
                <div className="mt-1.5">
                  <Badge color={(STATUS_CONFIG[detailModal.status] || STATUS_CONFIG.pending).color}>
                    {(STATUS_CONFIG[detailModal.status] || STATUS_CONFIG.pending).label}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Payment Method</p>
                <p className="text-[15px] text-ink mt-1 capitalize">
                  {detailModal.paymentMethod || detailModal.method || '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Request Date</p>
                <p className="text-[15px] text-ink mt-1">{formatDate(detailModal.createdAt)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-100">
              <div className="flex items-center gap-2 mb-4">
                <FiCreditCard size={16} className="text-dark-400" />
                <p className="text-[15px] font-semibold text-ink">Payment Details</p>
              </div>
              <div className="bg-dark-50 rounded-[18px] p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Bank Name</p>
                    <p className="text-[15px] font-medium text-ink mt-0.5">
                      {detailModal.bankName || detailModal.bank?.name || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Account Name</p>
                    <p className="text-[15px] font-medium text-ink mt-0.5">
                      {detailModal.accountName || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Account Number</p>
                    <p className="text-[15px] font-mono font-medium text-ink mt-0.5">
                      {detailModal.accountNumber || '—'}
                    </p>
                  </div>
                  {(detailModal.routingNumber || detailModal.swiftCode || detailModal.iban) && (
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Routing / SWIFT / IBAN</p>
                      <p className="text-[15px] font-mono font-medium text-ink mt-0.5">
                        {detailModal.routingNumber || detailModal.swiftCode || detailModal.iban}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-100 flex justify-end gap-3">
              {detailModal.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleReject(detailModal.id || detailModal._id);
                      setDetailModal(null);
                    }}
                    icon={FiX}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleApprove(detailModal.id || detailModal._id);
                      setDetailModal(null);
                    }}
                    icon={FiCheck}
                  >
                    Approve
                  </Button>
                </>
              )}
              {detailModal.status === 'approved' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleMarkPaid(detailModal.id || detailModal._id);
                    setDetailModal(null);
                  }}
                  icon={FiDollarSign}
                >
                  Mark as Paid
                </Button>
              )}
              {detailModal.status !== 'pending' && detailModal.status !== 'approved' && (
                <Button variant="outline" onClick={() => setDetailModal(null)}>
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
