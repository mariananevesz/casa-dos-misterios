/* =============================================================
   Tutorial 4 — Cozinha, fase 1 (Verdadeiro ou Falso)
   1) O Logi lê a FRASE com a criança (cada palavra acende);
   2) chama atenção para a palavra que muda o sentido (NUNCA);
   3) pergunta: é Verdadeiro ou Falso? (os DOIS botões ficam em
      destaque e a mão não aponta para nenhum deles);
   4) comemora o acerto.
   O balão do Logi sempre fica FORA da frase, para dar para ler.
   Se errar, o Logi explica o porquê, a criança toca em OK e tenta
   de novo com OUTRA frase de exemplo.
   ============================================================= */
(() => {
  /* Frases de treino, na ordem em que aparecem a cada erro (volta ao começo no fim) */
  const EXEMPLOS = [
    { frase: 'O gelo NUNCA é quente.', resposta: 'v',
      porque: 'Quase! O gelo é FRIO. Ele NUNCA é quente. É VERDADEIRO!' },
    { frase: 'O sol NÃO é quente.', resposta: 'f',
      porque: 'Quase! O sol é QUENTE. A frase diz que NÃO é. É FALSO!' },
    { frase: 'O fogo NUNCA é frio.', resposta: 'v',
      porque: 'Quase! O fogo é QUENTE. Ele NUNCA é frio. É VERDADEIRO!' }
  ];
  let atual = 0;

  const brilhaNegacao = () => document.querySelector('#pergunta-frase .tut-neg')?.classList.add('tut-brilha');
  const apagaNegacao = () => document.querySelectorAll('#pergunta-frase .tut-brilha').forEach(w => w.classList.remove('tut-brilha'));

  Tutorial.registrar({
    id: 'cozinha-f1',
    comodo: 'Cozinha',
    titulo: 'Cozinha · Fase 1',
    treino: { frase: EXEMPLOS[0].frase },
    passos: [
      /* 1 — lê a frase inteira, palavra por palavra */
      { id: 'cozinha-f1-p1', acao: 'ok', estadoLogi: 'falando', entra: true,
        antes: () => { atual = 0; },
        destaque: '#pergunta-box', evitar: '.cozinha-vf',
        efeito: a => a.lerPalavras(),
        fala: 'Oi, {tratamento}! Vamos LER a frase juntos.', palavraChave: ['LER'],
        audiodescricao: 'Logi chega pulando na Cozinha. A frase de treino é: O gelo nunca é quente. Cada palavra acende enquanto o Logi lê.',
        teclado: 'Enter no botão “OK”' },

      /* 2 — a palavra que muda o sentido */
      { id: 'cozinha-f1-p2', acao: 'ok', estadoLogi: 'dica',
        destaque: '#pergunta-box', evitar: '.cozinha-vf',
        efeito: brilhaNegacao, depois: apagaNegacao,
        fala: 'Olhe a palavra NUNCA. Ela muda o sentido da frase!', palavraChave: ['NUNCA'],
        audiodescricao: 'A palavra nunca está brilhando na frase. Ela muda o sentido: o gelo nunca é quente quer dizer que o gelo é sempre frio.',
        teclado: 'Enter no botão “OK”' },

      /* 3 — a criança tenta acertar */
      { id: 'cozinha-f1-p3', acao: 'click', estadoLogi: 'aguardando', semMao: true,
        destaque: '#pergunta-box, .cozinha-vf', alvo: '#btn-verdadeiro, #btn-falso',
        foco: '#pergunta-box', evitar: '#pergunta-box, .cozinha-vf',
        vez: () => ({ tipo: 'responder', valor: EXEMPLOS[atual].resposta }),
        fala: 'Sua vez! Tente acertar: a frase é VERDADEIRA ou FALSA?', palavraChave: ['VERDADEIRA', 'FALSA'],
        audiodescricao: 'Sua vez! Leia a frase e tente acertar: o botão verde é Verdadeiro, tecla V. O botão vermelho é Falso, tecla F.',
        teclado: 'V = Verdadeiro · F = Falso',
        erro: {
          estadoLogi: 'encorajando', ok: true, destaque: '#pergunta-box',
          efeito: brilhaNegacao,
          fala: () => EXEMPLOS[atual].porque,
          audiodescricao: 'Quase! Leia o motivo e toque em OK para tentar de novo com outra frase.',
          teclado: 'Enter no botão “OK”',
          depois: a => { atual = (atual + 1) % EXEMPLOS.length; a.frase(EXEMPLOS[atual].frase); },
          falaDepois: 'Outra FRASE! Tente de novo.', palavraChaveDepois: ['FRASE']
        } },

      /* 4 — acertou */
      { id: 'cozinha-f1-p4', acao: 'ok', estadoLogi: 'comemorando',
        destaque: '.tut-certo', evitar: '#pergunta-box, .cozinha-vf',
        fala: 'Isso! Você leu com ATENÇÃO!', palavraChave: ['ATENÇÃO'],
        audiodescricao: 'Isso! Você acertou. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' }
    ]
  });
})();
