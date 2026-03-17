const express = require('express');
const axios = require('axios');
const router = express.Router();

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const LEAGUES = [
  { key: 'nfl',  sport: 'football',  league: 'nfl'         },
  { key: 'nba',  sport: 'basketball',league: 'nba'         },
  { key: 'mlb',  sport: 'baseball',  league: 'mlb'         },
  { key: 'nhl',  sport: 'hockey',    league: 'nhl'         },
  { key: 'epl',  sport: 'soccer',    league: 'eng.1'       },
];

function parseGame(evt, leagueKey) {
  const comp = evt.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find(c => c.homeAway === 'home');
  const away = comp.competitors?.find(c => c.homeAway === 'away');
  const status = comp.status?.type;

  const periods = [];
  if (comp.linescores) {
    comp.linescores.forEach((ls, i) => {
      periods.push({ period: i + 1, value: ls.value });
    });
  }

  return {
    id: evt.id,
    league: leagueKey.toUpperCase(),
    homeTeam: home?.team?.abbreviation || home?.team?.displayName || '???',
    homeScore: parseInt(home?.score || 0),
    awayTeam: away?.team?.abbreviation || away?.team?.displayName || '???',
    awayScore: parseInt(away?.score || 0),
    status: status?.completed ? 'FINAL' : status?.inProgress ? 'LIVE' : 'PRE',
    statusDetail: comp.status?.type?.shortDetail || '',
    period: comp.status?.period || null,
    clock: comp.status?.displayClock || null,
    startTime: evt.date,
    periods,
  };
}

router.get('/scores', async (req, res) => {
  try {
    const results = await Promise.allSettled(
      LEAGUES.map(async ({ key, sport, league }) => {
        const url = `${ESPN_BASE}/${sport}/${league}/scoreboard`;
        const { data } = await axios.get(url, { timeout: 8000 });
        const games = (data.events || []).map(e => parseGame(e, key)).filter(Boolean);
        return { league: key.toUpperCase(), games };
      })
    );

    const scores = {};
    results.forEach((r, i) => {
      const key = LEAGUES[i].key.toUpperCase();
      scores[key] = r.status === 'fulfilled' ? r.value.games : [];
    });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MLB box score
router.get('/mlb/boxscore/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    const url = `${ESPN_BASE}/baseball/mlb/summary?event=${gameId}`;
    const { data } = await axios.get(url, { timeout: 8000 });

    const boxscore = data.boxscore || {};
    const players = data.rosters || [];
    const linescore = data.header?.competitions?.[0]?.linescores || [];

    res.json({ boxscore, linescore, players, raw: data.header?.competitions?.[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
