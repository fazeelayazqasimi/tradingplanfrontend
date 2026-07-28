import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiTrendingUp, FiDollarSign, FiAward, FiArrowRight, FiActivity, FiCreditCard, FiUser, FiClock, FiCheckCircle, FiCopy, FiLink, FiShield, FiUsers, FiUserPlus, FiArrowUp, FiArrowDown, FiMinus, FiTarget, FiVideo, FiRepeat, FiGift, FiFileText, FiShoppingBag, FiBarChart2, FiPieChart, FiCheck, FiZap, FiGlobe, FiStar, FiTrendingDown, FiAlertTriangle, FiLock, FiLogOut, FiSettings, FiChevronRight, FiChevronDown, FiExternalLink, FiDownload, FiCalendar, FiTag, FiInfo, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate, getInitials, copyToClipboard } from "../../utils/helpers";
import SystemFlow from "../../components/website/SystemFlow";
import studentService from "../../services/studentService";
import walletService from "../../services/walletService";
import referralService from "../../services/referralService";
import courseService from "../../services/courseService";
import signalService from "../../services/signalService";
import marketOverviewService from "../../services/marketOverviewService";
import announcementService from "../../services/announcementService";
import webinarService from "../../services/webinarService";
import zoomSessionService from "../../services/zoomSessionService";
import marketUpdateService from "../../services/marketUpdateService";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 22 } } };

const walletStatsData = [
  { label: "Wallet Balance", icon: FiCreditCard, color: "from-blue-500 to-blue-700", textColor: "text-blue-600", bgColor: "bg-blue-50" },
  { label: "Reward Credits", icon: FiGift, color: "from-amber-500 to-orange-600", textColor: "text-amber-600", bgColor: "bg-amber-50" },
  { label: "Affiliate Earnings", icon: FiTrendingUp, color: "from-emerald-500 to-emerald-700", textColor: "text-emerald-600", bgColor: "bg-emerald-50" },
  { label: "Pending Earnings", icon: FiClock, color: "from-violet-500 to-violet-700", textColor: "text-violet-600", bgColor: "bg-violet-50" },
];

