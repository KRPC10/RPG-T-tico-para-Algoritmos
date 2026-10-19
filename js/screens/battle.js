// Batalha: monta o código com tokens, valida contra as soluções da fase e aplica dano.
// Fases com "timer" (chefão): cada desafio tem tempo limite; se acabar, o chefe ataca.
(function (G) {
  const $ = s => document.querySelector(s), MAXHP = 115, CAT = { k: 't-k', o: 't-o', v: 't-v', a: 't-a' };
  const WRONG = { dmg: 15, label: 'SYNTAX ERROR!', toast: '✖ LÓGICA INCORRETA −15 HP', claws: 2 };   // chefe revida quando erra
  const TIMEOUT = { dmg: 25, label: 'TEMPO!', toast: '⏱ TEMPO ESGOTADO −25 HP', claws: 3 };          // chefe ataca quando o tempo acaba
  let L, ci, seq, php, bhp, busy, rid = 0, tmr = null, deadline = 0, tlen = 0, prev = 0, lastTick = -1;
  const sfx = n => { try { AudioEngine[n](); } catch (e) {} }; // som nunca pode travar o jogo
  const low = () => php < MAXHP / 2; // abaixo da metade da vida → libera dica
  // executa fn depois de ms, a menos que a luta tenha sido reiniciada ou o jogador saído da batalha
  const after = (r, ms, fn) => setTimeout(() => { if (r === rid && G.current === 'battle') fn(); }, ms);

  G.battle = { start(level) {
    rid++; timerStop(); L = level; ci = 0; seq = []; php = MAXHP; bhp = L.boss.hp; busy = false;
    $('#b-phase').textContent = L.id; $('#boss-name').textContent = L.boss.name; $('#boss-lvl').textContent = L.boss.lvl; $('#player-name').textContent = G.state.name || 'JOGADOR';
    $('#boss-spr').style.backgroundImage = `url(assets/sprites/${L.boss.sprite}.png)`; $('#boss-spr').setAttribute('aria-label', L.boss.name);
    $('#boss-spr').classList.toggle('big', !!L.boss.big);
    $('#timer').hidden = !L.timer;
    $('#keys').innerHTML = L.keys.map((k, i) => k
      ? `<button class="key ${k[1]}${k[0].length > 9 ? ' long' : ''}" data-i="${i}">${k[0]}</button>`
      : '<button class="key off"></button>').join('');
    hp(); render(); G.show('battle');
    if (L.timer) {
      G.toast('⚠ CHEFÃO!', 'var(--ye)'); sfx('playAlarm'); timerStart();
      const r = rid; if (G.tutorialRun && !G.state.seen.timer) setTimeout(() => { if (r === rid && G.current === 'battle') G.tutorialRun('timer'); }, 1200);
    }
  } };

  const hp = () => {
    $('#php').textContent = php + '/' + MAXHP; $('#php-bar').style.width = php / MAXHP * 100 + '%';
    $('#bhp').textContent = bhp; $('#bhp-bar').style.width = bhp / L.boss.hp * 100 + '%';
  };
  const render = () => {
    $('#intent').textContent = '// ' + L.challenges[ci].intent;
    $('#tip').hidden = !low(); $('#tip').textContent = '💡 Dica: ' + L.challenges[ci].hint;
    $('#code').innerHTML = '<b class="t-a">&gt;</b> ' + seq.map(i => `<span class="${CAT[L.keys[i][1]]}">${L.keys[i][0]}</span>`).join('') + '<i class="cur"></i>';
  };
  const flash = sel => { const e = $('#screen-battle ' + sel); e.classList.add('hit'); setTimeout(() => e.classList.remove('hit'), 600); };
  const lunge = (sel, cls) => { const e = $('#screen-battle ' + sel); e.classList.remove(cls); void e.offsetWidth; e.classList.add(cls); setTimeout(() => e.classList.remove(cls), 400); };

  // ---------- Temporizador do chefão ----------
  function timerStart() {
    timerStop(); if (!L.timer) return;
    tlen = (L.challenges[ci].time || L.timer) * 1000; prev = deadline = performance.now(); deadline += tlen; lastTick = -1;
    const bar = $('#timer-bar'); bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = '';
    $('#timer').classList.remove('low'); $('#timer-txt').textContent = Math.ceil(tlen / 1000) + 's';
    tmr = setInterval(timerTick, 100);
  }
  function timerStop() { clearInterval(tmr); tmr = null; }
  function timerTick() {
    if (G.current !== 'battle') return timerStop();
    const now = performance.now(), dt = now - prev; prev = now;
    // pausa enquanto o tutorial está aberto ou a aba está escondida
    if ($('#coach').classList.contains('on') || document.hidden) { deadline += dt; return; }
    const left = deadline - now, s = Math.ceil(Math.max(0, left) / 1000);
    $('#timer-bar').style.width = Math.max(0, left / tlen * 100) + '%'; $('#timer-txt').textContent = s + 's';
    $('#timer').classList.toggle('low', left <= 5000);
    if (left <= 5000 && left > 0 && s !== lastTick) { lastTick = s; sfx('playTick'); }
    if (left <= 0) { timerStop(); timeout(); }
  }
  function timeout() {
    if (busy) return;
    busy = true; const r = rid;
    bossAttack(r, TIMEOUT, () => { busy = false; if (php <= 0) return end(false); seq = []; render(); timerStart(); });
  }

  // ---------- Ataques com cortes ----------
  function playerAttack(r, done) {
    lunge('.player', 'lunge-r');
    after(r, 150, () => { sfx('playSlash'); spawnSlash('#boss-spr', 'hero', { rot: -4 }); });
    after(r, 260, () => { sfx('playSlash'); spawnSlash('#boss-spr', 'hero', { flip: true, rot: 4 }); });       // corte em X
    after(r, 330, () => {
      bhp = Math.max(0, bhp - L.dmg); hp(); flash('.boss'); sfx('playHit'); triggerImpact();
      spawnDamageText('#boss-spr', '-' + L.dmg + ' HP', 'boss-hit');
      G.toast('⚡ SINTAXE VÁLIDA −' + L.dmg + ' HP', 'var(--gr)');
    });
    after(r, 900, done);
  }
  function bossAttack(r, o, done) {
    const was = low();
    const cuts = [{ dx: -14, dy: -6, rot: -6 }, { dx: 14, dy: 2, rot: -6, flip: true }, { dx: 0, dy: 10, rot: 12 }].slice(0, o.claws);
    lunge('.boss', 'lunge-l');
    cuts.forEach((c, k) => after(r, 170 + k * 90, () => { sfx('playSlash'); spawnSlash('#player-spr', 'boss', c); }));
    const t = 170 + (o.claws - 1) * 90 + 120;
    after(r, t, () => {
      php = Math.max(0, php - o.dmg); hp(); flash('.player'); sfx('playError'); triggerImpact();
      spawnDamageText('#player-spr', o.label + ' -' + o.dmg, 'error');
      G.toast(o.toast + (!was && low() ? ' · 💡 DICA LIBERADA' : ''), 'var(--rd)');
    });
    after(r, t + 560, done);
  }

  $('#keys').addEventListener('click', e => {
    const b = e.target.closest('.key[data-i]');
    if (!b || busy || seq.length >= 8) return;
    seq.push(+b.dataset.i); navigator.vibrate && navigator.vibrate(15); sfx('playClick'); render();
  });
  $('#term').addEventListener('click', () => { if (!busy) { seq.pop(); render(); } }); // toque no terminal = desfazer

  $('#exec').addEventListener('click', () => {
    if (busy || !seq.length) return;
    const s = seq.map(i => L.keys[i][0]).join(' ').replace(/ ;$/, '');
    const ok = L.challenges[ci].solutions.some(x => x.join(' ') === s);
    busy = true; timerStop(); const r = rid;
    const done = () => {
      busy = false;
      if (bhp <= 0) return end(true);
      if (php <= 0) return end(false);
      if (ok) ci = Math.min(ci + 1, L.challenges.length - 1);
      seq = []; render(); timerStart();
    };
    ok ? playerAttack(r, done) : bossAttack(r, WRONG, done);
  });

  $('#b-exit').addEventListener('click', () => { timerStop(); G.map.resume(); });
  addEventListener('keydown', e => {
    if (G.current !== 'battle') return;
    if (e.key === 'Enter') $('#exec').click(); else if (e.key === 'Backspace') $('#term').click(); else if (e.key === 'Escape') $('#b-exit').click();
  });

  function end(win) {
    timerStop();
    if (win) { G.state.phase++; G.save(); sfx('playSuccess'); }
    if (G.state.phase >= G.levels.length) { G.toast(L.boss.big ? 'CHEFÃO DERROTADO! 🎉' : 'FIM DO PROTÓTIPO! 🎉', 'var(--ye)'); G.state.phase = 0; G.save(); return G.show('title'); }
    G.toast(win ? 'MISSÃO CUMPRIDA' : 'SISTEMA REINICIADO', win ? 'var(--gr)' : 'var(--rd)');
    G.map.start(G.state.phase);
  }
})(Game);

