import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
Sei un assistente AI per ristoranti. Rispondi in italiano, chiaro e conciso.
Gestisci prenotazioni, orari, indirizzo e menù.
Se mancano dati, chiedi 1 domanda secca. Max 3 frasi.
`;

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY non impostata su Vercel." });
    }
    const { message, context = [] } = req.body || {};
    if (!message) return res.status(400).json({ error: "Messaggio mancante." });

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...context,
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      max_tokens: 220
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Ok.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Errore /api/chat:", err.message);
    return res.status(500).json({ error: "AI_UNAVAILABLE" });
  }
});

export default app;

