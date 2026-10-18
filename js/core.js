// Núcleo: namespace global, progresso salvo, troca de telas e aviso (toast).
window.Game = { state: { phase: 0, sound: true, name: '' }, NAME_MAX: 18 };
(function (G) {
  // Limpa o nome: sem caracteres de controle/invisíveis, espaços colapsados, no máximo NAME_MAX caracteres.
  G.cleanName = s => Array.from(String(s || '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, '').replace(/\s+/g, ' ').trim())
    .slice(0, G.NAME_MAX).join('').trim();
  try { Object.assign(G.state, JSON.parse(localStorage.getItem('algoritmia') || '{}')); } catch (e) {}
  G.state.name = G.cleanName(G.state.name);
  G.save = () => { try { localStorage.setItem('algoritmia', JSON.stringify(G.state)); } catch (e) {} };
  G.show = n => {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + n));
    G.current = n; if (G.onShow) G.onShow(n);
  };
  G.toast = (msg, color) => {
    const t = document.getElementById('toast');
    t.textContent = msg; t.style.color = color || 'var(--cy)'; t.style.borderColor = t.style.color;
    t.classList.add('show'); clearTimeout(G._t); G._t = setTimeout(() => t.classList.remove('show'), 1500);
  };
})(Game);
