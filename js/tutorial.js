// Tutorial guiado: balões que explicam cada tela na 1ª vez e sempre que tocar em "? AJUDA".
// Para mudar os textos, edite o objeto T. "el" = seletor ou função que devolve o retângulo a destacar.
(function (G) {
  G.state.seen = G.state.seen || {};
  const $ = s => document.querySelector(s), co = $('#coach'), spot = $('#coach .spot'), card = $('#coach .card'),
    txt = card.querySelector('.txt'), stp = card.querySelector('.step'), nxt = card.querySelector('.next'), skp = card.querySelector('.skip');

  const T = {
    title: [
      { t: 'Bem-vindo ao <b>ALGORITMIA</b>! 👋 Aqui você aprende a pensar como um programador <b>jogando</b>. Em vez de digitar código, você monta o comando <b>tocando em botões</b>.' },
      { el: '.menu .pri', t: 'Toque em <b>JOGAR</b> para começar: na 1ª vez tem um <b>treino animado</b> de 1 minuto. Ele também fica em <b>COMO JOGAR</b>.' } ],
    map: [
      { el: () => G.map.rect('me'), t: 'Este é <b>você</b>: o personagem de jaqueta amarela e calça preta.' },
      { el: '#map-canvas', t: 'Toque em qualquer ponto do <b>chão escuro</b> e ele anda até lá. As paredes azuis bloqueiam o caminho. (No computador, use as setas do teclado.)' },
      { el: () => G.map.rect('enemy'), t: 'Seu objetivo é chegar neste <b>inimigo</b>, que brilha em rosa. Quando você encostar nele, começa a batalha.' } ],
    battle: [
      { t: 'Hora da batalha! ⚔️ Você vence montando o <b>comando certo</b> com blocos. Não precisa digitar nada.' },
      { el: '#mission', t: 'Esta é a <b>MISSÃO</b>. As palavras coloridas são os <b>blocos</b> que você vai usar, na mesma cor. Embaixo, os <b>valores</b> das variáveis agora.' },
      { el: '#keys', t: 'Toque nos blocos <b>na ordem da frase</b>. Só ficam <b>acesos</b> os blocos que podem vir agora: assim é impossível errar a escrita do código.' },
      { el: '#code', t: 'Os <b>espaços tracejados</b> mostram o que ainda falta. Tocou errado? <b>Toque no bloco</b> aqui para apagar a partir dele, ou use ⌫ APAGAR.' },
      { el: '#transbox', t: 'Aqui o seu código é lido em <b>português</b>. Toque em <b>PYTHON</b> ou <b>JAVASCRIPT</b> para ver o mesmo código nas linguagens do mercado.' },
      { el: '#hint', t: 'Travou? A <b>💡 DICA</b> tem 3 níveis. No último, o bloco certo fica piscando.' },
      { el: '#exec', t: 'Pronto? Toque em <b>▶ EXECUTAR</b>. Você vê o código rodando passo a passo. Acertou: o inimigo leva dano. Errou: o jogo explica o porquê.' } ]
  };

  T.timer = [
    { t: '⚠ <b>CHEFÃO!</b> Este inimigo é mais difícil: você tem <b>tempo limite</b> para montar cada comando.' },
    { el: '#timer', t: 'Esta barra mostra o <b>tempo que resta</b>. Se ela acabar, o chefe <b>ataca</b> e você perde vida. A cada novo desafio ela enche de novo.' } ];

  let list, i, name;
  function show() {
    const s = list[i], app = $('#app').getBoundingClientRect();
    txt.innerHTML = s.t; stp.textContent = (i + 1) + ' de ' + list.length; nxt.textContent = i === list.length - 1 ? 'Entendi!' : 'Próximo';
    co.classList.add('on');
    let r = null;
    if (s.el && typeof s.el !== 'function') { const e = $(s.el); if (e) e.scrollIntoView({ block: 'nearest' }); } // garante que o item destacado está visível (terminal rolado, tela deitada)
    if (s.el) { const q = typeof s.el === 'function' ? s.el() : $(s.el).getBoundingClientRect(); r = { left: q.left, top: q.top, width: q.width, height: q.height }; }
    if (r) {
      const pad = 6; spot.style.display = 'block'; co.classList.remove('dim');
      Object.assign(spot.style, { left: r.left - app.left - pad + 'px', top: r.top - app.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' });
    } else { spot.style.display = 'none'; co.classList.add('dim'); }
    card.style.top = '0'; const h = card.offsetHeight, H = app.height; let top;
    if (!r) top = (H - h) / 2;
    else { const tt = r.top - app.top, tb = tt + r.height; top = H - tb - h - 24 >= 0 ? tb + 14 : tt - h - 14 >= 8 ? tt - h - 14 : Math.min(H - h - 8, tb + 14); }
    card.style.top = Math.max(8, Math.min(top, H - h - 8)) + 'px';
  }
  function run(n) { if (!T[n]) return; name = n; list = T[n]; i = 0; show(); }
  function close() { co.classList.remove('on'); G.state.seen[name] = true; G.save(); }

  nxt.onclick = () => { ++i < list.length ? show() : close(); };
  skp.onclick = () => { Object.keys(T).forEach(k => G.state.seen[k] = true); close(); };
  G.tutorialRun = run; // usado pelo chefão (battle.js)
  G.onShow = n => { if (T[n] && !G.state.seen[n]) setTimeout(() => { if (G.current === n) run(n); }, 350); };
  document.addEventListener('click', e => {
    if (e.target.closest('[data-help]')) run(G.current); // (COMO JOGAR agora abre o treinamento animado: js/screens/training.js)
  });
})(Game);
