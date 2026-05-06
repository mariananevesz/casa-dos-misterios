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
  if (scoreSent) return;
  try {
    window.parent.postMessage({
      type: 'C4A_GAME_SCORE',
      payload: {
        score,
        difficulty
      }
    }, '*');
    scoreSent = true;
  } catch (error) {
    console.log('⚠️ Falha ao enviar score:', error?.message || error);
  }
}
