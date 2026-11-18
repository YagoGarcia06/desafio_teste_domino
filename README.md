# Desafio: Teste de Dominó

**Aluno:** Yago Garcia do Canto — **RA:** 24011308-2 — Disciplina: Projeto, Implementação e Teste de Software (2026)

## Especificação do desafio

Enunciado do professor:

- casos de teste para testar uma partida para 02 jogadores;
- casos de teste em Javascript para testar Javascript;

### Regras adotadas

Dominó clássico com compra, conjunto duplo-seis. Só a lógica do jogo, sem interface.

**Peças**

1. Conjunto duplo-seis: 28 peças únicas, de `[0|0]` a `[6|6]`. Uma peça `[a|b]` é a mesma que `[b|a]`.
2. Valor da peça = soma dos dois lados (`[6|6]` vale 12). Lados fora de 0–6 (ou não inteiros) geram erro.
3. Peça "dupla" (carroça) tem os dois lados iguais.

**Distribuição e início**

4. Exatamente 2 jogadores, identificados por `0` e `1`. Qualquer outro número de jogadores gera erro.
5. A partida embaralha as peças com um `rng` injetável (`criarRng(semente)`). Também aceita uma ordem de peças pronta, para os testes; essa ordem precisa ter as 28 peças, sem repetição. Sem `rng` e sem ordem, a partida não é criada.
6. Cada jogador recebe 7 peças, alternando (0, 1, 0, 1…). As 14 restantes formam o monte.
7. Começa quem tiver o **maior duplo** nas mãos, e a primeira jogada é obrigatoriamente esse duplo.
8. Se ninguém tiver duplo, começa quem tiver a **maior peça** (maior soma; empate pela peça com o maior lado), e ela é a primeira jogada obrigatória.

**Jogadas**

9. Só joga quem está na vez, e só uma peça que está na sua mão.
10. A peça precisa casar com uma das pontas da mesa (`esquerda` ou `direita`). Ela é girada automaticamente para encaixar.
11. Se a peça casa com as duas pontas e elas têm valores diferentes, o jogador precisa dizer a ponta. Se casa com uma só, a ponta pode ser omitida.
12. Depois de jogar, a vez passa ao adversário.
13. **Compra**: quem não tem peça jogável compra uma peça do monte por vez e continua na vez até conseguir jogar ou o monte acabar. Comprar tendo peça jogável gera erro.
14. **Passe**: só é permitido quando o jogador não tem peça jogável e o monte está vazio. A vez vai ao adversário.

**Fim e pontuação**

15. **Batida**: quem fica sem peças vence e marca a soma das peças na mão do adversário.
16. **Jogo trancado**: dois passes seguidos encerram a partida. Vence quem tiver a menor soma na mão e marca a soma do adversário. Somas iguais: empate, sem pontos.
17. Cada partida é uma mão (sem série até 100 pontos).
18. Depois do fim, jogar, comprar ou passar gera erro.

**Decisões de interpretação** (pontos que as regras acima não fixam):

- A primeira jogada vai para a mesa vazia; a ponta informada nela é ignorada.
- Se a peça casa com as duas pontas e elas têm o **mesmo** valor, a ponta pode ser omitida e a peça vai para a `direita`.
- Uma ponta diferente de `esquerda`/`direita` gera erro, mesmo quando a peça encaixa.
- A compra tira a próxima peça do monte, na ordem em que ele foi formado. Comprar não conta como passe.
- Só os passes contam para o trancamento: qualquer jogada zera a contagem de passes seguidos.
- Jogador diferente de `0` e `1` gera erro em jogar, comprar e passar.

## Como executar

```bash
npm ci
npm test
npm run coverage
```

## Como funcionam os casos de teste

