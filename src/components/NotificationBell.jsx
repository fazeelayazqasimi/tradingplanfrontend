import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiClock, FiTrendingUp, FiMessageSquare, FiCalendar, FiDollarSign } from 'react-icons/fi';
import notificationService from '../services/notificationService';

const TYPE_ICONS = {
  signal: FiTrendingUp,
  announcement: FiMessageSquare,
  class: FiCalendar,
  commission: FiDollarSign,
  subscription: FiDollarSign,
  withdrawal: FiCheck,
  system: FiBell,
};

const TYPE_COLORS = {
  signal: 'text-emerald-500 bg-emerald-50',
  announcement: 'text-blue-500 bg-blue-50',
  class: 'text-purple-500 bg-purple-50',
  commission: 'text-amber-500 bg-amber-50',
  subscription: 'text-amber-500 bg-amber-50',
  withdrawal: 'text-red-500 bg-red-50',
  system: 'text-dark-500 bg-dark-50',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.data?.count || 0);
    } catch { /* ignore */ }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getNotifications({ limit: 10 });
      const d = res.data?.data;
      setNotifications(d?.notifications || []);
      setUnreadCount(d?.unreadCount ?? 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* ignore */ }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-dark-400 hover:text-ink hover:bg-dark-50 transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-white rounded-2xl border border-dark-100 shadow-elevated overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-dark-100">
            <h3 className="text-sm font-semibold text-ink">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:text-primary-600 font-medium">
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="py-8 text-center text-sm text-dark-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-dark-400">No notifications yet</div>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || FiBell;
                const colorClass = TYPE_COLORS[n.type] || 'text-dark-500 bg-dark-50';
                return (
                  <div
                    key={n._id}
                    className={`px-4 py-3 border-b border-dark-50 hover:bg-dark-25 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary-50/40' : ''}`}
                    onClick={() => !n.isRead && handleMarkRead(n._id)}
                  >
                    <Link to={n.link || '#'} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${!n.isRead ? 'font-semibold text-ink' : 'text-dark-600'}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-dark-400 mt-0.5 line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[11px] text-dark-300 mt-1">
                          <FiClock size={11} className="inline mr-0.5" />
                          {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                      )}
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
