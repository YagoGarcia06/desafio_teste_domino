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
