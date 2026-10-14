# Falas do Logi — lista para gravação dos áudios

> Arquivo gerado a partir de `assets/js/tutoriais/*.js` (a fonte da verdade). Se uma fala mudar nos dados, gere este arquivo de novo.

## Como encaixar a voz

1. Grave cada fala e salve como **MP3** em `assets/audio/logi/`, com o nome da coluna **Arquivo** (ex.: `sala-f3-p1.mp3`).
2. Acrescente o id (sem `.mp3`) na lista de `assets/audio/logi/manifest.js`, por exemplo `window.LOGI_AUDIOS = ['sala-f3-p1'];`.
3. Pronto: o passo toca o áudio e só avança quando ele termina. Fala que **não** estiver na lista continua só com legenda (tempo da coluna **Duração padrão**), sem erro no console e sem voz sintética.
4. A voz respeita *Efeitos sonoros* e *Voz do Logi nos tutoriais* (menu de acessibilidade) e o botão **Voz** do painel do tutorial.

Dica de gravação: as palavras em MAIÚSCULAS são as palavras-chave que ficam destacadas na legenda e acendem o elemento da tela — vale dar um leve destaque na voz.

## Sala · Fase 3 (`sala-f3`)

| id | Arquivo | Fala | Momento | Estado do Logi | Duração padrão |
|---|---|---|---|---|---|
| sala-f3-p1 | sala-f3-p1.mp3 | Oi, parceira! Hoje tem um bloco NOVO! | Abertura | Falando | 3.5 s |
| sala-f3-p2 | sala-f3-p2.mp3 | Só cabem QUATRO blocos na fila. | Demonstração 1 | Explicando / apontando | 3.5 s |
| sala-f3-p3 | sala-f3-p3.mp3 | Primeiro, a seta para CIMA. | Demonstração 2 | Explicando / apontando | 4.5 s |
| sala-f3-p4 | sala-f3-p4.mp3 | O REPETIR faz a seta mais duas vezes. | Demonstração 3 | Dica (lâmpada acende) | 5 s |
| sala-f3-p5 | sala-f3-p5.mp3 | Aperte EXECUTAR e veja o robô subir. | Demonstração 4 | Explicando / apontando | 4.5 s |
| sala-f3-p6 | sala-f3-p6.mp3 | Dois blocos fizeram TRÊS passos! | Demonstração 5 | Dica (lâmpada acende) | 3.5 s |
| sala-f3-p7 | sala-f3-p7.mp3 | Sua vez! Coloque o REPETIR depois da seta. | Sua vez | Aguardando | 0 (espera a criança) |
| sala-f3-p7-erro | sala-f3-p7-erro.mp3 | Quase! Procure o bloco amarelo, o REPETIR. | Erro na vez | Encorajando | 2.5 s |
| sala-f3-p8 | sala-f3-p8.mp3 | Agora aperte EXECUTAR. | Sua vez | Aguardando | 0 (espera a criança) |
| sala-f3-p8-erro | sala-f3-p8-erro.mp3 | Quase! Aperte o botão EXECUTAR. | Erro na vez | Encorajando | 2.5 s |
| sala-f3-p9 | sala-f3-p9.mp3 | Isso! Você usou só DOIS blocos! | Acerto | Comemorando | 3.2 s |
| sala-f3-p10 | sala-f3-p10.mp3 | A FASE começa agora. Vamos lá! | Fase começa | Falando | 2.6 s |

## Sala · Fase 1 (`sala-f1`)

| id | Arquivo | Fala | Momento | Estado do Logi | Duração padrão |
|---|---|---|---|---|---|
| sala-f1-p1 | sala-f1-p1.mp3 | Oi, parceira de investigação! Vamos para a SALA! | Abertura | Falando | 3.5 s |
| sala-f1-p2 | sala-f1-p2.mp3 | Leve o robô até a ESTRELA. | Demonstração 1 | Explicando / apontando | 3.5 s |
| sala-f1-p3 | sala-f1-p3.mp3 | As SETAS mostram o caminho. | Demonstração 2 | Explicando / apontando | 3.5 s |
| sala-f1-p4 | sala-f1-p4.mp3 | Clique na seta para CIMA. | Demonstração 3 | Explicando / apontando | 4.5 s |
| sala-f1-p5 | sala-f1-p5.mp3 | Agora a seta para a DIREITA. | Demonstração 4 | Explicando / apontando | 4.5 s |
| sala-f1-p6 | sala-f1-p6.mp3 | Aperte EXECUTAR e veja o robô andar. | Demonstração 5 | Dica (lâmpada acende) | 4.5 s |
| sala-f1-p7 | sala-f1-p7.mp3 | Sua vez! Clique na seta DIREITA. | Sua vez | Aguardando | 0 (espera a criança) |
| sala-f1-p7-erro | sala-f1-p7-erro.mp3 | Quase! O robô precisa ir para a DIREITA. | Erro na vez | Encorajando | 2.5 s |
| sala-f1-p8 | sala-f1-p8.mp3 | Agora aperte EXECUTAR. | Sua vez | Aguardando | 0 (espera a criança) |
| sala-f1-p8-erro | sala-f1-p8-erro.mp3 | Quase! Aperte o botão EXECUTAR. | Erro na vez | Encorajando | 2.5 s |
| sala-f1-p9 | sala-f1-p9.mp3 | Isso! O robô chegou na ESTRELA! | Acerto | Comemorando | 3.2 s |
| sala-f1-p10 | sala-f1-p10.mp3 | A FASE começa agora. Vamos lá! | Fase começa | Falando | 2.6 s |

