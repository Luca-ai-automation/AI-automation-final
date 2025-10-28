<!-- ========== CHAT WIDGET — AI AUTOMATION (Black & Gold) ========== -->
<style>
  :root{
    --bg:#0A0A0A; --panel:#111213; --line:#22252b;
    --text:#ffffff; --muted:#bfbfbf; --gold:#C9A13C;
  }
  .aa-chat-launcher{position:fixed; right:18px; bottom:18px; z-index:9999}
  .aa-btn{background:var(--gold); color:#0a0a0a; border:none; border-radius:999px; padding:12px 16px; font-weight:800; cursor:pointer; box-shadow:0 10px 30px rgba(0,0,0,.45)}
  .aa-chat{position:fixed; right:18px; bottom:86px; width:380px; max-width:92vw; max-height:78vh; display:none; flex-direction:column; background:var(--panel); border:1px solid var(--line); border-radius:16px; overflow:hidden; box-shadow:0 24px 48px rgba(0,0,0,.55)}
  .aa-header{display:flex; gap:10px; align-items:center; padding:12px 14px; border-bottom:1px solid var(--line); background:linear-gradient(180deg,#0f0f0f,#0b0b0b)}
  .aa-badge{width:36px;height:36px;border-radius:10px;background:#0d0d0e;display:grid;place-items:center;border:1px solid #1c1c1c}
  .aa-badge span{font-size:18px;color:var(--gold);font-weight:900}
  .aa-title{font-weight:800; color:var(--text)} .aa-sub{color:var(--muted); font-size:12px}
  .aa-close{margin-left:auto;background:#14161b;border:1px solid var(--line);color:var(--muted);border-radius:8px;padding:6px 10px;cursor:pointer}
  .aa-body{padding:12px; background:#0C0D0F; overflow:auto}
  .aa-msg{max-width:82%; margin:8px 0; padding:10px 12px; line-height:1.4; border-radius:12px; word-wrap:break-word}
  .aa-bot{background:#0f1013; border:1px solid var(--line); color:var(--text)}
  .aa-user{background:#191c22; border:1px solid #2a2e36}
  .aa-input{display:flex; gap:8px; padding:10px; border-top:1px solid var(--line); background:#0C0D0F}
  .aa-input input{flex:1; background:#0d0f12; border:1px solid var(--line); color:var(--text); border-radius:10px; padding:10px}
  .aa-input button{background:var(--gold); border:none; color:#0b0b0b; border-radius:10px; padding:10px 12px; font-weight:800; cursor:pointer}
  .aa-quick{display:flex; flex-wrap:wrap; gap:6px; margin-top:6px}
  .aa-chip{border:1px solid var(--line); background:#111317; color:#e6e6e6; padding:6px 8px; border-radius:999px; font-size:12px; cursor:pointer}
  .aa-typing{display:none; gap:4px; align-items:center; color:var(--muted); font-size:12px; margin:4px 0 0 2px}
  .aa-dot{width:6px; height:6px; border-radius:50%; background:var(--muted); animation:aaBlink 1.2s infinite}
  .aa-dot:nth-child(2){animation-delay:.2s} .aa-dot:nth-child(3){animation-delay:.4s}
  @keyframes aaBlink{0%,80%,100%{opacity:.25} 40%{opacity:1}}
  .aa-gdpr{margin-top:6px; font-size:11px; color:var(--muted)}
  .aa-lead{display:none; padding:10px; border-top:1px solid var(--line); background:#0C0D0F}
  .aa-lead input{width:100%; margin-top:6px; background:#0d0f12; border:1px solid var(--line); color:var(--text); border-radius:8px; padding:8px}
  .aa-lead button{margin-top:8px; width:100%; background:#191c22; color:#e7e7e7; border:1px solid var(--line); border-radius:8px; padding:8px; cursor:pointer}
  @media(max-width:420px){.aa-chat{right:10px; bottom:76px; width:94vw}}
</style>

<div class="aa-chat-launcher"><button id="aaToggle" class="aa-btn">Chatta con noi</button></div>

<div id="aaChat" class="aa-chat" aria-live="polite">
  <div class="aa-header">
    <div class="aa-badge"><span>A</span></div>
    <div>
      <div class="aa-title">AI Automation Assistant</div>
      <div class="aa-sub">Risponde in pochi secondi • 24/7</div>
    </div>
    <button id="aaClose" class="aa-close">Chiudi</button>
  </div>

  <div id="aaBody" class="aa-body">
    <div class="aa-msg aa-bot">Ciao 👋 Posso aiutarti con <b>prenotazioni</b>, <b>orari</b> e <b>menù</b>. In cosa posso esserti utile?</div>
    <div id="aaQuick" class="aa-quick">
      <span class="aa-chip">Prenota per stasera</span>
      <span class="aa-chip">Orari e indirizzo</span>
      <span class="aa-chip">Vedi il menù</span>
      <span class="aa-chip">Richiedi fattura</span>
    </div>
    <div id="aaTyping" class="aa-typing" aria-hidden="true">
      <span class="aa-dot"></span><span class="aa-dot"></span><span class="aa-dot"></span>
      <span style="margin-left:6px">Sta scrivendo…</span>
    </div>
    <div class="aa-gdpr">Usiamo l’AI per migliorare il servizio. Inviando un messaggio accetti l’elaborazione secondo la nostra informativa.</div>
  </div>

  <div class="aa-input">
    <input id="aaInput" placeholder="Scrivi qui… Es: Prenotazione domani alle 20 per 4" />
    <button id="aaSend">Invia</button>
  </div>

  <div id="aaLead" class="aa-lead">
    <div style="color:var(--muted); font-size:12px">Se preferisci, lasciaci un recapito e ti richiamiamo:</div>
    <input id="aaName" placeholder="Nome" />
    <input id="aaPhone" placeholder="Telefono" />
    <button id="aaSaveLead">Invia richiesta</button>
  </div>
</div>

<script>
(function(){
  const $ = s => document.querySelector(s);
  const chat = $("#aaChat"), body = $("#aaBody"), input = $("#aaInput");
  const typing = $("#aaTyping"), quick = $("#aaQuick");
  const leadBox = $("#aaLead");
  const sessionId = (localStorage.getItem("aa_session") || crypto.randomUUID());
  localStorage.setItem("aa_session", sessionId);

  const ctx = JSON.parse(localStorage.getItem("aa_ctx") || "[]");
  const pushCtx = (r,c) => { ctx.push({role:r, content:c}); if(ctx.length>12) ctx.splice(0, ctx.length-12); localStorage.setItem("aa_ctx", JSON.stringify(ctx)); }

  function toggle(){ chat.style.display = (chat.style.display==="flex"?"none":"flex"); }
  $("#aaToggle").onclick = toggle; $("#aaClose").onclick = toggle;

  function addMsg(text, who="bot"){
    const d = document.createElement("div"); d.className = "aa-msg " + (who==="bot"?"aa-bot":"aa-user"); d.innerHTML = text;
    body.insertBefore(d, typing); body.scrollTop = body.scrollHeight;
  }

  async function send(text){
    if(!text) return; addMsg(text, "user"); input.value=""; quick.style.display="none";
    pushCtx("user", text);

    typing.style.display="flex";
    try{
      const r = await fetch("/api/chat", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          sessionId,
          message: text,
          context: ctx,
          meta: {
            business: {
              name: "AI Automation Demo",
              city: "Mestre (VE)",
              booking_phone: "+39 334 596 5522",
              website: "https://aiautomation.enterprises/"
            },
            channel: "web"
          }
        })
      });
      const data = await r.json();
      typing.style.display="none";

      if(!r.ok){ addMsg("⛔ Servizio momentaneamente non disponibile. Lasciaci un recapito qui sotto 👉", "bot"); leadBox.style.display="block"; return; }

      const reply = (data.reply || "Ok.").replace(/\n/g,"<br>");
      addMsg(reply, "bot");
      pushCtx("assistant", data.reply || "Ok.");

      // se il bot chiede prenotazione → mostra quick
      if(/prenot/i.test(reply)) quick.style.display="flex";

      // se più di 6 messaggi senza esito → proponi lead
      const userTurns = ctx.filter(m=>m.role==="user").length;
      if(userTurns>=6) leadBox.style.display="block";

    }catch(e){
      typing.style.display="none";
      addMsg("⚠️ Connessione assente. Riprova tra poco o lascia un recapito sotto 👉", "bot");
      leadBox.style.display="block";
    }
    body.scrollTop = body.scrollHeight;
  }

  $("#aaSend").onclick = ()=> send(input.value.trim());
  input.addEventListener("keydown", e=>{ if(e.key==="Enter") send(input.value.trim()); });
  quick.addEventListener("click", e=>{ if(e.target.classList.contains("aa-chip")) send(e.target.textContent); });

  $("#aaSaveLead").onclick = async ()=>{
    const name = $("#aaName").value.trim(), phone = $("#aaPhone").value.trim();
    if(!phone){ addMsg("Inserisci un numero di telefono valido 📞", "bot"); return; }
    try{
      await fetch("/api/lead",{method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({sessionId, name, phone})});
    }catch(_){}
    addMsg("Grazie! Ti ricontattiamo a breve ✅", "bot"); leadBox.style.display="none";
  };
})();
</script>
<!-- ========== /CHAT WIDGET ========== -->
