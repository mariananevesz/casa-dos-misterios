/* =============================================================
   preferencias.js — tela "Minhas preferências"
   Menu lateral (Áudio, Tela, Letras, Atalhos, Logi, Progresso) e,
   ao lado, o painel da seção escolhida. Tudo é salvo na hora em
   gameState (settings) e aplicado em todas as páginas por
   aplicarConfiguracoes() (gameState.js) e audio.js.

   Uso nas páginas:
     <link rel="stylesheet" href=".../css/preferencias.css">
     <script src=".../js/preferencias.js"></script>
     Preferencias.ligar(botao)   // botão que abre a tela (opcional)
     Preferencias.abrir()        // também abre com Alt+A (plataforma.js)

   Para criar uma nova opção: acrescente a chave em DEFAULT_STATE
   (gameState.js), use-a onde ela vale e inclua um item em SECOES.
   ============================================================= */
const Preferencias = (() => {
  'use strict';

  const BASE = (() => {
    try { return new URL('../', document.currentScript.src).href; } catch { return 'assets/'; }
  })();
  const img = f => BASE + 'img/' + encodeURIComponent(f);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cfg = () => gameState.getSettings();

  const TAMANHOS = { valores: [100, 120, 140], rotulos: ['Padrão', 'Maior', 'Muito maior'] };
  const FONTES = [
    { v: 'padrao',    nome: 'Padrão do jogo',  fam: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { v: 'simples',   nome: 'Simples',         fam: 'Arial, Helvetica, sans-serif' },
    { v: 'ampla',     nome: 'Ampla',           fam: 'Verdana, Geneva, sans-serif' },
    { v: 'divertida', nome: 'Divertida',       fam: "'Comic Sans MS', 'Comic Neue', 'Chalkboard SE', cursive, sans-serif" }
  ];
  const COMODOS = [['sala', 'Sala'], ['quarto', 'Quarto'], ['cozinha', 'Cozinha'], ['despensa', 'Despensa']];
  const BNCC = { sala: 'EF02CO02', quarto: 'EF02CO02', cozinha: 'EF03CO01', despensa: 'EF02CO01' };

  /* ============================================================
     Conteúdo: cada item vira uma linha do painel
     tipos: toggle, slider, opcoes, nome, testes, preview, atalhos,
            acao, resumo, texto
     ============================================================ */
  const SECOES = [
    { id: 'audio', ico: '🔊', nome: 'Áudio', fala: 'Ajuste os sons do jeito que fica bom para você!',
      itens: [
        { t: 'toggle', k: 'somAtivado', titulo: 'Efeitos sonoros', desc: 'Os sons de clique, acerto e erro.' },
        { t: 'slider', k: 'volumeSom', titulo: 'Volume dos efeitos', min: 0, max: 10, dep: 'somAtivado', fmt: v => (v === 0 ? 'Mudo' : String(v)) },
        { t: 'testes' },
        { t: 'linha' },
        { t: 'toggle', k: 'musicaAtivada', titulo: 'Música de fundo', desc: 'A musiquinha que toca enquanto você joga.' },
        { t: 'slider', k: 'volumeMusica', titulo: 'Volume da música', min: 0, max: 10, dep: 'musicaAtivada', fmt: v => (v === 0 ? 'Mudo' : String(v)) }
      ] },
    { id: 'tela', ico: '🖥️', nome: 'Tela', fala: 'Deixe a tela mais confortável para os seus olhos.',
      itens: [
        { t: 'toggle', k: 'altoContraste', titulo: 'Alto contraste', desc: 'Cores fortes (preto, branco e amarelo) para enxergar melhor textos, botões e blocos.' },
        { t: 'toggle', k: 'reduzMovimento', titulo: 'Menos movimento', desc: 'Para as animações: balanços, pulinhos e brilhos. O jogo também respeita o pedido do seu aparelho.' }
      ] },
    { id: 'letras', ico: '🔤', nome: 'Letras', fala: 'Escolha o tamanho e o tipo de letra mais fáceis de ler.',
      itens: [
        { t: 'slider', k: 'tamanhoFonte', titulo: 'Tamanho das letras', desc: 'Aumenta todos os textos do jogo.', valores: TAMANHOS.valores, rotulos: TAMANHOS.rotulos },
        { t: 'linha' },
        { t: 'opcoes', k: 'fonte', titulo: 'Tipo de letra', desc: 'Escolha o desenho das letras. Todas são fáceis de ler.', opcoes: FONTES },
        { t: 'linha' },
        { t: 'toggle', k: 'espacoTexto', titulo: 'Mais espaço no texto', desc: 'Afasta um pouco as letras, as palavras e as linhas. Ajuda a ler com calma.' },
        { t: 'preview' }
      ] },
    { id: 'atalhos', ico: '⌨️', nome: 'Atalhos', fala: 'Teclas rápidas para quem joga com o teclado.',
      itens: [
        { t: 'toggle', k: 'atalhos', titulo: 'Teclas de atalho do jogo', desc: 'Liga as teclas V, F (Cozinha) e R (rever o treino). Desligue se apertar sem querer.' },
        { t: 'atalhos' }
      ] },
    { id: 'logi', ico: '🤖', nome: 'Logi', fala: 'Eu sou o Logi! Quer me dizer o seu nome?',
      itens: [
        { t: 'nome', k: 'nome', titulo: 'Como o Logi chama você', desc: 'Escreva o seu nome ou um apelido. O Logi vai usar nas conversas e nos treinos.' },
        { t: 'linha' },
        { t: 'toggle', k: 'treinoAuto', titulo: 'Treino do Logi nas fases novas', desc: 'Na primeira vez em cada fase, o Logi faz um treino com você. Desligue se já sabe jogar.' },
        { t: 'acao', id: 'rever', titulo: 'Rever todos os treinos', desc: 'Faz o Logi explicar de novo cada fase, como se fosse a primeira vez.', rotulo: '↻ Rever os treinos', confirma: 'Tem certeza? Toque de novo' }
      ] },
    { id: 'progresso', ico: '💾', nome: 'Progresso', fala: 'Aqui você vê as suas estrelas e pode recomeçar.',
      itens: [
        { t: 'resumo' },
        { t: 'linha' },
        { t: 'acao', id: 'reiniciar', titulo: 'Reiniciar progresso', desc: 'Apaga os pontos e as estrelas e fecha os cômodos de novo. Suas preferências ficam.', rotulo: '↻ Recomeçar o jogo', confirma: 'Apagar tudo? Toque de novo', perigo: true },
        { t: 'acao', id: 'padrao', titulo: 'Restaurar preferências', desc: 'Volta o som, as letras e a tela para como eram no começo.', rotulo: '↺ Voltar ao padrão', confirma: 'Voltar ao padrão? Toque de novo' },
        { t: 'linha' },
        { t: 'sobre' }
      ] }
  ];

  const ATALHOS = [
    { grupo: 'Em todo o jogo', itens: [
      [['Tab'], 'Ir para o próximo botão'], [['Shift', 'Tab'], 'Voltar para o botão anterior'],
      [['Enter'], 'Escolher ou confirmar (também a tecla Espaço)'], [['Esc'], 'Fechar a janela ou sair do cômodo'],
      [['Alt', 'A'], 'Abrir estas preferências'] ] },
    { grupo: 'Dentro dos cômodos', itens: [
      [['R'], 'Rever o treino do Logi'], [['V'], 'Verdadeiro (Cozinha)'], [['F'], 'Falso (Cozinha)'],
      [['Delete'], 'Tirar o bloco em foco (Sala e Quarto; também Backspace)'] ] },
    { grupo: 'No "Como jogar"', itens: [
      [['←'], 'Aba anterior'], [['→'], 'Próxima aba'] ] }
  ];

  /* ============================================================
     Montagem
     ============================================================ */
  let raiz = null, aberto = false, acionador = null, secaoAtual = 'audio', statusTimer = 0;
  const pendentes = {};   /* botões de duplo toque (confirmar ação) */

  function linhaToggle(i) {
    return `<div class="pref-linha" data-chave="${i.k}">
      <div class="pref-linha__txt"><label class="pref-titulo" id="pl-${i.k}">${esc(i.titulo)}</label><p class="pref-desc">${esc(i.desc || '')}</p></div>
      <button type="button" class="toggle-btn pref-toggle" role="switch" id="pt-${i.k}" data-toggle="${i.k}" aria-labelledby="pl-${i.k}" aria-checked="false"><span class="toggle-thumb"></span><span class="pref-toggle__txt" aria-hidden="true"></span></button>
    </div>`;
  }

  function linhaSlider(i) {
    const n = i.valores ? i.valores.length - 1 : i.max - i.min;
    const dots = Array.from({ length: n + 1 }, () => '<i></i>').join('');
    return `<div class="pref-linha pref-linha--coluna" data-chave="${i.k}" ${i.dep ? `data-dep="${i.dep}"` : ''}>
      <div class="pref-linha__txt"><label class="pref-titulo" id="pl-${i.k}" for="ps-${i.k}">${esc(i.titulo)}</label>${i.desc ? `<p class="pref-desc">${esc(i.desc)}</p>` : ''}</div>
      <div class="pref-slider">
        <button type="button" class="pref-mm" data-passo="-1" data-slider="${i.k}" aria-label="Diminuir: ${esc(i.titulo)}">−</button>
        <div class="pref-trilho"><div class="pref-pontos" aria-hidden="true">${dots}</div>
          <input type="range" class="pref-range" id="ps-${i.k}" data-slider-input="${i.k}" min="${i.valores ? 0 : i.min}" max="${i.valores ? n : i.max}" step="1" aria-labelledby="pl-${i.k}"></div>
        <button type="button" class="pref-mm" data-passo="1" data-slider="${i.k}" aria-label="Aumentar: ${esc(i.titulo)}">+</button>
      </div>
      <p class="pref-valor" id="pv-${i.k}" aria-live="polite"></p>
    </div>`;
  }

  function linhaOpcoes(i) {
    return `<div class="pref-linha pref-linha--coluna" data-chave="${i.k}">
      <div class="pref-linha__txt"><span class="pref-titulo" id="pl-${i.k}">${esc(i.titulo)}</span><p class="pref-desc">${esc(i.desc)}</p></div>
      <div class="pref-opcoes" role="radiogroup" aria-labelledby="pl-${i.k}">${i.opcoes.map(o =>
        `<button type="button" class="pref-opcao" role="radio" aria-checked="false" data-opcao="${i.k}" data-v="${o.v}">
          <span class="pref-amostra" style="font-family:${o.fam}">Aa</span><span class="pref-opcao__nome">${esc(o.nome)}</span></button>`).join('')}</div>
    </div>`;
  }

  function linhaNome(i) {
    return `<div class="pref-linha pref-linha--coluna" data-chave="${i.k}">
      <div class="pref-linha__txt"><label class="pref-titulo" for="pn-${i.k}">${esc(i.titulo)}</label><p class="pref-desc">${esc(i.desc)}</p></div>
      <input type="text" class="pref-texto" id="pn-${i.k}" maxlength="14" autocomplete="off" spellcheck="false" placeholder="explorador" data-nome="${i.k}">
      <div class="pref-fala"><img src="${img('logi_feliz.png')}" alt=""><p id="pn-previa"></p></div>
    </div>`;
  }

  function linhaTestes() {
    return `<div class="pref-linha pref-linha--coluna"><div class="pref-testes">
      <span class="pref-desc" style="margin:0">Ouça como ficou:</span>
      <button type="button" class="pref-btn" data-teste="acerto">▶ Acerto</button>
      <button type="button" class="pref-btn" data-teste="erro">▶ Erro</button>
      <button type="button" class="pref-btn" data-teste="clique">▶ Clique</button></div></div>`;
  }

  function linhaPreview() {
    return `<div class="pref-preview" aria-label="Prévia do texto"><p class="pref-preview__rotulo">Prévia</p>
      <div class="pref-fala"><img src="${img('logi_feliz.png')}" alt=""><p id="pp-texto"></p></div>
      <div class="pref-preview__blocos"><span class="pp-bloco">↑ Cima</span><span class="pp-bloco pp-bloco--ambar">↻ Repetir 2x</span><span class="pp-bloco pp-bloco--verde">✓ Verificar</span></div></div>`;
  }

  function linhaAtalhos() {
    return ATALHOS.map(g => `<div class="pref-grupo"><h4>${esc(g.grupo)}</h4><ul class="pref-teclas">${g.itens.map(([ks, d]) =>
      `<li><span class="pref-teclas__ks">${ks.map((k, n) => (n ? '<b aria-hidden="true">+</b>' : '') + `<kbd>${esc(k)}</kbd>`).join('')}</span><span>${esc(d)}</span></li>`).join('')}</ul></div>`).join('');
  }

  function linhaAcao(i) {
    return `<div class="pref-linha"><div class="pref-linha__txt"><span class="pref-titulo">${esc(i.titulo)}</span><p class="pref-desc">${esc(i.desc)}</p></div>
      <button type="button" class="pref-btn${i.perigo ? ' pref-btn--perigo' : ''}" data-acao="${i.id}" data-rotulo="${esc(i.rotulo)}" data-confirma="${esc(i.confirma)}">${esc(i.rotulo)}</button></div>`;
  }

  function linhaResumo() {
    return `<div class="pref-resumo" id="pref-resumo"></div>`;
  }

  function linhaSobre() {
    return `<div class="pref-sobre"><img src="${img('logi_feliz.png')}" alt="">
      <div><h4>Casa dos Mistérios</h4>
      <p>Jogo educativo de <strong>pensamento computacional</strong> para o 2º e o 3º ano do Ensino Fundamental. Em cada cômodo, um desafio:</p>
      <ul>${COMODOS.map(([id, nome]) => `<li><img src="${img('icone-' + id + '.png')}" alt=""> <strong>${nome}</strong> · habilidade BNCC ${BNCC[id]}</li>`).join('')}</ul>
      <p class="pref-desc">Projeto acadêmico da Fatec (2026).</p></div></div>`;
  }

  const MONTA = { toggle: linhaToggle, slider: linhaSlider, opcoes: linhaOpcoes, nome: linhaNome, testes: linhaTestes, preview: linhaPreview,
    atalhos: linhaAtalhos, acao: linhaAcao, resumo: linhaResumo, sobre: linhaSobre, linha: () => '<hr class="pref-sep">' };

  function construir() {
    if (raiz) return;
    raiz = document.createElement('div');
    raiz.className = 'modal-overlay pref-overlay';
    raiz.id = 'modal-config';
    raiz.setAttribute('role', 'dialog');
    raiz.setAttribute('aria-modal', 'true');
    raiz.setAttribute('aria-labelledby', 'pref-titulo');
    raiz.style.display = 'none';
    raiz.innerHTML = `
      <div class="pref">
        <header class="pref-topo">
          <h2 id="pref-titulo">Minhas preferências</h2>
          <button type="button" class="modal-fechar pref-fechar" id="pref-fechar" aria-label="Fechar preferências">✕</button>
        </header>
        <div class="pref-corpo">
          <aside class="pref-lateral">
            <nav class="pref-menu" role="tablist" aria-orientation="vertical" aria-label="Seções das preferências">${SECOES.map(s =>
              `<button type="button" class="pref-aba" role="tab" id="pa-${s.id}" aria-controls="pp-${s.id}" data-secao="${s.id}"><span class="pref-aba__ico" aria-hidden="true">${s.ico}</span><span>${s.nome}</span></button>`).join('')}</nav>
            <div class="pref-logi" aria-live="polite"><div class="pref-logi__balao"><p id="pref-logi-fala"></p></div><img src="${img('logi_feliz.png')}" alt=""></div>
          </aside>
          <main class="pref-painel">${SECOES.map(s =>
            `<section class="pref-secao" role="tabpanel" id="pp-${s.id}" aria-labelledby="pa-${s.id}" hidden>
              <h3 class="pref-secao__titulo"><span aria-hidden="true">${s.ico}</span> ${s.nome}</h3>${s.itens.map(i => MONTA[i.t](i)).join('')}</section>`).join('')}
          </main>
        </div>
        <footer class="pref-rodape"><span class="pref-status" id="pref-status" role="status" aria-live="polite">As mudanças são salvas sozinhas.</span>
          <button type="button" class="pref-btn pref-btn--ouro" id="pref-pronto">Pronto!</button></footer>
      </div>`;
    document.body.appendChild(raiz);
    ligarEventos();
    sincronizar();
  }

  /* ============================================================
     Estado ↔ controles
     ============================================================ */
  function salvar(patch) {
    gameState.updateSettings(patch);
    aplicarConfiguracoes();
    if ('musicaAtivada' in patch || 'volumeMusica' in patch) { try { audio.sincronizarConfiguracoes(); } catch {} }
    sincronizar();
    mostrarStatus('Salvo ✓');
    document.dispatchEvent(new CustomEvent('preferencias:mudou', { detail: cfg() }));
  }

  function mostrarStatus(txt) {
    const el = raiz?.querySelector('#pref-status');
    if (!el) return;
    el.textContent = txt;
    el.classList.add('pref-status--ok');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { el.textContent = 'As mudanças são salvas sozinhas.'; el.classList.remove('pref-status--ok'); }, 1800);
  }

  function itemPorChave(k) { return SECOES.flatMap(s => s.itens).find(i => i.k === k); }

  function sincronizar() {
    if (!raiz) return;
    const c = cfg();
    /* interruptores */
    raiz.querySelectorAll('[data-toggle]').forEach(b => {
      const on = c[b.dataset.toggle] !== false && Boolean(c[b.dataset.toggle]);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.classList.toggle('toggle-btn--on', on);
      b.querySelector('.pref-toggle__txt').textContent = on ? 'Sim' : 'Não';
    });
    /* sliders */
    raiz.querySelectorAll('[data-slider-input]').forEach(inp => {
      const i = itemPorChave(inp.dataset.sliderInput);
      const idx = i.valores ? Math.max(0, i.valores.indexOf(Number(c[i.k]))) : Number(c[i.k]);
      inp.value = String(idx);
      const pct = ((idx - Number(inp.min)) / (Number(inp.max) - Number(inp.min))) * 100;
      inp.style.setProperty('--pct', pct + '%');
      const txt = i.valores ? `${i.rotulos[idx]} (${i.valores[idx]}%)` : i.fmt(idx);
      inp.setAttribute('aria-valuetext', txt);
      raiz.querySelector('#pv-' + i.k).textContent = txt;
      const mm = raiz.querySelectorAll(`[data-slider="${i.k}"]`);
      mm[0].setAttribute('aria-disabled', idx <= Number(inp.min) ? 'true' : 'false');
      mm[1].setAttribute('aria-disabled', idx >= Number(inp.max) ? 'true' : 'false');
    });
    /* sliders que dependem de um interruptor */
    raiz.querySelectorAll('[data-dep]').forEach(l => l.classList.toggle('pref-linha--apagada', !c[l.dataset.dep]));
    /* opções */
    raiz.querySelectorAll('[data-opcao]').forEach(b => {
      const sel = (c[b.dataset.opcao] || 'padrao') === b.dataset.v;
      b.setAttribute('aria-checked', sel ? 'true' : 'false');
      b.classList.toggle('pref-opcao--sel', sel);
      b.tabIndex = sel ? 0 : -1;
    });
    /* nome e prévias */
    const nome = String(c.nome || '').trim();
    const campo = raiz.querySelector('#pn-nome');
    if (campo && document.activeElement !== campo) campo.value = c.nome || '';
    const tratamento = nome || 'explorador';
    const previaNome = raiz.querySelector('#pn-previa');
    if (previaNome) previaNome.textContent = `Oi, ${tratamento}! Vamos achar a estrela?`;
    const previaTexto = raiz.querySelector('#pp-texto');
    if (previaTexto) previaTexto.textContent = `Oi, ${tratamento}! Leve o robô até a estrela.`;
    resumo();
  }

  function resumo() {
    const el = raiz?.querySelector('#pref-resumo');
    if (!el) return;
    const st = gameState.get();
    let total = 0;
    const linhas = COMODOS.map(([id, nome]) => {
      const pts = st.scores[id];
      total += pts || 0;
      const est = st.completed[id] ? gameState.getStars(pts) : 0;
      return `<div class="pref-resumo__item"><img src="${img('icone-' + id + '.png')}" alt=""><strong>${nome}</strong>
        <span class="pref-resumo__est" aria-label="${est} de 3 estrelas">${[0, 1, 2].map(n => `<img src="${img('estrela.png')}" alt="" class="${n < est ? '' : 'pref-vazia'}">`).join('')}</span>
        <span>${st.completed[id] ? pts + ' pts' : 'ainda não'}</span></div>`;
    }).join('');
    el.innerHTML = `<h4>Suas estrelas</h4>${linhas}<p class="pref-resumo__total"><strong>${total}</strong> de 100 pontos</p>`;
  }

  /* ============================================================
     Eventos
     ============================================================ */
  function ir(id, foco) {
    secaoAtual = id;
    raiz.querySelectorAll('.pref-aba').forEach(a => {
      const on = a.dataset.secao === id;
      a.classList.toggle('pref-aba--ativa', on);
      a.setAttribute('aria-selected', on ? 'true' : 'false');
      a.tabIndex = on ? 0 : -1;
      if (on && foco) a.focus();
    });
    raiz.querySelectorAll('.pref-secao').forEach(s => { s.hidden = s.id !== 'pp-' + id; });
    raiz.querySelector('#pref-logi-fala').textContent = SECOES.find(s => s.id === id).fala;
    raiz.querySelector('.pref-painel').scrollTop = 0;
    if (id === 'progresso') resumo();
  }

  function mudarSlider(k, delta) {
    const i = itemPorChave(k), c = cfg();
    const max = i.valores ? i.valores.length - 1 : i.max, min = i.valores ? 0 : i.min;
    const atual = i.valores ? Math.max(0, i.valores.indexOf(Number(c[k]))) : Number(c[k]);
    definirSlider(k, Math.max(min, Math.min(max, atual + delta)));
  }
  function definirSlider(k, idx) {
    const i = itemPorChave(k);
    const valor = i.valores ? i.valores[idx] : idx;
    if (Number(cfg()[k]) === valor) return;
    salvar({ [k]: valor });
    if (k === 'volumeSom') { try { audio.clique(); } catch {} }
  }

  function duploToque(btn, executar) {
    const id = btn.dataset.acao;
    if (pendentes[id]) {
      clearTimeout(pendentes[id]);
      delete pendentes[id];
      btn.textContent = btn.dataset.rotulo;
      btn.classList.remove('pref-btn--confirma');
      executar();
      return;
    }
    btn.textContent = btn.dataset.confirma;
    btn.classList.add('pref-btn--confirma');
    pendentes[id] = setTimeout(() => {
      delete pendentes[id];
      btn.textContent = btn.dataset.rotulo;
      btn.classList.remove('pref-btn--confirma');
    }, 3500);
  }

  function ligarEventos() {
    raiz.addEventListener('click', e => {
      if (e.target === raiz) { fechar(); return; }
      const alvo = e.target.closest('button');
      if (!alvo) return;
      if (alvo.dataset.secao) return ir(alvo.dataset.secao);
      if (alvo.dataset.toggle) { const k = alvo.dataset.toggle; return salvar({ [k]: !cfg()[k] }); }
      if (alvo.dataset.slider) return mudarSlider(alvo.dataset.slider, Number(alvo.dataset.passo));
      if (alvo.dataset.opcao) return salvar({ [alvo.dataset.opcao]: alvo.dataset.v });
      if (alvo.dataset.teste) { try { audio[alvo.dataset.teste](); } catch {} return; }
      if (alvo.id === 'pref-fechar' || alvo.id === 'pref-pronto') return fechar();
      if (alvo.dataset.acao === 'rever') return duploToque(alvo, () => { gameState.limparTutoriaisVistos(); mostrarStatus('Os treinos voltam na próxima fase ✓'); });
      if (alvo.dataset.acao === 'reiniciar') return duploToque(alvo, () => {
        gameState.reset(); resumo(); mostrarStatus('Jogo reiniciado ✓');
        document.dispatchEvent(new CustomEvent('progresso:mudou'));
      });
      if (alvo.dataset.acao === 'padrao') return duploToque(alvo, () => {
        gameState.updateSettings(JSON.parse(JSON.stringify(DEFAULT_STATE.settings)));
        aplicarConfiguracoes(); try { audio.sincronizarConfiguracoes(); } catch {}
        sincronizar(); mostrarStatus('Preferências restauradas ✓');
        document.dispatchEvent(new CustomEvent('preferencias:mudou', { detail: cfg() }));
      });
    });
    raiz.addEventListener('input', e => {
      const t = e.target;
      if (t.dataset.sliderInput) definirSlider(t.dataset.sliderInput, Number(t.value));
      if (t.dataset.nome) {
        const limpo = t.value.replace(/[^\p{L} '-]/gu, '').slice(0, 14);
        if (limpo !== t.value) t.value = limpo;
        salvar({ nome: limpo });
      }
    });
    /* Teclado: setas no menu lateral e nas opções de letra */
    raiz.addEventListener('keydown', e => {
      const aba = e.target.closest?.('.pref-aba');
      if (aba && ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
        const ids = SECOES.map(s => s.id), i = ids.indexOf(aba.dataset.secao);
        const novo = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1
          : (i + (/Down|Right/.test(e.key) ? 1 : -1) + ids.length) % ids.length;
        e.preventDefault(); ir(ids[novo], true);
      }
      const op = e.target.closest?.('.pref-opcao');
      if (op && /Arrow/.test(e.key)) {
        const lista = [...op.parentElement.querySelectorAll('.pref-opcao')], i = lista.indexOf(op);
        const novo = lista[(i + (/Down|Right/.test(e.key) ? 1 : -1) + lista.length) % lista.length];
        e.preventDefault(); novo.click(); novo.focus();
      }
      if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
      if (e.key === 'Tab') {
        const foc = [...raiz.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter(x => x.offsetParent !== null && x.tabIndex >= 0);
        if (!foc.length) return;
        const p = foc[0], u = foc[foc.length - 1];
        if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
        else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
      }
    });
  }

  /* ============================================================
     API
     ============================================================ */
  function abrir(quem, secao) {
    if (aberto || window.Tutorial?.ativo) return;
    construir();
    aberto = true;
    acionador = quem instanceof Element ? quem : document.activeElement;
    acionador?.setAttribute?.('aria-expanded', 'true');
    raiz.style.display = 'flex';
    sincronizar();
    ir(secao || secaoAtual);
    document.body.classList.add('pref-aberto');
    requestAnimationFrame(() => raiz.querySelector('.pref-aba--ativa')?.focus());
  }

  function fechar() {
    if (!aberto) return;
    aberto = false;
    raiz.style.display = 'none';
    document.body.classList.remove('pref-aberto');
    acionador?.setAttribute?.('aria-expanded', 'false');
    acionador?.focus?.();
    acionador = null;
  }

  function ligar(botao) {
    if (!botao) return;
    botao.setAttribute('aria-controls', 'modal-config');
    botao.setAttribute('aria-haspopup', 'dialog');
    botao.setAttribute('aria-expanded', 'false');
    botao.addEventListener('click', () => abrir(botao));
  }

  return { abrir, fechar, ligar, ir: id => { if (raiz) ir(id); else secaoAtual = id; }, get aberto() { return aberto; } };
})();

/* Permite que outras páginas usem window.Preferencias (ex.: Alt+A em plataforma.js) */
window.Preferencias = Preferencias;
