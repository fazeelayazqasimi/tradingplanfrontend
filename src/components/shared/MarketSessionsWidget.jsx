import { useEffect, useState } from 'react';

const SESSIONS = [
  { name: 'Sydney', open: 22, close: 7, tz: 'Australia/Sydney', flag: '🇦🇺' },
  { name: 'Tokyo', open: 0, close: 9, tz: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'London', open: 7, close: 16, tz: 'Europe/London', flag: '🇬🇧' },
  { name: 'New York', open: 13, close: 22, tz: 'America/New_York', flag: '🇺🇸' },
];

const OVERLAPS = [
  { name: 'London + New York', hours: '13:00 - 16:00 GMT', color: 'bg-blue-400' },
  { name: 'Tokyo + London', hours: '07:00 - 09:00 GMT', color: 'bg-amber-400' },
  { name: 'Sydney + Tokyo', hours: '22:00 - 07:00 GMT', color: 'bg-emerald-400' },
];

const pad = (n) => String(n).padStart(2, '0');

function formatPKT(date) {
  const pkt = new Date(date.getTime() + 5 * 3600 * 1000);
  return `${pad(pkt.getUTCHours())}:${pad(pkt.getUTCMinutes())}:${pad(pkt.getUTCSeconds())}`;
}

export default function MarketSessionsWidget() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);
  const utcHour = time.getUTCHours() + time.getUTCMinutes() / 60;

  const sessionState = (s) => {
    const isOpen = s.open > s.close
      ? (utcHour >= s.open || utcHour < s.close)
      : (utcHour >= s.open && utcHour < s.close);
    let remaining;
    if (isOpen) {
      remaining = s.open > s.close
        ? (utcHour >= s.open ? s.close + 24 - utcHour : s.close - utcHour)
        : s.close - utcHour;
    } else {
      remaining = utcHour >= s.open ? s.open + 24 - utcHour : s.open - utcHour;
    }
    const hrs = Math.floor(remaining);
    const mins = Math.floor((remaining - hrs) * 60);
    return { isOpen, label: isOpen ? `${hrs}h ${pad(mins)}m remaining` : `Opens in ${hrs}h ${pad(mins)}m` };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Market Sessions</h3>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-dark-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Pakistan Time: {formatPKT(time)} (UTC+5)
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {SESSIONS.map((s) => {
          const st = sessionState(s);
          return (
            <div key={s.name} className={`rounded-2xl border p-4 text-center transition-all ${st.isOpen ? 'bg-emerald-50 border-emerald-200' : 'bg-dark-50 border-dark-100'}`}>
              <div className="text-lg mb-1">{s.flag}</div>
              <div className="font-bold text-sm">{s.name}</div>
              <div className={`text-xs font-mono mt-1 ${st.isOpen ? 'text-emerald-600' : 'text-dark-400'}`}>
                {st.isOpen ? '● Open' : '○ Closed'}
              </div>
              <div className="text-[11px] text-dark-500 mt-1 font-mono">{st.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-xs">
        {OVERLAPS.map((o) => (
          <div key={o.name} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-sm ${o.color}`} />
            <div>
              <span className="font-semibold">{o.name}</span>
              <span className="text-dark-500"> — {o.hours}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
