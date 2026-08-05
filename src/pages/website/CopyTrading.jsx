import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';

const defaultSteps = [
  { step: '1', title: 'Connect Your Trading Account', desc: 'Link your trading account securely to start mirroring trades.' },
  { step: '2', title: 'Professional Trades Are Copied', desc: 'Experienced traders execute trades that are automatically copied to your account.' },
  { step: '3', title: 'Monitor Performance', desc: 'Track every trade in real time with full transparency and history.' },
  { step: '4', title: 'Profit Sharing', desc: 'Earn your share of profits credited directly to your wallet.' },
];

const defaultBenefits = [
  { title: 'Professional Traders', desc: 'Follow verified professional traders with proven track records.' },
  { title: 'Transparent Trading History', desc: 'Every trade, every result — fully auditable. No cherry-picked screenshots, only verifiable data.' },
  { title: 'Strict Risk Management', desc: 'All copy trading is executed with proper risk management controls.' },
  { title: 'Performance Monitoring', desc: 'Monitor your portfolio performance in real time and adjust your strategy.' },
  { title: 'Beginner Friendly', desc: 'Start copy trading from day one while you build your own skills alongside the process.' },
  { title: 'Learn While Following Experts', desc: 'Observe expert trades, learn their strategies, and grow your own trading knowledge.' },
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

  useEffect(() => {
    websiteService.getContent('copy-trading')
      .then(({ data }) => {
        const content = data.data;
        if (content?.steps?.length) {
          setSteps(content.steps.map(s => ({ step: s.num || s.number, title: s.title, desc: s.desc || s.description })));
        }
        if (content?.benefits?.length) {
          setBenefits(content.benefits.map(b => ({ title: b.title, desc: b.desc || b.description })));
        }
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
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">COPY TRADING</p>
            <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold mb-5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              {visitorName ? `${visitorName}, copy professional traders` : 'Copy Professional Traders. Learn While You Earn.'}
            </h1>
            <p className="text-dark-500 text-[17px] leading-relaxed font-inter max-w-[600px] mx-auto">
              Follow experienced traders through a transparent copy trading system while continuing your Forex education. Every trade is executed with proper risk management, allowing members to observe, learn and grow with confidence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-9">
              <Link to="/register" className="btn-blue">Start Your Membership</Link>
              <a href="#how-it-works" className="btn-outline">See How It Works</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-16">
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">The Process</p>
            <h2 className="text-[24px] sm:text-[32px] lg:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>How Copy Trading Works</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Four simple steps to start mirroring the pros.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {steps.map((s, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="text-center bg-white border border-dark-100 rounded-2xl p-5 sm:p-6 shadow-card h-full">
                  <div className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mx-auto mb-3 text-base sm:text-lg font-mono">{s.step}</div>
                  <h4 className="text-[14px] sm:text-[14.5px] font-bold mb-1.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.title}</h4>
                  <p className="text-[12px] sm:text-[12.5px] text-dark-500 font-inter leading-relaxed">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-16">
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">Benefits</p>
            <h2 className="text-[24px] sm:text-[32px] lg:text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Why Copy Trading?</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">Built for every type of trader — from beginner to experienced.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map((b, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="bg-white border border-dark-100 rounded-[18px] p-6 sm:p-8 shadow-card hover:shadow-card-lg transition-shadow h-full">
                  <h3 className="text-[16px] font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{b.title}</h3>
                  <p className="text-dark-500 text-[14.5px] leading-relaxed font-inter">{b.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-[12px] sm:text-[13px] text-amber-800 font-inter"><strong>Notice:</strong> Copy Trading involves market risk. Past performance does not guarantee future results.</p>
          </div>
          <div className="text-center mt-6">
            <Link to="/register" className="btn-blue btn-lg text-sm sm:text-base px-8 py-3 sm:py-4">Ready to Start Copy Trading?</Link>
          </div>
        </div>
      </section>

      <section className="section bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-12">
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">Timeline</p>
            <h2 className="text-[24px] sm:text-[32px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Your journey to copy trading</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {['Become a Member', 'Complete Verification', 'Connect Trading Account', 'Copy Trading Activated', 'Monitor Performance', 'Profit Sharing'].map((t, i) => (
              <span key={i} className="text-[11px] sm:text-[12px] bg-white border border-dark-100 rounded-full px-3 py-1 text-dark-500 font-inter shadow-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
