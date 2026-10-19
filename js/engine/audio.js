/* ==========================================================================
   ENGINE DE ÁUDIO 8-BITS (SINTETIZADOR WEB AUDIO API)
   ========================================================================== */

const AudioEngine = {
    ctx: null,
    // Segue o botão OPÇÕES > SOM (Game.state.sound)
    get enabled() { return !(window.Game && Game.state && Game.state.sound === false); },

    // Inicializa o contexto de áudio (chamado após a primeira interação do usuário)
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    // 1. Som ao clicar nos Tokens (Blip curto)
    playClick() {
        if (!this.enabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(750, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(350, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    },

    // 2. Som de Impacto/Ataque no Chefe (Golpe Ciberpunk)
    playHit() {
        if (!this.enabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.22);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    },

    // 3. Som de Erro de Sintaxe (Buzz Falso)
    playError() {
        if (!this.enabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.setValueAtTime(90, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    },

    // 4. Som de Compilação/Sucesso (Arpejo Ascendente Chiptune)
    playSuccess() {
        if (!this.enabled) return;
        this.init();

        // Notas em Hz: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.50];

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.05);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + i * 0.05);
            osc.stop(this.ctx.currentTime + i * 0.05 + 0.08);
        });
    },

    // 5. Corte (whoosh de ruído que desce de agudo para grave) — ataques do jogador e do chefe
    playSlash() {
        if (!this.enabled) return;
        this.init();
        const ctx = this.ctx, t = ctx.currentTime, dur = 0.2;
        const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);

        const src = ctx.createBufferSource();
        src.buffer = buf;
        const filt = ctx.createBiquadFilter();
        filt.type = 'bandpass';
        filt.Q.value = 1.2;
        filt.frequency.setValueAtTime(5200, t);
        filt.frequency.exponentialRampToValueAtTime(900, t + dur);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        src.connect(filt);
        filt.connect(gain);
        gain.connect(ctx.destination);
        src.start(t);
    },

    // 6. Tique do relógio (últimos segundos do chefão)
    playTick() {
        if (!this.enabled) return;
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        osc.type = 'square';
        osc.frequency.setValueAtTime(1100, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    },

    // 7. Alarme de chefão (duas notas graves descendo)
    playAlarm() {
        if (!this.enabled) return;
        this.init();
        [220, 165].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = this.ctx.currentTime + i * 0.16;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.22);
        });
    }
};

// Navegadores só liberam o áudio depois de um toque/tecla do usuário:
// destrava no primeiro toque em qualquer lugar (ex.: botão JOGAR), assim os sons já funcionam na batalha.
['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, () => { try { AudioEngine.init(); } catch (e) {} }, { once: true, capture: true }));
