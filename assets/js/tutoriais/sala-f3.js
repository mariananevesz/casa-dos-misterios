/* =============================================================
   Tutorial da Sala — Fase 3 (Repetição + direção)
   Passos do storyboard "Tutoriais do Logi". Cada passo:
     id, momento, fala, palavraChave, alvo, destaque, estadoLogi,
     audiodescricao, teclado, duracaoPadrao, tipo ('toque' | 'vez'),
     efeito/antes (usam as ações da página), vez, erro.
   ============================================================= */
(() => {
  const NAV = 'Tab chega em Pausar, Ver de novo e Pular';
  const BLOCO = id => `#blocos-disponiveis [data-bloco-id="${id}"]`;

  Tutorial.registrar({
    id: 'sala-f3',
    comodo: 'Sala',
    titulo: 'Sala · Fase 3',
    /* Mapa de treino: não entrega a resposta da fase real */
    treino: { maxBlocos: 4, repetir: true, robo: [3, 0], estrela: [0, 0] },
    passos: [
      { id: 'sala-f3-p1', momento: 'Abertura', duracaoPadrao: 3500, estadoLogi: 'falando', entra: true,
        fala: 'Oi, parceira! Hoje tem um bloco NOVO!', palavraChave: ['NOVO'], destaque: BLOCO('repetir2'),
        audiodescricao: 'Logi, o robozinho laranja de lâmpada na cabeça, chega pulando na Sala. Tem um bloco novo, amarelo, chamado Repetir.',
        teclado: NAV },

      { id: 'sala-f3-p2', momento: 'Demonstração 1', duracaoPadrao: 3500, estadoLogi: 'apontando',
        fala: 'Só cabem QUATRO blocos na fila.', palavraChave: ['QUATRO'], destaque: '#sequencia-player',
        audiodescricao: 'A fila de comandos tem só quatro espaços vazios.',
        teclado: '— (só olhar)' },

      { id: 'sala-f3-p3', momento: 'Demonstração 2', duracaoPadrao: 4500, estadoLogi: 'apontando', tipo: 'toque',
        alvo: BLOCO('cima'), efeito: a => a.adicionar('cima'),
        fala: 'Primeiro, a seta para CIMA.', palavraChave: ['CIMA'],
        audiodescricao: 'A mãozinha toca na seta para cima. A seta entra no primeiro espaço da fila.',
        teclado: 'Tab até “Cima” e Enter (ou arrastar o bloco até a fila)' },

      { id: 'sala-f3-p4', momento: 'Demonstração 3', duracaoPadrao: 5000, estadoLogi: 'dica', tipo: 'toque',
        alvo: BLOCO('repetir2'), efeito: a => { a.adicionar('repetir2'); a.trilha(); },
        fala: 'O REPETIR faz a seta mais duas vezes.', palavraChave: ['REPETIR'],
        audiodescricao: 'A mãozinha toca no bloco Repetir. Agora a seta para cima vale três vezes: o caminho sobe três casas.',
        teclado: 'Tab até “Repetir 2x” e Enter' },

      { id: 'sala-f3-p5', momento: 'Demonstração 4', duracaoPadrao: 4500, estadoLogi: 'apontando', tipo: 'toque',
        alvo: '#btn-executar', efeito: a => a.executar(),
        fala: 'Aperte EXECUTAR e veja o robô subir.', palavraChave: ['EXECUTAR'],
        audiodescricao: 'A mãozinha aperta Executar. O robô sobe: um, dois, três passos, e pega a estrela!',
        teclado: 'Tab até “Executar” e Enter' },

      { id: 'sala-f3-p6', momento: 'Demonstração 5', duracaoPadrao: 3500, estadoLogi: 'dica',
        fala: 'Dois blocos fizeram TRÊS passos!', palavraChave: ['TRÊS'], destaque: '#sequencia-player',
        audiodescricao: 'Com só dois blocos, o robô andou três passos.',
        teclado: '— (só olhar)' },

      { id: 'sala-f3-p7', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        antes: a => { a.limpar(); a.definirGrade([0, 0], [0, 3]); a.adicionar('dir'); },
        alvo: BLOCO('repetir2'), vez: { tipo: 'adicionar', valor: 'repetir2' },
        fala: 'Sua vez! Coloque o REPETIR depois da seta.', palavraChave: ['REPETIR'],
        audiodescricao: 'Sua vez! A estrela foi para a direita. A seta para a direita já está na fila. O foco está no bloco Repetir: aperte Enter.',
        teclado: 'Foco já no “Repetir 2x”: Enter ou Espaço',
        erro: { id: 'sala-f3-p7-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          fala: 'Quase! Procure o bloco amarelo, o REPETIR.', palavraChave: ['REPETIR'],
          audiodescricao: 'Quase! Esse não é o Repetir. O Repetir é o bloco amarelo, o último da lista.',
          teclado: 'Tab até “Repetir 2x” e Enter' } },

      { id: 'sala-f3-p8', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        alvo: '#btn-executar', vez: { tipo: 'executar' },
        fala: 'Agora aperte EXECUTAR.', palavraChave: ['EXECUTAR'],
        audiodescricao: 'Agora o foco está em Executar. Aperte Enter para o robô andar.',
        teclado: 'Foco já em “Executar”: Enter',
        erro: { id: 'sala-f3-p8-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          fala: 'Quase! Aperte o botão EXECUTAR.', palavraChave: ['EXECUTAR'],
          audiodescricao: 'Quase! Agora é o botão Executar, embaixo dos blocos.',
          teclado: 'Tab até “Executar” e Enter' } },

      { id: 'sala-f3-p9', momento: 'Acerto', duracaoPadrao: 3200, estadoLogi: 'comemorando',
        fala: 'Isso! Você usou só DOIS blocos!', palavraChave: ['DOIS'], destaque: '#celula-alvo',
        audiodescricao: 'Isso! O robô pegou a estrela com só dois blocos. Logi pula de alegria.',
        teclado: '— (só olhar)' },

      { id: 'sala-f3-p10', momento: 'Fase começa', duracaoPadrao: 2600, estadoLogi: 'falando',
        fala: 'A FASE começa agora. Vamos lá!', palavraChave: ['FASE'],
        audiodescricao: 'Agora começa a fase de verdade.',
        teclado: '— (a fase abre com o foco no primeiro bloco)' }
    ]
  });
})();
