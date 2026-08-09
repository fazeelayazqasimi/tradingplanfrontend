import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useName } from '../../context/NameContext';
import { useSettings } from '../../context/SettingsContext';
import ThemeToggle from '../ui/ThemeToggle';
import NewsletterPopup from '../website/NewsletterPopup';
import NotificationBell from '../NotificationBell';
import BrandLogo from '../shared/BrandLogo';
import LiveRatesMarquee from '../shared/LiveRatesMarquee';

const mainNav = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  {
    label: 'Education', path: '#',
    children: [
      { label: 'Online Education', path: '/courses', desc: 'Video courses, PDFs, quizzes & certificates' },
      { label: 'Onsite Training', path: '/onsite-training', desc: 'In-person workshops with senior mentors' },
    ],
  },
  {
    label: 'Trading', path: '#',
    children: [
      { label: 'Trading Signals', path: '/trading-signals', desc: 'Daily entries with full risk context' },
      { label: 'Copy Trading', path: '/copy-trading', desc: 'Mirror institute trades automatically' },
    ],
  },
  {
    label: 'Tools', path: '#',
    children: [
      { label: 'Calculators', path: '/calculators', desc: 'Position size, risk, margin & more' },
      { label: 'Market Tools', path: '/tools', desc: 'Economic calendar, heat map, charts' },
      { label: 'Brokers', path: '/brokers', desc: 'Trusted broker partners & registration' },
    ],
  },
  { label: 'Affiliate Program', path: '/referral-program' },
  { label: 'Membership', path: '/pricing' },
  { label: 'FAQs', path: '/faq' },
  { label: 'Contact', path: '/contact' },
];

