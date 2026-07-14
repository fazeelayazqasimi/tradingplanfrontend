import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';
import { useSettings } from '../../context/SettingsContext';

gsap.registerPlugin(ScrollTrigger);

const defaultFeatures = [
  { icon: '▤', title: 'Online Education', desc: 'Self-paced video courses with notes, quizzes and completion certificates.' },
  { icon: '◎', title: 'Onsite Training', desc: 'In-person workshops led by senior mentors in select cities each quarter.' },
  { icon: '↗', title: 'Trading Signals', desc: 'Daily entries across forex, indices and metals with full risk context.' },
  { icon: '⇄', title: 'Copy Trading', desc: 'Mirror institute trades directly, with transparent profit distribution.' },
  { icon: '◈', title: 'Referral Rewards', desc: 'Earn commissions and rank up by growing your own trading network.' },
  { icon: '◐', title: 'Expert Mentorship', desc: 'Direct access to mentors for trade reviews and strategy sessions.' },
  { icon: '▣', title: 'Certificates', desc: 'Recognized completion certificates for every course you finish.' },
  { icon: '◉', title: 'Lifetime Community', desc: 'Ongoing access to the Dream Trader community, long after your course ends.' },
];

const defaultTimeline = [
  { num: 1, title: 'Register', desc: 'Create your student account with your details and trading goals.' },
  { num: 2, title: 'Purchase Membership', desc: 'Choose the annual membership to unlock the full institute.' },
  { num: 3, title: 'Admin Approval', desc: 'Our team verifies your account, typically within one business day.' },
  { num: 4, title: 'Access Courses', desc: 'Begin your structured curriculum at your own pace.' },
  { num: 5, title: 'Receive Signals', desc: 'Start receiving daily trading signals with full risk breakdowns.' },
  { num: 6, title: 'Build Referral Network', desc: 'Invite students and start growing your own team inside Dream Trader.' },
  { num: 7, title: 'Earn Commissions', desc: 'Unlock commission tiers as your referral network grows.' },
  { num: 8, title: 'Copy Trading', desc: 'Mirror institute trades directly once you\'re fully onboarded.' },
];

const defaultSignals = [
  { pair: 'EUR / USD', market: 'Forex', dir: 'Buy', entry: '1.0842', sl: '1.0798', tp: '1.0925', risk: 2, status: 'Active' },
  { pair: 'XAU / USD', market: 'Metals', dir: 'Sell', entry: '2,401.50', sl: '2,412.00', tp: '2,378.00', risk: 3, status: 'Pending' },
  { pair: 'US30', market: 'Index', dir: 'Buy', entry: '39,180', sl: '38,960', tp: '39,610', risk: 1, status: 'Active' },
  { pair: 'GBP / USD', market: 'Forex', dir: 'Buy', entry: '1.2548', sl: '1.2492', tp: '1.2630', risk: 2, status: 'Active' },
  { pair: 'BTC / USD', market: 'Crypto', dir: 'Sell', entry: '61,400', sl: '62,100', tp: '59,800', risk: 3, status: 'Pending' },
];

const defaultCopyTradingSteps = [
  { step: '1', title: 'Institute Executes', desc: "Dream Trader's desk places trades under strict risk rules." },
  { step: '2', title: 'Students Participate', desc: 'Your allocated capital mirrors each trade proportionally.' },
  { step: '3', title: 'Profits Generated', desc: 'Results are tracked and recorded in real time.' },
  { step: '4', title: 'Profit Distributed', desc: 'Your share is credited directly to your wallet.' },
];

const defaultStats = [
  { num: '18,400+', lbl: 'Students Trained' },
  { num: '42', lbl: 'Countries Represented' },
  { num: '91%', lbl: 'Signal Accuracy Tracked' },
  { num: '6,200+', lbl: 'Active Community Members' },
];

const defaultPricingFeatures = [
  'Full Online Education Library', 'Quarterly Onsite Training Access', 'Daily Trading Signals',
  'Copy Trading Access', 'Referral Program & Rank Progression', 'Priority Mentor Support',
  'Resource Library & Templates', 'Completion Certificates',
];

const defaultBottomStats = [
  { num: '18,400', lbl: 'Students' }, { num: '64', lbl: 'Courses' },
  { num: '52,000', lbl: 'Signals' }, { num: '42', lbl: 'Countries' }, { num: '$890K', lbl: 'Referral Payouts' },
];

