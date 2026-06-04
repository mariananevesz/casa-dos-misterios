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
    musicaAtivada: true
  },
  cozinhaBloco: 0
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
        cozinhaBloco: saved.cozinhaBloco ?? DEFAULT_STATE.cozinhaBloco
      };
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  _save(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  },

  get() { return this._load(); },

  setRoomScore(room, score) {
    const state = this._load();
    state.scores[room]    = score;
    state.completed[room] = true;
    const idx = ROOMS.indexOf(room);
    if (idx >= 0 && idx < ROOMS.length - 1) {
      state.unlocked[ROOMS[idx + 1]] = true;
    }
    this._save(state);
    return state;
  },

  getTotalScore() {
    const state = this._load();
    return Object.values(state.scores).reduce((sum, s) => sum + (s || 0), 0);
  },

  getStars(score) {
    if (score === null || score === undefined) return 0;
    if (score >= 80) return 3;
    if (score >= 50) return 2;
    return 1;
  },

  _countPhaseScores(storageKey) {
    try {
      const scores = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return Object.keys(scores).length;
    } catch {
      return 0;
    }
  },

  getRoomStarGoal() {
    return 3;
  },

  getRoomProgressStars(room) {
    const state = this._load();

    if (room === 'sala') {
      const fases = this._countPhaseScores('sala_scores_fases');
      return Math.min(this.getRoomStarGoal(room), fases || (state.completed.sala ? 3 : 0));
    }

    if (room === 'quarto') {
      const fases = this._countPhaseScores('quarto_scores_fases');
      return Math.min(this.getRoomStarGoal(room), fases || (state.completed.quarto ? 3 : 0));
    }

    if (room === 'despensa') {
      if (state.completed.despensa) return 3;
      const nivelAtual = parseInt(localStorage.getItem('despensa_nivel') || '0', 10);
      return Math.max(0, Math.min(this.getRoomStarGoal(room), nivelAtual));
    }

    if (room === 'cozinha') {
      return state.completed.cozinha ? 3 : 0;
    }

    return state.completed[room] ? 3 : 0;
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
    if (erros === 0) return 25;
    if (erros === 1) return 20;
    if (erros === 2) return 15;
    return 10;
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
    [
      'sala_fase',
      'sala_scores_fases',
      'quarto_fase',
      'quarto_scores_fases',
      'despensa_nivel'
    ].forEach(key => {
      try { localStorage.removeItem(key); } catch {}
    });
    this._save(JSON.parse(JSON.stringify(DEFAULT_STATE)));
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
