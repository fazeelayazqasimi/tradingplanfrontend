import { useEffect, useRef } from 'react';

export default function TradingViewTicker({ symbol = 'OANDA:XAUUSD', width = 200, height = 36, colorTheme = 'light' }) {
  const containerRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const initWidget = () => {
      if (window.TradingView && containerRef.current) {
        containerRef.current.innerHTML = '';
        new window.TradingView.widget({
          container_id: containerRef.current.id,
          symbol,
          interval: 'D',
          timezone: 'Etc/UTC',
          theme: colorTheme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          hide_top_toolbar: true,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          autosize: true,
          studies: [],
          width: '100%',
          height: '100%',
        });
      }
    };

    if (window.TradingView) {
      initWidget();
      return;
    }

    if (scriptLoaded.current) {
      const check = setInterval(() => {
        if (window.TradingView) {
          clearInterval(check);
          initWidget();
        }
      }, 200);
      return () => clearInterval(check);
    }

    scriptLoaded.current = true;
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) document.head.removeChild(script);
    };
  }, [symbol, colorTheme]);

  return (
    <div
      id={`tv-ticker-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}`}
      ref={containerRef}
      style={{ width, height }}
      className="inline-block"
    />
  );
}
