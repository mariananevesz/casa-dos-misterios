/* =============================================================
   plataforma.js — Comunicação com a Plataforma
   Casa dos Mistérios Lógicos
   Referência: Manual de Padronização, Seção 8
   ============================================================= */

/**
 * Lê a dificuldade passada pela plataforma via parâmetro de URL.
 * Valores válidos (Seção 6): 'Fácil' | 'Médio' | 'Difícil'
 * Fallback: 'Médio' (nível único padrão, Seção 6).
 *
 * @returns {string} Descritor de dificuldade.
 */
function getPlatformDifficulty() {
  const params = new URLSearchParams(window.location.search);
  const dificuldade = params.get('dificuldade');

  const validos = ['Muito Fácil', 'Fácil', 'Médio', 'Difícil', 'Muito Difícil'];
  if (validos.includes(dificuldade)) {
    return dificuldade;
  }

  return 'Médio'; // fallback: nível padrão único (Seção 6)
}

/* -------------------------------------------------------------
   Função obrigatória de envio de score (Seção 8 — verbatim)
   ------------------------------------------------------------- */

/* Guard global: impede envio duplicado mesmo vindo de diferentes páginas */
let scoreSent = false;

function sendFinalScore({
  score,
  difficulty
} = {}) {
  if (typeof gameState !== 'undefined' && !gameState.isFullyCompleted()) return;
  const persistedGuard = typeof gameState !== 'undefined' && gameState.hasFinalScoreBeenSent();
  if (scoreSent || persistedGuard) return;
  try {
    window.parent.postMessage({
      type: 'C4A_GAME_SCORE',
      payload: {
        score,
        difficulty
      }
    }, '*');
    scoreSent = true;
    if (typeof gameState !== 'undefined') gameState.markFinalScoreSent();
  } catch (error) {
    console.log('Falha ao enviar score:', error?.message || error);
  }
}

/* -------------------------------------------------------------
   Atalhos globais de teclado
   Reutilizam os controles e as funções já existentes na página.
   ------------------------------------------------------------- */

function alvoEditavel(elemento) {
  if (!(elemento instanceof Element)) return false;
  return elemento.matches('input, textarea, select, [contenteditable="true"]') ||
    Boolean(elemento.closest('[contenteditable="true"]'));
}

function modalVisivelComFechamento() {
  const modais = [...document.querySelectorAll('.modal-overlay')].filter(modal =>
    !modal.hidden && window.getComputedStyle(modal).display !== 'none'
  );

  for (let i = modais.length - 1; i >= 0; i--) {
    const fechar = modais[i].querySelector(
      '.modal-fechar, button[aria-label^="Fechar"], #btn-fechar-config, #btn-fechar-cj'
    );
    if (fechar && !fechar.disabled) return fechar;
  }
  return null;
}

function existeModalVisivel() {
  return [...document.querySelectorAll('.modal-overlay')].some(modal =>
    !modal.hidden && window.getComputedStyle(modal).display !== 'none'
  );
}

/* Com uma janela aberta, o resto da página fica inert: o leitor de tela (Narrador) não lê o que está
   atrás (antes ele lia o fundo e não a janela). Avisos do leitor (a11y-*) e o treino (tut*) ficam de fora. */
/* Em pilha: uma janela pode abrir por cima de outra (ex.: preferências com Alt+A sobre a ajuda).
   Cada janela guarda só o que ELA deixou inert e devolve só isso ao fechar. */
const pilhaFundo = [];
function isolarFundo(janela) {
  if (!janela || pilhaFundo.some(q => q.janela === janela)) return;
  const itens = [];
  [...document.body.children].forEach(el => {
    if (el === janela || el.inert || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName)) return;
    if (el.classList.contains('sr-only') || /^(a11y-|tut)/.test(el.id)) return;
    el.inert = true;
    itens.push(el);
  });
  pilhaFundo.push({ janela, itens });
}
function restaurarFundo(janela) {
  const i = janela ? pilhaFundo.findIndex(q => q.janela === janela) : pilhaFundo.length - 1;
  if (i < 0) return;
  pilhaFundo.splice(i, 1)[0].itens.forEach(el => { el.inert = false; });
}