- **Ferramenta:** Jest (`npm test`). Há um arquivo de teste por módulo em `tests/`, com um `describe` por grupo de regra.
- **Identificação:** cada teste começa com um ID no formato `CT-<GRUPO>-NN` (por exemplo, `CT-JOGADA-08`). Os grupos da partida são `CT-INICIO`, `CT-JOGADA`, `CT-COMPRA`, `CT-PASSE`, `CT-BATIDA`, `CT-TRANCADO` e `CT-FIM`; os módulos de apoio usam `CT-PECA`, `CT-RNG`, `CT-CONJ` e `CT-MESA`.
- **Normal, limite e erro:** para cada regra há o caso esperado, os casos de borda (lados 0 e 6, 27/28/29 peças, monte com 1 e com 0 peças, batida valendo 0 pontos, um passe só) e os casos que devem gerar erro, verificados com `toThrow` e um trecho da mensagem.
- **Aleatoriedade controlada:** nenhum teste depende de sorte. Os cenários são montados com uma ordem de peças pronta (o helper `ordemCom` intercala as mãos desejadas e completa o monte), e as partidas embaralhadas usam `criarRng(semente)` com semente fixa.
- **Partidas completas:** há partidas montadas jogada a jogada (batida sem compras, batida valendo 0 pontos e um jogo trancado em que o jogador 1 compra o monte inteiro) e partidas com semente jogadas até o fim por uma estratégia fixa (joga a primeira peça possível, senão compra, senão passa), cobrindo batida de cada jogador, trancado com vencedor e trancado empatado.

### `src/peca.js` — `tests/peca.test.js`

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-PECA-01 | Cria uma peça com os dois lados informados | `a` = 2 e `b` = 5 |
| CT-PECA-02 | Aceita os limites 0 e 6 nos lados | `[0\|0]` e `[6\|6]` criadas sem erro |
| CT-PECA-03 | Rejeita lado acima de 6 | Erro "fora do intervalo 0–6" |
| CT-PECA-04 | Rejeita lado negativo | Erro "fora do intervalo 0–6" |
| CT-PECA-05 | Rejeita lado que não é número inteiro | Erro para `2.5` e para `"3"` |
| CT-PECA-06 | A peça criada não pode ser alterada | Objeto congelado (`Object.isFrozen` = true) |
| CT-PECA-07 | Valor é a soma dos dois lados | `[2\|3]` vale 5 |
| CT-PECA-08 | Valores nos limites: `[0\|0]` vale 0 e `[6\|6]` vale 12 | 0 e 12 |
| CT-PECA-09 | Peça com lados iguais é dupla | `true` |
| CT-PECA-10 | Peça com lados diferentes não é dupla | `false` |
| CT-PECA-11 | [a\|b] e [b\|a] são a mesma peça | `true` nas duas ordens |
| CT-PECA-12 | Peças com lados diferentes não são a mesma | `false` |
| CT-PECA-13 | ContemNumero verifica os dois lados | `true` para 2 e 5, `false` para 3 |
| CT-PECA-14 | Girar inverte os lados sem alterar a original | `[5\|2]`, original continua `[2\|5]` |
| CT-PECA-15 | CompararPecas usa a soma como primeiro critério | `[3\|4]` maior que `[1\|5]` (resultado positivo/negativo) |
| CT-PECA-16 | Com soma igual, vence a peça com o maior lado | `[1\|5]` > `[2\|4]` e `[3\|3]` < `[2\|4]` |
| CT-PECA-17 | A mesma peça (em qualquer ordem) compara como igual | 0 |
| CT-PECA-18 | TextoPeca mostra a peça no formato [a\|b] | `"[3\|6]"` |

### `src/rng.js` — `tests/rng.test.js`

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-RNG-01 | A mesma semente gera a mesma sequência | Sequências iguais |
| CT-RNG-02 | Sementes diferentes geram sequências diferentes | Sequências diferentes |
| CT-RNG-03 | Todos os valores ficam no intervalo [0, 1) | 1000 valores entre 0 (inclusive) e 1 (exclusive) |
| CT-RNG-04 | Aceita a semente limite 0 | 5 valores distintos |
| CT-RNG-05 | Rejeita semente que não é inteira | Erro "semente" para `1.5`, `"abc"` e ausente |

