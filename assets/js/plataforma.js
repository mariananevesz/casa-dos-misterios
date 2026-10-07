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
    console.log('⚠️ Falha ao enviar score:', error?.message || error);
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

/* Base global: sem mensagens ou foco automatico especificos de telas. */
let regiaoLeitor = null;
const filaAnuncios = [];
let anuncioEmCurso = false;
const orientacoesInicializadas = new Set();
const focosPreservados = new WeakMap();

function obterRegiaoLeitorDeTela() {
  if (regiaoLeitor?.isConnected) return regiaoLeitor;
  if (!document.body) return null;
  regiaoLeitor = document.getElementById('mensagens-leitor-global');
  if (!regiaoLeitor) {
    regiaoLeitor = document.createElement('div');
    regiaoLeitor.id = 'mensagens-leitor-global';
    regiaoLeitor.className = 'texto-leitor';
    regiaoLeitor.setAttribute('aria-live', 'polite');
    regiaoLeitor.setAttribute('aria-atomic', 'true');
    regiaoLeitor.setAttribute('aria-relevant', 'additions text');
    document.body.appendChild(regiaoLeitor);
  }
  return regiaoLeitor;
}

function processarAnunciosLeitor() {
  if (anuncioEmCurso || !filaAnuncios.length) return;
  const regiao = obterRegiaoLeitorDeTela();
  if (!regiao) return; // DOMContentLoaded retoma a fila.
  anuncioEmCurso = true;
  const { mensagem, prioridade } = filaAnuncios[0];
  regiao.textContent = '';
  regiao.setAttribute('aria-live', prioridade);
  // Atualizacao separada permite repetir a mesma mensagem e registra a prioridade.
  window.setTimeout(() => {
    regiao.textContent = mensagem;
    window.setTimeout(() => {
      filaAnuncios.shift();
      anuncioEmCurso = false;
      processarAnunciosLeitor();
    }, 150);
  }, 100);
}

function anunciarParaLeitorDeTela(mensagem, prioridade = 'polite') {
  const texto = String(mensagem ?? '').trim();
  if (!texto) return false;
  const nivel = prioridade === 'assertive' ? 'assertive' : 'polite';
  // Chamadas identicas pendentes geram apenas uma atualizacao.
  if (filaAnuncios.some(item => item.mensagem === texto && item.prioridade === nivel)) return false;
  filaAnuncios.push({ mensagem: texto, prioridade: nivel });
  processarAnunciosLeitor();
  return true;
}

function resolverElementoAcessivel(elemento) {
  if (typeof elemento === 'string') {
    try { return document.querySelector(elemento); } catch { return null; }
  }
  return elemento instanceof HTMLElement ? elemento : null;
}

function focarElementoAcessivel(elemento) {
  const alvo = resolverElementoAcessivel(elemento);
  if (!alvo?.isConnected || alvo.closest('[hidden], [inert], [aria-hidden="true"]') ||
      alvo.matches(':disabled') || !alvo.getClientRects().length ||
      window.getComputedStyle(alvo).visibility === 'hidden') return false;
  const tabindexAnterior = alvo.getAttribute('tabindex');
  const temporario = tabindexAnterior === null && alvo.tabIndex < 0;
  const limparTabindexTemporario = () => {
    alvo.removeEventListener('blur', aoPerderFoco);
    // Nao sobrescreva uma alteracao feita por outro controle.
    if (alvo.getAttribute('tabindex') === '-1') alvo.removeAttribute('tabindex');
  };
  const aoPerderFoco = () => {
    // blur tambem ocorre ao sair da janela (por exemplo, para o DevTools).
    // Durante o evento, activeElement pode ser transitorio. Confira depois
    // que a transferencia terminou, sem retirar a capacidade de refocar.
    window.setTimeout(() => {
      if (document.activeElement !== alvo && document.hasFocus()) {
        limparTabindexTemporario();
      }
    }, 0);
  };
  if (temporario) {
    alvo.setAttribute('tabindex', '-1');
    alvo.addEventListener('blur', aoPerderFoco);
  }
  try {
    alvo.focus({ preventScroll: true });
    if (document.activeElement !== alvo) {
      if (temporario) limparTabindexTemporario();
      return false;
    }
    return document.activeElement === alvo;
  } catch {
    if (temporario) limparTabindexTemporario();
    return false;
  }
}

function preservarFocoAcessivel(contexto, elemento = document.activeElement) {
  const chave = resolverElementoAcessivel(contexto);
  const alvo = resolverElementoAcessivel(elemento);
  if (!chave || !alvo?.isConnected || focosPreservados.has(chave)) return false;
  focosPreservados.set(chave, alvo);
  return true;
}

function restaurarFocoAcessivel(contexto) {
  const chave = resolverElementoAcessivel(contexto);
  if (!chave) return false;
  const alvo = focosPreservados.get(chave);
  focosPreservados.delete(chave);
  return focarElementoAcessivel(alvo);
}