let tutorialAtivo = null;
let acionadorTutorial = null;
let modalFluxoAtivo = null;

function elementosFocaveisTutorial(modal) {
  return [...modal.querySelectorAll(
    'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(elemento => !elemento.hidden && window.getComputedStyle(elemento).display !== 'none');
}

function abrirTutorialAcessivel(modal, acionador) {
  if (!modal) return;
  tutorialAtivo = modal;
  acionadorTutorial = acionador || document.activeElement;
  modal.style.display = 'flex';
  isolarFundo(modal);
  acionadorTutorial?.setAttribute?.('aria-expanded', 'true');
  window.requestAnimationFrame(() => elementosFocaveisTutorial(modal)[0]?.focus());
}

function fecharTutorialAcessivel(modal = tutorialAtivo) {
  if (!modal) return;
  modal.style.display = 'none';
  restaurarFundo(modal);
  const acionador = acionadorTutorial;
  acionador?.setAttribute?.('aria-expanded', 'false');
  tutorialAtivo = null;
  acionadorTutorial = null;
  acionador?.focus?.();
}

function abrirModalFluxoAcessivel(modal) {
  if (!modal) return;
  modalFluxoAtivo = modal;
  modal.style.display = 'flex';
  isolarFundo(modal);
  window.requestAnimationFrame(() => elementosFocaveisTutorial(modal)[0]?.focus());
}

function fecharModalFluxoAcessivel(modal = modalFluxoAtivo) {
  if (!modal) return;
  modal.style.display = 'none';
  restaurarFundo(modal);
  if (modalFluxoAtivo === modal) modalFluxoAtivo = null;
}

document.addEventListener('keydown', event => {
  if (event.repeat || alvoEditavel(event.target)) return;

  const modalComFoco = tutorialAtivo || modalFluxoAtivo;
  if (event.key === 'Tab' && modalComFoco) {
    const focaveis = elementosFocaveisTutorial(modalComFoco);
    if (!focaveis.length) {
      event.preventDefault();
      return;
    }
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (event.shiftKey && document.activeElement === primeiro) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primeiro.focus();
    }
    return;
  }

  const tecla = String(event.key).toLowerCase();
  const somenteAlt = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

  if (somenteAlt && tecla === 'a') {
    const abrirAcessibilidade = document.querySelector('[aria-controls="modal-config"]');
    if (abrirAcessibilidade) {
      if (abrirAcessibilidade.getAttribute('aria-expanded') === 'true') return;
      event.preventDefault();
      abrirAcessibilidade.click();
    } else if (window.Preferencias && !window.Preferencias.aberto) {
      /* Páginas sem o botão de preferências também abrem a janela */
      event.preventDefault();
      window.Preferencias.abrir();
    }
    return;
  }

  if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
    /* Outra parte do jogo já tratou este Esc (preferências, treino do Logi) */
    if (event.defaultPrevented) return;
    /* "Sair do cômodo?" aberta: Esc fecha a pergunta e a criança continua jogando */
    if (saidaAberta()) { event.preventDefault(); fecharSaida(); return; }
    const fechar = modalVisivelComFechamento();
    if (fechar) { event.preventDefault(); fechar.click(); return; }
    if (existeModalVisivel()) return;   /* janela sem botão Fechar (ex.: fim da fase): Esc não faz nada */
    /* Nos cômodos, Esc nunca sai direto: pergunta antes (Task 104) */
    if (comodoDaSaida && !window.Tutorial?.ativo && !document.body.classList.contains('tut-aberto')) {
      event.preventDefault();
      pedirSaida();
    }
  }
});

