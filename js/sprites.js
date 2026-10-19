// Carrega os PNGs de assets/ (mapa + batalha). Se algum faltar, o mapa usa a arte provisória desenhada por código.
// Para trocar a arte: substitua os arquivos em assets/ mantendo os tamanhos (ou rode tools/make_sprites.py).
(function (G) {
  const F = {
    tiles: 'assets/tiles/tileset.png',            // 80x16: chão A, chão B, chão circuito, parede, terminal (16x16 cada)
    hero: 'assets/sprites/hero-map.png',          // 64x64: linhas = baixo, esquerda, direita, cima; colunas = 4 quadros
    'boss1-map': 'assets/sprites/boss1-map.png',  // 32x16: 2 quadros
    'boss2-map': 'assets/sprites/boss2-map.png',
    'boss3-map': 'assets/sprites/boss3-map.png',
    player: 'assets/sprites/player.png',          // batalha (só pré-carrega; o CSS usa como fundo)
    boss1: 'assets/sprites/boss1.png',
    boss2: 'assets/sprites/boss2.png',
    boss3: 'assets/sprites/boss3.png',
    'slash-hero': 'assets/sprites/slash-hero.png',  // 768x96: 8 quadros de corte (só pré-carrega; o CSS anima)
    'slash-boss': 'assets/sprites/slash-boss.png'
  };
  G.sprites = {};
  Object.keys(F).forEach(k => { const im = new Image(); im.src = F[k]; G.sprites[k] = im; });
  G.hasSprite = k => { const im = G.sprites[k]; return !!(im && im.complete && im.naturalWidth > 0); };
})(Game);
