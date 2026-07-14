import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const CURRENCY_PAIRS = {
  'EUR/USD': { pip: 0.0001, rate: 1.0842, name: 'Euro / US Dollar' },
  'GBP/USD': { pip: 0.0001, rate: 1.2650, name: 'British Pound / US Dollar' },
  'USD/JPY': { pip: 0.01, rate: 151.80, name: 'US Dollar / Japanese Yen' },
  'USD/CHF': { pip: 0.0001, rate: 0.8820, name: 'US Dollar / Swiss Franc' },
  'AUD/USD': { pip: 0.0001, rate: 0.6520, name: 'Australian Dollar / US Dollar' },
  'NZD/USD': { pip: 0.0001, rate: 0.5950, name: 'New Zealand Dollar / US Dollar' },
  'USD/CAD': { pip: 0.0001, rate: 1.3600, name: 'US Dollar / Canadian Dollar' },
  'XAU/USD': { pip: 0.01, rate: 2394.10, name: 'Gold vs US Dollar' },
  'BTC/USD': { pip: 1.0, rate: 61204, name: 'Bitcoin vs US Dollar' },
};

const LEVERAGE_OPTIONS = [1, 5, 10, 20, 30, 50, 100, 200, 500, 1000];

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

function CalculatorCard({ title, icon, desc, children }) {
  return (
    <ScrollReveal>
      <div className="bg-white border border-dark-100 rounded-2xl p-6 shadow-card hover:shadow-card-md transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center text-lg font-bold">{icon}</div>
          <div>
            <h3 className="font-bold text-base">{title}</h3>
            <p className="text-xs text-dark-500">{desc}</p>
          </div>
        </div>
        {children}
      </div>
    </ScrollReveal>
  );
}

