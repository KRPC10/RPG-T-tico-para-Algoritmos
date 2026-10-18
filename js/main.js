// Inicialização: ligação dos botões de menu, opções e a tela de nome do jogador.
(function (G) {
  const $ = id => document.getElementById(id);
  const input = $('name-input'), count = $('name-count');
  const play = () => G.map.start(Math.min(G.state.phase, G.levels.length - 1));
  let nameBack = 'title', nameNext = play; // para onde ir ao voltar / ao confirmar

  const nameLabel = () => $('opt-name').textContent = 'NOME: ' + (G.state.name || '---');
  const upd = () => {
    const n = Array.from(input.value).length;
    count.textContent = n + '/' + G.NAME_MAX; count.classList.toggle('full', n >= G.NAME_MAX);
  };
  function askName(back, next) {
    nameBack = back; nameNext = next; input.value = G.state.name; upd();
    G.show('name'); input.focus(); input.setSelectionRange(input.value.length, input.value.length);
  }
  function confirmName() {
    const n = G.cleanName(input.value);
    if (!n) { G.toast('DIGITE UM NOME', 'var(--rd)'); input.focus(); return; }
    G.state.name = n; G.save(); nameLabel(); input.blur(); $('toast').classList.remove('show'); nameNext();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    if (b.dataset.go === 'map') G.state.name ? play() : askName('title', play); // 1ª vez: pede o nome antes de jogar
    else G.show(b.dataset.go);
  });

  input.addEventListener('input', upd);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') confirmName(); else if (e.key === 'Escape') G.show(nameBack); });
  $('name-ok').onclick = confirmName;
  $('name-back').onclick = () => { input.blur(); G.show(nameBack); };
  $('opt-name').onclick = () => askName('options', () => G.show('options'));

  const snd = () => $('opt-sound').textContent = 'SOM: ' + (G.state.sound ? 'LIGADO' : 'DESLIGADO');
  $('opt-sound').onclick = () => { G.state.sound = !G.state.sound; G.save(); snd(); };
  $('opt-reset').onclick = () => { G.state.phase = 0; G.save(); G.toast('PROGRESSO ZERADO'); }; // o nome é mantido
  snd(); nameLabel(); G.show('title');
})(Game);
