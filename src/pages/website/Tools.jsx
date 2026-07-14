import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const MARKET_SESSIONS = [
  { name: 'Sydney', open: 22, close: 7, tz: 'Australia/Sydney', flag: '🇦🇺' },
  { name: 'Tokyo', open: 0, close: 9, tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'London', open: 7, close: 16, tz: 'Europe/London', flag: '🇬🇧' },
  { name: 'New York', open: 13, close: 22, tz: 'America/New_York', flag: '🇺🇸' },
];

const OVERLAPS = [
  { name: 'London + New York', hours: '13:00 - 16:00 GMT', desc: 'Highest volatility, best trading opportunity' },
  { name: 'Tokyo + London', hours: '07:00 - 09:00 GMT', desc: 'Good volatility, cross-pair opportunities' },
  { name: 'Sydney + Tokyo', hours: '22:00 - 07:00 GMT', desc: 'Lower volatility, Asia session' },
];

const MAJOR_EVENTS = [
  { time: 'Wed 14:30', event: 'CPI (YoY)', impact: 'High', prev: '3.4%', forecast: '3.3%' },
  { time: 'Thu 14:30', event: 'GDP (QoQ)', impact: 'High', prev: '2.8%', forecast: '2.6%' },
  { time: 'Fri 08:30', event: 'NFP', impact: 'High', prev: '275K', forecast: '240K' },
  { time: 'Wed 20:00', event: 'FOMC Minutes', impact: 'High', prev: '-', forecast: '-' },
  { time: 'Tue 10:00', event: 'EZ CPI', impact: 'Medium', prev: '2.6%', forecast: '2.5%' },
  { time: 'Thu 15:00', event: 'ISM Manufacturing', impact: 'Medium', prev: '49.5', forecast: '50.2' },
];

const LIVE_RATES_DEFAULT = [
  { pair: 'EUR/USD', bid: '1.08415', ask: '1.08418', change: '+0.12%', direction: 'up', spread: 0.3 },
  { pair: 'GBP/USD', bid: '1.26502', ask: '1.26507', change: '-0.08%', direction: 'down', spread: 0.5 },
  { pair: 'USD/JPY', bid: '151.802', ask: '151.806', change: '+0.25%', direction: 'up', spread: 0.4 },
  { pair: 'USD/CHF', bid: '0.88201', ask: '0.88205', change: '-0.03%', direction: 'down', spread: 0.4 },
  { pair: 'AUD/USD', bid: '0.65204', ask: '0.65208', change: '+0.18%', direction: 'up', spread: 0.4 },
  { pair: 'NZD/USD', bid: '0.59502', ask: '0.59506', change: '+0.05%', direction: 'up', spread: 0.4 },
  { pair: 'USD/CAD', bid: '1.36001', ask: '1.36005', change: '-0.10%', direction: 'down', spread: 0.4 },
  { pair: 'XAU/USD', bid: '2394.10', ask: '2394.50', change: '+0.35%', direction: 'up', spread: 0.4 },
];

const CURRENCY_STRENGTH = [
  { currency: 'USD', strength: 8, change: '+0.5', trend: 'bullish' },
  { currency: 'EUR', strength: 6, change: '+0.3', trend: 'bullish' },
  { currency: 'GBP', strength: 7, change: '-0.2', trend: 'bearish' },
  { currency: 'JPY', strength: 3, change: '-0.8', trend: 'bearish' },
  { currency: 'CHF', strength: 5, change: '+0.1', trend: 'neutral' },
  { currency: 'AUD', strength: 4, change: '-0.4', trend: 'bearish' },
  { currency: 'NZD', strength: 3, change: '-0.6', trend: 'bearish' },
  { currency: 'CAD', strength: 6, change: '+0.2', trend: 'neutral' },
];

function MarketClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  const utcHour = time.getUTCHours() + time.getUTCMinutes() / 60;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {MARKET_SESSIONS.map(s => {
        const open = utcHour >= s.open || (s.open > s.close ? utcHour < s.close : false);
        const isOpen = s.open > s.close ? (utcHour >= s.open || utcHour < s.close) : (utcHour >= s.open && utcHour < s.close);
        const remaining = isOpen ? ((s.close > s.open ? s.close : s.close + 24) - utcHour) : ((s.open > s.close ? s.open : s.open + 24) - utcHour);
        const hrs = Math.floor(remaining);
        const mins = Math.floor((remaining - hrs) * 60);
        return (
          <div key={s.name} className={`rounded-2xl border p-4 text-center transition-all ${isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-dark-50 border-dark-100'}`}>
            <div className="text-lg mb-1">{s.flag}</div>
            <div className="font-bold text-sm">{s.name}</div>
            <div className={`text-xs font-mono mt-1 ${isOpen ? 'text-emerald-600' : 'text-dark-400'}`}>
              {isOpen ? '● Open' : '○ Closed'}
            </div>
            <div className="text-[11px] text-dark-500 mt-1 font-mono">
              {isOpen ? `${hrs}h ${mins}m remaining` : `Opens in ${hrs}h ${mins}m`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverlapChart() {
  return (
    <div>
      <div className="relative h-24 bg-dark-50 rounded-xl border border-dark-100 overflow-hidden mb-4">
        <div className="absolute inset-0 flex">
          {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23].map(h => (
            <div key={h} className="flex-1 border-r border-dark-100/50 last:border-r-0 relative">
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-dark-400">{h}:00</span>
            </div>
          ))}
        </div>
        <div className="absolute top-0 left-[91.7%] right-0 bottom-0 bg-blue-200/30 border-l-2 border-blue-500" style={{ left: `${(13/24)*100}%`, width: `${(3/24)*100}%` }} />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-amber-200/20 border-r-2 border-amber-500" style={{ left: `${(22/24)*100}%`, width: `${(9/24)*100}%` }} />
        <div className="absolute top-0 bottom-0 bg-emerald-200/20 border-l-2 border-emerald-500" style={{ left: `${(7/24)*100}%`, width: `${(2/24)*100}%` }} />
      </div>
      <div className="flex flex-wrap gap-4 text-xs">
        {OVERLAPS.map(o => (
          <div key={o.name} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${o.name.includes('London + New York') ? 'bg-blue-400' : o.name.includes('Tokyo + London') ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <div><span className="font-semibold">{o.name}</span><span className="text-dark-500"> — {o.hours}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EconomicCalendar() {
  return (
    <div className="bg-white border border-dark-100 rounded-2xl p-4 sm:p-6 shadow-card">
      <h3 className="font-bold text-lg mb-1">Economic Calendar</h3>
      <p className="text-sm text-dark-500 mb-4">Upcoming high-impact economic events</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-100">
              <th className="text-left py-2 text-xs font-semibold text-dark-500">Time</th>
              <th className="text-left py-2 text-xs font-semibold text-dark-500">Event</th>
              <th className="text-center py-2 text-xs font-semibold text-dark-500">Impact</th>
              <th className="text-right py-2 text-xs font-semibold text-dark-500">Previous</th>
              <th className="text-right py-2 text-xs font-semibold text-dark-500">Forecast</th>
            </tr>
          </thead>
          <tbody>
            {MAJOR_EVENTS.map((e, i) => (
              <tr key={i} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                <td className="py-2.5 font-mono text-xs">{e.time}</td>
                <td className="py-2.5 font-medium">{e.event}</td>
                <td className="py-2.5 text-center">
                  <span className={`badge ${e.impact === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{e.impact}</span>
                </td>
                <td className="py-2.5 text-right font-mono text-xs">{e.prev}</td>
                <td className="py-2.5 text-right font-mono text-xs">{e.forecast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForexHeatMap() {
  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'NZD/USD', 'USD/CAD'];
  const currencies = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD', 'USD'];
  const getHeat = (base, quote) => {
    const val = Math.sin((currencies.indexOf(base) * 2 + currencies.indexOf(quote) * 3) * 0.5) * 0.5 + 0.5;
    if (base === quote) return { color: 'bg-dark-100', text: '-', change: '-' };
    const pct = ((val - 0.5) * 2).toFixed(2);
    const isPositive = parseFloat(pct) >= 0;
    return { color: isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700', text: `${isPositive ? '+' : ''}${pct}%`, change: pct };
  };
  return (
    <div className="bg-white border border-dark-100 rounded-2xl p-4 sm:p-6 shadow-card">
      <h3 className="font-bold text-lg mb-1">Forex Heat Map</h3>
      <p className="text-sm text-dark-500 mb-4">Currency strength visual — green = bullish, red = bearish</p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1.5" />
              {currencies.map(c => <th key={c} className="p-1.5 text-center font-bold">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {currencies.map(base => (
              <tr key={base}>
                <td className="p-1.5 font-bold">{base}</td>
                {currencies.map(quote => {
                  const h = getHeat(base, quote);
                  return (
                    <td key={quote} className={`p-1.5 text-center rounded ${h.color} ${base === quote ? 'opacity-30' : ''}`}>
                      {h.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CurrencyStrengthMeter() {
  return (
    <div className="bg-white border border-dark-100 rounded-2xl p-4 sm:p-6 shadow-card">
      <h3 className="font-bold text-lg mb-1">Currency Strength Meter</h3>
      <p className="text-sm text-dark-500 mb-4">Real-time relative strength (0-10 scale)</p>
      <div className="space-y-3">
        {CURRENCY_STRENGTH.map(c => (
          <div key={c.currency}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm">{c.currency}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold">{c.strength}/10</span>
                <span className={`text-xs ${c.trend === 'bullish' ? 'text-emerald-500' : c.trend === 'bearish' ? 'text-red-500' : 'text-amber-500'}`}>{c.change}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-dark-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${c.strength >= 7 ? 'bg-emerald-500' : c.strength >= 5 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.strength * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveGoldPrice() {
  const [price, setPrice] = useState('2,394.10');
  const [change, setChange] = useState('+8.40');
  const [changePct, setChangePct] = useState('+0.35%');
  const [direction, setDirection] = useState('up');
  const priceRef = useRef(2394.10);
  useEffect(() => {
    const i = setInterval(() => {
      const newP = parseFloat((2385 + Math.random() * 20).toFixed(2));
      const old = priceRef.current;
      const diff = newP - old;
      priceRef.current = newP;
      setPrice(newP.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
      setChange((diff >= 0 ? '+' : '') + diff.toFixed(2));
      setChangePct((diff >= 0 ? '+' : '') + ((diff / old) * 100).toFixed(2) + '%');
      setDirection(diff >= 0 ? 'up' : 'down');
    }, 3000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="bg-white border border-dark-100 rounded-2xl p-4 sm:p-6 shadow-card bg-gradient-to-br from-amber-50 to-orange-50/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥇</span>
            <div>
              <h3 className="font-bold text-lg">XAU/USD</h3>
              <p className="text-xs text-dark-500">Gold Spot Price</p>
            </div>
          </div>
        </div>
        <span className="text-2xl sm:text-3xl font-bold">${price}</span>
      </div>
      <div className={`flex items-center gap-2 ${direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
        <span className="text-xl">{direction === 'up' ? '▲' : '▼'}</span>
        <span className="font-bold text-lg">{change}</span>
        <span className="text-sm">({changePct})</span>
      </div>
      <div className="mt-3 text-xs text-dark-500">Live updating • Forex & CFD</div>
    </div>
  );
}

function LiveRatesTicker() {
  const [rates, setRates] = useState(LIVE_RATES_DEFAULT);
  useEffect(() => {
    const i = setInterval(() => {
      setRates(prev => prev.map(r => {
        const dir = Math.random() > 0.5 ? 'up' : 'down';
        const change = (Math.random() * 0.5).toFixed(2);
        return { ...r, change: `${dir === 'up' ? '+' : '-'}${change}%`, direction: dir };
      }));
    }, 4000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="bg-white border border-dark-100 rounded-2xl p-4 sm:p-6 shadow-card">
      <h3 className="font-bold text-lg mb-1">Live Forex Rates</h3>
      <p className="text-sm text-dark-500 mb-4">Real-time bid/ask prices with spread</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dark-100">
              <th className="text-left py-2 text-xs font-semibold text-dark-500">Pair</th>
              <th className="text-right py-2 text-xs font-semibold text-dark-500">Bid</th>
              <th className="text-right py-2 text-xs font-semibold text-dark-500">Ask</th>
              <th className="text-right py-2 text-xs font-semibold text-dark-500">Spread</th>
              <th className="text-right py-2 text-xs font-semibold text-dark-500">Change</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r, i) => (
              <tr key={i} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                <td className="py-2.5 font-bold">{r.pair}</td>
                <td className="py-2.5 text-right font-mono text-xs">{r.bid}</td>
                <td className="py-2.5 text-right font-mono text-xs text-dark-400">{r.ask}</td>
                <td className="py-2.5 text-right font-mono text-xs text-dark-400">{r.spread}</td>
                <td className={`py-2.5 text-right font-mono text-xs font-bold ${r.direction === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  <span className="mr-0.5">{r.direction === 'up' ? '▲' : '▼'}</span>{r.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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

export default function Tools() {
  const titleRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
  }, []);

  return (
    <div>
      <style>{`.reveal-element { opacity: 0; transform: translateY(28px); transition: opacity 0.8s ease, transform 0.8s ease; } .reveal-active { opacity: 1 !important; transform: translateY(0) !important; }`}</style>

      <section className="pt-32 pb-16 bg-dark-50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8" ref={titleRef}>
          <p className="eyebrow mb-3">Trading Tools</p>
          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold mb-4 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>
            Market <span className="text-primary-500">Tools & Data</span>
          </h1>
          <p className="text-dark-500 text-base sm:text-lg max-w-[600px]">Live rates, economic calendar, market sessions, currency strength, and interactive charts — all in real time.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <ScrollReveal><LiveGoldPrice /></ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-6">
            <ScrollReveal><EconomicCalendar /></ScrollReveal>
            <ScrollReveal><MarketClock /></ScrollReveal>
          </div>
          <ScrollReveal><OverlapChart /></ScrollReveal>
          <div className="grid lg:grid-cols-2 gap-6">
            <ScrollReveal><ForexHeatMap /></ScrollReveal>
            <ScrollReveal><CurrencyStrengthMeter /></ScrollReveal>
          </div>
          <ScrollReveal><LiveRatesTicker /></ScrollReveal>
        </div>
      </section>
    </div>
  );
}
