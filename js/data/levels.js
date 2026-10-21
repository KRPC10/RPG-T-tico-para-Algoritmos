// Dados das fases. Para criar uma fase nova, é só adicionar um item em Game.levels.
// Mapa: # parede · T terminal (sólido) · . chão · P início do jogador · E inimigo.
//
// Cada DESAFIO tem:
//   intent   → a missão em português (as palavras que são blocos ficam coloridas sozinhas)
//   solucao  → UMA resposta certa (serve de referência e para a dica nível 3)
//   testes   → cenários de variáveis. O 1º é o que aparece na batalha. Os outros garantem que o aluno
//              entendeu a lógica (ex.: um cenário em que o IF é falso). Qualquer resposta que faça o
//              mesmo que a referência em TODOS os cenários é aceita.
//   efeitos  → (opcional) o que cada ação muda nas variáveis. Ex.: { analyze: { hp: -1 } } — usado no while.
//   exige    → (opcional) blocos obrigatórios. Se a lógica estiver certa mas faltar um deles, o jogo avisa sem tirar vida.
//   dicas    → [nível 1 (conceito), nível 2 (estrutura)]. O nível 3 pisca os blocos certos automaticamente.
//   time     → (opcional) segundos para o chefão.
//
// Teclado: cada fase mostra só os blocos que já foram ensinados (teclado cumulativo, ver novos:).
(function (G) {
  const base = ["############","#..........#","#.TT....TT.#","#..........#","#..####....#","#..#..#....#","#..#..#....#",
    "#..#.......#","#.....##...#","#..TT......#","#..........#","#..........#","#..........#","############"];
  const arena = ["############","#..........#","#.T......T.#","#....##....#","#..........#","#..T....T..#","#..........#","#....##....#","#..........#","#.T......T.#","#..........#","#..........#","#..........#","############"];
  const put = (px, py, ex, ey, b = base) => b.map((r, y) => [...r].map((c, x) => x === px && y === py ? 'P' : x === ex && y === ey ? 'E' : c).join(''));

  // Blocos de DADOS e AÇÕES aparecem em todas as fases. Decisões e comparações entram aos poucos.
  const DADOS = ['firewall', 'security_level', 'target_hp', 'hp', 'enemy_type'];
  const ACOES = ['hack', 'disable', 'analyze', 'override'];
  let acumulado = [];
  const teclado = novos => (acumulado = acumulado.concat(novos), acumulado.concat(DADOS, ACOES));

  // ---------- TREINAMENTO (js/screens/training.js) ----------
  // demo: a "mão" monta estes dois comandos sozinha (um certo, um com erro corrigido). pratica: o jogador monta sozinho.
  const TECLADO_TREINO = ['if', '==', '!=', '>', '<', 'firewall', 'security_level', 'hp', 'target_hp', 'enemy_type', 'hack', 'disable', 'override'];
  const BOT = { name: 'BOT-TREINO', sprite: 'boss2', lvl: 'Treino', falas: ['Sou só um robô de treino!', 'Pode testar à vontade.'] };
  G.treino = {
    demo: { id: 'T', conceito: 'Treino', keys: TECLADO_TREINO, dmg: 50, boss: Object.assign({ hp: 100 }, BOT), challenges: [
      { intent: 'Se o firewall for igual ao security_level, ataque com hack.', solucao: ['if', 'firewall', '==', 'security_level', 'hack'],
        testes: [{ firewall: 3, security_level: 3 }, { firewall: 2, security_level: 5 }], dicas: [] },
      { intent: 'Se hp for maior que target_hp, use disable.', solucao: ['if', 'hp', '>', 'target_hp', 'disable'],
        testes: [{ hp: 5, target_hp: 2 }, { hp: 1, target_hp: 2 }, { hp: 2, target_hp: 2 }], dicas: [] } ] },
    pratica: { id: 'T', conceito: 'Treino', keys: TECLADO_TREINO, dmg: 50, boss: Object.assign({ hp: 50 }, BOT), challenges: [
      { intent: 'Se enemy_type for diferente de firewall, use override.', solucao: ['if', 'enemy_type', '!=', 'firewall', 'override'],
        testes: [{ enemy_type: 2, firewall: 5 }, { enemy_type: 5, firewall: 5 }, { enemy_type: 7, firewall: 5 }],
        dicas: ['Comece pela DECISÃO: "Se" é o bloco if.', 'Molde: if → enemy_type → != → firewall → override.'] } ] }
  };

  G.levels = [
    { id: 1, conceito: 'IF · decisão', map: put(4, 11, 9, 5), npc: { id: 'mentor_hub', x: 3, y: 3 }, keys: teclado(['if', '==', '!=']), dmg: 80,
      boss: { name: 'CYBER-VAMPIRE', sprite: 'boss1', lvl: 'Nível 1', hp: 160, falas: ['Meu firewall é impenetrável!', 'Você não passa da minha segurança!'] },
      challenges: [
        { intent: 'Se o firewall for igual ao security_level, ataque com hack.',
          solucao: ['if', 'firewall', '==', 'security_level', 'hack'],
          testes: [{ firewall: 3, security_level: 3 }, { firewall: 2, security_level: 5 }],
          dicas: ['"Se" é uma DECISÃO: comece pelo bloco ciano if.', 'Depois do if vem a comparação: DADO → COMPARAR → DADO. Por fim a AÇÃO (rosa).'] },
        { intent: 'Se hp for diferente de target_hp, use disable.',
          solucao: ['if', 'hp', '!=', 'target_hp', 'disable'],
          testes: [{ hp: 7, target_hp: 4 }, { hp: 4, target_hp: 4 }],
          dicas: ['"Diferente de" tem um símbolo roxo próprio: !=', 'Molde: if → hp → != → target_hp → disable.'] } ] },

    { id: 2, conceito: 'WHILE · repetição', map: put(9, 1, 2, 12), npc: { id: 'mentor_hub', x: 7, y: 3 }, keys: teclado(['while', '>']), dmg: 80,
      boss: { name: 'SYNTH-WARDEN', sprite: 'boss2', lvl: 'Nível 2', hp: 160, falas: ['Meus escudos se regeneram!', 'Um golpe só não basta!'] },
      challenges: [
        { intent: 'Se enemy_type for diferente de firewall, use override.',
          solucao: ['if', 'enemy_type', '!=', 'firewall', 'override'],
          testes: [{ enemy_type: 2, firewall: 5 }, { enemy_type: 5, firewall: 5 }, { enemy_type: 7, firewall: 5 }],
          dicas: ['Mesmo molde da fase 1: uma decisão com "diferente".', 'if → enemy_type → != → firewall → override.'] },
        { intent: 'Enquanto hp for maior que target_hp, use analyze.',
          solucao: ['while', 'hp', '>', 'target_hp', 'analyze'],
          efeitos: { analyze: { hp: -1 } },
          testes: [{ hp: 5, target_hp: 2 }, { hp: 1, target_hp: 2 }],
          dicas: ['"Enquanto" é REPETIÇÃO: use while, não if. Cada analyze baixa o hp em 1, então ele repete até a condição ficar falsa (COMBO!).', '"Maior que" é o símbolo roxo >. Molde: while → hp → > → target_hp → analyze.'] } ] },

    // ---------- FASE 3: CHEFÃO (com tempo limite) ----------
    { id: 3, conceito: 'ELSE e BREAK · chefão', map: put(5, 12, 5, 2, arena), npc: { id: 'mentor_hub', x: 8, y: 11 }, keys: teclado(['else', 'break', '<']), dmg: 100, timer: 25,
      boss: { name: 'ROOT-DAEMON', sprite: 'boss3', lvl: 'CHEFÃO · Nível 3', hp: 400, big: true, falas: ['Eu sou o sistema raiz!', 'Seu tempo está acabando…', 'Nenhum script me derruba!'] },
      challenges: [
        { time: 35, intent: 'Se security_level for diferente de firewall, ataque com hack; senão, use disable.',
          solucao: ['if', 'security_level', '!=', 'firewall', 'hack', 'else', 'disable'],
          testes: [{ security_level: 4, firewall: 2 }, { security_level: 3, firewall: 3 }, { security_level: 1, firewall: 4 }],
          dicas: ['"Senão" é o else: o que fazer quando a condição é falsa. Ele vem DEPOIS da primeira ação.', 'if → security_level → != → firewall → hack → else → disable.'] },
        { time: 30, intent: 'Enquanto target_hp for maior que hp, use analyze.',
          solucao: ['while', 'target_hp', '>', 'hp', 'analyze'],
          efeitos: { analyze: { target_hp: -1 } },
          testes: [{ target_hp: 4, hp: 1 }, { target_hp: 1, hp: 3 }],
          dicas: ['Repetição: while. Cada analyze baixa o target_hp em 1.', 'Atenção à ordem: target_hp vem antes do > e hp depois.'] },
        { time: 30, intent: 'Se enemy_type for igual a firewall, use override; senão, use hack.',
          solucao: ['if', 'enemy_type', '==', 'firewall', 'override', 'else', 'hack'],
          testes: [{ enemy_type: 6, firewall: 6 }, { enemy_type: 1, firewall: 6 }, { enemy_type: 9, firewall: 6 }],
          dicas: ['Decisão com dois caminhos: if … else.', 'if → enemy_type → == → firewall → override → else → hack.'] },
        { time: 30, intent: 'Enquanto hp for diferente de security_level, use hack e pare com break.',
          solucao: ['while', 'hp', '!=', 'security_level', 'hack', 'break'],
          testes: [{ hp: 5, security_level: 2 }, { hp: 2, security_level: 2 }, { hp: 1, security_level: 2 }],
          exige: ['while', 'break'],
          dicas: ['O hack aqui não muda o hp. Sem um break, a repetição nunca termina (laço infinito!).', 'while → hp → != → security_level → hack → break.'] }
      ] }
  ];
})(Game);
