/* ==========================================================================
   FUNÇÕES DE IMPACTO VISUAL (JUICE FX)
   Usadas por js/screens/battle.js (acerto, erro e combo). Separadas aqui para o battle.js ficar só com a regra do jogo.
   ========================================================================== */

// Tremor na moldura do aparelho (.device) e flash na tela CRT (.crt)
function triggerImpact() {
    const chassis = document.querySelector('#screen-battle .device');
    const arena = document.querySelector('#screen-battle .crt');
    if (!chassis) return;

    // Reinicia a animação (remove, força reflow, adiciona de novo)
    chassis.classList.remove('shake');
    void chassis.offsetWidth;
    chassis.classList.add('shake');

    if (arena) {
        arena.classList.remove('glitch-flash');
        void arena.offsetWidth;
        arena.classList.add('glitch-flash');
    }

    setTimeout(() => {
        chassis.classList.remove('shake');
        if (arena) arena.classList.remove('glitch-flash');
    }, 350);
}

// Texto de dano flutuante sobre o alvo. styleType: 'boss-hit' | 'player-hit' | 'crit' | 'error'
function spawnDamageText(targetSelector, text, styleType = 'boss-hit') {
    const targetEl = document.querySelector(targetSelector);
    const arena = document.querySelector('#screen-battle .crt');
    if (!targetEl || !arena) return;

    const t = targetEl.getBoundingClientRect(), a = arena.getBoundingClientRect();
    const floatEl = document.createElement('div');
    floatEl.className = 'damage-float ' + styleType;
    floatEl.textContent = text;
    // centro do sprite, um pouco abaixo do topo (dentro da tela CRT, que corta o que passar da borda)
    floatEl.style.top = (t.top + t.height * 0.2 - a.top) + 'px';
    arena.appendChild(floatEl);
    // mantém o texto inteiro dentro da tela (a animação cresce até 1.3x, por isso a folga)
    const half = floatEl.offsetWidth * 0.65 + 4, cx = t.left + t.width / 2 - a.left;
    floatEl.style.left = Math.max(half, Math.min(a.width - half, cx)) + 'px';
    setTimeout(() => floatEl.remove(), 800);
}

// Corte estilo Undertale: toca a folha de 8 quadros (CSS .slash) sobre o alvo.
// kind: 'hero' (ciano) | 'boss' (vermelho). opções: dx/dy (deslocamento), rot (graus), flip (espelha), scale.
function spawnSlash(targetSelector, kind, o = {}) {
    const targetEl = document.querySelector(targetSelector);
    const arena = document.querySelector('#screen-battle .crt');
    if (!targetEl || !arena) return;
    const t = targetEl.getBoundingClientRect(), a = arena.getBoundingClientRect();
    const size = Math.max(t.width, t.height) * (o.scale || 1);
    const el = document.createElement('div');
    el.className = 'slash ' + kind;
    el.style.width = el.style.height = size + 'px';
    el.style.left = (t.left + t.width / 2 - a.left + (o.dx || 0)) + 'px';
    el.style.top = (t.top + t.height / 2 - a.top + (o.dy || 0)) + 'px';
    el.style.setProperty('--rot', (o.rot || 0) + 'deg');
    el.style.setProperty('--flip', o.flip ? -1 : 1);
    arena.appendChild(el);
    setTimeout(() => el.remove(), 520);
}
