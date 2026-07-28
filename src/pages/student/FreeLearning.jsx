import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiVideo, FiRadio, FiTrendingUp, FiClock, FiUsers, FiGlobe, FiPlay, FiLock, FiArrowRight, FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiChevronUp, FiCalendar, FiTag, FiAward, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, getInitials } from '../../utils/helpers';
import webinarService from '../../services/webinarService';
import zoomSessionService from '../../services/zoomSessionService';
import marketUpdateService from '../../services/marketUpdateService';
import announcementService from '../../services/announcementService';
import courseService from '../../services/courseService';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

const categoryConfig = {
  'free-webinar': { label: 'Free Webinar', icon: FiVideo, color: 'text-blue-500', bgColor: 'bg-blue-50' },
  'premium-webinar': { label: 'Premium Webinar', icon: FiStar, color: 'text-amber-500', bgColor: 'bg-amber-50', lock: true },
  'zoom-session': { label: 'Zoom Session', icon: FiRadio, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
  'market-update': { label: 'Market Update', icon: FiTrendingUp, color: 'text-violet-500', bgColor: 'bg-violet-50' },
  'free-training': { label: 'Free Training', icon: FiBookOpen, color: 'text-green-500', bgColor: 'bg-green-50' },
  'basic-training': { label: 'Basic Training', icon: FiAward, color: 'text-primary-500', bgColor: 'bg-primary-50' },
  'basic-lesson': { label: 'Basic Lesson', icon: FiBookOpen, color: 'text-teal-500', bgColor: 'bg-teal-50' },
};

export default function FreeLearning() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [webinars, setWebinars] = useState([]);
  const [zoomSessions, setZoomSessions] = useState([]);
  const [marketUpdates, setMarketUpdates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [freeCourses, setFreeCourses] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');

  const isFreeUser = user?.subscriptionStatus !== 'active';

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        setLoading(true);
        const [webinarsRes, zoomRes, marketRes, announcementsRes, coursesRes] = await Promise.allSettled([
          webinarService.getWebinars({ isFree: true, limit: 10, sort: '-date' }),
          zoomSessionService.getZoomSessions({ category: 'free-zoom', limit: 10, sort: '-date' }),
          marketUpdateService.getMarketUpdates({ limit: 10, sort: '-createdAt' }),
          announcementService.getAnnouncements({ limit: 10, sort: '-createdAt' }),
          courseService.getCourses({ isFree: true, limit: 10, sort: '-order' }),
        ]);

        if (cancelled) return;

        if (webinarsRes.status === 'fulfilled') {
          setWebinars(webinarsRes.value?.data?.data || webinarsRes.value?.data?.webinars || []);
        }
        if (zoomRes.status === 'fulfilled') {
          setZoomSessions(zoomRes.value?.data?.data || zoomRes.value?.data?.sessions || []);
        }
        if (marketRes.status === 'fulfilled') {
          setMarketUpdates(marketRes.value?.data?.data || marketRes.value?.data?.updates || []);
        }
        if (announcementsRes.status === 'fulfilled') {
          setAnnouncements(announcementsRes.value?.data?.data || announcementsRes.value?.data?.announcements || []);
        }
        if (coursesRes.status === 'fulfilled') {
          setFreeCourses(coursesRes.value?.data?.data || coursesRes.value?.data?.courses || []);
        }
      } catch {
        if (!cancelled) toast.error('Failed to load free learning content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const allContent = [
    ...webinars.map(w => ({ ...w, contentType: 'webinar', type: 'free-webinar' })),
    ...zoomSessions.map(z => ({ ...z, contentType: 'zoomSession', type: 'zoom-session' })),
    ...marketUpdates.map(m => ({ ...m, contentType: 'marketUpdate', type: m.category })),
    ...announcements.map(a => ({ ...a, contentType: 'announcement', type: a.type })),
    ...freeCourses.map(c => ({ ...c, contentType: 'course', type: 'basic-training' })),
  ].sort((a, b) => {
    const aDate = a.date || a.createdAt || '';
    const bDate = b.date || b.createdAt || '';
    return new Date(bDate) - new Date(aDate);
  });

  const filteredContent = allContent.filter(item => {
    if (activeTab !== 'all' && item.type !== activeTab) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory && item.category !== 'free-webinar' && item.category !== 'free-zoom') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (item.title || '').toLowerCase().includes(q) || (item.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  const stats = {
    totalWebinars: webinars.length,
    totalZoomSessions: zoomSessions.length,
    totalMarketUpdates: marketUpdates.length,
    totalAnnouncements: announcements.length,
    totalFreeCourses: freeCourses.length,
  };

  const getContentBadge = (item) => {
    const config = categoryConfig[item.type] || {};
    const label = config.label || item.type || 'Content';
    const colorMap = {
      'free-webinar': 'info',
      'premium-webinar': 'warning',
      'zoom-session': 'success',
      'market-update': 'info',
      'free-training': 'success',
      'basic-training': 'primary',
      'basic-lesson': 'primary',
      'general': 'neutral',
      'announcement': 'info',
    };
    return { label, color: colorMap[item.type] || 'neutral', lock: config.lock || false, icon: config.icon };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">Free Learning</h1>
            <p className="text-sm text-dark-500 mt-1">Access free webinars, zoom sessions, and training resources</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-dark-100 rounded-[18px] p-5">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-3 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Free Learning</h1>
          <p className="text-sm text-dark-500 mt-1">
            {isFreeUser ? 'Access free webinars, zoom sessions, and training resources' : 'All free learning content is available to you'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-dark-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', count: allContent.length },
          { key: 'webinars', label: 'Webinars', count: webinars.length, icon: FiVideo },
          { key: 'zoom-sessions', label: 'Zoom Sessions', count: zoomSessions.length, icon: FiRadio },
          { key: 'market-updates', label: 'Market Updates', count: marketUpdates.length, icon: FiTrendingUp },
          { key: 'announcements', label: 'Announcements', count: announcements.length, icon: FiGlobe },
          { key: 'courses', label: 'Basic Training', count: freeCourses.length, icon: FiBookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-600 shadow-sm'
                  : 'text-dark-500 hover:bg-dark-50 hover:text-dark-700'
              }`}
            >
              {Icon && <Icon size={14} />}
              {tab.label}
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold leading-none ${
                active ? 'bg-primary-500 text-white' : 'bg-dark-100 text-dark-500'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Free Webinars', value: stats.totalWebinars, icon: FiVideo, color: 'from-blue-500 to-blue-700', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
          { label: 'Zoom Sessions', value: stats.totalZoomSessions, icon: FiRadio, color: 'from-emerald-500 to-emerald-700', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
          { label: 'Market Updates', value: stats.totalMarketUpdates, icon: FiTrendingUp, color: 'from-violet-500 to-violet-700', bgColor: 'bg-violet-50', textColor: 'text-violet-600' },
          { label: 'Free Courses', value: stats.totalFreeCourses, icon: FiBookOpen, color: 'from-teal-500 to-teal-700', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shrink-0`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs font-medium text-dark-500">{stat.label}</p>
                <p className="text-lg font-extrabold text-ink">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredContent.length === 0 ? (
        <EmptyState
          icon={FiBookOpen}
          title="No content available"
          description="No free learning content matches your current filters. Check back later for new content."
        />
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}
        >
          {filteredContent.map((item) => {
            const badge = getContentBadge(item);
            const Icon = badge.icon || FiFileText;
            const isLocked = badge.lock && isFreeUser;
            const isWebinar = item.contentType === 'webinar';
            const isZoom = item.contentType === 'zoomSession';
            const isCourse = item.contentType === 'course';
            const eventDate = item.date || item.publishedAt || item.createdAt;
            const eventTime = item.duration || 60;
            const isUpcoming = isWebinar || isZoom ? new Date(eventDate) > new Date() : true;

            return (
              <motion.div key={item._id} variants={item}>
                <Card className={`p-5 relative overflow-hidden ${isLocked ? 'opacity-75' : ''}`}>
                  {item.thumbnail && (
                    <div className="relative h-32 rounded-xl overflow-hidden mb-4 bg-dark-100">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${badge.color === 'info' ? 'bg-blue-500 text-white' : badge.color === 'success' ? 'bg-emerald-500 text-white' : badge.color === 'warning' ? 'bg-amber-500 text-white' : badge.color === 'primary' ? 'bg-primary-500 text-white' : 'bg-dark-500 text-white'}`}>
                          {badge.label}
                        </span>
                      </div>
                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <FiLock size={20} className="text-dark-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isUpcoming ? 'bg-emerald-500' : 'bg-dark-300'}`} />
                      <span className="text-xs font-medium text-dark-500">
                        {isUpcoming ? 'Upcoming' : 'Recorded'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-ink line-clamp-2 leading-snug">{item.title}</h3>
                    {item.summary && (
                      <p className="text-xs text-dark-500 line-clamp-2">{item.summary}</p>
                    )}
                    {item.instructorName && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-bold">
                          {getInitials(item.instructorName)}
                        </div>
                        <span className="text-xs text-dark-500">{item.instructorName}</span>
                      </div>
                    )}
                    {eventDate && (
                      <div className="flex items-center gap-2 text-xs text-dark-400">
                        <FiCalendar size={12} />
                        <span>{formatDate(eventDate)}</span>
                        {isWebinar && <span className="text-dark-300">|</span>}
                        {isWebinar && <span className="flex items-center gap-1"><FiClock size={12} /> {eventTime} min</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      {isLocked ? (
                        <Link to="/student/subscription">
                          <Button variant="primary" size="sm" className="w-full">
                            Upgrade to Unlock
                          </Button>
                        </Link>
                      ) : (
                        <Link to={isCourse ? `/student/courses/${item.slug || item._id}` : '#'} className="w-full">
                          <Button variant="primary" size="sm" className="w-full">
                            {isCourse ? 'Enroll Now' : isZoom ? 'Join Session' : isWebinar ? 'Register' : 'View Details'}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}