import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';

const defaultSteps = [
  { num: '1', title: 'We Analyze', desc: 'Our team scans multiple markets 24/7 using institutional-grade technical and sentiment analysis to identify high-probability setups.' },
  { num: '2', title: 'You Receive', desc: 'Every signal arrives in real time with exact entry price, stop loss, and take profit levels — no guessing required.' },
  { num: '3', title: 'You Profit', desc: 'Follow the signal, manage your risk, and let the math work. Our disciplined approach delivers consistent results.' },
];

const defaultFeatures = [
  { title: 'Real-time Alerts', desc: 'Signals delivered instantly via Telegram, email, and in-app notifications.' },
  { title: 'Entry/SL/TP Provided', desc: 'Every trade comes with precise entry, stop loss, and multiple take-profit targets.' },
  { title: 'Multi-Asset Coverage', desc: 'Forex, crypto, indices, commodities — opportunities across all major markets.' },
  { title: 'Win Rate 75%+', desc: 'Consistently validated performance tracked transparently over thousands of signals.' },
  { title: 'Risk Management', desc: 'Each signal includes position sizing guidance to protect your capital.' },
  { title: 'No Hype, Just Data', desc: 'Data-driven analysis, not clickbait. Every signal has a clear rationale.' },
];

const defaultStats = [
  { num: '52,000+', lbl: 'Signals Delivered' },
  { num: '75%+', lbl: 'Win Rate' },
  { num: '10,000+', lbl: 'Active Traders' },
  { num: '24/7', lbl: 'Market Coverage' },
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

export default function TradingSignals() {
  const { visitorName } = useName();
  const [content, setContent] = useState({ steps: defaultSteps, features: defaultFeatures, stats: defaultStats });

  useEffect(() => {
    websiteService.getContent('trading-signals')
      .then(({ data }) => {
        const c = data.data;
        if (!c) return;
        setContent(prev => ({
          steps: c.steps?.length ? c.steps.map(s => ({ num: s.num, title: s.title, desc: s.desc })) : prev.steps,
          features: c.features?.length ? c.features.map(f => ({ title: f.title, desc: f.desc })) : prev.features,
          stats: c.stats?.length ? c.stats.map(s => ({ num: s.value, lbl: s.label })) : prev.stats,
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <style>{`
        .reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>

      <section className="pt-24 pb-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="eyebrow mb-4">Trading Signals</p>
            <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-extrabold mb-5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              {visitorName ? `${visitorName}, get professional trading signals` : 'Professional Trading Signals'}
            </h1>
            <p className="text-dark-500 text-[17px] leading-relaxed font-inter max-w-[640px] mx-auto">
              Real-time, data-driven market signals delivered by professional analysts. Precise entries, managed risk, and transparent performance — everything you need to trade with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link to="/register" className="btn-blue">Start Trading Now</Link>
              <Link to="/about" className="btn-outline">Learn More</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <p className="eyebrow mb-3">How It Works</p>
              <h2 className="text-[24px] sm:text-[32px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
                Three steps to smarter trading
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-10">
            {content.steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-[22px] font-extrabold text-white" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                    {step.num}
                  </div>
                  <h3 className="text-[20px] font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{step.title}</h3>
                  <p className="text-dark-500 text-[15px] leading-relaxed font-inter">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'linear-gradient(180deg, #F8FAFC, #FFFFFF)' }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-10 sm:mb-14">
              <p className="eyebrow mb-3">Why Our Signals</p>
              <h2 className="text-[24px] sm:text-[32px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
                Built for serious traders
              </h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {content.features.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="rounded-[16px] border border-dark-100 bg-white p-7 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-[28px] h-[28px] rounded-[8px] bg-emerald-50 text-emerald-500 flex items-center justify-center text-sm font-bold mb-4">&#10003;</div>
                  <h4 className="text-[16.5px] font-bold mb-1.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{feat.title}</h4>
                  <p className="text-dark-500 text-[14.5px] leading-relaxed font-inter">{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-b border-dark-100">
            {content.stats.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="text-center">
                  <div className="text-[24px] sm:text-[34px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.num}</div>
                  <div className="text-[13.5px] text-dark-500 mt-1 font-inter">{s.lbl}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="rounded-[26px] border border-dark-100 py-10 sm:py-16 px-6 sm:px-16 text-center" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
              <h3 className="text-[22px] sm:text-[28px] mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Start Receiving Signals Today</h3>
              <p className="text-dark-500 text-[15px] font-inter max-w-[480px] mx-auto">Join over 10,000 traders receiving professional-grade signals daily. No experience required — just follow the plan.</p>
              <div className="mt-7">
                <Link to="/register" className="btn-blue">Subscribe Now</Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
