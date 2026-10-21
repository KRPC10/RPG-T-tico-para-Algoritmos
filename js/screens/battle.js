// Batalha: o jogador monta o código com blocos, o interpretador (js/lang/algo.js) executa e o resultado vira golpe.
//
// O que torna a batalha fácil para iniciantes:
//  • Teclado guiado: só ficam acesos os blocos que podem vir agora → erro de sintaxe é impossível.
//  • Espaços tracejados mostram o que ainda falta (DADO, COMPARAR, AÇÃO…).
//  • Narrador: o código montado é lido em português em tempo real (aba PT), e também em Python e JavaScript.
//  • Execução passo a passo: antes do golpe, o terminal mostra a condição sendo testada com os valores reais.
//  • Erro explicado: mostra o cenário em que a lógica falhou, sem apagar o que o aluno montou.
//  • Dica em 3 níveis sob demanda (o 3º pisca o próximo bloco certo).
(function (G) {
  const $ = s => document.querySelector(s), A = window.Algo, MAXHP = 115;
  const WRONG = { dmg: 15, label: 'LÓGICA!', toast: '✖ LÓGICA INCORRETA −15 HP', claws: 2 };
  const LOOP = { dmg: 20, label: 'LOOP ∞', toast: '∞ LAÇO INFINITO −20 HP', claws: 3 };
  const TIMEOUT = { dmg: 25, label: 'TEMPO!', toast: '⏱ TEMPO ESGOTADO −25 HP', claws: 3 };
  const STEP_MS = 420; // tempo de cada passo da execução animada
  let L, ci, seq, php, bhp, busy, rid = 0, tmr = null, deadline = 0, tlen = 0, prev = 0, lastTick = -1;
  let hintLvl = 0, errs = 0, tries = 0, tCh = 0, stats, lastCode = [];
  const sfx = n => { try { if (G.state.sound !== false) AudioEngine[n](); } catch (e) {} }; // som nunca pode travar o jogo
  let O = {}; // opções da luta atual (treino: { treino, onNext, onExec, onEnd, onExit })
  const log = (t, d) => { if (O.treino) return; try { G.metrics.log(t, d); } catch (e) {} }; // treino não entra no relatório
  const after = (r, ms, fn) => setTimeout(() => { if (r === rid && G.current === 'battle') fn(); }, ms);
  const ch = () => L.challenges[ci];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wbr = t => esc(t).replace(/_/g, '_<wbr>');
  const conceito = c => c.solucao[0] === 'while' ? 'while' : c.solucao.includes('else') ? 'else' : 'if';

  // ---------- Início da luta ----------
  G.battle = { start(level, opts) {
    O = opts || {}; $('#screen-battle').classList.toggle('treino', !!O.treino); $('#b-exit').textContent = O.treino ? '✕ SAIR' : '‹ MAPA';
    rid++; timerStop(); L = level; ci = 0; php = MAXHP; bhp = L.boss.hp; busy = false;
    stats = { desafios: L.challenges.length, primeira: 0, erros: 0, dicas: 0, loops: 0, tempos: 0, t0: Date.now() };
    $('#b-phase').parentNode.firstChild.textContent = O.treino ? '' : 'FASE '; $('#b-phase').textContent = O.treino ? 'TREINO' : L.id; $('#boss-name').textContent = L.boss.name; $('#boss-lvl').textContent = L.boss.lvl;
    $('#player-name').textContent = G.state.name || 'JOGADOR';
    $('#player-spr').style.backgroundImage = `url(assets/sprites/player${G.avatar ? G.avatar().suf : ''}.png)`; // avatar da tela de acesso
    $('#boss-spr').style.backgroundImage = `url(assets/sprites/${L.boss.sprite}.png)`; $('#boss-spr').setAttribute('aria-label', L.boss.name);
    $('#boss-spr').classList.toggle('big', !!L.boss.big);
    $('#timer').hidden = !L.timer;
    buildKeys(); hp(); G.show('battle'); fitKeys($('#keys')); newChallenge();
    log('luta_inicio', { fase: L.id });
    if (L.timer && !G.state.calmo && !O.treino) {
      G.toast('⚠ CHEFÃO!', 'var(--ye)'); sfx('playAlarm');
      const r = rid; if (G.tutorialRun && !G.state.seen.timer) setTimeout(() => { if (r === rid && G.current === 'battle') G.tutorialRun('timer'); }, 1200);
    }
  } };

  function newChallenge() {
    seq = []; hintLvl = 0; errs = 0; tries = 0; tCh = Date.now();
    feedback(''); render(); timerStart(); taunt();
    log('desafio_inicio', { fase: L.id, desafio: ci + 1, conceito: conceito(ch()) });
    if (O.onNext) O.onNext(ci);
  }

  // ---------- Teclado em linhas por categoria ----------
  function buildKeys() {
    const rows = ['k', 'o', 'v', 'a'].map(c => {
      const ks = L.keys.filter(t => A.cat(t) === c); if (!ks.length) return '';
      return `<div class="krow"><span class="klab c-${c}"><i>${A.CATS[c].icone}</i>${A.CATS[c].rotulo}</span><div class="kbtns">` +
        ks.map(t => `<button class="key ${c}" data-t="${esc(t)}" aria-label="${esc(t)}">${wbr(t)}</button>`).join('') + '</div></div>';
    });
    $('#keys').innerHTML = rows.join('');
  }

  // Diminui a fonte só dos blocos em que o nome não cabe (ex.: security_level em telas de 320px). Mínimo de 9px.
  function fitKeys(root) {
    (root || document).querySelectorAll('.key').forEach(k => {
      k.style.fontSize = ''; k.style.letterSpacing = ''; let fs = parseFloat(getComputedStyle(k).fontSize);
      const estoura = () => k.scrollWidth > k.clientWidth || k.scrollHeight > k.clientHeight;
      while (estoura() && fs - .5 >= 9) { fs -= .5; k.style.fontSize = fs + 'px'; }
      if (estoura()) k.style.letterSpacing = '-.05em'; // último recurso: letras um pouco mais juntas
    });
  }
  G.fitKeys = fitKeys;
  let fitT; addEventListener('resize', () => { clearTimeout(fitT); fitT = setTimeout(() => { if (G.current === 'battle' || G.current === 'bench') fitKeys(); }, 120); });

  // ---------- Desenho da tela ----------
  const hp = () => {
    $('#php').textContent = php + '/' + MAXHP; $('#php-bar').style.width = php / MAXHP * 100 + '%';
    $('#bhp').textContent = bhp; $('#bhp-bar').style.width = bhp / L.boss.hp * 100 + '%';
  };

  // Missão com as palavras-bloco coloridas (mesma cor do bloco no teclado)
  const PAL = { 'se': 'k', 'senão': 'k', 'enquanto': 'k', 'break': 'k', 'igual a': 'o', 'igual ao': 'o', 'diferente de': 'o', 'maior que': 'o', 'menor que': 'o' };
  function colorMission(txt) {
    const dic = Object.assign({}, PAL); L.keys.forEach(t => { if (/^[a-z_]+$/.test(t) && A.cat(t) !== 'k') dic[t] = A.cat(t); });
    const alts = Object.keys(dic).sort((a, b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return esc(txt).replace(new RegExp('(^|[^A-Za-zÀ-ú_])(' + alts + ')(?![A-Za-zÀ-ú_])', 'gi'), (m, pre, w) => `${pre}<b class="t-${dic[w.toLowerCase()]}">${w}</b>`);
  }

  function varsHTML(estado) {
    const vs = [...new Set(ch().solucao.filter(t => A.cat(t) === 'v'))];
    return vs.map(v => `<span class="var"><b>${esc(v)}</b> = <i>${estado[v] !== undefined ? estado[v] : 0}</i></span>`).join('');
  }

  const segHTML = segs => segs.map(s => s.t === '\n' ? '\n' : `<span class="${s.c ? 't-' + s.c : ''}">${esc(s.t)}</span>`).join('');

  function render() {
    const c = ch(), st = A.estado(seq);
    $('#mission').innerHTML = '<span class="mlab">MISSÃO</span> ' + colorMission(c.intent);
    $('#vars').innerHTML = varsHTML(c.testes[0]);
    // código montado (cada bloco é tocável para apagar) + espaços que faltam
    const placed = seq.map((t, i) => `<button class="chip ${A.cat(t)}" data-i="${i}" aria-label="apagar ${esc(t)}">${esc(t)}</button>`).join('');
    const ghosts = st.falta.map(f => `<span class="ghost ${f}">${A.CATS[f].rotulo}</span>`).join('');
    const opt = st.opcional.map(t => `<span class="ghost opt">+ ${t} (opcional)</span>`).join('');
    $('#code').innerHTML = '<b class="prompt">&gt;</b>' + placed + ghosts + opt + (seq.length ? '' : '<span class="start">toque nos blocos acesos ↓</span>');
    // tradução ao vivo
    const lang = G.state.lang || 'pt';
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.l === lang));
    const tr = A.traduzir(seq, lang);
    $('#trans').innerHTML = tr.length ? segHTML(tr) : '<span class="dim">A tradução do seu código aparece aqui.</span>';
    // teclado: só o que pode vir agora fica aceso
    const next = hintLvl >= 3 ? A.proximoCerto(seq, c.solucao) : null;
    document.querySelectorAll('#keys .key').forEach(b => {
      const ok = st.aceita(b.dataset.t); b.disabled = !ok || busy; b.classList.toggle('off', !ok);
      b.classList.toggle('pulse', !!(next && next.token === b.dataset.t));
    });
    if (next && next.apagar) { const chips = document.querySelectorAll('#code .chip'); const k = chips[chips.length - next.apagar]; if (k) k.classList.add('pulse'); }
    // botão executar
    const ex = $('#exec');
    ex.classList.toggle('ready', st.completo && !busy);
    ex.innerHTML = st.completo ? '▶ EXECUTAR' : `<small>FALTA</small> ${A.CATS[st.falta[0]] ? A.CATS[st.falta[0]].rotulo : '…'}`;
    $('#undo').disabled = !seq.length || busy;
    $('#hint').classList.toggle('pulse', errs >= 2 && hintLvl < 3);
    $('#hint').textContent = hintLvl ? `💡 DICA ${hintLvl}/3` : '💡 DICA';
  }

  function feedback(html, kind) {
    const f = $('#feedback'); f.hidden = !html; f.className = 'feedback ' + (kind || ''); f.innerHTML = html || '';
    if (html) f.scrollIntoView({ block: 'nearest' });
  }
  function taunt() {
    const b = $('#bubble'), fs = L.boss.falas || []; if (!fs.length) return;
    b.textContent = fs[Math.floor(Math.random() * fs.length)]; b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  }

  // ---------- Temporizador do chefão (desligado no Modo Acolhimento) ----------
  function timerStart() {
    timerStop(); if (!L.timer || G.state.calmo || O.treino) { $('#timer').hidden = true; return; }
    $('#timer').hidden = false;
    tlen = (ch().time || L.timer) * 1000; prev = deadline = performance.now(); deadline += tlen; lastTick = -1;
    const bar = $('#timer-bar'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = '';
    $('#timer').classList.remove('low'); $('#timer-txt').textContent = Math.ceil(tlen / 1000) + 's';
    tmr = setInterval(timerTick, 100);
  }
  function timerStop() { clearInterval(tmr); tmr = null; }
  function timerTick() {
    if (G.current !== 'battle') return timerStop();
    const now = performance.now(), dt = now - prev; prev = now;
    if ($('#coach').classList.contains('on') || document.hidden || busy) { deadline += dt; return; } // pausa
    const left = deadline - now, s = Math.ceil(Math.max(0, left) / 1000);
    $('#timer-bar').style.width = Math.max(0, left / tlen * 100) + '%'; $('#timer-txt').textContent = s + 's';
    $('#timer').classList.toggle('low', left <= 5000);
    if (left <= 5000 && left > 0 && s !== lastTick) { lastTick = s; sfx('playTick'); }
    if (left <= 0) { timerStop(); timeout(); }
  }
  function timeout() {
    if (busy) return;
    busy = true; stats.tempos++; log('tempo_esgotado', { fase: L.id, desafio: ci + 1 }); render(); const r = rid;
    feedback('<b>⏱ TEMPO ESGOTADO</b><br>O chefe atacou. Seu código continua aí: termine e execute!', 'bad');
    bossAttack(r, TIMEOUT, () => { busy = false; if (php <= 0) return end(false); render(); timerStart(); });
  }

  // ---------- Ataques ----------
  function playerHit(r, dmg, combo) {
    lunge('.player', 'lunge-r');
    after(r, 120, () => { sfx('playSlash'); spawnSlash('#boss-spr', 'hero', { rot: -4 }); });
    after(r, 220, () => { sfx('playSlash'); spawnSlash('#boss-spr', 'hero', { flip: true, rot: 4 }); });
    after(r, 290, () => {
      bhp = Math.max(0, bhp - dmg); hp(); flash('.boss'); sfx('playHit'); triggerImpact();
      spawnDamageText('#boss-spr', (combo > 1 ? 'COMBO x' + combo + ' ' : '') + '-' + dmg, combo > 1 ? 'crit' : 'boss-hit');
    });
  }
  function bossAttack(r, o, done) {
    const cuts = [{ dx: -14, dy: -6, rot: -6 }, { dx: 14, dy: 2, rot: -6, flip: true }, { dx: 0, dy: 10, rot: 12 }].slice(0, o.claws);
    const dmg = O.treino ? 0 : G.state.calmo ? Math.ceil(o.dmg / 2) : o.dmg; // no treino ninguém perde vida
    lunge('.boss', 'lunge-l');
    cuts.forEach((c, k) => after(r, 170 + k * 90, () => { sfx('playSlash'); spawnSlash('#player-spr', 'boss', c); }));
    const t = 170 + (o.claws - 1) * 90 + 120;
    after(r, t, () => {
      php = Math.max(0, php - dmg); hp(); flash('.player'); sfx('playError'); triggerImpact();
      spawnDamageText('#player-spr', dmg ? o.label + ' -' + dmg : 'SEM DANO', 'error'); G.toast(dmg ? o.toast.replace(/−\d+/, '−' + dmg) : o.toast.replace(/ −\d+ HP/, ' · TREINO: SEM DANO'), 'var(--rd)');
    });
    after(r, t + 560, done);
  }
  const flash = sel => { const e = $('#screen-battle ' + sel); e.classList.add('hit'); setTimeout(() => e.classList.remove('hit'), 600); };
  const lunge = (sel, cls) => { const e = $('#screen-battle ' + sel); e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); setTimeout(() => e.classList.remove(cls), 400); };

  // ---------- Entrada ----------
  $('#keys').addEventListener('click', e => {
    const b = e.target.closest('.key'); if (!b || busy) return;
    const t = b.dataset.t; if (!A.estado(seq).aceita(t)) return; // teclado guiado: nunca entra bloco inválido
    seq.push(t); navigator.vibrate && G.state.vibra !== false && navigator.vibrate(12); sfx('playClick');
    if (!$('#feedback').classList.contains('tip')) feedback('');
    render();
  });
  $('#code').addEventListener('click', e => { // tocar num bloco montado apaga ele e tudo depois dele
    const c = e.target.closest('.chip'); if (!c || busy) return; seq = seq.slice(0, +c.dataset.i); sfx('playClick'); render();
  });
  $('#undo').addEventListener('click', () => { if (!busy && seq.length) { seq.pop(); render(); } });
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; G.state.lang = b.dataset.l; G.save(); render(); });
  $('#hint').addEventListener('click', () => {
    if (busy) return;
    hintLvl = Math.min(3, hintLvl + 1); stats.dicas++; log('dica', { fase: L.id, desafio: ci + 1, nivel: hintLvl });
    const d = ch().dicas || [];
    const txt = hintLvl < 3 ? (d[hintLvl - 1] || d[0] || 'Leia a missão com calma, na ordem das palavras.') : 'Siga o bloco que está <b>piscando</b>. Se um bloco montado piscar, toque nele para apagar a partir dali.';
    feedback(`<b>💡 DICA ${hintLvl}/3</b><br>${txt}`, 'tip'); render();
  });

  $('#exec').addEventListener('click', () => {
    if (busy) return;
    const st = A.estado(seq);
    if (!st.completo) { G.toast('FALTA: ' + (A.CATS[st.falta[0]] || { rotulo: 'BLOCO' }).rotulo, 'var(--ye)'); return; }
    const c = ch(), v = A.validar(seq, c); tries++;
    busy = true; render(); const r = rid;
    log('execucao', { fase: L.id, desafio: ci + 1, conceito: conceito(c), ok: v.ok, resultado: v.ok ? 'ok' : v.tipo, tentativa: tries, blocos: seq.length, minimo: c.solucao.length, ms: Date.now() - tCh, codigo: seq.join(' ') });
    // anima o passo a passo com o cenário da batalha (1º teste)
    const run = v.ok ? v.r : A.executar(A.parse(seq), c.testes[0], c.efeitos);
    const passos = run.passos.slice(0, v.tipo === 'infinito' ? 6 : 14);
    const linhas = [];
    const nAcoes = passos.filter(p => p.tipo === 'acao').length;
    let hit = 0, t = 0;
    passos.forEach(p => {
      after(r, t, () => {
        linhas.push(traceLine(p)); feedback('<b>▶ EXECUTANDO…</b><br>' + linhas.join('<br>'), 'run');
        if (p.estado) $('#vars').innerHTML = varsHTML(p.estado);
        if (p.tipo === 'acao' && v.ok) { hit++; const per = Math.floor(L.dmg / nAcoes); playerHit(r, hit === nAcoes ? L.dmg - per * (nAcoes - 1) : per, nAcoes > 1 ? hit : 1); } // o último golpe leva o resto: soma = dano da fase
        else sfx('playTick');
      });
      t += STEP_MS;
    });
    if (!passos.length) after(r, 0, () => feedback('<b>▶ EXECUTANDO…</b><br>(nenhum passo)', 'run'));
    after(r, t + 250, () => {
      if (O.onExec) O.onExec(v);
      if (v.ok) {
        if (tries === 1) stats.primeira++;
        lastCode = seq.slice();
        feedback(`<b>✔ CÓDIGO CORRETO${tries === 1 ? ' DE PRIMEIRA!' : '!'}</b><br>${linhas.join('<br>')}`, 'good');
        G.toast(nAcoes > 1 ? `⚡ COMBO x${nAcoes}!` : '⚡ LÓGICA VÁLIDA', 'var(--gr)');
        after(r, 900, () => {
          busy = false;
          if (bhp <= 0) return end(true);
          ci = Math.min(ci + 1, L.challenges.length - 1); newChallenge();
        });
      } else if (v.tipo === 'estrutura') { // lógica certa, conceito diferente do pedido: orienta sem tirar vida
        const x = A.explicar(v);
        feedback(`<b>💡 ${x.titulo}</b><br>${esc(x.texto)}`, 'tip');
        busy = false; render(); timerStart();
      } else {
        errs++; stats.erros++; if (v.tipo === 'infinito') stats.loops++;
        if (v.tipo === 'infinito') linhas.push('<span class="t-rd">∞ … repetiria para sempre!</span>');
        const x = A.explicar(v);
        feedback(`<b>✖ ${x.titulo}</b><br>${esc(x.texto)}<br><span class="dim">Seu código continua montado: ajuste e execute de novo.</span>`, 'bad');
        bossAttack(r, v.tipo === 'infinito' ? LOOP : WRONG, () => {
          busy = false; $('#vars').innerHTML = varsHTML(c.testes[0]);
          if (php <= 0) return end(false);
          render(); timerStart();
        });
      }
    });
  });

  function traceLine(p) {
    if (p.tipo === 'cond') return `<span class="t-k">testa</span> ${esc(p.cond.esq)} ${esc(p.cond.op)} ${esc(p.cond.dir)} → ${p.a} ${esc(p.cond.op)} ${p.b} → ` +
      (p.r ? '<b class="t-gr">✔ VERDADEIRO</b>' : '<b class="t-rd">✘ FALSO</b>');
    if (p.tipo === 'acao') return `<span class="t-a">⚡ ${esc(p.acao)}()</span>`;
    if (p.tipo === 'senao') return '<span class="t-k">↪ senão (else)</span>';
    if (p.tipo === 'break') return '<span class="t-k">■ break: sai da repetição</span>';
    return '';
  }

  $('#b-exit').addEventListener('click', () => { timerStop(); rid++; busy = false; if (O.onExit) return O.onExit(); G.map.resume(); });
  // usados pelo treinamento animado (js/screens/training.js)
  G.battle.info = () => ({ seq: seq.slice(), ci, busy, solucao: ch().solucao, ativo: G.current === 'battle' });
  G.battle.setHint = n => { hintLvl = n; render(); };
  addEventListener('keydown', e => {
    if (G.current !== 'battle' || $('#coach').classList.contains('on')) return;
    if (e.key === 'Enter') $('#exec').click(); else if (e.key === 'Backspace') $('#undo').click(); else if (e.key === 'Escape') $('#b-exit').click();
  });

  // ---------- Fim da luta: tela de resultado ----------
  function end(win) {
    timerStop(); rid++;
    if (O.onEnd) return O.onEnd(win, lastCode.slice());
    const seg = Math.round((Date.now() - stats.t0) / 1000);
    log('luta_fim', { fase: L.id, vitoria: win, segundos: seg, primeira: stats.primeira, erros: stats.erros, dicas: stats.dicas });
    const ultima = win && G.levels.indexOf(L) === G.levels.length - 1;
    if (win) { G.state.phase = Math.max(G.state.phase, G.levels.indexOf(L) + 1); G.save(); sfx('playSuccess'); }
    const stars = win ? 1 + (stats.erros === 0 ? 1 : 0) + (stats.dicas === 0 ? 1 : 0) : 0;
    $('#res-title').textContent = win ? (ultima ? 'CHEFÃO DERROTADO!' : 'MISSÃO CUMPRIDA') : 'SISTEMA REINICIADO';
    $('#res-title').className = 'logo sm ' + (win ? 'win' : 'lose');
    $('#res-stars').innerHTML = win ? [0, 1, 2].map(i => `<i class="${i < stars ? 'on' : ''}" style="animation-delay:${i * .25}s">★</i>`).join('') : '';
    $('#res-stats').innerHTML = [
      ['Conceito', esc(L.conceito || '')],
      ['Acertos de primeira', `${stats.primeira}/${stats.desafios}`],
      ['Erros de lógica', stats.erros + (stats.loops ? ` (${stats.loops} laço infinito)` : '')],
      ['Dicas usadas', stats.dicas], ['Tempo', seg + ' s']
    ].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
    $('#res-code').innerHTML = win && lastCode.length
      ? `<div class="rc-lab">Seu último código, em Python:</div><pre>${segHTML(A.traduzir(lastCode, 'py'))}</pre>`
      : '<div class="rc-lab">Dica: fale com o Mentor no mapa e use o botão 💡 DICA na batalha.</div>';
    $('#res-next').textContent = win ? (ultima ? 'VER RELATÓRIO' : 'CONTINUAR') : 'TENTAR DE NOVO';
    $('#res-next').onclick = () => {
      if (!win) return G.battle.start(L);
      if (ultima) { G.state.phase = 0; G.save(); return G.report.open('title'); }
      G.map.start(Math.min(G.state.phase, G.levels.length - 1));
    };
    $('#res-map').hidden = win;
    $('#res-map').onclick = () => G.map.start(G.levels.indexOf(L));
    G.show('result');
  }
})(Game);
