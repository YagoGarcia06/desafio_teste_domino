const MENOR_LADO = 0;
const MAIOR_LADO = 6;

function validarLado(valor) {
  if (!Number.isInteger(valor) || valor < MENOR_LADO || valor > MAIOR_LADO) {
    throw new Error(`Lado da peça fora do intervalo 0–6: ${valor}`);
  }
}

function criarPeca(a, b) {
  validarLado(a);
  validarLado(b);
  return Object.freeze({ a, b });
}

function valorPeca(peca) {
  return peca.a + peca.b;
}

function ehDupla(peca) {
  return peca.a === peca.b;
}

function mesmaPeca(p, q) {
  return (p.a === q.a && p.b === q.b) || (p.a === q.b && p.b === q.a);
}

function contemNumero(peca, numero) {
  return peca.a === numero || peca.b === numero;
}

function girar(peca) {
  return criarPeca(peca.b, peca.a);
}

function maiorLado(peca) {
  return Math.max(peca.a, peca.b);
}

// Positivo quando p é maior que q: primeiro pela soma, depois pelo maior lado.
function compararPecas(p, q) {
  const diferenca = valorPeca(p) - valorPeca(q);
  if (diferenca !== 0) {
    return diferenca;
  }
  return maiorLado(p) - maiorLado(q);
}

function textoPeca(peca) {
  return `[${peca.a}|${peca.b}]`;
}

module.exports = {
  MENOR_LADO,
  MAIOR_LADO,
  criarPeca,
  valorPeca,
  ehDupla,
  mesmaPeca,
  contemNumero,
  girar,
  compararPecas,
  textoPeca,
};
