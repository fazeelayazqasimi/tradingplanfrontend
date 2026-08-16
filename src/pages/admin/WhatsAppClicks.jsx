import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiMessageCircle, FiPercent, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import adminService from '../../services/adminService';
import { WHATSAPP_CHANNEL_URL } from '../../constants';
import { formatDateTime } from '../../utils/helpers';

export default function WhatsAppClicks() {
  const [stats, setStats] = useState({ totalClicked: 0, totalStudents: 0, percentage: 0 });
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getWhatsappStats({ page, limit: 20 });
      const data = res?.data || res || {};
      setStats({ totalClicked: data.totalClicked || 0, totalStudents: data.totalStudents || 0, percentage: data.percentage || 0 });
      setUsers(data.users || []);
      setPagination(data.pagination || { page, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load WhatsApp stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const columns = [
    {
      key: 'fullName',
      header: 'Student',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {((row.firstName?.[0] || '') + (row.lastName?.[0] || '')).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink truncate">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-dark-400 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'subscriptionStatus',
      header: 'Status',
      render: (value) => (
        <Badge color={value === 'active' ? 'success' : 'warning'}>{value === 'active' ? 'Active' : 'Free'}</Badge>
      ),
    },
    {
      key: 'whatsappClickedAt',
      header: 'Clicked At',
      render: (value) => <span className="text-sm text-dark-600">{formatDateTime(value)}</span>,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-ink">WhatsApp Channel Clicks</h1>
          <p className="text-xs sm:text-sm text-dark-500 mt-0.5 sm:mt-1">
            Students who joined the channel: <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline inline-flex items-center gap-1">the4xhub channel <FiExternalLink size={12} /></a>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white border border-dark-100 rounded-xl sm:rounded-[18px] p-3 sm:p-[22px] shadow-card">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary-50">
              <FiUsers size={14} className="text-primary-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-sm text-dark-500 truncate">Total Students</p>
              <p className="text-sm sm:text-2xl font-bold text-ink">{Number(stats.totalStudents || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-dark-100 rounded-xl sm:rounded-[18px] p-3 sm:p-[22px] shadow-card">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50">
              <FiMessageCircle size={14} className="text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-sm text-dark-500 truncate">Students Clicked</p>
              <p className="text-sm sm:text-2xl font-bold text-ink">{Number(stats.totalClicked || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-dark-100 rounded-xl sm:rounded-[18px] p-3 sm:p-[22px] shadow-card col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-amber-50">
              <FiPercent size={14} className="text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-sm text-dark-500 truncate">Click Rate</p>
              <p className="text-sm sm:text-2xl font-bold text-ink">{stats.percentage}%</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-dark-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-dark-400">Students who clicked ({pagination.total})</p>
        </div>
        <div className="p-3 sm:p-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : users.length === 0 ? (
            <EmptyState icon={FiMessageCircle} title="No clicks yet" description="No student has clicked the WhatsApp Channel button yet." />
          ) : (
            <>
              <DataTable columns={columns} data={users} />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-dark-400">Page {pagination.page} of {pagination.totalPages || 1}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={!pagination.hasPrev} onClick={() => fetchStats(pagination.page - 1)} className="text-xs !px-2.5">
                    <FiChevronLeft size={14} className="mr-1" /> Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => fetchStats(pagination.page + 1)} className="text-xs !px-2.5">
                    Next <FiChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}