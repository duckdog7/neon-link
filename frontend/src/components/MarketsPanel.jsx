import React, { useMemo } from 'react';
import Panel from './Panel';
import Sparkline from './Sparkline';

export default function MarketsPanel({ markets, accentHex, accentSecHex, isNight }) {
  const quotes = markets?.quotes || [];
  const marketState = markets?.marketState || 'CLOSED';

  // Market open/close countdown
  const countdown = useMarketCountdown(marketState);

  return (
    <Panel accentHex={accentHex} title="// MARKET WATCH" className="h-full">
      <div className="h-full flex flex-col p-2 gap-1.5">
        {/* Market status banner */}
        <div
          className="text-xs flex justify-between items-center px-2 py-1 rounded shrink-0"
          style={{
            background: accentHex + '12',
            border: `1px solid ${accentHex}22`,
            color: accentHex + 'aa',
          }}
        >
          <span>
            {marketState === 'REGULAR' ? '▲ MARKET OPEN' :
             marketState === 'PRE' ? '◎ PRE-MARKET' :
             marketState === 'POST' ? '◎ AFTER-HOURS' : '▼ MARKET CLOSED'}
          </span>
          <span>{countdown}</span>
        </div>

        {/* Quote rows */}
        <div className="flex-1 flex flex-col justify-around min-h-0">
          {quotes.length === 0
            ? Array(4).fill(null).map((_, i) => <SkeletonQuote key={i} accentHex={accentHex} />)
            : quotes.map(q => (
                <QuoteRow key={q.symbol} quote={q} accentHex={accentHex} accentSecHex={accentSecHex} />
              ))
          }
        </div>
      </div>
    </Panel>
  );
}

function QuoteRow({ quote, accentHex, accentSecHex }) {
  const isPos = (quote.change || 0) >= 0;
  const changeColor = isPos ? '#00ff88' : '#ff3333';
  const noData = quote.price == null;

  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded"
      style={{ border: `1px solid ${accentHex}18`, background: accentHex + '06' }}
    >
      {/* Symbol */}
      <div
        className="font-display text-sm font-bold w-14 shrink-0"
        style={{ color: accentHex }}
      >
        {quote.symbol}
      </div>

      {/* Sparkline */}
      <div className="flex-1 min-w-0 h-8">
        <Sparkline data={quote.sparkline} color={changeColor} />
      </div>

      {/* Price */}
      <div className="text-right shrink-0 w-28">
        <div className="font-display text-sm" style={{ color: noData ? '#555' : '#eee' }}>
          {noData ? '---' : quote.symbol === 'BTC'
            ? `$${quote.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
            : `$${quote.price.toFixed(2)}`}
        </div>
        <div className="text-xs font-mono" style={{ color: noData ? '#555' : changeColor }}>
          {noData ? '---%' : `${isPos ? '+' : ''}${quote.change}%`}
        </div>
      </div>
    </div>
  );
}

function SkeletonQuote({ accentHex }) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1 rounded animate-pulse"
      style={{ border: `1px solid ${accentHex}18`, background: accentHex + '06', height: 44 }}
    >
      <div className="w-14 h-4 rounded" style={{ background: accentHex + '22' }} />
      <div className="flex-1 h-4 rounded" style={{ background: accentHex + '11' }} />
      <div className="w-20 h-4 rounded" style={{ background: accentHex + '22' }} />
    </div>
  );
}

function useMarketCountdown(marketState) {
  const [label, setLabel] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      const nyNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const h = nyNow.getHours(), m = nyNow.getMinutes();
      const totalMin = h * 60 + m;

      // Market hours: 9:30 AM - 4:00 PM ET weekdays
      const day = nyNow.getDay();
      const isWeekday = day > 0 && day < 6;

      if (!isWeekday) {
        setLabel('Closed — Weekend');
        return;
      }

      const openMin = 9 * 60 + 30;
      const closeMin = 16 * 60;

      if (totalMin < openMin) {
        const diff = openMin - totalMin;
        setLabel(`Opens in ${Math.floor(diff / 60)}h ${diff % 60}m`);
      } else if (totalMin < closeMin) {
        const diff = closeMin - totalMin;
        setLabel(`Closes in ${Math.floor(diff / 60)}h ${diff % 60}m`);
      } else {
        const nextOpen = (24 * 60 - totalMin) + openMin;
        setLabel(`Opens in ${Math.floor(nextOpen / 60)}h ${nextOpen % 60}m`);
      }
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [marketState]);

  return label;
}
