import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiCheck, FiX, FiEye, FiDollarSign, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import Input from '../../components/ui/Input';
import adminService from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const statusColor = { pending: 'warning', approved: 'success', rejected: 'danger' };

export default function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const pagination = usePagination({ totalItems: 0, perPage: 10 });

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: pagination.currentPage, perPage: pagination.perPage };
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const data = await adminService.getAllDeposits(params);
      setDeposits(data.data || []);
      pagination.setTotalItems(data.pagination?.total || 0);
    } catch {
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.perPage, statusFilter, searchQuery]);

  useEffect(() => { fetchDeposits(); }, [fetchDeposits]);

  const handleSearch = (e) => { e.preventDefault(); pagination.goToPage(1); };

  const handleApprove = async (deposit) => {
    if (!window.confirm(`Approve deposit of ${formatCurrency(deposit.amount)} from ${deposit.userId?.firstName || 'user'}?`)) return;
    try {
      setProcessingId(deposit._id);
      await adminService.approveDeposit(deposit._id);
      toast.success(`Deposit approved! Wallet credited with ${formatCurrency(deposit.amount)}`);
      fetchDeposits();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (deposit) => {
    if (!window.confirm(`Reject deposit of ${formatCurrency(deposit.amount)}?`)) return;
    try {
      setProcessingId(deposit._id);
      await adminService.rejectDeposit(deposit._id, { adminNote: rejectNote || 'Rejected by admin' });
      toast.success('Deposit rejected');
      setDetailOpen(false);
      fetchDeposits();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const stats = {
    pending: deposits.filter(d => d.status === 'pending').length,
    approved: deposits.filter(d => d.status === 'approved').length,
    rejected: deposits.filter(d => d.status === 'rejected').length,
    total: deposits.length,
  };

  const columns = [
    {
      header: 'User',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent((row.userId?.firstName || 'U') + ' ' + (row.userId?.lastName || ''))}&background=2563EB&color=fff&size=36`} alt="" className="h-9 w-9 rounded-full ring-2 ring-dark-100" />
          <div>
            <p className="font-semibold text-ink text-sm">{row.userId?.firstName} {row.userId?.lastName}</p>
            <p className="text-xs text-dark-400">{row.userId?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Amount',
      render: (_, row) => (
        <span className="font-bold text-ink">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Account',
      render: (_, row) => (
        <div>
          <p className="text-sm text-ink font-medium">{row.accountId?.bankName || 'N/A'}</p>
          <p className="text-xs text-dark-400">{row.accountId?.accountHolderName}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (_, row) => (
        <Badge color={statusColor[row.status] || 'neutral'}>{row.status}</Badge>
      ),
    },
    {
      header: 'Date',
      render: (_, row) => (
        <span className="text-sm text-dark-500">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: '',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelected(row); setDetailOpen(true); }} className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors" title="View">
            <FiEye size={15} />
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => handleApprove(row)} disabled={processingId === row._id} className="rounded-xl p-2 text-dark-400 hover:bg-green-50 hover:text-green-600 transition-colors disabled:opacity-50" title="Approve">
                <FiCheck size={15} />
              </button>
              <button onClick={() => handleReject(row)} disabled={processingId === row._id} className="rounded-xl p-2 text-dark-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50" title="Reject">
                <FiX size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Deposit Requests</h1>
        <p className="mt-1 text-sm text-dark-500">Approve or reject wallet deposit requests from students</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-500', icon: FiDollarSign },
          { label: 'Pending', value: stats.pending, color: 'bg-amber-500', icon: FiClock },
          { label: 'Approved', value: stats.approved, color: 'bg-emerald-500', icon: FiCheckCircle },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-500', icon: FiXCircle },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-white`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-dark-500">{s.label}</p>
                  <p className="text-xl font-bold text-ink">{s.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-dark-100">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
              <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-10 pr-4 py-2.5 text-sm text-ink placeholder-dark-400 outline-none focus:border-primary-500 focus:bg-white" />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); pagination.goToPage(1); }} className="rounded-[11px] border border-dark-200 bg-dark-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-primary-500">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button type="submit">Search</Button>
          </form>
        </div>
        <DataTable columns={columns} data={deposits} loading={loading} emptyMessage="No deposit requests found" />
      </Card>

      <Modal isOpen={detailOpen} onClose={() => { setDetailOpen(false); setRejectNote(''); }} title="Deposit Details" size="md">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent((selected.userId?.firstName || 'U') + ' ' + (selected.userId?.lastName || ''))}&background=2563EB&color=fff&size=64`} alt="" className="h-14 w-14 rounded-2xl ring-4 ring-primary-50" />
              <div>
                <h3 className="text-lg font-bold text-ink">{selected.userId?.firstName} {selected.userId?.lastName}</h3>
                <p className="text-sm text-dark-400">{selected.userId?.email}</p>
              </div>
            </div>
            <div className="rounded-xl border border-dark-100 divide-y divide-dark-50">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-dark-500">Amount</span>
                <span className="text-lg font-bold text-ink">{formatCurrency(selected.amount)}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-dark-500">Bank</span>
                <span className="text-sm font-medium text-ink">{selected.accountId?.bankName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-dark-500">Account Holder</span>
                <span className="text-sm font-medium text-ink">{selected.accountId?.accountHolderName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-dark-500">Account Number</span>
                <span className="text-sm font-medium text-ink">{selected.accountId?.accountNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-dark-500">Status</span>
                <Badge color={statusColor[selected.status] || 'neutral'}>{selected.status}</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-dark-500">Date</span>
                <span className="text-sm text-ink">{formatDate(selected.createdAt)}</span>
              </div>
            </div>
            {selected.status === 'pending' && (
              <div className="space-y-3 pt-2">
                <Input label="Rejection Note (optional)" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} placeholder="Reason for rejection if applicable" />
                <div className="flex items-center gap-3">
                  <Button variant="success" onClick={() => handleApprove(selected)} disabled={processingId === selected._id}>
                    <FiCheck size={16} /> Approve & Credit Wallet
                  </Button>
                  <Button variant="danger" onClick={() => handleReject(selected)} disabled={processingId === selected._id}>
                    <FiX size={16} /> Reject
                  </Button>
                  <Button variant="outline" onClick={() => { setDetailOpen(false); setRejectNote(''); }}>Close</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
