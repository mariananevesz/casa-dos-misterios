/* =============================================================
   tutorial.js — Tutorial interativo do Logi ("aprender fazendo")
   Casa dos Mistérios Lógicos

   Motor único para todas as páginas. A tela escurece, só o alvo
   fica aceso (buraco + anel), a mãozinha mostra o toque e o Logi
   fala uma frase curta. O avanço é SEMPRE da criança: nenhum passo
   passa por tempo.

   Cada página:
     1. carrega este arquivo (depois de gameState.js e audio.js);
     2. carrega os dados dos tutoriais (assets/js/tutoriais/*.js),
        que chamam Tutorial.registrar({...});
     3. chama Tutorial.configurar({...}) com o "adaptador" da página
        (preparar / restaurar / acoes / tutorialDaFase / primeiroFoco /
        ocupado);
     4. chama Tutorial.auto(id) quando a fase aparece e, nas ações da
        criança, Tutorial.tentar(tipo, valor, fazer) enquanto
        Tutorial.ativo for verdadeiro.

   Passos (campo "acao"):
     'ok'    — só informa; termina no botão "→ OK".
     'click' — a criança faz a ação real no alvo (a página avisa por
               Tutorial.tentar; "vez" diz qual ação vale).
     'demo'  — a mãozinha faz a ação sozinha (efeito) e espera o "→ OK".
   Tutoriais antigos, sem "acao", são lidos assim: tipo 'vez' = click,
   tipo 'toque' = demo e os demais = ok.

   Sem voz e sem som: só texto, destaque e mãozinha.
   ============================================================= */