## Quarto · Fase 1 (`quarto-f1`)

| id | Arquivo | Fala | Momento | Estado do Logi | Duração padrão |
|---|---|---|---|---|---|
| quarto-f1-p1 | quarto-f1-p1.mp3 | Oi, parceira! Vamos nos arrumar para a ESCOLA! | Abertura | Falando | 3.5 s |
| quarto-f1-p2 | quarto-f1-p2.mp3 | Um bloco está REPETIDO: o vermelho. | Demonstração 1 | Explicando / apontando | 4 s |
| quarto-f1-p3 | quarto-f1-p3.mp3 | O vermelho fica FORA da fila. | Demonstração 2 | Dica (lâmpada acende) | 4 s |
| quarto-f1-p4 | quarto-f1-p4.mp3 | Clique na CAMISETA para pôr na fila. | Demonstração 3 | Explicando / apontando | 4.5 s |
| quarto-f1-p5 | quarto-f1-p5.mp3 | O TÊNIS vem sempre por último. | Demonstração 4 | Dica (lâmpada acende) | 4 s |
| quarto-f1-p6 | quarto-f1-p6.mp3 | Sua vez! Coloque a CALÇA certa na fila. | Sua vez | Aguardando | 0 (espera a criança) |
| quarto-f1-p6-erro | quarto-f1-p6-erro.mp3 | Quase! Pegue a CALÇA que não é vermelha. | Erro na vez | Encorajando | 2.5 s |
| quarto-f1-p7 | quarto-f1-p7.mp3 | Isso! Você achou o bloco CERTO! | Acerto | Comemorando | 3.2 s |
| quarto-f1-p8 | quarto-f1-p8.mp3 | A FASE começa agora. Vamos lá! | Fase começa | Falando | 2.6 s |

## Cozinha · Fase 1 (`cozinha-f1`)

| id | Arquivo | Fala | Momento | Estado do Logi | Duração padrão |
|---|---|---|---|---|---|
| cozinha-f1-p1 | cozinha-f1-p1.mp3 | Oi, parceira! Que bom ver você na COZINHA! | Abertura | Falando | 3.5 s |
| cozinha-f1-p2 | cozinha-f1-p2.mp3 | Leia a FRASE com calma. | Demonstração 1 | Explicando / apontando | 4.5 s |
| cozinha-f1-p3 | cozinha-f1-p3.mp3 | VERDADEIRO é verde, FALSO é vermelho. | Demonstração 2 | Explicando / apontando | 4 s |
| cozinha-f1-p4 | cozinha-f1-p4.mp3 | Leia com atenção a palavra NÃO. | Demonstração 3 | Dica (lâmpada acende) | 4 s |
| cozinha-f1-p5 | cozinha-f1-p5.mp3 | O fogo é quente. Então é FALSO! | Demonstração 4 | Explicando / apontando | 4.5 s |
| cozinha-f1-p6 | cozinha-f1-p6.mp3 | Sua vez! Cuidado com a palavra NUNCA. | Sua vez | Aguardando | 0 (espera a criança) |
| cozinha-f1-p6-erro | cozinha-f1-p6-erro.mp3 | Quase! Leia de novo a palavra NUNCA. | Erro na vez | Encorajando | 2.5 s |
| cozinha-f1-p7 | cozinha-f1-p7.mp3 | Isso! Você leu com muita ATENÇÃO! | Acerto | Comemorando | 3.2 s |
| cozinha-f1-p8 | cozinha-f1-p8.mp3 | A FASE começa agora. Vamos lá! | Fase começa | Falando | 2.6 s |

## Despensa · Fase 1 (`despensa-f1`)

| id | Arquivo | Fala | Momento | Estado do Logi | Duração padrão |
|---|---|---|---|---|---|
| despensa-f1-p1 | despensa-f1-p1.mp3 | Oi, parceira! A DESPENSA está uma bagunça! | Abertura | Falando | 3.5 s |
| despensa-f1-p2 | despensa-f1-p2.mp3 | Hoje só escolhemos frutas VERMELHAS. | Demonstração 1 | Explicando / apontando | 5 s |
| despensa-f1-p3 | despensa-f1-p3.mp3 | Toque na MAÇÃ para escolher. | Demonstração 2 | Explicando / apontando | 5 s |
| despensa-f1-p4 | despensa-f1-p4.mp3 | A banana é AMARELA. Fica de fora! | Demonstração 3 | Dica (lâmpada acende) | 5 s |
| despensa-f1-p5 | despensa-f1-p5.mp3 | Sua vez! Toque no MORANGO. | Sua vez | Aguardando | 0 (espera a criança) |
| despensa-f1-p5-erro | despensa-f1-p5-erro.mp3 | Quase! Procure a outra fruta VERMELHA. | Erro na vez | Encorajando | 2.5 s |
| despensa-f1-p6 | despensa-f1-p6.mp3 | Isso! O morango também é VERMELHO! | Acerto | Comemorando | 3.2 s |
| despensa-f1-p7 | despensa-f1-p7.mp3 | A FASE começa agora. Vamos lá! | Fase começa | Falando | 2.6 s |

**Total:** 50 falas.
