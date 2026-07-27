import { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiDollarSign, FiClock, FiSearch, FiChevronRight, FiUser, FiCheckCircle, FiToggleLeft } from 'react-icons/fi';
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

function UserCard({ node, isRoot }) {
  const active = node.user?.isApproved && node.user?.subscriptionStatus === 'active';
  const initials = ((node.user?.firstName?.[0] || '') + (node.user?.lastName?.[0] || '')).toUpperCase() || '?';

  return (
    <div className={`
      bg-white rounded-xl sm:rounded-2xl border transition-all duration-200 relative z-10
      ${isRoot
        ? 'px-3 sm:px-6 py-3 sm:py-5 border-primary-300 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] min-w-[160px] sm:min-w-[260px]'
        : 'px-2.5 sm:px-4 py-2 sm:py-3.5 border-dark-100 hover:border-primary-200 hover:shadow-sm min-w-[120px] sm:min-w-[200px]'
      }
    `}>
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`shrink-0 flex items-center justify-center rounded-full font-bold text-white ${
          isRoot ? 'w-8 sm:w-12 h-8 sm:h-12 text-xs sm:text-base bg-gradient-to-br from-primary-500 to-blue-600' : 'w-7 sm:w-10 h-7 sm:h-10 text-[10px] sm:text-sm bg-gradient-to-br from-primary-400 to-blue-500'
        }`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <p className={`font-semibold text-ink truncate ${isRoot ? 'text-xs sm:text-base' : 'text-[11px] sm:text-sm'}`}>
              {node.user?.firstName} {node.user?.lastName}
            </p>
            {isRoot && <Badge color="primary" className="text-[8px] sm:text-[10px] px-1.5 py-0">Root</Badge>}
          </div>
          <p className={`text-dark-400 truncate ${isRoot ? 'text-[10px] sm:text-xs' : 'text-[9px] sm:text-xs'} mt-0.5`}>{node.user?.email}</p>
          <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 flex-wrap">
            <Badge color={active ? 'success' : 'warning'} size="sm" className="text-[8px] sm:text-[10px] px-1.5 py-0">{active ? 'Active' : 'Free'}</Badge>
            {node.commission > 0 && (
              <span className="text-[9px] sm:text-xs font-semibold text-emerald-600">+${node.commission}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, depth }) {
  const hasChildren = node.children?.length > 0;
  const count = node.children?.length || 1;
  const hLineLeft = `${100 / (count * 2)}%`;
  const hLineRight = hLineLeft;

  return (
    <div className="flex flex-col items-center">
      <UserCard node={node} isRoot={false} />

      {hasChildren && (
        <div className="flex flex-col items-center w-full">
          <div className={`relative w-full ${depth < 2 ? 'h-5 sm:h-7' : 'h-4 sm:h-6'}`}>
            <div className="absolute top-0 left-1/2 w-px sm:w-0.5 h-3/4 -translate-x-1/2 bg-slate-300" />
            <div
              className="absolute top-3/4 h-px sm:h-0.5 -translate-y-1/2 bg-slate-300"
              style={{ left: hLineLeft, right: hLineRight }}
            />
          </div>

          <div className="flex justify-center gap-1 sm:gap-3 md:gap-5 relative">
            {node.children.map((child) => (
              <div key={child._id} className="relative flex flex-col items-center">
                <div className={`absolute left-1/2 w-px sm:w-0.5 -translate-x-1/2 bg-slate-300 z-0 ${depth < 2 ? '-top-5 h-5 sm:-top-7 sm:h-7' : '-top-4 h-4 sm:-top-6 sm:h-6'}`} />
                <TreeNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GenealogyTree({ rootUser, treeNodes, stats, onBack }) {
  const hasChildren = treeNodes && treeNodes.length > 0;
  const count = treeNodes?.length || 1;
  const hLineLeft = `${100 / (count * 2)}%`;
  const hLineRight = hLineLeft;

  return (
    <div>
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-11 h-8 sm:h-11 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm shrink-0">
              <FiUser className="text-white" size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-base font-semibold text-ink truncate">{rootUser.firstName} {rootUser.lastName}</p>
              <p className="text-[10px] sm:text-xs text-dark-500 truncate">{rootUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {stats && (
              <>
                <span className="text-[9px] sm:text-xs text-dark-500 bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-primary-100 whitespace-nowrap">T: <strong className="text-ink">{stats.totalDownline}</strong></span>
                <span className="text-[9px] sm:text-xs text-emerald-600 bg-emerald-50/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200 whitespace-nowrap">A: <strong>{stats.active}</strong></span>
                <span className="text-[9px] sm:text-xs text-amber-600 bg-amber-50/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-amber-200 whitespace-nowrap">F: <strong>{stats.free}</strong></span>
              </>
            )}
            <Button variant="outline" size="sm" onClick={onBack} className="text-xs !px-2.5 !py-1 sm:!px-3 sm:!py-1.5">Back</Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-4 sm:pb-6 -mx-2 sm:-mx-2 px-2 sm:px-2 scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col items-center min-w-[400px] sm:min-w-[600px]">
          <UserCard node={{ user: rootUser }} isRoot={true} />

          {hasChildren && (
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full h-5 sm:h-7">
                <div className="absolute top-0 left-1/2 w-px sm:w-0.5 h-3/4 -translate-x-1/2 bg-slate-300" />
                <div
                  className="absolute top-3/4 h-px sm:h-0.5 -translate-y-1/2 bg-slate-300"
                  style={{ left: hLineLeft, right: hLineRight }}
                />
              </div>

              <div className="flex justify-center gap-1 sm:gap-3 md:gap-5 relative">
                {treeNodes.map((child) => (
                  <div key={child._id} className="relative flex flex-col items-center">
                    <div className="absolute -top-5 sm:-top-7 left-1/2 w-px sm:w-0.5 h-5 sm:h-7 -translate-x-1/2 bg-slate-300 z-0" />
                    <TreeNode node={child} depth={1} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-ink">Referral Management</h1>
          <p className="text-xs sm:text-sm text-dark-500 mt-0.5 sm:mt-1">Search a user to see their downline tree</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        {STATS_CARDS.map(({ key, label, icon: Icon, color, bg, isCurrency }) => (
          <div key={key} className="bg-white border border-dark-100 rounded-xl sm:rounded-[18px] p-3 sm:p-[22px] shadow-card">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`p-1.5 sm:p-3 rounded-lg sm:rounded-xl ${bg}`}>
                <Icon size={14} sm:size={22} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-sm text-dark-500 truncate">{label}</p>
                <p className="text-sm sm:text-2xl font-bold text-ink">
                  {isCurrency ? `$${Number(globalStats[key] || 0).toLocaleString()}` : Number(globalStats[key] || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-dark-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <FiSearch className="text-dark-400 shrink-0" size={16} />
            <Input
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
              className="flex-1 min-w-0"
            />
            <Button size="sm" onClick={handleSearchUser} loading={searching} className="text-xs !px-2.5 sm:!px-3">Search</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 rounded-xl bg-dark-50 space-y-0.5 max-h-48 sm:max-h-60 overflow-y-auto">
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-white transition-colors text-left"
                >
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shrink-0">
                    {((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-ink truncate block">{u.firstName} {u.lastName}</span>
                    <span className="text-[9px] sm:text-xs text-dark-400 truncate block">{u.email}</span>
                  </div>
                  <Badge color={u.isApproved ? 'success' : 'warning'} className="text-[8px] sm:text-[10px] px-1.5 py-0 shrink-0">{u.isApproved ? 'Active' : 'Free'}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-8">
              <Skeleton className="h-16 sm:h-20 w-40 sm:w-64 rounded-xl sm:rounded-2xl" />
              <div className="flex gap-2 sm:gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 sm:h-16 w-24 sm:w-48 rounded-xl sm:rounded-2xl" />)}
              </div>
            </div>
          ) : selectedUser ? (
            loadingTree ? (
              <div className="flex flex-col items-center gap-2 sm:gap-3 py-4 sm:py-8">
                <Skeleton className="h-16 sm:h-20 w-40 sm:w-64 rounded-xl sm:rounded-2xl" />
                <div className="flex gap-2 sm:gap-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 sm:h-16 w-24 sm:w-48 rounded-xl sm:rounded-2xl" />)}
                </div>
              </div>
            ) : selectedTree.length === 0 ? (
              <EmptyState icon={FiUsers} title="No downline" description="This user has not referred anyone yet." />
            ) : (
              <GenealogyTree
                rootUser={selectedUser}
                treeNodes={selectedTree}
                stats={selectedStats}
                onBack={handleBack}
              />
            )
          ) : referrers.length === 0 ? (
            <EmptyState icon={FiUsers} title="No referrals yet" description="No users have referred anyone yet. Referral tree will appear here." />
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-dark-400 mb-2 sm:mb-3 px-1">All Referrers — click to view tree</p>
              <div className="grid gap-1.5 sm:gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {referrers.map((ref) => (
                  <button
                    key={ref.user?._id}
                    onClick={() => handleSelectUser(ref.user)}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white border border-dark-100 hover:border-primary-200 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
                      {((ref.user?.firstName?.[0] || '') + (ref.user?.lastName?.[0] || '')).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-ink truncate">{ref.user?.firstName} {ref.user?.lastName}</p>
                      <p className="text-[10px] sm:text-xs text-dark-400 truncate">{ref.user?.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="text-dark-500">D: <strong>{ref.stats?.totalDownline || 0}</strong></span>
                      <span className="text-emerald-600">A: <strong>{ref.stats?.active || 0}</strong></span>
                      <span className="text-amber-600">F: <strong>{ref.stats?.free || 0}</strong></span>
                    </div>
                    <div className="flex sm:hidden items-center gap-1 text-[9px]">
                      <span className="text-dark-500"><strong>{ref.stats?.totalDownline || 0}</strong></span>
                      <span className="text-emerald-600"><strong>{ref.stats?.active || 0}</strong></span>
                      <span className="text-amber-600"><strong>{ref.stats?.free || 0}</strong></span>
                    </div>
                    <FiChevronRight size={14} className="text-dark-300 group-hover:text-primary-500 transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}