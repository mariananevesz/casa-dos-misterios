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

document.addEventListener('keydown', event => {
  if (event.repeat || alvoEditavel(event.target)) return;

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
