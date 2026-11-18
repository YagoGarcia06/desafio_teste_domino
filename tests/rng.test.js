const { criarRng } = require('../src/rng');

function sequencia(rng, quantidade) {
  return Array.from({ length: quantidade }, () => rng());
}

describe('Gerador com semente', () => {
  test('CT-RNG-01: a mesma semente gera a mesma sequência', () => {
    expect(sequencia(criarRng(42), 10)).toEqual(sequencia(criarRng(42), 10));
  });

  test('CT-RNG-02: sementes diferentes geram sequências diferentes', () => {
    expect(sequencia(criarRng(1), 10)).not.toEqual(sequencia(criarRng(2), 10));
  });

  test('CT-RNG-03: todos os valores ficam no intervalo [0, 1)', () => {
    const valores = sequencia(criarRng(7), 1000);
    expect(valores.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  test('CT-RNG-04: aceita a semente limite 0', () => {
    const valores = sequencia(criarRng(0), 5);
    expect(valores).toHaveLength(5);
    expect(new Set(valores).size).toBe(5);
  });

  test('CT-RNG-05: rejeita semente que não é inteira', () => {
    expect(() => criarRng(1.5)).toThrow(/semente/);
    expect(() => criarRng('abc')).toThrow(/semente/);
    expect(() => criarRng()).toThrow(/semente/);
  });
});
