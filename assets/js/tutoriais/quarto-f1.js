/* =============================================================
   Tutorial do Quarto — Fase 1 (Depuração)
   Falas provisórias do storyboard "Tutoriais do Logi".
   ============================================================= */
(() => {
  const NAV = 'Tab chega em Pausar, Ver de novo e Pular';
  const FONTE = id => `#blocos-fonte [data-bloco-id="${id}"]`;

  Tutorial.registrar({
    id: 'quarto-f1',
    comodo: 'Quarto',
    titulo: 'Quarto · Fase 1',
    /* Blocos de treino: "calcarep" é a calça REPETIDA (vermelha), que fica fora da fila */
    treino: {
      blocos: ['camiseta', { id: 'calcarep', base: 'calca', erro: true }, 'calca', 'meia', 'tenis'],
      passos: [['camiseta', 'calca', 'meia'], ['tenis']],
      total: 4
    },
    passos: [
      { id: 'quarto-f1-p1', momento: 'Abertura', duracaoPadrao: 3500, estadoLogi: 'falando', entra: true,
        fala: 'Oi, parceira! Vamos nos arrumar para a ESCOLA!', palavraChave: ['ESCOLA'],
        audiodescricao: 'Logi chega pulando no Quarto. Vamos montar a rotina para ir à escola.',
        teclado: NAV },

      { id: 'quarto-f1-p2', momento: 'Demonstração 1', duracaoPadrao: 4000, estadoLogi: 'apontando',
        fala: 'Um bloco está REPETIDO: o vermelho.', palavraChave: ['REPETIDO'], destaque: FONTE('calcarep'),
        audiodescricao: 'Tem duas calças na lista. Uma delas é vermelha: ela está repetida.',
        teclado: '— (só olhar)' },

      { id: 'quarto-f1-p3', momento: 'Demonstração 2', duracaoPadrao: 4000, estadoLogi: 'dica',
        fala: 'O vermelho fica FORA da fila.', palavraChave: ['FORA'], destaque: '#sequencia-corrigida',
        audiodescricao: 'O bloco vermelho é um erro. Ele não entra na fila.',
        teclado: '— (só olhar)' },

      { id: 'quarto-f1-p4', momento: 'Demonstração 3', duracaoPadrao: 4500, estadoLogi: 'apontando', tipo: 'toque',
        alvo: FONTE('camiseta'), efeito: a => a.adicionar('camiseta'),
        fala: 'Clique na CAMISETA para pôr na fila.', palavraChave: ['CAMISETA'],
        audiodescricao: 'A mãozinha toca em vestir a camiseta. Ela entra no primeiro lugar da fila.',
        teclado: 'Tab até “Vestir a camiseta” e Enter (ou arrastar)' },

      { id: 'quarto-f1-p5', momento: 'Demonstração 4', duracaoPadrao: 4000, estadoLogi: 'dica',
        fala: 'O TÊNIS vem sempre por último.', palavraChave: ['TÊNIS'],
        destaque: `${FONTE('tenis')}, #sequencia-corrigida > :nth-child(4)`,
        audiodescricao: 'Calçar o tênis é sempre o último passo da fila.',
        teclado: '— (só olhar)' },

      { id: 'quarto-f1-p6', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        alvo: FONTE('calca'), vez: { tipo: 'adicionar', valor: 'calca' },
        fala: 'Sua vez! Coloque a CALÇA certa na fila.', palavraChave: ['CALÇA'],
        audiodescricao: 'Sua vez! O foco está na calça certa, a que não é vermelha. Aperte Enter.',
        teclado: 'Foco já na calça certa: Enter ou Espaço',
        erro: { id: 'quarto-f1-p6-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          fala: 'Quase! Pegue a CALÇA que não é vermelha.', palavraChave: ['CALÇA'],
          audiodescricao: 'Quase! Essa não. Procure a calça que não é vermelha, a última da lista.',
          teclado: 'Tab até a calça sem “repetido” e Enter' } },

      { id: 'quarto-f1-p7', momento: 'Acerto', duracaoPadrao: 3200, estadoLogi: 'comemorando',
        fala: 'Isso! Você achou o bloco CERTO!', palavraChave: ['CERTO'], destaque: '#sequencia-corrigida',
        audiodescricao: 'Isso! A calça certa entrou na fila. Logi pula de alegria.',
        teclado: '— (só olhar)' },

      { id: 'quarto-f1-p8', momento: 'Fase começa', duracaoPadrao: 2600, estadoLogi: 'falando',
        fala: 'A FASE começa agora. Vamos lá!', palavraChave: ['FASE'],
        audiodescricao: 'Agora começa a fase de verdade.',
        teclado: '— (a fase abre com o foco no primeiro bloco)' }
    ]
  });
})();
