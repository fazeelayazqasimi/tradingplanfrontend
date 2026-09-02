import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiCopy,
  FiCheck,
  FiLink,
  FiDollarSign,
  FiClock,
  FiUserPlus,
  FiLayers,
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight,
  FiShare2,
  FiAward,
  FiTrendingUp,
  FiGift,
  FiUserCheck,
  FiUser,
  FiCheckCircle,
  FiToggleLeft,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import referralService from '../../services/referralService';
import studentService from '../../services/studentService';
import api from '../../services/api';
import { formatCurrency, formatDate, copyToClipboard } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const TABS = [
  { key: 'direct', label: 'Direct Referrals', icon: FiUserPlus },
  { key: 'indirect', label: 'Indirect Referrals', icon: FiLayers },
  { key: 'tree', label: 'Tree View', icon: FiShare2 },
];

export default function Referrals() {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState(null);
  const [directReferrals, setDirectReferrals] = useState([]);
  const [indirectReferrals, setIndirectReferrals] = useState([]);
  const [referralTree, setReferralTree] = useState([]);
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('direct');
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const STAT_OPTIONS = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" },
  ];

  const renderReferralItem = (ref, idx) => {
    const u = ref.referredUserId || ref.user || ref;
    const name = (u.firstName ? `${u.firstName} ${u.lastName}` : null) || u.name || u.userName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
    const joinedDate = u.joinedAt || u.createdAt || u.date || ref.createdAt;
    const status = ref.status || 'active';
    const commission = ref.commission || ref.amount || 0;
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
      <motion.div
        key={ref._id || ref.id || idx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.03 }}
        className="flex items-center justify-between p-4 rounded-[11px] bg-dark-50/50 hover:bg-dark-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{name}</p>
            <p className="text-xs text-dark-500">
              Joined {formatDate(joinedDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {commission > 0 && (
            <span className="text-xs font-semibold text-emerald-600">+{formatCurrency(commission)}</span>
          )}
          <Badge
            color={
              status === 'active' || status === 'verified'
                ? 'success'
                : status === 'pending'
                ? 'warning'
                : 'neutral'
            }
          >
            {status}
          </Badge>
        </div>
      </motion.div>
    );
  };

