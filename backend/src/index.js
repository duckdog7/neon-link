require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const sportsRouter = require('./routes/sports');
const marketsRouter = require('./routes/markets');
const newsRouter = require('./routes/news');
const weatherRouter = require('./routes/weather');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/sports', sportsRouter);
app.use('/api/markets', marketsRouter);
app.use('/api/news', newsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/ai', aiRouter);

app.get('/api/health', (req, res) => res.json({ status: 'online', time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Neon-Link backend running on http://localhost:${PORT}`);
});
