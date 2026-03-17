import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Batting columns: index into stats array
const BAT_COLS = [
  { label: 'H-AB', idx: 0 },
  { label: 'R',    idx: 2 },
  { label: 'RBI',  idx: 4 },
  { label: 'HR',   idx: 5 },
  { label: 'BB',   idx: 6 },
  { label: 'K',    idx: 7 },
  { label: 'AVG',  idx: 9 },
];

// Pitching columns
const PITCH_COLS = [
  { label: 'IP',  idx: 0 },
  { label: 'H',   idx: 1 },
  { label: 'R',   idx: 2 },
  { label: 'ER',  idx: 3 },
  { label: 'BB',  idx: 4 },
  { label: 'K',   idx: 5 },
  { label: 'ERA', idx: 8 },
];

export default function BoxScoreModal({ game, onClose, accentHex }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/sports/mlb/boxscore/${game.id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [game.id]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.88)' }} />

      <motion.div
        className="relative z-10 rounded overflow-hidden font-mono w-full"
        style={{
          maxWidth: 700,
          maxHeight: '88vh',
          border: `1px solid ${accentHex}55`,
          background: 'linear-gradient(135deg, #0a1520 0%, #050a0e 100%)',
          boxShadow: `0 0 40px ${accentHex}33`,
        }}
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-2.5 flex justify-between items-center shrink-0"
          style={{ borderBottom: `1px solid ${accentHex}33`, background: accentHex + '0a' }}
        >
          <div className="flex items-center gap-3">
            <span className="font-display text-xs tracking-widest" style={{ color: accentHex }}>MLB BOX SCORE</span>
            <span className="text-xs" style={{ color: '#888' }}>{game.awayTeam} @ {game.homeTeam}</span>
            <span className="text-xs" style={{ color: game.status === 'LIVE' ? '#00ff88' : '#666' }}>
              {game.statusDetail || game.status}
            </span>
          </div>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded" style={{ color: accentHex + '88', border: `1px solid ${accentHex}33` }}>
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-4 space-y-5" style={{ maxHeight: 'calc(88vh - 48px)' }}>
          {loading && <div className="text-center py-10 text-xs animate-pulse" style={{ color: accentHex + '66' }}>LOADING...</div>}
          {error && <div className="text-center py-10 text-xs" style={{ color: '#ff3333' }}>ERROR: {error}</div>}
          {data && !loading && <BoxContent data={data} game={game} accentHex={accentHex} />}
        </div>
      </motion.div>
    </motion.div>
  );
}

function BoxContent({ data, game, accentHex }) {
  const { teams = [], playerStats = [] } = data;
  const away = teams.find(t => t.homeAway === 'away') || teams[0];
  const home = teams.find(t => t.homeAway === 'home') || teams[1];

  // Use scoreboard logos as fallback if summary API didn't return them
  if (away && !away.logo) away.logo = game.awayLogo;
  if (home && !home.logo) home.logo = game.homeLogo;
  const innings = Math.max(9, away?.linescores?.length || 0, home?.linescores?.length || 0);

  const awayBatting  = playerStats.find(t => t.homeAway === 'away')?.batting;
  const homeBatting  = playerStats.find(t => t.homeAway === 'home')?.batting;
  const awayPitching = playerStats.find(t => t.homeAway === 'away')?.pitching;
  const homePitching = playerStats.find(t => t.homeAway === 'home')?.pitching;

  return (
    <>
      {/* Score summary */}
      <ScoreSummary away={away} home={home} accentHex={accentHex} />

      {/* Linescore table */}
      <Section title="LINESCORE" accentHex={accentHex}>
        <LinescoreTable away={away} home={home} innings={innings} accentHex={accentHex} />
      </Section>

      {/* Batting */}
      {awayBatting?.athletes?.length > 0 && (
        <Section title="BATTING" logo={away?.logo} teamLabel={away?.team} accentHex={accentHex}>
          <StatsTable group={awayBatting} cols={BAT_COLS} accentHex={accentHex} />
        </Section>
      )}
      {homeBatting?.athletes?.length > 0 && (
        <Section title="BATTING" logo={home?.logo} teamLabel={home?.team} accentHex={accentHex}>
          <StatsTable group={homeBatting} cols={BAT_COLS} accentHex={accentHex} />
        </Section>
      )}

      {/* Pitching */}
      {(awayPitching?.athletes?.length > 0 || homePitching?.athletes?.length > 0) && (
        <Section title="PITCHING" accentHex={accentHex}>
          {awayPitching?.athletes?.length > 0 && (
            <div className="mb-2">
              <TeamSubheader logo={away?.logo} label={away?.team} accentHex={accentHex} />
              <StatsTable group={awayPitching} cols={PITCH_COLS} accentHex={accentHex} />
            </div>
          )}
          {homePitching?.athletes?.length > 0 && (
            <div>
              <TeamSubheader logo={home?.logo} label={home?.team} accentHex={accentHex} />
              <StatsTable group={homePitching} cols={PITCH_COLS} accentHex={accentHex} />
            </div>
          )}
        </Section>
      )}
    </>
  );
}

