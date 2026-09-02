/* =============================================================
   gameState.js — Estado global do jogo (localStorage)
   Casa dos Mistérios Lógicos
   ============================================================= */

const ROOMS = ['sala', 'quarto', 'cozinha', 'despensa'];
const STORAGE_KEY = 'casaMisterios_state';

const DEFAULT_STATE = {
  scores:    { sala: null, quarto: null, cozinha: null, despensa: null },
  completed: { sala: false, quarto: false, cozinha: false, despensa: false },
  unlocked:  { sala: true,  quarto: false, cozinha: false, despensa: false },
  settings: {
    altoContraste: false,
    tamanhoFonte:  100,
    somAtivado:    true,
    musicaAtivada: true,
    narracaoAtivada: true
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

  const niveisFonte = [100, 120, 140];
  const tamanhoFonte = niveisFonte.includes(Number(cfg.tamanhoFonte))
    ? Number(cfg.tamanhoFonte)
    : 100;
  document.documentElement.style.setProperty('--escala-fonte', tamanhoFonte / 100);
  document.documentElement.dataset.tamanhoFonte = String(tamanhoFonte);
}

document.addEventListener('DOMContentLoaded', aplicarConfiguracoes);
