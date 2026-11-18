const { Partida } = require('../src/partida');
const { criarConjunto } = require('../src/conjunto');
const { criarPeca, mesmaPeca, contemNumero } = require('../src/peca');
const { criarRng } = require('../src/rng');

const p = criarPeca;

// Monta a ordem das 28 peças a partir das mãos desejadas: intercala as mãos
// (0, 1, 0, 1...), põe o começo do monte informado e completa com o que sobrou.
function ordemCom(mao0, mao1, inicioMonte = []) {
  const usadas = [...mao0, ...mao1, ...inicioMonte];
  const resto = criarConjunto().filter((peca) => !usadas.some((u) => mesmaPeca(u, peca)));
  const intercaladas = mao0.flatMap((peca, i) => [peca, mao1[i]]);
  return [...intercaladas, ...inicioMonte, ...resto];
}

function novaPartida(mao0, mao1, inicioMonte) {
  return new Partida({ ordem: ordemCom(mao0, mao1, inicioMonte) });
}

// Cenário de batida sem compras: o jogador 0 encaixa 7 peças em sequência pela direita.
const BATIDA_MAO0 = [p(6, 6), p(4, 5), p(2, 3), p(1, 1), p(0, 0), p(2, 2), p(4, 4)];
const BATIDA_MAO1 = [p(5, 6), p(3, 4), p(1, 2), p(0, 1), p(0, 2), p(2, 4), p(3, 6)];
const BATIDA_JOGADAS = [
  [0, p(6, 6)], [1, p(5, 6)], [0, p(4, 5)], [1, p(3, 4)], [0, p(2, 3)], [1, p(1, 2)],
  [0, p(1, 1)], [1, p(0, 1)], [0, p(0, 0)], [1, p(0, 2)], [0, p(2, 2)], [1, p(2, 4)],
  [0, p(4, 4)],
];

// Cenário de trancado: o jogador 1 não tem 6 e compra o monte inteiro; o [6|0] é a última peça.
const TRANCADO_MAO0 = [p(6, 6), p(6, 2), p(6, 1), p(6, 3), p(6, 4), p(6, 5), p(5, 5)];
const TRANCADO_MAO1 = [p(0, 1), p(2, 3), p(4, 5), p(1, 1), p(2, 2), p(3, 3), p(4, 4)];
const TRANCADO_MONTE = [
  p(0, 0), p(0, 2), p(0, 3), p(0, 4), p(0, 5), p(1, 2), p(1, 3),
  p(1, 4), p(1, 5), p(2, 4), p(2, 5), p(3, 4), p(3, 5), p(6, 0),
];

function partidaTrancado() {
  return novaPartida(TRANCADO_MAO0, TRANCADO_MAO1, TRANCADO_MONTE);
}

function comprarMonteInteiro(partida, jogador) {
  for (let i = 0; i < 14; i++) {
    partida.comprar(jogador);
  }
}

// Leva o cenário de trancado até o primeiro passe obrigatório do jogador 1 (pontas 6 e 6, monte vazio).
function trancadoAtePrimeiroPasse() {
  const partida = partidaTrancado();
  partida.jogar(0, p(6, 6));
  comprarMonteInteiro(partida, 1);
  partida.jogar(1, p(6, 0), 'esquerda');
  partida.jogar(0, p(6, 2), 'direita');
  partida.jogar(1, p(0, 1), 'esquerda');
  partida.jogar(0, p(6, 1), 'esquerda');
  partida.jogar(1, p(2, 3), 'direita');
  partida.jogar(0, p(6, 3), 'direita');
  return partida;
}

