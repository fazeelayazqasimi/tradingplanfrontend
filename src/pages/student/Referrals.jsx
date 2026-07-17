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
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import referralService from '../../services/referralService';
import { formatCurrency, formatDate, copyToClipboard } from '../../utils/helpers';

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
  const [code, setCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState(null);
  const [directReferrals, setDirectReferrals] = useState([]);
  const [indirectReferrals, setIndirectReferrals] = useState([]);
  const [referralTree, setReferralTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('direct');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [codeRes, statsRes, treeRes] = await Promise.allSettled([
        referralService.getReferralCode(),
        referralService.getStats(),
        referralService.getTree(),
      ]);

      if (codeRes.status === 'fulfilled') {
        const cd = codeRes.value?.data?.data || codeRes.value?.data || codeRes.value;
        const referralCode = cd?.code || cd?.referralCode || cd || '';
        setCode(typeof referralCode === 'string' ? referralCode : referralCode?.toString() || '');
        const base = window.location.origin;
        setReferralLink(`${base}/register?ref=${typeof referralCode === 'string' ? referralCode : referralCode?.code || ''}`);
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
      value: stats?.directCount ?? stats?.direct_count ?? stats?.directReferrals ?? 0,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      key: 'indirect',
      label: 'Indirect Referrals',
      icon: FiLayers,
      value: stats?.indirectCount ?? stats?.indirect_count ?? stats?.indirectReferrals ?? 0,
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
  ];

  const activeList = activeTab === 'direct' ? directReferrals : activeTab === 'indirect' ? indirectReferrals : [];

  function TreeNode({ node, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const u = node.user || {};
    const name = (u.firstName ? `${u.firstName} ${u.lastName}` : null) || 'Unknown';
    const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
      <div>
        <div
          className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-dark-50 cursor-pointer transition-colors"
          style={{ marginLeft: depth * 24 }}
        >
          {node.children?.length > 0 ? (
            <button onClick={() => setExpanded(!expanded)} className="p-0.5 text-dark-400 hover:text-dark-600">
              {expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            </button>
          ) : (
            <span className="w-[18px]" />
          )}
          <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <span className="text-sm font-medium text-ink truncate flex-1">{name}</span>
          <span className="text-[11px] text-dark-400">Lvl {node.level}</span>
          {node.commission > 0 && (
            <span className="text-[11px] font-semibold text-emerald-600">+{formatCurrency(node.commission)}</span>
          )}
        </div>
        {expanded && node.children?.length > 0 && (
          <div className="border-l-2 border-dark-200 ml-[22px]">
            {node.children.map((child, i) => (
              <TreeNode key={child._id || i} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
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

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key} variants={item}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-[11px] ${card.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-dark-500">{card.label}</p>
                      <p className="mt-1 text-2xl font-bold text-ink">
                        {card.key === 'earned' || card.key === 'pending'
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
                    <div className="space-y-1">
                      {referralTree.map((node, i) => (
                        <TreeNode key={node._id || i} node={node} depth={0} />
                      ))}
                    </div>
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
                    {activeList.map((ref, idx) => {
                      const u = ref.referredUserId || ref;
                      const name = (u.firstName ? `${u.firstName} ${u.lastName}` : null) || u.name || u.userName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown';
                      const joinedDate = u.joinedAt || u.createdAt || u.date || ref.createdAt;
                      const status = ref.status || 'active';
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
                        </motion.div>
                      );
                    })}
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
    </div>
  );
}
