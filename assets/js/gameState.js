/* =============================================================
   gameState.js — Estado global do jogo (localStorage)
   Casa dos Mistérios Lógicos
   ============================================================= */

const ROOMS = ['sala', 'quarto', 'cozinha', 'despensa'];
const STORAGE_KEY = 'casaMisterios_state';

/* Chaves de estágio (fase/nível) por cômodo — usadas por getEstagio/setEstagio/limparEstagio */
const STAGE_KEYS = { sala: 'sala_fase', quarto: 'quarto_fase', despensa: 'despensa_nivel' };

const DEFAULT_STATE = {
  scores:    { sala: null, quarto: null, cozinha: null, despensa: null },
  completed: { sala: false, quarto: false, cozinha: false, despensa: false },
  unlocked:  { sala: true,  quarto: false, cozinha: false, despensa: false },
  settings: {
    altoContraste: false,
    tamanhoFonte:  100,
    somAtivado:    true,
    musicaAtivada: true
  },
  cozinhaBloco: 0,
  finalScoreSent: false,
  finalCelebrationShown: false
};

const gameState = {
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const saved = JSON.parse(raw);
      // merge defaults so new keys are always present
      return {
        scores:       { ...DEFAULT_STATE.scores,    ...saved.scores },
        completed:    { ...DEFAULT_STATE.completed, ...saved.completed },
        unlocked:     { ...DEFAULT_STATE.unlocked,  ...saved.unlocked },
        settings:     { ...DEFAULT_STATE.settings,  ...saved.settings },
        cozinhaBloco: saved.cozinhaBloco ?? DEFAULT_STATE.cozinhaBloco,
        finalScoreSent: saved.finalScoreSent ?? DEFAULT_STATE.finalScoreSent,
        finalCelebrationShown: saved.finalCelebrationShown ?? DEFAULT_STATE.finalCelebrationShown
      };
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  _save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  },

  get() { return this._load(); },

  setRoomScore(room, score, completed = true) {
    const state = this._load();
    state.scores[room] = Math.max(0, Math.min(25, Number(score) || 0));
    if (completed) {
      state.completed[room] = true;
      const idx = ROOMS.indexOf(room);
      if (idx >= 0 && idx < ROOMS.length - 1) {
        state.unlocked[ROOMS[idx + 1]] = true;
      }
    }
    this._save(state);
    return state;
  },

  getTotalScore() {
    const state = this._load();
    return Math.min(100, Object.values(state.scores).reduce(
      (sum, score) => sum + Math.max(0, Math.min(25, Number(score) || 0)),
      0
    ));
  },

  isFullyCompleted() {
    const state = this._load();
    return ROOMS.every(room => state.completed[room] === true);
  },

  hasFinalScoreBeenSent() {
    return this._load().finalScoreSent === true;
  },

  markFinalScoreSent() {
    const state = this._load();
    state.finalScoreSent = true;
    this._save(state);
  },

  hasShownFinalCelebration() {
    return this._load().finalCelebrationShown === true;
  },

  markFinalCelebrationShown() {
    const state = this._load();
    state.finalCelebrationShown = true;
    this._save(state);
  },

  getStars(score) {
    if (score === null || score === undefined) return 0;
    if (score >= 25) return 3;
    if (score >= 20) return 2;
    if (score >= 10) return 1;
    return 0;
  },

  getRoomStarGoal() {
    return 3;
  },

  getRoomProgressStars(room) {
    const state = this._load();
    return state.completed[room] ? this.getStars(state.scores[room]) : 0;
  },

  updateSettings(patch) {
    const state = this._load();
    state.settings = { ...state.settings, ...patch };
    this._save(state);
    return state.settings;
  },

  getSettings() {
    return this._load().settings;
  },

  calcularScore(erros) {
    const totalErros = Math.max(0, Number(erros) || 0);
    if (totalErros === 0) return 25;
    if (totalErros === 1) return 20;
    if (totalErros === 2) return 15;
    return 10;
  },

  getErrorsFromPhaseScores(phaseScores) {
    return Object.values(phaseScores).reduce((total, score) => {
      if (score >= 25) return total;
      if (score >= 20) return total + 1;
      if (score >= 15) return total + 2;
      return total + 3;
    }, 0);
  },

  getCozinhaBloco() {
    return this._load().cozinhaBloco ?? 0;
  },

  setCozinhaBloco(n) {
    const state = this._load();
    state.cozinhaBloco = n;
    this._save(state);
  },

  /* =============================================================
     Item 2.2 — Estado anterior (fase/nível) centralizado
     Substitui as chaves FASE_KEY/NIVEL_KEY duplicadas em cada
     cômodo por uma única responsabilidade.
     ============================================================= */
  getEstagio(room) {
    try {
      return Math.max(0, parseInt(localStorage.getItem(STAGE_KEYS[room]) || '0', 10) || 0);
    } catch { return 0; }
  },

  setEstagio(room, idx) {
    try { localStorage.setItem(STAGE_KEYS[room], idx); } catch {}
  },

  limparEstagio(room) {
    try { localStorage.removeItem(STAGE_KEYS[room]); } catch {}
  },

  /* =============================================================
     Item 2.2 — Saída centralizada de qualquer mini-game
     Todo caminho de saída (botão "Mapa", botão "Voltar ao mapa"
     dos modais, ESC, conclusão) deve chamar esta função. Ela limpa
     as marcas de sessão do sorteio de variação (item 2.3), para que
     a próxima ENTRADA real no cômodo sorteie de novo.
     ============================================================= */
  sairMiniGame(room, destino) {
    try { sessionStorage.removeItem(`${room}_sessao_ativa`); } catch {}
    try { sessionStorage.removeItem(`${room}_variacao_idx`); } catch {}
    window.location.href = destino;
  },

  /* Detecta se esta é uma ENTRADA nova no cômodo (true) ou se o
     jogador só recarregou/está no meio da mesma sessão (false).
     Usa sessionStorage: sobrevive a um F5, mas é limpo por
     sairMiniGame() sempre que o jogador realmente sai do cômodo. */
  isNovaEntrada(room) {
    try {
      if (sessionStorage.getItem(`${room}_sessao_ativa`) === '1') return false;
      sessionStorage.setItem(`${room}_sessao_ativa`, '1');
      return true;
    } catch { return true; }
  },

  /* =============================================================
     Item 2.3 — Sorteio de variação (mín. 4 variações por jogo)
     Sorteia uma variação a cada ENTRADA nova no cômodo e mantém a
     mesma variação se o jogador só recarregar a página no meio da
     partida. Evita repetir a última variação jogada.
     ============================================================= */
  iniciarVariacao(room, total) {
    const idxKey = `${room}_variacao_idx`;
    if (!this.isNovaEntrada(room)) {
      try {
        const raw = sessionStorage.getItem(idxKey);
        const idx = parseInt(raw, 10);
        if (!isNaN(idx) && idx >= 0 && idx < total) return idx;
      } catch {}
    }
    let idx = Math.floor(Math.random() * total);
    const ultimaKey = `${room}_ultima_variacao`;
    let ultima = NaN;
    try { ultima = parseInt(localStorage.getItem(ultimaKey), 10); } catch {}
    if (total > 1 && idx === ultima) idx = (idx + 1) % total;
    try { sessionStorage.setItem(idxKey, idx); } catch {}
    try { localStorage.setItem(ultimaKey, idx); } catch {}
    return idx;
  },

  /* Cozinha já tinha um sistema de rotação de blocos de perguntas
     (getCozinhaBloco/setCozinhaBloco). Aqui só decidimos QUANDO
     girar para o próximo bloco: a cada entrada nova, não a cada
     conclusão da partida inteira. */
  avancarBlocoSeNovaEntrada() {
    if (this.isNovaEntrada('cozinha')) {
      this.setCozinhaBloco(this.getCozinhaBloco() + 1);
    }
    return this.getCozinhaBloco();
  },

  reset() {
    const settings = this.getSettings();
    [
      'sala_fase',
      'sala_scores_fases',
      'quarto_fase',
      'quarto_scores_fases',
      'despensa_nivel',
      'despensa_erros'
    ].forEach(key => {
      try { localStorage.removeItem(key); } catch {}
    });
    ROOMS.forEach(room => {
      try { sessionStorage.removeItem(`${room}_sessao_ativa`); } catch {}
      try { sessionStorage.removeItem(`${room}_variacao_idx`); } catch {}
      try { localStorage.removeItem(`${room}_ultima_variacao`); } catch {}
    });
    const freshState = JSON.parse(JSON.stringify(DEFAULT_STATE));
    freshState.settings = settings;
    this._save(freshState);
  }
};

/* Loader de JSON genérico */
async function loadGameData(jsonPath) {
  const res = await fetch(jsonPath);
  if (!res.ok) throw new Error(`Erro ao carregar ${jsonPath}: ${res.status}`);
  return res.json();
}

/* Aplica configurações salvas ao carregar qualquer página */
function aplicarConfiguracoes() {
  const cfg = gameState.getSettings();

  if (cfg.altoContraste) document.body.classList.add('alto-contraste');
  else document.body.classList.remove('alto-contraste');

  document.documentElement.style.setProperty('--fonte-base', cfg.tamanhoFonte + '%');
  document.body.style.fontSize = cfg.tamanhoFonte + '%';
}

document.addEventListener('DOMContentLoaded', aplicarConfiguracoes);
