# Contexto: Casa dos Mistérios Lógicos (para o Claude Code)

> Arquivo de contexto. Guarde em `.claude/contexto-casa-dos-misterios.md`. Ele fica fora do git (ver Etapa 0).
> Leia este arquivo inteiro antes de começar qualquer etapa.
> **Última atualização: 03/11/2026** (nova rodada de pedidos; Fase 1 dela em andamento). Comece pela seção 0.

## 0. Estado atual do trabalho (leia primeiro)

### Onde estamos
| Etapa | Situação | Task no DevOps |
|---|---|---|
| 0. Pasta do Claude fora do git | **Feita.** O `.gitignore` estava em UTF-16 (o git ignorava a regra); foi regravado em UTF-8 com `.claude/` | n/a (commit `AB#52`) |
| 1. Bugs B1, B2, B3 | **Feita** (ver seção 3) | commit `AB#52` |
| Pedidos extras na Sala (painel limpa ao errar, Repetir só na fase 3, blocos maiores e responsivos) | **Feitos** | commit `AB#52` |
| 2. Remover narração e botões falantes | **Feita** (ver seção 2). Na máquina do usuário, conferir com `git status` se já foi commitada | **#110** |
| 3. Motor do tutorial (Tutorial 2, Sala fase 3) | **Feita, ainda não commitada** (ver "Etapa 3" abaixo). Conferir `git status` | **#111** |
| 4. Escolha do tutorial no Mapa | **Próxima. Não iniciada** | sem task ainda |
| 5. Tutorial 1 (Sala fase 1) | **Feita em 03/11/2026, sem commit** (ver "Fase 3" abaixo) | sem task ainda |
| 6. Tutoriais 3, 4 e 5 (Quarto, Cozinha, Despensa); em 04/11 entraram os Tutoriais 6 e 7 (Despensa, fases 2 e 3) | **Feita em 03/11/2026, sem commit** (Cozinha na Fase 3; Quarto e Despensa depois). Testada no navegador, passo a passo, com toques certos e errados. **Não testado:** leitor de tela, movimento reduzido, celular deitado | sem task ainda |
| 7. Intro animada | Pendente (menor prioridade) | sem task ainda |

O usuário pausou o desenvolvimento e retoma depois. Ao retomar, rode `git status` e `git log --oneline -5` para ver o que já foi commitado antes de mexer em qualquer coisa.

### Rodada de ajustes de 03/11/2026 (pedidos do usuário, em ordem de prioridade)

**Regra de trabalho desta rodada:** fazer **uma fase por vez** (cada fase junta pedidos que combinam entre si). Ao terminar uma fase, atualizar este arquivo e **perguntar ao usuário se pode começar a próxima**. Nunca encadear fases sem o ok.

| Fase | Pedidos | Situação |
|---|---|---|
| **1. Ajustes rápidos** | 1.1 a 1.4 (abaixo) | **Feita em 03/11/2026, sem commit.** Testada no navegador (Despensa, Cozinha, Sala, Quarto). **Aguardando o ok do usuário para começar a Fase 2** |
| **2. Dica clicável em todo o jogo** | 2.1 a 2.3 | **Feita em 03/11/2026, sem commit.** Testada no navegador nas 4 salas. **Aguardando o ok do usuário para a Fase 3** |
| **3. Tutoriais 100% interativos** | 3.1 a 3.3 | **Feita em 03/11/2026, sem commit.** Testada no navegador (Sala e Cozinha, passo a passo, com erro e com "Ver de novo"). **Fim da rodada de 03/11**: o usuário decide o que vem depois (ver "Próximos passos" abaixo) |

**Fase 1: ajustes rápidos**
- **1.1** Trocar "parceira" (feminino, e é uma criança qualquer) por um termo **neutro**. Por ora **"explorador"** (alternativa: "aventureiro"). O termo fica num lugar só: `TRATAMENTO` em `assets/js/tutorial.js`; as falas dos tutoriais usam `{tratamento}`. O usuário disse "por enquanto": pode mudar de novo.
- **1.2** Despensa, tutorial: o retângulo de destaque do passo "Hoje só escolhemos frutas VERMELHAS" ficava **torto, maior e deslocado** em relação ao balão do Logi (a folga de 6% do lado maior fazia o buraco de um elemento largo e baixo sobrar 50 px para cada lado). Corrigir o cálculo da folga e destacar o balão inteiro. Além disso, a palavra **VERMELHAS não tinha destaque na própria página** (só no balão do tutorial): destacar as palavras em maiúsculas do `instrucao` do nível.
- **1.3** Despensa (Médio e Difícil, onde há prateleira em cima): **clicar de novo numa fruta que já está na prateleira a tira de lá** (desmarca). Arrastar uma fruta que já está lá não a remove.
- **1.4** **Cor do balão do tutorial por cômodo:** Sala laranja, Quarto roxo, **Cozinha verde**, Despensa marrom. Vale para borda do balão, botão OK, bolinhas de passo. O anel de destaque continua amarelo (contraste).

**O que foi feito na Fase 1 (arquivos):**
- `tutorial.js`: constante `TRATAMENTO` + `tratar()` (troca `{tratamento}` nas falas e audiodescrições, inclusive nas de erro); `comFolga()` agora limita a folga a 12–16 px; `abrir()` grava `data-comodo` no `#tut`; a API expõe `Tutorial.tratamento` e `Tutorial.tratar`.
- `tutorial.css`: variáveis `--tut-cor` e `--tut-botao` por `[data-comodo]` (quarto roxo `#534AB7`, cozinha verde `#1D9E75` e botão `#0F6E56`, despensa marrom `#8D4E00`, sala laranja, que é o padrão). Usadas na borda do balão, botão OK, bolinhas, ondas e seta do Logi, botões da confirmação de Pular.
- Falas dos 5 tutoriais em `assets/js/tutoriais/*.js`: "parceira" virou `{tratamento}`.
- `despensa-f1.js`: o passo "frutas VERMELHAS" agora destaca `.despensa-logi` (o balão inteiro).
- `Despensa.html`: `destacarPalavras()` põe `<mark class="destaque-palavra">` nas palavras em MAIÚSCULAS (3+ letras) de `nivel.instrucao`, no balão do Logi e no título da prateleira; `adicionarItem(id, alternar)` tira a fruta da prateleira quando clique/Enter repete (arrastar não tira); a etiqueta de acessibilidade diz "Clique de novo para tirar".
- `base.css`: `.destaque-palavra` (com variante de alto contraste, reutilizável pela Dica da Fase 2). `despensa.css`: o cartão que já está na prateleira ganhou `cursor: pointer`.
- `despensa.json` e `DESPENSA_INLINE` (mantidos em sincronia): `instrucao` do Médio e do Difícil ganhou palavra em maiúsculas (`TAMANHO`, `SEMENTES`) para receber o destaque.
- **Não testado:** leitor de tela real e movimento reduzido.

