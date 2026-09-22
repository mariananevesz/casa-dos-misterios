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

let tutorialAtivo = null;
let acionadorTutorial = null;
let narracaoAnteriorTutorial = null;
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
  acionadorTutorial?.setAttribute?.('aria-expanded', 'true');
  window.requestAnimationFrame(() => elementosFocaveisTutorial(modal)[0]?.focus());
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
  acionador?.focus?.();
}

function abrirModalFluxoAcessivel(modal) {
  if (!modal) return;
  modalFluxoAtivo = modal;
  modal.style.display = 'flex';
  window.requestAnimationFrame(() => elementosFocaveisTutorial(modal)[0]?.focus());
}

function fecharModalFluxoAcessivel(modal = modalFluxoAtivo) {
  if (!modal) return;
  modal.style.display = 'none';
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