### `src/conjunto.js` — `tests/conjunto.test.js`

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-CONJ-01 | O conjunto duplo-seis tem 28 peças | 28 peças |
| CT-CONJ-02 | Não há peças repetidas, nem invertidas | Nenhuma repetida |
| CT-CONJ-03 | Vai de `[0\|0]` a `[6\|6]` e tem 7 duplas | Contém `[0\|0]` e `[6\|6]`; 7 duplas |
| CT-CONJ-04 | A soma de todas as peças é 168 | 168 |
| CT-CONJ-05 | Embaralhar com a mesma semente dá a mesma ordem | Ordens iguais |
| CT-CONJ-06 | Embaralhar muda a ordem e mantém as mesmas 28 peças | Ordem diferente da original, com as mesmas 28 peças |
| CT-CONJ-07 | Embaralhar não altera a lista original | Lista original intacta |
| CT-CONJ-08 | Rng que sempre devolve 0 gera uma ordem previsível | `[1,2,3,4]` vira `[2,3,4,1]` |
| CT-CONJ-09 | Embaralhar sem rng gera erro | Erro "rng" |
| CT-CONJ-10 | Distribui 7 peças para cada jogador e deixa 14 no monte | 7 + 7 peças nas mãos e 14 no monte |
| CT-CONJ-11 | Distribui alternando entre os jogadores 0 e 1 | Mão 0 = índices pares, mão 1 = ímpares, monte = índices 14 a 27 |
| CT-CONJ-12 | ValidarConjunto aceita as 28 peças em qualquer ordem e lado | Devolve as 28 peças |
| CT-CONJ-13 | Rejeita conjunto com 27 peças (uma a menos) | Erro "exatamente 28" |
| CT-CONJ-14 | Rejeita conjunto com 29 peças (uma a mais) | Erro "exatamente 28" |
| CT-CONJ-15 | Rejeita conjunto com peça repetida, mesmo invertida | Erro "repetida" citando `[1\|0]` |
| CT-CONJ-16 | Rejeita conjunto com peça inválida ou que não é lista | Erro "fora do intervalo"; erro "exatamente 28" para texto |
| CT-CONJ-17 | Distribuir valida o conjunto antes de dar as peças | Erro "exatamente 28" |

### `src/mesa.js` — `tests/mesa.test.js`

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-MESA-01 | A mesa começa vazia e sem pontas | `estaVazia()` = true e `pontas()` = null |
| CT-MESA-02 | A primeira peça entra como veio e define as duas pontas | Mesa `[6\|4]`, pontas 6 e 4 |
| CT-MESA-03 | Com a mesa vazia, qualquer peça cabe nas duas pontas | `["esquerda", "direita"]` |
| CT-MESA-04 | PontasPossiveis lista só as pontas que casam com a peça | `[direita]`, `[esquerda]`, as duas e nenhuma |
| CT-MESA-05 | Encaixa na direita sem girar quando o lado a casa | Mesa `[6\|4][4\|2]`, pontas 6 e 2 |
| CT-MESA-06 | Gira a peça para encaixar na direita | `[2\|4]` entra como `[4\|2]` |
| CT-MESA-07 | Encaixa na esquerda sem girar quando o lado b casa | Mesa `[1\|6][6\|4]`, pontas 1 e 4 |
| CT-MESA-08 | Gira a peça para encaixar na esquerda | `[6\|1]` entra como `[1\|6]` |
| CT-MESA-09 | Dupla encaixada mantém a mesma ponta | Pontas continuam 6 e 4 |
| CT-MESA-10 | Colocar devolve a peça já orientada | Devolve `[4\|2]` |
| CT-MESA-11 | Rejeita peça que não casa com a ponta escolhida | Erro "não encaixa na ponta esquerda (6)"; mesa inalterada |
| CT-MESA-12 | Rejeita ponta inválida ou ausente com a mesa ocupada | Erro "Ponta inválida" para `"meio"` e para ponta ausente |
| CT-MESA-13 | Sequência longa mantém as pontas corretas nos dois lados | `[0\|2][2\|5][5\|5][5\|3][3\|3]`, pontas 0 e 3 |

### `src/partida.js` — `tests/partida.test.js`

