import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNightMode } from './hooks/useNightMode';
import { useApi } from './hooks/useApi';
import ClockPanel from './components/ClockPanel';
import ScoresPanel from './components/ScoresPanel';
import MarketsPanel from './components/MarketsPanel';
import NewsPanel from './components/NewsPanel';
import StatusBar from './components/StatusBar';
import BoxScoreModal from './components/BoxScoreModal';

export default function App() {
  const isNight = useNightMode();
  const [boxScoreGame, setBoxScoreGame] = useState(null);

  const { data: scores } = useApi('/api/sports/scores', 30_000);
  const { data: markets } = useApi('/api/markets/quotes', 30_000);
  const { data: news } = useApi('/api/news/headlines', 60_000);
  const { data: weather } = useApi('/api/weather', 300_000);

  const accent = isNight ? 'amber' : 'cyan';
  const accentHex = isNight ? '#ffaa00' : '#00ffff';
  const accentSecHex = isNight ? '#ff3333' : '#00ff88';

  return (
    <div
      className={`w-screen h-screen overflow-hidden font-mono relative flex flex-col`}
      style={{ background: '#050a0e' }}
    >
      {/* Animated corner accents */}
      <CornerAccents color={accentHex} />

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 p-2 pb-0 min-h-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="min-h-0"
        >
          <ClockPanel accentHex={accentHex} accentSecHex={accentSecHex} isNight={isNight} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="min-h-0"
        >
          <ScoresPanel
            scores={scores}
            accentHex={accentHex}
            isNight={isNight}
            onMLBClick={setBoxScoreGame}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="min-h-0"
        >
          <MarketsPanel markets={markets} accentHex={accentHex} accentSecHex={accentSecHex} isNight={isNight} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="min-h-0"
        >
          <NewsPanel news={news} accentHex={accentHex} isNight={isNight} />
        </motion.div>
      </div>

      <StatusBar weather={weather} accentHex={accentHex} isNight={isNight} />

      <AnimatePresence>
        {boxScoreGame && (
          <BoxScoreModal
            game={boxScoreGame}
            onClose={() => setBoxScoreGame(null)}
            accentHex={accentHex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CornerAccents({ color }) {
  const style = { borderColor: color, boxShadow: `0 0 8px ${color}44` };
  return (
    <>
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 pointer-events-none z-50" style={style} />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 pointer-events-none z-50" style={style} />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 pointer-events-none z-50" style={style} />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 pointer-events-none z-50" style={style} />
    </>
  );
}
