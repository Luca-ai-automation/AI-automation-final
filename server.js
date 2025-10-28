import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Orari demo per esempio (business hours)
const BUSINESS_HOURS = {
  mon: "12:00-15:00,19:00-23:00",
  tue: "12:00-15:00,19:00-23:00",
  wed: "12:00-15:00,19:00-23:00",
  thu: "12:00-15:00,19:00-23:00",
  fri: "12:00-15:00,19:00-23:59",
  sat: "12:00-15:00,19:00-23:59",
  sun: "12:00-15:00,19:00-23:00"
};

const SYSTEM_PROMPT = `
Sei un assistente AI per un'attività locale (ristorante/PMI).
Stile: chiaro, sintetico, cordiale. Massimo 3 frasi. Italiano.
Capacità:
- Rispondi su orari, indirizzo, menù (se non forniti, dai esempio plausibile e invita a visitare il sito).
- Guida una prenotazione: chiedi giorno, ora, numero persone, nome, telefono.
- Conferma riassumendo i dati raccolti.
- Se la richiesta è fuori orario, proponi un orario utile.
- Chiedi una sola cosa alla volta se mancano informazioni.
- Se la domanda è fuori ambito, spiega brevemente cosa puoi fare e reindirizza.

Non inventare prezzi/ingredienti specifici: se non sai, offri alternative (es. "posso inviare il link al menù").
Prediligi frasi brevi, con elenco puntato solo quando utile.
`;

function weekdayKey(d=new Date()){
  const keys=["sun","mon","tue","wed","thu","fri","sat"];
  return keys[d.getDay()];
}

app.post("/api/chat", async (req,res)=>{
  try{
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY non impostata"});

    const { message="", context=[], meta={}, sessionId } = req.body || {};
    if(!message) return res.status(400).json({error:"Messaggio mancante"});

    // breve “tool” server-side: se utente scrive solo “menu/menù”
    if(/^men[uù]$/i.test(message.trim())){
      return res.json({ reply: "Puoi consultare il menù completo qui: https://aiautomation.enterprises/ (sezione demo). Vuoi prenotare un tavolo?" });
    }

    const today = new Date();
    const hours = BUSINESS_HOURS[weekdayKey(today)];
    const businessCard = {
      name: meta?.business?.name || "AI Automation Demo",
      city: meta?.business?.city || "Mestre (VE)",
      phone: meta?.business?.booking_phone || "+39 334 596 5522",
      website: meta?.business?.website || "https://aiautomation.enterprises/",
      hours
    };

    const messages = [
      { role:"system", content: SYSTEM_PROMPT },
      { role:"system", content: `Scheda attività: ${JSON.stringify(businessCard)}` },
      ...context,
      { role:"user", content: message }
    ];

    const out = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      max_tokens: 220
    });

    const reply = out.choices?.[0]?.message?.content?.trim() || "Ok.";
    // semplice filtro sicurezza (no dati sensibili)
    if(/carta di credito|iban|password|cvv|otp/i.test(reply)) {
      return res.json({ reply: "Per ragioni di sicurezza non trattiamo dati sensibili qui. Posso aiutarti con prenotazioni, orari e informazioni." });
    }

    // Log minimal (server console). In futuro: DB/Sheets
    console.log(`[${new Date().toISOString()}] ${sessionId||"no-session"}:`, message, "→", reply);

    res.json({ reply });
  }catch(err){
    console.error("Errore /api/chat:", err?.response?.data || err?.message || err);
    res.status(500).json({ error:"AI_UNAVAILABLE" });
  }
});

// Lead capture minimale (per future integrazioni)
app.post("/api/lead", async (req,res)=>{
  try{
    const { sessionId, name="", phone="" } = req.body || {};
    console.log(`[LEAD] ${sessionId||"no-session"} | ${name} | ${phone}`);
    // Qui potrai integrare: Google Sheets, Airtable, mail, CRM ecc.
    res.json({ ok:true });
  }catch(e){
    res.status(200).json({ ok:true });
  }
});

export default app;

