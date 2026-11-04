/* =============================================================
   Tutorial 6 — Despensa, fase 2 / nível Médio (por TAMANHO)
   Interativo: o primeiro passo já é a vez da criança. A criança
   TOCA (ou arrasta) as frutas para a prateleira, do MENOR para o
   MAIOR. Se tocar na fruta errada, o Logi diz se ela é maior ou se
   já está na prateleira, e a criança tenta de novo.
   Frutas de treino (fixas): mirtilo (1), maçã (3), melancia (5).
   ============================================================= */
(() => {
  const FRUTA = id => `#itens-grid [data-item-id="${id}"]`;
  const NOME = { mirtilo: 'O mirtilo', maca: 'A maçã', melancia: 'A melancia' };
  const jaNaPrateleira = id => NOME[id] ? `${NOME[id]} já está na prateleira.` : '';

  Tutorial.registrar({
    id: 'despensa-f2',
    comodo: 'Despensa',
    titulo: 'Despensa · Fase 2',
    /* Frutas de treino (fixas, para o tutorial não depender do sorteio da fase) */
    treino: {
      criterio: 'tamanho',
      itens: [
        { id: 'melancia', nome: 'Melancia', tamanho: 5, img: '../img/melancia.png' },
        { id: 'mirtilo',  nome: 'Mirtilo',  tamanho: 1, img: '../img/mirtilo.png' },
        { id: 'maca',     nome: 'Maçã',     tamanho: 3, img: '../img/maça.png' }
      ],
      ordemCorreta: ['mirtilo', 'maca', 'melancia']
    },
    passos: [
      { id: 'despensa-f2-p1', acao: 'click', estadoLogi: 'apontando', entra: true,
        alvo: FRUTA('mirtilo'), evitar: '#prateleira', vez: { tipo: 'adicionar', valor: 'mirtilo' },
        fala: 'Oi, {tratamento}! Comece pela MENOR: o MIRTILO.', palavraChave: ['MENOR', 'MIRTILO'],
        audiodescricao: 'Logi chega pulando na Despensa. Hoje as frutas vão para a prateleira do menor para o maior. A menor é o mirtilo. Toque nele: ele vai para o primeiro lugar.',
        teclado: 'Foco já no “Mirtilo”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'melancia' ? 'A melancia é a MAIOR! Comece pela MENOR.'
            : id === 'maca' ? 'A maçã é MÉDIA. Comece pela MENOR.' : 'Comece pela MENOR: o MIRTILO.',
          audiodescricao: 'Quase! Procure a fruta menor, o mirtilo.', teclado: 'Tab até “Mirtilo” e Enter' } },

      { id: 'despensa-f2-p2', acao: 'ok', estadoLogi: 'dica',
        destaque: '#prateleira',
        fala: 'A prateleira vai do MENOR ao MAIOR.', palavraChave: ['MENOR', 'MAIOR'],
        audiodescricao: 'Na prateleira, as frutas ficam em fila: a menor primeiro e a maior por último.',
        teclado: 'Enter no botão “OK”' },

      { id: 'despensa-f2-p3', acao: 'click', estadoLogi: 'aguardando',
        alvo: FRUTA('maca'), evitar: '#prateleira', vez: { tipo: 'adicionar', valor: 'maca' },
        fala: 'Sua vez! A MENOR que sobrou: a MAÇÃ.', palavraChave: ['MENOR', 'MAÇÃ'],
        audiodescricao: 'Sua vez! Das frutas que sobraram, a menor é a maçã. Toque nela.',
        teclado: 'Foco já na “Maçã”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'melancia' ? 'A melancia é MAIOR que a maçã. Primeiro, a MAÇÃ.'
            : `${jaNaPrateleira(id)} Toque na MAÇÃ.`,
          audiodescricao: 'Quase! Procure a maçã.', teclado: 'Tab até “Maçã” e Enter' } },

      { id: 'despensa-f2-p4', acao: 'click', estadoLogi: 'dica',
        alvo: FRUTA('melancia'), evitar: '#prateleira', vez: { tipo: 'adicionar', valor: 'melancia' },
        fala: 'Por último, a MAIOR: a MELANCIA.', palavraChave: ['MAIOR', 'MELANCIA'],
        audiodescricao: 'Falta só a maior de todas, a melancia. Toque nela.',
        teclado: 'Foco já na “Melancia”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => `${jaNaPrateleira(id)} Toque na MELANCIA.`,
          audiodescricao: 'Quase! Falta a melancia, a maior.', teclado: 'Tab até “Melancia” e Enter' } },

      { id: 'despensa-f2-p5', acao: 'ok', estadoLogi: 'comemorando',
        antes: a => a.marcarCertas(),
        destaque: '#prateleira',
        fala: 'Isso! Do MENOR para o MAIOR!', palavraChave: ['MENOR', 'MAIOR'],
        audiodescricao: 'Isso! As frutas estão do menor para o maior. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' }
    ]
  });
})();
