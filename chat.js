module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message = "" } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      const demoReply = `Ciao! Ho ricevuto: “${message}”. Come posso aiutarti oggi? 😊`;
      return res.status(200).json({ reply: demoReply });
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 250,
        messages: [
          {
            role: 'system',
            content: 'Sei un assistente aziendale italiano di AI Automation. Rispondi in modo breve, chiaro e professionale.'
          },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content || 'Ok.';
    return res.status(200).json({ reply });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ reply: 'Connessione temporaneamente instabile, riprova tra poco.' });
  }
};