function SubMenu({ item, isOpen, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    if (isOpen) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isOpen, onClose]);
  if (!item.children) return null;
  return (
    <div ref={ref} className={`absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-200 ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
      <div className="bg-white border border-dark-100 rounded-2xl shadow-card-lg p-3 w-[300px] sm:w-[340px]">
        {item.children.map((child, i) => (
          <Link key={i} to={child.path} onClick={onClose}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-dark-50 transition-all group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-primary-100 transition-colors">
              {child.label[0]}
            </div>
            <div>
              <div className="font-semibold text-sm text-ink group-hover:text-primary-500 transition-colors">{child.label}</div>
              <div className="text-[11px] sm:text-[12px] text-dark-400 mt-0.5">{child.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function WebsiteLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { getSetting } = useSettings();
  const instituteName = getSetting('institute_name', '');
  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'student' ? '/student/dashboard' : null;
  useEffect(() => { setMobileOpen(false); setOpenSubMenu(null); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <LiveRatesMarquee />
      <header className="fixed top-[26px] sm:top-[30px] left-0 right-0 z-40 bg-transparent transition-all duration-[400ms]" id="nav-header">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-8">
          <div className="flex items-center justify-between h-[60px] sm:h-[72px] bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-dark-100/50 px-3 sm:px-6 shadow-glass mt-2">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <BrandLogo variant="black" imgClassName="h-[30px] sm:h-[34px]" />
            </Link>
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[13px] xl:text-[14px] font-medium text-dark-500">
              {mainNav.map((item, i) => (
                <div key={i} className="relative" onMouseEnter={() => item.children && setOpenSubMenu(i)} onMouseLeave={() => item.children && setOpenSubMenu(null)}>
                  {item.children ? (
                    <button className={`px-2 xl:px-3 py-2 rounded-xl transition-colors duration-200 hover:text-ink hover:bg-dark-50 flex items-center gap-0.5 ${openSubMenu === i ? 'text-ink bg-dark-50' : ''}`}>
                      {item.label}
                      <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  ) : (
                    <Link to={item.path} className={`px-2 xl:px-3 py-2 rounded-xl transition-colors duration-200 hover:text-ink hover:bg-dark-50 ${pathname === item.path ? 'text-ink bg-dark-50' : ''}`}>{item.label}</Link>
                  )}
                  <SubMenu item={item} isOpen={openSubMenu === i} onClose={() => setOpenSubMenu(null)} />
                </div>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <NotificationBell />
                  <Link to={dashboardLink} className="btn-primary btn-sm text-[12px] px-3 py-1.5">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-[13px] font-medium text-dark-500 hover:text-ink px-2 py-1.5 transition-colors">Login</Link>
                  <Link to="/register" className="btn-blue btn-sm text-[12px] px-3 py-1.5">Join Now</Link>
                </>
              )}
            </div>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] border border-dark-200 bg-white flex items-center justify-center relative z-50">
              <span className="block w-[16px] sm:w-[18px] h-[1.6px] bg-ink rounded-[2px] relative transition-all duration-300">
                <span className={`absolute left-0 w-[16px] sm:w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'top-0 rotate-45' : 'top-[-6px]'}`} />
                <span className={`absolute left-0 w-[16px] sm:w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'top-0 -rotate-45' : 'top-[6px]'}`} />
              </span>
            </button>
          </div>
        </div>
        {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/35 z-40" onClick={() => setMobileOpen(false)} />}
        <div className={`lg:hidden fixed top-0 right-0 h-full w-[80vw] max-w-[320px] bg-white shadow-[-16px_0_40px_rgba(17,24,39,0.12)] z-50 transition-transform duration-400 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} pt-[26px] sm:pt-[30px]`}>
          <div className="pt-[70px] sm:pt-[80px] px-5 sm:px-7 pb-7 flex flex-col h-full overflow-y-auto">
            {mainNav.map((item, i) => (
              <div key={i}>
                {item.children ? (
                  <div className="py-1.5">
                    <div className="text-[12px] font-bold text-dark-400 uppercase tracking-wider mb-1">{item.label}</div>
                    {item.children.map((child, ci) => (
                      <Link key={ci} to={child.path} onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm font-medium border-b border-dark-50 transition-colors hover:text-primary-500">{child.label}</Link>
                    ))}
                  </div>
                ) : (
                  <Link to={item.path} onClick={() => setMobileOpen(false)}
                    className={`block py-2.5 text-sm font-medium border-b border-dark-100 transition-colors ${pathname === item.path ? 'text-primary-500' : 'text-ink'}`}>{item.label}</Link>
                )}
              </div>
            ))}
            <div className="mt-5 flex flex-col gap-2.5">
              {user ? (
                <>
                  <NotificationBell />
                  <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="btn-primary justify-center text-sm">Dashboard</Link>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline justify-center text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-blue justify-center text-sm">Join Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-[96px] sm:pt-[110px]"><Outlet /></main>
      <NewsletterPopup />
      <footer className="bg-dark-900 text-white border-t border-dark-800 pt-14 sm:pt-20 pb-6 sm:pb-8 mt-12 sm:mt-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-14">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-3">
                <BrandLogo variant="white" showName imgClassName="h-[30px] sm:h-[34px]" nameClassName="text-base text-white" />
              </Link>
              <p className="text-[13px] sm:text-[13.8px] text-white/55 max-w-[260px] leading-relaxed">{getSetting('site_description', 'Professional trading education, signals and community for serious students of the market.')}</p>
              <div className="flex gap-2.5 mt-4">
                {[
                  { label: 'in', url: getSetting('social_instagram', '#') },
                  { label: 'X', url: getSetting('social_twitter', '#') },
                  { label: 'yt', url: getSetting('social_youtube', '#') },
                  { label: 'tg', url: getSetting('social_telegram', '#') },
                ].map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="w-[32px] h-[32px] rounded-[9px] bg-white/5 border border-white/15 flex items-center justify-center text-[11px] font-medium text-white/70 hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/10 transition-colors">{s.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-white/40 mb-3 tracking-wide">COMPANY</h5>
              <Link to="/about" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">About</Link>
              <Link to="/contact" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Careers</Link>
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-white/40 mb-3 tracking-wide">EDUCATION</h5>
              <Link to="/courses" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Online Education</Link>
              <Link to="/onsite-training" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Onsite Training</Link>
              <Link to="/trading-signals" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Trading Signals</Link>
              <Link to="/copy-trading" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Copy Trading</Link>
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-white/40 mb-3 tracking-wide">TOOLS</h5>
              <Link to="/calculators" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Trading Calculators</Link>
              <Link to="/tools" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Market Tools</Link>
              <Link to="/referral-program" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Affiliate Program</Link>
              <Link to="/brokers" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Brokers</Link>
            </div>
            <div>
              <h5 className="text-[12px] font-bold text-white/40 mb-3 tracking-wide">SUPPORT</h5>
              <Link to="/contact" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Contact</Link>
              <Link to="/faq" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">FAQs</Link>
              <Link to="/privacy" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Privacy</Link>
              <Link to="/terms" className="block text-[13px] text-white/70 hover:text-primary-500 mb-2 transition-colors">Terms</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 sm:pt-7 border-t border-white/10 text-[12px] text-white/40 gap-2">
            <span>&copy; {new Date().getFullYear()} {instituteName || 'Trading Academy'}. All rights reserved.</span>
            <span className="text-center sm:text-right">Trading involves risk. Past performance is not indicative of future results.</span>
          </div>
        </div>
      </footer>
      <ThemeToggle />
    </div>
  );
}
