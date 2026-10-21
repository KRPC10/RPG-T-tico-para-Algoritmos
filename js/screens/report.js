// Relatório: transforma os eventos registrados (js/metrics/logger.js) em números para o aluno e o professor.
// As 3 barras do topo são o "Mapa de Habilidades": Lógica Condicional, Compreensão de Laços e Eficiência do Código.
(function (G) {
  const $ = s => document.querySelector(s), M = () => G.metrics;
  let escopo = 'sessao', voltar = 'title';
  const pct = (a, b) => b ? Math.round(a / b * 100) : null;
  const media = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;

  // Agrupa os eventos por desafio jogado (cada "desafio_inicio" abre um grupo)
  function analisar(ev) {
    const grupos = [], atual = {};
    let dicas = 0, tempos = 0, lutas = 0, vitorias = 0;
    ev.forEach(e => {
      if (e.tipo === 'desafio_inicio') { const g = { conceito: e.conceito, fase: e.fase, desafio: e.desafio, execs: [], dicas: 0 }; grupos.push(g); atual[e.s] = g; }
      else if (e.tipo === 'execucao' && atual[e.s]) atual[e.s].execs.push(e);
      else if (e.tipo === 'dica') { dicas++; if (atual[e.s]) atual[e.s].dicas++; }
      else if (e.tipo === 'tempo_esgotado') tempos++;
      else if (e.tipo === 'luta_fim') { lutas++; if (e.vitoria) vitorias++; }
    });
    const tentados = grupos.filter(g => g.execs.length);
    const okFirst = g => g.execs[0].ok;
    const concl = tentados.filter(g => g.execs.some(x => x.ok));
    const oks = ev.filter(e => e.tipo === 'execucao' && e.ok);
    const conc = nomes => { const gs = tentados.filter(g => nomes.includes(g.conceito)); return { n: gs.length, primeira: gs.filter(okFirst).length, ok: gs.filter(g => g.execs.some(x => x.ok)).length }; };
    return {
      tentados: tentados.length, concluidos: concl.length, primeira: tentados.filter(okFirst).length,
      tempoMedio: media(oks.map(e => e.ms / 1000)),
      tentMedia: media(concl.map(g => g.execs.findIndex(x => x.ok) + 1)),
      erros: ev.filter(e => e.tipo === 'execucao' && !e.ok),
      dicas, tempos, lutas, vitorias,
      eficiencia: media(oks.map(e => Math.min(1, e.minimo / e.blocos))),
      cond: conc(['if', 'else']), laco: conc(['while']),
      porDesafio: porDesafio(tentados),
      jogadores: new Set(ev.filter(e => e.j).map(e => e.j)).size, sessoes: new Set(ev.map(e => e.s)).size
    };
  }

  // Um item por desafio do jogo (F1·1, F1·2 …): tempo médio até acertar e tentativas, só de quem concluiu
  function porDesafio(tentados) {
    const itens = [];
    G.levels.forEach(L => L.challenges.forEach((c, i) => {
      const gs = tentados.filter(g => g.fase === L.id && g.desafio === i + 1);
      const ok = gs.filter(g => g.execs.some(x => x.ok));
      const seg = media(ok.map(g => g.execs.find(x => x.ok).ms / 1000));
      const tent = media(ok.map(g => g.execs.findIndex(x => x.ok) + 1));
      const rot = `F${L.id}·${i + 1}`;
      itens.push({ rotulo: rot, valor: seg,
        tip: seg === null ? `${rot}: ainda sem acerto registrado` : `${rot} · ${c.solucao[0]}: ${num(seg, 1, ' s')} em média · ${num(tent, 1)} tentativa(s) · n = ${ok.length}`,
        linha: [rot, c.solucao[0], num(seg, 1, ' s'), num(tent, 1), ok.length + '/' + gs.length] });
    }));
    return itens;
  }

  const barra = (rotulo, valor, sub) => `<div class="skill"><div class="sk-top"><span>${rotulo}</span><b>${valor === null ? '—' : valor + '%'}</b></div>
    <div class="sk-bar"><u style="width:${valor || 0}%"></u></div><small>${sub}</small></div>`;
  const tile = (rot, val, sub) => `<div class="tile"><b>${val}</b><span>${rot}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const num = (v, casas, suf) => v === null ? '—' : v.toFixed(casas).replace('.', ',') + (suf || '');

  function render() {
    document.querySelectorAll('#rep-scope button').forEach(b => b.classList.toggle('on', b.dataset.s === escopo));
    const ev = M().eventos(escopo), r = analisar(ev);
    if (!ev.length) { $('#rep-body').innerHTML = '<p class="txt">Ainda não há dados. Jogue uma fase e volte aqui.</p>'; }
    else $('#rep-body').innerHTML =
      '<h3 class="rep-h">Mapa de habilidades</h3>' +
      barra('Lógica Condicional (if / else)', pct(r.cond.primeira, r.cond.n), `acerto de primeira · ${r.cond.n} desafio(s)`) +
      barra('Compreensão de Laços (while)', pct(r.laco.primeira, r.laco.n), `acerto de primeira · ${r.laco.n} desafio(s)`) +
      barra('Eficiência do Código', r.eficiencia === null ? null : Math.round(r.eficiencia * 100), 'blocos da solução mínima ÷ blocos usados') +
      '<h3 class="rep-h">Tempo até acertar, por desafio</h3>' +
      G.charts.colunas(r.porDesafio, { titulo: 'Tempo médio até acertar, por desafio', un: ' s', vazio: 'Conclua um desafio para ver o gráfico.',
        colunas: ['Desafio', 'Conceito', 'Tempo médio', 'Tentativas', 'Concluíram'] }) +
      '<p class="txt small">Toque numa coluna para ver o detalhe. Colunas mais altas = desafios em que a turma demora mais.</p>' +
      '<h3 class="rep-h">Desempenho</h3><div class="tiles">' +
      tile('desafios concluídos', `${r.concluidos}/${r.tentados}`) +
      tile('acerto de primeira', r.tentados ? pct(r.primeira, r.tentados) + '%' : '—', `${r.primeira} de ${r.tentados}`) +
      tile('tempo médio até acertar', num(r.tempoMedio, 1, ' s')) +
      tile('tentativas por desafio', num(r.tentMedia, 1)) +
      tile('erros de lógica', r.erros.filter(e => e.resultado === 'logica').length) +
      tile('laços infinitos', r.erros.filter(isLoop).length) +
      tile('erros de sintaxe', 0, 'impossível pelo teclado guiado') +
      tile('dicas usadas', r.dicas) +
      tile('tempo esgotado', r.tempos) +
      tile('lutas vencidas', `${r.vitorias}/${r.lutas}`) +
      (escopo === 'tudo' ? tile('jogadores', r.jogadores, r.sessoes + ' sessão(ões)') : '') +
      '</div>';
    if (G.bench) $('#bench-summary').innerHTML = G.charts.compare(G.bench.resumo()) + G.bench.resumoHTML();
  }
  // "tipo" é o tipo do evento; o resultado da execução (ok, logica, infinito) fica em "resultado".
  const isLoop = e => e.tipo === 'execucao' && !e.ok && e.resultado === 'infinito';

  G.report = { open(de) { voltar = de || 'title'; render(); G.show('report'); $('#screen-report').scrollTop = 0; }, analisar };
  $('#rep-back').onclick = () => { G.charts.hideTip(); G.show(voltar); };
  $('#rep-scope').onclick = e => { const b = e.target.closest('button'); if (b) { escopo = b.dataset.s; render(); } };
  $('#rep-csv').onclick = () => {
    const ev = M().eventos('tudo'); if (!ev.length) return G.toast('SEM DADOS', 'var(--ye)');
    const linhas = ev.map(e => Object.assign({}, e, { quando: new Date(e.t).toLocaleString('pt-BR') }));
    M().baixar('algoritmia-jogo.csv', M().csv(linhas, ['quando', 's', 'j', 'tipo', 'fase', 'desafio', 'conceito', 'ok', 'resultado', 'tentativa', 'blocos', 'minimo', 'ms', 'nivel', 'vitoria', 'segundos', 'codigo']));
  };
  $('#rep-clear').onclick = () => {
    const b = $('#rep-clear');
    if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'TOQUE DE NOVO PARA CONFIRMAR'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'APAGAR DADOS'; }, 3000); return; }
    M().limpar(); if (G.bench) G.bench.limpar(); delete b.dataset.sure; b.textContent = 'APAGAR DADOS'; G.toast('DADOS APAGADOS'); render();
  };
})(Game);
