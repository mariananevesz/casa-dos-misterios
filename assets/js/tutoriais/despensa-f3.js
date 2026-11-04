/* =============================================================
   Tutorial 7 — Despensa, fase 3 / nível Difícil (SEMENTES por dentro)
   Interativo: o primeiro passo já é a vez da criança. A criança
   TOCA (ou arrasta) só as frutas que têm SEMENTES por dentro para a
   prateleira. Se tocar numa fruta sem sementes, o Logi diz por quê
   e a criança tenta de novo.
   Frutas de treino (fixas): maçã e melancia (têm sementes), abacaxi
   e banana (não têm). O morango (aquênios) fica de fora do treino
   para não confundir; ele aparece só no jogo.
   ============================================================= */
(() => {
  const FRUTA = id => `#itens-grid [data-item-id="${id}"]`;
  const SEM = {
    abacaxi: 'O abacaxi NÃO tem SEMENTES por dentro.',
    banana: 'A banana NÃO tem SEMENTES por dentro.'
  };
  const JA = { maca: 'A maçã já está escolhida.', melancia: 'A melancia já está escolhida.' };

  Tutorial.registrar({
    id: 'despensa-f3',
    comodo: 'Despensa',
    titulo: 'Despensa · Fase 3',
    /* Frutas de treino (fixas, para o tutorial não depender do sorteio da fase) */
    treino: {
      criterio: 'selecao-sementes',
      itens: [
        { id: 'abacaxi',  nome: 'Abacaxi',  tipo: 'sem-semente-visivel', img: '../img/abacaxi.png' },
        { id: 'maca',     nome: 'Maçã',     tipo: 'sementes',            img: '../img/maça.png' },
        { id: 'banana',   nome: 'Banana',   tipo: 'sem-semente',         img: '../img/banana.png' },
        { id: 'melancia', nome: 'Melancia', tipo: 'sementes',            img: '../img/melancia.png' }
      ],
      corretos: ['maca', 'melancia']
    },
    passos: [
      { id: 'despensa-f3-p1', acao: 'click', estadoLogi: 'apontando', entra: true,
        alvo: FRUTA('maca'), evitar: '#prateleira', vez: { tipo: 'adicionar', valor: 'maca' },
        fala: 'Oi, {tratamento}! Só frutas com SEMENTES. Toque na MAÇÃ.', palavraChave: ['SEMENTES', 'MAÇÃ'],
        audiodescricao: 'Logi chega pulando na Despensa. Hoje escolhemos só as frutas que têm sementes por dentro. A maçã tem. Toque nela: ela vai para a prateleira.',
        teclado: 'Foco já na “Maçã”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'melancia' ? 'A melancia também tem SEMENTES! Primeiro, a MAÇÃ.'
            : `${SEM[id] || 'Essa não.'} Procure a MAÇÃ.`,
          audiodescricao: 'Quase! Procure a maçã, que tem sementes por dentro.', teclado: 'Tab até “Maçã” e Enter' } },

      { id: 'despensa-f3-p2', acao: 'ok', estadoLogi: 'dica',
        antes: a => a.balancar('abacaxi'),
        destaque: FRUTA('abacaxi'),
        fala: 'O abacaxi NÃO tem SEMENTES. Fica de FORA!', palavraChave: ['NÃO', 'SEMENTES', 'FORA'],
        audiodescricao: 'O abacaxi não tem sementes por dentro. Ele não vai para a prateleira.',
        teclado: 'Enter no botão “OK”' },

      { id: 'despensa-f3-p3', acao: 'click', estadoLogi: 'aguardando',
        alvo: FRUTA('melancia'), evitar: '#prateleira', vez: { tipo: 'adicionar', valor: 'melancia' },
        fala: 'Sua vez! Outra com SEMENTES: a MELANCIA.', palavraChave: ['SEMENTES', 'MELANCIA'],
        audiodescricao: 'Sua vez! A melancia também tem sementes por dentro. Toque nela.',
        teclado: 'Foco já na “Melancia”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'maca' ? `${JA.maca} Toque na MELANCIA.` : `${SEM[id] || 'Essa não.'} Procure a MELANCIA.`,
          audiodescricao: 'Quase! Procure a melancia.', teclado: 'Tab até “Melancia” e Enter' } },

      { id: 'despensa-f3-p4', acao: 'ok', estadoLogi: 'comemorando',
        antes: a => a.marcarCertas(),
        destaque: '#prateleira',
        fala: 'Isso! Só frutas com SEMENTES!', palavraChave: ['SEMENTES'],
        audiodescricao: 'Isso! A maçã e a melancia estão na prateleira. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' }
    ]
  });
})();
