import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import websiteService from '../../services/websiteService';
import gsap from 'gsap';

const defaultRanks = [
  { tier: 'V1', direct: 0, team: 0, commission: '$30', profitShare: '4%' },
  { tier: 'V2', direct: 3, team: 20, commission: '$40', profitShare: '6%' },
  { tier: 'V3', direct: 5, team: 100, commission: '$50', profitShare: '8%' },
  { tier: 'V4', direct: 8, team: 300, commission: '$60', profitShare: '10%' },
  { tier: 'V5', direct: 12, team: 800, commission: '$65', profitShare: '11%' },
  { tier: 'V6', direct: 20, team: 1500, commission: '$70', profitShare: '12%' },
];

const benefits = [
  { icon: '💰', title: 'Direct Commission', desc: 'Earn up to $70 per direct referral based on your rank.' },
  { icon: '👥', title: 'Indirect Income', desc: 'Earn from your entire team network as it grows.' },
  { icon: '📈', title: 'Rank Progression', desc: 'Climb from V1 to V6 with clear requirements.' },
  { icon: '🎯', title: 'Profit Sharing', desc: 'Get up to 12% from the network profit pool.' },
  { icon: '🔗', title: 'Personal Referral Link', desc: 'Share your unique link and track every signup.' },
  { icon: '🏆', title: 'Bonus Rewards', desc: 'Additional bonuses for top-performing members.' },
];

function ScrollReveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('reveal-active'); obs.unobserve(el); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-element ${className}`}>{children}</div>;
}

export default function ReferralProgram() {
  const [ranks, setRanks] = useState(defaultRanks);
  const heroRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    websiteService.getRanks().then(({ data }) => {
      if (data?.data?.length) {
        const m = data.data.map((r, i) => ({
          tier: r.name, direct: r.minReferrals || defaultRanks[i]?.direct || 0,
          team: r.minRevenue || defaultRanks[i]?.team || 0,
          commission: `$${r.commissionPercent * 6 || defaultRanks[i]?.commission?.replace('$', '')}`,
          profitShare: `${r.profitSharePercent || defaultRanks[i]?.profitShare?.replace('%', '')}%`,
        }));
        setRanks(m);
      }
    }).catch(() => {});
  }, []);

  return (
    <div>
      <style>{`.reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; } .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }`}</style>

      <section className="pt-32 pb-16 bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8" ref={heroRef}>
          <p className="eyebrow mb-3">Referral Program</p>
          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold mb-4 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
            Earn by <span className="text-primary-500">Sharing</span>
          </h1>
          <p className="text-dark-500 text-base sm:text-lg max-w-[600px]">Build a team, earn commissions, climb ranks, and share in network profits. The more you teach, the more you earn.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {benefits.map((b, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-card hover:shadow-card-md transition-all hover:-translate-y-1">
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <h3 className="font-bold text-base mb-1">{b.title}</h3>
                  <p className="text-sm text-dark-500">{b.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-sm bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Rank Structure</p>
            <h2 className="text-[24px] sm:text-[36px] font-extrabold">Commission & Profit Share by Rank</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-ink text-white">
                  <th className="p-4 text-left font-bold">Rank</th>
                  <th className="p-4 text-center font-bold">Min Direct</th>
                  <th className="p-4 text-center font-bold">Min Team</th>
                  <th className="p-4 text-center font-bold">Direct Commission</th>
                  <th className="p-4 text-center font-bold">Profit Share</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((r, i) => (
                  <tr key={i} className="border-b border-dark-100 hover:bg-dark-50/50 transition-colors">
                    <td className="p-4 font-bold text-lg">{r.tier}</td>
                    <td className="p-4 text-center">{r.direct}</td>
                    <td className="p-4 text-center">{r.team.toLocaleString()}</td>
                    <td className="p-4 text-center font-bold text-emerald-500">{r.commission}</td>
                    <td className="p-4 text-center font-bold text-primary-500">{r.profitShare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow mb-3">How It Works</p>
              <h2 className="text-[24px] sm:text-[34px] font-extrabold mb-4 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Simple 3-step referral process</h2>
              <div className="space-y-6">
                {[
                  { num: '01', title: 'Get Your Link', desc: 'After joining, you receive a unique referral link and code to share anywhere.' },
                  { num: '02', title: 'Share & Invite', desc: 'Share your link with friends, on social media, or in trading communities.' },
                  { num: '03', title: 'Earn Commissions', desc: 'When your referrals purchase membership, you earn direct commission instantly.' },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center font-mono font-bold flex-shrink-0">{s.num}</div>
                    <div>
                      <h4 className="font-bold text-base">{s.title}</h4>
                      <p className="text-sm text-dark-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-emerald-50 rounded-2xl border border-dark-100 p-6 sm:p-8 shadow-card">
              <h3 className="font-bold text-xl mb-4">Example Earnings</h3>
              <div className="space-y-4">
                {[
                  { label: '5 Direct Referrals (V2)', amount: '$200', color: 'text-emerald-500' },
                  { label: '20 Team Members (V3)', amount: '$1,000+', color: 'text-primary-500' },
                  { label: '100 Team Members (V4)', amount: '$6,000+', color: 'text-amber-500' },
                  { label: 'Full Network (V6)', amount: '$30,000+', color: 'text-purple-500' },
                ].map((e, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-dark-100 last:border-b-0">
                    <span className="text-sm">{e.label}</span>
                    <span className={`font-bold text-lg ${e.color}`}>{e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-sm pt-0">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[26px] border border-dark-100 py-10 sm:py-16 px-6 sm:px-16 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-10" style={{ background: 'linear-gradient(120deg, #EFF4FE, #ECFDF5)' }}>
            <div className="text-center sm:text-left">
              <h3 className="text-[22px] sm:text-[28px] mb-2.5" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Ready to start earning?</h3>
              <p className="text-dark-500 text-[15px] font-inter">Join today and get your personal referral link instantly.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full sm:w-auto">
              <Link to="/register" className="btn-blue text-center">Join Now</Link>
              <Link to="/pricing" className="btn-outline text-center">View Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