describe('Início da partida', () => {
  test('CT-INICIO-01: com rng, distribui 7 peças por jogador e deixa 14 no monte', () => {
    const partida = new Partida({ rng: criarRng(5) });
    expect(partida.mao(0)).toHaveLength(7);
    expect(partida.mao(1)).toHaveLength(7);
    expect(partida.pecasNoMonte()).toBe(14);
  });

  test('CT-INICIO-02: a mesma semente gera a mesma partida', () => {
    const primeira = new Partida({ rng: criarRng(77) });
    const segunda = new Partida({ rng: criarRng(77) });
    expect(primeira.mao(0)).toEqual(segunda.mao(0));
    expect(primeira.mao(1)).toEqual(segunda.mao(1));
    expect(primeira.jogadorAtual).toBe(segunda.jogadorAtual);
  });

  test('CT-INICIO-03: com ordem pronta, as mãos seguem a distribuição alternada', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(partida.mao(0)).toEqual(BATIDA_MAO0);
    expect(partida.mao(1)).toEqual(BATIDA_MAO1);
  });

  test('CT-INICIO-04: a partida começa com a mesa vazia, sem resultado', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(partida.pecasNaMesa()).toEqual([]);
    expect(partida.pontas()).toBeNull();
    expect(partida.encerrada).toBe(false);
    expect(partida.resultado).toBeNull();
  });

  test('CT-INICIO-05: começa quem tem o maior duplo, e ele é a primeira jogada', () => {
    const partida = novaPartida(
      [p(3, 3), p(6, 5), p(6, 4), p(0, 1), p(0, 2), p(0, 3), p(0, 4)],
      [p(5, 5), p(1, 1), p(1, 2), p(1, 3), p(1, 4), p(1, 5), p(1, 6)],
    );
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.primeiraJogada).toEqual(p(5, 5));
  });

  test('CT-INICIO-06: duplo vale mais que peça maior: [0|0] começa contra [6|5]', () => {
    const partida = novaPartida(
      [p(0, 0), p(0, 1), p(0, 2), p(0, 3), p(0, 4), p(1, 2), p(1, 3)],
      [p(6, 5), p(6, 4), p(5, 4), p(5, 3), p(6, 3), p(4, 3), p(6, 2)],
    );
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.primeiraJogada).toEqual(p(0, 0));
  });

  test('CT-INICIO-07: sem duplos, começa quem tem a maior peça', () => {
    const partida = novaPartida(
      [p(0, 1), p(0, 2), p(0, 3), p(0, 4), p(1, 2), p(1, 3), p(6, 5)],
      [p(6, 4), p(5, 4), p(5, 3), p(6, 3), p(4, 3), p(6, 2), p(5, 2)],
    );
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.primeiraJogada).toEqual(p(6, 5));
  });

  test('CT-INICIO-08: sem duplos e com somas empatadas, vence a peça com o maior lado', () => {
    const partida = novaPartida(
      [p(2, 5), p(3, 4), p(0, 1), p(0, 2), p(0, 3), p(0, 4), p(0, 5)],
      [p(1, 6), p(1, 2), p(1, 3), p(1, 4), p(1, 5), p(2, 3), p(2, 4)],
    );
    expect(partida.jogadorAtual).toBe(1);
    expect(partida.primeiraJogada).toEqual(p(1, 6));
  });

  test('CT-INICIO-09: antes da primeira jogada, só o duplo obrigatório é jogável', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(partida.pecasJogaveis(0)).toEqual([p(6, 6)]);
    expect(partida.pecasJogaveis(1)).toEqual([]);
  });

  test('CT-INICIO-10: rejeita partida com 1 ou 3 jogadores', () => {
    expect(() => new Partida({ rng: criarRng(1), jogadores: 1 })).toThrow(/exatamente 2 jogadores/);
    expect(() => new Partida({ rng: criarRng(1), jogadores: 3 })).toThrow(/exatamente 2 jogadores/);
  });

  test('CT-INICIO-11: aceita explicitamente 2 jogadores', () => {
    const partida = new Partida({ rng: criarRng(1), jogadores: 2 });
    expect([0, 1]).toContain(partida.jogadorAtual);
  });

  test('CT-INICIO-12: rejeita partida sem rng e sem ordem', () => {
    expect(() => new Partida()).toThrow(/rng ou uma ordem/);
  });

  test('CT-INICIO-13: rejeita ordem pronta incompleta', () => {
    expect(() => new Partida({ ordem: criarConjunto().slice(0, 27) })).toThrow(/exatamente 28/);
  });

  test('CT-INICIO-14: consulta a mão de jogador inexistente gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(() => partida.mao(2)).toThrow(/Jogador inválido/);
  });
});