const affiliateStatsData = [
  { label: "Current Rank", icon: FiAward },
  { label: "Next Rank", icon: FiStar },
  { label: "Direct Referrals", icon: FiUserPlus },
  { label: "Team Size", icon: FiUsers },
  { label: "Todays Earnings", icon: FiTrendingUp },
  { label: "Monthly Earnings", icon: FiBarChart2 },
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
  const [referralStats, setReferralStats] = useState(null);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [freeWebinars, setFreeWebinars] = useState([]);
  const [freeZoomSessions, setFreeZoomSessions] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchDashboard() {
      try {
        setLoading(true);
        const isPremium = user?.subscriptionStatus === "active";
        setIsFreeUser(!isPremium);
        const results = await Promise.allSettled([
          courseService.getEnrolled(),
          signalService.getSignals({ perPage: 5, sort: "-createdAt" }),
          walletService.getWallet("main"),
          walletService.getStats(),
          studentService.getMyRank(),
          marketOverviewService.getMarketOverview(),
          signalService.getSignals({ status: "open", isPublished: true, perPage: 1 }),
          referralService.getStats(),
          referralService.getReferralCode(),
          webinarService.getWebinars({ isFree: true, limit: 5, sort: "-date" }),
          zoomSessionService.getZoomSessions({ category: "free-zoom", limit: 5, sort: "-date" }),
          marketUpdateService.getMarketUpdates({ limit: 5, sort: "-createdAt" }),
          announcementService.getAnnouncements({ limit: 5, sort: "-createdAt" }),
          courseService.getCourses({ isFree: true, limit: 5, sort: "-order" }),
        ]);
        if (cancelled) return;
        const enrolledRes = results[0].status === "fulfilled" ? results[0].value : {};
        const enrolledBody = enrolledRes.data || {};
        const coursesList = enrolledBody.data?.courses || enrolledBody.data || [];
        setEnrolled(Array.isArray(coursesList) ? coursesList.slice(0, 3) : []);
        const signalsRes = results[1].status === "fulfilled" ? results[1].value : {};
        const signalsBody = signalsRes.data || {};
        const signalsList = signalsBody.data?.data || signalsBody.data?.signals || signalsBody.data || [];
        setSignals(Array.isArray(signalsList) ? signalsList.slice(0, 5) : []);
        if (results[2].status === "fulfilled" && results[2].value) setWalletData(results[2].value.data?.data || results[2].value.data);
        if (results[3].status === "fulfilled" && results[3].value) setWalletStats(results[3].value.data?.data || results[3].value.data);
        if (results[4].status === "fulfilled" && results[4].value) {
          const rd = results[4].value.data?.data || results[4].value.data;
          setRank(rd?.userRank?.currentRankId || null);
          setNextRank(rd?.nextRank || null);
        }
        if (results[7].status === "fulfilled" && results[7].value) setReferralStats(results[7].value.data?.data || results[7].value.data);
        const extractData = (res) => {
          if (!res?.data) return [];
          const body = res.data;
          return body.data?.data || body.data?.webinars || body.data?.sessions || body.data?.updates || body.data?.announcements || body.data?.courses || body.data || [];
        };
        if (results[9].status === "fulfilled") setFreeWebinars(Array.isArray(results[9].value?.data?.data) ? results[9].value.data.data : extractData(results[9].value));
        if (results[10].status === "fulfilled") setFreeZoomSessions(Array.isArray(results[10].value?.data?.data) ? results[10].value.data.data : extractData(results[10].value));
        if (results[11].status === "fulfilled") setMarketUpdates(Array.isArray(results[11].value?.data?.data) ? results[11].value.data.data : extractData(results[11].value));
        if (results[12].status === "fulfilled") setAnnouncements(Array.isArray(results[12].value?.data?.data) ? results[12].value.data.data : extractData(results[12].value));
        if (results[13].status === "fulfilled") setFreeCourses(Array.isArray(results[13].value?.data?.data) ? results[13].value.data.data : extractData(results[13].value));
      } catch { if (!cancelled) toast.error("Failed to load dashboard data"); }
      finally { if (!cancelled) setLoading(false); }
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
  const teamSize = totalReferrals;
  const currentRank = rank?.name || rank?.rank || "Bronze";
  const nextRankName = nextRank?.name || "Silver";

  const freeLearningContent = [...freeWebinars, ...freeZoomSessions, ...marketUpdates, ...announcements, ...freeCourses].sort((a, b) => {
    const aDate = a.date || a.publishedAt || a.createdAt || "";
    const bDate = b.date || b.publishedAt || b.createdAt || "";
    return new Date(bDate) - new Date(aDate);
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-extrabold text-ink">Loading...</h1><p className="text-sm text-dark-500 mt-1">Fetching dashboard data</p></div></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-[22px]"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-16" /></div>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Welcome, {user?.firstName || "Student"}</h1>
            <p className="text-sm text-dark-500 mt-1">{isFreeUser ? "Your account is on the free tier" : "Welcome back to your premium dashboard"}</p>
          </div>
          {isFreeUser && (
            <Link to="/student/subscription">
              <Button><FiLock size={16} className="mr-2" /> Upgrade Membership</Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Free Learning Section for Free Users */}
      {isFreeUser && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Free Learning</h3>
            <Link to="/student/free-learning" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">View All <FiArrowRight size={12} /></Link>
          </div>
          {freeLearningContent.length === 0 ? (
            <Card className="p-6 text-center"><EmptyState icon={FiBookOpen} title="No free content available yet" description="Check back later for free webinars, zoom sessions, and training resources." /></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeLearningContent.slice(0, 6).map((item) => (
                <Card key={item._id} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0"><FiBookOpen size={18} /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-bold text-ink truncate">{item.title}</p><p className="text-xs text-dark-500">{formatDate(item.date || item.createdAt)}</p></div>
                  </div>
                  <p className="text-xs text-dark-500 line-clamp-2 mb-3">{item.summary || item.description}</p>
                  <Link to="/student/free-learning"><Button variant="primary" size="sm" className="w-full">View Details</Button></Link>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-4"><Link to="/student/free-learning"><Button className="w-full sm:w-auto">Explore All Free Content</Button></Link></div>
        </motion.div>
      )}

      {/* Locked Premium Features for Free Users */}
      {isFreeUser ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Premium Features</h3>
            <Link to="/student/subscription" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">Upgrade <FiArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Signals", desc: "Live trading signals", link: "/student/signals", icon: FiTrendingUp },
              { label: "Copy Trading", desc: "Mirror expert traders", link: "/student/copy-trading", icon: FiCopy },
              { label: "Premium Training", desc: "Advanced trading courses", link: "/student/courses", icon: FiBookOpen },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.label} className="p-5 relative overflow-hidden opacity-75"><div className="absolute inset-0 bg-dark-50/50" /><div className="relative z-10 text-center py-4"><div className="w-12 h-12 rounded-2xl bg-dark-100 flex items-center justify-center mx-auto mb-3 text-dark-400"><Icon size={22} /></div><h4 className="text-sm font-bold text-ink mb-1">{feature.label}</h4><p className="text-xs text-dark-500 mb-4">{feature.desc}</p><Link to="/student/subscription"><Button variant="primary" size="sm">Upgrade to Unlock</Button></Link></div><div className="absolute top-3 right-3"><FiLock size={14} className="text-dark-300" /></div></Card>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Premium Signals</h3><Link to="/student/signals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">View All <FiArrowRight size={12} /></Link></div>
          {signals.length === 0 ? <Card className="p-6 text-center"><EmptyState icon={FiTrendingUp} title="No signals available" description="Signals will appear here once published." /></Card> :
          signals.map((signal) => (
            <Card key={signal._id} className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0"><FiTrendingUp size={18} /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink truncate">{signal.title || "Trading Signal"}</p><p className="text-xs text-dark-500">{signal.symbol || ""} {signal.side ? `(${signal.side})` : ""}</p></div><Badge variant={signal.isPublished ? "success" : "neutral"}>{signal.isPublished ? "Live" : "Draft"}</Badge></Card>
          ))}
        </motion.div>
      )}

      {/* Wallet Overview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">Wallet Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {walletStatsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-5 relative overflow-hidden"><div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white to-transparent rounded-bl-full" /><div className="relative z-10"><div className="flex items-center justify-between mb-3"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}><Icon size={18} /></div></div><p className="text-xs font-medium text-dark-500 mb-1">{stat.label}</p><p className={`text-xl font-extrabold ${stat.textColor}`}>{stat.label === "Wallet Balance" ? formatCurrency(availableBalance) : stat.label === "Reward Credits" ? formatCurrency(rewardCredits) : stat.label.includes("Affiliate") || stat.label.includes("Todays") || stat.label.includes("Monthly") ? formatCurrency(totalEarnings) : formatCurrency(pendingEarnings)}</p></div></Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Affiliate Dashboard */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Affiliate Dashboard</h3><Link to="/student/referrals" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">View All <FiArrowRight size={12} /></Link></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shrink-0"><FiAward size={18} /></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-dark-500">Current Rank</p><p className="text-lg font-extrabold text-ink">{currentRank}</p></div></Card>
          <Card className="p-4 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white shrink-0"><FiStar size={18} /></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-dark-500">Next Rank</p><p className="text-lg font-extrabold text-ink">{nextRankName}</p></div></Card>
          <Card className="p-4 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shrink-0"><FiUserPlus size={18} /></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-dark-500">Direct Referrals</p><p className="text-lg font-extrabold text-ink">{directReferrals}</p></div></Card>
          <Card className="p-4 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shrink-0"><FiUsers size={18} /></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-dark-500">Team Size</p><p className="text-lg font-extrabold text-ink">{teamSize}</p></div></Card>
          <Card className="p-4 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0"><FiTrendingUp size={18} /></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-dark-500">Todays Earnings</p><p className="text-lg font-extrabold text-ink">{formatCurrency(totalEarnings)}</p></div></Card>
          <Card className="p-4 flex items-center gap-4"><div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white shrink-0"><FiBarChart2 size={18} /></div><div className="flex-1 min-w-0"><p className="text-xs font-medium text-dark-500">Monthly Earnings</p><p className="text-lg font-extrabold text-ink">{formatCurrency(totalEarnings)}</p></div></Card>
        </div>
      </motion.div>

      {/* Available Balance Highlight */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-primary-500 to-emerald-500 text-white border-0 relative overflow-hidden"><div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" /><div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" /><div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><p className="text-sm font-medium text-white/80 uppercase tracking-widest mb-1">Available Balance</p><p className="text-3xl sm:text-4xl font-extrabold text-white">{formatCurrency(availableBalance)}</p><p className="text-xs text-white/60 mt-1">Pending: {formatCurrency(pendingEarnings)}</p></div><div className="flex gap-2"><Link to="/student/wallet"><Button variant="white" size="sm">View Wallet</Button></Link><Link to="/student/withdrawals"><Button variant="outline-white" size="sm">Withdraw</Button></Link></div></div></Card>
      </motion.div>

      {/* Copy Trading */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Copy Trading</h3><Link to="/student/copy-trading" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">Manage <FiArrowRight size={12} /></Link></div>
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-dark-50 to-dark-100 border-dark-200"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"><div className="lg:col-span-2"><div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white text-lg font-bold"><FiGlobe size={22} /></div><div><p className="text-xs font-medium text-dark-500">Master Accounts</p><p className="text-2xl font-extrabold text-ink">3</p></div></div><p className="text-sm text-dark-400 mb-4">Follow experienced traders and earn commissions on copied trades.</p><Link to="/student/copy-trading"><Button className="w-full sm:w-auto">Copy Now</Button></Link></div><div className="space-y-3"><div className="flex items-center justify-between p-3 rounded-xl bg-white/60"><span className="text-xs font-medium text-dark-500">Win Rate</span><span className="text-sm font-bold text-emerald-600">72.4%</span></div><div className="flex items-center justify-between p-3 rounded-xl bg-white/60"><span className="text-xs font-medium text-dark-500">Monthly ROI</span><span className="text-sm font-bold text-emerald-600">+8.3%</span></div><div className="flex items-center justify-between p-3 rounded-xl bg-white/60"><span className="text-xs font-medium text-dark-500">Risk Level</span><Badge variant="warning">Medium</Badge></div></div></div></Card>
      </motion.div>

      {/* System Flow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-4"><Card className="p-5"><SystemFlow compact /></Card></motion.div>
    </div>
  );
}