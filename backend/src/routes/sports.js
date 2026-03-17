const express = require('express');
const axios = require('axios');
const router = express.Router();

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports';

const LEAGUES = [
  { key: 'nfl',  sport: 'football',  league: 'nfl'   },
  { key: 'nba',  sport: 'basketball',league: 'nba'   },
  { key: 'mlb',  sport: 'baseball',  league: 'mlb'   },
  { key: 'nhl',  sport: 'hockey',    league: 'nhl'   },
  { key: 'epl',  sport: 'soccer',    league: 'eng.1' },
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
    homeLogo: home?.team?.logo || null,
    awayTeam: away?.team?.abbreviation || away?.team?.displayName || '???',
    awayScore: parseInt(away?.score || 0),
    awayLogo: away?.team?.logo || null,
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

    const comp = data.header?.competitions?.[0];
    const competitors = comp?.competitors || [];

    // Inning-by-inning with R/H/E per inning
    const teams = competitors.map(c => ({
      team: c.team?.abbreviation,
      teamName: c.team?.displayName,
      logo: c.team?.logo || null,
      homeAway: c.homeAway,
      score: parseInt(c.score || 0),
      linescores: (c.linescores || []).map(ls => ({
        runs: ls.displayValue ?? '-',
        hits: ls.hits ?? 0,
        errors: ls.errors ?? 0,
      })),
    }));

    // Player stats: batting (group 0) and pitching (group 1)
    const playerStats = (data.boxscore?.players || []).map(teamData => {
      const matchedComp = competitors.find(c => c.team?.id === teamData.team?.id);
      return {
        team: teamData.team?.abbreviation,
        homeAway: matchedComp?.homeAway || null,
        batting: parseStatGroup(teamData.statistics?.[0]),
        pitching: parseStatGroup(teamData.statistics?.[1]),
      };
    });

    res.json({ teams, playerStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function parseStatGroup(group) {
  if (!group) return { labels: [], athletes: [] };
  return {
    labels: group.labels || [],
    keys: group.keys || [],
    athletes: (group.athletes || []).map(a => ({
      name: a.athlete?.displayName || '---',
      stats: a.stats || [],
    })),
  };
}

module.exports = router;
