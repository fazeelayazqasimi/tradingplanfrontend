import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiUserPlus,
  FiLayers,
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import referralService from '../../services/referralService';
import { formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const statusColor = (status) => {
  if (status === 'active' || status === 'verified') return 'success';
  if (status === 'pending') return 'warning';
  return 'neutral';
};

const getUserObj = (ref) => ref.referredUserId || ref;

const getMemberName = (ref) => {
  const u = getUserObj(ref);
  return (u.firstName ? `${u.firstName} ${u.lastName}` : null) ||
    u.name || u.userName ||
    `${u.firstName || ''} ${u.lastName || ''}`.trim() ||
    'Unknown';
};

const getMemberEmail = (ref) => {
  const u = getUserObj(ref);
  return u.email || u.userEmail || '';
};

const getMemberDate = (ref) => {
  const u = getUserObj(ref);
  return u.joinedAt || u.createdAt || u.date || ref.createdAt;
};

const getInitials = (name) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

const colorCycle = [
  'bg-primary-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

const getAvatarColor = (index) => colorCycle[index % colorCycle.length];

function MemberRow({ member, index, isIndirect }) {
  const name = getMemberName(member);
  const email = getMemberEmail(member);
  const date = getMemberDate(member);
  const status = member.status || 'active';
  const initials = getInitials(name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center justify-between p-4 rounded-[11px] bg-dark-50/50 hover:bg-dark-100/50 transition-colors ${
        isIndirect ? 'ml-8 border-l-2 border-dark-200' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
            isIndirect ? 'bg-dark-400' : getAvatarColor(index)
          }`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">{name}</p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            {email && (
              <p className="text-xs text-dark-500 truncate">{email}</p>
            )}
            {date && (
              <p className="text-xs text-dark-400">
                Joined {formatDate(date)}
              </p>
            )}
          </div>
        </div>
      </div>
      <Badge color={statusColor(status)}>{status}</Badge>
    </motion.div>
  );
}

function DirectReferralSection({ directRef, index, indirectMap }) {
  const [expanded, setExpanded] = useState(false);
  const name = getMemberName(directRef);
  const id = directRef._id || directRef.id || index;
  const children = indirectMap[id] || [];

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full"
      >
        <MemberRow member={directRef} index={index} isIndirect={false} />
        {children.length > 0 && (
          <div className="flex items-center gap-1.5 ml-14 mt-1 mb-1">
            <motion.div
              animate={{ rotate: expanded ? 0 : -90 }}
              transition={{ duration: 0.15 }}
            >
              <FiChevronDown size={14} className="text-dark-400" />
            </motion.div>
            <span className="text-xs text-dark-400">
              {children.length} indirect member{children.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {expanded && children.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2 pl-4"
          >
            {children.map((child, ci) => (
              <MemberRow
                key={child._id || child.id || ci}
                member={child}
                index={ci}
                isIndirect
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TeamMembers() {
  const [directReferrals, setDirectReferrals] = useState([]);
  const [indirectReferrals, setIndirectReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const treeRes = await referralService.getTree();
      const td = treeRes?.data?.data || treeRes?.data || treeRes;
      const direct = td?.direct || td?.directReferrals || td?.level1 || [];
      const indirect = td?.indirect || td?.indirectReferrals || td?.level2 || [];
      const st = td?.stats || {};
      setDirectReferrals(Array.isArray(direct) ? direct : []);
      setIndirectReferrals(Array.isArray(indirect) ? indirect : []);
      setStats(st);
    } catch {
      toast.error('Failed to load team data');
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const indirectMap = {};
  indirectReferrals.forEach((member) => {
    const parentUserId = member.referredUserId?.referredBy;
    if (parentUserId) {
      const directRef = directReferrals.find((dr) => {
        const du = dr.referredUserId;
        return du ? (du._id || du).toString() === parentUserId.toString() : false;
      });
      if (directRef) {
        const parentKey = directRef._id || directRef.id;
        if (!indirectMap[parentKey]) indirectMap[parentKey] = [];
        indirectMap[parentKey].push(member);
      }
    }
  });

  const totalDirect =
    stats?.totalDirect ??
    stats?.directCount ??
    stats?.direct_count ??
    directReferrals.length;
  const totalIndirect =
    stats?.totalIndirect ??
    stats?.indirectCount ??
    stats?.indirect_count ??
    indirectReferrals.length;
  const totalMembers = stats?.totalReferrals ?? totalDirect + totalIndirect;
  const totalCommission = stats?.totalCommission ?? stats?.total_earnings ?? stats?.totalEarnings ?? 0;

  const summaryCards = [
    {
      key: 'total',
      label: 'Total Team Members',
      icon: FiUsers,
      value: totalMembers,
      color: 'bg-primary-50 text-primary-500',
    },
    {
      key: 'direct',
      label: 'Direct Members',
      icon: FiUserPlus,
      value: totalDirect,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      key: 'indirect',
      label: 'Indirect Members',
      icon: FiLayers,
      value: totalIndirect,
      color: 'bg-purple-50 text-purple-500',
    },
    {
      key: 'commission',
      label: 'Total Commission Earned',
      icon: FiRefreshCw,
      value: totalCommission,
      color: 'bg-emerald-50 text-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Team Members</h1>
          <p className="mt-1 text-sm text-dark-500">View your referral network tree</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <FiRefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

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
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key} variants={item}>
                <Card className="p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[11px] ${card.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-dark-500">
                        {card.label}
                      </p>
                      <p className="mt-1 text-2xl font-bold text-ink">
                        {card.key === 'commission' ? card.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : card.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="overflow-hidden p-0">
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-[11px] bg-dark-50/50">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : directReferrals.length === 0 ? (
              <EmptyState
                icon={FiUsers}
                title="No team members yet"
                description="Share your referral code to invite others and start building your team."
              />
            ) : (
              <div className="space-y-2">
                <div className="px-4 pb-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400">
                    My Direct Referrals
                  </h3>
                </div>
                {directReferrals.map((ref, idx) => (
                  <DirectReferralSection
                    key={ref._id || ref.id || idx}
                    directRef={ref}
                    index={idx}
                    indirectMap={indirectMap}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-dark-400">
              {directReferrals.length} direct &middot;{' '}
              {indirectReferrals.length} indirect &middot;{' '}
              {directReferrals.length + indirectReferrals.length} total members
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
