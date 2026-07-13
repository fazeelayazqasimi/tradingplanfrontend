import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiCheck,
  FiChevronRight,
  FiStar,
  FiZap,
  FiRefreshCw,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import studentService from '../../services/studentService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

const RANK_GRADIENTS = {
  D1: 'from-gray-400 to-gray-500',
  D2: 'from-amber-400 to-amber-600',
  D3: 'from-blue-400 to-blue-600',
  D4: 'from-purple-400 to-purple-600',
  D5: 'from-rose-400 to-rose-600',
  D6: 'from-emerald-400 to-emerald-600',
};

const RANK_BG = {
  D1: 'bg-gray-50',
  D2: 'bg-amber-50',
  D3: 'bg-blue-50',
  D4: 'bg-purple-50',
  D5: 'bg-rose-50',
  D6: 'bg-emerald-50',
};

const RANK_BORDER = {
  D1: 'border-gray-200',
  D2: 'border-amber-200',
  D3: 'border-blue-200',
  D4: 'border-purple-200',
  D5: 'border-rose-200',
  D6: 'border-emerald-200',
};



export default function Rank() {
  const [currentRank, setCurrentRank] = useState(null);
  const [ranks, setRanks] = useState([]);
  const [rankHistory, setRankHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rankRes, allRanksRes] = await Promise.allSettled([
        studentService.getMyRank(),
        studentService.getRanks(),
      ]);

      if (rankRes.status === 'fulfilled') {
        const rd = rankRes.value?.data?.data || rankRes.value?.data || rankRes.value;
        setCurrentRank(rd);
        const history = rd?.history || rd?.promotions || rd?.rankHistory || [];
        setRankHistory(Array.isArray(history) ? history : []);
      }

      if (allRanksRes.status === 'fulfilled') {
        const rkd = allRanksRes.value?.data?.data || allRanksRes.value?.data || allRanksRes.value;
        const list = rkd?.ranks || rkd?.data || (Array.isArray(rkd) ? rkd : null);
        setRanks(list || []);
      }
    } catch {
      toast.error('Failed to load rank data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const displayRanks = ranks.length > 0
    ? ranks.map((r) => ({
        name: r.name || r.rank || r.label,
        requiredReferrals: r.requiredReferrals ?? r.required_referrals ?? r.referralsRequired ?? 0,
        requiredRevenue: r.requiredRevenue ?? r.required_revenue ?? r.revenueRequired ?? 0,
        commission: r.commission ?? r.commissionPercent ?? r.commissionRate ?? 0,
        perks: r.perks ?? r.benefits ?? r.features ?? [],
      }))
    : [];

  const RANK_ORDER = displayRanks.map((r) => r.name);

  const rankName = currentRank?.name || currentRank?.rank || currentRank?.rankName || 'D1';
  const directCount = currentRank?.directReferrals ?? currentRank?.direct_count ?? currentRank?.totalDirectReferrals ?? 0;
  const totalRevenue = currentRank?.totalRevenue ?? currentRank?.revenue ?? currentRank?.total_revenue ?? 0;
  const promotionDate = currentRank?.promotedAt || currentRank?.rankUpdatedAt || currentRank?.updatedAt;

  const currentIndex = RANK_ORDER.indexOf(rankName);
  const nextRankName = currentIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentIndex + 1] : null;
  const nextRankData = nextRankName ? displayRanks.find((r) => r.name === nextRankName) : null;

  const referralsNeeded = nextRankData ? Math.max(0, nextRankData.requiredReferrals - directCount) : 0;
  const revenueNeeded = nextRankData ? Math.max(0, nextRankData.requiredRevenue - totalRevenue) : 0;
  const referralPct = nextRankData && nextRankData.requiredReferrals > 0
    ? Math.min(100, (directCount / nextRankData.requiredReferrals) * 100)
    : 100;
  const revenuePct = nextRankData && nextRankData.requiredRevenue > 0
    ? Math.min(100, (totalRevenue / nextRankData.requiredRevenue) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Rank</h1>
          <p className="mt-1 text-sm text-dark-500">Track your rank progress and achievements</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center justify-center">
            <Skeleton className="h-36 w-36 rounded-full" />
          </Card>
          <Card className="p-6 lg:col-span-2">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <Card className="p-6 flex flex-col items-center justify-center text-center">
              <div className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${RANK_GRADIENTS[rankName] || 'from-primary-400 to-primary-600'} flex items-center justify-center shadow-lg`}>
                <div className="absolute inset-1 rounded-full bg-white" />
                <div className="relative z-10 flex flex-col items-center">
                  <FiAward className="text-3xl text-white mb-1" />
                  <span className="text-4xl font-black text-white">{rankName}</span>
                </div>
              </div>
              <div className="mt-4">
                <Badge color="info" className="text-sm px-3 py-1">
                  {displayRanks.find((r) => r.name === rankName)?.commission ?? 0}% Commission
                </Badge>
              </div>
              <p className="mt-3 text-sm text-dark-500">
                {promotionDate ? `Since ${formatDate(promotionDate)}` : 'Your current rank'}
              </p>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <Card className="p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ink">
                  {nextRankData ? `Progress to ${nextRankName}` : 'Maximum Rank Achieved!'}
                </h2>
                {nextRankData && (
                  <Badge color="success">{nextRankData.commission}% commission at {nextRankName}</Badge>
                )}
              </div>

              {nextRankData ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark-600 flex items-center gap-1.5">
                        <FiUsers size={14} />
                        Referrals
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {directCount} / {nextRankData.requiredReferrals}
                      </span>
                    </div>
                    <div className="h-1.5 rounded bg-dark-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${referralPct}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded bg-gradient-to-r from-primary-500 to-emerald-500"
                      />
                    </div>
                    {referralsNeeded > 0 && (
                      <p className="mt-1.5 text-xs text-dark-500">{referralsNeeded} more referral{referralsNeeded !== 1 ? 's' : ''} needed</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-dark-600 flex items-center gap-1.5">
                        <FiDollarSign size={14} />
                        Revenue
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {formatCurrency(totalRevenue)} / {formatCurrency(nextRankData.requiredRevenue)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded bg-dark-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${revenuePct}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded bg-gradient-to-r from-primary-500 to-emerald-500"
                      />
                    </div>
                    {revenueNeeded > 0 && (
                      <p className="mt-1.5 text-xs text-dark-500">{formatCurrency(revenueNeeded)} more revenue needed</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {displayRanks.map((r) => {
                      const isCurrent = r.name === rankName;
                      const isPast = RANK_ORDER.indexOf(r.name) < RANK_ORDER.indexOf(rankName);
                      return (
                        <div
                          key={r.name}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                            isCurrent
                              ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-500/30'
                              : isPast
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-dark-100 text-dark-500'
                          }`}
                        >
                          {isPast && <FiCheck size={12} />}
                          {isCurrent && <FiStar size={12} />}
                          {r.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiZap className="mx-auto text-4xl text-amber-500 mb-3" />
                  <p className="text-lg font-semibold text-ink">
                    You've reached the highest rank!
                  </p>
                  <p className="text-sm text-dark-500 mt-1">Keep earning and mentoring to maximize your benefits.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-ink mb-5">All Ranks</h2>
          {loading ? (
            <Skeleton count={3} className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayRanks.map((rank, idx) => {
                const isCurrent = rank.name === rankName;
                const isPast = RANK_ORDER.indexOf(rank.name) < RANK_ORDER.indexOf(rankName);
                return (
                  <motion.div
                    key={rank.name}
                    variants={item}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: idx * 0.05 }}
                    className={`relative rounded-[18px] border-2 p-5 transition-all ${
                      isCurrent
                        ? `${RANK_BG[rank.name] || 'bg-primary-50'} ${RANK_BORDER[rank.name] || 'border-primary-300'} ring-2 ring-primary-500/20`
                        : isPast
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-dark-100 hover:border-dark-200'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-2.5 left-4">
                        <Badge color="info">Current Rank</Badge>
                      </div>
                    )}
                    {isPast && !isCurrent && (
                      <div className="absolute -top-2.5 left-4">
                        <Badge color="success">Achieved</Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between mt-1 mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-[11px] bg-gradient-to-br ${RANK_GRADIENTS[rank.name] || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-black text-lg shadow-sm`}>
                          {rank.name}
                        </div>
                        <div>
                          <p className="font-bold text-ink">{rank.name}</p>
                          <p className="text-xs text-dark-500">{rank.commission}% commission</p>
                        </div>
                      </div>
                      {isPast && <FiCheck className="text-emerald-500 mt-1" size={20} />}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dark-500 flex items-center gap-1"><FiUsers size={12} /> Referrals</span>
                        <span className="font-medium text-dark-700">{rank.requiredReferrals}+</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-dark-500 flex items-center gap-1"><FiDollarSign size={12} /> Revenue</span>
                        <span className="font-medium text-dark-700">{formatCurrency(rank.requiredRevenue)}+</span>
                      </div>
                    </div>

                    {rank.perks && rank.perks.length > 0 && (
                      <div className="border-t border-dark-100 pt-3">
                        <p className="text-xs font-medium text-dark-500 mb-1.5">Perks</p>
                        <ul className="space-y-1">
                          {rank.perks.map((perk, i) => (
                            <li key={i} className="text-xs text-dark-600 flex items-start gap-1.5">
                              <FiChevronRight size={12} className="text-primary-500 mt-0.5 shrink-0" />
                              <span>{perk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {!loading && rankHistory.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-ink mb-5">Rank History</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-dark-100" />
              <div className="space-y-6">
                {rankHistory.map((entry, idx) => {
                  const entryRank = entry.rank || entry.to || entry.newRank || entry.name;
                  const entryDate = entry.promotedAt || entry.createdAt || entry.date;
                  const isLatest = idx === 0;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="relative flex items-start gap-4"
                    >
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isLatest
                          ? `bg-gradient-to-br ${RANK_GRADIENTS[entryRank] || 'from-primary-400 to-primary-600'} text-white shadow-md`
                          : 'bg-dark-200 text-dark-600'
                      }`}>
                        <FiAward size={16} />
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink">
                            {entry.from ? `Promoted from ${entry.from} to ${entryRank}` : `Promoted to ${entryRank}`}
                          </p>
                          {isLatest && <Badge color="info">Latest</Badge>}
                        </div>
                        <p className="text-sm text-dark-500 mt-0.5">{formatDate(entryDate)}</p>
                        {entry.reason && (
                          <p className="text-xs text-dark-400 mt-1">{entry.reason}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
