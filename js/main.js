// Inicialização: botões do menu, opções, tela de nome, Modo Banca, instalação (PWA) e modo offline.
(function (G) {
  const $ = id => document.getElementById(id);
  const input = $('name-input'), count = $('name-count');
  const play = () => G.map.start(Math.min(G.state.phase, G.levels.length - 1));
  // 1ª vez: treinamento animado antes da fase 1 (dá para pular)
  const jogar = () => (!G.state.treino && G.training) ? G.training.open({ fim: play, sair: () => G.show('title') }) : play();
  let nameBack = 'title', nameNext = play; // para onde ir ao voltar / ao confirmar

  const nameLabel = () => $('opt-name').textContent = 'NOME: ' + (G.state.name || '---');
  const upd = () => {
    const n = Array.from(input.value).length;
    count.textContent = n + '/' + G.NAME_MAX; count.classList.toggle('full', n >= G.NAME_MAX);
    if (n) $('name-err').hidden = true;
  };

  // ---------- TELA DE ACESSO (login por codinome, sem senha: funciona offline) ----------
  // Avatares = cor da jaqueta do herói (PNGs gerados por tools/make_avatars.py)
  G.AVATARES = [{ nome: 'NEON', suf: '' }, { nome: 'GELO', suf: '-1' }, { nome: 'PULSO', suf: '-2' }, { nome: 'BRASA', suf: '-3' }];
  G.avatar = () => G.AVATARES[G.state.avatar] || G.AVATARES[0];
  let avSel = 0, bootRun = 0;
  function drawAvatars() {
    $('avatars').innerHTML = G.AVATARES.map((a, i) => `<button type="button" class="av" role="radio" aria-checked="${i === avSel}" data-av="${i}" aria-label="Visual ${a.nome}">` +
      `<i style="background-image:url(assets/sprites/player${a.suf}.png)"></i>${a.nome}</button>`).join('');
  }
  $('avatars').addEventListener('click', e => { const b = e.target.closest('.av'); if (!b) return; avSel = +b.dataset.av; drawAvatars(); try { AudioEngine.playClick(); } catch (x) {} });

  // Linhas do "boot" digitadas como num terminal (toque na tela pula)
  const BOOT = [[['> NEO-CUIABÁ NET :: nó 065\n']], [['> rastreando conexão....... '], ['OK\n', 'ok']], [['> firewall do sistema...... '], ['ATIVO\n', 'warn']], [['> identifique-se, recruta.']]];
  function boot(curto) {
    const el = $('boot'), id = ++bootRun, partes = BOOT.flat(); el.innerHTML = '';
    if (curto || document.body.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.innerHTML = partes.map(([t, c]) => c ? `<span class="${c}">${t}</span>` : t).join(''); return;
    }
    let i = 0, j = 0, alvo = null;
    const passo = () => {
      if (id !== bootRun) return;
      if (i >= partes.length) return;
      const [t, c] = partes[i];
      if (j === 0) { alvo = c ? Object.assign(document.createElement('span'), { className: c }) : document.createTextNode(''); el.appendChild(alvo); }
      (alvo.nodeType === 3 ? alvo : alvo).textContent += t[j++];
      if (j >= t.length) { i++; j = 0; }
      setTimeout(passo, t[j - 1] === '\n' ? 160 : 16);
    };
    passo();
  }
  $('boot').addEventListener('click', () => boot(true));

  function askName(back, next) {
    nameBack = back; nameNext = next; input.value = G.state.name; avSel = G.state.avatar || 0; upd(); drawAvatars();
    $('name-err').hidden = true; $('granted').hidden = true; $('name-ok').disabled = false;
    G.show('name'); boot(back !== 'title');
    if (matchMedia('(pointer: fine)').matches) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } // no celular não abre o teclado sozinho
  }
  function erro(msg) {
    const e = $('name-err'); e.textContent = msg; e.hidden = false;
    const c = $('lcard'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    try { AudioEngine.playError(); } catch (x) {}
  }
  function confirmName() {
    const n = G.cleanName(input.value);
    if (!n) { erro('Digite um codinome para entrar (até 18 caracteres).'); return; }
    G.state.name = n; G.state.avatar = avSel; G.save(); nameLabel(); input.blur(); $('name-ok').disabled = true;
    // ACESSO CONCEDIDO: barra de progresso + log, depois segue
    const g = $('granted'), log = $('glog'), bar = $('gbar'), id = ++bootRun;
    const linhas = [`> codinome: ${n}`, `> visual: ${G.avatar().nome}`, '> carregando módulo de lógica... OK', '> conexão segura estabelecida.'];
    g.hidden = false; log.textContent = ''; bar.style.width = '0';
    try { AudioEngine.playSuccess(); } catch (x) {}
    const rapido = document.body.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    linhas.forEach((l, k) => setTimeout(() => { if (id === bootRun) { log.textContent += l + '\n'; bar.style.width = ((k + 1) / linhas.length * 100) + '%'; } }, rapido ? 0 : 220 + k * 260));
    setTimeout(() => { if (id !== bootRun) return; g.hidden = true; $('name-ok').disabled = false; nameNext(); }, rapido ? 400 : 1600);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    if (b.dataset.go === 'map') G.state.name ? jogar() : askName('title', jogar); // 1ª vez: tela de acesso antes de jogar
    else G.show(b.dataset.go);
  });
  // o som só pode começar depois do 1º toque (regra dos navegadores)
  document.addEventListener('pointerdown', () => { try { AudioEngine.init(); } catch (e) {} }, { once: true });

  input.addEventListener('input', upd);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') confirmName(); else if (e.key === 'Escape') G.show(nameBack); });
  $('name-ok').onclick = confirmName;
  $('name-back').onclick = () => { input.blur(); G.show(nameBack); };
  $('opt-name').onclick = () => askName('options', () => G.show('options'));
  $('btn-report').onclick = () => G.report.open('title');
  // COMO JOGAR = treinamento animado (demonstração + prática). Sem codinome ainda, usa "Recruta".
  $('btn-how').onclick = () => { if (!G.state.name) { G.state.name = 'Recruta'; G.save(); nameLabel(); } G.training.open({ fim: () => G.show('title'), sair: () => G.show('title') }); };
  document.querySelectorAll('canvas.city').forEach(c => G.city.attach(c));

  // ---------- Opções ----------
  const flag = (id, key, rot, on, off, padrao) => {
    const get = () => G.state[key] === undefined ? padrao : G.state[key];
    const draw = () => { $(id).textContent = rot + ': ' + (get() ? on : off); document.body.classList.toggle('lite', !!G.state.lite); };
    $(id).onclick = () => { G.state[key] = !get(); G.save(); draw(); };
    draw();
  };
  flag('opt-sound', 'sound', 'SOM', 'LIGADO', 'DESLIGADO', true);
  flag('opt-vibra', 'vibra', 'VIBRAÇÃO', 'LIGADA', 'DESLIGADA', true);
  flag('opt-calmo', 'calmo', 'MODO ACOLHIMENTO', 'LIGADO', 'DESLIGADO', false);
  flag('opt-lite', 'lite', 'EFEITOS LEVES', 'LIGADO', 'DESLIGADO', false);
  $('opt-reset').onclick = () => { G.state.phase = 0; G.save(); G.toast('PROGRESSO ZERADO'); }; // o nome é mantido

  // ---------- MODO BANCA (demonstração para jurados) ----------
  // Liga com ?banca=1 no endereço ou tocando 5 vezes no logo. Libera todas as fases e o botão "Reiniciar demo".
  function banca(on) {
    G.banca = on; document.body.classList.toggle('banca', on);
    ['banca-tag', 'btn-levels', 'btn-demo-reset'].forEach(id => $(id).hidden = !on);
    if (on) {
      $('level-list').innerHTML = '<button type="button" data-lv="treino">TREINO · tutorial animado</button>' +
        G.levels.map((l, i) => `<button type="button" data-lv="${i}">FASE ${l.id} · ${l.conceito}</button>`).join('');
      if (!G.state.name) { G.state.name = 'Jurado(a)'; G.save(); nameLabel(); }
    }
  }
  if (/[?&]banca=1/.test(location.search)) banca(true);
  let taps = 0, tapT = 0;
  $('logo').addEventListener('click', () => {
    const now = Date.now(); taps = now - tapT < 600 ? taps + 1 : 1; tapT = now;
    if (taps >= 5) { taps = 0; banca(!G.banca); G.toast(G.banca ? 'MODO BANCA LIGADO' : 'MODO BANCA DESLIGADO', 'var(--ye)'); }
  });
  $('btn-levels').onclick = () => G.show('levels');
  $('level-list').addEventListener('click', e => { // vai direto para a batalha da fase escolhida
    const b = e.target.closest('[data-lv]'); if (!b) return;
    if (b.dataset.lv === 'treino') return G.training.open({ fim: () => G.show('levels'), sair: () => G.show('levels') });
    const i = +b.dataset.lv; G.map.start(i); G.battle.start(G.levels[i]);
  });
  $('btn-demo-reset').onclick = () => { // próxima pessoa da banca começa do zero (o histórico de métricas é mantido)
    G.state.phase = 0; G.state.name = 'Jurado(a)'; G.state.seen = { title: true }; G.state.met = false; G.state.treino = false; G.save();
    G.metrics.novaSessao(); nameLabel(); G.toast('DEMO REINICIADA', 'var(--gr)');
  };

  // ---------- Instalar como app (PWA) e funcionar sem internet ----------
  let promptInstall = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInstall = e; $('btn-install').hidden = false; });
  $('btn-install').onclick = () => { if (promptInstall) { promptInstall.prompt(); promptInstall = null; $('btn-install').hidden = true; } };
  if (/^https?:$/.test(location.protocol)) { // manifest e offline só existem servidos por http(s); em file:// evitam erro no console
    const m = document.createElement('link'); m.rel = 'manifest'; m.href = 'manifest.webmanifest'; document.head.appendChild(m);
  }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  nameLabel(); G.show('title');
})(Game);
