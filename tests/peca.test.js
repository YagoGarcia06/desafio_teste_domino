const {
  criarPeca,
  valorPeca,
  ehDupla,
  mesmaPeca,
  contemNumero,
  girar,
  compararPecas,
  textoPeca,
} = require('../src/peca');

describe('Peças', () => {
  test('CT-PECA-01: cria uma peça com os dois lados informados', () => {
    const peca = criarPeca(2, 5);
    expect(peca.a).toBe(2);
    expect(peca.b).toBe(5);
  });

  test('CT-PECA-02: aceita os limites 0 e 6 nos lados', () => {
    expect(criarPeca(0, 0)).toEqual({ a: 0, b: 0 });
    expect(criarPeca(6, 6)).toEqual({ a: 6, b: 6 });
  });

  test('CT-PECA-03: rejeita lado acima de 6', () => {
    expect(() => criarPeca(7, 1)).toThrow(/fora do intervalo 0–6/);
  });

  test('CT-PECA-04: rejeita lado negativo', () => {
    expect(() => criarPeca(3, -1)).toThrow(/fora do intervalo 0–6/);
  });

  test('CT-PECA-05: rejeita lado que não é número inteiro', () => {
    expect(() => criarPeca(2.5, 1)).toThrow(/fora do intervalo 0–6/);
    expect(() => criarPeca('3', 1)).toThrow(/fora do intervalo 0–6/);
  });

  test('CT-PECA-06: a peça criada não pode ser alterada', () => {
    const peca = criarPeca(1, 2);
    expect(Object.isFrozen(peca)).toBe(true);
  });

  test('CT-PECA-07: valor é a soma dos dois lados', () => {
    expect(valorPeca(criarPeca(2, 3))).toBe(5);
  });

  test('CT-PECA-08: valores nos limites: [0|0] vale 0 e [6|6] vale 12', () => {
    expect(valorPeca(criarPeca(0, 0))).toBe(0);
    expect(valorPeca(criarPeca(6, 6))).toBe(12);
  });

  test('CT-PECA-09: peça com lados iguais é dupla', () => {
    expect(ehDupla(criarPeca(4, 4))).toBe(true);
  });

  test('CT-PECA-10: peça com lados diferentes não é dupla', () => {
    expect(ehDupla(criarPeca(4, 5))).toBe(false);
  });

  test('CT-PECA-11: [a|b] e [b|a] são a mesma peça', () => {
    expect(mesmaPeca(criarPeca(1, 6), criarPeca(6, 1))).toBe(true);
    expect(mesmaPeca(criarPeca(1, 6), criarPeca(1, 6))).toBe(true);
  });

  test('CT-PECA-12: peças com lados diferentes não são a mesma', () => {
    expect(mesmaPeca(criarPeca(1, 6), criarPeca(1, 5))).toBe(false);
    expect(mesmaPeca(criarPeca(1, 6), criarPeca(6, 6))).toBe(false);
  });

  test('CT-PECA-13: contemNumero verifica os dois lados', () => {
    const peca = criarPeca(2, 5);
    expect(contemNumero(peca, 2)).toBe(true);
    expect(contemNumero(peca, 5)).toBe(true);
    expect(contemNumero(peca, 3)).toBe(false);
  });

  test('CT-PECA-14: girar inverte os lados sem alterar a original', () => {
    const peca = criarPeca(2, 5);
    expect(girar(peca)).toEqual({ a: 5, b: 2 });
    expect(peca).toEqual({ a: 2, b: 5 });
  });

  test('CT-PECA-15: compararPecas usa a soma como primeiro critério', () => {
    expect(compararPecas(criarPeca(3, 4), criarPeca(1, 5))).toBeGreaterThan(0);
    expect(compararPecas(criarPeca(1, 5), criarPeca(3, 4))).toBeLessThan(0);
  });

  test('CT-PECA-16: com soma igual, vence a peça com o maior lado', () => {
    expect(compararPecas(criarPeca(1, 5), criarPeca(2, 4))).toBeGreaterThan(0);
    expect(compararPecas(criarPeca(3, 3), criarPeca(2, 4))).toBeLessThan(0);
  });

  test('CT-PECA-17: a mesma peça (em qualquer ordem) compara como igual', () => {
    expect(compararPecas(criarPeca(2, 4), criarPeca(4, 2))).toBe(0);
  });

  test('CT-PECA-18: textoPeca mostra a peça no formato [a|b]', () => {
    expect(textoPeca(criarPeca(3, 6))).toBe('[3|6]');
  });
});
