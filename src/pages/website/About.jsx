import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';
import { useSettings } from '../../context/SettingsContext';

const defaultFeatures = [
  { title: 'Professional Forex Education', desc: 'Structured learning through physical classroom training in Karachi and live online sessions for students across Pakistan.' },
  { title: 'Live Trading Signals', desc: 'Receive high-accuracy Forex signals with complete entry, stop loss, take profit, and risk management guidance.' },
  { title: 'Copy Trading Services', desc: 'Follow experienced traders through a transparent copy trading system while continuing your Forex education.' },
  { title: 'Affiliate Rewards', desc: 'Build your network and earn industry-leading commissions through our transparent rank-based affiliate program.' },
  { title: 'Profit Sharing', desc: 'Earn a share from the network profit pool based on your rank configuration.' },
  { title: 'Community Support', desc: 'Stay connected with our trading community for lifetime support, updates, webinars, and continuous learning.' },
];

const defaultStats = [
  { num: '300+', lbl: 'Students' },
  { num: '14', lbl: 'Courses' },
  { num: '1,000+', lbl: 'Signals' },
  { num: '5', lbl: 'Countries' },
  { num: '$5,000+', lbl: 'Payout' },
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

export default function About() {
  const { visitorName } = useName();
  const { getSetting } = useSettings();
  const [stats, setStats] = useState(defaultStats);

  useEffect(() => {
    websiteService.getContent('about')
      .then(({ data }) => {
        const content = data.data;
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
      `}</style>

      <section className="pt-20 pb-0">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-12">
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">About Us</p>
            <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-extrabold mb-3 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              {visitorName ? `Welcome, ${visitorName}.` : 'Learn. Trade Smarter. Earn Together.'}
            </h1>
          </div>
        </div>
      </section>

      <section className="py-[60px] sm:py-[80px] lg:py-[100px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[800px] mx-auto text-center mb-10 sm:mb-12">
            <p className="text-dark-500 text-[14px] sm:text-[16px] leading-relaxed font-inter">
              The 4X Hub is a complete Forex Education & Community Platform created to help individuals learn Forex trading through professional education, expert guidance, and practical market support. We are not a trading broker or exchange. Our goal is to educate, develop skilled traders, and build a strong community where members can learn, improve their trading abilities, and grow together.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {defaultFeatures.map((f, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="bg-white border border-dark-100 rounded-[18px] p-6 sm:p-7 shadow-card hover:shadow-card-md hover:border-primary-200 transition-all h-full">
                  <h4 className="font-bold text-[15px] sm:text-[16px] mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{f.title}</h4>
                  <p className="text-dark-500 text-[13px] sm:text-[14px] leading-relaxed font-inter">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[60px] sm:py-[80px] lg:py-[100px] bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-12">
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">Our Mission & Vision</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="bg-white border border-dark-100 rounded-[18px] p-6 sm:p-8 shadow-card">
                <h3 className="text-[20px] font-bold mb-3" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Mission</h3>
                <p className="text-dark-500 text-[14px] sm:text-[15px] leading-relaxed font-inter">To make quality Forex education accessible, practical, and affordable while helping individuals build real trading skills.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <div className="bg-white border border-dark-100 rounded-[18px] p-6 sm:p-8 shadow-card">
                <h3 className="text-[20px] font-bold mb-3" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Vision</h3>
                <p className="text-dark-500 text-[14px] sm:text-[15px] leading-relaxed font-inter">To become one of the most trusted Forex education communities by empowering learners with knowledge, discipline, and long-term growth opportunities.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-[60px] sm:py-[80px] lg:py-[100px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-[640px] mx-auto mb-10 sm:mb-12">
            <p className="eyebrow mb-3 text-[13px] sm:text-sm">Our Impact</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 text-center">
            {stats.map((s, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div>
                  <div className="text-[26px] sm:text-[30px] lg:text-[34px] font-extrabold text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.num}</div>
                  <div className="text-[12px] sm:text-[13px] text-dark-500 mt-0.5 sm:mt-1">{s.lbl}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[26px] border border-dark-100 py-10 sm:py-16 px-6 sm:px-16 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-10" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
            <div className="text-center sm:text-left">
              <h3 className="text-[22px] sm:text-[28px] mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Ready to start learning?</h3>
              <p className="text-dark-500 text-[15px] font-inter">Join thousands of students who are building their trading skills every day.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
              <Link to="/register" className="btn-blue text-center">Join Now</Link>
              <Link to="/courses" className="btn-outline text-center">View Courses</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
