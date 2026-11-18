const { Mesa } = require('../src/mesa');
const { criarPeca } = require('../src/peca');

const p = criarPeca;

function mesaCom(...pecas) {
  const mesa = new Mesa();
  mesa.colocar(pecas[0]);
  pecas.slice(1).forEach(([peca, ponta]) => mesa.colocar(peca, ponta));
  return mesa;
}

describe('Mesa', () => {
  test('CT-MESA-01: a mesa começa vazia e sem pontas', () => {
    const mesa = new Mesa();
    expect(mesa.estaVazia()).toBe(true);
    expect(mesa.pontas()).toBeNull();
  });

  test('CT-MESA-02: a primeira peça entra como veio e define as duas pontas', () => {
    const mesa = mesaCom(p(6, 4));
    expect(mesa.estaVazia()).toBe(false);
    expect(mesa.pecas).toEqual([p(6, 4)]);
    expect(mesa.pontas()).toEqual({ esquerda: 6, direita: 4 });
  });

  test('CT-MESA-03: com a mesa vazia, qualquer peça cabe nas duas pontas', () => {
    expect(new Mesa().pontasPossiveis(p(0, 1))).toEqual(['esquerda', 'direita']);
  });

  test('CT-MESA-04: pontasPossiveis lista só as pontas que casam com a peça', () => {
    const mesa = mesaCom(p(6, 4));
    expect(mesa.pontasPossiveis(p(4, 2))).toEqual(['direita']);
    expect(mesa.pontasPossiveis(p(1, 6))).toEqual(['esquerda']);
    expect(mesa.pontasPossiveis(p(6, 4))).toEqual(['esquerda', 'direita']);
    expect(mesa.pontasPossiveis(p(1, 2))).toEqual([]);
  });

  test('CT-MESA-05: encaixa na direita sem girar quando o lado a casa', () => {
    const mesa = mesaCom(p(6, 4), [p(4, 2), 'direita']);
    expect(mesa.pecas).toEqual([p(6, 4), p(4, 2)]);
    expect(mesa.pontas()).toEqual({ esquerda: 6, direita: 2 });
  });

  test('CT-MESA-06: gira a peça para encaixar na direita', () => {
    const mesa = mesaCom(p(6, 4), [p(2, 4), 'direita']);
    expect(mesa.pecas[1]).toEqual(p(4, 2));
    expect(mesa.pontas().direita).toBe(2);
  });

  test('CT-MESA-07: encaixa na esquerda sem girar quando o lado b casa', () => {
    const mesa = mesaCom(p(6, 4), [p(1, 6), 'esquerda']);
    expect(mesa.pecas).toEqual([p(1, 6), p(6, 4)]);
    expect(mesa.pontas()).toEqual({ esquerda: 1, direita: 4 });
  });

  test('CT-MESA-08: gira a peça para encaixar na esquerda', () => {
    const mesa = mesaCom(p(6, 4), [p(6, 1), 'esquerda']);
    expect(mesa.pecas[0]).toEqual(p(1, 6));
    expect(mesa.pontas().esquerda).toBe(1);
  });

  test('CT-MESA-09: dupla encaixada mantém a mesma ponta', () => {
    const mesa = mesaCom(p(6, 4), [p(4, 4), 'direita']);
    expect(mesa.pontas()).toEqual({ esquerda: 6, direita: 4 });
  });

  test('CT-MESA-10: colocar devolve a peça já orientada', () => {
    const mesa = mesaCom(p(6, 4));
    expect(mesa.colocar(p(2, 4), 'direita')).toEqual(p(4, 2));
  });

  test('CT-MESA-11: rejeita peça que não casa com a ponta escolhida', () => {
    const mesa = mesaCom(p(6, 4));
    expect(() => mesa.colocar(p(4, 2), 'esquerda')).toThrow(/não encaixa na ponta esquerda \(6\)/);
    expect(mesa.pecas).toHaveLength(1);
  });

  test('CT-MESA-12: rejeita ponta inválida ou ausente com a mesa ocupada', () => {
    const mesa = mesaCom(p(6, 4));
    expect(() => mesa.colocar(p(4, 2), 'meio')).toThrow(/Ponta inválida/);
    expect(() => mesa.colocar(p(4, 2))).toThrow(/Ponta inválida/);
  });

  test('CT-MESA-13: sequência longa mantém as pontas corretas nos dois lados', () => {
    const mesa = mesaCom(
      p(5, 5),
      [p(5, 3), 'direita'],
      [p(2, 5), 'esquerda'],
      [p(3, 3), 'direita'],
      [p(2, 0), 'esquerda'],
    );
    expect(mesa.pecas).toEqual([p(0, 2), p(2, 5), p(5, 5), p(5, 3), p(3, 3)]);
    expect(mesa.pontas()).toEqual({ esquerda: 0, direita: 3 });
  });
});
