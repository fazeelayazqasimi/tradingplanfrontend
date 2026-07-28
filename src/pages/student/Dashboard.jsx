import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen, FiTrendingUp, FiDollarSign, FiAward, FiArrowRight, FiCreditCard, FiClock, FiCheckCircle, FiCopy, FiLink, FiUsers, FiUserPlus, FiBarChart2, FiStar, FiZap, FiGlobe, FiTrendingDown, FiLock, FiGift, FiShare2, FiCheck, FiExternalLink, FiCalendar, FiMessageSquare } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, copyToClipboard } from "../../utils/helpers";
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
  { label: "Wallet Balance", icon: FiCreditCard, gradient: "from-blue-500 to-blue-700", textColor: "text-blue-600", badge: "blue" },
  { label: "Reward Credits", icon: FiGift, gradient: "from-amber-500 to-orange-600", textColor: "text-amber-600", badge: "amber" },
  { label: "Affiliate Earnings", icon: FiTrendingUp, gradient: "from-emerald-500 to-emerald-700", textColor: "text-emerald-600", badge: "emerald" },
  { label: "Pending Earnings", icon: FiClock, gradient: "from-violet-500 to-violet-700", textColor: "text-violet-600", badge: "violet" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [signals, setSignals] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [rank, setRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralStats, setReferralStats] = useState(null);
  const [referralLink, setReferralLink] = useState("");
  const [referralCopied, setReferralCopied] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [freeWebinars, setFreeWebinars] = useState([]);
  const [freeZoomSessions, setFreeZoomSessions] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [openSignalsCount, setOpenSignalsCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let mounted = true;
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
        if (!mounted || cancelled) return;
        if (results[0].status === "fulfilled") {
          const d = results[0].value.data || {};
          setEnrolled(Array.isArray(d.data?.courses || d.data) ? (d.data?.courses || d.data).slice(0, 3) : []);
        }
        if (results[1].status === "fulfilled") {
          const d = results[1].value.data || {};
          setSignals(Array.isArray(d.data?.data || d.data?.signals || d.data) ? (d.data?.data || d.data?.signals || d.data).slice(0, 5) : []);
        }
        if (results[2].status === "fulfilled" && results[2].value) setWalletData(results[2].value.data?.data || results[2].value.data);
        if (results[3].status === "fulfilled" && results[3].value) setWalletStats(results[3].value.data?.data || results[3].value.data);
        if (results[4].status === "fulfilled" && results[4].value) {
          const rd = results[4].value.data?.data || results[4].value.data;
          setRank(rd?.userRank?.currentRankId || null);
          setNextRank(rd?.nextRank || null);
        }
        if (results[5].status === "fulfilled" && results[5].value) setMarketOverview(results[5].value.data?.data || results[5].value.data);
        if (results[6].status === "fulfilled" && results[6].value) {
          const d = results[6].value.data || {};
          const list = d.data?.data || d.data?.signals || d.data || [];
          setOpenSignalsCount(Array.isArray(list) ? list.length : 0);
        }
        if (results[7].status === "fulfilled" && results[7].value) setReferralStats(results[7].value.data?.data || results[7].value.data);
        if (results[8].status === "fulfilled" && results[8].value) {
          const rd = results[8].value.data?.data || results[8].value.data;
          setReferralLink(rd?.referralLink || "");
        }
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
    return () => { mounted = false; cancelled = true; };
  }, []);

  const availableBalance = walletStats?.available ?? walletData?.availableBalance ?? walletData?.balance ?? 0;
  const pendingEarnings = walletStats?.pending ?? walletData?.pendingBalance ?? 0;
  const totalEarnings = walletStats?.totalEarned ?? walletData?.totalEarned ?? 0;
  const rewardCredits = referralStats?.totalEarnings || 0;
  const directReferrals = referralStats?.directReferrals || 0;
  const indirectReferrals = referralStats?.indirectReferrals || 0;
  const teamSize = directReferrals + indirectReferrals;
  const currentRankName = rank?.name || "Bronze";
  const nextRankName = nextRank?.name || "Silver";

  const goldTrend = marketOverview?.goldTrend || "neutral";
  const marketNews = marketOverview?.marketNews || "";
  const nextLiveClass = marketOverview?.nextLiveClassDate ? {
    date: marketOverview.nextLiveClassDate,
    time: marketOverview.nextLiveClassTime || "",
    link: marketOverview.nextLiveClassLink || "#",
  } : null;
  const dailyMarketSummary = marketOverview?.dailyMarketSummary || "";

  const trendConfig = {
    bullish: { label: "Bullish", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: FiTrendingUp },
    bearish: { label: "Bearish", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: FiTrendingDown },
    neutral: { label: "Neutral", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: FiBarChart2 },
  };
  const trend = trendConfig[goldTrend] || trendConfig.neutral;

  const freeLearningContent = [...freeWebinars, ...freeZoomSessions, ...marketUpdates, ...announcements, ...freeCourses].sort((a, b) => {
    const aDate = a.date || a.publishedAt || a.createdAt || "";
    const bDate = b.date || b.publishedAt || b.createdAt || "";
    return new Date(bDate) - new Date(aDate);
  });

  const handleCopyReferral = async () => {
    const ok = await copyToClipboard(referralLink);
    if (ok) { setReferralCopied(true); toast.success("Referral link copied!"); setTimeout(() => setReferralCopied(false), 2500); }
    else toast.error("Failed to copy");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white border border-dark-100 p-5"><Skeleton className="h-4 w-24 mb-3" /><Skeleton className="h-8 w-16" /></div>)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Big Hero Welcome */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-500 text-white p-6 sm:p-8">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-yellow-300/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FiZap size={24} className="text-yellow-300" />
                <span className="text-sm font-bold text-white/70 uppercase tracking-wider">Dashboard</span>
              </div>
              <Badge variant={isFreeUser ? "neutral" : "success"} className="text-xs">
                {isFreeUser ? "Free Member" : "Premium"}
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1">
                  Hey, {user?.firstName || "Trader"}! 👋
                </h1>
                <p className="text-white/70 text-sm sm:text-base max-w-lg">
                  {isFreeUser
                    ? "Explore free resources and upgrade to unlock premium features."
                    : "Your trading empire awaits — here's your overview."}
                </p>
              </div>
              {isFreeUser && (
                <Link to="/student/subscription">
                  <Button className="bg-white text-primary-600 hover:bg-white/90 font-bold shadow-lg">
                    <FiZap className="mr-2" /> Upgrade Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Banner: One Membership. Unlimited Opportunities. */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-5 sm:p-6">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-extrabold">One Membership. Unlimited Opportunities.</h2>
              <p className="text-white/80 text-sm mt-1">Ready to Learn, Trade & Grow Today</p>
            </div>
            <Link to={isFreeUser ? "/student/subscription" : "/student/classes"}>
              <Button className="bg-white text-purple-700 hover:bg-white/90 font-bold shadow-lg shrink-0">
                {isFreeUser ? "Get Started" : "Explore Classes"}
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Referral Rewards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="p-5 sm:p-6 relative overflow-hidden border-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
          <div className="absolute top-0 right-0 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <FiShare2 size={15} />
              </div>
              <h3 className="font-bold text-ink text-sm uppercase tracking-wider">Invite Friends — Earn $1 Reward Credit</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-dark-100 px-4 py-2.5 min-w-0">
                <FiLink size={16} className="text-dark-400 shrink-0" />
                <span className="text-sm font-medium text-ink truncate">{referralLink || "Loading..."}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleCopyReferral} className="shrink-0">
                  {referralCopied ? <><FiCheck className="mr-1.5" /> Copied</> : <><FiCopy className="mr-1.5" /> Copy Link</>}
                </Button>
                <Button variant="outline" className="shrink-0" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`Join me on The4xHub! ${referralLink}`)}`, '_blank'); }}>
                  <FiExternalLink size={16} />
                </Button>
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-dark-400">
              <span><strong className="text-ink">{directReferrals}</strong> Direct</span>
              <span><strong className="text-ink">{indirectReferrals}</strong> Indirect</span>
              <span><strong className="text-ink">{formatCurrency(totalEarnings)}</strong> Earned</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Today's Market Overview */}
      {(goldTrend || marketNews || nextLiveClass || dailyMarketSummary || openSignalsCount > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Today's Market Overview</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {goldTrend && (
              <Card className="p-4 relative overflow-hidden group">
                <div className={`absolute inset-0 ${trend.bg} opacity-40 group-hover:opacity-60 transition-opacity`} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${trend.bg} flex items-center justify-center`}>
                      <trend.icon size={16} className={trend.color} />
                    </div>
                    <span className="text-xs font-medium text-dark-500">Gold Trend</span>
                  </div>
                  <Badge className={`${trend.bg} ${trend.color} border ${trend.border}`}>{trend.label}</Badge>
                </div>
              </Card>
            )}
            {marketNews && (
              <Card className="p-4 sm:col-span-1 lg:col-span-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FiMessageSquare size={16} className="text-blue-500" />
                  </div>
                  <span className="text-xs font-medium text-dark-500">Market News</span>
                </div>
                <p className="text-xs text-dark-700 leading-relaxed line-clamp-3">{marketNews}</p>
              </Card>
            )}
            {nextLiveClass && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FiCalendar size={16} className="text-purple-500" />
                  </div>
                  <span className="text-xs font-medium text-dark-500">Next Live Class</span>
                </div>
                <p className="text-sm font-semibold text-ink">{nextLiveClass.date}</p>
                {nextLiveClass.time && <p className="text-xs text-dark-500">{nextLiveClass.time}</p>}
                {nextLiveClass.link && nextLiveClass.link !== "#" && (
                  <a href={nextLiveClass.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-500 hover:text-primary-600">
                    <FiExternalLink size={12} /> Join Class
                  </a>
                )}
              </Card>
            )}
            {openSignalsCount > 0 && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FiTrendingUp size={16} className="text-emerald-500" />
                  </div>
                  <span className="text-xs font-medium text-dark-500">Today's Signals</span>
                </div>
                <p className="text-2xl font-extrabold text-emerald-600">{openSignalsCount}</p>
                <p className="text-xs text-dark-400">open signals</p>
              </Card>
            )}
          </div>
          {dailyMarketSummary && (
            <Card className="p-4 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FiBarChart2 size={16} className="text-amber-500" />
                </div>
                <span className="text-xs font-medium text-dark-500">Daily Market Summary</span>
              </div>
              <p className="text-xs text-dark-700 leading-relaxed">{dailyMarketSummary}</p>
            </Card>
          )}
        </motion.div>
      )}

      {/* Free Learning Section for Free Users */}
      {isFreeUser && freeLearningContent.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Free Learning</h3>
            <Link to="/student/free-learning" className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">View All <FiArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeLearningContent.slice(0, 6).map((item) => {
              const typeColors = {
                webinar: "from-blue-500 to-cyan-500",
                zoom: "from-green-500 to-emerald-500",
                market: "from-amber-500 to-orange-500",
                announcement: "from-purple-500 to-pink-500",
                course: "from-primary-500 to-emerald-500",
              };
              const gradient = typeColors[item.type] || "from-primary-500 to-emerald-500";
              return (
                <Card key={item._id} className="p-4 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shrink-0`}>
                        <FiBookOpen size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink truncate">{item.title}</p>
                        <p className="text-xs text-dark-400">{item.date || item.createdAt ? new Date(item.date || item.createdAt).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                    <p className="text-xs text-dark-500 line-clamp-2 mb-3">{item.summary || item.description || ''}</p>
                    <Link to="/student/free-learning"><Button variant="outline" size="sm" className="w-full">View</Button></Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Locked Premium Features / Premium Signals */}
      {isFreeUser ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Premium Features</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Signals", desc: "Live trading signals with high win rate", icon: FiTrendingUp, gradient: "from-blue-500 to-cyan-500" },
              { label: "Copy Trading", desc: "Mirror expert traders automatically", icon: FiGlobe, gradient: "from-emerald-500 to-teal-500" },
              { label: "Premium Training", desc: "Advanced courses & mentorship", icon: FiBookOpen, gradient: "from-purple-500 to-pink-500" },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.label} className="p-5 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-[0.03]`} />
                  <div className="relative z-10 text-center py-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-3 text-white opacity-50`}>
                      <Icon size={24} />
                    </div>
                    <h4 className="text-base font-bold text-ink mb-1">{feature.label}</h4>
                    <p className="text-xs text-dark-400 mb-4">{feature.desc}</p>
                    <Link to="/student/subscription">
                      <Button variant="primary" size="sm">
                        <FiLock size={13} className="mr-1.5" /> Upgrade to Unlock
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      ) : signals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Latest Signals</h3>
            <Link to="/student/signals" className="text-xs text-primary-500 font-medium flex items-center gap-1">All Signals <FiArrowRight size={12} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {signals.slice(0, 3).map((signal) => (
              <Card key={signal._id} className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shrink-0">
                  <FiTrendingUp size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">{signal.title || "Signal"}</p>
                  <p className="text-xs text-dark-400">{signal.symbol || ""} {signal.side && `(${signal.side})`}</p>
                </div>
                <Badge variant={signal.isPublished ? "success" : "neutral"}>{signal.isPublished ? "Live" : "Draft"}</Badge>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Colorful Wallet Overview */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-3">Wallet Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {walletStatsData.map((stat) => {
            const Icon = stat.icon;
            const value = stat.label === "Wallet Balance" ? availableBalance
                        : stat.label === "Reward Credits" ? rewardCredits
                        : stat.label === "Affiliate Earnings" ? totalEarnings
                        : pendingEarnings;
            return (
              <motion.div key={stat.label} variants={item}>
                <Card className="p-5 relative overflow-hidden group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg`}>
                        <Icon size={19} />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-dark-400 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-extrabold ${stat.textColor}`}>{formatCurrency(value)}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Affiliate Dashboard */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Affiliate Dashboard</h3>
          <Link to="/student/referrals" className="text-xs text-primary-500 font-medium flex items-center gap-1">Details <FiArrowRight size={12} /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
              <FiAward size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400">Current Rank</p>
              <p className="text-xl font-extrabold text-ink">{currentRankName}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FiStar size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400">Next Rank</p>
              <p className="text-xl font-extrabold text-ink">{nextRankName}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FiUserPlus size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400">Direct Referrals</p>
              <p className="text-xl font-extrabold text-ink">{directReferrals}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FiUsers size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400">Team Size</p>
              <p className="text-xl font-extrabold text-ink">{teamSize}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FiTrendingUp size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400">Today's Earnings</p>
              <p className="text-xl font-extrabold text-ink">{formatCurrency(totalEarnings)}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white shadow-md shrink-0">
              <FiBarChart2 size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-dark-400">Monthly Earnings</p>
              <p className="text-xl font-extrabold text-ink">{formatCurrency(totalEarnings)}</p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Available Balance Highlight */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-primary-500 to-emerald-500 text-white border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-yellow-300/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80 uppercase tracking-widest mb-1">Available Balance</p>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{formatCurrency(availableBalance)}</p>
              <p className="text-xs text-white/60 mt-1">Pending: {formatCurrency(pendingEarnings)}</p>
            </div>
            <div className="flex gap-2">
              <Link to="/student/wallet"><Button variant="white" size="sm">View Wallet</Button></Link>
              <Link to="/student/withdrawals"><Button variant="outline-white" size="sm">Withdraw</Button></Link>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Copy Trading */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Copy Trading</h3>
          <Link to="/student/copy-trading" className="text-xs text-primary-500 font-medium flex items-center gap-1">Manage <FiArrowRight size={12} /></Link>
        </div>
        <Card className="p-5 sm:p-6 bg-gradient-to-br from-dark-50 to-dark-100 border-dark-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <FiGlobe size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-dark-400">Master Accounts</p>
                  <p className="text-2xl font-extrabold text-ink">3</p>
                </div>
              </div>
              <p className="text-sm text-dark-400 mb-4">Follow experienced traders and earn commissions on copied trades.</p>
              <Link to="/student/copy-trading"><Button className="w-full sm:w-auto">Copy Now</Button></Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70"><span className="text-xs font-medium text-dark-400">Win Rate</span><span className="text-sm font-bold text-emerald-600">72.4%</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70"><span className="text-xs font-medium text-dark-400">Monthly ROI</span><span className="text-sm font-bold text-emerald-600">+8.3%</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/70"><span className="text-xs font-medium text-dark-400">Risk Level</span><Badge variant="warning">Medium</Badge></div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* System Flow */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-4">
        <Card className="p-5"><SystemFlow compact /></Card>
      </motion.div>
    </div>
  );
}
