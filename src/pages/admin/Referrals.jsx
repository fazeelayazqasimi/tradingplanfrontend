import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiClock, FiSearch, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';
import api from '../../services/api';

const STATUS_MAP = {
  pending: { label: 'Pending', color: 'warning' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'danger' },
  rejected: { label: 'Rejected', color: 'danger' },
};

const LEVEL_MAP = {
  direct: { label: 'Direct', color: 'info' },
  indirect: { label: 'Indirect', color: 'neutral' },
};

const STATS_CARDS = [
  { key: 'totalReferrals', label: 'Total Referrals', icon: FiUsers, color: 'text-primary-500', bg: 'bg-primary-50' },
  { key: 'totalCommissionsPaid', label: 'Commissions Paid', icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-50', isCurrency: true },
  { key: 'pendingCommissions', label: 'Pending Commissions', icon: FiClock, color: 'text-amber-500', bg: 'bg-amber-50', isCurrency: true },
];

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({ totalReferrals: 0, totalCommissionsPaid: 0, pendingCommissions: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const { page, perPage, setPage, total, setTotal } = usePagination(1, 10);

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (search.trim()) params.search = search.trim();
      const res = await api.get('/admin/referrals', { params });
      setReferrals(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/referrals/stats');
      setStats(res.data.data || {});
    } catch {
      // stats are non-critical
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [page, perPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReferrals();
  };

  const openDetail = async (referral) => {
    setDetailModal(referral);
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/referrals/${referral.id}`);
      setDetailData(res.data.data || referral);
    } catch {
      setDetailData(referral);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      key: 'referrer',
      header: 'Referrer',
      render: (_, row) => (
        <span className="font-medium text-ink">{row.referrer?.firstName ? `${row.referrer.firstName} ${row.referrer.lastName}` : '—'}</span>
      ),
    },
    {
      key: 'referredUser',
      header: 'Referred User',
      render: (_, row) => (
        <span className="text-dark-500">{row.referredUser?.firstName ? `${row.referredUser.firstName} ${row.referredUser.lastName}` : '—'}</span>
      ),
    },
    {
      key: 'referralCode',
      header: 'Referral Code',
      render: (_, row) => (
        <code className="px-2.5 py-0.5 rounded-lg bg-dark-50 text-[14.5px] font-mono text-dark-700">
          {row.referralCode || '—'}
        </code>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (_, row) => {
        const level = LEVEL_MAP[row.level] || LEVEL_MAP.direct;
        return <Badge color={level.color}>{level.label}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const status = STATUS_MAP[row.status] || STATUS_MAP.pending;
        return <Badge color={status.color}>{status.label}</Badge>;
      },
    },
    {
      key: 'commission',
      header: 'Commission',
      render: (_, row) => (
        <span className="font-semibold text-ink">
          {row.commission != null ? `$${Number(row.commission).toLocaleString()}` : '—'}
        </span>
      ),
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
      render: (_, row) => (
        <div className="flex justify-end">
          <button
            onClick={() => openDetail(row)}
            className="rounded-xl p-2 text-dark-400 hover:bg-dark-50 hover:text-primary-600 transition-colors"
            title="View details"
          >
            <FiEye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Referral Management</h1>
        <p className="text-sm text-dark-500 mt-1">Track referrals, commissions, and referral performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {STATS_CARDS.map(({ key, label, icon: Icon, color, bg, isCurrency }) => (
          <div key={key} className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-sm text-dark-500">{label}</p>
                <p className="text-2xl font-bold text-ink">
                  {isCurrency ? `$${Number(stats[key] || 0).toLocaleString()}` : Number(stats[key] || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-dark-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">All Referrals</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
              icon={FiSearch}
            />
            <Button type="submit" variant="primary" size="sm">Search</Button>
          </form>
        </div>

        <DataTable
          columns={columns}
          data={referrals}
          loading={loading}
          emptyMessage="No referrals found"
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
        onClose={() => { setDetailModal(null); setDetailData(null); }}
        title="Referral Details"
        size="md"
      >
        {detailLoading ? (
          <div className="py-12 text-center text-dark-500">Loading details...</div>
        ) : detailData ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Referrer</p>
                <p className="text-[15px] font-medium text-ink mt-1">{detailData.referrer?.firstName ? `${detailData.referrer.firstName} ${detailData.referrer.lastName}` : '—'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Referred User</p>
                <p className="text-[15px] font-medium text-ink mt-1">{detailData.referredUser?.firstName ? `${detailData.referredUser.firstName} ${detailData.referredUser.lastName}` : '—'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Referral Code</p>
                <p className="text-[15px] font-mono text-ink mt-1">{detailData.referralCode || '—'}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Level</p>
                <div className="mt-1.5">
                  <Badge color={(LEVEL_MAP[detailData.level] || LEVEL_MAP.direct).color}>
                    {(LEVEL_MAP[detailData.level] || LEVEL_MAP.direct).label}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Status</p>
                <div className="mt-1.5">
                  <Badge color={(STATUS_MAP[detailData.status] || STATUS_MAP.pending).color}>
                    {(STATUS_MAP[detailData.status] || STATUS_MAP.pending).label}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Commission</p>
                <p className="text-[15px] font-semibold text-ink mt-1">
                  {detailData.commission != null ? `$${Number(detailData.commission).toLocaleString()}` : '—'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-dark-500">Date</p>
                <p className="text-[15px] text-ink mt-1">{formatDate(detailData.createdAt)}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-dark-100 flex justify-end">
              <Button variant="outline" onClick={() => { setDetailModal(null); setDetailData(null); }}>
                <FiX size={14} className="mr-1" />
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