describe('Jogadas', () => {
  test('CT-JOGADA-01: a primeira jogada coloca o duplo na mesa e passa a vez', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    expect(partida.pecasNaMesa()).toEqual([p(6, 6)]);
    expect(partida.mao(0)).toHaveLength(6);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-JOGADA-02: a primeira jogada com outra peça gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(() => partida.jogar(0, p(4, 5))).toThrow(/primeira jogada deve ser \[6\|6\]/);
    expect(partida.pecasNaMesa()).toEqual([]);
  });

  test('CT-JOGADA-03: jogador fora da vez não pode jogar', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(() => partida.jogar(1, p(5, 6))).toThrow(/Não é a vez do jogador 1/);
  });

  test('CT-JOGADA-04: não pode jogar peça que não está na mão', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    expect(() => partida.jogar(1, p(6, 4), 'direita')).toThrow(/\[6\|4\] não está na mão do jogador 1/);
  });

  test('CT-JOGADA-05: jogador inexistente gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(() => partida.jogar(2, p(6, 6))).toThrow(/Jogador inválido: 2/);
    expect(() => partida.jogar(-1, p(6, 6))).toThrow(/Jogador inválido: -1/);
  });

  test('CT-JOGADA-06: peça que não encaixa gera erro e não muda a mão nem a vez', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    expect(() => partida.jogar(1, p(1, 2))).toThrow(/não encaixa em nenhuma ponta/);
    expect(partida.mao(1)).toHaveLength(7);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-JOGADA-07: com uma só ponta possível, a ponta pode ser omitida e a peça é girada', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(5, 6), 'direita');
    partida.jogar(0, p(4, 5));
    expect(partida.pecasNaMesa()).toEqual([p(6, 6), p(6, 5), p(5, 4)]);
    expect(partida.pontas()).toEqual({ esquerda: 6, direita: 4 });
  });

  test('CT-JOGADA-08: peça que casa com pontas diferentes exige a ponta', () => {
    const partida = novaPartida(
      [p(6, 6), p(6, 5), p(0, 0), p(0, 1), p(0, 2), p(0, 3), p(0, 4)],
      [p(6, 3), p(5, 3), p(1, 1), p(1, 2), p(1, 3), p(1, 4), p(1, 5)],
    );
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(6, 3), 'direita');
    partida.jogar(0, p(6, 5), 'esquerda');
    expect(partida.pontas()).toEqual({ esquerda: 5, direita: 3 });
    expect(() => partida.jogar(1, p(5, 3))).toThrow(/encaixa nas duas pontas/);
    partida.jogar(1, p(5, 3), 'esquerda');
    expect(partida.pontas()).toEqual({ esquerda: 3, direita: 3 });
  });

  test('CT-JOGADA-09: com as duas pontas de mesmo valor, a ponta omitida vira direita', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(3, 6));
    expect(partida.pecasNaMesa()).toEqual([p(6, 6), p(6, 3)]);
  });

  test('CT-JOGADA-10: com as duas pontas iguais, a ponta pode ser escolhida', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(3, 6), 'esquerda');
    expect(partida.pecasNaMesa()).toEqual([p(3, 6), p(6, 6)]);
  });

  test('CT-JOGADA-11: ponta informada que não casa gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(5, 6), 'direita');
    expect(() => partida.jogar(0, p(4, 5), 'esquerda')).toThrow(/não encaixa na ponta esquerda/);
  });

  test('CT-JOGADA-12: ponta com nome inválido gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    expect(() => partida.jogar(1, p(5, 6), 'cima')).toThrow(/Ponta inválida/);
  });

  test('CT-JOGADA-13: a peça pode ser informada invertida', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(6, 5), 'direita');
    expect(partida.mao(1).some((peca) => mesmaPeca(peca, p(5, 6)))).toBe(false);
  });

  test('CT-JOGADA-14: a vez alterna entre os jogadores a cada jogada', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    const vezes = BATIDA_JOGADAS.slice(0, 4).map(([jogador, peca]) => {
      partida.jogar(jogador, peca, 'direita');
      return partida.jogadorAtual;
    });
    expect(vezes).toEqual([1, 0, 1, 0]);
  });

  test('CT-JOGADA-15: pecasJogaveis lista as peças da mão que casam com as pontas', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    expect(partida.pecasJogaveis(1)).toEqual([p(5, 6), p(3, 6)]);
  });

  test('CT-JOGADA-16: alterar a lista devolvida por mao() não altera a partida', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.mao(0).pop();
    expect(partida.mao(0)).toHaveLength(7);
  });

  test('CT-JOGADA-17: com a esquerda como única ponta possível, a ponta omitida vai para a esquerda', () => {
    const partida = novaPartida(
      [p(6, 6), p(6, 5), p(0, 0), p(0, 1), p(0, 2), p(0, 3), p(0, 4)],
      [p(6, 3), p(5, 3), p(1, 1), p(1, 2), p(1, 3), p(1, 4), p(1, 5)],
    );
    partida.jogar(0, p(6, 6));
    partida.jogar(1, p(6, 3), 'direita');
    partida.jogar(0, p(6, 5));
    expect(partida.pecasNaMesa()).toEqual([p(5, 6), p(6, 6), p(6, 3)]);
  });

  test('CT-JOGADA-18: alterar o objeto passado depois de jogar não altera a mesa', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    const dupla = { a: 6, b: 6 };
    partida.jogar(0, dupla);
    dupla.a = 0;
    dupla.b = 0;
    const outra = { a: 6, b: 5 };
    partida.jogar(1, outra, 'direita');
    outra.a = 1;
    outra.b = 1;
    expect(partida.pecasNaMesa()).toEqual([p(6, 6), p(6, 5)]);
    expect(partida.pontas()).toEqual({ esquerda: 6, direita: 5 });
  });

  test('CT-JOGADA-19: jogar sem informar a peça gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(() => partida.jogar(0)).toThrow(/Informe a peça a jogar/);
    expect(() => partida.jogar(0, null)).toThrow(/Informe a peça a jogar/);
    expect(() => partida.jogar(0, '6|6')).toThrow(/Informe a peça a jogar/);
    expect(partida.pecasNaMesa()).toEqual([]);
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-JOGADA-20: sem duplos, a primeira jogada com outra peça que não a maior gera erro', () => {
    const partida = novaPartida(
      [p(0, 1), p(0, 2), p(0, 3), p(0, 4), p(1, 2), p(1, 3), p(6, 5)],
      [p(6, 4), p(5, 4), p(5, 3), p(6, 3), p(4, 3), p(6, 2), p(5, 2)],
    );
    expect(() => partida.jogar(0, p(0, 1))).toThrow(/primeira jogada deve ser \[6\|5\]/);
    expect(partida.pecasNaMesa()).toEqual([]);
    partida.jogar(0, p(5, 6));
    expect(partida.pecasNaMesa()).toEqual([p(6, 5)]);
  });

  test('CT-JOGADA-21: na primeira jogada, a ponta informada é ignorada, mesmo inválida', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6), 'cima');
    expect(partida.pecasNaMesa()).toEqual([p(6, 6)]);
    expect(partida.jogadorAtual).toBe(1);
  });
});