const Tutorial = (() => {
  'use strict';

  const BASE = (() => {
    try { return new URL('../', document.currentScript.src).href; } catch { return '../'; }
  })();
  const IMG_FELIZ = BASE + 'img/logi_feliz.png';
  const IMG_EXCL  = BASE + 'img/logi_exclamacao.png';

  /* Como o Logi chama a criança. Termo neutro e provisório (decisão de 03/11/2026):
     troque aqui para mudar em todas as falas, que usam {tratamento} */
  const TRATAMENTO = 'explorador';
  const tratar = s => (typeof s === 'string' ? s.replace(/\{tratamento\}/g, TRATAMENTO) : s);

  const CANC = Symbol('cancelado');
  const registro = {};

  /* Tempos e medidas (ver contexto, seção 4.3 e 4.4) */
  const MS_IGNORAR_TOQUE = 400;   // toques logo após trocar de passo são ignorados
  const MS_INATIVIDADE   = 10000; // sem ação por 10 s: a dica volta
  const MS_MOVE_BURACO   = 450;
  const MS_ZOOM          = 600;
  const FORA_FORTE       = 3;     // toques fora do alvo até o anel engrossar

  const T = { ativo: false };

  let pagina = null;
  let def = null;
  let passos = [];
  let gen = 0;               // muda a cada abertura/reinício/fechamento: cancela esperas antigas
  let espera = null;         // passo 'click' aguardando a criança: { p, resolve, reject }
  let esperaOk = null;       // passo aguardando o botão "→ OK": { resolve, reject }
  let atual = null;          // { p, i } passo exibido agora
  let ui = null;
  let liberadoEm = 0;
  let foras = 0;
  let erroTk = 0;
  let confirmando = false;
  let buracoAtual = null;    // retângulo do buraco desenhado agora (ou null)
  let tweenTk = 0;
  let rafPos = 0;
  let inatTimer = 0;
  let desfazerInert = [];
  let focoAnterior = null;
  let bloqueioAuto = 0;      // evita reabrir sozinho enquanto a página se restaura ao fechar
  let modoDica = false;      // true na "cena de dica" (botão Dica): só destaca e explica, sem treino
  let emErro = false;        // mostrando a explicação de um erro (toques ficam de lado até o OK)
  let destaqueTemp;          // destaque provisório durante a explicação de um erro (undefined = o do passo)

  const $  = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const reduz = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Espera cancelável ---------- */
  function esperar(ms, tk = gen) {
    return new Promise((res, rej) => {
      setTimeout(() => (tk !== gen ? rej(CANC) : res()), ms);
    });
  }

  function checar(tk) { if (tk !== gen) throw CANC; }

  function aguardar(slot) {
    return new Promise((resolve, reject) => { slot.resolve = resolve; slot.reject = reject; });
  }

  function cancelarEsperas() {
    const e1 = espera, e2 = esperaOk;
    espera = null;
    esperaOk = null;
    e1?.reject?.(CANC);
    e2?.reject?.(CANC);
  }

  /* ---------- Interface ---------- */
  const SVG_REINICIAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_PULAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 5l9 7-9 7zM18 5v14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_FECHAR = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>';
  const SVG_LAMPADA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 21h6M10 17.5h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.6h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="#FFF3B0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SVG_TECLADO ='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="6" width="20" height="13" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M7 15h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  function montarUI() {
    if (ui) return;
    const raiz = document.createElement('div');
    raiz.id = 'tut';
    raiz.className = 'tut';
    raiz.hidden = true;
    raiz.innerHTML = `
      <svg class="tut-dim" aria-hidden="true" focusable="false"><path class="tut-dim-path" fill-rule="evenodd" d=""/></svg>
      <div class="tut-alvo" aria-hidden="true"><i></i></div>
      <div class="tut-barra">
        <button type="button" class="tut-btn" id="tut-reiniciar">${SVG_REINICIAR}<span>Ver de novo</span></button>
        <button type="button" class="tut-btn tut-btn--pular" id="tut-pular">${SVG_PULAR}<span>Pular</span></button>
      </div>
      <div class="tut-tip" id="tut-tip" role="dialog" aria-modal="false" aria-labelledby="tut-text" tabindex="-1">
        <div class="tut-logi" data-estado="falando" role="img" aria-label="Logi, o mascote">
          <img class="tut-feliz" src="${IMG_FELIZ}" alt="">
          <img class="tut-excl" src="${IMG_EXCL}" alt="">
          <span class="tut-lampada"></span>
          <span class="tut-ondas"><i></i><i></i><i></i></span>
          <span class="tut-seta"></span>
          <span class="tut-confete"></span>
        </div>
        <div class="tut-tip-corpo">
          <p class="tut-etiqueta" id="tut-etiqueta" hidden>${SVG_LAMPADA}<span>Dica</span></p>
          <p class="tut-fala" id="tut-text"></p>
          <p class="tut-tecla" id="tut-tecla"></p>
          <div class="tut-tip-rodape">
            <span class="tut-passo" id="tut-passo"></span>
            <button type="button" class="tut-ok" id="tut-ok" hidden>→ OK</button>
          </div>
        </div>
      </div>
      <div class="tut-confirma" id="tut-confirma" hidden>
        <div class="tut-confirma-card" role="alertdialog" aria-modal="true" aria-labelledby="tut-confirma-t">
          <p id="tut-confirma-t">Quer pular o tutorial?</p>
          <div class="tut-confirma-botoes">
            <button type="button" class="tut-grande tut-grande--sim" id="tut-pular-sim"><span aria-hidden="true">✓</span> Pular</button>
            <button type="button" class="tut-grande tut-grande--nao" id="tut-pular-nao"><span aria-hidden="true">↩</span> Continuar</button>
          </div>
        </div>
      </div>
      <div class="tut-sr" id="tut-live" aria-live="polite" aria-atomic="true"></div>`;

    const mao = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    mao.setAttribute('class', 'tut-mao');
    mao.setAttribute('viewBox', '0 0 54 54');
    mao.setAttribute('aria-hidden', 'true');
    mao.innerHTML = `
      <circle class="tut-anel" cx="16" cy="6" r="12" fill="none" stroke="#FFC531" stroke-width="4"/>
      <g class="tut-dedo"><path d="M12 6c0-3 5-3 5 0v16l2-1V15c0-3 5-3 5 0v6l2 0v-3c0-3 5-3 5 0v4l1 0c0-3 5-3 5 0v10c0 9-6 16-15 16h-2c-5 0-8-2-11-6l-8-10c-2-3 2-6 5-3l6 5z" fill="#FFFFFF" stroke="#2C2C2A" stroke-width="2.2" stroke-linejoin="round"/></g>`;
    raiz.appendChild(mao);
    document.body.appendChild(raiz);

    const confete = $('.tut-confete', raiz);
    const cores = ['#D85A30', '#EF9F27', '#534AB7', '#1D9E75', '#E24B4A'];
    confete.innerHTML = Array.from({ length: 14 }, (_, i) =>
      `<i style="left:${(i * 7.3) % 100}%;top:${(i * 13) % 30}%;background:${cores[i % 5]};animation-delay:${(i % 7) * 0.15}s"></i>`
    ).join('');

    ui = {
      raiz, mao,
      dim: $('.tut-dim', raiz),
      dimPath: $('.tut-dim-path', raiz),
      alvo: $('.tut-alvo', raiz),
      tip: $('#tut-tip', raiz),
      etiqueta: $('#tut-etiqueta', raiz),
      pular: $('#tut-pular', raiz),
      logi: $('.tut-logi', raiz),
      fala: $('#tut-text', raiz),
      tecla: $('#tut-tecla', raiz),
      passo: $('#tut-passo', raiz),
      ok: $('#tut-ok', raiz),
      live: $('#tut-live', raiz),
      confirma: $('#tut-confirma', raiz),
      pularSim: $('#tut-pular-sim', raiz),
      pularNao: $('#tut-pular-nao', raiz),
    };

    $('#tut-reiniciar', raiz).addEventListener('click', () => { if (!confirmando) reiniciar(); });
    $('#tut-pular', raiz).addEventListener('click', pedirPular);
    ui.pularSim.addEventListener('click', () => { escondeConfirmacao(); fechar({ pulado: true }); });
    ui.pularNao.addEventListener('click', continuar);
    ui.ok.addEventListener('click', aoOk);
    /* Toque no fundo escuro: não avança nada. Só ensina de novo onde tocar */
    ui.dimPath.addEventListener('click', foraDoAlvo);
  }

  function anunciar(texto) {
    if (!ui) return;
    ui.live.textContent = '';
    window.setTimeout(() => { if (ui) ui.live.textContent = texto; }, 30);
  }

  function marca(txt, chaves) {
    /* Sem lista, vale toda palavra em MAIÚSCULAS (3+ letras) */
    if (chaves == null) chaves = [...new Set(String(txt).match(/(?<!\p{L})\p{Lu}{3,}(?!\p{L})/gu) || [])];
    let h = esc(txt);
    [].concat(chaves || []).forEach(k => {
      const re = new RegExp('(' + String(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'u');
      h = h.replace(re, '<mark class="tut-chave">$1</mark>');
    });
    return h;
  }

  function setEstado(e) { if (ui) ui.logi.dataset.estado = e || 'falando'; }

  /* ---------- Alvos, buraco e anel ---------- */
  function visivel(el) {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  /* `sel` é um seletor CSS ou, nas cenas de dica, um elemento / lista de elementos já escolhidos pela página */
  function elementosDe(sel) {
    if (!sel) return [];
    const lista = typeof sel === 'string' ? $$(sel) : [].concat(sel).filter(x => x instanceof Element);
    return lista.filter(visivel);
  }

  function seletorDestaque(p) {
    return p.destaque !== undefined ? p.destaque : p.alvo;
  }

  function uniao(els) {
    if (!els.length) return null;
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    els.forEach(el => {
      const q = el.getBoundingClientRect();
      l = Math.min(l, q.left); t = Math.min(t, q.top);
      r = Math.max(r, q.right); b = Math.max(b, q.bottom);
    });
    return { l, t, r, b };
  }

  /* Folga do buraco: 6% do alvo, entre 12 e 16 px, sem sair da tela.
     (Sem o teto, um alvo largo e baixo, como o balão do Logi, ganhava dezenas de
     pixels de cada lado e o anel ficava torto em relação a ele.) */
  function comFolga(u) {
    if (!u) return null;
    const pad = Math.min(16, Math.max(12, 0.06 * Math.max(u.r - u.l, u.b - u.t)));
    const vw = window.innerWidth, vh = window.innerHeight;
    return {
      l: Math.max(4, u.l - pad), t: Math.max(4, u.t - pad),
      r: Math.min(vw - 4, u.r + pad), b: Math.min(vh - 4, u.b + pad),
    };
  }

  function caminhoDim(rect) {
    const vw = window.innerWidth, vh = window.innerHeight;
    let d = `M0 0H${vw}V${vh}H0Z`;
    if (rect) {
      const w = Math.max(0, rect.r - rect.l), h = Math.max(0, rect.b - rect.t);
      const r = Math.min(14, w / 2, h / 2);
      d += `M${rect.l + r} ${rect.t}H${rect.r - r}a${r} ${r} 0 0 1 ${r} ${r}V${rect.b - r}a${r} ${r} 0 0 1 ${-r} ${r}H${rect.l + r}a${r} ${r} 0 0 1 ${-r} ${-r}V${rect.t + r}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
    }
    return d;
  }

  function desenhar(rect) {
    ui.dim.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    ui.dimPath.setAttribute('d', caminhoDim(rect));
    const a = ui.alvo;
    if (!rect) { a.classList.remove('tut-alvo--on'); return; }
    a.classList.add('tut-alvo--on');
    a.style.left = rect.l + 'px';
    a.style.top = rect.t + 'px';
    a.style.width = (rect.r - rect.l) + 'px';
    a.style.height = (rect.b - rect.t) + 'px';
  }

  const mistura = (a, b, k) => a + (b - a) * k;
  const suaviza = t => 1 - Math.pow(1 - t, 4);   // ~ cubic-bezier(0.2, 0, 0, 1)

  /* Move o buraco até o novo alvo (450 ms); com movimento reduzido, salta */
  function irPara(dst) {
    const meu = ++tweenTk;
    if (!dst) { buracoAtual = null; desenhar(null); return; }
    if (reduz()) { buracoAtual = dst; desenhar(dst); return; }
    const cx = (dst.l + dst.r) / 2, cy = (dst.t + dst.b) / 2;
    const de = buracoAtual || { l: cx, t: cy, r: cx, b: cy };
    const t0 = performance.now();
    const quadro = agora => {
      if (meu !== tweenTk) return;
      const k = Math.min(1, (agora - t0) / MS_MOVE_BURACO);
      const e = suaviza(k);
      const cur = {
        l: mistura(de.l, dst.l, e), t: mistura(de.t, dst.t, e),
        r: mistura(de.r, dst.r, e), b: mistura(de.b, dst.b, e),
      };
      desenhar(cur);
      if (k < 1) requestAnimationFrame(quadro);
      else { buracoAtual = dst; chegada(); }
    };
    buracoAtual = dst;
    requestAnimationFrame(quadro);
  }

  /* Zoom de chegada: 1 → 1,1 → 1 em 600 ms (não existe com movimento reduzido) */
  function chegada() {
    if (reduz() || !ui?.alvo.animate) return;
    ui.alvo.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.1)', offset: 0.5 }, { transform: 'scale(1)' }],
      { duration: MS_ZOOM, easing: 'ease-out' }
    );
  }

  function garantirVisivel(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight && r.left >= 0 && r.right <= window.innerWidth) return;
    try { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'auto' }); } catch {}
  }

  /* ---------- Balão do Logi: troca de lado para nunca cobrir o alvo ---------- */
  const area = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));

  /* `evitar`: regiões extras que o balão tenta não cobrir (ex.: onde o bloco vai entrar) */
  function posicionarBalao(rect, evitar = []) {
    const tip = ui.tip;
    const vw = window.innerWidth, vh = window.innerHeight, m = 8, gap = 14;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const lim = (v, a, b) => Math.max(a, Math.min(b, v));
    let esq, topo;

    if (!rect) {
      esq = (vw - w) / 2;
      topo = (vh - h) / 2;
    } else {
      const cx = (rect.l + rect.r) / 2, cy = (rect.t + rect.b) / 2;
      const candidatos = [
        { l: lim(cx - w / 2, m, vw - w - m), t: lim(rect.b + gap, m, vh - h - m) },        // abaixo
        { l: lim(cx - w / 2, m, vw - w - m), t: lim(rect.t - gap - h, m, vh - h - m) },    // acima
        { l: lim(rect.r + gap, m, vw - w - m), t: lim(cy - h / 2, m, vh - h - m) },        // à direita
        { l: lim(rect.l - gap - w, m, vw - w - m), t: lim(cy - h / 2, m, vh - h - m) },    // à esquerda
      ];
      /* Também tenta ficar logo acima / abaixo de cada região a evitar (ex.: a frase), para não cobri-la */
      evitar.forEach(r => {
        const ex = (r.l + r.r) / 2;
        candidatos.push({ l: lim(ex - w / 2, m, vw - w - m), t: lim(r.t - gap - h, m, vh - h - m) });
        candidatos.push({ l: lim(ex - w / 2, m, vw - w - m), t: lim(r.b + gap, m, vh - h - m) });
      });
      /* Menos sobreposição vence: o alvo pesa muito mais que as regiões a evitar */
      let melhor = candidatos[0], pior = Infinity;
      candidatos.forEach(c => {
        const caixa = { l: c.l, t: c.t, r: c.l + w, b: c.t + h };
        const custo = area(caixa, rect) * 1000 + evitar.reduce((s, r) => s + area(caixa, r), 0);
        if (custo < pior) { pior = custo; melhor = c; }
      });
      esq = melhor.l;
      topo = melhor.t;
    }
    tip.style.left = Math.round(esq) + 'px';
    tip.style.top = Math.round(topo) + 'px';
  }

  function retangulosEvitar(p) {
    return elementosDe(p.evitar).map(el => {
      const q = el.getBoundingClientRect();
      return { l: q.left, t: q.top, r: q.right, b: q.bottom };
    });
  }

  /* ---------- Isolamento (inert) e foco ---------- */
  function isolar(manter) {
    desisolar();
    const keep = new Set([ui.raiz, document.body]);
    const fora = document.getElementById('tut-live-fora');
    if (fora) keep.add(fora);
    manter.filter(Boolean).forEach(n => {
      for (let x = n; x && x !== document.documentElement; x = x.parentElement) keep.add(x);
    });
    [...keep].forEach(n => {
      if (n === ui.raiz || n === fora) return;     /* o overlay e a região viva nunca são isolados */
      [...n.children].forEach(c => {
        if (keep.has(c) || c.inert || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(c.tagName)) return;
        c.inert = true;
        desfazerInert.push(c);
      });
    });
  }

  function desisolar() {
    desfazerInert.forEach(c => { c.inert = false; });
    desfazerInert = [];
  }

  let descreve = [];
  function descrever(els) {
    descreve.forEach(el => el.removeAttribute('aria-describedby'));
    descreve = els;
    els.forEach(el => el.setAttribute('aria-describedby', 'tut-text'));
  }

  function focar(el) {
    if (!el) return;
    if (!el.matches('button, [tabindex], a[href], input, select, textarea')) el.setAttribute('tabindex', '-1');
    try { el.focus({ preventScroll: true }); } catch {}
  }

  /* ---------- Mãozinha ---------- */
  function maoPara(el) {
    const q = el.getBoundingClientRect();
    return [q.left + q.width / 2, q.top + q.height / 2, q.width, q.height];
  }

  /* Toca `vezes` ciclos de 1,4 s (2 ciclos ≈ 3 s) e some, deixando só o anel */
  function maoToca(el, vezes = 2) {
    if (!el || !ui) return;
    const [x, y, w, h] = maoPara(el);
    const m = ui.mao;
    m.classList.remove('tut-mao--on', 'tut-mao--estatica');
    if (reduz()) {
      /* Movimento reduzido: a mão fica parada, apontando */
      m.style.left = (x + w * 0.2 - 16) + 'px';
      m.style.top = (y + h * 0.2 - 6) + 'px';
      m.classList.add('tut-mao--estatica');
      return;
    }
    m.style.left = (x - 16) + 'px';
    m.style.top = (y - 6) + 'px';
    m.style.setProperty('--tut-n', String(vezes));
    void m.getBoundingClientRect();
    m.classList.add('tut-mao--on');
  }

  function maoSome() { ui?.mao.classList.remove('tut-mao--on', 'tut-mao--estatica'); }

  /* ---------- Dica por inatividade (10 s) ---------- */
  function limparInatividade() { clearTimeout(inatTimer); inatTimer = 0; }

  function armarInatividade() {
    limparInatividade();
    if (!T.ativo || confirmando || modoDica) return;
    const tk = gen;
    inatTimer = setTimeout(() => {
      if (tk !== gen || !T.ativo || confirmando || !atual) return;
      const el = elementosDe(atual.p.alvo)[0] || elementosDe(seletorDestaque(atual.p))[0];
      if (el && !atual.p.semMao) maoToca(el, 2);
      setEstado('dica');
      chegada();
      armarInatividade();
    }, MS_INATIVIDADE);
  }

  /* ---------- Exibição de um passo ---------- */
  function mostrar(p, i) {
    atual = { p, i };
    foras = 0;
    destaqueTemp = undefined;
    ui.raiz.classList.remove('tut--forte');
    ui.alvo.classList.remove('tut-alvo--certo');
    liberadoEm = Date.now() + MS_IGNORAR_TOQUE;

    const n = passos.length;
    /* Cena de dica com um passo só não precisa de bolinhas */
    ui.passo.innerHTML = modoDica && n === 1 ? '' :
      `<span class="tut-sr">Passo ${i + 1} de ${n}. </span>` +
      `<span class="tut-bolinhas" aria-hidden="true">${passos.map((_, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</span>`;
    ui.fala.innerHTML = marca(p.fala, p.palavraChave);
    ui.tecla.innerHTML = p.teclado && !/^—/.test(p.teclado) ? `${SVG_TECLADO}<span>${esc(p.teclado)}</span>` : '';
    setEstado(p.estadoLogi);
    ui.ok.hidden = true;
    maoSome();

    const els = elementosDe(seletorDestaque(p));
    const alvoEls = elementosDe(p.alvo);
    if (els[0]) garantirVisivel(els[0]);
    const rect = comFolga(uniao(elementosDe(seletorDestaque(p))));
    irPara(rect);

    ui.tip.classList.remove('tut-tip--in');
    void ui.tip.offsetWidth;
    ui.tip.classList.add('tut-tip--in');
    posicionarBalao(rect, retangulosEvitar(p));

    const foco = p.foco ? elementosDe(p.foco)[0] : null;
    isolar([...els, ...alvoEls, foco]);
    descrever(p.acao === 'click' ? (alvoEls.length ? alvoEls : els) : []);

    anunciar(`${p.fala}. ${p.audiodescricao || ''}`.trim());
    ui.fala.classList.remove('tut-pop');
    void ui.fala.offsetWidth;
    ui.fala.classList.add('tut-pop');

    if (p.acao === 'click') focar(foco || alvoEls[0] || els[0]);
    else try { ui.tip.focus({ preventScroll: true }); } catch {}
  }

  /* Recalcula buraco, anel, mão e balão (rolagem, giro de tela, efeitos que mudam a página) */
  function reposicionar() {
    if (!T.ativo || !atual) return;
    const p = atual.p;
    const rect = comFolga(uniao(elementosDe(destaqueTemp !== undefined ? destaqueTemp : seletorDestaque(p))));
    tweenTk++;
    buracoAtual = rect;
    desenhar(rect);
    posicionarBalao(rect, retangulosEvitar(p));
  }

  function agendarReposicao() {
    if (rafPos) return;
    rafPos = requestAnimationFrame(() => { rafPos = 0; reposicionar(); });
  }

  /* ---------- Fluxo dos passos ---------- */
  function normalizar(p) {
    if (!p.acao) p.acao = p.tipo === 'vez' ? 'click' : p.tipo === 'toque' ? 'demo' : 'ok';
    [p, p.erro].forEach(t => {
      if (!t) return;
      t.fala = tratar(t.fala);
      t.audiodescricao = tratar(t.audiodescricao);
    });
    return p;
  }

  /* Cópia dos passos: o erro pode trocar a fala do convite (falaDepois) e isso não pode ficar no registro */
  function copiarPassos(d) {
    return d.passos.map(p => normalizar({ ...p }));
  }

  function getApi() {
    return Object.assign({ esperar: ms => esperar(ms, gen) }, pagina.acoes || {});
  }

  function mostrarOk() {
    ui.ok.hidden = false;
    focar(ui.ok);
    armarInatividade();
  }

  function aoOk() {
    if (!esperaOk || confirmando || Date.now() < liberadoEm) return;
    const e = esperaOk;
    esperaOk = null;
    limparInatividade();
    maoSome();
    e.resolve();
  }

  async function esperarOk(tk) {
    const slot = {};
    esperaOk = slot;
    const promessa = aguardar(slot);
    mostrarOk();
    await promessa;
    checar(tk);
  }

  async function esperarAcao(p, tk) {
    const slot = { p };
    espera = slot;
    const promessa = aguardar(slot);
    const alvo = elementosDe(p.alvo)[0] || elementosDe(seletorDestaque(p))[0];
    /* "semMao": passo de escolha entre alvos (ex.: Verdadeiro ou Falso), a mão não aponta para nenhum */
    if (alvo && !p.semMao) maoToca(alvo, 2);
    armarInatividade();
    await promessa;
    checar(tk);
    /* Acerto: o anel fica verde um instante, o Logi comemora e segue */
    ui.alvo.classList.add('tut-alvo--certo');
    setEstado('comemorando');
    await esperar(reduz() ? 150 : 450, tk);
  }

  async function passo(p, i, tk) {
    const api = getApi();
    if (p.antes) await p.antes(api);
    checar(tk);
    mostrar(p, i);
    if (p.entra && !reduz()) {
      ui.logi.classList.remove('tut-entra');
      void ui.logi.offsetWidth;
      ui.logi.classList.add('tut-entra');
      setTimeout(() => ui.logi?.classList.remove('tut-entra'), 800);
    }

    if (p.acao === 'click') {
      await esperarAcao(p, tk);
    } else if (p.acao === 'demo') {
      /* A mãozinha faz o toque; quem decide quando seguir é a criança (→ OK) */
      await esperar(500, tk);
      const alvo = elementosDe(p.alvo)[0];
      if (alvo) maoToca(alvo, 1);
      await esperar(650, tk);
      if (p.efeito) await p.efeito(api);
      checar(tk);
      reposicionar();
      await esperar(300, tk);
      await esperarOk(tk);
    } else {
      if (p.efeito) { await p.efeito(api); checar(tk); reposicionar(); }
      await esperarOk(tk);
    }

    if (p.depois) { await p.depois(api); checar(tk); reposicionar(); }
  }

  async function finalizar(tk) {
    /* Tutoriais antigos já terminam com o próprio "A FASE começa agora" */
    if (/FASE\s+começa/i.test(passos[passos.length - 1]?.fala || '')) return;
    const p = { fala: 'A FASE começa agora!', palavraChave: ['FASE'], estadoLogi: 'comemorando',
      audiodescricao: 'Agora começa a fase de verdade.', acao: 'ok', destaque: '' };
    mostrar(p, passos.length - 1);
    await esperar(reduz() ? 1200 : 1800, tk);
  }

  async function rodar(inicio) {
    const tk = ++gen;
    try {
      for (let i = inicio; i < passos.length; i++) {
        await passo(passos[i], i, tk);
        checar(tk);
      }
      if (!modoDica) await finalizar(tk);
      fechar({ concluido: true });
    } catch (x) {
      if (x !== CANC) console.error(x);
    }
  }

  /* ---------- Ações da criança ---------- */
  function balancar(el) {
    if (!el || !(el instanceof Element) || el === document.body) return;
    el.classList.remove('tut-balanca');
    void el.offsetWidth;
    el.classList.add('tut-balanca');
    setTimeout(() => el.classList.remove('tut-balanca'), 600);
  }

  /* Toque fora do alvo: sem mensagem de erro. A mão e o zoom repetem e o Logi encoraja */
  function foraDoAlvo() {
    if (!T.ativo || confirmando || emErro || !espera || Date.now() < liberadoEm) return;
    foras++;
    ui.raiz.classList.toggle('tut--forte', foras >= FORA_FORTE);
    setEstado('encorajando');
    chegada();
    const alvo = elementosDe(espera.p.alvo)[0];
    if (alvo && !espera.p.semMao) maoToca(alvo, 1);
    armarInatividade();
  }

  /* Erro com mensagem própria: o Logi explica e depois volta ao convite.
     Campos de "erro": fala (texto ou função), palavraChave, estadoLogi, audiodescricao, teclado,
       destaque (o que acender enquanto explica), efeito (roda ao mostrar),
       ok: true (espera o botão "→ OK" em vez de um tempo), duracaoPadrao (ms, sem "ok"),
       depois (roda depois do OK, ex.: trocar a frase de exemplo),
       falaDepois (texto novo do convite, para tentar de novo). */
  async function erroComTexto(e, el, valor) {
    const p = e.p;
    const er = p.erro;
    const meu = ++erroTk;
    const tk = gen;
    const api = getApi();
    /* fala(api, valor): "valor" é o que a criança tocou (ex.: o id da fruta), para explicar o erro certo */
    const fala = typeof er.fala === 'function' ? tratar(er.fala(api, valor)) : er.fala;
    emErro = true;
    ui.fala.innerHTML = marca(fala, er.palavraChave);
    ui.tecla.innerHTML = er.teclado && !/^—/.test(er.teclado) ? `${SVG_TECLADO}<span>${esc(er.teclado)}</span>` : '';
    setEstado(er.estadoLogi || 'encorajando');
    anunciar(`${fala}. ${er.audiodescricao || ''}`.trim());
    if (er.destaque !== undefined) { destaqueTemp = er.destaque; reposicionar(); }
    try {
      if (er.efeito) await er.efeito(api);
      checar(tk);
      if (er.ok) { await esperarOk(tk); ui.ok.hidden = true; }
      else await esperar(er.duracaoPadrao || 2500, tk);
      checar(tk);
      if (er.depois) await er.depois(api);
      checar(tk);
    } catch (x) {
      if (x === CANC) return;   /* o tutorial reiniciou ou fechou: quem fez isso já limpou o estado */
      console.error(x);
    }
    if (meu !== erroTk || espera !== e || tk !== gen) return;
    emErro = false;
    destaqueTemp = undefined;
    if (er.falaDepois) { p.fala = tratar(er.falaDepois); p.palavraChave = er.palavraChaveDepois; }
    ui.fala.innerHTML = marca(p.fala, p.palavraChave);
    ui.tecla.innerHTML = p.teclado && !/^—/.test(p.teclado) ? `${SVG_TECLADO}<span>${esc(p.teclado)}</span>` : '';
    setEstado(p.estadoLogi);
    reposicionar();
    if (er.ok) focar(elementosDe(p.alvo)[0]);
    armarInatividade();
  }

  /* Chamado pela página quando a criança age enquanto o tutorial está aberto.
     Devolve true se a ação era a esperada (e executa "fazer"). */
  async function tentar(tipo, valor, fazer, el) {
    const e = espera;
    if (!T.ativo || !e || confirmando || emErro) return false;   /* sem passo de ação, o jogo ignora cliques */
    if (Date.now() < liberadoEm) return false;          /* crianças repetem o toque do passo anterior */
    /* "vez" pode ser uma função (a resposta certa muda, ex.: outra frase de exemplo) */
    const v = (typeof e.p.vez === 'function' ? e.p.vez() : e.p.vez) || {};
    const alvos = v.valor === undefined || v.valor === null ? null : [].concat(v.valor);
    const certo = v.tipo === tipo && (!alvos || alvos.includes(valor));
    if (!certo) {
      balancar(el || document.activeElement);
      if (e.p.erro) erroComTexto(e, el, valor); else foraDoAlvo();
      return false;
    }
    espera = null;
    erroTk++;
    limparInatividade();
    maoSome();
    try { if (fazer) await fazer(); } catch (x) { console.error(x); }
    e.resolve();
    return true;
  }

  /* ---------- Pular com confirmação ---------- */
  function pedirPular() {
    if (!T.ativo || confirmando) return;
    /* Dica: "Fechar" fecha direto, sem confirmação */
    if (modoDica) { fechar({ pulado: true }); return; }
    confirmando = true;
    limparInatividade();
    ui.confirma.hidden = false;
    ui.confirma.classList.add('tut-confirma--on');
    focar(ui.pularNao);
  }

  function escondeConfirmacao() {
    confirmando = false;
    ui.confirma.hidden = true;
    ui.confirma.classList.remove('tut-confirma--on');
  }

  function continuar() {
    escondeConfirmacao();
    if (atual?.p.acao === 'click') focar(elementosDe(atual.p.alvo)[0]);
    else if (!ui.ok.hidden) focar(ui.ok);
    armarInatividade();
  }

  /* ---------- Teclado ---------- */
  function aoTecla(e) {
    if (!T.ativo || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();           /* impede o "ESC sai do mini-game" da página */
      if (confirmando) continuar(); else pedirPular();
      return;
    }
    if (confirmando) {
      if (e.key === 'Tab') {
        e.preventDefault();
        const prox = document.activeElement === ui.pularNao ? ui.pularSim : ui.pularNao;
        prox.focus();
      }
      return;
    }
    if (e.repeat) return;
    const t = e.target;
    if (t instanceof Element && t.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (String(e.key).toLowerCase() === 'r') { e.preventDefault(); reiniciar(); }
  }

  /* R com o tutorial fechado: abre de novo o tutorial da fase (se a página não estiver ocupada) */
  function aoTeclaFora(e) {
    if (T.ativo || !pagina || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (String(e.key).toLowerCase() !== 'r') return;
    const t = e.target;
    if (t instanceof Element && t.matches('input, textarea, select, [contenteditable="true"]')) return;
    if ($$('.modal-overlay').some(m => getComputedStyle(m).display !== 'none')) return;
    if (pagina.ocupado && pagina.ocupado()) return;
    const id = pagina.tutorialDaFase ? pagina.tutorialDaFase() : null;
    if (!id || !registro[id]) return;
    e.preventDefault();
    abrir(id);
  }

  /* ---------- Abrir / reiniciar / fechar ---------- */
  function abrir(id) {
    if (T.ativo || !pagina) return false;
    const d = registro[id];
    if (!d) return false;
    def = d;
    passos = copiarPassos(def);
    comecar(false);
    return true;
  }

  /* Cena de dica (botão Dica): a mesma tela do tutorial, mas sem treino. Escurece, destaca onde
     está o problema e o Logi explica em uma frase curta. Não mexe no jogo, não conta pontos nem
     erros e não marca tutorial como visto.
     cena = { comodo, passos: [{ destaque | alvo (seletor ou elementos), fala, palavraChave,
              estadoLogi, audiodescricao, evitar }] } */
  function dica(cena) {
    if (T.ativo || !pagina || !cena || !cena.passos || !cena.passos.length) return false;
    if (pagina.ocupado && pagina.ocupado()) return false;
    if ($$('.modal-overlay').some(m => getComputedStyle(m).display !== 'none')) return false;
    def = { id: 'dica', comodo: cena.comodo };
    passos = cena.passos.map((p, i) => normalizar(Object.assign({ estadoLogi: 'dica', entra: i === 0 }, p)));
    comecar(true);
    return true;
  }

  function comecar(ehDica) {
    modoDica = ehDica;
    montarUI();
    /* A cor do balão acompanha o cômodo (ver tutorial.css) */
    ui.raiz.dataset.comodo = String(def.comodo || pagina.comodo || '').toLowerCase();
    ui.raiz.classList.toggle('tut--dica', ehDica);
    ui.etiqueta.hidden = !ehDica;
    ui.pular.innerHTML = ehDica ? `${SVG_FECHAR}<span>Fechar</span>` : `${SVG_PULAR}<span>Pular</span>`;
    focoAnterior = document.activeElement;
    if (!ehDica) { try { pagina.preparar && pagina.preparar(def); } catch (x) { console.error(x); } }
    T.ativo = true;
    espera = null;
    esperaOk = null;
    confirmando = false;
    emErro = false;
    destaqueTemp = undefined;
    buracoAtual = null;
    escondeConfirmacao();
    ui.raiz.hidden = false;
    ui.raiz.classList.remove('tut--saindo', 'tut--forte');
    void ui.raiz.offsetWidth;
    ui.raiz.classList.add('tut--on');
    document.body.classList.add('tut-aberto');
    window.addEventListener('keydown', aoTecla, true);
    window.addEventListener('resize', agendarReposicao);
    window.addEventListener('scroll', agendarReposicao, true);
    rodar(0);
    return true;
  }

  function reiniciar() {
    if (!T.ativo || modoDica) return;
    gen++;
    cancelarEsperas();
    erroTk++;
    emErro = false;
    destaqueTemp = undefined;
    limparInatividade();
    maoSome();
    escondeConfirmacao();
    passos = copiarPassos(def);
    try { pagina.restaurar && pagina.restaurar(); } catch (x) { console.error(x); }
    try { pagina.preparar && pagina.preparar(def); } catch (x) { console.error(x); }
    rodar(0);
  }

  function fechar(opcoes = {}) {
    if (!T.ativo) return;
    const eraDica = modoDica;
    bloqueioAuto = Date.now() + 1500;
    if (!eraDica) { try { gameState.marcarTutorialVisto(def.id); } catch {} }
    modoDica = false;
    emErro = false;
    destaqueTemp = undefined;
    gen++;
    cancelarEsperas();
    erroTk++;
    tweenTk++;
    limparInatividade();
    T.ativo = false;
    atual = null;
    confirmando = false;
    maoSome();
    desisolar();
    descrever([]);
    window.removeEventListener('keydown', aoTecla, true);
    window.removeEventListener('resize', agendarReposicao);
    window.removeEventListener('scroll', agendarReposicao, true);
    ui.raiz.classList.remove('tut--on');
    ui.raiz.classList.add('tut--saindo');
    setTimeout(() => {
      if (!T.ativo && ui) { ui.raiz.hidden = true; ui.raiz.classList.remove('tut--saindo'); escondeConfirmacao(); }
    }, 170);
    document.body.classList.remove('tut-aberto');
    /* A dica não trocou nada no jogo, então não há o que restaurar */
    if (!eraDica) { try { pagina.restaurar && pagina.restaurar(); } catch (x) { console.error(x); } }
    atualizarBotaoAjuda();

    /* Foco volta para o primeiro elemento da fase (na dica, para o botão Dica) */
    window.setTimeout(() => {
      let alvo = null;
      if (eraDica && focoAnterior && document.contains(focoAnterior)) alvo = focoAnterior;
      if (!alvo) { try { alvo = pagina.primeiroFoco && pagina.primeiroFoco(); } catch {} }
      if (!alvo && focoAnterior && document.contains(focoAnterior)) alvo = focoAnterior;
      if (!alvo) alvo = document.querySelector('[tabindex="0"], button:not([disabled])');
      try { alvo && alvo.focus(); } catch {}
    }, 30);
    anunciarFora(eraDica ? 'Dica fechada.' : opcoes.pulado ? 'Tutorial pulado.' : 'Tutorial concluído. A fase começa.');
  }

  /* A região viva do overlay some ao fechar; usa uma região própria */
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
      btn.textContent = 'Ver o tutorial do Logi';
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
    document.addEventListener('keydown', aoTeclaFora);
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
    registrar, configurar, auto, abrir, fechar, tentar, dica,
    get ativo() { return T.ativo; },
    tratamento: TRATAMENTO,
    tratar,
    tem: id => Boolean(registro[id]),
  };
})();

/* Permite que as páginas usem window.Tutorial?.ativo sem erro */
window.Tutorial = Tutorial;