const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [codeRes, statsRes, treeRes, rankRes] = await Promise.allSettled([
        referralService.getReferralCode(),
        referralService.getStats(),
        referralService.getTree(),
      ]);

      if (codeRes.status === 'fulfilled') {
        const cd = codeRes.value?.data?.data || codeRes.value?.data || codeRes.value;
        const referralCode = cd?.code || cd?.referralCode || cd || '';
        setCode(typeof referralCode === 'string' ? referralCode : referralCode?.toString() || '');
        const code = typeof referralCode === 'string' ? referralCode : referralCode?.code || '';
        setReferralLink(`https://the4xhub.com/register?ref=${code}`);
      }

      if (statsRes.status === 'fulfilled') {
        const sd = statsRes.value?.data?.data || statsRes.value?.data || statsRes.value;
        setStats(sd);
      }

      if (treeRes.status === 'fulfilled') {
        const td = treeRes.value?.data?.data || treeRes.value?.data || treeRes.value;
        const direct = td?.direct || td?.directReferrals || td?.level1 || [];
        const indirect = td?.indirect || td?.indirectReferrals || td?.level2 || [];
        setDirectReferrals(Array.isArray(direct) ? direct : []);
        setIndirectReferrals(Array.isArray(indirect) ? indirect : []);
        const treeData = Array.isArray(td) ? td : (td?.tree || []);
        setReferralTree(treeData.length > 0 ? treeData : []);
      }

      if (rankRes.status === 'fulfilled') {
        const rd = rankRes.value?.data?.data || rankRes.value?.data || rankRes.value;
        setRankData(rd);
      }
    } catch {
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyCode = async () => {
    if (!code) return;
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) return;
    const success = await copyToClipboard(referralLink);
    if (success) {
      setCopiedLink(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast.error('Failed to copy');
    }
  };

  const statCards = [
    {
      key: 'direct',
      label: 'Direct Referrals',
      icon: FiUserPlus,
      value: stats?.directReferrals ?? stats?.directCount ?? stats?.direct_count ?? 0,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      key: 'indirect',
      label: 'Indirect Referrals',
      icon: FiLayers,
      value: stats?.indirectReferrals ?? stats?.indirectCount ?? stats?.indirect_count ?? 0,
      color: 'bg-purple-50 text-purple-500',
    },
    {
      key: 'earned',
      label: 'Total Earnings',
      icon: FiDollarSign,
      value: stats?.totalEarnings ?? stats?.total_earnings ?? 0,
      color: 'bg-emerald-50 text-emerald-500',
    },
    {
      key: 'pending',
      label: 'Pending Commission',
      icon: FiClock,
      value: stats?.pendingCommission ?? stats?.pending_commission ?? 0,
      color: 'bg-amber-50 text-amber-500',
    },
    {
      key: 'freeReg',
      label: 'Free Registration Earnings',
      icon: FiGift,
      value: stats?.freeRegistrationEarnings ?? 0,
      color: 'bg-rose-50 text-rose-500',
    },
    {
      key: 'pendingRefs',
      label: 'Pending Referrals',
      icon: FiUserCheck,
      value: stats?.pendingReferrals ?? 0,
      color: 'bg-sky-50 text-sky-500',
    },
  ];

  const activeList = activeTab === 'direct' ? directReferrals : activeTab === 'indirect' ? indirectReferrals : [];

  const renderDateFilter = () => {
    return (
      <div className="flex items-center gap-2">
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            if (e.target.value === "today") {
              setStartDate(new Date().toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            } else if (e.target.value === "week") {
              const day = new Date().getDay();
              const diff = new Date().getDate() - day + (day === 0 ? -6 : 1);
              setStartDate(new Date(new Date().setDate(new Date().getDate() - diff + 1)).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            } else if (e.target.value === "month") {
              setStartDate(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-01`);
              setEndDate(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate()}`);
            } else if (e.target.value === "quarter") {
              const month = new Date().getMonth();
              const quarterStartMonth = (Math.floor(month / 3) * 3) + 1;
              setStartDate(`${new Date().getFullYear()}-${quarterStartMonth.toString().padStart(2, '0')}-01`);
              const quarterEndMonth = quarterStartMonth + 2;
              setEndDate(`${new Date().getFullYear()}-${(quarterEndMonth > 12 ? 1 : quarterEndMonth + 1).toString().padStart(2, '0')}-${new Date().getDate()}`);
            } else if (e.target.value === "year") {
              setStartDate(`${new Date().getFullYear()}-01-01`);
              setEndDate(`${new Date().getFullYear()}-12-31`);
            } else {
              setStartDate("");
              setEndDate("");
            }
            fetchData();
          }}
          className="w-full rounded-[11px] border border-dark-200 bg-dark-50 px-3 py-2.5 text-[14.5px] text-ink focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
        >
          {STAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

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

function ExpandButton({ count, expanded, loading, onToggle }) {
  if (!count) return null;
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-600 text-[9px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <FiRefreshCw size={10} className="animate-spin" />
      ) : expanded ? (
        <FiChevronDown size={10} />
      ) : (
        <FiChevronRight size={10} />
      )}
      {expanded ? 'Collapse' : `${count} member${count !== 1 ? 's' : ''}`}
    </button>
  );
}

function TreeNode({ node, depth }) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const inlineChildren = node.children && node.children.length > 0 ? node.children : [];
  const childNodes = expanded && children.length > 0 ? children : inlineChildren;
  const count = childNodes.length > 0 ? childNodes.length : node.childCount || 0;
  const hLineLeft = `${100 / (count * 2)}%`;
  const hLineRight = hLineLeft;

  const toggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (children.length > 0) {
      setExpanded(true);
      return;
    }
    setLoading(true);
    setLoadError(false);
    try {
      const res = await referralService.getTreeChildren(node.user._id);
      const data = res?.data?.data || res?.data || res;
      const list = data?.nodes || (Array.isArray(data) ? data : []);
      setChildren(list);
      setExpanded(true);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center">
        <UserCard node={node} isRoot={false} />
        <ExpandButton count={count} expanded={expanded} loading={loading} onToggle={toggle} />
        {loadError && (
          <p className="text-[9px] sm:text-[10px] text-rose-500 mt-1">Failed to load. Try again.</p>
        )}
      </div>

      {childNodes.length > 0 && (
        <div className="flex flex-col items-center w-full">
          <div className={`relative w-full ${depth < 2 ? 'h-5 sm:h-7' : 'h-4 sm:h-6'}`}>
            <div className="absolute top-0 left-1/2 w-px sm:w-0.5 h-3/4 -translate-x-1/2 bg-slate-300" />
            <div
              className="absolute top-3/4 h-px sm:h-0.5 -translate-y-1/2 bg-slate-300"
              style={{ left: hLineLeft, right: hLineRight }}
            />
          </div>

          <div className="flex justify-center gap-1 sm:gap-3 md:gap-5 relative">
            {childNodes.map((child) => (
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
                <span className="text-[9px] sm:text-xs text-dark-500 bg-white/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-primary-100 whitespace-nowrap">T: <strong className="text-ink">{stats.totalDownline ?? stats.totalReferrals ?? 0}</strong></span>
                <span className="text-[9px] sm:text-xs text-emerald-600 bg-emerald-50/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-200 whitespace-nowrap">A: <strong>{stats.active ?? stats.activeMembers ?? 0}</strong></span>
                <span className="text-[9px] sm:text-xs text-amber-600 bg-amber-50/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-amber-200 whitespace-nowrap">F: <strong>{stats.free ?? stats.freeMembers ?? 0}</strong></span>
              </>
            )}
            {onBack && (
              <Button variant="outline" size="sm" onClick={onBack} className="text-xs !px-2.5 !py-1 sm:!px-3 sm:!py-1.5">Back</Button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-auto pb-4 sm:pb-6 -mx-2 sm:-mx-2 px-2 sm:px-2 scroll-smooth max-h-[70vh]" style={{ WebkitOverflowScrolling: 'touch' }}>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Referrals</h1>
          <p className="mt-1 text-sm text-dark-500">Share your referral code and earn commissions</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0">
          <h2 className="text-lg font-semibold mb-4">Your Referral Code</h2>
          {loading ? (
            <Skeleton className="h-12 w-48 bg-white/20" />
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-white/10 rounded-[11px] px-5 py-3 font-mono text-2xl font-bold tracking-wider text-center sm:text-left">
                    {code || 'N/A'}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyCode}
                    className="p-3 rounded-[11px] bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                    title="Copy code"
                  >
                    <AnimatePresence mode="wait">
                      {copiedCode ? (
                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <FiCheck size={20} />
                        </motion.div>
                      ) : (
                        <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                          <FiCopy size={20} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-[11px] px-4 py-2.5">
                    <FiLink size={14} className="text-white/70 shrink-0" />
                    <span className="text-sm text-white/90 truncate">{referralLink || 'No link available'}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyLink}
                    className="p-3 rounded-[11px] bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                    title="Copy link"
                  >
                    {copiedLink ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="flex items-center gap-4 mb-6">
        <select
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            if (e.target.value === "today") {
              setStartDate(new Date().toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            } else if (e.target.value === "week") {
              const day = new Date().getDay();
              const diff = new Date().getDate() - day + (day === 0 ? -6 : 1);
              setStartDate(new Date(new Date().setDate(new Date().getDate() - diff + 1)).toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
            } else if (e.target.value === "month") {
              setStartDate(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-01`);
              setEndDate(`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate()}`);
            } else if (e.target.value === "quarter") {
              const month = new Date().getMonth();
              const quarterStartMonth = (Math.floor(month / 3) * 3) + 1;
              setStartDate(`${new Date().getFullYear()}-${quarterStartMonth.toString().padStart(2, '0')}-01`);
              const quarterEndMonth = quarterStartMonth + 2;
              setEndDate(`${new Date().getFullYear()}-${(quarterEndMonth > 12 ? 1 : quarterEndMonth + 1).toString().padStart(2, '0')}-${new Date().getDate()}`);
            } else if (e.target.value === "year") {
              setStartDate(`${new Date().getFullYear()}-01-01`);
              setEndDate(`${new Date().getFullYear()}-12-31`);
            } else {
              setStartDate("");
              setEndDate("");
            }
            fetchData();
          }}
          className="rounded-[11px] border border-dark-200 bg-dark-50 px-3 py-2.5 text-[14.5px] text-ink focus:border-primary-500 focus:bg-white focus:outline-none transition-all"
        >
          {STAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {!loading && rankData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiAward className="text-primary-500" size={18} />
                <h2 className="text-lg font-semibold text-ink">My Rank</h2>
              </div>
              {rankData.userRank?.isLocked && <Badge color="warning">Locked</Badge>}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                  {rankData.userRank?.currentRankId?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="text-lg font-bold text-ink">{rankData.userRank?.currentRankId?.name || 'Unranked'}</p>
                  <p className="text-xs text-dark-400">
                    {rankData.directCount ?? 0} direct · {rankData.totalTeam ?? 0} team
                  </p>
                </div>
              </div>
              {rankData.nextRank && (
                <div className="flex-1 sm:border-l sm:border-dark-100 sm:pl-6">
                  <p className="text-xs text-dark-500 mb-1.5">Next: <span className="font-semibold text-ink">{rankData.nextRank.name}</span></p>
                  <div className="space-y-1">
                    {rankData.nextRank.minDirectReferrals > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-dark-400 w-28">Direct Refer:</span>
                        <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((rankData.directCount ?? 0) / rankData.nextRank.minDirectReferrals) * 100)}%` }} />
                        </div>
                        <span className="text-dark-600 w-16 text-right">{rankData.directCount ?? 0}/{rankData.nextRank.minDirectReferrals}</span>
                      </div>
                    )}
                    {rankData.nextRank.minTeamMembers > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-dark-400 w-28">Team Members:</span>
                        <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((rankData.totalTeam ?? 0) / rankData.nextRank.minTeamMembers) * 100)}%` }} />
                        </div>
                        <span className="text-dark-600 w-16 text-right">{rankData.totalTeam ?? 0}/{rankData.nextRank.minTeamMembers}</span>
                      </div>
                    )}
                    {(rankData.qualifiedLegsRequired > 0 && rankData.requiredRankName) && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-dark-400 w-28">Qualified:</span>
                        <div className="flex-1 h-2 bg-dark-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(100, ((rankData.qualifiedLegs ?? 0) / rankData.qualifiedLegsRequired) * 100)}%` }} />
                        </div>
                        <span className="text-dark-600 w-16 text-right">{rankData.qualifiedLegs ?? 0}/{rankData.qualifiedLegsRequired}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key} variants={item}>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[11px] ${card.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-dark-500">{card.label}</p>
                      <p className="mt-0.5 text-lg font-bold text-ink">
                        {['earned', 'pending', 'freeReg'].includes(card.key)
                          ? formatCurrency(card.value)
                          : card.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {stats?.freeRegistrationEarnings > 0 && (
        <motion.div variants={item} className="mt-4">
          <Card className="p-4 border border-rose-100 bg-rose-50/30">
            <h3 className="text-sm font-semibold text-ink mb-2 flex items-center gap-2">
              <FiGift className="text-rose-500" /> Free Registration Earnings
            </h3>
            <p className="text-xs text-dark-500 mb-2">
              Total earned from free registrations: <span className="font-bold text-rose-600">{formatCurrency(stats.freeRegistrationEarnings)}</span>
            </p>
            <p className="text-xs text-dark-400">
              Each direct registration gives you a registration referral bonus, credited instantly to your funding wallet.
            </p>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="overflow-hidden p-0">
          <div className="flex border-b border-dark-100">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-dark-500 hover:text-dark-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.key === 'direct' ? 'Direct' : 'Indirect'}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {loading ? (
                  <Skeleton count={4} className="h-16 w-full" />
                ) : activeTab === 'tree' ? (
                  referralTree.length === 0 ? (
                    <EmptyState
                      icon={FiShare2}
                      title="No referral tree yet"
                      description="Start by sharing your referral code. Your tree will grow as people join through your links."
                    />
                  ) : (
                    <GenealogyTree
                      rootUser={user}
                      treeNodes={referralTree}
                      stats={stats}
                    />
                  )
                ) : activeList.length === 0 ? (
                  <EmptyState
                    icon={FiUsers}
                    title={`No ${activeTab} referrals yet`}
                    description={
                      activeTab === 'direct'
                        ? 'Share your referral code to invite others and start earning.'
                        : 'Your indirect referrals will appear when your direct referrals invite others.'
                    }
                  />
) : (
                  <div className="space-y-3">
{activeList.map(renderReferralItem)}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-dark-400">
              {activeTab === 'direct'
                ? `${directReferrals.length} direct referral${directReferrals.length !== 1 ? 's' : ''}`
                : activeTab === 'indirect'
                ? `${indirectReferrals.length} indirect referral${indirectReferrals.length !== 1 ? 's' : ''}`
                : `${referralTree.length} branches in your tree`}
            </p>
          </div>
        </Card>
      </motion.div>

      {!loading && rankData?.allRanks?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-ink mb-4">Rank Requirements</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-100">
                    <th className="text-left py-2.5 pr-4 font-semibold text-dark-600">Rank</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-dark-600">Direct Refer</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-dark-600">At Least</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-dark-600">Team</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-dark-600">Activation</th>
                    <th className="text-left py-2.5 pr-4 font-semibold text-dark-600">Quant</th>
                    <th className="text-left py-2.5 font-semibold text-dark-600">Indirect</th>
                  </tr>
                </thead>
                <tbody>
                  {rankData.allRanks.map((r, idx) => {
                    const isCurrent = rankData.userRank?.currentRankId?._id === r._id || rankData.userRank?.currentRankId?.id === r._id;
                    const isNext = rankData.nextRank?._id === r._id || rankData.nextRank?.id === r._id;
                    return (
                      <tr key={r._id || r.id || idx} className={`border-b border-dark-50 last:border-0 ${isCurrent ? 'bg-primary-50' : isNext ? 'bg-blue-50/50' : ''}`}>
                        <td className="py-2.5 pr-4">
                          <span className="font-semibold text-ink">{r.name}</span>
                          {isCurrent && <Badge color="primary" className="ml-2 text-[10px]">Current</Badge>}
                          {isNext && <Badge color="info" className="ml-2 text-[10px]">Next</Badge>}
                        </td>
                        <td className="py-2.5 pr-4 text-dark-600">{r.minDirectReferrals || '\u2014'}</td>
                        <td className="py-2.5 pr-4 text-dark-600">{r.minRequiredRank && r.minRequiredRankCount ? `${r.minRequiredRankCount}x ${r.minRequiredRank}` : '\u2014'}</td>
                        <td className="py-2.5 pr-4 text-dark-600">{r.minTeamMembers || '\u2014'}</td>
                        <td className="py-2.5 pr-4 font-medium text-emerald-600">{r.activationGain ? `$${r.activationGain}` : '\u2014'}</td>
                        <td className="py-2.5 pr-4 text-dark-600">{r.quantification ? `${r.quantification}%` : '\u2014'}</td>
                        <td className="py-2.5 font-medium text-blue-600">{r.indirectIncome ? `$${r.indirectIncome}` : '\u2014'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
