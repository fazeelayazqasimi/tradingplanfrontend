import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiLayout, FiUsers, FiCreditCard, FiBookOpen, FiTrendingUp, FiBell, FiLink2, FiAward, FiDollarSign, FiSettings, FiLogOut, FiMessageSquare, FiHelpCircle, FiFileText, FiEdit, FiBarChart2, FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import adminService from '../../services/adminService';
import ThemeToggle from '../ui/ThemeToggle';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const sidebarLinks = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: FiLayout },
  { path: '/admin/students', label: 'Students', icon: FiUsers },
  { path: '/admin/subscriptions', label: 'Subscriptions', icon: FiCreditCard },
  { path: '/admin/courses', label: 'Courses', icon: FiBookOpen },
  { path: '/admin/assignments', label: 'Assignments', icon: FiEdit },
  { path: '/admin/quizzes', label: 'Quizzes', icon: FiHelpCircle },
  { path: '/admin/signals', label: 'Signals', icon: FiTrendingUp },
  { path: '/admin/announcements', label: 'Announcements', icon: FiBell },
  { path: '/admin/referrals', label: 'Referrals', icon: FiLink2 },
  { path: '/admin/ranks', label: 'Ranks', icon: FiAward },
  { path: '/admin/withdrawals', label: 'Withdrawals', icon: FiDollarSign },
  { path: '/admin/wallets', label: 'Wallets', icon: FiDollarSign },
  { path: '/admin/certificates', label: 'Certificates', icon: FiFileText },
  { path: '/admin/support', label: 'Support', icon: FiMessageSquare },
  { path: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
  { path: '/admin/content', label: 'Website Content', icon: FiLayout },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

const bottomNavLinks = [
  { path: '/admin/dashboard', label: 'Home', icon: FiHome },
  { path: '/admin/students', label: 'Students', icon: FiUsers },
  { path: '/admin/courses', label: 'Courses', icon: FiBookOpen },
  { path: '/admin/signals', label: 'Signals', icon: FiTrendingUp },
  { path: '/admin/settings', label: 'Settings', icon: FiSettings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingList, setPendingList] = useState([]);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const prevCountRef = useRef(0);
  const notifiedRef = useRef(false);
  const hasShownModalRef = useRef(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const [countRes, listRes] = await Promise.allSettled([
          adminService.getPendingPurchaseCount(),
          adminService.getCoursePurchases({ status: 'pending', limit: 10, page: 1 }),
        ]);
        let count = 0;
        if (countRes.status === 'fulfilled') count = countRes.value?.data?.count ?? 0;
        setPendingCount(count);

        if (listRes.status === 'fulfilled') {
          const list = listRes.value?.data || [];
          setPendingList(list);
        }

        if (count > prevCountRef.current && prevCountRef.current > 0) {
          toast(`${count} pending purchase request${count > 1 ? 's' : ''}! Go to Subscriptions to approve.`, { icon: '🛒', duration: 6000 });
          if (Notification.permission === 'granted') {
            new Notification('New Purchase Request', { body: `${count} pending purchase request${count > 1 ? 's' : ''}` });
          }
        }
        prevCountRef.current = count;
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pendingCount > 0 && !hasShownModalRef.current) {
      const timer = setTimeout(() => {
        setPendingModalOpen(true);
        hasShownModalRef.current = true;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingCount]);

  const getPageTitle = () => {
    const current = sidebarLinks.find(l => l.path === pathname);
    return current?.label || 'Admin';
  };

  return (
    <div className="min-h-screen bg-dark-50 font-inter pb-20 lg:pb-0">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-dark-100 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center shrink-0">
              <div className="flex flex-col gap-[3px]">
                <div className="w-3.5 h-[2px] bg-white rounded-full" />
                <div className="w-2.5 h-[2px] bg-white/70 rounded-full" />
                <div className="w-3.5 h-[2px] bg-white rounded-full" />
              </div>
            </div>
            <div>
              <span className="font-bold text-ink text-sm tracking-tight">Dream Trader</span>
              <p className="text-[10px] text-dark-400 uppercase tracking-widest">Admin</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-dark-100 text-dark-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100%-8rem)] scrollbar-thin">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.path;
            const showBadge = link.path === '/admin/subscriptions' && pendingCount > 0;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-dark-500 hover:bg-dark-50 hover:text-dark-700'
                }`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-colors duration-200 ${
                    active
                      ? 'text-primary-500'
                      : 'text-dark-400 group-hover:text-dark-600'
                  }`}
                />
                <span className="flex-1">{link.label}</span>
                {showBadge && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[11px] font-bold text-white leading-none">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-dark-100 bg-white">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-500 hover:bg-red-50 hover:text-red-600 w-full transition-all duration-200"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-dark-100">
          <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden -ml-1 p-2 rounded-xl hover:bg-dark-100 text-dark-600 transition-colors duration-200"
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>

            <h1 className="lg:hidden text-base font-bold text-ink truncate">
              {getPageTitle()}
            </h1>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-3 pl-3 border-l border-dark-100">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary-500 flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-ink leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-dark-400">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-dark-100 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors duration-200 min-w-0 ${
                  active ? 'text-primary-600' : 'text-dark-400'
                }`}
              >
                <Icon size={active ? 22 : 20} />
                <span className={`text-[10px] font-semibold ${active ? 'text-primary-600' : 'text-dark-400'}`}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ThemeToggle />

      <Modal
        isOpen={pendingModalOpen}
        onClose={() => setPendingModalOpen(false)}
        title="Pending Purchase Requests"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-dark-500">
            {pendingList.length} student{pendingList.length > 1 ? 's have' : ' has'} requested course access.
          </p>
          <div className="max-h-72 overflow-y-auto space-y-3">
            {pendingList.slice(0, 10).map((p) => (
              <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-dark-50 border border-dark-100">
                <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {((p.userId?.firstName?.[0] || p.student?.firstName?.[0] || '?')).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">
                    {p.userId?.firstName ? `${p.userId.firstName} ${p.userId.lastName}` : p.student?.firstName ? `${p.student.firstName} ${p.student.lastName}` : 'Unknown'}
                  </p>
                  <p className="text-xs text-dark-500 truncate">
                    {p.courseId?.title || 'Course'} — {p.broker === 'dma' ? 'DMA' : 'StarTrading'}
                  </p>
                </div>
                <span className="text-xs font-semibold text-ink">${p.amount}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Link to="/admin/subscriptions" onClick={() => setPendingModalOpen(false)}>
              <Button variant="primary">Go to Subscriptions</Button>
            </Link>
            <Button variant="outline" onClick={() => setPendingModalOpen(false)}>Dismiss</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
