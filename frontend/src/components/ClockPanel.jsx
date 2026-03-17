import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Panel from './Panel';

const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export default function ClockPanel({ accentHex, accentSecHex, isNight }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const day = DAYS[now.getDay()];
  const date = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <Panel accentHex={accentHex} title="// SYSTEM CLOCK" className="flex flex-col justify-between h-full">
      {/* Big clock */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="font-display font-black select-none"
          style={{
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            color: accentHex,
            textShadow: `0 0 10px ${accentHex}, 0 0 40px ${accentHex}66`,
            letterSpacing: '0.05em',
            lineHeight: 1,
          }}
        >
          {hh}
          <BlinkColon color={accentHex} />
          {mm}
          <BlinkColon color={accentHex} />
          {ss}
        </div>

        <div
          className="font-mono text-sm mt-2 tracking-widest"
          style={{ color: accentHex + 'aa' }}
        >
          {day} &nbsp;·&nbsp; {date}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex gap-4 px-2 pb-2 flex-wrap">
        <StatusDot color={accentSecHex} label="SYSTEM ONLINE" pulse />
        <StatusDot color={isNight ? '#ff3333' : accentHex} label={isNight ? 'NIGHT MODE' : 'DAY MODE'} />
        <StatusDot color={accentSecHex} label="NET OK" pulse />
      </div>
    </Panel>
  );
}

function BlinkColon({ color }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVisible(v => !v), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ color, opacity: visible ? 1 : 0.15, transition: 'opacity 0.1s' }}>:</span>
  );
}

function StatusDot({ color, label, pulse }) {
  return (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: color + 'cc' }}>
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        animate={pulse ? { opacity: [1, 0.3, 1] } : {}}
        transition={pulse ? { duration: 2, repeat: Infinity } : {}}
      />
      {label}
    </div>
  );
}