**Fase 2: Dica clicável em todo o jogo**
- **2.1** A **Dica tem que existir em todo o jogo**: Sala, Quarto, Cozinha e Despensa, em **todas as fases/níveis/perguntas**. Hoje a Cozinha e a Sala têm só uma caixa de texto fixa (`#dica-comodo`) e a Despensa e o Quarto não têm (conferir o Quarto).
- **2.2** A Dica vira um **botão clicável e intuitivo** (ícone de lâmpada + palavra curta "Dica"), com **menos texto**.
- **2.3** Ao clicar, aparece uma **cena parecida com a do tutorial** (a tela escurece, o Logi aparece com uma frase curta e o ponto do erro fica em destaque), que **mostra/explica o que está errado naquela parte ou frase**, em vez de um parágrafo. Reaproveitar o motor do `tutorial.js`.
- Pergunta em aberto: a Dica desconta pontos? Sugestão: **não** (crianças de 7 a 9 anos). Confirmar com o usuário antes de decidir. **Por ora a Dica não conta erro nem ponto** (decisão provisória, aguardando confirmação).

**O que foi feito na Fase 2 (arquivos):**
- **Botão Dica** (`.btn-dica`, em `base.css`): lâmpada em SVG + a palavra "Dica", 52 px de altura, âmbar, igual nas 4 salas, com variante de alto contraste e `prefers-reduced-motion`. Todas as páginas usam `id="btn-dica"`. Depois de um erro ele pulsa (`.btn-dica--pulsar`). **Substituiu** as caixas de texto de dica (`#dica-comodo` na Sala e na Cozinha, `#dica-erros` no Quarto). Posição: Sala, ao lado da grade; Cozinha, embaixo; Quarto, no fim do cartão dos passos; Despensa, na linha dos botões, antes de Confirmar.
- **Cena de dica no motor** (`tutorial.js`): `Tutorial.dica({ comodo, passos })`, onde cada passo é `{ destaque | alvo, fala, palavraChave, evitar, estadoLogi }` e `destaque`/`alvo` podem ser **seletor ou elemento(s) escolhidos pela página**. É a mesma tela do tutorial (escurece, anel, balão do Logi, → OK), mas com etiqueta "DICA", botão **Fechar** no lugar de Pular (Esc também fecha, sem confirmação), sem "Ver de novo"/tecla R, sem treino (não chama `preparar`/`restaurar`), sem mãozinha, sem dica de inatividade, sem "A FASE começa agora" e sem marcar tutorial como visto. O foco volta para o botão Dica. A página passa `comodo` no adaptador (cor do balão) e `ocupado()` impede abrir a dica no meio de uma animação; a dica também não abre com modal aberto.
- **O que cada sala mostra** (função `passosDaDica()` em cada página):
  - **Sala:** simula a fila como o Executar faz. Mostra o bloco que sai da grade, bate no obstáculo ou o Repetir sem seta antes; se a fila está certa, mostra a estrela e a próxima seta de um caminho curto (que segue reto, para combinar com o Repetir); se chega na estrela, aponta Executar; se a fila está cheia, aponta Limpar.
  - **Quarto:** 1º toque revela em vermelho e aponta o bloco repetido/intruso (texto `dica.suspeito` de cada fase em `quarto.json`); depois aponta o bloco no lugar errado; senão destaca de onde vem o próximo passo (`dicaGeral` no JSON); no fim aponta Verificar.
  - **Cozinha:** destaca na frase a palavra NÃO/NUNCA/SEMPRE/JAMAIS e depois a `palavraChave` da pergunta; sem nenhuma, "Leia a FRASE com calma".
  - **Despensa:** por nível (`dica.errado` e `dica.certo` em `despensa.json` e `DESPENSA_INLINE`): aponta a fruta errada, ou a que falta, ou a próxima do tamanho; no fim aponta Confirmar.
- **Dados:** `quarto.json` e `QUARTO_INLINE`: `fases[].dica` virou objeto `{ suspeito }` e entrou `dicaGeral`. `cozinha.json` e `COZINHA_INLINE`: removido o campo `dica` (texto fixo). CSS antigo das caixas de dica foi trocado pelo do botão em `sala.css`, `cozinha.css`, `quarto.css`, `despensa.css` (sobraram só seletores de alto contraste antigos em `base.css`).
- **Falas curtas:** as palavras em MAIÚSCULAS ganham destaque no balão. Despensa e Quarto detectam sozinhos as palavras em maiúsculas (3+ letras) do texto do JSON.
- **Não testado:** leitor de tela real, movimento reduzido, celular deitado e a posição do botão nos tamanhos pequenos (só testei ~456×854 e a janela do painel). O balão às vezes cobre outros blocos (só escurecidos).
- **Para a Fase 3:** o passo da Sala que aponta o botão Dica deve usar `alvo: '#btn-dica'` (acao `ok`).

**Ajustes da Fase 2 pedidos pelo usuário (03/11/2026, depois de ver na tela, feitos):**
- **Botão Dica padrão e maior, igual em todas as salas:** 156×60 px, fonte 21 px, ícone 32 px (`base.css`). Em tela estreita (até 560 px) ou baixa (até 500 px) fica 128×52 px, igual nas 4 salas. As regras de tamanho que cada sala tinha foram apagadas: as CSS das salas só guardam a **posição**. Única exceção: Sala em celular deitado (altura ≤ 500 px) usa 46 px de altura para não criar rolagem.
- **Onde fica, sempre embaixo e com folga da borda (não colado em outros botões nem na linha):** Sala, no fim do painel "Comandos disponíveis" (no celular/tablet ele vai para a linha do título do painel, à direita); Quarto, no fim do cartão dos passos, 22 px acima da borda (diminui com a altura da tela); Despensa, no fim do cartão das frutas (saiu da linha de Confirmar/Limpar); Cozinha, embaixo (sem mudança de lugar).
- **Quarto, blocos maiores como os da Sala:** blocos de passo com `min-height: clamp(52px, 7vh, 66px)`, fonte 19 px, raio 16 px (antes 44 px e 15 px). Fases com 6 ou 7 blocos (intrusos) usam `data-muitos="true"` em `#blocos-fonte` e blocos um pouco menores (`clamp(44px, 5.8vh, 58px)`; 40 px em notebook baixo) para a lista caber sem rolagem. Medido sem rolagem em 1920×1080, 1440×900 e 1366×768, e também em 390×844, 360×640, 820×1180 e 844×390 (Sala, Quarto, Cozinha, Despensa).
- **Aviso sobre o `sala.css`:** durante este trabalho o arquivo foi **sobrescrito no disco** por uma versão antiga (um editor aberto com cópia desatualizada: apareceu `gap: 800px` e `gap: 8x` no `.sala-btn-dica`). Refeito. Se for mexer no `sala.css` no VS Code, recarregue o arquivo do disco antes de salvar.
- Ao testar com `python -m http.server`, o Chrome guarda os CSS em cache: recarregar com Ctrl+F5.

