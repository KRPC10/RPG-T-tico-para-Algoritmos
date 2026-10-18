// Mapa top-down em canvas: toque → caminho (BFS) → personagem anda tile a tile.
(function (G) {
  const cv = document.getElementById('map-canvas'), cx = cv.getContext('2d');
  let L, g, T, p, back, en, path = [], raf, last = 0, cols, rows, dir = 0; // dir: 0 baixo · 1 esquerda · 2 direita · 3 cima
  const STEP = 130; // ms por tile
  const solid = c => c === '#' || c === 'T';

  G.map = { start(i) {
    L = G.levels[i]; g = L.map.map(r => [...r]); rows = g.length; cols = g[0].length; path = []; en = null; dir = 0;
    g.forEach((r, y) => r.forEach((c, x) => { if (c === 'P') { p = { x, y }; g[y][x] = '.'; } if (c === 'E') { en = { x, y }; g[y][x] = '.'; } }));
    back = p;
    document.getElementById('map-phase').textContent = 'FASE ' + L.id;
    G.show('map'); fit(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  } };

  // Volta da batalha sem reiniciar o mapa (jogador fica no tile antes do inimigo).
  G.map.resume = () => { p = back || p; path = []; G.show('map'); fit(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); };

  G.map.rect = who => {
    const o = who === 'enemy' ? en : p, r = cv.getBoundingClientRect(), k = r.width / cv.width;
    return { left: r.left + o.x * T * k, top: r.top + o.y * T * k, width: T * k, height: T * k };
  };

  addEventListener('keydown', e => {
    if (G.current !== 'map') return;
    if (e.key === 'Escape') return G.show('title');
    const d = { ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1], ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0] }[e.key];
    if (!d || path.length) return;
    const n = { x: p.x + d[0], y: p.y + d[1] };
    if (g[n.y] && !solid(g[n.y][n.x] || '#')) path = [n];
    e.preventDefault();
  });

  const face = (a, b) => { dir = b.y > a.y ? 0 : b.y < a.y ? 3 : b.x < a.x ? 1 : 2; };
  const floorIdx = (x, y) => (x * 7 + y * 13 + x * y) % 11 === 0 ? 2 : (x + y) % 2; // 2 = chão com circuito (raro)

  function fit() {
    const w = cv.parentElement;
    T = Math.max(8, Math.floor(Math.min(w.clientWidth / cols, w.clientHeight / rows)));
    cv.width = T * cols; cv.height = T * rows; cx.imageSmoothingEnabled = false;
  }
  addEventListener('resize', () => { if (L && G.current === 'map') fit(); });

  function bfs(a, b) {
    if (!g[b.y] || solid(g[b.y][b.x] || '#')) return [];
    const q = [a], prev = { [a.y * cols + a.x]: null };
    while (q.length) {
      const c = q.shift();
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const n = { x: c.x + dx, y: c.y + dy }, k = n.y * cols + n.x;
        if (n.x < 0 || n.y < 0 || n.x >= cols || n.y >= rows || k in prev || solid(g[n.y][n.x])) continue;
        prev[k] = c; q.push(n);
      }
    }
    if (!((b.y * cols + b.x) in prev)) return [];
    const out = []; let c = b;
    while (c.x !== a.x || c.y !== a.y) { out.unshift(c); c = prev[c.y * cols + c.x]; }
    return out;
  }

  cv.addEventListener('pointerdown', e => {
    const r = cv.getBoundingClientRect();
    path = bfs(p, { x: Math.floor((e.clientX - r.left) / r.width * cols), y: Math.floor((e.clientY - r.top) / r.height * rows) });
  });

  function loop(t) {
    if (G.current !== 'map') return;
    if (path.length && t - last > STEP) {
      last = t; back = p; p = path.shift(); face(back, p);
      if (en && p.x === en.x && p.y === en.y) { path = []; return G.battle.start(L); }
    }
    draw(t); raf = requestAnimationFrame(loop);
  }

  // Desenha com os PNGs de assets/ (G.sprites). Enquanto não carregarem (ou se faltarem), usa a arte provisória por código.
  function draw(t) {
    const S = G.sprites;
    cx.fillStyle = '#080a10'; cx.fillRect(0, 0, cv.width, cv.height);
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const c = g[y][x], px = x * T, py = y * T;
      if (G.hasSprite('tiles')) { cx.drawImage(S.tiles, (c === '#' ? 3 : c === 'T' ? 4 : floorIdx(x, y)) * 16, 0, 16, 16, px, py, T, T); continue; }
      if (solid(c)) {
        cx.fillStyle = c === '#' ? '#1c2442' : '#0f3a4a'; cx.fillRect(px, py, T, T);
        cx.fillStyle = c === '#' ? '#3ee8ff55' : '#4dff88'; cx.fillRect(px, py, T, Math.max(2, T / 8));
        if (c === 'T') { cx.fillStyle = '#4dff88'; cx.fillRect(px + T * .25, py + T * .35, T * .5, T * .3); }
      } else { cx.fillStyle = (x + y) % 2 ? '#121828' : '#0f1422'; cx.fillRect(px, py, T, T); }
    }
    cx.fillStyle = '#3ee8ff88'; path.forEach(n => cx.fillRect(n.x * T + T * .4, n.y * T + T * .4, T * .2, T * .2));
    const shadow = (x, y, col) => { cx.fillStyle = col; cx.beginPath(); cx.ellipse(x + T / 2, y + T * .9, T * .32, T * .1, 0, 0, 7); cx.fill(); };

    // Inimigo: aura rosa pulsando + sprite de 2 quadros
    if (en) {
      const ex = en.x * T, ey = en.y * T, e = S[L.boss.sprite + '-map'];
      if (G.hasSprite(L.boss.sprite + '-map')) {
        shadow(ex, ey, 'rgba(255,79,216,' + (.22 + .12 * Math.sin(t / 250)) + ')');
        cx.drawImage(e, (Math.floor(t / 450) % 2) * 16, 0, 16, 16, ex, ey, T, T);
      } else {
        const b = Math.sin(t / 200) * T * .04, mx = ex + T / 2, my = ey + T / 2 + b;
        cx.fillStyle = '#ff4fd8'; cx.beginPath(); cx.moveTo(mx, my - T * .4); cx.lineTo(mx + T * .35, my); cx.lineTo(mx, my + T * .4); cx.lineTo(mx - T * .35, my); cx.fill();
      }
    }

    // Jogador: desliza entre tiles, anda com 4 quadros e vira para a direção do movimento
    const prog = Math.min(1, (t - last) / STEP), walking = prog < 1;
    const fx = back ? back.x + (p.x - back.x) * prog : p.x, fy = back ? back.y + (p.y - back.y) * prog : p.y;
    const bob = walking ? 0 : Math.sin(t / 200) * T * .03;
    const hx = Math.round(fx * T), hy = Math.round(fy * T + bob);
    if (G.hasSprite('hero')) {
      shadow(hx, Math.round(fy * T), 'rgba(0,0,0,.4)');
      cx.drawImage(S.hero, (walking ? Math.floor(t / STEP) % 4 : 0) * 16, dir * 16, 16, 16, hx, hy, T, T);
    } else {
      const x = hx, y = hy;
      cx.fillStyle = '#ffd7b0'; cx.fillRect(x + T * .3, y + T * .12, T * .4, T * .3);
      cx.fillStyle = '#10202a'; cx.fillRect(x + T * .28, y + T * .08, T * .44, T * .12);
      cx.fillStyle = '#3ee8ff'; cx.fillRect(x + T * .25, y + T * .42, T * .5, T * .3);
      cx.fillStyle = '#1c2442'; cx.fillRect(x + T * .3, y + T * .72, T * .4, T * .2);
    }
  }
})(Game);
