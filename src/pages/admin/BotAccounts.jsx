import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiEye, FiCpu, FiUser, FiServer, FiCalendar, FiKey } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import adminService from '../../services/adminService';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

function getMemberId(member) {
  return member._id || member.id;
}

function getAccounts(member) {
  return Array.isArray(member.botAccounts) ? member.botAccounts : [];
}

function getPlatforms(member) {
  const platforms = [...new Set(getAccounts(member).map((a) => a.platform))];
  return platforms.length ? platforms.join(', ') : '—';
}

const columns = [
  {
    key: 'avatar',
    header: '',
    width: 'w-10',
    render: (_, row) => (
      <img
        src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((row.firstName || '') + ' ' + (row.lastName || ''))}&background=0E3D00&color=fff&size=40`}
        alt={row.firstName}
        className="h-9 w-9 rounded-xl object-cover ring-2 ring-dark-100"
      />
    ),
  },
  {
    key: 'name',
    header: 'Member',
    sortable: true,
    render: (_, row) => (
      <div>
        <p className="font-semibold text-ink text-sm">{row.firstName} {row.lastName}</p>
        <p className="text-xs text-dark-400 mt-0.5">{row.email}</p>
      </div>
    ),
  },
  {
    key: 'memberStatus',
    header: 'Member Status',
    sortable: true,
    render: (_, row) => (
      <Badge color={row.isActive !== false ? 'success' : 'danger'}>
        {row.isActive !== false ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    key: 'botStatus',
    header: 'Bot Account',
    render: (_, row) => {
      const filled = getAccounts(row).length > 0;
      return (
        <Badge color={filled ? 'success' : 'warning'}>
          {filled ? 'Filled' : 'Not Filled'}
        </Badge>
      );
    },
  },
  {
    key: 'accountCount',
    header: 'Accounts',
    render: (_, row) => (
      <span className="text-sm font-semibold text-ink">{getAccounts(row).length}</span>
    ),
  },
  {
    key: 'platforms',
    header: 'Platforms',
    render: (_, row) => (
      <span className="text-sm text-dark-500">{getPlatforms(row)}</span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Joined',
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-dark-500">{formatDate(row.createdAt)}</span>
    ),
  },
];

export default function BotAccounts() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const pagination = usePagination({ totalItems: members.length, perPage: 10 });

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getBotAccounts({
        search: appliedSearch,
        filter,
        page: pagination.currentPage,
        limit: pagination.perPage,
      });
      pagination.setTotalItems(data.pagination?.total || 0);
      setMembers(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, filter, pagination.currentPage, pagination.perPage]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    setAppliedSearch(searchQuery.trim());
  };

  const handleFilterChange = (e) => {
    pagination.goToPage(1);
    setFilter(e.target.value);
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setDetailOpen(true);
  };

  const actionColumn = {
    key: 'actions',
    header: 'Actions',
    width: 'w-20',
    render: (_, row) => (
      <button
        onClick={() => handleViewDetails(row)}
        className="rounded-xl p-2 text-dark-400 transition-all hover:bg-primary-50 hover:text-primary-600"
        title="View bot accounts"
      >
        <FiEye className="h-4 w-4" />
      </button>
    ),
  };

  const allColumns = [...columns, actionColumn];
  const accounts = selectedMember ? getAccounts(selectedMember) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-extrabold text-ink leading-tight">Active Members with Bot Account</h1>
        <p className="mt-1 text-[15px] text-dark-500 leading-relaxed">
          All members and their connected MT4/MT5 bot accounts
        </p>
      </div>

      <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
        <form onSubmit={handleSearch} className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[11px] border border-dark-200 bg-dark-50 pl-10 pr-4 py-3 text-[14.5px] text-ink placeholder-dark-400 outline-none transition-colors focus:border-primary-500 focus:bg-white"
            />
          </div>
          <div className="sm:w-56">
            <Select
              value={filter}
              onChange={handleFilterChange}
              placeholder="All Members"
              options={[
                { value: 'filled', label: 'Bot Filled' },
                { value: 'not-filled', label: 'Not Filled' },
              ]}
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        <DataTable
          columns={allColumns}
          data={members}
          loading={loading}
          emptyMessage="No members found"
          rowKey={(row) => getMemberId(row)}
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-dark-100">
            <p className="text-sm text-dark-400">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} members)
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.prevPage}
                disabled={pagination.currentPage <= 1}
              >
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => pagination.goToPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.nextPage}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Bot Account Details"
        size="md"
      >
        {selectedMember ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img
                src={
                  selectedMember.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent((selectedMember.firstName || '') + ' ' + (selectedMember.lastName || ''))}&background=0E3D00&color=fff&size=64`}
                alt={selectedMember.firstName}
                className="h-16 w-16 rounded-2xl object-cover ring-4 ring-primary-50"
              />
              <div>
                <h3 className="text-lg font-bold text-ink">
                  {selectedMember.firstName} {selectedMember.lastName}
                </h3>
                <p className="text-sm text-dark-400">{selectedMember.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge color={selectedMember.isActive !== false ? 'success' : 'danger'}>
                    {selectedMember.isActive !== false ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge color={accounts.length > 0 ? 'success' : 'warning'}>
                    {accounts.length > 0 ? 'Bot Filled' : 'Not Filled'}
                  </Badge>
                </div>
              </div>
            </div>

            {accounts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-dark-200 bg-dark-50 p-6 text-center">
                <FiCpu className="mx-auto h-8 w-8 text-dark-400" />
                <p className="mt-2 text-sm font-medium text-ink">No bot account filled yet</p>
                <p className="mt-1 text-xs text-dark-400">This member has not submitted the connect bot form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account._id} className="rounded-xl border border-dark-100 divide-y divide-dark-100">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-[42px] h-[42px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center">
                          <FiCpu className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">{account.accountNumber}</p>
                          <p className="text-xs text-dark-400">{account.platform} • {account.accountType === 'demo' ? 'Demo' : 'Real'}</p>
                        </div>
                      </div>
                      <Badge color="success">Connected</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <FiServer className="mt-0.5 h-4 w-4 text-dark-400" />
                        <div>
                          <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Server</p>
                          <p className="text-sm text-ink break-all">{account.server || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FiUser className="mt-0.5 h-4 w-4 text-dark-400" />
                        <div>
                          <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Broker</p>
                          <p className="text-sm text-ink break-all">{account.brokerName || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FiKey className="mt-0.5 h-4 w-4 text-dark-400" />
                        <div>
                          <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Password</p>
                          <p className="text-sm text-ink">{account.password ? 'Provided' : 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FiCalendar className="mt-0.5 h-4 w-4 text-dark-400" />
                        <div>
                          <p className="text-[11px] text-dark-400 uppercase tracking-wider font-medium">Connected</p>
                          <p className="text-sm text-ink">{formatDate(account.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        )}
      </Modal>
    </div>
  );
}
