import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiDollarSign, FiClock, FiSearch, FiChevronDown, FiChevronRight, FiUser, FiCheckCircle, FiToggleLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';

const STATS_CARDS = [
  { key: 'totalReferrals', label: 'Total Referrals', icon: FiUsers, color: 'text-primary-500', bg: 'bg-primary-50' },
  { key: 'activeReferrals', label: 'Active Referrals', icon: FiCheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  { key: 'freeReferrals', label: 'Free (Pending)', icon: FiToggleLeft, color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'totalCommissionsPaid', label: 'Commissions Paid', icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-50', isCurrency: true },
  { key: 'pendingCommissions', label: 'Pending Commissions', icon: FiClock, color: 'text-amber-500', bg: 'bg-amber-50', isCurrency: true },
];

function TreeNode({ node, depth }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const active = node.user?.isApproved && node.user?.subscriptionStatus === 'active';
  const status = active ? 'Active' : 'Free';

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors hover:bg-dark-50 ${
          depth === 0 ? 'bg-primary-50 border border-primary-200' : ''
        }`}
        style={{ marginLeft: depth * 24 }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (
          <span className="text-dark-400 shrink-0">{open ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}</span>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        <FiUser size={14} className="text-dark-400 shrink-0" />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-ink truncate">
            {node.user?.firstName} {node.user?.lastName}
          </span>
          <span className="text-xs text-dark-400 truncate hidden sm:inline">{node.user?.email}</span>
          <Badge color={active ? 'success' : 'warning'}>{status}</Badge>
          {node.commission > 0 && (
            <span className="text-xs font-semibold text-green-600">+${node.commission}</span>
          )}
        </div>
      </div>
      {open && hasChildren && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Referrals() {
  const [globalStats, setGlobalStats] = useState({ totalReferrals: 0, totalCommissionsPaid: 0, pendingCommissions: 0, activeReferrals: 0, freeReferrals: 0 });
  const [referrers, setReferrers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTree, setSelectedTree] = useState([]);
  const [selectedStats, setSelectedStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingTree, setLoadingTree] = useState(false);

  const fetchReferrers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/referrals/tree');
      const data = res.data?.data || {};
      setReferrers(data.users || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load referrers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/referrals/stats');
      setGlobalStats(res.data?.data || {});
    } catch {}
  }, []);

  useEffect(() => {
    fetchReferrers();
    fetchStats();
  }, [fetchReferrers, fetchStats]);

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get('/users', { params: { search: searchQuery.trim(), limit: 20 } });
      const users = res.data?.data || res.data?.docs || [];
      setSearchResults(users);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setSelectedTree([]);
    setSelectedStats(null);
    setLoadingTree(true);
    setSearchResults([]);
    setSearchQuery('');
    try {
      const res = await api.get('/admin/referrals/tree', { params: { userId: user._id } });
      const data = res.data?.data || {};
      setSelectedTree(data.tree || []);
      setSelectedStats(data.stats || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load tree');
    } finally {
      setLoadingTree(false);
    }
  };

  const handleBack = () => {
    setSelectedUser(null);
    setSelectedTree([]);
    setSelectedStats(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Referral Management</h1>
          <p className="text-sm text-dark-500 mt-1">Browse referral tree — click a user to see their downline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATS_CARDS.map(({ key, label, icon: Icon, color, bg, isCurrency }) => (
          <div key={key} className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-sm text-dark-500">{label}</p>
                <p className="text-2xl font-bold text-ink">
                  {isCurrency ? `$${Number(globalStats[key] || 0).toLocaleString()}` : Number(globalStats[key] || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <FiSearch className="text-dark-400 shrink-0" size={18} />
          <Input
            placeholder="Search user by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleSearchUser} loading={searching}>Search</Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mb-4 p-2 rounded-xl bg-dark-50 space-y-0.5 max-h-60 overflow-y-auto">
            {searchResults.map((u) => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors text-left"
              >
                <FiUser size={14} className="text-dark-400 shrink-0" />
                <span className="text-sm font-medium text-ink">{u.firstName} {u.lastName}</span>
                <span className="text-xs text-dark-400">{u.email}</span>
                <Badge color={u.isApproved ? 'success' : 'warning'}>{u.isApproved ? 'Active' : 'Free'}</Badge>
              </button>
            ))}
          </div>
        )}

        {selectedUser && (
          <div className="mb-4 p-4 rounded-xl bg-primary-50 border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FiUser className="text-primary-600" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-ink">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-xs text-dark-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedStats && (
                  <>
                    <span className="text-sm text-dark-500">Downline: <strong className="text-ink">{selectedStats.totalDownline}</strong></span>
                    <span className="text-sm text-green-600">Active: <strong>{selectedStats.active}</strong></span>
                    <span className="text-sm text-amber-600">Free: <strong>{selectedStats.free}</strong></span>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={handleBack}>Back</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : selectedUser ? (
          loadingTree ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-xl" style={{ marginLeft: (i % 3) * 24 }} />
              ))}
            </div>
          ) : selectedTree.length === 0 ? (
            <EmptyState icon={FiUsers} title="No downline" description="This user has not referred anyone yet." />
          ) : (
            <div className="space-y-0.5">
              {selectedTree.map((node) => (
                <TreeNode key={node._id} node={node} depth={0} />
              ))}
            </div>
          )
        ) : referrers.length === 0 ? (
          <EmptyState icon={FiUsers} title="No referrals yet" description="No users have referred anyone yet. Referral tree will appear here." />
        ) : (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-2 px-3">All Referrers — click to expand</p>
            {referrers.map((ref) => (
              <button
                key={ref.user?._id}
                onClick={() => handleSelectUser(ref.user)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-50 transition-colors text-left"
              >
                <FiUser size={14} className="text-dark-400 shrink-0" />
                <span className="text-sm font-medium text-ink">{ref.user?.firstName} {ref.user?.lastName}</span>
                <span className="text-xs text-dark-400">{ref.user?.email}</span>
                <span className="text-xs text-dark-500 ml-auto">Downline: <strong>{ref.stats?.totalDownline || 0}</strong></span>
                <span className="text-xs text-green-600">Active: <strong>{ref.stats?.active || 0}</strong></span>
                <span className="text-xs text-amber-600">Free: <strong>{ref.stats?.free || 0}</strong></span>
                <FiChevronRight size={14} className="text-dark-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}