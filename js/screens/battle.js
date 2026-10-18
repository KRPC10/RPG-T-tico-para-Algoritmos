// Batalha: monta o código com tokens, valida contra as soluções da fase e aplica dano.
(function (G) {
  const $ = s => document.querySelector(s), MAXHP = 115, CAT = { k: 't-k', o: 't-o', v: 't-v', a: 't-a' };
  let L, ci, seq, php, bhp, busy, rid = 0;
  const low = () => php < MAXHP / 2; // abaixo da metade da vida → libera dica

  G.battle = { start(level) {
    rid++; L = level; ci = 0; seq = []; php = MAXHP; bhp = L.boss.hp; busy = false;
    $('#b-phase').textContent = L.id; $('#boss-name').textContent = L.boss.name; $('#boss-lvl').textContent = L.boss.lvl; $('#player-name').textContent = G.state.name || 'JOGADOR';
    $('#boss-spr').style.backgroundImage = `url(assets/sprites/${L.boss.sprite}.png)`; $('#boss-spr').setAttribute('aria-label', L.boss.name);
    $('#keys').innerHTML = L.keys.map((k, i) => k
      ? `<button class="key ${k[1]}${k[0].length > 9 ? ' long' : ''}" data-i="${i}">${k[0]}</button>`
      : '<button class="key off"></button>').join('');
    hp(); render(); G.show('battle');
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

  $('#keys').addEventListener('click', e => {
    const b = e.target.closest('.key[data-i]');
    if (!b || busy || seq.length >= 8) return;
    seq.push(+b.dataset.i); navigator.vibrate && navigator.vibrate(15); render();
  });
  $('#term').addEventListener('click', () => { if (!busy) { seq.pop(); render(); } }); // toque no terminal = desfazer

  $('#exec').addEventListener('click', () => {
    if (busy || !seq.length) return;
    const s = seq.map(i => L.keys[i][0]).join(' ').replace(/ ;$/, '');
    const ok = L.challenges[ci].solutions.some(x => x.join(' ') === s);
    busy = true; const r = rid;
    if (ok) { bhp = Math.max(0, bhp - L.dmg); G.toast('⚡ SINTAXE VÁLIDA −' + L.dmg + ' HP', 'var(--gr)'); flash('.boss'); }
    else { const was = low(); php = Math.max(0, php - 15); G.toast('✖ LÓGICA INCORRETA −15 HP' + (!was && low() ? ' · 💡 DICA LIBERADA' : ''), 'var(--rd)'); flash('.player'); }
    hp(); seq = [];
    setTimeout(() => {
      if (r !== rid || G.current !== 'battle') return;
      busy = false;
      if (bhp <= 0) return end(true);
      if (php <= 0) return end(false);
      if (ok) ci = Math.min(ci + 1, L.challenges.length - 1);
      render();
    }, 900);
  });

  $('#b-exit').addEventListener('click', () => G.map.resume());
  addEventListener('keydown', e => {
    if (G.current !== 'battle') return;
    if (e.key === 'Enter') $('#exec').click(); else if (e.key === 'Backspace') $('#term').click(); else if (e.key === 'Escape') $('#b-exit').click();
  });

  function end(win) {
    if (win) { G.state.phase++; G.save(); }
    if (G.state.phase >= G.levels.length) { G.toast('FIM DO PROTÓTIPO! 🎉', 'var(--ye)'); G.state.phase = 0; G.save(); return G.show('title'); }
    G.toast(win ? 'MISSÃO CUMPRIDA' : 'SISTEMA REINICIADO', win ? 'var(--gr)' : 'var(--rd)');
    G.map.start(G.state.phase);
  }
})(Game);