**Fase 3: tutoriais 100% interativos**
- **3.1** **Sala:** o primeiro contato já tem que ser a **vez da criança**. Hoje o `sala-f1` mostra primeiro os blocos rodando e telas explicativas. Converter para o formato novo (`acao: 'ok' | 'click'`), como o `sala-f3` (é a Etapa 5 do plano).
- **3.2** **Só na Sala:** um passo que **aponta o botão de Dica** e diz que é para tocar quando estiver com dificuldade ou presa na fase (precisa da Fase 2).
- **3.3** **Cozinha:** no passo da vez, está **pouco explícito qual botão clicar**. Destacar **os dois botões, Verdadeiro e Falso**, para a criança escolher. Se errar: **explicar o porquê e pedir para tentar de novo com outra frase de exemplo.**
- A conversão da **Despensa** e do **Quarto** para o formato novo continua na Etapa 6 (não foi pedida nesta rodada).

**O que foi feito na Fase 3 (arquivos):**
- **`sala-f1.js` reescrito** (era a Etapa 5): 5 passos, **sem demonstração**, o primeiro já é a vez da criança. p1 toque em CIMA (com a saudação "Oi, {tratamento}! Leve o robô à ESTRELA. Toque em CIMA."), p2 DIREITA (mostra a trilha), p3 EXECUTAR, p4 `ok` com o robô na estrela, **p5 toque no botão Dica** (`#btn-dica`, só na Sala; tocar nele no tutorial só conta como o passo, não abre cena). Toque na seta errada: sem mensagem, a mão e o zoom repetem. Fases 1 e 2 usam esse tutorial; o `sala-f3.js` não mudou e não tem passo da Dica. `Sala.html`: o botão Dica, com o tutorial aberto, chama `Tutorial.tentar('dica', null)`.
- **`cozinha-f1.js` reescrito:** p1 `ok` aponta a palavra NUNCA; **p2 é a vez, com os dois botões Verdadeiro e Falso em um único destaque e a mãozinha desligada (`semMao: true`)**, para a criança escolher entre os dois; p3 comemora. **Se errar:** o Logi mostra o porquê (a palavra da frase fica acesa), a criança toca em **OK** (nada passa por tempo) e a frase troca para **outro exemplo**, com o convite "Outra FRASE! Tente de novo.". Exemplos, em ordem, voltando ao 1º no fim: "O gelo NUNCA é quente." (V), "O sol NÃO é quente." (F), "O fogo NUNCA é frio." (V). Toques em V/F durante a explicação são ignorados.
- **Motor (`tutorial.js`), campos novos de passo:** `vez` pode ser **função** (a resposta certa muda); `semMao`; em `erro`: `fala` pode ser função, `destaque` (o que acender enquanto explica), `ok: true` (espera o OK em vez de um tempo), `depois` (roda depois do OK, ex.: trocar a frase), `falaDepois` e `palavraChaveDepois` (novo convite). Sem `palavraChave`, vale toda palavra em MAIÚSCULAS (3+ letras). Os passos agora são **copiados** a cada abertura/"Ver de novo", para a `falaDepois` não vazar para o registro.
- **Não testado:** leitor de tela real, movimento reduzido e celular deitado nesses dois tutoriais. Só vi o balão com a tela escurecendo (captura no meio do fade) e os passos por script.

**Próximos passos possíveis (nada começado, depende do usuário):** Etapa 4 (escolha do tutorial no Mapa), Etapa 7 (intro animada), decidir se a Dica desconta pontos, tutoriais para o Médio e o Difícil da Despensa (prateleira e arrastar; o passo `drag` ainda não existe no motor), e blocos/botões ampliados no resto do jogo (Cozinha e Despensa ainda têm botões menores que os da Sala). **Os 5 tutoriais já estão no formato interativo** (o modo de compatibilidade do motor, abaixo, não é mais usado por nenhum deles).

### Como rodar e testar
- O git fica na subpasta `casa-dos-misterios/` (remoto GitHub `mariananevesz/casa-dos-misterios`, branch `main`).
- Servir a pasta por HTTP (o jogo usa `fetch` nos JSON): `python -m http.server 8123` dentro de `casa-dos-misterios/`, e abrir `http://127.0.0.1:8123/assets/pages/Sala.html`. Depois de editar CSS/JS, recarregar sem cache (Ctrl+F5).
- Progresso fica em `localStorage` (`casaMisterios_state`). Para pular para a fase 3 da Sala no console: `gameState.setEstagio('sala', 2)`.
- O usuário faz os commits e os pushes. **Nunca commitar nem dar push.**

### Azure DevOps
- Projeto: `https://dev.azure.com/Fatec2026TEquipe4/Casa%20dos%20Mist%C3%A9rios` (sprint **Outubro**, iteração `Casa dos Mistérios\Outubro`).
- O commit liga à task quando a mensagem tem `AB#<número>` (ex.: `AB#110 Remove narração e sons de dica`). Atenção: `#AB` não liga.
- Estrutura: o PBI **72 Front End** é pai das tasks de interface: 98 (Como Jogar), 73 (visual do jogo), **110** e **111**. Tasks 52 e 68 são as correções de Sala e Quarto. O PBI 100 (acessibilidade com leitor de tela) tem as tasks 101 a 109, de outra pessoa da equipe.
- Modelo de task da equipe: o campo Descrição tem três blocos, **Descrição**, **Descrição Técnica** (lista do que será alterado) e **Critérios de Aceite** (lista de frases verificáveis). Responsável: JOAO PEDRO DE SOUZA SANTOS.
- Para criar tasks pelo Chrome (extensão Claude in Chrome, logada): abrir o PBI 72, Related Work → Add link → New item → Task, digitar o título e confirmar. No formulário, a Descrição aceita HTML inserido por `document.execCommand('insertHTML')` no editor com foco. Conferir sempre o campo Iteration (o seletor de iteração falha com facilidade; confirmar que ficou `Casa dos Mistérios\Outubro`).