describe('Compra', () => {
  test('CT-COMPRA-01: quem não tem jogada compra a próxima peça do monte e continua na vez', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    const comprada = partida.comprar(1);
    expect(comprada).toEqual(p(0, 0));
    expect(partida.mao(1)).toHaveLength(8);
    expect(partida.pecasNoMonte()).toBe(13);
    expect(partida.jogadorAtual).toBe(1);
  });

  test('CT-COMPRA-02: comprar tendo peça jogável gera erro', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    partida.jogar(0, p(6, 6));
    expect(() => partida.comprar(1)).toThrow(/tem peça jogável e não pode comprar/);
    expect(partida.pecasNoMonte()).toBe(14);
  });

  test('CT-COMPRA-03: compra uma por vez até conseguir jogar, esvaziando o monte (limite)', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    for (let i = 0; i < 13; i++) {
      partida.comprar(1);
      expect(partida.temJogada(1)).toBe(false);
    }
    expect(partida.comprar(1)).toEqual(p(6, 0));
    expect(partida.pecasNoMonte()).toBe(0);
    expect(partida.mao(1)).toHaveLength(21);
    expect(partida.pecasJogaveis(1)).toEqual([p(6, 0)]);
  });

  test('CT-COMPRA-04: depois de comprar a peça jogável, não pode comprar de novo', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    comprarMonteInteiro(partida, 1);
    expect(() => partida.comprar(1)).toThrow(/tem peça jogável/);
  });

  test('CT-COMPRA-05: a peça comprada pode ser jogada em seguida', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    comprarMonteInteiro(partida, 1);
    partida.jogar(1, p(6, 0), 'esquerda');
    expect(partida.pontas()).toEqual({ esquerda: 0, direita: 6 });
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-COMPRA-06: sem jogada e com o monte vazio, comprar gera erro', () => {
    const partida = trancadoAtePrimeiroPasse();
    expect(partida.temJogada(1)).toBe(false);
    expect(() => partida.comprar(1)).toThrow(/monte está vazio/);
  });

  test('CT-COMPRA-07: jogador fora da vez não pode comprar', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    expect(() => partida.comprar(0)).toThrow(/Não é a vez do jogador 0/);
  });

  test('CT-COMPRA-08: jogador inexistente não pode comprar', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    expect(() => partida.comprar(2)).toThrow(/Jogador inválido: 2/);
    expect(partida.pecasNoMonte()).toBe(14);
  });
});