/* -------------------------------------------------------------
   Sair do cômodo com Esc: sempre com confirmação (Task 104)
   A página do cômodo chama ativarSaidaComEsc('sala'). O Esc abre uma
   pergunta com dois botões; o foco começa em "Continuar jogando", então
   um Esc ou um Enter sem querer nunca tiram a criança do cômodo.
   ------------------------------------------------------------- */
let comodoDaSaida = null;
let destinoDaSaida = 'MapaCasa.html';
let focoAntesDaSaida = null;

function ativarSaidaComEsc(comodo, destino) {
  comodoDaSaida = comodo;
  if (destino) destinoDaSaida = destino;
}

function saidaAberta() {
  return document.getElementById('modal-sair')?.style.display === 'flex';
}

function pedirSaida() {
  let modal = document.getElementById('modal-sair');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-sair';
    modal.setAttribute('role', 'alertdialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-sair-titulo');
    modal.setAttribute('aria-describedby', 'modal-sair-texto');
    modal.style.display = 'none';
    modal.innerHTML = `
      <section class="modal modal-sair">
        <h2 class="modal-titulo" id="modal-sair-titulo">Sair do cômodo?</h2>
        <p class="modal-sub" id="modal-sair-texto">O que você montou nesta fase não fica guardado.</p>
        <section class="btn-grupo modal-sair__botoes">
          <button type="button" class="btn btn--laranja" id="modal-sair-ficar">Continuar jogando</button>
          <button type="button" class="btn btn--outline" id="modal-sair-sim">Sair para o mapa</button>
        </section>
      </section>`;
    document.body.appendChild(modal);
    modal.querySelector('#modal-sair-ficar').addEventListener('click', fecharSaida);
    modal.querySelector('#modal-sair-sim').addEventListener('click', () => {
      if (typeof gameState !== 'undefined' && comodoDaSaida) gameState.sairMiniGame(comodoDaSaida, destinoDaSaida);
      else window.location.href = destinoDaSaida;
    });
    modal.addEventListener('click', e => { if (e.target === modal) fecharSaida(); });
  }
  if (saidaAberta()) return;
  focoAntesDaSaida = document.activeElement;
  abrirModalFluxoAcessivel(modal);   /* fundo inert, Tab preso, foco em "Continuar jogando" */
}

function fecharSaida() {
  const modal = document.getElementById('modal-sair');
  if (!modal || !saidaAberta()) return;
  fecharModalFluxoAcessivel(modal);
  const volta = focoAntesDaSaida;
  focoAntesDaSaida = null;
  if (volta && document.contains(volta) && volta !== document.body) { try { volta.focus(); } catch (e) {} }
}

/* -------------------------------------------------------------
   Foco inicial (Task 103)
   Ao entrar numa tela ou mudar de fase, o foco vai direto para o
   primeiro comando do jogo. Assim o leitor de tela fala esse comando
   (e a instrução curta em aria-live) em vez de ler a página inteira
   de cima para baixo, e quem usa só o teclado já começa no lugar certo.
   Não mexe no foco se houver janela aberta ou treino do Logi.
   ------------------------------------------------------------- */
function focoInicial(alvo) {
  /* Um instante depois de montar a tela (com temporizador, que também roda com a aba em segundo plano) */
  window.setTimeout(() => {
    if (existeModalVisivel() || window.Tutorial?.ativo || document.body.classList.contains('tut-aberto')) return;
    const el = typeof alvo === 'function' ? alvo() : alvo;
    if (!el || el.disabled || !document.contains(el)) return;
    try { el.focus({ preventScroll: true }); } catch (e) {}
  }, 80);
}

/* -------------------------------------------------------------
   Leitura para leitor de tela (texto em aria-live, sem narração)
   - anunciarAcessivel(texto): fala um aviso curto, sem mexer na tela.
   - descreverComodo(texto): guarda a descrição do cômodo (Tasks 106 e 105)
     e a anuncia ao entrar; a tecla D lê de novo e a tecla H abre a ajuda.
   ------------------------------------------------------------- */

