import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from './Panel';

const LEAGUE_ORDER = ['NFL', 'NBA', 'MLB', 'NHL', 'EPL'];

export default function ScoresPanel({ scores, accentHex, isNight, onMLBClick }) {
  const allGames = LEAGUE_ORDER.flatMap(league =>
    (scores?.[league] || []).map(g => ({ ...g, league }))
  );

  // If no games at all, show placeholder
  const noData = allGames.length === 0;

  return (
    <Panel accentHex={accentHex} title="// LIVE SCORES" className="h-full">
      <div className="h-full overflow-hidden relative">
        {noData ? (
          <PlaceholderScores accentHex={accentHex} />
        ) : (
          <ScrollingScores games={allGames} accentHex={accentHex} onMLBClick={onMLBClick} />
        )}
      </div>
    </Panel>
  );
}

function PlaceholderScores({ accentHex }) {
  return (
    <div className="h-full flex items-center justify-center">
      <span className="text-xs tracking-widest animate-pulse" style={{ color: accentHex + '66' }}>
        FETCHING SCORES...
      </span>
    </div>
  );
}

function ScrollingScores({ games, accentHex, onMLBClick }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const CARD_HEIGHT = 64; // px per card
  const SPEED = 40; // px per second

  useEffect(() => {
    if (paused) return;
    let last = performance.now();
    let raf;
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setOffset(prev => {
        const max = games.length * CARD_HEIGHT;
        return (prev + SPEED * dt) % max;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, games.length]);

  // Double the list for seamless loop
  const doubled = [...games, ...games];

  return (
    <div
      ref={containerRef}
      className="h-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        style={{ transform: `translateY(-${offset}px)`, willChange: 'transform' }}
      >
        {doubled.map((game, i) => (
          <GameCard
            key={`${game.id}-${i}`}
            game={game}
            accentHex={accentHex}
            onMLBClick={onMLBClick}
          />
        ))}
      </div>
    </div>
  );
}

function TeamName({ logo, name }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {logo && !imgError ? (
        <img
          src={logo}
          alt={name}
          className="w-5 h-5 object-contain shrink-0"
          style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.15))' }}
          onError={() => setImgError(true)}
        />
      ) : null}
      <span className="text-sm font-mono truncate" style={{ color: '#ddd' }}>{name}</span>
    </div>
  );
}

function GameCard({ game, accentHex, onMLBClick }) {
  const statusColor =
    game.status === 'LIVE' ? '#00ff88' :
    game.status === 'FINAL' ? '#666' : accentHex + '88';

  const isMLB = game.league === 'MLB';

  return (
    <div
      className={`flex items-center px-3 gap-2 ${isMLB ? 'cursor-pointer hover:bg-white/5' : ''}`}
      style={{ height: 64, borderBottom: `1px solid ${accentHex}11` }}
      onClick={isMLB ? () => onMLBClick(game) : undefined}
    >
      {/* League badge */}
      <div
        className="text-xs font-display w-10 shrink-0 text-center rounded px-1"
        style={{ color: accentHex, background: accentHex + '18', border: `1px solid ${accentHex}33` }}
      >
        {game.league}
      </div>

      {/* Teams + Scores */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2">
          <TeamName logo={game.awayLogo} name={game.awayTeam} />
          <span className="text-sm font-display font-bold shrink-0" style={{ color: accentHex }}>{game.awayScore}</span>
        </div>
        <div className="flex justify-between items-center gap-2">
          <TeamName logo={game.homeLogo} name={game.homeTeam} />
          <span className="text-sm font-display font-bold shrink-0" style={{ color: accentHex }}>{game.homeScore}</span>
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0 text-right w-20">
        <div className="text-xs font-display" style={{ color: statusColor }}>
          {game.status === 'LIVE' && (
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              ● LIVE
            </motion.span>
          )}
          {game.status === 'FINAL' && <span>FINAL</span>}
          {game.status === 'PRE' && <span>PRE</span>}
        </div>
        <div className="text-xs mt-0.5 truncate" style={{ color: '#555' }}>
          {game.statusDetail}
        </div>
        {isMLB && (
          <div className="text-xs mt-0.5" style={{ color: accentHex + '66' }}>▸ BOX</div>
        )}
      </div>
    </div>
  );
}
