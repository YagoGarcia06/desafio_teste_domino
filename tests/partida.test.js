const { Partida } = require('../src/partida');
const { criarConjunto } = require('../src/conjunto');
const { criarPeca, mesmaPeca } = require('../src/peca');
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
});