describe('Passe', () => {
  test('CT-PASSE-01: passar com peças no monte gera erro', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    expect(() => partida.passar(1)).toThrow(/monte vazio/);
  });

  test('CT-PASSE-02: passar com 1 peça no monte (limite) ainda gera erro', () => {
    const partida = partidaTrancado();
    partida.jogar(0, p(6, 6));
    for (let i = 0; i < 13; i++) {
      partida.comprar(1);
    }
    expect(partida.pecasNoMonte()).toBe(1);
    expect(() => partida.passar(1)).toThrow(/monte vazio/);
  });

  test('CT-PASSE-03: passar tendo peça jogável gera erro', () => {
    const partida = trancadoAtePrimeiroPasse();
    partida.passar(1);
    expect(() => partida.passar(0)).toThrow(/tem peça jogável e não pode passar/);
  });

  test('CT-PASSE-04: sem jogada e com o monte vazio, o passe dá a vez ao adversário', () => {
    const partida = trancadoAtePrimeiroPasse();
    partida.passar(1);
    expect(partida.jogadorAtual).toBe(0);
    expect(partida.encerrada).toBe(false);
  });

  test('CT-PASSE-05: jogador fora da vez não pode passar', () => {
    const partida = trancadoAtePrimeiroPasse();
    expect(() => partida.passar(0)).toThrow(/Não é a vez do jogador 0/);
  });

  test('CT-PASSE-06: jogador inexistente não pode passar', () => {
    const partida = trancadoAtePrimeiroPasse();
    expect(() => partida.passar(2)).toThrow(/Jogador inválido: 2/);
    expect(partida.jogadorAtual).toBe(1);
  });
});

// Estratégia simples para partidas completas com semente: joga a primeira peça
// jogável (preferindo a direita); sem jogada, compra; com o monte vazio, passa.
// O limite de ações evita que um defeito na partida trave o teste em laço infinito.
const LIMITE_DE_ACOES = 500;

function jogarAteOFim(partida) {
  let acoes = 0;
  while (!partida.encerrada) {
    const jogador = partida.jogadorAtual;
    const [peca] = partida.pecasJogaveis(jogador);
    if (peca) {
      const pontas = partida.pontas();
      const ponta = pontas === null || contemNumero(peca, pontas.direita) ? 'direita' : 'esquerda';
      partida.jogar(jogador, peca, ponta);
    } else if (partida.pecasNoMonte() > 0) {
      partida.comprar(jogador);
    } else {
      partida.passar(jogador);
    }
    acoes += 1;
    if (acoes > LIMITE_DE_ACOES) {
      throw new Error(`A partida passou de ${LIMITE_DE_ACOES} ações sem terminar`);
    }
  }
  return acoes;
}

