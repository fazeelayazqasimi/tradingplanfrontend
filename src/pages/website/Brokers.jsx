import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';

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

export default function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    websiteService.getBrokers()
      .then(({ data }) => {
        const list = data?.data || data || [];
        setBrokers(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <style>{`.reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; } .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }`}</style>

      <section className="pt-[120px] pb-16 bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <p className="eyebrow mb-3.5 text-[13px] sm:text-sm">Trusted Brokers</p>
            <h1 className="text-[28px] sm:text-[36px] lg:text-[44px] font-extrabold mb-5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              Trade with <span className="text-primary-500">Industry Leaders</span>
            </h1>
            <p className="text-dark-500 text-[17px] leading-relaxed font-inter max-w-[640px] mx-auto">
              We partner with trusted brokers to give you the best trading experience. Open an account through our links and get started.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="section py-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-16 text-dark-400">Loading brokers...</div>
          ) : brokers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-dark-500 font-medium">No brokers available yet</p>
              <p className="text-sm text-dark-400 mt-1">Check back soon for trusted broker partners.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {brokers.map((broker, bi) => (
                <ScrollReveal key={broker._id} delay={bi * 100}>
                  <div className="bg-white border border-dark-100 rounded-[22px] p-6 sm:p-8 lg:p-10 shadow-card">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center text-lg font-bold overflow-hidden">
                        {broker.logo ? (
                          <img src={broker.logo} alt={broker.name} className="w-full h-full object-contain" />
                        ) : (
                          broker.name[0]
                        )}
                      </div>
                      <h2 className="text-[22px] sm:text-[26px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{broker.name}</h2>
                    </div>
                    {broker.accounts?.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {broker.accounts.map((acc) => (
                          <a
                            key={acc._id}
                            href={acc.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-5 rounded-xl border border-dark-100 hover:border-primary-300 hover:shadow-card-md transition-all duration-200 group"
                          >
                            <h3 className="font-bold text-[15px] mb-1 group-hover:text-primary-500 transition-colors" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{acc.name}</h3>
                            {acc.description && (
                              <p className="text-[13px] text-dark-500 font-inter">{acc.description}</p>
                            )}
                            <div className="mt-3 text-[12px] text-primary-500 font-semibold flex items-center gap-1">
                              Open Account
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-dark-400 text-sm font-inter">No accounts available for this broker yet.</p>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section pb-16">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[26px] border border-dark-100 py-10 sm:py-16 px-6 sm:px-16 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-10" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
            <div className="text-center md:text-left">
              <h3 className="text-[22px] sm:text-[28px] mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Ready to start trading?</h3>
              <p className="text-dark-500 text-[15px] font-inter">Open an account with a trusted broker and begin your trading journey.</p>
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