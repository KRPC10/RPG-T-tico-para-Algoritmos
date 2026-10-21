// TREINAMENTO ANIMADO: 1) DEMONSTRAÇÃO — uma "mão" toca nos blocos de verdade, com legenda explicando cada passo
// (inclusive um erro e a correção); 2) PRÁTICA GUIADA — o jogador monta sozinho, com o bloco certo piscando.
// Usa a própria tela de batalha (mesmo código do jogo), em modo treino: sem dano, sem cronômetro, fora do relatório.
(function (G) {
  const $ = s => document.querySelector(s), A = window.Algo;
  const app = $('#app');
  const ov = document.createElement('div'); ov.id = 'trn'; ov.hidden = true;
  ov.innerHTML = `<div class="trn-block"></div><div class="trn-spot"></div>
    <div class="trn-hand" aria-hidden="true"><i class="trn-ripple"></i>
      <svg viewBox="0 0 24 24" width="40" height="40"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-.5V3.5a1.5 1.5 0 0 1 3 0V10m0-.5V5a1.5 1.5 0 0 1 3 0v8.5c0 4-2.6 7.5-7 7.5-3.3 0-5-1.7-6.6-4.3L3.2 13.4a1.6 1.6 0 0 1 2.6-1.8L9 15V11" fill="#f4f7ff" stroke="#0b0d14" stroke-width="1.4" stroke-linejoin="round"/></svg></div>
    <div class="trn-card" role="dialog" aria-live="polite" aria-label="Treinamento">
      <div class="trn-top"><span class="trn-tag">🎓 MODO TREINO</span><span class="trn-step"></span></div>
      <div class="trn-txt"></div>
      <div class="trn-row"></div>
    </div>`;
  app.appendChild(ov);
  const card = ov.querySelector('.trn-card'), txt = ov.querySelector('.trn-txt'), row = ov.querySelector('.trn-row'),
    stepEl = ov.querySelector('.trn-step'), spot = ov.querySelector('.trn-spot'), hand = ov.querySelector('.trn-hand'), block = ov.querySelector('.trn-block');
  hand.hidden = true;

  let token = 0, pausado = false, pular = false, opts = {}, langOrig = 'pt', pollT = null;
  const Cancel = {};
  const vivo = t => { if (t !== token) throw Cancel; };
  // espera "ms" de tempo de demonstração: respeita pausa e o botão PRÓXIMO
  async function espera(t, ms) {
    let passou = 0; pular = false;
    while (passou < ms) { vivo(t); if (pular) return; await new Promise(r => setTimeout(r, 80)); if (!pausado) passou += 80; }
  }
  const rect = el => { const a = app.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height }; };

  // ---------- destaque, legenda e mão ----------
  function destacar(el) {
    if (!el) { spot.style.display = 'none'; ov.classList.add('dim'); return null; }
    el.scrollIntoView({ block: 'nearest' }); const r = rect(el), p = 6; ov.classList.remove('dim');
    Object.assign(spot.style, { display: 'block', left: r.x - p + 'px', top: r.y - p + 'px', width: r.w + p * 2 + 'px', height: r.h + p * 2 + 'px' });
    return r;
  }
  function legenda(html, r, n, total, botoes) {
    txt.innerHTML = html; stepEl.textContent = n ? `passo ${n} de ${total}` : '';
    row.innerHTML = ''; (botoes || []).forEach(([rot, fn, cls]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = rot; if (cls) b.className = cls; b.onclick = fn; row.appendChild(b); });
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');
    posicionar(r);
  }
  // Posição da legenda: sobre a ARENA ou sobre o TERMINAL, o que NÃO cobrir o item destacado.
  // Funciona igual no celular em pé, deitado e no computador (onde o teclado fica na coluna da direita).
  function posicionar(r) {
    card.style.top = card.style.bottom = card.style.left = card.style.width = '';
    if (!r) { card.classList.add('mid'); return; }
    card.classList.remove('mid');
    const H = app.clientHeight, W = app.clientWidth, cruza = (a, b) => !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
    const uniao = (x, y) => ({ x: Math.min(x.x, y.x), y: Math.min(x.y, y.y), w: Math.max(x.x + x.w, y.x + y.w) - Math.min(x.x, y.x), h: Math.max(x.y + x.h, y.y + y.h) - Math.min(x.y, y.y) });
    const k = $('#keys'), ac = $('.actrow');
    const areas = [$('.crt') && rect($('.crt')), $('#term') && rect($('#term')), k && ac && uniao(rect(k), rect(ac))].filter(a => a && a.w > 0);
    const livres = areas.filter(a => !cruza(a, r));
    // largura provisória para medir a altura
    const medir = a => { const w = Math.min(460, Math.max(260, a.w - 8), W - 12); card.style.width = w + 'px'; return { a, w, h: card.offsetHeight }; };
    const ops = livres.map(medir), cabe = ops.filter(o => o.h <= o.a.h + 12);
    const esc = cabe[0] || ops.sort((p, q) => q.a.h - p.a.h)[0];
    let top, w;
    if (esc && (cabe.length || esc.a.w < W * .7)) { w = esc.w; card.style.width = w + 'px'; const h = card.offsetHeight; top = esc.a.y + Math.max(0, (esc.a.h - h) / 2); card.style.left = Math.max(6 + w / 2, Math.min(W - 6 - w / 2, esc.a.x + esc.a.w / 2)) + 'px'; }
    else { // celular em pé com pouco espaço: acima ou abaixo do destaque, onde houver mais espaço
      w = Math.min(460, W - 12); card.style.width = w + 'px'; card.style.left = W / 2 + 'px';
      const h = card.offsetHeight, cima = r.y, baixo = H - (r.y + r.h);
      top = cima >= h + 12 ? r.y - h - 8 : baixo >= h + 12 ? r.y + r.h + 8 : (cima > baixo ? 6 : H - h - 6);
    }
    const h = card.offsetHeight;
    card.style.top = Math.max(6, Math.min(H - h - 6, top)) + 'px';
  }
  async function tocar(t, el) {
    if (!el) return; const r = destacar(el);
    hand.hidden = false; hand.style.transform = `translate(${r.x + r.w / 2 - 12}px, ${r.y + r.h / 2 - 6}px)`;
    await espera(t, 650); vivo(t);
    hand.classList.remove('tap'); void hand.offsetWidth; hand.classList.add('tap');
    await new Promise(res => setTimeout(res, 180)); vivo(t); el.click();
  }
  const tecla = tok => $(`#keys .key[data-t="${CSS.escape(tok)}"]`);
  async function livre(t) { for (let i = 0; i < 120; i++) { vivo(t); const s = G.battle.info(); if (!s.busy) return; await new Promise(r => setTimeout(r, 100)); } }

  // botões fixos da demonstração
  const botoesDemo = () => [
    [pausado ? '▶ CONTINUAR' : '❚❚ PAUSAR', () => { pausado = !pausado; row.firstChild.textContent = pausado ? '▶ CONTINUAR' : '❚❚ PAUSAR'; }],
    ['PRÓXIMO ›', () => { pular = true; }],
    ['PULAR DEMO ⏭', () => pratica(), 'ghost']
  ];

  // ---------- 1) DEMONSTRAÇÃO ----------
  const MAPA1 = [['Se', 'if', 'k'], ['o firewall', 'firewall', 'v'], ['for igual ao', '==', 'o'], ['security_level', 'security_level', 'v'], ['ataque com hack', 'hack', 'a']];
  const mapa = m => '<div class="trn-map">' + m.map(([f, b, c], i) => `<span style="animation-delay:${.3 + i * .55}s"><i>${f}</i> → <b class="t-${c}">${b.replace('<', '&lt;').replace('>', '&gt;')}</b></span>`).join('') + '</div>';
  const PASSOS = [
    { t: 'Olá, <b>{nome}</b>! Em 1 minuto vou te mostrar como se monta um comando. <b>Só assista</b>: depois é a sua vez.', ms: 4200 },
    { el: '.crt', t: 'Aqui é a luta contra o <b>BOT-TREINO</b>. Para atacar você <b>não digita nada</b>: você monta um comando com blocos.', ms: 4600 },
    { el: '#mission', t: 'Primeiro leia a <b>MISSÃO</b> por partes. Cada parte da frase vira um bloco:' + mapa(MAPA1), ms: 7000 },
    { el: '#vars', t: 'Estes são os <b>valores agora</b>: firewall vale <b>3</b> e security_level vale <b>3</b>.', ms: 4000 },
    { tecla: 'if', t: '1º a <b class="t-k">DECISÃO</b>: “Se” vira o bloco <b class="t-k">if</b>.', ms: 1800 },
    { el: '#keys', t: 'Viu? Agora só os <b class="t-v">DADOS</b> acenderam. O jogo só libera o que pode vir a seguir, então <b>você nunca erra a escrita</b>.', ms: 4800 },
    { tecla: 'firewall', t: 'O que vamos comparar: <b class="t-v">firewall</b>.', ms: 1600 },
    { tecla: '==', t: '“For igual a” é <b class="t-o">==</b>. Dois sinais de igual significam <b>comparar</b>.', ms: 2600 },
    { tecla: 'security_level', t: 'O outro lado da comparação: <b class="t-v">security_level</b>.', ms: 1800 },
    { tecla: 'hack', t: 'E a <b class="t-a">AÇÃO</b> que acontece se for verdade: <b class="t-a">hack</b>.', ms: 2200 },
    { el: '#transbox', t: 'Aqui o jogo <b>lê o seu código em português</b>…', ms: 3000 },
    { sel: '#tabs [data-l="py"]', t: '…e mostra o <b>mesmo código em Python</b>, a linguagem usada no mercado.', ms: 3400 },
    { sel: '#exec', t: 'Comando completo! Agora é só tocar em <b>▶ EXECUTAR</b>.', exec: true },
    { el: '#feedback', t: 'O jogo <b>roda o código com os valores reais</b>: 3 == 3 é <b class="t-gr">VERDADEIRO</b>, então o hack acontece!', ms: 3200, proximo: 1 },
    { el: '#mission', t: 'E se errar? Nova missão: “Se hp for <b>maior que</b> target_hp…”. Vou <b>errar de propósito</b>.', ms: 4200 },
    { teclas: ['if', 'hp', '<', 'target_hp', 'disable'], t: 'Montei com <b class="t-o">&lt;</b> (menor que) no lugar de <b class="t-o">&gt;</b> (maior que)…', ms: 600 },
    { sel: '#exec', t: '…e executei.', exec: true },
    { el: '#feedback', t: 'O jogo <b>explica o erro</b>: com hp = 5 e target_hp = 2, “5 &lt; 2” é <b class="t-rd">FALSO</b>, então nada aconteceu. No treino você <b>não perde vida</b>.', ms: 5600 },
    { sel: '#code .chip[data-i="2"]', t: 'Para corrigir, toque no <b>bloco errado</b>: ele e os que vêm depois são apagados.', ms: 1600 },
    { teclas: ['>', 'target_hp', 'disable'], t: 'Agora com <b class="t-o">&gt;</b> (maior que)…', ms: 500 },
    { sel: '#exec', t: '…e executar de novo.', exec: true },
    { el: '.crt', t: '<b class="t-gr">Acertou!</b> Viu como funciona? Ler a frase, montar os blocos, executar e ler a explicação.', ms: 3800, fimDemo: true }
  ];

  async function demo() {
    const t = ++token; pausado = false; ov.classList.add('demo'); block.hidden = false;
    let fimLuta = false;
    G.battle.start(G.treino.demo, { treino: true, onEnd: () => { fimLuta = true; }, onExit: sair });
    try {
      await espera(t, 400);
      const total = PASSOS.length;
      for (let i = 0; i < total; i++) {
        const p = PASSOS[i], html = p.t.replace('{nome}', esc(G.state.name || 'recruta'));
        const alvo = p.tecla ? tecla(p.tecla) : p.sel ? $(p.sel) : p.el ? $(p.el) : p.teclas ? $('#keys') : null;
        const r = alvo ? destacar(alvo) : destacar(null);
        legenda(html, r, i + 1, total, botoesDemo());
        if (p.tecla || p.sel) { await espera(t, 500); await tocar(t, alvo); }
        if (p.teclas) for (const k of p.teclas) { await tocar(t, tecla(k)); await espera(t, 250); }
        hand.hidden = !(p.tecla || p.sel || p.teclas);
        if (p.exec) { await espera(t, 400); await livre(t); }
        if (p.ms) await espera(t, p.ms);
        if (p.proximo !== undefined) { for (let k = 0; k < 100 && G.battle.info().ci < p.proximo; k++) await espera(t, 100); }
        if (p.fimDemo) { for (let k = 0; k < 60 && !fimLuta; k++) await espera(t, 100); }
      }
      hand.hidden = true;
      destacar(null);
      legenda('<b>Sua vez!</b> 💪 Monte o próximo comando sozinho. O bloco certo vai <b>piscar</b> para te ajudar.', null, 0, 0,
        [['COMEÇAR ▶', () => pratica(), 'pri'], ['VER DE NOVO ↺', () => demo()]]);
    } catch (e) { if (e !== Cancel) throw e; }
  }

  // ---------- 2) PRÁTICA GUIADA ----------
  const papel = ['a DECISÃO (“Se” = if)', 'o 1º DADO da frase', 'a COMPARAÇÃO', 'o 2º DADO da frase', 'a AÇÃO'];
  function pratica() {
    const t = ++token; pausado = false; hand.hidden = true; ov.classList.remove('demo', 'dim'); block.hidden = true; spot.style.display = 'none';
    let ult = ''; G.state.lang = 'pt'; // na prática, o narrador em português ajuda mais
    let erroSeq = null;
    G.battle.start(G.treino.pratica, { treino: true, onEnd: (win, code) => concluir(code), onExit: sair,
      onExec: v => { if (v.ok) return; erroSeq = G.battle.info().seq.join(); ult = ''; legenda('<b>Quase!</b> Leia a explicação no terminal. Depois toque no <b>bloco que está piscando</b> para apagar e tente de novo. (No treino você não perde vida.)', rect($('#term')), 0, 0, [['SAIR DO TREINO', sair, 'ghost']]); } });
    G.battle.setHint(3); // o próximo bloco certo pisca
    clearInterval(pollT);
    pollT = setInterval(() => {
      if (t !== token) return clearInterval(pollT);
      const s = G.battle.info(); if (!s.ativo || s.busy) return;
      if (erroSeq !== null) { if (erroSeq === s.seq.join()) return; erroSeq = null; }
      const prox = A.proximoCerto(s.seq, s.solucao);
      let html;
      if (prox.apagar) html = 'Esse bloco não combina com a missão. <b>Toque no bloco que está piscando no terminal</b> para apagar a partir dele.';
      else if (prox.token) { const c = A.cat(prox.token); html = `Passo ${s.seq.length + 1}: agora vem ${papel[s.seq.length] || 'o próximo bloco'}. Toque em <b class="t-${c}">${esc(prox.token)}</b> (piscando).`; }
      else html = 'Perfeito! Agora toque em <b>▶ EXECUTAR</b>.';
      if (html !== ult) { ult = html; legenda(html, rect($('#keys')), 0, 0, [['SAIR DO TREINO', sair, 'ghost']]); }
    }, 200);
  }

  // ---------- conclusão ----------
  function concluir(code) {
    token++; clearInterval(pollT);
    G.state.treino = true; G.state.seen = G.state.seen || {}; G.state.seen.battle = true; G.state.lang = langOrig; G.save();
    ov.classList.add('dim'); block.hidden = false; hand.hidden = true; spot.style.display = 'none';
    const py = A.traduzir(code && code.length ? code : G.treino.pratica.challenges[0].solucao, 'py').map(s => s.t === '\n' ? '\n' : `<span class="${s.c ? 't-' + s.c : ''}">${esc(s.t)}</span>`).join('');
    legenda(`<b class="t-gr">🎉 TREINO CONCLUÍDO, ${esc(G.state.name || 'recruta')}!</b><br>Você montou seu primeiro algoritmo. Em Python ele fica assim:<pre class="trn-code">${py}</pre>`,
      null, 0, 0, [['IR PARA A FASE 1 ▶', () => { fechar(); (opts.fim || (() => G.show('title')))(); }, 'pri'], ['REPETIR TREINO ↺', () => demo()]]);
    try { AudioEngine.playSuccess(); } catch (e) {}
  }

  function fechar() { token++; clearInterval(pollT); ov.hidden = true; ov.classList.remove('demo', 'dim'); hand.hidden = true; block.hidden = true; $('#screen-battle').classList.remove('treino'); G.state.lang = langOrig; G.save(); }
  function sair() { fechar(); (opts.sair || (() => G.show('title')))(); }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  G.training = {
    open(o) {
      opts = o || {}; langOrig = G.state.lang || 'pt'; G.state.lang = 'pt';
      G.state.seen = G.state.seen || {}; G.state.seen.battle = true; // o treino substitui os balões da 1ª batalha
      ov.hidden = false; demo();
    },
    ativo: () => !ov.hidden
  };
  addEventListener('resize', () => { if (!ov.hidden && spot.style.display === 'block') { /* reposiciona no próximo passo */ } });
})(Game);
