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
O jogador monta a rotina para IR À ESCOLA (camiseta e calça em qualquer ordem, depois meia e tênis). No nível fácil há um bloco repetido (vermelho); nos níveis médio e difícil entram blocos intrusos sorteados a cada jogada (ex.: assistir TV), que só ficam vermelhos ao clicar na dica. A validação usa os grupos de `passos` definidos em `quarto.json`.

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

---

## Decisões de acessibilidade (leitor de tela e teclado)

Tarefas 105 a 109 (PBI 100).

- **`<button>` nativo no lugar de `<area>` (Task 107).** O elemento `<area>` é próprio de mapas de imagem (`<map>`): serve para links em regiões de uma figura, não para botões de comando, e não tem o comportamento de botão (Enter/Espaço, estado, foco). Por isso os blocos da Sala, do Quarto e as frutas da Despensa são `<button type="button">`. O texto do botão é lido pelo leitor de tela e Enter/Espaço funcionam sem código extra. Decisão registrada aqui e na Task 107.
- **Tab e setas (Tasks 107 e 104).** Todos os botões ficam no Tab, na ordem da tela (ex.: Cima, Baixo, Esquerda, Direita, Dica), e no fim da página o Tab volta para o botão Mapa (`elementosDoTab` em `plataforma.js`; F6 ou Ctrl+L saem da página). As setas **não** são interceptadas pelo jogo: com o Narrador em modo de leitura elas já andam entre os botões e os textos, e um tratamento próprio de ←/→ duplicava o movimento e atrapalhava a leitura.
- **Atalhos sempre com Alt** (não brigam com as teclas de navegação do Narrador/NVDA/JAWS nem com o Chrome): `Alt+J` abre a ajuda do cômodo, `Alt+R` lê de novo a instrução completa (com o treino do Logi aberto, reinicia o treino), `Alt+S` lê o resumo do que foi montado, `Alt+1` e `Alt+2` respondem Verdadeiro e Falso na Cozinha. `Delete`/`Backspace` tiram um bloco só com o foco nele. Listados em "Minhas preferências > Atalhos" e na ajuda de cada cômodo. Podem ser desligados em "Teclas de atalho do jogo".
- **Instrução completa só ao entrar.** A descrição completa do cômodo é lida ao entrar; nas fases seguintes, só uma mensagem curta da fase. Quem quiser ouvir tudo de novo aperta `Alt+R`.
- **Textos de leitor de tela nos JSON.** Cada `assets/data/<comodo>.json` tem o bloco `acessibilidade` (descrições, avisos e rótulos), com `{chaves}` preenchidas por `preencherTexto()`. A cópia embutida (`*_INLINE`) de cada página deve ser mantida igual.
- **Cor nunca é a única informação.** Blocos errados dizem "com erro" no nome, e as mensagens listam as posições erradas pelo nome.
- **Avisos:** `anunciarAcessivel()` (região `aria-live`, um aviso por vez) e `anunciarFila()` (região `role="log"`, avisos em fila, usada no passo a passo da Sala).
- **Uma voz por passo nos treinos do Logi.** Cada passo é falado uma vez só, pela região `aria-live` do `tutorial.js`: vale a `audiodescricao` do passo (que já traz a instrução completa) ou, se não houver, a `fala`. A fala escrita no balão, a dica de teclado e a figura do Logi ficam com `aria-hidden`, e não há `aria-describedby` no botão alvo. Nos passos de OK, o foco vai direto para o botão OK.
- **Atalhos mostrados no Mapa.** Na primeira visita ao Mapa da Casa, uma janela curta lista os atalhos com Alt (J, R, S, 1/2, A). Vale para todos os jogadores e conta como vista ao abrir. No Mapa, `Alt+J` abre de novo; "Rever todos os treinos" nas preferências também a faz voltar.
- **Botão Dica.** O nome acessível é só "Dica" (antes "Dica do Logi").
- **Avisos de pôr e tirar (Task 103).** Ao pôr ou tirar um bloco ou uma fruta, o leitor ouve só o item ("Cima adicionado.", "Maçã tirada."), mais o aviso de fila cheia ou vazia. A lista inteira fica no `Alt+S`.
- **Janela aberta isola o fundo.** `abrirModalFluxoAcessivel` e `abrirTutorialAcessivel` (`plataforma.js`) põem `inert` no resto da página enquanto a janela está aberta, porque o Narrador ignorava `aria-modal` e lia o fundo. Avisos do leitor (`a11y-*`) e o treino (`tut*`) ficam de fora. Na janela de atalhos do Mapa, cada atalho é uma frase só para o leitor, o foco vai para o título e uma leitura única diz a lista inteira.
- **Ouvir os atalhos de novo.** Na janela de atalhos do Mapa o título "Atalhos do teclado" é um item do Tab e o nome dele é o bloco inteiro: ao receber o foco o leitor lê tudo. Para ouvir de novo, volte a ele com Tab ou Shift+Tab, ou aperte Alt+R com a janela aberta. Não há mais aviso por `aria-live` nessa janela.

