const express = require('express');
const router = express.Router();

router.post('/summarize', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_key_here') {
    return res.status(400).json({ error: 'OpenAI API key not configured in .env' });
  }

  const { headline } = req.body;
  if (!headline) {
    return res.status(400).json({ error: 'headline string required' });
  }

  try {
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });

    const prompt = `In 1-2 plain sentences (max 40 words total), give brief context or background for this news headline. Be factual and concise.\n\nHeadline: "${headline}"`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content?.trim() || '';
    res.json({ summary });
  } catch (err) {
    // Surface the OpenAI error message directly (includes quota/billing info)
    const msg = err?.error?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

module.exports = router;
