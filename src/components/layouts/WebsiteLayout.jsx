import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useName } from '../../context/NameContext';
import ThemeToggle from '../ui/ThemeToggle';
import NewsletterPopup from '../website/NewsletterPopup';

const forexTicker = [
  { pair: 'EUR/USD', bid: '1.0842', chg: '+0.12%', cls: 'text-emerald-500' },
  { pair: 'GBP/USD', bid: '1.2650', chg: '-0.08%', cls: 'text-red-500' },
  { pair: 'USD/JPY', bid: '151.80', chg: '+0.25%', cls: 'text-emerald-500' },
  { pair: 'XAU/USD', bid: '2,394.10', chg: '+0.35%', cls: 'text-emerald-500' },
  { pair: 'BTC/USD', bid: '61,204', chg: '+1.02%', cls: 'text-emerald-500' },
  { pair: 'US30', bid: '39,281', chg: '+0.34%', cls: 'text-emerald-500' },
  { pair: 'USD/CHF', bid: '0.8820', chg: '-0.03%', cls: 'text-red-500' },
  { pair: 'AUD/USD', bid: '0.6520', chg: '+0.18%', cls: 'text-emerald-500' },
];

function MarqueeTicker() {
  return (
    <div className="bg-ink text-white text-[12px] font-mono overflow-hidden h-[30px] flex items-center relative z-50">
      <div className="ticker-track flex whitespace-nowrap animate-marquee">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-center gap-6 mx-4">
            {forexTicker.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="font-semibold text-dark-300">{f.pair}</span>
                <span className="text-white/90">{f.bid}</span>
                <span className={`${f.cls}`}>{f.chg}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const mainNav = [
  {
    label: 'Home', path: '/',
  },
  {
    label: 'About', path: '/about',
  },
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
    ],
  },
  {
    label: 'Referral Program', path: '/referral-program',
  },
  {
    label: 'Pricing', path: '/pricing',
  },
  {
    label: 'FAQs', path: '/faq',
  },
  {
    label: 'Contact', path: '/contact',
  },
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
      <div className="bg-white border border-dark-100 rounded-2xl shadow-card-lg p-3 w-[340px]">
        {item.children.map((child, i) => (
          <Link key={i} to={child.path} onClick={onClose}
            className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-dark-50 transition-all group">
            <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center flex-shrink-0 text-sm font-bold group-hover:bg-primary-100 transition-colors">
              {child.label[0]}
            </div>
            <div>
              <div className="font-semibold text-sm text-ink group-hover:text-primary-500 transition-colors">{child.label}</div>
              <div className="text-[12px] text-dark-400 mt-0.5">{child.desc}</div>
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
  const { visitorName } = useName();
  const isHome = pathname === '/';

  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'student' ? '/student/dashboard' : null;

  useEffect(() => { setMobileOpen(false); setOpenSubMenu(null); }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <MarqueeTicker />

      <header className="fixed top-[30px] left-0 right-0 z-40 bg-transparent transition-all duration-[400ms]" id="nav-header">
            <div className="max-w-[1240px] mx-auto px-3 sm:px-8">
          <div className="flex items-center justify-between h-[64px] sm:h-[72px] bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-dark-100/50 px-4 sm:px-6 shadow-glass mt-2">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 relative flex-shrink-0">
                <span className="absolute left-[7px] top-[16px] w-[5px] h-[8px] bg-white rounded-[1px]" />
                <span className="absolute left-[14px] top-[9px] w-[5px] h-[15px] bg-white rounded-[1px]" />
              </div>
              <span className="font-extrabold text-lg text-ink hidden sm:block" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Dream Trader</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-[14px] font-medium text-dark-500">
              {mainNav.map((item, i) => (
                <div key={i} className="relative" onMouseEnter={() => item.children && setOpenSubMenu(i)} onMouseLeave={() => item.children && setOpenSubMenu(null)}>
                  {item.children ? (
                    <button
                      className={`px-3 py-2 rounded-xl transition-colors duration-200 hover:text-ink hover:bg-dark-50 flex items-center gap-1 ${openSubMenu === i ? 'text-ink bg-dark-50' : ''}`}
                    >
                      {item.label}
                      <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 12 12"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  ) : (
                    <Link to={item.path} className={`px-3 py-2 rounded-xl transition-colors duration-200 hover:text-ink hover:bg-dark-50 ${pathname === item.path ? 'text-ink bg-dark-50' : ''}`}>
                      {item.label}
                    </Link>
                  )}
                  <SubMenu item={item} isOpen={openSubMenu === i} onClose={() => setOpenSubMenu(null)} />
                </div>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <Link to={dashboardLink} className="btn-primary btn-sm">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-dark-500 hover:text-ink px-3 py-2 transition-colors">Login</Link>
                  <Link to="/register" className="btn-blue btn-sm">Join Now</Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 rounded-[10px] border border-dark-200 bg-white flex items-center justify-center relative z-50">
              <span className="block w-[18px] h-[1.6px] bg-ink rounded-[2px] relative transition-all duration-300">
                <span className={`absolute left-0 w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'top-0 rotate-45' : 'top-[-6px]'}`} />
                <span className={`absolute left-0 w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'top-0 -rotate-45' : 'top-[6px]'}`} />
              </span>
            </button>
          </div>
        </div>

        {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/35 z-40" onClick={() => setMobileOpen(false)} />}

        <div className={`lg:hidden fixed top-0 right-0 h-full w-[78vw] max-w-[320px] bg-white shadow-[-16px_0_40px_rgba(17,24,39,0.12)] z-50 transition-transform duration-400 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} pt-[30px]`}>
          <div className="pt-[80px] px-7 pb-7 flex flex-col h-full overflow-y-auto">
            {mainNav.map((item, i) => (
              <div key={i}>
                {item.children ? (
                  <div className="py-2">
                    <div className="text-sm font-bold text-dark-400 uppercase tracking-wider mb-1.5">{item.label}</div>
                    {item.children.map((child, ci) => (
                      <Link key={ci} to={child.path} onClick={() => setMobileOpen(false)}
                        className="block py-2.5 text-base font-medium border-b border-dark-50 transition-colors hover:text-primary-500">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link to={item.path} onClick={() => setMobileOpen(false)}
                    className={`block py-3 text-base font-medium border-b border-dark-100 transition-colors ${pathname === item.path ? 'text-primary-500' : 'text-ink'}`}>
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              {user ? (
                <Link to={dashboardLink} onClick={() => setMobileOpen(false)} className="btn-primary justify-center">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline justify-center">Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-blue justify-center">Join Now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-[102px]"><Outlet /></main>

      <NewsletterPopup />

      <footer className="bg-dark-50 border-t border-dark-100 pt-20 pb-8 mt-16">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-14">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2.5 mb-3.5">
                <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 relative flex-shrink-0">
                  <span className="absolute left-[7px] top-[16px] w-[5px] h-[8px] bg-white rounded-[1px]" />
                  <span className="absolute left-[14px] top-[9px] w-[5px] h-[15px] bg-white rounded-[1px]" />
                </div>
                <span className="font-extrabold text-white" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Dream Trader</span>
              </Link>
              <p className="text-[13.8px] text-dark-500 max-w-[260px] leading-relaxed">Professional trading education, signals and community for serious students of the market.</p>
              <div className="flex gap-3 mt-5">
                {['in', 'X', 'yt', 'ig'].map(s => (
                  <a key={s} href="#" className="w-[34px] h-[34px] rounded-[9px] bg-white border border-dark-200 flex items-center justify-center text-xs font-medium text-dark-500 hover:text-primary-500 hover:border-primary-200 transition-colors">{s}</a>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">COMPANY</h5>
              <Link to="/about" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">About</Link>
              <Link to="/contact" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Careers</Link>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">EDUCATION</h5>
              <Link to="/courses" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Online Education</Link>
              <Link to="/onsite-training" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Onsite Training</Link>
              <Link to="/trading-signals" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Trading Signals</Link>
              <Link to="/copy-trading" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Copy Trading</Link>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">TOOLS</h5>
              <Link to="/calculators" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Trading Calculators</Link>
              <Link to="/tools" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Market Tools</Link>
              <Link to="/referral-program" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Referral Program</Link>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">SUPPORT</h5>
              <Link to="/contact" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Contact</Link>
              <Link to="/faq" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">FAQs</Link>
              <Link to="/privacy" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Privacy</Link>
              <Link to="/terms" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Terms</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-7 border-t border-dark-100 text-[13px] text-dark-500 gap-2.5">
            <span>&copy; {new Date().getFullYear()} Dream Trader Trading Institute. All rights reserved.</span>
            <span>Trading involves risk. Past performance is not indicative of future results.</span>
          </div>
        </div>
      </footer>
      <ThemeToggle />
    </div>
  );
}