### Etapa 3 (feita em 03/11/2026, sem commit)
- `assets/js/tutorial.js` e `assets/css/tutorial.css` foram **reescritos** como overlay (seção 4): escurece com buraco no alvo (SVG evenodd), anel com pulso/ripple/zoom, mãozinha de 2 ciclos, balão do Logi que troca de lado, botão **→ OK**, **Pular** (Esc) com confirmação ✓/↩, **Ver de novo** e tecla **R**, `inert` nos irmãos do alvo, ARIA, `prefers-reduced-motion`, alto contraste. **Nenhum avanço por tempo.** Toques nos primeiros 400 ms são ignorados; toque fora do alvo = mão e zoom repetem, Logi `encorajando`, anel engrossa no 3º; 10 s parado = dica volta.
- Formato de passo novo: `acao: 'ok' | 'click'` (+ `vez: {tipo, valor}` no click), `alvo`, `destaque`, `evitar` (região que o balão tenta não cobrir), `depois` (hook após a ação), `fala`, `palavraChave`, `estadoLogi`, `audiodescricao`, `teclado`. A fala final "A FASE começa agora!" é automática.
- **Modo de compatibilidade (histórico):** os tutoriais antigos funcionavam sem reescrever: passo sem `tipo` = `ok`, `toque` = `demo` (a mão faz a ação e espera o OK), `vez` = `click`. **Todos os 5 já foram convertidos (03/11/2026)**; o código de `demo` e `tipo` continua no motor e pode ser removido depois.
- `sala-f3.js` está no formato novo (5 passos da seção 6). Testado no celular (390 px), em 1280×720, com alto contraste e fonte 140%, por clique e por teclado. **Não testado:** movimento reduzido (emulação) e leitor de tela real.
- Ainda não existe passo `drag` (arrastar). Fica para a Despensa (Etapa 6).
- Botão "Pausar" e tecla P foram removidos (não há mais tempo para pausar).

### Pendências e pontos de atenção
- **Etapa 3 (histórico) partia do código atual:** `assets/js/tutorial.js` já existe, com o motor antigo (os passos de demonstração **avançam por tempo**) e 5 tutoriais em `assets/js/tutoriais/*.js` (`sala-f1`, `sala-f3`, `quarto-f1`, `cozinha-f1`, `despensa-f1`). A API usada pelas páginas é `Tutorial.registrar / configurar / auto / abrir / fechar / tentar`, e cada página passa um adaptador (`preparar`, `restaurar`, `acoes`, `tutorialDaFase`, `primeiroFoco`, `ocupado`). O motor novo deve substituir o antigo reaproveitando o conteúdo, e manter a tecla **R** (reinicia, e com o tutorial fechado reabre).
- **Botão de música usa emoji (🔊/🔇)** dentro de um `<span aria-hidden>`, com `aria-label` em texto. A task **101** do DevOps pede para tirar emojis da interface por causa do leitor de tela; se a equipe fizer isso, trocar por ícone SVG.
- **Task 106 do DevOps** ("descrição auditiva do cômodo ao entrar") pode contrariar a decisão de não ter narração. Combinar com a equipe: só texto em `aria-live`.
- **Só a Sala teve os botões ampliados.** Quarto, Cozinha e Despensa ainda têm blocos e botões pequenos, e o "?" e o botão de música têm 34 px no celular nessas páginas.
- **Despensa:** o nível Fácil esconde a prateleira e só aceita clique. Perguntar ao usuário antes de mudar a regra (ver seção 6).
- **Quarto:** ao errar, os blocos continuam no painel, com marcas vermelhas, de propósito. Só a Sala limpa o painel ao errar.
- O Chrome só toca áudio depois do primeiro toque; a música começa nele.

## 1. O projeto

- Jogo educativo web em **HTML, CSS e JS puro (ES2020+)**, sem bibliotecas externas. O manual da plataforma (Seção 9) exige aprovação para adicionar qualquer biblioteca.
- Público: crianças de **7 a 9 anos** (2º e 3º ano). Muitas ainda estão aprendendo a ler.
- Fluxo: `index.html` (tela inicial) → `assets/pages/MapaCasa.html` → cômodos liberados em sequência: **Sala** (algoritmos) → **Quarto** (depuração) → **Cozinha** (verdadeiro ou falso) → **Despensa** (padrões) → `TelaPontuacao.html`.
- Arquivos principais:
  - `assets/js/gameState.js`: estado e progresso.
  - `assets/js/audio.js`: efeitos sonoros e música sintetizados (Web Audio) e o botão `#btn-musica` de pausar/ligar. **Não há narração.**
  - `assets/js/plataforma.js`: `getPlatformDifficulty`, `sendFinalScore`, modais acessíveis (foco preso, Esc) e o atalho Alt+A.
  - `assets/css/base.css`: tokens (`--laranja #D85A30`, `--ambar`, `--roxo`, `--verde`, `--escala-fonte`…).
  - `assets/data/*.json`: todo o conteúdo do jogo. O README proíbe deixar conteúdo hardcoded.
- Pontuação: até 25 pontos por cômodo (0 erros = 25, 1 = 20, 2 = 15, 3 ou mais = 10). **O tutorial nunca conta erros nem pontos.**
- Mascote **Logi**: robozinho laranja de peças de quebra-cabeça, com uma lâmpada na cabeça. É gentil, paciente e animado e chama a criança de **"explorador"** (termo neutro e provisório, decisão de 03/11/2026; antes era "parceira de investigação"; fica em `TRATAMENTO` no `tutorial.js`). Fora isso, as falas não usam adjetivos com gênero. Artes: `assets/img/logi_feliz.png` e `assets/img/logi_exclamacao.png`.
- Protótipo visual anterior dos tutoriais (só como referência de conteúdo): https://claude.ai/artifact/6HzaPcLvrzTGvCpDLEK6jo

## 2. Decisões já tomadas

