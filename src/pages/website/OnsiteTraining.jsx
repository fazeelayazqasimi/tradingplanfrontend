import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';

const defaultFeatures = [
  { title: 'Hands-on Workshops', desc: 'Practice real strategies in a live market environment with guided exercises and real-time feedback.' },
  { title: 'Live Trading Floor', desc: 'Trade alongside professionals on a live floor, observing decision-making and execution in real time.' },
  { title: '1-on-1 Mentoring', desc: 'Get personalized guidance from experienced traders who review your performance and refine your approach.' },
  { title: 'Networking Events', desc: 'Connect with fellow traders, alumni, and industry professionals through exclusive networking sessions.' },
];

const defaultPackages = [
  {
    title: 'Starter Workshop',
    price: '$199',
    features: ['2-day intensive program', 'Basics of technical analysis', 'Chart pattern recognition', 'Risk management fundamentals', 'Course materials included', 'Certificate of completion'],
  },
  {
    title: 'Professional Bootcamp',
    price: '$499',
    features: ['5-day deep dive program', 'Advanced strategy development', 'Live market analysis sessions', 'Portfolio management techniques', 'One-on-one strategy review', 'Lifetime alumni access', 'Certificate of completion'],
  },
  {
    title: 'VIP Masterclass',
    price: '$999',
    features: ['7-day premium experience', 'Live trading sessions with pros', 'Advanced algorithmic strategies', 'Institutional-grade tools access', 'Private mentoring sessions', 'VIP networking dinner', 'Lifetime alumni access', 'Certificate of completion'],
  },
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

export default function OnsiteTraining() {
  const [features, setFeatures] = useState(defaultFeatures);
  const [packages, setPackages] = useState(defaultPackages);

  useEffect(() => {
    websiteService.getContent('onsite-training')
      .then(({ data }) => {
        const content = data.data;
        if (content?.features?.length) {
          setFeatures(content.features.map(f => ({ title: f.title, desc: f.description })));
        }
        if (content?.packages?.length) {
          setPackages(content.packages.map(p => ({ title: p.title, price: p.price, features: p.features })));
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

      {/* Hero */}
      <section className="section pt-[120px] pb-16">
        <div className="max-w-[1240px] mx-auto px-8 text-center">
          <ScrollReveal>
            <p className="eyebrow mb-3.5">In-Person Training</p>
            <h1 className="text-[42px] font-extrabold mb-5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              Onsite Training Programs
            </h1>
            <p className="text-dark-500 text-[17px] leading-relaxed font-inter max-w-[640px] mx-auto">
              Join our hands-on trading workshops led by experienced professionals. Learn proven strategies, practice on live markets, and accelerate your trading journey in an immersive in-person environment.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section pt-0 pb-16">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7">
            {features.map((f, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="rounded-[18px] border border-dark-100 p-7 bg-white shadow-sm hover:shadow-card transition-shadow duration-300">
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-primary-50 text-primary-500 flex items-center justify-center text-base font-bold mb-5">&#10003;</div>
                  <h3 className="text-[17px] font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{f.title}</h3>
                  <p className="text-dark-500 text-[14.5px] leading-relaxed font-inter">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Training Packages */}
      <section className="section py-16">
        <div className="max-w-[1240px] mx-auto px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="eyebrow mb-3.5">Training Packages</p>
              <h2 className="text-[34px] font-extrabold mb-4 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
                Choose Your Training Path
              </h2>
              <p className="text-dark-500 text-[15.5px] leading-relaxed font-inter max-w-[560px] mx-auto">
                From introductory workshops to advanced masterclasses, pick the program that matches your experience and goals.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-7">
            {packages.map((pkg, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div className={`rounded-[22px] border p-8 flex flex-col h-full ${i === 2 ? 'border-primary-400 shadow-card-lg relative bg-gradient-to-b from-primary-50/40 to-white' : 'border-dark-100 bg-white shadow-sm'}`}>
                  {i === 2 && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[11.5px] font-bold px-4 py-1 rounded-full tracking-wide font-inter">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-[20px] font-bold mb-1" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{pkg.title}</h3>
                  <div className="mb-6">
                    <span className="text-[36px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{pkg.price}</span>
                    <span className="text-dark-500 text-[14px] font-inter ml-1">/ program</span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {pkg.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[14.5px] font-inter text-dark-500">
                        <span className="w-[18px] h-[18px] rounded-[5px] bg-primary-50 text-primary-500 flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5">&#10003;</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className={`w-full text-center py-3 rounded-[12px] text-[15px] font-semibold transition-all duration-200 ${i === 2 ? 'btn-blue' : 'btn-outline'}`}>
                    Enroll Now
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section py-16">
        <div className="max-w-[1240px] mx-auto px-8">
          <div className="rounded-[26px] border border-dark-100 py-16 px-16 flex flex-col md:flex-row justify-between items-center gap-10" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
            <div className="text-center md:text-left">
              <h3 className="text-[28px] mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Ready to Learn in Person?</h3>
              <p className="text-dark-500 text-[15px] font-inter">Secure your spot in our next onsite training program and take your trading to the next level.</p>
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
