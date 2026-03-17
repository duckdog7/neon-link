const express = require('express');
const OpenAI = require('openai');
const router = express.Router();

router.post('/summarize', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_key_here') {
    return res.status(400).json({ error: 'OpenAI API key not configured' });
  }

  const { headline } = req.body;
  if (!headline) {
    return res.status(400).json({ error: 'headline string required' });
  }

  try {
    const client = new OpenAI({ apiKey });

    const prompt = `In 4-5 sentences, give context and background for this news headline. Cover the key facts, relevant history, and why it matters. Be factual and concise.\n\nHeadline: "${headline}"`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content?.trim() || '';
    res.json({ summary });
  } catch (err) {
    const msg = err?.error?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

module.exports = router;
