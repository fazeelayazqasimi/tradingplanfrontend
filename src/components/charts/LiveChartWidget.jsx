import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSave, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SYMBOLS = [
  { label: 'XAU/USD', value: 'OANDA:XAUUSD' },
  { label: 'EUR/USD', value: 'FX_IDC:EURUSD' },
  { label: 'GBP/USD', value: 'FX_IDC:GBPUSD' },
  { label: 'S&P 500', value: 'FOREXCOM:SPXUSD' },
  { label: 'US30', value: 'OANDA:US30USD' },
  { label: 'BTC/USD', value: 'BITSTAMP:BTCUSD' },
  { label: 'ETH/USD', value: 'BITSTAMP:ETHUSD' },
  { label: 'USD/JPY', value: 'FX_IDC:USDJPY' },
];

const INTERVALS = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
  { label: '1M', value: 'M' },
];

const THEMES = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export default function LiveChartWidget({ compact, showTitle }) {
  const [symbol, setSymbol] = useState('OANDA:XAUUSD');
  const [interval, setIntervalState] = useState('D');
  const [theme, setTheme] = useState('light');
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tvReady, setTvReady] = useState(false);
  const containerId = useRef(`tv-chart-${Math.random().toString(36).slice(2, 8)}`).current;
  const widgetRef = useRef(null);
  const savedDataRef = useRef(null);
  const saveTimerRef = useRef(null);
  const scriptAddedRef = useRef(false);

  const tvLoadedRef = useRef(false);
  const dataLoadedRef = useRef(false);
  const widgetParamsRef = useRef({ symbol, interval, theme });
  widgetParamsRef.current = { symbol, interval, theme };

  const destroyWidget = useCallback(() => {
    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }
    setTvReady(false);
  }, []);

  const createWidget = useCallback(() => {
    destroyWidget();
    if (!window.TradingView || !dataLoadedRef.current) return;
    setTvReady(false);
    const { symbol: sym, interval: iv, theme: th } = widgetParamsRef.current;
    const container = document.getElementById(containerId);
    if (!container) return;
    const widget = new window.TradingView.widget({
      container_id: containerId,
      autosize: true,
      symbol: sym,
      interval: iv,
      timezone: 'Etc/UTC',
      theme: th,
      style: '1',
      locale: 'en',
      toolbar_bg: th === 'dark' ? '#1e222d' : '#f1f3f6',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
      saved_data: savedDataRef.current || null,
      overrides: th === 'dark' ? {
        'paneProperties.background': '#1e222d',
        'paneProperties.vertGridProperties.color': '#2a2e39',
        'paneProperties.horzGridProperties.color': '#2a2e39',
      } : {},
      loading_screen: { backgroundColor: th === 'dark' ? '#1e222d' : '#ffffff' },
      auto_save_delay: 500,
      onAutoSaveNeeded: () => {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => autoSaveChart(), 1000);
      },
    });
    widgetRef.current = widget;
    widget.onChartReady(() => setTvReady(true));
  }, [destroyWidget, containerId]);

  const tryCreateWidget = useCallback(() => {
    if (window.TradingView && dataLoadedRef.current && !widgetRef.current) {
      createWidget();
    }
  }, [createWidget]);

  useEffect(() => {
    api.get('/charts/drawings', { params: { symbol } })
      .then((res) => {
        savedDataRef.current = res.data?.data || null;
        dataLoadedRef.current = true;
        tryCreateWidget();
      })
      .catch(() => {
        dataLoadedRef.current = true;
        tryCreateWidget();
      });
  }, []);

  useEffect(() => {
    if (!scriptAddedRef.current) {
      if (!document.getElementById('tv-chart-base-script')) {
        const script = document.createElement('script');
        script.id = 'tv-chart-base-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          tvLoadedRef.current = true;
          tryCreateWidget();
        };
        document.head.appendChild(script);
      } else if (window.TradingView) {
        tvLoadedRef.current = true;
        tryCreateWidget();
      } else {
        const check = setInterval(() => {
          if (window.TradingView) {
            clearInterval(check);
            tvLoadedRef.current = true;
            tryCreateWidget();
          }
        }, 200);
      }
      scriptAddedRef.current = true;
    } else {
      tryCreateWidget();
    }
    return () => destroyWidget();
  }, [destroyWidget, tryCreateWidget]);

  async function autoSaveChart() {
    if (!widgetRef.current) return;
    try {
      const data = await widgetRef.current.save(theme);
      await api.post('/charts/drawings', { symbol, data });
    } catch {}
  }

  async function handleSave() {
    if (!widgetRef.current || saving) return;
    setSaving(true);
    try {
      const data = await widgetRef.current.save(theme);
      await api.post('/charts/drawings', { symbol, data });
      savedDataRef.current = data;
      toast.success('Chart saved');
    } catch {
      toast.error('Failed to save chart');
    } finally {
      setSaving(false);
    }
  }

  function handleSymbolChange(val) {
    setSymbolOpen(false);
    if (val !== symbol) {
      savedDataRef.current = null;
      setSymbol(val);
      api.get('/charts/drawings', { params: { symbol: val } })
        .then((res) => { savedDataRef.current = res.data?.data || null; })
        .catch(() => {});
    }
  }

  return (
    <div className={`bg-white border border-dark-100 rounded-2xl shadow-card overflow-hidden ${compact ? '' : ''}`}>
      <div className={`${compact ? 'p-3' : 'p-4'} border-b border-dark-100 flex flex-wrap items-center gap-2 bg-dark-50/50`}>
        {showTitle !== false && !compact && (
          <div className="flex items-center gap-2 mr-2">
            <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center">
              <FiRefreshCw size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-ink">Live Charts</span>
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setSymbolOpen(!symbolOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-dark-100 text-xs font-medium text-ink hover:border-dark-300 transition-colors"
          >
            {SYMBOLS.find(s => s.value === symbol)?.label || symbol}
            <FiChevronDown size={13} className="text-dark-400" />
          </button>
          {symbolOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSymbolOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-dark-100 rounded-lg shadow-lg py-1 w-44 max-h-64 overflow-y-auto">
                {SYMBOLS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleSymbolChange(s.value)}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-dark-50 transition-colors ${s.value === symbol ? 'bg-primary-50 text-primary-600 font-medium' : 'text-dark-700'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-0.5 bg-white border border-dark-100 rounded-lg p-0.5">
          {INTERVALS.map((iv) => (
            <button
              key={iv.value}
              onClick={() => setIntervalState(iv.value)}
              className={`px-1.5 py-1 text-[10px] font-semibold rounded-md transition-colors ${interval === iv.value ? 'bg-primary-500 text-white' : 'text-dark-500 hover:text-dark-700'}`}
            >
              {iv.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${theme === t.value ? 'bg-primary-500 text-white' : 'bg-white border border-dark-100 text-dark-500 hover:text-dark-700'}`}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={handleSave}
            disabled={!tvReady || saving}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 ${!tvReady || saving ? 'bg-dark-50 text-dark-300 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
          >
            <FiSave size={12} />
            {saving ? '...' : compact ? 'Save' : 'Save'}
          </button>
        </div>
      </div>

      <div
        id={containerId}
        className="w-full"
        style={{ height: compact ? '350px' : 'calc(100vh - 280px)', minHeight: compact ? '280px' : '400px', backgroundColor: theme === 'dark' ? '#1e222d' : '#ffffff' }}
      />

      {!tvReady && (
        <div className="flex items-center justify-center py-4 text-xs text-dark-400 gap-2 border-t border-dark-100">
          <FiRefreshCw size={12} className="animate-spin" />
          Loading chart...
        </div>
      )}
    </div>
  );
}
