const express = require('express');
const axios = require('axios');
const router = express.Router();

const STOCKS = ['AAPL', 'TSLA', 'NVDA'];
const CRYPTO_IDS = ['bitcoin'];

// Yahoo Finance v8 (no key required)
async function fetchStock(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d`;
  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const result = data.chart?.result?.[0];
  if (!result) throw new Error(`No data for ${symbol}`);

  const meta = result.meta;
  const closes = result.indicators?.quote?.[0]?.close || [];
  const timestamps = result.timestamp || [];

  // Build sparkline (last 20 points, filter nulls)
  const sparkline = closes
    .map((c, i) => ({ t: timestamps[i], v: c }))
    .filter(p => p.v != null)
    .slice(-20)
    .map(p => p.v);

  const price = meta.regularMarketPrice;
  const prevClose = meta.previousClose || meta.chartPreviousClose;
  const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

  return {
    symbol,
    price,
    change: parseFloat(change.toFixed(2)),
    sparkline,
    marketState: meta.marketState, // REGULAR, PRE, POST, CLOSED
  };
}

async function fetchCrypto() {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&sparkline=true&price_change_percentage=24h`;
  const { data } = await axios.get(url, { timeout: 8000 });
  const btc = data[0];
  return {
    symbol: 'BTC',
    price: btc.current_price,
    change: parseFloat((btc.price_change_percentage_24h || 0).toFixed(2)),
    sparkline: btc.sparkline_in_7d?.price?.slice(-20) || [],
    marketState: 'REGULAR',
  };
}

router.get('/quotes', async (req, res) => {
  try {
    const [stockResults, btc] = await Promise.all([
      Promise.allSettled(STOCKS.map(fetchStock)),
      fetchCrypto().catch(() => ({ symbol: 'BTC', price: 0, change: 0, sparkline: [], marketState: 'CLOSED' })),
    ]);

    const quotes = stockResults
      .map((r, i) =>
        r.status === 'fulfilled'
          ? r.value
          : { symbol: STOCKS[i], price: null, change: null, sparkline: [], marketState: 'CLOSED' }
      )
      .concat([btc]);

    // Determine overall market state from AAPL
    const aapl = quotes.find(q => q.symbol === 'AAPL');
    const marketState = aapl?.marketState || 'CLOSED';

    res.json({ quotes, marketState });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