function regiaoViva(id, nivel) {
  let regiao = document.getElementById(id);
  if (!regiao) {
    regiao = document.createElement('div');
    regiao.id = id;
    regiao.className = 'sr-only';
    regiao.setAttribute('role', nivel === 'assertive' ? 'alert' : 'status');
    regiao.setAttribute('aria-live', nivel || 'polite');
    regiao.setAttribute('aria-atomic', 'true');
    document.body.appendChild(regiao);
  }
  return regiao;
}

/* Limpa e escreve de novo, para o leitor ler também quando o texto se repete */
function anunciarAcessivel(texto, nivel) {
  if (!document.body) return;
  const regiao = regiaoViva(nivel === 'assertive' ? 'a11y-alerta' : 'a11y-status', nivel);
  regiao.textContent = '';
  window.setTimeout(() => { regiao.textContent = texto; }, 60);
}

/* Preenche {chaves} de um texto que vem do JSON do cômodo */
function preencherTexto(modelo, vars = {}) {
  return String(modelo || '').replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));
}

let descricaoCompleta = '';
let descricaoTimer = 0;

/* Guarda a instrução COMPLETA do cômodo (Alt+R lê de novo quando quiser) e anuncia agora:
   a completa na primeira vez, e só a `curta` nas fases seguintes. */
function descreverComodo(completa, opcoes = {}) {
  descricaoCompleta = String(completa || '').replace(/\s+/g, ' ').trim();
  const falar = String(opcoes.curta || descricaoCompleta).replace(/\s+/g, ' ').trim();
  if (opcoes.anunciar === false || !falar) return;
  window.clearTimeout(descricaoTimer);
  /* Espera um pouco: a região viva precisa existir antes de o texto chegar */
  descricaoTimer = window.setTimeout(() => anunciarAcessivel(falar), opcoes.espera ?? 500);
}

/* Cancela a leitura da descrição que ainda não saiu (o treino do Logi abre e fala no lugar dela) */
function cancelarDescricao() { window.clearTimeout(descricaoTimer); }

function atalhosLigados() {
  try { return gameState.getSettings().atalhos !== false; } catch (e) { return true; }
}

/* Atalhos SEMPRE com Alt (não brigam com as teclas de navegação do Narrador/NVDA/JAWS nem com o Chrome):
     Alt+J  abre a ajuda ("Como jogar") do cômodo
     Alt+R  lê de novo a instrução completa do cômodo
     Alt+S  lê o resumo do que já foi montado (se a página tiver um)
   Só nos cômodos (onde existe o botão ?). Com o treino do Logi aberto, o Alt+R reinicia o treino. */
