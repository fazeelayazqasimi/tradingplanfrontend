import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSave, FiRefreshCw, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
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

export default function StudentCharts() {
  const containerId = 'tv-chart-container';
  const chartRef = useRef(null);
  const widgetRef = useRef(null);
  const [symbol, setSymbol] = useState('OANDA:XAUUSD');
  const [interval, setInterval] = useState('D');
  const [theme, setTheme] = useState('light');
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [tvReady, setTvReady] = useState(false);
  const savedDataRef = useRef(null);
  const saveTimerRef = useRef(null);

  const destroyWidget = useCallback(() => {
    if (widgetRef.current) {
      try { widgetRef.current.remove(); } catch {}
      widgetRef.current = null;
    }
    setTvReady(false);
  }, []);

  const loadOrCreate = useCallback(() => {
    destroyWidget();
    if (!window.TradingView) return;

    setTvReady(false);

    const container = document.getElementById(containerId);
    if (!container) return;

    const widget = new window.TradingView.widget({
      container_id: containerId,
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme,
      style: '1',
      locale: 'en',
      toolbar_bg: theme === 'dark' ? '#1e222d' : '#f1f3f6',
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      studies: ['RSI@tv-basicstudies', 'MASimple@tv-basicstudies'],
      saved_data: savedDataRef.current || null,
      overrides: theme === 'dark' ? {
        'paneProperties.background': '#1e222d',
        'paneProperties.vertGridProperties.color': '#2a2e39',
        'paneProperties.horzGridProperties.color': '#2a2e39',
      } : {},
      loading_screen: { backgroundColor: theme === 'dark' ? '#1e222d' : '#ffffff' },
      auto_save_delay: 500,
      onAutoSaveNeeded: () => {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => autoSaveChart(), 1000);
      },
      chart_only: false,
      height: 500,
    });

    widgetRef.current = widget;

    widget.onChartReady(() => {
      setTvReady(true);
    });
  }, [symbol, interval, theme, destroyWidget]);

  useEffect(() => {
    if (document.getElementById('tv-chart-script')) {
      loadOrCreate();
      return;
    }

    const script = document.createElement('script');
    script.id = 'tv-chart-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      loadOrCreate();
    };
    document.head.appendChild(script);

    return () => {
      destroyWidget();
    };
  }, [loadOrCreate, destroyWidget]);

  useEffect(() => {
    api.get('/charts/drawings', { params: { symbol } })
      .then((res) => {
        if (res.data?.data) {
          savedDataRef.current = res.data.data;
        }
      })
      .catch(() => {});
  }, []);

  async function autoSaveChart() {
    if (!widgetRef.current) return;
    try {
      const data = await widgetRef.current.save(widgetRef.current._originalTheme || theme);
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
      setLastSaved(new Date());
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
        .then((res) => {
          if (res.data?.data) {
            savedDataRef.current = res.data.data;
          }
        })
        .catch(() => {});
    }
  }

  useCallback(() => {
    savedDataRef.current = null;
  }, [symbol]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Advanced Charts</h1>
          <p className="text-sm text-dark-500">Interactive TradingView chart with persistent drawings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={!tvReady || saving}
            size="sm"
          >
            <FiSave size={15} className="mr-1.5" />
            {saving ? 'Saving...' : 'Save Drawings'}
          </Button>
          {lastSaved && (
            <span className="text-xs text-dark-400 hidden sm:inline">
              Last saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-3 border-b border-dark-100 flex flex-wrap items-center gap-2 bg-dark-50/50">
          <div className="relative">
            <button
              onClick={() => setSymbolOpen(!symbolOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-dark-100 text-sm font-medium text-ink hover:border-dark-300 transition-colors"
            >
              {SYMBOLS.find(s => s.value === symbol)?.label || symbol}
              <FiChevronDown size={14} className="text-dark-400" />
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

          <div className="flex items-center gap-1 bg-white border border-dark-100 rounded-lg p-0.5">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                onClick={() => setInterval(iv.value)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${interval === iv.value ? 'bg-primary-500 text-white' : 'text-dark-500 hover:text-dark-700'}`}
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
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${theme === t.value ? 'bg-primary-500 text-white' : 'bg-white border border-dark-100 text-dark-500 hover:text-dark-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div
          id={containerId}
          className="w-full min-h-[400px] lg:min-h-[500px]"
          style={{ height: 'calc(100vh - 300px)', minHeight: '400px', backgroundColor: theme === 'dark' ? '#1e222d' : '#ffffff' }}
        />
      </Card>

      <p className="text-xs text-dark-400 flex items-center gap-1.5">
        <FiRefreshCw size={12} />
        Drawings are auto-saved periodically. Click "Save Drawings" to ensure latest version is saved.
      </p>
    </div>
  );
}
