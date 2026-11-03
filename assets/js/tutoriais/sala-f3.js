/* =============================================================
   Tutorial 2 — Sala, fase 3 (bloco Repetir)
   Cada passo é uma ação real no elemento real da fase.
   Campos: id, acao ('ok' | 'click'), alvo, destaque, vez (ação que
   vale no passo 'click'), fala (até 8 palavras), palavraChave,
   estadoLogi, audiodescricao, teclado, depois (roda após a ação),
   evitar (região que o balão tenta não cobrir).
   Grade de treino: robô em (3,0), estrela em (0,0), 4 espaços.
   ============================================================= */
(() => {
  const BLOCO = id => `#blocos-disponiveis [data-bloco-id="${id}"]`;

  Tutorial.registrar({
    id: 'sala-f3',
    comodo: 'Sala',
    titulo: 'Sala · Fase 3',
    /* Mapa de treino: não entrega a resposta da fase real */
    treino: { maxBlocos: 4, repetir: true, robo: [3, 0], estrela: [0, 0] },
    passos: [
      { id: 'sala-f3-p1', acao: 'ok', estadoLogi: 'falando', entra: true,
        alvo: BLOCO('repetir2'),
        fala: 'Oi, {tratamento}! Hoje tem um bloco NOVO!', palavraChave: ['NOVO'],
        audiodescricao: 'Logi, o robozinho laranja de lâmpada na cabeça, chega pulando na Sala. Tem um bloco novo, amarelo, chamado Repetir 2x.',
        teclado: 'Enter no botão “OK”' },

      { id: 'sala-f3-p2', acao: 'click', estadoLogi: 'apontando',
        alvo: BLOCO('cima'), evitar: '#sequencia-player', vez: { tipo: 'adicionar', valor: 'cima' },
        fala: 'Primeiro, a seta para CIMA.', palavraChave: ['CIMA'],
        audiodescricao: 'Sua vez. Toque na seta para cima. Ela entra no primeiro espaço da fila.',
        teclado: 'Foco já em “Cima”: Enter ou Espaço' },

      { id: 'sala-f3-p3', acao: 'click', estadoLogi: 'dica',
        alvo: BLOCO('repetir2'), evitar: '#sequencia-player', vez: { tipo: 'adicionar', valor: 'repetir2' },
        depois: a => a.trilha(),
        fala: 'O REPETIR faz a seta mais 2 vezes.', palavraChave: ['REPETIR'],
        audiodescricao: 'Agora toque no bloco Repetir 2x. A seta para cima passa a valer três vezes: o caminho sobe três casas.',
        teclado: 'Foco já em “Repetir 2x”: Enter ou Espaço' },

      { id: 'sala-f3-p4', acao: 'click', estadoLogi: 'apontando',
        alvo: '#btn-executar', evitar: '#game-grid', vez: { tipo: 'executar' },
        fala: 'Aperte EXECUTAR e veja o robô subir.', palavraChave: ['EXECUTAR'],
        audiodescricao: 'Aperte Executar. O robô sobe: um, dois, três passos, e pega a estrela!',
        teclado: 'Foco já em “Executar”: Enter ou Espaço' },

      { id: 'sala-f3-p5', acao: 'ok', estadoLogi: 'comemorando',
        alvo: '#sequencia-player', evitar: '#game-grid',
        fala: 'Dois blocos fizeram TRÊS passos!', palavraChave: ['TRÊS'],
        audiodescricao: 'Com só dois blocos, o robô andou três passos. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' }
    ]
  });
})();
