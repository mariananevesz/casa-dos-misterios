/* =============================================================
   Tutorial da Despensa — Fase 1 / nível Fácil (Padrões)
   Falas provisórias do storyboard "Tutoriais do Logi", ajustadas
   ao jogo real: no nível Fácil a criança TOCA nas frutas vermelhas
   (não existe prateleira nem arrastar).
   ============================================================= */
(() => {
  const NAV = 'Tab chega em Pausar, Ver de novo e Pular';
  const FRUTA = id => `#itens-grid [data-item-id="${id}"]`;

  Tutorial.registrar({
    id: 'despensa-f1',
    comodo: 'Despensa',
    titulo: 'Despensa · Fase 1',
    /* Frutas de treino (fixas, para a demonstração não depender do sorteio da fase) */
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
      { id: 'despensa-f1-p1', momento: 'Abertura', duracaoPadrao: 3500, estadoLogi: 'falando', entra: true,
        fala: 'Oi, parceira! A DESPENSA está uma bagunça!', palavraChave: ['DESPENSA'],
        audiodescricao: 'Logi chega pulando na Despensa. Tem cinco frutas misturadas.',
        teclado: NAV },

      { id: 'despensa-f1-p2', momento: 'Demonstração 1', duracaoPadrao: 5000, estadoLogi: 'apontando',
        fala: 'Hoje só escolhemos frutas VERMELHAS.', palavraChave: ['VERMELHAS'], destaque: '#logi-instrucao',
        audiodescricao: 'Só vale escolher frutas vermelhas. As frutas são: maçã, banana, uva, morango e mirtilo.',
        teclado: '— (só olhar)' },

      { id: 'despensa-f1-p3', momento: 'Demonstração 2', duracaoPadrao: 5000, estadoLogi: 'apontando', tipo: 'toque',
        alvo: FRUTA('maca'), efeito: a => a.selecionar('maca'),
        fala: 'Toque na MAÇÃ para escolher.', palavraChave: ['MAÇÃ'],
        audiodescricao: 'A mãozinha toca na maçã vermelha. Ela fica escolhida.',
        teclado: 'Tab até “Maçã” e Enter' },

      { id: 'despensa-f1-p4', momento: 'Demonstração 3', duracaoPadrao: 5000, estadoLogi: 'dica',
        antes: a => a.balancar('banana'),
        fala: 'A banana é AMARELA. Fica de fora!', palavraChave: ['AMARELA'], destaque: FRUTA('banana'),
        audiodescricao: 'A banana é amarela. Ela não é escolhida.',
        teclado: '— (só olhar)' },

      { id: 'despensa-f1-p5', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        alvo: FRUTA('morango'), vez: { tipo: 'selecionar', valor: 'morango' },
        fala: 'Sua vez! Toque no MORANGO.', palavraChave: ['MORANGO'],
        audiodescricao: 'Sua vez! O foco está no morango. Aperte Enter para escolher.',
        teclado: 'Foco já no “Morango”: Enter ou Espaço',
        erro: { id: 'despensa-f1-p5-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          fala: 'Quase! Procure a outra fruta VERMELHA.', palavraChave: ['VERMELHA'],
          audiodescricao: 'Quase! Essa fruta não é vermelha. Procure o morango.',
          teclado: 'Tab até “Morango” e Enter' } },

      { id: 'despensa-f1-p6', momento: 'Acerto', duracaoPadrao: 3200, estadoLogi: 'comemorando',
        fala: 'Isso! O morango também é VERMELHO!', palavraChave: ['VERMELHO'], destaque: '.item-card--selecionado',
        audiodescricao: 'Isso! A maçã e o morango estão escolhidos. Logi pula de alegria.',
        teclado: '— (só olhar)' },

      { id: 'despensa-f1-p7', momento: 'Fase começa', duracaoPadrao: 2600, estadoLogi: 'falando',
        fala: 'A FASE começa agora. Vamos lá!', palavraChave: ['FASE'],
        audiodescricao: 'Agora começa a fase de verdade.',
        teclado: '— (a fase abre com o foco na primeira fruta)' }
    ]
  });
})();
