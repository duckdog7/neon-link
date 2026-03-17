import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function BoxScoreModal({ game, onClose, accentHex }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/sports/mlb/boxscore/${game.id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [game.id]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.85)' }} />

      {/* Modal */}
      <motion.div
        className="relative z-10 rounded overflow-hidden font-mono"
        style={{
          width: 600,
          maxHeight: '80vh',
          border: `1px solid ${accentHex}55`,
          background: 'linear-gradient(135deg, #0a1520 0%, #050a0e 100%)',
          boxShadow: `0 0 30px ${accentHex}44`,
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex justify-between items-center"
          style={{ borderBottom: `1px solid ${accentHex}33`, background: accentHex + '0a' }}
        >
          <div>
            <span className="font-display text-sm" style={{ color: accentHex }}>MLB BOX SCORE</span>
            <span className="ml-3 text-xs" style={{ color: '#aaa' }}>
              {game.awayTeam} @ {game.homeTeam}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-2 py-1 rounded"
            style={{ color: accentHex + '88', border: `1px solid ${accentHex}33` }}
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 60px)' }}>
          {loading && (
            <div className="text-center py-8 text-xs" style={{ color: accentHex + '66' }}>
              LOADING BOX SCORE...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-xs" style={{ color: '#ff3333' }}>
              ERROR: {error}
            </div>
          )}
          {data && !loading && (
            <BoxScoreContent data={data} game={game} accentHex={accentHex} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function BoxScoreContent({ data, game, accentHex }) {
  const linescore = data.linescore || [];
  const competitors = data.raw?.competitors || [];
  const awayTeam = competitors.find(c => c.homeAway === 'away');
  const homeTeam = competitors.find(c => c.homeAway === 'home');

  // Build inning table from linescores
  const awayLinescores = awayTeam?.linescores || [];
  const homeLinescores = homeTeam?.linescores || [];

  const innings = Math.max(awayLinescores.length, homeLinescores.length, 9);

  return (
    <div className="space-y-4">
      {/* Score summary */}
      <div
        className="flex justify-around py-3 rounded text-center"
        style={{ background: accentHex + '0a', border: `1px solid ${accentHex}22` }}
      >
        <div>
          <div className="text-xs mb-1" style={{ color: accentHex + '88' }}>AWAY</div>
          <div className="font-display text-lg" style={{ color: '#ddd' }}>{game.awayTeam}</div>
          <div className="font-display text-3xl font-bold mt-1" style={{ color: accentHex }}>{game.awayScore}</div>
        </div>
        <div className="flex items-center">
          <span className="font-display text-sm" style={{ color: accentHex + '66' }}>
            {game.statusDetail || game.status}
          </span>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: accentHex + '88' }}>HOME</div>
          <div className="font-display text-lg" style={{ color: '#ddd' }}>{game.homeTeam}</div>
          <div className="font-display text-3xl font-bold mt-1" style={{ color: accentHex }}>{game.homeScore}</div>
        </div>
      </div>

      {/* Inning-by-inning */}
      {innings > 0 && (
        <div>
          <div className="text-xs mb-2 tracking-widest" style={{ color: accentHex + '88' }}>INNINGS</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3" style={{ color: accentHex + '88' }}>TEAM</th>
                  {Array.from({ length: innings }, (_, i) => (
                    <th key={i} className="text-center px-1 py-1 w-7" style={{ color: accentHex + '66' }}>
                      {i + 1}
                    </th>
                  ))}
                  <th className="text-center px-2 py-1 font-bold" style={{ color: accentHex }}>R</th>
                </tr>
              </thead>
              <tbody>
                <InningRow
                  label={game.awayTeam}
                  scores={awayLinescores}
                  total={game.awayScore}
                  innings={innings}
                  accentHex={accentHex}
                />
                <InningRow
                  label={game.homeTeam}
                  scores={homeLinescores}
                  total={game.homeScore}
                  innings={innings}
                  accentHex={accentHex}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Players / Batters */}
      <BoxPlayers data={data} accentHex={accentHex} />
    </div>
  );
}

function InningRow({ label, scores, total, innings, accentHex }) {
  return (
    <tr style={{ borderTop: `1px solid ${accentHex}18` }}>
      <td className="pr-3 py-1.5 font-display text-xs" style={{ color: '#ccc' }}>{label}</td>
      {Array.from({ length: innings }, (_, i) => (
        <td key={i} className="text-center px-1 py-1.5" style={{ color: '#aaa' }}>
          {scores[i]?.value ?? '-'}
        </td>
      ))}
      <td className="text-center px-2 py-1.5 font-bold" style={{ color: accentHex }}>{total}</td>
    </tr>
  );
}

function BoxPlayers({ data, accentHex }) {
  const rosters = data.players || [];
  if (!rosters.length) return null;

  // Find pitchers from rosters
  const pitchers = [];
  rosters.forEach(team => {
    (team.roster || []).forEach(player => {
      if (player.position?.abbreviation === 'P' || player.stats?.some(s => s.name === 'ERA')) {
        pitchers.push({ ...player, teamName: team.team?.displayName });
      }
    });
  });

  if (!pitchers.length) return null;

  return (
    <div>
      <div className="text-xs mb-2 tracking-widest" style={{ color: accentHex + '88' }}>PITCHERS</div>
      <div className="space-y-1">
        {pitchers.slice(0, 6).map((p, i) => (
          <div
            key={i}
            className="flex justify-between text-xs px-2 py-1 rounded"
            style={{ background: accentHex + '08', border: `1px solid ${accentHex}15` }}
          >
            <span style={{ color: '#ccc' }}>{p.athlete?.displayName || p.displayName || '---'}</span>
            <span style={{ color: accentHex + '88' }}>{p.teamName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
