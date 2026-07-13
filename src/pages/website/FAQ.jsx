import { useState, useEffect, useRef } from 'react';
import websiteService from '../../services/websiteService';

const defaultFaqs = [
  { q: 'Do I need prior trading experience?', a: 'No. The curriculum starts from market fundamentals and moves through to advanced strategy, so students of any background can follow along at their own pace.' },
  { q: 'How soon after joining can I access signals?', a: 'Once your membership is approved by our admin team, typically within one business day, signals and courses unlock immediately in your dashboard.' },
  { q: 'Is copy trading automatic?', a: 'Copy trading mirrors institute trades proportionally to your allocated capital. You can pause or adjust your allocation at any time from your dashboard.' },
  { q: 'How does the referral commission work?', a: 'You earn a percentage based on your rank, which is determined by your direct referrals and overall team size, as outlined in the rank progression table above.' },
  { q: 'Can I attend onsite training remotely?', a: 'Onsite workshops are in-person by design, but every session is followed by recorded highlights added to your online course library.' },
  { q: 'What is Trading Institute?', a: 'Trading Institute is a comprehensive platform offering structured trading education, live signals, copy trading, and a referral earning system built by professional traders.' },
  { q: 'How do I withdraw my earnings?', a: 'Go to Wallet > Withdraw. Enter your payment details and submit a request. Admin will review and approve it within one business day.' },
  { q: 'What are the ranks?', a: 'We have 6 ranks (D1-D6) based on your referrals and revenue. Higher ranks mean higher commissions and profit sharing percentages.' },
  { q: 'Can I get a refund?', a: 'We offer a 14-day money-back guarantee. If you are not satisfied, contact support for a full refund, no questions asked.' },
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

export default function FAQ() {
  const [faqs, setFaqs] = useState(defaultFaqs);

  useEffect(() => {
    websiteService.getFAQs()
      .then(({ data }) => {
        const items = data.data;
        if (items?.length) {
          setFaqs(items.map(f => ({ q: f.question, a: f.answer })));
        }
      })
      .catch(() => {});
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

      <section className="section">
        <div className="max-w-[760px] mx-auto px-8">
          <div className="max-w-[640px] mb-16">
            <p className="eyebrow mb-3.5">FAQ</p>
            <h2 className="text-[38px] font-extrabold mb-3.5 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"' }}>Questions, answered.</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 50}>
                <div className="faq-item border-b border-dark-100">
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
