/* =============================================================
   Tutorial da Cozinha — Fase 1 (Verdadeiro ou falso)
   Falas provisórias do storyboard "Tutoriais do Logi".
   ============================================================= */
(() => {
  const NAV = 'Tab chega em Pausar, Ver de novo e Pular';

  Tutorial.registrar({
    id: 'cozinha-f1',
    comodo: 'Cozinha',
    titulo: 'Cozinha · Fase 1',
    treino: { frase: 'O fogo NÃO é quente.' },
    passos: [
      { id: 'cozinha-f1-p1', momento: 'Abertura', duracaoPadrao: 3500, estadoLogi: 'falando', entra: true,
        fala: 'Oi, parceira! Que bom ver você na COZINHA!', palavraChave: ['COZINHA'],
        audiodescricao: 'Logi chega pulando na Cozinha. Tem uma frase e dois botões: Verdadeiro e Falso.',
        teclado: NAV },

      { id: 'cozinha-f1-p2', momento: 'Demonstração 1', duracaoPadrao: 4500, estadoLogi: 'apontando',
        efeito: a => a.lerPalavras(),
        fala: 'Leia a FRASE com calma.', palavraChave: ['FRASE'], destaque: '#pergunta-frase',
        audiodescricao: 'A frase é: O fogo não é quente. Cada palavra acende enquanto é lida.',
        teclado: '— (só olhar)' },

      { id: 'cozinha-f1-p3', momento: 'Demonstração 2', duracaoPadrao: 4000, estadoLogi: 'apontando',
        fala: 'VERDADEIRO é verde, FALSO é vermelho.', palavraChave: ['VERDADEIRO', 'FALSO'],
        destaque: '#btn-verdadeiro, #btn-falso',
        audiodescricao: 'O botão verde é Verdadeiro, tecla V. O botão vermelho é Falso, tecla F.',
        teclado: 'V = Verdadeiro · F = Falso' },

      { id: 'cozinha-f1-p4', momento: 'Demonstração 3', duracaoPadrao: 4000, estadoLogi: 'dica',
        fala: 'Leia com atenção a palavra NÃO.', palavraChave: ['NÃO'], destaque: '.tut-neg',
        audiodescricao: 'Atenção: a frase tem a palavra não. Ela muda tudo!',
        teclado: '— (só olhar)' },

      { id: 'cozinha-f1-p5', momento: 'Demonstração 4', duracaoPadrao: 4500, estadoLogi: 'apontando', tipo: 'toque',
        alvo: '#btn-falso', efeito: a => a.marcar('f'),
        fala: 'O fogo é quente. Então é FALSO!', palavraChave: ['FALSO'],
        audiodescricao: 'O fogo é quente, então a frase está errada. A mãozinha aperta Falso.',
        teclado: 'Tecla F' },

      { id: 'cozinha-f1-p6', momento: 'Sua vez', estadoLogi: 'aguardando', tipo: 'vez',
        antes: a => { a.frase('O gelo NUNCA é quente.'); },
        alvo: '#btn-verdadeiro', foco: '#pergunta-box', destaque: '.tut-neg',
        vez: { tipo: 'responder', valor: 'v' },
        fala: 'Sua vez! Cuidado com a palavra NUNCA.', palavraChave: ['NUNCA'],
        audiodescricao: 'Sua vez! A frase é: O gelo nunca é quente. É verdadeiro ou falso? Aperte V ou F.',
        teclado: 'V ou F (ou Tab até o botão e Enter)',
        erro: { id: 'cozinha-f1-p6-erro', momento: 'Erro na vez', estadoLogi: 'encorajando',
          efeito: a => a.lerPalavras(), destaque: '.tut-neg',
          fala: 'Quase! Leia de novo a palavra NUNCA.', palavraChave: ['NUNCA'],
          audiodescricao: 'Quase! O gelo é sempre frio. Ele nunca é quente. Tente de novo.',
          teclado: 'V ou F' } },

      { id: 'cozinha-f1-p7', momento: 'Acerto', duracaoPadrao: 3200, estadoLogi: 'comemorando',
        fala: 'Isso! Você leu com muita ATENÇÃO!', palavraChave: ['ATENÇÃO'], destaque: '#btn-verdadeiro',
        audiodescricao: 'Isso! É verdadeiro: o gelo nunca é quente. Logi pula de alegria.',
        teclado: '— (só olhar)' },

      { id: 'cozinha-f1-p8', momento: 'Fase começa', duracaoPadrao: 2600, estadoLogi: 'falando',
        fala: 'A FASE começa agora. Vamos lá!', palavraChave: ['FASE'],
        audiodescricao: 'Agora começa a fase de verdade.',
        teclado: '— (V e F continuam valendo)' }
    ]
  });
})();
