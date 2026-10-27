/* =============================================================
   Tutorial da Sala — Fase 1 (Blocos de direção)
   Falas provisórias do storyboard "Tutoriais do Logi".
   ============================================================= */
(() => {
  const NAV = 'Tab chega em Pausar, Ver de novo e Pular';
  const BLOCO = id => `#blocos-disponiveis [data-bloco-id="${id}"]`;

  Tutorial.registrar({
    id: 'sala-f1',
    comodo: 'Sala',
    titulo: 'Sala · Fase 1',
    treino: { maxBlocos: 6, repetir: false, robo: [3, 0], estrela: [2, 1] },
    passos: [
      { id: 'sala-f1-p1', momento: 'Abertura', duracaoPadrao: 3500, estadoLogi: 'falando', entra: true,
        fala: 'Oi, parceira de investigação! Vamos para a SALA!', palavraChave: ['SALA'],
        audiodescricao: 'Logi, o robozinho laranja de lâmpada na cabeça, chega pulando na Sala. Tem uma grade com um robô e uma estrela.',
        teclado: NAV },

      { id: 'sala-f1-p2', momento: 'Demonstração 1', duracaoPadrao: 3500, estadoLogi: 'apontando',
        fala: 'Leve o robô até a ESTRELA.', palavraChave: ['ESTRELA'], destaque: '#celula-alvo',
        audiodescricao: 'O robô está embaixo, à esquerda. A estrela está uma casa acima e uma à direita.',
        teclado: '— (só olhar)' },

      { id: 'sala-f1-p3', momento: 'Demonstração 2', duracaoPadrao: 3500, estadoLogi: 'apontando',
        fala: 'As SETAS mostram o caminho.', palavraChave: ['SETAS'], destaque: '#blocos-disponiveis',
        audiodescricao: 'Tem quatro setas: cima, baixo, esquerda e direita.',
        teclado: '— (só olhar)' },

      { id: 'sala-f1-p4', momento: 'Demonstração 3', duracaoPadrao: 4500, estadoLogi: 'apontando', tipo: 'toque',
        alvo: BLOCO('cima'), efeito: a => a.adicionar('cima'),
        fala: 'Clique na seta para CIMA.', palavraChave: ['CIMA'],
        audiodescricao: 'A mãozinha toca na seta para cima. Ela entra na fila.',
        teclado: 'Tab até “Cima” e Enter (ou arrastar até a fila)' },

      { id: 'sala-f1-p5', momento: 'Demonstração 4', duracaoPadrao: 4500, estadoLogi: 'apontando', tipo: 'toque',
        alvo: BLOCO('dir'), efeito: a => { a.adicionar('dir'); a.trilha(); },
        fala: 'Agora a seta para a DIREITA.', palavraChave: ['DIREITA'],
        audiodescricao: 'A mãozinha toca na seta para a direita. Ela entra depois da seta para cima.',
        teclado: 'Tab até “Dir” e Enter' },

      { id: 'sala-f1-p6', momento: 'Demonstração 5', duracaoPadrao: 4500, estadoLogi: 'dica', tipo: 'toque',
        alvo: '#btn-executar', efeito: a => a.executar(),
        fala: 'Aperte EXECUTAR e veja o robô andar.', palavraChave: ['EXECUTAR'],
        audiodescricao: 'A mãozinha aperta Executar. O robô sobe, vai para a direita e pega a estrela!',
        teclado: 'Tab até “Executar” e Enter' },

      { id: 'sala-f1-p7', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        antes: a => { a.limpar(); a.definirGrade([2, 0], [2, 1]); },
        alvo: BLOCO('dir'), vez: { tipo: 'adicionar', valor: 'dir' },
        fala: 'Sua vez! Clique na seta DIREITA.', palavraChave: ['DIREITA'],
        audiodescricao: 'Sua vez! A estrela está do lado direito do robô. O foco está na seta para a direita: aperte Enter.',
        teclado: 'Foco já em “Dir”: Enter ou Espaço',
        erro: { id: 'sala-f1-p7-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          fala: 'Quase! O robô precisa ir para a DIREITA.', palavraChave: ['DIREITA'],
          audiodescricao: 'Quase! A estrela está à direita. Procure a seta para a direita.',
          teclado: 'Tab até “Dir” e Enter' } },

      { id: 'sala-f1-p8', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        alvo: '#btn-executar', vez: { tipo: 'executar' },
        fala: 'Agora aperte EXECUTAR.', palavraChave: ['EXECUTAR'],
        audiodescricao: 'Agora o foco está em Executar. Aperte Enter.',
        teclado: 'Foco já em “Executar”: Enter',
        erro: { id: 'sala-f1-p8-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          fala: 'Quase! Aperte o botão EXECUTAR.', palavraChave: ['EXECUTAR'],
          audiodescricao: 'Quase! Agora é o botão Executar.',
          teclado: 'Tab até “Executar” e Enter' } },

      { id: 'sala-f1-p9', momento: 'Acerto', duracaoPadrao: 3200, estadoLogi: 'comemorando',
        fala: 'Isso! O robô chegou na ESTRELA!', palavraChave: ['ESTRELA'], destaque: '#celula-alvo',
        audiodescricao: 'Isso! O robô pegou a estrela. Logi pula de alegria.',
        teclado: '— (só olhar)' },

      { id: 'sala-f1-p10', momento: 'Fase começa', duracaoPadrao: 2600, estadoLogi: 'falando',
        fala: 'A FASE começa agora. Vamos lá!', palavraChave: ['FASE'],
        audiodescricao: 'Agora começa a fase de verdade.',
        teclado: '— (a fase abre com o foco no primeiro bloco)' }
    ]
  });
})();
