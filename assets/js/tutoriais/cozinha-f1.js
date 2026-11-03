/* =============================================================
   Tutorial 4 — Cozinha, fase 1 (Verdadeiro ou Falso)
   Cada passo é uma ação real. No passo da vez, os DOIS botões ficam
   em destaque (a criança escolhe entre Verdadeiro e Falso) e a mão
   não aponta para nenhum deles. Se errar, o Logi explica o porquê, a
   criança toca em OK e tenta de novo com OUTRA frase de exemplo.
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

  Tutorial.registrar({
    id: 'cozinha-f1',
    comodo: 'Cozinha',
    titulo: 'Cozinha · Fase 1',
    treino: { frase: EXEMPLOS[0].frase },
    passos: [
      { id: 'cozinha-f1-p1', acao: 'ok', estadoLogi: 'falando', entra: true,
        antes: () => { atual = 0; },
        destaque: '.tut-neg', evitar: '.cozinha-vf',
        fala: 'Oi, {tratamento}! Atenção na palavra NUNCA.', palavraChave: ['NUNCA'],
        audiodescricao: 'Logi chega pulando na Cozinha. A frase é: O gelo nunca é quente. Repare na palavra nunca, ela muda o sentido da frase.',
        teclado: 'Enter no botão “OK”' },

      { id: 'cozinha-f1-p2', acao: 'click', estadoLogi: 'aguardando', semMao: true,
        alvo: '#btn-verdadeiro, #btn-falso', foco: '#pergunta-box', evitar: '#pergunta-box',
        vez: () => ({ tipo: 'responder', valor: EXEMPLOS[atual].resposta }),
        fala: 'É VERDADEIRO ou FALSO? Toque em um botão.', palavraChave: ['VERDADEIRO', 'FALSO'],
        audiodescricao: 'Sua vez! Leia a frase e escolha: o botão verde é Verdadeiro, tecla V. O botão vermelho é Falso, tecla F.',
        teclado: 'V = Verdadeiro · F = Falso',
        erro: {
          estadoLogi: 'encorajando', ok: true, destaque: '.tut-neg',
          fala: () => EXEMPLOS[atual].porque,
          audiodescricao: 'Quase! Leia o motivo e toque em OK para tentar de novo com outra frase.',
          teclado: 'Enter no botão “OK”',
          depois: a => { atual = (atual + 1) % EXEMPLOS.length; a.frase(EXEMPLOS[atual].frase); },
          falaDepois: 'Outra FRASE! Tente de novo.', palavraChaveDepois: ['FRASE']
        } },

      { id: 'cozinha-f1-p3', acao: 'ok', estadoLogi: 'comemorando',
        destaque: '.tut-certo', evitar: '#pergunta-box',
        fala: 'Isso! Você leu com ATENÇÃO!', palavraChave: ['ATENÇÃO'],
        audiodescricao: 'Isso! Você acertou. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' }
    ]
  });
})();
