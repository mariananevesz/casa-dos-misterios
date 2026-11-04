/* =============================================================
   Tutorial 5 — Despensa, fase 1 / nível Fácil (frutas vermelhas)
   Interativo: o primeiro passo já é a vez da criança. No nível Fácil
   a criança TOCA nas frutas vermelhas (não existe prateleira nem
   arrastar). Se tocar numa fruta de outra cor, o Logi diz a cor dela
   e a criança tenta de novo.
   ============================================================= */
(() => {
  const FRUTA = id => `#itens-grid [data-item-id="${id}"]`;

  /* O que o Logi diz de cada fruta de treino */
  const COR = {
    banana: 'A banana é AMARELA.',
    uva: 'A uva é ROXA.',
    mirtilo: 'O mirtilo é AZUL.'
  };

  Tutorial.registrar({
    id: 'despensa-f1',
    comodo: 'Despensa',
    titulo: 'Despensa · Fase 1',
    /* Frutas de treino (fixas, para o tutorial não depender do sorteio da fase) */
    treino: {
      itens: [
        { id: 'maca',    nome: 'Maçã',    cor: 'vermelho', img: '../img/maça.png' },
        { id: 'banana',  nome: 'Banana',  cor: 'amarelo',  img: '../img/banana.png' },
        { id: 'uva',     nome: 'Uva',     cor: 'roxo',     img: '../img/uva.png' },
        { id: 'morango', nome: 'Morango', cor: 'vermelho', img: '../img/morango.png' },
        { id: 'mirtilo', nome: 'Mirtilo', cor: 'azul',     img: '../img/mirtilo.png' }
      ],
      corretos: ['maca', 'morango']
    },
    passos: [
      { id: 'despensa-f1-p1', acao: 'click', estadoLogi: 'apontando', entra: true,
        alvo: FRUTA('maca'), vez: { tipo: 'selecionar', valor: 'maca' },
        fala: 'Oi, {tratamento}! Escolha somente frutas VERMELHAS. Toque na MAÇÃ.', palavraChave: ['VERMELHAS', 'MAÇÃ'],
        audiodescricao: 'Logi chega pulando na Despensa. Hoje só escolhemos frutas vermelhas. Toque na maçã vermelha: ela fica escolhida.',
        teclado: 'Foco já na “Maçã”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'morango' ? 'O morango também é vermelho! Primeiro, a MAÇÃ.' : `${COR[id] || 'Essa não.'} Procure a MAÇÃ.`,
          audiodescricao: 'Quase! Procure a maçã vermelha.', teclado: 'Tab até “Maçã” e Enter' } },

      { id: 'despensa-f1-p2', acao: 'ok', estadoLogi: 'dica',
        antes: a => a.balancar('banana'),
        destaque: FRUTA('banana'),
        fala: 'A banana é AMARELA. Fica de FORA!', palavraChave: ['AMARELA', 'FORA'],
        audiodescricao: 'A banana é amarela. Ela não é escolhida.',
        teclado: 'Enter no botão “OK”' },

      { id: 'despensa-f1-p3', acao: 'click', estadoLogi: 'aguardando',
        alvo: FRUTA('morango'), vez: { tipo: 'selecionar', valor: 'morango' },
        fala: 'Sua vez! Outra fruta VERMELHA: o MORANGO.', palavraChave: ['VERMELHA', 'MORANGO'],
        audiodescricao: 'Sua vez! Toque no morango, que também é vermelho.',
        teclado: 'Foco já no “Morango”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'maca' ? 'A maçã já está escolhida. Toque no MORANGO.' : `${COR[id] || 'Essa não.'} Procure o MORANGO.`,
          audiodescricao: 'Quase! Procure o morango vermelho.', teclado: 'Tab até “Morango” e Enter' } },

      { id: 'despensa-f1-p4', acao: 'ok', estadoLogi: 'comemorando',
        destaque: '.item-card--selecionado',
        fala: 'Isso! O morango também é VERMELHO!', palavraChave: ['VERMELHO'],
        audiodescricao: 'Isso! A maçã e o morango estão escolhidos. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' }
    ]
  });
})();
