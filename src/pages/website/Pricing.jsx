import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';

const defaultFeatures = [
  'Full Online Education Library',
  'Quarterly Onsite Training Access',
  'Daily Trading Signals',
  'Copy Trading Access',
  'Referral Program & Rank Progression',
  'Priority Mentor Support',
  'Resource Library & Templates',
  'Completion Certificates',
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

export default function Pricing() {
  const { visitorName } = useName();
  const [features, setFeatures] = useState(defaultFeatures);
  const [price, setPrice] = useState('100');
  const [period, setPeriod] = useState('/ year');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, settingsRes] = await Promise.all([
          websiteService.getContent('pricing').catch(() => null),
          websiteService.getSettings().catch(() => null),
        ]);

        if (contentRes?.data?.data) {
          const content = contentRes.data.data;
          if (content.pricing_features?.length) {
            setFeatures(content.pricing_features.map(f => typeof f === 'string' ? f : f.text || f.label));
          }
          if (content.pricing?.length) {
            const p = content.pricing[0];
            if (p?.price) setPrice(String(p.price));
            if (p?.period) setPeriod(p.period);
          }
        }

        if (settingsRes?.data?.data) {
          const s = settingsRes.data.data;
          if (s.membership_price) setPrice(String(s.membership_price));
          if (s.membership_duration) setPeriod(`/ ${s.membership_duration}`);
        }
      } catch (err) {}
    };
    fetchData();
  }, []);

  return (
    <div>
      <style>{`
        .reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }
      `}</style>

      <section className="section">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="text-center max-w-[640px] mx-auto mb-16">
            <p className="eyebrow mb-3.5">Pricing</p>
            <h2 className="text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{visitorName ? `${visitorName}, one membership. Everything included.` : 'One membership. Everything included.'}</h2>
            <p className="text-dark-500 text-[16.5px] leading-relaxed font-inter">No hidden tiers, no add-ons - a single annual membership unlocks the full institute.</p>
          </div>

          <ScrollReveal>
            <div className="max-w-[460px] mx-auto bg-white border border-dark-100 rounded-[24px] p-11 shadow-card-lg text-center relative">
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-ink text-white text-[10.5px] font-bold tracking-wider px-4 py-1.5 rounded-full">MOST POPULAR</div>
              <div className="font-semibold text-[15px] text-dark-500 font-inter">Annual Membership</div>
              <div className="text-[52px] font-extrabold mt-4 mb-1" style={{ fontFamily: '"Plus Jakarta Sans"' }}>${price}<span className="text-lg font-medium text-dark-500">{period}</span></div>
              <p className="text-sm text-dark-500 font-inter">Less than $9/month</p>
              <ul className="text-left flex flex-col gap-3.5 my-8">
                {features.map((f, i) => (
                  <li key={i} className="flex gap-2.5 items-center text-[14.5px] font-inter">
                    <span className="text-emerald-500 font-bold flex-shrink-0">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-blue btn-lg w-full">Join Now</Link>
              <div className="text-[12.5px] text-dark-500 mt-4 font-inter">14-day money-back guarantee, no questions asked.</div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
