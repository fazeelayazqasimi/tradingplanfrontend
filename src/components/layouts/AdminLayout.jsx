import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiLayout, FiUsers, FiCreditCard, FiBookOpen, FiTrendingUp, FiBell, FiLink2, FiAward, FiDollarSign, FiSettings, FiLogOut, FiMessageSquare, FiHelpCircle, FiFileText, FiEdit, FiBarChart2, FiHome, FiLayers, FiDownload, FiTag, FiServer, FiImage, FiVideo, FiRadio, FiCalendar, FiChevronDown, FiChevronUp, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getInitials } from '../../utils/helpers';
import adminService from '../../services/adminService';
import ThemeToggle from '../ui/ThemeToggle';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import BrandLogo from '../shared/BrandLogo';
import toast from 'react-hot-toast';

const sidebarSections = [
  {
    id: 'main',
    title: 'Main',
    icon: FiHome,
    items: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: FiLayout },
      { path: '/admin/students', label: 'Students', icon: FiUsers },
      { path: '/admin/crm', label: 'Student CRM', icon: FiUsers },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    icon: FiBookOpen,
    items: [
      { path: '/admin/courses', label: 'Courses', icon: FiBookOpen },
      { path: '/admin/signals', label: 'Signals', icon: FiTrendingUp },
      { path: '/admin/webinars', label: 'Webinars', icon: FiVideo },
      { path: '/admin/zoom-sessions', label: 'Zoom Sessions', icon: FiRadio },
      { path: '/admin/classes', label: 'Classes', icon: FiVideo },
      { path: '/admin/assignments', label: 'Assignments', icon: FiEdit },
      { path: '/admin/quizzes', label: 'Quizzes', icon: FiHelpCircle },
      { path: '/admin/certificates', label: 'Certificates', icon: FiFileText },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: FiDollarSign,
    items: [
      { path: '/admin/subscriptions', label: 'Subscriptions', icon: FiCreditCard },
      { path: '/admin/deposits', label: 'Deposits', icon: FiDownload },
      { path: '/admin/withdrawals', label: 'Withdrawals', icon: FiDollarSign },
      { path: '/admin/wallets', label: 'Wallets', icon: FiDollarSign },
      { path: '/admin/payment-accounts', label: 'Payment Accounts', icon: FiLayers },
      { path: '/admin/coupons', label: 'Coupons & PINs', icon: FiTag },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    icon: FiImage,
    items: [
      { path: '/admin/media', label: 'Media Library', icon: FiImage },
      { path: '/admin/announcements', label: 'Announcements', icon: FiBell },
      { path: '/admin/whatsapp-clicks', label: 'WhatsApp Clicks', icon: FiMessageCircle },
      { path: '/admin/business-profiles', label: 'Business Profiles', icon: FiFileText },
      { path: '/admin/content', label: 'Website Content', icon: FiLayout },
      { path: '/admin/market-updates', label: 'Market Updates', icon: FiCalendar },
      { path: '/admin/brokers', label: 'Trading Brokers', icon: FiServer },
    ],
  },
  {
    id: 'network',
    title: 'Network',
    icon: FiLink2,
    items: [
      { path: '/admin/referrals', label: 'Referrals', icon: FiLink2 },
      { path: '/admin/ranks', label: 'Ranks', icon: FiAward },
      { path: '/admin/market-overview', label: 'Market Overview', icon: FiTrendingUp },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: FiMessageSquare,
    items: [
      { path: '/admin/chats', label: 'Student Chats', icon: FiMessageCircle },
      { path: '/admin/support', label: 'Support Tickets', icon: FiMessageSquare },
      { path: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: FiSettings,
    items: [
      { path: '/admin/settings', label: 'Settings', icon: FiSettings },
    ],
  },
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
  const [openSections, setOpenSections] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingList, setPendingList] = useState([]);
  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { getSetting } = useSettings();
  const prevCountRef = useRef(0);
  const hasShownModalRef = useRef(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const [countRes, listRes, depositRes] = await Promise.allSettled([
          adminService.getPendingPurchaseCount(),
          adminService.getCoursePurchases({ status: 'pending', limit: 10, page: 1 }),
          adminService.getAllDeposits({ status: 'pending', perPage: 1 }),
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

        const depositData = depositRes.value;
        if (depositRes.status === 'fulfilled') {
          setPendingDeposits(depositData?.pagination?.total || 0);
        }
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
    for (const section of sidebarSections) {
      const current = section.items.find(l => pathname === l.path || pathname.startsWith(l.path + '/'));
      if (current) return current.label;
    }
    return 'Admin';
  };

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isSectionActive = (section) => section.items.some(l => pathname === l.path || pathname.startsWith(l.path + '/'));

  const isItemActive = (path) => pathname === path || pathname.startsWith(path + '/');

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
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <BrandLogo variant="black" imgClassName="h-7" />
            <div className="min-w-0">
              <span className="font-bold text-ink text-sm tracking-tight block truncate">{getSetting('institute_name', 'Admin')}</span>
              <p className="text-[10px] text-dark-400 uppercase tracking-widest">Admin</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-dark-100 text-dark-500 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100%-8rem)] scrollbar-thin">
          {sidebarSections.map((section) => {
            const SectionIcon = section.icon;
            const open = openSections[section.id];
            const active = isSectionActive(section);
            return (
              <div key={section.id} className="space-y-0.5">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-dark-500 hover:bg-dark-50 hover:text-dark-700'
                  }`}
                >
                  <SectionIcon size={18} className="shrink-0" />
                  <span className="flex-1 text-left">{section.title}</span>
                  {open ? <FiChevronUp size={14} className="shrink-0" /> : <FiChevronDown size={14} className="shrink-0" />}
                </button>
                {open && (
                  <div className="ml-6 space-y-0.5">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const itemActive = isItemActive(item.path);
                      const showBadge = (item.path === '/admin/subscriptions' && pendingCount > 0) || (item.path === '/admin/deposits' && pendingDeposits > 0);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            itemActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-dark-400 hover:bg-dark-50 hover:text-dark-700'
                          }`}
                        >
                          <ItemIcon size={15} className="shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {showBadge && (
                            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-[11px] font-bold text-white leading-none">
                              {item.path === '/admin/subscriptions' ? (pendingCount > 99 ? '99+' : pendingCount) : (pendingDeposits > 99 ? '99+' : pendingDeposits)}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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

            <div className="flex items-center gap-2 min-w-0 lg:hidden">
              <img src="/favicon.jpg" alt="" className="w-6 h-6 rounded-md object-contain shrink-0" />
              <h1 className="text-base font-bold text-ink truncate">
                {getPageTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <div className="flex items-center gap-3 pl-3 border-l border-dark-100">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-primary-500 flex items-center justify-center text-black text-xs font-bold shadow-sm shrink-0">
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
                <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-black text-xs font-bold shrink-0">
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
