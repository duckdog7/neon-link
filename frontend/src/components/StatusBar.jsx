import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StatusBar({ weather, accentHex, isNight }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const uptimeStr = formatUptime(now);

  return (
    <div
      className="shrink-0 flex items-center justify-between px-4 py-1 text-xs font-mono"
      style={{
        borderTop: `1px solid ${accentHex}22`,
        background: `${accentHex}06`,
        color: accentHex + '88',
        height: 28,
      }}
    >
      {/* Left: location + weather */}
      <div className="flex items-center gap-3">
        <span style={{ color: accentHex + 'cc' }}>
          {weather?.icon || '🌐'} {weather?.location || '---'}
        </span>
        <span>
          {weather?.temp != null ? `${weather.temp}°F` : '--°F'}
        </span>
        <span>
          ☔ {weather?.rain != null ? `${weather.rain}%` : '--%'}
        </span>
        {weather?.description && (
          <span className="capitalize">{weather.description}</span>
        )}
      </div>

      {/* Center: status */}
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ color: '#00ff88' }}
        >
          ● NEON-LINK v1.0
        </motion.span>
        <span>REFRESH: 30s</span>
        <span>MODE: {isNight ? 'NIGHT' : 'DAY'}</span>
      </div>

      {/* Right: time + uptime */}
      <div className="flex items-center gap-3">
        <span>SYS {uptimeStr}</span>
        <span style={{ color: accentHex + 'cc' }}>
          {now.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </div>
  );
}

function formatUptime(now) {
  // Session start approximated by page load
  if (!window._neonStart) window._neonStart = Date.now();
  const sec = Math.floor((now - window._neonStart) / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
