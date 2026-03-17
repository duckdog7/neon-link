const express = require('express');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const router = express.Router();

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

const FEEDS = [
  { name: 'BBC News',  url: 'https://feeds.bbci.co.uk/news/rss.xml' },
  { name: 'NPR',       url: 'https://feeds.npr.org/1001/rss.xml' },
  { name: 'AP News',   url: 'https://apnews.com/rss/apf-topnews' },
];

async function fetchFeed({ name, url }) {
  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NeonLink/1.0)' },
    responseType: 'text',
  });

  const parsed = parser.parse(data);
  const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
  const arr = Array.isArray(items) ? items : [items];

  return arr.slice(0, 6).map(item => ({
    title: stripHtml(item.title?.['#text'] ?? item.title ?? ''),
    url: item.link?.['@_href'] ?? item.link ?? '#',
    source: name,
    publishedAt: item.pubDate ?? item.published ?? item.updated ?? null,
  }));
}

function stripHtml(str) {
  return String(str).replace(/<[^>]+>/g, '').trim();
}

router.get('/headlines', async (req, res) => {
  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));

    // Interleave sources so we get variety, filter failures
    const buckets = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const articles = [];
    const maxLen = Math.max(...buckets.map(b => b.length));
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (bucket[i]) articles.push(bucket[i]);
      }
    }

    res.json({ articles: articles.slice(0, 15) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
