# A Casa dos Mistérios Lógicos

Jogo educativo interativo desenvolvido em HTML, CSS e JavaScript para alunos do 2º e 3º ano do Ensino Fundamental. O jogo aborda conceitos de pensamento computacional — algoritmos, depuração, lógica verdadeiro/falso e reconhecimento de padrões — alinhados às habilidades da BNCC Computação.

---

## Estrutura de Diretórios

```
casa-dos-misterios/
├── assets/
│   ├── css/
│   │   └── estilos.css          # Folha de estilo global (paleta, componentes)
│   ├── js/
│   │   └── plataforma.js        # Comunicação com a plataforma (Seção 8 do manual)
│   ├── data/
│   │   ├── sala.json            # Conteúdo dinâmico do mini-jogo 1
│   │   ├── quarto.json          # Conteúdo dinâmico do mini-jogo 2
│   │   ├── cozinha.json         # Conteúdo dinâmico do mini-jogo 3
│   │   └── despensa.json        # Conteúdo dinâmico do mini-jogo 4
│   ├── pages/
│   │   ├── MapaCasa.html        # Seleção de cômodo / mapa de progressão
│   │   ├── Sala.html            # Mini-jogo 1: Algoritmos
│   │   ├── Quarto.html          # Mini-jogo 2: Depuração
│   │   ├── Cozinha.html         # Mini-jogo 3: Verdadeiro ou Falso
│   │   ├── Despensa.html        # Mini-jogo 4: Padrões e Organização
│   │   └── TelaPontuacao.html   # Tela de resultado final
│   ├── img/                     # Imagens (a popular conforme desenvolvimento)
│   └── audio/                   # Áudios (a popular conforme desenvolvimento)
├── index.html                   # Ponto de entrada obrigatório (Tela Inicial)
└── README.md                    # Este arquivo
```

---

## Mecânica Principal

O jogo é estruturado em quatro mini-jogos independentes, acessados de forma progressiva via `MapaCasa.html`. Cada cômodo é desbloqueado apenas após a conclusão do anterior.

### Mini-jogo 1 — Sala (Algoritmos) `EF02CO02`
O jogador organiza blocos de comando (cima, baixo, esquerda, direita, repetir) em uma sequência para mover um personagem em uma grade 4×4 até a posição alvo. A lógica de execução deve percorrer a sequência montada pelo jogador e mover o personagem célula a célula, verificando ao final se a posição coincide com o alvo.

### Mini-jogo 2 — Quarto (Depuração) `EF02CO02`
É apresentada uma sequência de ações com blocos repetidos ou fora de ordem. O jogador deve identificar os erros, remover blocos indevidos e reorganizar os corretos. A verificação compara a sequência montada pelo jogador com `sequenciaCorreta` definida em `quarto.json`.

### Mini-jogo 3 — Cozinha (Verdadeiro ou Falso) `EF03CO01`
São exibidas frases do cotidiano, algumas com negação. O jogador seleciona Verdadeiro ou Falso. O conteúdo (frases e respostas corretas) é carregado de `cozinha.json`. O progresso é exibido pelas bolinhas no topo da tela.

### Mini-jogo 4 — Despensa (Padrões e Organização) `EF02CO01`
O jogador arrasta itens para uma prateleira seguindo o critério definido pelo nível ativo (cor, tamanho ou categoria). O jogo implementa 3 níveis de dificuldade: **Fácil**, **Médio** e **Difícil**, conforme a Seção 6 do manual. Os dados de cada nível estão em `despensa.json`.

---

## Sistema de Pontuação

Escala de 0 a 100 pontos, conforme a Seção 4 do manual. Cada cômodo vale até 25 pontos:

| Erros cometidos | Pontos do cômodo |
|-----------------|-----------------|
| 0               | 25              |
| 1               | 20              |
| 2               | 15              |
| 3 ou mais       | 10              |

A pontuação final é a soma dos quatro cômodos. O envio para a plataforma ocorre na `TelaPontuacao.html` via `sendFinalScore()`.

---

## Comunicação com a Plataforma

Toda a comunicação é feita por `assets/js/plataforma.js`, que expõe duas funções globais:

- **`getPlatformDifficulty()`** — lê o parâmetro `?dificuldade=` da URL. Fallback: `'Médio'`.
- **`sendFinalScore({ score, difficulty })`** — dispara um `postMessage` do tipo `C4A_GAME_SCORE` para o frame pai. Enviado uma única vez por partida, controlado pela flag `scoreSent`.

Exemplo de integração ao finalizar um cômodo:
```javascript
sendFinalScore({
  score: Math.round((acertos / total) * 100),
  difficulty: getPlatformDifficulty()
});
```

---

## Conteúdo Dinâmico (JSON)

Todo conteúdo variável (perguntas, sequências, itens) está desacoplado do HTML e deve ser carregado via `fetch` a partir dos arquivos em `assets/data/`. Nenhuma pergunta, frase ou sequência de blocos deve ser hardcoded no HTML ou JS de cada tela.

---

## Dependências

Nenhuma biblioteca externa é utilizada no estado atual do protótipo. O projeto usa exclusivamente HTML5, CSS3 e JavaScript puro (ES2020+). Caso futuras animações justifiquem o uso de Anime.js ou GSAP, a aprovação da equipe de plataforma é necessária antes da adição (conforme Seção 9 do manual).

---

## Habilidades BNCC Atendidas

| Código     | Descrição resumida                                                    | Mini-jogo    |
|------------|-----------------------------------------------------------------------|--------------|
| EF02CO01   | Criar e comparar modelos, identificando padrões e atributos           | Despensa     |
| EF02CO02   | Criar e simular algoritmos com sequências e repetições simples        | Sala / Quarto|
| EF03CO01   | Associar verdadeiro/falso a sentenças lógicas do cotidiano            | Cozinha      |