function ScoreSummary({ away, home, accentHex }) {
  return (
    <div className="flex justify-around py-3 rounded" style={{ background: accentHex + '0a', border: `1px solid ${accentHex}22` }}>
      <TeamScore team={away} accentHex={accentHex} />
      <TeamScore team={home} accentHex={accentHex} />
    </div>
  );
}

function TeamScore({ team, accentHex }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-1">
        {team?.logo && <img src={team.logo} alt={team.team} className="w-8 h-8 object-contain" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))' }} />}
      </div>
      <div className="font-display text-sm" style={{ color: '#ccc' }}>{team?.teamName || team?.team}</div>
      <div className="font-display text-4xl font-black mt-1" style={{ color: accentHex, textShadow: `0 0 12px ${accentHex}88` }}>
        {team?.score ?? '-'}
      </div>
      <div className="text-xs mt-1" style={{ color: accentHex + '55' }}>{team?.homeAway?.toUpperCase()}</div>
    </div>
  );
}

function LinescoreTable({ away, home, innings, accentHex }) {
  // Compute R/H/E totals
  const totals = (team) => ({
    R: team?.score ?? 0,
    H: (team?.linescores || []).reduce((s, ls) => s + (ls.hits || 0), 0),
    E: (team?.linescores || []).reduce((s, ls) => s + (ls.errors || 0), 0),
  });
  const awayTotals = totals(away);
  const homeTotals = totals(home);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th className="text-left py-1 pr-3 w-10" style={{ color: accentHex + '88' }}></th>
            {Array.from({ length: innings }, (_, i) => (
              <th key={i} className="text-center px-1 py-1 w-7" style={{ color: accentHex + '66' }}>{i + 1}</th>
            ))}
            <th className="text-center px-2 py-1 font-bold w-8" style={{ color: accentHex }}>R</th>
            <th className="text-center px-2 py-1 w-8" style={{ color: accentHex + '88' }}>H</th>
            <th className="text-center px-2 py-1 w-8" style={{ color: accentHex + '88' }}>E</th>
          </tr>
        </thead>
        <tbody>
          <LinescoreRow label={away?.team} logo={away?.logo} ls={away?.linescores} innings={innings} totals={awayTotals} accentHex={accentHex} />
          <LinescoreRow label={home?.team} logo={home?.logo} ls={home?.linescores} innings={innings} totals={homeTotals} accentHex={accentHex} />
        </tbody>
      </table>
    </div>
  );
}

function LinescoreRow({ label, logo, ls = [], innings, totals, accentHex }) {
  return (
    <tr style={{ borderTop: `1px solid ${accentHex}18` }}>
      <td className="pr-3 py-1.5" style={{ color: '#ccc' }}>
        <div className="flex items-center gap-1.5">
          {logo && <img src={logo} alt={label} className="w-5 h-5 object-contain shrink-0" />}
          <span className="font-display text-xs">{label}</span>
        </div>
      </td>
      {Array.from({ length: innings }, (_, i) => (
        <td key={i} className="text-center px-1 py-1.5" style={{ color: '#aaa' }}>
          {ls[i]?.runs ?? '-'}
        </td>
      ))}
      <td className="text-center px-2 py-1.5 font-bold" style={{ color: accentHex }}>{totals.R}</td>
      <td className="text-center px-2 py-1.5" style={{ color: '#aaa' }}>{totals.H}</td>
      <td className="text-center px-2 py-1.5" style={{ color: '#aaa' }}>{totals.E}</td>
    </tr>
  );
}

function StatsTable({ group, cols, accentHex }) {
  if (!group?.athletes?.length) return null;
  return (
    <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th className="text-left py-1 pr-3" style={{ color: accentHex + '77' }}>PLAYER</th>
          {cols.map(c => (
            <th key={c.label} className="text-center px-1.5 py-1" style={{ color: accentHex + '77' }}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {group.athletes.map((a, i) => (
          <tr key={i} style={{ borderTop: `1px solid ${accentHex}12` }}>
            <td className="pr-3 py-1" style={{ color: '#ccc', whiteSpace: 'nowrap' }}>{a.name}</td>
            {cols.map(c => (
              <td key={c.label} className="text-center px-1.5 py-1" style={{ color: '#aaa' }}>
                {a.stats[c.idx] ?? '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section({ title, logo, teamLabel, accentHex, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: `1px solid ${accentHex}22` }}>
        {logo && <img src={logo} alt={teamLabel} className="w-5 h-5 object-contain" />}
        {teamLabel && <span className="font-display text-xs" style={{ color: '#ccc' }}>{teamLabel}</span>}
        <span className="text-xs tracking-widest" style={{ color: accentHex + '88' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function TeamSubheader({ logo, label, accentHex }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      {logo && <img src={logo} alt={label} className="w-4 h-4 object-contain" />}
      <span className="text-xs" style={{ color: accentHex + '77' }}>{label}</span>
    </div>
  );
}
