import { useEffect, useState } from 'react';
import websiteService from '../../services/websiteService';

const MARQUEE_CSS = `
@keyframes live-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
`;

const FALLBACK_RATES = [
  { symbol: 'XAU/USD', name: 'Gold', price: 2394.10, changePercent: 0.35 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0842, changePercent: 0.12 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', price: 1.2650, changePercent: -0.08 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', price: 151.80, changePercent: 0.25 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', price: 0.6561, changePercent: 0.05 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: 1.3584, changePercent: -0.03 },
  { symbol: 'BTC/USD', name: 'Bitcoin', price: 65126, changePercent: 0.25 },
  { symbol: 'ETH/USD', name: 'Ethereum', price: 1921.45, changePercent: 0.24 },
];

const formatPrice = (price) => {
  const n = Number(price);
  if (Number.isNaN(n)) return '\u2014';
  if (n >= 10000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (n >= 100) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

export default function LiveRatesMarquee() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRates = async () => {
      try {
        const res = await websiteService.getLiveRates();
        const data = res?.data?.data;
        const list = Array.isArray(data?.rates) && data.rates.length > 0 ? data.rates : null;
        if (!cancelled && list) setRates(list);
      } catch {}
    };
    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const items = rates.length > 0 ? rates : FALLBACK_RATES;
  const doubled = [...items, ...items];

  return (
    <div className="bg-ink text-white h-[26px] sm:h-[30px] overflow-hidden flex items-center relative z-50 select-none">
      <style>{MARQUEE_CSS}</style>
      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{ animation: 'live-marquee 45s linear infinite' }}
        onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
        onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
      >
        {doubled.map((r, i) => {
          const chg = Number(r.changePercent ?? r.percentChange ?? r.change ?? 0);
          const up = chg >= 0;
          return (
            <span key={`${r.symbol}-${i}`} className="flex items-center gap-1.5 px-4 sm:px-5 text-[11px] sm:text-[12px] font-mono">
              <span className="text-gold-400 font-bold">{r.symbol}</span>
              <span>${formatPrice(r.price ?? r.close)}</span>
              <span className={up ? 'text-emerald-400' : 'text-red-400'}>
                {up ? '+' : ''}{chg.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
