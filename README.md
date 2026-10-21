# Algoritmia — Cyber RPG Tático (v2)

Jogo web mobile-first para aprender **lógica de programação montando código com blocos**, sem digitar.
Equipe **TRACER TECH** — Kenzo Raul Pimenta Camacho e Rafael Filipe Vieira Reis — Senai Porto, Cuiabá/MT.
Festival High Tech MT 2026 · Robótica — Inovação Tecnológica.

HTML + CSS + JS puro: sem framework, sem build. Abre com duplo clique no `index.html` e, publicado em HTTPS, **funciona sem internet** (PWA).

## O que há de novo na v2

| Recurso | Onde | Por que importa |
|---|---|---|
| **Teclado guiado pela gramática**: só acendem os blocos que podem vir agora | `js/lang/algo.js` → `estado()` | Erro de sintaxe é **impossível de verdade** (o que o projeto escrito promete) |
| **Espaços tracejados** mostram o que falta (DADO, COMPARAR, AÇÃO) | `battle.js` → `render()` | O iniciante vê a estrutura do comando sem ler regra |
| **Interpretador de verdade**: o código é executado sobre as variáveis | `algo.js` → `executar()` / `validar()` | Qualquer resposta logicamente certa é aceita (ex.: lados da comparação trocados); "chute" é recusado |
| **Execução passo a passo** antes do golpe (`3 == 3 → VERDADEIRO`) | `battle.js` | Liga código → consequência |
| **Erro explicado** com o cenário que falhou; o código continua montado | `algo.js` → `explicar()` | Feedback pedagógico, sem punir apagando tudo |
| **WHILE vira COMBO**; **laço infinito** detectado e explicado | `algo.js` (limite de 12 repetições) | Mostra a repetição acontecendo |
| **Tradução ao vivo**: Português · Python · JavaScript | `algo.js` → `traduzir()` | Cumpre o 3º objetivo específico (linguagens de mercado) |
| **Dica em 3 níveis** (o 3º pisca o próximo bloco certo) | `battle.js` | Ninguém fica travado |
| **Tela de resultado** com estrelas e o código final em Python | `#screen-result` | Fechamento de cada fase |
| **Relatório** com Mapa de Habilidades (Condicional, Laços, Eficiência) e métricas **reais** + CSV | `js/metrics/logger.js`, `js/screens/report.js` | Evidência para a banca e para o professor |
| **Teste de Digitação** (teclado do celular × blocos), ordem alternada, com **n** | `js/screens/bench.js` | Gera dados reais para o Quadro 1 do projeto |
| **Modo Banca**: `?banca=1` ou 5 toques no logo | `js/main.js` | Escolher fase direto + "Reiniciar demo" entre jurados |
| **Modo Acolhimento** (sem cronômetro, metade do dano) e **Efeitos leves** | Opções | Inclusão e celulares simples |
| **Offline**: service worker + fontes locais | `sw.js`, `manifest.webmanifest`, `assets/fonts/` | O Wi-Fi do evento não derruba a demo |
| **Testes automatizados** da linguagem (28 testes) | `tests/` | Qualidade técnica comprovável |
| **Tela de acesso cyberpunk**: cidade neon animada, boot de terminal, codinome e 4 avatares (cor da jaqueta) | `css/login.css`, `js/ui/city.js`, `js/main.js` | Entrada imersiva, sem senha e offline |
| **Treinamento animado**: uma mão toca nos blocos de verdade com legenda passo a passo (inclui um erro corrigido), depois prática guiada com o bloco certo piscando | `js/screens/training.js`, `css/training.css` | Qualquer iniciante entende o jogo em ~1 minuto |

## Estrutura
```
index.html              todas as telas
manifest.webmanifest    PWA (instalar como app)
sw.js                   offline: lista de arquivos em cache (aumente VERSAO ao mudar algo)
css/                    fonts, base, menu, battle, dialogue, tutorial, report
js/core.js              estado, save, Game.show(), Game.toast()
js/lang/algo.js         >>> mini-linguagem: tokens, gramática, parser, interpretador, tradutor, validador (sem HTML)
js/metrics/logger.js    registro de eventos reais (localStorage) + CSV
js/data/levels.js       fases e desafios  <- EDITE AQUI
js/data/dialogues.js    falas do Mentor
js/screens/map.js       mapa top-down (toque para andar)
js/screens/battle.js    batalha
js/screens/report.js    relatório / mapa de habilidades
js/screens/bench.js     teste de digitação
js/engine/audio.js      sons 8-bit por código
js/engine/effects.js    tremor, flash, dano flutuante, cortes
js/tutorial.js          tutorial guiado
js/main.js              menu, opções, Modo Banca, PWA
tests/                  testes da linguagem (navegador e Node)
assets/                 sprites, tiles, fontes (OFL), ícones
tools/                  geradores da pixel art (Python + Pillow); make_avatars.py gera as cores de jaqueta
```

## Rodar e testar
- **Computador:** duplo clique no `index.html` (offline/PWA só funciona via http/https).
- **Celular na mesma rede:** `npx serve .` (ou `python3 -m http.server`) e abra `http://IP-DO-PC:3000`.
- **Link público (recomendado para a banca):** GitHub Pages ou Netlify Drop. Abra o link **uma vez com internet** em cada celular: depois funciona em modo avião. Use "⬇ INSTALAR APP" no menu.
- **Testes:** `node tests/lang.test.js` ou abra `tests/tests.html`.

## Como criar um desafio (5 passos)
1. Abra `js/data/levels.js` e copie um item de `challenges`.
2. Escreva a missão em `intent` (as palavras que são blocos ficam coloridas sozinhas).
3. Coloque UMA resposta certa em `solucao`.
4. Em `testes`, coloque o cenário da batalha (1º) e pelo menos um cenário em que a condição dá **falso** (impede chute).
5. Se usar `while`, diga em `efeitos` o que a ação muda (ex.: `{ analyze: { hp: -1 } }`), senão é laço infinito. Rode `node tests/lang.test.js`.

## Checklist da bancada (22/10)
- [ ] Link publicado e aberto 1× com internet em **2 celulares** + notebook de reserva (todos carregados, carregador e extensão).
- [ ] Testar em **modo avião** antes de sair.
- [ ] Ligar o **Modo Banca** (`?banca=1`) e tocar em **REINICIAR DEMO** antes de cada jurado.
- [ ] Rodar o **Teste de Digitação** com colegas em 21/10 e levar o **Relatório** com o *n* real (exportar CSV).
- [ ] Roteiro de 15 min: problema (2) · jurado joga (5) · como funciona por dentro (3) · impacto e próximos passos (2) · perguntas (3).

## Direitos de uso
Pixel art e sons originais, gerados por código (`tools/`, `js/engine/audio.js`). Fontes Rajdhani e JetBrains Mono sob SIL Open Font License (`assets/fonts/OFL-*.txt`).
