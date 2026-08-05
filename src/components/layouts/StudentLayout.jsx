import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiLayout, FiBookOpen, FiTrendingUp, FiCopy, FiPieChart, FiDollarSign, FiLink2, FiAward, FiFileText, FiImage, FiBell, FiMessageSquare, FiSettings, FiLogOut, FiX, FiCreditCard, FiClock, FiUsers, FiPercent, FiHome, FiBarChart2, FiUnlock, FiTrendingDown, FiVideo, FiChevronDown, FiChevronRight, FiChevronUp, FiBook, FiTag, FiMonitor } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getInitials } from '../../utils/helpers';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationBell from '../NotificationBell';
import BrandLogo from '../shared/BrandLogo';

const sidebarSections = [
  {
    id: 'main',
    title: 'Main',
    icon: FiHome,
    items: [
      { path: '/student/dashboard', label: 'Dashboard', icon: FiLayout },
    ],
  },
  {
    id: 'learning',
    title: 'Learning',
    icon: FiBook,
    items: [
      { path: '/student/classes/physical', label: 'Physical Classes', icon: FiVideo },
      { path: '/student/classes/online', label: 'Online Classes', icon: FiMonitor },
      { path: '/student/classes/schedule', label: 'Class Schedule', icon: FiClock },
      { path: '/student/study-material', label: 'Study Material', icon: FiBookOpen },
      { path: '/student/recordings', label: 'Recordings', icon: FiFileText },
      { path: '/student/signals', label: 'Signals', icon: FiTrendingUp },
      { path: '/student/copy-trading', label: 'Copy Trading', icon: FiCopy },
      { path: '/student/certificates', label: 'Certificates', icon: FiFileText },
      { path: '/student/gallery', label: 'Gallery', icon: FiImage },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: FiDollarSign,
    items: [
      { path: '/student/wallet', label: 'Wallet', icon: FiDollarSign },
      { path: '/student/transactions', label: 'Transactions', icon: FiClock },
      { path: '/student/earnings', label: 'Earnings', icon: FiTrendingDown },
      { path: '/student/profit-share', label: 'Profit Share', icon: FiPercent },
      { path: '/student/withdrawals', label: 'Withdrawals', icon: FiDollarSign },
    ],
  },
  {
    id: 'network',
    title: 'Network',
    icon: FiTag,
    items: [
      { path: '/student/referrals', label: 'Referrals', icon: FiLink2 },
      { path: '/student/team', label: 'Team Members', icon: FiUsers },
      { path: '/student/rank', label: 'My Rank', icon: FiAward },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: FiLayout,
    items: [
      { path: '/student/subscription', label: 'Membership', icon: FiCreditCard },
      { path: '/student/activation', label: 'Activation', icon: FiUnlock },
      { path: '/student/settings', label: 'Settings', icon: FiSettings },
      { path: '/login', label: 'Logout', icon: FiLogOut, danger: true },
    ],
  },
];

const bottomNavLinks = [
  { path: '/student/dashboard', label: 'Home', icon: FiHome },
  { path: '/student/courses', label: 'Trainings', icon: FiBookOpen },
  { path: '/student/signals', label: 'Signals', icon: FiTrendingUp },
  { path: '/student/wallet', label: 'Wallet', icon: FiDollarSign },
  { path: '/student/settings', label: 'Settings', icon: FiSettings },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { getSetting } = useSettings();

  const getPageTitle = () => {
    for (const section of sidebarSections) {
      const current = section.items.find(l => pathname === l.path || pathname.startsWith(l.path + '/'));
      if (current) return current.label;
    }
    return 'Student';
  };

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isSectionActive = (section) => section.items.some(l => pathname === l.path || pathname.startsWith(l.path + '/'));

  const isItemActive = (path) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-dark-50 pb-20 lg:pb-0">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-dark-100 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-dark-100">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <BrandLogo variant="black" imgClassName="h-7" />
            <span className="font-semibold text-ink text-sm truncate">{getSetting('institute_name', '')}</span>
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
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => {
                            if (item.danger) logout();
                            setSidebarOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            itemActive
                              ? 'bg-primary-50 text-primary-600'
                              : item.danger
                              ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                              : 'text-dark-400 hover:bg-dark-50 hover:text-dark-700'
                          }`}
                        >
                          <ItemIcon size={15} className="shrink-0" />
                          {item.label}
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:ml-72 min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-dark-100">
          <div className="h-14 lg:h-16 flex items-center justify-between px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden -ml-1 p-2 rounded-xl hover:bg-dark-100 text-dark-500 transition-colors duration-200"
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
              <NotificationBell />
              <div className="flex items-center gap-3 pl-3 border-l border-dark-100">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-ink leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-dark-400">Student</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3 lg:p-6">
          <Outlet />
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-dark-100 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {bottomNavLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.path || pathname.startsWith(link.path + '/');
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
    </div>
  );
}