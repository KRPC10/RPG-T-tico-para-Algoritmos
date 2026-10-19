// Banco de diálogos dos NPCs. Para criar outro NPC: copie o bloco "mentor_hub" com um novo id e
// coloque { npc: { id, x, y } } na fase (js/data/levels.js).
// art: grade 16x16 em texto (linhas centralizadas automaticamente, "." = transparente) · palette: letra → cor.
// avatar (opcional): caminho de um PNG que substitui a arte desenhada. {nome} vira o nome do jogador.
(function (G) {
  G.dialogues = {
    mentor_hub: {
      name: 'MENTOR',
      palette: { o: '#10131f', u: '#563490', v: '#7e54be', k: '#181c2e', c: '#3ee8ff', r: '#34265f', a: '#2aa9c9', g: '#4dff88' },
      art: ['oooooo', 'ouvvvvuo', 'ouvvvvvvuo', 'ouvkkkkvuo', 'oukcccckuo', 'oukkkkkkuo', 'ooukkkkuoo',
            'ourrrrrruo', 'ouurrggrruuo', 'ouurrrrrruuo', 'oaurrrrrruao', 'ouurrrrrruuo', 'ourrrrrrrruo', 'orrrrrrrrrro', 'oooooooooooo'],
      greeting: 'Olá, {nome}! Eu sou o Mentor. Antes de lutar, que tal aprender um truque? Sobre o que quer conversar?',
      topics: [
        { id: 'vars',  label: 'Variáveis',
          text: 'Variável é uma caixinha com nome que guarda um valor. Exemplo: hp guarda a sua vida. No teclado, as palavras verdes são variáveis, como firewall e target_hp.' },
        { id: 'if',    label: 'Condicionais (IF/ELSE)',
          text: 'IF quer dizer SE: o computador só age se a condição for verdadeira. SE a vida for menor que 10, curar. ELSE é o SENÃO: o que fazer quando a condição é falsa.' },
        { id: 'while', label: 'Repetição (WHILE)',
          text: 'WHILE quer dizer ENQUANTO: repete uma ação enquanto a condição for verdadeira. ENQUANTO a porta estiver trancada, tentar abrir. Cuidado: se a condição nunca mudar, repete para sempre!' },
        { id: 'end',   label: 'Encerrar', end: true,
          text: 'Boa sorte, {nome}! Se tiver dúvida, volte a falar comigo.' }
      ]
    }
  };
})(Game);