1. **Som:** fica **só a música de fundo**, mais os efeitos de clique, erro e acerto (ver item 5). **Feito na Etapa 2 (task #110):**
   - Removidos todos os **botões "falantes"**: os ▶ que leem o texto do Logi ou da dica (`#logi-play`, `#dica-play`, ▶ do balão no Mapa, "Ouvir" na Cozinha).
   - Removidos todo **som de dica** e toda **narração** (áudio gravado e `speechSynthesis`), os interruptores "Narração" e "Voz do Logi nos tutoriais" das configurações, o atalho Alt+R de repetir instrução, a voz e o botão "Voz: ligada" do tutorial, o `assets/audio/logi/manifest.js` e a pasta `docs/` (`falas-logi.md` e `gerar-falas-logi.js`).
   - **Não criar roteiro de áudio.**
   - A música não carrega informação e tem um botão de pausar/ligar **visível** em todas as páginas (criado por `audio.js`): no cabeçalho, antes do "?", nas fases; ao lado da engrenagem, no início; no topo, no Mapa; flutuante na tela de pontuação. A escolha fica salva em `settings.musicaAtivada`.
2. A **audiodescrição** continua, como texto em `aria-live`, lido pelo leitor de tela da criança.
3. O tutorial é **opcional**, e a criança escolhe no Mapa da Casa (ver §5).
4. O avanço é **sempre controlado pela criança**. Nada passa sozinho por tempo.
5. **Efeitos de clique, erro e acerto: ficam como estão** (decisão do usuário em 27/10/2026). Isso inclui `audio.clique/passo/acerto/erro/desbloqueio/conclusao` nas páginas. O `tutorial.js`, porém, não toca mais som nenhum.
6. **Sala, ao errar o caminho** (sair da grade, bater em obstáculo, não chegar na estrela, ou Repetir sem seta antes): o painel de comandos **volta vazio** e a grade volta ao início. O erro continua contado. (No Quarto não, ver seção 0.)
7. **Sala, bloco "Repetir 2x":** só aparece na fase que tem `"usarRepetir": true` em `sala.json` (hoje, só a **fase 3**) e no treino dela. O texto do "Como jogar" acompanha (`.so-repetir` e `.sem-repetir`).
8. **Tamanho dos controles da Sala:** blocos e botões grandes para o toque (no celular de 390 px as setas medem cerca de 79×68 px, a sequência tem 4 blocos por linha e o botão "?" tem 44 px); rótulos nunca abaixo de 12 px. Testado em 360×640, 390×844, 768×1024, 1280×720, 1440×900 e celular deitado (844×390), sem rolagem.
9. **Tecla R:** com o tutorial aberto, reinicia do passo 1; com ele fechado (e sem modal aberto, fora de campo de texto, com a página não ocupada), reabre o tutorial da fase.

## 3. Bugs conhecidos (os três foram resolvidos na Etapa 1)

**Como foram resolvidos:**
- **B1:** a mudança de fase já zerava o painel (testado na Sala e no Quarto). O que o usuário via era os blocos **ficarem depois de um erro**; agora a Sala limpa o painel ao errar (decisão 6).
- **B2:** (a) nenhuma fase nem variação tem início igual ao alvo; (b) ao chegar, a estrela ganha `.grade-estrela--coletada` (cresce com brilho e some em 0,5 s) e o robô fica sozinho e centralizado. Com `prefers-reduced-motion` ela some sem animar.
- **B3:** o R chamava `repetirPasso()` (só repetia a mãozinha). Agora chama `reiniciar()` (decisão 9).

**Texto original dos bugs:**

| # | Bug | Onde | Resultado esperado |
|---|---|---|---|
| B1 | Os blocos do "Painel de comandos" continuam lá quando a fase muda | `Sala.html` (sequência do jogador) e, se acontecer, também `Quarto.html` | Ao iniciar uma fase nova (ou "Próxima fase"), a sequência zera, os espaços vazios voltam conforme `maxBlocos` e o feedback é limpo |
| B2 | Estrela e personagem ficam desenhados dentro da mesma célula, sobrepostos, e fica feio | grade da Sala | (a) Conferir se alguma fase ou variação (`sala.json` / `sala-variacoes.json`) coloca o início igual ao alvo; se sim, corrigir os dados. (b) Quando o robô chega na estrela: a estrela faz uma animação de "coletada" (some com brilho/escala) e o robô fica centralizado sozinho. Não deixar dois emojis/imagens empilhados |
| B3 | A tecla **R** ("repetir tutorial") não funciona | atalho de teclado do tutorial | **R** reinicia o tutorial atual do passo 1. Não pode disparar quando o foco está num campo de texto. Precisa funcionar também pelo botão "?"/"Ver de novo" |

## 4. Novo tutorial: estilo "jogos famosos" (resumo da pesquisa)

Fontes: Apple (onboarding para games), Nielsen Norman Group (overlays e UX para crianças), Material Design (feature discovery), Roblox Creator Hub (FTUE), Driver.js/Shepherd (técnica), WCAG 2.2 e WAI-ARIA APG.
Legenda: **[F]** valor de fonte · **[E]** estimativa a validar com as crianças.

### 4.1 Princípios

- **Aprender fazendo:** cada passo é **uma ação real** no elemento real da fase. Nada de telas cheias de texto.
- **Fundo escurecido + destaque:** a tela escurece e só o alvo fica aceso, com zoom leve, pulso e mãozinha animada.
- **Sem avanço automático:** o passo só termina quando a criança faz a ação. Passos só informativos têm um botão grande **"→ OK"**.
- **Tutoriais curtos por mecânica:** de 3 a 5 passos, cada um na primeira vez que a mecânica aparece (modelo Clash Royale) [F].
- **Erro silencioso e gentil:** um toque fora do alvo não mostra mensagem de erro. A mãozinha mostra de novo e o Logi faz cara de encorajamento [F, NN/g: crianças não entendem mensagens de erro].
- **Pular e rever sempre disponíveis** [F, Apple].

### 4.2 Arquitetura (sem bibliotecas)

- `assets/js/tutorial.js`: motor único, guiado por dados. Funciona em todas as páginas.
- `assets/css/tutorial.css`: estilos do overlay.
- `assets/data/tutoriais.json`: passos de cada tutorial.
- Camada `#tut` anexada direto ao `<body>`, com `position:fixed; inset:0; z-index:1000; pointer-events:none`.
- **Escurecimento:** um `<svg>` em tela cheia com `<path fill-rule="evenodd">` (o retângulo da tela + o retângulo arredondado do alvo). Só o path tem `pointer-events:auto`; o buraco deixa o clique passar para o elemento real [F, padrão Driver.js].
- **Anel de destaque** `#tut-ring`: fica sobre o buraco e faz o zoom, o pulso e o contorno. O elemento real do jogo não é alterado.
- **Mãozinha** `#tut-hand` (SVG, `aria-hidden`): anima só `transform` e `opacity`.
- **Balão do Logi** `#tut-tip`: mostra o Logi pequeno, um ícone e **uma frase de no máximo 8 palavras**, com a palavra-chave em destaque (negrito com fundo âmbar). Ele troca de lado (baixo → cima → direita → esquerda) para nunca cobrir o alvo.
- **Reposicionamento:** `getBoundingClientRect()` + `ResizeObserver` + `resize`/`scroll`, limitado a um `requestAnimationFrame`. Antes de cada passo, `scrollIntoView({block:'center'})`.
- **Formato de passo:**
  ```json
  { "id": "...", "alvo": "seletor", "icone": "...", "texto": "...", "chave": "...",
    "acao": "click" | "drag" | "ok", "destino": "seletor (drag)",
    "mao": "tap" | "drag" | "nenhuma", "estadoLogi": "falando|apontando|dica|comemorando|encorajando|aguardando",
    "audiodescricao": "...", "teclado": "..." }
  ```
- Efeitos de jogo (pôr bloco, executar, guardar fruta) entram como **hooks** que a página expõe. Reutilizar as funções que já existem.

### 4.3 Tokens visuais e de tempo

| Token | Valor | Easing | Origem |
|---|---|---|---|
| Opacidade do escuro | **0.65** (testar 0.6–0.75) | n/a | [E]; Driver.js usa 0.5 [F] |
| Folga do buraco | `max(12px, 6% do alvo)` | n/a | [E] |
| Raio do buraco | 12–16 px | n/a | [E] |
| Fade de entrada do escuro | **250 ms** | `cubic-bezier(0,0,0,1)` | [F] Material |
| Fade de saída | **150 ms** | `cubic-bezier(0.3,0,1,1)` | [F] Material |
| Buraco indo para o próximo alvo | **450 ms** | `cubic-bezier(0.2,0,0,1)` | [F] Material/Driver.js |
| Balão aparecendo | 200 ms, 100 ms depois do buraco, `translateY(8px→0)` | `cubic-bezier(0.05,0.7,0.1,1)` | [F]/[E] |
| **Zoom de chegada no alvo** | `scale 1 → 1.1 → 1` em **600 ms** (zoom in e depois out) | ease-out / ease-in | 1.1 = [F] Material; tempo [E] |
| Pulso de espera | `scale 1 → 1.1 → 1`, ciclo de **2 s**, com ripple no pico (`1 → 1.4`, opacidade `.8 → 0`) | ease-in-out | [F] Material |
| Mãozinha tocando | ciclo de **1.4 s**, pressiona em `scale .88` | ease-in-out | [E] |
| Mãozinha arrastando | 1.5–2 s + 0.5 s de pausa | ease-in-out | [E] |
| Fonte do balão | **≥ 19 px**, peso 700, fonte sem enfeite | n/a | [F] NN/g |
| Área de toque | **≥ 48 px** (ideal 64) | n/a | [E]; 24 px tem cerca de 30% de erro em crianças de 7–10 [F] |
| Contorno de foco | ≥ 2 px, contraste ≥ 3:1 | n/a | [F] WCAG 2.4.13 |

### 4.4 Regras de avanço

1. Uma ação por passo. O passo termina com o evento real no alvo (`click`, `pointerup` ou drop válido) **ou** com a alternativa de teclado.
2. **Nenhum avanço por tempo.** Clicar no fundo escuro não faz nada.
3. Toque fora do alvo: a mãozinha recomeça, o zoom de chegada repete e o Logi fica em `encorajando`. Depois de 3 toques fora, o contorno fica mais grosso e mais brilhante.
4. Ignorar toques nos primeiros **400 ms** depois de trocar de passo, porque crianças repetem o toque onde estava o alvo anterior [F, Anthony et al.].
5. A mãozinha faz 2 ciclos (cerca de 3 s) e some, ficando só o contorno. Isso respeita a WCAG 2.2.2 (menos de 5 s de animação sem pausa).
6. **Dica por inatividade:** depois de **10 s** sem ação, a mãozinha volta por mais 2 ciclos e a lâmpada do Logi acende (testar também 5 s) [F, Roblox].
7. Acerto: feedback visual no mundo do jogo (brilho, estrela, Logi `comemorando`) e depois o próximo passo.
8. No fim, o Logi comemora, mostra "A fase começa!" e o overlay sai em fade.

### 4.5 Pular, rever e escolha

- **Pular**: botão sempre visível no canto superior direito, com ícone ⏭ e a palavra "Pular". É menor e menos chamativo que o alvo. Abre uma confirmação com dois botões grandes de ícone (✓ Pular / ↩ Continuar). **Esc** faz o mesmo.
- **Rever**: um botão **"?"** no HUD de cada cômodo e a tecla **R** reiniciam o tutorial do cômodo (ver bug B3).
- Concluir ou pular grava no `gameState`/`localStorage` com chave versionada (`casaMisterios.tutorial.v1`, dentro de try/catch).

### 4.6 Acessibilidade

- **Isolamento:** subir do alvo até o `<body>`, aplicando `inert` em todos os irmãos de cada nível (menos `#tut`). Desfazer a cada passo. Nunca aplicar `inert` num ancestral do alvo.
- **Foco:** em passo de ação, o foco vai para o alvo. Em passo informativo, vai para o "OK". Ao fechar, o foco volta para onde estava. O balão não cobre o elemento com foco (WCAG 2.4.11).
- **ARIA:**
  - O balão tem `role="dialog"`, `aria-modal="false"` e `aria-labelledby`.
  - O alvo recebe `aria-describedby="tut-text"`.
  - Uma região `aria-live="polite"` lê a audiodescrição do passo.
- **Teclado:**
  - Enter/Espaço ativa o alvo.
  - **Arrastar sempre tem alternativa:** tocar no item e depois no destino, ou no teclado Enter para pegar, setas para escolher e Enter para soltar (WCAG 2.5.7).
- **Contraste:** texto do balão ≥ 4.5:1 e anel ≥ 3:1 sobre o fundo escuro. Também existe uma variante de alto contraste e fonte ampliada (`--escala-fonte`).
- **`prefers-reduced-motion`:**
  - sem zoom e sem pulso: o contorno fica estático, com 4 px;
  - a mãozinha fica parada apontando;
  - o buraco salta direto para o alvo, sem animar;
  - fades de 150 ms lineares;
  - as regras de avanço continuam iguais.

### 4.7 Estados do Logi (classes CSS)

| Estado | Arte | Animação |
|---|---|---|
| `falando` | feliz | balanço leve |
| `apontando` | feliz | inclina para o alvo, com uma setinha |
| `dica` | exclamação | lâmpada acende e pulsa |
| `comemorando` | feliz | pulinho e confete |
| `encorajando` | feliz | aceno lento e gentil, sem vermelho |
| `aguardando` | feliz | respiração lenta |

## 5. Escolha do tutorial no Mapa da Casa

- Na **primeira vez** que a criança chega ao `MapaCasa.html` (logo depois de "Jogar"), aparece um modal com o Logi:
  - Pergunta: **"Quer que eu mostre como jogar?"**
  - Botão grande ✅ **"Sim, me mostra!"**: liga os tutoriais.
  - Botão grande ⏭ **"Não, já sei"**: desliga os tutoriais.
- A escolha fica salva no `gameState`. Ela pode ser mudada no botão de configurações (`assets/img/config.png`) do Mapa.
- Com os tutoriais ligados, cada mecânica nova abre o seu tutorial na primeira vez. Com eles desligados, nada abre sozinho, mas o "?" de cada cômodo continua funcionando.
- O modal segue o padrão APG: foco preso dentro dele, Esc vale como "Não, já sei" e o resto da página fica `inert`.

## 6. Conteúdo dos tutoriais (modelo novo: cada passo é uma ação)

Formato: `id` | alvo | ação | texto do balão (CHAVE em maiúsculas) | estado do Logi.
Nos tutoriais da Sala, use uma **grade de treino** (posições diferentes da fase real) e restaure a fase ao terminar.

### Tutorial 1: Sala, fases 1 e 2 (setas e botão Dica) — **implementado em 03/11/2026**
Grade de treino: robô em (3,0), estrela em (2,1). **Sem demonstração: o primeiro passo já é a vez da criança.**

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| sala-f1-p1 | bloco ↑ Cima | click | Oi, {tratamento}! Leve o robô à ESTRELA. Toque em CIMA. | apontando |
| sala-f1-p2 | bloco → Dir | click | Agora, a seta para a DIREITA. | apontando |
| sala-f1-p3 | botão Executar | click | Aperte EXECUTAR e veja o robô andar. | dica |
| sala-f1-p4 | estrela (após o robô andar) | ok | Isso! O robô pegou a ESTRELA! | comemorando |
| sala-f1-p5 | botão Dica | click | Travou? Toque na DICA que eu ajudo! | dica |

### Tutorial 2: Sala, fase 3 (Repetir)
Grade de treino: robô em (3,0), estrela em (0,0), 4 espaços.

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| sala-f3-p1 | bloco ↻ Repetir 2x | ok | Oi, {tratamento}! Hoje tem um bloco NOVO! | falando |
| sala-f3-p2 | bloco ↑ Cima | click | Primeiro, a seta para CIMA. | apontando |
| sala-f3-p3 | bloco ↻ Repetir 2x | click | O REPETIR faz a seta mais 2 vezes. | dica |
| sala-f3-p4 | botão Executar | click | Aperte EXECUTAR e veja o robô subir. | apontando |
| sala-f3-p5 | fila de comandos | ok | Dois blocos fizeram TRÊS passos! | comemorando |

### Tutorial 3: Quarto, fase 1 (achar o erro) — **implementado em 03/11/2026**
Blocos de treino: camiseta, calça repetida (vermelha, `calcarep`), calça, tênis; fila de 3 espaços (camiseta pode vir em qualquer lugar; o tênis só depois da calça). Sem demonstração: o primeiro passo já é a vez da criança.

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| quarto-f1-p1 | bloco Camiseta | click | Oi, {tratamento}! Toque na CAMISETA para pôr na fila. | apontando |
| quarto-f1-p2 | bloco vermelho (calça repetida) | ok | Este bloco está REPETIDO. Ele fica FORA! | dica |
| quarto-f1-p3 | bloco Calça (a certa, não vermelha) | click | Sua vez! Coloque a CALÇA certa na fila. | aguardando |
| quarto-f1-p4 | bloco Tênis | click | O TÊNIS vem DEPOIS da calça e da meia. | dica |
| quarto-f1-p5 | botão Verificar sequência | click | Aperte VERIFICAR para conferir. | apontando |

Erros explicados pelo bloco em que a criança tocou (ex.: no p3, "Esse é o REPETIDO, o vermelho. Toque na outra CALÇA." ou "O TÊNIS vem DEPOIS da calça. Primeiro, a CALÇA."). A explicação some sozinha depois de 3,5 a 4 s e volta ao convite; **o passo só avança com o toque certo**. No p5, tocar em Verificar marca a fila de treino com ✓ verde, sem contar erro nem ponto (`acoes.verificar` em `Quarto.html`; `verificar()` chama `Tutorial.tentar('verificar')` com o tutorial aberto).

**Regra de ordem do Quarto (04/11/2026):** em `quarto.json` (e `QUARTO_INLINE`), `passos` são faixas por posição (Fase 2 e 3: `[banho]` primeiro; Fase 3: `[@final]` por último; no meio um grupo livre `camiseta, calca, meia, tenis`) e `ordem` lista pares `[antes, depois]`: `[calca, tenis]` e `[meia, tenis]`. Certo: calça, meia, tênis, camiseta, ou camiseta no começo, ou no meio. Errado: tênis antes da calça ou da meia. `validarPosicoes(passos, escolhidos, ordem)` marca só o bloco que quebra a regra (o tênis). A Dica só sugere o tênis depois que calça e meia entraram. Corrigido também: a Fase 3 tinha a camiseta duplicada nos passos.

### Tutorial 4: Cozinha, fase 1 (verdadeiro ou falso) — **implementado em 03/11/2026**
Frase de treino: "O gelo NUNCA é quente." (resposta: Verdadeiro).

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| cozinha-f1-p1 | **a caixa da frase inteira**; cada palavra acende, uma por vez, como se o Logi lesse | ok | Oi, {tratamento}! Vamos LER a frase juntos. | falando |
| cozinha-f1-p2 | a caixa da frase, com a palavra NUNCA brilhando | ok | Olhe a palavra NUNCA. Ela muda o sentido da frase! | dica |
| cozinha-f1-p3 | **frase + os dois botões, Verdadeiro e Falso, num destaque só (sem mãozinha)** | click (teclas V e F também) | Sua vez! Tente acertar: a frase é VERDADEIRA ou FALSA? | aguardando |
| cozinha-f1-p4 | botão escolhido | ok | Isso! Você leu com ATENÇÃO! | comemorando |

**Balão fora da frase (04/11/2026):** o balão nunca cobre a frase. O motor (`posicionarBalao` em `tutorial.js`) agora também testa posições logo acima/abaixo de cada região de `evitar`, e a Cozinha usa `evitar: '#pergunta-box, .cozinha-vf'`. Testado em 1366×768. Quarto conferido; Sala e Despensa **não** foram reconferidas depois dessa mudança do motor.

**Cozinha, feedback do jogo (04/11/2026):** depois de responder, o feedback fica na tela e **não passa sozinho**. O botão **"Próxima →"** (`#btn-proxima`, "Ver resultado →" na última pergunta) fica à direita, na mesma linha do texto do feedback, tanto no acerto quanto no erro. A pergunta só muda quando a criança toca nele (`proximaPergunta()` em `Cozinha.html`). Antes eram 1,2 s e passava sozinho. Os botões V/F e a Dica ficam bloqueados enquanto espera.

**Se errar no p3:** o Logi **explica o porquê** (ex.: "Quase! O gelo é FRIO. Ele NUNCA é quente. É VERDADEIRO!", com a palavra da frase acesa), a criança toca em **OK** e a frase vira **outro exemplo** ("O sol NÃO é quente." → Falso; "O fogo NUNCA é frio." → Verdadeiro; depois volta ao 1º), com o convite "Outra FRASE! Tente de novo." Isso substitui a regra antiga de "erro silencioso e explicação só no 2º toque errado" (o usuário pediu a explicação já no 1º erro).

### Tutorial 5: Despensa, fase 1 (frutas vermelhas) — **implementado em 03/11/2026**
Como o nível Fácil (`criterio: "selecao-cor"`) **não tem prateleira nem arrastar** e só aceita toque, a regra da fase **não foi mudada**: o tutorial usa a alternativa "Toque na MAÇÃ / no MORANGO". Frutas de treino fixas: maçã, banana, uva, morango, mirtilo. Médio e Difícil têm tutorial próprio (Tutoriais 6 e 7, abaixo).

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| despensa-f1-p1 | Maçã | click | Oi, {tratamento}! Só frutas VERMELHAS. Toque na MAÇÃ. | apontando |
| despensa-f1-p2 | Banana (balança) | ok | A banana é AMARELA. Fica de FORA! | dica |
| despensa-f1-p3 | Morango | click | Sua vez! Outra fruta VERMELHA: o MORANGO. | aguardando |
| despensa-f1-p4 | frutas escolhidas | ok | Isso! O morango também é VERMELHO! | comemorando |

Erros explicados pela fruta tocada, com a cor dela (ex.: "A banana é AMARELA. Procure a MAÇÃ.", "O mirtilo é AZUL. Procure o MORANGO.", "A maçã já está escolhida. Toque no MORANGO."). Mesma regra do Quarto: some sozinha e o passo só avança com o toque certo. O `tentar` agora passa o que a criança tocou para `erro.fala(api, valor)`.

### Tutoriais 6 e 7: Despensa, fase 2 (tamanho) e fase 3 (sementes) — **implementados em 04/11/2026**
Mesmo padrão do Tutorial 5: o 1º passo já é a vez da criança, erros explicados pela fruta tocada, o passo só avança com o toque certo, a tela real volta intacta ao fechar. Abrem sozinhos na 1ª vez que a criança chega ao nível (`tutorialDaFase` devolve `despensa-f1/f2/f3` conforme o `criterio`). A criança **toca** nas frutas (arrastar também vale no jogo, mas o tutorial só pede toque). Fim do treino: as frutas na prateleira ficam com ✓ verde, sem contar erro nem ponto (`acoes.marcarCertas`). Não pede "Confirmar", como o f1.

**Tutorial 6, Médio** (`despensa-f2.js`). Frutas de treino: mirtilo (1), maçã (3), melancia (5); prateleira de 3 casas.

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| despensa-f2-p1 | Mirtilo | click | Oi, {tratamento}! Comece pela MENOR: o MIRTILO. | apontando |
| despensa-f2-p2 | prateleira | ok | A prateleira vai do MENOR ao MAIOR. | dica |
| despensa-f2-p3 | Maçã | click | Sua vez! A MENOR que sobrou: a MAÇÃ. | aguardando |
| despensa-f2-p4 | Melancia | click | Por último, a MAIOR: a MELANCIA. | dica |
| despensa-f2-p5 | prateleira (✓) | ok | Isso! Do MENOR para o MAIOR! | comemorando |

**Tutorial 7, Difícil** (`despensa-f3.js`). Frutas de treino: maçã e melancia (têm sementes), abacaxi e banana (não têm); prateleira de 2 casas (a legenda vira "2 frutas" durante o treino). O **morango (aquênios) fica fora do treino** para não confundir; ele só aparece no jogo.

| id | alvo | ação | texto | estado |
|---|---|---|---|---|
| despensa-f3-p1 | Maçã | click | Oi, {tratamento}! Só frutas com SEMENTES. Toque na MAÇÃ. | apontando |
| despensa-f3-p2 | Abacaxi (balança) | ok | O abacaxi NÃO tem SEMENTES. Fica de FORA! | dica |
| despensa-f3-p3 | Melancia | click | Sua vez! Outra com SEMENTES: a MELANCIA. | aguardando |
| despensa-f3-p4 | prateleira (✓) | ok | Isso! Só frutas com SEMENTES! | comemorando |

Erros (exemplos): Médio, "A maçã é MÉDIA. Comece pela MENOR.", "A melancia é MAIOR que a maçã. Primeiro, a MAÇÃ.", "O mirtilo já está na prateleira. Toque na MAÇÃ."; Difícil, "O abacaxi NÃO tem SEMENTES por dentro. Procure a MAÇÃ.", "A melancia também tem SEMENTES! Primeiro, a MAÇÃ.".

**Mudanças em `Despensa.html` para isso:** `nivelTreino` + `nivelAtual()` (o jogo usa as frutas de treino enquanto o tutorial está aberto); `adicionarItem(id, alternar, origem)` passa por `Tutorial.tentar('adicionar', …)` com o tutorial aberto; `removerItem` fica bloqueado no treino; `preparar`/`restaurar` guardam e devolvem a seleção e a prateleira. **Testado no navegador** (800×666): os dois tutoriais passo a passo com toques certos e errados, Pular no meio (tela real volta com frutas e prateleira certas), tecla R reabre, botão "Ver o tutorial do Logi" aparece, e o jogo real (Confirmar, tocar de novo para tirar) continua igual. **Não testado:** arrastar durante o tutorial, leitor de tela, movimento reduzido, celular.

## 7. Intro do jogo (prioridade mais baixa)

- É uma abertura animada antes da tela inicial, no estilo vinheta. A casa aparece, as luzes dos cômodos acendem uma a uma, o Logi entra pulando e surge o título **"A Casa dos Mistérios Lógicos"**.
- Dura de 6 a 10 s. Tem botão **"Pular"** desde o primeiro segundo, e Enter/Esc pulam também.
- Aparece só na primeira visita. Depois disso, fica um link "ver abertura" na tela inicial.
- Não tem narração; a música de fundo pode começar aqui depois do primeiro clique (o navegador bloqueia som antes de interação).
- Precisa respeitar `prefers-reduced-motion`: nesse caso, mostrar uma imagem estática com fade.
- Usar só CSS e JS, com as artes que já existem.
