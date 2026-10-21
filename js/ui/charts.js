// Gráficos do Relatório, em SVG puro (sem biblioteca, funciona offline).
//  • compare(): Teclado do celular × Blocos — 3 painéis pequenos, cada um com a SUA escala (segundos ≠ %).
//  • colunas(): tempo médio até acertar, por desafio (uma série só, sem legenda).
// Cores: Digitação = laranja, Blocos = azul (par validado para daltonismo no fundo escuro).
// Toque/passe o mouse numa barra para ver o detalhe (tooltip). Texto sempre na cor do texto, nunca na cor da série.
(function (G) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (v, casas) => v.toFixed(casas).replace('.', ',');
  const SERIES = { qwerty: { nome: 'Digitação', cor: 'var(--s-dig)' }, blocos: { nome: 'Blocos', cor: 'var(--s-blo)' } };

  // barra com cantos arredondados (4px) só na ponta do dado; a base fica reta, encostada no eixo
  const barH = (x, y, w, h, r = 4) => w <= 0 ? '' : (r = Math.min(r, w, h / 2),
    `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`);
  const barV = (x, y0, w, h, r = 4) => h <= 0 ? '' : (r = Math.min(r, h, w / 2),
    `M${x},${y0}V${y0 - h + r}Q${x},${y0 - h} ${x + r},${y0 - h}H${x + w - r}Q${x + w},${y0 - h} ${x + w},${y0 - h + r}V${y0}Z`);

  // ---------- Teclado do celular × Blocos ----------
  function compare(r) {
    if (!r.n) return '';
    const paineis = [
      { titulo: 'Tempo médio até concluir', un: ' s', casas: 1, max: null, get: s => s.med },
      { titulo: 'Participantes com erro de sintaxe', un: '%', casas: 0, max: 100, get: s => s.comSint },
      { titulo: 'Acertaram na 1ª tentativa', un: '%', casas: 0, max: 100, get: s => s.primeira }
    ];
    const W = 320, LX = 70, BW = 200, ROW = 18, GAP = 2;
    const blocos = paineis.map((p, i) => {
      const vq = p.get(r.q), vb = p.get(r.b);
      const max = p.max || Math.max(1, vq || 0, vb || 0) * 1.15;
      const y0 = i * 74 + 18;
      const linha = (k, v, y) => {
        const s = SERIES[k], w = v === null ? 0 : Math.max(2, v / max * BW);
        const val = v === null ? 'sem dados' : fmt(v, p.casas) + p.un;
        const tip = `${s.nome} · ${p.titulo}: ${val} (n = ${r.n})`;
        return `<text x="${LX - 8}" y="${y + ROW / 2}" class="vz-lab" text-anchor="end" dominant-baseline="central">${s.nome}</text>` +
          (v === null ? '' : `<path d="${barH(LX, y, w, ROW)}" fill="${s.cor}"/>`) +
          `<text x="${LX + w + 6}" y="${y + ROW / 2}" class="vz-val" dominant-baseline="central">${val}</text>` +
          `<rect x="0" y="${y - 3}" width="${W}" height="${ROW + 6}" fill="transparent" class="vz-hit" data-tip="${esc(tip)}"/>`;
      };
      return `<text x="0" y="${y0 - 6}" class="vz-tit">${p.titulo}</text>` +
        `<line x1="${LX}" x2="${LX}" y1="${y0}" y2="${y0 + ROW * 2 + GAP}" class="vz-axis"/>` +
        linha('qwerty', vq, y0) + linha('blocos', vb, y0 + ROW + GAP);
    }).join('');
    const legenda = `<div class="vz-leg">${Object.values(SERIES).map(s => `<span><i style="background:${s.cor}"></i>${s.nome}</span>`).join('')}<small>n = ${r.n} participante(s)</small></div>`;
    return `<figure class="vz">${legenda}<svg viewBox="0 0 ${W} ${3 * 74 - 10}" role="img" aria-label="Comparação entre digitar no teclado do celular e montar com blocos">${blocos}</svg></figure>`;
  }

  // ---------- Colunas: uma série ----------
  // itens: [{ rotulo, valor, tip }]
  function colunas(itens, o) {
    const ok = itens.filter(i => i.valor !== null);
    if (!ok.length) return `<p class="txt small">${o.vazio || 'Sem dados ainda.'}</p>`;
    const W = 320, H = 170, L = 30, R = 6, T = 18, B = 26, n = itens.length;
    const bruto = Math.max(...ok.map(i => i.valor));
    const passo = [1, 2, 5, 10, 15, 20, 30, 60, 120].find(s => s * 4 >= bruto) || Math.ceil(bruto / 4);
    const max = passo * Math.max(1, Math.ceil(bruto / passo));
    const band = (W - L - R) / n, bw = Math.min(26, band * .62), y = v => T + (H - T - B) * (1 - v / max), y0 = H - B;
    const ticks = [0, max / 2, max].map(t => `<line x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}" class="vz-grid"/>` +
      `<text x="${L - 5}" y="${y(t)}" class="vz-tick" text-anchor="end" dominant-baseline="central">${fmt(t, t % 1 ? 1 : 0)}</text>`).join('');
    const top = ok.reduce((a, b) => b.valor > a.valor ? b : a);
    const cols = itens.map((it, i) => {
      const cx = L + band * i + band / 2, x = cx - bw / 2;
      const bar = it.valor === null ? `<text x="${cx}" y="${y0 - 6}" class="vz-tick" text-anchor="middle">—</text>`
        : `<path d="${barV(x, y0, bw, Math.max(2, y0 - y(it.valor)))}" fill="var(--s-blo)"/>`;
      const lab = it === top ? `<text x="${cx}" y="${y(it.valor) - 6}" class="vz-val" text-anchor="middle">${fmt(it.valor, 1)}${o.un || ''}</text>` : '';
      return bar + lab + `<text x="${cx}" y="${H - 9}" class="vz-tick" text-anchor="middle">${esc(it.rotulo)}</text>` +
        `<rect x="${L + band * i}" y="${T - 10}" width="${band}" height="${H - T}" fill="transparent" class="vz-hit" data-tip="${esc(it.tip)}"/>`;
    }).join('');
    const tabela = `<details class="vz-table"><summary>Ver como tabela</summary><table><thead><tr>${o.colunas.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>` +
      itens.map(i => `<tr>${i.linha.map(c => `<td>${c}</td>`).join('')}</tr>`).join('') + '</tbody></table></details>';
    return `<figure class="vz"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.titulo)}">${ticks}${cols}<line x1="${L}" x2="${W - R}" y1="${y0}" y2="${y0}" class="vz-axis"/></svg>${tabela}</figure>`;
  }

  // ---------- Tooltip (mouse e toque) ----------
  let tipEl = null;
  function showTip(alvo, x, y) {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'vz-tip'; document.getElementById('app').appendChild(tipEl); }
    const app = document.getElementById('app').getBoundingClientRect();
    tipEl.textContent = alvo.dataset.tip; tipEl.hidden = false;
    const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    tipEl.style.left = Math.max(8, Math.min(app.width - w - 8, x - app.left - w / 2)) + 'px';
    tipEl.style.top = Math.max(8, y - app.top - h - 14) + 'px';
    document.querySelectorAll('.vz-hit.on').forEach(e => e.classList.remove('on')); alvo.classList.add('on');
  }
  const hideTip = () => { if (tipEl) tipEl.hidden = true; document.querySelectorAll('.vz-hit.on').forEach(e => e.classList.remove('on')); };
  document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('.vz-hit'); if (t && e.pointerType === 'mouse') showTip(t, e.clientX, e.clientY); });
  document.addEventListener('pointerout', e => { if (e.pointerType === 'mouse' && e.target.closest && e.target.closest('.vz-hit')) hideTip(); });
  document.addEventListener('pointerdown', e => { const t = e.target.closest && e.target.closest('.vz-hit'); t ? showTip(t, e.clientX, e.clientY) : hideTip(); });
  document.addEventListener('scroll', hideTip, true);

  G.charts = { compare, colunas, hideTip };
})(Game);
