/* =============================================================
   tutorial.js — Tutorial interativo do Logi ("eu mostro, agora você faz")
   Casa dos Mistérios Lógicos

   Componente único e reutilizável. Cada página:
     1. carrega este arquivo (depois de gameState.js e audio.js);
     2. carrega os dados dos tutoriais (assets/js/tutoriais/*.js),
        que chamam Tutorial.registrar({...});
     3. chama Tutorial.configurar({...}) com o "adaptador" da página
        (preparar / restaurar / acoes / tutorialDaFase / primeiroFoco);
     4. chama Tutorial.auto(id) quando a fase aparece e, nas ações da
        criança, Tutorial.tentar(tipo, valor, fazer) enquanto
        Tutorial.ativo for verdadeiro.

   Voz: cada passo tem um "slot" de áudio assets/audio/logi/<id>.mp3.
   Só é pedido ao navegador o que estiver listado em
   assets/audio/logi/manifest.js; sem áudio o passo usa a legenda e
   duracaoPadrao. Nunca usa voz sintética.
   ============================================================= */

const Tutorial = (() => {
  'use strict';

  const BASE = (() => {
    try { return new URL('../', document.currentScript.src).href; } catch { return '../'; }
  })();
  const IMG_FELIZ = BASE + 'img/logi_feliz.png';
  const IMG_EXCL  = BASE + 'img/logi_exclamacao.png';
  const AUDIO_DIR = BASE + 'audio/logi/';

  const CANC = Symbol('cancelado');
  const registro = {};

  const T = { ativo: false, pausado: false };

  let pagina = null;
  let def = null;
  let gen = 0;            // muda a cada abertura/reinício/fechamento: cancela esperas antigas
  let espera = null;      // passo "sua vez" aguardando a criança
  let exibido = null;     // passo (ou erro) mostrado agora
  let erroTk = 0;
  let vozAtual = null;
  let ui = null;
  let resizeObs = null;
  let bloqueioAuto = 0;   // evita reabrir sozinho enquanto a página se restaura ao fechar

  const $  = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const reduz = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Espera cancelável e pausável ---------- */
  function esperar(ms, tk = gen) {
    return new Promise((res, rej) => {
      let resto = ms;
      const tick = () => {
        if (tk !== gen) return rej(CANC);
        if (resto <= 0) return res();
        if (!T.pausado) resto -= 50;
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  function checar(tk) { if (tk !== gen) throw CANC; }

  /* ---------- Voz do Logi (slot de áudio) ---------- */
  function vozPermitida() {
    try {
      const s = gameState.getSettings();
      return s.somAtivado !== false && s.vozLogiAtivada !== false;
    } catch { return true; }
  }

  function pararVoz() {
    if (!vozAtual) return;
    try { vozAtual.pause(); } catch {}
    vozAtual = null;
  }

  /* Devolve uma Promise<boolean> (true = terminou) ou null se não há áudio */
  function tocarVoz(id) {
    pararVoz();
    const lista = window.LOGI_AUDIOS;
    if (!vozPermitida() || !Array.isArray(lista) || !lista.includes(id)) return null;
    let a;
    try { a = new Audio(AUDIO_DIR + id + '.mp3'); } catch { return null; }
    vozAtual = a;
    return new Promise(res => {
      a.addEventListener('ended', () => res(true), { once: true });
      a.addEventListener('error', () => res(false), { once: true });
      try { a.play().catch(() => res(false)); } catch { res(false); }
    });
  }

  /* ---------- Interface ---------- */
  const ICONE_TECLADO = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="6" width="20" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M7 15h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function montarUI() {
    if (ui) return;
    const painel = document.createElement('section');
    painel.id = 'tutorial-painel';
    painel.className = 'tut-painel';
    painel.setAttribute('role', 'region');
    painel.setAttribute('aria-label', 'Tutorial do Logi');
    painel.tabIndex = -1;
    painel.hidden = true;
    painel.innerHTML = `
      <div class="tut-logi-area">
        <span class="tut-selo-vez" hidden>Sua vez!</span>
        <div class="tut-logi" data-estado="falando" role="img" aria-label="Logi, o mascote">
          <img class="tut-feliz" src="${IMG_FELIZ}" alt="">
          <img class="tut-excl" src="${IMG_EXCL}" alt="">
          <span class="tut-lampada"></span>
          <span class="tut-ondas"><i></i><i></i><i></i></span>
          <span class="tut-seta"></span>
          <span class="tut-confete"></span>
        </div>
      </div>
      <div class="tut-corpo">
        <div class="tut-topo">
          <span class="tut-nome" id="tut-nome"></span>
          <span class="tut-passo" id="tut-passo"></span>
        </div>
        <p class="tut-fala" id="tut-fala"></p>
        <p class="tut-tecla" id="tut-tecla"></p>
        <div class="tut-acoes">
          <button type="button" class="tut-btn" id="tut-pausar" aria-pressed="false">Pausar</button>
          <button type="button" class="tut-btn" id="tut-reiniciar">Ver de novo</button>
          <button type="button" class="tut-btn" id="tut-voz" aria-pressed="true">Voz: ligada</button>
          <button type="button" class="tut-btn tut-btn--pular" id="tut-pular">Pular</button>
        </div>
        <p class="tut-atalhos">Atalhos: <kbd>P</kbd> pausa · <kbd>R</kbd> repete · <kbd>Esc</kbd> pula</p>
      </div>
      <div class="tut-sr" id="tut-live" aria-live="polite" aria-atomic="true"></div>`;

    const mao = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mao.setAttribute('class', 'tut-mao');
    mao.setAttribute('viewBox', '0 0 54 54');
    mao.setAttribute('aria-hidden', 'true');
    mao.innerHTML = `
      <circle class="tut-anel" cx="16" cy="8" r="12" fill="none" stroke="#FFC531" stroke-width="4"/>
      <g class="tut-dedo"><path d="M12 6c0-3 5-3 5 0v16l2-1V15c0-3 5-3 5 0v6l2 0v-3c0-3 5-3 5 0v4l1 0c0-3 5-3 5 0v10c0 9-6 16-15 16h-2c-5 0-8-2-11-6l-8-10c-2-3 2-6 5-3l6 5z" fill="#FFFFFF" stroke="#2C2C2A" stroke-width="2.2" stroke-linejoin="round"/></g>`;

    document.body.appendChild(painel);
    document.body.appendChild(mao);

    const confete = $('.tut-confete', painel);
    const cores = ['#D85A30', '#EF9F27', '#534AB7', '#1D9E75', '#E24B4A'];
    confete.innerHTML = Array.from({ length: 14 }, (_, i) =>
      `<i style="left:${(i * 7.3) % 100}%;top:${(i * 13) % 30}%;background:${cores[i % 5]};animation-delay:${(i % 7) * 0.15}s"></i>`
    ).join('');

    ui = {
      painel, mao,
      logi: $('.tut-logi', painel),
      selo: $('.tut-selo-vez', painel),
      nome: $('#tut-nome', painel),
      passo: $('#tut-passo', painel),
      fala: $('#tut-fala', painel),
      tecla: $('#tut-tecla', painel),
      live: $('#tut-live', painel),
      pausar: $('#tut-pausar', painel),
      voz: $('#tut-voz', painel),
    };

    $('#tut-pausar', painel).addEventListener('click', pausar);
    $('#tut-reiniciar', painel).addEventListener('click', reiniciar);
    $('#tut-pular', painel).addEventListener('click', () => fechar({ pulado: true }));
    ui.voz.addEventListener('click', alternarVoz);
  }

  function atualizarBotaoVoz() {
    if (!ui) return;
    let ligada = true;
    try { ligada = gameState.getSettings().vozLogiAtivada !== false; } catch {}
    ui.voz.textContent = ligada ? 'Voz: ligada' : 'Voz: desligada';
    ui.voz.setAttribute('aria-pressed', ligada ? 'true' : 'false');
  }

  function alternarVoz() {
    let ligada = true;
    try { ligada = gameState.getSettings().vozLogiAtivada !== false; } catch {}
    try { gameState.updateSettings({ vozLogiAtivada: !ligada }); } catch {}
    if (ligada) pararVoz();
    atualizarBotaoVoz();
  }

  function pausar() {
    if (!T.ativo) return;
    T.pausado = !T.pausado;
    ui.painel.classList.toggle('tut-pausado', T.pausado);
    ui.pausar.textContent = T.pausado ? 'Continuar' : 'Pausar';
    ui.pausar.setAttribute('aria-pressed', T.pausado ? 'true' : 'false');
    if (vozAtual) {
      try { T.pausado ? vozAtual.pause() : vozAtual.play().catch(() => {}); } catch {}
    }
    anunciar(T.pausado ? 'Tutorial pausado.' : 'Tutorial continuando.');
  }

  function anunciar(texto) {
    if (!ui) return;
    ui.live.textContent = '';
    window.setTimeout(() => { if (ui) ui.live.textContent = texto; }, 30);
  }

  function marca(txt, chaves) {
    let h = esc(txt);
    [].concat(chaves || []).forEach(k => {
      const re = new RegExp('(' + String(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'u');
      h = h.replace(re, '<mark class="tut-chave">$1</mark>');
    });
    return h;
  }

  /* ---------- Destaques nos elementos reais da fase ---------- */
  function limparDestaques() {
    $$('.tut-brilha, .tut-alvo-vez').forEach(el => el.classList.remove('tut-brilha', 'tut-alvo-vez'));
  }

  function destacar(sel, classe = 'tut-brilha') {
    if (!sel) return;
    $$(sel).forEach(el => el.classList.add(classe));
  }

  function garantirVisivel(el) {
    if (!el || !ui) return;
    const r = el.getBoundingClientRect();
    const limite = ui.painel.getBoundingClientRect().top - 12;
    let dy = 0;
    if (r.bottom > limite) dy = r.bottom - limite;
    else if (r.top < 8) dy = r.top - 8;
    if (dy) window.scrollBy({ top: dy, behavior: reduz() ? 'auto' : 'smooth' });
  }

  function setEstado(e) { ui.logi.dataset.estado = e || 'falando'; }

  function mostrar(p, base) {
    exibido = p;
    const principais = def.passos;
    const n = Math.max(0, principais.indexOf(base || p));
    ui.nome.textContent = def.titulo || '';
    ui.passo.innerHTML =
      `Passo ${n + 1}/${principais.length}` +
      `<span class="tut-bolinhas" aria-hidden="true">${principais.map((_, k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`;
    ui.fala.innerHTML = marca(p.fala, p.palavraChave);
    ui.tecla.innerHTML = p.teclado ? `${ICONE_TECLADO}<span>${esc(p.teclado)}</span>` : '';
    setEstado(p.estadoLogi);
    const vez = (base || p).tipo === 'vez';
    ui.selo.hidden = !vez;
    limparDestaques();
    destacar(p.destaque !== undefined ? p.destaque : p.alvo);
    if (vez) destacar((base || p).alvo, 'tut-alvo-vez');
    anunciar(`${p.fala}. ${p.audiodescricao || ''}`.trim());
    if (p.estadoLogi === 'comemorando') {
      try { audio.acerto(); } catch {}
    }
    ui.fala.classList.remove('tut-pop');
    void ui.fala.offsetWidth;
    ui.fala.classList.add('tut-pop');
  }

  /* ---------- Mãozinha fantasma ---------- */
  function centro(el) {
    const b = el.getBoundingClientRect();
    return [b.left + b.width / 2, b.top + b.height / 2];
  }

  function maoEm([x, y]) { ui.mao.style.transform = `translate(${x - 16}px, ${y - 6}px)`; }

  async function maoToque(sel, tk = gen) {
    const el = sel && $(sel);
    if (!el) return;
    garantirVisivel(el);
    if (reduz()) { await esperar(500, tk); return; }
    await esperar(reduz() ? 0 : 380, tk);
    if (!ui.mao.classList.contains('tut-mao--on')) {
      const [x, y] = centro(el);
      ui.mao.style.transition = 'none';
      maoEm([x + 60, y + 70]);
      void ui.mao.getBoundingClientRect();
      ui.mao.style.transition = '';
      ui.mao.classList.add('tut-mao--on');
    }
    maoEm(centro(el));
    await esperar(800, tk);
    ui.mao.classList.remove('tut-mao--toque');
    void ui.mao.getBoundingClientRect();
    ui.mao.classList.add('tut-mao--toque');
    await esperar(450, tk);
  }

  function maoSome() { ui?.mao.classList.remove('tut-mao--on', 'tut-mao--toque'); }

  /* ---------- Execução dos passos ---------- */
  function getApi() {
    return Object.assign({ esperar: ms => esperar(ms, gen) }, pagina.acoes || {});
  }

  async function passo(p, tk) {
    const api = getApi();
    if (p.antes) await p.antes(api);
    checar(tk);
    mostrar(p);
    if (p.entra && !reduz()) {
      ui.logi.classList.remove('tut-entra');
      void ui.logi.offsetWidth;
      ui.logi.classList.add('tut-entra');
      setTimeout(() => ui.logi?.classList.remove('tut-entra'), 800);
    }
    const voz = tocarVoz(p.id);
    const t0 = Date.now();

    if (p.tipo === 'vez') {
      await vez(p, tk);
      checar(tk);
      maoSome();
      return;
    }

    if (p.tipo === 'toque') {
      await esperar(600, tk);
      await maoToque(p.alvo, tk);
      if (p.efeito) await p.efeito(api);
      checar(tk);
      await esperar(250, tk);
      maoSome();
    } else if (p.efeito) {
      await p.efeito(api);
      checar(tk);
    }

    const restante = Math.max(400, (p.duracaoPadrao || 3000) - (Date.now() - t0));
    if (voz) {
      const terminou = await voz;
      checar(tk);
      if (!terminou) await esperar(restante, tk);
    } else {
      await esperar(restante, tk);
    }
  }

  /* "Sua vez": espera a criança fazer a ação certa (via Tutorial.tentar) */
  function vez(p, tk) {
    return new Promise(resolve => {
      espera = { p, tk, resolve };
      ui.painel.classList.add('tut-vez');
      const foco = p.foco || p.alvo;
      const el = foco && $(foco);
      if (el) {
        if (!el.matches('button, [tabindex], a[href], input, select, textarea')) el.setAttribute('tabindex', '-1');
        garantirVisivel(el);
        try { el.focus({ preventScroll: true }); } catch {}
      }
    });
  }

  async function erroDaVez(e) {
    const p = e.p;
    const er = p.erro;
    if (!er) return;
    const tk = e.tk;
    const meu = ++erroTk;
    try { audio.erro(); } catch {}
    mostrar(er, p);
    ui.selo.hidden = true;
    destacar(er.destaque !== undefined ? er.destaque : (er.alvo || p.alvo));
    const voz = tocarVoz(er.id);
    if (er.efeito) { try { await er.efeito(getApi()); } catch (x) { if (x !== CANC) console.error(x); } }
    const alvo = er.alvo || p.alvo;
    if (alvo && !reduz()) {
      try { await maoToque(alvo, tk); maoSome(); } catch (x) { if (x !== CANC) console.error(x); }
    }
    try {
      if (voz) { const ok = await voz; if (!ok) await esperar(er.duracaoPadrao || 2500, tk); }
      else await esperar(er.duracaoPadrao || 2500, tk);
    } catch (x) { if (x === CANC) return; throw x; }
    if (meu === erroTk && espera === e && tk === gen) {
      mostrar(p);          /* volta ao convite "Sua vez!" */
      ui.selo.hidden = false;
    }
  }

  function balancar(el) {
    if (!el || !(el instanceof Element) || el === document.body) return;
    el.classList.remove('tut-balanca');
    void el.offsetWidth;
    el.classList.add('tut-balanca');
    setTimeout(() => el.classList.remove('tut-balanca'), 600);
  }

  /* Chamado pela página quando a criança age enquanto o tutorial está aberto.
     Devolve true se a ação era a esperada (e executa "fazer"). */
  async function tentar(tipo, valor, fazer, el) {
    const e = espera;
    if (!T.ativo || !e) return false;          /* durante a demonstração, o jogo ignora cliques */
    const v = e.p.vez || {};
    const alvos = v.valor === undefined || v.valor === null ? null : [].concat(v.valor);
    const certo = v.tipo === tipo && (!alvos || alvos.includes(valor));
    if (!certo) {
      balancar(el || document.activeElement);
      erroDaVez(e);
      return false;
    }
    espera = null;
    erroTk++;
    ui.painel.classList.remove('tut-vez');
    $$('.tut-alvo-vez').forEach(x => x.classList.remove('tut-alvo-vez'));
    try { if (fazer) await fazer(); } catch (x) { console.error(x); }
    e.resolve();
    return true;
  }

  async function rodar(inicio) {
    const tk = ++gen;
    try {
      for (let i = inicio; i < def.passos.length; i++) {
        await passo(def.passos[i], tk);
        checar(tk);
      }
      fechar({ concluido: true });
    } catch (x) {
      if (x !== CANC) console.error(x);
    }
  }

  /* ---------- Abrir / fechar ---------- */
  function aoTecla(e) {
    if (!T.ativo || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();           /* impede o "ESC sai do mini-game" da página */
      fechar({ pulado: true });
      return;
    }
    if (e.repeat) return;
    const t = e.target;
    if (t instanceof Element && t.matches('input, textarea, select, [contenteditable="true"]')) return;
    const k = String(e.key).toLowerCase();
    if (k === 'p') { e.preventDefault(); pausar(); }
    else if (k === 'r') { e.preventDefault(); repetirPasso(); }
    else if (e.key === ' ' && t === ui.painel) { e.preventDefault(); pausar(); }
  }

  function repetirPasso() {
    if (!T.ativo || !exibido) return;
    const p = exibido;
    const base = espera ? espera.p : p;
    pararVoz();
    mostrar(p, base);
    tocarVoz(p.id);
    const alvo = p.alvo || base.alvo;
    if (alvo && !reduz()) maoToque(alvo).then(maoSome).catch(() => {});
  }

  function ajustarAltura() {
    if (!ui) return;
    document.documentElement.style.setProperty('--tut-h', ui.painel.offsetHeight + 'px');
  }

  function abrir(id) {
    if (T.ativo || !pagina) return false;
    const d = registro[id];
    if (!d) return false;
    def = d;
    montarUI();
    try { audio.pararNarracao(); } catch {}
    try { pagina.preparar && pagina.preparar(def); } catch (x) { console.error(x); }
    T.ativo = true;
    T.pausado = false;
    espera = null;
    ui.painel.classList.remove('tut-pausado', 'tut-vez');
    ui.pausar.textContent = 'Pausar';
    ui.pausar.setAttribute('aria-pressed', 'false');
    atualizarBotaoVoz();
    ui.painel.hidden = false;
    document.body.classList.add('tut-aberto');
    ajustarAltura();
    if ('ResizeObserver' in window) {
      resizeObs = new ResizeObserver(ajustarAltura);
      resizeObs.observe(ui.painel);
    }
    window.addEventListener('keydown', aoTecla, true);
    try { ui.painel.focus(); } catch {}
    rodar(0);
    return true;
  }

  function reiniciar() {
    if (!T.ativo) return;
    gen++;
    espera = null;
    erroTk++;
    pararVoz();
    maoSome();
    limparDestaques();
    T.pausado = false;
    ui.painel.classList.remove('tut-pausado', 'tut-vez');
    ui.pausar.textContent = 'Pausar';
    ui.pausar.setAttribute('aria-pressed', 'false');
    try { pagina.restaurar && pagina.restaurar(); } catch (x) { console.error(x); }
    try { pagina.preparar && pagina.preparar(def); } catch (x) { console.error(x); }
    rodar(0);
  }

  function fechar(opcoes = {}) {
    if (!T.ativo) return;
    bloqueioAuto = Date.now() + 1500;
    try { gameState.marcarTutorialVisto(def.id); } catch {}
    gen++;
    espera = null;
    erroTk++;
    T.ativo = false;
    T.pausado = false;
    pararVoz();
    maoSome();
    limparDestaques();
    window.removeEventListener('keydown', aoTecla, true);
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
    ui.painel.hidden = true;
    ui.painel.classList.remove('tut-pausado', 'tut-vez');
    document.body.classList.remove('tut-aberto');
    document.documentElement.style.removeProperty('--tut-h');
    try { pagina.restaurar && pagina.restaurar(); } catch (x) { console.error(x); }
    atualizarBotaoAjuda();

    /* Foco volta para o primeiro elemento da fase */
    window.setTimeout(() => {
      let alvo = null;
      try { alvo = pagina.primeiroFoco && pagina.primeiroFoco(); } catch {}
      if (!alvo) alvo = document.querySelector('[tabindex="0"], button:not([disabled])');
      try { alvo && alvo.focus(); } catch {}
    }, 30);
    anunciarFora(opcoes.pulado ? 'Tutorial pulado.' : 'Tutorial concluído. A fase começa.');
  }

  /* A região viva do painel fica escondida ao fechar; usa uma região própria */
  function anunciarFora(texto) {
    let r = document.getElementById('tut-live-fora');
    if (!r) {
      r = document.createElement('div');
      r.id = 'tut-live-fora';
      r.className = 'tut-sr';
      r.setAttribute('aria-live', 'polite');
      document.body.appendChild(r);
    }
    r.textContent = '';
    setTimeout(() => { r.textContent = texto; }, 30);
  }

  /* ---------- Botão "Ver o tutorial do Logi" dentro do modal do "?" ---------- */
  function atualizarBotaoAjuda() {
    const modal = document.getElementById('modal-ajuda');
    if (!modal || !pagina) return;
    const caixa = modal.querySelector('.modal');
    if (!caixa) return;
    let btn = document.getElementById('btn-ver-tutorial');
    const id = pagina.tutorialDaFase ? pagina.tutorialDaFase() : null;
    if (!id || !registro[id]) { if (btn) btn.hidden = true; return; }
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btn-ver-tutorial';
      btn.className = 'btn btn--outline tut-btn-ajuda';
      btn.textContent = '🤖 Ver o tutorial do Logi';
      caixa.appendChild(btn);
      btn.addEventListener('click', () => {
        const alvo = pagina.tutorialDaFase();
        document.getElementById('modal-ajuda-fechar')?.click();
        if (alvo) window.setTimeout(() => abrir(alvo), 60);
      });
    }
    btn.hidden = false;
  }

  /* ---------- API pública ---------- */
  function registrar(d) { registro[d.id] = d; }

  function configurar(p) {
    pagina = p;
    const ajuda = document.getElementById('btn-ajuda');
    if (ajuda) ajuda.addEventListener('click', atualizarBotaoAjuda, true);
  }

  function auto(id) {
    if (!id || !registro[id] || T.ativo || Date.now() < bloqueioAuto) return;
    let visto = false;
    try { visto = gameState.tutorialVisto(id); } catch {}
    if (!visto) window.setTimeout(() => abrir(id), 350);
  }

  return {
    registrar, configurar, auto, abrir, fechar, tentar,
    get ativo() { return T.ativo; },
    tem: id => Boolean(registro[id]),
  };
})();

/* Permite que as páginas usem window.Tutorial?.ativo sem erro */
window.Tutorial = Tutorial;