function totalDePecas(partida) {
  return partida.pecasNaMesa().length + partida.mao(0).length + partida.mao(1).length + partida.pecasNoMonte();
}

function jogarTrancadoAteOFim() {
  const partida = trancadoAtePrimeiroPasse();
  partida.passar(1);
  partida.jogar(0, p(6, 4), 'direita');
  partida.jogar(1, p(4, 5), 'direita');
  partida.jogar(0, p(6, 5), 'direita');
  partida.passar(1);
  partida.passar(0);
  return partida;
}

describe('Batida', () => {
  test('CT-BATIDA-01: partida completa sem compras: jogador 0 bate e marca 9 pontos', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    BATIDA_JOGADAS.forEach(([jogador, peca]) => partida.jogar(jogador, peca, 'direita'));
    expect(partida.mao(0)).toEqual([]);
    expect(partida.mao(1)).toEqual([p(3, 6)]);
    expect(partida.encerrada).toBe(true);
    expect(partida.resultado).toEqual({ motivo: 'batida', vencedor: 0, pontos: 9 });
  });

  test('CT-BATIDA-02: bater com o adversário só com [0|0] vale 0 pontos (limite)', () => {
    const partida = novaPartida(
      [p(6, 6), p(4, 5), p(2, 3), p(1, 1), p(0, 2), p(2, 4), p(0, 4)],
      [p(5, 6), p(3, 4), p(1, 2), p(0, 1), p(2, 2), p(4, 4), p(0, 0)],
    );
    [
      [0, p(6, 6)], [1, p(5, 6)], [0, p(4, 5)], [1, p(3, 4)], [0, p(2, 3)], [1, p(1, 2)],
      [0, p(1, 1)], [1, p(0, 1)], [0, p(0, 2)], [1, p(2, 2)], [0, p(2, 4)], [1, p(4, 4)],
      [0, p(0, 4)],
    ].forEach(([jogador, peca]) => partida.jogar(jogador, peca, 'direita'));
    expect(partida.resultado).toEqual({ motivo: 'batida', vencedor: 0, pontos: 0 });
  });

  test('CT-BATIDA-03: com uma peça na mão, a partida ainda não terminou', () => {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    BATIDA_JOGADAS.slice(0, -1).forEach(([jogador, peca]) => partida.jogar(jogador, peca, 'direita'));
    expect(partida.mao(0)).toEqual([p(4, 4)]);
    expect(partida.encerrada).toBe(false);
    expect(partida.resultado).toBeNull();
  });

  test('CT-BATIDA-04: partida completa com semente 6 termina em batida do jogador 1', () => {
    const partida = new Partida({ rng: criarRng(6) });
    jogarAteOFim(partida);
    expect(partida.resultado.motivo).toBe('batida');
    expect(partida.resultado.vencedor).toBe(1);
    expect(partida.mao(1)).toEqual([]);
    expect(partida.resultado.pontos).toBe(partida.somaMao(0));
    expect(totalDePecas(partida)).toBe(28);
  });

  test('CT-BATIDA-05: partida completa com semente 2 termina em batida do jogador 0', () => {
    const partida = new Partida({ rng: criarRng(2) });
    jogarAteOFim(partida);
    expect(partida.resultado.motivo).toBe('batida');
    expect(partida.resultado.vencedor).toBe(0);
    expect(partida.mao(0)).toEqual([]);
    expect(partida.resultado.pontos).toBe(partida.somaMao(1));
    expect(totalDePecas(partida)).toBe(28);
  });
});