/* ==========================================================================
   FUNÇÕES DE IMPACTO VISUAL (JUICE FX)
   Chamadas pelo botão EXECUTE em battle.js (acerto e erro).
   ========================================================================== */

// Tremor na moldura do aparelho (.device) e flash na tela CRT (.crt)
function triggerImpact() {
    const chassis = document.querySelector('#screen-battle .device');
    const arena = document.querySelector('#screen-battle .crt');
    if (!chassis) return;

    // Reinicia a animação (remove, força reflow, adiciona de novo)
    chassis.classList.remove('shake');
    void chassis.offsetWidth;
    chassis.classList.add('shake');

    if (arena) {
        arena.classList.remove('glitch-flash');
        void arena.offsetWidth;
        arena.classList.add('glitch-flash');
    }

    setTimeout(() => {
        chassis.classList.remove('shake');
        if (arena) arena.classList.remove('glitch-flash');
    }, 350);
}

// Texto de dano flutuante sobre o alvo. styleType: 'boss-hit' | 'player-hit' | 'crit' | 'error'
function spawnDamageText(targetSelector, text, styleType = 'boss-hit') {
    const targetEl = document.querySelector(targetSelector);
    const arena = document.querySelector('#screen-battle .crt');
    if (!targetEl || !arena) return;

    const t = targetEl.getBoundingClientRect(), a = arena.getBoundingClientRect();
    const floatEl = document.createElement('div');
    floatEl.className = 'damage-float ' + styleType;
    floatEl.textContent = text;
    // centro do sprite, um pouco abaixo do topo (dentro da tela CRT, que corta o que passar da borda)
    floatEl.style.top = (t.top + t.height * 0.2 - a.top) + 'px';
    arena.appendChild(floatEl);
    // mantém o texto inteiro dentro da tela (a animação cresce até 1.3x, por isso a folga)
    const half = floatEl.offsetWidth * 0.65 + 4, cx = t.left + t.width / 2 - a.left;
    floatEl.style.left = Math.max(half, Math.min(a.width - half, cx)) + 'px';
    setTimeout(() => floatEl.remove(), 800);
}

// Corte estilo Undertale: toca a folha de 8 quadros (CSS .slash) sobre o alvo.
// kind: 'hero' (ciano) | 'boss' (vermelho). opções: dx/dy (deslocamento), rot (graus), flip (espelha), scale.
function spawnSlash(targetSelector, kind, o = {}) {
    const targetEl = document.querySelector(targetSelector);
    const arena = document.querySelector('#screen-battle .crt');
    if (!targetEl || !arena) return;
    const t = targetEl.getBoundingClientRect(), a = arena.getBoundingClientRect();
    const size = Math.max(t.width, t.height) * (o.scale || 1);
    const el = document.createElement('div');
    el.className = 'slash ' + kind;
    el.style.width = el.style.height = size + 'px';
    el.style.left = (t.left + t.width / 2 - a.left + (o.dx || 0)) + 'px';
    el.style.top = (t.top + t.height / 2 - a.top + (o.dy || 0)) + 'px';
    el.style.setProperty('--rot', (o.rot || 0) + 'deg');
    el.style.setProperty('--flip', o.flip ? -1 : 1);
    arena.appendChild(el);
    setTimeout(() => el.remove(), 520);
}
