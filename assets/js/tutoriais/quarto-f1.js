/* =============================================================
   Tutorial 3 — Quarto, fase 1 (achar o bloco que não combina)
   Interativo: o primeiro passo já é a vez da criança. O bloco
   vermelho ("calcarep") é a calça REPETIDA e fica fora da fila.
   Se tocar no bloco errado, o Logi explica o porquê e a criança
   tenta de novo.
   ============================================================= */
(() => {
  const FONTE = id => `#blocos-fonte [data-bloco-id="${id}"]`;
  const NOME = { camiseta: 'A camiseta', calca: 'A calça', tenis: 'O tênis' };

  /* Explicação do erro, conforme o bloco em que a criança tocou */
  const jaNaFila = id => NOME[id] ? `${NOME[id]} já está na fila.` : '';

  Tutorial.registrar({
    id: 'quarto-f1',
    comodo: 'Quarto',
    titulo: 'Quarto · Fase 1',
    /* Blocos de treino: "calcarep" é a calça REPETIDA (vermelha), que fica fora da fila */
    treino: {
      blocos: ['camiseta', { id: 'calcarep', base: 'calca', erro: true }, 'calca', 'tenis'],
      passos: [['camiseta', 'calca', 'tenis']],
      ordem: [['calca', 'tenis']],
      total: 3
    },
    passos: [
      { id: 'quarto-f1-p1', acao: 'click', estadoLogi: 'apontando', entra: true,
        alvo: FONTE('camiseta'), evitar: '#sequencia-corrigida', vez: { tipo: 'adicionar', valor: 'camiseta' },
        fala: 'Oi, {tratamento}! Toque na CAMISETA para pôr na fila.', palavraChave: ['CAMISETA'],
        audiodescricao: 'Logi chega pulando no Quarto. Vamos montar a rotina para ir à escola. Toque em vestir a camiseta: ela entra no primeiro lugar da fila.',
        teclado: 'Foco já em “Vestir a camiseta”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'calcarep' ? 'Esse bloco está REPETIDO. Comece pela CAMISETA.' : 'Quase! Comece pela CAMISETA.',
          audiodescricao: 'Quase! Procure o bloco vestir a camiseta.', teclado: 'Tab até “Vestir a camiseta” e Enter' } },

      { id: 'quarto-f1-p2', acao: 'ok', estadoLogi: 'dica',
        destaque: FONTE('calcarep'), evitar: '#sequencia-corrigida',
        fala: 'Este bloco está REPETIDO. Ele fica FORA!', palavraChave: ['REPETIDO', 'FORA'],
        audiodescricao: 'Tem duas calças na lista. A vermelha está repetida: ela não entra na fila.',
        teclado: 'Enter no botão “OK”' },

      { id: 'quarto-f1-p3', acao: 'click', estadoLogi: 'aguardando',
        alvo: FONTE('calca'), evitar: '#sequencia-corrigida', vez: { tipo: 'adicionar', valor: 'calca' },
        fala: 'Sua vez! Coloque a CALÇA certa na fila.', palavraChave: ['CALÇA'],
        audiodescricao: 'Sua vez! Toque na calça que não é vermelha.',
        teclado: 'Foco já na calça certa: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 4000, destaque: FONTE('calcarep'),
          fala: (a, id) => id === 'calcarep' ? 'Esse é o REPETIDO, o vermelho. Toque na outra CALÇA.'
            : id === 'tenis' ? 'O TÊNIS vem DEPOIS da calça. Primeiro, a CALÇA.'
            : `${jaNaFila(id)} Toque na CALÇA.`,
          audiodescricao: 'Quase! Procure a calça que não é vermelha.', teclado: 'Tab até a calça sem “repetido” e Enter' } },

      { id: 'quarto-f1-p4', acao: 'click', estadoLogi: 'dica',
        alvo: FONTE('tenis'), evitar: '#sequencia-corrigida', vez: { tipo: 'adicionar', valor: 'tenis' },
        fala: 'O TÊNIS vem DEPOIS da calça e da meia.', palavraChave: ['TÊNIS', 'DEPOIS'],
        audiodescricao: 'Calçar o tênis vem depois de vestir a calça e calçar a meia. Toque em calçar o tênis.',
        teclado: 'Foco já em “Calçar o tênis”: Enter ou Espaço',
        erro: { estadoLogi: 'encorajando', duracaoPadrao: 3500,
          fala: (a, id) => id === 'calcarep' ? 'Esse bloco é REPETIDO. Toque no TÊNIS.' : `${jaNaFila(id)} Toque no TÊNIS.`,
          audiodescricao: 'Quase! Falta o tênis, que vem depois da calça.', teclado: 'Tab até “Calçar o tênis” e Enter' } },

      { id: 'quarto-f1-p5', acao: 'click', estadoLogi: 'apontando',
        alvo: '#btn-verificar', evitar: '#sequencia-corrigida', vez: { tipo: 'verificar' },
        fala: 'Aperte VERIFICAR para conferir.', palavraChave: ['VERIFICAR'],
        audiodescricao: 'A fila está pronta. Aperte Verificar sequência para conferir.',
        teclado: 'Foco já em “Verificar sequência”: Enter ou Espaço' }
    ]
  });
})();
