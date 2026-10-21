// Cidade cyberpunk animada (fundo da tela inicial e da tela de acesso). Canvas leve, em pixel art:
// desenha em baixa resolução e amplia sem suavizar. Só anima quando a tela dela está visível.
// Em "Efeitos leves" ou com "reduzir movimento" do sistema, desenha um quadro parado.
(function (G) {
  const cenas = [];
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(20261022); // aleatório com semente: cidade sempre igual
  const PAL = { ceu1: '#07061a', ceu2: '#1b0f3a', ceu3: '#3a1250', lua: '#ffd6f7', b1: '#2b1f57', b2: '#1e1645', b3: '#120d2e', borda: ['#ff4fd866', '#3ee8ff55', '#b66cff55'],
    jan: ['#3ee8ff', '#ff4fd8', '#ffe66d', '#4dff88'], placa: ['#ff4fd8', '#3ee8ff', '#b66cff'] };

  function gerar(W, H) {
    const camadas = [[.55, PAL.b1, 22, 40], [.7, PAL.b2, 16, 30], [.86, PAL.b3, 12, 22]].map(([alt, cor, minW, varW], k) => {
      const prs = []; let x = -4;
      while (x < W + 4) {
        const w = minW + Math.floor(rnd() * varW), h = Math.floor(H * (alt - k * .02) * (.35 + rnd() * .65));
        const jan = []; for (let yy = H - h + 4; yy < H - 4; yy += 4) for (let xx = x + 2; xx < x + w - 2; xx += 3) if (rnd() < .4) jan.push([xx, yy, PAL.jan[Math.floor(rnd() * 4)], rnd()]);
        prs.push({ x, w, h, jan, borda: PAL.borda[Math.floor(rnd() * 3)], antena: rnd() < .35, placa: rnd() < .22 ? PAL.placa[Math.floor(rnd() * 3)] : null });
        x += w + Math.floor(rnd() * 3);
      }
      return { cor, prs, vel: (k + 1) * .9 };
    });
    const chuva = Array.from({ length: 70 }, () => [rnd() * W, rnd() * H, 2 + rnd() * 3]);
    const carros = Array.from({ length: 4 }, (_, i) => ({ y: H * (.18 + i * .09), x: rnd() * W, v: (rnd() < .5 ? -1 : 1) * (8 + rnd() * 14), cor: PAL.placa[i % 3] }));
    return { camadas, chuva, carros };
  }

  function desenhar(c, t) {
    const { ctx, W, H, mundo } = c, mov = c.anima ? t / 1000 : 0;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, PAL.ceu1); g.addColorStop(.55, PAL.ceu2); g.addColorStop(1, PAL.ceu3);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // lua/sol neon com faixas
    const lx = W * .78, ly = H * .13, r = Math.min(W, H) * .13;
    ctx.fillStyle = PAL.lua; ctx.beginPath(); ctx.arc(lx, ly, r, 0, 7); ctx.fill();
    ctx.fillStyle = PAL.ceu2; for (let i = 0; i < 5; i++) ctx.fillRect(lx - r, ly + r * (.15 + i * .18), r * 2, 1 + i * .4);
    // carros voadores
    mundo.carros.forEach(o => { const x = ((o.x + o.v * mov) % (W + 20) + W + 20) % (W + 20) - 10; ctx.fillStyle = o.cor; ctx.fillRect(Math.round(x), Math.round(o.y), 3, 1); ctx.fillStyle = '#ffffff88'; ctx.fillRect(Math.round(x) + (o.v > 0 ? 3 : -1), Math.round(o.y), 1, 1); });
    // prédios em 3 camadas (parallax lento)
    mundo.camadas.forEach((cam, k) => {
      const off = c.anima ? (mov * cam.vel) % 8 : 0;
      cam.prs.forEach(p => {
        const x = Math.round(p.x - off); ctx.fillStyle = cam.cor; ctx.fillRect(x, H - p.h, p.w, p.h);
        ctx.fillStyle = p.borda; ctx.fillRect(x, H - p.h, p.w, 1); ctx.fillRect(x, H - p.h, 1, p.h); // contorno neon no topo e na lateral
        if (p.antena) { ctx.fillRect(x + (p.w >> 1), H - p.h - 6, 1, 6); if (Math.floor(mov * 1.5 + p.x) % 2 === 0) { ctx.fillStyle = '#ff4d5e'; ctx.fillRect(x + (p.w >> 1), H - p.h - 7, 1, 1); } }
        p.jan.forEach(([jx, jy, cor, f]) => { if (c.anima && Math.sin(mov * (1 + f * 2) + f * 40) > .93) return; ctx.fillStyle = cor; ctx.globalAlpha = .35 + f * .5; ctx.fillRect(Math.round(jx - off), jy, 1, 2); });
        ctx.globalAlpha = 1;
        if (p.placa) { const on = !c.anima || Math.sin(mov * 3 + p.x) > -.6; ctx.fillStyle = on ? p.placa : '#2a1f40'; ctx.fillRect(x + 2, H - p.h + 6, Math.max(3, p.w - 4), 2); }
      });
    });
    // chuva de dados
    if (c.anima) { ctx.fillStyle = '#3ee8ff55'; mundo.chuva.forEach(d => { const y = (d[1] + mov * 40 * d[2]) % H; ctx.fillRect(Math.round((d[0] - y * .15 + W) % W), Math.round(y), 1, d[2]); }); }
    // névoa no chão
    const n = ctx.createLinearGradient(0, H * .75, 0, H); n.addColorStop(0, '#ff4fd800'); n.addColorStop(1, '#ff4fd833'); ctx.fillStyle = n; ctx.fillRect(0, H * .75, W, H * .25);
  }

  function ajustar(c) {
    const r = c.el.getBoundingClientRect(); if (!r.width || !r.height) return false;
    const esc = r.width > 700 ? 4 : 3, W = Math.ceil(r.width / esc), H = Math.ceil(r.height / esc);
    if (W !== c.W || H !== c.H) { c.W = c.el.width = W; c.H = c.el.height = H; c.ctx.imageSmoothingEnabled = false; c.mundo = gerar(W, H); }
    return true;
  }
  const calmo = () => document.body.classList.contains('lite') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function loop(t) {
    cenas.forEach(c => {
      if (!c.el.closest('.screen.active')) return;
      c.anima = !calmo();
      if (!ajustar(c)) return;
      if (c.anima || !c.parado) { desenhar(c, t); c.parado = !c.anima; }
    });
    requestAnimationFrame(loop);
  }
  G.city = {
    attach(el) { const c = { el, ctx: el.getContext('2d') }; cenas.push(c); if (cenas.length === 1) requestAnimationFrame(loop); },
    redesenhar() { cenas.forEach(c => { c.parado = false; c.W = 0; }); }
  };
  addEventListener('resize', () => G.city.redesenhar());
})(Game);
