import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from './Panel';

export default function NewsPanel({ news, accentHex, isNight }) {
  const articles = news?.articles || [];
  const [activeIdx, setActiveIdx] = useState(null);
  const [summaries, setSummaries] = useState({});   // idx → { loading, text, error }

  const handleSummarize = async (article, idx) => {
    // Toggle off if already showing
    if (activeIdx === idx) {
      setActiveIdx(null);
      return;
    }
    setActiveIdx(idx);

    // Already fetched
    if (summaries[idx]) return;

    setSummaries(prev => ({ ...prev, [idx]: { loading: true, text: null, error: null } }));

    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: article.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSummaries(prev => ({ ...prev, [idx]: { loading: false, text: data.summary, error: null } }));
    } catch (e) {
      setSummaries(prev => ({ ...prev, [idx]: { loading: false, text: null, error: e.message } }));
    }
  };

  return (
    <Panel accentHex={accentHex} title="// THE SIGNAL" className="h-full">
      <div className="h-full overflow-y-auto px-3 py-2">
        {articles.length === 0 ? (
          <div className="text-xs py-4 text-center" style={{ color: accentHex + '44' }}>
            LOADING SIGNAL...
          </div>
        ) : (
          <div className="space-y-1.5">
            {articles.map((a, i) => (
              <HeadlineItem
                key={i}
                article={a}
                accentHex={accentHex}
                isActive={activeIdx === i}
                summary={summaries[i]}
                onSummarize={() => handleSummarize(a, i)}
              />
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}

function HeadlineItem({ article, accentHex, isActive, summary, onSummarize }) {
  const timeAgo = getTimeAgo(article.publishedAt);

  return (
    <div
      className="rounded overflow-hidden"
      style={{ border: `1px solid ${isActive ? accentHex + '44' : accentHex + '18'}` }}
    >
      {/* Headline row */}
      <div className="flex items-start gap-2 px-2 py-1.5">
        <div className="flex-1 min-w-0">
          <div className="text-xs leading-snug" style={{ color: '#ccc' }}>
            {article.title}
          </div>
          <div className="mt-0.5 flex gap-2 text-xs" style={{ color: '#555' }}>
            <span>{article.source}</span>
            {timeAgo && <><span>·</span><span>{timeAgo}</span></>}
          </div>
        </div>

        {/* Per-article summarize button */}
        <button
          onClick={onSummarize}
          title="AI summary"
          className="shrink-0 text-xs px-1.5 py-0.5 rounded mt-0.5 transition-all active:scale-95"
          style={{
            border: `1px solid ${accentHex}${isActive ? '88' : '33'}`,
            color: accentHex + (isActive ? 'ff' : '77'),
            background: isActive ? accentHex + '18' : 'transparent',
            cursor: 'pointer',
            lineHeight: 1.4,
          }}
        >
          {summary?.loading ? '◌' : '⚡'}
        </button>
      </div>

      {/* Summary drawer */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ borderTop: `1px solid ${accentHex}22`, background: accentHex + '08' }}
          >
            <div className="px-3 py-2 text-xs" style={{ color: accentHex + 'cc' }}>
              {summary?.loading && <TypewriterDots color={accentHex} />}
              {summary?.error && <span style={{ color: '#ff3333' }}>{summary.error}</span>}
              {summary?.text && <TypewriterText text={summary.text} color={accentHex} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TypewriterText({ text, color }) {
  const [displayed, setDisplayed] = React.useState('');
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, 14);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <BlinkCursor color={color} />}
    </span>
  );
}

function BlinkCursor({ color }) {
  const [v, setV] = React.useState(true);
  React.useEffect(() => {
    const id = setInterval(() => setV(x => !x), 400);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color, opacity: v ? 1 : 0 }}>▌</span>;
}

function TypewriterDots({ color }) {
  const [dots, setDots] = React.useState('');
  React.useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color: color + '88' }}>ANALYZING{dots}</span>;
}

function getTimeAgo(iso) {
  if (!iso) return null;
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