function HorizontalScrollSection({ children, id, className = '' }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const scrollWidth = track.scrollWidth;
    if (scrollWidth <= section.offsetWidth) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        pin: true,
        start: 'top top',
        end: () => `+=${scrollWidth - section.offsetWidth}`,
        scrub: 1.2,
        invalidateOnRefresh: true,
      });

      gsap.fromTo(track, {
        x: () => section.offsetWidth - scrollWidth,
      }, {
        x: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${scrollWidth - section.offsetWidth}`,
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={sectionRef} id={id} className={`relative overflow-hidden ${className}`} style={{ minHeight: '100vh' }}>
      <div ref={trackRef} className="flex gap-5 sm:gap-6 lg:gap-8 h-full" style={{ minWidth: 'max-content', padding: '0 max(5vw, 20px)' }}>
        {children}
      </div>
    </section>
  );
}

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        delay: delay / 1000,
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

function Counter({ end, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cleanEnd = parseFloat(end.replace(/[+,$]/g, ''));
    if (isNaN(cleanEnd)) { el.textContent = end; return; }
    const ctx = gsap.context(() => {
      let obj = { val: 0 };
      gsap.to(obj, {
        val: cleanEnd, duration, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = obj.val >= 1000
            ? Math.round(obj.val).toLocaleString('en-US') + suffix
            : obj.val.toFixed(end.includes('.') ? 1 : 0) + suffix;
        },
        onComplete: () => { el.textContent = end.replace(/\+$/, '') + suffix; },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return <span ref={ref}>0</span>;
}

export default function Home() {
  const { visitorName } = useName();
  const { getSetting } = useSettings();
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const heroImgRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);

  const [ranks, setRanks] = useState(defaultStats.map((_, i) => ({ tier: `LEVEL 0${i+1}`, name: `D${i+1}`, direct: [0,3,5,8,12,20][i], team: [0,20,100,300,800,1500][i], commission: ['$30','$40','$50','$60','$65','$70'][i] })));
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [pricingFeatures, setPricingFeatures] = useState(defaultPricingFeatures);
  const [pricing, setPricing] = useState({ price: '100', period: '/ year' });
  const [goldPrice, setGoldPrice] = useState('2,394.10');
  const [goldChange, setGoldChange] = useState('+0.35%');

  const instituteName = getSetting('institute_name', 'Trading Institute');
  const siteTagline = getSetting('site_tagline', 'Master the markets. Trade with confidence.');
  const siteDescription = getSetting('site_description', '');

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const hero = heroRef.current;
    if (!hero) return;
    const title = hero.querySelector('.hero-title');
    const text = hero.querySelector('.hero-text');
    const cta = hero.querySelector('.hero-cta');
    const rates = hero.querySelector('.hero-rates');
    if (title) tl.fromTo(title, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.9 }, 0);
    if (text) tl.fromTo(text, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5');
    if (cta) tl.fromTo(cta, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.35');
    if (rates) tl.fromTo(rates, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.25');
    if (heroImgRef.current) tl.fromTo(heroImgRef.current, { opacity: 0, x: 80, rotateY: -12 }, { opacity: 1, x: 0, rotateY: -6, duration: 1 }, '-=0.7');

    const i = setInterval(() => {
      const base = 2385 + Math.random() * 20;
      setGoldPrice(base.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      setGoldChange(`${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 0.8 + 0.1).toFixed(2)}%`);
    }, 5000);
    return () => { clearInterval(i); tl.kill(); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [ranksRes, faqsRes] = await Promise.all([
          websiteService.getRanks().catch(() => null),
          websiteService.getFAQs().catch(() => null),
        ]);
        if (ranksRes?.data?.data?.length) {
          setRanks(ranksRes.data.data.map((r, i) => ({
            tier: `LEVEL ${String(i + 1).padStart(2, '0')}`, name: r.name,
            direct: r.minReferrals, team: r.minRevenue, commission: `${r.commissionPercent}%`,
          })));
        }
        if (faqsRes?.data?.data?.length) setFaqs(faqsRes.data.data.map(f => ({ q: f.question, a: f.answer })));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    ScrollTrigger.refresh();
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const toggleFaq = (e) => {
    const item = e.currentTarget.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => { if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-answer').style.maxHeight = '0'; } });
    if (isOpen) { item.classList.remove('open'); answer.style.maxHeight = '0'; }
    else { item.classList.add('open'); answer.style.maxHeight = answer.scrollHeight + 'px'; }
  };

  return (
    <div ref={mainRef}>
      {/* ===== HERO ===== */}
      <section ref={heroRef} className="pt-[130px] sm:pt-[160px] lg:pt-[200px] pb-[60px] sm:pb-[90px] lg:pb-[110px] relative overflow-hidden" style={{ background: 'radial-gradient(700px 350px at 80% 0%, rgba(37,99,235,0.07), transparent 60%), radial-gradient(600px 300px at 0% 80%, rgba(16,185,129,0.05), transparent 60%)' }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow mb-4 sm:mb-6 text-[11px] sm:text-xs">{instituteName}</p>
            <h1 className="hero-title text-[30px] sm:text-[40px] md:text-[48px] lg:text-[58px] leading-[1.06] font-extrabold text-ink mb-4 sm:mb-6" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.02em' }}>
              {visitorName ? <>Hello {visitorName}. <span className="text-primary-500">Be a trader.</span></> : <>{siteTagline.split('.')[0]}. <span className="text-primary-500">{siteTagline.split('.')[1] || 'Trade with confidence.'}</span></>}
            </h1>
            <p className="hero-text text-base sm:text-lg leading-[1.65] text-dark-500 max-w-[480px] mb-6 sm:mb-9 font-inter">
              {visitorName ? `Welcome, ${visitorName}! Your journey to financial freedom starts here.` : (siteDescription || 'Structured trading education, live signals, and a guided path — built by professional traders, not marketers.')}
            </p>
            <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-3.5 mb-8 sm:mb-12">
              <Link to="/register" className="btn-blue btn-lg text-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-[15.5px]">Join Now</Link>
              <Link to="/courses" className="btn-outline btn-lg text-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-[15.5px]">Explore Courses</Link>
              <Link to="/calculators" className="btn-outline btn-lg text-center px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-[15.5px]">Free Tools</Link>
            </div>
            <div className="hero-rates border-t border-dark-100 pt-4 sm:pt-5">
              <div className="flex gap-3 sm:gap-4 font-mono text-[11px] sm:text-[13px] text-dark-500 flex-wrap items-center mb-2">
                <span>EUR/USD <b className="text-ink font-semibold">1.0842</b> <span className="text-emerald-500">+0.12%</span></span>
                <span className="flex items-center gap-1">XAU/USD <span className="font-bold text-sm">${goldPrice}</span> <span className={`text-xs ${goldChange.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{goldChange}</span></span>
                <span>US30 <b className="text-ink font-semibold">39,281</b> <span className="text-emerald-500">+0.34%</span></span>
                <span>BTC/USD <b className="text-ink font-semibold">61,204</b> <span className="text-emerald-500">+1.02%</span></span>
              </div>
            </div>
          </div>
          <div ref={heroImgRef} className="hidden lg:block relative perspective-[1200px]">
            <div className="absolute -top-6 -left-[38px] bg-white border border-dark-100 rounded-[14px] shadow-card-md px-4 py-3 text-[13px] z-10">
              <div className="text-[11px] text-dark-500 mb-1">Learning Progress</div>
              <div className="font-bold text-[15px]">74% Complete</div>
            </div>
            <div className="bg-white border border-dark-100 rounded-[22px] shadow-card-lg p-[22px] transform" style={{ transform: 'rotateY(-6deg) rotateX(3deg)' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-[5px]">
                  <span className="w-[9px] h-[9px] rounded-full bg-dark-200 inline-block" />
                  <span className="w-[9px] h-[9px] rounded-full bg-dark-200 inline-block" />
                  <span className="w-[9px] h-[9px] rounded-full bg-dark-200 inline-block" />
                </div>
                <span className="text-xs text-dark-500">Student Dashboard</span>
              </div>
              <div className="h-[150px] rounded-[14px] bg-dark-50 border border-dark-100 overflow-hidden mb-4">
                <svg viewBox="0 0 400 150" preserveAspectRatio="none" className="w-full h-full">
                  <polyline fill="none" stroke="#2563EB" strokeWidth="2.5" points="0,110 40,95 80,100 120,70 160,80 200,55 240,60 280,35 320,45 360,20 400,30" />
                  <polyline fill="none" stroke="#10B981" strokeWidth="2" strokeOpacity="0.5" points="0,130 40,120 80,125 120,100 160,110 200,90 240,95 280,75 320,80 360,60 400,65" />
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-dark-50 border border-dark-100 rounded-[14px] p-3.5">
                  <div className="text-[11.5px] text-dark-500 font-medium">Wallet Summary</div>
                  <div className="font-mono font-semibold text-[19px] mt-1">$4,280</div>
                </div>
                <div className="bg-dark-50 border border-dark-100 rounded-[14px] p-3.5">
                  <div className="text-[11.5px] text-dark-500 font-medium">Referral Growth</div>
                  <div className="font-mono font-semibold text-[19px] mt-1">+18</div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-[30px] -right-[42px] bg-white border border-dark-100 rounded-[14px] shadow-card-md px-4 py-3 text-[13px] z-10">
              <div className="text-[11px] text-dark-500 mb-1">Active Signal</div>
              <div className="font-bold text-[15px] text-emerald-500">GBP/USD - Buy</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS COUNTER (vertical reveal) ===== */}
      <section ref={statsRef} className="py-12 sm:py-16 border-y border-dark-100 bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="text-[26px] sm:text-[30px] lg:text-[34px] font-extrabold text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
                  <Counter end={s.num} />
                </div>
                <div className="text-[12px] sm:text-[13px] text-dark-500 mt-0.5 sm:mt-1">{s.lbl}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES (horizontal scroll) ===== */}
      <HorizontalScrollSection id="features" className="py-[60px] sm:py-[80px] bg-dark-50">
        {defaultFeatures.map((f, i) => (
          <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] bg-white border border-dark-100 rounded-[18px] sm:rounded-[20px] p-6 sm:p-7 lg:p-8 shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-card-md hover:border-primary-200 flex flex-col justify-center" style={{ minHeight: '280px' }}>
            <div className="w-[40px] h-[40px] sm:w-[46px] sm:h-[46px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center mb-4 sm:mb-5 text-lg sm:text-xl">{f.icon}</div>
            <h4 className="font-bold text-[16px] sm:text-[18px] mb-2 sm:mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{f.title}</h4>
            <p className="text-[13px] sm:text-[14px] text-dark-500 leading-relaxed font-inter">{f.desc}</p>
          </div>
        ))}
      </HorizontalScrollSection>

      {/* ===== LEARNING PATH (vertical reveal) ===== */}
      <section className="py-[60px] sm:py-[80px] lg:py-[120px]">
        <div className="max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3 text-[11px] sm:text-xs">Learning Path</p>
            <h2 className="text-[24px] sm:text-[32px] lg:text-[38px] font-extrabold mb-3 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Your path through the institute.</h2>
            <p className="text-dark-500 text-[14px] sm:text-[16.5px] leading-relaxed font-inter mb-12 max-w-[600px]">Eight steps take you from registration to earning through copy trading and referrals — in order, with nothing skipped.</p>
          </Reveal>
          <div className="relative ml-[20px] sm:ml-[23px]">
            <div className="absolute left-0 top-2 bottom-2 w-[1.5px] bg-dark-100" />
            {defaultTimeline.map((t, i) => (
              <Reveal key={i} delay={i * 60}>
                <div className="flex gap-4 sm:gap-[26px] pb-8 sm:pb-11 last:pb-0 relative">
                  <div className="w-[40px] h-[40px] sm:w-[47px] sm:h-[47px] rounded-full bg-white border-[1.5px] border-dark-200 flex items-center justify-center font-mono font-semibold text-xs sm:text-sm flex-shrink-0 z-10 text-dark-500">{t.num}</div>
                  <div>
                    <h4 className="text-[15px] sm:text-[16.5px] font-bold mb-1" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{t.title}</h4>
                    <p className="text-dark-500 text-[13px] sm:text-sm leading-relaxed max-w-[520px] font-inter">{t.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SIGNALS (horizontal scroll) ===== */}
      <HorizontalScrollSection id="signals" className="py-[60px] sm:py-[80px] bg-dark-50">
        {defaultSignals.map((s, i) => (
          <div key={i} className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white border border-dark-100 rounded-[18px] sm:rounded-[20px] p-5 sm:p-[22px] shadow-card font-mono flex flex-col justify-center" style={{ minHeight: '260px' }}>
            <div className="flex justify-between items-center mb-3 sm:mb-4 font-sans">
              <span className="font-bold text-base sm:text-lg" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.pair}</span>
              <span className={`badge ${s.status === 'Active' ? 'badge-live' : 'badge-soon'}`}>{s.status}</span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-dark-500 uppercase tracking-wide mb-3 font-inter">{s.market} — {s.dir}</div>
            <div className="flex flex-col gap-2 text-[12px] sm:text-[13px]">
              <div className="flex justify-between text-dark-500"><span>Entry</span><b className="text-ink font-semibold">{s.entry}</b></div>
              <div className="flex justify-between text-dark-500"><span>Stop Loss</span><b className="text-red-500 font-semibold">{s.sl}</b></div>
              <div className="flex justify-between text-dark-500"><span>Take Profit</span><b className="text-emerald-500 font-semibold">{s.tp}</b></div>
              <div className="flex justify-between items-center text-dark-500">
                <span>Risk</span>
                <div className="flex gap-[3px]">{ [1,2,3,4].map(r => <span key={r} className={`w-3 h-1 rounded-sm ${r <= s.risk ? 'bg-primary-500' : 'bg-dark-200'}`} />)}</div>
              </div>
            </div>
          </div>
        ))}
      </HorizontalScrollSection>

      {/* ===== COPY TRADING (vertical reveal) ===== */}
      <section className="py-[60px] sm:py-[80px] lg:py-[120px]" id="copytrading">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-16">
              <p className="eyebrow mb-3 text-[11px] sm:text-xs">Copy Trading</p>
              <h2 className="text-[24px] sm:text-[32px] lg:text-[38px] font-extrabold mb-3 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Follow the institute's trades, automatically.</h2>
              <p className="text-dark-500 text-[14px] sm:text-[16.5px] leading-relaxed font-inter">A simple, transparent flow — from execution to distribution — so you always know where your capital stands.</p>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {defaultCopyTradingSteps.map((s, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="text-center bg-white border border-dark-100 rounded-2xl p-5 sm:p-6 shadow-card h-full">
                  <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3 text-base sm:text-lg font-mono">{s.step}</div>
                  <h4 className="text-[14px] sm:text-[14.5px] font-bold mb-1.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.title}</h4>
                  <p className="text-[12px] sm:text-[12.5px] text-dark-500 font-inter leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RANK PROGRESSION (horizontal scroll) ===== */}
      <HorizontalScrollSection id="ranks" className="py-[60px] sm:py-[80px] bg-dark-50">
        {ranks.map((r, i) => (
          <div key={i} className="flex-shrink-0 w-[220px] sm:w-[240px] bg-white border border-dark-100 rounded-2xl p-5 sm:p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-[6px] hover:shadow-card-md flex flex-col justify-center" style={{ minHeight: '240px' }}>
            <div className="font-mono font-bold text-primary-500 text-[11px] sm:text-[13px] tracking-wide">{r.tier}</div>
            <h4 className="text-lg sm:text-xl font-bold my-1.5 sm:my-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{r.name}</h4>
            <div className="flex justify-between text-[11px] sm:text-[11.5px] text-dark-500 py-1 sm:py-1.5 border-t border-dark-100"><span>Direct</span><b className="text-ink font-semibold">{r.direct}</b></div>
            <div className="flex justify-between text-[11px] sm:text-[11.5px] text-dark-500 py-1 sm:py-1.5 border-t border-dark-100"><span>Team</span><b className="text-ink font-semibold">{r.team.toLocaleString()}</b></div>
            <div className="flex justify-between text-[11px] sm:text-[11.5px] text-dark-500 py-1 sm:py-1.5 border-t border-dark-100"><span>Commission</span><b className="text-ink font-semibold">{r.commission}</b></div>
          </div>
        ))}
      </HorizontalScrollSection>

      {/* ===== PRICING (vertical reveal) ===== */}
      <section className="py-[60px] sm:py-[80px] lg:py-[120px]" id="pricing">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-16">
              <p className="eyebrow mb-3 text-[11px] sm:text-xs">Pricing</p>
              <h2 className="text-[24px] sm:text-[32px] lg:text-[38px] font-extrabold mb-3 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>One membership. Everything included.</h2>
              <p className="text-dark-500 text-[14px] sm:text-[16.5px] leading-relaxed font-inter">No hidden tiers, no add-ons — a single annual membership unlocks the full institute.</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="max-w-[460px] mx-auto bg-white border border-dark-100 rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-11 shadow-card-lg text-center relative">
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-ink text-white text-[10px] sm:text-[10.5px] font-bold tracking-wide px-3 sm:px-4 py-1.5 rounded-full">MOST POPULAR</div>
              <div className="font-semibold text-[14px] sm:text-[15px] text-dark-500 font-inter">Annual Membership</div>
              <div className="text-[40px] sm:text-[48px] lg:text-[52px] font-extrabold mt-3 sm:mt-4 mb-1" style={{ fontFamily: '"Plus Jakarta Sans"' }}>${pricing.price}<span className="text-base sm:text-lg font-medium text-dark-500">{pricing.period}</span></div>
              <div className="text-[12px] sm:text-sm text-dark-500 font-inter mb-2">Less than $9/month</div>
              <ul className="text-left flex flex-col gap-3 my-6 sm:my-8">
                {pricingFeatures.map((f, i) => (
                  <li key={i} className="flex gap-2 items-center text-[13px] sm:text-[14.5px] font-inter"><span className="text-emerald-500 font-bold flex-shrink-0">&#10003;</span> {f}</li>
                ))}
              </ul>
              <Link to="/register" className="btn-blue btn-lg w-full text-sm sm:text-base py-3 sm:py-3.5">Join Now</Link>
              <div className="text-[12px] sm:text-[12.5px] text-dark-500 mt-3 sm:mt-4 font-inter">14-day money-back guarantee, no questions asked.</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== FAQ (vertical reveal) ===== */}
      <section className="py-[60px] sm:py-[80px] lg:py-[120px] bg-dark-50">
        <div className="max-w-[760px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3 text-[11px] sm:text-xs">FAQ</p>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-8 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Questions, answered.</h2>
          </Reveal>
          <div>
            {(faqs.length ? faqs : [
              { q: 'Do I need prior trading experience?', a: 'No. The curriculum starts from fundamentals and moves through to advanced strategy.' },
              { q: 'How soon after joining can I access signals?', a: 'Once your membership is approved, typically within one business day, signals and courses unlock immediately.' },
              { q: 'Is copy trading automatic?', a: 'Yes. Copy trading mirrors institute trades proportionally to your allocated capital.' },
              { q: 'How does the referral commission work?', a: 'You earn a percentage based on your rank, determined by your direct referrals and team size.' },
              { q: 'Can I attend onsite training remotely?', a: 'Onsite workshops are in-person, but every session is followed by recorded highlights.' },
            ]).map((faq, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="faq-item border-b border-dark-100">
                  <div className="faq-q flex justify-between items-center py-4 sm:py-6 cursor-pointer font-semibold text-[15px] sm:text-lg gap-3 sm:gap-4" onClick={toggleFaq}>
                    <span style={{ fontFamily: '"Plus Jakarta Sans"' }}>{faq.q}</span>
                    <div className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] relative flex-shrink-0">
                      <span className="absolute bg-ink rounded-[2px] transition-all duration-300" style={{ width: 14, height: 1.6, top: '50%', left: 3, transform: 'translateY(-50%)' }} />
                      <span className="absolute bg-ink rounded-[2px] transition-all duration-300 faq-plus-vert" style={{ width: 1.6, height: 14, left: '50%', top: 3, transform: 'translateX(-50%)' }} />
                    </div>
                  </div>
                  <div className="faq-answer max-h-0 overflow-hidden">
                    <p className="text-dark-500 text-[13px] sm:text-[14.5px] leading-relaxed pb-4 sm:pb-6 font-inter">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BOTTOM STATS (vertical) ===== */}
      <section className="pt-[40px] sm:pt-[60px] lg:pt-[80px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="bg-ink rounded-[20px] sm:rounded-[28px] py-8 sm:py-12 lg:py-16 px-6 sm:px-10 lg:px-14 grid grid-cols-2 md:grid-cols-5 gap-5 sm:gap-7 text-center">
              {defaultBottomStats.map((s, i) => (
                <div key={i} className="text-white">
                  <div className="text-[26px] sm:text-[32px] lg:text-[36px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
                    <Counter end={s.num} />
                  </div>
                  <div className="text-[11px] sm:text-[12.5px] text-dark-400 mt-1">{s.lbl}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA (vertical) ===== */}
      <section className="py-[40px] sm:py-[60px] lg:py-[80px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-[20px] sm:rounded-[26px] border border-dark-100 py-8 sm:py-12 lg:py-16 px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8 lg:gap-10 text-center sm:text-left" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
              <div>
                <h3 className="text-[20px] sm:text-[24px] lg:text-[28px] mb-2 max-w-[460px]" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
                  {visitorName ? `${visitorName}, need help choosing the right program?` : 'Need help choosing the right program?'}
                </h3>
                <p className="text-dark-500 max-w-[420px] text-[13px] sm:text-[15px] font-inter">Talk to our team about your goals and we'll point you to the right starting point.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                <Link to="/contact" className="btn-primary text-center text-[13px] sm:text-sm">Talk to Our Team</Link>
                <Link to="/pricing" className="btn-outline text-center text-[13px] sm:text-sm">View Pricing</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
