/* =============================================================
   audio.js — Sons sintetizados via Web Audio API
   Casa dos Mistérios Lógicos
   ============================================================= */

const audio = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function isSomAtivado() {
    try { return gameState.getSettings().somAtivado; } catch { return true; }
  }

  function beep(freq, dur, type = 'sine', vol = 0.28) {
    if (!isSomAtivado()) return;
    try {
      const c   = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + dur);
    } catch {}
  }

  function sequencia(notas, intervalo = 100) {
    notas.forEach(([freq, dur, type, vol], i) => {
      setTimeout(() => beep(freq, dur, type, vol), i * intervalo);
    });
  }

  return {
    clique()      { beep(440, 0.06, 'sine', 0.15); },
    acerto()      { sequencia([[523,0.1],[659,0.1],[784,0.22]], 100); },
    erro()        { beep(180, 0.35, 'sawtooth', 0.18); },
    desbloqueio() { sequencia([[523,0.12],[659,0.12],[784,0.12],[1047,0.2]], 110); },
    conclusao()   { sequencia([[523,0.15],[659,0.15],[784,0.15],[1047,0.15],[1319,0.3]], 120); },
    passo()       { beep(330, 0.05, 'sine', 0.1); }
  };
})();
