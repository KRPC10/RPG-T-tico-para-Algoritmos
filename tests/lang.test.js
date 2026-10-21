// Testes da mini-linguagem (js/lang/algo.js). Rode no terminal: node tests/lang.test.js
// ou abra tests/tests.html no navegador.
(function (root) {
  const A = typeof module !== 'undefined' && module.exports ? require('../js/lang/algo.js') : root.Algo;
  const R = [];
  const t = (nome, fn) => { try { fn(); R.push({ nome, ok: true }); } catch (e) { R.push({ nome, ok: false, erro: e.message }); } };
  const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || '') + ' esperado ' + JSON.stringify(b) + ' obtido ' + JSON.stringify(a)); };
  const TEC = ['if', 'while', 'else', 'break', '==', '!=', '>', '<', 'firewall', 'hp', 'hack', 'disable'];
  const txt = segs => segs.map(s => s.t).join('');

  // --- gramática ---
  t('início aceita if, while e ações', () => eq(A.proximos([], TEC), ['if', 'while', 'hack', 'disable']));
  t('depois de if só aceita dados', () => eq(A.proximos(['if'], TEC), ['firewall', 'hp']));
  t('depois do dado só aceita comparação', () => eq(A.proximos(['if', 'hp'], TEC), ['==', '!=', '>', '<']));
  t('if completo aceita else opcional', () => { const e = A.estado(['if', 'hp', '>', 'firewall', 'hack']); eq(e.completo, true); eq(A.proximos(['if', 'hp', '>', 'firewall', 'hack'], TEC), ['else']); });
  t('while completo aceita break opcional', () => eq(A.proximos(['while', 'hp', '>', 'firewall', 'hack'], TEC), ['break']));
  t('else exige ação', () => { eq(A.estado(['if', 'hp', '>', 'firewall', 'hack', 'else']).completo, false); eq(A.proximos(['if', 'hp', '>', 'firewall', 'hack', 'else'], TEC), ['hack', 'disable']); });
  t('slot fantasma mostra o que falta', () => eq(A.estado(['if', 'hp']).falta, ['o', 'v', 'a']));
  t('sequência inválida é recusada', () => { eq(A.valido(['if', 'if']), false); eq(A.valido(['hack', 'hack']), false); eq(A.valido(['if', 'hp', '==']), false); });
  t('programas válidos', () => { eq(A.valido(['hack']), true); eq(A.valido(['if', 'hp', '==', 'firewall', 'hack', 'else', 'disable']), true); eq(A.valido(['while', 'hp', '>', 'firewall', 'hack', 'break']), true); });

  // --- interpretador ---
  t('if verdadeiro executa', () => eq(A.executar(A.parse(['if', 'hp', '==', 'firewall', 'hack']), { hp: 3, firewall: 3 }).acoes, ['hack']));
  t('if falso não executa', () => eq(A.executar(A.parse(['if', 'hp', '==', 'firewall', 'hack']), { hp: 2, firewall: 3 }).acoes, []));
  t('else executa quando falso', () => eq(A.executar(A.parse(['if', 'hp', '==', 'firewall', 'hack', 'else', 'disable']), { hp: 2, firewall: 3 }).acoes, ['disable']));
  t('while repete com efeito', () => eq(A.executar(A.parse(['while', 'hp', '>', 'firewall', 'hack']), { hp: 5, firewall: 2 }, { hack: { hp: -1 } }).acoes, ['hack', 'hack', 'hack']));
  t('while com break executa 1 vez', () => eq(A.executar(A.parse(['while', 'hp', '!=', 'firewall', 'hack', 'break']), { hp: 5, firewall: 2 }).acoes, ['hack']));
  t('laço infinito é detectado', () => eq(A.executar(A.parse(['while', 'hp', '!=', 'firewall', 'hack']), { hp: 5, firewall: 2 }).infinito, true));

  // --- validador ---
  const D = { solucao: ['if', 'firewall', '==', 'hp', 'hack'], testes: [{ firewall: 3, hp: 3 }, { firewall: 2, hp: 5 }] };
  t('solução igual é aceita', () => eq(A.validar(['if', 'firewall', '==', 'hp', 'hack'], D).ok, true));
  t('solução equivalente (lados trocados) é aceita', () => eq(A.validar(['if', 'hp', '==', 'firewall', 'hack'], D).ok, true));
  t('chute sem if é recusado', () => { const v = A.validar(['hack'], D); eq(v.ok, false); eq(v.tipo, 'logica'); eq(v.indice, 1); });
  t('operador errado é recusado', () => eq(A.validar(['if', 'firewall', '!=', 'hp', 'hack'], D).ok, false));
  t('explicação cita os valores', () => { const x = A.explicar(A.validar(['if', 'firewall', '!=', 'hp', 'hack'], D)); if (!/firewall = 3/.test(x.texto) || !/FALSO|VERDADEIRO/.test(x.texto)) throw new Error(x.texto); });
  const W = { solucao: ['while', 'hp', '>', 'firewall', 'hack'], efeitos: { hack: { hp: -1 } }, testes: [{ hp: 5, firewall: 2 }, { hp: 1, firewall: 2 }] };
  t('if no lugar de while é recusado e sugere repetir', () => { const v = A.validar(['if', 'hp', '>', 'firewall', 'hack'], W); eq(v.ok, false); if (!/while/.test(A.explicar(v).texto)) throw new Error(A.explicar(v).texto); });
  t('laço infinito vira feedback', () => { const v = A.validar(['while', 'hp', '==', 'hp', 'hack'], { solucao: ['while', 'hp', '>', 'firewall', 'hack', 'break'], testes: [{ hp: 3, firewall: 3 }] }); eq(v.tipo, 'infinito'); });

  t('exige: lógica certa sem o conceito pedido vira "estrutura"', () => {
    const E = { solucao: ['while', 'hp', '!=', 'firewall', 'hack', 'break'], exige: ['while', 'break'], testes: [{ hp: 5, firewall: 2 }, { hp: 2, firewall: 2 }] };
    const v = A.validar(['if', 'hp', '!=', 'firewall', 'hack'], E); eq(v.tipo, 'estrutura'); eq(v.faltam, ['while', 'break']);
    eq(A.validar(E.solucao, E).ok, true);
  });

  // --- tradutor ---
  t('português lê a frase', () => eq(txt(A.traduzir(['if', 'hp', '==', 'firewall', 'hack'], 'pt')), 'Se hp for igual a firewall, então use hack.'));
  t('português mostra lacunas', () => eq(txt(A.traduzir(['if', 'hp'], 'pt')), 'Se hp ___ ___, então use ___.'));
  t('python if/else', () => eq(txt(A.traduzir(['if', 'hp', '==', 'firewall', 'hack', 'else', 'disable'], 'py')), 'if hp == firewall:\n    hack()\nelse:\n    disable()'));
  t('javascript while/break', () => eq(txt(A.traduzir(['while', 'hp', '!=', 'firewall', 'hack', 'break'], 'js')), 'while (hp !== firewall) {\n  hack();\n  break;\n}'));
  t('próximo certo (dica 3)', () => { eq(A.proximoCerto(['if'], D.solucao), { token: 'firewall' }); eq(A.proximoCerto(['if', 'hp'], D.solucao), { apagar: 1 }); });

  const api = { resultados: R, passou: R.filter(r => r.ok).length, total: R.length };
  if (typeof module !== 'undefined' && module.exports) {
    R.forEach(r => console.log((r.ok ? '✔ ' : '✘ ') + r.nome + (r.ok ? '' : '  → ' + r.erro)));
    console.log(`\n${api.passou} de ${api.total} testes passaram`); if (api.passou !== api.total) process.exitCode = 1;
  } else root.TESTES = api;
})(typeof window !== 'undefined' ? window : this);
