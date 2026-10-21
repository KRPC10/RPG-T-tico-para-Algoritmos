// TESTE DE DIGITAÇÃO — mini-experimento para gerar DADOS REAIS do projeto.
// Cada participante resolve 2 missões equivalentes: uma digitando no teclado do celular (QWERTY)
// e outra com o teclado de blocos. A ordem alterna entre participantes (A→B, B→A) para ser justo.
// Mede: tempo até acertar, tentativas, erros de sintaxe e erros de lógica. Exporta CSV.
(function (G) {
  const $ = s => document.querySelector(s), A = window.Algo, KEY = 'algoritmia_bench';
  const M = [ // duas missões do mesmo tamanho: a 1ª rodada usa sempre a M1, a 2ª sempre a M2
    { intent: 'Se firewall for igual a security_level, use hack.', solucao: ['if', 'firewall', '==', 'security_level', 'hack'],
      testes: [{ firewall: 3, security_level: 3 }, { firewall: 1, security_level: 4 }] },
    { intent: 'Se hp for diferente de target_hp, use disable.', solucao: ['if', 'hp', '!=', 'target_hp', 'disable'],
      testes: [{ hp: 6, target_hp: 2 }, { hp: 2, target_hp: 2 }] }
  ];
  const TECLAS = ['if', '==', '!=', 'firewall', 'security_level', 'hp', 'target_hp', 'hack', 'disable'];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ler = () => G.metrics.ler(KEY), gravar = a => G.metrics.gravar(KEY, a);
  let P, rodada, t0, tent, sint, logi, seq;

  // Confere o que foi digitado. Formato Python: if a == b: acao()
  // Estrutura errada (faltou ":", "()", espaço, letra trocada em palavra-chave...) = erro de SINTAXE.
  // Estrutura certa mas nomes/operador/ação errados = erro de LÓGICA.
  function conferir(txt, m) {
    const r = /^\s*if\s+([A-Za-z_]\w*)\s*(==|!=|>|<)\s*([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w*)\s*\(\s*\)\s*;?\s*$/.exec(txt);
    if (!r) return 'sintaxe';
    const seqDigitada = ['if', r[1], r[2], r[3], r[4]];
    if (!seqDigitada.every(t => A.TOKENS[t])) return 'logica';
    return A.validar(seqDigitada, m).ok ? 'ok' : 'logica';
  }

  function tela(html) { $('#bench').innerHTML = html; }

  function intro() {
    const n = ler().length;
    tela(`<h2 class="logo sm">QWERTY × BLOCOS</h2>
      <p class="txt">Cada participante faz <b>2 missões curtas</b>: uma <b>digitando</b> no teclado do celular e outra com os <b>blocos</b> do Algoritmia.
      O jogo mede o tempo e os erros. Leva cerca de 2 minutos.</p>
      <label class="lbl">Código do participante (opcional, sem nome completo)<input id="b-part" type="text" maxlength="12" placeholder="ex.: P${String(n + 1).padStart(2, '0')}" autocomplete="off"></label>
      <p class="txt small">Ordem deste participante: <b>${n % 2 === 0 ? 'Digitação → Blocos' : 'Blocos → Digitação'}</b> (alterna para ser justo).</p>
      <nav class="menu wide"><button class="pri" id="b-go">COMEÇAR</button></nav>
      <h3 class="rep-h">Resultados até agora</h3>${resumoHTML()}`);
    $('#b-go').onclick = () => {
      P = { id: Date.now().toString(36), quando: new Date().toLocaleString('pt-BR'), participante: ($('#b-part').value || 'P' + String(n + 1).padStart(2, '0')).trim(),
            ordem: n % 2 === 0 ? 'QWERTY>BLOCOS' : 'BLOCOS>QWERTY' };
      rodada = 0; preparar();
    };
  }

  const metodo = () => (P.ordem.startsWith('QWERTY') ? ['qwerty', 'blocos'] : ['blocos', 'qwerty'])[rodada];

  function preparar() {
    const m = M[rodada], qw = metodo() === 'qwerty';
    tela(`<div class="b-step">RODADA ${rodada + 1} DE 2 · ${qw ? '⌨ TECLADO DO CELULAR' : '▦ BLOCOS'}</div>
      <p class="mission big"><span class="mlab">MISSÃO</span> ${esc(m.intent)}</p>
      <p class="txt">${qw ? 'Você vai <b>digitar</b> o código em Python. Formato de exemplo (com outros nomes):<br><code>if energia == limite: atacar()</code>'
        : 'Você vai <b>tocar nos blocos</b> na ordem certa e depois em EXECUTAR.'}</p>
      <p class="txt small">O tempo começa quando tocar em INICIAR.</p>
      <nav class="menu wide"><button class="pri" id="b-start">INICIAR</button></nav>`);
    $('#b-start').onclick = () => { t0 = performance.now(); tent = 0; sint = 0; logi = 0; seq = []; qw ? qwerty() : blocos(); };
  }

  function qwerty() {
    const m = M[rodada];
    tela(`<div class="b-step">RODADA ${rodada + 1} DE 2 · ⌨ DIGITE</div>
      <p class="mission"><span class="mlab">MISSÃO</span> ${esc(m.intent)}</p>
      <textarea id="b-txt" rows="3" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="digite o código aqui"></textarea>
      <div class="feedback" id="b-fb" hidden></div>
      <nav class="menu wide"><button class="pri" id="b-send">ENVIAR</button><button id="b-skip">NÃO CONSEGUI (PULAR)</button></nav>`);
    const ta = $('#b-txt'); ta.focus();
    $('#b-send').onclick = () => {
      if (!ta.value.trim()) return;
      tent++; const r = conferir(ta.value, m);
      if (r === 'ok') return fim(true);
      r === 'sintaxe' ? sint++ : logi++;
      const fb = $('#b-fb'); fb.hidden = false; fb.className = 'feedback bad';
      fb.innerHTML = `<b>✖ Ainda não está certo</b> (tentativa ${tent}). Revise e envie de novo.`;
    };
    $('#b-skip').onclick = () => fim(false);
  }

  function blocos() {
    const m = M[rodada];
    tela(`<div class="b-step">RODADA ${rodada + 1} DE 2 · ▦ BLOCOS</div>
      <p class="mission"><span class="mlab">MISSÃO</span> ${esc(m.intent)}</p>
      <div class="code" id="b-code"></div><div class="feedback" id="b-fb" hidden></div>
      <div class="keys" id="b-keys"></div>
      <div class="actrow"><button class="aux" id="b-undo">⌫ APAGAR</button><button class="exec" id="b-exec">▶ EXECUTAR</button></div>
      <nav class="menu wide"><button id="b-skip">NÃO CONSEGUI (PULAR)</button></nav>`);
    $('#b-keys').innerHTML = ['k', 'o', 'v', 'a'].map(c => `<div class="krow"><span class="klab c-${c}"><i>${A.CATS[c].icone}</i>${A.CATS[c].rotulo}</span><div class="kbtns">` +
      TECLAS.filter(t => A.cat(t) === c).map(t => `<button class="key ${c}" data-t="${t}">${t.replace(/_/g, '_<wbr>')}</button>`).join('') + '</div></div>').join('');
    const draw = () => {
      const st = A.estado(seq);
      $('#b-code').innerHTML = '<b class="prompt">&gt;</b>' + seq.map((t, i) => `<button class="chip ${A.cat(t)}" data-i="${i}">${t}</button>`).join('') +
        st.falta.map(f => `<span class="ghost ${f}">${A.CATS[f].rotulo}</span>`).join('');
      document.querySelectorAll('#b-keys .key').forEach(b => { const ok = st.aceita(b.dataset.t); b.disabled = !ok; b.classList.toggle('off', !ok); });
      $('#b-exec').classList.toggle('ready', st.completo);
    };
    $('#b-keys').onclick = e => { const b = e.target.closest('.key'); if (b && A.estado(seq).aceita(b.dataset.t)) { seq.push(b.dataset.t); $('#b-fb').hidden = true; draw(); } };
    $('#b-code').onclick = e => { const c = e.target.closest('.chip'); if (c) { seq = seq.slice(0, +c.dataset.i); draw(); } };
    $('#b-undo').onclick = () => { seq.pop(); draw(); };
    if (G.fitKeys) G.fitKeys($('#b-keys'));
    $('#b-exec').onclick = () => {
      if (!A.estado(seq).completo) return G.toast('COMPLETE O COMANDO', 'var(--ye)');
      tent++; if (A.validar(seq, m).ok) return fim(true);
      logi++; const fb = $('#b-fb'); fb.hidden = false; fb.className = 'feedback bad';
      fb.innerHTML = `<b>✖ Ainda não está certo</b> (tentativa ${tent}). Revise e execute de novo.`;
    };
    $('#b-skip').onclick = () => fim(false);
    draw();
  }

  function fim(concluiu) {
    P[metodo()] = { segundos: +((performance.now() - t0) / 1000).toFixed(1), tentativas: tent, sintaxe: sint, logica: logi, concluiu };
    if (rodada === 0) { rodada = 1; return preparar(); }
    const a = ler(); a.push(P); gravar(a);
    const q = P.qwerty, b = P.blocos;
    tela(`<h2 class="logo sm">OBRIGADO!</h2>
      <div class="res-stats">
        <div><span></span><b>⌨ Digitação</b><b>▦ Blocos</b></div>
        <div><span>Tempo</span><b>${q.concluiu ? String(q.segundos).replace('.', ',') + ' s' : 'não concluiu'}</b><b>${b.concluiu ? String(b.segundos).replace('.', ',') + ' s' : 'não concluiu'}</b></div>
        <div><span>Tentativas</span><b>${q.tentativas}</b><b>${b.tentativas}</b></div>
        <div><span>Erros de sintaxe</span><b>${q.sintaxe}</b><b>${b.sintaxe}</b></div>
        <div><span>Erros de lógica</span><b>${q.logica}</b><b>${b.logica}</b></div>
      </div>
      <nav class="menu wide"><button class="pri" id="b-next">PRÓXIMO PARTICIPANTE</button><button id="b-out">VER RELATÓRIO</button></nav>`);
    $('#b-next').onclick = intro; $('#b-out').onclick = () => G.report.open('title');
  }

  // ---------- Resumo agregado (sempre com o n) ----------
  function resumo() {
    const a = ler(), n = a.length, lado = k => {
      const xs = a.map(p => p[k]).filter(Boolean), c = xs.filter(x => x.concluiu);
      const med = c.length ? c.reduce((s, x) => s + x.segundos, 0) / c.length : null;
      return { med, concl: xs.length ? Math.round(c.length / xs.length * 100) : null,
        comSint: xs.length ? Math.round(xs.filter(x => x.sintaxe > 0).length / xs.length * 100) : null,
        primeira: xs.length ? Math.round(xs.filter(x => x.concluiu && x.tentativas === 1).length / xs.length * 100) : null };
    };
    return { n, q: lado('qwerty'), b: lado('blocos') };
  }
  function resumoHTML() {
    const r = resumo();
    if (!r.n) return '<p class="txt small">Nenhum participante ainda. Toque em "Fazer teste de digitação".</p>';
    const f = (v, s) => v === null ? '—' : String(typeof v === 'number' && s === ' s' ? v.toFixed(1).replace('.', ',') : v) + s;
    return `<div class="res-stats cmp"><div><span>n = <b>${r.n}</b> participante(s)</span><b>⌨ Digitação</b><b>▦ Blocos</b></div>
      <div><span>Tempo médio (quem concluiu)</span><b>${f(r.q.med, ' s')}</b><b>${f(r.b.med, ' s')}</b></div>
      <div><span>Teve erro de sintaxe</span><b>${f(r.q.comSint, '%')}</b><b>${f(r.b.comSint, '%')}</b></div>
      <div><span>Acertou na 1ª tentativa</span><b>${f(r.q.primeira, '%')}</b><b>${f(r.b.primeira, '%')}</b></div>
      <div><span>Concluiu a missão</span><b>${f(r.q.concl, '%')}</b><b>${f(r.b.concl, '%')}</b></div></div>
      ${r.n < 10 ? '<p class="txt small">Amostra pequena: use como resultado preliminar.</p>' : ''}`;
  }

  G.bench = {
    open() { intro(); G.show('bench'); }, resumo, resumoHTML,
    limpar() { gravar([]); },
    csv() {
      const a = ler(); if (!a.length) return G.toast('SEM DADOS', 'var(--ye)');
      const linhas = a.map(p => ({ quando: p.quando, participante: p.participante, ordem: p.ordem,
        qwerty_segundos: p.qwerty && p.qwerty.segundos, qwerty_tentativas: p.qwerty && p.qwerty.tentativas, qwerty_sintaxe: p.qwerty && p.qwerty.sintaxe, qwerty_logica: p.qwerty && p.qwerty.logica, qwerty_concluiu: p.qwerty && p.qwerty.concluiu,
        blocos_segundos: p.blocos && p.blocos.segundos, blocos_tentativas: p.blocos && p.blocos.tentativas, blocos_sintaxe: p.blocos && p.blocos.sintaxe, blocos_logica: p.blocos && p.blocos.logica, blocos_concluiu: p.blocos && p.blocos.concluiu }));
      G.metrics.baixar('algoritmia-teste-digitacao.csv', G.metrics.csv(linhas, Object.keys(linhas[0])));
    }
  };
  $('#btn-bench').onclick = () => G.bench.open();
  $('#bench-csv').onclick = () => G.bench.csv();
  $('#bench-quit').onclick = () => G.report.open('title');
})(Game);
