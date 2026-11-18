/* =============================================================
   audio.js — Sons sintetizados via Web Audio API
   Casa dos Mistérios Lógicos

   O jogo não tem narração nem voz: só efeitos sonoros e música de
   fundo. A música tem um botão visível para pausar/ligar em todas as
   páginas (criarBotaoMusica).

   Música de fundo (assets/audio/):
   - musica_sistema.mp3 toca em todas as telas fora dos mini-jogos
     (início, mapa, pontuação) sem recomeçar ao trocar de tela: a nova tela
     segue do ponto exato em que a anterior estava, com uma entrada curtinha;
   - cada mini-jogo (Sala, Quarto, Cozinha, Despensa) tem a sua faixa.
   Para não começar "estourada" nem ficar baixa demais:
   - a música sempre entra com fade-in e sai com fade-out (nada de pulo);
   - o volume de cada faixa é equalizado pela sua intensidade média medida;
   - o controle de volume (1 a 10) vai de um piso audível a um teto
     confortável — nunca chega ao volume máximo do arquivo.
   ============================================================= */

const audio = (() => {
  let ctx = null;

  /* ---- Faixas ---- */
  const PASTA_AUDIO = (() => {
    try { return new URL('../audio/', document.currentScript.src).href; }
    catch { return /\/pages\//.test(location.pathname) ? '../audio/' : 'assets/audio/'; }
  })();

  const FAIXA_SISTEMA = 'musica_sistema';
  const FAIXAS_MINIJOGO = { 'sala.html': 'sala', 'quarto.html': 'quarto', 'cozinha.html': 'cozinha', 'despensa.html': 'despensa' };

  /* Intensidade média (dB RMS) de cada arquivo, medida ao decodificar as faixas.
     Todas foram masterizadas "quentes" (picos em 0 dB); o ganho abaixo iguala
     cada uma à referência, para nenhuma soar mais alta que as outras.
     Se trocar um arquivo, meça de novo e atualize o valor. */
  const INTENSIDADE_DB = { musica_sistema: -14.2, sala: -14.2, quarto: -14.2, cozinha: -14.2, despensa: -14.1 };
  const REFERENCIA_DB = -14.2;
  /* Reforço por faixa, em dB, aplicado depois da equalização */
  const REALCE_DB = { musica_sistema: 2.5 };

  /* Volume da preferência (0–10) → ganho, em dB. 0 = mudo; 1 = piso ainda
     audível; 5 (padrão) = fundo confortável abaixo dos efeitos; 10 = teto. */
  const CURVA_VOLUME_DB = [null, -27, -24, -21, -18.5, -16, -14, -12, -10, -8, -6];

  const FADE_ENTRADA_MS   = 3000;
  const FADE_CONTINUAR_MS = 250;   /* música do sistema seguindo de uma tela para outra */
  const FADE_SAIDA_MS     = 600;
  const FADE_AJUSTE_MS    = 400;
  const CHAVE_POSICAO     = 'casaMisterios_posMusica';
  /* Até quanto tempo depois de sair de uma tela a próxima "continua" a
     música no mesmo ponto (troca direta de tela). Mais que isso — ex.: voltou
     de um mini-jogo — ela retoma de onde parou, com o fade-in normal. */
  const JANELA_CONTINUAR_MS = 8000;
  /* Só uma página do jogo toca música por vez: com duas abas/janelas abertas
     (ex.: Sala numa, Quarto na outra), a que começa a tocar avisa as outras
     por aqui (evento "storage") e elas se calam. */
  const CHAVE_DONA = 'casaMisterios_musicaDona';
  const idPagina = Date.now().toString(36) + Math.random().toString(36).slice(2);

  function faixaDaPagina() {
    const arquivo = (location.pathname.split('/').pop() || '').toLowerCase();
    return FAIXAS_MINIJOGO[arquivo] || FAIXA_SISTEMA;
  }

  const faixa = faixaDaPagina();
  let elMusica = null;
  let musicaTocando = false;   /* quer tocar (ou está tocando) */
  let fadeTimer = null;
  let volumeAtual = 0;         /* volume aplicado ao <audio> agora (0–1) */
  let aguardandoGesto = false; /* o navegador bloqueou o play automático */
  let continuando = false;     /* esta tela está seguindo a música da tela anterior */
  let salvarTimer = null;

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

  /* Volumes das preferências: 7 (efeitos) e 5 (música) = volume original */
  function fator(chave, padrao) {
    try {
      const v = gameState.getSettings()[chave];
      return Math.max(0, Math.min(10, v === undefined || v === null ? padrao : Number(v))) / padrao;
    } catch { return 1; }
  }

  function beep(freq, dur, type = 'sine', vol = 0.28) {
    if (!isSomAtivado()) return;
    vol = Math.min(0.6, vol * fator('volumeSom', 7));
    if (vol <= 0.0005) return;
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

  /* ---- Música de fundo (arquivos MP3) ---- */

  /* Volume final (0–1) para a faixa desta página, já equalizado e limitado */
  function volumeAlvo() {
    if (!isMusicaAtivada()) return 0;
    let nivel = 5;
    try {
      const v = Number(gameState.getSettings().volumeMusica);
      if (Number.isFinite(v)) nivel = Math.round(Math.max(0, Math.min(10, v)));
    } catch {}
    const db = CURVA_VOLUME_DB[nivel];
    if (db === null || db === undefined) return 0;
    const ajusteFaixa = REFERENCIA_DB - (INTENSIDADE_DB[faixa] ?? REFERENCIA_DB) + (REALCE_DB[faixa] || 0);
    return Math.min(1, Math.pow(10, (db + ajusteFaixa) / 20));
  }

  function getElMusica() {
    if (elMusica) return elMusica;
    elMusica = new Audio(PASTA_AUDIO + faixa + '.mp3');
    elMusica.loop = true;
    elMusica.preload = 'auto';
    elMusica.volume = 0;
    volumeAtual = 0;
    /* A música do sistema não recomeça ao trocar de tela: segue do ponto
       em que estaria se nunca tivesse parado (ou de onde parou, se faz tempo). */
    if (faixa === FAIXA_SISTEMA) {
      try {
        const salvo = JSON.parse(sessionStorage.getItem(CHAVE_POSICAO) || 'null');
        if (salvo && salvo.faixa === faixa && salvo.t > 0) {
          const passou = Date.now() - (salvo.at || 0);
          let t = salvo.t;
          if (salvo.tocando && passou >= 0 && passou < JANELA_CONTINUAR_MS) {
            continuando = true;
            t += passou / 1000;
          }
          if (salvo.dur > 0) t %= salvo.dur;
          elMusica.currentTime = t;
        }
      } catch {}
    }
    return elMusica;
  }

  function salvarPosicao(tocando) {
    if (faixa !== FAIXA_SISTEMA || !elMusica) return;
    try {
      sessionStorage.setItem(CHAVE_POSICAO, JSON.stringify({
        faixa,
        t: elMusica.currentTime || 0,
        dur: Number.isFinite(elMusica.duration) ? elMusica.duration : 0,
        at: Date.now(),
        tocando: tocando === undefined ? !elMusica.paused : !!tocando
      }));
    } catch {}
  }

  /* Enquanto a música do sistema toca, a posição fica sempre atualizada,
     para a próxima tela pegar exatamente daqui. */
  function vigiarPosicao(ligar) {
    if (faixa !== FAIXA_SISTEMA) return;
    if (salvarTimer !== null) { window.clearInterval(salvarTimer); salvarTimer = null; }
    if (ligar) salvarTimer = window.setInterval(() => salvarPosicao(), 250);
  }

  function aplicarVolume(v) {
    volumeAtual = Math.max(0, Math.min(1, v));
    if (elMusica) elMusica.volume = volumeAtual;
  }

  /* Leva o volume até `destino` aos poucos. Subindo, começa bem devagar
     (curva quadrática) para a música "entrar" sem susto. */
  function fadePara(destino, duracao, aoTerminar) {
    if (fadeTimer !== null) { window.clearInterval(fadeTimer); fadeTimer = null; }
    const origem = volumeAtual;
    const subindo = destino > origem;
    const inicio = performance.now();
    if (duracao <= 0 || Math.abs(destino - origem) < 0.001) {
      aplicarVolume(destino);
      if (aoTerminar) aoTerminar();
      return;
    }
    fadeTimer = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - inicio) / duracao);
      const e = subindo ? t * t : 1 - (1 - t) * (1 - t);
      aplicarVolume(origem + (destino - origem) * e);
      if (t >= 1) {
        window.clearInterval(fadeTimer);
        fadeTimer = null;
        if (aoTerminar) aoTerminar();
      }
    }, 30);
  }

  function iniciarMusica() {
    const alvo = volumeAlvo();
    if (alvo <= 0 || document.hidden) return;
    const el = getElMusica();
    if (musicaTocando && !el.paused) {
      /* Já tocando: só ajusta o volume (ex.: mexeu no controle), sem pulo */
      fadePara(alvo, FADE_AJUSTE_MS);
      return;
    }
    musicaTocando = true;
    aplicarVolume(el.paused ? 0 : volumeAtual);
    let promessa;
    try { promessa = el.play(); } catch { promessa = null; }
    const comecou = () => {
      aguardandoGesto = false;
      if (!musicaTocando) { try { el.pause(); } catch {} return; }   /* desligaram enquanto carregava */
      assumirMusica();
      fadePara(volumeAlvo(), continuando ? FADE_CONTINUAR_MS : FADE_ENTRADA_MS);
      continuando = false;   /* se pausar e voltar nesta tela, entra com fade-in normal */
      vigiarPosicao(true);
    };
    if (promessa && typeof promessa.then === 'function') {
      promessa.then(comecou).catch(() => {
        /* Bloqueado pelo navegador até a criança tocar/clicar na tela */
        musicaTocando = false;
        aguardandoGesto = true;
        aplicarVolume(0);
      });
    } else {
      comecou();
    }
  }

  /* Esta página passa a ser a única tocando: as outras abas do jogo param */
  function assumirMusica() {
    try { localStorage.setItem(CHAVE_DONA, JSON.stringify({ id: idPagina, at: Date.now() })); } catch {}
  }

  window.addEventListener('storage', e => {
    if (e.key !== CHAVE_DONA || !e.newValue) return;
    let dona = null;
    try { dona = JSON.parse(e.newValue); } catch { return; }
    if (!dona || dona.id === idPagina) return;
    if (musicaTocando || (elMusica && !elMusica.paused)) pararMusica(document.hidden);
  });

  function pararMusica(imediato = false) {
    musicaTocando = false;
    if (!elMusica) return;
    const el = elMusica;
    vigiarPosicao(false);
    const pausar = () => {
      if (musicaTocando) return;   /* voltou a tocar durante o fade-out */
      try { el.pause(); } catch {}
      salvarPosicao(false);
    };
    if (imediato || el.paused) { fadePara(0, 0); pausar(); }
    else fadePara(0, FADE_SAIDA_MS, pausar);
  }

  /* ---- Botão visível de pausar/ligar a música ---- */
  let botaoMusica = null;

  function atualizarBotaoMusica() {
    if (!botaoMusica) return;
    const ligada = isMusicaAtivada() !== false;
    /* Ícone em SVG (icones.js), com aria-hidden: o nome do botão é o aria-label abaixo */
    botaoMusica.querySelector('span').innerHTML = window.Icones ? Icones.svg(ligada ? 'som' : 'som-off') : '';
    botaoMusica.setAttribute('aria-label', ligada ? 'Pausar a música' : 'Ligar a música');
    botaoMusica.setAttribute('aria-pressed', ligada ? 'false' : 'true');
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
    const preferencias = document.getElementById('btn-preferencias');   /* botão de preferências do HUD (mapa e cômodos) */
    if (ajuda) {
      btn.className = 'btn-ajuda btn-musica';
      (preferencias || ajuda).insertAdjacentElement('beforebegin', btn);
    } else if (config) {
      btn.className = 'btn-musica btn-musica--canto';
      config.insertAdjacentElement('beforebegin', btn);
    } else if (topoMapa) {
      btn.className = 'btn-musica';
      if (preferencias) preferencias.insertAdjacentElement('beforebegin', btn);
      else topoMapa.appendChild(btn);
    } else {
      btn.className = 'btn-musica btn-musica--flutuante';
      document.body.appendChild(btn);
    }
    btn.addEventListener('click', alternarMusica);
    atualizarBotaoMusica();
  }

  function sincronizarConfiguracoes() {
    if (volumeAlvo() > 0) iniciarMusica();
    else pararMusica();
    atualizarBotaoMusica();
  }

  /* A música começa sozinha assim que o jogo abre. Se o navegador não
     deixar tocar som antes de um gesto, ela começa no primeiro toque,
     clique ou tecla — em qualquer lugar da tela. */
  const EVENTOS_GESTO = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];

  function registrarInteracao() {
    if (aguardandoGesto || (!musicaTocando && volumeAlvo() > 0)) sincronizarConfiguracoes();
    if (!aguardandoGesto) EVENTOS_GESTO.forEach(ev => document.removeEventListener(ev, registrarInteracao, true));
  }

  EVENTOS_GESTO.forEach(ev => document.addEventListener(ev, registrarInteracao, { capture: true, passive: true }));

  let saindo = false;   /* a tela está sendo trocada: não mexer mais na posição salva */
  document.addEventListener('visibilitychange', () => {
    if (saindo) return;
    if (document.hidden) pararMusica();
    else sincronizarConfiguracoes();
  });
  /* Voltou para esta janela (calada por outra aba do jogo): a música volta aqui */
  window.addEventListener('focus', () => {
    if (!saindo && !document.hidden && !musicaTocando) sincronizarConfiguracoes();
  });
  window.addEventListener('pagehide', () => {
    if (saindo) return;
    const tocava = !!elMusica && !elMusica.paused;
    pararMusica(true);
    salvarPosicao(tocava);   /* a próxima tela segue deste ponto */
    saindo = true;
  });
  /* Voltando pelo botão "voltar" do navegador (página restaurada do cache) */
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    saindo = false;
    sincronizarConfiguracoes();
  });

  /* Começa a tocar já, sem esperar o resto da página carregar */
  if (!document.hidden) sincronizarConfiguracoes();

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
    /* Para conferir no console: qual faixa, volume atual e posição */
    estadoMusica() {
      return { faixa, tocando: !!elMusica && !elMusica.paused, volume: +volumeAtual.toFixed(3),
               alvo: +volumeAlvo().toFixed(3), tempo: elMusica ? +elMusica.currentTime.toFixed(1) : 0 };
    },
    iniciarMusica,
    pararMusica
  };
})();
