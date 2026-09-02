/* =============================================================
   audio.js — Sons sintetizados via Web Audio API
   Casa dos Mistérios Lógicos
   ============================================================= */

const audio = (() => {
  let ctx = null;
  let musicaTocando = false;
  let musicaTimer = null;
  let usuarioInteragiu = false;
  let instrucaoAtual = '';
  let narracaoPendente = false;
  const osciladoresMusica = new Set();
  const NOTAS_MUSICA = [261.63, 329.63, 392.00, 329.63, 293.66, 349.23, 440.00, 349.23];

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function isSomAtivado() {
    try { return gameState.getSettings().somAtivado; } catch { return true; }
  }

  function isMusicaAtivada() {
    try { return gameState.getSettings().musicaAtivada; } catch { return true; }
  }

  function isNarracaoAtivada() {
    try { return gameState.getSettings().narracaoAtivada; } catch { return true; }
  }

  function limparTextoNarracao(texto) {
    return String(texto || '').replace(/\s+/g, ' ').trim();
  }

  function pararNarracao() {
    narracaoPendente = false;
    try { window.speechSynthesis?.cancel(); } catch {}
  }

  function falar(texto) {
    const fala = limparTextoNarracao(texto);
    if (!fala || !isNarracaoAtivada()) return false;
    if (!usuarioInteragiu) {
      narracaoPendente = true;
      return false;
    }
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return false;

    pararNarracao();
    const utterance = new SpeechSynthesisUtterance(fala);
    utterance.lang = 'pt-BR';
    const vozPtBr = window.speechSynthesis.getVoices().find(voz =>
      String(voz.lang).toLowerCase().replace('_', '-').startsWith('pt-br')
    );
    if (vozPtBr) utterance.voice = vozPtBr;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function definirNarracao(texto, reproduzirAutomaticamente = true) {
    instrucaoAtual = limparTextoNarracao(texto);
    narracaoPendente = false;
    if (reproduzirAutomaticamente) falar(instrucaoAtual);
  }

  function repetirNarracao() {
    return falar(instrucaoAtual);
  }

  function obterNarracaoAtual() {
    return instrucaoAtual;
  }

  function sincronizarNarracao() {
    if (isNarracaoAtivada()) repetirNarracao();
    else pararNarracao();
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

  function tocarNotaMusica(freq) {
    if (!musicaTocando || !isMusicaAtivada()) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(0.025, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.38);
      osciladoresMusica.add(osc);
      osc.addEventListener('ended', () => osciladoresMusica.delete(osc), { once: true });
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 0.4);
    } catch {}
  }

  function iniciarMusica() {
    if (musicaTocando || !usuarioInteragiu || !isMusicaAtivada() || document.hidden) return;
    musicaTocando = true;
    let indice = 0;

    const tocarProxima = () => {
      if (!musicaTocando || !isMusicaAtivada()) return;
      tocarNotaMusica(NOTAS_MUSICA[indice]);
      indice = (indice + 1) % NOTAS_MUSICA.length;
      musicaTimer = window.setTimeout(tocarProxima, 520);
    };

    tocarProxima();
  }

  function pararMusica() {
    musicaTocando = false;
    if (musicaTimer !== null) {
      window.clearTimeout(musicaTimer);
      musicaTimer = null;
    }
    osciladoresMusica.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    osciladoresMusica.clear();
  }

  function sincronizarConfiguracoes() {
    if (isMusicaAtivada()) iniciarMusica();
    else pararMusica();
  }

  function registrarInteracao() {
    if (usuarioInteragiu) return;
    usuarioInteragiu = true;
    document.removeEventListener('pointerdown', registrarInteracao, true);
    document.removeEventListener('keydown', registrarInteracao, true);
    sincronizarConfiguracoes();
    if (narracaoPendente) repetirNarracao();
  }

  document.addEventListener('pointerdown', registrarInteracao, true);
  document.addEventListener('keydown', registrarInteracao, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pararMusica();
      pararNarracao();
    }
    else sincronizarConfiguracoes();
  });

  return {
    clique()      { beep(440, 0.06, 'sine', 0.15); },
    acerto()      { sequencia([[523,0.1],[659,0.1],[784,0.22]], 100); },
    erro()        { beep(180, 0.35, 'sawtooth', 0.18); },
    desbloqueio() { sequencia([[523,0.12],[659,0.12],[784,0.12],[1047,0.2]], 110); },
    conclusao()   { sequencia([[523,0.15],[659,0.15],[784,0.15],[1047,0.15],[1319,0.3]], 120); },
    passo()       { beep(330, 0.05, 'sine', 0.1); },
    definirNarracao,
    narrar(texto) { return falar(texto); },
    repetirNarracao,
    obterNarracaoAtual,
    pararNarracao,
    sincronizarNarracao,
    sincronizarConfiguracoes,
    iniciarMusica,
    pararMusica
  };
})();
