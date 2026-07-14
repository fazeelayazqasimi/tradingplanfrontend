import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';

const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

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
];

const defaultCopyTradingSteps = [
  { step: '1', title: 'Institute Executes', desc: "Dream Trader's desk places trades under strict risk rules." },
  { step: '2', title: 'Students Participate', desc: 'Your allocated capital mirrors each trade proportionally.' },
  { step: '3', title: 'Profits Generated', desc: 'Results are tracked and recorded in real time.' },
  { step: '4', title: 'Profit Distributed', desc: 'Your share is credited directly to your wallet.' },
];

const defaultRanks = [
  { tier: 'LEVEL 01', name: 'D1', direct: 3, team: 5, commission: '5%' },
  { tier: 'LEVEL 02', name: 'D2', direct: 6, team: 15, commission: '8%' },
  { tier: 'LEVEL 03', name: 'D3', direct: 10, team: 40, commission: '11%' },
  { tier: 'LEVEL 04', name: 'D4', direct: 15, team: 90, commission: '14%' },
  { tier: 'LEVEL 05', name: 'D5', direct: 22, team: 200, commission: '18%' },
  { tier: 'LEVEL 06', name: 'D6', direct: 30, team: 450, commission: '22%' },
];

const defaultFaqs = [
  { q: 'Do I need prior trading experience?', a: 'No. The curriculum starts from market fundamentals and moves through to advanced strategy, so students of any background can follow along at their own pace.' },
  { q: 'How soon after joining can I access signals?', a: 'Once your membership is approved by our admin team, typically within one business day, signals and courses unlock immediately in your dashboard.' },
  { q: 'Is copy trading automatic?', a: 'Copy trading mirrors institute trades proportionally to your allocated capital. You can pause or adjust your allocation at any time from your dashboard.' },
  { q: 'How does the referral commission work?', a: 'You earn a percentage based on your rank, which is determined by your direct referrals and overall team size, as outlined in the rank progression table above.' },
  { q: 'Can I attend onsite training remotely?', a: 'Onsite workshops are in-person by design, but every session is followed by recorded highlights added to your online course library.' },
];

const defaultStats = [
  { num: '18,400+', lbl: 'Students Trained' },
  { num: '42', lbl: 'Countries Represented' },
  { num: '91%', lbl: 'Signal Accuracy Tracked' },
  { num: '6,200+', lbl: 'Active Community Members' },
];

const defaultPricingFeatures = [
  'Full Online Education Library',
  'Quarterly Onsite Training Access',
  'Daily Trading Signals',
  'Copy Trading Access',
  'Referral Program & Rank Progression',
  'Priority Mentor Support',
  'Resource Library & Templates',
  'Completion Certificates',
];

const defaultPricing = { price: '100', period: '/ year' };

const defaultBottomStats = [
  { num: '18,400', lbl: 'Students' },
  { num: '64', lbl: 'Courses' },
  { num: '52,000', lbl: 'Signals' },
  { num: '42', lbl: 'Countries' },
  { num: '$890K', lbl: 'Referral Payouts' },
];

