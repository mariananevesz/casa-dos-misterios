/* =============================================================
   audio.js — Sons sintetizados via Web Audio API
   Casa dos Mistérios Lógicos

   O jogo não tem narração nem voz: só efeitos sonoros e música de
   fundo. A música tem um botão visível para pausar/ligar em todas as
   páginas (criarBotaoMusica).
   ============================================================= */

const audio = (() => {
  let ctx = null;
  let musicaTocando = false;
  let musicaTimer = null;
  let usuarioInteragiu = false;
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

  /* ---- Botão visível de pausar/ligar a música ---- */
  let botaoMusica = null;

  function atualizarBotaoMusica() {
    if (!botaoMusica) return;
    const ligada = isMusicaAtivada() !== false;
    botaoMusica.querySelector('span').textContent = ligada ? '🔊' : '🔇';
    botaoMusica.setAttribute('aria-label', ligada ? 'Pausar a música' : 'Ligar a música');
    botaoMusica.title = ligada ? 'Pausar a música' : 'Ligar a música';
  }

  function alternarMusica() {
    const nova = isMusicaAtivada() === false;
    try { gameState.updateSettings({ musicaAtivada: nova }); } catch {}
    sincronizarConfiguracoes();
  }

  /* No HUD das fases fica antes do "?"; no início, ao lado da engrenagem; no mapa, no topo */
  function criarBotaoMusica() {
    if (botaoMusica || document.getElementById('btn-musica')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btn-musica';
    btn.innerHTML = '<span aria-hidden="true"></span>';
    botaoMusica = btn;

    const ajuda = document.getElementById('btn-ajuda');
    const config = document.getElementById('btn-config');
    const topoMapa = document.querySelector('.mapa-topo');
    if (ajuda) {
      btn.className = 'btn-ajuda btn-musica';
      ajuda.insertAdjacentElement('beforebegin', btn);
    } else if (config) {
      btn.className = 'btn-musica btn-musica--canto';
      config.insertAdjacentElement('beforebegin', btn);
    } else if (topoMapa) {
      btn.className = 'btn-musica';
      topoMapa.appendChild(btn);
    } else {
      btn.className = 'btn-musica btn-musica--flutuante';
      document.body.appendChild(btn);
    }
    btn.addEventListener('click', alternarMusica);
    atualizarBotaoMusica();
  }

  function sincronizarConfiguracoes() {
    if (isMusicaAtivada()) iniciarMusica();
    else pararMusica();
    atualizarBotaoMusica();
  }

  function registrarInteracao() {
    if (usuarioInteragiu) return;
    usuarioInteragiu = true;
    document.removeEventListener('pointerdown', registrarInteracao, true);
    document.removeEventListener('keydown', registrarInteracao, true);
    sincronizarConfiguracoes();
  }

  document.addEventListener('pointerdown', registrarInteracao, true);
  document.addEventListener('keydown', registrarInteracao, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pararMusica();
    else sincronizarConfiguracoes();
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', criarBotaoMusica);
  else criarBotaoMusica();

  return {
    clique()      { beep(440, 0.06, 'sine', 0.15); },
    acerto()      { sequencia([[523,0.1],[659,0.1],[784,0.22]], 100); },
    erro()        { beep(180, 0.35, 'sawtooth', 0.18); },
    desbloqueio() { sequencia([[523,0.12],[659,0.12],[784,0.12],[1047,0.2]], 110); },
    conclusao()   { sequencia([[523,0.15],[659,0.15],[784,0.15],[1047,0.15],[1319,0.3]], 120); },
    passo()       { beep(330, 0.05, 'sine', 0.1); },
    sincronizarConfiguracoes,
    iniciarMusica,
    pararMusica
  };
})();
