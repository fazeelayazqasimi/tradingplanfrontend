import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiLayout, FiBookOpen, FiTrendingUp, FiCopy, FiPieChart, FiDollarSign, FiLink2, FiAward, FiFileText, FiBell, FiMessageSquare, FiSettings, FiLogOut, FiX, FiCreditCard, FiClock, FiUsers, FiPercent, FiHome } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';
import ThemeToggle from '../ui/ThemeToggle';

const sidebarLinks = [
  { path: '/student/dashboard', label: 'Dashboard', icon: FiLayout },
  { path: '/student/courses', label: 'Courses', icon: FiBookOpen },
  { path: '/student/signals', label: 'Signals', icon: FiTrendingUp },
  { path: '/student/copy-trading', label: 'Copy Trading', icon: FiCopy },
  { path: '/student/portfolio', label: 'Portfolio', icon: FiPieChart },
  { path: '/student/wallet', label: 'Wallet', icon: FiDollarSign },
  { path: '/student/transactions', label: 'Transactions', icon: FiClock },
  { path: '/student/withdrawals', label: 'Withdrawals', icon: FiDollarSign },
  { path: '/student/subscription', label: 'Subscription', icon: FiCreditCard },
  { path: '/student/referrals', label: 'Referrals', icon: FiLink2 },
  { path: '/student/team', label: 'Team Members', icon: FiUsers },
  { path: '/student/profit-share', label: 'Profit Share', icon: FiPercent },
  { path: '/student/rank', label: 'My Rank', icon: FiAward },
  { path: '/student/certificates', label: 'Certificates', icon: FiFileText },
  { path: '/student/announcements', label: 'Announcements', icon: FiBell },
  { path: '/student/support', label: 'Support', icon: FiMessageSquare },
  { path: '/student/settings', label: 'Settings', icon: FiSettings },
];

const bottomNavLinks = [
  { path: '/student/dashboard', label: 'Home', icon: FiHome },
  { path: '/student/courses', label: 'Courses', icon: FiBookOpen },
  { path: '/student/signals', label: 'Signals', icon: FiTrendingUp },
  { path: '/student/wallet', label: 'Wallet', icon: FiDollarSign },
  { path: '/student/settings', label: 'Settings', icon: FiSettings },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const current = sidebarLinks.find(l => pathname === l.path || pathname.startsWith(l.path + '/'));
    return current?.label || 'Student';
  };

  return (
    <div className="min-h-screen bg-dark-50 pb-20 lg:pb-0">
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 flex items-center justify-center shrink-0">
              <div className="flex flex-col gap-[3px]">
                <div className="w-3.5 h-[2px] bg-white rounded-full" />
                <div className="w-2.5 h-[2px] bg-white/70 rounded-full" />
                <div className="w-3.5 h-[2px] bg-white rounded-full" />
              </div>
            </div>
            <span className="font-semibold text-ink text-sm">Dream Trader</span>
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
            const active = pathname === link.path || pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-dark-500 hover:bg-dark-50 hover:text-dark-700'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {link.label}
              </Link>
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

            <h1 className="lg:hidden text-base font-bold text-ink truncate">
              {getPageTitle()}
            </h1>

            <div className="flex items-center gap-3 ml-auto">
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
