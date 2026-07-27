import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiBookOpen,
  FiTrendingUp,
  FiDollarSign,
  FiAward,
  FiArrowRight,
  FiActivity,
  FiCreditCard,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiCopy,
  FiLink,
  FiShield,
  FiUsers,
  FiUserPlus,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
  FiTarget,
  FiVideo,
  FiRepeat,
  FiGift,
  FiFileText,
  FiShoppingBag,
  FiBarChart2,
  FiPieChart,
  FiCheck,
  FiZap,
  FiGlobe,
  FiStar,
  FiTrendingDown,
  FiAlertTriangle,
  FiLock,
  FiLogOut,
  FiSettings,
  FiChevronRight,
  FiChevronDown,
  FiExternalLink,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import studentService from '../../services/studentService';
import walletService from '../../services/walletService';
import referralService from '../../services/referralService';
import courseService from '../../services/courseService';
import signalService from '../../services/signalService';
import marketOverviewService from '../../services/marketOverviewService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getInitials, copyToClipboard } from '../../utils/helpers';
import SystemFlow from '../../components/website/SystemFlow';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

const gradientPlaceholders = [
  'from-blue-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-indigo-600',
  'from-cyan-500 to-blue-600',
];

const navSections = [
  {
    title: 'Learning',
    icon: FiBookOpen,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    items: [
      { label: 'Dashboard', icon: FiActivity, link: '/student/dashboard' },
      { label: 'Trainings', icon: FiBookOpen, link: '/student/courses' },
      { label: 'Signals', icon: FiTrendingUp, link: '/student/signals' },
      { label: 'Copy Trading', icon: FiRepeat, link: '/student/copy-trading' },
      { label: 'Certificates', icon: FiFileText, link: '/student/certificates' },
    ],
  },
  {
    title: 'Finance',
    icon: FiDollarSign,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    items: [
      { label: 'Wallet', icon: FiCreditCard, link: '/student/wallet' },
      { label: 'Transactions', icon: FiActivity, link: '/student/transactions' },
      { label: 'Earnings', icon: FiTrendingUp, link: '/student/earnings' },
      { label: 'Profit Share', icon: FiPieChart, link: '/student/profit-share' },
      { label: 'Withdrawals', icon: FiArrowDown, link: '/student/withdrawals' },
    ],
  },
  {
    title: 'Network',
    icon: FiUsers,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
    items: [
      { label: 'Referrals', icon: FiUserPlus, link: '/student/referrals' },
      { label: 'Team Members', icon: FiUsers, link: '/student/team' },
      { label: 'My Rank', icon: FiAward, link: '/student/rank' },
    ],
  },
  {
    title: 'Account',
    icon: FiUser,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    items: [
      { label: 'Membership', icon: FiShield, link: '/student/membership' },
      { label: 'Activation', icon: FiCheckCircle, link: '/student/activation' },
      { label: 'Settings', icon: FiSettings, link: '/student/settings' },
      { label: 'Logout', icon: FiLogOut, link: '/login', danger: true },
    ],
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [signals, setSignals] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [rank, setRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);
  const [todaySignalsCount, setTodaySignalsCount] = useState(0);
  const [navOpen, setNavOpen] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const [enrolledRes, signalsRes, walletRes, walletStatsRes, rankRes, overviewRes, signalsCountRes, refStatsRes, refCodeRes] = await Promise.allSettled([
          courseService.getEnrolled(),
          signalService.getSignals({ perPage: 5, sort: '-createdAt' }),
          walletService.getWallet('main'),
          walletService.getStats(),
          studentService.getMyRank(),
          marketOverviewService.getMarketOverview(),
          signalService.getSignals({ status: 'open', isPublished: true, perPage: 1 }),
          referralService.getStats(),
          referralService.getReferralCode(),
        ]);

        if (cancelled) return;

        const enrolledData = enrolledRes.status === 'fulfilled' ? enrolledRes.value : {};
        const coursesList = enrolledData.data?.courses || enrolledData.data?.data || enrolledData.courses || enrolledData.data || [];
        setEnrolled(Array.isArray(coursesList) ? coursesList.slice(0, 3) : []);

        const signalsData = signalsRes.status === 'fulfilled' ? signalsRes.value : {};
        const signalsBody = signalsData?.data || signalsData || {};
        const signalsList = signalsBody?.data || signalsBody?.signals || [];
        setSignals(Array.isArray(signalsList) ? signalsList.slice(0, 5) : []);

         if (walletRes.status === 'fulfilled' && walletRes.value) {
           setWalletData(walletRes.value.data || walletRes.value);
         }

        if (walletStatsRes.status === 'fulfilled' && walletStatsRes.value) {
          setWalletStats(walletStatsRes.value.data || walletStatsRes.value);
        }

        if (rankRes.status === 'fulfilled' && rankRes.value) {
          const rd = rankRes.value.data || rankRes.value;
          setRank(rd.rank || rd.data?.rank || null);
          setNextRank(rd.nextRank || rd.data?.nextRank || null);
        }

        if (overviewRes.status === 'fulfilled' && overviewRes.value) {
          const od = overviewRes.value.data || overviewRes.value;
          setMarketOverview(od.data || od || {});
        }

        if (signalsCountRes.status === 'fulfilled' && signalsCountRes.value) {
          const sc = signalsCountRes.value.data || signalsCountRes.value;
          const scList = sc?.data || sc?.signals || sc || [];
          setTodaySignalsCount(Array.isArray(scList) ? scList.length : 0);
        }

        if (refCodeRes.status === 'fulfilled' && refCodeRes.value) {
          const cd = refCodeRes.value.data || refCodeRes.value;
          const code = cd?.code || cd?.referralCode || cd || '';
          setReferralCode(typeof code === 'string' ? code : code?.toString() || '');
        }

        if (refStatsRes.status === 'fulfilled' && refStatsRes.value) {
          const statsData = refStatsRes.value.data || refStatsRes.value;
          setReferralStats(statsData);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load dashboard data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

   const availableBalance = walletStats?.available ?? walletData?.availableBalance ?? walletData?.balance ?? 0;
  const pendingEarnings = walletStats?.pending ?? walletData?.pendingBalance ?? 0;
  const totalEarnings = walletStats?.totalEarned ?? walletData?.totalEarned ?? 0;
  const rewardCredits = referralStats?.totalEarnings || 0;
  const totalReferrals = (referralStats?.directReferrals || 0) + (referralStats?.indirectReferrals || 0);
  const directReferrals = referralStats?.directReferrals || 0;
  const activeReferrals = referralStats?.activeReferrals || 0;
  const currentRank = rank?.name || rank?.rank || 'Bronze';
  const nextRankName = nextRank?.name || 'Silver';
  const teamSize = totalReferrals;
  const monthlyEarnings = walletStats?.totalEarned ?? totalEarnings;
  const lifetimeEarnings = walletStats?.totalEarned ?? totalEarnings;

  const copyTradingData = {
    winRate: '72.4%',
    monthlyROI: '+8.3%',
    riskLevel: 'Medium',
    masterAccounts: 3,
  };

  const isActive = user?.subscription?.status === 'active' || user?.subscriptionStatus === 'active';

  return (
    <div className="space-y-6">
      {/* Navigation Grid */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {navSections.map((section, si) => {
            const SectionIcon = section.icon;
            return (
              <div key={section.title} className="bg-white rounded-2xl border border-dark-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-dark-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${section.bgColor} flex items-center justify-center ${section.color}`}>
                      <SectionIcon size={18} />
                    </div>
                    <h3 className="text-sm font-bold text-ink">{section.title}</h3>
                  </div>
                </div>
                <div className="p-2">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.link}
                        onClick={item.danger ? logout : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          item.danger ? 'text-red-500 hover:bg-red-50' : 'text-dark-600 hover:text-ink hover:bg-dark-50'
                        }`}
                      >
                        <ItemIcon size={16} className="shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        <FiChevronRight size={12} className="text-dark-300" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">Wallet Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Wallet Balance',
              value: formatCurrency(availableBalance),
              icon: FiCreditCard,
              color: 'from-blue-500 to-blue-700',
              textColor: 'text-blue-600',
              bgColor: 'bg-blue-50',
            },
            {
              label: 'Reward Credits',
              value: formatCurrency(rewardCredits),
              icon: FiGift,
              color: 'from-amber-500 to-orange-600',
              textColor: 'text-amber-600',
              bgColor: 'bg-amber-50',
            },
            {
              label: 'Affiliate Earnings',
              value: formatCurrency(todayEarnings),
              icon: FiTrendingUp,
              color: 'from-emerald-500 to-emerald-700',
              textColor: 'text-emerald-600',
              bgColor: 'bg-emerald-50',
            },
            {
              label: 'Pending Earnings',
              value: formatCurrency(pendingEarnings),
              icon: FiClock,
              color: 'from-violet-500 to-violet-700',
              textColor: 'text-violet-600',
              bgColor: 'bg-violet-50',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white to-transparent rounded-bl-full" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                        <Icon size={18} />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-dark-500 mb-1">{stat.label}</p>
                    <p className={`text-xl font-extrabold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Affiliate Dashboard + Available Balance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Affiliate Dashboard</h3>
          <Link to="/student/referrals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            View All <FiArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Current Rank', value: currentRank, icon: FiAward, color: 'from-amber-400 to-amber-600', iconColor: 'text-amber-500', bgColor: 'bg-amber-50' },
            { label: 'Next Rank', value: nextRankName, icon: FiStar, color: 'from-gray-400 to-gray-600', iconColor: 'text-gray-500', bgColor: 'bg-gray-50' },
            { label: 'Direct Referrals', value: directReferrals, icon: FiUserPlus, color: 'from-blue-400 to-blue-600', iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
            { label: 'Team Size', value: teamSize, icon: FiUsers, color: 'from-violet-400 to-violet-600', iconColor: 'text-violet-500', bgColor: 'bg-violet-50' },
            { label: "Today's Earnings", value: formatCurrency(todayEarnings), icon: FiTrendingUp, color: 'from-emerald-400 to-emerald-600', iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' },
            { label: 'Monthly Earnings', value: formatCurrency(monthlyEarnings), icon: FiBarChart2, color: 'from-cyan-400 to-cyan-600', iconColor: 'text-cyan-500', bgColor: 'bg-cyan-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-dark-500">{stat.label}</p>
                  <p className="text-lg font-extrabold text-ink">{stat.value}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Available Balance highlight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-primary-500 to-emerald-500 text-white border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-widest mb-1">Available Balance</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{formatCurrency(availableBalance)}</p>
              <p className="text-xs text-white/60 mt-1">Pending: {formatCurrency(pendingEarnings)}</p>
            </div>
            <div className="flex gap-2">
              <Link to="/student/wallet">
                <Button variant="white" size="sm">View Wallet</Button>
              </Link>
              <Link to="/student/withdrawals">
                <Button variant="outline-white" size="sm">Withdraw</Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Copy Trading */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Copy Trading</h3>
          <Link to="/student/copy-trading" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            Manage <FiArrowRight size={12} />
          </Link>
        </div>
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-dark-50 to-dark-100 border-dark-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white text-lg font-bold">
                  <FiGlobe size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-dark-500">Master Accounts</p>
                  <p className="text-2xl font-extrabold text-ink">{copyTradingData.masterAccounts}</p>
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-4">Follow experienced traders and earn commissions on copied trades.</p>
              <Link to="/student/copy-trading">
                <Button className="w-full sm:w-auto">Copy Now</Button>
              </Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                <span className="text-xs font-medium text-dark-500">Win Rate</span>
                <span className="text-sm font-bold text-emerald-600">{copyTradingData.winRate}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                <span className="text-xs font-medium text-dark-500">Monthly ROI</span>
                <span className="text-sm font-bold text-emerald-600">{copyTradingData.monthlyROI}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/60">
                <span className="text-xs font-medium text-dark-500">Risk Level</span>
                <Badge variant={copyTradingData.riskLevel === 'Medium' ? 'warning' : 'success'}>{copyTradingData.riskLevel}</Badge>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* System Flow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-4">
        <Card className="p-5">
          <SystemFlow compact />
        </Card>
      </motion.div>
    </div>
  );
}