### Ajustes do teste com leitor de tela (Tasks 101, 103 e 104)

- **Sem emojis nem símbolos como ícone (Task 101).** Todo ícone é um desenho SVG de `assets/js/icones.js`, com `aria-hidden`, que herda a cor do texto. No HTML: `<span data-ico="nome"></span>`; no JS: `Icones.svg('nome')`. O `icones.js` é o primeiro script de todas as páginas. Marcas que estavam em CSS (símbolo de texto em `content`) viraram imagem de fundo. Única exceção: o personagem da Sala, que continua emoji com o nome acessível "Personagem". Os rótulos dos passos em `quarto.json` são só texto; o desenho de cada passo é o ícone `passo-<id>`.
- **Foco inicial (Task 103).** `focoInicial()` em `plataforma.js` leva o foco ao primeiro comando ao entrar e a cada fase: botão Jogar (início), cômodo da vez (Mapa), primeiro bloco (Sala e Quarto), botão Verdadeiro (Cozinha), primeira fruta (Despensa), título (pontuação). Não mexe no foco com janela ou treino abertos (`Tutorial.auto()` devolve `true` quando o treino vai abrir).
- **Cozinha.** Depois de "Próxima" o foco vai para Verdadeiro, cujo nome já traz a frase; por voz entra só "Pergunta N de 3." (`perguntaCurta` e `perguntaNivelCurta` no JSON). A fala de entrada vai sem a frase, pelo mesmo motivo.
- **Fora da leitura.** Dicas visuais de mouse ("Clique ou arraste"), subtítulos repetidos, bolinhas de progresso e o aviso "Leia com atenção" têm `aria-hidden`. Os placares do topo não são mais `aria-live` (os pontos são lidos na janela de fim de fase).
- **Títulos.** Cada tela tem `h1` (nome do cômodo) e `h2` nos painéis.
- **Janelas.** `isolarFundo()` agora funciona em pilha (uma janela pode abrir sobre outra) e vale também para as preferências e para o "Como jogar" da tela inicial. A ajuda abre com o foco no botão "Fechar ajuda".
- **Esc nunca sai direto (Task 104).** Cada cômodo chama `ativarSaidaComEsc('<comodo>')`. Sem janela aberta, o Esc abre "Sair do cômodo?" com o foco em "Continuar jogando"; Esc de novo continua o jogo. O Esc já tratado por outra parte (preferências, treino) é ignorado (`event.defaultPrevented`).
- **Botões nativos.** Os cartões do Mapa são `<button>`; cômodo bloqueado é texto, fora do Tab, com a palavra "Bloqueado" para o leitor.
- **Setas.** Continuam sem tratamento próprio nos cômodos (decisão da Task 107, testada com o Narrador): com o Narrador ativo elas já andam entre os botões dos grupos.
- **Telas pequenas.** No celular (até 430 px) o topo dos cômodos mostra a seta do Mapa (42 px), o nome do cômodo cortado com reticências se faltar espaço, e some a figura do cômodo; em 320 px o placar sai do topo. Há regras compactas para notebook baixo (até 660 px e até 730 px de altura). Medido sem rolagem em 360×640, 375×667, 390×844, 412×915, 430×932, 768×1024, 1024×600, 1280×720 e 1366×768, em todas as fases. Em 320×568 a Sala rola.
