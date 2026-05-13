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
  blocos: { cozinha: 0 }
};

const gameState = {
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const saved = JSON.parse(raw);
      // merge defaults so new keys are always present
      return {
        scores:    { ...DEFAULT_STATE.scores,    ...saved.scores },
        completed: { ...DEFAULT_STATE.completed, ...saved.completed },
        unlocked:  { ...DEFAULT_STATE.unlocked,  ...saved.unlocked },
        settings:  { ...DEFAULT_STATE.settings,  ...saved.settings },
        blocos:    { ...DEFAULT_STATE.blocos,    ...saved.blocos } 
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
    const state  = this._load();
    const atual  = state.blocos.cozinha;           // lê bloco atual (0–4)
    state.blocos.cozinha = (atual + 1) % 5;        // avança para a próxima entrada
    this._save(state);
    return atual;                                  // retorna o índice do bloco a exibir
  },

  reset() {
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
