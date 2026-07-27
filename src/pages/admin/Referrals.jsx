import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiDollarSign, FiClock, FiSearch, FiChevronDown, FiChevronRight, FiUser, FiCheckCircle, FiToggleLeft, FiMinus, FiPlus } from 'react-icons/fi';
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

function ConnectorLines({ parentRef, childrenRef, visible }) {
  const svgRef = useRef(null);
  const [paths, setPaths] = useState([]);
  const [dots, setDots] = useState([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const calc = useCallback(() => {
    if (!visible || !parentRef?.current || !childrenRef?.current) { setPaths([]); setDots([]); return; }
    const parent = parentRef.current.getBoundingClientRect();
    const container = childrenRef.current.parentElement.getBoundingClientRect();
    const childCards = childrenRef.current.querySelectorAll('[data-node-card]');
    if (!childCards.length) { setPaths([]); setDots([]); return; }

    const parentCX = parent.left + parent.width / 2 - container.left;
    const parentBottom = parent.bottom - container.top;

    const first = childCards[0].getBoundingClientRect();
    const last = childCards[childCards.length - 1].getBoundingClientRect();
    const firstCX = first.left + first.width / 2 - container.left;
    const lastCX = last.left + last.width / 2 - container.left;
    const firstTop = first.top - container.top;

    const gap = 28;
    const hY = parentBottom + gap;
    const bottomY = firstTop - 6;

    const segs = [];
    const pts = [];

    segs.push(`M ${parentCX} ${parentBottom} L ${parentCX} ${hY}`);
    segs.push(`M ${firstCX} ${hY} L ${lastCX} ${hY}`);
    if (firstCX === lastCX) segs.push(`M ${firstCX} ${hY} L ${firstCX} ${bottomY}`);
    pts.push({ cx: parentCX, cy: parentBottom + 6 }, { cx: parentCX, cy: hY });

    Array.from(childCards).forEach((card) => {
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2 - container.left;
      const cy = r.top - container.top;
      segs.push(`M ${cx} ${hY} L ${cx} ${cy}`);
      pts.push({ cx, cy: hY });
    });

    setPaths(segs);
    setDots(pts);
    setSvgSize({ w: container.width, h: bottomY });
  }, [visible, parentRef, childrenRef]);

  useEffect(() => { calc(); const ro = new ResizeObserver(calc); if (parentRef?.current) ro.observe(parentRef.current); if (childrenRef?.current) ro.observe(childrenRef.current); return () => ro.disconnect(); }, [calc, parentRef, childrenRef]);

  if (!paths.length) return null;
  return (
    <svg ref={svgRef} className="absolute top-0 left-0 pointer-events-none z-0" width={svgSize.w} height={svgSize.h} style={{ minHeight: svgSize.h }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => <path key={i} d={d} stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />)}
      {dots.map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r="3.5" fill="#94a3b8" />)}
    </svg>
  );
}

