/* =============================================================
   Tutorial 1 — Sala, fases 1 e 2 (setas e botão Dica)
   100% interativo: o primeiro contato já é a vez da criança, sem
   demonstração. Cada passo é uma ação real no elemento real da fase.
   Grade de treino: robô em (3,0), estrela em (2,1).
   O passo da Dica existe só aqui, na Sala.
   ============================================================= */
(() => {
  const BLOCO = id => `#blocos-disponiveis [data-bloco-id="${id}"]`;

  Tutorial.registrar({
    id: 'sala-f1',
    comodo: 'Sala',
    titulo: 'Sala · Fase 1',
    /* Mapa de treino: não entrega a resposta da fase real */
    treino: { maxBlocos: 6, repetir: false, robo: [3, 0], estrela: [2, 1] },
    passos: [
      { id: 'sala-f1-p1', acao: 'click', estadoLogi: 'apontando', entra: true,
        alvo: BLOCO('cima'), evitar: '#sequencia-player', vez: { tipo: 'adicionar', valor: 'cima' },
        fala: 'Oi, {tratamento}! Leve o robô à ESTRELA. Toque em CIMA.', palavraChave: ['ESTRELA', 'CIMA'],
        audiodescricao: 'Logi, o robozinho laranja de lâmpada na cabeça, chega pulando. Leve o robô até a estrela. Toque na seta para cima: ela entra no primeiro espaço da fila.',
        teclado: 'Foco já em “Cima”: Enter ou Espaço' },

      { id: 'sala-f1-p2', acao: 'click', estadoLogi: 'apontando',
        alvo: BLOCO('dir'), evitar: '#sequencia-player', vez: { tipo: 'adicionar', valor: 'dir' },
        depois: a => a.trilha(),
        fala: 'Agora, a seta para a DIREITA.', palavraChave: ['DIREITA'],
        audiodescricao: 'Agora toque na seta para a direita. Ela entra depois da seta para cima.',
        teclado: 'Foco já em “Dir”: Enter ou Espaço' },

      { id: 'sala-f1-p3', acao: 'click', estadoLogi: 'dica',
        alvo: '#btn-executar', evitar: '#game-grid', vez: { tipo: 'executar' },
        fala: 'Aperte EXECUTAR e veja o robô andar.', palavraChave: ['EXECUTAR'],
        audiodescricao: 'Aperte Executar. O robô sobe, vai para a direita e pega a estrela!',
        teclado: 'Foco já em “Executar”: Enter ou Espaço' },

      { id: 'sala-f1-p4', acao: 'ok', estadoLogi: 'comemorando',
        destaque: '#celula-alvo', evitar: '#blocos-disponiveis',
        fala: 'Isso! O robô pegou a ESTRELA!', palavraChave: ['ESTRELA'],
        audiodescricao: 'Isso! O robô pegou a estrela. Logi pula de alegria.',
        teclado: 'Enter no botão “OK”' },

      { id: 'sala-f1-p5', acao: 'click', estadoLogi: 'dica',
        alvo: '#btn-dica', evitar: '#game-grid', vez: { tipo: 'dica' },
        fala: 'Travou? Toque na DICA que eu ajudo!', palavraChave: ['DICA'],
        audiodescricao: 'Se ficar com dificuldade ou presa na fase, toque no botão Dica, embaixo dos comandos. O Logi mostra onde está o problema.',
        teclado: 'Foco já em “Dica”: Enter ou Espaço' }
    ]
  });
})();
