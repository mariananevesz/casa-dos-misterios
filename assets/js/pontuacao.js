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
  document.getElementById('tela-pontuacao').classList.toggle('tela--celebracao', fullyCompleted);
  document.getElementById('resultado-logi').hidden = !fullyCompleted;
  document.getElementById('resultado-icone').hidden = fullyCompleted;

  const title = document.getElementById('resultado-titulo');
  const subtitle = document.getElementById('resultado-sub');
  if (fullyCompleted) {
    title.textContent = 'Parabéns!';
    subtitle.innerHTML = '<strong>Você concluiu a Casa dos Mistérios!</strong><br>Você concluiu os 4 cômodos e finalizou 100% do jogo!';
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
    card.setAttribute('aria-label', `${room.nome}: ${completed ? `${points || 0} pontos, concluído` : 'não concluído'}`);
    card.innerHTML = `
      <img src="${room.img}" alt="Instrutor da ${room.nome}" class="pontuacao-card__icone-img">
      <p class="pontuacao-card__nome pontuacao-card__nome--${room.cor}">${room.nome}</p>
      <p class="pontuacao-card__pts pontuacao-card__pts--${room.cor}">${points !== null ? `${points || 0} pts` : '—'}</p>
      ${completed ? '<p class="pontuacao-card__status"><span aria-hidden="true">✓</span> Concluído!</p>' : ''}
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

  if (fullyCompleted) {
    sendFinalScore({ score: total, difficulty: getPlatformDifficulty() });
    if (!gameState.hasShownFinalCelebration()) {
      gameState.markFinalCelebrationShown();
      requestAnimationFrame(() => requestAnimationFrame(launchConfetti));
    }
  }
}

renderScoreScreen();