describe('Jogo trancado', () => {
  test('CT-TRANCADO-01: partida completa trancada: vence a menor soma e marca a do adversário', () => {
    const partida = jogarTrancadoAteOFim();
    expect(partida.pontas()).toEqual({ esquerda: 6, direita: 6 });
    expect(partida.somaMao(0)).toBe(10);
    expect(partida.somaMao(1)).toBe(80);
    expect(partida.resultado).toEqual({ motivo: 'trancado', vencedor: 0, pontos: 80 });
  });

  test('CT-TRANCADO-02: um passe só não tranca o jogo', () => {
    const partida = trancadoAtePrimeiroPasse();
    partida.passar(1);
    expect(partida.encerrada).toBe(false);
  });

  test('CT-TRANCADO-03: uma jogada entre dois passes zera a contagem', () => {
    const partida = trancadoAtePrimeiroPasse();
    partida.passar(1);
    partida.jogar(0, p(6, 4), 'direita');
    partida.jogar(1, p(4, 5), 'direita');
    partida.jogar(0, p(6, 5), 'direita');
    partida.passar(1);
    expect(partida.encerrada).toBe(false);
    expect(partida.jogadorAtual).toBe(0);
  });

  test('CT-TRANCADO-04: partida completa com semente 1 tranca e o jogador 1 vence', () => {
    const partida = new Partida({ rng: criarRng(1) });
    jogarAteOFim(partida);
    expect(partida.resultado.motivo).toBe('trancado');
    expect(partida.resultado.vencedor).toBe(1);
    expect(partida.somaMao(1)).toBeLessThan(partida.somaMao(0));
    expect(partida.resultado.pontos).toBe(partida.somaMao(0));
    expect(partida.pecasNoMonte()).toBe(0);
  });

  test('CT-TRANCADO-05: partida completa com semente 102 tranca empatada, sem pontos', () => {
    const partida = new Partida({ rng: criarRng(102) });
    jogarAteOFim(partida);
    expect(partida.somaMao(0)).toBe(partida.somaMao(1));
    expect(partida.resultado).toEqual({ motivo: 'trancado', vencedor: null, pontos: 0 });
    expect(totalDePecas(partida)).toBe(28);
  });
});

describe('Fim da partida', () => {
  function partidaBatida() {
    const partida = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    BATIDA_JOGADAS.forEach(([jogador, peca]) => partida.jogar(jogador, peca, 'direita'));
    return partida;
  }

  test('CT-FIM-01: depois da batida, jogar gera erro', () => {
    const partida = partidaBatida();
    expect(() => partida.jogar(1, p(3, 6), 'esquerda')).toThrow(/já terminou/);
  });

  test('CT-FIM-02: depois da batida, comprar gera erro', () => {
    const partida = partidaBatida();
    expect(() => partida.comprar(1)).toThrow(/já terminou/);
  });

  test('CT-FIM-03: depois do trancado, passar gera erro', () => {
    const partida = jogarTrancadoAteOFim();
    expect(() => partida.passar(1)).toThrow(/já terminou/);
  });

  test('CT-FIM-04: o resultado não muda depois das tentativas após o fim', () => {
    const partida = partidaBatida();
    const resultado = { ...partida.resultado };
    expect(() => partida.jogar(0, p(4, 4), 'direita')).toThrow(/já terminou/);
    expect(partida.resultado).toEqual(resultado);
  });

  test('CT-FIM-05: cada partida é uma mão: uma nova partida começa sem pontos acumulados', () => {
    partidaBatida();
    const nova = novaPartida(BATIDA_MAO0, BATIDA_MAO1);
    expect(nova.resultado).toBeNull();
    expect(nova.mao(0)).toHaveLength(7);
    expect(nova.pecasNaMesa()).toEqual([]);
  });

  test('CT-FIM-06: depois da batida, passar gera erro', () => {
    const partida = partidaBatida();
    expect(() => partida.passar(1)).toThrow(/já terminou/);
  });

  test('CT-FIM-07: depois do trancado, jogar e comprar geram erro', () => {
    const partida = jogarTrancadoAteOFim();
    const resultado = { ...partida.resultado };
    expect(() => partida.jogar(0, p(5, 5), 'direita')).toThrow(/já terminou/);
    expect(() => partida.comprar(1)).toThrow(/já terminou/);
    expect(partida.resultado).toEqual(resultado);
  });
});
