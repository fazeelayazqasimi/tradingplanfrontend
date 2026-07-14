import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import websiteService from '../../services/websiteService';
import { useName } from '../../context/NameContext';

const defaultFeatures = [
  { title: 'Mentor-led, not video-only', desc: 'Every course is paired with live sessions and direct feedback from active traders.' },
  { title: 'Signals with full transparency', desc: 'Entry, stop loss and take profit are published before the move, not after.' },
  { title: 'A real community, not a chatroom', desc: 'Referral and copy-trading tools that reward long-term learning, not recruitment.' },
];

const defaultStats = [
  { num: '9+', lbl: 'Years Experience' },
  { num: '18,400+', lbl: 'Students Trained' },
  { num: '64', lbl: 'Courses Delivered' },
  { num: '52,000+', lbl: 'Signals Delivered' },
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
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.95fr_1.05fr] gap-[72px] items-center">
          <ScrollReveal>
            <div className="aspect-[4/5] rounded-[22px] relative overflow-hidden shadow-card-lg" style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 55%, #0B1220 100%)' }}>
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
              <div className="absolute bottom-10 left-8 right-8 flex items-end gap-2 h-[45%]">
                {[40,55,30,65,45,38,70,50,60,35,75,42,58,30,36,90,25,44,28,95,100].map((h, i) => (
                  <div key={i} className="w-2 rounded-[2px] flex-1" style={{ height: `${h}%`, background: [1,3,4,6,7,9,11,12,15,16,18,20].includes(i) ? '#10B981' : '#F87171' }} />
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div>
            <p className="eyebrow mb-3.5">About Us</p>
            <h2 className="text-[24px] sm:text-[32px] lg:text-[34px] font-extrabold mb-4.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
              {visitorName ? `Welcome, ${visitorName}. Built by traders who wanted the education they never had.` : 'Built by traders who wanted the education they never had.'}
            </h2>
            <p className="text-dark-500 text-[15.5px] leading-[1.7] font-inter">
              Dream Trader was founded on a simple mission: give retail traders the same structured, mentor-led path that institutional desks give their own analysts. Our vision is a global community where discipline and process - not hype - define success.
            </p>
            <div className="flex flex-col gap-4 mt-7">
              {defaultFeatures.map((item, i) => (
                <div key={i} className="flex gap-3.5 items-start">
                  <div className="w-[22px] h-[22px] rounded-[7px] bg-primary-50 text-primary-500 flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">&#10003;</div>
                  <div>
                    <strong className="block mb-0.5 text-[15.5px] text-ink" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{item.title}</strong>
                    <p className="text-dark-500 text-[15px] leading-relaxed font-inter">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5.5 mt-10 pt-9 border-t border-dark-100">
              {stats.map((s, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="text-[24px] sm:text-[30px] font-extrabold" style={{ fontFamily: '"Plus Jakarta Sans"' }}>{s.num}</div>
                  <div className="text-[13px] text-dark-500 mt-0.5 font-inter">{s.lbl}</div>
                </ScrollReveal>
              ))}
            </div>
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
