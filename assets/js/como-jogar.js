/* =============================================================
   como-jogar.js — guia "Como jogar" completo
   Usado na tela inicial (todas as abas) e no "?" de cada cômodo.

   Em vez de demonstrações inventadas, o guia usa os TUTORIAIS REAIS
   do jogo (assets/js/tutoriais/*.js, lidos por Tutorial.obter): a fala
   do Logi de cada passo vem de lá. Cada quadro tem 3 partes:
     1) a fala do Logi, 2) a tela em miniatura (com o destaque que o
     tutorial usa) e 3) a explicação logo abaixo.

   Para mudar um texto de explicação, edite FRAMES. Para mudar uma
   fala do Logi, edite o próprio tutorial.
   ============================================================= */
const ComoJogar = (() => {
  'use strict';

  const BASE = (() => {
    try { return new URL('../', document.currentScript.src).href; } catch { return 'assets/'; }
  })();
  const img = f => BASE + 'img/' + encodeURIComponent(f);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* **negrito** e __destaque__ nas explicações */
  const md = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<em>$1</em>');
  const $ = (el, sel) => el.querySelector(sel);

  const LAMPADA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 21h6M10 17.5h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2v.6h5v-.6c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="#FFF3B0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ============================================================
     Botões e blocos como aparecem no jogo (legenda de comandos)
     ============================================================ */
  const VB = {
    mapa:     '<span class="cj-vb cj-vb--outline">← Mapa</span>',
    ajuda:    '<span class="cj-vb cj-vb--redondo">?</span>',
    som:      '<span class="cj-vb cj-vb--redondo">🔊</span>',
    pts:      () => `<span class="cj-vb cj-vb--pts"><img src="${img('estrela.png')}" alt=""> 25 pts</span>`,
    dica:     `<span class="cj-vb cj-vb--dica">${LAMPADA} Dica</span>`,
    limpar:   '<span class="cj-vb cj-vb--outline">↻ Limpar</span>',
    executar: '<span class="cj-vb cj-vb--laranja">▶ Executar</span>',
    verificar:'<span class="cj-vb cj-vb--roxo">✓ Verificar</span>',
    confirmar:'<span class="cj-vb cj-vb--marrom">✓ Confirmar!</span>',
    proxima:  '<span class="cj-vb cj-vb--verde">Próxima →</span>',
    verdadeiro: () => `<span class="cj-vb cj-vb--verde"><img src="${img('verdadeiro.png')}" alt=""> Verdadeiro</span>`,
    falso:      () => `<span class="cj-vb cj-vb--vermelho"><img src="${img('falso.png')}" alt=""> Falso</span>`,
    ver:      '<span class="cj-vb cj-vb--outline">↻ Ver de novo</span>',
    pular:    '<span class="cj-vb cj-vb--outline">⏭ Pular</span>'
  };
  const vb = k => (typeof VB[k] === 'function' ? VB[k]() : VB[k]);
  const cartaVis = (nome, arq) => `<span class="cj-vb cj-vb--card"><img src="${img(arq)}" alt="" style="width:26px;height:26px">${nome}</span>`;

  /* ============================================================
     Telas em miniatura (imitam as telas reais)
     ============================================================ */
  const SEM_MAO = new Set(['botoes', 'seq', 'prateleira', 'frase', 'grade']);

  /* Atributos de uma peça da tela. `chaves` pode ser um texto ou uma lista:
     a peça fica acesa se alguma delas estiver em `c.foco` */
  function A(c, chaves, cls = '') {
    const foco = [].concat(c.foco || []);
    const on = [].concat(chaves).some(k => foco.includes(k));
    const mao = on && c.mao && ![].concat(chaves).some(k => SEM_MAO.has(k));
    return `class="cj-alvo ${cls}${on ? ' cj-foco' : ''}${mao ? ' cj-foco--toque' : ''}"`;
  }
  const telaAbre = (c, comodo) => `<div class="cj-tela cj-cor-${comodo}${c.foco ? ' cj-tela--foco' : ''}" role="img" aria-label="${esc(c.alt || 'Tela do jogo')}">`;
  const topo = (comodo, titulo) =>
    `<div class="cj-topo"><img src="${img('icone-' + comodo + '.png')}" alt=""><span>${esc(titulo)}</span><span class="cj-pts">0 pts</span></div>`;

  /* ---- Sala ---- */
  const SETA = { cima: '↑ Cima', baixo: '↓ Baixo', esq: '← Esq', dir: '→ Dir', repetir2: '↻ Repetir 2x' };
  function telaSala(c) {
    const g = c.grade, n = g.n || 4;
    const trilha = (g.trilha || []).map(String);
    let cel = '';
    for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) {
      const star = g.estrela[0] === r && g.estrela[1] === k;
      const robo = g.robo[0] === r && g.robo[1] === k;
      const obst = (g.obst || []).some(o => o[0] === r && o[1] === k);
      const cls = `cj-cel${trilha.includes(`${r},${k}`) ? ' cj-cel--trilha' : ''}${star ? ' cj-cel--alvo' : ''}`;
      cel += `<div ${star ? A(c, 'alvo', cls) : `class="${cls}"`}>` +
        (star ? `<img src="${img('estrela.png')}" alt="">` : '') +
        (obst ? `<img src="${img('obstaculo.png')}" alt="">` : '') +
        (robo ? `<img class="cj-robo" src="${img('logi_feliz.png')}" alt="">` : '') + '</div>';
    }
    const ids = ['cima', 'baixo', 'esq', 'dir'].concat(c.repetir ? ['repetir2'] : []);
    const blocos = ids.map(id => `<span ${A(c, 'bloco-' + id, 'cj-bl' + (id === 'repetir2' ? ' cj-bl--ambar' : ''))}>${SETA[id]}</span>`).join('');
    let slots = '';
    for (let i = 0; i < c.max; i++) {
      slots += c.seq[i]
        ? `<span class="cj-bl${c.seq[i] === 'repetir2' ? ' cj-bl--ambar' : ''}">${SETA[c.seq[i]]}</span>`
        : `<span class="cj-bl cj-bl--vazio">${i + 1}</span>`;
    }
    return telaAbre(c, 'sala') + topo('sala', 'Sala · ' + c.fase) +
      `<div class="cj-par">
        <div><p class="cj-rotulo">Comandos</p><div class="cj-caixa"><div class="cj-linha">${blocos}</div>
          <div style="margin-top:6px"><span ${A(c, 'dica', 'cj-tb cj-tb--dica')}>${LAMPADA} Dica</span></div></div></div>
        <div><p class="cj-rotulo">Painel de comandos</p><div ${A(c, 'seq', 'cj-caixa cj-caixa--tracejada')}><div class="cj-linha">${slots}</div></div>
          <p class="cj-rotulo" style="margin-top:6px">Grade</p><div class="cj-grade" style="grid-template-columns:repeat(${n},1fr)">${cel}</div>
          <div class="cj-acoes-tela"><span class="cj-tb cj-tb--outline">↻ Limpar</span><span ${A(c, 'executar', 'cj-tb cj-tb--cor')}>▶ Executar</span></div></div>
      </div></div>`;
  }

  /* ---- Quarto ---- */
  const QL = {
    banho: '🛁 Tomar banho', camiseta: '👕 Vestir a camiseta', calca: '👖 Vestir a calça', meia: '🧦 Calçar a meia',
    tenis: '👟 Calçar o tênis', van: '🚐 Pegar a van', onibus: '🚌 Pegar o ônibus', bicicleta: '🚲 Ir de bicicleta',
    carro: '🚗 Entrar no carro', dormir: '😴 Dormir de novo', tv: '📺 Assistir TV', videogame: '🎮 Jogar videogame',
    parque: '🏞️ Ir ao parque', piscina: '🏊 Nadar na piscina', filme: '🎬 Ver um filme'
  };
  function telaQuarto(c) {
    const usados = [...c.seq];
    const fonte = c.fonte.map(b => {
      const o = typeof b === 'string' ? { id: b } : b;
      const k = usados.indexOf(o.base || o.id);
      const usado = !o.erro && k >= 0 && (usados.splice(k, 1), true);
      const cls = 'cj-bl cj-bl--lista' + (o.erro && c.mostrarErro !== false ? ' cj-bl--erro' : '') + (usado ? ' cj-bl--usado' : '');
      return `<span ${A(c, 'fonte-' + o.id, cls)}>${QL[o.base || o.id]}${o.erro && c.mostrarErro !== false ? ' <b>!</b>' : ''}</span>`;
    }).join('');
    let rotina = '';
    for (let i = 0; i < c.total; i++) {
      rotina += c.seq[i]
        ? `<span class="cj-bl cj-bl--lista${c.status === 'ok' ? ' cj-bl--ok' : ''}">${QL[c.seq[i]]}${c.status === 'ok' ? ' ✓' : ''}</span>`
        : `<span class="cj-bl cj-bl--lista cj-bl--vazio">${i === c.seq.length ? '+ bloco' : ''}</span>`;
    }
    return telaAbre(c, 'quarto') + topo('quarto', 'Quarto · ' + c.fase) +
      `<p class="cj-regra">Monte a rotina para IR À ESCOLA</p>
      <div class="cj-par">
        <div><p class="cj-rotulo">Passos</p><div class="cj-caixa"><div class="cj-lista-blocos">${fonte}</div>
          <div style="margin-top:6px"><span ${A(c, 'dica', 'cj-tb cj-tb--dica')}>${LAMPADA} Dica</span></div></div></div>
        <div><p class="cj-rotulo">Sua rotina</p><div ${A(c, 'seq', 'cj-caixa cj-caixa--tracejada')}><div class="cj-lista-blocos">${rotina}</div></div>
          <div class="cj-acoes-tela"><span class="cj-tb cj-tb--outline">↻ Limpar</span><span ${A(c, 'verificar', 'cj-tb cj-tb--cor')}>✓ Verificar</span></div></div>
      </div></div>`;
  }

  /* ---- Cozinha ---- */
  function telaCozinha(c) {
    const palavras = c.frase.split(/\s+/).map((w, i) => {
      const neg = /^(não|nunca|sempre|jamais)$/i.test(w.replace(/[.,!?]/g, ''));
      const cls = 'cj-palavra' + (neg ? ' cj-neg' : '') + (c.leitura ? ' cj-palavra--brilho' : '');
      const tag = neg ? `<span ${A(c, 'neg', cls)} style="animation-delay:${i * 0.7}s">${esc(w)}</span>`
                      : `<span class="${cls}" style="animation-delay:${i * 0.7}s">${esc(w)}</span>`;
      return tag;
    }).join(' ');
    const v = c.escolha === 'v', f = c.escolha === 'f';
    return telaAbre(c, 'cozinha') + topo('cozinha', 'Cozinha · ' + c.fase) +
      `<div class="cj-pergunta"><span class="cj-pergunta__n">${esc(c.numero || 'Pergunta 1 de 3')}</span>
        <p ${A(c, 'frase', 'cj-frase')}>${palavras}</p></div>
      <div ${A(c, 'botoes', 'cj-vf')}>
        <span ${A(c, 'v', 'cj-tb cj-tb--v' + (v ? ' cj-tb--escolhido' : ''))}><img src="${img('verdadeiro.png')}" alt=""> Verdadeiro</span>
        <span ${A(c, 'f', 'cj-tb cj-tb--f' + (f ? ' cj-tb--escolhido' : ''))}><img src="${img('falso.png')}" alt=""> Falso</span>
      </div>` +
      (c.feedback ? `<div class="cj-feedback cj-feedback--ok"><span>💡 ${esc(c.feedback)}</span><span ${A(c, 'proxima', 'cj-tb cj-tb--cor')}>Próxima →</span></div>` : '') +
      '</div>';
  }

  /* ---- Despensa ---- */
  const REGRA_DESP = {
    'selecao-cor': 'Clique nas frutas VERMELHAS!',
    'tamanho': 'Clique ou arraste por TAMANHO: do menor para o maior.',
    'selecao-sementes': 'Escolha apenas as frutas que têm SEMENTES por dentro.'
  };
  function telaDespensa(c) {
    const sel = c.sel || [], prat = c.prat || [];
    const cartas = c.itens.map(it => {
      const px = c.criterio === 'tamanho' ? 22 + (it.tamanho - 1) * 8 : 34;
      const cls = 'cj-carta' + (sel.includes(it.id) ? ' cj-carta--sel' : '') + (prat.includes(it.id) ? ' cj-carta--na-prat' : '');
      return `<span ${A(c, ['item-' + it.id].concat(sel.includes(it.id) ? ['sel'] : []), cls)}>${esc(it.nome)}<img src="${img(it.img)}" alt="" style="width:${px}px;height:${px}px"></span>`;
    }).join('');
    let prateleira = '';
    if (c.criterio !== 'selecao-cor') {
      let slots = '';
      for (let i = 0; i < c.slots; i++) {
        const it = c.itens.find(x => x.id === prat[i]);
        slots += it
          ? `<span class="cj-slot cj-slot--cheio${c.status === 'ok' ? ' cj-slot--ok' : ''}"><img src="${img(it.img)}" alt=""><small>${i + 1}º</small></span>`
          : `<span class="cj-slot">${i + 1}º</span>`;
      }
      const leg = c.criterio === 'tamanho' ? ['menor', 'maior'] : ['escolhas', c.slots + ' frutas'];
      prateleira = `<p class="cj-rotulo">Prateleira</p><div ${A(c, 'prateleira', 'cj-prat')}>${slots}</div>
        <div class="cj-leg"><span>${leg[0]}</span><span>${leg[1]}</span></div>`;
    }
    const itens = `<p class="cj-rotulo" style="margin-top:6px">Frutas</p><div class="cj-frutas">${cartas}</div>`;
    return telaAbre(c, 'despensa') + topo('despensa', 'Despensa · ' + c.fase) +
      `<p class="cj-regra">${esc(REGRA_DESP[c.criterio])}</p>` +
      (c.criterio === 'selecao-cor' ? itens : prateleira + itens) +
      `<div class="cj-acoes-tela"><span class="cj-tb cj-tb--outline">Limpar</span><span ${A(c, 'confirmar', 'cj-tb cj-tb--cor')}>✓ Confirmar!</span></div></div>`;
  }

  const TELAS = { sala: telaSala, quarto: telaQuarto, cozinha: telaCozinha, despensa: telaDespensa };

  /* ============================================================
     Quadros: um por passo de cada tutorial real do jogo
     (`cena` desenha a tela; `texto` é a explicação abaixo dela)
     ============================================================ */
  const G_SALA = { n: 4, robo: [3, 0], estrela: [2, 1] };
  const G_SALA3 = { n: 4, robo: [3, 0], estrela: [0, 0] };
  const FRUTAS_F1 = [
    { id: 'maca', nome: 'Maçã', img: 'maça.png' }, { id: 'banana', nome: 'Banana', img: 'banana.png' },
    { id: 'uva', nome: 'Uva', img: 'uva.png' }, { id: 'morango', nome: 'Morango', img: 'morango.png' },
    { id: 'mirtilo', nome: 'Mirtilo', img: 'mirtilo.png' }
  ];
  const FRUTAS_F2 = [
    { id: 'melancia', nome: 'Melancia', tamanho: 5, img: 'melancia.png' },
    { id: 'mirtilo', nome: 'Mirtilo', tamanho: 1, img: 'mirtilo.png' },
    { id: 'maca', nome: 'Maçã', tamanho: 3, img: 'maça.png' }
  ];
  const FRUTAS_F3 = [
    { id: 'abacaxi', nome: 'Abacaxi', img: 'abacaxi.png' }, { id: 'maca', nome: 'Maçã', img: 'maça.png' },
    { id: 'banana', nome: 'Banana', img: 'banana.png' }, { id: 'melancia', nome: 'Melancia', img: 'melancia.png' }
  ];
  const sala = (extra) => Object.assign({ comodo: 'sala', fase: 'Fase 1', max: 6 }, extra);
  const quartoF1 = extra => Object.assign({
    comodo: 'quarto', fase: 'Fase 1', total: 3, fonte: ['camiseta', { id: 'calcarep', base: 'calca', erro: true }, 'calca', 'tenis']
  }, extra);
  const coz = extra => Object.assign({ comodo: 'cozinha', fase: 'Fácil', frase: 'O gelo NUNCA é quente.', numero: 'Treino com o Logi' }, extra);
  const desp = (criterio, itens, extra) => Object.assign({ comodo: 'despensa', fase: criterio === 'selecao-cor' ? 'Fácil' : criterio === 'tamanho' ? 'Médio' : 'Difícil', criterio, itens }, extra);

  const FRAMES = {
    'sala-f1': [
      { cena: sala({ grade: G_SALA, seq: [], foco: 'bloco-cima' }),
        texto: 'Os **comandos** ficam na esquerda. Toque em **↑ Cima**: o bloco entra no primeiro espaço do **painel de comandos**. O robô precisa chegar na ⭐.' },
      { cena: sala({ grade: Object.assign({ trilha: [[2, 0], [2, 1]] }, G_SALA), seq: ['cima'], foco: 'bloco-dir' }),
        texto: 'Agora toque em **→ Dir**. Os blocos formam uma **fila**: o robô vai seguir na ordem, do primeiro ao último. A parte amarela da grade mostra o caminho.' },
      { cena: sala({ grade: Object.assign({ trilha: [[2, 0], [2, 1]] }, G_SALA), seq: ['cima', 'dir'], foco: 'executar' }),
        texto: 'Com a fila pronta, aperte **▶ Executar**. O robô começa a andar, **um passo para cada bloco**.' },
      { cena: sala({ grade: { n: 4, robo: [2, 1], estrela: [2, 1] }, seq: ['cima', 'dir'], foco: 'alvo' }),
        texto: 'O robô chegou na ⭐! **Chegar na estrela completa a fase.**' },
      { cena: sala({ grade: G_SALA, seq: ['cima', 'dir'], foco: 'dica' }),
        texto: 'Travou? Toque em **Dica**. O Logi mostra onde está o problema. Pedir dica **não tira pontos**.' }
    ],
    'sala-f3': [
      { cena: sala({ fase: 'Fase 3', max: 4, repetir: true, grade: G_SALA3, seq: [], foco: 'bloco-repetir2' }),
        texto: 'Na Fase 3 aparece um bloco novo: **↻ Repetir 2x**. Ele repete a seta anterior **mais 2 vezes**.' },
      { cena: sala({ fase: 'Fase 3', max: 4, repetir: true, grade: G_SALA3, seq: [], foco: 'bloco-cima' }),
        texto: 'Primeiro, a seta **↑ Cima**. O Repetir sempre vem **depois** de uma seta.' },
      { cena: sala({ fase: 'Fase 3', max: 4, repetir: true, grade: Object.assign({ trilha: [[2, 0], [1, 0], [0, 0]] }, G_SALA3), seq: ['cima'], foco: 'bloco-repetir2' }),
        texto: 'Agora toque em **↻ Repetir 2x**. A seta para cima passa a valer **3 vezes**: o caminho sobe 3 casas.' },
      { cena: sala({ fase: 'Fase 3', max: 4, repetir: true, grade: Object.assign({ trilha: [[2, 0], [1, 0], [0, 0]] }, G_SALA3), seq: ['cima', 'repetir2'], foco: 'executar' }),
        texto: 'Aperte **▶ Executar** e veja o robô subir.' },
      { cena: sala({ fase: 'Fase 3', max: 4, repetir: true, grade: { n: 4, robo: [0, 0], estrela: [0, 0] }, seq: ['cima', 'repetir2'], foco: 'seq' }),
        texto: 'Com só **2 blocos**, o robô andou **3 passos**! Na Fase 3 você tem poucos espaços, então o Repetir ajuda muito.' }
    ],
    'quarto-f1': [
      { cena: quartoF1({ seq: [], foco: 'fonte-camiseta' }),
        texto: 'À esquerda estão os passos para **ir à escola**. Toque em **Vestir a camiseta**: ela entra no primeiro espaço da rotina.' },
      { cena: quartoF1({ seq: ['camiseta'], foco: 'fonte-calcarep' }),
        texto: 'Olhe com atenção: tem **duas calças**. A vermelha está **repetida** e **fica de fora**. No jogo de verdade, o bloco que não combina fica vermelho quando você toca na **Dica**.' },
      { cena: quartoF1({ seq: ['camiseta'], foco: 'fonte-calca' }),
        texto: 'Toque na **calça** que não é vermelha.' },
      { cena: quartoF1({ seq: ['camiseta', 'calca'], foco: 'fonte-tenis' }),
        texto: 'Agora o **tênis**. Ele só vem **depois da calça e da meia**. Já a camiseta pode entrar em qualquer ponto.' },
      { cena: quartoF1({ seq: ['camiseta', 'calca', 'tenis'], foco: 'verificar' }),
        texto: 'Rotina pronta! Aperte **✓ Verificar**. Se algo estiver errado, o bloco fica **vermelho** e você troca de lugar. Se estiver certo, fica **verde** ✓.' }
    ],
    'cozinha-f1': [
      { cena: coz({ leitura: true, foco: 'frase' }),
        texto: 'O Logi **lê a frase** palavra por palavra. Leia junto, devagar: cada palavra acende na tela.' },
      { cena: coz({ foco: ['frase', 'neg'] }),
        texto: 'A palavra **NUNCA** (e também **não, sempre, jamais**) muda o sentido da frase. Ela fica **sublinhada em vermelho**. Preste atenção nela!' },
      { cena: coz({ foco: ['frase', 'botoes'] }),
        texto: 'Sua vez! Toque em **Verdadeiro** (verde, tecla **V**) ou **Falso** (vermelho, tecla **F**). Pense: o gelo nunca é quente? O gelo é frio, então é **Verdadeiro**.' },
      { cena: coz({ escolha: 'v', foco: 'v' }),
        texto: 'Acertou! Se você errar, o Logi explica o motivo e mostra **outra frase** para tentar de novo.' },
      { extra: 'Depois de responder', selo: '✅ No jogo de verdade',
        cena: coz({ fase: 'Fácil', numero: 'Fácil · Pergunta 1 de 3', frase: 'O sal NÃO é doce.', escolha: 'v', feedback: 'Correto! O sal tem sabor salgado, não doce.', foco: 'proxima' }),
        texto: 'Depois de responder, aparece o resultado com a explicação. A pergunta só muda quando **você** tocar em **Próxima →**. Leia com calma!' }
    ],
    'despensa-f1': [
      { cena: desp('selecao-cor', FRUTAS_F1, { sel: [], foco: 'item-maca' }),
        texto: 'A regra de hoje: só frutas **vermelhas**. Toque na **Maçã**: ela fica escolhida, com a borda destacada.' },
      { cena: desp('selecao-cor', FRUTAS_F1, { sel: ['maca'], foco: 'item-banana' }),
        texto: 'A **banana** é amarela, então fica de **fora**. Só as vermelhas entram.' },
      { cena: desp('selecao-cor', FRUTAS_F1, { sel: ['maca'], foco: 'item-morango' }),
        texto: 'Agora o **Morango**, que também é vermelho.' },
      { cena: desp('selecao-cor', FRUTAS_F1, { sel: ['maca', 'morango'], foco: 'sel' }),
        texto: 'As frutas escolhidas ficam destacadas. No jogo, depois é só apertar **✓ Confirmar!** para conferir.' }
    ],
    'despensa-f2': [
      { cena: desp('tamanho', FRUTAS_F2, { slots: 3, prat: [], foco: 'item-mirtilo' }),
        texto: 'Hoje as frutas vão para a **prateleira**, do **menor** ao **maior**. Toque no **Mirtilo**, o menor de todos. Você também pode **arrastar** a fruta.' },
      { cena: desp('tamanho', FRUTAS_F2, { slots: 3, prat: ['mirtilo'], foco: 'prateleira' }),
        texto: 'A prateleira tem uma casa para cada fruta. À esquerda fica o **menor**, à direita o **maior**.' },
      { cena: desp('tamanho', FRUTAS_F2, { slots: 3, prat: ['mirtilo'], foco: 'item-maca' }),
        texto: 'A menor que sobrou é a **Maçã**.' },
      { cena: desp('tamanho', FRUTAS_F2, { slots: 3, prat: ['mirtilo', 'maca'], foco: 'item-melancia' }),
        texto: 'Falta a **Melancia**, a maior de todas.' },
      { cena: desp('tamanho', FRUTAS_F2, { slots: 3, prat: ['mirtilo', 'maca', 'melancia'], status: 'ok', foco: 'prateleira' }),
        texto: 'Tudo certo: do menor ao maior! No jogo, aperte **✓ Confirmar!**. Tocar de novo numa fruta da prateleira **tira** ela de lá.' }
    ],
    'despensa-f3': [
      { cena: desp('selecao-sementes', FRUTAS_F3, { slots: 2, prat: [], foco: 'item-maca' }),
        texto: 'A regra: só frutas com **sementes por dentro**. A **Maçã** tem. Toque nela e ela vai para a prateleira. Também dá para arrastar.' },
      { cena: desp('selecao-sementes', FRUTAS_F3, { slots: 2, prat: ['maca'], foco: 'item-abacaxi' }),
        texto: 'O **abacaxi não tem sementes** por dentro. Ele fica de **fora**.' },
      { cena: desp('selecao-sementes', FRUTAS_F3, { slots: 2, prat: ['maca'], foco: 'item-melancia' }),
        texto: 'A **Melancia** também tem sementes por dentro.' },
      { cena: desp('selecao-sementes', FRUTAS_F3, { slots: 2, prat: ['maca', 'melancia'], status: 'ok', foco: 'prateleira' }),
        texto: 'Só as frutas com sementes estão na prateleira. No jogo, são **3 frutas** e você aperta **✓ Confirmar!**. Cuidado: o **morango** não conta, porque os pontinhos de fora não são sementes por dentro.' }
    ]
  };

  /* Exemplos resolvidos das fases que não têm tutorial próprio */
  const EXEMPLOS = {
    'sala-f2': { cena: sala({ fase: 'Fase 2', max: 8, grade: { n: 4, robo: [3, 0], estrela: [0, 3], obst: [[2, 1], [1, 1]], trilha: [[2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [0, 3]] }, seq: ['cima', 'cima', 'cima', 'dir', 'dir', 'dir'] }),
      texto: 'Um jeito de resolver: subir **3 casas** pela borda, onde não tem sofá, e depois ir **3 para a direita** até a ⭐. Os sofás ficam no meio do caminho: **bater neles é erro**.' },
    'quarto-f2': { cena: { comodo: 'quarto', fase: 'Fase 2', total: 5, status: 'ok', mostrarErro: true,
      fonte: ['banho', 'camiseta', 'calca', 'meia', 'tenis', { id: 'tv', erro: true }], seq: ['banho', 'calca', 'meia', 'tenis', 'camiseta'] },
      texto: 'Um jeito de resolver: **banho** primeiro, depois vestir (a **camiseta** pode vir em qualquer ponto, o **tênis** só depois da calça e da meia). A **TV** não combina com ir à escola e fica de fora.' },
    'quarto-f3': { cena: { comodo: 'quarto', fase: 'Fase 3', total: 6, status: 'ok', mostrarErro: true,
      fonte: ['banho', 'camiseta', 'calca', 'meia', 'tenis', 'onibus', { id: 'piscina', erro: true }], seq: ['banho', 'camiseta', 'meia', 'calca', 'tenis', 'onibus'] },
      texto: 'Um jeito de resolver: **banho**, depois vestir, e **por último** como você chega à escola (van, ônibus, bicicleta ou carro: muda a cada vez). A **piscina** não combina com a manhã de escola.' },
    'cozinha-medio': { cena: { comodo: 'cozinha', fase: 'Médio', numero: 'Médio · Pergunta 1 de 3', frase: 'O pão não é feito de farinha.', escolha: 'f', foco: 'f',
      feedback: 'Correto! O pão é feito principalmente de farinha de trigo.' },
      texto: 'No Médio, as frases têm **não, nunca ou jamais**. Aqui o pão é feito de farinha, então a frase está **errada**: a resposta é **Falso**.' },
    'cozinha-dificil': { cena: { comodo: 'cozinha', fase: 'Difícil', numero: 'Difícil · Pergunta 1 de 3', frase: 'O sal sempre deixa a comida doce.', escolha: 'f', foco: 'f',
      feedback: 'Correto! O sal deixa a comida salgada, não doce.' },
      texto: 'No Difícil, as frases usam **sempre** e **nunca**. Pense bem: o sal deixa a comida salgada, não doce. A resposta é **Falso**.' }
  };

  /* ============================================================
     Conteúdo de cada cômodo
     ============================================================ */
  const COMODOS = {
    sala: {
      nome: 'Sala', titulo: 'Sala — Algoritmos', sub: 'Mini-jogo 1 · Monte o caminho do robô',
      objetivo: 'Leve o robô até a estrela montando uma fila de blocos. Cada bloco é um passo!',
      comandos: [
        { v: '<span class="cj-vb cj-vb--laranja">↑ Cima</span>', t: 'Setas', d: 'Cima, baixo, esquerda e direita. Cada seta vale **1 passo**.' },
        { v: '<span class="cj-vb cj-vb--ambar">↻ Repetir 2x</span>', t: 'Repetir 2x', d: 'Só na **Fase 3**. Repete a seta anterior mais 2 vezes.' },
        { v: '<span class="cj-vb cj-vb--outline" style="border-style:dashed">1</span>', t: 'Painel de comandos', d: 'Onde os blocos entram, em fila. Toque num bloco montado para **tirar**.' },
        { v: vb('executar'), t: 'Executar', d: 'O robô anda seguindo a sua fila, passo a passo.' },
        { v: vb('limpar'), t: 'Limpar', d: 'Tira todos os blocos para você montar de novo.' },
        { v: vb('dica'), t: 'Dica', d: 'O Logi mostra o que ajustar. **Não tira pontos.**' },
        { v: `<img src="${img('estrela.png')}" alt="" style="width:30px;height:30px"> <img src="${img('obstaculo.png')}" alt="" style="width:30px;height:30px">`, t: 'Estrela e obstáculo', d: 'Chegue na **estrela** sem bater no **obstáculo**.' }
      ],
      fases: [
        { rotulo: 'Fase 1', nivel: 'Fácil', titulo: 'Primeiros passos', tutorial: 'sala-f1',
          resumo: 'Leve o robô até a estrela. Não tem obstáculos e você pode usar até **6 blocos**.',
          itens: ['Escolha as setas e monte a fila.', 'Aperte **Executar** e veja o robô andar.'] },
        { rotulo: 'Fase 2', nivel: 'Médio', titulo: 'Desvie do sofá', exemplo: 'sala-f2', usaTutorial: 0,
          resumo: 'Agora tem **sofás** no caminho! Você pode usar até **8 blocos**.',
          itens: ['Planeje o caminho **antes** de apertar Executar.', 'Bateu no sofá? O painel volta vazio e você tenta de novo (conta como 1 erro).'] },
        { rotulo: 'Fase 3', nivel: 'Difícil', titulo: 'Use poucos blocos', tutorial: 'sala-f3',
          resumo: 'Só **4 espaços**! Use o novo bloco **Repetir 2x** para andar mais com menos blocos.',
          itens: ['O Repetir vem **depois** de uma seta.', 'Pense: qual seta se repete?'] }
      ]
    },
    quarto: {
      nome: 'Quarto', titulo: 'Quarto — Depuração', sub: 'Mini-jogo 2 · Arrume a rotina para ir à escola',
      objetivo: 'Monte a rotina para ir à escola: deixe de fora o que não combina e coloque os passos na ordem certa.',
      comandos: [
        { v: '<span class="cj-vb cj-vb--roxo">👕 Camiseta</span>', t: 'Bloco de passo', d: 'Toque para colocar na rotina. Também dá para **arrastar**.' },
        { v: '<span class="cj-vb cj-vb--outline" style="border-style:dashed">+ bloco</span>', t: 'Sua rotina', d: 'A fila de passos. Toque num bloco montado para **tirar**.' },
        { v: '<span class="cj-vb cj-vb--erro">📺 TV <b>!</b></span>', t: 'Bloco vermelho', d: 'É um passo que **não combina** ou está **repetido**. Fica de fora.' },
        { v: vb('verificar'), t: 'Verificar', d: 'Confere a rotina. Certo fica **verde ✓**, errado fica **vermelho**.' },
        { v: vb('limpar'), t: 'Limpar', d: 'Tira tudo da rotina para recomeçar.' },
        { v: vb('dica'), t: 'Dica', d: 'Mostra o bloco que não combina, depois o que está no lugar errado.' }
      ],
      regras: ['O **banho** vem primeiro (Fases 2 e 3).', 'O **tênis** só vem **depois da calça e da meia**.', 'A **camiseta** pode vir em qualquer ponto de vestir.', 'Na Fase 3, o **último passo** é como você chega à escola.'],
      fases: [
        { rotulo: 'Fase 1', nivel: 'Fácil', titulo: 'Vestir para a escola', tutorial: 'quarto-f1',
          resumo: 'Monte a ordem de se vestir. Um dos blocos está **repetido**: ele fica de fora.',
          itens: ['Camiseta, calça, meia e tênis.', 'O tênis vem depois da calça e da meia.'] },
        { rotulo: 'Fase 2', nivel: 'Médio', titulo: 'Manhã de escola', exemplo: 'quarto-f2',
          resumo: 'Agora a rotina começa pelo **banho**. Tem **1 passo que não combina** com a escola.',
          itens: ['Banho → vestir (camiseta, calça, meia, tênis).', 'Quem não combina? Pergunte à **Dica**!'] },
        { rotulo: 'Fase 3', nivel: 'Difícil', titulo: 'A caminho da escola', exemplo: 'quarto-f3',
          resumo: 'Banho, vestir e, **no fim, como você chega à escola**. Também tem **1 passo que não combina**.',
          itens: ['O último passo muda: van, ônibus, bicicleta ou carro.', 'Cuidado: nem tudo combina com a manhã de escola!'] }
      ]
    },
    cozinha: {
      nome: 'Cozinha', titulo: 'Cozinha — Verdadeiro ou Falso', sub: 'Mini-jogo 3 · Leia com atenção',
      objetivo: 'Leia cada frase sobre a cozinha e decida se ela é verdadeira ou falsa. São 9 perguntas.',
      comandos: [
        { v: vb('verdadeiro'), t: 'Verdadeiro', d: 'A frase está **certa**. Atalho: tecla **V**.' },
        { v: vb('falso'), t: 'Falso', d: 'A frase está **errada**. Atalho: tecla **F**.' },
        { v: '<span class="cj-vb cj-vb--outline"><u style="color:#E24B4A;text-decoration-thickness:2px">não</u></span>', t: 'Palavra sublinhada', d: '**Não, nunca, sempre, jamais** mudam o sentido da frase. Preste atenção!' },
        { v: vb('proxima'), t: 'Próxima', d: 'Depois de responder, **você** decide quando ir para a próxima pergunta.' },
        { v: vb('dica'), t: 'Dica', d: 'O Logi aponta a palavra que muda o sentido da frase.' }
      ],
      fases: [
        { rotulo: 'Fácil', nivel: '3 perguntas', titulo: 'Frases simples', tutorial: 'cozinha-f1',
          resumo: 'Frases curtas sobre a cozinha. Algumas têm a palavra **não**.',
          itens: ['Leia a frase com calma.', 'Escolha Verdadeiro ou Falso.'] },
        { rotulo: 'Médio', nivel: '3 perguntas', titulo: 'Não, nunca e jamais', exemplo: 'cozinha-medio',
          resumo: 'As frases usam **não**, **nunca** e **jamais**. Essas palavras viram o sentido!',
          itens: ['Procure a palavra sublinhada em vermelho.', 'Pense: com essa palavra, a frase ainda está certa?'] },
        { rotulo: 'Difícil', nivel: '3 perguntas', titulo: 'Sempre e nunca', exemplo: 'cozinha-dificil',
          resumo: 'Frases com **sempre** e **nunca**. Elas falam de **todas** as vezes!',
          itens: ['"Sempre" é todas as vezes. "Nunca" é nenhuma vez.', 'Se existe uma exceção, a frase com "sempre" é falsa.'] }
      ]
    },
    despensa: {
      nome: 'Despensa', titulo: 'Despensa — Estoque inteligente', sub: 'Mini-jogo 4 · Organize as frutas',
      objetivo: 'Organize as frutas da despensa seguindo a regra do Logi: por cor, por tamanho ou por sementes.',
      comandos: [
        { v: cartaVis('Maçã', 'maça.png'), t: 'Carta de fruta', d: 'Toque para escolher. Nos níveis Médio e Difícil, também dá para **arrastar** para a prateleira.' },
        { v: '<span class="cj-vb cj-vb--outline" style="border-style:dashed">1º</span>', t: 'Prateleira', d: 'Onde as frutas ficam em fila. Toque de novo numa fruta para **tirar**.' },
        { v: vb('confirmar'), t: 'Confirmar', d: 'Confere se a despensa está em ordem.' },
        { v: vb('limpar'), t: 'Limpar', d: 'Tira as frutas escolhidas para começar de novo.' },
        { v: vb('dica'), t: 'Dica', d: 'Mostra a fruta errada ou qual é a próxima a escolher.' }
      ],
      fases: [
        { rotulo: 'Fácil', nivel: 'Cor', titulo: 'Frutas vermelhas', tutorial: 'despensa-f1',
          resumo: 'Escolha **só as frutas vermelhas**. Aqui não tem prateleira: é só tocar.',
          itens: ['Toque nas frutas certas para escolher.', 'Escolheu errado? Toque de novo para tirar.'] },
        { rotulo: 'Médio', nivel: 'Tamanho', titulo: 'Do menor para o maior', tutorial: 'despensa-f2',
          resumo: 'Coloque as frutas na prateleira, **do menor para o maior**.',
          itens: ['Toque ou arraste as frutas.', 'À esquerda o menor, à direita o maior.'] },
        { rotulo: 'Difícil', nivel: 'Sementes', titulo: 'Sementes por dentro', tutorial: 'despensa-f3',
          resumo: 'Escolha **3 frutas** que têm **sementes por dentro** e ponha na prateleira.',
          itens: ['Pense em como é a fruta por dentro.', 'O morango não conta: os pontinhos ficam por fora.'] }
      ]
    }
  };
  const ORDEM = ['sala', 'quarto', 'cozinha', 'despensa'];

  /* ============================================================
     Montagem
     ============================================================ */
  function quadro(n, q) {
    const selo = q.selo
      ? `<span class="cj-selo cj-selo--bis">${esc(q.selo)}</span>`
      : q.acao === 'click'
        ? `<span class="cj-selo cj-selo--toque">👆 Sua vez: ${q.semMao ? 'escolha' : 'toque'}</span>`
        : q.fala ? '<span class="cj-selo cj-selo--ler">📖 O Logi explica</span>' : '';
    const fala = q.fala
      ? `<div class="cj-fala"><img src="${img(/dica|encorajando/.test(q.estado || '') ? 'logi_exclamacao.png' : 'logi_feliz.png')}" alt="">
           <p>${marcar(q.fala, q.chaves)}</p></div>` : '';
    return `<li class="cj-quadro cj-cor-${q.cena.comodo}">
      <div class="cj-quadro__cab"><span class="cj-quadro__num">${n}</span>
        ${q.titulo ? `<strong>${esc(q.titulo)}</strong>` : ''}${selo}</div>
      ${fala}
      ${TELAS[q.cena.comodo](Object.assign({ alt: q.texto.replace(/\*\*/g, '') }, q.cena, { mao: q.acao === 'click' && !q.semMao }))}
      <p class="cj-explica">${md(q.texto)}</p>
    </li>`;
  }

  /* Destaca as palavras-chave da fala (as mesmas que o tutorial destaca) */
  function marcar(txt, chaves) {
    let h = esc(txt);
    [].concat(chaves || []).forEach(k => {
      const re = new RegExp('(' + String(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'u');
      h = h.replace(re, '<mark class="cj-chave">$1</mark>');
    });
    return h;
  }

  /* Quadros de um tutorial: a fala e o tipo de passo vêm do próprio tutorial do jogo */
  function quadrosDe(tutorialId) {
    const def = window.Tutorial?.obter?.(tutorialId);
    const itens = FRAMES[tutorialId] || [];
    let n = 0;
    return itens.map((f, i) => {
      n++;
      const p = f.extra ? null : def?.passos?.[i];
      const fala = p ? window.Tutorial.tratar(p.fala) : '';
      return quadro(n, {
        cena: f.cena, texto: f.texto, fala, chaves: p?.palavraChave, estado: p?.estadoLogi,
        acao: p?.acao, semMao: p?.semMao, titulo: f.extra, selo: f.selo
      });
    }).join('');
  }

  function painelComodo(id) {
    const d = COMODOS[id];
    const comandos = d.comandos.map(c =>
      `<div class="cj-comando"><span class="cj-comando__vis">${c.v}</span><span class="cj-comando__txt"><strong class="cj-comando__nome">${esc(c.t)}</strong>${md(c.d)}</span></div>`).join('');
    const abas = d.fases.map((f, i) =>
      `<button type="button" class="cj-fase-tab" role="tab" id="cj-ft-${id}-${i}" aria-controls="cj-fp-${id}-${i}" data-i="${i}"><b>${esc(f.rotulo)}</b><small>${esc(f.nivel)}</small></button>`).join('');
    const fases = d.fases.map((f, i) => {
      let corpo = '';
      if (f.tutorial) {
        corpo = `<p class="cj-subtitulo">📘 Passo a passo com o Logi (o treino do jogo)</p><ol class="cj-quadros">${quadrosDe(f.tutorial)}</ol>`;
      } else if (f.exemplo) {
        const e = EXEMPLOS[f.exemplo];
        corpo = `<p class="cj-subtitulo">✅ Um exemplo resolvido</p><ol class="cj-quadros">${quadro(1, { cena: e.cena, texto: e.texto, titulo: 'Como pode ficar' })}</ol>`;
        if (f.usaTutorial !== undefined) {
          corpo += `<button type="button" class="cj-ir" data-ir-fase="${f.usaTutorial}">Ver o passo a passo da ${esc(d.fases[f.usaTutorial].rotulo)} (os comandos são os mesmos) →</button>`;
        }
      }
      return `<div class="cj-fase" role="tabpanel" id="cj-fp-${id}-${i}" aria-labelledby="cj-ft-${id}-${i}" hidden>
        <h4>${esc(f.rotulo)} · ${esc(f.titulo)}</h4>
        <p class="cj-texto" style="margin:0">${md(f.resumo)}</p>
        <ul class="cj-lista">${f.itens.map(t => `<li>${md(t)}</li>`).join('')}</ul>
        ${corpo}</div>`;
    }).join('');
    const regras = d.regras ? `<div class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">★</span> Regras de ordem</h4><ul class="cj-lista">${d.regras.map(t => `<li>${md(t)}</li>`).join('')}</ul></div>` : '';
    return `<div class="cj-cor-${id}">
      <div class="cj-cab"><img src="${img('icone-' + id + '.png')}" alt=""><div><h3>${esc(d.titulo)}</h3><p>${esc(d.sub)}</p></div></div>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">1</span> O que fazer</h4>
        <div class="cj-objetivo"><img src="${img('estrela.png')}" alt=""><p>${md(d.objetivo)}</p></div></section>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">2</span> Os comandos desta tela</h4>
        <div class="cj-comandos">${comandos}</div></section>
      ${regras}
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">3</span> Fase por fase</h4>
        <div class="cj-fases-tabs" role="tablist" aria-label="Fases de ${esc(d.nome)}">${abas}</div>${fases}</section>
    </div>`;
  }

  function ligarFases(raiz, id, inicial = 0) {
    const abas = [...raiz.querySelectorAll(`.cj-fase-tab[id^="cj-ft-${id}-"]`)];
    const paineis = [...raiz.querySelectorAll(`.cj-fase[id^="cj-fp-${id}-"]`)];
    const ir = i => {
      abas.forEach((a, k) => {
        a.classList.toggle('cj-fase-tab--ativa', k === i);
        a.setAttribute('aria-selected', k === i ? 'true' : 'false');
        a.tabIndex = k === i ? 0 : -1;
      });
      paineis.forEach((p, k) => { p.hidden = k !== i; });
    };
    abas.forEach((a, k) => {
      a.addEventListener('click', () => ir(k));
      a.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { ir(Math.min(abas.length - 1, k + 1)); abas[Math.min(abas.length - 1, k + 1)].focus(); }
        if (e.key === 'ArrowLeft')  { ir(Math.max(0, k - 1)); abas[Math.max(0, k - 1)].focus(); }
      });
    });
    raiz.querySelectorAll(`[data-ir-fase]`).forEach(b => {
      if (paineis.some(p => p.contains(b))) b.addEventListener('click', () => { ir(Number(b.dataset.irFase)); abas[Number(b.dataset.irFase)].focus(); });
    });
    ir(inicial);
    return ir;
  }

  /* Tela inicial do guia (aba "Início") */
  function painelInicio() {
    const trilha = [
      ['<img src="' + img('icone-sala.png') + '" alt="">', 'Escolha um cômodo', 'No mapa da casa, toque no cômodo que está aberto.'],
      ['<img src="' + img('logi_feliz.png') + '" alt="">', 'Leia o Logi', 'Ele conta o desafio. Na primeira vez, faz um treino com você.'],
      ['<span style="font-size:38px;line-height:44px;display:block">🧩</span>', 'Resolva o desafio', 'Monte, escolha ou responda. Pode usar a Dica quando precisar.'],
      ['<img src="' + img('estrela.png') + '" alt="">', 'Ganhe estrelas', 'Quanto menos erros, mais estrelas. Aí abre o próximo cômodo!']
    ].map(t => `<li class="cj-trilha__item">${t[0]}<strong>${t[1]}</strong><span>${t[2]}</span></li>`).join('');
    const mapa = ORDEM.map(id => `<img src="${img('icone-' + id + '.png')}" alt="${COMODOS[id].nome}" title="${COMODOS[id].nome}">`).join('<span aria-hidden="true">→</span>');
    const botoes = [
      [vb('mapa'), 'Voltar ao mapa', 'Sai do cômodo e volta ao mapa da casa.'],
      [vb('ajuda'), 'Como jogar', 'Abre esta ajuda, com o passo a passo da tela em que você está.'],
      [vb('som'), 'Som', 'Liga e desliga a música e os sons.'],
      [vb('pts'), 'Pontos', 'Seus pontos no cômodo. Cada cômodo vale até 25.'],
      [vb('dica'), 'Dica', 'O Logi mostra onde está o problema, sem tirar pontos.'],
      [vb('limpar'), 'Limpar', 'Tira o que você montou para começar de novo.'],
      [vb('executar') + ' ' + vb('verificar') + ' ' + vb('confirmar'), 'Conferir', 'Cada cômodo tem seu botão para conferir: Executar, Verificar ou Confirmar.'],
      [vb('ver') + ' ' + vb('pular'), 'Treino do Logi', 'Ver de novo repete o passo a passo. Pular fecha o treino.']
    ].map(b => `<div class="cj-comando"><span class="cj-comando__vis" style="min-width:96px;flex-wrap:wrap;gap:4px">${b[0]}</span><span class="cj-comando__txt"><strong class="cj-comando__nome">${b[1]}</strong>${b[2]}</span></div>`).join('');
    const star = `<img src="${img('estrela.png')}" alt="">`;
    const irComodos = ORDEM.map(id => `<button type="button" class="cj-ir" data-ir-aba="${id}" style="margin:4px 6px 0 0"><img class="cj-inline" src="${img('icone-' + id + '.png')}" alt=""> Como jogar a ${COMODOS[id].nome}</button>`).join('');
    return `<div class="cj-cor-inicio">
      <div class="cj-cab"><img src="${img('logi_feliz.png')}" alt=""><div><h3>Bem-vindo à Casa dos Mistérios!</h3><p>Eu sou o Logi e vou te ajudar a resolver cada mistério.</p></div></div>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">1</span> Como a aventura funciona</h4>
        <ol class="cj-trilha" style="list-style:none;padding:12px 0 0">${trilha}</ol>
        <div class="cj-mapa">${mapa}</div>
        <p class="cj-info">Termine um cômodo para abrir o próximo. Se errar, é só tentar de novo!</p></section>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">2</span> Os botões do jogo</h4>
        <p class="cj-texto">Estes botões aparecem em vários cômodos:</p><div class="cj-comandos">${botoes}</div></section>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">3</span> Pontos e estrelas</h4>
        <div class="cj-estrelas">
          <div>${star}${star}${star}<strong>Sem erros</strong><span>25 pontos</span></div>
          <div>${star}${star}<strong>1 erro</strong><span>20 pontos</span></div>
          <div>${star}<strong>2 erros</strong><span>15 pontos</span></div>
          <div>${star}<strong>3 erros ou mais</strong><span>10 pontos</span></div>
        </div>
        <p class="cj-texto" style="margin-top:.5rem">Pedir <strong>Dica</strong> nunca tira pontos.</p></section>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">4</span> O treino do Logi</h4>
        <p class="cj-texto">Na <strong>primeira vez</strong> que você chega numa fase, o Logi faz um treino: a tela escurece, só o que importa fica aceso e uma mãozinha mostra onde tocar. Em cada cômodo, o <strong>passo a passo completo</strong> está nas outras abas.</p>
        <p class="cj-texto">Quer ver de novo? Aperte <strong>?</strong> e depois <strong>Ver o tutorial do Logi</strong>, ou use a tecla <kbd>R</kbd>.</p></section>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">5</span> Teclado</h4>
        <ul class="cj-teclas">
          <li><kbd>Tab</kbd> andar entre os botões</li>
          <li><kbd>Enter</kbd> / <kbd>Espaço</kbd> escolher ou confirmar</li>
          <li><kbd>Esc</kbd> fechar a janela ou sair</li>
          <li><kbd>V</kbd> / <kbd>F</kbd> Verdadeiro ou Falso (Cozinha)</li>
          <li><kbd>Delete</kbd> tirar o bloco selecionado</li>
          <li><kbd>R</kbd> rever o treino do Logi</li>
          <li><kbd>Alt</kbd> + <kbd>A</kbd> acessibilidade (letra maior, alto contraste)</li>
        </ul></section>
      <section class="cj-secao"><h4 class="cj-secao__titulo"><span class="cj-secao__num">6</span> Veja cada cômodo</h4>${irComodos}</section>
    </div>`;
  }

  /* ---- Guia da tela inicial: abas Início + 4 cômodos ---- */
  let ctx = null;
  function montarIndice(raiz) {
    const abas = [{ id: 'inicio', nome: 'Início', ico: '<span aria-hidden="true">🎮</span>' }]
      .concat(ORDEM.map(id => ({ id, nome: COMODOS[id].nome, ico: `<img src="${img('icone-' + id + '.png')}" alt="">` })));
    raiz.innerHTML = `
      <nav class="cj-tabs cj-cor-inicio" role="tablist" aria-label="Escolha a tela">${abas.map((a, i) =>
        `<button type="button" class="cj-tab" role="tab" id="cj-tab-${a.id}" aria-controls="cj-painel-${a.id}" data-i="${i}">${a.ico} ${a.nome}</button>`).join('')}</nav>
      ${abas.map(a => `<section class="cj-painel" role="tabpanel" id="cj-painel-${a.id}" aria-labelledby="cj-tab-${a.id}" hidden>${a.id === 'inicio' ? painelInicio() : painelComodo(a.id)}</section>`).join('')}
      <div class="cj-rodape"><button type="button" class="btn btn--outline cj-nav" id="cj-anterior">← Voltar</button>
        <span class="cj-pontos" id="cj-pontos" aria-hidden="true"></span>
        <button type="button" class="btn btn--laranja cj-nav" id="cj-proximo">Próximo →</button></div>`;
    const botoes = [...raiz.querySelectorAll('.cj-tab')];
    const paineis = [...raiz.querySelectorAll('.cj-painel')];
    const pontos = $(raiz, '#cj-pontos');
    abas.forEach(() => pontos.appendChild(document.createElement('span')));
    const fases = {};
    ORDEM.forEach(id => { fases[id] = ligarFases(raiz, id, 0); });
    let atual = 0;
    function ir(i) {
      atual = Math.max(0, Math.min(abas.length - 1, i));
      botoes.forEach((b, k) => {
        b.setAttribute('aria-selected', k === atual ? 'true' : 'false');
        b.tabIndex = k === atual ? 0 : -1;
        b.classList.toggle('cj-tab--ativa', k === atual);
      });
      paineis.forEach((p, k) => { p.hidden = k !== atual; });
      [...pontos.children].forEach((d, k) => d.classList.toggle('on', k === atual));
      $(raiz, '#cj-anterior').disabled = atual === 0;
      $(raiz, '#cj-proximo').disabled = atual === abas.length - 1;
      const m = raiz.closest('.modal'); if (m) m.scrollTop = 0;
    }
    botoes.forEach((b, k) => {
      b.addEventListener('click', () => ir(k));
      b.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { ir(k + 1); botoes[atual].focus(); }
        if (e.key === 'ArrowLeft')  { ir(k - 1); botoes[atual].focus(); }
      });
    });
    $(raiz, '#cj-anterior').addEventListener('click', () => ir(atual - 1));
    $(raiz, '#cj-proximo').addEventListener('click', () => ir(atual + 1));
    raiz.querySelectorAll('[data-ir-aba]').forEach(b =>
      b.addEventListener('click', () => { ir(abas.findIndex(a => a.id === b.dataset.irAba)); botoes[atual].focus(); }));
    ctx = { ir, fases };
    ir(0);
  }

  /* ---- Guia dentro de um cômodo (botão "?"): só o painel daquele cômodo ---- */
  function montarComodo(raiz, id, faseInicial = 0) {
    raiz.innerHTML = painelComodo(id);
    ctx = { fases: { [id]: ligarFases(raiz, id, faseInicial) } };
  }

  function reiniciar() {
    if (!ctx) return;
    ctx.ir?.(0);
    Object.values(ctx.fases).forEach(f => f(0));
  }
  /* Abre o guia do cômodo já na fase que a criança está jogando */
  function irParaFase(id, i) { ctx?.fases?.[id]?.(i); }

  return { montarIndice, montarComodo, reiniciar, irParaFase };
})();