function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('reveal-active'); obs.unobserve(el); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-element ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export default function Home() {
  const { visitorName, clearName } = useName();
  const faqRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroTextRef = useRef(null);
  const heroCtaRef = useRef(null);
  const heroRatesRef = useRef(null);
  const heroImageRef = useRef(null);
  const [ranks, setRanks] = useState(defaultRanks);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [stats, setStats] = useState(defaultStats);
  const [pricingFeatures, setPricingFeatures] = useState(defaultPricingFeatures);
  const [pricing, setPricing] = useState(defaultPricing);
  const [bottomStats, setBottomStats] = useState(defaultBottomStats);
  const [goldPrice, setGoldPrice] = useState('2,394.10');
  const [goldChange, setGoldChange] = useState('+0.35%');

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(heroTitleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 })
      .fromTo(heroTextRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo(heroCtaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .fromTo(heroRatesRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .fromTo(heroImageRef.current, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.9 }, '-=0.6');

    const i = setInterval(() => {
      const base = 2385 + Math.random() * 20;
      setGoldPrice(base.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
      setGoldChange(`${Math.random() > 0.5 ? '+' : '-'}${(Math.random() * 0.8 + 0.1).toFixed(2)}%`);
    }, 5000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ranksRes, faqsRes, homeContentRes] = await Promise.all([
          websiteService.getRanks().catch(() => null),
          websiteService.getFAQs().catch(() => null),
          websiteService.getContent('home').catch(() => null),
        ]);

        if (ranksRes?.data?.data) {
          const mapped = ranksRes.data.data.map((r, i) => ({
            tier: `LEVEL ${String(i + 1).padStart(2, '0')}`,
            name: r.name,
            direct: r.minReferrals,
            team: r.minRevenue,
            commission: `${r.commissionPercent}%`,
          }));
          if (mapped.length) setRanks(mapped);
        }

        if (faqsRes?.data?.data) {
          const mapped = faqsRes.data.data.map(f => ({ q: f.question, a: f.answer }));
          if (mapped.length) setFaqs(mapped);
        }

        if (homeContentRes?.data?.data) {
          const content = homeContentRes.data.data;
          if (content.stats?.length) {
            setStats(content.stats.map(s => ({ num: s.value, lbl: s.label })));
            setBottomStats(content.stats.map(s => ({ num: s.value, lbl: s.label })));
          }
          if (content.pricing_features?.length) {
            setPricingFeatures(content.pricing_features.map(f => typeof f === 'string' ? f : f.text || f.label));
          }
          if (content.pricing?.length) {
            const p = content.pricing[0];
            if (p) setPricing({ price: p.price || p.value || '100', period: p.period || '/ year' });
          }
        }
      } catch (err) {}
    };
    fetchData();
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
    <div>
      <style>{`
        .reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>

      {/* HERO */}
      <section className="pt-[140px] sm:pt-[180px] pb-[60px] sm:pb-[100px] relative overflow-hidden" style={{ background: 'radial-gradient(600px 300px at 85% 10%, rgba(37,99,235,0.06), transparent 60%), radial-gradient(500px 260px at 100% 60%, rgba(16,185,129,0.05), transparent 60%)' }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow mb-6">Trading Institute</p>
            <h1 ref={heroTitleRef} className="text-[32px] sm:text-[44px] lg:text-[56px] leading-[1.06] font-extrabold text-ink mb-6" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '-0.02em' }}>
              {visitorName ? (
                <>Hello {visitorName}. <span className="text-primary-500">Be a trader.</span></>
              ) : (
                <>Master the markets. <span className="text-primary-500">Trade with confidence.</span></>
              )}
            </h1>
            <p ref={heroTextRef} className="text-lg leading-[1.65] text-dark-500 max-w-[480px] mb-9 font-inter">
              {visitorName ? (
                <>Welcome, {visitorName}! Your journey to financial freedom starts here. Structured trading education, live signals, and a guided path built by professional traders.</>
              ) : (
                <>Structured trading education, live signals, and a guided path from your first lesson to your first funded strategy - built by professional traders, not marketers.</>
              )}
            </p>
            <div ref={heroCtaRef} className="flex gap-3.5 mb-12 flex-wrap">
              <Link to="/register" className="btn-blue btn-lg">Join Now</Link>
              <Link to="/courses" className="btn-outline btn-lg">Explore Courses</Link>
              <Link to="/calculators" className="btn-outline btn-lg">Free Tools</Link>
            </div>
            <div ref={heroRatesRef} className="flex gap-4 border-t border-dark-100 pt-5 font-mono text-[13px] text-dark-500 flex-wrap">
              <span>EUR/USD <b className="text-ink font-semibold">1.0842</b> <span className="text-emerald-500">+0.12%</span></span>
              <span>XAU/USD <b className="text-ink font-semibold">{goldPrice}</b> <span className={goldChange.includes('+') ? 'text-emerald-500' : 'text-red-500'}>{goldChange}</span></span>
              <span>US30 <b className="text-ink font-semibold">39,281</b> <span className="text-emerald-500">+0.34%</span></span>
              <span>BTC/USD <b className="text-ink font-semibold">61,204</b> <span className="text-emerald-500">+1.02%</span></span>
            </div>
          </div>

          <div ref={heroImageRef} className="relative perspective-[1200px]">
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

      {/* TRUSTED BY */}
      <section className="py-14 border-y border-dark-100 bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="text-[34px] font-extrabold text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.num}</div>
                <div className="text-[13px] text-dark-500 mt-1">{s.lbl}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-12 sm:mb-16">
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>One membership. Every tool you need to trade.</h2>
            <p className="text-dark-500 text-[15px] sm:text-[16.5px] leading-relaxed font-inter">From your first lesson to your first copied trade, everything lives inside a single Dream Trader membership.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-[22px]">
            {defaultFeatures.map((f, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-white border border-dark-100 rounded-[18px] p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-md hover:border-primary-200 h-full">
                  <div className="w-[42px] h-[42px] rounded-[11px] bg-primary-50 text-primary-500 flex items-center justify-center mb-4 text-lg">{f.icon}</div>
                  <h4 className="font-bold text-[16.5px] mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{f.title}</h4>
                  <p className="text-[13.8px] text-dark-500 leading-relaxed font-inter">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="section">
        <div className="max-w-[920px] mx-auto px-8">
          <div className="max-w-[640px] mb-16">
            <p className="eyebrow mb-3.5">Learning Path</p>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Your path through the institute.</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Eight steps take you from registration to earning through copy trading and referrals - in order, with nothing skipped.</p>
          </div>
          <div className="relative ml-[23px]">
            <div className="absolute left-0 top-2 bottom-2 w-[1.5px] bg-dark-100" />
            {defaultTimeline.map((t, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="flex gap-[26px] pb-11 last:pb-0 relative">
                  <div className="w-[47px] h-[47px] rounded-full bg-white border-[1.5px] border-dark-200 flex items-center justify-center font-mono font-semibold text-sm flex-shrink-0 z-10 text-dark-500 transition-all duration-400">
                    {t.num}
                  </div>
                  <div>
                    <h4 className="text-[16.5px] font-bold mb-1.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{t.title}</h4>
                    <p className="text-dark-500 text-sm leading-relaxed max-w-[520px] font-inter">{t.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNALS */}
      <section className="section bg-dark-50" id="signals">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="max-w-[640px] mb-16">
            <p className="eyebrow mb-3.5">Trading Signals</p>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Every signal, fully transparent.</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Market, pair, entry, stop loss, take profit and risk level - published before execution, with status tracked live.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {defaultSignals.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white border border-dark-100 rounded-[18px] p-[22px] shadow-card font-mono">
                  <div className="flex justify-between items-center mb-4 font-sans">
                    <span className="font-bold text-lg" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.pair}</span>
                    <span className={`badge ${s.status === 'Active' ? 'badge-live' : 'badge-soon'}`}>{s.status}</span>
                  </div>
                  <div className="text-[11px] text-dark-500 uppercase tracking-wide mb-3.5 font-inter">{s.market} - {s.dir}</div>
                  <div className="flex flex-col gap-2.5 text-[13px]">
                    <div className="flex justify-between text-dark-500"><span>Entry</span><b className="text-ink font-semibold">{s.entry}</b></div>
                    <div className="flex justify-between text-dark-500"><span>Stop Loss</span><b className="text-red-500 font-semibold">{s.sl}</b></div>
                    <div className="flex justify-between text-dark-500"><span>Take Profit</span><b className="text-emerald-500 font-semibold">{s.tp}</b></div>
                    <div className="flex justify-between items-center text-dark-500">
                      <span>Risk</span>
                      <div className="flex gap-[3px]">
                        {[1, 2, 3, 4].map(r => <span key={r} className={`w-3 h-1 rounded-sm ${r <= s.risk ? 'bg-primary-500' : 'bg-dark-200'}`} />)}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* COPY TRADING */}
      <section className="section" id="copytrading">
        <div className="max-w-[1000px] mx-auto px-8">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <p className="eyebrow mb-3.5">Copy Trading</p>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Follow the institute's trades, automatically.</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">A simple, transparent flow - from execution to distribution - so you always know where your capital stands.</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            {defaultCopyTradingSteps.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100} className="flex-1">
                <div className="text-center bg-white border border-dark-100 rounded-2xl p-6 shadow-card">
                  <div className="w-[44px] h-[44px] rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3.5 text-lg font-mono">{s.step}</div>
                  <h4 className="text-[14.5px] font-bold mb-1.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.title}</h4>
                  <p className="text-[12.5px] text-dark-500 font-inter leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && <div className="hidden lg:flex justify-center text-dark-200 text-xl mt-0 mb-0 absolute" />}
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* RANKS */}
      <section className="section bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <p className="eyebrow mb-3.5">Rank Progression</p>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Six tiers. Clear requirements at every step.</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Ranks unlock as your direct referrals and team size grow - with commission percentage rising alongside.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ranks.map((r, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-white border border-dark-100 rounded-2xl p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-[5px] hover:shadow-card-md">
                  <div className="font-mono font-bold text-primary-500 text-[13px] tracking-wide">{r.tier}</div>
                  <h4 className="text-xl font-bold my-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{r.name}</h4>
                  <div className="flex justify-between text-[11.5px] text-dark-500 py-1.5 border-t border-dark-100"><span>Direct</span><b className="text-ink font-semibold">{r.direct}</b></div>
                  <div className="flex justify-between text-[11.5px] text-dark-500 py-1.5 border-t border-dark-100"><span>Team</span><b className="text-ink font-semibold">{r.team}</b></div>
                  <div className="flex justify-between text-[11.5px] text-dark-500 py-1.5 border-t border-dark-100"><span>Commission</span><b className="text-ink font-semibold">{r.commission}</b></div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <p className="eyebrow mb-3.5">Pricing</p>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>One membership. Everything included.</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">No hidden tiers, no add-ons - a single annual membership unlocks the full institute.</p>
          </div>
          <ScrollReveal>
            <div className="max-w-[460px] mx-auto bg-white border border-dark-100 rounded-[24px] p-11 shadow-card-lg text-center relative">
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-ink text-white text-[10.5px] font-bold tracking-wide px-4 py-1.5 rounded-full">MOST POPULAR</div>
              <div className="font-semibold text-[15px] text-dark-500">Annual Membership</div>
              <div className="text-[52px] font-extrabold mt-4 mb-1" style={{ fontFamily: '"Plus Jakarta Sans"' }}>${pricing.price}<span className="text-lg font-medium text-dark-500">{pricing.period}</span></div>
              <ul className="text-left flex flex-col gap-3.5 my-8">
                {pricingFeatures.map((f, i) => (
                  <li key={i} className="flex gap-2.5 items-center text-[14.5px]"><span className="text-emerald-500 font-bold">&#10003;</span> {f}</li>
                ))}
              </ul>
              <Link to="/register" className="btn-blue btn-lg w-full">Join Now</Link>
              <div className="text-[12.5px] text-dark-500 mt-4 font-inter">14-day money-back guarantee, no questions asked.</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section bg-dark-50" ref={faqRef}>
        <div className="max-w-[760px] mx-auto px-8">
          <div className="max-w-[640px] mb-16">
            <p className="eyebrow mb-3.5">FAQ</p>
            <h2 className="text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Questions, answered.</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item border-b border-dark-100">
                <div className="faq-q flex justify-between items-center py-6 cursor-pointer font-semibold text-lg gap-4" onClick={toggleFaq}>
                  <span style={{ fontFamily: '"Plus Jakarta Sans"' }}>{faq.q}</span>
                  <div className="w-[22px] h-[22px] relative flex-shrink-0">
                    <span className="absolute bg-ink rounded-[2px] transition-all duration-300" style={{ width: 14, height: 1.6, top: 10, left: 4 }} />
                    <span className="absolute bg-ink rounded-[2px] transition-all duration-300 faq-plus-vert" style={{ width: 1.6, height: 14, left: 10, top: 4 }} />
                  </div>
                </div>
                <div className="faq-answer max-h-0 overflow-hidden">
                  <p className="text-dark-500 text-[14.5px] leading-relaxed pb-6 font-inter">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="section pt-0">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="bg-ink rounded-[28px] py-10 sm:py-16 px-6 sm:px-14 grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-7 text-center">
            {bottomStats.map((s, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="text-white">
                  <div className="text-[36px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.num}</div>
                  <div className="text-[12.5px] text-dark-400 mt-1.5">{s.lbl}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section pt-0">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="rounded-[26px] border border-dark-100 py-10 sm:py-16 px-6 sm:px-16 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-10" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
          <div className="text-center sm:text-left">
            <h3 className="text-[22px] sm:text-[28px] mb-2.5 max-w-[460px]" style={{ fontFamily: '"Plus Jakarta Sans"' }}>
              {visitorName ? `${visitorName}, need help choosing the right program?` : 'Need help choosing the right program?'}
            </h3>
            <p className="text-dark-500 max-w-[420px] text-[15px] font-inter">Talk to our team about your goals and we'll point you to the right starting point.</p>
          </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/contact" className="btn-primary">Talk to Our Team</Link>
              <Link to="/pricing" className="btn-outline">View Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