function inicializarOrientacaoAcessivel({ titulo = '', mensagem = '', focoInicial = null } = {}) {
  const texto = [titulo, mensagem].map(valor => String(valor).trim()).filter(Boolean).join('. ');
  const chave = JSON.stringify([titulo, mensagem]);
  if (orientacoesInicializadas.has(chave)) return false;
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', () =>
      inicializarOrientacaoAcessivel({ titulo, mensagem, focoInicial }), { once: true });
    return false;
  }
  if (!texto && !focoInicial) return false;
  orientacoesInicializadas.add(chave);
  if (focoInicial) focarElementoAcessivel(focoInicial);
  if (texto) anunciarParaLeitorDeTela(texto);
  return true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    obterRegiaoLeitorDeTela();
    processarAnunciosLeitor();
  }, { once: true });
} else {
  obterRegiaoLeitorDeTela();
}

function focarInicioModalAcessivel(modal) {
  window.requestAnimationFrame(() => {
    if (modal !== tutorialAtivo && modal !== modalFluxoAtivo) return;
    focarElementoAcessivel(elementosFocaveisTutorial(modal)[0] || modal);
  });
}

let tutorialAtivo = null;
let acionadorTutorial = null;
let narracaoAnteriorTutorial = null;
let modalFluxoAtivo = null;

function elementosFocaveisTutorial(modal) {
  return [...modal.querySelectorAll(
    'button:not([disabled]):not([tabindex="-1"]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(elemento => !elemento.closest('[hidden], [inert], [aria-hidden="true"]') && elemento.getClientRects().length > 0 && window.getComputedStyle(elemento).visibility !== 'hidden');
}

function abrirTutorialAcessivel(modal, acionador) {
  if (!modal) return;
  tutorialAtivo = modal;
  acionadorTutorial = acionador || document.activeElement;
  preservarFocoAcessivel(modal, acionadorTutorial);
  modal.style.display = 'flex';
  acionadorTutorial?.setAttribute?.('aria-expanded', 'true');
  focarInicioModalAcessivel(modal);
}

function narrarTutorialAcessivel(texto) {
  if (typeof audio === 'undefined') return;
  if (narracaoAnteriorTutorial === null && typeof audio.obterNarracaoAtual === 'function') {
    narracaoAnteriorTutorial = audio.obterNarracaoAtual();
  }
  audio.definirNarracao(texto);
}

function restaurarNarracaoAposTutorial() {
  if (typeof audio === 'undefined') return;
  audio.pararNarracao();
  if (narracaoAnteriorTutorial !== null) {
    audio.definirNarracao(narracaoAnteriorTutorial, false);
    narracaoAnteriorTutorial = null;
  }
}

function fecharTutorialAcessivel(modal = tutorialAtivo) {
  if (!modal) return;
  restaurarNarracaoAposTutorial();
  modal.style.display = 'none';
  const acionador = acionadorTutorial;
  acionador?.setAttribute?.('aria-expanded', 'false');
  tutorialAtivo = null;
  acionadorTutorial = null;
  restaurarFocoAcessivel(modal);
}

function abrirModalFluxoAcessivel(modal) {
  if (!modal) return;
  preservarFocoAcessivel(modal);
  modalFluxoAtivo = modal;
  modal.style.display = 'flex';
  focarInicioModalAcessivel(modal);
}

function fecharModalFluxoAcessivel(modal = modalFluxoAtivo) {
  if (!modal) return;
  modal.style.display = 'none';
  if (modalFluxoAtivo === modal) modalFluxoAtivo = null;
  restaurarFocoAcessivel(modal);
}

document.addEventListener('keydown', event => {
  if (event.repeat || alvoEditavel(event.target)) return;

  const modalComFoco = tutorialAtivo || modalFluxoAtivo;
  if (event.key === 'Tab' && modalComFoco) {
    const focaveis = elementosFocaveisTutorial(modalComFoco);
    if (!focaveis.length) {
      event.preventDefault();
      focarElementoAcessivel(modalComFoco);
      return;
    }
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (!modalComFoco.contains(document.activeElement)) {
      event.preventDefault();
      focarElementoAcessivel(event.shiftKey ? ultimo : primeiro);
    } else if (event.shiftKey && document.activeElement === primeiro) {
      event.preventDefault();
      focarElementoAcessivel(ultimo);
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      focarElementoAcessivel(primeiro);
    }
    return;
  }

  const tecla = String(event.key).toLowerCase();
  const somenteAlt = event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;

  if (somenteAlt && tecla === 'a') {
    const abrirAcessibilidade = document.querySelector('[aria-controls="modal-config"]');
    if (!abrirAcessibilidade || abrirAcessibilidade.getAttribute('aria-expanded') === 'true') return;
    event.preventDefault();
    abrirAcessibilidade.click();
    return;
  }

  if (somenteAlt && tecla === 'r') {
    if (typeof audio === 'undefined' || typeof audio.repetirNarracao !== 'function') return;
    event.preventDefault();
    audio.repetirNarracao();
    return;
  }

  if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
    const fechar = modalVisivelComFechamento();
    if (!fechar) return;
    event.preventDefault();
    fechar.click();
  }
});

// Formata a leitura dos pontos e preserva o formato visual original.
function textoPontuacao(pontos, visual = `${pontos} pts`, prefixo = '', maximo = null) {
  const leitura = `${prefixo}${pontos} pontos${maximo === null ? '' : ` de ${maximo} pontos`}`;
  return `<span aria-hidden="true">${visual}</span><span class="texto-leitor">${leitura}</span>`;
}
