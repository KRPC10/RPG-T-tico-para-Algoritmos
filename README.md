# Algoritmia — Cyber RPG Tático (protótipo web)

Jogo web mobile-first: tela inicial → mapa top-down (toque para andar) → batalha com teclado de tokens.
Sem framework e sem build: HTML + CSS + JS puro, abre direto no navegador.

## Estrutura
```
index.html            telas (título, opções, nome, créditos, mapa, batalha)
css/base.css          variáveis, reset, troca de telas, toast
css/menu.css          título, menus, HUD e mapa
css/battle.css        tela de batalha (moldura, CRT, terminal, teclado)
js/core.js            estado, save (localStorage), nome do jogador (cleanName), Game.show(), Game.toast()
js/sprites.js         carrega os PNGs de assets/ (se faltar um, o mapa usa a arte provisória)
js/data/levels.js     fases: mapa, teclado, chefe e desafios  <- EDITE AQUI para criar fases
js/screens/map.js     mapa em canvas, toque → caminho (BFS), colisão
js/screens/battle.js  tokens, validação, dano, fim de fase
js/main.js            botões do menu, opções e tela de nome
assets/               sprites/ tiles/ ui/ audio/  (arte e som)
tools/make_sprites.py gera todos os PNGs de assets/ (arte em pixel art feita por código)
```

## O que precisamos (checklist)
- [x] Arte da batalha: `player.png` (96×128), `boss1.png` e `boss2.png` (128×128), fundo transparente
- [x] Arte do mapa: `hero-map.png` (16×16, 4 direções × 4 quadros), `boss1-map.png`/`boss2-map.png` (2 quadros) e `tiles/tileset.png` (chão ×3, parede, terminal)
- [ ] Logo e fundo da tela inicial (`assets/ui/`)
- [ ] Sons: música do menu/batalha, clique de tecla, acerto, erro (`assets/audio/`)
- [ ] Hospedagem com HTTPS (GitHub Pages, Netlify ou Vercel) — o link vai na ficha do evento
- [ ] Testar em 2 celulares + 1 tablet (Chrome Android e Safari iOS)

Direitos de uso: o edital (item 26) deixa o participante responsável pelos direitos do conteúdo.
Use arte própria ou com licença que permita uso (Kenney.nl, OpenGameArt, itch.io — leia a licença de cada pacote).
Para desenhar: Piskel, LibreSprite ou Aseprite.

## Rodar e testar
- Computador: dê dois cliques no `index.html`.
- Celular na mesma rede Wi-Fi: `npx serve .` e abra `http://IP-DO-PC:3000`.
- Link público: arraste a pasta no Netlify Drop ou publique no GitHub Pages.

## Roadmap
**Pronto neste protótipo**
- [x] Tela inicial (Jogar / Opções / Créditos), progresso salvo
- [x] Mapa com toque para andar, colisão e inimigo que inicia a batalha
- [x] Batalha no layout da referência (só número da fase, sem hora/bateria)
- [x] 2 fases com 2 desafios cada, dano, derrota e vitória

**Próximos passos (nesta ordem)**
1. [x] Carregar sprites reais (batalha e mapa) com fallback para a arte provisória
2. [ ] Mapas maiores com câmera que segue o jogador
3. [ ] NPC com diálogo curto que explica o conceito da fase (if, while)
4. [ ] Mais fases e desafios (laços, variáveis, operadores)
5. [ ] Sons e música
6. [ ] Modo offline (PWA: manifest + service worker), porque o Wi-Fi de evento costuma falhar
7. [ ] Tela de vitória/fim e tela de tutorial

## Ficha do evento (Vitrine Games MT, Anexo II)
Nome do game: Algoritmia · Gênero: RPG tático educacional · Plataforma: Web (celular/tablet) ·
Estágio: protótipo jogável · Vínculo com MT: Senai Porto, Cuiabá · Link/demo: URL da hospedagem.

## Nome do jogador
Na 1ª vez que toca em JOGAR, o jogo pede o nome (máx. 18 caracteres, definido em `Game.NAME_MAX` no `core.js` e no `maxlength` do `index.html`).
Fica salvo no aparelho e aparece na barra de vida da batalha. Para trocar: OPÇÕES → NOME. "Zerar progresso" não apaga o nome.
O texto é limpo em `Game.cleanName` (tira caracteres invisíveis, junta espaços repetidos, corta em 18).

## Sprites
Todos os PNGs são pixel art original, gerados por `tools/make_sprites.py` (precisa de `pip install pillow`):
```
python3 tools/make_sprites.py
```
Para editar o desenho, mexa em `tools/art_player.py` (herói da batalha), `tools/art_bosses.py` (chefes e ícones do mapa) ou
`tools/art_map.py` (herói do mapa e tiles) e rode o comando de novo. Para usar arte de outra pessoa, é só substituir os PNGs em `assets/`
mantendo o tamanho e a ordem dos quadros (descritos em `js/sprites.js`).
Chefe novo: desenhe `bossN.png` e `bossN-map.png`, inclua em `js/sprites.js` e coloque `sprite: 'bossN'` na fase em `levels.js`.

## Tutorial
`js/tutorial.js` mostra balões guiados na 1ª vez de cada tela (título, mapa, batalha). Para trocar textos, edite o objeto `T`. O botão "COMO JOGAR" (título) e "? AJUDA" (mapa/batalha) repetem o tutorial.
