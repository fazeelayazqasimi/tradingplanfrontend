import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import studentService from '../../services/studentService';
import { formatDate } from '../../utils/helpers';
import usePagination from '../../hooks/usePagination';

const typeConfig = {
  info: { color: 'info', icon: FiInfo, label: 'Info' },
  announcement: { color: 'info', icon: FiBell, label: 'Announcement' },
  update: { color: 'success', icon: FiCheckCircle, label: 'Update' },
  warning: { color: 'warning', icon: FiAlertTriangle, label: 'Warning' },
  urgent: { color: 'danger', icon: FiAlertCircle, label: 'Urgent' },
  maintenance: { color: 'warning', icon: FiAlertTriangle, label: 'Maintenance' },
  news: { color: 'purple', icon: FiBell, label: 'News' },
};

function AnnouncementSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-4 w-24 shrink-0" />
      </div>
    </Card>
  );
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const { page, limit, goToPage } = usePagination(1, 10);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, perPage: limit, sort: '-createdAt' };
      const res = await studentService.getAnnouncements(params);
      const data = res?.data?.data || res?.data || res;
      const list = data?.announcements || data?.data || data;
      setAnnouncements(Array.isArray(list) ? list : []);
      setTotalPages(data.totalPages || data.meta?.totalPages || Math.ceil((data.total || 0) / limit) || 1);
      setTotalItems(data.total || data.meta?.total || (Array.isArray(list) ? list.length : 0));
    } catch {
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getTypeInfo = (type) => {
    const key = (type || 'announcement').toLowerCase();
    return typeConfig[key] || typeConfig.announcement;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Announcements</h1>
          <p className="mt-1 text-sm text-dark-500">
            Stay updated with the latest news and announcements
          </p>
        </div>
        {!loading && totalItems > 0 && (
          <Badge color="neutral">
            {totalItems} announcement{totalItems !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnnouncementSkeleton key={i} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="No announcements"
          description="There are no announcements at the moment. Check back later!"
        />
      ) : (
        <>
          <div className="space-y-3">
            {announcements.map((announcement, idx) => {
              const id = announcement._id || announcement.id;
              const isExpanded = expandedId === id;
              const typeInfo = getTypeInfo(announcement.type || announcement.category);
              const TypeIcon = typeInfo.icon;
              const title = announcement.title || announcement.subject || 'Announcement';
              const content = announcement.content || announcement.body || announcement.message || '';
              const date = announcement.createdAt || announcement.date || announcement.publishedAt;

              return (
                <motion.div
                  key={id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="overflow-hidden p-0">
                    <button
                      onClick={() => toggleExpand(id)}
                      className="flex w-full items-start gap-4 p-5 text-left hover:bg-dark-50/50 transition-colors"
                    >
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${
                        typeInfo.color === 'danger' ? 'bg-red-50 text-red-500' :
                        typeInfo.color === 'warning' ? 'bg-amber-50 text-amber-500' :
                        typeInfo.color === 'success' ? 'bg-emerald-50 text-emerald-500' :
                        typeInfo.color === 'purple' ? 'bg-purple-50 text-purple-500' :
                        'bg-blue-50 text-blue-500'
                      }`}>
                        <TypeIcon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge color={typeInfo.color}>{typeInfo.label}</Badge>
                          <span className="flex items-center gap-1 text-xs text-dark-400">
                            <FiClock size={12} />
                            {formatDate(date)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-ink text-sm sm:text-base leading-tight">
                          {title}
                        </h3>
                        {!isExpanded && content && (
                          <p className="mt-1 text-sm text-dark-500 line-clamp-2">
                            {content}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 mt-1">
                        {isExpanded ? (
                          <FiChevronUp size={18} className="text-dark-400" />
                        ) : (
                          <FiChevronDown size={18} className="text-dark-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-dark-100 bg-dark-50/30 px-5 py-4">
                            <div className="prose prose-sm max-w-none text-dark-600">
                              {content.split('\n').map((paragraph, pIdx) => (
                                <p key={pIdx} className="mb-2 last:mb-0">{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-dark-500">
                {totalItems} announcement{totalItems !== 1 ? 's' : ''} total
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
