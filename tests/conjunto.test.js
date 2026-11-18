const {
  criarConjunto,
  validarConjunto,
  embaralhar,
  distribuir,
} = require('../src/conjunto');
const { criarPeca, mesmaPeca, ehDupla, valorPeca } = require('../src/peca');
const { criarRng } = require('../src/rng');

function contem(lista, peca) {
  return lista.some((p) => mesmaPeca(p, peca));
}

describe('Conjunto de peças', () => {
  test('CT-CONJ-01: o conjunto duplo-seis tem 28 peças', () => {
    expect(criarConjunto()).toHaveLength(28);
  });

  test('CT-CONJ-02: não há peças repetidas, nem invertidas', () => {
    const pecas = criarConjunto();
    const repetidas = pecas.filter((p, i) => pecas.slice(0, i).some((q) => mesmaPeca(p, q)));
    expect(repetidas).toHaveLength(0);
  });

  test('CT-CONJ-03: vai de [0|0] a [6|6] e tem 7 duplas', () => {
    const pecas = criarConjunto();
    expect(contem(pecas, criarPeca(0, 0))).toBe(true);
    expect(contem(pecas, criarPeca(6, 6))).toBe(true);
    expect(pecas.filter(ehDupla)).toHaveLength(7);
  });

  test('CT-CONJ-04: a soma de todas as peças é 168', () => {
    const soma = criarConjunto().reduce((total, p) => total + valorPeca(p), 0);
    expect(soma).toBe(168);
  });

  test('CT-CONJ-05: embaralhar com a mesma semente dá a mesma ordem', () => {
    const primeira = embaralhar(criarConjunto(), criarRng(10));
    const segunda = embaralhar(criarConjunto(), criarRng(10));
    expect(primeira).toEqual(segunda);
  });

  test('CT-CONJ-06: embaralhar muda a ordem e mantém as mesmas 28 peças', () => {
    const original = criarConjunto();
    const embaralhado = embaralhar(original, criarRng(10));
    expect(embaralhado).not.toEqual(original);
    expect(embaralhado).toHaveLength(28);
    expect(original.every((p) => contem(embaralhado, p))).toBe(true);
  });

  test('CT-CONJ-07: embaralhar não altera a lista original', () => {
    const original = criarConjunto();
    const copia = [...original];
    embaralhar(original, criarRng(3));
    expect(original).toEqual(copia);
  });

  test('CT-CONJ-08: rng que sempre devolve 0 gera uma ordem previsível', () => {
    const pecas = [1, 2, 3, 4].map((n) => criarPeca(n, n));
    const resultado = embaralhar(pecas, () => 0);
    expect(resultado.map((p) => p.a)).toEqual([2, 3, 4, 1]);
  });

  test('CT-CONJ-09: embaralhar sem rng gera erro', () => {
    expect(() => embaralhar(criarConjunto())).toThrow(/rng/);
  });

  test('CT-CONJ-10: distribui 7 peças para cada jogador e deixa 14 no monte', () => {
    const { maos, monte } = distribuir(criarConjunto());
    expect(maos[0]).toHaveLength(7);
    expect(maos[1]).toHaveLength(7);
    expect(monte).toHaveLength(14);
  });

  test('CT-CONJ-11: distribui alternando entre os jogadores 0 e 1', () => {
    const pecas = criarConjunto();
    const { maos, monte } = distribuir(pecas);
    expect(maos[0]).toEqual([0, 2, 4, 6, 8, 10, 12].map((i) => pecas[i]));
    expect(maos[1]).toEqual([1, 3, 5, 7, 9, 11, 13].map((i) => pecas[i]));
    expect(monte).toEqual(pecas.slice(14));
  });

  test('CT-CONJ-12: validarConjunto aceita as 28 peças em qualquer ordem e lado', () => {
    const invertidas = criarConjunto().reverse().map((p) => criarPeca(p.b, p.a));
    expect(validarConjunto(invertidas)).toHaveLength(28);
  });

  test('CT-CONJ-13: rejeita conjunto com 27 peças (uma a menos)', () => {
    expect(() => validarConjunto(criarConjunto().slice(1))).toThrow(/exatamente 28/);
  });

  test('CT-CONJ-14: rejeita conjunto com 29 peças (uma a mais)', () => {
    const pecas = [...criarConjunto(), criarPeca(1, 1)];
    expect(() => validarConjunto(pecas)).toThrow(/exatamente 28/);
  });

  test('CT-CONJ-15: rejeita conjunto com peça repetida, mesmo invertida', () => {
    const pecas = criarConjunto();
    pecas[27] = criarPeca(1, 0);
    expect(() => validarConjunto(pecas)).toThrow(/repetida.*\[1\|0\]/);
  });

  test('CT-CONJ-16: rejeita conjunto com peça inválida ou que não é lista', () => {
    const pecas = criarConjunto();
    pecas[0] = { a: 0, b: 7 };
    expect(() => validarConjunto(pecas)).toThrow(/fora do intervalo/);
    expect(() => validarConjunto('peças')).toThrow(/exatamente 28/);
  });

  test('CT-CONJ-17: distribuir valida o conjunto antes de dar as peças', () => {
    expect(() => distribuir(criarConjunto().slice(0, 14))).toThrow(/exatamente 28/);
  });
});
