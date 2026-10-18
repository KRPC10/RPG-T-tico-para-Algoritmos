// Dados das fases. Para criar uma fase nova, é só adicionar um item em Game.levels.
// Mapa: # parede · T terminal (sólido) · . chão · P início do jogador · E inimigo.
(function (G) {
  const base = ["############","#..........#","#.TT....TT.#","#..........#","#..####....#","#..#..#....#","#..#..#....#",
    "#..#.......#","#.....##...#","#..TT......#","#..........#","#..........#","#..........#","############"];
  const put = (px, py, ex, ey) => base.map((r, y) => [...r].map((c, x) => x === px && y === py ? 'P' : x === ex && y === ey ? 'E' : c).join(''));
  // Teclado 5x4: [texto, categoria] — k controle · o operador · v variável · a ação · null = tecla vazia
  const K = [['if','k'],['while','k'],['for','k'],['else','k'],['break','k'],
    ['var','o'],['function','o'],['==','o'],['!=','o'],['>','o'],
    ['target_hp','v'],['enemy_type','v'],['security_level','v'],['firewall','v'],['hp','v'],
    ['disable','a'],['analyze','a'],['hack','a'],['override','a'],[';','a']];
  G.levels = [
    { id: 1, map: put(4, 11, 9, 5), keys: K, dmg: 80,
      boss: { name: 'CYBER-VAMPIRE', sprite: 'boss1', lvl: 'Nível 1', hp: 160 },
      challenges: [
        { intent: 'Se o firewall for igual a security_level, ataque com hack.', solutions: [['if','firewall','==','security_level','hack']], hint: 'Monte na ordem da frase: decisão (ciano) → o que comparar (verde) → operador (roxo) → o outro lado da comparação (verde) → ação (rosa).' },
        { intent: 'Se hp for diferente de target_hp, use disable.', solutions: [['if','hp','!=','target_hp','disable']], hint: 'Procure no teclado o operador roxo que significa "diferente de". A ação é a que a própria frase manda usar.' } ] },
    { id: 2, map: put(9, 1, 2, 12), keys: K, dmg: 80,
      boss: { name: 'SYNTH-WARDEN', sprite: 'boss2', lvl: 'Nível 2', hp: 160 },
      challenges: [
        { intent: 'Se enemy_type for diferente de firewall, use override.', solutions: [['if','enemy_type','!=','firewall','override']], hint: 'Mesmo molde da fase anterior: decisão, dois verdes com um operador roxo no meio, e a ação rosa. Atenção ao "diferente".' },
        { intent: 'Enquanto hp for maior que target_hp, use analyze.', solutions: [['while','hp','>','target_hp','analyze']], hint: 'Aqui a estrutura é de repetição, não de escolha. "Maior que" tem um símbolo roxo só dele.' } ] }
  ];
})(Game);
