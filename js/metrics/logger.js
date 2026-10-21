// Registro de métricas REAIS (nada é estimado). Fica só neste aparelho (localStorage).
// Cada evento: { t: horário, s: sessão, j: nome do jogador, tipo, ...dados }.
// Tipos: luta_inicio, desafio_inicio, execucao, dica, tempo_esgotado, luta_fim.
(function (G) {
  const KEY = 'algoritmia_log', MAX = 5000;
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const ler = k => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } };
  const gravar = (k, a) => { try { localStorage.setItem(k, JSON.stringify(a)); } catch (e) {} };
  let cache = null; // evita reler o localStorage a cada toque

  G.metrics = {
    sessao: novoId(),                         // uma sessão por abertura do jogo (ou por "Reiniciar demo")
    novaSessao() { this.sessao = novoId(); },
    log(tipo, dados) {
      const a = cache || (cache = ler(KEY));
      a.push(Object.assign({ t: Date.now(), s: this.sessao, j: G.state.name || '', tipo }, dados));
      if (a.length > MAX) a.splice(0, a.length - MAX);
      gravar(KEY, a);
    },
    eventos(escopo) { const a = cache || (cache = ler(KEY)); return escopo === 'sessao' ? a.filter(e => e.s === this.sessao) : a.slice(); },
    limpar() { cache = []; gravar(KEY, []); },
    ler, gravar,
    // CSV com separador ";" (abre direto no Excel em português)
    csv(linhas, colunas) {
      const q = v => { const s = v === undefined || v === null ? '' : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
      return '﻿' + [colunas.join(';')].concat(linhas.map(l => colunas.map(c => q(l[c])).join(';'))).join('\n');
    },
    // Baixa o arquivo e também copia o texto (cole direto no Excel/Planilhas). Onde o download for bloqueado, a cópia resolve.
    baixar(nome, texto) {
      try { navigator.clipboard.writeText(texto.replace(/^\ufeff/, '')).then(() => G.toast('CSV BAIXADO E COPIADO', 'var(--gr)'), () => {}); } catch (e) {}
      try {
        const url = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' }));
        const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click();
        setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
      } catch (e) { G.toast('NÃO FOI POSSÍVEL BAIXAR', 'var(--rd)'); }
    }
  };
})(Game);
