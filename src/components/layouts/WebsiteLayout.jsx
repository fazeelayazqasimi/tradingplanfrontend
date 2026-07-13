import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function WebsiteLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/courses', label: 'Education' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQs' },
    { path: '/contact', label: 'Contact' },
  ];

  const dashboardLink = user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'student' ? '/student/dashboard' : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 bg-transparent transition-all duration-[400ms]" id="nav-header">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-primary-500 to-emerald-500 relative flex-shrink-0">
                <span className="absolute left-[7px] top-[16px] w-[5px] h-[8px] bg-white rounded-[1px]" />
                <span className="absolute left-[14px] top-[9px] w-[5px] h-[15px] bg-white rounded-[1px]" />
              </div>
              <span className="font-extrabold text-lg text-ink hidden sm:block" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Dream Trader</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-[14.5px] font-medium text-dark-500">
              {navLinks.map((link) => (
                <Link key={link.path} to={link.path} className={`relative py-1.5 transition-colors duration-200 hover:text-ink ${pathname === link.path ? 'text-ink' : ''}`}>
                  {link.label}
                  {pathname === link.path && <span className="absolute left-0 bottom-0 w-full h-[1.5px] bg-primary-500" />}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <Link to={dashboardLink} className="btn-primary btn-sm">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-dark-500 hover:text-ink px-3 py-2 transition-colors">Login</Link>
                  <Link to="/register" className="btn-primary btn-sm">Join Now</Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-10 h-10 rounded-[10px] border border-dark-200 bg-white flex items-center justify-center relative z-50">
              <span className={`block w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'bg-transparent' : ''}`}>
                <span className={`absolute left-0 w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'top-0 rotate-45' : 'top-[-6px]'}`} />
                <span className={`absolute left-0 w-[18px] h-[1.6px] bg-ink rounded-[2px] transition-all duration-300 ${mobileOpen ? 'top-0 -rotate-45' : 'top-[6px]'}`} />
              </span>
            </button>
          </div>
        </div>

        {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/35 z-40" onClick={() => setMobileOpen(false)} />}

        <div className={`lg:hidden fixed top-0 right-0 h-full w-[78vw] max-w-[320px] bg-white shadow-[-16px_0_40px_rgba(17,24,39,0.12)] z-50 transition-transform duration-400 ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="pt-[100px] px-7 pb-7 flex flex-col">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)} className={`py-3.5 text-base font-medium border-b border-dark-100 transition-colors ${pathname === link.path ? 'text-primary-500' : 'text-ink'}`}>{link.label}</Link>
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

      <main className="flex-1 pt-[72px]"><Outlet /></main>

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
              <a href="#" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Careers</a>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">PROGRAMS</h5>
              <Link to="/courses" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Online Education</Link>
              <Link to="/onsite-training" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Onsite Training</Link>
              <Link to="/trading-signals" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Trading Signals</Link>
              <Link to="/copy-trading" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Copy Trading</Link>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">RESOURCES</h5>
              <Link to="/faq" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">FAQs</Link>
              <Link to="/privacy" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Privacy</Link>
              <Link to="/terms" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Terms</Link>
            </div>
            <div>
              <h5 className="text-[13px] font-bold text-dark-500 mb-4 tracking-wide">SUPPORT</h5>
              <Link to="/contact" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Contact</Link>
              <a href="#" className="block text-sm text-ink opacity-80 hover:opacity-100 hover:text-primary-500 mb-2.5 transition-colors">Help Center</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-7 border-t border-dark-100 text-[13px] text-dark-500 gap-2.5">
            <span>&copy; {new Date().getFullYear()} Dream Trader Trading Institute. All rights reserved.</span>
            <span>Terms &middot; Privacy &middot; Risk Disclosure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