function UserCard({ node, isRoot, onToggle, expanded }) {
  const active = node.user?.isApproved && node.user?.subscriptionStatus === 'active';
  const hasChildren = node.children?.length > 0;
  const initials = ((node.user?.firstName?.[0] || '') + (node.user?.lastName?.[0] || '')).toUpperCase() || '?';

  return (
    <div ref={isRoot ? undefined : undefined} data-node-card className={`relative ${isRoot ? '' : ''}`}>
      <div className={`
        bg-white rounded-2xl border transition-all duration-200
        ${isRoot
          ? 'px-6 py-5 border-primary-300 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] min-w-[260px]'
          : 'px-4 py-3.5 border-dark-100 hover:border-primary-200 hover:shadow-sm min-w-[220px]'
        }
        ${hasChildren ? 'cursor-default' : ''}
      `}>
        <div className="flex items-start gap-3">
          <div className={`shrink-0 flex items-center justify-center rounded-full font-bold text-white ${
            isRoot ? 'w-12 h-12 text-base bg-gradient-to-br from-primary-500 to-blue-600' : 'w-10 h-10 text-sm bg-gradient-to-br from-primary-400 to-blue-500'
          }`}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`font-semibold text-ink truncate ${isRoot ? 'text-base' : 'text-sm'}`}>
                {node.user?.firstName} {node.user?.lastName}
              </p>
              {isRoot && <Badge color="primary" className="text-[10px]">Root</Badge>}
            </div>
            <p className="text-xs text-dark-400 truncate mt-0.5">{node.user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge color={active ? 'success' : 'warning'} size="sm">{active ? 'Active' : 'Free'}</Badge>
              {node.commission > 0 && (
                <span className="text-xs font-semibold text-emerald-600">+${node.commission}</span>
              )}
            </div>
          </div>
          {hasChildren && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
              className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg bg-dark-50 hover:bg-dark-100 text-dark-400 hover:text-ink transition-all active:scale-95"
            >
              {expanded ? <FiMinus size={14} /> : <FiPlus size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeLevel({ nodes, level, parentRef }) {
  const containerRef = useRef(null);

  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="relative">
      <div ref={containerRef} className="flex justify-center gap-3 sm:gap-4 md:gap-6 relative z-10">
        {nodes.map((node) => (
          <TreeNode key={node._id} node={node} level={level} />
        ))}
      </div>
    </div>
  );
}

function TreeNode({ node, level }) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = node.children?.length > 0;
  const cardRef = useRef(null);
  const childrenRef = useRef(null);

  return (
    <div className="flex flex-col items-center" ref={cardRef}>
      <UserCard
        node={node}
        isRoot={false}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />

      {hasChildren && (
        <div className="relative" style={{ paddingTop: 0 }}>
          <ConnectorLines parentRef={cardRef} childrenRef={childrenRef} visible={expanded} />

          <AnimatePresence>
            {expanded && (
              <motion.div
                ref={childrenRef}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' } }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
                className="overflow-hidden relative"
              >
                <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-7">
                  {node.children.map((child) => (
                    <TreeNode key={child._id} node={child} level={level + 1} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function GenealogyTree({ rootUser, treeNodes, stats, onBack }) {
  const rootRef = useRef(null);
  const childrenRootRef = useRef(null);
  const hasChildren = treeNodes && treeNodes.length > 0;

  return (
    <div>
      <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-sm">
              <FiUser className="text-white" size={18} />
            </div>
            <div>
              <p className="font-semibold text-ink">{rootUser.firstName} {rootUser.lastName}</p>
              <p className="text-xs text-dark-500">{rootUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {stats && (
              <>
                <span className="text-xs text-dark-500 bg-white/60 px-3 py-1.5 rounded-lg border border-primary-100">Total: <strong className="text-ink">{stats.totalDownline}</strong></span>
                <span className="text-xs text-emerald-600 bg-emerald-50/60 px-3 py-1.5 rounded-lg border border-emerald-200">Active: <strong>{stats.active}</strong></span>
                <span className="text-xs text-amber-600 bg-amber-50/60 px-3 py-1.5 rounded-lg border border-amber-200">Free: <strong>{stats.free}</strong></span>
              </>
            )}
            <Button variant="outline" size="sm" onClick={onBack}>Back</Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-6 -mx-2 px-2">
        <div className="flex flex-col items-center min-w-[600px]">
          <div ref={rootRef} className="mb-1">
            <UserCard node={{ user: rootUser }} isRoot={true} />
          </div>

          {hasChildren && (
            <div className="relative w-full">
              <ConnectorLines parentRef={rootRef} childrenRef={childrenRootRef} visible={true} />

              <div ref={childrenRootRef} className="flex justify-center gap-3 sm:gap-4 md:gap-6 pt-7">
                {treeNodes.map((child) => (
                  <TreeNode key={child._id} node={child} level={1} />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Referral Management</h1>
          <p className="text-sm text-dark-500 mt-1">Genealogy tree — search a user to see their downline</p>
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

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-dark-100">
          <div className="flex items-center gap-3">
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
            <div className="mt-3 p-2 rounded-xl bg-dark-50 space-y-0.5 max-h-60 overflow-y-auto">
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase() || '?'}
                  </div>
                  <span className="text-sm font-medium text-ink">{u.firstName} {u.lastName}</span>
                  <span className="text-xs text-dark-400">{u.email}</span>
                  <Badge color={u.isApproved ? 'success' : 'warning'}>{u.isApproved ? 'Active' : 'Free'}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Skeleton className="h-20 w-64 rounded-2xl" />
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-48 rounded-2xl" />)}
              </div>
            </div>
          ) : selectedUser ? (
            loadingTree ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <Skeleton className="h-20 w-64 rounded-2xl" />
                <div className="flex gap-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-48 rounded-2xl" />)}
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
              <p className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 px-1">All Referrers — click to view tree</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {referrers.map((ref) => (
                  <button
                    key={ref.user?._id}
                    onClick={() => handleSelectUser(ref.user)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-dark-100 hover:border-primary-200 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {((ref.user?.firstName?.[0] || '') + (ref.user?.lastName?.[0] || '')).toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{ref.user?.firstName} {ref.user?.lastName}</p>
                      <p className="text-xs text-dark-400 truncate">{ref.user?.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-xs">
                      <span className="text-dark-500">D: <strong>{ref.stats?.totalDownline || 0}</strong></span>
                      <span className="text-emerald-600">A: <strong>{ref.stats?.active || 0}</strong></span>
                      <span className="text-amber-600">F: <strong>{ref.stats?.free || 0}</strong></span>
                    </div>
                    <FiChevronRight size={16} className="text-dark-300 group-hover:text-primary-500 transition-colors shrink-0" />
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