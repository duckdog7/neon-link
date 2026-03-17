# Neon-Link

Cyberpunk dashboard for a 10" landscape secondary monitor. Always-on display with live sports scores, market data, news, and weather.

## Quick Start

```bash
npm install
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:3001

## API Keys

The only optional key is for the AI summarize button:

| Key | Where to get it | Required? |
|-----|----------------|-----------|
| `OPENAI_API_KEY` | https://platform.openai.com | No — all other features work without it |

Set your city in `.env` → `WEATHER_LOCATION` (default: `New York`).

Everything else uses free, keyless public APIs:

| Data | Source |
|------|--------|
| Sports scores | ESPN public scoreboard API |
| Stocks (AAPL, TSLA, NVDA) | Yahoo Finance |
| Crypto (BTC) | CoinGecko |
| News headlines | BBC News, NPR, AP News (RSS) |
| Weather | Open-Meteo (no key, no account) |

## Panels

| Panel | Location | Data |
|-------|----------|------|
| Clock | Top-left | Live clock, date, system status |
| Live Scores | Top-right | NFL / NBA / MLB / NHL / EPL — auto-scrolling |
| Market Watch | Bottom-left | AAPL, TSLA, NVDA, BTC with sparklines |
| The Signal | Bottom-right | RSS headlines + optional AI 3-bullet summary |

**Night mode** activates automatically after 10 PM — palette shifts cyan → amber/red.

**MLB box scores** — click any MLB game card to open an inning-by-inning modal.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Express.js API proxy (port 3001)
