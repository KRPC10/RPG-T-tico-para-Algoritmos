// Service worker: guarda todos os arquivos do jogo no aparelho para funcionar SEM INTERNET (modo avião).
// Ao mudar qualquer arquivo do jogo, aumente a VERSAO para os celulares baixarem a versão nova.
// Se criar arquivo novo, inclua na lista ARQUIVOS.
const VERSAO = 'algoritmia-v2.3.1';
const ARQUIVOS = [
    './',
    './assets/fonts/jetbrains-mono-latin-400-normal.woff2',
    './assets/fonts/jetbrains-mono-latin-600-normal.woff2',
    './assets/fonts/jetbrains-mono-latin-700-normal.woff2',
    './assets/fonts/rajdhani-latin-600-normal.woff2',
    './assets/fonts/rajdhani-latin-700-normal.woff2',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png',
    './assets/sprites/boss1-map.png',
    './assets/sprites/boss1.png',
    './assets/sprites/boss2-map.png',
    './assets/sprites/boss2.png',
    './assets/sprites/boss3-map.png',
    './assets/sprites/boss3.png',
    './assets/sprites/hero-map-1.png',
    './assets/sprites/hero-map-2.png',
    './assets/sprites/hero-map-3.png',
    './assets/sprites/hero-map.png',
    './assets/sprites/player-1.png',
    './assets/sprites/player-2.png',
    './assets/sprites/player-3.png',
    './assets/sprites/player.png',
    './assets/sprites/slash-boss.png',
    './assets/sprites/slash-hero.png',
    './assets/tiles/tileset.png',
    './css/base.css',
    './css/battle.css',
    './css/dialogue.css',
    './css/fonts.css',
    './css/login.css',
    './css/menu.css',
    './css/report.css',
    './css/training.css',
    './css/tutorial.css',
    './index.html',
    './js/components/dialogue.js',
    './js/core.js',
    './js/data/dialogues.js',
    './js/data/levels.js',
    './js/engine/audio.js',
    './js/engine/effects.js',
    './js/lang/algo.js',
    './js/main.js',
    './js/metrics/logger.js',
    './js/screens/battle.js',
    './js/screens/bench.js',
    './js/screens/map.js',
    './js/screens/report.js',
    './js/screens/training.js',
    './js/sprites.js',
    './js/tutorial.js',
    './js/ui/charts.js',
    './js/ui/city.js',
    './manifest.webmanifest',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primeiro o cache (rápido e offline); se não tiver, busca na rede e guarda.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
    if (res.ok && new URL(e.request.url).origin === location.origin) { const cp = res.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
