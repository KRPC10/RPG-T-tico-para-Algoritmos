// ============================================================================
// ALGO — a mini-linguagem do Algoritmia
// Catálogo de tokens · gramática (o que pode vir depois) · parser · interpretador · tradutor · validador.
// Arquivo PURO: não mexe no HTML. Roda no navegador (window.Algo) e no Node (para os testes em tests/).
//
// Gramática (versão 1):
//   PROGRAMA  := SE | ENQUANTO | ACAO
//   SE        := 'if'    DADO COMPARAR DADO ACAO [ 'else' ACAO ]
//   ENQUANTO  := 'while' DADO COMPARAR DADO ACAO [ 'break' ]
//
// Como a gramática é posicional, a "máquina de estados" só precisa olhar o 1º token e a posição atual.
// ============================================================================
(function (root) {
  'use strict';

  // ---------- Categorias (cor no CSS, rótulo no teclado e no "slot fantasma") ----------
  const CATS = {
    k: { rotulo: 'DECISÃO', icone: '◆' },
    o: { rotulo: 'COMPARAR', icone: '⇄' },
    v: { rotulo: 'DADO', icone: '▣' },
    a: { rotulo: 'AÇÃO', icone: '⚡' }
  };

  // ---------- Catálogo de tokens ----------
  // pt: como o narrador lê · py/js: como aparece em Python/JavaScript · explica: texto do "segure para saber"
  const TOKENS = {
    'if':    { cat: 'k', pt: 'Se',        explica: 'IF = SE. Só faz a ação quando a condição é verdadeira.' },
    'else':  { cat: 'k', pt: 'senão',     explica: 'ELSE = SENÃO. O que fazer quando a condição do IF é falsa.' },
    'while': { cat: 'k', pt: 'Enquanto',  explica: 'WHILE = ENQUANTO. Repete a ação enquanto a condição for verdadeira.' },
    'break': { cat: 'k', pt: 'pare',      explica: 'BREAK = PARE. Sai da repetição na hora.' },
    '==':    { cat: 'o', pt: 'for igual a',          py: '==', js: '===', explica: 'Compara: os dois lados são IGUAIS? (dois sinais de igual!)' },
    '!=':    { cat: 'o', pt: 'for diferente de',     py: '!=', js: '!==', explica: 'Compara: os dois lados são DIFERENTES?' },
    '>':     { cat: 'o', pt: 'for maior que',        py: '>',  js: '>',   explica: 'Compara: o lado esquerdo é MAIOR que o direito?' },
    '<':     { cat: 'o', pt: 'for menor que',        py: '<',  js: '<',   explica: 'Compara: o lado esquerdo é MENOR que o direito?' },
    'firewall':       { cat: 'v', explica: 'Força da barreira de proteção do inimigo.' },
    'security_level': { cat: 'v', explica: 'Nível de segurança que o seu programa consegue quebrar.' },
    'target_hp':      { cat: 'v', explica: 'Vida que o alvo precisa ter.' },
    'enemy_type':     { cat: 'v', explica: 'Código do tipo do inimigo.' },
    'hp':             { cat: 'v', explica: 'Pontos de vida (energia) do sistema.' },
    'enemy_shield':   { cat: 'v', explica: 'Camadas de escudo do inimigo.' },
    'hack':     { cat: 'a', pt: 'hack',     explica: 'Ação: invadir e causar dano.' },
    'disable':  { cat: 'a', pt: 'disable',  explica: 'Ação: desativar uma defesa.' },
    'analyze':  { cat: 'a', pt: 'analyze',  explica: 'Ação: analisar (escanear) o alvo.' },
    'override': { cat: 'a', pt: 'override', explica: 'Ação: sobrescrever o sistema do inimigo.' }
  };
  const cat = t => (TOKENS[t] || {}).cat || null;

  // ---------- Gramática ----------
  // Molde de cada estrutura: categoria esperada em cada posição (o 1º item é o próprio token de controle).
  const MOLDE = ['k', 'v', 'o', 'v', 'a'];

  /** Analisa uma sequência (pode estar incompleta). Devolve:
   *  ok        → a sequência até aqui é válida?
   *  completo  → já é um programa que pode ser executado?
   *  aceita(t) → função: o token t pode vir agora?
   *  falta     → categorias que AINDA são obrigatórias (para o slot fantasma), ex.: ['v','o','v','a']
   *  opcional  → tokens opcionais aceitos agora (ex.: ['else'])                                        */
  function estado(seq) {
    const n = seq.length, h = seq[0];
    const fim = { ok: true, completo: true, aceita: () => false, falta: [], opcional: [] };
    if (n === 0) return { ok: true, completo: false, aceita: t => t === 'if' || t === 'while' || cat(t) === 'a', falta: ['k', 'v', 'o', 'v', 'a'], opcional: [] };
    if (cat(h) === 'a') return n === 1 ? fim : { ok: false, completo: false, aceita: () => false, falta: [], opcional: [] };
    if (h !== 'if' && h !== 'while') return { ok: false, completo: false, aceita: () => false, falta: [], opcional: [] };
    // confere as posições já preenchidas
    for (let i = 1; i < Math.min(n, 5); i++) if (cat(seq[i]) !== MOLDE[i]) return { ok: false, completo: false, aceita: () => false, falta: [], opcional: [] };
    if (n < 5) return { ok: true, completo: false, aceita: t => cat(t) === MOLDE[n], falta: MOLDE.slice(n), opcional: [] };
    const extra = h === 'if' ? 'else' : 'break';
    if (n === 5) return { ok: true, completo: true, aceita: t => t === extra, falta: [], opcional: [extra] };
    if (seq[5] !== extra) return { ok: false, completo: false, aceita: () => false, falta: [], opcional: [] };
    if (h === 'while') return n === 6 ? fim : { ok: false, completo: false, aceita: () => false, falta: [], opcional: [] };
    // if … else ACAO
    if (n === 6) return { ok: true, completo: false, aceita: t => cat(t) === 'a', falta: ['a'], opcional: [] };
    if (n === 7 && cat(seq[6]) === 'a') return fim;
    return { ok: false, completo: false, aceita: () => false, falta: [], opcional: [] };
  }

  /** Tokens do teclado que podem ser tocados agora. */
  const proximos = (seq, teclado) => { const e = estado(seq); return teclado.filter(t => e.aceita(t)); };

  /** Sequência inteira é um programa válido e completo? */
  function valido(seq) {
    for (let i = 0; i < seq.length; i++) if (!estado(seq.slice(0, i)).aceita(seq[i])) return false;
    return estado(seq).completo;
  }

  // ---------- Parser ----------
  /** Transforma a sequência em árvore (AST). Aceita sequência incompleta: o que falta vira null. */
  function parse(seq) {
    const g = i => seq[i] === undefined ? null : seq[i];
    if (!seq.length) return { tipo: 'vazio' };
    if (cat(seq[0]) === 'a') return { tipo: 'acao', acao: seq[0] };
    const cond = { esq: g(1), op: g(2), dir: g(3) };
    if (seq[0] === 'if') return { tipo: 'se', cond, entao: g(4), senao: seq[5] === 'else' ? g(6) : undefined };
    return { tipo: 'enquanto', cond, faca: g(4), pare: seq[5] === 'break' };
  }

  // ---------- Interpretador ----------
  const compara = (a, op, b) => op === '==' ? a === b : op === '!=' ? a !== b : op === '>' ? a > b : op === '<' ? a < b : false;
  const LIMITE = 12; // repetições máximas antes de declarar laço infinito

  /** Executa a AST sobre um estado de variáveis. efeitos: { acao: { variavel: +n/-n } }.
   *  Devolve { acoes, passos, estado, infinito }. passos = trace para animar e explicar. */
  function executar(ast, estado0, efeitos) {
    const s = Object.assign({}, estado0), acoes = [], passos = [];
    const val = x => (x in s ? s[x] : 0);
    const testa = c => { const a = val(c.esq), b = val(c.dir), r = compara(a, c.op, b); passos.push({ tipo: 'cond', cond: c, a, b, r }); return r; };
    const faz = acao => {
      acoes.push(acao);
      const ef = (efeitos || {})[acao]; if (ef) Object.keys(ef).forEach(k => { s[k] = val(k) + ef[k]; });
      passos.push({ tipo: 'acao', acao, estado: Object.assign({}, s) }); // foto das variáveis depois da ação
    };
    let infinito = false;
    if (ast.tipo === 'acao') faz(ast.acao);
    else if (ast.tipo === 'se') { if (testa(ast.cond)) faz(ast.entao); else if (ast.senao) { passos.push({ tipo: 'senao' }); faz(ast.senao); } }
    else if (ast.tipo === 'enquanto') {
      let i = 0;
      while (testa(ast.cond)) {
        if (++i > LIMITE) { infinito = true; break; }
        faz(ast.faca);
        if (ast.pare) { passos.push({ tipo: 'break' }); break; }
      }
    }
    return { acoes, passos, estado: s, infinito };
  }

  // ---------- Validador ----------
  // O desafio traz: solucao (sequência de referência), testes (lista de estados) e efeitos (opcional).
  // A resposta do jogador é executada em TODOS os testes e comparada com o que a referência faz.
  // Assim qualquer solução logicamente equivalente é aceita, e "chutes" são recusados.
  function validar(seq, desafio) {
    if (!valido(seq)) return { ok: false, tipo: 'sintaxe' };
    const ast = parse(seq), ref = parse(desafio.solucao), testes = desafio.testes;
    for (let i = 0; i < testes.length; i++) {
      const r = executar(ast, testes[i], desafio.efeitos), e = executar(ref, testes[i], desafio.efeitos);
      if (r.infinito) return { ok: false, tipo: 'infinito', caso: testes[i], indice: i, r, e };
      if (r.acoes.join() !== e.acoes.join()) return { ok: false, tipo: 'logica', caso: testes[i], indice: i, r, e };
    }
    // Lógica certa, mas a missão pede um conceito específico (ex.: while + break): avisa sem punir
    const faltam = (desafio.exige || []).filter(t => !seq.includes(t));
    if (faltam.length) return { ok: false, tipo: 'estrutura', faltam, r: executar(ast, testes[0], desafio.efeitos) };
    return { ok: true, r: executar(ast, testes[0], desafio.efeitos) };
  }

  // ---------- Explicações em português (feedback pedagógico) ----------
  const listaAcoes = a => !a.length ? 'nada' : contagem(a);
  function contagem(a) {
    const m = []; a.forEach(x => { const u = m[m.length - 1]; u && u.x === x ? u.n++ : m.push({ x, n: 1 }); });
    return m.map(o => o.x + (o.n > 1 ? ' ×' + o.n : '')).join(', depois ');
  }
  const descreveCond = p => `${p.cond.esq} ${p.cond.op} ${p.cond.dir} → ${p.a} ${p.cond.op} ${p.b} → ${p.r ? 'VERDADEIRO' : 'FALSO'}`;

  /** Gera { titulo, texto } para mostrar quando o jogador erra. */
  function explicar(v) {
    if (v.tipo === 'sintaxe') return { titulo: 'COMANDO INCOMPLETO', texto: 'Complete os espaços que faltam antes de executar.' };
    if (v.tipo === 'estrutura') return { titulo: 'QUASE!', texto: `Sua lógica funciona, mas esta missão treina outro conceito: use ${v.faltam.join(' e ')}. Você não perdeu vida.` };
    const caso = Object.keys(v.caso).map(k => `${k} = ${v.caso[k]}`).join(' e ');
    if (v.tipo === 'infinito') return {
      titulo: 'LAÇO INFINITO!',
      texto: `Quando ${caso}, a condição nunca ficou falsa: a ação repetiria para sempre e o sistema travaria. Use uma condição que mude com a ação, ou um break para parar.`
    };
    const c = v.r.passos.find(p => p.tipo === 'cond');
    const fez = listaAcoes(v.r.acoes), era = listaAcoes(v.e.acoes);
    let dica = '';
    const mesmo = v.r.acoes.length && v.e.acoes.length && v.r.acoes.every(x => x === v.e.acoes[0]) && v.e.acoes.every(x => x === v.e.acoes[0]);
    if (mesmo && v.e.acoes.length > v.r.acoes.length) dica = ' Precisava REPETIR: pense no while.';
    else if (mesmo && v.e.acoes.length < v.r.acoes.length) dica = ' Repetiu demais: lembre do break ou de outra condição.';
    else if (!c && v.r.acoes.length) dica = ' Você agiu sem testar nada. Comece com uma decisão (if/while).';
    return {
      titulo: 'LÓGICA INCORRETA',
      texto: `Quando ${caso}: seu código fez «${fez}», mas o certo era «${era}».` + (c ? ` Veja: ${descreveCond(c)}.` : '') + dica
    };
  }

  // ---------- Tradutor ----------
  // Devolve uma lista de pedaços { t: texto, c: categoria } (c = 'k','o','v','a', 'x' = espaço vazio, '' = texto comum).
  // A interface só pinta cada pedaço com a cor da categoria. '\n' = quebra de linha.
  const S = (t, c) => ({ t, c: c || '' });
  const B = (x, c, fmt) => x === null || x === undefined ? S('___', 'x') : S(fmt ? fmt(x) : x, c);

  function traduzir(seq, lingua) {
    const ast = parse(seq);
    if (ast.tipo === 'vazio') return [];
    const op = (o, l) => o === null ? S('___', 'x') : S(l === 'pt' ? TOKENS[o].pt : TOKENS[o][l], 'o');
    const c = ast.cond;
    if (lingua === 'pt') {
      if (ast.tipo === 'acao') return [S('Sempre use '), S(ast.acao, 'a'), S(', sem testar nada.')];
      if (ast.tipo === 'se') {
        const o = [S('Se ', 'k'), B(c.esq, 'v'), S(' '), op(c.op, 'pt'), S(' '), B(c.dir, 'v'), S(', então use '), B(ast.entao, 'a')];
        if (ast.senao !== undefined) o.push(S('; '), S('senão', 'k'), S(', use '), B(ast.senao, 'a'));
        return o.concat(S('.'));
      }
      const o = [S('Enquanto ', 'k'), B(c.esq, 'v'), S(' '), op(c.op, 'pt'), S(' '), B(c.dir, 'v'), S(', repita '), B(ast.faca, 'a')];
      if (ast.pare) o.push(S(' e '), S('pare', 'k'), S(' (break)'));
      return o.concat(S('.'));
    }
    const call = (a, l) => a === null || a === undefined ? [S('___', 'x')] : [S(a, 'a'), S(l === 'py' ? '()' : '();')];
    if (lingua === 'py') {
      if (ast.tipo === 'acao') return call(ast.acao, 'py');
      const kw = ast.tipo === 'se' ? 'if' : 'while';
      const o = [S(kw, 'k'), S(' '), B(c.esq, 'v'), S(' '), op(c.op, 'py'), S(' '), B(c.dir, 'v'), S(':'), S('\n'), S('    ')].concat(call(ast.tipo === 'se' ? ast.entao : ast.faca, 'py'));
      if (ast.tipo === 'se' && ast.senao !== undefined) o.push(S('\n'), S('else', 'k'), S(':'), S('\n'), S('    '), ...call(ast.senao, 'py'));
      if (ast.tipo === 'enquanto' && ast.pare) o.push(S('\n'), S('    '), S('break', 'k'));
      return o;
    }
    // JavaScript
    if (ast.tipo === 'acao') return call(ast.acao, 'js');
    const kw = ast.tipo === 'se' ? 'if' : 'while';
    const o = [S(kw, 'k'), S(' ('), B(c.esq, 'v'), S(' '), op(c.op, 'js'), S(' '), B(c.dir, 'v'), S(') {'), S('\n'), S('  ')].concat(call(ast.tipo === 'se' ? ast.entao : ast.faca, 'js'));
    if (ast.tipo === 'enquanto' && ast.pare) o.push(S('\n'), S('  '), S('break', 'k'), S(';'));
    o.push(S('\n'), S('}'));
    if (ast.tipo === 'se' && ast.senao !== undefined) o.push(S(' '), S('else', 'k'), S(' {'), S('\n'), S('  '), ...call(ast.senao, 'js'), S('\n'), S('}'));
    return o;
  }

  /** Dica nível 3: qual o próximo token certo? Se o jogador já saiu do caminho, diz quantos apagar. */
  function proximoCerto(seq, solucao) {
    for (let i = 0; i < seq.length; i++) if (seq[i] !== solucao[i]) return { apagar: seq.length - i };
    return seq.length < solucao.length ? { token: solucao[seq.length] } : { pronto: true };
  }

  const api = { CATS, TOKENS, cat, estado, proximos, valido, parse, executar, validar, explicar, traduzir, proximoCerto, LIMITE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Algo = api;
})(typeof window !== 'undefined' ? window : this);
