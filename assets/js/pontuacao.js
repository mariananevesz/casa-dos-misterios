const COMODOS = [
  { id: 'sala', nome: 'Sala', img: '../img/icone-sala.png', cor: 'laranja' },
  { id: 'quarto', nome: 'Quarto', img: '../img/icone-quarto.png', cor: 'roxo' },
  { id: 'cozinha', nome: 'Cozinha', img: '../img/icone-cozinha.png', cor: 'verde' },
  { id: 'despensa', nome: 'Despensa', img: '../img/icone-despensa.png', cor: 'marrom' }
];

let confettiLaunched = false;

function getCompletionMessage(total) {
  if (total >= 90) return 'Excelente trabalho! Você explorou todos os cômodos e resolveu os desafios com muita atenção!';
  if (total >= 70) return 'Muito bem! Você concluiu todos os desafios e mostrou muita dedicação durante a aventura!';
  return 'Parabéns por chegar até aqui! Cada desafio ajudou você a aprender um pouco mais. Continue praticando!';
}

function launchConfetti() {
  if (confettiLaunched) return;
  confettiLaunched = true;
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  const colors = ['#D85A30', '#EF9F27', '#534AB7', '#1D9E75', '#FAC775'];

  for (let i = 0; i < 56; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--drift', `${Math.random() * 120 - 60}px`);
    piece.style.setProperty('--delay', `${Math.random() * 0.7}s`);
    piece.style.setProperty('--duration', `${3 + Math.random() * 1.7}s`);
    piece.style.setProperty('--rotation', `${360 + Math.random() * 720}deg`);
    piece.style.backgroundColor = colors[i % colors.length];
    if (i % 5 === 0) piece.classList.add('confetti-piece--round');
    layer.appendChild(piece);
  }

  document.body.appendChild(layer);
  window.setTimeout(() => layer.remove(), 5500);
}

function resetGame() {
  gameState.reset();
  window.location.href = '../../index.html';
}

function renderScoreScreen() {
  const state = gameState.get();
  const total = gameState.getTotalScore();
  const completedRooms = COMODOS.filter(room => state.completed[room.id] === true).length;
  const fullyCompleted = gameState.isFullyCompleted();

  document.getElementById('pontuacao-final').textContent = total;
  /* barra dos 100 pontos: só visual (o número já diz a pontuação) */
  requestAnimationFrame(() => requestAnimationFrame(() => { document.getElementById('pontuacao-barra').style.width = Math.min(100, Math.max(0, total)) + '%'; }));
  document.getElementById('tela-pontuacao').classList.toggle('tela--celebracao', fullyCompleted);
  document.getElementById('resultado-logi').hidden = !fullyCompleted;
  document.getElementById('resultado-icone').hidden = fullyCompleted;

  const title = document.getElementById('resultado-titulo');
  const subtitle = document.getElementById('resultado-sub');
  if (fullyCompleted) {
    title.textContent = 'Parabéns!';
    /* O espaço entre as frases evita que o leitor junte "Mistérios!Você" */
    subtitle.innerHTML = '<strong>Você concluiu a Casa dos Mistérios!</strong> Você concluiu os 4 cômodos e finalizou 100% do jogo!';
  } else {
    title.textContent = completedRooms >= 2 ? 'Bom progresso!' : 'Continue explorando!';
    subtitle.textContent = `Você concluiu ${completedRooms} de 4 cômodos.`;
  }

  const grid = document.getElementById('pontuacao-grid');
  grid.replaceChildren();
  COMODOS.forEach(room => {
    const points = state.scores[room.id];
    const completed = state.completed[room.id] === true;
    const card = document.createElement('article');
    card.className = `pontuacao-card pontuacao-card--${room.cor}`;
    card.innerHTML = `
      <img src="${room.img}" alt="" class="pontuacao-card__icone-img">
      <p class="pontuacao-card__nome pontuacao-card__nome--${room.cor}">${room.nome}</p>
      <p class="pontuacao-card__pts pontuacao-card__pts--${room.cor}">${points !== null ? `${points || 0} <span aria-hidden="true">pts</span><span class="sr-only">pontos</span>` : '<span aria-hidden="true">-</span><span class="sr-only">ainda não jogado</span>'}</p>
      ${completed ? `<p class="pontuacao-card__status">${Icones.svg('check')} Concluído!</p>` : ''}
    `;
    grid.appendChild(card);
  });

  const feedback = document.getElementById('feedback-texto');
  if (fullyCompleted) feedback.textContent = getCompletionMessage(total);
  else if (total >= 70) feedback.textContent = 'Muito bem! Você aprendeu bastante!';
  else if (total >= 40) feedback.textContent = 'Bom trabalho! Continue explorando para aprender ainda mais!';
  else feedback.textContent = 'Continue explorando — cada desafio traz um novo aprendizado!';

  const menuButton = document.getElementById('btn-menu-principal');
  menuButton.hidden = fullyCompleted;
  menuButton.addEventListener('click', () => { window.location.href = '../../index.html'; });
  document.getElementById('acoes-resultado').classList.toggle('btn-grupo--final', fullyCompleted);
  document.getElementById('btn-jogar-novamente').addEventListener('click', resetGame, { once: true });

  /* Resumo completo para o leitor de tela: é o NOME do título (item do Tab), lido de uma vez
     quando ele recebe o foco — mesmo padrão da janela de atalhos do Mapa e do OK do treino.
     (Antes: o título só dizia "Parabéns!" e um aviso por voz saía junto e era cortado.) */
  const porComodo = COMODOS.map(room => {
    const pts = state.scores[room.id];
    const situacao = state.completed[room.id] === true ? ', concluído' : '';
    return pts !== null ? `${room.nome}: ${pts || 0} pontos${situacao}.` : `${room.nome}: ainda não jogado.`;
  }).join(' ');
  const resumo = [
    title.textContent.trim(),
    subtitle.textContent.replace(/\s+/g, ' ').trim(),
    `Pontuação total: ${total} de 100 pontos.`,
    porComodo,
    feedback.textContent.trim(),
    'Aperte Tab para ir ao botão Jogar novamente.'
  ].filter(Boolean).join(' ');
  title.setAttribute('aria-label', resumo);
  window.resumoPontuacao = resumo;

  if (fullyCompleted) {
    sendFinalScore({ score: total, difficulty: getPlatformDifficulty() });
    if (!gameState.hasShownFinalCelebration()) {
      gameState.markFinalCelebrationShown();
      requestAnimationFrame(() => requestAnimationFrame(launchConfetti));
    }
  }
}

renderScoreScreen();

/* Foco inicial no título: o leitor lê o resumo completo (nome do título) uma vez só.
   Sem aviso por voz junto — falar e mudar o foco ao mesmo tempo fazia o leitor cortar a fala. */
window.requestAnimationFrame(() => {
  const titulo = document.getElementById('resultado-titulo');
  try { titulo.focus({ preventScroll: true }); } catch (e) {}
});

/* Alt + R: lê o resultado inteiro de novo (os atalhos de plataforma.js valem só nos cômodos) */
document.addEventListener('keydown', e => {
  if (e.repeat || !e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.code !== 'KeyR') return;
  e.preventDefault();
  if (window.resumoPontuacao) anunciarAcessivel(window.resumoPontuacao);
});
