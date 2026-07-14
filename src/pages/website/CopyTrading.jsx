import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';

const defaultSteps = [
  { num: '01', title: 'Choose a Trader', desc: 'Browse verified trader profiles with transparent track records, risk scores, and historical performance data.' },
  { num: '02', title: 'Set Your Risk', desc: 'Customize your risk parameters — choose how much to allocate per trade and set stop-loss limits.' },
  { num: '03', title: 'Auto-Execute', desc: 'Once configured, trades are copied automatically to your account in real-time with zero manual input.' },
  { num: '04', title: 'Track & Optimize', desc: 'Monitor your portfolio performance in real-time and adjust your strategy as you learn.' },
];

const defaultBenefits = [
  { title: 'No Experience Needed', desc: 'Start copy trading from day one while you build your own skills alongside the process.' },
  { title: 'Diversify Automatically', desc: 'Mirror multiple traders simultaneously to spread risk across different strategies and markets.' },
  { title: 'Full Control Over Risk', desc: 'Set your own position sizes, stop-losses, and maximum exposure — you are always in charge.' },
  { title: 'Transparent Track Record', desc: 'Every trade, every result — fully auditable. No cherry-picked screenshots, only verifiable data.' },
  { title: 'Start with Any Amount', desc: 'No minimums or hidden thresholds. Begin with what you are comfortable with and scale over time.' },
  { title: 'Cancel Anytime', desc: 'No lock-in contracts. Disconnect from any trader instantly with a single click.' },
];

const defaultStats = [
  { num: '8,500+', lbl: 'Active Copiers' },
  { num: '$12M+', lbl: 'Volume Copied' },
  { num: '68%', lbl: 'Avg Annual Return' },
  { num: '30+', lbl: 'Top Traders' },
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

export default function CopyTrading() {
  const { visitorName } = useName();
  const [steps, setSteps] = useState(defaultSteps);
  const [benefits, setBenefits] = useState(defaultBenefits);
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    websiteService.getContent('copy-trading')
      .then(({ data }) => {
        const content = data.data;
        if (content?.steps?.length) {
          setSteps(content.steps.map(s => ({ num: s.num || s.number, title: s.title, desc: s.desc || s.description })));
        }
        if (content?.benefits?.length) {
          setBenefits(content.benefits.map(b => ({ title: b.title, desc: b.desc || b.description })));
        }
        if (content?.stats?.length) {
          setStats(content.stats.map(s => ({ num: s.value, lbl: s.label })));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <style>{`
        .reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }
        .ct-step-line { position: relative; }
        .ct-step-line::after { content: ''; position: absolute; top: 28px; right: -100%; width: 100%; height: 2px; background: #E2E8F0; }
        .ct-step-line:last-child::after { display: none; }
      `}</style>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-[1240px] mx-auto px-8 text-center">
          <ScrollReveal>
            <p className="eyebrow mb-3.5">Copy Trading</p>
            <h1 className="text-[44px] font-extrabold mb-5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              {visitorName ? `${visitorName}, start automated copy trading` : 'Automated Copy Trading'}
            </h1>
            <p className="text-dark-500 text-[17px] leading-relaxed font-inter max-w-[600px] mx-auto">
              Mirror the moves of proven professional traders and let their expertise work for your portfolio — fully automated, fully transparent.
            </p>
            <div className="flex justify-center gap-3 mt-9">
              <Link to="/register" className="btn-blue">Get Started Free</Link>
              <a href="#how-it-works" className="btn-outline">See How It Works</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Visual Band */}
      <section className="pb-16">
        <div className="max-w-[1240px] mx-auto px-8">
          <ScrollReveal>
            <div className="rounded-[22px] overflow-hidden h-[220px] relative shadow-card-lg" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0B1220 100%)' }}>
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              <div className="absolute bottom-0 left-0 right-0 h-[100px] flex items-end px-8 gap-1.5 pb-0">
                {[55,70,40,85,50,65,30,90,45,75,60,35,80,48,72,58,38,92,42,88,68,52,78,44].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t-[2px]" style={{ height: `${h}%`, background: [0,2,5,7,9,12,14,17,19,21,23].includes(i) ? '#10B981' : i % 3 === 0 ? '#F87171' : '#3B82F6', opacity: 0.85 }} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="section">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <p className="eyebrow mb-3.5">The Process</p>
            <h2 className="text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>How Copy Trading Works</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Four simple steps to start mirroring the pros.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center text-lg font-extrabold mx-auto mb-5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{step.num}</div>
                  <h3 className="text-[17px] font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{step.title}</h3>
                  <p className="text-dark-500 text-[14.5px] leading-relaxed font-inter">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <p className="eyebrow mb-3.5">Why Copy Trading</p>
            <h2 className="text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Built for every type of trader</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Whether you are just starting out or looking to diversify — copy trading gives you the edge.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {benefits.map((b, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-white border border-dark-100 rounded-[18px] p-8 shadow-card hover:shadow-card-lg transition-shadow h-full">
                  <div className="w-10 h-10 rounded-[10px] bg-primary-50 text-primary-500 flex items-center justify-center text-sm font-bold mb-4" style={{ fontFamily: '"Plus Jakarta Sans"' }}>&#10003;</div>
                  <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{b.title}</h3>
                  <p className="text-dark-500 text-[14.5px] leading-relaxed font-inter">{b.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="rounded-[26px] border border-dark-100 py-14 px-12" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="text-[36px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.num}</div>
                  <div className="text-[13.5px] text-dark-500 mt-1 font-inter">{s.lbl}</div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="rounded-[26px] border border-dark-100 py-16 px-16 flex flex-col md:flex-row justify-between items-center gap-10" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
            <div>
              <h3 className="text-[28px] mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Start Copy Trading Today</h3>
              <p className="text-dark-500 text-[15px] font-inter">Join thousands of traders who are growing their portfolios with automated copy trading.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link to="/register" className="btn-blue">Join Now</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