document.addEventListener('keydown', event => {
  if (event.repeat || !event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (alvoEditavel(event.target)) return;
  if (!['KeyJ', 'KeyR', 'KeyS'].includes(event.code)) return;
  if (!atalhosLigados() || window.Tutorial?.ativo || document.body.classList.contains('tut-aberto')) return;
  const ajuda = document.getElementById('btn-ajuda');
  if (!ajuda) return;

  if (event.code === 'KeyJ') {
    /* Ajuda aberta: Alt+J de novo fecha (sempre dá para sair) */
    if (existeModalVisivel()) {
      const fechar = modalVisivelComFechamento();
      if (fechar && document.getElementById('modal-ajuda')?.style.display === 'flex') { event.preventDefault(); fechar.click(); }
      return;
    }
    event.preventDefault();
    ajuda.click();
    return;
  }
  if (existeModalVisivel()) return;
  event.preventDefault();
  if (event.code === 'KeyR') {
    if (descricaoCompleta) anunciarAcessivel(descricaoCompleta);
  } else if (typeof window.resumoDaPagina === 'function') {
    const texto = window.resumoDaPagina();
    if (texto) anunciarAcessivel(texto);
  }
});

/* Os botões de um grupo (Cima, Baixo, Esquerda, Direita; frutas; blocos da fila) ficam TODOS no Tab,
   na ordem da tela. As setas NÃO são interceptadas: com o leitor de tela (Narrador) elas são as teclas
   de leitura, e mexer no foco por cima delas atrapalhava (pulava texto e botões). */
function manterOrdemDoTab(grupo, seletor) {
  if (!grupo) return;
  grupo.querySelectorAll(seletor).forEach(el => el.removeAttribute('tabindex'));
}

/* Tab circular em TODAS as telas (início, mapa, cômodos, pontuação), também com o treino do Logi ou uma
   janela aberta: depois do último item o foco volta para o primeiro, em vez de sair para as abas e a
   barra de endereço do navegador. Shift+Tab no primeiro vai para o último. (Para sair da página: F6 ou
   Ctrl+L.) Com janela/treino abertos, o fundo está inert, então a volta acontece só entre os itens dela. */
function elementosDoTab() {
  return [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter(el => {
    if (el.disabled || el.hidden || el.tabIndex < 0) return false;
    if (el.closest('[inert], [hidden], [aria-hidden="true"]')) return false;
    if (el.closest('.sr-only')) return false;
    return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
}

document.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.defaultPrevented) return;   /* uma janela/treino já moveu o foco nesta tecla */
  const lista = elementosDoTab();
  if (!lista.length) return;
  const primeiro = lista[0], ultimo = lista[lista.length - 1];
  const atual = document.activeElement;
  const ir = el => { event.preventDefault(); el.focus(); };

  /* Foco num item do Tab: só intervém nas pontas */
  if (lista.includes(atual)) {
    if (!event.shiftKey && atual === ultimo) ir(primeiro);
    else if (event.shiftKey && atual === primeiro) ir(ultimo);
    return;
  }

  /* Foco fora da lista (página, título com tabindex=-1, item que sumiu ou ficou inert):
     segue para o próximo/anterior pela posição na tela; sem nenhum, dá a volta */
  if (!atual || atual === document.body || atual === document.documentElement || !atual.isConnected) {
    ir(event.shiftKey ? ultimo : primeiro);
    return;
  }
  const depois = el => atual.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING;
  const prox = event.shiftKey ? [...lista].reverse().find(el => !depois(el) && !el.contains(atual)) : lista.find(el => depois(el));
  ir(prox || (event.shiftKey ? ultimo : primeiro));
});

/* Avisos em FILA (role="log"): cada texto novo é lido depois do anterior, sem cortar.
   Serve para o passo a passo da Sala, em que vários avisos saem em sequência. */
function anunciarFila(texto) {
  if (!document.body || !texto) return;
  let log = document.getElementById('a11y-fila');
  if (!log) {
    log = document.createElement('div');
    log.id = 'a11y-fila';
    log.className = 'sr-only';
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    log.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(log);
  }
  const p = document.createElement('p');
  p.textContent = texto;
  log.appendChild(p);
  while (log.children.length > 30) log.firstElementChild.remove();
}

/* Atalhos com Alt: ao soltar o Alt, o Chrome (Windows) leva o foco para a barra do navegador, e o Tab
   passava a andar pelo navegador em vez de pela página (ex.: depois de responder com Alt+1 na Cozinha
   não dava para chegar no botão Próxima). Cancelar o "soltar Alt" depois de um atalho mantém o foco na página. */
let altUsadoEmAtalho = false;
document.addEventListener('keydown', e => {
  if (e.altKey && e.key !== 'Alt' && !e.ctrlKey && !e.metaKey) altUsadoEmAtalho = true;
}, true);
document.addEventListener('keyup', e => {
  if (e.key !== 'Alt') return;
  if (altUsadoEmAtalho) { e.preventDefault(); e.stopPropagation(); }
  altUsadoEmAtalho = false;
}, true);
