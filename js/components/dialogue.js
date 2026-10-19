// Sistema de diálogo estilo JRPG/Undertale: caixa na parte inferior, avatar à esquerda, texto digitado e opções logo abaixo.
// Uso: DialogueSystem.open('mentor_hub'). Dados em js/data/dialogues.js · estilo em css/dialogue.css.
const DialogueSystem = (function (G) {
  const SPEED = 25;                 // ms por caractere (efeito typewriter)
  const $ = s => document.querySelector(s), artCache = {};
  let box, avatar, nameEl, textEl, optsEl, node, timer = null, closeTimer = null, full = '', pendingDone = null, npc = null, ready = false;

  const fill = s => s.replace(/\{nome\}/g, G.state.name || 'recruta');
  const click = () => { try { AudioEngine.playClick(); } catch (e) {} };   // o AudioEngine já respeita OPÇÕES > SOM

  // Arte 16x16 do NPC (usada no avatar e no mapa), desenhada a partir da grade de texto.
  function art(id) {
    const d = G.dialogues[id]; if (!d || !d.art) return null;
    if (artCache[id]) return artCache[id];
    const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
    ['', ...d.art].forEach((row, y) => {
      const n = 16 - row.length, l = n >> 1, line = '.'.repeat(l) + row + '.'.repeat(n - l);
      [...line].forEach((ch, i) => { if (d.palette[ch]) { x.fillStyle = d.palette[ch]; x.fillRect(i, y, 1, 1); } });
    });
    return artCache[id] = c;
  }

  function stopTyping() { clearInterval(timer); timer = null; if (textEl) textEl.classList.remove('typing'); }
  function finish() {               // termina a digitação (fim natural ou toque para pular)
    if (!timer) return;
    stopTyping(); node.data = full; const d = pendingDone; pendingDone = null; if (d) d();
  }

  // Digita o texto caractere por caractere. Chamar de novo cancela a digitação anterior.
  function typeText(text, done) {
    stopTyping();                   // troca de tópico no meio do texto: cancela o timer antigo
    full = text; pendingDone = done || null;
    node = document.createTextNode(''); textEl.replaceChildren(node); textEl.classList.add('typing');
    const chars = Array.from(text); let i = 0;
    timer = setInterval(() => {
      if (i >= chars.length) return finish();
      const ch = chars[i++]; node.data += ch;
      if (ch.trim() && i % 2 === 0) click();      // um blip a cada 2 letras (1 por letra ficaria metralhadora)
      textEl.scrollTop = textEl.scrollHeight;
    }, SPEED);
  }

  function showOptions(topics) {
    optsEl.replaceChildren(...topics.map(t => {
      const b = document.createElement('button'); b.type = 'button'; b.dataset.id = t.id; b.textContent = t.label;
      if (t.end) b.className = 'end'; return b;
    }));
  }

  function select(id) {
    const t = npc && npc.topics.find(x => x.id === id); if (!t) return;
    [...optsEl.children].forEach(b => b.classList.toggle('sel', b.dataset.id === id));
    if (t.end) { optsEl.classList.add('lock'); typeText(fill(t.text), () => { closeTimer = setTimeout(close, 900); }); }
    else typeText(fill(t.text));
  }

  function init() {
    if (ready) return; ready = true;
    box = $('#dialogue'); avatar = $('.dlg-avatar'); nameEl = $('.dlg-name'); textEl = $('.dlg-text'); optsEl = $('.dlg-options');
    optsEl.addEventListener('click', e => { const b = e.target.closest('button'); if (b) select(b.dataset.id); });
    textEl.addEventListener('click', finish);                       // toque no texto = pular a digitação
    addEventListener('keydown', e => {                              // teclado (PC): 1-4 escolhem, Enter/Espaço pulam, Esc fecha
      if (!api.active) return;
      const n = /^[1-9]$/.test(e.key) ? npc.topics[+e.key - 1] : null;
      if (e.key === 'Escape') close(); else if (n) select(n.id); else if (e.key === 'Enter' || e.key === ' ') finish(); else return;
      e.preventDefault(); e.stopPropagation();
    }, true);
  }

  function open(id) {
    const d = G.dialogues[id]; if (!d) return console.warn('Diálogo não encontrado:', id);
    init(); clearTimeout(closeTimer); npc = d;
    nameEl.textContent = d.name;
    const a = art(id); avatar.style.backgroundImage = d.avatar ? 'url(' + d.avatar + ')' : a ? 'url(' + a.toDataURL() + ')' : '';
    optsEl.classList.remove('lock'); showOptions(d.topics);
    box.classList.add('on'); api.active = true;
    typeText(fill(d.greeting));
  }

  function close() {
    stopTyping(); clearTimeout(closeTimer); pendingDone = null;
    if (box) box.classList.remove('on');
    if (npc) { G.state.met = true; G.save(); }                      // some o "!" do NPC no mapa
    npc = null; api.active = false;
  }

  const api = { active: false, open, typeText, showOptions, close, art };
  return api;
})(Game);
