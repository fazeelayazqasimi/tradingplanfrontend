import { useEffect, useRef } from 'react';

const WIDGET_URLS = {
  'single-ticker': 'https://s3.tradingview.com/external-embedding/embed-widget-single-ticker.js',
  'ticker-tape': 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
  'chart': 'https://s3.tradingview.com/tv.js',
};

export default function TradingViewWidget({ type = 'single-ticker', options = {}, style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widgetDiv = containerRef.current.querySelector('.tradingview-widget-container__widget');
    if (!widgetDiv) return;

    const script = document.createElement('script');
    script.src = WIDGET_URLS[type] || WIDGET_URLS['single-ticker'];
    script.async = true;
    script.type = 'text/javascript';
    script.innerHTML = JSON.stringify(options);
    widgetDiv.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [type, JSON.stringify(options)]);

  return (
    <div ref={containerRef} className="tradingview-widget-container" style={style}>
      <div className="tradingview-widget-container__widget" />
    </div>
  );
}
