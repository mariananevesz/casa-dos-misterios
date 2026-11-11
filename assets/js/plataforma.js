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

/* Com uma janela aberta, o resto da página fica inert: o leitor de tela (Narrador) não lê o que está
   atrás (antes ele lia o fundo e não a janela). Avisos do leitor (a11y-*) e o treino (tut*) ficam de fora. */
let fundoIsolado = [];
function isolarFundo(janela) {
  restaurarFundo();
  [...document.body.children].forEach(el => {
    if (el === janela || el.inert || /^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName)) return;
    if (el.classList.contains('sr-only') || /^(a11y-|tut)/.test(el.id)) return;
    el.inert = true;
    fundoIsolado.push(el);
  });
}
function restaurarFundo() {
  fundoIsolado.forEach(el => { el.inert = false; });
  fundoIsolado = [];
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
  restaurarFundo();
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
  restaurarFundo();
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
      /* Páginas sem o botão ⚙ (os cômodos) também abrem as preferências */
      event.preventDefault();
      window.Preferencias.abrir();
    }
    return;
  }

  if (event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey) {
    const fechar = modalVisivelComFechamento();
    if (!fechar) return;
    event.preventDefault();
    fechar.click();
  }
});

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

/* Tab circular: depois do último botão da página o foco volta para o primeiro (o botão Mapa), em vez de
   sair para as abas e a barra de endereço do navegador. Shift+Tab no primeiro vai para o último.
   (Para sair da página: F6 ou Ctrl+L.) Com janela ou treino abertos, quem cuida do foco é ela. */
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
  if (existeModalVisivel() || window.Tutorial?.ativo || document.body.classList.contains('tut-aberto')) return;
  if (!document.getElementById('btn-ajuda')) return;   /* só nos cômodos */
  const lista = elementosDoTab();
  if (lista.length < 2) return;
  const primeiro = lista[0], ultimo = lista[lista.length - 1];
  if (!event.shiftKey && document.activeElement === ultimo) { event.preventDefault(); primeiro.focus(); }
  else if (event.shiftKey && document.activeElement === primeiro) { event.preventDefault(); ultimo.focus(); }
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