**Início** (`CT-INICIO`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-INICIO-01 | Com rng, distribui 7 peças por jogador e deixa 14 no monte | 7, 7 e 14 |
| CT-INICIO-02 | A mesma semente gera a mesma partida | Mãos e jogador inicial iguais |
| CT-INICIO-03 | Com ordem pronta, as mãos seguem a distribuição alternada | Mãos iguais às montadas |
| CT-INICIO-04 | A partida começa com a mesa vazia, sem resultado | Mesa vazia, pontas null, `encerrada` = false, `resultado` = null |
| CT-INICIO-05 | Começa quem tem o maior duplo, e ele é a primeira jogada | Jogador 1 começa com `[5\|5]` |
| CT-INICIO-06 | Duplo vale mais que peça maior: `[0\|0]` começa contra `[6\|5]` | Jogador 0 começa com `[0\|0]` |
| CT-INICIO-07 | Sem duplos, começa quem tem a maior peça | Jogador 0 começa com `[6\|5]` |
| CT-INICIO-08 | Sem duplos e com somas empatadas, vence a peça com o maior lado | Jogador 1 começa com `[1\|6]` |
| CT-INICIO-09 | Antes da primeira jogada, só o duplo obrigatório é jogável | Jogador 0: só `[6\|6]`; jogador 1: nenhuma |
| CT-INICIO-10 | Rejeita partida com 1 ou 3 jogadores | Erro "exatamente 2 jogadores" |
| CT-INICIO-11 | Aceita explicitamente 2 jogadores | Partida criada, vez de 0 ou 1 |
| CT-INICIO-12 | Rejeita partida sem rng e sem ordem | Erro "rng ou uma ordem" |
| CT-INICIO-13 | Rejeita ordem pronta incompleta | Erro "exatamente 28" |
| CT-INICIO-14 | Consulta a mão de jogador inexistente gera erro | Erro "Jogador inválido" |

**Jogadas** (`CT-JOGADA`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-JOGADA-01 | A primeira jogada coloca o duplo na mesa e passa a vez | Mesa `[6\|6]`, mão com 6 peças, vez do jogador 1 |
| CT-JOGADA-02 | A primeira jogada com outra peça gera erro | Erro "primeira jogada deve ser [6\|6]"; mesa vazia |
| CT-JOGADA-03 | Jogador fora da vez não pode jogar | Erro "Não é a vez do jogador 1" |
| CT-JOGADA-04 | Não pode jogar peça que não está na mão | Erro "[6\|4] não está na mão do jogador 1" |
| CT-JOGADA-05 | Jogador inexistente gera erro | Erro "Jogador inválido" para 2 e -1 |
| CT-JOGADA-06 | Peça que não encaixa gera erro e não muda a mão nem a vez | Erro "não encaixa em nenhuma ponta"; mão com 7 e vez mantida |
| CT-JOGADA-07 | Com uma só ponta possível, a ponta pode ser omitida e a peça é girada | `[4\|5]` entra girada como `[5\|4]`; pontas 6 e 4 |
| CT-JOGADA-08 | Peça que casa com pontas diferentes exige a ponta | Sem ponta: erro "encaixa nas duas pontas"; com `esquerda`: pontas 3 e 3 |
| CT-JOGADA-09 | Com as duas pontas de mesmo valor, a ponta omitida vira direita | `[3\|6]` vai para a direita como `[6\|3]` |
| CT-JOGADA-10 | Com as duas pontas iguais, a ponta pode ser escolhida | `[3\|6]` vai para a esquerda |
| CT-JOGADA-11 | Ponta informada que não casa gera erro | Erro "não encaixa na ponta esquerda" |
| CT-JOGADA-12 | Ponta com nome inválido gera erro | Erro "Ponta inválida" |
| CT-JOGADA-13 | A peça pode ser informada invertida | `[5\|6]` sai da mão |
| CT-JOGADA-14 | A vez alterna entre os jogadores a cada jogada | Vez: 1, 0, 1, 0 |
| CT-JOGADA-15 | PecasJogaveis lista as peças da mão que casam com as pontas | `[5\|6]` e `[3\|6]` |
| CT-JOGADA-16 | Alterar a lista devolvida por mao() não altera a partida | Mão continua com 7 peças |
| CT-JOGADA-17 | Com a esquerda como única ponta possível, a ponta omitida vai para a esquerda | `[6\|5]` entra na esquerda como `[5\|6]` |

**Compra** (`CT-COMPRA`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-COMPRA-01 | Quem não tem jogada compra a próxima peça do monte e continua na vez | Recebe `[0\|0]`; mão 8, monte 13; continua na vez |
| CT-COMPRA-02 | Comprar tendo peça jogável gera erro | Erro "tem peça jogável e não pode comprar"; monte com 14 |
| CT-COMPRA-03 | Compra uma por vez até conseguir jogar, esvaziando o monte (limite) | 13 compras sem jogada; a 14ª é `[6\|0]`; monte 0, mão 21 |
| CT-COMPRA-04 | Depois de comprar a peça jogável, não pode comprar de novo | Erro "tem peça jogável" |
| CT-COMPRA-05 | A peça comprada pode ser jogada em seguida | Pontas 0 e 6; vez do jogador 0 |
| CT-COMPRA-06 | Sem jogada e com o monte vazio, comprar gera erro | Erro "monte está vazio" |
| CT-COMPRA-07 | Jogador fora da vez não pode comprar | Erro "Não é a vez do jogador 0" |

**Passe** (`CT-PASSE`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-PASSE-01 | Passar com peças no monte gera erro | Erro "monte vazio" |
| CT-PASSE-02 | Passar com 1 peça no monte (limite) ainda gera erro | Erro "monte vazio" com 1 peça restante |
| CT-PASSE-03 | Passar tendo peça jogável gera erro | Erro "tem peça jogável e não pode passar" |
| CT-PASSE-04 | Sem jogada e com o monte vazio, o passe dá a vez ao adversário | Vez do jogador 0; partida continua |
| CT-PASSE-05 | Jogador fora da vez não pode passar | Erro "Não é a vez do jogador 0" |

**Batida** (`CT-BATIDA`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-BATIDA-01 | Partida completa sem compras: jogador 0 bate e marca 9 pontos | `{ motivo: "batida", vencedor: 0, pontos: 9 }` |
| CT-BATIDA-02 | Bater com o adversário só com `[0\|0]` vale 0 pontos (limite) | `{ motivo: "batida", vencedor: 0, pontos: 0 }` |
| CT-BATIDA-03 | Com uma peça na mão, a partida ainda não terminou | `encerrada` = false e `resultado` = null |
| CT-BATIDA-04 | Partida completa com semente 6 termina em batida do jogador 1 | Batida do jogador 1; pontos = soma da mão do jogador 0; 28 peças no total |
| CT-BATIDA-05 | Partida completa com semente 2 termina em batida do jogador 0 | Batida do jogador 0; pontos = soma da mão do jogador 1; 28 peças no total |

**Jogo trancado** (`CT-TRANCADO`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-TRANCADO-01 | Partida completa trancada: vence a menor soma e marca a do adversário | Pontas 6 e 6; somas 10 × 80; `{ motivo: "trancado", vencedor: 0, pontos: 80 }` |
| CT-TRANCADO-02 | Um passe só não tranca o jogo | `encerrada` = false |
| CT-TRANCADO-03 | Uma jogada entre dois passes zera a contagem | Segundo passe não encerra; vez do jogador 0 |
| CT-TRANCADO-04 | Partida completa com semente 1 tranca e o jogador 1 vence | Trancado; vencedor 1 (menor soma); pontos = soma do jogador 0; monte vazio |
| CT-TRANCADO-05 | Partida completa com semente 102 tranca empatada, sem pontos | Somas iguais; `{ motivo: "trancado", vencedor: null, pontos: 0 }` |

**Fim da partida** (`CT-FIM`)

| ID | O que testa | Resultado esperado |
| --- | --- | --- |
| CT-FIM-01 | Depois da batida, jogar gera erro | Erro "já terminou" |
| CT-FIM-02 | Depois da batida, comprar gera erro | Erro "já terminou" |
| CT-FIM-03 | Depois do trancado, passar gera erro | Erro "já terminou" |
| CT-FIM-04 | O resultado não muda depois das tentativas após o fim | Erro "já terminou"; resultado igual ao anterior |
| CT-FIM-05 | Cada partida é uma mão: uma nova partida começa sem pontos acumulados | Nova partida sem resultado, com 7 peças por mão e mesa vazia |

## Cobertura

Resultado de `npm run coverage` (111 testes, todos passando):

| Arquivo | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| `src/conjunto.js` | 100% | 100% | 100% | 100% |
| `src/mesa.js` | 100% | 100% | 100% | 100% |
| `src/partida.js` | 100% | 100% | 100% | 100% |
| `src/peca.js` | 100% | 100% | 100% | 100% |
| `src/rng.js` | 100% | 100% | 100% | 100% |
| **Total** | **100%** | **100%** | **100%** | **100%** |

## Estrutura do projeto

```
desafio_teste_domino/
├── src/
│   ├── peca.js        ← criação, valor, dupla, comparação, encaixe e giro de peças
│   ├── rng.js         ← gerador de números com semente (mulberry32)
│   ├── conjunto.js    ← 28 peças, validação, embaralhamento e distribuição
│   ├── mesa.js        ← pontas da mesa e encaixe das peças
│   └── partida.js     ← início, vez, jogadas, compra, passe, fim e pontuação
├── tests/
│   ├── peca.test.js
│   ├── rng.test.js
│   ├── conjunto.test.js
│   ├── mesa.test.js
│   └── partida.test.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## Colaborador(es)

- Yago Garcia do Canto (trabalho individual)