function InputField({ label, value, onChange, type = 'text', options, suffix, placeholder }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-dark-600 mb-1">{label}</label>
      {options ? (
        <select value={value} onChange={onChange} className="input text-sm py-2.5">{options.map(o => <option key={o} value={o}>{o}</option>)}</select>
      ) : (
        <div className="relative">
          <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input text-sm py-2.5 pr-10" />
          {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-400">{suffix}</span>}
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-2 border-t border-dark-50 first:border-t-0">
      <span className="text-xs text-dark-500">{label}</span>
      <span className={`font-mono font-bold text-sm ${color || 'text-ink'}`}>{value}</span>
    </div>
  );
}

function PositionSizeCalculator() {
  const [balance, setBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('2');
  const [stopLoss, setStopLoss] = useState('50');
  const [pair, setPair] = useState('EUR/USD');
  const calc = () => {
    const b = parseFloat(balance) || 0;
    const rp = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLoss) || 1;
    const pipValue = CURRENCY_PAIRS[pair]?.pip || 0.0001;
    const riskAmt = b * (rp / 100);
    const lotSize = riskAmt / (sl * pipValue);
    const posValue = lotSize * 100000;
    return { lotSize: lotSize.toFixed(2), riskAmt: riskAmt.toFixed(2), posValue: posValue.toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Position Size Calculator" icon="1" desc="Calculate lot size based on account balance and risk">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Account Balance ($)" value={balance} onChange={e => setBalance(e.target.value)} type="number" />
        <InputField label="Risk %" value={riskPercent} onChange={e => setRiskPercent(e.target.value)} type="number" suffix="%" />
        <InputField label="Stop Loss (pips)" value={stopLoss} onChange={e => setStopLoss(e.target.value)} type="number" suffix="pips" />
        <InputField label="Currency Pair" value={pair} onChange={e => setPair(e.target.value)} options={Object.keys(CURRENCY_PAIRS)} />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Lot Size" value={r.lotSize} color="text-primary-500" />
        <ResultRow label="Dollar Risk" value={`$${r.riskAmt}`} color="text-red-500" />
        <ResultRow label="Position Value" value={`$${r.posValue}`} color="text-emerald-500" />
      </div>
    </CalculatorCard>
  );
}

function RiskRewardCalculator() {
  const [entry, setEntry] = useState('1.0842');
  const [stopLoss, setStopLoss] = useState('1.0790');
  const [takeProfit, setTakeProfit] = useState('1.0920');
  const calc = () => {
    const e = parseFloat(entry) || 0;
    const sl = parseFloat(stopLoss) || 0;
    const tp = parseFloat(takeProfit) || 0;
    const risk = Math.abs(e - sl);
    const reward = Math.abs(tp - e);
    const ratio = risk > 0 ? (reward / risk).toFixed(2) : '0';
    return { risk: risk.toFixed(4), reward: reward.toFixed(4), ratio };
  };
  const r = calc();
  return (
    <CalculatorCard title="Risk to Reward Calculator" icon="2" desc="Calculate risk/reward ratio for any trade">
      <InputField label="Entry Price" value={entry} onChange={e => setEntry(e.target.value)} type="number" />
      <InputField label="Stop Loss" value={stopLoss} onChange={e => setStopLoss(e.target.value)} type="number" />
      <InputField label="Take Profit" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} type="number" />
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Risk Amount" value={r.risk} />
        <ResultRow label="Reward Amount" value={r.reward} />
        <ResultRow label="Risk : Reward Ratio" value={`1 : ${r.ratio}`} color={parseFloat(r.ratio) >= 2 ? 'text-emerald-500' : 'text-amber-500'} />
      </div>
    </CalculatorCard>
  );
}

function PipCalculator() {
  const [pair, setPair] = useState('EUR/USD');
  const [lotSize, setLotSize] = useState('1');
  const [pips, setPips] = useState('50');
  const calc = () => {
    const ls = parseFloat(lotSize) || 0;
    const p = parseFloat(pips) || 0;
    const pipVal = CURRENCY_PAIRS[pair]?.pip * 100000 || 10;
    const value = pipVal * ls * p;
    return { pipValue: (pipVal * ls).toFixed(2), totalValue: value.toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Pip Calculator" icon="3" desc="Calculate pip value for any currency pair">
      <InputField label="Currency Pair" value={pair} onChange={e => setPair(e.target.value)} options={Object.keys(CURRENCY_PAIRS)} />
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Lot Size" value={lotSize} onChange={e => setLotSize(e.target.value)} type="number" />
        <InputField label="Number of Pips" value={pips} onChange={e => setPips(e.target.value)} type="number" suffix="pips" />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Pip Value" value={`$${r.pipValue}`} color="text-primary-500" />
        <ResultRow label="Total Value" value={`$${r.totalValue}`} color="text-emerald-500" />
      </div>
    </CalculatorCard>
  );
}

function MarginCalculator() {
  const [pair, setPair] = useState('EUR/USD');
  const [lotSize, setLotSize] = useState('1');
  const [leverage, setLeverage] = useState('100');
  const calc = () => {
    const ls = parseFloat(lotSize) || 0;
    const lev = parseFloat(leverage) || 1;
    const rate = CURRENCY_PAIRS[pair]?.rate || 1;
    const notional = ls * 100000 * rate;
    const margin = notional / lev;
    return { notional: notional.toFixed(2), margin: margin.toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Margin Calculator" icon="4" desc="Calculate required margin for a trade">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Currency Pair" value={pair} onChange={e => setPair(e.target.value)} options={Object.keys(CURRENCY_PAIRS)} />
        <InputField label="Lot Size" value={lotSize} onChange={e => setLotSize(e.target.value)} type="number" />
        <InputField label="Leverage (1:X)" value={leverage} onChange={e => setLeverage(e.target.value)} options={LEVERAGE_OPTIONS.map(String)} />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Notional Value" value={`$${r.notional}`} />
        <ResultRow label="Required Margin" value={`$${r.margin}`} color="text-primary-500" />
      </div>
    </CalculatorCard>
  );
}

function ProfitLossCalculator() {
  const [direction, setDirection] = useState('Buy');
  const [pair, setPair] = useState('EUR/USD');
  const [entry, setEntry] = useState('1.0842');
  const [exit, setExit] = useState('1.0900');
  const [lotSize, setLotSize] = useState('1');
  const calc = () => {
    const e = parseFloat(entry) || 0;
    const ex = parseFloat(exit) || 0;
    const ls = parseFloat(lotSize) || 0;
    const diff = direction === 'Buy' ? (ex - e) : (e - ex);
    const pipVal = CURRENCY_PAIRS[pair]?.pip || 0.0001;
    const pips = diff / pipVal;
    const profit = pips * 10 * ls;
    return { pips: pips.toFixed(1), profit: profit.toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Profit & Loss Calculator" icon="5" desc="Calculate P&L for any trade">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Direction" value={direction} onChange={e => setDirection(e.target.value)} options={['Buy', 'Sell']} />
        <InputField label="Pair" value={pair} onChange={e => setPair(e.target.value)} options={Object.keys(CURRENCY_PAIRS)} />
        <InputField label="Entry Price" value={entry} onChange={e => setEntry(e.target.value)} type="number" />
        <InputField label="Exit Price" value={exit} onChange={e => setExit(e.target.value)} type="number" />
        <InputField label="Lot Size" value={lotSize} onChange={e => setLotSize(e.target.value)} type="number" />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Total Pips" value={r.pips} color="text-primary-500" />
        <ResultRow label="Total P&L" value={`${parseFloat(r.profit) >= 0 ? '+' : '-'}$${Math.abs(parseFloat(r.profit)).toFixed(2)}`} color={parseFloat(r.profit) >= 0 ? 'text-emerald-500' : 'text-red-500'} />
      </div>
    </CalculatorCard>
  );
}

function DrawdownCalculator() {
  const [startBal, setStartBal] = useState('10000');
  const [currentBal, setCurrentBal] = useState('8500');
  const calc = () => {
    const s = parseFloat(startBal) || 1;
    const c = parseFloat(currentBal) || 0;
    const loss = s - c;
    const pct = (loss / s) * 100;
    return { loss: loss.toFixed(2), pct: pct.toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Drawdown Calculator" icon="6" desc="Calculate drawdown percentage and loss">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Starting Balance ($)" value={startBal} onChange={e => setStartBal(e.target.value)} type="number" />
        <InputField label="Current Balance ($)" value={currentBal} onChange={e => setCurrentBal(e.target.value)} type="number" />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Amount Lost" value={`$${r.loss}`} color="text-red-500" />
        <ResultRow label="Drawdown %" value={`${r.pct}%`} color={parseFloat(r.pct) > 20 ? 'text-red-500' : parseFloat(r.pct) > 10 ? 'text-amber-500' : 'text-emerald-500'} />
      </div>
    </CalculatorCard>
  );
}

function CompoundingCalculator() {
  const [initial, setInitial] = useState('1000');
  const [profitPct, setProfitPct] = useState('10');
  const [period, setPeriod] = useState('monthly');
  const [months, setMonths] = useState('12');
  const calc = () => {
    const p = parseFloat(initial) || 0;
    const r = (parseFloat(profitPct) || 0) / 100;
    const n = parseInt(months) || 1;
    const periods = period === 'weekly' ? n * 4 : n;
    const future = p * Math.pow(1 + r, periods);
    return { future: future.toFixed(2), profit: (future - p).toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Compounding Calculator" icon="7" desc="See the power of compound growth">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Initial Balance ($)" value={initial} onChange={e => setInitial(e.target.value)} type="number" />
        <InputField label="Profit %" value={profitPct} onChange={e => setProfitPct(e.target.value)} type="number" suffix="%" />
        <InputField label="Period" value={period} onChange={e => setPeriod(e.target.value)} options={['daily', 'weekly', 'monthly']} />
        <InputField label="Duration (months)" value={months} onChange={e => setMonths(e.target.value)} type="number" suffix="mo" />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Total Profit" value={`$${r.profit}`} color="text-emerald-500" />
        <ResultRow label="Future Balance" value={`$${r.future}`} color="text-primary-500" />
      </div>
    </CalculatorCard>
  );
}

function LeverageCalculator() {
  const [accountSize, setAccountSize] = useState('10000');
  const [leverage, setLeverage] = useState('100');
  const calc = () => {
    const a = parseFloat(accountSize) || 0;
    const l = parseFloat(leverage) || 1;
    return { buyingPower: (a * l).toFixed(2), marginUsed: (a / l).toFixed(2) };
  };
  const r = calc();
  return (
    <CalculatorCard title="Leverage Calculator" icon="8" desc="Understand buying power with leverage">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Account Size ($)" value={accountSize} onChange={e => setAccountSize(e.target.value)} type="number" />
        <InputField label="Leverage (1:X)" value={leverage} onChange={e => setLeverage(e.target.value)} options={LEVERAGE_OPTIONS.map(String)} />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Total Buying Power" value={`$${r.buyingPower}`} color="text-emerald-500" />
        <ResultRow label="Margin per Lot" value={`$${r.marginUsed}`} color="text-primary-500" />
      </div>
    </CalculatorCard>
  );
}

function LotSizeConverter() {
  const [lots, setLots] = useState('1');
  const [from, setFrom] = useState('Standard');
  const conv = { Standard: 1, Mini: 0.1, Micro: 0.01 };
  const calc = () => {
    const l = parseFloat(lots) || 0;
    const f = conv[from] || 1;
    const std = l * f;
    return {
      standard: (std / conv.Standard).toFixed(2),
      mini: (std / conv.Mini).toFixed(2),
      micro: (std / conv.Micro).toFixed(2),
    };
  };
  const r = calc();
  return (
    <CalculatorCard title="Lot Size Converter" icon="9" desc="Convert between Standard, Mini, and Micro lots">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="From" value={from} onChange={e => setFrom(e.target.value)} options={['Standard', 'Mini', 'Micro']} />
        <InputField label="Amount" value={lots} onChange={e => setLots(e.target.value)} type="number" />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="Standard Lots" value={r.standard} color="text-primary-500" />
        <ResultRow label="Mini Lots" value={r.mini} color="text-emerald-500" />
        <ResultRow label="Micro Lots" value={r.micro} color="text-amber-500" />
      </div>
    </CalculatorCard>
  );
}

function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [toIndex, setToIndex] = useState(2);
  const currencies = [
    { code: 'USD', name: 'US Dollar', rate: 1 },
    { code: 'EUR', name: 'Euro', rate: 0.92 },
    { code: 'GBP', name: 'British Pound', rate: 0.79 },
    { code: 'JPY', name: 'Japanese Yen', rate: 151.80 },
    { code: 'CHF', name: 'Swiss Franc', rate: 0.88 },
    { code: 'AUD', name: 'Australian Dollar', rate: 1.53 },
    { code: 'NZD', name: 'New Zealand Dollar', rate: 1.68 },
    { code: 'CAD', name: 'Canadian Dollar', rate: 1.36 },
    { code: 'PKR', name: 'Pakistani Rupee', rate: 278.50 },
  ];
  const [fromIdx, setFromIdx] = useState(0);
  const calc = () => {
    const amt = parseFloat(amount) || 0;
    const usd = amt / currencies[fromIdx].rate;
    const converted = usd * currencies[toIndex].rate;
    return converted.toFixed(2);
  };
  return (
    <CalculatorCard title="Currency Converter" icon="0" desc="Convert between major world currencies">
      <div className="grid grid-cols-2 gap-3">
        <InputField label="Amount" value={amount} onChange={e => setAmount(e.target.value)} type="number" />
        <div />
        <InputField label="From" value={currencies[fromIdx].code} onChange={e => { const i = currencies.findIndex(c => c.code === e.target.value); if (i >= 0) setFromIdx(i); }} options={currencies.map(c => c.code)} />
        <InputField label="To" value={currencies[toIndex].code} onChange={e => { const i = currencies.findIndex(c => c.code === e.target.value); if (i >= 0) setToIndex(i); }} options={currencies.map(c => c.code)} />
      </div>
      <div className="mt-2 bg-dark-50 rounded-xl p-3">
        <ResultRow label="From" value={`${amount} ${currencies[fromIdx].code}`} />
        <ResultRow label="To" value={`${calc()} ${currencies[toIndex].code}`} color="text-emerald-500" />
      </div>
    </CalculatorCard>
  );
}

export default function TradingCalculators() {
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
          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-extrabold mb-4 leading-tight" style={{ fontFamily: '"Plus Jakarta Sans"', letterSpacing: '-0.02em' }}>Trading <span className="text-primary-500">Calculators</span></h1>
          <p className="text-dark-500 text-base sm:text-lg max-w-[600px]">Professional-grade calculators to manage your risk, position size, and potential returns — all in one place.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <PositionSizeCalculator />
            <RiskRewardCalculator />
            <PipCalculator />
            <MarginCalculator />
            <ProfitLossCalculator />
            <DrawdownCalculator />
            <CompoundingCalculator />
            <LeverageCalculator />
            <LotSizeConverter />
            <CurrencyConverter />
          </div>
        </div>
      </section>
    </div>
  );
}
